import { OpenRouterClient, ChatMessage } from './client';
import { executeToolCall } from './tool-handlers';

export interface StreamEvent {
  type: 'content' | 'tool_call' | 'tool_result' | 'done' | 'error';
  content?: string;
  toolCall?: {
    id: string;
    name: string;
    arguments: string;
  };
  toolResult?: {
    id: string;
    result: any;
  };
  error?: string;
}

export async function* streamAIResponse(
  messages: ChatMessage[],
  tools?: any[]
): AsyncGenerator<StreamEvent> {
  const client = new OpenRouterClient();

  try {
    const stream = await client.streamChat(messages, { tools });

    let currentToolCall: any = null;
    const toolCalls: any[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        yield {
          type: 'content',
          content: delta.content,
        };
      }

      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.index !== undefined) {
            if (!toolCalls[toolCall.index]) {
              toolCalls[toolCall.index] = {
                id: toolCall.id || '',
                function: {
                  name: toolCall.function?.name || '',
                  arguments: toolCall.function?.arguments || '',
                },
              };
            } else {
              if (toolCall.function?.name) {
                toolCalls[toolCall.index].function.name += toolCall.function.name;
              }
              if (toolCall.function?.arguments) {
                toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
              }
            }
          }
        }
      }

      if (chunk.choices[0]?.finish_reason === 'tool_calls') {
        for (const toolCall of toolCalls) {
          yield {
            type: 'tool_call',
            toolCall: {
              id: toolCall.id,
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
          };

          try {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await executeToolCall(toolCall.function.name, args);

            yield {
              type: 'tool_result',
              toolResult: {
                id: toolCall.id,
                result,
              },
            };
          } catch (error: any) {
            yield {
              type: 'error',
              error: `Tool execution failed: ${error.message}`,
            };
          }
        }
      }
    }

    yield { type: 'done' };
  } catch (error: any) {
    yield {
      type: 'error',
      error: error.message,
    };
  }
}

export class ConversationContext {
  private messages: ChatMessage[] = [];
  private maxMessages: number = 20;

  constructor(systemPrompt?: string) {
    if (systemPrompt) {
      this.messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    this.messages.push({ role, content });
    this.trimMessages();
  }

  addToolCall(content: string, toolCalls: any[]) {
    this.messages.push({
      role: 'assistant',
      content,
      tool_calls: toolCalls,
    });
  }

  addToolResult(toolCallId: string, result: any) {
    this.messages.push({
      role: 'tool',
      content: JSON.stringify(result),
      tool_call_id: toolCallId,
    });
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear() {
    const systemMsg = this.messages.find(m => m.role === 'system');
    this.messages = systemMsg ? [systemMsg] : [];
  }

  private trimMessages() {
    if (this.messages.length > this.maxMessages) {
      const systemMsg = this.messages.find(m => m.role === 'system');
      const recentMessages = this.messages.slice(-this.maxMessages + 1);
      
      this.messages = systemMsg 
        ? [systemMsg, ...recentMessages.filter(m => m.role !== 'system')]
        : recentMessages;
    }
  }
}
