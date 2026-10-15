import './style.css';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const API_BASE = 'http://localhost:8000';
const THREAD_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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
  check: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,
  trash: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  clock: `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>`,
  emptyTasks: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="10" width="48" height="60" rx="4" stroke="#748b91" stroke-width="1.5" opacity="0.3"/>
    <line x1="26" y1="28" x2="54" y2="28" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <line x1="26" y1="38" x2="54" y2="38" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <line x1="26" y1="48" x2="44" y2="48" stroke="#c1d1cf" stroke-width="1" opacity="0.2"/>
    <circle cx="22" cy="28" r="2" fill="#8fa8a6" opacity="0.4"/>
    <circle cx="22" cy="38" r="2" fill="#8fa8a6" opacity="0.4"/>
    <circle cx="22" cy="48" r="2" fill="#8fa8a6" opacity="0.4"/>
  </svg>`,
  emptySchedule: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="14" width="56" height="52" rx="4" stroke="#748b91" stroke-width="1.5" opacity="0.3"/>
    <line x1="12" y1="28" x2="68" y2="28" stroke="#748b91" stroke-width="1" opacity="0.3"/>
    <circle cx="24" cy="21" r="2" fill="#c1d1cf" opacity="0.3"/>
    <circle cx="56" cy="21" r="2" fill="#c1d1cf" opacity="0.3"/>
    <rect x="20" y="34" width="16" height="10" rx="2" fill="#8fa8a6" opacity="0.15" stroke="#8fa8a6" stroke-width="0.5" opacity="0.3"/>
    <rect x="44" y="48" width="16" height="10" rx="2" fill="#8fa8a6" opacity="0.15" stroke="#8fa8a6" stroke-width="0.5" opacity="0.3"/>
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

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  duration_minutes: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

let messages: ChatMessage[] = [];
let isLoading = false;
let activePanel: 'chat' | 'tasks' | 'calendar' = 'chat';
let tasksList: TaskItem[] = [];
let scheduleList: TaskItem[] = [];
let tasksLoading = false;
let scheduleLoading = false;

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
// API — Tasks & Schedule
// ---------------------------------------------------------------------------
async function fetchTasks(): Promise<void> {
  tasksLoading = true;
  renderApp();
  try {
    const res = await fetch(`${API_BASE}/tasks/all`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    tasksList = data.tasks || [];
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    tasksList = [];
  }
  tasksLoading = false;
  renderApp();
}

async function fetchSchedule(): Promise<void> {
  scheduleLoading = true;
  renderApp();
  try {
    const res = await fetch(`${API_BASE}/schedule`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    scheduleList = data.tasks || [];
  } catch (err) {
    console.error('Failed to fetch schedule:', err);
    scheduleList = [];
  }
  scheduleLoading = false;
  renderApp();
}

async function apiCompleteTask(taskId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/tasks/${taskId}/complete`, { method: 'PATCH' });
    if (activePanel === 'tasks') await fetchTasks();
    else if (activePanel === 'calendar') await fetchSchedule();
  } catch (err) {
    console.error('Failed to complete task:', err);
  }
}

async function apiDeleteTask(taskId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
    if (activePanel === 'tasks') await fetchTasks();
    else if (activePanel === 'calendar') await fetchSchedule();
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
}

// ---------------------------------------------------------------------------
// API — Streaming
// ---------------------------------------------------------------------------

/**
 * Sends a message to the streaming endpoint and yields tokens one-by-one.
 * Falls back to the non-streaming /chat endpoint if streaming fails to connect.
 */
async function* streamMessage(message: string): AsyncGenerator<string, void> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, thread_id: THREAD_ID }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split on newlines; the LAST element may be an incomplete line,
    // so keep it in the buffer for the next read iteration.
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue; // skip empty lines between SSE events

      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));

          if (data.token) {
            yield data.token;
          } else if (data.done) {
            return;
          } else if (data.error) {
            throw new Error(data.error);
          }
        } catch (parseErr) {
          // If JSON is truly malformed, skip the line rather than breaking
          if (!(parseErr instanceof SyntaxError)) {
            throw parseErr;
          }
          // SyntaxError on a complete line — skip it (shouldn't normally happen)
          console.warn('Skipping malformed SSE data:', line);
        }
      }
    }
  }
}

/**
 * Legacy non-streaming API call (kept as fallback).
 */
async function sendMessage(message: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id: THREAD_ID }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.error('API Error:', err);
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
          <div class="sidebar-item ${activePanel === 'chat' ? 'active' : ''}" data-panel="chat" id="nav-chat">
            ${ICONS.chat}
            <span>Chat</span>
          </div>
          <div class="sidebar-item ${activePanel === 'tasks' ? 'active' : ''}" data-panel="tasks" id="nav-tasks">
            ${ICONS.tasks}
            <span>Tasks</span>
          </div>
          <div class="sidebar-item ${activePanel === 'calendar' ? 'active' : ''}" data-panel="calendar" id="nav-calendar">
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

      <!-- Chat Panel -->
      <section class="hud-chat" id="hud-chat" style="display: ${activePanel === 'chat' ? 'flex' : 'none'}">
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

      <!-- Tasks Panel -->
      <section class="hud-panel" id="hud-tasks" style="display: ${activePanel === 'tasks' ? 'flex' : 'none'}">
        ${renderTasksPanel()}
      </section>

      <!-- Schedule Panel -->
      <section class="hud-panel" id="hud-schedule" style="display: ${activePanel === 'calendar' ? 'flex' : 'none'}">
        ${renderSchedulePanel()}
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

