/**
 * NovaFlow OS 2026 - Main Interactive Experience Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  initThemeSwitcher();
  initBentoSpotlight();
  initRoiCalculator();
  initSandbox();
  initPricingToggle();
  initCurrencySwitcher();
  initFaqAccordion();
  initModals();
  initChatbot();
  initLiveToasts();
  initScrollProgress();
});

/* -------------------------------------------------------------
 * 1. NEURAL PARTICLE CANVAS BACKGROUND
 * ----------------------------------------------------------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactivity
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 70);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          let alpha = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* -------------------------------------------------------------
 * 2. THEME PALETTE SWITCHER
 * ----------------------------------------------------------- */
function initThemeSwitcher() {
  const buttons = document.querySelectorAll('[data-theme-btn]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-btn');
      document.body.setAttribute('data-theme', theme);
      buttons.forEach(b => b.classList.remove('ring-2', 'ring-white'));
      btn.classList.add('ring-2', 'ring-white');
      
      showToast(`Tema alterado para: ${theme.toUpperCase()}`, 'palette');
    });
  });
}

/* -------------------------------------------------------------
 * 3. BENTO GRID SPOTLIGHT MOUSE TRACKING
 * ----------------------------------------------------------- */
function initBentoSpotlight() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* -------------------------------------------------------------
 * 4. INTERACTIVE ROI CALCULATOR
 * ----------------------------------------------------------- */
