import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Dashboard/Navigation';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;