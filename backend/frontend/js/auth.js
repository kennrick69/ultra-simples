// ==============================================================================
// AUTENTICAÇÃO - ULTRA SIMPLES v1.0
// Login e Cadastro com Confirmação de Email
// ==============================================================================

// URL da API
function getApiUrl() {
    var customUrl = localStorage.getItem('api_url');
    if (customUrl) return customUrl;
    return 'https://ultra-simples-production.up.railway.app';
}

// Página de destino após login
var PAGINA_DESTINO = 'casos-proteticos.html';

// ==============================================================================
// ALTERNAR FORMULÁRIOS
// ==============================================================================

function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    var msgConfirmacao = document.getElementById('msgConfirmacao');
    if (msgConfirmacao) msgConfirmacao.classList.remove('visible');
}

function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    var msgConfirmacao = document.getElementById('msgConfirmacao');
    if (msgConfirmacao) msgConfirmacao.classList.remove('visible');
}

// email ativo para reenvio
var _emailConfirmacao = '';

// Mostrar mensagem de aguardando confirmação
function showAguardandoConfirmacao(email) {
    _emailConfirmacao = email;
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    var msgDiv = document.getElementById('msgConfirmacao');
    if (msgDiv) {
        document.getElementById('emailEnviado').textContent = email;
        msgDiv.classList.add('visible');
    }
}

function reenviarConfirmacaoClick() {
    reenviarConfirmacao(_emailConfirmacao);
}

// Reenviar email de confirmação
async function reenviarConfirmacao(email) {
    try {
        var response = await fetch(getApiUrl() + '/api/auth/reenviar-confirmacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        var data = await response.json();
        
        if (data.success) {
            mostrarAlerta('Email Reenviado!', 'Verifique sua caixa de entrada.', 'success');
        } else {
            mostrarAlerta('Erro', data.erro || 'Erro ao reenviar email', 'error');
        }
    } catch (error) {
        mostrarAlerta('Erro', 'Erro de conexão', 'error');
    }
}

// ==============================================================================
// LOGIN
// ==============================================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        mostrarAlerta('Erro', 'Preencha email e senha', 'error');
        return;
    }
    
    // Desabilitar botão
    var btn = this.querySelector('button[type="submit"]');
    var btnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    
    try {
        var response = await fetch(getApiUrl() + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (data.success && data.token) {
            // Salvar token
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('token', data.token); // Compatibilidade
            
            // Verificar tipo de usuário
            if (data.tipo === 'usuario') {
                // Login de usuário vinculado (secretária, auxiliar, etc)
                localStorage.setItem('tipoUsuario', 'usuario');
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('permissoes', JSON.stringify(data.usuario.permissoes || []));
                // Criar objeto dentista fake para compatibilidade
                localStorage.setItem('dentista', JSON.stringify({
                    id: data.usuario.dentista_id,
                    nome: data.usuario.nome,
                    clinica: data.usuario.clinica,
                    email: data.usuario.email
                }));
                localStorage.setItem('current_dentista', localStorage.getItem('dentista'));
            } else {
                // Login de dentista (admin)
                localStorage.setItem('tipoUsuario', 'dentista');
                localStorage.setItem('dentista', JSON.stringify(data.dentista));
                localStorage.setItem('current_dentista', JSON.stringify(data.dentista));
                localStorage.setItem('permissoes', JSON.stringify(['*'])); // Acesso total
            }
            
            // Redirecionar para página de destino
            window.location.href = PAGINA_DESTINO;
        } else if (data.emailNaoConfirmado) {
            // Email não confirmado - mostrar opção de reenviar
            showAguardandoConfirmacao(data.email || email);
        } else {
            mostrarAlerta('Erro no Login', data.erro || 'Email ou senha incorretos', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarAlerta('Erro', 'Erro de conexão com o servidor', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = btnText;
    }
});

// ==============================================================================
// CADASTRO
// ==============================================================================

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    var name = document.getElementById('regName').value.trim();
    var cro = document.getElementById('regCRO').value.trim();
    var specialty = document.getElementById('regSpecialty').value;
    var clinic = document.getElementById('regClinic').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Validações
    if (!name || !cro || !email || !password) {
        mostrarAlerta('Erro', 'Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (password.length < 6) {
        mostrarAlerta('Erro', 'Senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        mostrarAlerta('Erro', 'As senhas não coincidem', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        mostrarAlerta('Erro', 'Digite um email válido', 'error');
        return;
    }
    
    // Desabilitar botão
    var btn = this.querySelector('button[type="submit"]');
    var btnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';
    
    try {
        var response = await fetch(getApiUrl() + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                cro: cro,
                specialty: specialty,
                clinic: clinic,
                email: email,
                password: password
            })
        });
        
        var data = await response.json();
        
        if (data.success) {
            if (data.aguardandoConfirmacao) {
                // Mostrar tela de aguardando confirmação
                showAguardandoConfirmacao(email);
            } else {
                // Cadastro sem confirmação (fallback)
                mostrarAlerta('Sucesso!', 'Cadastro realizado! Faça login para continuar.', 'success');
                setTimeout(function() {
                    document.getElementById('loginEmail').value = email;
                    showLogin();
                }, 2000);
            }
        } else {
            mostrarAlerta('Erro no Cadastro', data.erro || 'Erro ao cadastrar', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarAlerta('Erro', 'Erro de conexão com o servidor', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = btnText;
    }
});

// ==============================================================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// ==============================================================================

(function() {
    var token = localStorage.getItem('auth_token');
    if (token) {
        // Já tem token, verificar se é válido
        fetch(getApiUrl() + '/api/auth/verify', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                // Token válido, redirecionar
                window.location.href = PAGINA_DESTINO;
            }
        })
        .catch(function() {
            // Token inválido, continua na página de login
            localStorage.removeItem('auth_token');
        });
    }
    
    // Verificar se veio com parâmetro para mostrar registro
    var params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true') {
        showRegister();
    }
})();

// ==============================================================================
// FUNÇÃO DE ALERTA (fallback se alertas-bonitos não estiver carregado)
// ==============================================================================

function mostrarAlerta(titulo, mensagem, tipo) {
    if (typeof window.DuAlerta !== 'undefined') {
        window.DuAlerta.show(titulo, mensagem, tipo);
    } else if (typeof alert !== 'undefined') {
        alert(titulo + '\n\n' + mensagem);
    }
}
