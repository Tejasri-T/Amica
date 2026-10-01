import './style.css';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const API_BASE = 'http://localhost:8000';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
const ICONS = {
  logo: `<svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="21" cy="21" r="19" stroke="#c1d1cf" stroke-width="1.5" opacity="0.3"/>
    <circle cx="21" cy="21" r="12" stroke="#748b91" stroke-width="1" opacity="0.5"/>
    <circle cx="21" cy="21" r="5" fill="#8fa8a6" opacity="0.6"/>
    <line x1="21" y1="2" x2="21" y2="10" stroke="#c1d1cf" stroke-width="1" opacity="0.3"/>
    <line x1="21" y1="32" x2="21" y2="40" stroke="#c1d1cf" stroke-width="1" opacity="0.3"/>
    <line x1="2" y1="21" x2="10" y2="21" stroke="#c1d1cf" stroke-width="1" opacity="0.3"/>
    <line x1="32" y1="21" x2="40" y2="21" stroke="#c1d1cf" stroke-width="1" opacity="0.3"/>
  </svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>`,
  chat: `<svg viewBox="0 0 20 20" fill="currentColor" class="sidebar-item-icon"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3V14H4a2 2 0 01-2-2V5z"/></svg>`,
  tasks: `<svg viewBox="0 0 20 20" fill="currentColor" class="sidebar-item-icon"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"/></svg>`,
  calendar: `<svg viewBox="0 0 20 20" fill="currentColor" class="sidebar-item-icon"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>`,
  memory: `<svg viewBox="0 0 20 20" fill="currentColor" class="sidebar-item-icon"><path d="M13 7H7v6h6V7z"/><path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clip-rule="evenodd"/></svg>`,
  settings: `<svg viewBox="0 0 20 20" fill="currentColor" class="sidebar-item-icon"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`,
  welcomeIcon: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" stroke="#748b91" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
    <circle cx="40" cy="40" r="24" stroke="#c1d1cf" stroke-width="1.5" opacity="0.3"/>
    <circle cx="40" cy="40" r="10" fill="#8fa8a6" opacity="0.3"/>
    <circle cx="40" cy="40" r="4" fill="#c1d1cf" opacity="0.6"/>
    <line x1="40" y1="4" x2="40" y2="16" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <line x1="40" y1="64" x2="40" y2="76" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <line x1="4" y1="40" x2="16" y2="40" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <line x1="64" y1="40" x2="76" y2="40" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
  </svg>`,
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

let messages: ChatMessage[] = [];
let isLoading = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getDateString(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
async function sendMessage(message: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    console.log("here")
    const data = await res.json();
    console.log(data)
    return data.response;
  } catch (err) {
    console.error('API Error:', err);
    // Fallback response when backend is not running
    return "⚠ Unable to reach the server. Please ensure the backend is running on port 8000.";
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function renderApp(): void {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <!-- HUD decorative elements -->
    <div class="scanline-overlay"></div>
    <div class="grid-bg"></div>
    <div class="vignette"></div>
    <div class="hud-corner hud-corner--tl"></div>
    <div class="hud-corner hud-corner--tr"></div>
    <div class="hud-corner hud-corner--bl"></div>
    <div class="hud-corner hud-corner--br"></div>

    <!-- Header -->
    <header class="hud-header" id="hud-header">
      <div class="hud-logo">
        <div class="hud-logo-icon">${ICONS.logo}</div>
        <div>
          <div class="hud-logo-text">AMICA</div>
          <div class="hud-logo-sub">Personal Life Assistant</div>
        </div>
      </div>
      <div class="hud-status">
        <div class="hud-status-item">
          <div class="status-dot"></div>
          <span>SYSTEM ONLINE</span>
        </div>
        <div class="hud-status-item">
          <span id="clock">${getTimeString()}</span>
        </div>
        <div class="hud-status-item">
          <span>${getDateString()}</span>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="hud-main">
      <!-- Sidebar -->
      <aside class="hud-sidebar" id="hud-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">Navigation</div>
          <div class="sidebar-item active" data-panel="chat" id="nav-chat">
            ${ICONS.chat}
            <span>Chat</span>
          </div>
          <div class="sidebar-item" data-panel="tasks" id="nav-tasks">
            ${ICONS.tasks}
            <span>Tasks</span>
          </div>
          <div class="sidebar-item" data-panel="calendar" id="nav-calendar">
            ${ICONS.calendar}
            <span>Schedule</span>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">System</div>
          <div class="sidebar-item" data-panel="memory" id="nav-memory">
            ${ICONS.memory}
            <span>Memory</span>
          </div>
          <div class="sidebar-item" data-panel="settings" id="nav-settings">
            ${ICONS.settings}
            <span>Settings</span>
          </div>
        </div>
      </aside>

      <!-- Chat -->
      <section class="hud-chat" id="hud-chat">
        <div class="chat-header">
          <span class="chat-header-title">Communication Channel</span>
          <span class="chat-header-meta" id="msg-count">${messages.length} MESSAGES</span>
        </div>

        <div class="chat-messages" id="chat-messages">
          ${messages.length === 0 ? renderWelcome() : renderMessages()}
        </div>

        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <input
              type="text"
              class="chat-input"
              id="chat-input"
              placeholder="Enter your message..."
              autocomplete="off"
              ${isLoading ? 'disabled' : ''}
            />
            <button class="chat-send-btn" id="send-btn" ${isLoading ? 'disabled' : ''}>
              ${ICONS.send}
            </button>
          </div>
          <div class="chat-input-hint">PRESS ENTER TO SEND · POWERED BY LANGGRAPH</div>
        </div>
      </section>
    </main>
  `;

  bindEvents();
  scrollToBottom();
}

