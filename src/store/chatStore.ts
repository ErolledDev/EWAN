import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ChatMessage, ChatSession } from '../types';
import { nanoid } from 'nanoid';

interface ChatState {
  activeSessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Record<string, ChatMessage[]>;
  agentMode: boolean;
  
  fetchSessions: (userId: string) => Promise<void>;
  createSession: (userId: string) => Promise<ChatSession>;
  setCurrentSession: (sessionId: string) => void;
  
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, message: string, senderType: 'user' | 'bot' | 'agent') => Promise<void>;
  
  toggleAgentMode: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeSessions: [],
  currentSession: null,
  messages: {},
  agentMode: false,
  
  fetchSessions: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (error) throw error;
      
      set({ activeSessions: data as ChatSession[] });
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  },
  
  createSession: async (userId: string) => {
    try {
      const visitorId = nanoid();
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          visitor_id: visitorId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSession = data as ChatSession;
      set({ 
        activeSessions: [...get().activeSessions, newSession],
        currentSession: newSession,
        messages: { ...get().messages, [newSession.id]: [] }
      });
      
      return newSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },
  
  setCurrentSession: (sessionId: string) => {
    const session = get().activeSessions.find(s => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },
  
  fetchMessages: async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      set({ 
        messages: { 
          ...get().messages, 
          [sessionId]: data as ChatMessage[] 
        } 
      });
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  },
  
  sendMessage: async (sessionId: string, message: string, senderType: 'user' | 'bot' | 'agent') => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: sessionId,
          sender_type: senderType,
          message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newMessage = data as ChatMessage;
      const currentMessages = get().messages[sessionId] || [];
      
      set({
        messages: {
          ...get().messages,
          [sessionId]: [...currentMessages, newMessage]
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  
  toggleAgentMode: () => {
    set({ agentMode: !get().agentMode });
  },
}));