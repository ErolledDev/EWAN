import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { format } from 'date-fns';
import { MessageCircle, Send, Search, X, Pin, Tag, AlertCircle, ChevronDown, MoreVertical, Edit, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const LiveChat: React.FC = () => {
  // ... existing state and hooks ...

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
        {/* ... existing sessions list header ... */}
        
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No active chats</p>
              <p className="text-sm mt-1">Wait for visitors to start chatting</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`relative p-4 cursor-pointer hover:bg-gray-50 ${
                    currentSession?.id === session.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  {session.metadata?.pinned && (
                    <Pin className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />
                  )}
                  
                  <div className="flex items-start">
                    <div className={`relative h-10 w-10 rounded-full flex items-center justify-center ${
                      session.metadata?.unread ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    } font-medium`}>
                      {session.metadata?.visitorName 
                        ? session.metadata.visitorName.charAt(0).toUpperCase()
                        : session.visitor_id.charAt(0).toUpperCase()
                      }
                      {session.metadata?.unread && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        session.metadata?.unread ? 'text-blue-900' : 'text-gray-900'
                      } truncate`}>
                        {session.metadata?.visitorName || `Visitor ${session.visitor_id.slice(0, 8)}`}
                      </p>
                      
                      {session.latest_message && (
                        <p className={`mt-1 text-sm truncate ${
                          session.metadata?.unread ? 'text-gray-900 font-semibold' : 'text-gray-500'
                        }`}>
                          {session.latest_message.message}
                        </p>
                      )}
                      
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
                </div>
              ))}
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
            {/* ... existing chat header ... */}
            
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
                  {messages[currentSession.id]?.map((message, msgIndex) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'user' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div className={`relative max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender_type === 'user'
                          ? 'bg-white text-gray-900'
                          : message.sender_type === 'agent'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      } ${msgIndex > 0 ? 'mt-1' : ''}`}>
                        {message.metadata?.unread && (
                          <span className="absolute -top-2 -right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                        <div className={`text-sm ${message.metadata?.unread ? 'font-semibold' : ''}`}>
                          {message.message}
                        </div>
                        <p className="text-xs mt-1 opacity-75">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mt-2">
                  <div className="bg-gray-100 rounded-full px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
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