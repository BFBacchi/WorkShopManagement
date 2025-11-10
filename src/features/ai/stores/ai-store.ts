// AI Chat Store

import { create } from 'zustand';
import { aiService } from '../services/ai-service';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  isListening: boolean;
  suggestions: string[];
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  loadSuggestions: () => void;
}

const COMMAND_SUGGESTIONS = [
  '¿Cuántas órdenes de reparación están pendientes?',
  'Muéstrame los productos con stock bajo',
  '¿Cuál fue la venta más alta de hoy?',
  'Lista los clientes más frecuentes',
  '¿Cuántas reparaciones se completaron esta semana?',
  'Muéstrame el inventario de pantallas',
  '¿Cuál es el estado de la orden ORD-001?',
  'Agrega un nuevo producto al inventario',
  'Actualiza el stock del producto SKU-123',
];

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  isLoading: false,
  isOpen: false,
  isListening: false,
  suggestions: COMMAND_SUGGESTIONS,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  clearChat: () => set({ messages: [] }),

  loadSuggestions: () => {
    set({ suggestions: COMMAND_SUGGESTIONS });
  },

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Load database context
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }

      // Fetch relevant data based on message content
      const context = await getDatabaseContext(user.uid, content);

      // Convert messages to OpenAI format
      const openAIMessages = get().messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI response
      const response = await aiService.chat(openAIMessages, context);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'No se pudo procesar tu mensaje'}`,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

  startVoiceInput: () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    set({ isListening: true });

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      set({ isListening: false });
      get().sendMessage(transcript);
    };

    recognition.onerror = () => {
      set({ isListening: false });
    };

    recognition.onend = () => {
      set({ isListening: false });
    };

    recognition.start();
  },

  stopVoiceInput: () => {
    set({ isListening: false });
  },
}));

// Helper function to load database context based on message
async function getDatabaseContext(userId: string, message: string): Promise<any> {
  const lowerMessage = message.toLowerCase();
  const context: any = {};

  try {
    // Load repair orders if mentioned
    if (
      lowerMessage.includes('orden') ||
      lowerMessage.includes('reparación') ||
      lowerMessage.includes('servicio')
    ) {
      const { data } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      context.repairOrders = data || [];
    }

    // Load products if mentioned
    if (
      lowerMessage.includes('producto') ||
      lowerMessage.includes('inventario') ||
      lowerMessage.includes('stock')
    ) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      context.products = data || [];
    }

    // Load sales if mentioned
    if (lowerMessage.includes('venta') || lowerMessage.includes('transacción')) {
      const { data } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      context.sales = data || [];
    }

    // Load customers if mentioned
    if (lowerMessage.includes('cliente')) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      context.customers = data || [];
    }
  } catch (error) {
    console.error('Error loading database context:', error);
  }

  return context;
}