function initRoiCalculator() {
  const teamSizeInput = document.getElementById('calcTeamSize');
  const hoursSavedInput = document.getElementById('calcHoursSaved');
  const hourlyRateInput = document.getElementById('calcHourlyRate');

  const teamSizeVal = document.getElementById('valTeamSize');
  const hoursSavedVal = document.getElementById('valHoursSaved');
  const hourlyRateVal = document.getElementById('valHourlyRate');

  const annualSavingsEl = document.getElementById('calcAnnualSavings');
  const monthlyHoursEl = document.getElementById('calcMonthlyHours');
  const roiMultiplierEl = document.getElementById('calcRoiMultiplier');

  if (!teamSizeInput) return;

  function calculate() {
    const team = parseInt(teamSizeInput.value) || 10;
    const hours = parseInt(hoursSavedInput.value) || 12;
    const rate = parseInt(hourlyRateInput.value) || 85;

    teamSizeVal.textContent = team + ' pessoas';
    hoursSavedVal.textContent = hours + 'h / semana';
    hourlyRateVal.textContent = 'R$ ' + rate + '/hora';

    const weeklyHoursSaved = team * hours;
    const monthlyHoursSaved = weeklyHoursSaved * 4.2;
    const annualHoursSaved = weeklyHoursSaved * 52;
    const annualMoneySaved = annualHoursSaved * rate;

    // Platform cost estimation: base R$ 389/mo * team/5
    const platformAnnualCost = 389 * 12 * Math.max(1, Math.ceil(team / 8));
    const netSavings = Math.max(0, annualMoneySaved - platformAnnualCost);
    const roiMult = (annualMoneySaved / platformAnnualCost).toFixed(1);

    animateValue(annualSavingsEl, netSavings, 'currency');
    animateValue(monthlyHoursEl, Math.round(monthlyHoursSaved), 'number');
    roiMultiplierEl.textContent = `${roiMult}x ROI`;
  }

  function animateValue(el, target, type) {
    if (!el) return;
    const current = parseInt(el.getAttribute('data-val') || '0');
    el.setAttribute('data-val', target);

    const diff = target - current;
    const duration = 400;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(current + diff * ease);

      if (type === 'currency') {
        el.textContent = 'R$ ' + val.toLocaleString('pt-BR');
      } else {
        el.textContent = val.toLocaleString('pt-BR') + ' hrs';
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  teamSizeInput.addEventListener('input', calculate);
  hoursSavedInput.addEventListener('input', calculate);
  hourlyRateInput.addEventListener('input', calculate);

  calculate();
}

/* -------------------------------------------------------------
 * 5. INTERACTIVE LIVE AI SANDBOX
 * ----------------------------------------------------------- */
const sandboxData = {
  agent: {
    title: "Orquestração Autônoma de Agentes",
    prompt: "Orquestrar pipeline de qualificação de leads com validação de dados em tempo real e envio automatizado para o CRM.",
    steps: [
      "[0.002s] Inicializando nó de rede neural: Atlas-v8.2 Quantum...",
      "[0.005s] Ingestão de 1.450 leads recebidos via Webhook / Stripe API...",
      "[0.008s] Enriquecimento de perfil com IA e análise de propensão de compra (Score: 94%)...",
      "[0.011s] Decisão Autônoma: Segmentar 320 contas Tier-1 para SDRs com briefing gerado.",
      "[0.014s] Atualização de base de dados finalizada com 0 erros. Uptime: 99.999%."
    ],
    tokens: "1,842 tokens",
    latency: "6.4 ms",
    confidence: "99.9%"
  },
  pred: {
    title: "Análise Preditiva e Forecast 2026",
    prompt: "Analisar tendências de churn e projetar receita recorrente (ARR) para o próximo trimestre com base em 5M eventos.",
    steps: [
      "[0.003s] Conectando ao Data Lakehouse Quântico (5.240.000 registros)...",
      "[0.006s] Executando modelo de séries temporais probabilísticas com atenção multi-head...",
      "[0.009s] Alerta detectado: 4.2% risco de churn mitigado com recomendações preventivas.",
      "[0.012s] Projeção Q4: Crescimento de ARR de +28.4% com 98.6% de intervalo de confiança.",
      "[0.015s] Relatório executivo compilado e exportado com visualizações interativas."
    ],
    tokens: "2,410 tokens",
    latency: "7.1 ms",
    confidence: "98.8%"
  },
  code: {
    title: "Geração de Infraestrutura & Smart Code",
    prompt: "Gerar microserviço em Rust com gRPC assíncrono, cache Redis em memória e deploy automático em Kubernetes Edge.",
    steps: [
      "[0.002s] Analisando dependências e arquitetura de baixa latência...",
      "[0.005s] Gerando servidor `async fn main()` com Tokio e validação estática de tipos...",
      "[0.007s] Compilação Zero-Copy executada com sucesso.",
      "[0.010s] Criando manifesto Helm, Dockerfile multi-stage e política Zero-Trust IAM...",
      "[0.013s] Testes unitários: 48/48 aprovados. Benchmark de resposta: 0.8ms."
    ],
    tokens: "3,120 tokens",
    latency: "8.2 ms",
    confidence: "100%"
  },
  multimodal: {
    title: "Síntese Cognitiva Multimodal",
    prompt: "Interpretar vídeo de 4K de auditoria industrial, detectar anomalias estruturais e emitir laudo técnico certificado.",
    steps: [
      "[0.004s] Descompactando fluxo de frames 4K a 120fps com decodificação por GPU...",
      "[0.007s] Mapeamento 3D volumétrico de componentes com detecção de micro-fissuras...",
      "[0.009s] Identificada anomalia no Módulo B-7 (Nível de gravidade: Baixo)...",
      "[0.012s] Gerando relatório pericial com assinatura digital e fotos térmicas anotadas...",
      "[0.016s] Notificação instantânea despachada para engenheiro responsável via Slack/SMS."
    ],
    tokens: "4,680 tokens",
    latency: "9.5 ms",
    confidence: "99.4%"
  }
};

function initSandbox() {
  const tabs = document.querySelectorAll('[data-sandbox-tab]');
  const promptInput = document.getElementById('sandboxPrompt');
  const runBtn = document.getElementById('sandboxRunBtn');
  const outputEl = document.getElementById('sandboxOutput');
  const tokensEl = document.getElementById('sbTokens');
  const latencyEl = document.getElementById('sbLatency');
  const confidenceEl = document.getElementById('sbConfidence');
  const presetChips = document.querySelectorAll('[data-preset-prompt]');

  if (!tabs.length || !outputEl) return;

  let currentTab = 'agent';
  let isRunning = false;

  function loadTab(tabKey) {
    currentTab = tabKey;
    tabs.forEach(t => {
      const active = t.getAttribute('data-sandbox-tab') === tabKey;
      t.classList.toggle('bg-white/15', active);
      t.classList.toggle('text-cyan-400', active);
      t.classList.toggle('border-cyan-500/40', active);
      t.classList.toggle('text-slate-400', !active);
    });

    const data = sandboxData[tabKey];
    if (promptInput) promptInput.value = data.prompt;
    tokensEl.textContent = data.tokens;
    latencyEl.textContent = data.latency;
    confidenceEl.textContent = data.confidence;
    runSimulation(data.steps);
  }

  function runSimulation(steps) {
    if (isRunning) return;
    isRunning = true;
    outputEl.innerHTML = '';
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const line = document.createElement('div');
        line.className = 'font-mono text-xs sm:text-sm text-cyan-300/90 py-1 flex items-start gap-2 animate-fadeIn';
        line.innerHTML = `<span class="text-emerald-400 font-bold">✔</span> <span>${steps[stepIndex]}</span>`;
        outputEl.appendChild(line);
        outputEl.scrollTop = outputEl.scrollHeight;
        stepIndex++;
      } else {
        clearInterval(interval);
        isRunning = false;
        const done = document.createElement('div');
        done.className = 'mt-3 pt-2 border-t border-white/10 text-xs text-slate-400 font-mono flex items-center justify-between';
        done.innerHTML = `<span>✨ Execução concluída em tempo real</span> <span class="text-emerald-400 font-semibold">Status: 200 OK</span>`;
        outputEl.appendChild(done);
      }
    }, 280);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabKey = tab.getAttribute('data-sandbox-tab');
      loadTab(tabKey);
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      const data = sandboxData[currentTab];
      runSimulation(data.steps);
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (promptInput) {
        promptInput.value = chip.textContent.trim().replace(/^⚡|^🧠|^📊|^🛡️/, '').trim();
        const data = sandboxData[currentTab];
        runSimulation(data.steps);
      }
    });
  });

  // Initial run
  loadTab('agent');
}

