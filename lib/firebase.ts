import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyCTqbD2UA_qVSWu7StraD-LDB9ISMun4eY",
  authDomain: "crtiers-b261b.firebaseapp.com",
  projectId: "crtiers-b261b",
  storageBucket: "crtiers-b261b.firebasestorage.app",
  messagingSenderId: "1093412402955",
  appId: "1:1093412402955:web:995ed68a5d459320dc540e",
  measurementId: "G-Q5BFVS7B99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;