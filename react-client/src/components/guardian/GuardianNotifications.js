import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import GuardianDataService from '../../services/GuardianDataService';
import './guardian-dashboard.css';
import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaEnvelope,
  FaMobile,
  FaSync,
} from 'react-icons/fa';

/* ── Reusable toggle (same as settings page) ── */
function SettingToggle({ id, label, checked, onChange }) {
  return (
    <div className="gs-setting-item">
      <div className="gs-setting-info">
        <div className="gs-setting-label">{label}</div>
      </div>
      <label className="gs-toggle">
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <span className="gs-toggle-slider" />
      </label>
    </div>
  );
}

const GuardianNotifications = () => {
  const { t } = useTranslation('common');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [prefEmail, setPrefEmail] = useState({ achievements: true, performance: true, weekly: true });
  const [prefPush, setPrefPush]   = useState({ achievements: true, performance: false, milestones: true });

  useEffect(() => {
    loadNotifications();
  }, []);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const childData = await GuardianDataService.getChildInfo();
      setChildInfo(childData);

      const notificationsQuery = query(
        collection(db, 'guardianNotifications'),
        where('userId', '==', user.uid),
        where('active', '==', true)
      );
      const snapshot = await getDocs(notificationsQuery);

      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate() || new Date(),
      }));
      data.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showMessage(t('gdErrorLoadingNotifications'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'guardianNotifications', id), {
        read: true,
        readAt: serverTimestamp(),
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'guardianNotifications', id), {
        active: false,
        deletedAt: serverTimestamp(),
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const unread = notifications.filter(n => !n.read);
      await Promise.all(
        unread.map(n =>
          updateDoc(doc(db, 'guardianNotifications', n.id), {
            read: true,
            readAt: serverTimestamp(),
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await Promise.all(
        notifications.map(n =>
          updateDoc(doc(db, 'guardianNotifications', n.id), {
            active: false,
            deletedAt: serverTimestamp(),
          })
        )
      );
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - timestamp) / 1000);
    if (diff < 60)      return t('gdJustNow');
    if (diff < 3600)    return t('gdMinutesAgo', { count: Math.floor(diff / 60) });
    if (diff < 86400)   return t('gdHoursAgo',   { count: Math.floor(diff / 3600) });
    if (diff < 2592000) return t('gdDaysAgo',    { count: Math.floor(diff / 86400) });
    return timestamp.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'achievement':   return <FaTrophy style={{ color: '#d69e2e' }} />;
      case 'performance':   return <FaExclamationTriangle style={{ color: '#f56565' }} />;
      case 'milestone':     return <FaCheckCircle style={{ color: '#48bb78' }} />;
      case 'goal':          return <FaChartLine style={{ color: '#4facfe' }} />;
      case 'recommendation':return <FaInfoCircle style={{ color: '#667eea' }} />;
      default:              return <FaBell style={{ color: '#a0aec0' }} />;
    }
  };

  const priorityClass = (priority) => {
    switch (priority) {
      case 'high':   return 'gn-item--high';
      case 'medium': return 'gn-item--medium';
      case 'low':    return 'gn-item--low';
      default:       return '';
    }
  };

  const unreadCount       = notifications.filter(n => !n.read).length;
  const highCount         = notifications.filter(n => n.priority === 'high').length;
  const achievementCount  = notifications.filter(n => n.type === 'achievement').length;
  const milestoneCount    = notifications.filter(n => n.type === 'milestone').length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('gdLoadingNotifications')}</span>
          </div>
          <p>{t('gdLoadingNotifications')}</p>
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
            <h1>{t('gdNotificationsTitle')}</h1>
            <p>{t('gdNotificationsSubtitle', { name: childInfo?.name || t('unknown') })}</p>
          </div>
          {message && (
            <div className={`gd-alert gd-alert-${messageType}`} style={{ margin: 0, padding: '0.6rem 1rem' }}>
              {message}
            </div>
          )}
          <div className="gd-header-actions">
            <button className="gd-btn gd-btn-primary" onClick={loadNotifications}>
              <FaSync /> {t('refresh')}
            </button>
            <button
              className="gd-btn gd-btn-outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <FaCheckCircle /> {t('gdMarkAllRead')}
            </button>
            <button
              className="gd-btn gd-btn-outline"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <FaTimes /> {t('gdClearAll')}
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="gn-stats-grid">
          <div className="gn-stat-card">
            <div className="gn-stat-icon gn-stat-icon--danger"><FaBell /></div>
            <div>
              <div className="gn-stat-value">{unreadCount}</div>
              <div className="gn-stat-label">{t('gdUnread')}</div>
            </div>
          </div>
          <div className="gn-stat-card">
            <div className="gn-stat-icon gn-stat-icon--warning"><FaExclamationTriangle /></div>
            <div>
              <div className="gn-stat-value">{highCount}</div>
              <div className="gn-stat-label">{t('gdHighPriority')}</div>
            </div>
          </div>
          <div className="gn-stat-card">
            <div className="gn-stat-icon gn-stat-icon--info"><FaTrophy /></div>
            <div>
              <div className="gn-stat-value">{achievementCount}</div>
              <div className="gn-stat-label">{t('achievements')}</div>
            </div>
          </div>
          <div className="gn-stat-card">
            <div className="gn-stat-icon gn-stat-icon--success"><FaCheckCircle /></div>
            <div>
              <div className="gn-stat-value">{milestoneCount}</div>
              <div className="gn-stat-label">{t('gdMilestones')}</div>
            </div>
          </div>
        </div>

        {/* ── Notifications list ── */}
        <div className="gd-card" style={{ marginBottom: '1.25rem' }}>
          <div className="gd-card-header">
            <FaBell /> {t('gdRecentNotifications')}
          </div>
          <div className="gd-card-body">
            {notifications.length === 0 ? (
              <div className="gn-empty">
                <div className="gn-empty-icon"><FaBell /></div>
                <div className="gn-empty-title">{t('gdNoNotificationsYet')}</div>
                <div className="gn-empty-desc">{t('gdNoNotificationsDesc')}</div>
              </div>
            ) : (
              <div className="gn-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`gn-item ${priorityClass(n.priority)} ${!n.read ? 'gn-item--unread' : ''}`}
                  >
                    <div className="gn-item-icon">{getIcon(n.type)}</div>
                    <div className="gn-item-body">
                      <div className="gn-item-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div className="gn-item-title">{n.title}</div>
                          {n.priority && (
                            <span className={`gn-priority-badge gn-priority-badge--${n.priority}`}>
                              {n.priority}
                            </span>
                          )}
                        </div>
                        {!n.read && <div className="gn-unread-dot" title="Unread" />}
                      </div>
                      <div className="gn-item-message">{n.message}</div>
                      <div className="gn-item-footer">
                        <div className="gn-item-time">
                          <FaClock /> {formatTimeAgo(n.timestamp)}
                        </div>
                        <div className="gn-item-actions">
                          {!n.read && (
                            <button className="gn-btn-read" onClick={() => markAsRead(n.id)}>
                              <FaCheckCircle /> {t('gdMarkRead')}
                            </button>
                          )}
                          <button className="gn-btn-delete" onClick={() => deleteNotification(n.id)}>
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Notification Preferences ── */}
        <div className="gs-grid-2">
          <div className="gd-card">
            <div className="gd-card-header">
              <FaEnvelope /> {t('gdEmailNotifications')}
            </div>
            <div className="gd-card-body">
              <SettingToggle
                id="pref-email-achievements"
                label={t('gdAchievementAlerts')}
                checked={prefEmail.achievements}
                onChange={e => setPrefEmail(p => ({ ...p, achievements: e.target.checked }))}
              />
              <SettingToggle
                id="pref-email-performance"
                label={t('gdPerformanceAlerts')}
                checked={prefEmail.performance}
                onChange={e => setPrefEmail(p => ({ ...p, performance: e.target.checked }))}
              />
              <SettingToggle
                id="pref-email-weekly"
                label={t('gdWeeklyReports')}
                checked={prefEmail.weekly}
                onChange={e => setPrefEmail(p => ({ ...p, weekly: e.target.checked }))}
              />
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-header accent">
              <FaMobile /> {t('gdPushNotifications')}
            </div>
            <div className="gd-card-body">
              <SettingToggle
                id="pref-push-achievements"
                label={t('gdAchievementAlerts')}
                checked={prefPush.achievements}
                onChange={e => setPrefPush(p => ({ ...p, achievements: e.target.checked }))}
              />
              <SettingToggle
                id="pref-push-performance"
                label={t('gdPerformanceAlerts')}
                checked={prefPush.performance}
                onChange={e => setPrefPush(p => ({ ...p, performance: e.target.checked }))}
              />
              <SettingToggle
                id="pref-push-milestones"
                label={t('gdMilestoneCelebrations')}
                checked={prefPush.milestones}
                onChange={e => setPrefPush(p => ({ ...p, milestones: e.target.checked }))}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardianNotifications;