// ---------------------------------------------------------------------------
// Tasks Panel
// ---------------------------------------------------------------------------
function renderTasksPanel(): string {
  const pendingTasks = tasksList.filter(t => t.status !== 'completed');
  const completedTasks = tasksList.filter(t => t.status === 'completed');

  if (tasksLoading) {
    return `
      <div class="panel-header">
        <span class="panel-header-title">Task Manager</span>
        <span class="panel-header-meta">LOADING...</span>
      </div>
      <div class="panel-content">
        <div class="panel-loading">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span>Fetching tasks...</span>
        </div>
      </div>
    `;
  }

  if (tasksList.length === 0) {
    return `
      <div class="panel-header">
        <span class="panel-header-title">Task Manager</span>
        <span class="panel-header-meta">0 TASKS</span>
      </div>
      <div class="panel-content">
        <div class="panel-empty">
          <div class="panel-empty-icon">${ICONS.emptyTasks}</div>
          <div class="panel-empty-title">No Tasks Yet</div>
          <div class="panel-empty-sub">Use the chat to add tasks. Say something like<br>"Add a task to review the project proposal"</div>
        </div>
      </div>
    `;
  }

  let html = `
    <div class="panel-header">
      <span class="panel-header-title">Task Manager</span>
      <span class="panel-header-meta">${pendingTasks.length} ACTIVE · ${completedTasks.length} DONE</span>
    </div>
    <div class="panel-content">
  `;

  if (pendingTasks.length > 0) {
    html += `<div class="task-section-label">Active Tasks</div>`;
    html += `<div class="task-list">`;
    for (const task of pendingTasks) {
      html += renderTaskCard(task);
    }
    html += `</div>`;
  }

  if (completedTasks.length > 0) {
    html += `<div class="task-section-label completed-label">Completed</div>`;
    html += `<div class="task-list">`;
    for (const task of completedTasks) {
      html += renderTaskCard(task, true);
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function renderTaskCard(task: TaskItem, isCompleted = false): string {
  const priorityClass = task.priority || 'medium';
  const priorityLabel = (task.priority || 'medium').toUpperCase();
  const statusLabel = (task.status || 'pending').replace('_', ' ').toUpperCase();

  let dateStr = '';
  if (task.due_date) {
    const d = new Date(task.due_date + 'T00:00:00');
    dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (task.due_time) {
      dateStr += ` at ${task.due_time.substring(0, 5)}`;
    }
  }

  return `
    <div class="task-card ${isCompleted ? 'task-completed' : ''} priority-${priorityClass}">
      <div class="task-card-left">
        <div class="task-priority-dot priority-dot-${priorityClass}"></div>
        <div class="task-card-info">
          <div class="task-card-title${isCompleted ? ' task-title-done' : ''}">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-card-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-card-meta">
            <span class="task-badge task-badge-${priorityClass}">${priorityLabel}</span>
            <span class="task-badge task-badge-status">${statusLabel}</span>
            ${dateStr ? `<span class="task-card-date">${ICONS.clock} ${dateStr}</span>` : ''}
            ${task.duration_minutes ? `<span class="task-card-duration">${task.duration_minutes} min</span>` : ''}
          </div>
        </div>
      </div>
      <div class="task-card-actions">
        ${!isCompleted ? `<button class="task-action-btn task-complete-btn" data-task-id="${task.id}" title="Mark complete">${ICONS.check}</button>` : ''}
        <button class="task-action-btn task-delete-btn" data-task-id="${task.id}" title="Delete">${ICONS.trash}</button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Schedule Panel
// ---------------------------------------------------------------------------
function renderSchedulePanel(): string {
  if (scheduleLoading) {
    return `
      <div class="panel-header">
        <span class="panel-header-title">Schedule</span>
        <span class="panel-header-meta">LOADING...</span>
      </div>
      <div class="panel-content">
        <div class="panel-loading">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span>Fetching schedule...</span>
        </div>
      </div>
    `;
  }

  if (scheduleList.length === 0) {
    return `
      <div class="panel-header">
        <span class="panel-header-title">Schedule</span>
        <span class="panel-header-meta">NO EVENTS</span>
      </div>
      <div class="panel-content">
        <div class="panel-empty">
          <div class="panel-empty-icon">${ICONS.emptySchedule}</div>
          <div class="panel-empty-title">Schedule is Clear</div>
          <div class="panel-empty-sub">Tasks with due dates will appear here.<br>Try "Schedule a meeting for tomorrow at 2pm"</div>
        </div>
      </div>
    `;
  }

  // Group by date
  const grouped: Record<string, TaskItem[]> = {};
  for (const task of scheduleList) {
    const key = task.due_date || 'Unscheduled';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  }

  let html = `
    <div class="panel-header">
      <span class="panel-header-title">Schedule</span>
      <span class="panel-header-meta">${scheduleList.length} SCHEDULED</span>
    </div>
    <div class="panel-content">
  `;

  for (const [dateKey, tasks] of Object.entries(grouped)) {
    const d = new Date(dateKey + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (d.getTime() === today.getTime()) dateLabel = `Today — ${dateLabel}`;
    else if (d.getTime() === tomorrow.getTime()) dateLabel = `Tomorrow — ${dateLabel}`;

    const isPast = d < today;

    html += `<div class="schedule-date-group${isPast ? ' schedule-past' : ''}">`;
    html += `<div class="schedule-date-header">${dateLabel}</div>`;
    html += `<div class="schedule-timeline">`;

    for (const task of tasks) {
      const timeStr = task.due_time ? task.due_time.substring(0, 5) : '--:--';
      const priorityClass = task.priority || 'medium';

      html += `
        <div class="schedule-item priority-${priorityClass}">
          <div class="schedule-time">${timeStr}</div>
          <div class="schedule-line"><div class="schedule-dot priority-dot-${priorityClass}"></div></div>
          <div class="schedule-info">
            <div class="schedule-title">${escapeHtml(task.title)}</div>
            ${task.description ? `<div class="schedule-desc">${escapeHtml(task.description)}</div>` : ''}
            <div class="schedule-meta">
              <span class="task-badge task-badge-${priorityClass}">${(task.priority || 'medium').toUpperCase()}</span>
              ${task.duration_minutes ? `<span class="task-card-duration">${task.duration_minutes} min</span>` : ''}
            </div>
          </div>
          <div class="task-card-actions">
            <button class="task-action-btn task-complete-btn" data-task-id="${task.id}" title="Mark complete">${ICONS.check}</button>
            <button class="task-action-btn task-delete-btn" data-task-id="${task.id}" title="Delete">${ICONS.trash}</button>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
  }

  html += `</div>`;
  return html;
}

function renderMessages(): string {
  let html = '';

  for (const msg of messages) {
    const isStreaming = msg === messages[messages.length - 1] && msg.role === 'assistant' && isLoading;
    html += `
      <div class="chat-message ${msg.role}">
        <div class="message-sender">${msg.role === 'user' ? 'YOU' : 'AMICA'}</div>
        <div class="message-bubble${isStreaming ? ' streaming' : ''}" ${isStreaming ? 'id="streaming-bubble"' : ''}>${escapeHtml(msg.content)}${isStreaming ? '<span class="streaming-cursor"></span>' : ''}</div>
        <div class="message-time">${msg.timestamp}</div>
      </div>
    `;
  }

  // Show typing indicator only if loading and no streaming message yet
  if (isLoading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant')) {
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

  // Sidebar navigation — switch panels
  document.querySelectorAll('.sidebar-item').forEach((item) => {
    item.addEventListener('click', () => {
      const panel = (item as HTMLElement).dataset.panel as typeof activePanel;
      if (panel === 'chat' || panel === 'tasks' || panel === 'calendar') {
        activePanel = panel;
        if (panel === 'tasks') fetchTasks();
        else if (panel === 'calendar') fetchSchedule();
        else renderApp();
      }
    });
  });

  // Task action buttons
  document.querySelectorAll('.task-complete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = (btn as HTMLElement).dataset.taskId;
      if (taskId) apiCompleteTask(taskId);
    });
  });

  document.querySelectorAll('.task-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = (btn as HTMLElement).dataset.taskId;
      if (taskId) apiDeleteTask(taskId);
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

  try {
    // Create an empty assistant message that we'll fill via streaming
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: getTimeString(),
    };
    messages.push(assistantMsg);
    renderApp();

    // Stream tokens into the message
    for await (const token of streamMessage(text)) {
      assistantMsg.content += token;

      // Update the streaming bubble in-place (no full re-render)
      const bubble = document.getElementById('streaming-bubble');
      if (bubble) {
        bubble.innerHTML = escapeHtml(assistantMsg.content) + '<span class="streaming-cursor"></span>';
        scrollToBottom();
      } else {
        // Fallback: full re-render if bubble not found
        renderApp();
      }
    }

    // Update timestamp to completion time
    assistantMsg.timestamp = getTimeString();
  } catch (err) {
    console.error('Streaming error:', err);

    // Fallback to non-streaming
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && !lastMsg.content) {
      // Remove the empty streaming message
      messages.pop();
    }

    const response = await sendMessage(text);
    messages.push({
      role: 'assistant',
      content: response,
      timestamp: getTimeString(),
    });
  }

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
