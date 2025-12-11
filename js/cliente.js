// Arquivo: script.js (Código Completo)

 const themeToggleButton = document.getElementById('theme-toggle');

// --- Gerenciamento de Tema ---
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
        localStorage.removeItem('theme');
        applyTheme('dark');
    } else {
        localStorage.setItem('theme', 'light');
        applyTheme('light');
    }
}

// Aplica o tema ao carregar
applyTheme(localStorage.getItem('theme'));
if(themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}

// --- Dados e Estado ---
let currentUser = null;
let simulationInterval = null; 
let isModalOpen = false; 

// Lista de usuários
const users = [
    {email:"admin@smartsewer.com",password:"admin123",name:"Admin",role:"admin"},
    {email:"miguelmaciel1235@gmail.com",password:"12345678",name:"Miguel",role:"admin"}
];

// Dados simulados dos bueiros
const sensorsDatabase = [
    {id:1, location:"Rua das Flores, 123", wasteLevel:45, alertShown: false, waitingForTruck: false},
    {id:2, location:"Av. Central, 456", wasteLevel:78, alertShown: false, waitingForTruck: false},
    {id:3, location:"Praça da Liberdade, 789", wasteLevel:23, alertShown: false, waitingForTruck: false}
];

// NOVA LISTA: Para armazenar as solicitações e não sumirem na atualização
const requestsDatabase = [];

// --- Funções de Navegação e UI ---
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(pageId);
    if(page) page.classList.add("active");
    window.scrollTo(0, 0);
}

function toggleMobileMenu(forceClose = null) {
    const navContent = document.getElementById('nav-content');
    if (forceClose === false) {
        navContent.classList.remove('active');
    } else {
        navContent.classList.toggle('active');
    }
}

function updateUserInterface() {
    const navButtons = document.getElementById("nav-buttons");
    const userInfo = document.getElementById("user-info");
    
    if (currentUser) {
        navButtons.style.display = "none";
        userInfo.style.display = "flex";
        document.getElementById("user-name").textContent = currentUser.name;
        document.getElementById("user-avatar").textContent = currentUser.name.charAt(0).toUpperCase();
        renderDashboard(); 
    } else {
        navButtons.style.display = "flex";
        userInfo.style.display = "none";
    }
}

function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    const text = document.getElementById("notification-text");
    
    text.textContent = message;
    notification.className = "notification show";
    
    if (type !== "success") {
        notification.classList.add(type);
    }
    
    setTimeout(() => {
        notification.classList.remove("show");
        if (type !== "success") notification.classList.remove(type);
    }, 4000);
}

function logout() {
    openLogoutModal();
}

