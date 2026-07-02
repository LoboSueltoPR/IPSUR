// ============================================
// CONFIGURACION DE FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCsfUga9tqGHgY_tOKuUocvIn7imx64K4M",
  authDomain: "ipsur-c3c13.firebaseapp.com",
  projectId: "ipsur-c3c13",
  storageBucket: "ipsur-c3c13.firebasestorage.app",
  messagingSenderId: "783782032122",
  appId: "1:783782032122:web:2ea258d0da6406f0934f43",
  measurementId: "G-8JHRPSH4TW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================
// USUARIOS DEL SISTEMA
// ============================================
// Para agregar un nuevo usuario, genera el hash en la consola del navegador:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('CONTRASENA')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))

const USERS = [
    {
        displayName: "Fran",
        username: "fran",
        passwordHash: "6487cd4b9c7bef8e1b25608d4b833726299c8e4fb59713ee9d21ead1e1958865"
    },
    {
        displayName: "Iara",
        username: "iara",
        passwordHash: "38ca87413835fbf3122c4b48b30368bfa0792c08cef9f95405726b7588274674"
    },
    {
        displayName: "Anto",
        username: "anto",
        passwordHash: "d00d07fb1919f5a6a92f2e7e0267ac57f3984006778a95ebe59921ff5aa3028c"
    },
    {
        displayName: "Agus",
        username: "agus",
        passwordHash: "1baedd25059490937a8f7a52dbaf5a7c168bc49f5bac0d7bc48bd6b58a84a421"
    },
    {
        displayName: "Anto2",
        username: "anto2",
        passwordHash: "f59f89efaf16782e4856ac49cc4ed2009390227530c019aad06eef40a2965873"
    }
];
