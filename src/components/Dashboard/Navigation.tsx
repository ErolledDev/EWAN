import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, MessageSquare, Zap, Bot, LogOut, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navigation: React.FC = () => {
  const { signOut, user } = useAuthStore();
  const location = useLocation();
  
  return (
    <div className="bg-white border-r border-gray-200 w-64 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
        <h1 className="text-xl font-bold">Chat Widget</h1>
      </div>
      
      {user && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Account</p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/dashboard/widget-settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          Widget Settings
        </NavLink>
        
        <NavLink
          to="/dashboard/auto-reply"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <MessageSquare className="mr-3 h-5 w-5" />
          Auto Reply
        </NavLink>
        
        <NavLink
          to="/dashboard/advanced-reply"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Zap className="mr-3 h-5 w-5" />
          Advanced Reply
        </NavLink>
        
        <NavLink
          to="/dashboard/ai-mode"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Bot className="mr-3 h-5 w-5" />
          AI Mode
        </NavLink>

        <NavLink
          to="/dashboard/live-chat"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <MessageCircle className="mr-3 h-5 w-5" />
          Live Chat
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 w-full"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navigation;