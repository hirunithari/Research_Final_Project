import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as cam from "@mediapipe/camera_utils";
import * as handsLib from "@mediapipe/hands";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from "./Test";
import { LionPoses } from "../../../Data/dynamicSign/LionPoses";
import { FaCrown, FaArrowLeft, FaPlay, FaCheckCircle } from "react-icons/fa";
import { auth } from "../../../firebase";
import "../animals.css";
import "../../traffic/traffic-signs.css";

const HOLD_DURATION = 30; // seconds
const DONE_STEP = 2;      // 1 pose + done
const STABLE_FRAMES = 5;  // consecutive correct frames before hold timer starts

export default function PractiseLion() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    const connect = window.drawConnectors;

    const [poses] = useState(LionPoses);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);

    const [start, setStart] = useState(true);
    const [detecting, setDetecting] = useState(false);
    const [finish, setFinish] = useState(false);
    const [handDetected, setHandDetected] = useState(false);
    const [landmarkClass, setLandmarkClass] = useState("none");
    const [probability, setProbability] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [currentPose, setCurrentPose] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [holdSeconds, setHoldSeconds] = useState(0);

    const currentStepRef = useRef(1);
    const currentPoseRef = useRef(0);
    const finishRef = useRef(false);
    const holdStartTimeRef = useRef(null);
    const startTimeRef = useRef(null);
    const stableFramesRef = useRef(0);

    const onClickStart = () => {
        startTimeRef.current = Date.now();
        setStart(false);
        setDetecting(true);
        startDetection();
    };

    const saveScore = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const GuardianDataService = (await import("../../../services/GuardianDataService")).default;
            const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
            await GuardianDataService.recordActivity({
                activityName: "Completed Animal Signs Lesson - Lion",
                category: "Animal Signs",
                duration: duration || 1,
                score: 100,
            });
            await GuardianDataService.recordScore({
                score: 100,
                category: "animalSigns",
                accuracy: 100,
                lessonType: "Animal Signs - Lion",
            });
            await GuardianDataService.checkAchievements();
        } catch (e) {
            console.error("Error saving animal sign score:", e);
        }
    };

    const routeResult = () => navigate("/result");

    async function onResults(results) {
        if (!webcamRef.current || !canvasRef.current) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
        canvasCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

        let totalLandmarks = [];
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(true);
            for (const landmarks of results.multiHandLandmarks) {
                if (connect) {
                    connect(canvasCtx, landmarks, handsLib.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
                }
                landmarks.map((item) => {
                    totalLandmarks.push(item.x, item.y, item.z);
                });
            }
            if (totalLandmarks.length === 63 && !finishRef.current) {
                try {
                    const result = await axios.post("http://127.0.0.1:5000/predict-dynamic", { temp: totalLandmarks });
                    const predicted = result.data.predict;
                    const prob = result.data.probability;
                    setLandmarkClass(predicted);
                    setProbability(prob);

                    const currentPoseName = LionPoses[currentPoseRef.current]?.name;
                    if (prob >= 0.9 && predicted === currentPoseName) {
                        stableFramesRef.current += 1;
                        if (stableFramesRef.current < STABLE_FRAMES) return;
                        if (!holdStartTimeRef.current) holdStartTimeRef.current = Date.now();
                        const elapsed = (Date.now() - holdStartTimeRef.current) / 1000;
                        const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
                        setHoldProgress(pct);
                        setHoldSeconds(Math.floor(elapsed));

                        if (elapsed >= HOLD_DURATION) {
                            holdStartTimeRef.current = null;
                            setHoldProgress(0);
                            setHoldSeconds(0);
                            // Lion has only one pose — always finishes here
                            finishRef.current = true;
                            currentStepRef.current = DONE_STEP;
                            setCurrentStep(DONE_STEP);
                            setFinish(true);
                            await saveScore();
                            stopDetection();
                        }
                    } else {
                        stableFramesRef.current = 0;
                        if (holdStartTimeRef.current) {
                            holdStartTimeRef.current = null;
                            setHoldProgress(0);
                            setHoldSeconds(0);
                        }
                    }
                } catch (e) {}
            }
        } else {
            setHandDetected(false);
            if (holdStartTimeRef.current) {
                holdStartTimeRef.current = null;
                setHoldProgress(0);
                setHoldSeconds(0);
            }
        }
        canvasCtx.restore();
    }

    const startDetection = () => {
        const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
        if (webcamRef.current) {
            const camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => { try { await hands.send({ image: webcamRef.current.video }); } catch (e) {} },
                width: 640, height: 480,
            });
            camera.start();
            cameraRef.current = camera;
        }
    };

    const stopDetection = () => {
        if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
        routeResult();
    };

    const probPct = Math.round(probability * 100);
    const isDone = currentStep >= DONE_STEP;
    const currentPoseName = poses[Math.min(currentPose, poses.length - 1)]?.name;
    const isMatch = landmarkClass === currentPoseName;

    return (
        <div className="an-page">
            <div className="an-container">

                <div className="an-breadcrumb">
                    <Link to="/dashboard-animals">{t("DynamicSign")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <Link to="/learn-lion">{t("learnLion")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <span className="an-breadcrumb-current">{t("practise")}</span>
                </div>

                <div className="an-steps">
                    {poses.map((pose, i) => (
                        <div className="an-step" key={pose.id}>
                            <div className="an-step-wrapper">
                                <div className={`an-step-dot ${currentStep === i + 1 && !isDone ? "active" : isDone ? "done" : ""}`}>
                                    {isDone ? <FaCheckCircle /> : i + 1}
                                </div>
                                <div className="an-step-label">{t("poseLabel", { n: i + 1 })}</div>
                            </div>
                        </div>
                    ))}
                    <div className="an-step">
                        <div className={`an-step-line ${isDone ? "done" : ""}`} />
                        <div className="an-step-wrapper">
                            <div className={`an-step-dot ${isDone ? "done" : ""}`}>{isDone ? "✓" : poses.length + 1}</div>
                            <div className="an-step-label">{t("done")}</div>
                        </div>
                    </div>
                </div>

                <div className="traffic-signs-grid">
                    <div className="ts-card">
                        <div className="ts-card-header"><FaCrown /> {t("referencePose")}</div>
                        <div className="card-body">
                            <div className="an-refbox">
                                <img className="an-pose-img" src={poses[Math.min(currentPose, poses.length - 1)].image} alt={currentPoseName} />
                            </div>
                            <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "#718096", fontWeight: 600 }}>
                                {currentPoseName}
                            </div>
                        </div>
                    </div>

                    <div className="ts-card">
                        <div className="ts-card-header">📷 {t("liveCamera")}</div>
                        <div className="card-body">
                            <div className="an-webcam-box">
                                <Test webcamRef={webcamRef} canvasRef={canvasRef} />
                            </div>
                        </div>
                    </div>

                    <div className="ts-card">
                        <div className="ts-card-header">📊 {t("status")}</div>
                        <div className="card-body">
                            {start && (
                                <div className="an-status-panel">
                                    <div className="an-start-icon">🖐️</div>
                                    <div className="an-start-title">{t("readyToPractice")}</div>
                                    <div className="an-start-desc">{t("practiceDesc")}</div>
                                    <button className="an-btn-start" onClick={onClickStart}><FaPlay /> {t("startDetection")}</button>
                                </div>
                            )}
                            {detecting && !isDone && !handDetected && (
                                <div className="an-status-panel">
                                    <div className="an-no-hand-icon">✋</div>
                                    <div className="an-no-hand-title">{t("noHandDetected")}</div>
                                    <div className="an-no-hand-desc">{t("noHandDesc")}</div>
                                </div>
                            )}
                            {detecting && !isDone && handDetected && (
                                <div className="an-status-panel">
                                    <div className="an-detecting" style={{ width: "100%" }}>
                                        <div className="an-sign-label">{t("currentSign")}</div>
                                        <div className="an-sign-name">
                                            {currentPoseName}
                                            {isMatch && <span className="an-match-badge" style={{ marginLeft: "0.5rem" }}>✓ MATCH</span>}
                                        </div>
                                        <div className="an-detected-row">
                                            <span className="an-detected-label">Detected</span>
                                            <span className="an-detected-value">{landmarkClass !== "none" ? landmarkClass : "—"}</span>
                                        </div>
                                        <div className="an-prob-row"><span>{t("confidence")}</span><span>{probPct}%</span></div>
                                        <div className="an-prob-track">
                                            <div className={`an-prob-fill ${probPct >= 90 ? "good" : ""}`} style={{ width: `${probPct}%` }} />
                                        </div>
                                        {isMatch && probPct >= 90 ? (
                                            <div className="an-hold-section">
                                                <div className="an-hold-label-row">
                                                    <span>{t("holdProgress")}</span>
                                                    <span>{t("holdingFor", { n: holdSeconds })}</span>
                                                </div>
                                                <div className="an-hold-track">
                                                    <div className={`an-hold-fill ${holdProgress >= 100 ? "complete" : ""}`} style={{ width: `${holdProgress}%` }} />
                                                </div>
                                                <div className="an-hold-timer">{t("keepHolding")}</div>
                                            </div>
                                        ) : (
                                            <div className="an-hint">{t("holdPoseHint")}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {isDone && (
                                <div className="an-status-panel">
                                    <div className="an-success-icon">🎉</div>
                                    <div className="an-success-title">{t("ssGreatJob")}</div>
                                    <div className="an-success-desc">{t("practiceComplete")}</div>
                                    <button className="an-btn-back" onClick={() => navigate("/learn-lion")}>{t("backToLearn")}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="an-actions">
                    <button className="an-btn-outline" onClick={() => navigate("/learn-lion")}><FaArrowLeft /> {t("backToLearn")}</button>
                </div>
            </div>
        </div>
    );
}
