console.log("Domínio atual:", window.location.hostname);

import { auth } from "./inicializar.js";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, browserPopupRedirectResolver } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const secaoLogado = document.getElementById('userLogado');
const secaoDeslogado = document.getElementById('userDeslogado');

const botaoLogar = document.getElementById('botaoLogar');
const botaoDeslogar = document.getElementById('botaoDeslogar');

const infosUsuario = document.getElementById('infosUser');

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

botaoLogar.onclick = () => signInWithPopup(auth, provider, browserPopupRedirectResolver);

botaoDeslogar.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        secaoLogado.hidden = false;
        secaoDeslogado.hidden = true;
        infosUsuario.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;

        window.location.href = "mural.html";
    } else {
        // Usuário deslogado
        secaoLogado.hidden = true;
        secaoDeslogado.hidden = false;
        infosUsuario.innerHTML = '';
    }
});


