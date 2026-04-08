// ============================================
// CONFIGURACION DE FIREBASE
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyDJr8BijnqsJFkFqPx0VU0w-Mh5sZH9SZg",
    authDomain: "ipsur-3e329.firebaseapp.com",
    projectId: "ipsur-3e329",
    storageBucket: "ipsur-3e329.firebasestorage.app",
    messagingSenderId: "185359250541",
    appId: "1:185359250541:web:0cd99c94ad4ecb80dc7b64"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Contrasena del panel admin (hash SHA-256)
// Por defecto: "admin123"
// Para cambiarla, ejecuta en consola del navegador:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('TU_CONTRASENA')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
const ADMIN_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
