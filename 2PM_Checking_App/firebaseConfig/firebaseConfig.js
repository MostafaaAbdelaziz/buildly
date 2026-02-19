// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
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
  measurementId: "G-JGQ73KRNF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebase_auth = getAuth(app);
export const firebase_db = getDatabase(app);