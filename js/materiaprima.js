// ==========================================
// DADOS GLOBAIS DE SUSTENTABILIDADE
// ==========================================
let systemMetrics = {
    wasteDiverted: 15000,      // kg
    co2Reduced: 5000,          // kg
    renewableEnergyGenerated: 2840,  // kWh
    biogasContribution: 15     // %
};

// Dados históricos simulados (últimos 12 meses)
const historicalData = {
    months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    wasteData: [12500, 13000, 13500, 14000, 14200, 14500, 14800, 15000, 15100, 15050, 15200, 15000],
    carbonData: [4200, 4350, 4500, 4650, 4750, 4850, 4950, 5000, 5050, 5100, 5150, 5000]
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    loadMetricsFromStorage();
    updateMetricsDisplay();
    initializeCharts();

    // Interaction: copy metric values on click
    ['wasteDivertedValue','co2ReducedValue','renewableEnergyValue','biogasContributionValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer';
            el.title = 'Clique para copiar o valor';
            el.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(el.textContent);
                    showCollectionNotification('✅ Valor copiado: ' + el.textContent);
                }
            });
        }
    });
});

function updateMetricsDisplay() {
    try {
        const waste = document.getElementById('wasteDivertedValue');
        const co2 = document.getElementById('co2ReducedValue');
        const energy = document.getElementById('renewableEnergyValue');
        const biogas = document.getElementById('biogasContributionValue');
        
        if (waste) waste.textContent = systemMetrics.wasteDiverted.toLocaleString('pt-BR');
        if (co2) co2.textContent = systemMetrics.co2Reduced.toLocaleString('pt-BR');
        if (energy) energy.textContent = systemMetrics.renewableEnergyGenerated.toLocaleString('pt-BR');
        if (biogas) biogas.textContent = systemMetrics.biogasContribution.toFixed(1);
        
        // Persist after display update
        saveMetricsToStorage();
        
        // Update quick-stats
        const mw = document.getElementById('monthlyWaste');
        const mc = document.getElementById('monthlyCO2');
        if (mw) mw.textContent = (systemMetrics.wasteDiverted % 10000).toLocaleString('pt-BR');
        if (mc) mc.textContent = (systemMetrics.co2Reduced % 1000).toLocaleString('pt-BR');
    } catch (error) {
        console.error('Erro ao atualizar métricas:', error);
    }
}

function initializeCharts() {
    // Chart de Resíduos Desviados
    const wasteCtx = document.getElementById('wasteChart');
    if (wasteCtx) {
        window.wasteChart = new Chart(wasteCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: historicalData.months,
                datasets: [{
                    label: 'Resíduos Desviados (kg)',
                    data: historicalData.wasteData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#059669',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#f8fafc',
                            font: { size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const formatted = Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
                                if (label.toLowerCase().includes('resíduos')) return label + ': ' + formatted + ' kg';
                                return label + ': ' + formatted;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { 
                            color: '#cbd5e1', 
                            callback: function(val){ return val + ' kg'; } 
                        }
                    },
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#cbd5e1' }
                    }
                }
            }
        });
    }

    // Chart de Carbono Mitigado
    const carbonCtx = document.getElementById('carbonChart');
    if (carbonCtx) {
        window.carbonChart = new Chart(carbonCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: historicalData.months,
                datasets: [{
                    label: 'Carbono Mitigado (kg CO₂)',
                    data: historicalData.carbonData,
                    backgroundColor: 'rgba(52, 211, 153, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#f8fafc',
                            font: { size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const formatted = Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
                                if (label.toLowerCase().includes('carbono')) return label + ': ' + formatted + ' kg CO₂';
                                return label + ': ' + formatted;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { 
                            color: '#cbd5e1', 
                            callback: function(val){ return val + ' kg CO₂'; } 
                        }
                    },
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#cbd5e1' }
                    }
                }
            }
        });
    }
}

// ==========================================
// PERSISTÊNCIA E UTILITÁRIAS
// ==========================================
function saveMetricsToStorage() {
    try {
        localStorage.setItem('systemMetrics', JSON.stringify(systemMetrics));
    } catch (e) {
        console.error('Erro ao salvar métricas:', e);
    }
}

