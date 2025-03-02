import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WidgetSettings from './components/Dashboard/WidgetSettings';
import AutoReply from './components/Dashboard/AutoReply';
import AdvancedReply from './components/Dashboard/AdvancedReply';
import AiMode from './components/Dashboard/AiMode';
import LiveChat from './components/Dashboard/LiveChat';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { getUser } = useAuthStore();
  
  useEffect(() => {
    getUser();
  }, [getUser]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/widget-settings" replace />} />
          <Route path="widget-settings" element={<WidgetSettings />} />
          <Route path="auto-reply" element={<AutoReply />} />
          <Route path="advanced-reply" element={<AdvancedReply />} />
          <Route path="ai-mode" element={<AiMode />} />
          <Route path="live-chat" element={<LiveChat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;