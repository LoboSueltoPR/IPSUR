// === IPSUR — app.js : notas (publicaciones) + newsletter ===

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    initNewsletter();
});

async function loadNotes() {
    const loading = document.getElementById('loading');
    const noNotes = document.getElementById('no-notes');
    const grid    = document.getElementById('notes-grid');
    if (!grid) return;

    try {
        const snapshot = await db.collection('notes')
            .orderBy('createdAt', 'desc')
            .get();

        if (loading) loading.style.display = 'none';

        if (snapshot.empty) {
            if (noNotes) noNotes.style.display = 'block';
            return;
        }

        snapshot.forEach(doc => grid.appendChild(createNoteCard(doc.id, doc.data())));

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

    const contentText = note.content || note.text || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = contentText;
    const plain = (tmp.textContent || tmp.innerText || '').trim();
    const preview = plain.length > 140 ? plain.substring(0, 140) + '...' : plain;

    const imgUrl = note.coverUrl || note.imageUrl || '';

    card.innerHTML = `
        <img src="${imgUrl}" alt="${escapeHtml(note.title)}" loading="lazy">
        <div class="note-card-body">
            <div class="note-meta">
                <span class="note-author">${escapeHtml(note.author || note.authorName || 'IPSUR')}</span>
                <span class="note-date">${date}</span>
            </div>
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(preview)}</p>
        </div>
    `;
    return card;
}

function getYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : null;
}

function openModal(note) {
    const modal = document.getElementById('note-modal');
    if (!modal) return;
    
    const imgUrl = note.coverUrl || note.imageUrl || '';
    const authorImgUrl = note.authorUrl || '';
    
    const imgEl = document.getElementById('modal-image');
    if (imgUrl) {
        imgEl.src = imgUrl;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    const ytContainer = document.getElementById('modal-youtube-container');
    const ytIframe = document.getElementById('modal-youtube');
    if (note.youtube) {
        const ytId = getYouTubeId(note.youtube);
        if (ytId) {
            ytIframe.src = `https://www.youtube.com/embed/${ytId}`;
            ytContainer.style.display = 'block';
            imgEl.style.display = 'none'; // Preferir video sobre imagen si hay ambos
        } else {
            ytContainer.style.display = 'none';
            ytIframe.src = '';
        }
    } else {
        ytContainer.style.display = 'none';
        ytIframe.src = '';
    }

    const authorImgEl = document.getElementById('modal-author-img');
    if (authorImgUrl) {
        authorImgEl.src = authorImgUrl;
        authorImgEl.style.display = 'block';
    } else {
        authorImgEl.style.display = 'none';
    }

    document.getElementById('modal-title').textContent  = note.title;
    document.getElementById('modal-author').textContent = note.author || note.authorName || 'IPSUR';
    document.getElementById('modal-date').textContent   = note.createdAt ? formatDate(note.createdAt.toDate()) : '';
    document.getElementById('modal-text').innerHTML     = note.content || note.text || '';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('note-modal')?.classList.remove('active');
    document.body.style.overflow = '';
    const ytIframe = document.getElementById('modal-youtube');
    if(ytIframe) ytIframe.src = ''; // Detener video al cerrar
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('note-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

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

function formatDate(date) {
    return date.toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
}
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// === LÓGICA DE AGENDA Y CALENDARIO ===
function initAgenda() {
    const list = document.getElementById('agenda-dynamic-list');
    if (!list) return; // Solo ejecutar en agenda.html

    const db = firebase.firestore();
    
    // Cargar eventos
    db.collection('agenda').orderBy('date', 'desc').onSnapshot(snapshot => {
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<p style="color:var(--text-muted)">Pronto subiremos nuevos eventos.</p>';
            return;
        }

        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            events.push(data);
            list.appendChild(createAgendaItem(data));
        });
    });
}

function createAgendaItem(data) {
    const li = document.createElement('li');
    
    // Parse date (YYYY-MM-DD)
    const [year, month, day] = data.date.split('-');
    const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const monthStr = monthNames[parseInt(month) - 1];

    let pillColor = 'background:#e2e8f0; color:#475569;'; // Default Realizado/Cancelado
    let pillText = data.status;
    let isClickable = false;

    if (data.status.toLowerCase() === 'confirmado') {
        pillColor = 'background:var(--primary); color:#fff;';
        pillText = 'Confirmado';
        isClickable = true;
    } else if (data.status.toLowerCase() === 'realizado') {
        pillText = 'Realizado';
        isClickable = true;
    }

    li.innerHTML = `
        <div class="agenda-item-inner ${isClickable ? 'clickable' : ''}" style="${isClickable ? 'cursor:pointer; transition:transform 0.2s;' : 'opacity:0.8'}">
            <div class="agenda-date-block">
                <span class="mes">${monthStr}</span><span class="dia">${day}</span>
            </div>
            <div class="agenda-body">
                <div class="agenda-body-text">
                    ${data.tag ? `<span class="agenda-tag-pill" style="background:#fef08a; color:#854d0e;">${escapeHtml(data.tag)}</span>` : ''}
                    <h4>${escapeHtml(data.title)}</h4>
                    <p>${escapeHtml(data.speakers)}</p>
                </div>
                <span class="agenda-estado-pill" style="${pillColor}">${pillText}</span>
            </div>
        </div>
    `;

    if (isClickable) {
        li.querySelector('.agenda-item-inner').addEventListener('click', () => openAgendaModal(data));
        li.querySelector('.agenda-item-inner').addEventListener('mouseenter', function() { this.style.transform = 'translateY(-2px)' });
        li.querySelector('.agenda-item-inner').addEventListener('mouseleave', function() { this.style.transform = 'translateY(0)' });
    }

    return li;
}

window.openAgendaModal = function(data) {
    const modal = document.getElementById('agenda-modal');
    if (!modal) return;
    
    const imgEl = document.getElementById('agenda-modal-img');
    if (data.imgUrl) {
        imgEl.src = data.imgUrl;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    const tagEl = document.getElementById('agenda-modal-tag');
    if (data.tag) {
        tagEl.textContent = data.tag;
        tagEl.style.display = 'inline-block';
    } else {
        tagEl.style.display = 'none';
    }

    document.getElementById('agenda-modal-title').textContent = data.title;
    
    const [year, month, day] = data.date.split('-');
    document.getElementById('agenda-modal-date').textContent = `${day}/${month}/${year}`;
    
    document.getElementById('agenda-modal-speakers').textContent = data.speakers;
    document.getElementById('agenda-modal-content').innerHTML = data.content ? data.content.replace(/\n/g, '<br>') : '';
    
    const linkContainer = document.getElementById('agenda-modal-link-container');
    const linkEl = document.getElementById('agenda-modal-link');
    if (data.link) {
        linkEl.href = data.link;
        linkContainer.style.display = 'block';
    } else {
        linkContainer.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeAgendaModal = function() {
    document.getElementById('agenda-modal')?.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    initAgenda();
});
