import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import LoginForm from '../components/Auth/LoginForm';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center text-indigo-600 mb-4">
                <MessageCircle className="h-8 w-8 mr-2" />
                <h1 className="text-3xl font-bold">ChatWidget</h1>
              </div>
              
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Engage with your visitors in real-time
              </h2>
              
              <p className="mt-5 text-xl text-gray-500">
                Add a powerful chat widget to your website with auto-replies, advanced responses, AI-powered conversations, and live agent support.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Auto Reply</strong> - Set up keyword-based responses to common questions
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Advanced Reply</strong> - Create rich responses with HTML and clickable links
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">AI Mode</strong> - Let AI handle complex queries with context about your business
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">
                    <strong className="font-medium text-gray-900">Live Chat</strong> - Jump in and chat directly with your visitors when needed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;