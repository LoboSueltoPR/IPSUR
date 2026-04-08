// === Panel de Administracion ===

const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const noteForm = document.getElementById('note-form');
const imageInput = document.getElementById('note-image');
const imagePreview = document.getElementById('image-preview');

// Verificar si ya hay sesion
if (sessionStorage.getItem('ipsur_admin') === 'true') {
    showAdminPanel();
}

// === Login ===
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password-input').value;
    const hash = await hashPassword(password);

    if (hash === ADMIN_PASSWORD_HASH) {
        sessionStorage.setItem('ipsur_admin', 'true');
        loginError.style.display = 'none';
        showAdminPanel();
    } else {
        loginError.style.display = 'block';
    }
});

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadAdminNotes();
}

function logout() {
    sessionStorage.removeItem('ipsur_admin');
    loginScreen.style.display = 'block';
    adminPanel.style.display = 'none';
    document.getElementById('password-input').value = '';
}

// === Preview de imagen ===
let imageBase64 = null;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limitar a 800KB para no exceder el limite de Firestore (1MB por documento)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Maximo 5MB (se comprimira automaticamente).');
        imageInput.value = '';
        return;
    }

    compressAndPreview(file);
});

function compressAndPreview(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            // Comprimir imagen usando canvas
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = (height * MAX_WIDTH) / width;
                width = MAX_WIDTH;
            }
            if (height > MAX_HEIGHT) {
                width = (width * MAX_HEIGHT) / height;
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a JPEG con calidad 0.7 para reducir tamaño
            imageBase64 = canvas.toDataURL('image/jpeg', 0.7);

            imagePreview.innerHTML = `<img src="${imageBase64}" alt="Preview">`;

            // Verificar que no exceda ~900KB para Firestore
            const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024);
            if (sizeKB > 900) {
                // Recomprimir con menor calidad
                imageBase64 = canvas.toDataURL('image/jpeg', 0.4);
            }
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

// === Publicar nota ===
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('note-title').value.trim();
    const text = document.getElementById('note-text').value.trim();

    if (!title || !text || !imageBase64) {
        alert('Completa todos los campos incluyendo la imagen');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    submitBtn.disabled = true;
    progressDiv.style.display = 'block';
    progressFill.style.width = '50%';
    progressText.textContent = 'Guardando nota...';

    try {
        await db.collection('notes').add({
            title: title,
            text: text,
            imageUrl: imageBase64,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        progressFill.style.width = '100%';
        progressText.textContent = 'Publicada!';

        // Limpiar formulario
        setTimeout(() => {
            noteForm.reset();
            imagePreview.innerHTML = '';
            imageBase64 = null;
            progressDiv.style.display = 'none';
            progressFill.style.width = '0%';
            submitBtn.disabled = false;
        }, 1000);

        alert('Nota publicada exitosamente!');
        loadAdminNotes();

    } catch (error) {
        console.error('Error publicando nota:', error);
        alert('Error al publicar la nota: ' + error.message);
        submitBtn.disabled = false;
        progressDiv.style.display = 'none';
    }
});

// === Cargar notas en admin ===
async function loadAdminNotes() {
    const list = document.getElementById('admin-notes-list');
    list.innerHTML = '<p style="color:#666;">Cargando...</p>';

    try {
        const snapshot = await db.collection('notes')
            .orderBy('createdAt', 'desc')
            .get();

        list.innerHTML = '';

        if (snapshot.empty) {
            list.innerHTML = '<p style="color:#666;">No hay notas publicadas.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const note = doc.data();
            const item = document.createElement('div');
            item.className = 'admin-note-item';

            const date = note.createdAt ? formatDate(note.createdAt.toDate()) : 'Sin fecha';

            item.innerHTML = `
                <img src="${note.imageUrl}" alt="${escapeHtml(note.title)}">
                <div class="admin-note-info">
                    <h4>${escapeHtml(note.title)}</h4>
                    <span>${date}</span>
                </div>
                <button class="btn-danger" onclick="deleteNote('${doc.id}')">Eliminar</button>
            `;

            list.appendChild(item);
        });
    } catch (error) {
        list.innerHTML = '<p style="color:#ff6b6b;">Error al cargar notas.</p>';
        console.error('Error:', error);
    }
}

// === Eliminar nota ===
async function deleteNote(id) {
    if (!confirm('¿Estas seguro de que quieres eliminar esta nota?')) return;

    try {
        await db.collection('notes').doc(id).delete();
        loadAdminNotes();
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
}

// === Utilidades ===

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
