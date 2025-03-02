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
    ),
    ChevronDown: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="m6 9 6 6 6-6"/>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create Supabase client
  const supabase = createClient(
    'https://zawhdprorlwaagmmyyer.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8'
  );
  
  // Fetch widget settings and replies
  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        // Fetch widget settings - get the most recent one
        const { data: settingsData, error: settingsError } = await supabase
          .from('widget_settings')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (settingsError) throw settingsError;
        if (settingsData && settingsData.length > 0) {
          setSettings(settingsData[0]);
        }
        
        // Fetch auto replies
        const { data: autoRepliesData, error: autoRepliesError } = await supabase
          .from('auto_replies')
          .select('*')
          .eq('user_id', uid);
        
        if (autoRepliesError) throw autoRepliesError;
        setAutoReplies(autoRepliesData || []);
        
        // Fetch advanced replies
        const { data: advancedRepliesData, error: advancedRepliesError } = await supabase
          .from('advanced_replies')
          .select('*')
          .eq('user_id', uid);
        
        if (advancedRepliesError) throw advancedRepliesError;
        setAdvancedReplies(advancedRepliesData || []);
        
      } catch (error) {
        console.error('Error fetching widget data:', error);
      }
    };
    
    fetchWidgetData();
    
    // Set up a real-time subscription to widget_settings
    const settingsSubscription = supabase
      .channel('widget_settings_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'widget_settings',
          filter: `user_id=eq.${uid}`
        }, 
        (payload) => {
          setSettings(payload.new);
        }
      )
      .subscribe();
      
    // Set up a real-time subscription to auto_replies
    const autoRepliesSubscription = supabase
      .channel('auto_replies_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'auto_replies',
          filter: `user_id=eq.${uid}`
        }, 
        () => {
          // Refetch all auto replies when any change occurs
          supabase
            .from('auto_replies')
            .select('*')
            .eq('user_id', uid)
            .then(({ data }) => {
              if (data) setAutoReplies(data);
            });
        }
      )
      .subscribe();
      
    // Set up a real-time subscription to advanced_replies
    const advancedRepliesSubscription = supabase
      .channel('advanced_replies_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'advanced_replies',
          filter: `user_id=eq.${uid}`
        }, 
        () => {
          // Refetch all advanced replies when any change occurs
          supabase
            .from('advanced_replies')
            .select('*')
            .eq('user_id', uid)
            .then(({ data }) => {
              if (data) setAdvancedReplies(data);
            });
        }
      )
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(settingsSubscription);
      supabase.removeChannel(autoRepliesSubscription);
      supabase.removeChannel(advancedRepliesSubscription);
    };
  }, [uid, supabase]);
  
  // Initialize chat session
  useEffect(() => {
    // Generate a visitor ID if not already set
    if (!visitorId) {
      const storedVisitorId = localStorage.getItem('chat_visitor_id');
      if (storedVisitorId) {
        setVisitorId(storedVisitorId);
      } else {
        const newVisitorId = nanoid();
        localStorage.setItem('chat_visitor_id', newVisitorId);
        setVisitorId(newVisitorId);
      }
    }
  }, [visitorId]);
  
  // Create a chat session when widget is opened
  useEffect(() => {
    const createChatSession = async () => {
      if (isOpen && uid && visitorId && !sessionId) {
        try {
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: uid,
              visitor_id: visitorId,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
          
          if (error) throw error;
          
          setSessionId(data.id);
          
          // Add welcome message
          if (settings?.welcome_message) {
            const welcomeMsg: Message = {
              id: nanoid(),
              sender: 'bot',
              text: settings.welcome_message,
              timestamp: new Date(),
            };
            
            setMessages([welcomeMsg]);
            
            // Save welcome message to database
            await supabase
              .from('chat_messages')
              .insert({
                chat_session_id: data.id,
                sender_type: 'bot',
                message: settings.welcome_message,
                created_at: new Date().toISOString(),
              });
          }
        } catch (error) {
          console.error('Error creating chat session:', error);
        }
      }
    };
    
    createChatSession();
  }, [isOpen, uid, visitorId, sessionId, settings, supabase]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !sessionId) return;
    
    // Add user message to UI
    const userMessage: Message = {
      id: nanoid(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to database
    try {
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: sessionId,
          sender_type: 'user',
          message: message,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving user message:', error);
    }
    
    // Clear input
    setMessage('');
    
    // Process the message to find a reply
    const userMessageLower = message.toLowerCase();
    let replied = false;
    
    // Check auto replies
    for (const reply of autoReplies) {
      const keywords = reply.keywords;
      
      if (reply.matching_type === 'word_match') {
        // Simple word match
        if (keywords.some((keyword: string) => userMessageLower.includes(keyword.toLowerCase()))) {
          await sendBotReply(reply.response);
          replied = true;
          break;
        }
      } else if (reply.matching_type === 'regex') {
        // Regex match
        try {
          for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'i');
            if (regex.test(userMessageLower)) {
              await sendBotReply(reply.response);
              replied = true;
              break;
            }
          }
          if (replied) break;
        } catch (e) {
          console.error('Invalid regex:', e);
        }
      }
      // Note: fuzzy_match and synonym_match would require additional libraries
    }
    
    // If no auto reply matched, check advanced replies
    if (!replied) {
      for (const reply of advancedReplies) {
        const keywords = reply.keywords;
        
        if (reply.matching_type === 'word_match') {
          if (keywords.some((keyword: string) => userMessageLower.includes(keyword.toLowerCase()))) {
            if (reply.response_type === 'text') {
              await sendBotReply(reply.response);
            } else if (reply.response_type === 'url') {
              const linkText = reply.button_text || 'Click here';
              await sendBotReply(`<a href="${reply.response}" target="_blank" class="text-blue-600 hover:underline">${linkText}</a>`);
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
                  await sendBotReply(reply.response);
                } else if (reply.response_type === 'url') {
                  const linkText = reply.button_text || 'Click here';
                  await sendBotReply(`<a href="${reply.response}" target="_blank" class="text-blue-600 hover:underline">${linkText}</a>`);
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
    
    // If no reply matched and AI mode is enabled, we would call the AI API here
    // For now, just send the fallback message if nothing matched
    if (!replied && settings?.fallback_message) {
      await sendBotReply(settings.fallback_message);
    }
  };
  
  const sendBotReply = async (text: string) => {
    // Add bot message to UI
    const botMessage: Message = {
      id: nanoid(),
      sender: 'bot',
      text: text,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, botMessage]);
    
    // Save bot message to database
    try {
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: sessionId,
          sender_type: 'bot',
          message: text,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving bot message:', error);
    }
  };
  
  if (!settings) {
    return null; // Don't render until settings are loaded
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none"
        style={{ backgroundColor: settings.primary_color || '#4f46e5' }}
      >
        {isOpen ? (
          <LucideIcon icon="X" className="w-6 h-6 text-white" />
        ) : (
          <LucideIcon icon="MessageCircle" className="w-6 h-6 text-white" />
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
            <h3 className="text-white font-medium">{settings.business_name || 'Chat'}</h3>
            <button 
              onClick={toggleChat}
              className="text-white focus:outline-none"
            >
              <LucideIcon icon="ChevronDown" className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[50vh]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Send a message to start chatting
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-blue-100 text-blue-800'
                          : msg.sender === 'agent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.sender === 'bot' || msg.sender === 'agent' ? (
                        <div className="text-xs font-medium mb-1">
                          {settings.sales_representative || 'Support'}
                        </div>
                      ) : null}
                      
                      {msg.sender === 'bot' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                      ) : (
                        <div>{msg.text}</div>
                      )}
                      
                      <div className="text-xs mt-1 opacity-70">
                        {format(msg.timestamp, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-r-md focus:outline-none"
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