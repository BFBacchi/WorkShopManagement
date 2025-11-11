// AI Service using OpenAI API

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DatabaseContext {
  repairOrders?: any[];
  products?: any[];
  sales?: any[];
  customers?: any[];
}

const SYSTEM_PROMPT = `Eres un asistente de IA especializado en gestión de talleres de reparación de dispositivos móviles llamado "Taller Pro Assistant". 
Tu función es ayudar a los usuarios a:
1. Consultar información sobre órdenes de reparación, productos, ventas y clientes
2. Modificar datos mediante lenguaje natural (cuando el usuario lo solicite explícitamente)
3. Responder preguntas técnicas sobre reparaciones comunes
4. Proporcionar sugerencias y recomendaciones

Base de conocimiento técnica:
- Cambio de pantalla: Tiempo estimado 2-3 horas, costo promedio $50-150 según modelo. Requiere herramientas especializadas y cuidado con la calibración.
- Cambio de batería: Tiempo estimado 1 hora, costo promedio $30-80. Verificar capacidad y garantía de la batería nueva.
- Reparación de puerto de carga: Tiempo estimado 1-2 horas, costo promedio $40-100. Revisar si hay corrosión o daño físico.
- Reparación de botones: Tiempo estimado 30 min - 1 hora, costo promedio $20-60. Puede requerir limpieza o reemplazo completo.
- Reparación de cámara: Tiempo estimado 1-2 horas, costo promedio $50-120. Verificar lente, sensor y conexiones.
- Reparación de altavoz: Tiempo estimado 30 min - 1 hora, costo promedio $25-70. Revisar conexiones y reemplazar si es necesario.
- Reparación de placa madre: Tiempo estimado 3-5 horas, costo promedio $100-300. Reparación compleja que requiere experiencia avanzada.

Cuando el usuario pregunte sobre datos específicos, usa el contexto de la base de datos proporcionado para dar respuestas precisas.
Si el usuario quiere modificar datos, explica qué cambios se realizarían y pide confirmación antes de proceder.

Responde siempre en español, sé conciso pero útil, y mantén un tono profesional pero amigable.`;

export class AIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey && import.meta.env.DEV) {
      // Solo mostrar warning en desarrollo
      console.info('OpenAI API key not found. AI features will be limited.');
    }
  }

  async chat(
    messages: ChatMessage[],
    databaseContext?: DatabaseContext
  ): Promise<string> {
    if (!this.apiKey) {
      return 'Lo siento, el servicio de IA no está configurado. Por favor, configura VITE_OPENAI_API_KEY en tu archivo .env';
    }

    try {
      // Add system prompt with database context
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.buildSystemPrompt(databaseContext),
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error en la API de OpenAI');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No se pudo generar una respuesta';
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      return `Error: ${error.message || 'No se pudo conectar con el servicio de IA'}`;
    }
  }

  private buildSystemPrompt(context?: DatabaseContext): string {
    let contextInfo = SYSTEM_PROMPT;

    if (context) {
      contextInfo += '\n\nContexto de la base de datos:\n';
      
      if (context.repairOrders?.length) {
        contextInfo += `- Órdenes de reparación: ${context.repairOrders.length} órdenes disponibles\n`;
      }
      
      if (context.products?.length) {
        contextInfo += `- Productos: ${context.products.length} productos en inventario\n`;
      }
      
      if (context.sales?.length) {
        contextInfo += `- Ventas: ${context.sales.length} ventas registradas\n`;
      }
      
      if (context.customers?.length) {
        contextInfo += `- Clientes: ${context.customers.length} clientes registrados\n`;
      }
    }

    return contextInfo;
  }

  // Parse natural language commands to extract actions
  parseCommand(message: string): {
    action: 'query' | 'update' | 'create' | 'delete' | 'unknown';
    entity?: string;
    intent?: string;
  } {
    const lowerMessage = message.toLowerCase();

    // Detect update/create/delete intents
    if (
      lowerMessage.includes('actualizar') ||
      lowerMessage.includes('cambiar') ||
      lowerMessage.includes('modificar') ||
      lowerMessage.includes('editar')
    ) {
      return { action: 'update', intent: 'modify' };
    }

    if (
      lowerMessage.includes('crear') ||
      lowerMessage.includes('agregar') ||
      lowerMessage.includes('nuevo') ||
      lowerMessage.includes('añadir')
    ) {
      return { action: 'create', intent: 'create' };
    }

    if (
      lowerMessage.includes('eliminar') ||
      lowerMessage.includes('borrar') ||
      lowerMessage.includes('quitar')
    ) {
      return { action: 'delete', intent: 'delete' };
    }

    // Detect entity types
    let entity: string | undefined;
    if (
      lowerMessage.includes('orden') ||
      lowerMessage.includes('reparación') ||
      lowerMessage.includes('servicio')
    ) {
      entity = 'repair_order';
    } else if (
      lowerMessage.includes('producto') ||
      lowerMessage.includes('inventario') ||
      lowerMessage.includes('stock')
    ) {
      entity = 'product';
    } else if (
      lowerMessage.includes('venta') ||
      lowerMessage.includes('transacción')
    ) {
      entity = 'sale';
    } else if (
      lowerMessage.includes('cliente') ||
      lowerMessage.includes('customer')
    ) {
      entity = 'customer';
    }

    return { action: 'query', entity, intent: 'query' };
  }
}

export const aiService = new AIService();

