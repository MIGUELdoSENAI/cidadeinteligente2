// ==========================================
// FUNÇÕES DE LOGOUT E THEME
// ==========================================
function showLogoutPopup() {
    document.getElementById('logoutPopup').classList.add('active');
}

function closeLogoutPopup() {
    document.getElementById('logoutPopup').classList.remove('active');
}

function logout() {
    closeLogoutPopup();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.transform = sidebar.style.transform === 'translateX(-100%)' ? 'translateX(0)' : 'translateX(-100%)';
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

// ==========================================
// DADOS E ESTADO GLOBAL
// ==========================================
let bueiros = [
    { id: 'B001', location: 'Av. Paulista, 1000', capacity: 15.47, odor: 'baixo', lastMaintenance: '2024-09-15', critical: false },
    { id: 'B002', location: 'Rua Augusta, 500', capacity: 45.23, odor: 'médio', lastMaintenance: '2024-09-12', critical: false },
    { id: 'B003', location: 'Largo do Arouche, 100', capacity: 75.89, odor: 'alto', lastMaintenance: '2024-09-10', critical: false },
    { id: 'B004', location: 'Av. Faria Lima, 2000', capacity: 85.12, odor: 'crítico', lastMaintenance: '2024-09-08', critical: true },
    { id: 'B005', location: 'Rua da Consolação, 800', capacity: 25.67, odor: 'baixo', lastMaintenance: '2024-09-14', critical: false },
    { id: 'B006', location: 'Av. Ibirapuera, 1500', capacity: 90.34, odor: 'crítico', lastMaintenance: '2024-09-05', critical: true },
    { id: 'B007', location: 'Rua Oscar Freire, 300', capacity: 35.78, odor: 'médio', lastMaintenance: '2024-09-13', critical: false },
    { id: 'B008', location: 'Av. Rebouças, 1200', capacity: 60.45, odor: 'alto', lastMaintenance: '2024-09-11', critical: false },
    { id: 'B009', location: 'Largo São Bento, 50', capacity: 95.21, odor: 'crítico', lastMaintenance: '2024-09-03', critical: true },
    { id: 'B010', location: 'Av. Ipiranga, 900', capacity: 20.89, odor: 'baixo', lastMaintenance: '2024-09-16', critical: false }
];

let alerts = [];
let logs = [];
let chart;
let currentFilter = '';
let currentSearch = '';
let currentBueiroId = '';

// ==========================================
// MÉTRICAS GLOBAIS DE SUSTENTABILIDADE
// ==========================================
let systemMetrics = {
    wasteDiverted: 15000,      // kg
    co2Reduced: 5000,          // kg
    renewableEnergyGenerated: 2840,  // kWh
    biogasContribution: 15     // %
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    setupEventListeners();
    startSimulation();
});

function initializeSystem() {
    renderBueirosGrid();
    updateStatistics();
    initializeChart();
    checkAlerts();
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
    
    // Event listeners para os inputs de matéria-prima
    document.getElementById('ironInput').addEventListener('input', updateMaterialsTotal);
    document.getElementById('glassInput').addEventListener('input', updateMaterialsTotal);
    document.getElementById('organicInput').addEventListener('input', updateMaterialsTotal);
}

// ==========================================
// FORMATAÇÃO DE NÚMEROS
// ==========================================
function formatNumber(value, decimals = 2) {
    return Number(value).toFixed(decimals);
}

// ==========================================
// RENDERIZAÇÃO DE BUEIROS
// ==========================================
function renderBueirosGrid() {
    const grid = document.getElementById('bueirosGrid');
    const filteredBueiros = filterBueiros();
    
    grid.innerHTML = '';
    
    filteredBueiros.forEach(bueiro => {
        const card = createBueiroCard(bueiro);
        grid.appendChild(card);
    });

    document.getElementById('bueirosCount').textContent = `${filteredBueiros.length} bueiros`;
}

