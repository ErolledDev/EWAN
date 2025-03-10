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
      this.messageSubscription = null;
      this.messagePollingInterval = null;
      this.lastMessageTimestamp = 0;
      this.pendingMessageIds = new Set();
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectTimeout = null;
      this.unreadCount = 0;
      
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
        
        // Check for existing session
        await this.checkExistingSession();
        
        // Set up real-time connection
        this.setupRealtimeConnection();
        
        // Mark as initialized
        this.initialized = true;
      } catch (error) {
        console.error('Error initializing chat widget:', error);
      }
    }

    setupRealtimeConnection() {
      if (this.sessionId) {
        this.supabaseClient = this.supabase
          .channel(`chat:${this.sessionId}`)
          .on('presence', { event: 'sync' }, () => {
            this.isConnected = true;
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('New presence:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('Left presence:', leftPresences);
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_session_id=eq.${this.sessionId}`
            },
            this.handleNewMessage.bind(this)
          )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              this.isConnected = true;
              this.reconnectAttempts = 0;
              console.log('Connected to real-time updates');
            } else {
              this.isConnected = false;
              this.handleConnectionError();
            }
          });
      }
    }

    handleConnectionError() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.setupRealtimeConnection();
        }, 2000 * Math.pow(2, this.reconnectAttempts));
      }
    }

    handleNewMessage(payload) {
      const newMessage = payload.new;
      if (!newMessage) return;

      const message = {
        id: newMessage.id,
        sender: newMessage.sender_type,
        text: newMessage.message,
        timestamp: new Date(newMessage.created_at),
        isNew: !this.isOpen,
        isRead: this.isOpen
      };

      this.messages.push(message);
      this.updateChatContent();

      if (!this.isOpen) {
        this.unreadCount++;
        this.updateUnreadBadge();
      }
    }

    updateUnreadBadge() {
      const existingBadge = this.chatButton.querySelector('.unread-badge');
      if (this.unreadCount > 0) {
        if (existingBadge) {
          existingBadge.textContent = this.unreadCount;
        } else {
          const badge = document.createElement('span');
          badge.className = 'unread-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1';
          badge.textContent = this.unreadCount;
          this.chatButton.appendChild(badge);
        }
      } else if (existingBadge) {
        existingBadge.remove();
      }
    }

    async checkExistingSession() {
      if (!this.visitorId) return false;
      
      try {
        const { data: sessions, error } = await this.supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', this.userId)
          .eq('visitor_id', this.visitorId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (sessions && sessions.length > 0) {
          this.sessionId = sessions[0].id;
          await this.fetchMessages();
          this.setupRealtimeConnection();
          return true;
        }
      } catch (error) {
        console.error('Error checking for existing session:', error);
      }
      
      return false;
    }

    async createSession() {
      try {
        const { data, error } = await this.supabase
          .from('chat_sessions')
          .insert({
            user_id: this.userId,
            visitor_id: this.visitorId,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {}
          })
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          this.sessionId = data.id;
          this.setupRealtimeConnection();
          
          if (this.settings.welcome_message) {
            await this.sendBotReply(this.settings.welcome_message);
          }
          
          return data.id;
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
      }
    }

    cleanup() {
      if (this.supabaseClient) {
        this.supabaseClient.unsubscribe();
      }
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
    }
  }

  window.BusinessChatPlugin = function(options) {
    return new ChatWidget(options);
  };
})();