import os, io, time, base64, glob
from typing import List, Optional, Dict, Any, Tuple

import numpy as np
from PIL import Image
import torch, torchvision
from torch import nn
import torchvision.transforms as T

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# ============ Config ============
MODELS_DIR = os.getenv("MODELS_DIR", "./models")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL")  # filename inside MODELS_DIR
REFERENCE_DIR = os.getenv("REFERENCE_DIR", "./reference_images")
IMG_SIZE = int(os.getenv("IMG_SIZE", "224"))
DEFAULT_TOPK = int(os.getenv("DEFAULT_TOPK", "3"))
MIRROR_DEFAULT = os.getenv("MIRROR_DEFAULT", "true").lower() == "true"

device = "cuda" if torch.cuda.is_available() else "cpu"

# ============ App & CORS ============
app = FastAPI(title="Realtime Sign Scoring API (multi-model)", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static references
os.makedirs(REFERENCE_DIR, exist_ok=True)
app.mount("/reference", StaticFiles(directory=REFERENCE_DIR), name="reference")

# ============ Model registry/cache ============
class ModelBundle:
    def __init__(self, net: torch.nn.Module, classes: List[str], img_size: int):
        self.net = net
        self.classes = classes
        self.img_size = img_size
        self.tfms = T.Compose([
            T.Resize((img_size, img_size)),
            T.ToTensor(),
            T.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5]),
        ])

_model_cache: Dict[str, ModelBundle] = {}
_available_models: Dict[str, str] = {}   # key -> absolute path
_active_model_key: Optional[str] = None

def _discover_models() -> Dict[str, str]:
    os.makedirs(MODELS_DIR, exist_ok=True)
    paths = glob.glob(os.path.join(MODELS_DIR, "*.pt"))
    return {os.path.basename(p): p for p in paths}

def _infer_arch(ckpt: dict, path: str) -> str:
    # Prefer metadata if present
    arch = str(ckpt.get("arch", "")).lower()
    if "mobilenet_v3_large" in arch or "mnetv3_large" in arch or "v3_large" in arch:
        return "large"
    if "mobilenet_v3_small" in arch or "mnetv3_small" in arch or "v3_small" in arch:
        return "small"
    # Filename heuristic
    fname = os.path.basename(path).lower()
    return "large" if "large" in fname else "small"

def _build_mnet_v3(arch: str, num_classes: int) -> torch.nn.Module:
    if arch == "large":
        net = torchvision.models.mobilenet_v3_large(weights=None)
    else:
        net = torchvision.models.mobilenet_v3_small(weights=None)
    # last linear is classifier[3] for both variants
    net.classifier[3] = nn.Linear(net.classifier[3].in_features, num_classes)
    return net

def _load_model(path: str, img_size: int) -> ModelBundle:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    ckpt = torch.load(path, map_location="cpu")
    classes = ckpt.get("classes")
    if not classes or not isinstance(classes, (list, tuple)):
        raise RuntimeError(f"{os.path.basename(path)} is missing 'classes' list")
    arch = _infer_arch(ckpt, path)
    net = _build_mnet_v3(arch, len(classes))
    net.load_state_dict(ckpt["state_dict"], strict=True)
    net = net.to(device).eval()
    return ModelBundle(net=net, classes=list(classes), img_size=img_size)

def _get_bundle(model_key: Optional[str]) -> Tuple[str, ModelBundle]:
    """Return (resolved_key, bundle). Loads and caches on demand.
       If model_key is None: use active; if no active: pick DEFAULT_MODEL or first available."""
    global _active_model_key, _available_models
    if not _available_models:
        _available_models = _discover_models()
        if not _available_models:
            raise RuntimeError(f"No .pt models found in {MODELS_DIR}")

    key = model_key or _active_model_key or DEFAULT_MODEL
    if key is None:
        # fall back to first discovered
        key = sorted(_available_models.keys())[0]

    if key not in _available_models:
        raise HTTPException(status_code=400, detail=f"Unknown model '{key}'. Available: {list(_available_models)}")

    if key not in _model_cache:
        bundle = _load_model(_available_models[key], IMG_SIZE)
        _model_cache[key] = bundle
        # if none active, set this as active
        if _active_model_key is None:
            _active_model_key = key
    return key, _model_cache[key]

