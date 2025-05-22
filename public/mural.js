import { auth } from "./inicializar.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const voltarLogin = document.getElementById('voltar');

voltarLogin.addEventListener("click", () => {

    console.log("voltou");
    signOut(auth);
    window.location.href = "index.html";
})