// src/pages/traffic/TrafficSigns.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getJson, apiBase } from "../../lib/api";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import TrafficWebcam from "../../components/traffic/TrafficWebcam";
import {
  normalizeTopk,
  percent,
  round,
} from "../../components/traffic/resultUtils";
import "./traffic-signs.css";

/**
 * Friendly UI for learning:
 * - Left: reference image + class picker
 * - Right: webcam + big Match% ring + top-k list
 * Hides timings/device; focuses on user clarity.
 */
export default function TrafficSigns() {
  const { t } = useTranslation("common");
  const [classes, setClasses] = useState([]);
  const [refs, setRefs] = useState({});
  const [target, setTarget] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [attemptStartTime, setAttemptStartTime] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [bestMatch, setBestMatch] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Clear result when target changes to avoid showing stale predictions
  useEffect(() => {
    setResult(null);
    setErr("");
    
    // Complete current attempt when target changes
    const currentAttemptStartTime = attemptStartTime;
    if (currentAttemptStartTime) {
      const attemptDuration = Math.round((Date.now() - currentAttemptStartTime) / 1000); // in seconds
      if (attemptDuration > 2) { // Only count attempts longer than 2 seconds
        setAttemptCount(prev => prev + 1);
      }
      setAttemptStartTime(null);
    }
  }, [target]);

  // Start session timer when component mounts
  useEffect(() => {
    setSessionStartTime(Date.now());
  }, []);

  // Handle attempt completion when good match is achieved
  useEffect(() => {
    if (result && target && attemptStartTime) {
      const topk = normalizeTopk(result?.topk);
      const targetInTopK = topk.find(pred => pred.label === target);
      const currentMatchPct = targetInTopK ? Math.max(0, Math.min(100, targetInTopK.prob * 100)) : null;
      
      if (currentMatchPct && currentMatchPct > 70) {
        const attemptDuration = Math.round((Date.now() - attemptStartTime) / 1000); // in seconds
        if (attemptDuration > 2) { // Only count attempts longer than 2 seconds
          setAttemptCount(prev => prev + 1);
        }
        setAttemptStartTime(null);
      }
    }
  }, [result, target, attemptStartTime]);

  // Handle result updates and scoring
  useEffect(() => {
    if (result && target) {
      // Start attempt timer if not already started
      if (!attemptStartTime) {
        setAttemptStartTime(Date.now());
      }
      
      // Calculate match percentage for current result
      const currentMatchPct = (() => {
        const topk = normalizeTopk(result?.topk);
        const targetInTopK = topk.find(pred => pred.label === target);
        if (targetInTopK) {
          return Math.max(0, Math.min(100, targetInTopK.prob * 100));
        }
        if (typeof result?.target_match_percent === "number") {
          return Math.max(0, Math.min(100, result.target_match_percent));
        }
        return null;
      })();
      
      // Update best match if current match is higher
      if (currentMatchPct && currentMatchPct > bestMatch) {
        setBestMatch(currentMatchPct);
      }
      
      // Calculate session score based on match percentage
      if (currentMatchPct) {
        const currentScore = Math.round(currentMatchPct);
        setSessionScore(prev => Math.max(prev, currentScore));
      }
    }
  }, [result, target, bestMatch]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getJson("/classes"); // { classes: [...], references: { name: "/reference/..." } }
        if (!mounted) return;
        setClasses(data.classes || []);
        setRefs(data.references || {});
        if ((data.classes || []).length > 0) setTarget(data.classes[0]);
      } catch (e) {
        setErr(t("failedLoadTrafficSigns"));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const referenceSrc = useMemo(() => {
    if (!target) return null;
    const rel = refs[target];
    if (!rel) return null;
    return `${apiBase()}${rel}`;
  }, [refs, target]);

  const topk = useMemo(() => normalizeTopk(result?.topk), [result]);
  const matchPct = useMemo(() => {
    if (!result || !target) return null;
    
    // Check if the target is in the top-k predictions
    const targetInTopK = topk.find(pred => pred.label === target);
    if (targetInTopK) {
      // Use the prediction probability as match percentage
      return Math.max(0, Math.min(100, targetInTopK.prob * 100));
    }
    
    // Fallback to target_match_percent if available
    if (typeof result?.target_match_percent === "number") {
      return Math.max(0, Math.min(100, result.target_match_percent));
    }
    
    return null;
  }, [result, target, topk]);



  // Save session data to Firebase
  const saveSessionData = async () => {
    try {
      setSaving(true);
      setSaveMessage("");
      
      const user = auth.currentUser;
      
      if (!user) {
        setSaveMessage("❌ " + t("mustBeLoggedIn"));
        return;
      }

      if (!sessionStartTime) {
        setSaveMessage("❌ " + t("noSessionData"));
        return;
      }

      const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60); // in minutes
      
      // Complete any ongoing attempt
      let finalAttemptCount = attemptCount;
      if (attemptStartTime) {
        const attemptDuration = Math.round((Date.now() - attemptStartTime) / 1000); // in seconds
        if (attemptDuration > 2) { // Only count attempts longer than 2 seconds
          finalAttemptCount += 1;
        }
      }
      
      if (finalAttemptCount > 0) {
        // Save to userScores collection
        const scoreData = {
          userId: user.uid,
          score: sessionScore,
          category: 'trafficSigns',
          accuracy: bestMatch,
          lessonType: 'Traffic Signs',
          timestamp: new Date(),
          attempts: finalAttemptCount,
          duration: sessionDuration
        };

        // Save to userActivities collection
        const activityData = {
          userId: user.uid,
          activityName: 'Traffic Signs Practice Session',
          category: 'Traffic Signs',
          duration: sessionDuration,
          score: sessionScore,
          attempts: finalAttemptCount,
          bestMatch: bestMatch,
          timestamp: new Date()
        };

        // Import GuardianDataService dynamically to avoid circular dependencies
        const GuardianDataService = (await import('../../services/GuardianDataService')).default;
        
        await GuardianDataService.recordScore(scoreData);
        await GuardianDataService.recordActivity(activityData);
        await GuardianDataService.checkAchievements();
        setSaveMessage("✅ " + t("progressSavedSuccess"));
        
        // Show success notification
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Traffic Signs Progress Saved', {
            body: `Your progress has been saved to your Guardian Dashboard. Score: ${sessionScore}, Best Match: ${bestMatch.toFixed(1)}%`,
            icon: '/images/app.svg'
          });
        }
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      } else {
        setSaveMessage("❌ " + t("noAttemptsRecorded"));
      }
    } catch (error) {
      setSaveMessage(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Save data when component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (attemptCount > 0) {
        saveSessionData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (attemptCount > 0) {
        saveSessionData();
      }
    };
  }, [attemptCount, sessionScore, bestMatch, sessionStartTime]); // Add dependencies



  return (
    <div className="traffic-signs-page">
      <div className="container">
        {/* Compact Grid Layout */}
        <div className="traffic-signs-grid">
          {/* Left Column - Reference and Controls */}
          <div className="ts-card">
            <div className="ts-card-header">
              {t("referenceSign")}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="classSelect">
                  {t("chooseASign")}
                </label>
                <select
                  id="classSelect"
                  className="form-select"
                  value={target || ""}
                  onChange={(e) => setTarget(e.target.value || null)}
                  disabled={loading || classes.length === 0}
                >
                  <option value="">{t("selectAClass")}</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {loading && <div className="form-text">{t("loadingClasses")}</div>}
              </div>

              <div className="ts-refbox">
                {referenceSrc ? (
                  <img
                    className="ts-refimg"
                    src={referenceSrc}
                    alt={target}
                    title={target || ""}
                  />
                ) : (
                  <div className="ts-help">
                    {t("selectTrafficSign")}
                  </div>
                )}
              </div>

              <div className="ts-help text-muted mt-3">
                {t("tipAlignHand")}
                {!result && target && (
                  <div className="alert alert-info mt-2" role="alert">
                    {t("tsAdaptingToTarget", { target })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Webcam */}
          <div className="ts-card">
            <div className="ts-card-header">
              {t("liveRecognition")}
            </div>
            <div className="card-body">
              {err && (
                <div className="alert alert-danger mb-3" role="alert">
                  {err}
                </div>
              )}

              <TrafficWebcam
                target={target}
                topk={3}
                mirror
                onResult={setResult}
                onError={setErr}
                videoWidth={360}
                videoHeight={270}
                showStatus={true}
              />
            </div>
          </div>

          {/* Right Column - Match Ring and Predictions */}
          <div className="ts-card">
            <div className="ts-card-header">
              {t("tsResults")}
            </div>
            <div className="card-body">
              {/* Big Match% ring + label */}
              <div className="ts-match">
                <div className="ts-match-ring">
                  <div
                    className="ts-match-ring-fill"
                    style={{
                      background: `conic-gradient(var(--accent-gradient) ${
                        (matchPct || 0) * 3.6
                      }deg, rgba(79, 172, 254, 0.1) 0)`,
                    }}
                  />
                  <div className="ts-match-center">
                    <div className="ts-match-pct">
                      {matchPct == null ? "—" : `${round(matchPct, 0)}%`}
                    </div>
                    <div className="ts-match-label">{t("match")}</div>
                  </div>
                </div>
                <div className="small text-muted mt-1">
                  {t("target")}:{" "}
                  <span className="fw-semibold">{target || "—"}</span>
                </div>
              </div>

              {/* Top-K predictions */}
              <div className="mt-3">
                <div className="fw-semibold mb-2">{t("topPredictions")}</div>
                <ul className="list-group ts-topk">
                  {topk.length === 0 && (
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">{t("noPredictionsYet")}</span>
                    </li>
                  )}
                  {topk.map((x, idx) => (
                    <li
                      key={x.label}
                      className={`list-group-item ts-topk-item ${
                        idx === 0 ? "ts-topk-item--best" : ""
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="ts-topk-label">{x.label}</span>
                        <span className="ts-topk-pct">
                          {percent(x.prob)}
                        </span>
                      </div>
                      <div className="progress ts-progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${(x.prob || 0) * 100}%` }}
                          aria-valuenow={(x.prob || 0) * 100}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      <div className="progress-details">
                        <span>{t("confidence")}</span>
                        <span>{percent(x.prob)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Guardian Dashboard Link - Always Visible */}
        <div className="ts-guardian-card">
          <div className="ts-guardian-icon">📊</div>
          <div className="ts-guardian-body">
            <div className="ts-guardian-title">{t("tsGuardianCardTitle")}</div>
            <div className="ts-guardian-desc">{t("tsGuardianCardDesc")}</div>
          </div>
          <Link to="/guardian-dashboard" className="ts-guardian-btn">
            {t("tsGoToDashboard")}
          </Link>
        </div>

        {/* Session Statistics - Full Width */}
        {attemptCount > 0 && (
          <div className="session-stats">
            <h6>{t("sessionStatistics")}</h6>
            <div className="row text-center">
              <div className="col-4">
                <div className="stat-item">
                  <div className="stat-label">{t("attempts")}</div>
                  <div className="stat-value">{attemptCount}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="stat-item">
                  <div className="stat-label">{t("bestMatch")}</div>
                  <div className="stat-value text-primary">{bestMatch.toFixed(1)}%</div>
                </div>
              </div>
              <div className="col-4">
                <div className="stat-item">
                  <div className="stat-label">{t("sessionScore")}</div>
                  <div className="stat-value text-success">{sessionScore}</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <div className="progress-message">
                {t("tsProgressMessage")}
              </div>
              {saveMessage && (
                <div className={`alert ${saveMessage.includes('✅') ? 'alert-success' : 'alert-danger'} mt-2`}>
                  {saveMessage}
                </div>
              )}
              <button
                className="btn-save-progress"
                onClick={saveSessionData}
                disabled={saving || attemptCount === 0}
              >
                {saving ? t("tsSavingProgress") : t("tsSaveProgressNow")}
              </button>
              <div className="mt-2">
                <Link to="/guardian-dashboard" className="btn btn-outline-primary btn-sm">
                  {t("tsViewGuardianDashboard")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
