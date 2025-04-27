// backend/firebase.js

const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json"); // 🔹 Path to your JSON key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore(); // 🔥 Initialize Firestore

module.exports = firestore; // 📦 Export to use in routes
