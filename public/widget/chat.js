// Modern Professional Chat Widget Implementation
(function() {
  // Create a style element for the widget
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Modern widget styles */
      .cw-fixed { position: fixed; }
      .cw-bottom-4 { bottom: 1rem; }
      .cw-right-4 { right: 1rem; }
      .cw-z-50 { z-index: 2147483647; } /* Maximum z-index to ensure visibility */
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
      .cw-w-4 { width: 1rem; }
      .cw-h-4 { height: 1rem; }
      .cw-w-80 { width: 20rem; }
      .cw-max-w-80 { max-width: 80%; }
      .cw-max-h-80vh { max-height: 80vh; }
      .cw-max-h-50vh { max-height: 50vh; }
      .cw-flex-1 { flex: 1 1 0%; }
      .cw-rounded-full { border-radius: 9999px; }
      .cw-rounded-lg { border-radius: 0.5rem; }
      .cw-rounded-md { border-radius: 0.375rem; }
      .cw-rounded-l-md { border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; }
      .cw-rounded-r-md { border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }
      .cw-rounded-tl-lg { border-top-left-radius: 0.5rem; }
      .cw-rounded-tr-lg { border-top-right-radius: 0.5rem; }
      .cw-rounded-bl-lg { border-bottom-left-radius: 0.5rem; }
      .cw-rounded-br-lg { border-bottom-right-radius: 0.5rem; }
      .cw-bg-white { background-color: white; }
      .cw-bg-blue-100 { background-color: #dbeafe; }
      .cw-bg-gray-100 { background-color: #f3f4f6; }
      .cw-bg-green-100 { background-color: #dcfce7; }
      .cw-text-white { color: white; }
      .cw-text-blue-800 { color: #1e40af; }
      .cw-text-gray-800 { color: #1f2937; }
      .cw-text-gray-700 { color: #374151; }
      .cw-text-gray-600 { color: #4b5563; }
      .cw-text-gray-500 { color: #6b7280; }
      .cw-text-gray-400 { color: #9ca3af; }
      .cw-text-green-800 { color: #166534; }
      .cw-text-blue-600 { color: #2563eb; }
      .cw-text-xs { font-size: 0.75rem; }
      .cw-text-sm { font-size: 0.875rem; }
      .cw-text-base { font-size: 1rem; }
      .cw-text-lg { font-size: 1.125rem; }
      .cw-font-medium { font-weight: 500; }
      .cw-font-semibold { font-weight: 600; }
      .cw-font-bold { font-weight: 700; }
      .cw-p-4 { padding: 1rem; }
      .cw-p-3 { padding: 0.75rem; }
      .cw-p-2 { padding: 0.5rem; }
      .cw-px-4 { padding-left: 1rem; padding-right: 1rem; }
      .cw-py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .cw-px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .cw-py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .cw-py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .cw-px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .cw-mt-1 { margin-top: 0.25rem; }
      .cw-mt-2 { margin-top: 0.5rem; }
      .cw-mt-4 { margin-top: 1rem; }
      .cw-mb-1 { margin-bottom: 0.25rem; }
      .cw-mb-2 { margin-bottom: 0.5rem; }
      .cw-ml-3 { margin-left: 0.75rem; }
      .cw-ml-2 { margin-left: 0.5rem; }
      .cw-mr-2 { margin-right: 0.5rem; }
      .cw-space-y-4 > * + * { margin-top: 1rem; }
      .cw-space-y-2 > * + * { margin-top: 0.5rem; }
      .cw-shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
      .cw-shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
      .cw-shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
      .cw-border { border-width: 1px; }
      .cw-border-t { border-top-width: 1px; }
      .cw-border-gray-200 { border-color: #e5e7eb; }
      .cw-border-gray-300 { border-color: #d1d5db; }
      .cw-border-transparent { border-color: transparent; }
      .cw-overflow-hidden { overflow: hidden; }
      .cw-overflow-y-auto { overflow-y: auto; }
      .cw-opacity-70 { opacity: 0.7; }
      .cw-opacity-50 { opacity: 0.5; }
      .cw-cursor-pointer { cursor: pointer; }
      .cw-transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
      .cw-transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
      .cw-transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
      .cw-hover-bg-gray-100:hover { background-color: #f3f4f6; }
      .cw-focus-outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
      .cw-focus-ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
      .cw-focus-ring-blue-500:focus { --tw-ring-color: #3b82f6; }
      .cw-resize-none { resize: none; }
      .cw-appearance-none { appearance: none; }
      .cw-leading-tight { line-height: 1.25; }
      .cw-leading-normal { line-height: 1.5; }
      .cw-whitespace-pre-wrap { white-space: pre-wrap; }
      .cw-break-words { overflow-wrap: break-word; }
      
      /* Animation classes */
      .cw-animate-pulse {
        animation: cw-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes cw-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      .cw-animate-bounce {
        animation: cw-bounce 1s infinite;
      }
      
      @keyframes cw-bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-25%);
        }
      }
      
      .cw-animate-fade-in {
        animation: cw-fade-in 0.3s ease-in-out;
      }
      
      @keyframes cw-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .cw-animate-slide-in {
        animation: cw-slide-in 0.3s ease-in-out;
      }
      
      @keyframes cw-slide-in {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      /* Typing indicator */
      .cw-typing-indicator {
        display: flex;
        align-items: center;
      }
      
      .cw-typing-indicator span {
        height: 8px;
        width: 8px;
        margin: 0 1px;
        background-color: #9ca3af;
        border-radius: 50%;
        display: inline-block;
        opacity: 0.7;
      }
      
      .cw-typing-indicator span:nth-child(1) {
        animation: cw-typing 1s infinite 0.1s;
      }
      
      .cw-typing-indicator span:nth-child(2) {
        animation: cw-typing 1s infinite 0.2s;
      }
      
      .cw-typing-indicator span:nth-child(3) {
        animation: cw-typing 1s infinite 0.3s;
      }
      
      @keyframes cw-typing {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      /* Modern chat bubble styles */
      .cw-chat-bubble {
        position: relative;
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        word-break: break-word;
      }
      
      .cw-chat-bubble-user {
        background-color: #2563eb;
        color: white;
        border-bottom-right-radius: 0.25rem;
        margin-left: auto;
      }
      
      .cw-chat-bubble-bot {
        background-color: #f3f4f6;
        color: #1f2937;
        border-bottom-left-radius: 0.25rem;
        margin-right: auto;
      }
      
      .cw-chat-bubble-agent {
        background-color: #10b981;
        color: white;
        border-bottom-left-radius: 0.25rem;
        margin-right: auto;
      }
      
      /* Responsive styles */
      @media (max-width: 640px) {
        .cw-w-80 { width: calc(100vw - 2rem); }
        .cw-max-w-80 { max-width: 90%; }
      }
      
      @media (min-width: 640px) {
        .cw-sm-w-96 { width: 24rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // SVG Icons
  const icons = {
    messageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    minimize: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`,
    paperclip: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
    smile: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    bot: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`
  };

  // Format date
  function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  // Generate a random ID
  function generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Debounce function to limit API calls
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // AI prompt engineering for better responses
  const AI_SYSTEM_PROMPT = `
    You are a helpful, friendly, and professional customer support assistant. 
    Your responses should be:
    
    1. Based ONLY on the information provided in the context
    2. Short, clear, and to the point (1-3 sentences maximum)
    3. Friendly and professional in tone
    4. Focused on answering the user's question directly
    
    DO NOT:
    - Use special characters or excessive formatting
    - Make up information not provided in the context
    - Create code, scripts, or technical solutions
    - Discuss topics outside the provided business context
    - Pretend to be a human (you can acknowledge being an AI assistant)
    
    If asked about something not covered in your context information, politely explain that you don't have that information and offer to connect them with a human agent.
  `;

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
      this.typingTimeout = null;
      this.isTyping = false;
      
      // Save visitor ID
      localStorage.setItem('chat_visitor_id', this.visitorId);
      
      // Initialize Supabase client
      this.supabase = {
        url: 'https://zawhdprorlwaagmmyyer.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8'
      };
      
      // Initialize widget
      this.init();
    }
    
    async init() {
      // Inject styles
      injectStyles();
      
      // Create widget container
      this.container = document.createElement('div');
      this.container.className = 'cw-fixed cw-bottom-4 cw-right-4 cw-z-50 cw-flex cw-flex-col cw-items-end';
      document.body.appendChild(this.container);
      
      // Fetch widget data
      await this.fetchWidgetData();
      
      // Render widget
      this.render();
    }
    
    async fetchWidgetData() {
      try {
        // Fetch widget settings
        const settingsResponse = await fetch(`${this.supabase.url}/rest/v1/widget_settings?user_id=eq.${this.userId}&order=created_at.desc&limit=1`, {
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`
          }
        });
        
        const settingsData = await settingsResponse.json();
        if (settingsData && settingsData.length > 0) {
          this.settings = settingsData[0];
        }
        
        // Fetch auto replies
        const autoRepliesResponse = await fetch(`${this.supabase.url}/rest/v1/auto_replies?user_id=eq.${this.userId}`, {
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`
          }
        });
        
        const autoRepliesData = await autoRepliesResponse.json();
        this.autoReplies = autoRepliesData || [];
        
        // Fetch advanced replies
        const advancedRepliesResponse = await fetch(`${this.supabase.url}/rest/v1/advanced_replies?user_id=eq.${this.userId}`, {
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`
          }
        });
        
        const advancedRepliesData = await advancedRepliesResponse.json();
        this.advancedReplies = advancedRepliesData || [];
        
      } catch (error) {
        console.error('Error fetching widget data:', error);
      }
    }
    
    render() {
      if (!this.settings) {
        return;
      }
      
      // Clear container
      this.container.innerHTML = '';
      
      // Chat button
      const chatButton = document.createElement('button');
      chatButton.className = 'cw-flex cw-items-center cw-justify-center cw-w-14 cw-h-14 cw-rounded-full cw-shadow-lg cw-transition-all cw-focus-outline-none cw-focus-ring-2 cw-focus-ring-blue-500 cw-animate-fade-in';
      chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      chatButton.innerHTML = this.isOpen ? 
        `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.x}</span>` : 
        `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.messageCircle}</span>`;
      chatButton.addEventListener('click', () => this.toggleChat());
      chatButton.setAttribute('aria-label', this.isOpen ? 'Close chat' : 'Open chat');
      
      // Only show button if chat is not open or is minimized
      if (!this.isOpen || this.isMinimized) {
        this.container.appendChild(chatButton);
      }
      
      // Chat window
      if (this.isOpen && !this.isMinimized) {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'cw-bg-white cw-rounded-lg cw-shadow-xl cw-w-80 cw-sm-w-96 cw-mt-4 cw-flex cw-flex-col cw-overflow-hidden cw-max-h-80vh cw-animate-fade-in';
        chatWindow.style.borderRadius = '1rem';
        
        // Header
        const header = document.createElement('div');
        header.className = 'cw-p-4 cw-flex cw-justify-between cw-items-center';
        header.style.backgroundColor = this.settings.primary_color || '#4f46e5';
        header.style.borderTopLeftRadius = '1rem';
        header.style.borderTopRightRadius = '1rem';
        
        const headerLeft = document.createElement('div');
        headerLeft.className = 'cw-flex cw-items-center';
        
        const agentAvatar = document.createElement('div');
        agentAvatar.className = 'cw-w-10 cw-h-10 cw-rounded-full cw-bg-white cw-flex cw-items-center cw-justify-center cw-mr-2';
        agentAvatar.innerHTML = `<span class="cw-text-lg" style="color: ${this.settings.primary_color || '#4f46e5'}">${icons.user}</span>`;
        
        const titleContainer = document.createElement('div');
        
        const title = document.createElement('h3');
        title.className = 'cw-text-white cw-font-semibold';
        title.textContent = this.settings.business_name || 'Chat';
        
        const subtitle = document.createElement('p');
        subtitle.className = 'cw-text-xs cw-text-white cw-opacity-70';
        subtitle.textContent = 'Online | ' + this.settings.sales_representative || 'Support';
        
        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);
        
        headerLeft.appendChild(agentAvatar);
        headerLeft.appendChild(titleContainer);
        
        const headerActions = document.createElement('div');
        headerActions.className = 'cw-flex cw-items-center';
        
        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'cw-text-white cw-focus-outline-none cw-focus-ring-2 cw-focus-ring-blue-500 cw-mr-2';
        minimizeButton.innerHTML = `<span class="cw-w-5 cw-h-5">${icons.minimize}</span>`;
        minimizeButton.addEventListener('click', () => this.minimizeChat());
        minimizeButton.setAttribute('aria-label', 'Minimize chat');
        
        const closeButton = document.createElement('button');
        closeButton.className = 'cw-text-white cw-focus-outline-none cw-focus-ring-2 cw-focus-ring-blue-500';
        closeButton.innerHTML = `<span class="cw-w-5 cw-h-5">${icons.x}</span>`;
        closeButton.addEventListener('click', () => this.toggleChat());
        closeButton.setAttribute('aria-label', 'Close chat');
        
        headerActions.appendChild(minimizeButton);
        headerActions.appendChild(closeButton);
        
        header.appendChild(headerLeft);
        header.appendChild(headerActions);
        chatWindow.appendChild(header);
        
        // Messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'cw-flex-1 cw-p-4 cw-overflow-y-auto cw-max-h-50vh';
        
        if (this.messages.length === 0) {
          const emptyState = document.createElement('div');
          emptyState.className = 'cw-flex cw-flex-col cw-items-center cw-justify-center cw-h-full cw-text-center cw-text-gray-500 cw-py-8';
          
          const emptyIcon = document.createElement('div');
          emptyIcon.className = 'cw-w-16 cw-h-16 cw-rounded-full cw-bg-gray-100 cw-flex cw-items-center cw-justify-center cw-mb-4';
          emptyIcon.innerHTML = `<span class="cw-w-8 cw-h-8 cw-text-gray-400">${icons.messageCircle}</span>`;
          
          const emptyTitle = document.createElement('h4');
          emptyTitle.className = 'cw-text-gray-700 cw-font-medium cw-mb-1';
          emptyTitle.textContent = 'Start a conversation';
          
          const emptyText = document.createElement('p');
          emptyText.className = 'cw-text-sm cw-text-gray-500';
          emptyText.textContent = 'Send a message to get started';
          
          emptyState.appendChild(emptyIcon);
          emptyState.appendChild(emptyTitle);
          emptyState.appendChild(emptyText);
          messagesContainer.appendChild(emptyState);
          
          // Create session and add welcome message
          this.createChatSession();
        } else {
          const messagesWrapper = document.createElement('div');
          messagesWrapper.className = 'cw-space-y-4';
          
          this.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `cw-flex ${msg.sender === 'user' ? 'cw-justify-end' : 'cw-justify-start'} cw-animate-slide-in`;
            
            const bubble = document.createElement('div');
            bubble.className = `cw-chat-bubble ${
              msg.sender === 'user'
                ? 'cw-chat-bubble-user'
                : msg.sender === 'agent'
                ? 'cw-chat-bubble-agent'
                : 'cw-chat-bubble-bot'
            }`;
            
            if (msg.sender === 'bot' || msg.sender === 'agent') {
              const senderContainer = document.createElement('div');
              senderContainer.className = 'cw-flex cw-items-center cw-mb-1';
              
              const senderAvatar = document.createElement('div');
              senderAvatar.className = 'cw-w-5 cw-h-5 cw-rounded-full cw-bg-gray-200 cw-flex cw-items-center cw-justify-center cw-mr-1';
              senderAvatar.innerHTML = `<span class="cw-w-3 cw-h-3 cw-text-gray-500">${msg.sender === 'bot' ? icons.bot : icons.user}</span>`;
              
              const sender = document.createElement('div');
              sender.className = 'cw-text-xs cw-font-medium';
              sender.textContent = this.settings.sales_representative || 'Support';
              
              senderContainer.appendChild(senderAvatar);
              senderContainer.appendChild(sender);
              bubble.appendChild(senderContainer);
            }
            
            const messageText = document.createElement('div');
            messageText.className = 'cw-whitespace-pre-wrap cw-break-words';
            
            if (msg.sender === 'bot') {
              messageText.innerHTML = msg.text;
            } else {
              messageText.textContent = msg.text;
            }
            
            const timestamp = document.createElement('div');
            timestamp.className = 'cw-text-xs cw-mt-1 cw-opacity-70 cw-text-right';
            timestamp.textContent = formatTime(msg.timestamp);
            
            bubble.appendChild(messageText);
            bubble.appendChild(timestamp);
            messageEl.appendChild(bubble);
            messagesWrapper.appendChild(messageEl);
          });
          
          messagesContainer.appendChild(messagesWrapper);
        }
        
        chatWindow.appendChild(messagesContainer);
        
        // Typing indicator
        if (this.isTyping) {
          const typingIndicator = document.createElement('div');
          typingIndicator.className = 'cw-px-4 cw-py-2 cw-flex cw-items-center';
          
          const typingAvatar = document.createElement('div');
          typingAvatar.className = 'cw-w-6 cw-h-6 cw-rounded-full cw-bg-gray-200 cw-flex cw-items-center cw-justify-center cw-mr-2';
          typingAvatar.innerHTML = `<span class="cw-w-4 cw-h-4 cw-text-gray-500">${icons.user}</span>`;
          
          const typingContent = document.createElement('div');
          typingContent.className = 'cw-bg-gray-100 cw-rounded-full cw-px-3 cw-py-2';
          
          const typingDots = document.createElement('div');
          typingDots.className = 'cw-typing-indicator';
          typingDots.innerHTML = '<span></span><span></span><span></span>';
          
          typingContent.appendChild(typingDots);
          typingIndicator.appendChild(typingAvatar);
          typingIndicator.appendChild(typingContent);
          chatWindow.appendChild(typingIndicator);
        }
        
        // Input form
        const form = document.createElement('form');
        form.className = 'cw-p-3 cw-border-t cw-border-gray-200';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'cw-flex cw-items-end';
        
        const textareaWrapper = document.createElement('div');
        textareaWrapper.className = 'cw-flex-1 cw-relative';
        
        const textarea = document.createElement('textarea');
        textarea.rows = 1;
        textarea.placeholder = 'Type your message...';
        textarea.className = 'cw-w-full cw-px-3 cw-py-2 cw-border cw-border-gray-300 cw-rounded-lg cw-focus-outline-none cw-focus-ring-2 cw-focus-ring-blue-500 cw-resize-none cw-appearance-none cw-leading-normal';
        textarea.setAttribute('aria-label', 'Message');
        
        // Auto-resize textarea as user types
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = (textarea.scrollHeight > 120 ? 120 : textarea.scrollHeight) + 'px';
        });
        
        // Handle Enter key to submit form
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
          }
        });
        
        textareaWrapper.appendChild(textarea);
        
        const sendButton = document.createElement('button');
        sendButton.type = 'submit';
        sendButton.className = 'cw-ml-2 cw-p-2 cw-rounded-full cw-focus-outline-none cw-focus-ring-2 cw-focus-ring-blue-500 cw-flex cw-items-center cw-justify-center';
        sendButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
        sendButton.innerHTML = `<span class="cw-w-5 cw-h-5 cw-text-white">${icons.send}</span>`;
        sendButton.setAttribute('aria-label', 'Send message');
        
        inputContainer.appendChild(textareaWrapper);
        inputContainer.appendChild(sendButton);
        form.appendChild(inputContainer);
        
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (textarea.value.trim()) {
            this.sendMessage(textarea.value);
            textarea.value = '';
            textarea.style.height = 'auto';
          }
        });
        
        chatWindow.appendChild(form);
        this.container.appendChild(chatWindow);
        
        // Set focus to textarea
        setTimeout(() => {
          textarea.focus();
        }, 100);
        
        // Scroll to bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
    
    toggleChat() {
      this.isOpen = !this.isOpen;
      this.isMinimized = false;
      this.render();
      
      if (this.isOpen) {
        // Start polling for new messages when chat is opened
        this.startMessagePolling();
      } else {
        // Stop polling when chat is closed
        this.stopMessagePolling();
      }
    }
    
    minimizeChat() {
      this.isMinimized = true;
      this.render();
    }
    
    startMessagePolling() {
      if (this.sessionId) {
        // Poll for new messages every 3 seconds
        this.messagePollingInterval = setInterval(() => {
          this.fetchMessages();
        }, 3000);
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
        const response = await fetch(`${this.supabase.url}/rest/v1/chat_messages?chat_session_id=eq.${this.sessionId}&order=created_at.asc`, {
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`
          }
        });
        
        const messagesData = await response.json();
        
        if (messagesData && messagesData.length > 0) {
          // Convert database messages to our format
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            sender: msg.sender_type,
            text: msg.message,
            timestamp: new Date(msg.created_at)
          }));
          
          // Only update if we have new messages
          if (formattedMessages.length !== this.messages.length) {
            this.messages = formattedMessages;
            this.render();
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    
    async createChatSession() {
      if (!this.sessionId && this.userId && this.visitorId) {
        try {
          // Create chat session
          const response = await fetch(`${this.supabase.url}/rest/v1/chat_sessions`, {
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
          
          const data = await response.json();
          if (data && data.length > 0) {
            this.sessionId = data[0].id;
            
            // Start polling for messages
            this.startMessagePolling();
            
            // Add welcome message if available
            if (this.settings?.welcome_message) {
              const welcomeMsg = {
                id: generateId(),
                sender: 'bot',
                text: this.settings.welcome_message,
                timestamp: new Date()
              };
              
              this.messages.push(welcomeMsg);
              this.render();
              
              // Save welcome message to database
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
                  message: this.settings.welcome_message,
                  created_at: new Date().toISOString()
                })
              });
            }
          }
        } catch (error) {
          console.error('Error creating chat session:', error);
        }
      }
    }
    
    async sendMessage(text) {
      if (!this.sessionId) {
        await this.createChatSession();
      }
      
      // Add user message to UI
      const userMessage = {
        id: generateId(),
        sender: 'user',
        text: text,
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      this.render();
      
      // Save user message to database
      try {
        // Update session's updated_at timestamp
        await fetch(`${this.supabase.url}/rest/v1/chat_sessions?id=eq.${this.sessionId}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabase.key,
            'Authorization': `Bearer ${this.supabase.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            updated_at: new Date().toISOString()
          })
        });
        
        // Save the message
        await fetch(`${this.supabase.url}/rest/v1/chat_messages`, {
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
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
      
      // Show typing indicator
      this.showTypingIndicator();
      
      // Process the message to find a reply
      const userMessageLower = text.toLowerCase();
      let replied = false;
      
      // Check auto replies
      for (const reply of this.autoReplies) {
        const keywords = reply.keywords;
        
        if (reply.matching_type === 'word_match') {
          // Simple word match
          if (keywords.some(keyword => userMessageLower.includes(keyword.toLowerCase()))) {
            await this.sendBotReply(reply.response);
            replied = true;
            break;
          }
        } else if (reply.matching_type === 'regex') {
          // Regex match
          try {
            for (const keyword of keywords) {
              const regex = new RegExp(keyword, 'i');
              if (regex.test(userMessageLower)) {
                await this.sendBotReply(reply.response);
                replied = true;
                break;
              }
            }
            if (replied) break;
          } catch (e) {
            console.error('Invalid regex:', e);
          }
        }
      }
      
      // If no auto reply matched, check advanced replies
      if (!replied) {
        for (const reply of this.advancedReplies) {
          const keywords = reply.keywords;
          
          if (reply.matching_type === 'word_match') {
            if (keywords.some(keyword => userMessageLower.includes(keyword.toLowerCase()))) {
              if (reply.response_type === 'text') {
                await this.sendBotReply(reply.response);
              } else if (reply.response_type === 'url') {
                const linkText = reply.button_text || 'Click here';
                await this.sendBotReply(`<a href="${reply.response}" target="_blank" class="cw-text-blue-600 hover:underline">${linkText}</a>`);
              }
              replied = true;
              break;
            }
          } else if (reply.matching_type === 'regex') {
            try {
              for (const keyword of keywords) {
                const regex = new RegExp(keyword, 'i');
                if (regex.test(userMessageLower)) {
                  if (reply.response_type === 'text') {
                    await this.sendBotReply(reply.response);
                  } else if (reply.response_type === 'url') {
                    const linkText = reply.button_text || 'Click here';
                    await this.sendBotReply(`<a href="${reply.response}" target="_blank" class="cw-text-blue-600 hover:underline">${linkText}</a>`);
                  }
                  replied = true;
                  break;
                }
              }
              if (replied) break;
            } catch (e) {
              console.error('Invalid regex:', e);
            }
          }
        }
      }
      
      // If no reply matched and AI mode is enabled, use AI to generate a response
      if (!replied && this.settings?.ai_mode_enabled && this.settings?.ai_api_key && this.settings?.ai_context) {
        try {
          // Simulate AI response with a longer typing delay
          const typingDelay = Math.random() * 2000 + 2000; // 2-4 seconds
          
          setTimeout(async () => {
            // Generate AI response based on context
            const aiResponse = await this.generateAIResponse(text, this.settings.ai_context);
            await this.sendBotReply(aiResponse);
          }, typingDelay);
          
          // Keep typing indicator visible longer for AI
          return;
        } catch (error) {
          console.error('Error generating AI response:', error);
          // Fall back to fallback message if AI fails
        }
      }
      
      // If no reply matched, send fallback message
      if (!replied && this.settings?.fallback_message) {
        await this.sendBotReply(this.settings.fallback_message);
      }
      
      // Hide typing indicator
      this.hideTypingIndicator();
    }
    
    async generateAIResponse(userMessage, contextInfo) {
      // This is a simplified AI response generator
      // In a real implementation, this would call an AI API like OpenAI
      
      // For now, we'll simulate an AI response based on the context
      const context = contextInfo || '';
      
      // Extract key information from the context
      const contextLines = context.split('\n').filter(line => line.trim());
      
      // Simple keyword matching for demonstration
      const userMessageLower = userMessage.toLowerCase();
      
      // Check for common questions
      if (userMessageLower.includes('price') || userMessageLower.includes('cost') || userMessageLower.includes('pricing')) {
        // Look for pricing information in context
        const pricingLines = contextLines.filter(line => 
          line.toLowerCase().includes('price') || 
          line.toLowerCase().includes('cost') || 
          line.toLowerCase().includes('$')
        );
        
        if (pricingLines.length > 0) {
          return `Based on our information: ${pricingLines[0].trim()}`;
        }
        
        return "I don't have specific pricing information. Would you like me to connect you with a sales representative?";
      }
      
      if (userMessageLower.includes('hours') || userMessageLower.includes('open') || userMessageLower.includes('available')) {
        // Look for hours information in context
        const hoursLines = contextLines.filter(line => 
          line.toLowerCase().includes('hour') || 
          line.toLowerCase().includes('open') || 
          line.toLowerCase().includes('available') ||
          line.toLowerCase().includes('am') ||
          line.toLowerCase().includes('pm')
        );
        
        if (hoursLines.length > 0) {
          return `${hoursLines[0].trim()}`;
        }
        
        return "I don't have information about our hours. Would you like me to connect you with someone who can help?";
      }
      
      if (userMessageLower.includes('location') || userMessageLower.includes('address') || userMessageLower.includes('where')) {
        // Look for location information in context
        const locationLines = contextLines.filter(line => 
          line.toLowerCase().includes('location') || 
          line.toLowerCase().includes('address') || 
          line.toLowerCase().includes('located')
        );
        
        if (locationLines.length > 0) {
          return `${locationLines[0].trim()}`;
        }
        
        return "I don't have our location information. Would you like me to connect you with someone who can help?";
      }
      
      // For code or technical requests
      if (userMessageLower.includes('code') || userMessageLower.includes('script') || userMessageLower.includes('program')) {
        return "I'm not designed to create code or technical solutions. I can only provide information about our business based on what I've been told.";
      }
      
      // Default response when no specific match is found
      return "I can only provide information based on what I know about our business. Would you like me to connect you with a human agent who can help with your specific question?";
    }
    
    showTypingIndicator() {
      this.isTyping = true;
      this.render();
      
      // Set a timeout to hide the typing indicator after a random time (1-3 seconds)
      this.typingTimeout = setTimeout(() => {
        this.hideTypingIndicator();
      }, Math.random() * 2000 + 1000);
    }
    
    hideTypingIndicator() {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
      this.isTyping = false;
      this.render();
    }
    
    async sendBotReply(text) {
      // Add bot message to UI
      const botMessage = {
        id: generateId(),
        sender: 'bot',
        text: text,
        timestamp: new Date()
      };
      
      this.messages.push(botMessage);
      this.render();
      
      // Save bot message to database
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

  // Expose to global scope
  window.BusinessChatPlugin = function(options) {
    return new ChatWidget(options);
  };
})();