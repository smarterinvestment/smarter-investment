// firebase-init.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBT3UJTHLuBQaB9kK0539-acw8ertf__vY",
  authDomain: "smarter-investment.firebaseapp.com",
  projectId: "smarter-investment",
  storageBucket: "smarter-investment.firebasestorage.app",
  messagingSenderId: "1037439323005",
  appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
  measurementId: "G-DQKR8KNV2V"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

console.log("Firebase v9 inicializado correctamente (db, auth, analytics listos)");