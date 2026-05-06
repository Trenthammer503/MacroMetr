import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBt64Wq-2ai4Z51QYDm7HNfFWe4kjKJqJI",
  authDomain: "macrometr-33a1b.firebaseapp.com",
  projectId: "macrometr-33a1b",
  storageBucket: "macrometr-33a1b.firebasestorage.app",
  messagingSenderId: "227054242777",
  appId: "1:227054242777:web:3367190ebcd2e2abc367c8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
