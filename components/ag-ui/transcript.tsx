'use client';

import { useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Wrench } from 'lucide-react';
import type { AGUIEvent, AGUIMessage } from '@/hooks/use-ag-ui-stream';

interface TranscriptProps {
  messages: AGUIMessage[];
  events: AGUIEvent[];
  currentMessage?: string;
  activeTool?: string | null;
  disableAutoScroll?: boolean;
}

export default function AGUITranscript({ messages, events, currentMessage, activeTool, disableAutoScroll = false }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (disableAutoScroll) {
      // Only scroll within the container, don't affect page scroll
      if (containerRef.current) {
        // Use requestAnimationFrame for smooth scrolling during streaming
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        });
      }
    } else {
      // Default behavior - scroll element into view
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, currentMessage, disableAutoScroll]);
  
  // Group events by message/tool flow
  const groupedEvents: any[] = [];
  let currentGroup: any = null;
  
  for (const event of events) {
    if (event.type === 'message') {
      if (currentGroup) groupedEvents.push(currentGroup);
      currentGroup = { type: 'message', event, toolCalls: [] };
    } else if (event.type === 'tool_call') {
      if (!currentGroup) currentGroup = { type: 'response', toolCalls: [] };
      currentGroup.toolCalls.push({ call: event, result: null });
    } else if (event.type === 'tool_result' || event.type === 'tool_error') {
      if (currentGroup) {
        const toolCall = currentGroup.toolCalls.find((tc: any) => tc.call.id === event.id);
        if (toolCall) {
          toolCall.result = event;
        }
      }
    }
  }
  if (currentGroup) groupedEvents.push(currentGroup);
  
  return (
    <div ref={containerRef} className="space-y-4 pb-4">
      {/* Render completed messages from messages array */}
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        return (
          <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-3 max-w-[85%] ${
              isUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      })}
      
      {/* Render tool calls from events */}
      {groupedEvents.map((group, idx) => {
        if (group.type === 'message') {
          // Skip - already rendered from messages array above
          return null;
        }
        
        if (group.toolCalls && group.toolCalls.length > 0) {
          return (
            <div key={idx} className="space-y-2">
              {group.toolCalls.map((tc: any, tcIdx: number) => (
                <div key={tcIdx} className="ml-4 border-l-2 border-muted-foreground/20 pl-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    {!tc.result ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : tc.result.type === 'tool_error' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <Wrench className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{tc.call.name}</span>
                    {!tc.result && <span className="text-muted-foreground text-xs">Running...</span>}
                  </div>
                  
                  {tc.result && (
                    <div className="text-xs bg-muted/50 p-3 rounded border">
                      {tc.result.type === 'tool_error' ? (
                        <div className="text-red-600 dark:text-red-400">
                          ❌ Error: {tc.result.error}
                        </div>
                      ) : (
                        <div>
                          <div className="text-green-600 dark:text-green-400 mb-2">
                            ✓ Completed
                          </div>
                          <details className="cursor-pointer">
                            <summary className="font-medium text-muted-foreground hover:text-foreground">
                              View result
                            </summary>
                            <pre className="mt-2 overflow-x-auto text-xs">
                              {JSON.stringify(tc.result.result, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }
        
        return null;
      })}
      
      {/* Current streaming message */}
      {currentMessage && (
        <div className="flex justify-start">
          <div className="rounded-lg px-4 py-3 max-w-[85%] bg-muted">
            <p className="text-sm whitespace-pre-wrap">{currentMessage}</p>
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
          </div>
        </div>
      )}
      
      {/* Active tool indicator */}
      {activeTool && !currentMessage && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Wrench className="h-3 w-3" />
          <span>Using {activeTool}...</span>
        </div>
      )}
      
      <div ref={scrollRef} />
    </div>
  );
}
