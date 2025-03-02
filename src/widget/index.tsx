import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget';

interface BusinessChatPluginOptions {
  uid: string;
}

class BusinessChatPlugin {
  constructor(options: BusinessChatPluginOptions) {
    // Create container element
    const container = document.createElement('div');
    container.id = 'business-chat-widget';
    document.body.appendChild(container);
    
    // Create and inject styles
    this.injectStyles();
    
    // Render the widget
    const root = createRoot(container);
    root.render(<ChatWidget uid={options.uid} />);
  }
  
  injectStyles() {
    // Create a style element for Tailwind's utility classes
    const style = document.createElement('style');
    style.textContent = `
      /* Base Tailwind utilities needed for the widget */
      .fixed { position: fixed; }
      .absolute { position: absolute; }
      .relative { position: relative; }
      .bottom-4 { bottom: 1rem; }
      .right-4 { right: 1rem; }
      .z-50 { z-index: 50; }
      .flex { display: flex; }
      .inline-flex { display: inline-flex; }
      .hidden { display: none; }
      .h-14 { height: 3.5rem; }
      .w-14 { width: 3.5rem; }
      .h-6 { height: 1.5rem; }
      .w-6 { width: 1.5rem; }
      .h-5 { height: 1.25rem; }
      .w-5 { width: 1.25rem; }
      .h-4 { height: 1rem; }
      .w-4 { width: 1rem; }
      .max-h-\\[80vh\\] { max-height: 80vh; }
      .max-h-\\[50vh\\] { max-height: 50vh; }
      .max-w-\\[80\\%\\] { max-width: 80%; }
      .w-80 { width: 20rem; }
      .flex-1 { flex: 1 1 0%; }
      .flex-col { flex-direction: column; }
      .items-end { align-items: flex-end; }
      .items-center { align-items: center; }
      .justify-end { justify-content: flex-end; }
      .justify-start { justify-content: flex-start; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
      .overflow-hidden { overflow: hidden; }
      .overflow-y-auto { overflow-y: auto; }
      .rounded-full { border-radius: 9999px; }
      .rounded-lg { border-radius: 0.5rem; }
      .rounded-md { border-radius: 0.375rem; }
      .rounded-l-md { border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; }
      .rounded-r-md { border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }
      .border { border-width: 1px; }
      .border-t { border-top-width: 1px; }
      .border-gray-200 { border-color: rgb(229 231 235); }
      .border-gray-300 { border-color: rgb(209 213 219); }
      .border-transparent { border-color: transparent; }
      .bg-white { background-color: rgb(255 255 255); }
      .bg-blue-100 { background-color: rgb(219 234 254); }
      .bg-gray-100 { background-color: rgb(243 244 246); }
      .bg-green-100 { background-color: rgb(220 252 231); }
      .p-4 { padding: 1rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      .pt-4 { padding-top: 1rem; }
      .pb-4 { padding-bottom: 1rem; }
      .text-center { text-align: center; }
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .font-medium { font-weight: 500; }
      .text-white { color: rgb(255 255 255); }
      .text-gray-500 { color: rgb(107 114 128); }
      .text-gray-800 { color: rgb(31 41 55); }
      .text-blue-600 { color: rgb(37 99 235); }
      .text-blue-800 { color: rgb(30 64 175); }
      .text-green-800 { color: rgb(22 101 52); }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
      .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
      .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
      .focus\\:ring-1:focus { box-shadow: 0 0 0 1px; }
      .focus\\:ring-indigo-500:focus { box-shadow: 0 0 0 1px rgb(99 102 241); }
      .focus\\:border-indigo-500:focus { border-color: rgb(99 102 241); }
      .hover\\:underline:hover { text-decoration: underline; }
      .mt-1 { margin-top: 0.25rem; }
      .mt-4 { margin-top: 1rem; }
      .mb-1 { margin-bottom: 0.25rem; }
      .ml-3 { margin-left: 0.75rem; }
      .opacity-70 { opacity: 0.7; }
      
      @media (min-width: 640px) {
        .sm\\:w-96 { width: 24rem; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Make it available globally
(window as any).BusinessChatPlugin = BusinessChatPlugin;

export default BusinessChatPlugin;