function renderWelcome(): string {
  return `
    <div class="welcome-screen">
      <div class="welcome-icon">${ICONS.welcomeIcon}</div>
      <div class="welcome-title">Welcome to Amica</div>
      <div class="welcome-subtitle">
        Your AI-powered personal life assistant. I can help you manage tasks,
        organize schedules, set reminders, and more. Start a conversation below.
      </div>
      <div class="welcome-chips">
        <div class="welcome-chip" data-prompt="Hello, what can you do?">What can you do?</div>
        <div class="welcome-chip" data-prompt="Help me plan my day">Plan my day</div>
        <div class="welcome-chip" data-prompt="I have a task to complete">Add a task</div>
        <div class="welcome-chip" data-prompt="Set a reminder for tomorrow">Set reminder</div>
      </div>
    </div>
  `;
}

function renderMessages(): string {
  let html = '';

  for (const msg of messages) {
    html += `
      <div class="chat-message ${msg.role}">
        <div class="message-sender">${msg.role === 'user' ? 'YOU' : 'AMICA'}</div>
        <div class="message-bubble">${escapeHtml(msg.content)}</div>
        <div class="message-time">${msg.timestamp}</div>
      </div>
    `;
  }

  if (isLoading) {
    html += `
      <div class="chat-message assistant">
        <div class="message-sender">AMICA</div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
  }

  return html;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
function bindEvents(): void {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;

  // Send on Enter
  input?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  });

  // Send on button click
  sendBtn?.addEventListener('click', () => {
    if (!isLoading) handleSend();
  });

  // Welcome chips
  document.querySelectorAll('.welcome-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = (chip as HTMLElement).dataset.prompt;
      if (prompt) {
        handleSend(prompt);
      }
    });
  });

  // Sidebar navigation (visual only — only chat is functional)
  document.querySelectorAll('.sidebar-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Focus input
  input?.focus();
}

async function handleSend(overrideText?: string): Promise<void> {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const text = overrideText || input?.value.trim();

  if (!text || isLoading) return;

  // Add user message
  messages.push({
    role: 'user',
    content: text,
    timestamp: getTimeString(),
  });

  isLoading = true;
  renderApp();

  // Get response
  const response = await sendMessage(text);

  // Add assistant message
  messages.push({
    role: 'assistant',
    content: response,
    timestamp: getTimeString(),
  });

  isLoading = false;
  renderApp();
}

function scrollToBottom(): void {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------
setInterval(() => {
  const clock = document.getElementById('clock');
  if (clock) clock.textContent = getTimeString();
}, 1000);

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
renderApp();
