import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { WidgetSettings, AutoReply, AdvancedReply } from '../types';

interface WidgetState {
  settings: WidgetSettings | null;
  autoReplies: AutoReply[];
  advancedReplies: AdvancedReply[];
  loading: boolean;
  
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (settings: Partial<WidgetSettings>) => Promise<void>;
  
  fetchAutoReplies: (userId: string) => Promise<void>;
  addAutoReply: (autoReply: Omit<AutoReply, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAutoReply: (id: string, autoReply: Partial<AutoReply>) => Promise<void>;
  deleteAutoReply: (id: string) => Promise<void>;
  
  fetchAdvancedReplies: (userId: string) => Promise<void>;
  addAdvancedReply: (advancedReply: Omit<AdvancedReply, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAdvancedReply: (id: string, advancedReply: Partial<AdvancedReply>) => Promise<void>;
  deleteAdvancedReply: (id: string) => Promise<void>;
  
  importAutoReplies: (autoReplies: Omit<AutoReply, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  exportAutoReplies: () => AutoReply[];
  
  importAdvancedReplies: (advancedReplies: Omit<AdvancedReply, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  exportAdvancedReplies: () => AdvancedReply[];
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  settings: null,
  autoReplies: [],
  advancedReplies: [],
  loading: false,
  
  fetchSettings: async (userId: string) => {
    try {
      set({ loading: true });
      
      // First check if settings exist
      const { data, error } = await supabase
        .from('widget_settings')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Settings exist, use the first one
        set({ settings: data[0] as WidgetSettings });
      } else {
        // Create default settings if none exist
        const defaultSettings: Omit<WidgetSettings, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          business_name: 'My Business',
          primary_color: '#4f46e5',
          welcome_message: 'Welcome to our chat! How can we help you today?',
          sales_representative: 'Customer Support',
          fallback_message: 'We\'ll get back to you soon. Please leave a message.',
          ai_mode_enabled: false,
        };
        
        const { data: newSettings, error: createError } = await supabase
          .from('widget_settings')
          .insert(defaultSettings)
          .select()
          .single();
        
        if (createError) throw createError;
        set({ settings: newSettings as WidgetSettings });
      }
    } catch (error) {
      console.error('Error fetching widget settings:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  updateSettings: async (settings: Partial<WidgetSettings>) => {
    try {
      const currentSettings = get().settings;
      if (!currentSettings) return;
      
      const { error } = await supabase
        .from('widget_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSettings.id);
      
      if (error) throw error;
      
      set({ 
        settings: {
          ...currentSettings,
          ...settings,
          updated_at: new Date().toISOString(),
        } 
      });
    } catch (error) {
      console.error('Error updating widget settings:', error);
    }
  },
  
  fetchAutoReplies: async (userId: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('auto_replies')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set({ autoReplies: data as AutoReply[] });
    } catch (error) {
      console.error('Error fetching auto replies:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  addAutoReply: async (autoReply: Omit<AutoReply, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('auto_replies')
        .insert({
          ...autoReply,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set({ autoReplies: [...get().autoReplies, data as AutoReply] });
    } catch (error) {
      console.error('Error adding auto reply:', error);
    }
  },
  
  updateAutoReply: async (id: string, autoReply: Partial<AutoReply>) => {
    try {
      const { error } = await supabase
        .from('auto_replies')
        .update({
          ...autoReply,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set({
        autoReplies: get().autoReplies.map(reply => 
          reply.id === id ? { ...reply, ...autoReply, updated_at: new Date().toISOString() } : reply
        )
      });
    } catch (error) {
      console.error('Error updating auto reply:', error);
    }
  },
  
  deleteAutoReply: async (id: string) => {
    try {
      const { error } = await supabase
        .from('auto_replies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set({
        autoReplies: get().autoReplies.filter(reply => reply.id !== id)
      });
    } catch (error) {
      console.error('Error deleting auto reply:', error);
    }
  },
  
  fetchAdvancedReplies: async (userId: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('advanced_replies')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set({ advancedReplies: data as AdvancedReply[] });
    } catch (error) {
      console.error('Error fetching advanced replies:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  addAdvancedReply: async (advancedReply: Omit<AdvancedReply, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('advanced_replies')
        .insert({
          ...advancedReply,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set({ advancedReplies: [...get().advancedReplies, data as AdvancedReply] });
    } catch (error) {
      console.error('Error adding advanced reply:', error);
    }
  },
  
  updateAdvancedReply: async (id: string, advancedReply: Partial<AdvancedReply>) => {
    try {
      const { error } = await supabase
        .from('advanced_replies')
        .update({
          ...advancedReply,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set({
        advancedReplies: get().advancedReplies.map(reply => 
          reply.id === id ? { ...reply, ...advancedReply, updated_at: new Date().toISOString() } : reply
        )
      });
    } catch (error) {
      console.error('Error updating advanced reply:', error);
    }
  },
  
  deleteAdvancedReply: async (id: string) => {
    try {
      const { error } = await supabase
        .from('advanced_replies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set({
        advancedReplies: get().advancedReplies.filter(reply => reply.id !== id)
      });
    } catch (error) {
      console.error('Error deleting advanced reply:', error);
    }
  },
  
  importAutoReplies: async (autoReplies: Omit<AutoReply, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const { data, error } = await supabase
        .from('auto_replies')
        .insert(
          autoReplies.map(reply => ({
            ...reply,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        )
        .select();
      
      if (error) throw error;
      
      set({ autoReplies: [...get().autoReplies, ...(data as AutoReply[])] });
    } catch (error) {
      console.error('Error importing auto replies:', error);
    }
  },
  
  exportAutoReplies: () => {
    return get().autoReplies;
  },
  
  importAdvancedReplies: async (advancedReplies: Omit<AdvancedReply, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const { data, error } = await supabase
        .from('advanced_replies')
        .insert(
          advancedReplies.map(reply => ({
            ...reply,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        )
        .select();
      
      if (error) throw error;
      
      set({ advancedReplies: [...get().advancedReplies, ...(data as AdvancedReply[])] });
    } catch (error) {
      console.error('Error importing advanced replies:', error);
    }
  },
  
  exportAdvancedReplies: () => {
    return get().advancedReplies;
  },
}));