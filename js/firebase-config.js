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

// ============================================
// USUARIOS DEL SISTEMA
// ============================================
// Cada usuario tiene: nombre para mostrar, username para login, y hash SHA-256 de su contraseña.
//
// Para agregar un nuevo usuario, genera el hash en la consola del navegador:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('CONTRASENA')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))

const USERS = [
    {
        displayName: "Fran",
        username: "fran",
        passwordHash: "6487cd4b9c7bef8e1b25608d4b833726299c8e4fb59713ee9d21ead1e1958865"
        // contraseña: fran123
    },
    {
        displayName: "Iara",
        username: "iara",
        passwordHash: "38ca87413835fbf3122c4b48b30368bfa0792c08cef9f95405726b7588274674"
        // contraseña: iara123
    },
    {
        displayName: "Anto",
        username: "anto",
        passwordHash: "d00d07fb1919f5a6a92f2e7e0267ac57f3984006778a95ebe59921ff5aa3028c"
        // contraseña: anto123
    },
    {
        displayName: "Agus",
        username: "agus",
        passwordHash: "1baedd25059490937a8f7a52dbaf5a7c168bc49f5bac0d7bc48bd6b58a84a421"
        // contraseña: agus123
    },
    {
        displayName: "Anto2",
        username: "anto2",
        passwordHash: "f59f89efaf16782e4856ac49cc4ed2009390227530c019aad06eef40a2965873"
        // contraseña: anto2123
    }
];
