import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, MessageSquare, Zap, Bot, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navigation: React.FC = () => {
  const { signOut } = useAuthStore();
  
  return (
    <div className="bg-white border-r border-gray-200 w-64 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Chat Widget</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
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
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navigation;