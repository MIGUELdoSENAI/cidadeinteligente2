// ==========================================
// DADOS E ESTADO GLOBAL
// ==========================================
let instalacoes = [
    { id: 'E-001', local: 'Prédio Principal', consumo: 85, eficiencia: 94, status: 'normal', ultima_leitura: '2024-12-04 14:35' },
    { id: 'E-002', local: 'Ala Administrativa', consumo: 62, eficiencia: 91, status: 'normal', ultima_leitura: '2024-12-04 14:30' },
    { id: 'E-003', local: 'Centro de Dados', consumo: 156, eficiencia: 89, status: 'warning', ultima_leitura: '2024-12-04 14:28' },
    { id: 'E-004', local: 'Bloco de Laboratórios', consumo: 98, eficiencia: 93, status: 'normal', ultima_leitura: '2024-12-04 14:32' },
    { id: 'E-005', local: 'Biblioteca', consumo: 45, eficiencia: 96, status: 'normal', ultima_leitura: '2024-12-04 14:33' },
    { id: 'E-006', local: 'Auditório', consumo: 72, eficiencia: 90, status: 'normal', ultima_leitura: '2024-12-04 14:29' },
    { id: 'E-007', local: 'Cantina', consumo: 125, eficiencia: 88, status: 'critical', ultima_leitura: '2024-12-04 14:26' },
    { id: 'E-008', local: 'Ginásio', consumo: 203, eficiencia: 85, status: 'warning', ultima_leitura: '2024-12-04 14:27' },
    { id: 'E-009', local: 'Parque de Estacionamento', consumo: 45, eficiencia: 95, status: 'normal', ultima_leitura: '2024-12-04 14:34' },
    { id: 'E-010', local: 'Oficina de Manutenção', consumo: 112, eficiencia: 92, status: 'normal', ultima_leitura: '2024-12-04 14:31' },
    { id: 'E-011', local: 'Espaço Externo - Iluminação', consumo: 35, eficiencia: 97, status: 'normal', ultima_leitura: '2024-12-04 14:36' },
    { id: 'E-012', local: 'Sistema de Backup', consumo: 87, eficiencia: 91, status: 'normal', ultima_leitura: '2024-12-04 14:25' }
];

let alerts = [];
let chart;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    renderInstalacoes();
    updateStatistics();
    initializeChart();
    startRealTimeUpdates();
    setupEventListeners();
});

