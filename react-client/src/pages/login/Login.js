import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import './login.css';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            let message = t('errorDuringSignIn');
            if (error.code === 'auth/user-not-found') {
                message = t('noAccountFound');
            } else if (error.code === 'auth/wrong-password') {
                message = t('incorrectPassword');
            } else if (error.code === 'auth/invalid-email') {
                message = t('invalidEmail');
            } else if (error.code === 'auth/too-many-requests') {
                message = t('tooManyRequests');
            }
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setErrorMessage('');
        
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/');
        } catch (error) {
            let message = t('errorDuringGoogleSignIn');
            if (error.code === 'auth/popup-closed-by-user') {
                message = t('signInCancelled');
            } else if (error.code === 'auth/popup-blocked') {
                message = t('popupBlocked');
            }
            setErrorMessage(message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-background-overlay"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>
            
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon">
                            <FaSignInAlt />
                        </div>
                        <h1>{t('welcomeBack')}</h1>
                        <p>{t('signInToContinue')}</p>
                    </div>
                </div>

                <form onSubmit={handleSignIn} className="auth-form">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                placeholder={t('enterEmail')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('enterPassword')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="error-message">
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            t('signIn')
                        )}
                    </button>

                    <div className="divider">
                        <span>{t('or')}</span>
                    </div>

                    <button
                        type="button"
                        className="auth-button google"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <>
                                <FaGoogle />
                                {t('continueWithGoogle')}
                            </>
                        )}
                    </button>

                    <div className="auth-footer">
                        <p>
                            {t('dontHaveAccount')}{' '}
                            <Link to="/register" className="auth-link">
                                {t('createOneHere')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}