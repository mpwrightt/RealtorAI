import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export class OpenRouterClient {
  private client: OpenAI;
  private defaultModel: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'Neighborhood Deal Finder',
      },
    });

    this.defaultModel = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
  }

  async chat(messages: ChatMessage[], options: ChatCompletionOptions = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: messages as any,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        tools: options.tools,
        tool_choice: options.tool_choice,
      });

      return response;
    } catch (error: any) {
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API request failed: ${error.message}`);
    }
  }

  async streamChat(messages: ChatMessage[], options: ChatCompletionOptions = {}) {
    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: messages as any,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        tools: options.tools,
        tool_choice: options.tool_choice,
        stream: true,
      });

      return stream;
    } catch (error: any) {
      console.error('OpenRouter streaming error:', error);
      throw new Error(`OpenRouter streaming request failed: ${error.message}`);
    }
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }
}
