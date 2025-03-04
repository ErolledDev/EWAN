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

// Group messages by sender for better display
type MessageGroup = {
  sender: 'user' | 'bot' | 'agent';
  messages: Message[];
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
  
  // Group messages by sender
  const groupMessages = (messages: Message[]): MessageGroup[] => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    
    messages.forEach(message => {
      if (!currentGroup || currentGroup.sender !== message.sender) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          sender: message.sender,
          messages: [message]
        };
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    return groups;
  };
  
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
    
    setMessages(prev => [...prev, userMessage]);
    setHasUserSentFirstMessage(true);
    
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
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message to find a reply
    const userMessageLower = message.toLowerCase();
    let replied = false;
    
    // Check auto replies
    for (const reply of autoReplies) {
      const keywords = reply.keywords;
      
      if (reply.matching_type === 'word_match') {
        // Simple word match
        if (keywords.some((keyword: string) => userMessageLower.includes(keyword.toLowerCase()))) {
          setTimeout(() => {
            sendBotReply(reply.response);
            setIsTyping(false);
          }, 1000);
          replied = true;
          break;
        }
      } else if (reply.matching_type === 'regex') {
        // Regex match
        try {
          for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'i');
            if (regex.test(userMessageLower)) {
              setTimeout(() => {
                sendBotReply(reply.response);
                setIsTyping(false);
              }, 1000);
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
              setTimeout(() => {
                sendBotReply(reply.response);
                setIsTyping(false);
              }, 1000);
            } else if (reply.response_type === 'url') {
              const linkText = reply.button_text || 'Click here';
              setTimeout(() => {
                sendBotReply(`<a href="${reply.response}" target="_blank" class="text-blue-600 hover:underline">${linkText}</a>`);
                setIsTyping(false);
              }, 1000);
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
                  setTimeout(() => {
                    sendBotReply(reply.response);
                    setIsTyping(false);
                  }, 1000);
                } else if (reply.response_type === 'url') {
                  const linkText = reply.button_text || 'Click here';
                  setTimeout(() => {
                    sendBotReply(`<a href="${reply.response}" target="_blank" class="text-blue-600 hover:underline">${linkText}</a>`);
                    setIsTyping(false);
                  }, 1000);
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
    if (!replied && settings?.fallback_message) {
      setTimeout(() => {
        sendBotReply(settings.fallback_message);
        setIsTyping(false);
      }, 1000);
    } else if (!replied) {
      // If no fallback message, hide typing indicator
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
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
    
    setMessages(prev => [...prev, botMessage]);
    
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
  
  const messageGroups = groupMessages(messages);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none transition-all"
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
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 mt-4 flex flex-col overflow-hidden max-h-[80vh] animate-fade-in">
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
                <p className="text-sm text-white opacity-90">
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
          <div className="flex-1 p-4 overflow-y-auto max-h-[50vh]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <LucideIcon icon="MessageCircle" className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">Start a conversation</h4>
                <p className="text-sm">Send a message to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={`flex ${group.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col">
                      {/* Only show sender name once per group for bot/agent messages */}
                      {group.sender !== 'user' && (
                        <span className="text-xs font-medium text-gray-600 ml-2 mb-1">
                          {settings.sales_representative || 'Support'}
                        </span>
                      )}
                      
                      {/* Messages in this group */}
                      <div className="space-y-1">
                        {group.messages.map((msg, msgIndex) => (
                          <div
                            key={msg.id}
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.sender === 'user'
                                ? 'bg-blue-100 text-blue-800 ml-auto'
                                : msg.sender === 'agent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {msg.sender === 'bot' ? (
                              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            ) : (
                              <div>{msg.text}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Timestamp outside the bubble, only once per group */}
                      <div className={`text-xs text-gray-500 mt-1 ${group.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                        {format(group.messages[group.messages.length - 1].timestamp, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-full px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-r-md focus:outline-none mr-1"
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