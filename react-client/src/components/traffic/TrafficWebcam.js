// src/components/traffic/TrafficWebcam.js
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { wsBase } from "../../lib/api";
import "./TrafficWebcam.css";

export default function TrafficWebcam({
  target,
  topk = 3,
  mirror = true,
  onResult,
  onError,
  videoWidth = 360,
  videoHeight = 270,
  showStatus = true, // Changed default to true for better UX
}) {
  const { t } = useTranslation("common");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let active = true;
    async function startCam() {
      try {
        setLoading(true);
        setError(null);
        setPermissionDenied(false);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: videoWidth, height: videoHeight },
          audio: false,
        });
        
        if (!active) return;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setLoading(false);
        }
      } catch (err) {
        if (!active) return;
        
        setLoading(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setError(t("cameraPermissionDenied"));
        } else {
          setError(t("cameraNotAvailable"));
        }
        onError?.(t("cameraPermissionDenied"));
      }
    }
    startCam();
    return () => {
      active = false;
      const v = videoRef.current;
      const s = v?.srcObject;
      if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset in-flight flag when target changes
    inFlightRef.current = false;
    
    const url = `${wsBase()}/ws/predict?mirror=${mirror ? "true" : "false"}&topk=${topk}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Clear any previous results when connection opens
      onResult?.(null);
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => {
      setError(t("websocketError"));
      onError?.(t("websocketError"));
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.error) {
          setError(msg.error);
          onError?.(msg.error);
        } else {
          setError(null);
          onResult?.(msg);
        }
      } catch {
        /* ignore */
      } finally {
        inFlightRef.current = false;
      }
    };

    let rafId;
    const tick = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      const sock = wsRef.current;
      if (!v || !c || !sock || sock.readyState !== 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (!inFlightRef.current) {
        const ctx = c.getContext("2d");
        if (mirror) {
          ctx.save();
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          ctx.restore();
        } else {
          ctx.drawImage(v, 0, 0, c.width, c.height);
        }
        const dataURL = c.toDataURL("image/jpeg", 0.8);
        const payload = { image_b64: dataURL };
        if (target) payload.target = target;
        if (topk) payload.topk = topk;
        try {
          sock.send(JSON.stringify(payload));
          inFlightRef.current = true;
        } catch {
          /* ignore */
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ws && ws.readyState <= 1) ws.close();
      // Reset in-flight flag on cleanup
      inFlightRef.current = false;
    };
  }, [target, topk, mirror, onResult, onError]);

  return (
    <div className="traffic-webcam-container">
      <div className="traffic-webcam-video-container">
        <video
          ref={videoRef}
          playsInline
          muted
          width={videoWidth}
          height={videoHeight}
          className="traffic-webcam-video"
        />
        
        {/* Loading State */}
        {loading && (
          <div className="traffic-webcam-loading">
            <div className="traffic-webcam-loading-spinner"></div>
            <div className="traffic-webcam-loading-text">
              {t("initializingCamera")}
            </div>
          </div>
        )}
        
        {/* Permission Denied State */}
        {permissionDenied && (
          <div className="traffic-webcam-permission">
            <div className="traffic-webcam-permission-icon">📷</div>
            <div className="traffic-webcam-permission-text">
              {t("cameraAccessRequired")}
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !permissionDenied && (
          <div className="traffic-webcam-error">
            <div className="traffic-webcam-error-icon">⚠️</div>
            <div className="traffic-webcam-error-text">
              {error}
            </div>
          </div>
        )}
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={videoWidth} 
        height={videoHeight} 
        className="traffic-webcam-canvas" 
      />
      
      {showStatus && (
        <div className={`traffic-webcam-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? `🟢 ${t("connected")}` : `🔴 ${t("disconnected")}`}
        </div>
      )}
    </div>
  );
}
