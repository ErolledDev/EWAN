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
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  Calendar,
  Lock,
  Pin,
  Tag,
  Edit,
  Trash,
  CheckSquare,
  Square,
  Star,
  StickyNote,
  Users,
  AlertOctagon
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
    setCurrentSession, 
    fetchMessages, 
    sendMessage,
    toggleAgentMode,
    closeSession,
    updateSessionMetadata
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'pinned' | 'labeled'>('all');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [labelText, setLabelText] = useState('');
  const [labelColor, setLabelColor] = useState('#4f46e5');
  const [availableLabels, setAvailableLabels] = useState([
    { text: 'Important', color: '#ef4444' },
    { text: 'Support', color: '#3b82f6' },
    { text: 'Sales', color: '#10b981' },
    { text: 'Feedback', color: '#f59e0b' },
    { text: 'Bug', color: '#8b5cf6' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Focus input when selecting a conversation
  useEffect(() => {
    if (currentSession && messageInputRef.current && agentMode) {
      messageInputRef.current.focus();
    }
  }, [currentSession, agentMode]);
  
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
    
    if (!currentSession || !newMessage.trim() || !agentMode) return;
    
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
      
      // Remove from selected sessions if in select mode
      if (selectedSessions.includes(sessionId)) {
        setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
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
  
  const handleMassDelete = async () => {
    if (selectedSessions.length === 0) return;
    
    setIsClosing(true);
    
    try {
      // Close each selected session
      for (const sessionId of selectedSessions) {
        await closeSession(sessionId);
      }
      
      // If current session is among selected, clear it
      if (currentSession && selectedSessions.includes(currentSession.id)) {
        setCurrentSession('');
      }
      
      // Clear selection
      setSelectedSessions([]);
      setSelectMode(false);
      
      addNotification({
        type: 'success',
        title: `${selectedSessions.length} conversations closed`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error closing multiple sessions:', error);
      addNotification({
        type: 'error',
        title: 'Failed to close conversations',
        message: 'Please try again',
        duration: 3000,
      });
    } finally {
      setIsClosing(false);
    }
  };
  
  const toggleSessionSelection = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };
  
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // Clear selections when exiting select mode
      setSelectedSessions([]);
    }
  };
  
  const selectAllSessions = () => {
    if (selectedSessions.length === filteredSessions.length) {
      // If all are selected, deselect all
      setSelectedSessions([]);
    } else {
      // Otherwise, select all filtered sessions
      setSelectedSessions(filteredSessions.map(session => session.id));
    }
  };
  
  const togglePinSession = async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    try {
      const metadata = session.metadata || {};
      const isPinned = metadata.pinned || false;
      
      await updateSessionMetadata(sessionId, {
        ...metadata,
        pinned: !isPinned
      });
      
      addNotification({
        type: 'success',
        title: isPinned ? 'Conversation unpinned' : 'Conversation pinned',
        duration: 2000,
      });
      
      // Refresh sessions to update UI
      if (user) {
        fetchSessions(user.id);
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      addNotification({
        type: 'error',
        title: 'Failed to update pin status',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleRenameVisitor = async () => {
    if (!currentSession || !newVisitorName.trim()) return;
    
    try {
      const metadata = currentSession.metadata || {};
      
      await updateSessionMetadata(currentSession.id, {
        ...metadata,
        visitorName: newVisitorName.trim()
      });
      
      setShowRenameModal(false);
      setNewVisitorName('');
      
      addNotification({
        type: 'success',
        title: 'Visitor renamed successfully',
        duration: 2000,
      });
      
      // Refresh sessions to update UI
      if (user) {
        fetchSessions(user.id);
      }
    } catch (error) {
      console.error('Error renaming visitor:', error);
      addNotification({
        type: 'error',
        title: 'Failed to rename visitor',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleAddNote = async () => {
    if (!currentSession || !noteText.trim()) return;
    
    try {
      const metadata = currentSession.metadata || {};
      
      await updateSessionMetadata(currentSession.id, {
        ...metadata,
        note: noteText.trim()
      });
      
      setShowNoteModal(false);
      setNoteText('');
      
      addNotification({
        type: 'success',
        title: 'Note added successfully',
        duration: 2000,
      });
      
      // Refresh sessions to update UI
      if (user) {
        fetchSessions(user.id);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      addNotification({
        type: 'error',
        title: 'Failed to add note',
        message: 'Please try again',
        duration: 3000,
      });
    }
  };
  
  const handleAddLabel = async () => {
    if (!currentSession || !labelText.trim()) return;
    
    try {
      const metadata = currentSession.metadata || {};
      
      await updateSessionMetadata(currentSession.id, {
        ...metadata,
        label: {
          text: labelText.trim(),
          color: labelColor
        }
      });
      
      setShowLabelModal(false);
      setLabelText('');
      
      addNotification({
        type: 'success',
        title: 'Label added successfully',
        duration: 2000,
      });
      
      // Refresh sessions to update UI
      if (user) {
        fetchSessions(user.id);
      }
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
  
  const removeLabel = async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    try {
      const metadata = session.metadata || {};
      const { label, ...rest } = metadata;
      
      await updateSessionMetadata(sessionId, rest);
      
      addNotification({
        type: 'success',
        title: 'Label removed',
        duration: 2000,
      });
      
      // Refresh sessions to update UI
      if (user) {
        fetchSessions(user.id);
      }
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
  
  const isSessionActive = (session: any) => {
    const lastActivity = new Date(session.updated_at).getTime();
    const now = new Date().getTime();
    const inactiveThreshold = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    return (now - lastActivity) < inactiveThreshold;
  };
  
  const toggleDropdown = (sessionId: string) => {
    if (dropdownOpen === sessionId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(sessionId);
    }
  };
  
  // Filter sessions based on search term and filter status
  const filteredSessions = activeSessions.filter(session => {
    const visitorIdMatch = session.visitor_id.toLowerCase().includes(searchTerm.toLowerCase());
    const visitorNameMatch = session.metadata?.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const labelMatch = session.metadata?.label?.text?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const noteMatch = session.metadata?.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    const searchMatches = visitorIdMatch || visitorNameMatch || labelMatch || noteMatch;
    
    if (filterStatus === 'recent') {
      const sessionDate = new Date(session.updated_at);
      const now = new Date();
      const diffInHours = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
      return searchMatches && diffInHours <= 24;
    } else if (filterStatus === 'pinned') {
      return searchMatches && session.metadata?.pinned === true;
    } else if (filterStatus === 'labeled') {
      return searchMatches && !!session.metadata?.label;
    }
    
    return searchMatches;
  });
  
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];
  
  // Render modals
  const renderRenameModal = () => {
    if (!showRenameModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Rename Visitor</h3>
          <input
            type="text"
            value={newVisitorName}
            onChange={(e) => setNewVisitorName(e.target.value)}
            placeholder="Enter visitor name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowRenameModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameVisitor}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderNoteModal = () => {
    if (!showNoteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Add Note</h3>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter note about this conversation"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowNoteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderLabelModal = () => {
    if (!showLabelModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Add Label</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Predefined Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLabelText(label.text);
                    setLabelColor(label.color);
                  }}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    borderWidth: 1,
                    borderColor: label.color
                  }}
                >
                  {label.text}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Text
            </label>
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="Enter label text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm font-mono">{labelColor}</span>
            </div>
          </div>
          
          <div className="mt-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview
            </label>
            <div className="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center"
              style={{
                backgroundColor: `${labelColor}20`,
                color: labelColor,
                borderWidth: 1,
                borderColor: labelColor
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {labelText || 'Label Preview'}
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowLabelModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLabel}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-7xl mx-auto">
      <Helmet>
        <title>Live Chat - ChatWidget Dashboard</title>
        <meta name="description" content="Manage your live chat conversations with visitors in real-time." />
      </Helmet>
      
      {renderRenameModal()}
      {renderNoteModal()}
      {renderLabelModal()}
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live Chat</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={toggleSelectMode}
            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
              selectMode 
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {selectMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel Selection
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select Mode
              </>
            )}
          </button>
          
          <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-300 px-3 py-1.5">
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
      
      {/* Mass action bar - only visible in select mode */}
      {selectMode && selectedSessions.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-indigo-700 font-medium">{selectedSessions.length} conversation{selectedSessions.length !== 1 ? 's' : ''} selected</span>
            <button 
              onClick={selectAllSessions}
              className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {selectedSessions.length === filteredSessions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleMassDelete}
              disabled={isClosing}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isClosing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Closing...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Close Selected
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-500">
            <h2 className="font-medium flex items-center text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Active Conversations
              <span className="ml-auto text-xs bg-white text-indigo-600 px-2 py-1 rounded-full font-bold">
                {activeSessions.length}
              </span>
            </h2>
          </div>
          
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
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
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filterStatus === 'all' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('recent')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filterStatus === 'recent' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Last 24h
                </button>
                <button
                  onClick={() => setFilterStatus('pinned')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filterStatus === 'pinned' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pinned
                </button>
                <button
                  onClick={() => setFilterStatus('labeled')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    filterStatus === 'labeled' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Labeled
                </button>
              </div>
              
              <button
                onClick={handleRefresh}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                title="Refresh conversations"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
            {activeSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium">No active conversations</p>
                <p className="text-xs mt-1">Conversations will appear here when visitors start chatting</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium">No matching conversations</p>
                <p className="text-xs mt-1">Try a different search term or filter</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isPinned = session.metadata?.pinned || false;
                const visitorName = session.metadata?.visitorName;
                const label = session.metadata?.label;
                const note = session.metadata?.note;
                const active = isSessionActive(session);
                
                return (
                  <div key={session.id} className="relative">
                    <div className="flex">
                      {selectMode && (
                        <div 
                          className="flex items-center justify-center pl-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSessionSelection(session.id);
                          }}
                        >
                          {selectedSessions.includes(session.id) ? (
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      )}
                      
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
                              {visitorName || `Visitor ${session.visitor_id.substring(0, 8)}`}
                              
                              {isPinned && (
                                <Pin className="h-3 w-3 ml-1 text-indigo-500" />
                              )}
                              
                              {active ? (
                                <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              ) : (
                                <span className="ml-2 inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                              )}
                            </div>
                            
                            {label && (
                              <div className="mt-1">
                                <span 
                                  className="px-2 py-0.5 text-xs rounded-full inline-flex items-center"
                                  style={{
                                    backgroundColor: `${label.color}20`,
                                    color: label.color,
                                    borderWidth: 1,
                                    borderColor: label.color
                                  }}
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {label.text}
                                </span>
                              </div>
                            )}
                            
                            {note && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <StickyNote className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[150px]">{note}</span>
                              </div>
                            )}
                            
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
                    </div>
                    
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
                            <>
                              <button
                                onClick={() => {
                                  setCurrentSession(session.id);
                                  setDropdownOpen(null);
                                  setShowRenameModal(true);
                                  setNewVisitorName(session.metadata?.visitorName || '');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4 mr-2 text-gray-500" />
                                Rename Visitor
                              </button>
                              
                              <button
                                onClick={() => {
                                  setCurrentSession(session.id);
                                  setDropdownOpen(null);
                                  setShowNoteModal(true);
                                  setNoteText(session.metadata?.note || '');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                              >
                                <StickyNote className="h-4 w-4 mr-2 text-gray-500" />
                                {session.metadata?.note ? 'Edit Note' : 'Add Note'}
                              </button>
                              
                              {session.metadata?.label ? (
                                <button
                                  onClick={() => removeLabel(session.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                                >
                                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                                  Remove Label
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCurrentSession(session.id);
                                    setDropdownOpen(null);
                                    setShowLabelModal(true);
                                    setLabelText('');
                                    setLabelColor('#4f46e5');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                                >
                                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                                  Add Label
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  togglePinSession(session.id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                              >
                                <Pin className="h-4 w-4 mr-2 text-gray-500" />
                                {isPinned ? 'Unpin Conversation' : 'Pin Conversation'}
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              <button
                                onClick={() => setShowDeleteConfirm(session.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-200"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Close Conversation
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          {!currentSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-indigo-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Select a conversation to start chatting</p>
              <p className="text-sm mt-2 text-center max-w-md text-gray-500">
                When you select a conversation, you'll be able to see the chat history and respond to the visitor.
              </p>
              
              {activeSessions.length === 0 && (
                <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 max-w-md">
                  <h3 className="text-sm font-medium text-indigo-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    No active conversations
                  </h3>
                  <p className="mt-1 text-xs text-indigo-700">
                    Conversations will appear here when visitors start chatting with your widget.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium flex items-center text-gray-800">
                      <span className="mr-2">
                        Chat with {currentSession.metadata?.visitorName || `Visitor ${currentSession.visitor_id.substring(0, 8)}`}
                      </span>
                      
                      {isSessionActive(currentSession) ? (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                          Inactive
                        </span>
                      )}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Started {format(new Date(currentSession.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      
                      {currentSession.metadata?.label && (
                        <span 
                          className="px-2 py-0.5 text-xs rounded-full inline-flex items-center"
                          style={{
                            backgroundColor: `${currentSession.metadata.label.color}20`,
                            color: currentSession.metadata.label.color,
                            borderWidth: 1,
                            borderColor: currentSession.metadata.label.color
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {currentSession.metadata.label.text}
                        </span>
                      )}
                      
                      {currentSession.metadata?.pinned && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full inline-flex items-center">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                    
                    {currentSession.metadata?.note && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-xs text-yellow-800 flex items-start">
                        <StickyNote className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{currentSession.metadata.note}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      <button
                        onClick={() => {
                          setShowRenameModal(true);
                          setNewVisitorName(currentSession.metadata?.visitorName || '');
                        }}
                        className="p-1.5 text-xs text-gray-600 border border-gray-200 rounded-l-md hover:bg-gray-50 transition-colors duration-200"
                        title="Rename visitor"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteModal(true);
                          setNoteText(currentSession.metadata?.note || '');
                        }}
                        className="p-1.5 text-xs text-gray-600 border-t border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        title="Add note"
                      >
                        <StickyNote className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (currentSession.metadata?.label) {
                            removeLabel(currentSession.id);
                          } else {
                            setShowLabelModal(true);
                            setLabelText('');
                            setLabelColor('#4f46e5');
                          }
                        }}
                        className="p-1.5 text-xs text-gray-600 border-t border-b border-r border-gray-200 rounded-r-md hover:bg-gray-50 transition-colors duration-200"
                        title={currentSession.metadata?.label ? "Remove label" : "Add label"}
                      >
                        <Tag className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => togglePinSession(currentSession.id)}
                      className={`p-1.5 text-xs border rounded-md transition-colors duration-200 ${
                        currentSession.metadata?.pinned
                          ? 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
                          : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                      title={currentSession.metadata?.pinned ? "Unpin conversation" : "Pin conversation"}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(currentSession.id)}
                      className="inline-flex items-center px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors duration-200"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Close Chat
                    </button>
                  </div>
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
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Messages will appear here when the visitor starts chatting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMessages.map((message, index) => {
                      // Check if this is the first message of the day or the first message overall
                      const showDateSeparator = index === 0 || (
                        index > 0 && 
                        new Date(message.created_at).toDateString() !== 
                        new Date(currentMessages[index - 1].created_at).toDateString()
                      );
                      
                      return (
                        <React.Fragment key={message.id}>
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-gray-200 h-px flex-grow"></div>
                              <span className="px-2 text-xs text-gray-500 font-medium">
                                {format(new Date(message.created_at), 'MMMM d, yyyy')}
                              </span>
                              <div className="bg-gray-200 h-px flex-grow"></div>
                            </div>
                          )}
                          
                          <div
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
                                    {currentSession.metadata?.visitorName || 'Visitor'}
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
                              <div 
                                className="whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: message.message }}
                              />
                              <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(message.created_at), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
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
                {!isSessionActive(currentSession) && (
                  <div className="bg-yellow-50 rounded-md p-3 mb-3 flex items-center justify-center text-yellow-700">
                    <AlertOctagon className="h-4 w-4 mr-2" />
                    <span className="text-sm">This visitor appears to be inactive. They may not respond immediately.</span>
                  </div>
                )}
                
                {!agentMode ? (
                  <div className="bg-gray-100 rounded-md p-3 mb-3 flex items-center justify-center text-gray-600">
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="text-sm">Agent mode is disabled. Enable it to send messages.</span>
                  </div>
                ) : null}
                
                <form onSubmit={handleSendMessage} className="flex">
                  <div className="relative flex-1">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={agentMode ? "Type your message..." : "Enable agent mode to send messages"}
                      disabled={isSending || !agentMode}
                      className="w-full px-4 py-3 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                    />
                    {newMessage.length > 0 && (
                      <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                        {newMessage.length} characters
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim() || !agentMode}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200"
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
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    {agentMode ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Agent mode active
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Agent mode inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last updated: {formatTimeDifference(currentSession.updated_at)}</span>
                  </div>
                </div>
                
                {agentMode && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>HTML formatting is supported (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;a href="..."&gt;link&lt;/a&gt;)</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;