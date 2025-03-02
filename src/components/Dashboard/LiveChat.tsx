import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';

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
  
  useEffect(() => {
    if (user) {
      fetchSessions(user.id);
    }
  }, [user, fetchSessions]);
  
  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
    }
  }, [currentSession, fetchMessages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession || !newMessage.trim()) return;
    
    sendMessage(currentSession.id, newMessage, 'agent');
    setNewMessage('');
  };
  
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];
  
  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Chat</h1>
        
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium">Active Conversations</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
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
        
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
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