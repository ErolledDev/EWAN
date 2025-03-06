import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { format } from 'date-fns';
import { MessageCircle, Send, Search, X, Pin, Tag, AlertCircle, ChevronDown, MoreVertical, Edit, User } from 'lucide-react';
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
    sendMessage,
    setCurrentSession,
    toggleAgentMode,
    closeSession,
    updateSessionMetadata,
    markSessionAsRead
  } = useChatStore();
  const { addNotification } = useNotificationStore();
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null);
  const [showLabelMenu, setShowLabelMenu] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null);
  const [showVisitorNameInput, setShowVisitorNameInput] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  
  // Predefined labels
  const labels = [
    { text: 'Important', color: '#ef4444' },
    { text: 'Follow Up', color: '#f59e0b' },
    { text: 'Resolved', color: '#10b981' },
    { text: 'Pending', color: '#6366f1' },
    { text: 'Support', color: '#8b5cf6' },
    { text: 'Sales', color: '#ec4899' },
  ];
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChatOnMobile(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch sessions initially
      fetchSessions(user.id);
      
      // Set up polling for new sessions/updates
      const interval = setInterval(() => {
        fetchSessions(user.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchSessions]);
  
  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
      // Mark session as read when selected
      if (currentSession.metadata?.unread) {
        markSessionAsRead(currentSession.id);
      }
    }
  }, [currentSession, fetchMessages, markSessionAsRead]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentSession || isSubmitting || !agentMode) return;
    
    setIsSubmitting(true);
    
    try {
      await sendMessage(currentSession.id, messageText, 'agent');
      setMessageText('');
      
      addNotification({
        type: 'success',
        title: 'Message sent successfully',
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
      setIsSubmitting(false);
    }
  };
  
  const handleCloseSession = async (sessionId: string) => {
    try {
      await closeSession(sessionId);
      
      addNotification({
        type: 'success',
        title: 'Chat session closed',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error closing session:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to close session',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleTogglePin = async (sessionId: string, isPinned: boolean) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;
      
      await updateSessionMetadata(sessionId, {
        ...session.metadata,
        pinned: !isPinned
      });
      
      addNotification({
        type: 'success',
        title: `Chat ${!isPinned ? 'pinned' : 'unpinned'}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating pin status:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to update pin status',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleAddLabel = async (sessionId: string, label: { text: string; color: string }) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;
      
      await updateSessionMetadata(sessionId, {
        ...session.metadata,
        label
      });
      
      setShowLabelMenu(null);
      
      addNotification({
        type: 'success',
        title: `Label "${label.text}" added`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding label:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to add label',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleRemoveLabel = async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;
      
      const { label, ...restMetadata } = session.metadata;
      await updateSessionMetadata(sessionId, restMetadata);
      
      addNotification({
        type: 'success',
        title: 'Label removed',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing label:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to remove label',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleUpdateNote = async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;
      
      await updateSessionMetadata(sessionId, {
        ...session.metadata,
        note: noteText
      });
      
      setShowNoteInput(null);
      setNoteText('');
      
      addNotification({
        type: 'success',
        title: 'Note updated',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating note:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to update note',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };

  const handleUpdateVisitorName = async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;
      
      await updateSessionMetadata(sessionId, {
        ...session.metadata,
        visitorName: visitorName
      });
      
      setShowVisitorNameInput(null);
      setVisitorName('');
      
      addNotification({
        type: 'success',
        title: 'Visitor name updated',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating visitor name:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to update visitor name',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  // Filter and sort sessions with prioritization
  const filteredSessions = activeSessions
    .filter(session => {
      const searchLower = searchTerm.toLowerCase();
      const visitorId = session.visitor_id.toLowerCase();
      const visitorName = (session.metadata?.visitorName || '').toLowerCase();
      const note = session.metadata?.note?.toLowerCase() || '';
      const label = session.metadata?.label?.text.toLowerCase() || '';
      
      return visitorId.includes(searchLower) || 
             visitorName.includes(searchLower) ||
             note.includes(searchLower) || 
             label.includes(searchLower);
    })
    .sort((a, b) => {
      // First sort by unread status
      if (a.metadata?.unread && !b.metadata?.unread) return -1;
      if (!a.metadata?.unread && b.metadata?.unread) return 1;
      
      // Then sort by pinned status
      if (a.metadata?.pinned && !b.metadata?.pinned) return -1;
      if (!a.metadata?.pinned && b.metadata?.pinned) return 1;
      
      // Finally sort by updated_at
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    if (isMobile) {
      setShowChatOnMobile(true);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowChatOnMobile(false);
    }
  };

  // Get unread message count for a session
  const getUnreadCount = (sessionId: string) => {
    const sessionMessages = messages[sessionId] || [];
    return sessionMessages.filter(msg => 
      msg.sender_type === 'user' && 
      new Date(msg.created_at) > new Date(sessionId === currentSession?.id ? Date.now() : (currentSession?.updated_at || 0))
    ).length;
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <Helmet>
        <title>Live Chat - ChatWidget Dashboard</title>
        <meta name="description" content="Manage your live chat sessions and interact with visitors in real-time." />
      </Helmet>
      
      {/* Sessions List */}
      <div className={`${
        isMobile && showChatOnMobile ? 'hidden' : 'block'
      } w-full md:w-80 border-r border-gray-200 bg-white flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Live Chat</h2>
            <button
              onClick={toggleAgentMode}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                agentMode
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {agentMode ? 'Online' : 'Offline'}
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No active chats</p>
              <p className="text-sm mt-1">Wait for visitors to start chatting</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => {
                const unreadCount = getUnreadCount(session.id);
                return (
                  <div
                    key={session.id}
                    className={`relative p-4 cursor-pointer hover:bg-gray-50 ${
                      currentSession?.id === session.id ? 'bg-indigo-50' : ''
                    } ${session.metadata?.unread ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    {/* Pinned indicator */}
                    {session.metadata?.pinned && (
                      <Pin className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className={`relative h-8 w-8 rounded-full flex items-center justify-center text-gray-600 font-medium ${
                            session.metadata?.unread ? 'bg-blue-200' : 'bg-gray-200'
                          }`}>
                            {session.metadata?.visitorName 
                              ? session.metadata.visitorName.charAt(0).toUpperCase()
                              : session.visitor_id.charAt(0).toUpperCase()
                            }
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                session.metadata?.unread ? 'text-blue-900' : 'text-gray-900'
                              } truncate`}>
                                {session.metadata?.visitorName || `Visitor ${session.visitor_id.slice(0, 8)}`}
                                {session.metadata?.unread && !unreadCount && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </p>
                              <span className="text-xs text-gray-500">
                                {format(new Date(session.updated_at), 'h:mm a')}
                              </span>
                            </div>
                            
                            {/* Label */}
                            {session.metadata?.label && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1"
                                style={{
                                  backgroundColor: `${session.metadata.label.color}15`,
                                  color: session.metadata.label.color
                                }}
                              >
                                {session.metadata.label.text}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Note preview */}
                        {session.metadata?.note && (
                          <div className={`mt-1 text-sm truncate pl-11 ${
                            session.metadata?.unread ? 'text-blue-800' : 'text-gray-500'
                          }`}>
                            {session.metadata.note}
                          </div>
                        )}
                      </div>
                      
                      {/* Session menu */}
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSessionMenu(showSessionMenu === session.id ? null : session.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                        
                        {showSessionMenu === session.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVisitorNameInput(session.id);
                                  setVisitorName(session.metadata?.visitorName || '');
                                  setShowSessionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <User className="h-4 w-4 mr-2" />
                                {session.metadata?.visitorName ? 'Edit' : 'Add'} Visitor Name
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePin(session.id, !!session.metadata?.pinned);
                                  setShowSessionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Pin className="h-4 w-4 mr-2" />
                                {session.metadata?.pinned ? 'Unpin' : 'Pin'} Chat
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowLabelMenu(session.id);
                                  setShowSessionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Tag className="h-4 w-4 mr-2" />
                                {session.metadata?.label ? 'Change' : 'Add'} Label
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowNoteInput(session.id);
                                  setNoteText(session.metadata?.note || '');
                                  setShowSessionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {session.metadata?.note ? 'Edit' : 'Add'} Note
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseSession(session.id);
                                  setShowSessionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Close Chat
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Label menu */}
                        {showLabelMenu === session.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {labels.map((label) => (
                                <button
                                  key={label.text}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddLabel(session.id, label);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                  style={{ color: label.color }}
                                >
                                  <span
                                    className="h-3 w-3 rounded-full mr-2"
                                    style={{ backgroundColor: label.color }}
                                  />
                                  {label.text}
                                </button>
                              ))}
                              
                              {session.metadata?.label && (
                                <>
                                  <div className="border-t border-gray-200 my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveLabel(session.id);
                                      setShowLabelMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove Label
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Note input */}
                        {showNoteInput === session.id && (
                          <div className="absolute right-0 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 p-3">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add a note..."
                              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowNoteInput(null);
                                  setNoteText('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateNote(session.id);
                                }}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Visitor name input */}
                        {showVisitorNameInput === session.id && (
                          <div className="absolute right-0 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 p-3">
                            <input
                              type="text"
                              value={visitorName}
                              onChange={(e) => setVisitorName(e.target.value)}
                              placeholder="Enter visitor name..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVisitorNameInput(null);
                                  setVisitorName('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateVisitorName(session.id);
                                }}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className={`${
        isMobile && !showChatOnMobile ? 'hidden' : 'block'
      } flex-1 flex flex-col bg-gray-50`}>
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isMobile && (
                    <button
                      onClick={handleBackToList}
                      className="mr-2 p-2 rounded-md hover:bg-gray-100"
                    >
                      <ChevronDown className="h-5 w-5 transform rotate-90" />
                    </button>
                  )}
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {currentSession.metadata?.visitorName 
                      ? currentSession.metadata.visitorName.charAt(0).toUpperCase()
                      : currentSession.visitor_id.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">
                      {currentSession.metadata?.visitorName || `Visitor ${currentSession.visitor_id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Started {format(new Date(currentSession.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                
                {currentSession.metadata?.label && (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${currentSession.metadata.label.color}15`,
                      color: currentSession.metadata.label.color
                    }}
                  >
                    {currentSession.metadata.label.text}
                  </span>
                )}
              </div>
              
              {currentSession.metadata?.note && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">{currentSession.metadata.note}</p>
                </div>
              )}

              {!agentMode && (
                <div className="mt-2 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Agent mode is offline. Enable it to respond to messages.
                  </p>
                </div>
              )}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages[currentSession.id]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation with your visitor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages[currentSession.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'user' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender_type === 'user'
                            ? 'bg-white text-gray-900'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={agentMode ? "Type your message..." : "Enable agent mode to send messages"}
                  disabled={!agentMode}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSubmitting || !agentMode}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
            <p className="text-sm">Choose a chat from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;