function setupEventListeners() {
    // Event listeners para busca e filtro
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Implementar busca
            console.log('Busca:', this.value);
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            // Implementar filtro
            console.log('Filtro:', this.value);
        });
    }
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================
function renderInstalacoes() {
    const grid = document.getElementById('energiaGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    instalacoes.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'energia-card';
        card.innerHTML = `
            <div class="energia-header">
                <span class="energia-id">${inst.id}</span>
                <span class="energia-status status-${inst.status}">${inst.status.toUpperCase()}</span>
            </div>
            <div class="energia-info">
                <div class="info-item">
                    <span class="info-label">Local:</span>
                    <span class="info-value">${inst.local}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Consumo:</span>
                    <span class="info-value">${inst.consumo.toFixed(1)} kW</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Eficiência:</span>
                    <span class="info-value">${inst.eficiencia.toFixed(1)}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Última Leitura:</span>
                    <span class="info-value">${inst.ultima_leitura}</span>
                </div>
            </div>
            <div class="energia-actions">
                <button class="btn-small btn-details" onclick="showDetails('${inst.id}')">Detalhes</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateStatistics() {
    const totalConsumo = instalacoes.reduce((sum, inst) => sum + inst.consumo, 0);
    const eficienciaMedia = (instalacoes.reduce((sum, inst) => sum + inst.eficiencia, 0) / instalacoes.length).toFixed(1);

    const totalInstalacoesEl = document.getElementById('totalInstalacoes');
    const consumoTotalEl = document.getElementById('consumoTotal');
    const eficienciaEl = document.getElementById('eficiencia');
    
    if (totalInstalacoesEl) totalInstalacoesEl.textContent = instalacoes.length;
    if (consumoTotalEl) consumoTotalEl.textContent = totalConsumo.toFixed(1) + ' kW';
    if (eficienciaEl) eficienciaEl.textContent = eficienciaMedia + '%';

    checkAlerts();
}

function checkAlerts() {
    const critical = instalacoes.filter(i => i.status === 'critical');
    const warning = instalacoes.filter(i => i.status === 'warning');

    let alertHTML = '';
    critical.forEach(inst => {
        alertHTML += `<div class="alert-item">🚨 CRÍTICO: ${inst.id} - ${inst.local} (${inst.consumo.toFixed(1)} kW)<div class="alert-time">Agora</div></div>`;
    });
    warning.forEach(inst => {
        alertHTML += `<div class="alert-item">⚠️ AVISO: ${inst.id} - ${inst.local} (${inst.consumo.toFixed(1)} kW)<div class="alert-time">Agora</div></div>`;
    });

    const alertsListEl = document.getElementById('alertsList');
    if (alertsListEl) {
        alertsListEl.innerHTML = alertHTML || '<div class="alert-item">✅ Sem alertas</div>';
    }
}

function initializeChart() {
    const ctx = document.getElementById('energiaChart');
    if (!ctx) return;

    const labels = instalacoes.map(i => i.id).slice(0, 8);
    const consumos = instalacoes.map(i => i.consumo).slice(0, 8);
    const eficiencias = instalacoes.map(i => i.eficiencia).slice(0, 8);

    chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Consumo (kW)',
                    data: consumos,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Eficiência (%)',
                    data: eficiencias,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (label.includes('Consumo')) return label + ': ' + value.toFixed(1) + ' kW';
                            if (label.includes('Eficiência')) return label + ': ' + value.toFixed(1) + ' %';
                            return label + ': ' + value;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#f8fafc', 
                        callback: function(value){ return value + ' kW'; } 
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: { 
                        color: '#3b82f6', 
                        callback: function(value){ return value + ' %'; } 
                    },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: '#f8fafc' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ==========================================
// FUNÇÕES DE MODAL
// ==========================================
function showDetails(id) {
    const inst = instalacoes.find(i => i.id === id);
    if (!inst) return;

    document.getElementById('detailId').textContent = inst.id;
    document.getElementById('detailLocal').textContent = inst.local;
    document.getElementById('detailConsumo').textContent = inst.consumo.toFixed(1);
    document.getElementById('detailEficiencia').textContent = inst.eficiencia.toFixed(1);
    document.getElementById('detailStatus').textContent = inst.status.toUpperCase();
    document.getElementById('detailLeitura').textContent = inst.ultima_leitura;
    
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==========================================
// FUNÇÕES DE RELATÓRIO
// ==========================================
function generateReport() {
    const now = new Date();
    const timestamp = now.toLocaleString();
    const filenameTime = now.getFullYear().toString() + 
                        String(now.getMonth()+1).padStart(2,'0') + 
                        String(now.getDate()).padStart(2,'0') + '_' + 
                        String(now.getHours()).padStart(2,'0') + 
                        String(now.getMinutes()).padStart(2,'0') + 
                        String(now.getSeconds()).padStart(2,'0');
    
    const reportHeader = `RELATÓRIO DE ENERGIA - ${timestamp}\n\n`;
    const details = instalacoes.map(i => 
        `${i.id} - ${i.local}: ${i.consumo.toFixed(1)} kW (${i.eficiencia.toFixed(1)}%)`
    ).join('\n');
    
    const totalConsumo = instalacoes.reduce((sum, i) => sum + i.consumo, 0).toFixed(1);
    const eficienciaMedia = (instalacoes.reduce((sum, i) => sum + i.eficiencia, 0) / instalacoes.length).toFixed(1);
    
    const footer = `\n\nTotal de Instalações: ${instalacoes.length}\nConsumo Total (instantâneo): ${totalConsumo} kW\nEficiência Média: ${eficienciaMedia} %\n`;
    const content = reportHeader + details + footer;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_energia_${filenameTime}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ==========================================
// ATUALIZAÇÃO EM TEMPO REAL
// ==========================================
function startRealTimeUpdates() {
    setInterval(() => {
        instalacoes.forEach(inst => {
            inst.consumo += Math.random() * 10 - 5;
            inst.eficiencia += Math.random() * 2 - 1;
            inst.consumo = Math.max(20, Math.min(300, inst.consumo));
            inst.eficiencia = Math.max(80, Math.min(100, inst.eficiencia));
            
            // Atualizar status baseado nos valores
            if (inst.consumo > 150 || inst.eficiencia < 85) {
                inst.status = 'critical';
            } else if (inst.consumo > 100 || inst.eficiencia < 90) {
                inst.status = 'warning';
            } else {
                inst.status = 'normal';
            }
        });
        renderInstalacoes();
        updateStatistics();
    }, 5000);
}

// ==========================================
// FUNÇÕES DE LOGOUT
// ==========================================
function showLogoutPopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) {
        popup.classList.add('active');
    }
}

function closeLogoutPopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// ==========================================
// FUNÇÕES DE TEMA
// ==========================================
function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-toggle');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (themeButton) {
            themeButton.textContent = '☀️';
            themeButton.title = 'Modo escuro';
        }
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (themeButton) {
            themeButton.textContent = '🌙';
            themeButton.title = 'Modo claro';
        }
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

// ==========================================
// FUNÇÕES DE SIDEBAR
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// ==========================================
// FUNÇÕES DE TESTE
// ==========================================
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
}

function testPulse() {
    const card = document.querySelector('.energia-card');
    if (card) {
        card.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            card.style.animation = '';
        }, 500);
    }
}

function testSpin() {
    const btn = document.querySelector('.btn-primary');
    if (btn) {
        btn.style.animation = 'spin 0.6s ease-in-out';
        setTimeout(() => {
            btn.style.animation = '';
        }, 600);
    }
}