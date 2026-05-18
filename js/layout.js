// === IPSUR — layout.js : header/footer compartidos, preloader y transiciones ===

(function () {
    const PAGES = [
        { href: 'index.html',          label: 'Inicio' },
        { href: 'quienes-somos.html',  label: 'Quiénes somos' },
        { href: 'publicaciones.html',  label: 'Publicaciones' },
        { href: 'convocatorias.html',  label: 'Convocatorias' },
        { href: 'observatorio.html',   label: 'Observatorio' },
        { href: 'formacion.html',      label: 'Formación' },
        { href: 'agenda.html',         label: 'Agenda' }
    ];

    // Archivo actual
    const path = location.pathname.split('/').pop() || 'index.html';
    const current = path === '' ? 'index.html' : path;

    // ---------- PRELOADER ----------
    const seenIntro = sessionStorage.getItem('ipsur_intro') === '1';
    const preloader = document.createElement('div');
    preloader.className = 'preloader ' + (seenIntro ? 'curtain' : 'intro');
    preloader.innerHTML = `
        <img class="preloader__logo" src="logo.png" alt="IPSUR — Instituto Político del Sur">
        <div class="preloader__bar"></div>
    `;
    document.body.appendChild(preloader);

    function hidePreloader(delay) {
        setTimeout(() => {
            preloader.classList.add('is-hidden');
            setTimeout(() => preloader.remove(), 600);
        }, delay);
    }

    if (seenIntro) {
        // Cortina rápida entre páginas
        hidePreloader(180);
    } else {
        // Animación completa de intro (1ª visita en la sesión)
        sessionStorage.setItem('ipsur_intro', '1');
        hidePreloader(2100);
    }

    // ---------- HEADER ----------
    const socials = `
        <div class="socials">
            <a href="#" aria-label="Instagram"><span>
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg></span></a>
            <a href="#" aria-label="X / Twitter"><span>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg></span></a>
        </div>`;

    const navLinks = PAGES.filter(p => p.href !== 'index.html').map(p => {
        const active = (p.href === current) ? ' class="is-active"' : '';
        return `<a href="${p.href}"${active}>${p.label}</a>`;
    }).join('');

    const header = document.createElement('header');
    header.className = 'site-header';
    header.id = 'site-header';
    header.innerHTML = `
        <div class="container">
            <div class="header-inner">
                <a href="index.html" class="brand" data-nav>
                    <img class="brand-logo" src="logo.png" alt="IPSUR">
                </a>
                <nav class="main-nav" id="main-nav">
                    ${navLinks}
                    <a href="index.html#newsletter" class="nav-cta">Suscribite</a>
                    ${socials}
                </nav>
                <button class="hamburger" id="hamburger" aria-label="Abrir menú" aria-expanded="false">☰</button>
            </div>
        </div>`;
    document.body.insertBefore(header, document.body.firstChild);

    // Estilo nav activo
    const style = document.createElement('style');
    style.textContent = `.main-nav a.is-active{color:var(--primary-600);} .main-nav a.is-active::after{transform:scaleX(1);}`;
    document.head.appendChild(style);

    // ---------- FOOTER ----------
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <img src="logo.png" alt="IPSUR" style="height:46px;width:auto;border-radius:0;margin-bottom:14px;">
                    <p>Investigar, difundir, formar y militar desde el sur.</p>
                    <p>Bahía Blanca, Argentina.</p>
                    <p class="activá-note">Una iniciativa del espacio <strong>Activá</strong></p>
                </div>
                <div class="footer-col">
                    <h5>Instituto</h5>
                    <ul>
                        <li><a href="quienes-somos.html" data-nav>Quiénes somos</a></li>
                        <li><a href="index.html#lineas" data-nav>Líneas de acción</a></li>
                        <li><a href="index.html#alianzas" data-nav>Alianzas</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h5>Contenido</h5>
                    <ul>
                        <li><a href="publicaciones.html" data-nav>Publicaciones</a></li>
                        <li><a href="convocatorias.html" data-nav>Convocatorias</a></li>
                        <li><a href="observatorio.html" data-nav>Observatorio</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h5>Participá</h5>
                    <ul>
                        <li><a href="formacion.html" data-nav>Formación</a></li>
                        <li><a href="agenda.html" data-nav>Agenda</a></li>
                        <li><a href="index.html#newsletter" data-nav>Newsletter</a></li>
                        <li><a href="admin.html">Panel admin</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h5>Contacto</h5>
                    <p class="footer-contact-email">contacto@ipsur.org</p>
                    <div class="footer-rrss">
                        <a href="#">Instagram</a>
                        <a href="#">X</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 IPSUR — Instituto Político del Sur.</p>
            </div>
        </div>`;
    document.body.appendChild(footer);

    // ---------- HAMBURGER ----------
    const hamburger = header.querySelector('#hamburger');
    const nav = header.querySelector('#main-nav');
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.insertBefore(backdrop, document.body.firstChild);
    }

    function openMenu() {
        nav.classList.add('is-open');
        backdrop.classList.add('is-active');
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    }
    function closeMenu() {
        nav.classList.remove('is-open');
        backdrop.classList.remove('is-active');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }
    hamburger.addEventListener('click', () =>
        nav.classList.contains('is-open') ? closeMenu() : openMenu());
    backdrop.addEventListener('click', closeMenu);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // ---------- SCROLL HEADER ----------
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // ---------- TRANSICIONES DE PÁGINA ----------
    // Entrada
    const main = document.querySelector('main');
    if (main) main.classList.add('page-in');

    // Salida con fade al navegar internamente
    function isInternal(a) {
        const href = a.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
            href.startsWith('http') || a.target === '_blank') return false;
        return href.endsWith('.html') || href.includes('.html#');
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || !isInternal(a)) return;
        const dest = a.getAttribute('href');
        // Si es la misma página con ancla, dejar comportamiento normal
        const destFile = dest.split('#')[0];
        if (destFile === current || destFile === '') return;

        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(() => { window.location.href = dest; }, 280);
    });

    // Escape cierra menú
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();
