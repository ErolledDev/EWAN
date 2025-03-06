import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';

// Define Lucide icon components manually to avoid dependency issues
const LucideIcon = ({ 
  icon, 
  className = "w-6 h-6", 
  ...props 
}: { 
  icon: string, 
  className?: string, 
  [key: string]: any 
}) => {
  const icons: Record<string, React.ReactNode> = {
    MessageCircle: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
      </svg>
    ),
    X: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    ),
    Send: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="m22 2-7 20-4-9-9-4Z"/>
        <path d="M22 2 11 13"/>
      </svg>
    )
  };

  return <>{icons[icon]}</>;
};

interface ChatWidgetProps {
  uid: string;
}

type Message = {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
  isNew?: boolean;
  isRead?: boolean;
};

// Group messages by sender for better display
type MessageGroup = {
  sender: 'user' | 'bot' | 'agent';
  messages: Message[];
};

// Helper function to group messages
const groupMessages = (messages: Message[]): MessageGroup[] => {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  // Sort messages by timestamp in ascending order
  const sortedMessages = [...messages].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  sortedMessages.forEach((message) => {
    if (!currentGroup || currentGroup.sender !== message.sender) {
      currentGroup = {
        sender: message.sender,
        messages: [message]
      };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  });

  return groups;
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ uid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [autoReplies, setAutoReplies] = useState<any[]>([]);
  const [advancedReplies, setAdvancedReplies] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create Supabase client
  const supabase = createClient(
    'https://zawhdprorlwaagmmyyer.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8'
  );

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update unread count and handle new messages
  useEffect(() => {
    if (!isOpen) {
      const newMessages = messages.filter(m => m.isNew || !m.isRead);
      setUnreadCount(newMessages.length);
    } else {
      // Mark all messages as read when chat is opened
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isNew: false,
          isRead: true
        }))
      );
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      try {
        // Fetch widget settings
        const { data: settingsData } = await supabase
          .from('widget_settings')
          .select('*')
          .eq('user_id', uid)
          .single();
        
        if (settingsData) {
          setSettings(settingsData);
        }

        // Generate or retrieve visitor ID
        const storedVisitorId = localStorage.getItem('chat_visitor_id');
        const newVisitorId = storedVisitorId || nanoid();
        if (!storedVisitorId) {
          localStorage.setItem('chat_visitor_id', newVisitorId);
        }
        setVisitorId(newVisitorId);

        // Fetch existing session if any
        const { data: sessionData } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('visitor_id', newVisitorId)
          .eq('status', 'active')
          .single();

        if (sessionData) {
          setSessionId(sessionData.id);
          // Fetch existing messages
          const { data: messagesData } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_session_id', sessionData.id)
            .order('created_at', { ascending: true });

          if (messagesData) {
            setMessages(messagesData.map(msg => ({
              id: msg.id,
              sender: msg.sender_type,
              text: msg.message,
              timestamp: new Date(msg.created_at),
              isNew: false,
              isRead: true
            })));
          }
        }

        // Fetch auto replies and advanced replies
        const { data: autoRepliesData } = await supabase
          .from('auto_replies')
          .select('*')
          .eq('user_id', uid);
        
        const { data: advancedRepliesData } = await supabase
          .from('advanced_replies')
          .select('*')
          .eq('user_id', uid);

        if (autoRepliesData) setAutoReplies(autoRepliesData);
        if (advancedRepliesData) setAdvancedReplies(advancedRepliesData);

        // Set up real-time subscription for new messages
        if (sessionData?.id) {
          const subscription = supabase
            .channel(`messages:${sessionData.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `chat_session_id=eq.${sessionData.id}`
              },
              (payload) => {
                const newMessage = {
                  id: payload.new.id,
                  sender: payload.new.sender_type,
                  text: payload.new.message,
                  timestamp: new Date(payload.new.created_at),
                  isNew: !isOpen, // Mark as new if chat is closed
                  isRead: isOpen // Mark as read if chat is open
                };
                setMessages(prev => [...prev, newMessage]);
              }
            )
            .subscribe();

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [uid, isOpen]);

  const createSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: uid,
          visitor_id: visitorId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        // Send welcome message if configured
        if (settings?.welcome_message) {
          await sendMessage(settings.welcome_message, 'bot');
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (text: string, sender: 'user' | 'bot' | 'agent') => {
    if (!sessionId && sender === 'user') {
      await createSession();
    }

    const newMessage: Message = {
      id: nanoid(),
      sender,
      text,
      timestamp: new Date(),
      isNew: !isOpen, // Mark as new if chat is closed
      isRead: isOpen // Mark as read if chat is open
    };

    // Add message to the array
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      if (sessionId) {
        await supabase
          .from('chat_messages')
          .insert({
            chat_session_id: sessionId,
            sender_type: sender,
            message: text,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Send user message
    await sendMessage(userMessage, 'user');
    
    if (!hasUserSentFirstMessage) {
      setHasUserSentFirstMessage(true);
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Find matching reply
    const messageLower = userMessage.toLowerCase();
    let replied = false;
    
    // Check auto replies
    for (const reply of autoReplies) {
      if (reply.keywords.some((keyword: string) => 
        messageLower.includes(keyword.toLowerCase())
      )) {
        setTimeout(() => {
          sendMessage(reply.response, 'bot');
          setIsTyping(false);
        }, 1000);
        replied = true;
        break;
      }
    }
    
    // Check advanced replies if no auto reply matched
    if (!replied) {
      for (const reply of advancedReplies) {
        if (reply.keywords.some((keyword: string) => 
          messageLower.includes(keyword.toLowerCase())
        )) {
          setTimeout(() => {
            if (reply.response_type === 'url') {
              sendMessage(
                `<a href="${reply.response}" target="_blank" class="text-blue-600 hover:underline">${reply.button_text || 'Click here'}</a>`,
                'bot'
              );
            } else {
              sendMessage(reply.response, 'bot');
            }
            setIsTyping(false);
          }, 1000);
          replied = true;
          break;
        }
      }
    }
    
    // Send fallback message if no reply matched
    if (!replied && settings?.fallback_message) {
      setTimeout(() => {
        sendMessage(settings.fallback_message, 'bot');
        setIsTyping(false);
      }, 1000);
    } else if (!replied) {
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  if (!settings) return null;

  const messageGroups = groupMessages(messages);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button with unread badge */}
      <button
        onClick={toggleChat}
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none transition-all"
        style={{ backgroundColor: settings.primary_color || '#4f46e5' }}
      >
        {isOpen ? (
          <LucideIcon icon="X" className="w-6 h-6 text-white" />
        ) : (
          <>
            <LucideIcon icon="MessageCircle" className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 mt-4 flex flex-col overflow-hidden max-h-[80vh]">
          {/* Header */}
          <div 
            className="p-4 flex justify-between items-center"
            style={{ backgroundColor: settings.primary_color || '#4f46e5' }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
                <span className="text-lg" style={{ color: settings.primary_color || '#4f46e5' }}>
                  <LucideIcon icon="MessageCircle" className="w-6 h-6" />
                </span>
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">{settings.business_name || 'Chat'}</h3>
                <p className="text-sm text-white opacity-70">
                  {settings.sales_representative || 'Support'} | Online
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white focus:outline-none"
            >
              <LucideIcon icon="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <LucideIcon icon="MessageCircle" className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">Start a conversation</h4>
                <p className="text-sm">Send a message to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={`flex ${group.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col">
                      {group.messages.map((msg, msgIndex) => (
                        <div
                          key={msg.id}
                          className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.sender === 'user'
                              ? 'bg-blue-100 text-blue-800 ml-auto'
                              : msg.sender === 'agent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          } ${msgIndex > 0 ? 'mt-1' : ''}`}
                        >
                          {/* New message indicator */}
                          {msg.isNew && (
                            <span className="absolute -top-2 -right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                          )}
                          {/* Message content with bold text for unread messages */}
                          <div className={`${(!msg.isRead || msg.isNew) ? 'font-semibold' : 'font-normal'}`}>
                            {msg.sender === 'bot' ? (
                              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            ) : (
                              <div>{msg.text}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className={`text-xs text-gray-500 mt-1 ${
                        group.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {format(group.messages[group.messages.length - 1].timestamp, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mt-2">
                <div className="bg-gray-100 rounded-full px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r-md focus:outline-none"
                style={{ backgroundColor: settings.primary_color || '#4f46e5' }}
              >
                <LucideIcon icon="Send" className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;