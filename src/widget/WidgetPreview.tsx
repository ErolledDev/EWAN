import React from 'react';
import ChatWidget from './ChatWidget';

interface WidgetPreviewProps {
  userId: string;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ userId }) => {
  return (
    <div className="relative min-h-[400px] border border-gray-200 rounded-lg bg-gray-50 p-4">
      <div className="absolute bottom-4 right-4">
        <ChatWidget uid={userId} />
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>Widget Preview</p>
          <p className="text-sm">This is how your chat widget will appear on your website</p>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;