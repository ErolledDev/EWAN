import React, { useEffect, useState } from 'react';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';

const AiMode: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useWidgetStore();
  
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gpt-3.5-turbo');
  const [aiContext, setAiContext] = useState('');
  
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
    
    await updateSettings({
      ai_mode_enabled: aiEnabled,
      ai_api_key: apiKey,
      ai_model: aiModel,
      ai_context: aiContext,
    });
  };
  
  if (!settings) {
    return <div className="p-6">Loading settings...</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Mode</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center">
          <div className="form-control">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Enable AI Mode</span>
            </label>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                AI Mode will only be used if no matching keywords are found in Auto Reply or Advanced Reply.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            AI API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Your API key is stored securely and never shared.
          </p>
        </div>
        
        <div>
          <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700">
            AI Model
          </label>
          <select
            id="aiModel"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="aiContext" className="block text-sm font-medium text-gray-700">
            Business Context Information
          </label>
          <textarea
            id="aiContext"
            value={aiContext}
            onChange={(e) => setAiContext(e.target.value)}
            rows={8}
            placeholder="Provide information about your business, products, services, pricing, etc. This context will help the AI generate more accurate and helpful responses."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            This information will be used to guide the AI in generating responses relevant to your business.
          </p>
        </div>
        
        <div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save AI Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMode;