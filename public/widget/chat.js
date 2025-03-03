// Manual implementation of the chat widget
(function() {
  // Create a style element for the widget
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Base styles needed for the widget */
      .cw-fixed { position: fixed; }
      .cw-bottom-4 { bottom: 1rem; }
      .cw-right-4 { right: 1rem; }
      .cw-z-50 { z-index: 50; }
      .cw-flex { display: flex; }
      .cw-flex-col { flex-direction: column; }
      .cw-items-end { align-items: flex-end; }
      .cw-items-center { align-items: center; }
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
      .cw-rounded-md { border-radius: 0.375rem; }
      .cw-rounded-l-md { border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; }
      .cw-rounded-r-md { border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }
      .cw-bg-white { background-color: white; }
      .cw-bg-blue-100 { background-color: #dbeafe; }
      .cw-bg-gray-100 { background-color: #f3f4f6; }
      .cw-bg-green-100 { background-color: #dcfce7; }
      .cw-text-white { color: white; }
      .cw-text-blue-800 { color: #1e40af; }
      .cw-text-gray-800 { color: #1f2937; }
      .cw-text-green-800 { color: #166534; }
      .cw-text-gray-500 { color: #6b7280; }
      .cw-text-blue-600 { color: #2563eb; }
      .cw-text-xs { font-size: 0.75rem; }
      .cw-text-sm { font-size: 0.875rem; }
      .cw-font-medium { font-weight: 500; }
      .cw-p-4 { padding: 1rem; }
      .cw-px-4 { padding-left: 1rem; padding-right: 1rem; }
      .cw-py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .cw-px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .cw-mt-1 { margin-top: 0.25rem; }
      .cw-mt-4 { margin-top: 1rem; }
      .cw-mb-1 { margin-bottom: 0.25rem; }
      .cw-ml-3 { margin-left: 0.75rem; }
      .cw-space-y-4 > * + * { margin-top: 1rem; }
      .cw-shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
      .cw-shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
      .cw-border { border-width: 1px; }
      .cw-border-t { border-top-width: 1px; }
      .cw-border-gray-200 { border-color: #e5e7eb; }
      .cw-border-gray-300 { border-color: #d1d5db; }
      .cw-border-transparent { border-color: transparent; }
      .cw-overflow-hidden { overflow: hidden; }
      .cw-overflow-y-auto { overflow-y: auto; }
      .cw-opacity-70 { opacity: 0.7; }
      
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
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
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

  class ChatWidget {
    constructor(options) {
      this.userId = options.uid;
      this.isOpen = false;
      this.messages = [];
      this.settings = null;
      this.autoReplies = [];
      this.advancedReplies = [];
      this.sessionId = null;
      this.visitorId = localStorage.getItem('chat_visitor_id') || generateId();
      
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
      chatButton.className = 'cw-flex cw-items-center cw-justify-center cw-w-14 cw-h-14 cw-rounded-full cw-shadow-lg';
      chatButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
      chatButton.innerHTML = this.isOpen ? 
        `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.x}</span>` : 
        `<span class="cw-w-6 cw-h-6 cw-text-white">${icons.messageCircle}</span>`;
      chatButton.addEventListener('click', () => this.toggleChat());
      this.container.appendChild(chatButton);
      
      // Chat window
      if (this.isOpen) {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'cw-bg-white cw-rounded-lg cw-shadow-xl cw-w-80 cw-sm-w-96 cw-mt-4 cw-flex cw-flex-col cw-overflow-hidden cw-max-h-80vh';
        
        // Header
        const header = document.createElement('div');
        header.className = 'cw-p-4 cw-flex cw-justify-between cw-items-center';
        header.style.backgroundColor = this.settings.primary_color || '#4f46e5';
        
        const title = document.createElement('h3');
        title.className = 'cw-text-white cw-font-medium';
        title.textContent = this.settings.business_name || 'Chat';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'cw-text-white';
        closeButton.innerHTML = `<span class="cw-w-5 cw-h-5">${icons.chevronDown}</span>`;
        closeButton.addEventListener('click', () => this.toggleChat());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        chatWindow.appendChild(header);
        
        // Messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'cw-flex-1 cw-p-4 cw-overflow-y-auto cw-max-h-50vh';
        
        if (this.messages.length === 0) {
          const emptyState = document.createElement('div');
          emptyState.className = 'cw-text-center cw-text-gray-500 cw-py-2';
          emptyState.textContent = 'Send a message to start chatting';
          messagesContainer.appendChild(emptyState);
          
          // Create session and add welcome message
          this.createChatSession();
        } else {
          const messagesWrapper = document.createElement('div');
          messagesWrapper.className = 'cw-space-y-4';
          
          this.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `cw-flex ${msg.sender === 'user' ? 'cw-justify-end' : 'cw-justify-start'}`;
            
            const bubble = document.createElement('div');
            bubble.className = `cw-max-w-80 cw-rounded-lg cw-px-4 cw-py-2 ${
              msg.sender === 'user'
                ? 'cw-bg-blue-100 cw-text-blue-800'
                : msg.sender === 'agent'
                ? 'cw-bg-green-100 cw-text-green-800'
                : 'cw-bg-gray-100 cw-text-gray-800'
            }`;
            
            if (msg.sender === 'bot' || msg.sender === 'agent') {
              const sender = document.createElement('div');
              sender.className = 'cw-text-xs cw-font-medium cw-mb-1';
              sender.textContent = this.settings.sales_representative || 'Support';
              bubble.appendChild(sender);
            }
            
            const messageText = document.createElement('div');
            if (msg.sender === 'bot') {
              messageText.innerHTML = msg.text;
            } else {
              messageText.textContent = msg.text;
            }
            
            const timestamp = document.createElement('div');
            timestamp.className = 'cw-text-xs cw-mt-1 cw-opacity-70';
            timestamp.textContent = formatTime(msg.timestamp);
            
            bubble.appendChild(messageText);
            bubble.appendChild(timestamp);
            messageEl.appendChild(bubble);
            messagesWrapper.appendChild(messageEl);
          });
          
          messagesContainer.appendChild(messagesWrapper);
        }
        
        chatWindow.appendChild(messagesContainer);
        
        // Input form
        const form = document.createElement('form');
        form.className = 'cw-p-4 cw-border-t cw-border-gray-200';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'cw-flex';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your message...';
        input.className = 'cw-flex-1 cw-px-3 cw-py-2 cw-border cw-border-gray-300 cw-rounded-l-md';
        
        const sendButton = document.createElement('button');
        sendButton.type = 'submit';
        sendButton.className = 'cw-px-4 cw-py-2 cw-border cw-border-transparent cw-rounded-r-md';
        sendButton.style.backgroundColor = this.settings.primary_color || '#4f46e5';
        sendButton.innerHTML = `<span class="cw-w-5 cw-h-5 cw-text-white">${icons.send}</span>`;
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(sendButton);
        form.appendChild(inputContainer);
        
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (input.value.trim()) {
            this.sendMessage(input.value);
            input.value = '';
          }
        });
        
        chatWindow.appendChild(form);
        this.container.appendChild(chatWindow);
        
        // Scroll to bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
    
    toggleChat() {
      this.isOpen = !this.isOpen;
      this.render();
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
      
      // If no reply matched, send fallback message
      if (!replied && this.settings?.fallback_message) {
        await this.sendBotReply(this.settings.fallback_message);
      }
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