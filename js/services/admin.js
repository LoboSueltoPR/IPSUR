document.addEventListener('DOMContentLoaded', () => {
    // --- Tabs Logic ---
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // --- Firebase Init ---
    const db = firebase.firestore();
    const storage = firebase.storage();

    // ==========================================
    // PUBLICACIONES (NOTAS)
    // ==========================================
    const pubForm = document.getElementById('form-pub');
    const pubListContainer = document.getElementById('pub-list-container');
    let editingPubId = null;

    // Inicializar Quill
    let quill;
    if (document.getElementById('pub-content-editor')) {
        quill = new Quill('#pub-content-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['clean'],
                    ['link', 'video']
                ]
            }
        });
    }

    // Cargar publicaciones
    function loadPubs() {
        db.collection('notes').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            pubListContainer.innerHTML = '';
            if (snapshot.empty) {
                pubListContainer.innerHTML = '<p style="color:var(--text-muted)">No hay publicaciones.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `
                    <div class="admin-item-info">
                        <h4>${data.title}</h4>
                        <p>${data.author || 'Sin autor'} • ${new Date(data.createdAt?.toDate()).toLocaleDateString()}</p>
                    </div>
                    <div class="admin-item-actions">
                        <button class="btn outline btn-sm" onclick="editPub('${doc.id}')">Editar</button>
                        <button class="btn outline btn-sm btn-danger" onclick="deletePub('${doc.id}')">Eliminar</button>
                    </div>
                `;
                pubListContainer.appendChild(item);
            });
        });
    }

    // Subir imagen auxiliar
    async function uploadImage(file, folder) {
        if (!file) return null;
        const ref = storage.ref(`${folder}/${Date.now()}_${file.name}`);
        await ref.put(file);
        return await ref.getDownloadURL();
    }

    // Guardar publicación
    if (pubForm) {
        pubForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-pub-submit');
            const spinner = btn.querySelector('.spinner');
            const btnText = btn.querySelector('.btn-text');
            
            btn.disabled = true;
            spinner.style.display = 'inline-block';
            btnText.style.display = 'none';

            try {
                const title = document.getElementById('pub-title').value;
                const author = document.getElementById('pub-author').value;
                const youtube = document.getElementById('pub-youtube').value;
                const content = quill.root.innerHTML;
                
                const coverFile = document.getElementById('pub-cover-img').files[0];
                const authorFile = document.getElementById('pub-author-img').files[0];

                let coverUrl = null;
                let authorUrl = null;

                if (coverFile) coverUrl = await uploadImage(coverFile, 'covers');
                if (authorFile) authorUrl = await uploadImage(authorFile, 'authors');

                const payload = {
                    title,
                    author,
                    youtube,
                    content
                };
                if (coverUrl) payload.coverUrl = coverUrl;
                if (authorUrl) payload.authorUrl = authorUrl;

                if (editingPubId) {
                    await db.collection('notes').doc(editingPubId).update(payload);
                    alert('Publicación actualizada con éxito');
                } else {
                    payload.coverUrl = payload.coverUrl || '';
                    payload.authorUrl = payload.authorUrl || '';
                    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('notes').add(payload);
                    alert('Publicación guardada con éxito');
                }

                cancelPubEdit();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al guardar la publicación: ' + error.message);
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
                btnText.style.display = 'inline-block';
            }
        });
    }

    window.editPub = async (id) => {
        try {
            const doc = await db.collection('notes').doc(id).get();
            if (!doc.exists) return;
            const data = doc.data();

            document.getElementById('pub-title').value = data.title || '';
            document.getElementById('pub-author').value = data.author || '';
            document.getElementById('pub-youtube').value = data.youtube || '';
            document.getElementById('pub-cover-img').value = '';
            document.getElementById('pub-author-img').value = '';

            if(quill) {
                quill.clipboard.dangerouslyPasteHTML(data.content || '');
            }

            editingPubId = id;
            document.getElementById('btn-pub-submit').querySelector('.btn-text').textContent = 'Actualizar Publicación';
            document.getElementById('btn-pub-cancel').style.display = 'block';

            // Scroll al form
            document.getElementById('sec-publicaciones').scrollIntoView({ behavior: 'smooth' });
        } catch(e) {
            console.error('Error cargando publicación:', e);
        }
    };

    window.cancelPubEdit = () => {
        editingPubId = null;
        if(pubForm) pubForm.reset();
        if(quill) quill.setContents([]);
        document.getElementById('btn-pub-submit').querySelector('.btn-text').textContent = 'Publicar';
        document.getElementById('btn-pub-cancel').style.display = 'none';
    };

    window.deletePub = async (id) => {
        if(confirm('¿Seguro que querés borrar esta publicación?')) {
            await db.collection('notes').doc(id).delete();
        }
    };


    // ==========================================
    // AGENDA
    // ==========================================
    const agendaForm = document.getElementById('form-agenda');
    const agendaListContainer = document.getElementById('agenda-list-container');
    let editingAgendaId = null;

    // Cargar agenda
    function loadAgenda() {
        db.collection('agenda').orderBy('date', 'desc').onSnapshot(snapshot => {
            agendaListContainer.innerHTML = '';
            if (snapshot.empty) {
                agendaListContainer.innerHTML = '<p style="color:var(--text-muted)">No hay eventos en la agenda.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `
                    <div class="admin-item-info">
                        <h4>${data.title}</h4>
                        <p>${data.date} • ${data.status}</p>
                    </div>
                    <div class="admin-item-actions">
                        <button class="btn outline btn-sm" onclick="editAgenda('${doc.id}')">Editar</button>
                        <button class="btn outline btn-sm btn-danger" onclick="deleteAgenda('${doc.id}')">Eliminar</button>
                    </div>
                `;
                agendaListContainer.appendChild(item);
            });
        });
    }

    // Guardar agenda
    if (agendaForm) {
        agendaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-agenda-submit');
            const spinner = btn.querySelector('.spinner');
            const btnText = btn.querySelector('.btn-text');
            
            btn.disabled = true;
            spinner.style.display = 'inline-block';
            btnText.style.display = 'none';

            try {
                const title = document.getElementById('agenda-title').value;
                const date = document.getElementById('agenda-date').value;
                const status = document.getElementById('agenda-status').value;
                const tag = document.getElementById('agenda-tag').value;
                const speakers = document.getElementById('agenda-speakers').value;
                const link = document.getElementById('agenda-link').value;
                const content = document.getElementById('agenda-content').value;
                
                const imgFile = document.getElementById('agenda-img').files[0];
                let imgUrl = null;
                if (imgFile) {
                    imgUrl = await uploadImage(imgFile, 'agenda');
                }

                const payload = {
                    title,
                    date,
                    status,
                    tag,
                    speakers,
                    link,
                    content
                };
                if (imgUrl) payload.imgUrl = imgUrl;

                if (editingAgendaId) {
                    await db.collection('agenda').doc(editingAgendaId).update(payload);
                    alert('Evento actualizado con éxito');
                } else {
                    payload.imgUrl = payload.imgUrl || '';
                    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('agenda').add(payload);
                    alert('Evento guardado con éxito');
                }

                cancelAgendaEdit();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al guardar el evento: ' + error.message);
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
                btnText.style.display = 'inline-block';
            }
        });
    }

    window.editAgenda = async (id) => {
        try {
            const doc = await db.collection('agenda').doc(id).get();
            if (!doc.exists) return;
            const data = doc.data();

            document.getElementById('agenda-title').value = data.title || '';
            document.getElementById('agenda-date').value = data.date || '';
            document.getElementById('agenda-status').value = data.status || 'confirmado';
            document.getElementById('agenda-tag').value = data.tag || '';
            document.getElementById('agenda-speakers').value = data.speakers || '';
            document.getElementById('agenda-link').value = data.link || '';
            document.getElementById('agenda-content').value = data.content || '';
            document.getElementById('agenda-img').value = '';

            editingAgendaId = id;
            document.getElementById('btn-agenda-submit').querySelector('.btn-text').textContent = 'Actualizar Evento';
            document.getElementById('btn-agenda-cancel').style.display = 'block';

            // Scroll al form
            document.getElementById('sec-agenda').scrollIntoView({ behavior: 'smooth' });
        } catch(e) {
            console.error('Error cargando evento:', e);
        }
    };

    window.cancelAgendaEdit = () => {
        editingAgendaId = null;
        if(agendaForm) agendaForm.reset();
        document.getElementById('btn-agenda-submit').querySelector('.btn-text').textContent = 'Guardar Evento';
        document.getElementById('btn-agenda-cancel').style.display = 'none';
    };

    window.deleteAgenda = async (id) => {
        if(confirm('¿Seguro que querés borrar este evento?')) {
            await db.collection('agenda').doc(id).delete();
        }
    };


    // Inicializar cargas
    loadPubs();
    loadAgenda();
});
