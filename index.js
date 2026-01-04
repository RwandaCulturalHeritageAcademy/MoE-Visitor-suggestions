// Firebase Configuration
// Replace these with your Firebase project credentials from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBPyt696aV_XODckSUYtrJoEvaApZo6nDQ",
    authDomain: "museum-feedback.firebaseapp.com",
    projectId: "museum-feedback",
    storageBucket: "museum-feedback.firebasestorage.app",
    messagingSenderId: "1041526582800",
    appId: "1:1041526582800:web:6f578a9f1eebf146e16495",
    measurementId: "G-BC4D7MHXWM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication state listener
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user);
    if (window.handleAuthChange) {
        window.handleAuthChange(user);
    }
});
