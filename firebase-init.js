// Firebase Configuration
// IMPORTANTE: Reemplazar con tus propias credenciales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxOHfgTdRfOU4i-D7aMnJ2cAk6LrT6Tbk",
    authDomain: "smarter-investment.firebaseapp.com",
    projectId: "smarter-investment",
    storageBucket: "smarter-investment.firebasestorage.app",
    messagingSenderId: "1037439323005",
    appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
}
