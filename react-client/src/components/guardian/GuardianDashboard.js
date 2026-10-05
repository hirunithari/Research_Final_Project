// src/components/guardian/GuardianDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GuardianDataService from "../../services/GuardianDataService";
import "./guardian-dashboard.css";
import {
  FaTrophy,
  FaChartLine,
  FaClock,
  FaLightbulb,
  FaBullseye,
  FaBell,
  FaCog,
  FaDownload,
  FaCalendarAlt,
  FaGraduationCap,
  FaGamepad,
  FaHandPaper,
  FaCar,
  FaBook,
  FaSync,
} from "react-icons/fa";

const GuardianDashboard = () => {
  const { t } = useTranslation("common");
  const [data, setData] = useState({
    childInfo: null,
    performanceOverview: null,
    categoryProgress: [],
    recentActivities: [],
    achievements: [],
    recommendations: [],
    learningGoals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        childInfo,
        performanceOverview,
        categoryProgress,
        recentActivities,
        achievements,
        recommendations,
        learningGoals,
      ] = await Promise.all([
        GuardianDataService.getChildInfo(),
        GuardianDataService.getPerformanceOverview(),
        GuardianDataService.getCategoryProgress(),
        GuardianDataService.getRecentActivities(),
        GuardianDataService.getAchievements(),
        GuardianDataService.getRecommendations(),
        GuardianDataService.getLearningGoals(),
      ]);
      setData({ childInfo, performanceOverview, categoryProgress, recentActivities, achievements, recommendations, learningGoals });
    } catch (err) {
      setError(t("failedLoadDashboard"));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Animal Signs":  return <FaHandPaper />;
      case "Static Signs":  return <FaGamepad />;
      case "Text to Sign":  return <FaBook />;
      case "Traffic Signs": return <FaCar />;
      default:              return <FaGraduationCap />;
    }
  };

  const calcPct = (completed, total) =>
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const fmtDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.childInfo?.name || "student"}-progress-report.json`;
    a.click();
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loadingDashboard")}</span>
          </div>
          <p>{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-container">
          <div className="gd-alert gd-alert-danger">
            <strong>{t("error")}</strong> {error}
            <button className="gd-btn gd-btn-primary ms-3" onClick={loadDashboardData}>
              {t("tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── No data ── */
  if (!data.childInfo) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-container">
          <div className="gd-alert gd-alert-warning">
            {t("noLearningData")}
          </div>
        </div>
      </div>
    );
  }

  const perf = data.performanceOverview || {};
  const child = data.childInfo;

  return (
    <div className="guardian-dashboard">
      <div className="gd-container">

        {/* ── Header ── */}
        <div className="gd-header">
          <div className="gd-header-title">
            <h1>{t("guardianDashboardTitle")}</h1>
            <p>{t("monitorProgress", { name: child.name })}</p>
          </div>
          <div className="gd-header-actions">
            <button className="gd-btn gd-btn-primary" onClick={loadDashboardData}>
              <FaSync /> {t("refresh")}
            </button>
            <button className="gd-btn gd-btn-outline" onClick={exportData}>
              <FaDownload /> {t("exportReport")}
            </button>
            <Link to="/guardian-notifications" className="gd-btn gd-btn-outline">
              <FaBell /> {t("gdAlerts")}
            </Link>
            <Link to="/guardian-settings" className="gd-btn gd-btn-outline">
              <FaCog /> {t("settings")}
            </Link>
          </div>
        </div>

        {/* ── Row 1: Profile + Performance ── */}
        <div className="gd-grid-top">

          {/* Profile card */}
          <div className="gd-card">
            <div className="gd-card-header"><FaGraduationCap /> {t("gdStudentProfile")}</div>
            <div className="gd-card-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={child.avatar || "/images/default-avatar.jpg"}
                  alt={child.name}
                  className="gd-profile-avatar"
                />
                <div className="gd-profile-info">
                  <h3>{child.name}</h3>
                  <p>
                    {child.age !== "Not specified" ? `${t("gdAgeLabel")} ${child.age}` : ""}
                    {child.grade !== "Not specified" ? ` · ${child.grade}` : ""}
                  </p>
                  <p>{t("gdSincePrefix")} {fmtDate(child.joinDate)}</p>
                </div>
              </div>
              <div className="gd-mini-stats">
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{child.totalLearningTime || "0h 0m"}</div>
                  <div className="gd-mini-stat-label">{t("gdLearningTime")}</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{child.currentStreak || 0}</div>
                  <div className="gd-mini-stat-label">{t("dayStreak")}</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{perf.lessonsCompleted || 0}</div>
                  <div className="gd-mini-stat-label">{t("gdLessonsDone")}</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{perf.averageScore || 0}%</div>
                  <div className="gd-mini-stat-label">{t("gdAvgScore")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance overview */}
          <div className="gd-card">
            <div className="gd-card-header"><FaChartLine /> {t("performanceOverview")}</div>
            <div className="gd-card-body">
              <div className="gd-perf-grid">
                <div className="gd-perf-card gd-perf-card--primary">
                  <div className="gd-perf-value">{perf.totalScore || 0}</div>
                  <div className="gd-perf-label">{t("totalScore")}</div>
                </div>
                <div className="gd-perf-card gd-perf-card--accent">
                  <div className="gd-perf-value">{perf.averageScore || 0}%</div>
                  <div className="gd-perf-label">{t("averageScore")}</div>
                </div>
                <div className="gd-perf-card gd-perf-card--success">
                  <div className="gd-perf-value">{perf.accuracy || 0}%</div>
                  <div className="gd-perf-label">{t("accuracy")}</div>
                </div>
                <div className="gd-perf-card gd-perf-card--warning">
                  <div className="gd-perf-value">{perf.improvement || "+0%"}</div>
                  <div className="gd-perf-label">{t("improvement")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Category Progress + Recent Activities ── */}
        <div className="gd-grid-mid">

          {/* Category progress */}
          <div className="gd-card">
            <div className="gd-card-header"><FaGraduationCap /> {t("learningProgressByCategory")}</div>
            <div className="gd-card-body">
              {data.categoryProgress.length === 0 ? (
                <div className="gd-empty">{t("gdNoCategoryData")}</div>
              ) : (
                data.categoryProgress.map((cat, i) => {
                  const pct = calcPct(cat.completed, cat.total);
                  return (
                    <div className="gd-progress-item" key={i}>
                      <div className="gd-progress-head">
                        <span className="gd-progress-name">
                          {getCategoryIcon(cat.category)}&nbsp;{cat.category}
                        </span>
                        <span className="gd-progress-pct">{pct}%</span>
                      </div>
                      <div className="gd-progress-track">
                        <div className="gd-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="gd-progress-detail">
                        <span>{t("lessonsCompletedOf", { completed: cat.completed, total: cat.total })}</span>
                        <span>{t("scoreAccuracy", { score: cat.score, accuracy: cat.accuracy })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent activities */}
          <div className="gd-card">
            <div className="gd-card-header"><FaClock /> {t("recentActivities")}</div>
            <div className="gd-card-body">
              {data.recentActivities.length === 0 ? (
                <div className="gd-empty">{t("gdNoActivities")}</div>
              ) : (
                data.recentActivities.map((act) => (
                  <div className="gd-activity-item" key={act.id}>
                    <div className="gd-activity-icon">
                      {getCategoryIcon(act.category)}
                    </div>
                    <div className="gd-activity-body">
                      <div className="gd-activity-title">{act.activity}</div>
                      <div className="gd-activity-meta">
                        {act.category} · {fmtDate(act.date)}
                      </div>
                    </div>
                    <div className="gd-activity-score">{act.score}%</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Row 3: Achievements + Recommendations ── */}
        <div className="gd-grid-bot">

          {/* Achievements */}
          <div className="gd-card">
            <div className="gd-card-header"><FaTrophy /> {t("achievements")}</div>
            <div className="gd-card-body">
              {data.achievements.length === 0 ? (
                <div className="gd-empty">{t("gdNoAchievements")}</div>
              ) : (
                <div className="gd-achievements-grid">
                  {data.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`gd-achievement ${ach.unlocked ? "gd-achievement--unlocked" : "gd-achievement--locked"}`}
                    >
                      <div className="gd-achievement-icon">{ach.icon}</div>
                      <div className="gd-achievement-title">{ach.title}</div>
                      <div className="gd-achievement-desc">{ach.description}</div>
                      {ach.earned && (
                        <div className="gd-achievement-date">{fmtDate(ach.earned)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="gd-card">
            <div className="gd-card-header"><FaLightbulb /> {t("recommendations")}</div>
            <div className="gd-card-body">
              {data.recommendations.length === 0 ? (
                <div className="gd-empty">{t("gdNoRecommendations")}</div>
              ) : (
                data.recommendations.map((rec) => (
                  <div key={rec.id} className={`gd-rec-item gd-rec-item--${rec.priority}`}>
                    <div className="gd-rec-title">{rec.title}</div>
                    <div className="gd-rec-desc">{rec.description}</div>
                    <div className="gd-rec-tag">{rec.category}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Row 4: Learning Goals ── */}
        <div className="gd-card">
          <div className="gd-card-header"><FaBullseye /> {t("learningGoals")}</div>
          <div className="gd-card-body">
            {data.learningGoals.length === 0 ? (
              <div className="gd-empty">{t("gdNoGoals")}</div>
            ) : (
              <div className="gd-goals-grid">
                {data.learningGoals.map((goal) => (
                  <div className="gd-goal-item" key={goal.id}>
                    <div className="gd-goal-title">{goal.goal}</div>
                    <div className="gd-goal-track">
                      <div className="gd-goal-fill" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <div className="gd-goal-meta">
                      <span>{goal.progress}% / {goal.target}%</span>
                      <span>
                        <FaCalendarAlt style={{ fontSize: "0.65rem" }} />{" "}
                        {fmtDate(goal.deadline)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardianDashboard;
