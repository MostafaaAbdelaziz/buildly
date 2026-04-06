// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXtUfmuUpqrFaN49G_NQ9SoXuu-gModcY",
  authDomain: "pm-checking-app.firebaseapp.com",
  projectId: "pm-checking-app",
  storageBucket: "pm-checking-app.firebasestorage.app",
  messagingSenderId: "101927103411",
  appId: "1:101927103411:web:e3f1deaa8762ab9b59b9c6",
  measurementId: "G-JGQ73KRNF3",
  databaseURL: "https://pm-checking-app-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Realtime Database (existing)
export const firebase_auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const firebase_db = getDatabase(app);

// Firestore (for folders, drawings, and other structured data)
export const firebase_fs = getFirestore(app);