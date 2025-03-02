import React, { useEffect, useState } from 'react';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';
import { AutoReply as AutoReplyType } from '../../types';
import { Plus, Trash, Upload, Download } from 'lucide-react';

const AutoReply: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    autoReplies, 
    fetchAutoReplies, 
    addAutoReply, 
    updateAutoReply, 
    deleteAutoReply,
    importAutoReplies,
    exportAutoReplies
  } = useWidgetStore();
  
  const [keywords, setKeywords] = useState('');
  const [matchingType, setMatchingType] = useState<'word_match' | 'fuzzy_match' | 'regex' | 'synonym_match'>('word_match');
  const [response, setResponse] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchAutoReplies(user.id);
    }
  }, [user, fetchAutoReplies]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    
    if (editingId) {
      await updateAutoReply(editingId, {
        keywords: keywordArray,
        matching_type: matchingType,
        response,
      });
      setEditingId(null);
    } else {
      await addAutoReply({
        user_id: user.id,
        keywords: keywordArray,
        matching_type: matchingType,
        response,
      });
    }
    
    // Reset form
    setKeywords('');
    setMatchingType('word_match');
    setResponse('');
  };
  
  const handleEdit = (reply: AutoReplyType) => {
    setKeywords(reply.keywords.join(', '));
    setMatchingType(reply.matching_type);
    setResponse(reply.response);
    setEditingId(reply.id);
  };
  
  const handleCancel = () => {
    setKeywords('');
    setMatchingType('word_match');
    setResponse('');
    setEditingId(null);
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          const formattedData = data.map(item => ({
            ...item,
            user_id: user.id,
          }));
          
          await importAutoReplies(formattedData);
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    // Reset the input
    e.target.value = '';
  };
  
  const handleExport = () => {
    const data = exportAutoReplies();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-replies.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auto Reply</h1>
        
        <div className="flex space-x-2">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">
            {editingId ? 'Edit Auto Reply' : 'Add New Auto Reply'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords (comma separated)
              </label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="hello, hi, hey"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="matchingType" className="block text-sm font-medium text-gray-700">
                Matching Type
              </label>
              <select
                id="matchingType"
                value={matchingType}
                onChange={(e) => setMatchingType(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="word_match">Word Match</option>
                <option value="fuzzy_match">Fuzzy Match</option>
                <option value="regex">Regular Expression</option>
                <option value="synonym_match">Synonym Match</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                Response
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">Auto Replies</h2>
          
          {autoReplies.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-gray-500">
              No auto replies yet. Add your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {autoReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        Keywords: {reply.keywords.join(', ')}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Matching: {reply.matching_type.replace('_', ' ')}
                      </div>
                      <div className="mt-2 text-gray-700">
                        {reply.response}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(reply)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAutoReply(reply.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoReply;