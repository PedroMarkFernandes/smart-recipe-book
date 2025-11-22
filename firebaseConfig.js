import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE KEYS
const firebaseConfig = {
  apiKey: "AIzaSyANxiOMiZmb5YzFSbTyu_PRJmTnSHDwMXQ",
  authDomain: "recipeapp-6a14c.firebaseapp.com",
  projectId: "recipeapp-6a14c",
  storageBucket: "recipeapp-6a14c.firebasestorage.app",
  messagingSenderId: "162735172686",
  appId: "1:162735172686:web:91c36b0d41c97f216b671f"
};

const app = initializeApp(firebaseConfig);

// This saves the login state to the phone so users stay logged in
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
