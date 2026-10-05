import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from "./Test";
import { StaticSignData } from "../../../Data/StaticSignData";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { auth } from "../../../firebase";
import '../static-signs.css';

let time = 0;
let landmarks = null;

export default function PracticeStaticSign() {
  const { t } = useTranslation("common");
  let navigate = useNavigate();
  const routeLearn = () => navigate("/learn-static-sign");

  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData, setSignData] = useState(StaticSignData);
  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const [notification, setNotification] = useState(null); // 'saved' | 'saving' | null
  const { id } = useParams();

  const savedRef = useRef(false);

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    savedRef.current = false;
    startDetection();
  };

  const saveScore = async (prob) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setNotification('saving');
      const GuardianDataService = (await import('../../../services/GuardianDataService')).default;
      const signName = SignData[id - 1].name;
      await GuardianDataService.recordActivity({
        activityName: `Completed Static Sign Practice - ${signName}`,
        category: 'Static Signs',
        duration: 1,
        score: Math.round(prob * 100),
      });
      await GuardianDataService.recordScore({
        score: Math.round(prob * 100),
        category: 'staticSigns',
        accuracy: Math.round(prob * 100),
        lessonType: `Static Signs - ${signName}`,
      });
      await GuardianDataService.checkAchievements();
      setNotification('saved');
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      console.error('Error saving static sign score:', e);
      setNotification(null);
    }
  };

  async function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
        connect(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        landmarks.map((item) => {
          totalLandmarks.push(item.x, item.y, item.z);
        });
      }
      if (totalLandmarks.length === 63) {
        const result = await axios.post("http://127.0.0.1:5000/predict-static-sign", { temp: totalLandmarks });
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
      }
    }
    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    if (webcamRef.current) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try { await hands.send({ image: webcamRef.current.video }); } catch (error) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const stopDetection = () => {
    if (cameraData) cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    routeLearn();
  };

  const isWaiting   = practice && landmarkClass === "none";
  const isMatch     = landmarkClass === SignData[id - 1].name;
  const isGoodMatch = isMatch && probability >= 0.75;
  const isWeakMatch = isMatch && probability < 0.75;
  const isNoMatch   = !isMatch && !learn && landmarkClass !== "none";

  // Auto-save once when confidence hits 75%+ for the correct sign
  useEffect(() => {
    if (isGoodMatch && !savedRef.current) {
      savedRef.current = true;
      saveScore(probability);
    }
    // Reset saved flag when sign no longer matches (so next good match also saves)
    if (!isMatch) {
      savedRef.current = false;
    }
  }, [isGoodMatch, isMatch]);

  return (
    <div className="ss-page">
      <div className="ss-container">

        {/* Page Header */}
        <div className="ss-page-header">
          <button className="ss-back-btn" onClick={() => window.history.back()}>← {t('back', 'Back')}</button>
          <div>
            <div className="ss-page-title">{t('ssStaticSignPracticeTitle')}</div>
            <div className="ss-page-subtitle">{t('ssMatchTargetSubtitle')}</div>
          </div>
          {practice && (
            <div className="ss-header-badge">
              🟢 {t('ssDetectionActive')}
            </div>
          )}
          {practice && (
            <button className="ss-btn-danger" style={{ marginLeft: 'auto' }} onClick={stopDetection}>
              ⏹ {t('ssStopPractice', 'Stop')}
            </button>
          )}
        </div>

        {/* Save notification banner */}
        {notification === 'saving' && (
          <div className="ss-notification saving">
            ⏳ {t('savingScore', 'Saving your progress...')}
          </div>
        )}
        {notification === 'saved' && (
          <div className="ss-notification saved">
            🎉 {t('scoreSaved', 'Progress saved! Keep practising!')}
          </div>
        )}

        {/* 3-Column Grid */}
        <div className="ss-grid">

          {/* Col 1 — Target sign */}
          <div className="ss-card">
            <div className="ss-card-header">{t('ssTargetSign')}</div>
            <div className="ss-card-body">
              <div className="ss-img-box">
                <img
                  src={SignData[id - 1].alphabetImage}
                  alt={SignData[id - 1].name}
                />
              </div>
              <div className="ss-sign-name">{SignData[id - 1].name}</div>
              <div className="ss-img-label" style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>{t('ssSignLanguage', 'Sign Language')}</div>
              <div className="ss-img-box">
                <img src={SignData[id - 1].signImage} alt={`Sign ${SignData[id - 1].name}`} />
              </div>
              <div className="ss-img-label">{t('ssTryToMatch')}</div>
            </div>
          </div>

          {/* Col 2 — Camera */}
          <div className="ss-card">
            <div className="ss-card-header accent">{t('ssLiveCamera')}</div>
            <div className="ss-card-body">
              <div className="ss-webcam-box" style={{ maxWidth: '82%', margin: '0 auto' }}>
                {isCameraOn
                  ? <Test webcamRef={webcamRef} canvasRef={canvasRef} />
                  : <div className="ss-webcam-off">{t('ssCameraOff')}</div>
                }
              </div>
            </div>
          </div>

          {/* Col 3 — Detection status */}
          <div className="ss-card">
            <div className="ss-card-header success">{t('ssDetectionStatus')}</div>
            <div className="ss-card-body">

              {/* Ready state */}
              {learn && (
                <div className="ss-result-box info">
                  <span className="ss-result-icon">▶️</span>
                  <div className="ss-result-title">{t('ssReadyToPractice')}</div>
                  <div className="ss-result-subtitle">
                    {t('ssStartHandDetection')}
                  </div>
                  <div className="ss-btn-group">
                    <button className="ss-btn-primary" onClick={onClickStart}>
                      {t('ssStartPractice')}
                    </button>
                  </div>
                </div>
              )}

              {/* Initializing / waiting for hand */}
              {isWaiting && (
                <div className="ss-result-box info">
                  <span className="ss-result-icon">🔍</span>
                  <div className="ss-result-title">{t('ssInitializing', 'Initializing...')}</div>
                  <div className="ss-result-subtitle">{t('ssShowYourHand', 'Show your hand in front of the camera')}</div>
                </div>
              )}

              {/* Success */}
              {isGoodMatch && (
                <div className="ss-result-box success">
                  <span className="ss-result-icon">✅</span>
                  <div className="ss-result-title">{t('ssGreatJob')}</div>
                  <div className="ss-result-subtitle">{t('ssPerfectly')}</div>
                </div>
              )}

              {/* Almost */}
              {isWeakMatch && (
                <div className="ss-result-box warning">
                  <span className="ss-result-icon">⚠️</span>
                  <div className="ss-result-title">{t('ssAlmostThere')}</div>
                  <div className="ss-result-subtitle">{t('ssTryCloser')}</div>
                </div>
              )}

              {/* No match */}
              {isNoMatch && (
                <div className="ss-result-box error">
                  <span className="ss-result-icon">❌</span>
                  <div className="ss-result-title">{t('ssTryAgainTitle')}</div>
                  <div className="ss-result-subtitle">{t('ssSignDoesntMatch')}</div>
                </div>
              )}

              {/* Live prediction */}
              {!learn && (
                <div className="ss-prediction-box">
                  <div className="ss-prediction-label">{t('ssDetectedSign')}</div>
                  <div className="ss-prediction-value">{landmarkClass}</div>
                  <div className="ss-progress">
                    <div
                      className="ss-progress-bar"
                      style={{ width: `${probability * 100}%` }}
                    />
                  </div>
                  <div className="ss-confidence-text">
                    {t('confidence')}: {(probability * 100).toFixed(0)}%
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
