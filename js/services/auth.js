document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    // Si estamos en la página de login
    if (loginForm) {
        // Redirigir si ya está logueado
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                window.location.href = 'dashboard.html';
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            const btn = document.getElementById('btn-login');
            const btnText = btn.querySelector('.btn-text');
            const spinner = document.getElementById('login-spinner');
            
            errorDiv.style.display = 'none';
            btn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                // Si es exitoso, el onAuthStateChanged se dispara y redirige
            } catch (error) {
                let msg = 'Error al iniciar sesión.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    msg = 'Credenciales incorrectas.';
                } else if (error.code === 'auth/invalid-email') {
                    msg = 'El formato del correo es inválido.';
                }
                errorDiv.textContent = msg;
                errorDiv.style.display = 'block';
                
                btn.disabled = false;
                btnText.style.display = 'inline-block';
                spinner.style.display = 'none';
            }
        });
    } else {
        // Protección de rutas privadas (ej. dashboard.html)
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'login.html';
            } else {
                // Configurar email del usuario en la UI si existe
                const userEmailEl = document.getElementById('admin-user-email');
                if (userEmailEl) userEmailEl.textContent = user.email;
            }
        });

        // Botón de cerrar sesión
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'login.html';
                });
            });
        }
    }
});
