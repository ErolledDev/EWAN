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
  isNew?: boolean;
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
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  
  // Create Supabase client
  const supabase = createClient(
    'https://zawhdprorlwaagmmyyer.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2hkcHJvcmx3YWFnbW15eWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzU1NTEsImV4cCI6MjA1NjUxMTU1MX0.HaHu907PQHPxSWNQrUsP6gNOpRaN08PnSZF-pN-BaD8'
  );

  // Scroll to top when new messages arrive
  useEffect(() => {
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update unread count when widget is not open
  useEffect(() => {
    if (!isOpen && messages.some(m => m.isNew)) {
      const newCount = messages.filter(m => m.isNew).length;
      setUnreadCount(newCount);
    } else {
      setUnreadCount(0);
      // Mark all messages as read when widget is opened
      setMessages(messages.map(m => ({ ...m, isNew: false })));
    }
  }, [isOpen, messages]);

  // Rest of your existing useEffect hooks...
  // [Previous code for fetching widget data, initializing chat session, etc.]

  const sendMessage = async (text: string, sender: 'user' | 'bot' | 'agent') => {
    const newMessage: Message = {
      id: nanoid(),
      sender,
      text,
      timestamp: new Date(),
      isNew: !isOpen // Mark as new if widget is closed
    };

    // Add message to the beginning of the array
    setMessages(prev => [newMessage, ...prev]);

    try {
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: sessionId,
          sender_type: sender,
          message: text,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !sessionId) return;
    
    // Send user message
    await sendMessage(message, 'user');
    setHasUserSentFirstMessage(true);
    setMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message to find a reply
    const userMessageLower = message.toLowerCase();
    let replied = false;
    
    // Check auto replies and advanced replies...
    // [Previous code for handling replies]

    // If no reply matched, send fallback message
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

  if (!settings) {
    return null;
  }

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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
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
                <div ref={messagesStartRef} />
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
                            className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.sender === 'user'
                                ? 'bg-blue-100 text-blue-800 ml-auto'
                                : msg.sender === 'agent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {msg.isNew && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                New
                              </span>
                            )}
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