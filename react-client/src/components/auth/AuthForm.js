// src/components/AuthForm.js
import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

function AuthForm() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Logged in successfully');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert('Account created successfully');
            }
        } catch (error) {
            console.error("Error in authentication: ", error.message);
        }
    };

    return (
        <div>
            <h2>{isLogin ? t('signIn') : t('signUp')}</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmail')}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
            />
            <button onClick={handleAuth}>
                {isLogin ? t('signIn') : t('signUp')}
            </button>
            <p onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? t('dontHaveAccount') + ' ' + t('signUp') : t('alreadyHaveAccount') + ' ' + t('signIn')}
            </p>
        </div>
    );
}

export default AuthForm;
