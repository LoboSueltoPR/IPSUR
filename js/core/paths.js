// Rutas relativas según ubicación: raíz | pages/* | admin/
(function (global) {
    const pathname = global.location.pathname.replace(/\\/g, '/');

    const inInstitucionales = pathname.includes('/pages/institucionales/');
    const inCms = pathname.includes('/pages/cms/');
    const inPagesDeep = inInstitucionales || inCms;
    const inAdmin = /\/admin(\/|$)/.test(pathname);
    const inPages = pathname.includes('/pages/');

    function rootPrefix() {
        if (inPagesDeep) return '../../';
        if (inPages || inAdmin) return '../';
        return '';
    }

    function asset(subpath) {
        return rootPrefix() + subpath;
    }

    const ROUTES = {
        inicio: '/',
        quienesSomos: '/quienes-somos',
        publicaciones: '/publicaciones',
        convocatorias: '/convocatorias',
        observatorio: '/observatorio',
        formacion: '/formacion',
        agenda: '/agenda',
        admin: '/admin',
        login: '/login'
    };

    function href(route) {
        const file = ROUTES[route] || route;

        if (file.startsWith('/')) return file;

        if (inInstitucionales) {
            if (file === 'index.html') return '../../index.html';
            if (file.startsWith('pages/institucionales/')) return file.replace('pages/institucionales/', '');
            if (file.startsWith('pages/cms/')) return '../cms/' + file.slice('pages/cms/'.length);
            if (file.startsWith('admin/')) return '../../' + file;
            return '../../' + file;
        }

        if (inCms) {
            if (file === 'index.html') return '../../index.html';
            if (file.startsWith('pages/cms/')) return file.replace('pages/cms/', '');
            if (file.startsWith('pages/institucionales/')) return '../institucionales/' + file.slice('pages/institucionales/'.length);
            if (file.startsWith('admin/')) return '../../' + file;
            return '../../' + file;
        }

        if (inAdmin) {
            if (file === 'index.html') return '../index.html';
            if (file.startsWith('pages/')) return '../' + file;
            if (file.startsWith('admin/')) return 'index.html';
            return '../' + file;
        }

        return file;
    }

    function isActive(route) {
        try {
            return new URL(href(route), global.location.href).pathname === pathname;
        } catch {
            return false;
        }
    }

    global.IPSUR = {
        root: rootPrefix() || '.',
        inPages,
        inPagesDeep,
        inInstitucionales,
        inCms,
        inAdmin,
        css: asset('css/style.css'),
        logo: asset('assets/images/logo.png'),
        hero: asset('assets/images/hero.jpg'),
        href,
        isActive,
        ROUTES,
        js: {
            firebase: asset('js/core/firebase-config.js'),
            layout: asset('js/ui/layout.js'),
            app: asset('js/services/app.js'),
            admin: asset('js/services/admin.js')
        }
    };
})(window);
