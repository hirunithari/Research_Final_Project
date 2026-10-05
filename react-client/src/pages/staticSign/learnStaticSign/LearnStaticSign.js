import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { StaticSignData } from '../../../Data/StaticSignData';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import '../static-signs.css';

let time = 0;
let landmarks = null;

export default function LearnStaticSign() {
  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData, setSignData] = useState(StaticSignData);
  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);

  const { t } = useTranslation("common");
  let navigate = useNavigate();

  const routePractice = () => {
    let path = `/practise-static-sign/${SignData[currentStep].id}`;
    navigate(path);
  };

  const routeHome = () => {
    let path = `/static-sign-dashboard`;
    navigate(path);
  };

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
  };

  async function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        });
        connect(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
        await landmarks.map((item) => {
          totalLandmarks.push(item.x);
          totalLandmarks.push(item.y);
          totalLandmarks.push(item.z);
        });
      }
      const data = { temp: totalLandmarks };
      if (totalLandmarks.length === 63) {
        const result = await axios.post('http://127.0.0.1:5000/predict-test', data);
        setPredictData(result.data);
      }
    }
    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try { await hands.send({ image: webcamRef.current.video }); } catch (error) {}
        },
        width: 640,
        height: 480
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const stopDetection = () => {
    camera.stop();
    setIsStarted(false);
    setIsCameraOn(false);
  };

  return (
    <div className="ss-page">
      <div className="ss-container">

        {/* Page Header */}
        <div className="ss-page-header">
          <button className="ss-back-btn" onClick={routeHome}>← {t('back', 'Back')}</button>
          <div>
            <div className="ss-page-title">{t('staticSign')}</div>
            <div className="ss-page-subtitle">{t('ssLearnPageSubtitle')}</div>
          </div>
          <div className="ss-header-badge">
            {t('ssStepOf', { current: currentStep + 1, total: SignData.length })}
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="ss-grid">

          {/* Col 1 — Alphabet image */}
          <div className="ss-card">
            <div className="ss-card-header">{t('ssLetterLabel')}</div>
            <div className="ss-card-body">
              <div className="ss-img-box">
                <img
                  src={SignData[currentStep].alphabetImage}
                  alt={`Alphabet ${SignData[currentStep].name}`}
                />
              </div>
              <div className="ss-sign-name">{SignData[currentStep].name}</div>
              <div className="ss-img-label">{t('ssCurrentLetter')}</div>
            </div>
          </div>

          {/* Col 2 — Sign language image */}
          <div className="ss-card">
            <div className="ss-card-header accent">{t('ssSignLanguageLabel')}</div>
            <div className="ss-card-body">
              <div className="ss-img-box">
                <img
                  src={SignData[currentStep].signImage}
                  alt={`Sign for ${SignData[currentStep].name}`}
                />
              </div>
              <div className="ss-img-label">{t('ssHowToSignIt')}</div>
              <div className="ss-divider"></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                {t('ssStudyHandPosition')}
              </div>
            </div>
          </div>

          {/* Col 3 — Controls */}
          <div className="ss-card">
            <div className="ss-card-header success">{t('ssPracticeLabel')}</div>
            <div className="ss-card-body">
              <div className="ss-result-box info">
                <span className="ss-result-icon">🎯</span>
                <div className="ss-result-title">{t('ssReadyToPractice')}</div>
                <div className="ss-result-subtitle">
                  {t('ssClickToStartPractice')}
                </div>
              </div>

              <div className="ss-btn-group">
                <button className="ss-btn-primary" onClick={routePractice}>
                  ▶ {t('ssStartPractice')}
                </button>

                {currentStep < SignData.length - 1 ? (
                  <button
                    className="ss-btn-accent"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    {t('ssLearnNextSign')} →
                  </button>
                ) : (
                  <button className="ss-btn-outline" onClick={routeHome}>
                    ← {t('ssBackToDashboard')}
                  </button>
                )}
              </div>

              <div className="ss-divider"></div>

              {/* Progress dots */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-img-label" style={{ marginBottom: '0.5rem' }}>{t('ssProgressLabel')}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  {SignData.slice(0, Math.min(SignData.length, 12)).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: i === currentStep
                          ? 'linear-gradient(135deg,#667eea,#764ba2)'
                          : i < currentStep
                          ? 'linear-gradient(135deg,#43e97b,#38f9d7)'
                          : '#e2e8f0',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                  {SignData.length > 12 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                      +{SignData.length - 12}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
