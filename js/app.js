// === IPSUR — app.js ===

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    loadNotes();
    initNewsletter();
});

// ===================================================
// NAVBAR — scroll highlight + hamburger mobile
// ===================================================
function initNavbar() {
    const header   = document.getElementById('site-header');
    const hamburger= document.getElementById('hamburger');
    const nav      = document.getElementById('main-nav');
    const backdrop = document.getElementById('nav-backdrop');

    // Scroll effect
    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // Toggle mobile menu
    function openMenu() {
        nav?.classList.add('is-open');
        backdrop?.classList.add('is-active');
        hamburger?.classList.add('is-active');
        hamburger?.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    }
    function closeMenu() {
        nav?.classList.remove('is-open');
        backdrop?.classList.remove('is-active');
        hamburger?.classList.remove('is-active');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }

    hamburger?.addEventListener('click', () => {
        nav?.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    backdrop?.addEventListener('click', closeMenu);

    // Close on nav link click
    nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

// ===================================================
// NOTAS — cargar desde Firebase
// ===================================================
async function loadNotes() {
    const loading = document.getElementById('loading');
    const noNotes = document.getElementById('no-notes');
    const grid    = document.getElementById('notes-grid');
    if (!grid) return;

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
            grid.appendChild(createNoteCard(doc.id, doc.data()));
        });

    } catch (error) {
        if (loading) loading.innerHTML = '<p style="color:#b71c1c;font-size:.88rem;text-align:center;">Error al cargar las publicaciones.</p>';
        console.error('Error cargando notas:', error);
    }
}

function createNoteCard(id, note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.onclick = () => openModal(note);

    const date = note.createdAt ? formatDate(note.createdAt.toDate()) : '';

    const tmp = document.createElement('div');
    tmp.innerHTML = note.text;
    const plain = (tmp.textContent || tmp.innerText || '').trim();
    const preview = plain.length > 140 ? plain.substring(0, 140) + '...' : plain;

    card.innerHTML = `
        <img src="${note.imageUrl}" alt="${escapeHtml(note.title)}" loading="lazy">
        <div class="note-card-body">
            <div class="note-meta">
                <span class="note-author">${escapeHtml(note.authorName || 'IPSUR')}</span>
                <span class="note-date">${date}</span>
            </div>
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(preview)}</p>
        </div>
    `;
    return card;
}

// ===================================================
// MODAL
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
    document.getElementById('note-modal')?.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('note-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

// ===================================================
// NEWSLETTER
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
                nombre, email,
                perfil: perfil || 'sin_especificar',
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
            form.reset();
            success.style.display = 'block';
            btn.textContent = 'Suscribirme';
            btn.disabled = false;
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
    return date.toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
