import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ChatMessage, ChatSession } from '../types';
import { nanoid } from 'nanoid';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  closeSession: (sessionId: string) => Promise<void>;
  updateSessionMetadata: (sessionId: string, metadata: Record<string, any>) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeSessions: [],
      currentSession: null,
      messages: {},
      agentMode: true, // Set default to true
      
      fetchSessions: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('updated_at', { ascending: false });
          
          if (error) throw error;
          
          set({ activeSessions: data as ChatSession[] });
          
          // If we have a current session, make sure it's still in the active sessions
          const currentSession = get().currentSession;
          if (currentSession) {
            const stillActive = data.some(session => session.id === currentSession.id);
            if (!stillActive) {
              set({ currentSession: null });
            } else {
              // Update the current session with the latest data
              const updatedSession = data.find(session => session.id === currentSession.id);
              if (updatedSession) {
                set({ currentSession: updatedSession as ChatSession });
              }
            }
          }
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
              metadata: {}
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
        if (!sessionId) {
          set({ currentSession: null });
          return;
        }
        
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
          // First update the session's updated_at timestamp
          await supabase
            .from('chat_sessions')
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
          
          // Then insert the new message
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
          
          return;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },
      
      toggleAgentMode: () => {
        set({ agentMode: !get().agentMode });
      },
      
      closeSession: async (sessionId: string) => {
        try {
          // Update the session status to 'closed'
          const { error } = await supabase
            .from('chat_sessions')
            .update({
              status: 'closed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
          
          if (error) throw error;
          
          // Remove the session from active sessions
          set({
            activeSessions: get().activeSessions.filter(session => session.id !== sessionId)
          });
          
          // If this was the current session, clear it
          if (get().currentSession?.id === sessionId) {
            set({ currentSession: null });
          }
          
          return;
        } catch (error) {
          console.error('Error closing chat session:', error);
          throw error;
        }
      },
      
      updateSessionMetadata: async (sessionId: string, metadata: Record<string, any>) => {
        try {
          // Update the session metadata
          const { error } = await supabase
            .from('chat_sessions')
            .update({
              metadata,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
          
          if (error) throw error;
          
          // Update the session in the local state
          set({
            activeSessions: get().activeSessions.map(session => 
              session.id === sessionId 
                ? { ...session, metadata, updated_at: new Date().toISOString() } 
                : session
            )
          });
          
          // If this is the current session, update it too
          if (get().currentSession?.id === sessionId) {
            set({ 
              currentSession: { 
                ...get().currentSession!, 
                metadata,
                updated_at: new Date().toISOString()
              } 
            });
          }
          
          return;
        } catch (error) {
          console.error('Error updating session metadata:', error);
          throw error;
        }
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentSession: state.currentSession,
        agentMode: state.agentMode
      }),
    }
  )
);