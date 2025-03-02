import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';
import WidgetPreview from '../../widget/WidgetPreview';

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
      const code = `<script src="https://widget-chat-ai.netlify.app/widget/chat.umd.js"></script>

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
    }
  };
  
  const copyInstallCode = () => {
    navigator.clipboard.writeText(installCode);
    alert('Installation code copied to clipboard!');
  };
  
  if (!settings) {
    return <div className="p-6">Loading settings...</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Widget Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div className="mt-1 flex items-center">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-10 h-10 rounded-md border border-gray-300 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="ml-3">{primaryColor}</span>
            </div>
            
            {showColorPicker && (
              <div className="mt-2">
                <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="salesRepresentative" className="block text-sm font-medium text-gray-700">
              Sales Representative Name
            </label>
            <input
              id="salesRepresentative"
              type="text"
              value={salesRepresentative}
              onChange={(e) => setSalesRepresentative(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
              Welcome Message
            </label>
            <textarea
              id="welcomeMessage"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="fallbackMessage" className="block text-sm font-medium text-gray-700">
              Fallback Message (when no match is found)
            </label>
            <textarea
              id="fallbackMessage"
              value={fallbackMessage}
              onChange={(e) => setFallbackMessage(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
            
            {saveStatus && (
              <span className={`ml-3 text-sm ${saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveStatus}
              </span>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Installation Code</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add this code to your website to install the chat widget:
            </p>
            <div className="bg-gray-800 text-gray-200 p-3 rounded-md overflow-x-auto">
              <pre className="text-sm">{installCode}</pre>
            </div>
            <button
              onClick={copyInstallCode}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy Code
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">Widget Preview</h2>
          {user && <WidgetPreview userId={user.id} />}
        </div>
      </div>
    </div>
  );
};

export default WidgetSettings;