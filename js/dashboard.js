// === GLOBAL VARIABLES ===
let systemChart;
let systemMetrics = {
    criticalDrains: 8.00,
    positiveImpact: 78.5,
    activeSensors: 1847,
    uptime: 99.80,
    dataProcessed: 847,
    responseTime: 142,
    alerts: 3
};

// === AUTHENTICATION ===
function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('userName', 'Admin');
    }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initDashboard();
    initializeChart();
    
    setTimeout(() => {
        startRealTimeUpdates();
    }, 100);
    
    addLog('🚀 Dashboard Bueiros Inteligente inicializado', 'success');
    addLog('📊 Conectando com sistemas da cidade...', 'info');
    addLog('🌐 Todos os sistemas online', 'success');
    
    document.querySelectorAll('.overview-card, .card').forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate-slide-in');
        }, index * 100);
    });
});

function initDashboard() {
    updateOverviewCards();
    updateSystemMetrics();
    loadInitialLogs();
}

// === UPDATE FUNCTIONS ===
function updateOverviewCards() {
    document.getElementById('criticalDrains').textContent = systemMetrics.criticalDrains.toFixed(2) + '%';
    document.getElementById('positiveImpact').textContent = systemMetrics.positiveImpact.toFixed(1) + '%';
    document.getElementById('activeSensors').textContent = systemMetrics.activeSensors.toLocaleString();
}

function updateSystemMetrics() {
    document.getElementById('systemUptime').textContent = systemMetrics.uptime.toFixed(2) + '%';
    document.getElementById('dataProcessed').textContent = systemMetrics.dataProcessed;
    document.getElementById('responseTime').textContent = systemMetrics.responseTime;
    document.getElementById('alerts').textContent = systemMetrics.alerts;
}

// === CHART INITIALIZATION ===
function initializeChart() {
    const ctx = document.getElementById('systemChart').getContext('2d');
    
    systemChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [
                {
                    label: 'Bueiros',
                    data: [78, 82, 85, 88, 91, 89, 92],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Impacto Positivo (%)',
                    data: [65, 70, 85, 95, 92, 88, 91],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Sensores',
                    data: [85, 87, 92, 95, 97, 94, 96],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc',
                        font: { size: 12, weight: '500' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#10b981',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                },
                x: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            elements: {
                point: { radius: 3, hoverRadius: 5 }
            }
        }
    });
}

// === LOGS ===
function loadInitialLogs() {
    const initialLogs = [
        { message: '💚 Impacto positivo médio: 94%', type: 'success' },
        { message: '🕳️ Verificação 1.240 bueiros concluída', type: 'info' },
        { message: '📈 Pico de impacto positivo registrado às 18:30', type: 'warning' },
        { message: '📊 Backup de dados realizado com sucesso', type: 'success' },
        { message: '🌡️ Sensores de temperatura normais', type: 'info' },
        { message: '🔄 Sincronização do sistema ativa', type: 'success' },
        { message: '🚨 3 bueiros necessitam atenção no setor norte', type: 'warning' }
    ];

    initialLogs.forEach(log => {
        addLog(log.message, log.type);
    });
}

