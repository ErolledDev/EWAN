import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget';
import '../index.css';

interface BusinessChatPluginOptions {
  uid: string;
}

class BusinessChatPlugin {
  constructor(options: BusinessChatPluginOptions) {
    // Create container element
    const container = document.createElement('div');
    container.id = 'business-chat-widget';
    document.body.appendChild(container);
    
    // Render the widget
    const root = createRoot(container);
    root.render(<ChatWidget uid={options.uid} />);
  }
}

// Make it available globally
(window as any).BusinessChatPlugin = BusinessChatPlugin;

export default BusinessChatPlugin;