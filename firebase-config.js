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

// Initialize services and export them. Be defensive and log status for debugging.
let auth = null;
let db = null;

try {
    if (typeof firebase !== 'undefined') {
        auth = firebase.auth ? firebase.auth() : null;
        if (firebase.firestore) {
            db = firebase.firestore();
        } else {
            console.warn('firebase.firestore is not available after loading compat script.');
        }
    } else {
        console.error('firebase global is not available.');
    }
} catch (err) {
    console.error('Error initializing Firebase services:', err);
}

// Authentication state listener
if (auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        if (window.handleAuthChange) {
            window.handleAuthChange(user);
        }
    });
} else {
    console.warn('Auth not initialized or onAuthStateChanged unavailable. auth=', auth);
}

// Expose firebase services to the global scope to avoid "auth/db is not defined" errors
// Export indicators and services for other scripts to use.
window.firebase = window.firebase || (typeof firebase !== 'undefined' ? firebase : null);
window.auth = auth;
if (db) {
    window.db = db;
    console.log('Firebase initialized. auth and db exported to window.');
} else {
    window.db = null;
    console.warn('Firestore was not initialized and window.db is null.');
}

// Mark that the config script ran
window._firebaseConfigLoaded = true;
