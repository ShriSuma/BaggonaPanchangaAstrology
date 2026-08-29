import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyC6PravpaRe4XLu3LYFV4fXx-AP3-1EES4",
  authDomain: "baggona-panchanga.firebaseapp.com",
  projectId: "baggona-panchanga",
  storageBucket: "baggona-panchanga.firebasestorage.app",
  messagingSenderId: "762321047118",
  appId: "1:762321047118:web:58b64e84873db0ff21bd1f",
  measurementId: "G-X43EV2ZZTV"
};

// Singleton Firebase initialization
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestore: Firestore = getFirestore(app);
export const firebaseAuth: Auth = getAuth(app);