def _set_active_model(key: str):
    global _active_model_key
    if key not in _available_models:
        _available_models = _discover_models()
        if key not in _available_models:
            raise HTTPException(status_code=400, detail=f"Unknown model '{key}'.")
    if key not in _model_cache:
        _model_cache[key] = _load_model(_available_models[key], IMG_SIZE)
    _active_model_key = key

# ============ Reference images ============
def map_reference_images(classes: List[str]) -> Dict[str, Optional[str]]:
    exts = (".jpg", ".jpeg", ".png", ".webp")
    files = {f.lower(): f for f in os.listdir(REFERENCE_DIR)}
    mapping: Dict[str, Optional[str]] = {}

    for cname in classes:
        key = cname.lower().replace(" ", "_")

        # 1) exact match (any extension)
        exact = next((files[f] for f in files if f.startswith(key) and f[len(key):] in exts), None)
        if exact:
            mapping[cname] = f"/reference/{exact}"
            continue

        # 2) prefix + separator match (e.g., left_*.jpg but NOT lane_left.jpg)
        sep_match = next((files[f] for f in files
                          if any(f.startswith(key + s) for s in ("_", "-", ".", " "))
                          and f.endswith(exts)), None)
        if sep_match:
            mapping[cname] = f"/reference/{sep_match}"
            continue

        # 3) fallback: substring (last resort)
        sub = next((files[f] for f in files if key in f and f.endswith(exts)), None)
        mapping[cname] = f"/reference/{sub}" if sub else None

    return mapping


# ============ Schemas ============
class PredictB64Request(BaseModel):
    image_b64: str = Field(..., description="Base64 image (data URL or raw base64)")
    mirror: Optional[bool] = Field(default=MIRROR_DEFAULT)
    target: Optional[str] = Field(default=None)
    topk: Optional[int] = Field(default=DEFAULT_TOPK, ge=1)
    model: Optional[str] = Field(default=None, description="Model key (filename in models dir)")

class PredictResponse(BaseModel):
    model: str
    target: Optional[str] = None
    target_match_percent: Optional[float] = None
    topk: List[Dict[str, Any]]
    timings_ms: Dict[str, float]
    device: str
    img_size: int

class ClassesResponse(BaseModel):
    model: str
    classes: List[str]
    references: Dict[str, Optional[str]]

class MetadataResponse(BaseModel):
    device: str
    img_size: int
    default_topk: int
    models: List[str]
    active_model: str

class ModelsListResponse(BaseModel):
    models: List[str]
    active_model: str

class SelectModelRequest(BaseModel):
    model: str

# ============ Utils ============
def decode_b64_to_pil(b64_data: str) -> Image.Image:
    if "," in b64_data and b64_data.strip().lower().startswith("data:"):
        b64_data = b64_data.split(",", 1)[1]
    try:
        return Image.open(io.BytesIO(base64.b64decode(b64_data))).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

def maybe_mirror(img: Image.Image, do_mirror: bool) -> Image.Image:
    return img.transpose(Image.FLIP_LEFT_RIGHT) if do_mirror else img

def run_inference(bundle: ModelBundle, img_pil: Image.Image) -> np.ndarray:
    with torch.no_grad():
        x = bundle.tfms(img_pil).unsqueeze(0).to(device)
        logits = bundle.net(x)
        probs = torch.softmax(logits, dim=1)[0].detach().cpu().numpy()
    return probs

def summarize(probs: np.ndarray, classes: List[str], topk: int, target: Optional[str]):
    k = int(np.clip(topk, 1, len(classes)))
    top_idx = probs.argsort()[::-1][:k]
    top_rows = [{"label": classes[i], "prob": float(probs[i])} for i in top_idx]
    target_match = None
    if target:
        if target not in classes:
            raise HTTPException(status_code=400, detail=f"Unknown target class '{target}'.")
        target_idx = classes.index(target)
        target_match = float(probs[target_idx]) * 100.0
    return top_rows, target_match

# ============ Startup ============
@app.on_event("startup")
def _startup():
    global _available_models, _active_model_key
    _available_models = _discover_models()
    if not _available_models:
        raise RuntimeError(f"No .pt models found in {MODELS_DIR}")
    # resolve default
    if DEFAULT_MODEL and DEFAULT_MODEL in _available_models:
        _set_active_model(DEFAULT_MODEL)
    else:
        # set first discovered as active (lazy load on first call)
        _active_model_key = sorted(_available_models.keys())[0]

