import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { MessageCircle, Send, RefreshCw } from 'lucide-react';

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
    toggleAgentMode
  } = useChatStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession || !newMessage.trim()) return;
    
    try {
      // Always send as agent regardless of agent mode toggle
      await sendMessage(currentSession.id, newMessage, 'agent');
      setNewMessage('');
      
      // Immediately fetch messages to update the UI
      fetchMessages(currentSession.id);
    } catch (error) {
      console.error('Error sending message:', error);
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
  };
  
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];
  
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Chat</h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium">Active Conversations</h2>
          </div>
          
          <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
            {activeSessions.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No active conversations.
              </div>
            ) : (
              activeSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSession(session.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    currentSession?.id === session.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">Visitor {session.visitor_id.substring(0, 8)}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(session.created_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          {!currentSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium">
                  Chat with Visitor {currentSession.visitor_id.substring(0, 8)}
                </h2>
                <div className="text-xs text-gray-500 mt-1">
                  Started {format(new Date(currentSession.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                {currentMessages.length === 0 ? (
                  <div className="text-gray-500 text-center">
                    No messages yet
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
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_type === 'user'
                              ? 'bg-gray-100 text-gray-800'
                              : message.sender_type === 'bot'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          <div className="text-xs mb-1">
                            {message.sender_type === 'user'
                              ? 'Visitor'
                              : message.sender_type === 'bot'
                              ? 'Bot'
                              : 'You'}
                          </div>
                          <div>{message.message}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Send className="h-4 w-4" />
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