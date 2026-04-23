// Ernesto Cisneros Chatbot Widget
// Drop this script into any page to add the chat bubble

(function() {
  'use strict';

  // ── Configuration ──
  const WORKER_URL = 'https://ernesto-chatbot.malditoernesto.workers.dev';

  // ── State ──
  let messages = [];
  let isOpen = false;
  let isLoading = false;

  // ── Detect language from HTML lang attribute ──
  function getPageLang() {
    const lang = document.documentElement.lang || 'en';
    return lang.substring(0, 2).toLowerCase();
  }

  function getPlaceholder() {
    const placeholders = {
      en: 'Ask me anything about Ernesto...',
      es: 'Pregunta lo que quieras sobre Ernesto...',
      fr: 'Posez vos questions sur Ernesto...',
      it: 'Chiedi quello che vuoi su Ernesto...',
      ja: 'エルネストについて何でも聞いてください...',
      ko: '에르네스토에 대해 무엇이든 물어보세요...',
      ru: 'Спрашивайте что угодно об Эрнесто...',
    };
    return placeholders[getPageLang()] || placeholders.en;
  }

  function getWelcome() {
    const welcomes = {
      en: "Hello! I'm Ernesto's virtual assistant. How can I help you explore his work in music, digital art, literature, or any other topic?",
      es: "Hola! Soy el asistente virtual de Ernesto. ¿En qué puedo ayudarte? Puedo contarte sobre su música, arte digital, literatura o cualquier otro tema.",
      fr: "Bonjour! Je suis l'assistant virtuel d'Ernesto. Comment puis-je vous aider à découvrir son travail en musique, art numérique ou littérature?",
      it: "Ciao! Sono l'assistente virtuale di Ernesto. Come posso aiutarti a esplorare il suo lavoro nella musica, nell'arte digitale o nella letteratura?",
      ja: "こんにちは！エルネストのバーチャルアシスタントです。音楽、デジタルアート、文学など、何でもお気軽にお聞きください。",
      ko: "안녕하세요! 에르네스토의 가상 비서입니다. 음악, 디지털 아트, 문학 등 무엇이든 도와드리겠습니다.",
      ru: "Здравствуйте! Я виртуальный помощник Эрнесто. Чем могу помочь? Расскажу о его музыке, цифровом искусстве, литературе и многом другом.",
    };
    return welcomes[getPageLang()] || welcomes.en;
  }

  // ── Inject Styles ──
  const style = document.createElement('style');
  style.textContent = `
    #ec-chat-toggle-wrap {
      position: fixed;
      bottom: 340px;
      right: 24px;
      width: 56px;
      height: 56px;
      z-index: 10000;
    }
    #ec-chat-toggle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a030, #b8860b);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(212, 160, 48, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
    }
    #ec-chat-toggle:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(212, 160, 48, 0.45);
    }
    #ec-chat-toggle svg {
      width: 26px;
      height: 26px;
      fill: #0a0908;
    }
    #ec-chat-ring {
      position: absolute;
      top: 0; left: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid rgba(212, 160, 48, 0.4);
      pointer-events: none;
      opacity: 0;
    }
    #ec-chat-ring.ec-pulse {
      animation: ec-ring-pulse 2s ease-out;
    }
    @keyframes ec-ring-pulse {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2); opacity: 0; }
    }
    #ec-chat-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #4ade80;
      border: 2px solid #0a0908;
      pointer-events: none;
      animation: ec-dot-glow 2s ease-in-out infinite;
    }
    @keyframes ec-dot-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    #ec-chat-tooltip {
      position: absolute;
      bottom: 66px;
      right: -6px;
      background: #0a0908;
      border: 1px solid rgba(212, 160, 48, 0.3);
      border-radius: 10px 10px 2px 10px;
      padding: 8px 14px;
      font-size: 13px;
      color: #f0e6d6;
      font-family: 'Cormorant Garamond', serif;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.4s, transform 0.4s;
    }
    #ec-chat-tooltip.ec-show {
      opacity: 1;
      transform: translateY(0);
    }
    #ec-chat-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 16px;
      width: 10px;
      height: 10px;
      background: #0a0908;
      border-right: 1px solid rgba(212, 160, 48, 0.3);
      border-bottom: 1px solid rgba(212, 160, 48, 0.3);
      transform: rotate(45deg);
    }

    #ec-chat-panel {
      position: fixed;
      bottom: 408px;
      right: 24px;
      width: 370px;
      max-height: 520px;
      background: #0a0908;
      border: 1px solid rgba(212, 160, 48, 0.3);
      border-radius: 12px;
      z-index: 10000;
      display: none;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212, 160, 48, 0.08);
      font-family: 'Cormorant Garamond', serif;
    }
    #ec-chat-panel.ec-open {
      display: flex;
      animation: ec-slide-up 0.3s ease-out;
    }
    @keyframes ec-slide-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #ec-chat-header {
      padding: 14px 18px;
      background: linear-gradient(180deg, rgba(212, 160, 48, 0.12) 0%, transparent 100%);
      border-bottom: 1px solid rgba(212, 160, 48, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #ec-chat-header-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 0.12em;
      color: #d4a030;
      text-transform: uppercase;
    }
    #ec-chat-close {
      background: none;
      border: none;
      color: rgba(212, 160, 48, 0.5);
      cursor: pointer;
      font-size: 18px;
      padding: 0 4px;
      transition: color 0.2s;
    }
    #ec-chat-close:hover { color: #d4a030; }

    #ec-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 280px;
      max-height: 360px;
    }
    #ec-chat-messages::-webkit-scrollbar { width: 4px; }
    #ec-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #ec-chat-messages::-webkit-scrollbar-thumb { background: rgba(212, 160, 48, 0.2); border-radius: 2px; }

    .ec-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 15px;
      line-height: 1.55;
      color: #f0e6d6;
      word-wrap: break-word;
    }
    .ec-msg-assistant {
      align-self: flex-start;
      background: rgba(212, 160, 48, 0.08);
      border: 1px solid rgba(212, 160, 48, 0.12);
      border-radius: 10px 10px 10px 2px;
    }
    .ec-msg-user {
      align-self: flex-end;
      background: rgba(212, 160, 48, 0.18);
      border: 1px solid rgba(212, 160, 48, 0.25);
      border-radius: 10px 10px 2px 10px;
      color: #f0e6d6;
    }

    .ec-typing {
      align-self: flex-start;
      padding: 10px 18px;
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .ec-typing-dot {
      width: 6px;
      height: 6px;
      background: rgba(212, 160, 48, 0.5);
      border-radius: 50%;
      animation: ec-bounce 1.4s infinite ease-in-out;
    }
    .ec-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ec-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ec-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    #ec-chat-input-area {
      padding: 12px;
      border-top: 1px solid rgba(212, 160, 48, 0.12);
      display: flex;
      gap: 8px;
      background: rgba(0,0,0,0.3);
    }
    #ec-chat-input {
      flex: 1;
      background: rgba(212, 160, 48, 0.06);
      border: 1px solid rgba(212, 160, 48, 0.2);
      border-radius: 8px;
      padding: 10px 14px;
      color: #f0e6d6;
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    #ec-chat-input::placeholder {
      color: rgba(180, 140, 80, 0.4);
    }
    #ec-chat-input:focus {
      border-color: rgba(212, 160, 48, 0.5);
    }
    #ec-chat-send {
      background: linear-gradient(135deg, #d4a030, #b8860b);
      border: none;
      border-radius: 8px;
      width: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }
    #ec-chat-send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    #ec-chat-send svg {
      width: 18px;
      height: 18px;
      fill: #0a0908;
    }

    @media (max-width: 480px) {
      #ec-chat-panel {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 84px;
        max-height: 70vh;
      }
      #ec-chat-toggle-wrap {
        bottom: 340px;
        right: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Tooltip messages (multilingual) ──
  function getTooltipMessages() {
    const msgs = {
      en: ['Hello!', 'Can I help you?', 'Want me to guide you?', 'Welcome!'],
      es: ['Hola!', 'Hoy puedo ayudarte.', 'Quieres que te guie?', 'Bienvenido!'],
      fr: ['Bonjour!', 'Je peux vous aider.', 'Besoin d\'un guide?', 'Bienvenue!'],
      it: ['Ciao!', 'Posso aiutarti.', 'Vuoi che ti guidi?', 'Benvenuto!'],
      ja: ['こんにちは！', 'お手伝いします。', 'ご案内しましょうか？', 'ようこそ！'],
      ko: ['안녕하세요!', '도와드릴까요?', '안내해 드릴까요?', '환영합니다!'],
      ru: ['Привет!', 'Могу помочь.', 'Показать дорогу?', 'Добро пожаловать!'],
    };
    return msgs[getPageLang()] || msgs.en;
  }

  // ── Build DOM ──
  // Toggle wrapper (holds button + ring + dot + tooltip)
  const toggleWrap = document.createElement('div');
  toggleWrap.id = 'ec-chat-toggle-wrap';

  const toggle = document.createElement('button');
  toggle.id = 'ec-chat-toggle';
  toggle.setAttribute('aria-label', 'Open chat');
  toggle.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;

  const ring = document.createElement('div');
  ring.id = 'ec-chat-ring';

  const dot = document.createElement('div');
  dot.id = 'ec-chat-dot';

  const tooltip = document.createElement('div');
  tooltip.id = 'ec-chat-tooltip';

  toggleWrap.appendChild(ring);
  toggleWrap.appendChild(toggle);
  toggleWrap.appendChild(dot);
  toggleWrap.appendChild(tooltip);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'ec-chat-panel';
  panel.innerHTML = `
    <div id="ec-chat-header">
      <span id="ec-chat-header-title">Ernesto Cisneros</span>
      <button id="ec-chat-close">&times;</button>
    </div>
    <div id="ec-chat-messages"></div>
    <div id="ec-chat-input-area">
      <input type="text" id="ec-chat-input" autocomplete="off" />
      <button id="ec-chat-send" disabled>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(toggleWrap);
  document.body.appendChild(panel);

  // ── References ──
  const messagesEl = document.getElementById('ec-chat-messages');
  const inputEl = document.getElementById('ec-chat-input');
  const sendBtn = document.getElementById('ec-chat-send');
  const closeBtn = document.getElementById('ec-chat-close');

  // Set placeholder after DOM is ready
  inputEl.placeholder = getPlaceholder();

  // ── Helpers ──
  function formatMessage(text) {
    // 1. Escape HTML to prevent injection
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 2. Handle markdown links [text](url) first
    text = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" style="color: #f0c860; text-decoration: underline; text-underline-offset: 2px;">$1</a>'
    );

    // 3. Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // 4. Italic: *text* or _text_ (but not inside URLs)
    text = text.replace(/(?<![\/\w])\*([^*]+?)\*(?![\/\w])/g, '<em>$1</em>');
    text = text.replace(/(?<![\/\w])_([^_]+?)_(?![\/\w])/g, '<em>$1</em>');

    // 5. Convert plain URLs to clickable links (not already inside an href)
    text = text.replace(
      /(?<!href="|">)(https?:\/\/[^\s,)<]+)/g,
      '<a href="$1" target="_blank" rel="noopener" style="color: #f0c860; text-decoration: underline; text-underline-offset: 2px;">$1</a>'
    );

    // 6. Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  function addMessageToDOM(role, text) {
    const div = document.createElement('div');
    div.className = `ec-msg ec-msg-${role}`;
    if (role === 'assistant') {
      div.innerHTML = formatMessage(text);
    } else {
      div.textContent = text;
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'ec-typing';
    div.id = 'ec-typing-indicator';
    div.innerHTML = '<div class="ec-typing-dot"></div><div class="ec-typing-dot"></div><div class="ec-typing-dot"></div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('ec-typing-indicator');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    // Add user message
    messages.push({ role: 'user', content: text });
    addMessageToDOM('user', text);
    inputEl.value = '';
    sendBtn.disabled = true;
    isLoading = true;
    showTyping();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();

      if (data.reply) {
        messages.push({ role: 'assistant', content: data.reply });
        hideTyping();
        addMessageToDOM('assistant', data.reply);
      } else {
        hideTyping();
        addMessageToDOM('assistant', 'Sorry, I could not process your request. Please try again.');
      }
    } catch (err) {
      hideTyping();
      addMessageToDOM('assistant', 'Connection error. Please try again later.');
    }

    isLoading = false;
  }

  // ── Nudge animation: pulse ring + random tooltip every 2 min ──
  let nudgeInterval = null;
  let lastMsgIndex = -1;

  function playNudge() {
    if (isOpen) return;
    // Pulse ring
    ring.classList.remove('ec-pulse');
    void ring.offsetWidth;
    ring.classList.add('ec-pulse');
    // Random tooltip message (avoid repeating the last one)
    const msgs = getTooltipMessages();
    let idx;
    do { idx = Math.floor(Math.random() * msgs.length); } while (idx === lastMsgIndex && msgs.length > 1);
    lastMsgIndex = idx;
    tooltip.textContent = msgs[idx];
    tooltip.classList.add('ec-show');
    setTimeout(() => { tooltip.classList.remove('ec-show'); }, 4000);
  }

  function startNudge() {
    if (nudgeInterval) return;
    // First nudge after 15 seconds, then every 2 minutes
    setTimeout(() => {
      playNudge();
      nudgeInterval = setInterval(playNudge, 120000);
    }, 15000);
  }

  function stopNudge() {
    tooltip.classList.remove('ec-show');
    ring.classList.remove('ec-pulse');
  }

  startNudge();

  // ── Events ──
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('ec-open');
      dot.style.display = 'none';
      stopNudge();
      toggle.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
      if (messages.length === 0) {
        addMessageToDOM('assistant', getWelcome());
      }
      inputEl.focus();
    } else {
      panel.classList.remove('ec-open');
      dot.style.display = '';
      toggle.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('ec-open');
    dot.style.display = '';
    toggle.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;
  });

  inputEl.addEventListener('input', () => {
    sendBtn.disabled = !inputEl.value.trim() || isLoading;
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  sendBtn.addEventListener('click', () => {
    sendMessage(inputEl.value);
  });

})();
