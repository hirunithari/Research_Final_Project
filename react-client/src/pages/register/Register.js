import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaUserPlus } from 'react-icons/fa';
import './register.css';

const Register = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            setIsLoading(true);
            setErrorMessage('');
            
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    name: name,
                    email: email,
                    createdAt: new Date(),
                    grade: 'Not specified',
                    avatar: '/images/default-avatar.jpg'
                });

                navigate('/');
            } catch (error) {
                let message = t('errorDuringRegistration');
                if (error.code === 'auth/email-already-in-use') {
                    message = t('accountExists');
                } else if (error.code === 'auth/weak-password') {
                    message = t('weakPassword');
                } else if (error.code === 'auth/invalid-email') {
                    message = t('invalidEmail');
                } else if (error.code === 'auth/operation-not-allowed') {
                    message = t('operationNotAllowed');
                }
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        },
        [email, password, name, navigate, t]
    );

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        setErrorMessage('');
        
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists in our database
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                name: user.displayName || 'User',
                email: user.email,
                createdAt: new Date(),
                grade: 'Not specified',
                avatar: user.photoURL || '/images/default-avatar.jpg'
            }, { merge: true }); // merge: true will update existing data instead of overwriting

            navigate('/');
        } catch (error) {
            let message = t('errorDuringGoogleSignUp');
            if (error.code === 'auth/popup-closed-by-user') {
                message = t('signUpCancelled');
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
                            <FaUserPlus />
                        </div>
                        <h1>{t('createAccount')}</h1>
                        <p>{t('joinUsAndStart')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder={t('enterFullName')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

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
                                placeholder={t('createPassword')}
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
                            t('createAccount')
                        )}
                    </button>

                    <div className="divider">
                        <span>{t('or')}</span>
                    </div>

                    <button
                        type="button"
                        className="auth-button google"
                        onClick={handleGoogleSignUp}
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
                            {t('alreadyHaveAccount')}{' '}
                            <Link to="/login" className="auth-link">
                                {t('signInHere')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;