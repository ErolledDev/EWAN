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
  CheckCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Filter,
  RefreshCw,
  Loader,
  UserCircle,
  ChevronDown,
  ArrowLeft,
  Menu,
  MoreVertical
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  
  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileScreen = window.innerWidth < 768;
      setIsMobile(isMobileScreen);
      
      // On mobile, default to showing the conversation list
      if (isMobileScreen) {
        setSidebarCollapsed(false);
        setMobileView('list');
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
      
      // On mobile, switch to chat view when a session is selected
      if (isMobile) {
        setMobileView('chat');
      }
      
      return () => clearInterval(interval);
    }
  }, [currentSession, fetchMessages, isMobile]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentSession]);

  // Focus input when session changes
  useEffect(() => {
    if (currentSession && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentSession]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentSession) return;
    
    try {
      // Show typing indicator
      setIsTyping(true);
      
      await sendMessage(currentSession.id, messageText, 'agent');
      setMessageText('');
      
      // Hide typing indicator after a short delay
      setTimeout(() => {
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
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
        if (isMobile) {
          setMobileView('list');
        }
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

  const handleRefreshSessions = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      await fetchSessions(user.id);
      
      addNotification({
        type: 'success',
        title: 'Conversations refreshed',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error refreshing sessions:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to refresh conversations',
        message: 'Please try again.',
        duration: 5000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    if (isMobile) {
      setMobileView('chat');
    }
  };
  
  const handleBackToList = () => {
    if (isMobile) {
      setMobileView('list');
    }
  };
  
  // Filter sessions based on search term and filter option
  const filteredSessions = activeSessions.filter(session => {
    const visitorNameOrId = session.metadata?.visitorName || session.visitor_id;
    const label = session.metadata?.label?.text || '';
    const note = session.metadata?.note || '';
    const searchLower = searchTerm.toLowerCase();
    const isPinned = session.metadata?.pinned || false;
    
    // First apply text search
    const matchesSearch = visitorNameOrId.toLowerCase().includes(searchLower) || 
                          label.toLowerCase().includes(searchLower) ||
                          note.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    // Then apply filter
    switch (filterOption) {
      case 'pinned':
        return isPinned;
      case 'labeled':
        return !!session.metadata?.label;
      case 'noted':
        return !!session.metadata?.note;
      case 'all':
      default:
        return true;
    }
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

  // Format timestamp with relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  // Get avatar initials
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Get filter label
  const getFilterLabel = () => {
    switch (filterOption) {
      case 'pinned':
        return 'Pinned';
      case 'labeled':
        return 'Labeled';
      case 'noted':
        return 'With notes';
      case 'all':
      default:
        return 'All';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <Helmet>
        <title>Live Chat - ChatWidget Dashboard</title>
        <meta name="description" content="Engage with your website visitors in real-time through live chat." />
      </Helmet>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions sidebar */}
        <div 
          className={`border-r border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-80 opacity-100'
          } ${isMobile && mobileView === 'chat' ? 'hidden md:flex' : ''}`}
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
              <button
                onClick={handleRefreshSessions}
                disabled={isRefreshing}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                title="Refresh conversations"
              >
                {isRefreshing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center">
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
              </div>
              
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  <span className="mr-1">{getFilterLabel()}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 border border-gray-200 text-xs w-32 animate-fadeIn">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterOption('all');
                          setShowFilterMenu(false);
                        }}
                        className={`block px-4 py-2 text-left w-full hover:bg-gray-100 ${filterOption === 'all' ? 'bg-indigo-50 text-indigo-700' : ''}`}
                      >
                        All conversations
                      </button>
                      <button
                        onClick={() => {
                          setFilterOption('pinned');
                          setShowFilterMenu(false);
                        }}
                        className={`block px-4 py-2 text-left w-full hover:bg-gray-100 ${filterOption === 'pinned' ? 'bg-indigo-50 text-indigo-700' : ''}`}
                      >
                        Pinned only
                      </button>
                      <button
                        onClick={() => {
                          setFilterOption('labeled');
                          setShowFilterMenu(false);
                        }}
                        className={`block px-4 py-2 text-left w-full hover:bg-gray-100 ${filterOption === 'labeled' ? 'bg-indigo-50 text-indigo-700' : ''}`}
                      >
                        With labels
                      </button>
                      <button
                        onClick={() => {
                          setFilterOption('noted');
                          setShowFilterMenu(false);
                        }}
                        className={`block px-4 py-2 text-left w-full hover:bg-gray-100 ${filterOption === 'noted' ? 'bg-indigo-50 text-indigo-700' : ''}`}
                      >
                        With notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium">No active conversations</p>
                <p className="text-xs mt-1">Waiting for visitors to start chatting</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {sortedSessions.map((session) => {
                  const visitorName = session.metadata?.visitorName;
                  const isPinned = session.metadata?.pinned;
                  const label = session.metadata?.label;
                  const hasNote = !!session.metadata?.note;
                  
                  return (
                    <li 
                      key={session.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        currentSession?.id === session.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                      }`}
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              currentSession?.id === session.id ? 'bg-indigo-500' : 'bg-gray-400'
                            }`}>
                              {visitorName ? getInitials(visitorName) : '?'}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                  {visitorName || `Visitor ${session.visitor_id.substring(0, 8)}`}
                                </h3>
                                {isPinned && (
                                  <Pin className="h-3 w-3 text-indigo-500 ml-1" />
                                )}
                                {hasNote && (
                                  <Edit className="h-3 w-3 text-amber-500 ml-1" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimestamp(session.updated_at)}
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
        <div className={`flex-1 flex flex-col bg-gray-50 ${isMobile && mobileView === 'list' ? 'hidden md:flex' : ''}`}>
          {currentSession ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 p-4 flex flex-col shadow-sm">
                {/* Back button for mobile - centered at the top */}
                {isMobile && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={handleBackToList}
                      className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Back to conversations</span>
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="bg-indigo-100 rounded-full p-2.5 mr-3">
                      <UserCircle className="h-5 w-5 text-indigo-600" />
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
                          className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setIsRenaming(false)}
                          className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h2 className="text-lg font-medium truncate max-w-[120px] md:max-w-xs">
                          {currentSession.metadata?.visitorName || `Visitor ${currentSession.visitor_id.substring(0, 8)}`}
                        </h2>
                        <button
                          onClick={() => setIsRenaming(true)}
                          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  
                  {/* Desktop action buttons */}
                  <div className="hidden md:flex items-center space-x-1">
                    <button
                      onClick={handleTogglePin}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        currentSession.metadata?.pinned ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                      title={currentSession.metadata?.pinned ? 'Unpin conversation' : 'Pin conversation'}
                    >
                      <Pin className="h-5 w-5" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowLabelMenu(!showLabelMenu)}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                          currentSession.metadata?.label ? 'text-indigo-600' : 'text-gray-400'
                        }`}
                        title="Manage label"
                      >
                        <Tag className="h-5 w-5" />
                      </button>
                      
                      {showLabelMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-gray-200">
                          <h3 className="text-sm font-medium mb-2">Manage Label</h3>
                          <input
                            type="text"
                            value={labelText}
                            onChange={(e) => setLabelText(e.target.value)}
                            placeholder="Label text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                          />
                          
                          <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">Color</label>
                            <div className="flex flex-wrap gap-2">
                              {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'].map(color => (
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
                              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            
                            {currentSession.metadata?.label ? (
                              <button
                                onClick={handleRemoveLabel}
                                className="px-3 py-1.5 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            ) : null}
                            
                            <button
                              onClick={handleAddLabel}
                              disabled={!labelText.trim()}
                              className="px-3 py-1.5 bg-indigo-600 rounded-md text-sm text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowNoteEditor(!showNoteEditor)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        currentSession.metadata?.note ? 'text-amber-500' : 'text-gray-400'
                      }`}
                      title="Add note"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleCloseSession(currentSession.id)}
                      className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 text-gray-400 transition-colors"
                      title="Close conversation"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Mobile action menu button */}
                  <div className="md:hidden relative" ref={actionMenuRef}>
                    <button
                      onClick={() => setShowActionMenu(!showActionMenu)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {showActionMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 animate-fadeIn">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleTogglePin();
                              setShowActionMenu(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Pin className={`h-4 w-4 mr-2 ${currentSession.metadata?.pinned ? 'text-indigo-600' : 'text-gray-400'}`} />
                            {currentSession.metadata?.pinned ? 'Unpin conversation' : 'Pin conversation'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowLabelMenu(true);
                              setShowActionMenu(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Tag className={`h-4 w-4 mr-2 ${currentSession.metadata?.label ? 'text-indigo-600' : 'text-gray-400'}`} />
                            Manage label
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowNoteEditor(!showNoteEditor);
                              setShowActionMenu(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Edit className={`h-4 w-4 mr-2 ${currentSession.metadata?.note ? 'text-amber-500' : 'text-gray-400'}`} />
                            {currentSession.metadata?.note ? 'Edit note' : 'Add note'}
                          </button>
                          
                          <button
                            onClick={() => {
                              handleCloseSession(currentSession.id);
                              setShowActionMenu(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Close conversation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Note editor */}
              {showNoteEditor && (
                <div className="bg-amber-50 p-4 border-b border-amber-200 animate-fadeIn">
                  <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                    <Edit className="h-4 w-4 mr-1" />
                    Conversation Notes
                  </h3>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="w-full border border-amber-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 mb-2 bg-white"
                    placeholder="Add private notes about this conversation..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNoteEditor(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1.5 bg-amber-600 rounded-md text-sm text-white hover:bg-amber-700 transition-colors"
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
                    {currentMessages.map((msg, index) => {
                      const isFirstInGroup = index === 0 || currentMessages[index - 1].sender_type !== msg.sender_type;
                      const isLastInGroup = index === currentMessages.length - 1 || currentMessages[index + 1].sender_type !== msg.sender_type;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] sm:max-w-md rounded-lg px-4 py-2 ${
                              msg.sender_type === 'agent'
                                ? 'bg-indigo-100 text-indigo-800'
                                : msg.sender_type === 'user'
                                ? 'bg-white text-gray-800 border border-gray-200'
                                : 'bg-green-100 text-green-800'
                            } ${
                              !isFirstInGroup && !isLastInGroup
                                ? msg.sender_type === 'agent'
                                  ? 'rounded-tr-none'
                                  : 'rounded-tl-none'
                                : ''
                            } ${
                              isFirstInGroup && !isLastInGroup
                                ? msg.sender_type === 'agent'
                                  ? 'rounded-tr-none'
                                  : 'rounded-tl-none'
                                : ''
                            } ${
                              !isFirstInGroup && isLastInGroup
                                ? msg.sender_type === 'agent'
                                  ? 'rounded-br-none'
                                  : 'rounded-bl-none'
                                : ''
                            }`}
                          >
                            {isFirstInGroup && (msg.sender_type === 'bot' || msg.sender_type === 'agent') && (
                              <div className="text-xs font-medium mb-1">
                                {msg.sender_type === 'agent' ? 'You' : 'Bot'}
                              </div>
                            )}
                            
                            <div className="text-sm break-words">
                              {msg.sender_type === 'bot' ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                              ) : (
                                msg.message
                              )}
                            </div>
                            
                            <div className="text-xs mt-1 opacity-70 text-right">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="px-4 py-2 text-gray-500 text-sm animate-pulse flex items-center">
                  <div className="flex space-x-1 mr-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Sending message...</span>
                </div>
              )}
              
              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md text-center">
                <MessageSquare className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2 text-gray-800">No conversation selected</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {isMobile ? 
                    "Select a conversation from the list" : 
                    "Select a conversation from the sidebar or wait for new visitors to start chatting."}
                </p>
                <p className="text-xs text-gray-400 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Agent mode is {agentMode ? 'active' : 'inactive'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;