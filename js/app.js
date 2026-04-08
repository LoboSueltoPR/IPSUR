// === Pagina principal: mostrar notas ===

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

async function loadNotes() {
    const loading = document.getElementById('loading');
    const noNotes = document.getElementById('no-notes');
    const grid = document.getElementById('notes-grid');

    try {
        const snapshot = await db.collection('notes')
            .orderBy('createdAt', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            noNotes.style.display = 'block';
            return;
        }

        snapshot.forEach(doc => {
            const note = doc.data();
            const card = createNoteCard(doc.id, note);
            grid.appendChild(card);
        });
    } catch (error) {
        loading.innerHTML = '<p style="color:#ff6b6b;">Error al cargar las notas. Verifica la configuracion de Firebase.</p>';
        console.error('Error cargando notas:', error);
    }
}

function createNoteCard(id, note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.onclick = () => openModal(note);

    const date = note.createdAt ? formatDate(note.createdAt.toDate()) : 'Sin fecha';

    // Extraer texto plano del HTML para el preview
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    card.innerHTML = `
        <img src="${note.imageUrl}" alt="${escapeHtml(note.title)}" loading="lazy">
        <div class="note-card-body">
            <h3>${escapeHtml(note.title)}</h3>
            <div class="note-meta">
                <span class="note-author">${escapeHtml(note.authorName || 'Anonimo')}</span>
                <span class="note-date">${date}</span>
            </div>
            <p>${escapeHtml(preview)}</p>
        </div>
    `;

    return card;
}

function openModal(note) {
    const modal = document.getElementById('note-modal');
    document.getElementById('modal-image').src = note.imageUrl;
    document.getElementById('modal-title').textContent = note.title;
    document.getElementById('modal-author').textContent = note.authorName || 'Anonimo';
    document.getElementById('modal-date').textContent = note.createdAt ? formatDate(note.createdAt.toDate()) : '';
    // Renderizar HTML enriquecido
    document.getElementById('modal-text').innerHTML = note.text;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('note-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Cerrar modal con Escape o click fuera
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.getElementById('note-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// === Utilidades ===

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
