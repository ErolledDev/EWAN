import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { format } from 'date-fns';
import { 
  MessageCircle, 
  Send, 
  Search, 
  AlertCircle, 
  User, 
  Clock, 
  Pin, 
  Tag, 
  Edit, 
  Trash, 
  X,
  CheckCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const LiveChat: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    activeSessions, 
    currentSession, 
    messages,
    agentMode,
    fetchSessions, 
    fetchMessages, 
    setCurrentSession,
    sendMessage,
    toggleAgentMode,
    closeSession,
    updateSessionMetadata
  } = useChatStore();
  const { addNotification } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [labelColor, setLabelColor] = useState('#4f46e5');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch active sessions when component mounts
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchSessions(user.id);
        setLoading(false);
      };
      
      loadData();
      
      // Set up polling for new sessions
      const interval = setInterval(() => {
        if (user) {
          fetchSessions(user.id);
        }
      }, 10000); // Poll every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, fetchSessions]);
  
  // Fetch messages when current session changes
  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
      
      // Set up metadata state
      setVisitorName(currentSession.metadata?.visitorName || '');
      setNoteText(currentSession.metadata?.note || '');
      
      // Set up polling for new messages
      const interval = setInterval(() => {
        if (currentSession) {
          fetchMessages(currentSession.id);
        }
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(interval);
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
    
    if (!messageText.trim() || !currentSession) return;
    
    try {
      await sendMessage(currentSession.id, messageText, 'agent');
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      addNotification({
        type: 'error',
        title: 'Failed to send message',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleCloseSession = async (sessionId: string) => {
    try {
      await closeSession(sessionId);
      
      if (currentSession?.id === sessionId) {
        setCurrentSession('');
      }
      
      addNotification({
        type: 'success',
        title: 'Chat session closed',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error closing session:', error);
      addNotification({
        type: 'error',
        title: 'Failed to close session',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleRenameVisitor = async () => {
    if (!currentSession) return;
    
    try {
      const updatedMetadata = {
        ...currentSession.metadata,
        visitorName: visitorName.trim() || undefined
      };
      
      await updateSessionMetadata(currentSession.id, updatedMetadata);
      setIsRenaming(false);
      
      addNotification({
        type: 'success',
        title: 'Visitor renamed',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error renaming visitor:', error);
      addNotification({
        type: 'error',
        title: 'Failed to rename visitor',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleTogglePin = async () => {
    if (!currentSession) return;
    
    try {
      const isPinned = currentSession.metadata?.pinned || false;
      
      const updatedMetadata = {
        ...currentSession.metadata,
        pinned: !isPinned
      };
      
      await updateSessionMetadata(currentSession.id, updatedMetadata);
      
      addNotification({
        type: 'success',
        title: isPinned ? 'Chat unpinned' : 'Chat pinned',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling pin status:', error);
      addNotification({
        type: 'error',
        title: 'Failed to update pin status',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleAddLabel = async () => {
    if (!currentSession || !labelText.trim()) return;
    
    try {
      const updatedMetadata = {
        ...currentSession.metadata,
        label: {
          text: labelText.trim(),
          color: labelColor
        }
      };
      
      await updateSessionMetadata(currentSession.id, updatedMetadata);
      setShowLabelMenu(false);
      setLabelText('');
      
      addNotification({
        type: 'success',
        title: 'Label added',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding label:', error);
      addNotification({
        type: 'error',
        title: 'Failed to add label',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleRemoveLabel = async () => {
    if (!currentSession) return;
    
    try {
      const { label, ...restMetadata } = currentSession.metadata || {};
      
      await updateSessionMetadata(currentSession.id, restMetadata);
      
      addNotification({
        type: 'success',
        title: 'Label removed',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error removing label:', error);
      addNotification({
        type: 'error',
        title: 'Failed to remove label',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  const handleSaveNote = async () => {
    if (!currentSession) return;
    
    try {
      const updatedMetadata = {
        ...currentSession.metadata,
        note: noteText.trim() || undefined
      };
      
      await updateSessionMetadata(currentSession.id, updatedMetadata);
      setShowNoteEditor(false);
      
      addNotification({
        type: 'success',
        title: 'Note saved',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating session metadata:', error);
      addNotification({
        type: 'error',
        title: 'Failed to save note',
        message: 'Please try again.',
        duration: 5000,
      });
    }
  };
  
  // Filter sessions based on search term
  const filteredSessions = activeSessions.filter(session => {
    const visitorNameOrId = session.metadata?.visitorName || session.visitor_id;
    const label = session.metadata?.label?.text || '';
    const note = session.metadata?.note || '';
    const searchLower = searchTerm.toLowerCase();
    
    return visitorNameOrId.toLowerCase().includes(searchLower) || 
           label.toLowerCase().includes(searchLower) ||
           note.toLowerCase().includes(searchLower);
  });
  
  // Sort sessions: pinned first, then by updated_at
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // First sort by pinned status
    if (a.metadata?.pinned && !b.metadata?.pinned) return -1;
    if (!a.metadata?.pinned && b.metadata?.pinned) return 1;
    
    // Then sort by updated_at (most recent first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  
  // Get current session messages
  const currentMessages = currentSession ? (messages[currentSession.id] || []) : [];
  
  return (
    <div className="h-full flex flex-col">
      <Helmet>
        <title>Live Chat - ChatWidget Dashboard</title>
        <meta name="description" content="Engage with your website visitors in real-time through live chat." />
      </Helmet>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Active Conversations</h2>
            
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mt-4 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agentMode}
                  onChange={toggleAgentMode}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Agent Mode</span>
              </label>
              
              <div className="ml-2 relative inline-block">
                <div className={`h-2 w-2 rounded-full ${agentMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              
              <span className="ml-auto text-xs text-gray-500">
                {activeSessions.length} active
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm">No active conversations</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sortedSessions.map((session) => {
                  const visitorName = session.metadata?.visitorName;
                  const isPinned = session.metadata?.pinned;
                  const label = session.metadata?.label;
                  
                  return (
                    <li 
                      key={session.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        currentSession?.id === session.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setCurrentSession(session.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <div className="bg-gray-200 rounded-full p-2">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                  {visitorName || `Visitor ${session.visitor_id.substring(0, 8)}`}
                                </h3>
                                {isPinned && (
                                  <Pin className="h-3 w-3 text-indigo-500 ml-1" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(session.updated_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                          
                          {label && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${label.color}20`, 
                                color: label.color 
                              }}
                            >
                              {label.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {currentSession ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  
                  {isRenaming ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Enter visitor name"
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={handleRenameVisitor}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setIsRenaming(false)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <h2 className="text-lg font-medium">
                        {currentSession.metadata?.visitorName || `Visitor ${currentSession.visitor_id.substring(0, 8)}`}
                      </h2>
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {currentSession.metadata?.label && (
                    <span 
                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${currentSession.metadata.label.color}20`, 
                        color: currentSession.metadata.label.color 
                      }}
                    >
                      {currentSession.metadata.label.text}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTogglePin}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      currentSession.metadata?.pinned ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                    title={currentSession.metadata?.pinned ? 'Unpin conversation' : 'Pin conversation'}
                  >
                    <Pin className="h-5 w-5" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowLabelMenu(!showLabelMenu)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                      title="Add label"
                    >
                      <Tag className="h-5 w-5" />
                    </button>
                    
                    {showLabelMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
                        <h3 className="text-sm font-medium mb-2">Add Label</h3>
                        <input
                          type="text"
                          value={labelText}
                          onChange={(e) => setLabelText(e.target.value)}
                          placeholder="Label text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                        />
                        
                        <div className="mb-3">
                          <label className="block text-xs text-gray-500 mb-1">Color</label>
                          <div className="flex space-x-2">
                            {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                              <button
                                key={color}
                                onClick={() => setLabelColor(color)}
                                className={`w-6 h-6 rounded-full ${labelColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <button
                            onClick={() => setShowLabelMenu(false)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          
                          {currentSession.metadata?.label ? (
                            <button
                              onClick={handleRemoveLabel}
                              className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          ) : null}
                          
                          <button
                            onClick={handleAddLabel}
                            disabled={!labelText.trim()}
                            className="px-3 py-1 bg-indigo-600 rounded-md text-sm text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowNoteEditor(!showNoteEditor)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                    title="Add note"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleCloseSession(currentSession.id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                    title="Close conversation"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Note editor */}
              {showNoteEditor && (
                <div className="bg-yellow-50 p-4 border-b border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Conversation Notes</h3>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="w-full border border-yellow-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 mb-2"
                    placeholder="Add private notes about this conversation..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNoteEditor(false)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1 bg-yellow-600 rounded-md text-sm text-white hover:bg-yellow-700"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
              
              {/* Chat messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                            msg.sender_type === 'agent'
                              ? 'bg-indigo-100 text-indigo-800'
                              : msg.sender_type === 'user'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {msg.sender_type === 'agent'
                              ? 'You'
                              : msg.sender_type === 'user'
                              ? 'Visitor'
                              : 'Bot'}
                          </div>
                          
                          <div className="text-sm">
                            {msg.sender_type === 'bot' ? (
                              <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                            ) : (
                              msg.message
                            )}
                          </div>
                          
                          <div className="text-xs mt-1 opacity-70">
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium mb-2">No conversation selected</h2>
              <p className="text-sm max-w-md text-center">
                Select a conversation from the sidebar or wait for new visitors to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;