# ============ Routes ============
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metadata", response_model=MetadataResponse)
def metadata():
    models = sorted((_available_models or _discover_models()).keys())
    active = _active_model_key or (DEFAULT_MODEL if DEFAULT_MODEL else (models[0] if models else ""))
    return MetadataResponse(
        device=device,
        img_size=IMG_SIZE,
        default_topk=DEFAULT_TOPK,
        models=models,
        active_model=active,
    )

@app.get("/models", response_model=ModelsListResponse)
def list_models():
    models = sorted((_available_models or _discover_models()).keys())
    active = _active_model_key or (DEFAULT_MODEL if DEFAULT_MODEL else (models[0] if models else ""))
    return ModelsListResponse(models=models, active_model=active)

@app.post("/models/select", response_model=ModelsListResponse)
def select_model(req: SelectModelRequest):
    _set_active_model(req.model)
    models = sorted((_available_models or _discover_models()).keys())
    return ModelsListResponse(models=models, active_model=_active_model_key)

@app.get("/classes", response_model=ClassesResponse)
def get_classes(model: Optional[str] = None):
    key, bundle = _get_bundle(model)
    return ClassesResponse(model=key, classes=bundle.classes, references=map_reference_images(bundle.classes))

@app.post("/predict", response_model=PredictResponse)
async def predict(
    file: UploadFile = File(...),
    mirror: bool = Form(MIRROR_DEFAULT),
    target: Optional[str] = Form(None),
    topk: int = Form(DEFAULT_TOPK),
    model: Optional[str] = Form(None),
):
    key, bundle = _get_bundle(model)
    t0 = time.time()
    content = await file.read()
    try:
        img = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")
    img = maybe_mirror(img, mirror)
    t_pre = (time.time() - t0) * 1000

    t1 = time.time()
    probs = run_inference(bundle, img)
    t_inf = (time.time() - t1) * 1000

    top_rows, target_match = summarize(probs, bundle.classes, topk, target)
    t_total = (time.time() - t0) * 1000

    return PredictResponse(
        model=key,
        target=target,
        target_match_percent=target_match,
        topk=top_rows,
        timings_ms={"preprocess": t_pre, "inference": t_inf, "total": t_total},
        device=device,
        img_size=bundle.img_size,
    )

@app.post("/predict-b64", response_model=PredictResponse)
def predict_b64(req: PredictB64Request):
    key, bundle = _get_bundle(req.model)
    t0 = time.time()
    img = decode_b64_to_pil(req.image_b64)
    img = maybe_mirror(img, bool(req.mirror))
    t_pre = (time.time() - t0) * 1000

    t1 = time.time()
    probs = run_inference(bundle, img)
    t_inf = (time.time() - t1) * 1000

    top_rows, target_match = summarize(probs, bundle.classes, req.topk or DEFAULT_TOPK, req.target)
    t_total = (time.time() - t0) * 1000

    return PredictResponse(
        model=key,
        target=req.target,
        target_match_percent=target_match,
        topk=top_rows,
        timings_ms={"preprocess": t_pre, "inference": t_inf, "total": t_total},
        device=device,
        img_size=bundle.img_size,
    )

@app.websocket("/ws/predict")
async def ws_predict(websocket: WebSocket):
    await websocket.accept()
    # query params
    params = websocket.query_params
    mirror = params.get("mirror", "true").lower() == "true"
    topk = int(params.get("topk", str(DEFAULT_TOPK)))
    target = params.get("target", None)
    model_key = params.get("model", None)

    try:
        key, bundle = _get_bundle(model_key)
        while True:
            data = await websocket.receive_json()
            if "image_b64" not in data:
                await websocket.send_json({"error": "image_b64 missing"})
                continue

            t0 = time.time()
            img = decode_b64_to_pil(data["image_b64"])
            img = maybe_mirror(img, mirror)
            t_pre = (time.time() - t0) * 1000

            t1 = time.time()
            probs = run_inference(bundle, img)
            t_inf = (time.time() - t1) * 1000

            top_rows, target_match = summarize(probs, bundle.classes, topk, target)
            t_total = (time.time() - t0) * 1000

            await websocket.send_json({
                "model": key,
                "target": target,
                "target_match_percent": target_match,
                "topk": top_rows,
                "timings_ms": {"preprocess": t_pre, "inference": t_inf, "total": t_total},
                "device": device,
                "img_size": bundle.img_size,
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close()
        except Exception:
            pass
