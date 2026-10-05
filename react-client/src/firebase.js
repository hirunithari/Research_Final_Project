// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkHwseUuetlWoem_GWE7nGHH6Q5sEh3fA",
    authDomain: "silent-scholars-a24e8.firebaseapp.com",
    projectId: "silent-scholars-a24e8",
    storageBucket: "silent-scholars-a24e8.firebasestorage.app",
    messagingSenderId: "113429209808",
    appId: "1:113429209808:web:d1bcfa8e35e75ddfdb74d5",
    measurementId: "G-F32HG3RSBP"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Initialize Firestore


