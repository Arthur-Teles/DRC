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
        <div class="card-content">
            <img src="${cardData.imageUrl}" 
                alt="Imagem do card" 
                style="width: 100%; border-radius: 5px; margin-bottom: 10px;">
            <h3 style="margin: 0 0 5px 0;">${cardData.nome}</h3>
            <p style="margin: 0 0 5px 0; color: #555;">Status: ${cardData.status}</p><br></br>
            <p style="margin: 0 0 5px 0; color: #555;"> ${cardData.amizade}</p>
            <p style="margin: 0; font-size: 0.8em; color: #888;">Postado em: ${formattedDate}</p>
        </div>
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

        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
    }
}


// ---------------------------

function encontrarCardPorNome(nomeProcurado) {
    const cards = document.querySelectorAll('.card');

    for (const card of cards) {
        const h3 = card.querySelector('.card-content h3');

        if (h3 && h3.textContent.trim() === nomeProcurado) {
            return card;
        }
    }

    return null;
}

function conectarComSeta(elemento1Id, elemento2Id, pessoaEnvio, pessoaDestino, textoComentario, horarioComentario, connectionId) {
    jsPlumb.ready(function () {
        // Verifica se já existe uma conexão igual
        if (connectionId && document.querySelector(`[connection-id="${connectionId}"]`)) {
            return;
        }

        // Paleta de cores harmoniosas para as setas
        const colors = [
            '#4a90e2', // Azul original
            '#e74c3c', // Vermelho
            '#2ecc71', // Verde
            '#f39c12', // Laranja
            '#9b59b6', // Roxo
            '#1abc9c', // Turquesa
            '#d35400', // Abóbora
            '#3498db', // Azul claro
            '#e84393', // Rosa
            '#00b894'  // Verde água
        ];

        // Seleciona uma cor aleatória da paleta
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const connection = jsPlumb.connect({
            source: elemento1Id,
            target: elemento2Id,
            anchors: ["Bottom", "Top"],
            connector: ["Bezier", { curviness: 100 }],
            paintStyle: {
                stroke: randomColor,
                strokeWidth: 4,
                outlineStroke: 'transparent',
                outlineWidth: 10 // Área de clique maior
            },
            endpoint: "Dot",
            endpointStyle: { 
                fill: randomColor, 
                radius: 5,
                outlineStroke: 'transparent',
                outlineWidth: 8
            },
            overlays: [
                ["Arrow", { 
                    width: 12, 
                    length: 12, 
                    location: 1,
                    foldback: 0.8,
                    direction: 1,
                    paintStyle: {
                        fill: randomColor,
                        stroke: randomColor
                    }
                }],
                ["Label", { 
                    label: "✉",
                    cssClass: "connection-label",
                    location: 0.3
                }]
            ],
            cssClass: "conexao-seta",
            parameters: {
                "connection-id": connectionId,
                "connection-color": randomColor
            },
            hoverPaintStyle: {
                stroke: darkenColor(randomColor, 20),
                strokeWidth: 5
            }
        });

        connection.bind('mouseover', function(conn) {
            conn.setPaintStyle({
                stroke: darkenColor(randomColor, 20),
                strokeWidth: 5
            });
        });

        connection.bind('mouseout', function(conn) {
            conn.setPaintStyle({
                stroke: randomColor,
                strokeWidth: 4
            });
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
            popup.style.border = `2px solid ${randomColor}`;
            popup.style.borderRadius = "8px";
            popup.style.padding = "15px";
            popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            popup.style.maxWidth = "300px";
            popup.style.zIndex = 9999;

            popup.innerHTML = `
                <div style="text-align: right;">
                    <span id="fechar-popup" style="cursor: pointer; font-weight: bold; color: ${randomColor}">✕</span>
                </div>
                <p><strong>De:</strong> ${pessoaEnvio}</p>
                <p><strong>Para:</strong> ${pessoaDestino}</p>
                <div style="margin: 10px 0; padding: 10px; background: ${lightenColor(randomColor, 90)}; border-radius: 6px;">
                    ${textoComentario}
                </div>
                <p style="font-size: 0.8em; color: #666; text-align: right;">${horarioComentario}</p>
            `;

            document.body.appendChild(popup);

            document.getElementById("fechar-popup").addEventListener("click", () => {
                popup.remove();
            });
        });
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255
    ).toString(16).slice(1))}`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return `#${(
        0x1000000 +
        (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
        (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
        (B > 0 ? (B < 255 ? B : 255) : 0)
    ).toString(16).slice(1)}`;
}

async function getComentarios() {
    try {
        const comentariosRef = collection(db, "comentarios");
        const querySnapshot = await getDocs(comentariosRef);

        // Primeiro mapeie todos os cards existentes
        const cardsMap = new Map();
        document.querySelectorAll('.card').forEach(card => {
            const nome = card.querySelector('.card-content h3')?.textContent.trim();
            if (nome) {
                cardsMap.set(nome, card);
                // Define um ID fixo baseado no nome (remove espaços e caracteres especiais)
                card.id = `card-${nome.toLowerCase().replace(/\s+/g, '-')}`;
            }
        });

        // Processa os comentários
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const divEnvio = cardsMap.get(data.pessoaEnvio);
            const divDestino = cardsMap.get(data.passoaDestiono); // Corrigido o typo

            if (!divEnvio || !divDestino) {
                console.warn(`Card não encontrado para: ${!divEnvio ? data.pessoaEnvio : ''} ${!divDestino ? data.passoaDestiono : ''}`);
                return;
            }

            const dataDate = data.enviadoEm.toDate();
            const dataFormatada = dataDate.toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short"
            });

            // Adiciona um identificador único para cada conexão
            const connectionId = `${divEnvio.id}-${divDestino.id}-${data.texto.substring(0, 10)}`;
            
            conectarComSeta(divEnvio.id, divDestino.id, data.pessoaEnvio, data.passoaDestiono, data.texto, dataFormatada, connectionId);
        });
    } catch (error) {
        console.error("Erro ao buscar comentários:", error);
    }
}

window.addEventListener('DOMContentLoaded', getComentarios);