function addLog(message, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const typeIcons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const typeColors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span style="color: ${typeColors[type]}; margin: 0 0.5rem;">${typeIcons[type]}</span>
        <span style="color: ${type === 'error' ? '#fca5a5' : 'var(--text-primary)'};">${message}</span>
    `;
    
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        logContainer.removeChild(entries[entries.length - 1]);
    }
    
    logContainer.scrollTop = 0;
}

function addRandomLog() {
    const randomLogs = [
        { message: '📡 Conectividade rede otimizada', type: 'info' },
        { message: '🔧 Manutenção preventiva setor 3', type: 'warning' },
        { message: '🌱 Impacto positivo (%) na operação urbana', type: 'success' },
        { message: '🚨 Bueiro obstruído setor 7 - equipe despachada', type: 'warning' },
        { message: '🌐 Firmware atualizado 47 dispositivos', type: 'info' },
        { message: '💾 Backup incremental concluído', type: 'success' },
        { message: '🔋 Otimização do impacto positivo (%)', type: 'success' },
        { message: '📊 Relatório performance gerado', type: 'info' },
        { message: '🌡️ Variação térmica painel solar B', type: 'warning' },
        { message: '🕳️ Limpeza automática bueiros ativada', type: 'info' }
    ];
    
    const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
    addLog(randomLog.message, randomLog.type);
}

// === REAL-TIME UPDATES ===
function startRealTimeUpdates() {
    setInterval(simulateOverviewData, 10000);
    setInterval(addRandomLog, 15000);
    setInterval(updateChartData, 30000);
    
    addLog('🔄 Monitoramento tempo real ativo', 'success');
}

function simulateOverviewData() {
    const drainChange = (Math.random() - 0.5) * 2;
    systemMetrics.criticalDrains = Math.max(0, Math.min(15, systemMetrics.criticalDrains + drainChange));
    
    const impactChange = (Math.random() - 0.5) * 5;
    systemMetrics.positiveImpact = Math.max(50, Math.min(100, systemMetrics.positiveImpact + impactChange));
    
    const sensorChange = Math.floor(Math.random() * 10) - 5;
    systemMetrics.activeSensors = Math.max(1800, systemMetrics.activeSensors + sensorChange);
    
    const dataChange = Math.floor(Math.random() * 20) - 10;
    systemMetrics.dataProcessed = Math.max(800, systemMetrics.dataProcessed + dataChange);
    
    const responseChange = Math.floor(Math.random() * 20) - 10;
    systemMetrics.responseTime = Math.max(100, Math.min(200, systemMetrics.responseTime + responseChange));
    
    const uptimeChange = (Math.random() - 0.5) * 0.2;
    systemMetrics.uptime = Math.max(98.0, Math.min(100.0, systemMetrics.uptime + uptimeChange));
    
    const alertChange = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    systemMetrics.alerts = Math.max(0, Math.min(10, systemMetrics.alerts + alertChange));
    
    updateOverviewCards();
    updateSystemMetrics();
}

function updateChartData() {
    if (systemChart && systemChart.data && systemChart.data.datasets) {
        const datasets = systemChart.data.datasets;
        
        datasets.forEach(dataset => {
            dataset.data.shift();
            dataset.data.push(Math.floor(Math.random() * 20) + 80);
        });
        
        systemChart.update('none');
        addLog('📈 Performance atualizada', 'info');
    }
}

// === ACTION HANDLERS ===
function handleSync() {
    addLog('🔄 Iniciando sincronização geral...', 'info');
    
    setTimeout(() => addLog('🕳️ Sincronização bueiros - OK', 'success'), 1000);
    setTimeout(() => addLog('⚡ Sincronização impacto positivo - OK', 'success'), 2000);
    setTimeout(() => addLog('🌡️ Sincronização sensores - OK', 'success'), 3000);
    
    setTimeout(() => {
        addLog('✅ Sincronização concluída', 'success');
        systemMetrics.uptime = 99.9;
        systemMetrics.responseTime = Math.max(100, systemMetrics.responseTime - 20);
        updateSystemMetrics();
    }, 4000);
}

function openQueue() {
    addLog('📋 Abrindo central solicitações...', 'info');
    
    const requestCount = {
        bueiros: Math.floor(Math.random() * 15) + 8,
        positiveImpact: Math.floor(Math.random() * 12) + 5,
        sensores: Math.floor(Math.random() * 8) + 3,
        manutencao: Math.floor(Math.random() * 6) + 2,
        calibracao: Math.floor(Math.random() * 4) + 1
    };

    const total = Object.values(requestCount).reduce((sum, count) => sum + count, 0);

    const queueContent = `
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">🕳️ Manutenção Bueiros</div>
                <div class="info-value">${requestCount.bueiros} pendentes</div>
            </div>
            <div class="info-item">
                <div class="info-label">🌱 Impacto Positivo</div>
                <div class="info-value">${requestCount.positiveImpact}%</div>
            </div>
            <div class="info-item">
                <div class="info-label">🌡️ Calibração Sensores</div>
                <div class="info-value">${requestCount.sensores} pendentes</div>
            </div>
            <div class="info-item">
                <div class="info-label">🔧 Manutenção Geral</div>
                <div class="info-value">${requestCount.manutencao} pendentes</div>
            </div>
            <div class="info-item">
                <div class="info-label">⚙️ Calibrações</div>
                <div class="info-value">${requestCount.calibracao} pendentes</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1; background: rgba(16, 185, 129, 0.1); border-color: var(--primary-green);">
                <div class="info-label">📊 Total de Solicitações</div>
                <div class="info-value" style="font-size: 1.5rem; color: var(--primary-green);">${total} itens na fila</div>
            </div>
        </div>
        <div style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(15, 23, 42, 0.5); border-radius: 12px; border: 1px solid var(--glass-border);">
            <h4 style="color: var(--primary-green); margin-bottom: 1rem;">
                ⏳ Próximas Solicitações em Processamento
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                Aguarde enquanto processamos sua solicitação. Tempo estimado: 2-5 minutos.
            </p>
        </div>
    `;
    
    document.getElementById('queueModalBody').innerHTML = queueContent;
    document.getElementById('queueModal').style.display = 'block';
}

function generateReport() {
    addLog('📊 Gerando relatório detalhado...', 'info');
    
    const reportDate = new Date().toLocaleDateString('pt-BR');
    const reportTime = new Date().toLocaleTimeString('pt-BR');

    const reportContent = `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary-green); margin-bottom: 0.75rem;">📋 Informações do Relatório</h4>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Data de Geração</div>
                    <div class="info-value">${reportDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Hora</div>
                    <div class="info-value">${reportTime}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Período</div>
                    <div class="info-value">Últimas 24h</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: var(--primary-green);">✅ Completo</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary-green); margin-bottom: 0.75rem;">📊 Métricas de Desempenho</h4>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Uptime do Sistema</div>
                    <div class="info-value">${systemMetrics.uptime.toFixed(2)}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Processamento de Dados</div>
                    <div class="info-value">${systemMetrics.dataProcessed} GB</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tempo de Resposta</div>
                    <div class="info-value">${systemMetrics.responseTime} ms</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Alertas Ativos</div>
                    <div class="info-value">${systemMetrics.alerts}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary-green); margin-bottom: 0.75rem;">🕳️ Análise de Bueiros</h4>
            <div class="info-grid">
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Bueiros Críticos</div>
                    <div class="info-value">${systemMetrics.criticalDrains.toFixed(2)}%</div>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">47 de 1.240 bueiros necessitam atenção imediata</p>
                </div>
            </div>
        </div>

        <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">✅ Relatório gerado com sucesso!</p>
            <button class="action-btn btn-primary" style="width: 100%;" onclick="downloadReport()">
                📥 Baixar Relatório em PDF
            </button>
        </div>
    `;

    document.getElementById('reportModalBody').innerHTML = reportContent;
    document.getElementById('reportModal').style.display = 'block';
    addLog('✅ Relatório gerado com sucesso', 'success');
}

function downloadReport() {
    addLog('📥 Iniciando download do relatório...', 'info');
    setTimeout(() => {
        addLog('✅ Relatório baixado: relatorio_' + new Date().getTime() + '.pdf', 'success');
    }, 1500);
}

// === MODAL FUNCTIONS ===
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// === LOGOUT FUNCTIONS ===
function showLogoutPopup() {
    document.getElementById('logoutPopup').classList.add('active');
}

function closeLogoutPopup() {
    document.getElementById('logoutPopup').classList.remove('active');
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    addLog('👋 Logout realizado', 'info');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-toggle');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeButton.textContent = '☀️';
        themeButton.title = 'Modo escuro';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeButton.textContent = '🌙';
        themeButton.title = 'Modo claro';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const themeButton = document.querySelector('.theme-toggle');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeButton) themeButton.textContent = '☀️';
    } else {
        body.classList.add('dark-mode');
        if (themeButton) themeButton.textContent = '🌙';
    }
});

// === SIDEBAR TOGGLE ===
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// === NAVIGATION ===
function navigateTo(page) {
    window.location.href = page;
}

// === TEST FUNCTIONS ===
function testNotif() {
    const notif = document.createElement('div');
    notif.textContent = '✅ Notificação de Teste';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
    addLog('📢 Teste de notificação disparado', 'info');
}

function testPulse() {
    const card = document.querySelector('.overview-card');
    if (card) {
        card.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            card.style.animation = '';
        }, 500);
    }
    addLog('💫 Efeito pulsação testado', 'info');
}

function testSpin() {
    const btn = document.querySelector('.action-btn');
    if (btn) {
        btn.style.animation = 'spin 0.6s ease-in-out';
        setTimeout(() => {
            btn.style.animation = '';
        }, 600);
    }
    addLog('⟳ Teste de rotação disparado', 'info');
}