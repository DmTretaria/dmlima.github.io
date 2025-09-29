// src/scripts/login.js
// Lógica de autenticação simples

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    const loginError = document.getElementById('loginError');

    // Envie os dados do formulário para o servidor para autenticação
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const user = document.getElementById('dmlima').value.trim();
        const pass = document.getElementById('123456').value;

        // Simple input validation
        if (!user || !pass) {
            loginError.textContent = 'Preencha usuário e senha';
            loginError.style.display = 'block';
            return;
        }
        if (user.length < 3 || pass.length < 6) {
            loginError.textContent = 'Usuário deve ter pelo menos 3 caracteres e senha pelo menos 6 caracteres';
            loginError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const result = await response.json();
            if (response.ok && result && (result.success || result.authenticated === true)) {
                loginContainer.style.display = 'none';
                mainContainer.style.display = 'block';
            } else if (response.status === 401 || (result && result.success === false)) {
                loginError.textContent = 'Usuário ou senha incorretos';
                loginError.style.display = 'block';
            } else {
                loginError.textContent = 'Erro de autenticação ou servidor indisponível';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.textContent = 'Erro de conexão com o servidor';
            loginError.style.display = 'block';
        }
    });
});