function createBueiroCard(bueiro) {
    const card = document.createElement('div');
    card.className = `bueiro-card ${bueiro.critical ? 'critical' : ''}`;
    card.setAttribute('data-bueiro-id', bueiro.id);
    
    const status = getStatus(bueiro.capacity);
    const progressClass = getProgressClass(bueiro.capacity);
    const statusClass = getStatusClass(status);
    
    card.innerHTML = `
        <div class="bueiro-header">
            <div class="bueiro-id">${bueiro.id}</div>
            <div class="bueiro-status ${statusClass}">${status}</div>
        </div>
        <div class="bueiro-location">📍 ${bueiro.location}</div>
        <div class="capacity-section">
            <div class="capacity-label">
                <span>Capacidade</span>
                <span>${formatNumber(bueiro.capacity)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${bueiro.capacity}%"></div>
            </div>
        </div>
        <div class="bueiro-info">
            <div class="info-item">
                <span class="info-label">Odor:</span>
                <span class="info-value">${bueiro.odor}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Última Manutenção:</span>
                <span class="info-value">${formatDate(bueiro.lastMaintenance)}</span>
            </div>
        </div>
        <div class="bueiro-actions">
            <button class="btn-small btn-maintenance" onclick="markMaintenance('${bueiro.id}')">
                🔧 Manutenção
            </button>
            <button class="btn-small btn-details" onclick="showDetails('${bueiro.id}')">
                👁️ Detalhes
            </button>
        </div>
    `;

    // Adicionar tooltip
    card.addEventListener('mouseenter', (e) => showTooltip(e, bueiro));
    card.addEventListener('mouseleave', hideTooltip);

    return card;
}

// ==========================================
// FUNÇÕES DE UTILIDADE
// ==========================================
function getStatus(capacity) {
    if (capacity >= 80) return 'critical';
    if (capacity >= 50) return 'warning';
    return 'normal';
}

function getStatusClass(status) {
    switch(status) {
        case 'critical': return 'status-critical';
        case 'warning': return 'status-warning';
        default: return 'status-normal';
    }
}

