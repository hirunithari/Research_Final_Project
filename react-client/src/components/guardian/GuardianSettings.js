import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import './guardian-dashboard.css';
import {
  FaBell,
  FaShieldAlt,
  FaEye,
  FaSave,
  FaUndo,
  FaEnvelope,
  FaMobile,
  FaDesktop,
  FaChartBar,
  FaUserFriends,
  FaDatabase,
  FaDownload,
  FaCog,
} from 'react-icons/fa';

/* Reusable toggle row */
function SettingToggle({ id, label, desc, checked, onChange }) {
  return (
    <div className="gs-setting-item">
      <div className="gs-setting-info">
        <div className="gs-setting-label">{label}</div>
        {desc && <div className="gs-setting-desc">{desc}</div>}
      </div>
      <label className="gs-toggle">
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <span className="gs-toggle-slider" />
      </label>
    </div>
  );
}

const GuardianSettings = () => {
  const { t } = useTranslation('common');

  const defaultSettings = {
    notifications: {
      weeklyReport: true,
      achievementAlerts: true,
      lowPerformanceAlerts: true,
      milestoneCelebrations: true,
    },
    privacy: {
      shareProgress: true,
      allowLeaderboard: true,
      dataCollection: true,
    },
    display: {
      showWeeklyChart: true,
      showAchievements: true,
      showRecommendations: true,
      showLearningGoals: true,
    },
    social: {
      showLeaderboard: true,
      allowSharing: true,
      showCommunity: false,
    },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [dataRetention, setDataRetention] = useState('365');
  const [exportFreq, setExportFreq] = useState('quarterly');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.guardianSettings) {
          setSettings(prev => ({ ...prev, ...data.guardianSettings }));
        }
        if (data.dataRetention) setDataRetention(data.dataRetention);
        if (data.exportFreq) setExportFreq(data.exportFreq);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage(t('gsErrorLoadingSettings'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 3500);
  };

  const setNested = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        guardianSettings: settings,
        dataRetention,
        exportFreq,
      });
      setHasChanges(false);
      showMessage(t('settingsSavedSuccess'), 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage(t('gsErrorSavingSettings'), 'danger');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setDataRetention('365');
    setExportFreq('quarterly');
    setHasChanges(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guardian-settings.json';
    a.click();
  };

  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('gsLoadingSettings')}</span>
          </div>
          <p>{t('gsLoadingSettings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guardian-dashboard">
      <div className="gd-container">

        {/* ── Header ── */}
        <div className="gd-header">
          <div className="gd-header-title">
            <h1>{t('gsSettingsTitle')}</h1>
            <p>{t('gsSettingsSubtitle')}</p>
          </div>
          {message && (
            <div className={`gd-alert gd-alert-${messageType === 'success' ? 'warning' : 'danger'}`}
              style={{ margin: 0, padding: '0.6rem 1rem' }}>
              {message}
            </div>
          )}
          <div className="gd-header-actions">
            <button
              className="gd-btn gd-btn-primary"
              onClick={saveSettings}
              disabled={!hasChanges || saving}
            >
              <FaSave /> {saving ? t('savingChanges') : t('saveChanges')}
            </button>
            <button
              className="gd-btn gd-btn-outline"
              onClick={resetSettings}
              disabled={!hasChanges}
            >
              <FaUndo /> {t('gsReset')}
            </button>
          </div>
        </div>

        {/* ── Row 1: Notifications ── */}
        <div className="gs-grid-2 gs-section">
          {/* Email notifications */}
          <div className="gd-card">
            <div className="gd-card-header">
              <FaEnvelope /> {t('gdEmailNotifications')}
            </div>
            <div className="gd-card-body">
              <div className="gs-section-title">{t('gdNotificationPrefs')}</div>
              <SettingToggle
                id="emailWeekly"
                label={t('gsWeeklyReport')}
                checked={settings.notifications.weeklyReport}
                onChange={e => setNested('notifications', 'weeklyReport', e.target.checked)}
              />
              <SettingToggle
                id="emailAchievement"
                label={t('gdAchievementAlerts')}
                checked={settings.notifications.achievementAlerts}
                onChange={e => setNested('notifications', 'achievementAlerts', e.target.checked)}
              />
              <SettingToggle
                id="emailLowPerf"
                label={t('gsLowPerfAlerts')}
                checked={settings.notifications.lowPerformanceAlerts}
                onChange={e => setNested('notifications', 'lowPerformanceAlerts', e.target.checked)}
              />
              <SettingToggle
                id="emailMilestone"
                label={t('gdMilestoneCelebrations')}
                checked={settings.notifications.milestoneCelebrations}
                onChange={e => setNested('notifications', 'milestoneCelebrations', e.target.checked)}
              />
            </div>
          </div>

          {/* Push notifications */}
          <div className="gd-card">
            <div className="gd-card-header accent">
              <FaMobile /> {t('gdPushNotifications')}
            </div>
            <div className="gd-card-body">
              <div className="gs-section-title">{t('gdNotificationPrefs')}</div>
              <SettingToggle
                id="pushWeekly"
                label={t('gsWeeklyReport')}
                checked={settings.notifications.weeklyReport}
                onChange={e => setNested('notifications', 'weeklyReport', e.target.checked)}
              />
              <SettingToggle
                id="pushAchievement"
                label={t('gdAchievementAlerts')}
                checked={settings.notifications.achievementAlerts}
                onChange={e => setNested('notifications', 'achievementAlerts', e.target.checked)}
              />
              <SettingToggle
                id="pushLowPerf"
                label={t('gsLowPerfAlerts')}
                checked={settings.notifications.lowPerformanceAlerts}
                onChange={e => setNested('notifications', 'lowPerformanceAlerts', e.target.checked)}
              />
              <SettingToggle
                id="pushMilestone"
                label={t('gdMilestoneCelebrations')}
                checked={settings.notifications.milestoneCelebrations}
                onChange={e => setNested('notifications', 'milestoneCelebrations', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* ── Row 2: Privacy + Data Management ── */}
        <div className="gs-grid-2 gs-section">
          {/* Privacy */}
          <div className="gd-card">
            <div className="gd-card-header success">
              <FaShieldAlt /> {t('gsPrivacyTitle')}
            </div>
            <div className="gd-card-body">
              <div className="gs-section-title">{t('gsVisibilitySettings')}</div>
              <SettingToggle
                id="shareProgress"
                label={t('gsShareProgress')}
                desc={t('gsShareProgress')}
                checked={settings.privacy.shareProgress}
                onChange={e => setNested('privacy', 'shareProgress', e.target.checked)}
              />
              <SettingToggle
                id="allowLeaderboard"
                label={t('gsAllowLeaderboard')}
                checked={settings.privacy.allowLeaderboard}
                onChange={e => setNested('privacy', 'allowLeaderboard', e.target.checked)}
              />
              <SettingToggle
                id="dataCollection"
                label={t('gsDataCollection')}
                checked={settings.privacy.dataCollection}
                onChange={e => setNested('privacy', 'dataCollection', e.target.checked)}
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="gd-card">
            <div className="gd-card-header warning">
              <FaDatabase /> {t('gsDataMgmt')}
            </div>
            <div className="gd-card-body">
              <div className="gs-form-row">
                <label className="gs-form-label">{t('gsDataRetention')}</label>
                <select
                  className="gs-select"
                  value={dataRetention}
                  onChange={e => { setDataRetention(e.target.value); setHasChanges(true); }}
                >
                  <option value="30">{t('gs30Days')}</option>
                  <option value="90">{t('gs90Days')}</option>
                  <option value="365">{t('gs1Year')}</option>
                  <option value="forever">{t('gsForever')}</option>
                </select>
              </div>
              <div className="gs-form-row">
                <label className="gs-form-label">{t('gsExportFreq')}</label>
                <select
                  className="gs-select"
                  value={exportFreq}
                  onChange={e => { setExportFreq(e.target.value); setHasChanges(true); }}
                >
                  <option value="never">{t('gsNever')}</option>
                  <option value="monthly">{t('gsMonthly')}</option>
                  <option value="quarterly">{t('gsQuarterly')}</option>
                  <option value="yearly">{t('gsYearly')}</option>
                </select>
              </div>
              <button className="gs-btn-export" onClick={exportData}>
                <FaDownload /> {t('gsExportAllData')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Row 3: Dashboard Customization ── */}
        <div className="gs-grid-2 gs-section">
          {/* Display Preferences */}
          <div className="gd-card">
            <div className="gd-card-header">
              <FaChartBar /> {t('gsDisplayPrefs')}
            </div>
            <div className="gd-card-body">
              <div className="gs-section-title">{t('gsDashboardCustom')}</div>
              <SettingToggle
                id="showWeeklyChart"
                label={t('gsShowWeeklyChart')}
                checked={settings.display.showWeeklyChart}
                onChange={e => setNested('display', 'showWeeklyChart', e.target.checked)}
              />
              <SettingToggle
                id="showAchievements"
                label={t('gsShowAchievements')}
                checked={settings.display.showAchievements}
                onChange={e => setNested('display', 'showAchievements', e.target.checked)}
              />
              <SettingToggle
                id="showRecommendations"
                label={t('gsShowRecommendations')}
                checked={settings.display.showRecommendations}
                onChange={e => setNested('display', 'showRecommendations', e.target.checked)}
              />
              <SettingToggle
                id="showLearningGoals"
                label={t('gsShowLearningGoals')}
                checked={settings.display.showLearningGoals}
                onChange={e => setNested('display', 'showLearningGoals', e.target.checked)}
              />
            </div>
          </div>

          {/* Social Features */}
          <div className="gd-card">
            <div className="gd-card-header accent">
              <FaUserFriends /> {t('gsSocialFeatures')}
            </div>
            <div className="gd-card-body">
              <div className="gs-section-title">{t('gsSocialFeatures')}</div>
              <SettingToggle
                id="showLeaderboard"
                label={t('gsShowLeaderboard')}
                checked={settings.social.showLeaderboard}
                onChange={e => setNested('social', 'showLeaderboard', e.target.checked)}
              />
              <SettingToggle
                id="allowSharing"
                label={t('gsAllowSharing')}
                checked={settings.social.allowSharing}
                onChange={e => setNested('social', 'allowSharing', e.target.checked)}
              />
              <SettingToggle
                id="showCommunity"
                label={t('gsShowCommunity')}
                checked={settings.social.showCommunity}
                onChange={e => setNested('social', 'showCommunity', e.target.checked)}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Sticky unsaved-changes bar ── */}
      {hasChanges && (
        <div className="gs-sticky-bar">
          <div className="gs-sticky-text">{t('gsUnsavedChanges')}</div>
          <div className="gs-sticky-actions">
            <button className="gd-btn gd-btn-primary" onClick={saveSettings} disabled={saving}>
              <FaSave /> {saving ? t('savingChanges') : t('saveChanges')}
            </button>
            <button className="gd-btn gd-btn-outline" onClick={resetSettings}>
              <FaUndo /> {t('gsDiscard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianSettings;