function loadMetricsFromStorage() {
    try {
        const raw = localStorage.getItem('systemMetrics');
        if (raw) {
            const parsed = JSON.parse(raw);
            systemMetrics = Object.assign(systemMetrics, parsed);
        }
    } catch (e) {
        console.error('Erro ao carregar métricas:', e);
    }
}

// ==========================================
// FUNCIONALIDADES INTERATIVAS
// ==========================================
function simulateMaterialsCollection() {
    // Simula coleta aleatória de materiais
    const iron = Math.random() * 150;
    const glass = Math.random() * 100;
    const organic = Math.random() * 200;
    const total = iron + glass + organic;
    
    systemMetrics.wasteDiverted += total;
    systemMetrics.co2Reduced += total * 0.1;
    
    updateMetricsDisplay();
    pulseMetricCard('wasteDivertedValue');
    showCollectionNotification(`Coleta registrada: ${total.toFixed(1)}kg de materiais`);
}

function pulseMetricCard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const metricCard = element.closest('.metric-card');
        if (metricCard) {
            metricCard.classList.add('updating');
            setTimeout(() => {
                metricCard.classList.remove('updating');
            }, 500);
        }
    }
}

function showCollectionNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.animation = 'slideIn 0.3s ease-out';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function exportMetricsReport() {
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR');
    const filenameTime = now.getFullYear().toString() + 
                        String(now.getMonth()+1).padStart(2,'0') + 
                        String(now.getDate()).padStart(2,'0') + '_' + 
                        String(now.getHours()).padStart(2,'0') + 
                        String(now.getMinutes()).padStart(2,'0') + 
                        String(now.getSeconds()).padStart(2,'0');
    
    const report = `
🌱 RELATÓRIO DE SUSTENTABILIDADE - ${timestamp}
═════════════════════════════════════════════════════

📊 MÉTRICAS GLOBAIS:
• Resíduos Desviados: ${systemMetrics.wasteDiverted.toLocaleString('pt-BR')} kg
• Carbono Mitigado: ${systemMetrics.co2Reduced.toLocaleString('pt-BR')} kg CO₂
• Energia Renovável: ${systemMetrics.renewableEnergyGenerated.toLocaleString('pt-BR')} kWh
• Contribuição Biogás: ${systemMetrics.biogasContribution.toFixed(1)}%

RESUMO:
• Total de Métricas Registradas: ${Object.keys(systemMetrics).length}
• Resíduos Desviados (formatado): ${systemMetrics.wasteDiverted.toLocaleString('pt-BR')} kg
• Carbono Mitigado (formatado): ${systemMetrics.co2Reduced.toLocaleString('pt-BR')} kg CO₂

♻️ IMPACTO AMBIENTAL (exemplo):
• Ferro Reciclável: 3.500 kg
• Vidro Reciclável: 2.200 kg
• Material Orgânico: 9.300 kg
• Água Preservada: 7.500 m³
• Árvores Economizadas: 125
• Energia Gerada: ${systemMetrics.renewableEnergyGenerated.toLocaleString('pt-BR')} kWh

═════════════════════════════════════════════════════
Relatório gerado automaticamente pelo Sistema SmartCity
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustentabilidade_${filenameTime}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showCollectionNotification('✅ Relatório exportado com sucesso!');
}

function refreshData() {
    // Animação de rotação
    const btn = document.querySelector('.refresh-btn');
    if (btn) {
        btn.style.animation = 'spin 0.6s ease-in-out';
        
        setTimeout(() => {
            // Simular atualização de dados
            updateMetricsDisplay();
            showCollectionNotification('🔄 Dados atualizados com sucesso!');
        }, 600);
    }
}

// ==========================================
// CONTROLES DE NAVEGAÇÃO
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
    closeLogoutPopup();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

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
//O código gerencia todas as métricas de sustentabilidade do dashboard, atualiza os valores na tela e salva tudo no localStorage. Ele também cria gráficos, simula coletas de materiais, mostra notificações e permite exportar um relatório. Além disso, controla funções como tema claro/escuro, sidebar e logout, mantendo toda a parte de sustentabilidade funcional e interativa.