/* -------------------------------------------------------------
 * 6. PRICING BILLING CYCLE TOGGLE
 * ----------------------------------------------------------- */
let currentCurrency = 'BRL';
const currencyRates = {
  BRL: { symbol: 'R$', rate: 1, starterM: 149, starterY: 104, proM: 389, proY: 272, entM: 990, entY: 693 },
  USD: { symbol: '$', rate: 0.20, starterM: 29, starterY: 20, proM: 79, proY: 55, entM: 199, entY: 139 },
  EUR: { symbol: '€', rate: 0.18, starterM: 27, starterY: 19, proM: 74, proY: 52, entM: 185, entY: 129 }
};

let isAnnual = true;

function updatePricingDisplay() {
  const conf = currencyRates[currentCurrency];
  const sPrice = document.getElementById('priceStarter');
  const pPrice = document.getElementById('pricePro');
  const ePrice = document.getElementById('priceEnterprise');
  const periodEls = document.querySelectorAll('.pricing-period');

  if (sPrice && pPrice && ePrice) {
    sPrice.textContent = `${conf.symbol} ${isAnnual ? conf.starterY : conf.starterM}`;
    pPrice.textContent = `${conf.symbol} ${isAnnual ? conf.proY : conf.proM}`;
    ePrice.textContent = `${conf.symbol} ${isAnnual ? conf.entY : conf.entM}`;
  }

  periodEls.forEach(el => {
    el.textContent = isAnnual ? '/mês (faturado anualmente)' : '/mês (sem fidelidade)';
  });
}

function initPricingToggle() {
  const toggleBtn = document.getElementById('billingToggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    const dot = toggleBtn.querySelector('.toggle-dot');
    if (dot) {
      dot.classList.toggle('translate-x-6', isAnnual);
    }
    updatePricingDisplay();
  });
}

function initCurrencySwitcher() {
  const select = document.getElementById('currencySelector');
  if (!select) return;

  select.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    updatePricingDisplay();
    showToast(`Moeda atualizada para: ${currentCurrency}`, 'globe');
  });
}

/* -------------------------------------------------------------
 * 7. FAQ ACCORDION & REAL-TIME SEARCH
 * ----------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('[data-faq-item]');
  const searchInput = document.getElementById('faqSearch');

  items.forEach(item => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const content = item.querySelector('[data-faq-content]');
    const icon = item.querySelector('[data-faq-icon]');

    trigger.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');

      // Close all other items
      items.forEach(other => {
        other.querySelector('[data-faq-content]').classList.add('hidden');
        other.querySelector('[data-faq-icon]').classList.remove('rotate-180');
      });

      if (!isOpen) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'block' : 'none';
      });
    });
  }
}

/* -------------------------------------------------------------
 * 8. MODALS & POPUPS (VIP DEMO & CHECKOUT)
 * ----------------------------------------------------------- */
