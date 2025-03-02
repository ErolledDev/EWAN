export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface WidgetSettings {
  id: string;
  user_id: string;
  business_name: string;
  primary_color: string;
  welcome_message: string;
  sales_representative: string;
  fallback_message: string;
  ai_mode_enabled: boolean;
  ai_api_key?: string;
  ai_model?: string;
  ai_context?: string;
  created_at: string;
  updated_at: string;
}

export interface AutoReply {
  id: string;
  user_id: string;
  keywords: string[];
  matching_type: 'word_match' | 'fuzzy_match' | 'regex' | 'synonym_match';
  response: string;
  created_at: string;
  updated_at: string;
}

export interface AdvancedReply {
  id: string;
  user_id: string;
  keywords: string[];
  matching_type: 'word_match' | 'fuzzy_match' | 'regex' | 'synonym_match';
  response: string;
  response_type: 'text' | 'url';
  button_text?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  message: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  visitor_id: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}