function getProgressClass(capacity) {
    if (capacity >= 80) return 'progress-critical';
    if (capacity >= 50) return 'progress-warning';
    return 'progress-normal';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ==========================================
// FILTROS E BUSCA
// ==========================================
function filterBueiros() {
    let filtered = bueiros;

    if (currentSearch) {
        filtered = filtered.filter(b => 
            b.id.toLowerCase().includes(currentSearch.toLowerCase()) ||
            b.location.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    if (currentFilter) {
        filtered = filtered.filter(b => getStatus(b.capacity) === currentFilter);
    }

    return filtered;
}

function handleSearch(event) {
    currentSearch = event.target.value;
    renderBueirosGrid();
    addLog(`Busca aplicada: "${currentSearch}"`);
}

function handleFilter(event) {
    currentFilter = event.target.value;
    renderBueirosGrid();
    addLog(`Filtro aplicado: ${currentFilter || 'Todos'}`);
}

// ==========================================
// MODAIS
// ==========================================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// DETALHES DO BUEIRO
// ==========================================
function showDetails(bueiroId) {
    const bueiro = bueiros.find(b => b.id === bueiroId);
    if (!bueiro) return;

    const detailsContent = document.getElementById('detailsContent');
    const estimatedTime = calculateFillTime(bueiro.capacity);
    const status = getStatus(bueiro.capacity);
    
    detailsContent.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">🆔 ID do Bueiro</span>
            <span class="detail-value">${bueiro.id}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📍 Localização</span>
            <span class="detail-value">${bueiro.location}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📊 Capacidade Atual</span>
            <span class="detail-value">${formatNumber(bueiro.capacity)}%</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">🚨 Status</span>
            <span class="detail-value">${status.toUpperCase()}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">👃 Nível de Odor</span>
            <span class="detail-value">${bueiro.odor.toUpperCase()}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">🔧 Última Manutenção</span>
            <span class="detail-value">${formatDate(bueiro.lastMaintenance)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">⏱️ Tempo para Encher</span>
            <span class="detail-value">${estimatedTime}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">⚠️ Situação Crítica</span>
            <span class="detail-value">${bueiro.critical ? 'SIM' : 'NÃO'}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📈 Capacidade Restante</span>
            <span class="detail-value">${formatNumber(100 - bueiro.capacity)}%</span>
        </div>
    `;

    showModal('detailsModal');
    addLog(`Detalhes visualizados: ${bueiroId}`);
}

// ==========================================
// MANUTENÇÃO E PROCESSO
// ==========================================
function markMaintenance(bueiroId) {
    const bueiro = bueiros.find(b => b.id === bueiroId);
    if (!bueiro) return;

    // Mostrar modal do processo
    showModal('maintenanceModal');
    
    // Iniciar animação do processo
    startMaintenanceProcess(bueiroId);
    
    addLog(`Processo de manutenção iniciado: ${bueiroId}`);
}

function startMaintenanceProcess(bueiroId) {
    const steps = ['step1', 'step2', 'step3', 'step3-5', 'step4', 'step5'];
    const progressBar = document.getElementById('processProgressBar');
    let currentStep = 0;

    // Reset estados
    steps.forEach(stepId => {
        const step = document.getElementById(stepId);
        if (step) step.classList.remove('active', 'completed');
    });
    progressBar.style.width = '0%';

    const processInterval = setInterval(() => {
        if (currentStep > 0) {
            const prevStep = document.getElementById(steps[currentStep - 1]);
            if (prevStep) {
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
            }
        }

        if (currentStep < steps.length) {
            const currentStepEl = document.getElementById(steps[currentStep]);
            if (currentStepEl) currentStepEl.classList.add('active');
            progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
            currentStep++;
        } else {
            clearInterval(processInterval);
            
            // Finalizar processo
            setTimeout(() => {
                finalizeMaintenance(bueiroId);
                closeModal('maintenanceModal');
            }, 1500);
        }
    }, 2000);
}

function finalizeMaintenance(bueiroId) {
    const bueiro = bueiros.find(b => b.id === bueiroId);
    if (!bueiro) return;

    const oldCapacity = bueiro.capacity;
    bueiro.capacity = Math.max(0, bueiro.capacity - 80);
    bueiro.lastMaintenance = new Date().toISOString().split('T')[0];
    bueiro.critical = bueiro.capacity >= 80;

    renderBueirosGrid();
    updateStatistics();
    
    // Aplicar animação ao card do bueiro
    setTimeout(() => {
        const card = document.querySelector(`[data-bueiro-id="${bueiroId}"]`);
        if (card) {
            card.classList.add('cleaning-animation');
            setTimeout(() => {
                card.classList.remove('cleaning-animation');
            }, 600);
        }
    }, 100);
    
    addLog(`Manutenção concluída em ${bueiroId}: ${formatNumber(oldCapacity)}% → ${formatNumber(bueiro.capacity)}%`);
    showNotification(`✅ Manutenção concluída no bueiro ${bueiroId}`);

    // Armazenar ID do bueiro para o formulário de matéria-prima
    currentBueiroId = bueiroId;

    // Notificar sistema dos caminhões se necessário
    if (oldCapacity >= 80) {
        notifyCriticalBueiros(bueiroId, 'maintenance_completed');
    }

    // Exibir formulário de registro de matéria-prima após 1.5 segundos
    setTimeout(() => {
        resetMaterialsForm();
        showModal('materialsModal');
    }, 1500);
}

// ==========================================
// REGISTRO DE MATÉRIA-PRIMA
// ==========================================
function resetMaterialsForm() {
    document.getElementById('ironInput').value = '';
    document.getElementById('glassInput').value = '';
    document.getElementById('organicInput').value = '';
    updateMaterialsTotal();
}

function updateMaterialsTotal() {
    const iron = parseFloat(document.getElementById('ironInput').value) || 0;
    const glass = parseFloat(document.getElementById('glassInput').value) || 0;
    const organic = parseFloat(document.getElementById('organicInput').value) || 0;
    const total = iron + glass + organic;
    
    document.getElementById('totalMaterials').textContent = total.toFixed(1) + ' kg';
}

function registerMaterials(bueiroId) {
    const iron = parseFloat(document.getElementById('ironInput').value) || 0;
    const glass = parseFloat(document.getElementById('glassInput').value) || 0;
    const organic = parseFloat(document.getElementById('organicInput').value) || 0;
    
    // Validação
    if (iron < 0 || glass < 0 || organic < 0) {
        showNotification('❌ Os valores não podem ser negativos');
        return;
    }

    const totalMaterials = iron + glass + organic;

    if (totalMaterials === 0) {
        showNotification('⚠️ Digite a quantidade de materiais coletados');
        return;
    }

    // Atualizar métricas globais
    systemMetrics.wasteDiverted += totalMaterials;
    systemMetrics.co2Reduced += totalMaterials * 0.1; // Simulação de impacto de carbono

    // Registrar evento nos logs
    addLog(`✅ ${totalMaterials.toFixed(1)}kg de Matéria-Prima registrada no ${bueiroId} | Ferro: ${iron.toFixed(1)}kg, Vidro: ${glass.toFixed(1)}kg, Orgânicos: ${organic.toFixed(1)}kg`);
    
    // Notificação de sucesso
    showNotification(`✅ Registro de ${totalMaterials.toFixed(1)}kg de materiais concluído!\n📊 Impacto de carbono mitigado: ${(totalMaterials * 0.1).toFixed(1)}kg de CO₂`);

    // Fechar modal e atualizar interface
    closeModal('materialsModal');
    updateStatistics();
    renderBueirosGrid();

    // Log do impacto ambiental
    addLog(`🌱 Impacto ambiental: ${totalMaterials.toFixed(1)}kg de resíduos desviados + ${(totalMaterials * 0.1).toFixed(1)}kg CO₂ mitigado`);
}

// ==========================================
// TOOLTIP
// ==========================================
function showTooltip(event, bueiro) {
    const tooltip = document.getElementById('tooltip');
    const estimatedTime = calculateFillTime(bueiro.capacity);
    
    tooltip.innerHTML = `
        <strong>${bueiro.id}</strong><br>
        📍 ${bueiro.location}<br>
        📊 Capacidade: ${formatNumber(bueiro.capacity)}%<br>
        👃 Odor: ${bueiro.odor}<br>
        🔧 Última manutenção: ${formatDate(bueiro.lastMaintenance)}<br>
        ⏱️ Tempo estimado para encher: ${estimatedTime}
    `;
    
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY + 10 + 'px';
    tooltip.classList.add('show');
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('show');
}

function calculateFillTime(capacity) {
    const remaining = 100 - capacity;
    const hoursToFill = remaining * 0.5; // Simulação: 0.5h por 1%
    
    if (hoursToFill < 1) return `${Math.round(hoursToFill * 60)} min`;
    if (hoursToFill < 24) return `${Math.round(hoursToFill)}h`;
    return `${Math.round(hoursToFill / 24)} dias`;
}

// ==========================================
// ESTATÍSTICAS
// ==========================================
function updateStatistics() {
    const avgLevel = bueiros.reduce((sum, b) => sum + b.capacity, 0) / bueiros.length;
    const criticalCount = bueiros.filter(b => b.critical).length;
    const lastMaintenance = getLastMaintenanceDate();

    document.getElementById('avgLevel').textContent = formatNumber(avgLevel) + '%';
    document.getElementById('criticalCount').textContent = criticalCount;
    document.getElementById('lastMaintenance').textContent = lastMaintenance;
}

function getLastMaintenanceDate() {
    const dates = bueiros.map(b => new Date(b.lastMaintenance));
    const latest = new Date(Math.max.apply(null, dates));
    return formatDate(latest.toISOString());
}

// ==========================================
// ALERTAS E NOTIFICAÇÕES
// ==========================================
function checkAlerts() {
    const currentTime = new Date();
    
    bueiros.forEach(bueiro => {
        if (bueiro.capacity >= 80 && !bueiro.critical) {
            bueiro.critical = true;
            addAlert(`Bueiro ${bueiro.id} atingiu nível crítico (${formatNumber(bueiro.capacity)}%)`);
            notifyCriticalBueiros(bueiro.id, 'critical_level');
        }
    });

    renderAlerts();
}

function addAlert(message) {
    const alert = {
        id: Date.now(),
        message,
        timestamp: new Date(),
        read: false
    };
    
    alerts.unshift(alert);
    if (alerts.length > 10) alerts = alerts.slice(0, 10);
    
    showNotification(message);
}

function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<p style="color: var(--cinza-medio); font-size: 0.8rem;">Nenhum alerta recente</p>';
        return;
    }

    alertsList.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="alert-item">
            <div>${alert.message}</div>
            <div class="alert-time">${alert.timestamp.toLocaleTimeString('pt-BR')}</div>
        </div>
    `).join('');
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🚨</span>
            <span>${message}</span>
            <button onclick="hideNotification()" style="margin-left: auto; background: none; border: none; color: var(--branco); cursor: pointer;">✕</button>
        </div>
    `;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

// ==========================================
// SIMULAÇÃO EM TEMPO REAL
// ==========================================
function startSimulation() {
    setInterval(() => {
        simulateFillIncrease();
        checkAlerts();
        updateStatistics();
        updateChart();
    }, 3000); // Atualização a cada 3 segundos
}

function simulateFillIncrease() {
    bueiros.forEach(bueiro => {
        // Incremento aleatório entre 0.5% e 2%
        const increment = Math.random() * 1.5 + 0.5;
        bueiro.capacity = Math.min(100, bueiro.capacity + increment);
        
        // Simular mudanças no odor baseado na capacidade
        if (bueiro.capacity >= 90) bueiro.odor = 'crítico';
        else if (bueiro.capacity >= 70) bueiro.odor = 'alto';
        else if (bueiro.capacity >= 40) bueiro.odor = 'médio';
        else bueiro.odor = 'baixo';
    });
    
    renderBueirosGrid();
}

// ==========================================
// GRÁFICO HISTÓRICO
// ==========================================
function initializeChart() {
    const ctx = document.getElementById('historicalChart').getContext('2d');
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Nível Médio (%)',
                data: generateHistoricalData(),
                borderColor: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: '#f8fafc',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color: '#94a3b8',
                        font: { size: 10 }
                    },
                    grid: { 
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: { 
                        color: '#94a3b8',
                        font: { size: 10 },
                        maxTicksLimit: 8
                    },
                    grid: { 
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    backgroundColor: '#34d399'
                }
            }
        }
    });
}

function generateHistoricalData() {
    return Array.from({length: 24}, () => Math.random() * 60 + 20);
}

function updateChart() {
    if (!chart) return;
    
    const avgLevel = bueiros.reduce((sum, b) => sum + b.capacity, 0) / bueiros.length;
    chart.data.datasets[0].data.push(avgLevel);
    chart.data.datasets[0].data.shift();
    chart.update('none');
}

// ==========================================
// INTEGRAÇÃO COM OUTROS SISTEMAS
// ==========================================
function notifyCriticalBueiros(bueiroId, action) {
    // Simular notificação para sistema de drones
    const notification = {
        type: 'bueiro_critical',
        bueiroId: bueiroId,
        action: action,
        timestamp: new Date(),
        priority: 'high'
    };
    
    addLog(`Notificação enviada para sistema de caminhões: ${bueiroId} - ${action}`);
}

// ==========================================
// LOGS E RELATÓRIOS
// ==========================================
function addLog(message) {
    const log = {
        timestamp: new Date(),
        message: message,
        user: 'Sistema'
    };
    
    logs.unshift(log);
    if (logs.length > 100) logs = logs.slice(0, 100);
}

function generateTXTReport() {
    // Mostrar notificação de download
    showNotification("📄 Relatório está sendo baixado...");
    
    // Gerar o conteúdo do relatório
    const txt = bueiros.map(b => 
        `ID: ${b.id}\nLocal: ${b.location}\nCapacidade: ${b.capacity.toFixed(2)}%\nOdor: ${b.odor}\nÚltima Manutenção: ${b.lastMaintenance}\nStatus: ${getStatus(b.capacity)}\n\n`
    ).join('');
    
    // Criar o arquivo e iniciar o download
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_bueiros_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addLog("Relatório TXT gerado e baixado");
}