// ==============================================================================
// ONBOARDING GAMIFICADO - DENTAL ULTRA
// Sistema de boas-vindas e checklist de tarefas para engajar novos usuários
// ==============================================================================

var OnboardingSystem = {
    // Configuração das tarefas
    tarefas: [
        { id: 'clinica', titulo: 'Confirme os dados da sua clínica', icone: '🏥', url: 'dentistas.html', pontos: 10 },
        { id: 'equipe', titulo: 'Cadastre sua equipe', icone: '👥', url: 'dentistas.html', pontos: 15 },
        { id: 'paciente', titulo: 'Cadastre seu primeiro paciente', icone: '👤', url: 'pacientes.html', pontos: 20 },
        { id: 'agendamento', titulo: 'Agende uma consulta', icone: '📅', url: 'agenda.html', pontos: 20 },
        { id: 'estoque', titulo: 'Cadastre um produto no estoque', icone: '📦', url: 'estoque.html', pontos: 15 },
        { id: 'orcamento', titulo: 'Crie um orçamento/plano de tratamento', icone: '💰', url: 'plano-tratamento.html', pontos: 25 },
        { id: 'notafiscal', titulo: 'Emita sua primeira nota fiscal', icone: '📄', url: 'nota-fiscal.html', pontos: 30 }
    ],

    // Estilos do onboarding
    styles: `
        /* Onboarding Overlay */
        .onboarding-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .onboarding-overlay.show { display: flex; }
        
        .onboarding-modal {
            background: #fff;
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            overflow: hidden;
            animation: slideUp 0.4s ease;
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .onboarding-header {
            background: linear-gradient(135deg, #2d7a5f, #3d9970);
            padding: 30px;
            text-align: center;
            color: #fff;
        }
        
        .onboarding-emoji {
            font-size: 60px;
            margin-bottom: 15px;
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .onboarding-header h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        
        .onboarding-header p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
        }
        
        .onboarding-body {
            padding: 25px;
        }
        
        .onboarding-question {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .onboarding-question h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        
        .onboarding-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .onboarding-option {
            padding: 15px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }
        
        .onboarding-option:hover {
            border-color: #2d7a5f;
            background: #f0fdf4;
        }
        
        .onboarding-option.selected {
            border-color: #2d7a5f;
            background: #dcfce7;
        }
        
        .onboarding-footer {
            padding: 20px 25px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .onboarding-btn {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .onboarding-btn-skip {
            background: transparent;
            color: #666;
        }
        
        .onboarding-btn-next {
            background: linear-gradient(135deg, #2d7a5f, #3d9970);
            color: #fff;
        }
        
        .onboarding-btn-next:hover {
            box-shadow: 0 4px 15px rgba(45,122,95,0.4);
        }
        
        /* Widget de Progresso (canto inferior esquerdo) */
        .progress-widget {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            width: 320px;
            z-index: 1000;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .progress-widget.minimized {
            width: auto;
        }
        
        .progress-widget.minimized .progress-content {
            display: none;
        }
        
        .progress-widget.completed {
            background: linear-gradient(135deg, #ffd700, #ffb800);
        }
        
        .progress-header {
            padding: 15px;
            background: linear-gradient(135deg, #2d7a5f, #3d9970);
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        
        .progress-widget.completed .progress-header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .progress-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .progress-header-left span:first-child {
            font-size: 24px;
        }
        
        .progress-header-title {
            font-weight: 600;
            font-size: 14px;
        }
        
        .progress-header-percent {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .progress-toggle {
            background: rgba(255,255,255,0.2);
            border: none;
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
        }
        
        .progress-content {
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .progress-bar-container {
            background: #e5e7eb;
            border-radius: 10px;
            height: 8px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        
        .progress-bar-fill {
            background: linear-gradient(90deg, #2d7a5f, #3d9970);
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }
        
        .progress-task {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .progress-task:hover {
            background: #f3f4f6;
        }
        
        .progress-task.completed {
            opacity: 0.6;
        }
        
        .progress-task-check {
            width: 24px;
            height: 24px;
            border: 2px solid #d1d5db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
        }
        
        .progress-task.completed .progress-task-check {
            background: #2d7a5f;
            border-color: #2d7a5f;
            color: #fff;
        }
        
        .progress-task-info {
            flex: 1;
        }
        
        .progress-task-title {
            font-size: 13px;
            color: #333;
            font-weight: 500;
        }
        
        .progress-task-points {
            font-size: 11px;
            color: #f59e0b;
            font-weight: 600;
        }
        
        .progress-task-arrow {
            color: #9ca3af;
            font-size: 14px;
        }
        
        .progress-task.completed .progress-task-arrow {
            display: none;
        }
        
        .progress-reward {
            text-align: center;
            padding: 15px;
            background: #fef3c7;
            border-radius: 10px;
            margin-top: 10px;
        }
        
        .progress-reward-emoji {
            font-size: 40px;
            margin-bottom: 10px;
        }
        
        .progress-reward-text {
            font-size: 14px;
            color: #92400e;
            font-weight: 600;
        }
        
        /* Responsivo */
        @media (max-width: 768px) {
            .progress-widget {
                left: 10px;
                right: 10px;
                bottom: 10px;
                width: auto;
            }
        }
    `,

    // Inicializar
    init: function() {
        this.injectStyles();
        this.checkFirstAccess();
        this.renderProgressWidget();
    },

    // Injetar estilos
    injectStyles: function() {
        if (!document.getElementById('onboarding-styles')) {
            var style = document.createElement('style');
            style.id = 'onboarding-styles';
            style.textContent = this.styles;
            document.head.appendChild(style);
        }
    },

    // Verificar primeiro acesso
    checkFirstAccess: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        var onboardingKey = 'onboarding_' + user.id;
        var onboardingData = JSON.parse(localStorage.getItem(onboardingKey) || 'null');

        if (!onboardingData) {
            // Primeiro acesso - mostrar welcome
            this.showWelcomeModal();
        }
    },

    // Obter usuário atual
    getCurrentUser: function() {
        var userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Mostrar modal de boas-vindas
    showWelcomeModal: function() {
        var user = this.getCurrentUser();
        var nome = user ? user.name.split(' ')[0] : 'Doutor(a)';

        var html = `
            <div class="onboarding-overlay show" id="onboardingOverlay">
                <div class="onboarding-modal">
                    <div class="onboarding-header">
                        <div class="onboarding-emoji">👋</div>
                        <h2>Seja bem-vindo(a), ${nome}!</h2>
                        <p>Vamos personalizar sua experiência com o Dental Ultra</p>
                    </div>
                    <div class="onboarding-body" id="onboardingBody">
                        <div class="onboarding-question">
                            <h3>Qual opção melhor representa o cenário da sua clínica?</h3>
                            <div class="onboarding-options" id="onboardingOptions">
                                <div class="onboarding-option" data-value="nova" onclick="OnboardingSystem.selectOption(this)">
                                    🆕 A clínica é nova e ainda não está atendendo
                                </div>
                                <div class="onboarding-option" data-value="menos1" onclick="OnboardingSystem.selectOption(this)">
                                    📅 A clínica tem menos de 1 ano
                                </div>
                                <div class="onboarding-option" data-value="1a5" onclick="OnboardingSystem.selectOption(this)">
                                    🏢 A clínica tem entre 1 e 5 anos
                                </div>
                                <div class="onboarding-option" data-value="mais5" onclick="OnboardingSystem.selectOption(this)">
                                    🏆 A clínica tem mais de 5 anos
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="onboarding-footer">
                        <button class="onboarding-btn onboarding-btn-skip" onclick="OnboardingSystem.skip()">Pular</button>
                        <button class="onboarding-btn onboarding-btn-next" id="onboardingNext" onclick="OnboardingSystem.next()" disabled>Próxima →</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this.currentStep = 1;
        this.answers = {};
    },

    // Selecionar opção
    selectOption: function(el) {
        var options = document.querySelectorAll('.onboarding-option');
        options.forEach(function(opt) { opt.classList.remove('selected'); });
        el.classList.add('selected');
        document.getElementById('onboardingNext').disabled = false;
        this.selectedValue = el.dataset.value;
    },

    // Próximo passo
    next: function() {
        this.answers['step' + this.currentStep] = this.selectedValue;
        this.currentStep++;

        if (this.currentStep === 2) {
            this.showStep2();
        } else if (this.currentStep === 3) {
            this.finishOnboarding();
        }
    },

    // Passo 2 - número de profissionais
    showStep2: function() {
        var body = document.getElementById('onboardingBody');
        body.innerHTML = `
            <div class="onboarding-question">
                <h3>Quantas pessoas trabalham na clínica?</h3>
                <p style="color:#666;font-size:13px;margin-bottom:15px;">Entre secretárias, dentistas e administradores.</p>
                <div class="onboarding-options" id="onboardingOptions">
                    <div class="onboarding-option" data-value="1" onclick="OnboardingSystem.selectOption(this)">
                        👤 Apenas eu
                    </div>
                    <div class="onboarding-option" data-value="2-3" onclick="OnboardingSystem.selectOption(this)">
                        👥 2 a 3 pessoas
                    </div>
                    <div class="onboarding-option" data-value="4-10" onclick="OnboardingSystem.selectOption(this)">
                        👨‍👩‍👧‍👦 4 a 10 pessoas
                    </div>
                    <div class="onboarding-option" data-value="10+" onclick="OnboardingSystem.selectOption(this)">
                        🏢 Mais de 10 pessoas
                    </div>
                </div>
            </div>
        `;
        document.getElementById('onboardingNext').disabled = true;
        document.getElementById('onboardingNext').textContent = 'Concluir →';
    },

    // Finalizar onboarding
    finishOnboarding: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        var onboardingKey = 'onboarding_' + user.id;
        var data = {
            completedAt: new Date().toISOString(),
            answers: this.answers,
            tasks: {}
        };

        localStorage.setItem(onboardingKey, JSON.stringify(data));

        // Fechar modal
        var overlay = document.getElementById('onboardingOverlay');
        if (overlay) overlay.remove();

        // Mostrar widget de progresso
        this.renderProgressWidget();

        // Mensagem de sucesso
        this.showToast('🎉 Ótimo! Agora complete as tarefas para ganhar seu prêmio!');
    },

    // Pular onboarding
    skip: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        var onboardingKey = 'onboarding_' + user.id;
        var data = {
            skippedAt: new Date().toISOString(),
            tasks: {}
        };

        localStorage.setItem(onboardingKey, JSON.stringify(data));

        var overlay = document.getElementById('onboardingOverlay');
        if (overlay) overlay.remove();

        this.renderProgressWidget();
    },

    // Renderizar widget de progresso
    renderProgressWidget: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        // Remover widget existente
        var existing = document.getElementById('progressWidget');
        if (existing) existing.remove();

        var onboardingKey = 'onboarding_' + user.id;
        var data = JSON.parse(localStorage.getItem(onboardingKey) || '{}');
        var tasks = data.tasks || {};

        // Calcular progresso
        var completed = 0;
        var total = this.tarefas.length;
        var totalPoints = 0;
        var earnedPoints = 0;

        this.tarefas.forEach(function(t) {
            totalPoints += t.pontos;
            if (tasks[t.id]) {
                completed++;
                earnedPoints += t.pontos;
            }
        });

        var percent = Math.round((completed / total) * 100);
        var allCompleted = completed === total;

        var tasksHtml = '';
        var self = this;
        this.tarefas.forEach(function(t) {
            var isCompleted = tasks[t.id];
            tasksHtml += `
                <div class="progress-task ${isCompleted ? 'completed' : ''}" onclick="OnboardingSystem.goToTask('${t.id}', '${t.url}')">
                    <div class="progress-task-check">${isCompleted ? '✓' : ''}</div>
                    <div class="progress-task-info">
                        <div class="progress-task-title">${t.icone} ${t.titulo}</div>
                        <div class="progress-task-points">+${t.pontos} pontos</div>
                    </div>
                    <div class="progress-task-arrow">→</div>
                </div>
            `;
        });

        var rewardHtml = allCompleted ? `
            <div class="progress-reward">
                <div class="progress-reward-emoji">🏆</div>
                <div class="progress-reward-text">Parabéns! Você completou todas as tarefas!</div>
            </div>
        ` : '';

        var html = `
            <div class="progress-widget ${allCompleted ? 'completed' : ''}" id="progressWidget">
                <div class="progress-header" onclick="OnboardingSystem.toggleWidget()">
                    <div class="progress-header-left">
                        <span>${allCompleted ? '🏆' : '🎯'}</span>
                        <div>
                            <div class="progress-header-title">${allCompleted ? 'Missão Completa!' : 'Comece aqui e ganhe um prêmio!'}</div>
                            <div class="progress-header-percent">${percent}% • ${earnedPoints}/${totalPoints} pontos</div>
                        </div>
                    </div>
                    <button class="progress-toggle" id="progressToggle">▼</button>
                </div>
                <div class="progress-content">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    ${tasksHtml}
                    ${rewardHtml}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    // Toggle widget
    toggleWidget: function() {
        var widget = document.getElementById('progressWidget');
        var toggle = document.getElementById('progressToggle');
        
        if (widget.classList.contains('minimized')) {
            widget.classList.remove('minimized');
            toggle.textContent = '▼';
        } else {
            widget.classList.add('minimized');
            toggle.textContent = '▲';
        }
    },

    // Ir para tarefa
    goToTask: function(taskId, url) {
        window.location.href = url;
    },

    // Marcar tarefa como concluída
    completeTask: function(taskId) {
        var user = this.getCurrentUser();
        if (!user) return;

        var onboardingKey = 'onboarding_' + user.id;
        var data = JSON.parse(localStorage.getItem(onboardingKey) || '{}');
        
        if (!data.tasks) data.tasks = {};
        
        if (!data.tasks[taskId]) {
            data.tasks[taskId] = new Date().toISOString();
            localStorage.setItem(onboardingKey, JSON.stringify(data));
            
            // Encontrar pontos da tarefa
            var tarefa = this.tarefas.find(function(t) { return t.id === taskId; });
            if (tarefa) {
                this.showToast('🎉 +' + tarefa.pontos + ' pontos! ' + tarefa.titulo);
            }
            
            // Atualizar widget
            this.renderProgressWidget();
        }
    },

    // Mostrar toast
    showToast: function(message) {
        var toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
};

// Auto-detectar conclusão de tarefas
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar onboarding
    setTimeout(function() {
        OnboardingSystem.init();
        detectarTarefasConcluidas();
    }, 500);
});

