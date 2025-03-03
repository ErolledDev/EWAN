import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { format } from 'date-fns';
import { 
  MessageCircle, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Trash2, 
  MoreVertical, 
  Archive, 
  CheckCircle, 
  X, 
  ChevronRight,
  UserCircle,
  Sparkles
} from 'lucide-react';

const LiveChat: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    activeSessions, 
    currentSession, 
    messages, 
    agentMode,
    fetchSessions, 
    setCurrentSession, 
    fetchMessages, 
    sendMessage,
    toggleAgentMode,
    closeSession
  } = useChatStore();
  const { addNotification } = useNotificationStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (user) {
      fetchSessions(user.id);
      
      // Set up polling to refresh sessions every 10 seconds
      const interval = setInterval(() => {
        fetchSessions(user.id);
      }, 10000);
      
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user, fetchSessions]);
  
  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
      
      // Set up polling to refresh messages for the current session
      const messageInterval = setInterval(() => {
        fetchMessages(currentSession.id);
      }, 3000);
      
      return () => {
        clearInterval(messageInterval);
      };
    }
  }, [currentSession, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentSession]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      // Show typing indicator
      setIsTyping(true);
      
      // Always send as agent regardless of agent mode toggle
      await sendMessage(currentSession.id, newMessage, 'agent');
      setNewMessage('');
      
      // Immediately fetch messages to update the UI
      fetchMessages(currentSession.id);
      
      // Hide typing indicator after a short delay
      setTimeout(() => {
        setIsTyping(false);
      }, 500);
      
      addNotification({
        type: 'success',
        title: 'Message sent',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addNotification({
        type: 'error',
        title: 'Failed to send message',
        message: 'Please try again',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    await fetchSessions(user.id);
    if (currentSession) {
      await fetchMessages(currentSession.id);
    }
    setIsRefreshing(false);
    
    addNotification({
      type: 'info',
      title: 'Conversations refreshed',
      duration: 2000,
    });
  };
  
  const handleCloseSession = async (sessionId: string) => {
    setIsClosing(true);
    setDropdownOpen(null);
    
    try {
      await closeSession(sessionId);
      
      if (currentSession?.id === sessionId) {
        setCurrentSession('');
      }
      
      addNotification({
        type: 'success',
        title: 'Conversation closed',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error closing session:', error);
      addNotification({
        type: 'error',
        title: 'Failed to close conversation',
        message: 'Please try again',
        duration: 3000,
      });
    } finally {
      setIsClosing(false);
      setShowDeleteConfirm(null);
    }
  };
  
  const formatTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };
  
  const toggleDropdown = (sessionId: string) => {
    if (dropdownOpen === sessionId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(sessionId);
    }
  };
  
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];
  
  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Live Chat</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-700">Agent Mode:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agentMode}
                onChange={toggleAgentMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
            <h2 className="font-medium flex items-center">
              <MessageCircle className="h-4 w-4 text-indigo-600 mr-2" />
              Active Conversations
            </h2>
            <span className="text-xs text-white bg-indigo-600 px-2 py-1 rounded-full">
              {activeSessions.length} active
            </span>
          </div>
          
          <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
            {activeSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium">No active conversations</p>
                <p className="text-xs mt-1">Conversations will appear here when visitors start chatting</p>
              </div>
            ) : (
              activeSessions.map((session) => (
                <div key={session.id} className="relative">
                  <button
                    onClick={() => setCurrentSession(session.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      currentSession?.id === session.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        currentSession?.id === session.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <UserCircle className="h-6 w-6" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900 flex items-center">
                          Visitor {session.visitor_id.substring(0, 8)}
                          {currentSession?.id === session.id && (
                            <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeDifference(session.updated_at)}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        currentSession?.id === session.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(session.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {dropdownOpen === session.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden"
                      >
                        {showDeleteConfirm === session.id ? (
                          <div className="p-3 text-sm">
                            <p className="font-medium text-gray-800 mb-2">Close this conversation?</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCloseSession(session.id)}
                                disabled={isClosing}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                              >
                                {isClosing ? 'Closing...' : 'Yes, close'}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(session.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-200"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Close Conversation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          {!currentSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-lg font-medium">Select a conversation to start chatting</p>
              <p className="text-sm mt-2 text-center max-w-md">
                When you select a conversation, you'll be able to see the chat history and respond to the visitor.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium flex items-center">
                      <span className="mr-2">Chat with Visitor {currentSession.visitor_id.substring(0, 8)}</span>
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Active
                      </span>
                    </h2>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Started {format(new Date(currentSession.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(currentSession.id)}
                    className="inline-flex items-center px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors duration-200"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Close Chat
                  </button>
                </div>
                
                {showDeleteConfirm === currentSession.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 mb-2">Are you sure you want to close this conversation?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCloseSession(currentSession.id)}
                        disabled={isClosing}
                        className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                      >
                        {isClosing ? 'Closing...' : 'Yes, close conversation'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {currentMessages.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Messages will appear here when the visitor starts chatting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'user' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm transition-all duration-300 hover:shadow-md ${
                            message.sender_type === 'user'
                              ? 'bg-white text-gray-800 border border-gray-200'
                              : message.sender_type === 'bot'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          <div className="text-xs font-medium mb-1 flex items-center">
                            {message.sender_type === 'user' ? (
                              <>
                                <UserCircle className="h-3 w-3 mr-1" />
                                Visitor
                              </>
                            ) : message.sender_type === 'bot' ? (
                              <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Bot
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                You
                              </>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap">{message.message}</div>
                          <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(message.created_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-end">
                        <div className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 max-w-[70%] shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSending ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;