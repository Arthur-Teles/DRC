import { auth, db } from "./inicializar.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const voltarLogin = document.getElementById('voltar');

voltarLogin.addEventListener("click", () => {
    signOut(auth);
    window.location.href = "index.html";
});

const enviarCard = document.getElementById("enviar-card");
const nome = document.getElementById("input-nome");
const idade = document.getElementById("input-idade");
const amizade = document.getElementById("input-amizade");

async function adicionarCard() {
  try {
    const novoCard = {
      nome: nome,
      idade: idade,
      amizade: amizade
    };

    const docRef = await addDoc(collection(db, "card"), novoCard);
    
    console.log("Documento adicionado com ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar documento: ", error);
    throw error;
  }
}

 enviarCard.addEventListener('click', () => {

    if (nome != "" && idade != "" && amizade != "") {

        adicionarCard().then(docId => {
            console.log("Card criado com sucesso! ID:", docId);
        })
        .catch(error => {
            console.error("Falha ao criar card:", error);
        });
    }
});