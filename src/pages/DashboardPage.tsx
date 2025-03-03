import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../components/Dashboard/Navigation';
import { Menu } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const DashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Get the current page title based on the path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'widget-settings':
        return 'Widget Settings';
      case 'auto-reply':
        return 'Auto Reply';
      case 'advanced-reply':
        return 'Advanced Reply';
      case 'ai-mode':
        return 'AI Mode';
      case 'live-chat':
        return 'Live Chat';
      default:
        return 'Dashboard';
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - ChatWidget Dashboard</title>
        <meta name="description" content={`Manage your ${getPageTitle().toLowerCase()} for your chat widget.`} />
      </Helmet>
      
      <div className="flex h-screen bg-gray-50">
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transform fixed md:relative z-10 transition-transform duration-300 ease-in-out md:translate-x-0 h-full`}
        >
          <Navigation />
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main content - Fixed the margin issue here */}
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;