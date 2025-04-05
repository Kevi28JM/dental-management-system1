// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these with your own Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyCrNotgy0EstFcPHseWSOJSq6FNiK5JcHo",
  authDomain: "appointment-system-489eb.firebaseapp.com",
  projectId: "appointment-system-489eb",
  storageBucket: "appointment-system-489eb.firebasestorage.app",
  messagingSenderId: "102070919320",
  appId: "1:102070919320:web:aa55b86158a94b98d970ed",
  measurementId: "G-97JNLY5T7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);// Create Firestore instance

export default db;
