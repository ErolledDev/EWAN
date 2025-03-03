import React, { useEffect, useState } from 'react';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, Bot, Key, Cpu, FileText } from 'lucide-react';

const AiMode: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useWidgetStore();
  
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gpt-3.5-turbo');
  const [aiContext, setAiContext] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchSettings(user.id);
    }
  }, [user, fetchSettings]);
  
  useEffect(() => {
    if (settings) {
      setAiEnabled(settings.ai_mode_enabled);
      setApiKey(settings.ai_api_key || '');
      setAiModel(settings.ai_model || 'gpt-3.5-turbo');
      setAiContext(settings.ai_context || '');
    }
  }, [settings]);
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      await updateSettings({
        ai_mode_enabled: aiEnabled,
        ai_api_key: apiKey,
        ai_model: aiModel,
        ai_context: aiContext,
      });
      
      setSaveStatus({
        type: 'success',
        message: 'AI settings saved successfully!'
      });
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save AI settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Mode</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-3xl">
        <div className="flex items-center mb-6">
          <div className="mr-4 bg-indigo-100 p-3 rounded-full">
            <Bot className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium">AI-Powered Responses</h2>
            <p className="text-gray-500">Enable AI to handle complex queries when no matching keywords are found</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="form-control">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable AI Mode</span>
              </label>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-700">
                  AI Mode will only be used if no matching keywords are found in Auto Reply or Advanced Reply.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Key className="h-4 w-4 text-gray-500 mr-2" />
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    AI API Key
                  </label>
                </div>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  disabled={!aiEnabled || isSaving}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your API key is stored securely and never shared.
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Cpu className="h-4 w-4 text-gray-500 mr-2" />
                  <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700">
                    AI Model
                  </label>
                </div>
                <select
                  id="aiModel"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  disabled={!aiEnabled || isSaving}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <label htmlFor="aiContext" className="block text-sm font-medium text-gray-700">
                    Business Context Information
                  </label>
                </div>
                <textarea
                  id="aiContext"
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  rows={8}
                  placeholder="Provide information about your business, products, services, pricing, etc. This context will help the AI generate more accurate and helpful responses."
                  disabled={!aiEnabled || isSaving}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This information will be used to guide the AI in generating responses relevant to your business.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {saveStatus && (
                <div className={`text-sm ${saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {saveStatus.message}
                </div>
              )}
            </div>
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
                'Save AI Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiMode;