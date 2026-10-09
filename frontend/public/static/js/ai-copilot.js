// VendorSync AI Copilot Interactive Widget
(function () {
  'use strict';

  function initAICopilot() {
    if (document.getElementById('ai-copilot-root')) return;

    // Load styles
    if (!document.getElementById('ai-copilot-css')) {
      const link = document.createElement('link');
      link.id = 'ai-copilot-css';
      link.rel = 'stylesheet';
      link.href = '/static/css/ai-copilot.css';
      document.head.appendChild(link);
    }

    const root = document.createElement('div');
    root.id = 'ai-copilot-root';
    document.body.appendChild(root);

    let isOpen = false;
    let activeTab = 'chat';
    let aiStatus = { provider: 'Loading...', model: '', connected: false, mode: 'Connecting...' };
    let dbHealth = { status: 'Checking...', dialect: 'SQLite', latency_ms: 0 };
    let vendorsList = [];

    // Helper: basic markdown to HTML converter
    function renderMarkdown(md) {
      if (!md) return '';
      let html = md
        .replace(/^### (.*$)/gim, '<h4 style="margin:8px 0 4px;color:#93c5fd;font-size:13px;">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 style="margin:10px 0 6px;color:#60a5fa;font-size:14px;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code style="background:#334155;padding:2px 4px;border-radius:4px;color:#f8fafc;font-size:11px;">$1</code>')
        .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:14px;">$1</li>')
        .replace(/\n\n/gim, '<br/><br/>');

      // Table formatting
      if (html.includes('|')) {
        const lines = html.split('<br/><br/>');
        html = lines.map(block => {
          if (block.includes('|') && block.includes('---')) {
            const rows = block.split('<br/>').filter(r => r.trim().startsWith('|'));
            if (rows.length >= 2) {
              let tbl = '<table>';
              rows.forEach((r, idx) => {
                const cells = r.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
                if (idx === 0) {
                  tbl += '<thead><tr>' + cells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr></thead><tbody>';
                } else if (!r.includes('---')) {
                  tbl += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
                }
              });
              tbl += '</tbody></table>';
              return tbl;
            }
          }
          return block;
        }).join('<br/><br/>');
      }
      return html;
    }

    // Fetch initial status
    async function loadStatus() {
      try {
        const [aiRes, dbRes, dashRes] = await Promise.all([
          fetch('/api/ai/status', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch('/api/health').then(r => r.ok ? r.json() : null),
          fetch('/api/dashboard', { credentials: 'include' }).then(r => r.ok ? r.json() : null)
        ]);

        if (aiRes) aiStatus = aiRes;
        if (dbRes) dbHealth = dbRes;
        if (dashRes && dashRes.vendors) vendorsList = dashRes.vendors;
        render();
      } catch (e) {
        console.warn('AI Copilot status fetch error:', e);
      }
    }

    function render() {
      root.innerHTML = '';

      // Floating Action Button
      const fab = document.createElement('button');
      fab.className = 'ai-copilot-fab';
      fab.innerHTML = `
        <span class="ai-copilot-fab-pulse"></span>
        <span style="display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          Ask AI Copilot
        </span>
      `;
      fab.onclick = () => {
        isOpen = !isOpen;
        render();
        if (isOpen) {
          setTimeout(() => {
            const input = document.getElementById('ai-copilot-input');
            if (input) input.focus();
          }, 100);
        }
      };
      root.appendChild(fab);

      if (!isOpen) return;

      // Sliding Panel
      const panel = document.createElement('div');
      panel.className = 'ai-copilot-panel';
      panel.innerHTML = `
        <div class="ai-panel-header">
          <div class="ai-panel-title">
            <div class="ai-badge-icon">AI</div>
            <div>
              <h4>VendorSync AI Copilot</h4>
              <small>${aiStatus.mode || 'Enterprise Intelligence'}</small>
            </div>
          </div>
          <button class="ai-close-btn" id="ai-panel-close">✕</button>
        </div>

        <div class="ai-status-strip">
          <div class="ai-status-item">
            <span style="width:7px;height:7px;border-radius:50%;background:${aiStatus.connected ? '#4ade80' : '#38bdf8'}"></span>
            <span>${aiStatus.connected ? 'Google Gemini 1.5 Flash' : 'Local AI Reasoning (Offline)'}</span>
          </div>
          <div class="ai-status-item">
            <span>DB: <b>${dbHealth.dialect}</b> (${dbHealth.latency_ms || 2}ms)</span>
          </div>
        </div>

        <div class="ai-tabs">
          <button class="ai-tab-btn ${activeTab === 'chat' ? 'active' : ''}" id="ai-tab-chat-btn">💬 Interactive Copilot</button>
          <button class="ai-tab-btn ${activeTab === 'audit' ? 'active' : ''}" id="ai-tab-audit-btn">🔍 Deep AI Audit</button>
        </div>

        <div class="ai-tab-content" id="ai-tab-content-area"></div>
      `;

      root.appendChild(panel);

      // Wire close button
      document.getElementById('ai-panel-close').onclick = () => {
        isOpen = false;
        render();
      };

      // Wire tabs
      document.getElementById('ai-tab-chat-btn').onclick = () => {
        activeTab = 'chat';
        render();
      };
      document.getElementById('ai-tab-audit-btn').onclick = () => {
        activeTab = 'audit';
        render();
      };

      // Populate Tab Content
      const contentArea = document.getElementById('ai-tab-content-area');
      if (activeTab === 'chat') {
        renderChatTab(contentArea);
      } else {
        renderAuditTab(contentArea);
      }
    }

    // Default chat messages stored in session
    let chatHistory = [
      {
        sender: 'assistant',
        text: 'Hello! I am your **VendorSync AI Copilot**, grounded in your live vendor portfolio and procurement database. Ask me any question or pick a prompt below!'
      }
    ];

    function renderChatTab(container) {
      container.innerHTML = `
        <div class="ai-chat-messages" id="ai-chat-msgs-box">
          ${chatHistory.map(m => `
            <div class="ai-msg ${m.sender}">
              ${renderMarkdown(m.text)}
            </div>
          `).join('')}
        </div>

        <div class="ai-chips-wrap">
          <button class="ai-chip" data-query="Who are our highest risk vendors and why?">🚨 Highest risk vendors</button>
          <button class="ai-chip" data-query="Compare Northstar Components vs Apex Microdevices">⚖️ Compare top suppliers</button>
          <button class="ai-chip" data-query="Which vendor is best for a $200k critical order?">💡 Best vendor choice</button>
          <button class="ai-chip" data-query="Draft a contract renegotiation strategy for late deliveries">📝 Negotiation strategy</button>
        </div>

        <div class="ai-chat-input-wrap">
          <input type="text" class="ai-chat-input" id="ai-copilot-input" placeholder="Ask AI about vendors, delivery risks, orders..." />
          <button class="ai-send-btn" id="ai-copilot-send">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      `;

      // Auto-scroll messages
      const msgsBox = document.getElementById('ai-chat-msgs-box');
      if (msgsBox) msgsBox.scrollTop = msgsBox.scrollHeight;

      // Quick chips listener
      container.querySelectorAll('.ai-chip').forEach(btn => {
        btn.onclick = () => {
          const q = btn.getAttribute('data-query');
          sendQuery(q);
        };
      });

      // Send handler
      const input = document.getElementById('ai-copilot-input');
      const sendBtn = document.getElementById('ai-copilot-send');

      async function sendQuery(text) {
        if (!text || !text.trim()) return;
        chatHistory.push({ sender: 'user', text: text.trim() });
        chatHistory.push({ sender: 'assistant', text: '*(Analyzing database signals and reasoning with AI...)*' });
        render();

        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message: text.trim() })
          });

          // Replace placeholder
          chatHistory.pop();
          if (res.ok) {
            const data = await res.json();
            chatHistory.push({ sender: 'assistant', text: data.reply });
          } else {
            chatHistory.push({ sender: 'assistant', text: '⚠️ Unable to reach AI copilot service. Please ensure you are logged in.' });
          }
        } catch (err) {
          chatHistory.pop();
          chatHistory.push({ sender: 'assistant', text: '⚠️ Network connection issue: ' + err.message });
        }
        render();
      }

      sendBtn.onclick = () => {
        const val = input.value;
        input.value = '';
        sendQuery(val);
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = input.value;
          input.value = '';
          sendQuery(val);
        }
      };
    }

    let auditResult = null;
    let auditLoading = false;
    let selectedAuditVendor = '';

    function renderAuditTab(container) {
      if (!selectedAuditVendor && vendorsList.length > 0) {
        selectedAuditVendor = vendorsList[0].id;
      }

      container.innerHTML = `
        <div class="ai-audit-form">
          <label style="font-size:12px;color:#94a3b8;font-weight:600;">Select Vendor for AI Diagnosis:</label>
          <select class="ai-audit-select" id="ai-audit-vendor-picker">
            ${vendorsList.map(v => `
              <option value="${v.id}" ${v.id === selectedAuditVendor ? 'selected' : ''}>${v.name} (${v.id}) · ${v.risk} Risk</option>
            `).join('')}
          </select>
          <button class="ai-send-btn" id="ai-run-audit-btn" style="padding:10px;justify-content:center;">
            ${auditLoading ? 'Running AI Evaluation...' : '✨ Run Deep AI Audit'}
          </button>
        </div>

        <div id="ai-audit-result-view">
          ${auditResult ? `
            <div class="ai-audit-card">
              <div class="ai-audit-header">
                <div>
                  <h4 style="margin:0;font-size:14px;color:#f8fafc;">${auditResult.vendor_name}</h4>
                  <small style="color:#94a3b8;">${auditResult.engine}</small>
                </div>
                <span class="ai-audit-tag ai-tag-${auditResult.risk_level.toLowerCase()}">
                  ${auditResult.risk_level} Risk (${auditResult.risk_score}%)
                </span>
              </div>

              <p style="margin:6px 0;color:#cbd5e1;">${auditResult.executive_summary}</p>

              <div class="ai-audit-section">
                <b>🚨 Key Risk Drivers</b>
                <ul>
                  ${auditResult.key_risk_drivers.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-audit-section">
                <b>✅ Positive Indicators</b>
                <ul>
                  ${auditResult.positive_indicators.map(p => `<li>${p}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-audit-section">
                <b>💡 Strategic Recommendations</b>
                <ul>
                  ${auditResult.strategic_recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-audit-section" style="background:#090e1a;padding:8px;border-radius:6px;border-left:3px solid #38bdf8;margin-top:8px;">
                <b style="color:#38bdf8;">🤝 Contract Negotiation Strategy</b>
                <p style="margin:4px 0;color:#e2e8f0;">${auditResult.contract_negotiation_advice}</p>
              </div>
            </div>
          ` : `
            <div style="text-align:center;padding:30px 10px;color:#64748b;">
              <p style="margin:0;font-size:13px;">Pick a supplier and run Deep AI Audit to receive a multi-factor risk diagnosis, root-cause drivers, and contract negotiation tactics.</p>
            </div>
          `}
        </div>
      `;

      const picker = document.getElementById('ai-audit-vendor-picker');
      if (picker) {
        picker.onchange = (e) => {
          selectedAuditVendor = e.target.value;
        };
      }

      const runBtn = document.getElementById('ai-run-audit-btn');
      if (runBtn) {
        runBtn.onclick = async () => {
          if (!selectedAuditVendor) return;
          auditLoading = true;
          render();

          try {
            const res = await fetch(`/api/ai/analyze/${selectedAuditVendor}`, {
              method: 'POST',
              credentials: 'include'
            });
            if (res.ok) {
              auditResult = await res.json();
            } else {
              alert('Error running AI audit. Ensure you are signed in.');
            }
          } catch (e) {
            alert('Audit request failed: ' + e.message);
          } finally {
            auditLoading = false;
            render();
          }
        };
      }
    }

    // Initial load
    loadStatus();

    // Check periodically for session login
    setInterval(loadStatus, 20000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAICopilot);
  } else {
    initAICopilot();
  }
})();
