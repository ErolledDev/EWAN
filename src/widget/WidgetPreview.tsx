import React, { useEffect, useState } from 'react';
import ChatWidget from './ChatWidget';
import { useWidgetStore } from '../store/widgetStore';

interface WidgetPreviewProps {
  userId: string;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ userId }) => {
  const { settings } = useWidgetStore();
  const [previewUrl, setPreviewUrl] = useState('');
  
  useEffect(() => {
    // Create a mock website URL for the preview
    setPreviewUrl(`https://example.com/${userId}`);
  }, [userId]);
  
  return (
    <div className="relative min-h-[400px] border border-gray-200 rounded-lg bg-gray-50 p-4 overflow-hidden">
      <div className="absolute bottom-4 right-4">
        <ChatWidget uid={userId} />
      </div>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center text-gray-500 mb-4">
          <p className="font-medium">Widget Preview</p>
          <p className="text-sm">This is how your chat widget will appear on your website</p>
        </div>
        
        {settings && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
            <h3 className="font-medium mb-2">Current Settings</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li><span className="font-medium">Business Name:</span> {settings.business_name}</li>
              <li><span className="font-medium">Sales Rep:</span> {settings.sales_representative}</li>
              <li>
                <span className="font-medium">Primary Color:</span> 
                <span className="inline-block w-4 h-4 ml-2 rounded-sm" style={{ backgroundColor: settings.primary_color }}></span>
                {settings.primary_color}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetPreview;