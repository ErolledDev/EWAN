import React, { useEffect, useState } from 'react';
import { useWidgetStore } from '../../store/widgetStore';
import { useAuthStore } from '../../store/authStore';
import { AutoReply as AutoReplyType } from '../../types';
import { Plus, Trash, Upload, Download, Edit, Search, AlertCircle } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchAutoReplies(user.id);
    }
  }, [user, fetchAutoReplies]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
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
      setShowForm(false);
    } catch (error) {
      console.error('Error saving auto reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (reply: AutoReplyType) => {
    setKeywords(reply.keywords.join(', '));
    setMatchingType(reply.matching_type);
    setResponse(reply.response);
    setEditingId(reply.id);
    setShowForm(true);
  };
  
  const handleCancel = () => {
    setKeywords('');
    setMatchingType('word_match');
    setResponse('');
    setEditingId(null);
    setShowForm(false);
  };
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteAutoReply(id);
    } catch (error) {
      console.error('Error deleting auto reply:', error);
    } finally {
      setIsDeleting(null);
    }
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
  
  // Filter auto replies based on search term
  const filteredReplies = autoReplies.filter(reply => {
    const keywordsString = reply.keywords.join(' ').toLowerCase();
    const responseText = reply.response.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return keywordsString.includes(searchLower) || responseText.includes(searchLower);
  });
  
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
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Hide Form' : 'Add New Reply'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
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
                disabled={isSubmitting}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
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
                disabled={isSubmitting}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
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
                disabled={isSubmitting}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>{editingId ? 'Update' : 'Add'}</>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Auto Replies</h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search replies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        {autoReplies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-medium">No auto replies yet</p>
            <p className="mt-1">Add your first auto reply to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Auto Reply
            </button>
          </div>
        ) : filteredReplies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-medium">No matching results</p>
            <p className="mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keywords
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matching Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReplies.map((reply) => (
                  <tr key={reply.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reply.keywords.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {reply.matching_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {reply.response}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(reply)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-4 w-4 inline" />
                        <span className="ml-1">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(reply.id)}
                        disabled={isDeleting === reply.id}
                        className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                      >
                        {isDeleting === reply.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 inline text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash className="h-4 w-4 inline" />
                            <span className="ml-1">Delete</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoReply;