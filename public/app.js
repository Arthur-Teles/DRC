console.log("Domínio atual:", window.location.hostname);

import { auth, db } from "./inicializar.js";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, browserPopupRedirectResolver } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const secaoLogado = document.getElementById('userLogado');
const secaoDeslogado = document.getElementById('userDeslogado');

const botaoLogar = document.getElementById('botaoLogar');
const botaoDeslogar = document.getElementById('botaoDeslogar');

const infosUsuario = document.getElementById('infosUser');

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

if (botaoLogar) {
  botaoLogar.onclick = () => signInWithPopup(auth, provider, browserPopupRedirectResolver);
}

if (botaoDeslogar) {
    botaoDeslogar.onclick = () => signOut(auth);
}

let userUid = null;

onAuthStateChanged(auth, async (user) => {
    
    async function verificarCard() {
        try {
            const cardsRef = collection(db, "cards");
            const q = query(cardsRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            return !querySnapshot.empty; // true se já existe, false se não
        } catch (error) {
            console.error("Erro ao verificar existência do card:", error);
            throw error;
        }
    }
    
    if (user) {
        if (secaoLogado) secaoLogado.hidden = false;
        if (secaoDeslogado) secaoDeslogado.hidden = true;
        if (infosUsuario) {
            infosUsuario.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
        }

        userUid = user.uid;

        const existeCard = await verificarCard();

        if (existeCard) {
            if (window.location.pathname !== "/mural.html") {
                window.location.href = "mural.html";
            }
        }
        else {
            if (window.location.pathname !== "/novoUser.html") {
                window.location.href = "novoUser.html";
            }
        }

    } else {
        if (secaoLogado) secaoLogado.hidden = true;
        if (secaoDeslogado) secaoDeslogado.hidden = false;
        if (infosUsuario) infosUsuario.innerHTML = '';
        userUid = null;
    }
});

function getUserUid() {
    return userUid;
}

export { getUserUid };


