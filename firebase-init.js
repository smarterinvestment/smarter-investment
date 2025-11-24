// Firebase Configuration
// IMPORTANTE: Reemplazar con tus propias credenciales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxOHfgTdRfOU4i-D7aMnJ2cAk6LrT6Tbk",
    authDomain: "smarter-investment-777f5.firebaseapp.com",
    projectId: "smarter-investment-777f5",
    storageBucket: "smarter-investment-777f5.appspot.com",
    messagingSenderId: "562663698989",
    appId: "1:562663698989:web:a64e1e5a3f8e0c8e1f3e0c"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
}