// Detectar tarefas concluídas baseado nos dados existentes
function detectarTarefasConcluidas() {
    var user = OnboardingSystem.getCurrentUser();
    if (!user) return;
    
    var path = window.location.pathname;
    
    // Verificar pacientes cadastrados
    try {
        var pacientes = JSON.parse(localStorage.getItem('pacientes_' + user.id) || '[]');
        if (pacientes.length > 0) {
            OnboardingSystem.completeTask('paciente');
        }
    } catch(e) {}
    
    // Verificar agendamentos
    try {
        var agendamentos = JSON.parse(localStorage.getItem('agendamentos_' + user.id) || '[]');
        if (agendamentos.length > 0) {
            OnboardingSystem.completeTask('agendamento');
        }
    } catch(e) {}
    
    // Verificar produtos no estoque
    try {
        var estoque = JSON.parse(localStorage.getItem('estoque_produtos_' + user.id) || '[]');
        if (estoque.length > 0) {
            OnboardingSystem.completeTask('estoque');
        }
    } catch(e) {}
    
    // Verificar orçamentos/planos de tratamento
    try {
        var planos = JSON.parse(localStorage.getItem('planos_' + user.id) || '[]');
        if (planos.length > 0) {
            OnboardingSystem.completeTask('orcamento');
        }
    } catch(e) {}
    
    // Verificar notas fiscais
    try {
        var notas = JSON.parse(localStorage.getItem('notas_' + user.id) || '[]');
        if (notas.length > 0) {
            OnboardingSystem.completeTask('notafiscal');
        }
    } catch(e) {}
    
    // Verificar dados da clínica (se nome está preenchido)
    if (user.clinic && user.clinic.length > 3) {
        OnboardingSystem.completeTask('clinica');
    }
}

// Expor globalmente
window.OnboardingSystem = OnboardingSystem;
