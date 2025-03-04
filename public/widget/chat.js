(function() {
  // Simple utility functions
  function generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  function formatTime(date) {
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  }

  // SVG Icons as simple strings
  const ICONS = {
    chat: '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  class ChatWidget {
    constructor(options) {
      // Configuration
      this.userId = options.uid;
      this.supabaseUrl = 'https://zawhdprorlwaagmmyyer.supabase.co';
      this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8';
      
      // State
      this.isOpen = false;
      this.messages = [];
      this.settings = null;
      this.autoReplies = [];
      this.advancedReplies = [];
      this.sessionId = null;
      this.visitorId = localStorage.getItem('chat_visitor_id') || generateId();
      this.isTyping = false;
      this.initialized = false;
      
      // Store visitor ID
      localStorage.setItem('chat_visitor_id', this.visitorId);
      
      // Initialize
      this.init();
    }

    async init() {
      try {
        // Inject styles first
        this.injectStyles();
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'cw-fixed cw-bottom-4 cw-right-4 cw-z-50 cw-flex cw-flex-col cw-items-end';
        document.body.appendChild(this.container);
        
        // Fetch widget data
        await this.fetchWidgetData();
        
        // Create UI elements
        this.createChatElements();
        
        // Mark as initialized
        this.initialized = true;
        
        // Check for existing session
        await this.checkExistingSession();
      } catch (error) {
        console.error('Error initializing chat widget:', error);
      }
    }

    injectStyles() {
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
        .cw-mr-3 { margin-right: 0.75rem; }
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
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
          height: 500px; /* Fixed height for chat window */
          width: 320px;
        }
        .cw-chat-window.cw-open {
          visibility: visible;
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: visibility 0s, opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: auto;
        }

        /* Chat bubble styles */
        .cw-chat-bubble {
          position: relative;
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          margin-bottom: 0.5rem;
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
        .cw-chat-bubble-bot {
          background-color: #f3f4f6;
          color: #1f2937;
          margin-right: auto;
          border-bottom-left-radius: 0.25rem;
        }
        .cw-chat-bubble-agent {
          background-color: #f3f4f6;
          color: #1f2937;
          margin-right: auto;
          border-bottom-left-radius: 0.25rem;
        }

        /* Chat button styles */
        .cw-chat-button {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          border: none;
          outline: none;
          cursor: pointer;
        }
        .cw-chat-button:hover {
          transform: scale(1.05);
        }
        .cw-chat-button:active {
          transform: scale(0.95);
        }
        
        /* Header styles */
        .cw-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          height: 70px; /* Increased height for header */
          padding: 5px 20px;
        }
        
        /* Header title styles */
        .cw-header-title {
          display: flex;
          flex-direction: column;
        }
        .cw-header-title h3 {
          font-weight: 600;
          font-size: 1rem;
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
          .cw-chat-window {
            width: calc(100vw - 2rem);
            right: 1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }

    async fetchWidgetData() {
      try {
        // Fetch widget settings
        const settingsResponse = await fetch(`${this.supabaseUrl}/rest/v1/widget_settings?user_id=eq.${this.userId}&order=created_at.desc&limit=1`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          this.settings = settingsData.length > 0 ? settingsData[0] : {
            business_name: 'Chat Support',
            primary_color: '#4f46e5',
            welcome_message: 'Welcome! How can we help you today?',
            sales_representative: 'Support Agent',
            fallback_message: "I'll connect you with our team for assistance."
          };
        }
        
        // Fetch auto replies
        const autoRepliesResponse = await fetch(`${this.supabaseUrl}/rest/v1/auto_replies?user_id=eq.${this.userId}`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        
        if (autoRepliesResponse.ok) {
          this.autoReplies = await autoRepliesResponse.json() || [];
        }
        
        // Fetch advanced replies
        const advancedRepliesResponse = await fetch(`${this.supabaseUrl}/rest/v1/advanced_replies?user_id=eq.${this.userId}`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        
        if (advancedRepliesResponse.ok) {
          this.advancedReplies = await advancedRepliesResponse.json() || [];
        }
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
      // Chat Button
      this.chatButton = document.createElement('button');
      this.chatButton.className = 'cw-chat-button cw-fixed cw-bottom-4 cw-right-4 cw-flex cw-items-center cw-justify-center cw-w-14 cw-h-14 cw-rounded-full cw-shadow-lg cw-z-50';
      this.chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      this.chatButton.innerHTML = `<span class="cw-w-6 cw-h-6 cw-text-white">${ICONS.chat}</span>`;
      this.chatButton.setAttribute('aria-label', 'Open chat');
      this.chatButton.onclick = () => this.toggleChat();
      
      document.body.appendChild(this.chatButton);

      // Chat Window
      this.chatWindow = document.createElement('div');
      this.chatWindow.className = 'cw-chat-window cw-fixed cw-bottom-4 cw-right-4 cw-bg-white cw-rounded-lg cw-shadow-lg cw-flex cw-flex-col cw-overflow-hidden cw-z-50';

      // Header - Updated to match the new design
      const header = document.createElement('div');
      header.className = 'cw-header cw-flex cw-justify-between cw-items-center';
      header.style.backgroundColor = this.settings.primary_color || '#4f46e5';

      // Left side with avatar and text
      const headerLeft = document.createElement('div');
      headerLeft.className = 'cw-flex cw-items-center';

      // Avatar container
      const agentAvatar = document.createElement('div');
      agentAvatar.className = 'cw-w-10 cw-h-10 cw-rounded-full cw-bg-white cw-flex cw-items-center cw-justify-center cw-mr-3';
      agentAvatar.innerHTML = `<span style="color: ${this.settings.primary_color || '#4f46e5'}">${ICONS.user}</span>`;

      // Text container
      const titleDiv = document.createElement('div');
      titleDiv.className = 'cw-header-title';
      titleDiv.innerHTML = `
        <h3 class="cw-text-white">${this.settings.business_name || 'Chat'}</h3>
        <p class="cw-text-white">${this.settings.sales_representative || 'Support'}</p>
      `;

      headerLeft.append(agentAvatar, titleDiv);

      // Close icon
      const closeIcon = document.createElement('div');
      closeIcon.className = 'cw-close-icon cw-text-white';
      closeIcon.innerHTML = `<span class="cw-w-5 cw-h-5">${ICONS.close}</span>`;
      closeIcon.setAttribute('aria-label', 'Close chat');
      closeIcon.onclick = () => this.toggleChat();

      header.append(headerLeft, closeIcon);

      // Messages Container
      this.messagesContainer = document.createElement('div');
      this.messagesContainer.className = 'cw-messages-container cw-flex-1 cw-p-4 cw-overflow-y-auto';

      // Input Form
      const inputArea = document.createElement('div');
      inputArea.className = 'cw-input-area';
      inputArea.innerHTML = `
        <div class="cw-input-container">
          <input type="text" placeholder="Type your message..." class="cw-input" aria-label="Message">
          <button type="button" class="cw-send-button" aria-label="Send message" style="background-color: ${this.settings.primary_color || '#4f46e5'}">
            <span class="cw-w-5 cw-h-5 cw-text-white">${ICONS.send}</span>
          </button>
        </div>
      `;

      this.input = inputArea.querySelector('input');
      this.input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSendMessage();
        }
      };
      
      const sendButton = inputArea.querySelector('.cw-send-button');
      sendButton.onclick = () => this.handleSendMessage();

      // Append all elements to chat window
      this.chatWindow.append(header, this.messagesContainer, inputArea);
      document.body.appendChild(this.chatWindow);
    }

    async checkExistingSession() {
      if (!this.visitorId) return false;
      
      try {
        // Check for existing active session for this visitor
        const response = await fetch(
          `${this.supabaseUrl}/rest/v1/chat_sessions?user_id=eq.${this.userId}&visitor_id=eq.${this.visitorId}&status=eq.active&order=created_at.desc&limit=1`, 
          {
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`
            }
          }
        );
        
        if (response.ok) {
          const sessions = await response.json();
          
          if (sessions && sessions.length > 0) {
            this.sessionId = sessions[0].id;
            await this.fetchMessages();
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking for existing session:', error);
      }
      
      return false;
    }

    async fetchMessages() {
      if (!this.sessionId) return;
      
      try {
        const response = await fetch(
          `${this.supabaseUrl}/rest/v1/chat_messages?chat_session_id=eq.${this.sessionId}&order=created_at.asc`, 
          {
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`
            }
          }
        );
        
        if (response.ok) {
          const messages = await response.json();
          
          this.messages = messages.map(msg => ({
            id: msg.id,
            sender: msg.sender_type,
            text: msg.message,
            timestamp: new Date(msg.created_at)
          }));
          
          this.updateChatContent();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    async createChatSession() {
      if (this.sessionId) {
        await this.fetchMessages();
        return;
      }
      
      try {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/chat_sessions`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
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
        
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0].id) {
            this.sessionId = data[0].id;
            
            // Send welcome message if configured
            if (this.settings.welcome_message) {
              await this.sendBotReply(this.settings.welcome_message);
            }
          }
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
      }
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.chatWindow.classList.add('cw-open');
        this.chatButton.style.display = 'none';
        this.createChatSession();
        document.addEventListener('keydown', this.handleEscapeKey);
      } else {
        this.chatWindow.classList.remove('cw-open');
        this.chatButton.style.display = 'flex';
        document.removeEventListener('keydown', this.handleEscapeKey);
      }
    }

    handleEscapeKey = (e) => {
      if (e.key === 'Escape') this.toggleChat();
    };

    updateChatContent() {
      // Clear messages container
      this.messagesContainer.innerHTML = '';

      if (this.messages.length === 0) {
        this.messagesContainer.innerHTML = `
          <div class="cw-flex cw-flex-col cw-items-center cw-justify-center cw-h-full cw-text-gray-500">
            <div class="cw-w-16 cw-h-16 cw-rounded-full cw-bg-gray-100 cw-flex cw-items-center cw-justify-center cw-mb-2">
              <span class="cw-w-8 cw-h-8">${ICONS.chat}</span>
            </div>
            <p class="cw-font-medium">Start a conversation</p>
            <p class="cw-text-sm">Send a message to begin</p>
          </div>
        `;
        return;
      }

      // Group messages by sender
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

      const wrapper = document.createElement('div');
      wrapper.className = 'cw-space-y-4';

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

      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    handleSendMessage() {
      const messageText = this.input.value.trim();
      if (!messageText) return;
      
      this.sendMessage(messageText);
      this.input.value = '';
    }

    async sendMessage(text) {
      if (!this.sessionId) {
        try {
          await this.createChatSession();
          
          if (!this.sessionId) {
            console.error('Unable to create chat session');
            return;
          }
        } catch (error) {
          console.error('Error creating session before sending message:', error);
          return;
        }
      }

      // Add user message to UI
      const userMessage = { id: generateId(), sender: 'user', text, timestamp: new Date() };
      this.messages.push(userMessage);
      this.updateChatContent();

      try {
        // Update session timestamp
        await fetch(`${this.supabaseUrl}/rest/v1/chat_sessions?id=eq.${this.sessionId}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ updated_at: new Date().toISOString() })
        });
        
        // Save user message
        await fetch(`${this.supabaseUrl}/rest/v1/chat_messages`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_session_id: this.sessionId,
            sender_type: 'user',
            message: text,
            created_at: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }

      // Process the message to find a reply
      const replyText = this.findReply(text.toLowerCase());
      
      // Show typing indicator
      this.isTyping = true;
      this.updateChatContent();
      
      if (replyText) {
        // Add a small delay to make it feel more natural
        setTimeout(() => {
          this.isTyping = false;
          this.sendBotReply(replyText);
        }, 1000);
      } else if (this.settings.fallback_message) {
        setTimeout(() => {
          this.isTyping = false;
          this.sendBotReply(this.settings.fallback_message);
        }, 1000);
      } else {
        // Hide typing indicator after a delay if no response
        setTimeout(() => {
          this.isTyping = false;
          this.updateChatContent();
        }, 1000);
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
      if (!this.sessionId) {
        console.error('Cannot send bot reply: No active session');
        return;
      }
      
      const botMessage = { id: generateId(), sender: 'bot', text, timestamp: new Date() };
      this.messages.push(botMessage);
      this.updateChatContent();

      try {
        await fetch(`${this.supabaseUrl}/rest/v1/chat_messages`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
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