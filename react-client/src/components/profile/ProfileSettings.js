import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../AuthProvider';
import { useTranslation } from 'react-i18next';
import { FaUser, FaGraduationCap, FaImage, FaSave, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './profile-settings.css';

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    grade: '',
    avatar: '/images/default-avatar.jpg'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          name: userData.name || '',
          grade: userData.grade || '',
          avatar: userData.avatar || '/images/default-avatar.jpg'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage(t('errorLoadingProfile'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: profile.name,
        grade: profile.grade,
        avatar: profile.avatar
      });
      showMessage(t('profileUpdatedSuccess'), 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage(t('errorUpdatingProfile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-background">
          <div className="profile-background-overlay"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="profile-card">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{t('loadingProfile')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-background">
        <div className="profile-background-overlay"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={profile.avatar} 
              alt="Profile" 
              onError={(e) => {
                e.target.src = '/images/default-avatar.jpg';
              }}
            />
            <div className="avatar-overlay">
              <FaUser />
            </div>
          </div>
          <h1>{t('profileSettings')}</h1>
          <p>{t('updatePersonalInfo')}</p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            <div className="message-icon">
              {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            </div>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder={t('enterFullName')}
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                className="profile-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaGraduationCap className="input-icon" />
              <select
                name="grade"
                value={profile.grade}
                onChange={handleInputChange}
                className="profile-input"
              >
                <option value="">{t('selectGradeLevel')}</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="1st Grade">1st Grade</option>
                <option value="2nd Grade">2nd Grade</option>
                <option value="3rd Grade">3rd Grade</option>
                <option value="4th Grade">4th Grade</option>
                <option value="5th Grade">5th Grade</option>
                <option value="6th Grade">6th Grade</option>
                <option value="7th Grade">7th Grade</option>
                <option value="8th Grade">8th Grade</option>
                <option value="High School">High School</option>
                <option value="Adult">Adult</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaImage className="input-icon" />
              <input
                type="url"
                placeholder={t('enterAvatarUrl')}
                name="avatar"
                value={profile.avatar}
                onChange={handleInputChange}
                className="profile-input"
              />
            </div>
            <div className="input-help">
              {t('leaveEmptyForDefault')}
            </div>
          </div>

          <button 
            type="submit" 
            className="profile-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="spinner" />
                {t('savingChanges')}
              </>
            ) : (
              <>
                <FaSave />
                {t('saveChanges')}
              </>
            )}
          </button>
        </form>

        <div className="profile-footer">
          <div className="user-info">
            <p><strong>{t('email')}:</strong> {currentUser?.email}</p>
            <p><strong>{t('accountCreated')}:</strong> {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : t('unknown')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
