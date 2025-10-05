# Task 3.3: AI Chat Widget Integration

**Phase:** 3 - Frontend - Buyer Portal  
**Estimated Time:** 6-8 hours  
**Priority:** High  
**Dependencies:** Task 2.2 (OpenRouter Service)

## Overview
Integrate the AI chat widget powered by OpenRouter and AG-UI protocol for real-time buyer assistance.

## Subtasks

### 3.3.1 Create Chat API Route

**File:** `app/api/buyer/chat/route.ts`

- [ ] Create streaming chat endpoint:
  ```typescript
  import { NextRequest } from 'next/server';
  import { RealEstateAgent } from '@/lib/openrouter/real-estate-agent';
  
  export async function POST(req: NextRequest) {
    const { message, context, sessionCode, listingId } = await req.json();
    
    try {
      const agent = new RealEstateAgent();
      
      // Build context-aware prompt
      const systemContext = {
        listingId,
        sessionCode,
        ...context,
      };
      
      // Stream response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const response = await agent.streamAnswerBuyerQuestion(
            message,
            systemContext
          );
          
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      return Response.json({ error: 'Chat failed' }, { status: 500 });
    }
  }
  ```

- [ ] Test streaming endpoint

### 3.3.2 Create Chat Context Hook

**File:** `hooks/use-chat-context.ts`

- [ ] Create context hook:
  ```typescript
  import { useState, useCallback } from 'react';
  
  export function useChatContext(listingId: string, sessionCode: string) {
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const sendMessage = useCallback(async (message: string) => {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      try {
        const response = await fetch('/api/buyer/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionCode,
            listingId,
            context: {
              // Include relevant context
            },
          }),
        });
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                assistantMessage += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                    newMessages[newMessages.length - 1].content = assistantMessage;
                  } else {
                    newMessages.push({ role: 'assistant', content: assistantMessage });
                  }
                  return newMessages;
                });
              } catch (e) {}
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setIsLoading(false);
      }
    }, [listingId, sessionCode]);
    
    return { messages, sendMessage, isLoading };
  }
  ```

- [ ] Test hook functionality

### 3.3.3 Create Chat Widget Component

**File:** `components/buyer/ai-chat-widget.tsx`

- [ ] Create chat widget:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { MessageSquare, X, Send } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Card } from '@/components/ui/card';
  import { useChatContext } from '@/hooks/use-chat-context';
  
  export default function AIChat({
    sessionCode,
    listingId,
  }: {
    sessionCode: string;
    listingId: string;
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, sendMessage, isLoading } = useChatContext(listingId, sessionCode);
    
    const handleSend = async () => {
      if (!input.trim()) return;
      await sendMessage(input);
      setInput('');
    };
    
    return (
      <>
        {/* Floating button */}
        {!isOpen && (
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14"
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
        
        {/* Chat panel */}
        {isOpen && (
          <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Ask about this property</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm">
                  Ask me anything about this property!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </>
    );
  }
  ```

- [ ] Test widget functionality

### 3.3.4 Add Suggested Questions

**File:** `components/buyer/suggested-questions.tsx`

- [ ] Create suggestions:
  ```typescript
  export default function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
    const questions = [
      "What's included in the HOA fees?",
      "How old is the HVAC system?",
      "Are there any recent renovations?",
      "What's the average utility cost?",
      "Is this a good investment property?",
    ];
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Suggested questions:</div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              onClick={() => onSelect(q)}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  ```

### 3.3.5 Add Context-Aware Responses

- [ ] Enhance chat to include:
  - Property details in context
  - Buyer preferences
  - Recent comparables
  - Neighborhood data
  - Previous conversation history

### 3.3.6 Add Tool Calling Display

**File:** `components/buyer/tool-call-indicator.tsx`

- [ ] Show when AI is using tools:
  ```typescript
  export default function ToolCallIndicator({ tool }: { tool: string }) {
    const icons = {
      calculate_comparables: '📊',
      get_school_ratings: '🏫',
      calculate_mortgage: '💰',
      get_walk_score: '🚶',
    };
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{icons[tool]}</span>
        <span>Analyzing {tool.replace('_', ' ')}...</span>
      </div>
    );
  }
  ```

### 3.3.7 Add Message Reactions

- [ ] Allow users to rate responses
- [ ] Add thumbs up/down
- [ ] Track helpful responses

### 3.3.8 Add Chat History Persistence

**File:** `convex/chatHistory.ts`

- [ ] Create mutation to save chat:
  ```typescript
  export const saveChatMessage = mutation({
    args: {
      sessionId: v.string(),
      listingId: v.string(),
      role: v.string(),
      content: v.string(),
    },
    handler: async (ctx, args) => {
      // Save to agentInteractions table
    },
  });
  ```

- [ ] Load previous chats on widget open

### 3.3.9 Add Voice Input (Optional)

- [ ] Integrate Web Speech API
- [ ] Add microphone button
- [ ] Convert speech to text

### 3.3.10 Add Export Chat Feature

- [ ] Allow exporting chat transcript
- [ ] Email transcript to buyer
- [ ] Save as PDF option

## Acceptance Criteria
- [ ] Chat widget functional
- [ ] Streaming responses work
- [ ] Context-aware answers
- [ ] Tool calling works
- [ ] UI/UX is polished
- [ ] Mobile responsive

## Testing Checklist
- [ ] Test various question types
- [ ] Test streaming performance
- [ ] Test context accuracy
- [ ] Test error handling
- [ ] Test on mobile devices
- [ ] Test with slow connections

## Next Steps
Proceed to Phase 4: Seller Portal
