import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDR0cCeXPFZ1InDl3rswgtf7UdpYJZP8Dc",
    authDomain: "mural-do-companheirismo.firebaseapp.com",
    projectId: "mural-do-companheirismo",
    storageBucket: "mural-do-companheirismo.firebasestorage.app",
    messagingSenderId: "227972251511",
    appId: "1:227972251511:web:d5306e2ba44bf73c176b72",
    measurementId: "G-FJFGQFY5YC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db };

