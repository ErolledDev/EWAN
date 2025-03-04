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
      .cw-shadow-lg { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
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
      .cw-break-all { word-break: break-all; }
      .cw-hidden { display: none; }

      /* Chat window transition */
      .cw-chat-window {
        visibility: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: visibility 0s 0.3s, opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
        border-radius: 1.25rem;
        overflow: hidden;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
        height: 500px; /* Fixed height for chat window */
      }
      .cw-chat-window.cw-open {
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        transition: visibility 0s, opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto;
      }

      /* Modern chat bubble styles with pointers */
      .cw-chat-bubble {
        position: relative;
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 1.25rem;
        margin-bottom: 0.25rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        line-height: 1.5;
        word-break: break-word;
        overflow-wrap: break-word;
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
        background-color: #f3f4f6;
        color: #1f2937;
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
        border-right-color: #f3f4f6;
        border-bottom-color: #f3f4f6;
      }

      /* Chat button styles */
      .cw-chat-button {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        border: none;
        outline: none;
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 2147483647;
      }
      .cw-chat-button:hover {
        transform: scale(1.05);
      }
      .cw-chat-button:active {
        transform: scale(0.95);
      }
      
      /* Notification dot animation */
      .cw-notification-dot {
        position: absolute;
        top: 0;
        right: 0;
        width: 12px;
        height: 12px;
        background-color: #ef4444;
        border-radius: 50%;
        border: 2px solid white;
      }
      .cw-notification-dot::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        background-color: #ef4444;
        animation: cw-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      @keyframes cw-ping {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }

      /* Header styles */
      .cw-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        height: 70px; /* Increased height for header */
      }
      
      /* Header title styles - improved */
      .cw-header-title {
        display: flex;
        flex-direction: column;
      }
      .cw-header-title h3 {
        font-weight: 600;
        font-size: 1.05rem;
        line-height: 1.3;
        margin: 0;
      }
      .cw-header-title p {
        font-size: 0.8rem;
        line-height: 1.3;
        margin: 0;
        opacity: 0.9;
      }

      /* Close icon styles */
      .cw-close-icon {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s ease;
      }
      .cw-close-icon:hover {
        opacity: 1;
      }

      /* Input area styles */
      .cw-input-area {
        border-top: 1px solid #e5e7eb;
        background-color: #fff;
        padding: 0.75rem 1rem;
        height: 70px; /* Increased height for input area */
      }
      .cw-input-container {
        display: flex;
        background-color: #f3f4f6;
        border-radius: 1.5rem;
        padding: 0.5rem 0.75rem;
        transition: all 0.2s ease;
        position: relative;
      }
      .cw-input-container:focus-within {
        background-color: #fff;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
      .cw-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.5rem 3rem 0.5rem 0.5rem;
        font-size: 0.95rem;
        outline: none;
        height: 24px;
        line-height: 24px;
      }
      .cw-send-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        border: none;
        outline: none;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: #4f46e5;
      }
      .cw-send-button:hover {
        transform: translateY(-50%) scale(1.05);
      }
      .cw-send-button:active {
        transform: translateY(-50%) scale(0.95);
      }

      /* Messages container */
      .cw-messages-container {
        height: 360px; /* Adjusted height for messages container */
        overflow-y: auto;
        background-color: #f9fafb;
        background-image: 
          radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.01) 2%, transparent 0%), 
          radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.01) 2%, transparent 0%);
        background-size: 100px 100px;
      }
      
      /* Timestamp styles */
      .cw-timestamp {
        font-size: 0.7rem;
        color: #6b7280;
        margin-top: 0.25rem;
        display: inline-block;
      }
      .cw-timestamp-user {
        text-align: right;
        margin-right: 0.5rem;
      }
      .cw-timestamp-bot {
        text-align: left;
        margin-left: 0.5rem;
      }

      /* Typing indicator */
      .cw-typing-indicator {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: #f3f4f6;
        border-radius: 1.25rem;
        width: fit-content;
        margin: 0.5rem 0;
      }
      .cw-typing-dot {
        width: 8px;
        height: 8px;
        background-color: #9ca3af;
        border-radius: 50%;
        margin: 0 2px;
        display: inline-block;
        animation: cw-typing-animation 1.4s infinite ease-in-out both;
      }
      .cw-typing-dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .cw-typing-dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      @keyframes cw-typing-animation {
        0%, 80%, 100% { transform: scale(0.7); }
        40% { transform: scale(1); }
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
      this.messagePollingInterval = null;
      this.showNotificationDot = !localStorage.getItem('chat_notification_seen');
      this.isTyping = false;
      this.hasUserSentFirstMessage = false; // Track if user has sent first message
      
      // DOM elements
      this.container = null;
      this.chatButton = null;
      this.chatWindow = null;
      this.header = null;
      this.messagesContainer = null;
      this.form = null;
      this.input = null;
      
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
      this.createChatElements();
      this.updateUI();
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

        const settingsData = await settingsResp.json();
        this.settings = settingsData.length > 0 ? settingsData[0] : {
          business_name: 'Chat Support',
          primary_color: '#4f46e5',
          welcome_message: 'Welcome! How can we help you today?',
          sales_representative: 'Support Agent',
          fallback_message: "I'll connect you with our team for assistance."
        };
        
        this.autoReplies = await autoRepliesResp.json() || [];
        this.advancedReplies = await advancedRepliesResp.json() || [];
      } catch (error) {
        console.error('Error fetching widget data:', error);
        // Set default settings if fetch fails
        this.settings = {
          business_name: 'Chat Support',
          primary_color: '#4f46e5',
          welcome_message: 'Welcome! How can we help you today?',
          sales_representative: 'Support Agent',
          fallback_message: "I'll connect you with our team for assistance."
        };
      }
    }

    createChatElements() {
      if (!this.settings) return;

      // Chat Button
      this.chatButton = document.createElement('button');
      this.chatButton.className = 'cw-chat-button cw-flex cw-items-center cw-justify-center cw-w-14 cw-h-14 cw-rounded-full cw-shadow-lg cw-transition-all cw-focus-outline-none';
      this.chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      this.chatButton.innerHTML = `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.messageCircle}</span>`;
      this.chatButton.setAttribute('aria-label', 'Open chat');
      this.chatButton.onclick = () => this.toggleChat();
      
      // Add notification dot if first time
      if (this.showNotificationDot) {
        const notificationDot = document.createElement('div');
        notificationDot.className = 'cw-notification-dot';
        this.chatButton.appendChild(notificationDot);
      }
      
      this.container.appendChild(this.chatButton);

      // Chat Window
      this.chatWindow = document.createElement('div');
      this.chatWindow.className = 'cw-chat-window cw-bg-white cw-rounded-lg cw-shadow-lg cw-w-80 cw-sm-w-96 cw-mt-4 cw-flex cw-flex-col cw-overflow-hidden cw-fixed cw-bottom-4 cw-right-4';

      // Header
      this.header = document.createElement('div');
      this.header.className = 'cw-header cw-p-3 cw-flex cw-justify-between cw-items-center';
      this.header.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      this.header.style.borderTopLeftRadius = '1.25rem';
      this.header.style.borderTopRightRadius = '1.25rem';

      const headerLeft = document.createElement('div');
      headerLeft.className = 'cw-flex cw-items-center';

      const agentAvatar = document.createElement('div');
      agentAvatar.className = 'cw-w-10 cw-h-10 cw-rounded-full cw-bg-white cw-flex cw-items-center cw-justify-center cw-mr-3';
      agentAvatar.innerHTML = `<span class="cw-text-lg" style="color: ${this.settings.primary_color || '#4f46e5'}">${icons.user}</span>`;

      const titleDiv = document.createElement('div');
      titleDiv.className = 'cw-header-title';
      titleDiv.innerHTML = `
        <h3 class="cw-text-white">${this.settings.business_name || 'Chat'}</h3>
        <p class="cw-text-white">Online | ${this.settings.sales_representative || 'Support'}</p>
      `;

      headerLeft.append(agentAvatar, titleDiv);

      const headerActions = document.createElement('div');
      headerActions.className = 'cw-flex cw-items-center';

      const closeIcon = document.createElement('div');
      closeIcon.className = 'cw-close-icon cw-text-white';
      closeIcon.innerHTML = `<span class="cw-w-5 cw-h-5">${icons.x}</span>`;
      closeIcon.setAttribute('aria-label', 'Close chat');
      closeIcon.onclick = () => this.toggleChat();

      headerActions.append(closeIcon);
      this.header.append(headerLeft, headerActions);

      // Messages Container
      this.messagesContainer = document.createElement('div');
      this.messagesContainer.className = 'cw-messages-container cw-flex-1 cw-p-4 cw-overflow-y-auto';

      // Input Form
      this.form = document.createElement('form');
      this.form.className = 'cw-input-area';
      this.form.innerHTML = `
        <div class="cw-input-container">
          <input type="text" placeholder="Type your message..." class="cw-input" aria-label="Message">
          <button type="submit" class="cw-send-button" aria-label="Send message">
            <span class="cw-w-5 cw-h-5 cw-text-white">${icons.send}</span>
          </button>
        </div>
      `;

      this.input = this.form.querySelector('input');
      this.input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.form.dispatchEvent(new Event('submit'));
        }
      };
      this.form.onsubmit = (e) => {
        e.preventDefault();
        if (this.input.value.trim()) {
          this.sendMessage(this.input.value);
          this.input.value = '';
        }
      };

      // Append all elements to chat window
      this.chatWindow.append(this.header, this.messagesContainer, this.form);
      this.container.appendChild(this.chatWindow);
    }

    updateUI() {
      if (!this.settings) return;

      // Update chat button
      this.chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      this.chatButton.style.display = this.isOpen ? 'none' : 'flex';
      this.chatButton.setAttribute('aria-label', this.isOpen ? 'Close chat' : 'Open chat');

      // Update chat window visibility
      if (this.isOpen && !this.isMinimized) {
        this.chatWindow.classList.add('cw-open');
        this.updateChatContent();
      } else {
        this.chatWindow.classList.remove('cw-open');
      }
      
      // Update send button color
      const sendButtons = document.querySelectorAll('.cw-send-button');
      sendButtons.forEach(button => {
        button.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      });
    }

    updateChatContent() {
      // Update messages
      this.messagesContainer.innerHTML = '';

      if (!this.messages.length) {
        this.messagesContainer.innerHTML = `
          <div class="cw-flex cw-flex-col cw-items-center cw-justify-center cw-h-full cw-text-gray-500">
            <div class="cw-w-16 cw-h-16 cw-rounded-full cw-bg-gray-100 cw-flex cw-items-center cw-justify-center cw-mb-2">
              <span class="cw-w-8 cw-h-8">${icons.messageCircle}</span>
            </div>
            <p class="cw-font-medium">Start a conversation</p>
            <p class="cw-text-sm">Send a message to begin</p>
          </div>
        `;
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
          groupEl.className = `cw-flex ${group.sender === 'user' ? 'cw-justify-end' : 'cw-justify-start'}`;

          const messagesEl = document.createElement('div');
          messagesEl.className = 'cw-flex cw-flex-col';

          group.messages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = `cw-chat-bubble ${msg.sender === 'user' ? 'cw-chat-bubble-user' : 'cw-chat-bubble-bot'} cw-break-words cw-whitespace-pre-wrap`;
            bubble.innerHTML = `<div class="cw-break-words cw-whitespace-pre-wrap">${msg.text}</div>`;
            messagesEl.appendChild(bubble);
          });

          const timestamp = document.createElement('div');
          timestamp.className = `cw-timestamp ${group.sender === 'user' ? 'cw-timestamp-user' : 'cw-timestamp-bot'}`;
          timestamp.textContent = formatTime(group.messages[group.messages.length - 1].timestamp);
          messagesEl.appendChild(timestamp);

          groupEl.appendChild(messagesEl);
          wrapper.appendChild(groupEl);
        });

        // Add typing indicator if needed
        if (this.isTyping) {
          const typingEl = document.createElement('div');
          typingEl.className = 'cw-flex cw-justify-start';
          typingEl.innerHTML = `
            <div class="cw-typing-indicator">
              <div class="cw-typing-dot"></div>
              <div class="cw-typing-dot"></div>
              <div class="cw-typing-dot"></div>
            </div>
          `;
          wrapper.appendChild(typingEl);
        }

        this.messagesContainer.appendChild(wrapper);
      }

      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

      // Focus input
      setTimeout(() => this.input?.focus(), 100);
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.isMinimized = false;
      
      // Mark notification as seen when opening chat
      if (this.isOpen && this.showNotificationDot) {
        this.showNotificationDot = false;
        localStorage.setItem('chat_notification_seen', 'true');
        const notificationDot = this.chatButton.querySelector('.cw-notification-dot');
        if (notificationDot) {
          notificationDot.remove();
        }
      }
      
      this.updateUI();
      
      if (this.isOpen) {
        this.createChatSession();
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
        
        // Only update UI if messages have changed
        if (JSON.stringify(formatted) !== JSON.stringify(this.messages)) {
          this.messages = formatted;
          this.updateChatContent();
          
          // Check if user has sent a message
          if (formatted.some(msg => msg.sender === 'user')) {
            this.hasUserSentFirstMessage = true;
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    async createChatSession() {
      if (!this.sessionId) {
        try {
          // First check if there's an existing active session for this visitor
          const existingSessionResp = await fetch(
            `${this.supabase.url}/rest/v1/chat_sessions?user_id=eq.${this.userId}&visitor_id=eq.${this.visitorId}&status=eq.active&order=created_at.desc&limit=1`, 
            {
              headers: { 'apikey': this.supabase.key, 'Authorization': `Bearer ${this.supabase.key}` }
            }
          );
          
          const existingSessions = await existingSessionResp.json();
          
          if (existingSessions && existingSessions.length > 0) {
            // Use existing session
            this.sessionId = existingSessions[0].id;
            await this.fetchMessages();
          } else {
            // Create new session
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
                updated_at: new Date().toISOString(),
                metadata: {}
              })
            });
            
            const data = await resp.json();
            this.sessionId = data[0].id;

            // Only send welcome message if configured and this is a new session
            if (this.settings.welcome_message) {
              await this.sendBotReply(this.settings.welcome_message);
            }
          }
          
          this.startMessagePolling();
        } catch (error) {
          console.error('Error creating chat session:', error);
        }
      }
    }

    async sendMessage(text) {
      if (!this.sessionId) await this.createChatSession();

      const userMessage = { id: generateId(), sender: 'user', text, timestamp: new Date() };
      this.messages.push(userMessage);
      this.updateChatContent();
      
      // Mark that user has sent their first message
      this.hasUserSentFirstMessage = true;

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

      const replyText = this.findReply(text.toLowerCase());
      
      // Show typing indicator
      this.isTyping = true;
      this.updateChatContent();
      
      if (replyText) {
        // Add a small delay to make it feel more natural
        setTimeout(() => {
          this.isTyping = false;
          this.sendBotReply(replyText);
        }, 1500);
      } else if (this.settings.fallback_message) {
        setTimeout(() => {
          this.isTyping = false;
          this.sendBotReply(this.settings.fallback_message);
        }, 1500);
      } else {
        // Hide typing indicator after a delay if no response
        setTimeout(() => {
          this.isTyping = false;
          this.updateChatContent();
        }, 1500);
      }
    }

    findReply(userMessage) {
      // First check auto replies
      for (const reply of this.autoReplies) {
        const keywords = reply.keywords;
        if (reply.matching_type === 'word_match') {
          if (keywords.some(k => userMessage.includes(k.toLowerCase()))) {
            return reply.response;
          }
        } else if (reply.matching_type === 'regex') {
          try {
            if (keywords.some(k => new RegExp(k, 'i').test(userMessage))) {
              return reply.response;
            }
          } catch (e) {
            console.error('Invalid regex:', e);
          }
        }
      }
      
      // Then check advanced replies
      for (const reply of this.advancedReplies) {
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
      const botMessage = { id: generateId(), sender: 'bot', text, timestamp: new Date() };
      this.messages.push(botMessage);
      this.updateChatContent();

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
  }

  window.BusinessChatPlugin = function(options) {
    return new ChatWidget(options);
  };
})();