function initModals() {
  const demoModal = document.getElementById('demoModal');
  const openDemoBtns = document.querySelectorAll('[data-open-demo]');
  const closeDemoBtns = document.querySelectorAll('[data-close-demo]');
  const demoForm = document.getElementById('demoForm');

  openDemoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (demoModal) {
        demoModal.classList.remove('hidden');
        demoModal.classList.add('flex');
      }
    });
  });

  closeDemoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (demoModal) {
        demoModal.classList.add('hidden');
        demoModal.classList.remove('flex');
      }
    });
  });

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fireConfetti();
      demoModal.classList.add('hidden');
      demoModal.classList.remove('flex');
      showToast('🎉 Acesso VIP 2026 reservado com sucesso! Verifique seu e-mail.', 'check');
    });
  }

  // Quick CTA form
  const heroForm = document.getElementById('heroEarlyAccessForm');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fireConfetti();
      showToast('🚀 Convite Alpha 2026 enviado! Bem-vindo à nova era.', 'rocket');
      heroForm.reset();
    });
  }

  const finalCtaForm = document.getElementById('finalCtaForm');
  if (finalCtaForm) {
    finalCtaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fireConfetti();
      showToast('✨ 14 dias de teste VIP ativados com sucesso!', 'sparkles');
      finalCtaForm.reset();
    });
  }
}

function fireConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#6366f1', '#a855f7', '#10b981', '#ffffff']
    });
  }
}

/* -------------------------------------------------------------
 * 9. INTERACTIVE FLOATING AI CHATBOT CONCIERGE
 * ----------------------------------------------------------- */
function initChatbot() {
  const toggleBtn = document.getElementById('chatToggleBtn');
  const chatWindow = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatCloseBtn');
  const messagesEl = document.getElementById('chatMessages');
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');

  if (!toggleBtn || !chatWindow) return;

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden') && inputEl) {
      inputEl.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
    });
  }

  const botResponses = [
    "A NovaFlow OS 2026 integra processamento quântico com latência abaixo de 8ms em qualquer cloud!",
    "Nosso modelo Pro Ultra inclui agentes ilimitados, automação de dados e conformidade SOC2 Type II.",
    "Você pode testar gratuitamente por 14 dias sem necessidade de cartão de crédito!",
    "Oferecemos suporte 24/7 com engenheiros dedicados e migração assistida de sistemas legados."
  ];

  function sendUserMsg() {
    const text = inputEl.value.trim();
    if (!text) return;

    // User bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'flex justify-end';
    userMsg.innerHTML = `
      <div class="bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 text-xs sm:text-sm p-3 rounded-2xl rounded-tr-none max-w-[80%]">
        ${text}
      </div>
    `;
    messagesEl.appendChild(userMsg);
    inputEl.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'flex justify-start';
    typing.innerHTML = `
      <div class="bg-white/5 border border-white/10 text-slate-300 text-xs p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const randomReply = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMsg = document.createElement('div');
      botMsg.className = 'flex justify-start';
      botMsg.innerHTML = `
        <div class="bg-slate-800/90 border border-white/10 text-slate-200 text-xs sm:text-sm p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-lg">
          <div class="text-[10px] text-cyan-400 font-mono mb-1">🤖 NovaFlow Concierge 2026</div>
          ${randomReply}
        </div>
      `;
      messagesEl.appendChild(botMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 900);
  }

  if (sendBtn) sendBtn.addEventListener('click', sendUserMsg);
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendUserMsg();
    });
  }
}

/* -------------------------------------------------------------
 * 10. REAL-TIME LIVE TOAST NOTIFICATIONS
 * ----------------------------------------------------------- */
const toastEvents = [
  "⚡ Carlos M. (TechCorp) ativou o Plano Pro Ultra",
  "🛡️ Auditoria Zero-Trust concluída: 100% segurança",
  "🚀 Novo nó neural ativado em São Paulo (Latência: 4.2ms)",
  "🔥 +1.200 empresas conectadas hoje à rede NovaFlow",
  "⭐ Juliana F. avaliou com 5 estrelas: 'Incrível velocidade!'"
];

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'glass-panel p-3.5 rounded-xl border border-white/15 text-xs sm:text-sm text-slate-200 flex items-center gap-3 shadow-2xl animate-fadeIn transition-all duration-300';
  toast.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
    <span class="font-medium">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function initLiveToasts() {
  let toastIndex = 0;
  setInterval(() => {
    if (Math.random() > 0.3) {
      showToast(toastEvents[toastIndex % toastEvents.length]);
      toastIndex++;
    }
  }, 14000);
}

/* -------------------------------------------------------------
 * 11. SCROLL PROGRESS BAR
 * ----------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + '%';
  });
}
