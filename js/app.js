// === IPSUR — app.js ===

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    loadNotes();
    initNewsletter();
});

// ===================================================
// NAVBAR — scroll + mobile toggle
// ===================================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links  = document.getElementById('nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Mobile toggle
    toggle?.addEventListener('click', () => {
        links.classList.toggle('open');
    });

    // Cerrar al hacer click en un link
    links?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('open'));
    });
}

// ===================================================
// NOTAS — cargar desde Firebase
// ===================================================
async function loadNotes() {
    const loading = document.getElementById('loading');
    const noNotes = document.getElementById('no-notes');
    const grid    = document.getElementById('notes-grid');

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
            const card = createNoteCard(doc.id, doc.data());
            grid.appendChild(card);
        });

    } catch (error) {
        loading.innerHTML = '<p style="color:var(--red);font-size:0.88rem;">Error al cargar las publicaciones.</p>';
        console.error('Error:', error);
    }
}

function createNoteCard(id, note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.onclick = () => openModal(note);

    const date = note.createdAt ? formatDate(note.createdAt.toDate()) : '';

    // Texto plano para el preview
    const tmp = document.createElement('div');
    tmp.innerHTML = note.text;
    const plain = (tmp.textContent || tmp.innerText || '').trim();
    const preview = plain.length > 140 ? plain.substring(0, 140) + '...' : plain;

    card.innerHTML = `
        <img src="${note.imageUrl}" alt="${escapeHtml(note.title)}" loading="lazy">
        <div class="note-card-body">
            <h3>${escapeHtml(note.title)}</h3>
            <div class="note-meta">
                <span class="note-author">${escapeHtml(note.authorName || 'IPSUR')}</span>
                <span class="note-date">${date}</span>
            </div>
            <p>${escapeHtml(preview)}</p>
        </div>
    `;
    return card;
}

// ===================================================
// MODAL — ver nota completa
// ===================================================
function openModal(note) {
    const modal = document.getElementById('note-modal');
    document.getElementById('modal-image').src  = note.imageUrl;
    document.getElementById('modal-title').textContent  = note.title;
    document.getElementById('modal-author').textContent = note.authorName || 'IPSUR';
    document.getElementById('modal-date').textContent   = note.createdAt ? formatDate(note.createdAt.toDate()) : '';
    document.getElementById('modal-text').innerHTML     = note.text;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('note-modal').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('note-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

// ===================================================
// NEWSLETTER — guardar en Firebase
// ===================================================
function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn     = document.getElementById('nl-btn');
        const success = document.getElementById('nl-success');
        const error   = document.getElementById('nl-error');
        const nombre  = document.getElementById('nl-nombre').value.trim();
        const email   = document.getElementById('nl-email').value.trim();
        const perfil  = document.getElementById('nl-perfil').value;

        btn.disabled = true;
        btn.textContent = 'Enviando...';
        success.style.display = 'none';
        error.style.display   = 'none';

        try {
            await db.collection('newsletter').add({
                nombre,
                email,
                perfil: perfil || 'sin_especificar',
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
            form.reset();
            success.style.display = 'block';
            btn.textContent = 'Suscribirme';
        } catch (err) {
            error.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Suscribirme';
            console.error(err);
        }
    });
}

// ===================================================
// UTILS
// ===================================================
function formatDate(date) {
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
