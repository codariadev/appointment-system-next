import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBW6-d8kHOAdLDd0pnFTvV1RMsD9VIuliE",
    authDomain: "barber-system-90413.firebaseapp.com",
    projectId: "barber-system-90413",
    storageBucket: "barber-system-90413.firebasestorage.app",
    messagingSenderId: "472314925174",
    appId: "1:472314925174:web:8afab6a12e498693714f57"
  };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, collection, getDocs, addDoc, deleteDoc, doc };
