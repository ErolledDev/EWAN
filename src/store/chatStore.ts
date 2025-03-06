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
  markSessionAsRead: (sessionId: string) => Promise<void>;
  updateSession: (session: ChatSession) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeSessions: [],
      currentSession: null,
      messages: {},
      agentMode: true,
      
      fetchSessions: async (userId: string) => {
        try {
          // First get all active sessions
          const { data: sessions, error: sessionsError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');
          
          if (sessionsError) throw sessionsError;
          
          // Then get the latest message for each session
          const processedSessions = await Promise.all(sessions.map(async (session) => {
            const { data: messages, error: messagesError } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('chat_session_id', session.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (messagesError) throw messagesError;
            
            const latestMessage = messages?.[0];
            return {
              ...session,
              latest_message: latestMessage ? {
                message: latestMessage.message,
                created_at: latestMessage.created_at,
                sender_type: latestMessage.sender_type
              } : null
            };
          }));

          // Sort sessions: pinned first, then by latest message date
          const sortedSessions = processedSessions.sort((a, b) => {
            // First sort by pinned status
            if (a.metadata?.pinned && !b.metadata?.pinned) return -1;
            if (!a.metadata?.pinned && b.metadata?.pinned) return 1;
            
            // Then sort by latest message date
            const aDate = a.latest_message?.created_at || a.updated_at;
            const bDate = b.latest_message?.created_at || b.updated_at;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
          
          set({ activeSessions: sortedSessions });
          
          // Update current session if needed
          const currentSession = get().currentSession;
          if (currentSession) {
            const updatedSession = sortedSessions.find(s => s.id === currentSession.id);
            if (updatedSession) {
              set({ currentSession: updatedSession });
            } else {
              set({ currentSession: null });
            }
          }

          // Set up real-time subscriptions
          sortedSessions.forEach(session => {
            supabase
              .channel(`messages:${session.id}`)
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'chat_messages',
                  filter: `chat_session_id=eq.${session.id}`
                },
                async (payload) => {
                  const newMessage = payload.new as ChatMessage;
                  get().addMessage(session.id, newMessage);
                  
                  // Update session's latest message
                  const updatedSession = {
                    ...session,
                    latest_message: {
                      message: newMessage.message,
                      created_at: newMessage.created_at,
                      sender_type: newMessage.sender_type
                    }
                  };
                  
                  // If this is not the current session, mark it as unread
                  if (!get().currentSession || get().currentSession.id !== session.id) {
                    updatedSession.metadata = {
                      ...updatedSession.metadata,
                      unread: true
                    };
                  }
                  
                  get().updateSession(updatedSession);
                }
              )
              .subscribe();
          });

          // Subscribe to new sessions
          supabase
            .channel('new_sessions')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_sessions',
                filter: `user_id=eq.${userId} AND status=eq.active`
              },
              () => {
                // Refetch sessions when a new one is created
                get().fetchSessions(userId);
              }
            )
            .subscribe();
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
            activeSessions: [newSession, ...get().activeSessions],
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
          // Mark session as read when selected
          if (session.metadata?.unread) {
            get().markSessionAsRead(sessionId);
          }
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
          
          // Update session's latest message
          const session = get().activeSessions.find(s => s.id === sessionId);
          if (session) {
            get().updateSession({
              ...session,
              latest_message: {
                message: newMessage.message,
                created_at: newMessage.created_at,
                sender_type: newMessage.sender_type
              }
            });
          }
          
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
            activeSessions: get().activeSessions.filter(session => session.id !== sessionId),
            messages: Object.fromEntries(
              Object.entries(get().messages).filter(([key]) => key !== sessionId)
            )
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
          const session = get().activeSessions.find(s => s.id === sessionId);
          if (session) {
            const updatedSession = {
              ...session,
              metadata,
              updated_at: new Date().toISOString()
            };
            
            get().updateSession(updatedSession);
            
            // If this is the current session, update it too
            if (get().currentSession?.id === sessionId) {
              set({ currentSession: updatedSession });
            }
          }
          
          return;
        } catch (error) {
          console.error('Error updating session metadata:', error);
          throw error;
        }
      },
      
      markSessionAsRead: async (sessionId: string) => {
        try {
          const session = get().activeSessions.find(s => s.id === sessionId);
          if (!session || !session.metadata?.unread) return;
          
          const { unread, ...restMetadata } = session.metadata;
          
          // Update the session metadata
          const { error } = await supabase
            .from('chat_sessions')
            .update({
              metadata: restMetadata,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
          
          if (error) throw error;
          
          // Update the session in the local state
          const updatedSession = {
            ...session,
            metadata: restMetadata
          };
          
          get().updateSession(updatedSession);
          
          // If this is the current session, update it too
          if (get().currentSession?.id === sessionId) {
            set({ currentSession: updatedSession });
          }
        } catch (error) {
          console.error('Error marking session as read:', error);
        }
      },

      updateSession: (session: ChatSession) => {
        set({
          activeSessions: get().activeSessions.map(s => 
            s.id === session.id ? session : s
          ).sort((a, b) => {
            // Keep pinned chats at the top
            if (a.metadata?.pinned && !b.metadata?.pinned) return -1;
            if (!a.metadata?.pinned && b.metadata?.pinned) return 1;
            
            // Sort by latest message date
            const aDate = a.latest_message?.created_at || a.updated_at;
            const bDate = b.latest_message?.created_at || b.updated_at;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          })
        });
      },

      addMessage: (sessionId: string, message: ChatMessage) => {
        const currentMessages = get().messages[sessionId] || [];
        set({
          messages: {
            ...get().messages,
            [sessionId]: [...currentMessages, message]
          }
        });
        
        // Update session's latest message
        const session = get().activeSessions.find(s => s.id === sessionId);
        if (session) {
          get().updateSession({
            ...session,
            latest_message: {
              message: message.message,
              created_at: message.created_at,
              sender_type: message.sender_type
            }
          });
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

export default useChatStore;