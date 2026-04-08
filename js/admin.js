// === Panel de Administracion con Usuarios y Editor Enriquecido ===

const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const noteForm = document.getElementById('note-form');
const imageInput = document.getElementById('note-image');
const imagePreview = document.getElementById('image-preview');
const userDisplay = document.getElementById('user-display');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const imageHint = document.getElementById('image-hint');

let currentUser = null;
let imageBase64 = null;
let editingNoteId = null;
let editingImageUrl = null;
let quill = null;

// === Inicializar Editor Quill ===
function initQuill() {
    if (quill) return;
    quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Escribe el contenido de la nota aqui...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        }
    });
}

// === Verificar sesion existente ===
const savedUser = sessionStorage.getItem('ipsur_user');
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showAdminPanel();
}

// === Login ===
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username-input').value.trim().toLowerCase();
    const password = document.getElementById('password-input').value;
    const hash = await hashPassword(password);

    const user = USERS.find(u => u.username === username && u.passwordHash === hash);

    if (user) {
        currentUser = user;
        sessionStorage.setItem('ipsur_user', JSON.stringify(user));
        loginError.style.display = 'none';
        showAdminPanel();
    } else {
        loginError.style.display = 'block';
    }
});

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    userDisplay.style.display = 'inline-block';
    userDisplay.textContent = currentUser.displayName;
    initQuill();
    loadAdminNotes();
}

function logout() {
    sessionStorage.removeItem('ipsur_user');
    currentUser = null;
    loginScreen.style.display = 'block';
    adminPanel.style.display = 'none';
    userDisplay.style.display = 'none';
    document.getElementById('username-input').value = '';
    document.getElementById('password-input').value = '';
    cancelEdit();
}

// === Preview de imagen ===
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Maximo 5MB.');
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

            imageBase64 = canvas.toDataURL('image/jpeg', 0.7);
            imagePreview.innerHTML = `<img src="${imageBase64}" alt="Preview">`;

            const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024);
            if (sizeKB > 900) {
                imageBase64 = canvas.toDataURL('image/jpeg', 0.4);
            }
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

// === Publicar / Editar nota ===
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('note-title').value.trim();
    const htmlContent = quill.root.innerHTML.trim();

    if (!title || !htmlContent || htmlContent === '<p><br></p>') {
        alert('Completa el titulo y el contenido');
        return;
    }

    // Si es nota nueva, la imagen es obligatoria
    if (!editingNoteId && !imageBase64) {
        alert('Selecciona una imagen para la nota');
        return;
    }

    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    submitBtn.disabled = true;
    progressDiv.style.display = 'block';
    progressFill.style.width = '50%';
    progressText.textContent = editingNoteId ? 'Actualizando nota...' : 'Guardando nota...';

    try {
        const noteData = {
            title: title,
            text: htmlContent,
            author: currentUser.username,
            authorName: currentUser.displayName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Solo actualizar imagen si se subio una nueva
        if (imageBase64) {
            noteData.imageUrl = imageBase64;
        }

        if (editingNoteId) {
            // Editar nota existente
            await db.collection('notes').doc(editingNoteId).update(noteData);
            progressText.textContent = 'Actualizada!';
        } else {
            // Crear nota nueva
            noteData.imageUrl = imageBase64;
            noteData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('notes').add(noteData);
            progressText.textContent = 'Publicada!';
        }

        progressFill.style.width = '100%';

        setTimeout(() => {
            resetForm();
            progressDiv.style.display = 'none';
            progressFill.style.width = '0%';
            submitBtn.disabled = false;
        }, 1000);

        alert(editingNoteId ? 'Nota actualizada!' : 'Nota publicada!');
        cancelEdit();
        loadAdminNotes();

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
        submitBtn.disabled = false;
        progressDiv.style.display = 'none';
    }
});

// === Modo edicion ===
function startEdit(id, note) {
    editingNoteId = id;
    editingImageUrl = note.imageUrl;

    formTitle.textContent = 'Editando Nota';
    submitBtn.textContent = 'Guardar Cambios';
    cancelEditBtn.style.display = 'inline-block';
    imageHint.style.display = 'block';
    imageInput.removeAttribute('required');

    document.getElementById('note-title').value = note.title;
    quill.root.innerHTML = note.text;
    imagePreview.innerHTML = `<img src="${note.imageUrl}" alt="Preview actual">`;
    imageBase64 = null;

    // Scroll arriba al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingNoteId = null;
    editingImageUrl = null;
    formTitle.textContent = 'Publicar Nueva Nota';
    submitBtn.textContent = 'Publicar Nota';
    cancelEditBtn.style.display = 'none';
    imageHint.style.display = 'none';
    resetForm();
}

function resetForm() {
    noteForm.reset();
    imagePreview.innerHTML = '';
    imageBase64 = null;
    if (quill) quill.root.innerHTML = '';
}

// === Cargar notas del usuario en admin ===
async function loadAdminNotes() {
    const list = document.getElementById('admin-notes-list');
    list.innerHTML = '<p style="color:#666;">Cargando...</p>';

    try {
        const snapshot = await db.collection('notes')
            .where('author', '==', currentUser.username)
            .orderBy('createdAt', 'desc')
            .get();

        list.innerHTML = '';

        if (snapshot.empty) {
            list.innerHTML = '<p style="color:#666;">No tenes notas publicadas.</p>';
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
                <div class="admin-note-actions">
                    <button class="btn-edit" data-id="${doc.id}">Editar</button>
                    <button class="btn-danger" data-id="${doc.id}">Eliminar</button>
                </div>
            `;

            // Event listeners
            item.querySelector('.btn-edit').addEventListener('click', () => startEdit(doc.id, note));
            item.querySelector('.btn-danger').addEventListener('click', () => deleteNote(doc.id));

            list.appendChild(item);
        });
    } catch (error) {
        // Si falla por indice, intentar sin orderBy
        if (error.code === 'failed-precondition') {
            list.innerHTML = `<p style="color:#ff6b6b;">Necesitas crear un indice en Firestore. <a href="${error.message.match(/(https:\/\/[^\s]+)/)?.[1] || '#'}" target="_blank" style="color:#7c83ff;">Click aqui para crearlo</a></p>`;
        } else {
            list.innerHTML = '<p style="color:#ff6b6b;">Error al cargar notas.</p>';
            console.error('Error:', error);
        }
    }
}

// === Eliminar nota ===
async function deleteNote(id) {
    if (!confirm('Estas seguro de que queres eliminar esta nota?')) return;

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
