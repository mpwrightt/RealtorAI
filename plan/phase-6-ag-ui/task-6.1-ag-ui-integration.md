# Task 6.1: AG-UI Integration

**Phase:** 6 - AG-UI Integration  
**Estimated Time:** 10-12 hours  
**Priority:** High  
**Dependencies:** Task 2.2 (OpenRouter Service), Task 3.3 (AI Chat Widget)

## Overview
Integrate AG-UI protocol to provide real-time agent-user interaction with transparent tool calling, state management, and interactive UI elements.

## Subtasks

### 6.1.1 Set Up AG-UI Event Stream

**File:** `app/api/ag-ui/stream/route.ts`

- [ ] Create SSE endpoint:
  ```typescript
  import { NextRequest } from 'next/server';
  import { OpenRouterClient } from '@/lib/openrouter/client';
  
  export async function POST(req: NextRequest) {
    const { sessionId, message, context } = await req.json();
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const client = new OpenRouterClient();
        
        try {
          // AG-UI: Send initial message event
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'message',
              role: 'user',
              content: message,
              timestamp: Date.now(),
            })}\n\n`
          ));
          
          // Stream AI response
          const response = await client.streamChat([
            { role: 'system', content: 'You are a real estate assistant...' },
            { role: 'user', content: message },
          ]);
          
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;
            
            if (delta?.content) {
              // AG-UI: Content event
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  type: 'content',
                  content: delta.content,
                  timestamp: Date.now(),
                })}\n\n`
              ));
            }
            
            if (delta?.tool_calls) {
              // AG-UI: Tool call event
              for (const toolCall of delta.tool_calls) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool_call',
                    id: toolCall.id,
                    name: toolCall.function?.name,
                    arguments: toolCall.function?.arguments,
                    status: 'pending',
                    timestamp: Date.now(),
                  })}\n\n`
                ));
              }
            }
          }
          
          // AG-UI: Done event
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'done', timestamp: Date.now() })}\n\n`
          ));
        } catch (error) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message,
              timestamp: Date.now(),
            })}\n\n`
          ));
        } finally {
          controller.close();
        }
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
  ```

### 6.1.2 Create AG-UI Client Hook

**File:** `hooks/use-ag-ui-stream.ts`

- [ ] Create hook for consuming events:
  ```typescript
  import { useState, useCallback, useEffect, useRef } from 'react';
  
  interface AGUIEvent {
    type: 'message' | 'content' | 'tool_call' | 'tool_result' | 'state_update' | 'done' | 'error';
    [key: string]: any;
  }
  
  export function useAGUIStream() {
    const [events, setEvents] = useState<AGUIEvent[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);
    
    const startStream = useCallback(async (sessionId: string, message: string, context?: any) => {
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setCurrentMessage('');
      
      try {
        const response = await fetch('/api/ag-ui/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message, context }),
          signal: abortControllerRef.current.signal,
        });
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const event = JSON.parse(data);
                setEvents(prev => [...prev, event]);
                
                if (event.type === 'content') {
                  setCurrentMessage(prev => prev + event.content);
                }
                
                if (event.type === 'done') {
                  setIsStreaming(false);
                }
              } catch (e) {}
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Stream error:', error);
        }
        setIsStreaming(false);
      }
    }, []);
    
    const stopStream = useCallback(() => {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }, []);
    
    return {
      events,
      currentMessage,
      isStreaming,
      startStream,
      stopStream,
    };
  }
  ```

### 6.1.3 Create AG-UI Transcript Component

**File:** `components/ag-ui/transcript.tsx`

- [ ] Create message transcript with tool calls:
  ```typescript
  'use client';
  
  import { useEffect, useRef } from 'react';
  
  export default function AGUITranscript({ events }: { events: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);
    
    return (
      <div className="space-y-4">
        {events.map((event, idx) => {
          switch (event.type) {
            case 'message':
              return (
                <div key={idx} className={`flex ${event.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    event.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {event.content}
                  </div>
                </div>
              );
              
            case 'tool_call':
              return (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Using {event.name}...</span>
                </div>
              );
              
            case 'tool_result':
              return (
                <div key={idx} className="text-sm bg-muted p-3 rounded-lg">
                  <div className="font-medium mb-1">✓ {event.name} completed</div>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(event.result, null, 2)}
                  </pre>
                </div>
              );
              
            default:
              return null;
          }
        })}
        <div ref={scrollRef} />
      </div>
    );
  }
  ```

### 6.1.4 Create Tool Approval Modal

**File:** `components/ag-ui/tool-approval-modal.tsx`

- [ ] Create approval interface for sensitive tools:
  ```typescript
  'use client';
  
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { AlertTriangle } from 'lucide-react';
  
  export default function ToolApprovalModal({
    isOpen,
    toolCall,
    onApprove,
    onDeny,
  }: {
    isOpen: boolean;
    toolCall: any;
    onApprove: () => void;
    onDeny: () => void;
  }) {
    return (
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Tool Permission Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">
                The AI wants to use: <strong>{toolCall?.name}</strong>
              </p>
              <div className="bg-muted p-3 rounded text-xs">
                <pre>{JSON.stringify(toolCall?.arguments, null, 2)}</pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={onApprove} className="flex-1">
                Approve
              </Button>
              <Button onClick={onDeny} variant="outline" className="flex-1">
                Deny
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

### 6.1.5 Create State Inspector

**File:** `components/ag-ui/state-inspector.tsx`

- [ ] Show current agent state
- [ ] Display context information
- [ ] Show active tools
- [ ] Recent state changes

### 6.1.6 Create Interactive UI Components

**File:** `components/ag-ui/interactive-elements.tsx`

- [ ] Property recommendation cards (generated by AI)
- [ ] Dynamic forms (mortgage calculator populated by AI)
- [ ] Interactive charts (data from AI analysis)

### 6.1.7 Integrate with Existing Chat Widget

- [ ] Replace simple chat with AG-UI stream
- [ ] Add transcript component
- [ ] Add tool approval flow
- [ ] Test integration

### 6.1.8 Create AG-UI Debug Panel

**File:** `components/ag-ui/debug-panel.tsx`

- [ ] Show all events
- [ ] Event timeline
- [ ] Performance metrics
- [ ] Export event log

### 6.1.9 Add AG-UI to Buyer Portal

- [ ] Replace chat widget in property details
- [ ] Add to dashboard for general queries
- [ ] Test with various query types

### 6.1.10 Create AG-UI Documentation

- [ ] Document event types
- [ ] Document tool registration
- [ ] Document state management
- [ ] Create developer guide

## Acceptance Criteria
- [ ] Event streaming works
- [ ] All event types handled
- [ ] Tool approval functional
- [ ] State management works
- [ ] UI components render correctly
- [ ] Debug tools functional

## Testing Checklist
- [ ] Test all event types
- [ ] Test tool calling flow
- [ ] Test approval workflow
- [ ] Test state persistence
- [ ] Test error handling
- [ ] Test performance

## Next Steps
Proceed to Phase 7: Testing & Polish
