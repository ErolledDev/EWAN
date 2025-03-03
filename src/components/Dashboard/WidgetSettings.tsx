import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';
import { Copy, Check, Settings, MessageSquare, Palette, User, AlertTriangle } from 'lucide-react';

const WidgetSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useWidgetStore();
  
  const [businessName, setBusinessName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [salesRepresentative, setSalesRepresentative] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [installCode, setInstallCode] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchSettings(user.id);
    }
  }, [user, fetchSettings]);
  
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name);
      setPrimaryColor(settings.primary_color);
      setWelcomeMessage(settings.welcome_message);
      setSalesRepresentative(settings.sales_representative);
      setFallbackMessage(settings.fallback_message);
    }
  }, [settings]);
  
  useEffect(() => {
    if (user) {
      const code = `<script src="https://widget-chat-ai.netlify.app/widget/chat.js"></script>

<script>
  new BusinessChatPlugin({
    uid: '${user.id}'
  });
</script>`;
      
      setInstallCode(code);
    }
  }, [user]);
  
  const handleSave = async () => {
    if (!user || !settings) return;
    
    setIsSaving(true);
    setSaveStatus('Saving...');
    
    try {
      await updateSettings({
        business_name: businessName,
        primary_color: primaryColor,
        welcome_message: welcomeMessage,
        sales_representative: salesRepresentative,
        fallback_message: fallbackMessage,
      });
      
      setSaveStatus('Settings saved successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const copyInstallCode = () => {
    navigator.clipboard.writeText(installCode);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Widget Settings</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="mr-3 bg-indigo-100 p-2 rounded-full">
              <Settings className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-1">
                <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
              </div>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isSaving}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <label htmlFor="salesRepresentative" className="block text-sm font-medium text-gray-700">
                  Sales Representative Name
                </label>
              </div>
              <input
                id="salesRepresentative"
                type="text"
                value={salesRepresentative}
                onChange={(e) => setSalesRepresentative(e.target.value)}
                disabled={isSaving}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center mb-1">
                <Palette className="h-4 w-4 text-gray-500 mr-2" />
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
              </div>
              <div className="mt-1 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  disabled={isSaving}
                  className="w-10 h-10 rounded-md border border-gray-300 shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Select color"
                />
                <span className="ml-3 font-mono text-sm">{primaryColor}</span>
              </div>
              
              {showColorPicker && (
                <div className="mt-2 relative z-10">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)}
                  ></div>
                  <div className="relative">
                    <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="mr-3 bg-indigo-100 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium">Message Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                disabled={isSaving}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                This message will be shown when a visitor opens the chat widget for the first time.
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
                <label htmlFor="fallbackMessage" className="block text-sm font-medium text-gray-700">
                  Fallback Message (when no match is found)
                </label>
              </div>
              <textarea
                id="fallbackMessage"
                value={fallbackMessage}
                onChange={(e) => setFallbackMessage(e.target.value)}
                rows={3}
                disabled={isSaving}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                This message will be shown when no auto-reply or advanced reply matches the visitor's message.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Installation Code</h3>
          <p className="text-sm text-gray-600 mb-3">
            Add this code to your website to install the chat widget:
          </p>
          <div className="bg-gray-800 text-gray-200 p-3 rounded-md overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">{installCode}</pre>
          </div>
          <button
            onClick={copyInstallCode}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </>
            )}
          </button>
        </div>
        
        {saveStatus && (
          <div className={`p-4 rounded-md ${saveStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {saveStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetSettings;