import { db } from "./inicializar.js";
import { getUserUid } from './app.js';
import { collection, getDocs, query, orderBy, where, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
const gallery = document.getElementById('gallery');

async function loadCards() {
    try {
        const cardsQuery = query(
            collection(db, "cards"),
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(cardsQuery);
        
        gallery.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const cardData = doc.data();
            createCardElement(cardData);
        });
        
    } catch (error) {
        console.error("Erro ao carregar cards:", error);
        gallery.innerHTML = '<p>Erro ao carregar os cards. Recarregue a página.</p>';
    }
}

function createCardElement(cardData) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.style.border = '1px solid #ddd';
    cardElement.style.borderRadius = '8px';
    cardElement.style.padding = '15px';
    cardElement.style.margin = '10px';
    cardElement.style.maxWidth = '300px';
    cardElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    const createdAt = cardData.createdAt.toDate();
    const formattedDate = createdAt.toLocaleDateString('pt-BR');
    
    cardElement.innerHTML = `
        <img src="${cardData.imageUrl}" 
             alt="Imagem do card" 
             style="width: 100%; border-radius: 5px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0;">${cardData.nome}</h3>
        <p style="margin: 0 0 5px 0; color: #555;">Status: ${cardData.status}</p><br></br>
        <p style="margin: 0 0 5px 0; color: #555;"> ${cardData.amizade}</p>
        <p style="margin: 0; font-size: 0.8em; color: #888;">Postado em: ${formattedDate}</p>
    `;
    
    gallery.appendChild(cardElement);
}

window.addEventListener('DOMContentLoaded', loadCards);


// ------------------------

const comentar = document.getElementById("comentar");
const comentarP = document.querySelector("#comentar p");
const caixaComentar = document.getElementById("caixa-comentar");
const fecharComentar = document.getElementById("fechar-comentar");

comentar.addEventListener("click", () => {
    caixaComentar.style.display = "block";
});

comentarP.addEventListener("click", () => {
    caixaComentar.style.display = "block";
});

fecharComentar.addEventListener("click", () => {
    caixaComentar.style.display = "none";
});

async function getTodosOsNomes() {
    try {
        const cardsRef = collection(db, "cards");
        const querySnapshot = await getDocs(cardsRef);

        const nomes = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nome && data.userId !== getUserUid()) {
                nomes.push(data.nome);
            }
        });

        return nomes;
    } catch (error) {
        console.error("Erro ao buscar nomes:", error);
        return [];
    }
}

const selectPessoas = document.getElementById("input-comentario-pessoa");

async function preencherSelectComNomes() {
    
    const nomes = await getTodosOsNomes();

    nomes.forEach((nome) => {
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        selectPessoas.appendChild(option);
    });
}

window.addEventListener('DOMContentLoaded', preencherSelectComNomes);

async function getNomePorUserId() {
    try {
        const cardsRef = collection(db, "cards");
        const q = query(cardsRef, where("userId", "==", getUserUid()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]; // pega o primeiro que encontrar
            const data = doc.data();
            return data.nome || null;
        } else {
            console.warn("Nenhum card encontrado com esse userId.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar nome por userId:", error);
        return null;
    }
}

const confirmaComentario = document.getElementById("finalizar-comentario");

confirmaComentario.addEventListener("click", async () => {

    const pessoaDestino = document.getElementById("input-comentario-pessoa").value;
    const textoComentario = document.getElementById("input-comentario-texto").value;
    const pessoaEnvio = await getNomePorUserId();

    adicionarComentario(pessoaEnvio, pessoaDestino, textoComentario);

    caixaComentar.style.display = "none";
});

async function adicionarComentario(envio, destino, texto) {
    try {
        const novoComentario = {
            pessoaEnvio: envio,
            passoaDestiono: destino,
            texto: texto,
            enviadoEm: new Date(),
        };

        const docRef = await addDoc(collection(db, "comentarios"), novoComentario);
        console.log("Comentário adicionado com ID:", docRef.id);
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
    }
}


// ---------------------------

function encontrarCardPorNome(nomeProcurado) {
    const cards = document.querySelectorAll('.card');

    for (const card of cards) {
        const h3 = card.querySelector(':scope > h3');

        if (h3 && h3.textContent.trim() === nomeProcurado) {
            return card;
        }
    }

    return null;
}

function conectarComSeta(elemento1Id, elemento2Id, pessoaEnvio, pessoaDestino, textoComentario, horarioComentario) {
    jsPlumb.ready(function () {
        const connection = jsPlumb.connect({ // <-- Aqui estava o erro
            source: elemento1Id,
            target: elemento2Id,
            anchors: ["Bottom", "Top"],
            connector: ["Bezier", { curviness: 100 }],
            paintStyle: {
                stroke: "#4a90e2",
                strokeWidth: 4
            },
            endpoint: "Dot",
            endpointStyle: { fill: "#4a90e2", radius: 4 },
            overlays: [
                ["Arrow", { width: 10, length: 10, location: 1 }]
            ],
            cssClass: "minha-seta"
        });

        connection.bind("click", function (conn, originalEvent) {
            // Remove qualquer popup anterior
            const anterior = document.getElementById("comentario-popup");
            if (anterior) anterior.remove();

            const popup = document.createElement("div");
            popup.id = "comentario-popup";
            popup.style.position = "absolute";
            popup.style.top = `${originalEvent.clientY + window.scrollY}px`;
            popup.style.left = `${originalEvent.clientX + window.scrollX}px`;
            popup.style.background = "#fff";
            popup.style.border = "1px solid #ccc";
            popup.style.borderRadius = "8px";
            popup.style.padding = "15px";
            popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
            popup.style.maxWidth = "300px";
            popup.style.zIndex = 9999;

            popup.innerHTML = `
                <div style="text-align: right;">
                    <span id="fechar-popup" style="cursor: pointer; font-weight: bold;">✕</span>
                </div>
                <p><strong>De:</strong> ${pessoaEnvio}</p>
                <p><strong>Para:</strong> ${pessoaDestino}</p>
                <p style="margin-top: 10px;">${textoComentario}</p><br></br>
                <p style="font-size: 0.8em; color: #666;">${horarioComentario}</p>
            `;

            document.body.appendChild(popup);

            document.getElementById("fechar-popup").addEventListener("click", () => {
                popup.remove();
            });
        });
    });
}

async function getComentarios() {
    try {
        const comentariosRef = collection(db, "comentarios");
        const querySnapshot = await getDocs(comentariosRef);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const divEnvio = encontrarCardPorNome(data.pessoaEnvio);
            const divDestino = encontrarCardPorNome(data.passoaDestiono); // ta com erro de escrita!!! vou manter para funcionar

            divEnvio.id = data.pessoaEnvio + (new Date()).toString();
            divDestino.id = data.pessoaDestino + (new Date()).toString();

            const dataDate = data.enviadoEm.toDate();

            const dataFormatada = dataDate.toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short"
            });

            conectarComSeta(divEnvio.id, divDestino.id, data.pessoaEnvio, data.passoaDestiono, data.texto, dataFormatada);
        });
    } catch (error) {
        console.error("Erro ao buscar comentários:", error);
    }
}

window.addEventListener('DOMContentLoaded', getComentarios);