function openLogoutModal() {
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: var(--card-bg);
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        ">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 1rem;
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                ">
                    👋
                </div>
                <h2 style="
                    color: var(--text-primary);
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                ">Sair da conta?</h2>
                <p style="
                    color: var(--text-secondary);
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.5;
                ">Tem certeza que deseja encerrar sua sessão?</p>
            </div>
            
            <div style="
                display: flex;
                gap: 0.75rem;
                margin-top: 1.5rem;
            ">
                <button id="cancel-logout-btn" style="
                    flex: 1;
                    padding: 0.9rem;
                    border: 2px solid var(--accent-primary);
                    background: transparent;
                    color: var(--accent-primary);
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Cancelar
                </button>
                <button id="confirm-logout-btn" style="
                    flex: 1;
                    padding: 0.9rem;
                    border: none;
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    color: white;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
                ">
                    Sim, sair
                </button>
            </div>
        </div>
    `;
    
    // Adiciona estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to { 
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        #cancel-logout-btn:hover {
            background: var(--accent-primary);
            color: white;
            transform: translateY(-2px);
        }
        #confirm-logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('cancel-logout-btn').onclick = () => {
        modal.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => modal.remove(), 200);
    };
    
    document.getElementById('confirm-logout-btn').onclick = () => {
        modal.remove();
        currentUser = null;
        updateUserInterface();
        showPage('home');
        showNotification("Você saiu do sistema.");
    };
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => modal.remove(), 200);
        }
    };
}

// --- Loading Helper ---
function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "Carregando...";
        btn.style.cursor = "wait";
    } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText;
        btn.style.cursor = "pointer";
    }
}

// --- Autenticação ---
function handleRegister(e) {
    e.preventDefault();
    const btnId = "registerBtn";
    setLoading(btnId, true);

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    setTimeout(() => {
        setLoading(btnId, false);

        if(!name || !email || !password || !confirmPassword) return showNotification("Por favor, preencha todos os campos.", "error");
        if(password !== confirmPassword) return showNotification("As senhas não coincidem.", "error");
        if(password.length < 6) return showNotification("A senha deve ter no mínimo 6 caracteres.", "error");
        if(users.find(u => u.email === email)) return showNotification("Este email já está cadastrado.", "error");

        users.push({email: email, password: password, name: name, role: "user"});
        
        showNotification("Cadastro realizado com sucesso! Faça o login para continuar.");
        e.target.reset();
        showPage("login");
    }, 1000); 
}

function handleLogin(e) {
    e.preventDefault();
    const btnId = "loginBtn";
    setLoading(btnId, true);

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    setTimeout(() => {
        setLoading(btnId, false);
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            updateUserInterface();
            showNotification(`Bem-vindo(a), ${user.name}!`);
            showPage('bueiros');
            e.target.reset();
        } else {
            showNotification("Email ou senha incorretos.", "error");
        }
    }, 800); 
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const eyeOffIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = eyeOffIcon; 
    } else {
        input.type = "password";
        btn.innerHTML = eyeIcon; 
    }
}

// --- Renderização do Dashboard (CORRIGIDO) ---
function renderDashboard() {
    const grid = document.getElementById("bueiros-grid-content");
    if(!grid) return; 

    grid.innerHTML = ""; 

    // 1. PRIMEIRO RENDERIZA AS SOLICITAÇÕES PENDENTES
    // Agora pegamos da lista persistente "requestsDatabase"
    requestsDatabase.forEach(req => {
        const pendingCard = document.createElement("div");
        pendingCard.className = "dashboard-card pending";
        pendingCard.innerHTML = `
            <div class="pending-content">
                <div class="pending-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                <h4>Solicitação #${req.id} (Análise)</h4>
                <p style="font-weight: bold; margin-bottom: 0.5rem;">${req.address}</p>
                <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 6px; font-size: 0.9rem; text-align: left; width: 100%;">
                    <span style="color: var(--accent-primary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Motivo:</span><br>${req.reason}
                </div>
            </div>
        `;
        grid.appendChild(pendingCard);
    });

    // 2. DEPOIS RENDERIZA OS SENSORES REAIS
    sensorsDatabase.forEach(sensor => {
        const card = document.createElement("div");
        card.className = "dashboard-card";

        // === ESTADO DE ESPERA (CAMINHÃO) ===
        if (sensor.waitingForTruck) {
            card.innerHTML = `
                <div>
                    <h3>Sensor #${sensor.id}</h3>
                    <p class="card-location">${sensor.location}</p>
                    <span class="status-badge" style="background-color: #e67e22; color: white;">Aguardando Troca</span>
                </div>
                <div style="
                    margin-top: 15px;
                    padding: 15px;
                    border: 2px dashed #e67e22;
                    border-radius: 8px;
                    background-color: rgba(230, 126, 34, 0.1);
                    text-align: center;
                    color: var(--text-primary);
                ">
                    <div style="font-size: 24px; margin-bottom: 8px;">🚚 ♻️</div>
                    <p style="font-weight: 600; font-size: 0.95rem; line-height: 1.4;">
                        Aguardando caminhão chegar para a troca do bueiro inteligente
                    </p>
                </div>
            `;
            grid.appendChild(card);
            return; 
        }

        // === ESTADO NORMAL ===
        let statusClass = "status-normal";
        let statusText = "Normal";
        
        if(sensor.wasteLevel > 50) { statusClass = "status-warning"; statusText = "Atenção"; }
        if(sensor.wasteLevel >= 90) { statusClass = "status-critical"; statusText = "Crítico"; }

        card.innerHTML = `
            <div>
                <h3>Sensor #${sensor.id}</h3>
                <p class="card-location">${sensor.location}</p>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${sensor.wasteLevel}%; background-color: ${sensor.wasteLevel >= 90 ? '#e74c3c' : ''}">${sensor.wasteLevel}%</div>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary)">Capacidade Ocupada</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Solicitação de Novo Bueiro (CORRIGIDO) ---
function handleRequestSewer(e) {
    e.preventDefault();
    const address = document.getElementById("requestAddress").value;
    const reason = document.getElementById("requestReason").value; 
    
    // Salva na lista ao invés de apenas no HTML
    const nextId = requestsDatabase.length + 1;
    
    requestsDatabase.push({
        id: nextId,
        address: address,
        reason: reason
    });
    
    showNotification(`Solicitação #${nextId} enviada com sucesso!`);
    e.target.reset(); 
    showPage('bueiros');
    
    // Força atualização imediata
    renderDashboard();
}

// --- SISTEMA DE ALERTA E MODAL ---

function openCollectionModal(sensor) {
    isModalOpen = true;
    const modal = document.getElementById('collection-modal');
    
    document.getElementById('modal-sensor-id').textContent = `#${sensor.id}`;
    document.getElementById('modal-sensor-location').textContent = sensor.location;
    document.getElementById('modal-sensor-level').textContent = `${sensor.wasteLevel}%`;
    
    // Configura o botão
    const confirmBtn = document.getElementById('confirm-collection-btn');
    confirmBtn.textContent = "Chamar Caminhão"; 
    confirmBtn.onclick = () => performCollection(sensor.id);
    
    modal.style.display = 'flex';
}

function closeCollectionModal() {
    document.getElementById('collection-modal').style.display = 'none';
    isModalOpen = false;
}

// --- LÓGICA DE COLETA (30s de Espera) ---
function performCollection(sensorId) {
    const sensor = sensorsDatabase.find(s => s.id === sensorId);
    
    if(sensor) {
        sensor.waitingForTruck = true;
        sensor.alertShown = false; 
    }

    closeCollectionModal();
    // Mensagem atualizada para 30 segundos
    showNotification(`Caminhão chamado para Sensor #${sensorId}. Chegada em 30 segundos.`);
    
    renderDashboard();

    // Aguarda 30 segundos (30000ms)
    setTimeout(() => {
        if(sensor) {
            sensor.wasteLevel = 0; 
            sensor.waitingForTruck = false; 
            
            renderDashboard();
            showNotification(`Bueiro #${sensorId} trocado com sucesso!`);
        }
    }, 30000); // <-- MUDANÇA AQUI
}

// --- Simulação em Tempo Real (NOVA VERSÃO) ---
function startRealTimeSimulation() { 
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
        if (!currentUser || isModalOpen) return;

        sensorsDatabase.forEach(sensor => {
            if (sensor.waitingForTruck) return;

            // --- AQUI ESTÁ A MUDANÇA ---
            // NOVO CÁLCULO:
            // Math.random() * 5 gera números entre 0 e 4.99
            // Math.floor arredonda para 0, 1, 2, 3, 4
            // - 1 ajusta o intervalo para: -1, 0, 1, 2, 3
            // Resultado: O bueiro oscila devagar e sobe lentamente (max +3, min -1)
            const variation = Math.floor(Math.random() * 5) - 1;

            sensor.wasteLevel += variation;

            if (sensor.wasteLevel > 100) sensor.wasteLevel = 100;
            if (sensor.wasteLevel < 0) sensor.wasteLevel = 0;

            if (sensor.wasteLevel >= 95 && !sensor.alertShown) {
                sensor.alertShown = true;
                openCollectionModal(sensor);
            }
        });

        const bueirosPage = document.getElementById('bueiros');
        if (bueirosPage && bueirosPage.classList.contains('active')) {
            renderDashboard();
        }

    }, 3000); // O intervalo continua sendo a cada 3 segundos
}

startRealTimeSimulation();

//O código é um dashboard de bueiros inteligentes com login, cadastro e tema claro/escuro. Mostra sensores e solicitações pendentes, atualiza níveis de resíduos em tempo real, dispara alertas quando críticos e simula a coleta com caminhão. Inclui notificações, modais interativos e animações.
