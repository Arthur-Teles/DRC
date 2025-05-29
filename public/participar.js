import { db, storage } from "./inicializar.js";
import { getUserUid } from './app.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const enviarCard = document.getElementById("enviar-card");
const imageUpload = document.getElementById('input-foto');

if (enviarCard) {
    enviarCard.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        const nome = document.getElementById("input-nome").value;
        const status = document.getElementById("input-status").value;
        const amizade = document.getElementById("input-amizade").value;

        // Validação básica
        if (!nome || !status || !amizade || !file) {
            alert('Por favor, preencha todos os campos e selecione uma imagem!');
            return;
        }

        try {
            // 1. Upload da imagem para o Storage
            const storageRef = ref(storage, `cards/${getUserUid()}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Salvar dados no Firestore
            const cardData = {
                nome: nome,
                status: status,
                amizade: amizade,
                userId: getUserUid(),
                imageUrl: downloadURL,
                createdAt: new Date()
            };

            await addDoc(collection(db, "cards"), cardData);

            imageUpload.value = '';
            document.getElementById("input-nome").value = '';
            document.getElementById("input-status").value = 'dmativo';
            document.getElementById("input-amizade").value = '';

            window.location.href = "mural.html";

        } catch (error) {
            console.error("Erro:", error);
            alert('Erro ao criar card: ' + error.message);
        }
    });
}