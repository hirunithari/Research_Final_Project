import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from './Test';
import { StaticSignData } from '../../../Data/StaticSignData';
import { useNavigate, useParams } from "react-router-dom";
import { db } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from "../../../firebase";
import { useTranslation } from 'react-i18next';
import '../static-signs.css';

let go = 0;

export default function StaticSignGame() {

  const { t } = useTranslation("common");
  let navigate = useNavigate();
  const routeLeaderboard = () => {
    let path = `/leaderboard`;
    navigate(path);
  };

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
  const [totalMarks, setTotalMarks] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  const stopDetection = () => {
    cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    calculateScore();
    routeLeaderboard();
  };

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
    setStartTime(Date.now());
  };

  const calculateScore = async () => {
    const user = auth.currentUser;
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    setTimeSpent(elapsedTime / 1000);

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { score: totalMarks }, { merge: true });

        const GuardianDataService = (await import('../../../services/GuardianDataService')).default;

        await GuardianDataService.recordActivity({
          activityName: 'Completed Static Signs Lesson',
          category: 'Static Signs',
          duration: Math.round(elapsedTime / 1000 / 60),
          score: totalMarks
        });

        await GuardianDataService.recordScore({
          score: totalMarks,
          category: 'staticSigns',
          accuracy: Math.round((totalMarks / 100) * 100),
          lessonType: 'Static Signs'
        });

        await GuardianDataService.checkAchievements();

        const accuracy = Math.round((totalMarks / 100) * 100);
        await GuardianDataService.createPerformanceAlert(user.uid, 'Static Signs', accuracy);

        const scores = await GuardianDataService.getUserScores(user.uid);
        if (scores.length === 1) {
          await GuardianDataService.createMilestoneNotification(
            user.uid,
            'Congratulations! You completed your first lesson.'
          );
        }
      } catch (error) {
        console.error("Error saving marks to Firebase:", error);
      }
    }
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
        const result = await axios.post('http://127.0.0.1:5000/predict-static-sign', data);
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
        if (result.data.predict === 'A' && result.data.probability > 0.5 && go === 0) {
          go = 1;
        } else if (result.data.predict === 'B' && result.data.probability > 0.5 && go === 1) {
          go = 2;
        } else if (result.data.predict === 'C' && result.data.probability > 0.5 && go === 2) {
          go = 3;
        } else if (result.data.predict === 'D' && result.data.probability > 0.5 && go === 3) {
          go = 4;
        } else if (result.data.predict === 'E' && result.data.probability > 0.5 && go === 4) {
          setResult(true);
        }
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
      maxNumHands: 1,
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

  const nextStep = () => {
    setTotalMarks(totalMarks - 20);
    go = go + 1;
  };

  /* Progress indicator A→B→C→D→E */
  const steps = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="ss-page">
      <div className="ss-container">

        {/* Page Header */}
        <div className="ss-page-header">
          <div>
            <div className="ss-page-title">{t('startGame')}</div>
            <div className="ss-page-subtitle">{t('ssGameSubtitle')}</div>
          </div>
          <div className="ss-header-badge">
            {t('score')}: {totalMarks}
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1rem',
                background: i < go
                  ? 'linear-gradient(135deg,#43e97b,#38f9d7)'
                  : i === go
                  ? 'linear-gradient(135deg,#667eea,#764ba2)'
                  : '#e2e8f0',
                color: i <= go ? '#fff' : '#aaa',
                boxShadow: i === go ? '0 4px 12px rgba(102,126,234,0.4)' : 'none',
                transition: 'all 0.3s'
              }}>
                {i < go ? '✓' : s}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: '30px',
                  height: '3px',
                  borderRadius: '2px',
                  background: i < go
                    ? 'linear-gradient(135deg,#43e97b,#38f9d7)'
                    : '#e2e8f0',
                  transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* 3-Column Grid */}
        <div className="ss-grid">

          {/* Col 1 — Current sign */}
          <div className="ss-card">
            <div className="ss-card-header">{t('ssCurrentSign')}</div>
            <div className="ss-card-body">
              <div className="ss-img-box">
                <img
                  src={SignData[go].alphabetImage}
                  alt={`Sign ${go}`}
                />
              </div>
              <div className="ss-sign-name">{SignData[go].name}</div>
              <div className="ss-img-label" style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>{t('ssSignLanguage', 'Sign Language')}</div>
              <div className="ss-img-box">
                <img src={SignData[go].signImage} alt={`Sign ${SignData[go].name}`} />
              </div>
              <div className="ss-img-label">{t('ssSignThisLetter')}</div>
            </div>
          </div>

          {/* Col 2 — Camera */}
          <div className="ss-card">
            <div className="ss-card-header accent">{t('ssLiveCamera')}</div>
            <div className="ss-card-body">
              <div className="ss-webcam-box">
                {isCameraOn
                  ? <Test webcamRef={webcamRef} canvasRef={canvasRef} />
                  : <div className="ss-webcam-off">{t('ssCameraOff')}</div>
                }
              </div>
            </div>
          </div>

          {/* Col 3 — Game status */}
          <div className="ss-card">
            <div className="ss-card-header success">{t('ssGameStatus')}</div>
            <div className="ss-card-body">

              {/* Start state */}
              {learn && (
                <div className="ss-result-box info">
                  <span className="ss-result-icon">🎮</span>
                  <div className="ss-result-title">{t('startGame')}</div>
                  <div className="ss-result-subtitle">
                    {t('ssStartGameDesc')}
                  </div>
                  <div className="ss-btn-group">
                    <button className="ss-btn-primary" onClick={onClickStart}>
                      ▶ {t('ssStartGameBtn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Playing state */}
              {!learn && !result && (
                <>
                  <div className="ss-prediction-box">
                    <div className="ss-prediction-label">{t('ssDetectedSign')}</div>
                    <div className="ss-prediction-value">
                      {landmarkClass !== 'none' ? landmarkClass : '—'}
                    </div>
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
                  <div className="ss-btn-group">
                    <button className="ss-btn-outline" onClick={nextStep}>
                      {t('ssSkipSign')}
                    </button>
                  </div>
                </>
              )}

              {/* Win state */}
              {result && (
                <div className="ss-result-box success">
                  <span className="ss-result-icon">🏆</span>
                  <div className="ss-result-title">{t('ssYouFinished')}</div>
                  <div className="ss-result-subtitle">
                    {t('ssAmazingCompleted')}
                  </div>
                  <div className="ss-btn-group">
                    <button className="ss-btn-success" onClick={() => stopDetection()}>
                      {t('ssViewLeaderboardBtn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Score stats */}
              <div className="ss-stats-row">
                <div className="ss-stat-item">
                  <div className="ss-stat-label">{t('score')}</div>
                  <div className="ss-stat-value">{totalMarks}</div>
                </div>
                <div className="ss-stat-item">
                  <div className="ss-stat-label">{t('ssProgressLabel')}</div>
                  <div className="ss-stat-value">{go}/5</div>
                </div>
                <div className="ss-stat-item">
                  <div className="ss-stat-label">{t('ssMaxScore')}</div>
                  <div className="ss-stat-value">100</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
