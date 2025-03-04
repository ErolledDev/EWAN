(function() {
  // Inject modern styles with animations and enhancements
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Base positioning and layout */
      .cw-fixed { position: fixed; }
      .cw-bottom-4 { bottom: 1rem; }
      .cw-right-4 { right: 1rem; }
      .cw-z-50 { z-index: 2147483647; }
      .cw-flex { display: flex; }
      .cw-flex-col { flex-direction: column; }
      .cw-items-end { align-items: flex-end; }
      .cw-items-center { align-items: center; }
      .cw-items-start { align-items: flex-start; }
      .cw-justify-center { justify-content: center; }
      .cw-justify-between { justify-content: space-between; }
      .cw-justify-end { justify-content: flex-end; }
      .cw-justify-start { justify-content: flex-start; }
      .cw-w-14 { width: 3.5rem; }
      .cw-h-14 { height: 3.5rem; }
      .cw-w-6 { width: 1.5rem; }
      .cw-h-6 { height: 1.5rem; }
      .cw-w-5 { width: 1.25rem; }
      .cw-h-5 { height: 1.25rem; }
      .cw-w-80 { width: 20rem; }
      .cw-max-w-80 { max-width: 80%; }
      .cw-max-h-80vh { max-height: 80vh; }
      .cw-max-h-50vh { max-height: 50vh; }
      .cw-flex-1 { flex: 1 1 0%; }
      .cw-rounded-full { border-radius: 9999px; }
      .cw-rounded-lg { border-radius: 0.5rem; }
      .cw-bg-white { background-color: white; }
      .cw-bg-gray-100 { background-color: #f3f4f6; }
      .cw-text-white { color: white; }
      .cw-text-gray-500 { color: #6b7280; }
      .cw-text-gray-700 { color: #374151; }
      .cw-text-blue-600 { color: #2563eb; }
      .cw-text-xs { font-size: 0.75rem; }
      .cw-text-sm { font-size: 0.875rem; }
      .cw-font-medium { font-weight: 500; }
      .cw-font-semibold { font-weight: 600; }
      .cw-p-4 { padding: 1rem; }
      .cw-p-3 { padding: 0.75rem; }
      .cw-px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .cw-py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .cw-mt-4 { margin-top: 1rem; }
      .cw-mb-2 { margin-bottom: 0.5rem; }
      .cw-mr-2 { margin-right: 0.5rem; }
      .cw-ml-2 { margin-left: 0.5rem; }
      .cw-space-y-4 > * + * { margin-top: 1rem; }
      .cw-shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
      .cw-border-t { border-top-width: 1px; }
      .cw-border-gray-200 { border-color: #e5e7eb; }
      .cw-overflow-hidden { overflow: hidden; }
      .cw-overflow-y-auto { overflow-y: auto; }
      .cw-transition-all { transition: all 0.15s ease; }
      .cw-focus-outline-none:focus { outline: none; }
      .cw-focus-ring-2:focus { box-shadow: 0 0 0 2px #3b82f6; }
      .cw-resize-none { resize: none; }
      .cw-whitespace-pre-wrap { white-space: pre-wrap; }
      .cw-break-words { overflow-wrap: break-word; }

      /* Smooth animations */
      .cw-animate-slide-up {
        animation: cw-slide-up 0.3s ease-out;
      }
      @keyframes cw-slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .cw-animate-slide-in {
        animation: cw-slide-in 0.3s ease-in-out;
      }
      @keyframes cw-slide-in {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .cw-typing-indicator span {
        height: 8px;
        width: 8px;
        margin: 0 1px;
        background-color: #9ca3af;
        border-radius: 50%;
        display: inline-block;
        animation: cw-typing 1s infinite;
      }
      .cw-typing-indicator span:nth-child(1) { animation-delay: 0.1s; }
      .cw-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      .cw-typing-indicator span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes cw-typing {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      /* Modern chat bubble styles with pointers */
      .cw-chat-bubble {
        position: relative;
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        margin-bottom: 0.25rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .cw-chat-bubble-user {
        background-color: #2563eb;
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 0.25rem;
      }
      .cw-chat-bubble-user::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-left-color: #2563eb;
        border-bottom-color: #2563eb;
      }
      .cw-chat-bubble-bot {
        background-color: #f3f4f6;
        color: #1f2937;
        margin-right: auto;
        border-bottom-left-radius: 0.25rem;
      }
      .cw-chat-bubble-bot::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right-color: #f3f4f6;
        border-bottom-color: #f3f4f6;
      }
      .cw-chat-bubble-agent {
        background-color: #10b981;
        color: white;
        margin-right: auto;
        border-bottom-left-radius: 0.25rem;
      }
      .cw-chat-bubble-agent::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right-color: #10b981;
        border-bottom-color: #10b981;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .cw-w-80 { width: calc(100vw - 2rem); }
      }
      @media (min-width: 640px) {
        .cw-sm-w-96 { width: 24rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // SVG Icons
  const icons = {
    messageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  };

  // Utility Functions
  function formatTime(date) {
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  }

  function generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  class ChatWidget {
    constructor(options) {
      this.userId = options.uid;
      this.isOpen = false;
      this.isMinimized = false;
      this.messages = [];
      this.settings = null;
      this.autoReplies = [];
      this.advancedReplies = [];
      this.sessionId = null;
      this.visitorId = localStorage.getItem('chat_visitor_id') || generateId();
      this.isTyping = false;
      this.messagePollingInterval = null;
      
      localStorage.setItem('chat_visitor_id', this.visitorId);
      
      this.supabase = {
        url: 'https://zawhdprorlwaagmmyyer.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8'
      };
      
      this.init();
    }

    async init() {
      injectStyles();
      this.container = document.createElement('div');
      this.container.className = 'cw-fixed cw-bottom-4 cw-right-4 cw-z-50 cw-flex cw-flex-col cw-items-end';
      document.body.appendChild(this.container);
      await this.fetchWidgetData();
      this.render();
    }

    async fetchWidgetData() {
      try {
        const [settingsResp, autoRepliesResp, advancedRepliesResp] = await Promise.all([
          fetch(`${this.supabase.url}/rest/v1/widget_settings?user_id=eq.${this.userId}&order=created_at.desc&limit=1`, {
            headers: { 'apikey': this.supabase.key, 'Authorization': `Bearer ${this.supabase.key}` }
          }),
          fetch(`${this.supabase.url}/rest/v1/auto_replies?user_id=eq.${this.userId}`, {
            headers: { 'apikey': this.supabase.key, 'Authorization': `Bearer ${this.supabase.key}` }
          }),
          fetch(`${this.supabase.url}/rest/v1/advanced_replies?user_id=eq.${this.userId}`, {
            headers: { 'apikey': this.supabase.key, 'Authorization': `Bearer ${this.supabase.key}` }
          })
        ]);

        this.settings = (await settingsResp.json())[0] || {};
        this.autoReplies = await autoRepliesResp.json() || [];
        this.advancedReplies = await advancedRepliesResp.json() || [];
      } catch (error) {
        console.error('Error fetching widget data:', error);
      }
    }

    render() {
      if (!this.settings) return;
      this.container.innerHTML = '';

      // Chat Button
      const chatButton = document.createElement('button');
      chatButton.className = 'cw-flex cw-items-center cw-justify-center cw-w-14 cw-h-14 cw-rounded-full cw-shadow-xl cw-transition-all cw-focus-outline-none cw-focus-ring-2';
      chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      chatButton.innerHTML = this.isOpen ? `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.x}</span>` : `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.messageCircle}</span>`;
      chatButton.setAttribute('aria-label', this.isOpen ? 'Close chat' : 'Open chat');
      chatButton.onclick = () => this.toggleChat();
      if (!this.isOpen || this.isMinimized) this.container.appendChild(chatButton);

      // Chat Window
      if (this.isOpen && !this.isMinimized) {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'cw-bg-white cw-rounded-lg cw-shadow-xl cw-w-80 cw-sm-w-96 cw-mt-4 cw-flex cw-flex-col cw-overflow-hidden cw-max-h-80vh cw-animate-slide-up';

        // Header
        const header = document.createElement('div');
        header.className = 'cw-p-4 cw-flex cw-justify-between cw-items-center';
        header.style.backgroundColor = this.settings.primary_color || '#4f46e5';
        header.style.borderTopLeftRadius = '0.5rem';
        header.style.borderTopRightRadius = '0.5rem';

        const headerLeft = document.createElement('div');
        headerLeft.className = 'cw-flex cw-items-center';

        const agentAvatar = document.createElement('div');
        agentAvatar.className = 'cw-w-10 cw-h-10 cw-rounded-full cw-bg-white cw-flex cw-items-center cw-justify-center cw-mr-2';
        agentAvatar.innerHTML = `<span class="cw-text-lg" style="color: ${this.settings.primary_color || '#4f46e5'}">${icons.user}</span>`;

        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = `
          <h3 class="cw-text-white cw-font-semibold">${this.settings.business_name || 'Chat'}</h3>
          <p class="cw-text-xs cw-text-white">Online | ${this.settings.sales_representative || 'Support'}</p>
        `;

        headerLeft.append(agentAvatar, titleDiv);

        const headerActions = document.createElement('div');
        headerActions.className = 'cw-flex cw-items-center cw-space-x-2';

        const closeButton = document.createElement('button');
        closeButton.className = 'cw-text-white cw-focus-outline-none';
        closeButton.innerHTML = `<span class="cw-w-5 cw-h-5">${icons.x}</span>`;
        closeButton.setAttribute('aria-label', 'Close chat');
        closeButton.onclick = () => this.toggleChat();

        headerActions.append(closeButton);
        header.append(headerLeft, headerActions);
        chatWindow.append(header);

        // Messages Container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'cw-flex-1 cw-p-4 cw-overflow-y-auto cw-max-h-50vh';

        if (!this.messages.length) {
          messagesContainer.innerHTML = `
            <div class="cw-flex cw-flex-col cw-items-center cw-justify-center cw-h-full cw-text-gray-500">
              <div class="cw-w-16 cw-h-16 cw-rounded-full cw-bg-gray-100 cw-flex cw-items-center cw-justify-center cw-mb-2">
                <span class="cw-w-8 cw-h-8">${icons.messageCircle}</span>
              </div>
              <p class="cw-font-medium">Start a conversation</p>
              <p class="cw-text-sm">Send a message to begin</p>
            </div>
          `;
          this.createChatSession();
        } else {
          const wrapper = document.createElement('div');
          wrapper.className = 'cw-space-y-4';

          let currentSender = null;
          let messageGroups = [];
          let currentGroup = [];

          this.messages.forEach((msg, idx) => {
            if (msg.sender !== currentSender) {
              if (currentGroup.length) messageGroups.push({ sender: currentSender, messages: [...currentGroup] });
              currentGroup = [msg];
              currentSender = msg.sender;
            } else {
              currentGroup.push(msg);
            }
            if (idx === this.messages.length - 1) messageGroups.push({ sender: currentSender, messages: [...currentGroup] });
          });

          messageGroups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = `cw-flex ${group.sender === 'user' ? 'cw-justify-end' : 'cw-justify-start'} cw-animate-slide-in`;

            const messagesEl = document.createElement('div');
            messagesEl.className = 'cw-flex cw-flex-col';

            group.messages.forEach(msg => {
              const bubble = document.createElement('div');
              bubble.className = `cw-chat-bubble ${msg.sender === 'user' ? 'cw-chat-bubble-user' : msg.sender === 'agent' ? 'cw-chat-bubble-agent' : 'cw-chat-bubble-bot'}`;
              bubble.innerHTML = `<div class="cw-whitespace-pre-wrap cw-break-words">${msg.text}</div>`;
              messagesEl.appendChild(bubble);
            });

            const timestamp = document.createElement('div');
            timestamp.className = `cw-text-xs cw-text-gray-500 ${group.sender === 'user' ? 'cw-text-right' : 'cw-text-left'}`;
            timestamp.textContent = formatTime(group.messages[group.messages.length - 1].timestamp);
            messagesEl.appendChild(timestamp);

            groupEl.appendChild(messagesEl);
            wrapper.appendChild(groupEl);
          });

          messagesContainer.appendChild(wrapper);
        }
        chatWindow.appendChild(messagesContainer);

        // Typing Indicator
        if (this.isTyping) {
          const typing = document.createElement('div');
          typing.className = 'cw-px-4 cw-py-2';
          typing.innerHTML = '<div class="cw-typing-indicator"><span></span><span></span><span></span></div>';
          chatWindow.appendChild(typing);
        }

        // Input Form
        const form = document.createElement('form');
        form.className = 'cw-p-3 cw-border-t cw-border-gray-200';
        form.innerHTML = `
          <div class="cw-flex cw-items-end">
            <textarea rows="1" placeholder="Type your message..." class="cw-flex-1 cw-px-3 cw-py-2 cw-border cw-border-gray-200 cw-rounded-lg cw-focus-outline-none cw-focus-ring-2 cw-resize-none" aria-label="Message"></textarea>
            <button type="submit" class="cw-ml-2 cw-p-2 cw-rounded-full cw-focus-outline-none cw-focus-ring-2" style="background-color: ${this.settings.primary_color || '#4f46e5'}" aria-label="Send message">
              <span class="cw-w-5 cw-h-5 cw-text-white">${icons.send}</span>
            </button>
          </div>
        `;

        const textarea = form.querySelector('textarea');
        textarea.oninput = () => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        };
        textarea.onkeydown = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
          }
        };
        form.onsubmit = (e) => {
          e.preventDefault();
          if (textarea.value.trim()) {
            this.sendMessage(textarea.value);
            textarea.value = '';
            textarea.style.height = 'auto';
          }
        };

        chatWindow.appendChild(form);
        this.container.appendChild(chatWindow);

        // Focus textarea and scroll to bottom
        setTimeout(() => textarea.focus(), 100);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.isMinimized = false;
      this.render();
      if (this.isOpen) {
        this.startMessagePolling();
        document.addEventListener('keydown', this.handleEscapeKey);
      } else {
        this.stopMessagePolling();
        document.removeEventListener('keydown', this.handleEscapeKey);
      }
    }

    handleEscapeKey = (e) => {
      if (e.key === 'Escape') this.toggleChat();
    };

    startMessagePolling() {
      if (this.sessionId && !this.messagePollingInterval) {
        this.messagePollingInterval = setInterval(() => this.fetchMessages(), 3000);
      }
    }

    stopMessagePolling() {
      if (this.messagePollingInterval) {
        clearInterval(this.messagePollingInterval);
        this.messagePollingInterval = null;
      }
    }

    async fetchMessages() {
      if (!this.sessionId) return;
      try {
        const resp = await fetch(`${this.supabase.url}/rest/v1/chat_messages?chat_session_id=eq.${this.sessionId}&order=created_at.asc`, {
          headers: { 'apikey': this.supabase.key, 'Authorization': `Bearer ${this.supabase.key}` }
        });
        const messages = await resp.json();
        const formatted = messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_type,
          text: msg.message,
          timestamp: new Date(msg.created_at)
        }));
        if (formatted.length !== this.messages.length) {
          this.messages = formatted;
          this.render();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    async createChatSession() {
      if (!this.sessionId) {
        try {
          const resp = await fetch(`${this.supabase.url}/rest/v1/chat_sessions`, {
            method: 'POST',
            headers: {
              'apikey': this.supabase.key,
              'Authorization': `Bearer ${this.supabase.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              user_id: this.userId,
              visitor_id: this.visitorId,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
          const data = await resp.json();
          this.sessionId = data[0].id;
          this.startMessagePolling();

          if (this.settings.welcome_message) {
            await this.sendBotReply(this.settings.welcome_message);
          }
        } catch (error) {
          console.error('Error creating chat session:', error);
        }
      }
    }

    async sendMessage(text) {
      if (!this.sessionId) await this.createChatSession();

      const userMessage = { id: generateId(), sender: 'user', text, timestamp: new Date() };
      this.messages.push(userMessage);
      this.render();

      try {
        await Promise.all([
          fetch(`${this.supabase.url}/rest/v1/chat_sessions?id=eq.${this.sessionId}`, {
            method: 'PATCH',
            headers: {
              'apikey': this.supabase.key,
              'Authorization': `Bearer ${this.supabase.key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ updated_at: new Date().toISOString() })
          }),
          fetch(`${this.supabase.url}/rest/v1/chat_messages`, {
            method: 'POST',
            headers: {
              'apikey': this.supabase.key,
              'Authorization': `Bearer ${this.supabase.key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_session_id: this.sessionId,
              sender_type: 'user',
              message: text,
              created_at: new Date().toISOString()
            })
          })
        ]);
      } catch (error) {
        console.error('Error saving user message:', error);
      }

      this.showTypingIndicator();
      const replyText = this.findReply(text.toLowerCase());
      if (replyText) {
        await this.sendBotReply(replyText);
      } else if (this.settings.fallback_message) {
        await this.sendBotReply(this.settings.fallback_message);
      }
      this.hideTypingIndicator();
    }

    findReply(userMessage) {
      for (const reply of [...this.autoReplies, ...this.advancedReplies]) {
        const keywords = reply.keywords;
        if (reply.matching_type === 'word_match') {
          if (keywords.some(k => userMessage.includes(k.toLowerCase()))) {
            return reply.response_type === 'url' ? `<a href="${reply.response}" target="_blank" class="cw-text-blue-600">${reply.button_text || 'Click here'}</a>` : reply.response;
          }
        } else if (reply.matching_type === 'regex') {
          try {
            if (keywords.some(k => new RegExp(k, 'i').test(userMessage))) {
              return reply.response_type === 'url' ? `<a href="${reply.response}" target="_blank" class="cw-text-blue-600">${reply.button_text || 'Click here'}</a>` : reply.response;
            }
          } catch (e) {
            console.error('Invalid regex:', e);
          }
        }
      }
      return null;
    }

    async sendBotReply(text) {
      this.showTypingIndicator();
      const delay = Math.max(1000, text.length * 50); // Minimum 1s, 50ms per char
      await new Promise(resolve => setTimeout(resolve, delay));
      this.hideTypingIndicator();

      const botMessage = { id: generateId(), sender: 'bot', text, timestamp: new Date() };
      this.messages.push(botMessage);
      this.render();

      try {
        await fetch(`${this.supabase.url}/rest/v1/chat_messages`, {
          method: 'POST',
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_session_id: this.sessionId,
            sender_type: 'bot',
            message: text,
            created_at: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error saving bot message:', error);
      }
    }

    showTypingIndicator() {
      this.isTyping = true;
      this.render();
    }

    hideTypingIndicator() {
      this.isTyping = false;
      this.render();
    }
  }

  window.BusinessChatPlugin = function(options) {
    return new ChatWidget(options);
  };
})();