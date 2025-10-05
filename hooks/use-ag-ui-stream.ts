import { useState, useCallback, useRef } from 'react';

export interface AGUIEvent {
  type: 'message' | 'content' | 'tool_call' | 'tool_result' | 'tool_error' | 'state_update' | 'done' | 'error';
  timestamp: number;
  [key: string]: any;
}

export interface AGUIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolCalls?: any[];
}

export function useAGUIStream() {
  const [events, setEvents] = useState<AGUIEvent[]>([]);
  const [messages, setMessages] = useState<AGUIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const startStream = useCallback(async (
    sessionId: string, 
    message: string, 
    context?: any
  ) => {
    // Add user message immediately
    const userMessage: AGUIMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Reset current message
    setCurrentMessage('');
    setActiveTool(null);
    
    // Start streaming
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    
    // Track accumulated content locally
    let accumulatedContent = '';
    let messageAdded = false; // Track if we've already added the message
    
    try {
      const response = await fetch('/api/ag-ui/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          message, 
          context,
          conversationHistory: messages,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error('Stream request failed');
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream finished - add final message ONLY if not already added
          console.log('Stream done, accumulated content:', accumulatedContent);
          if (accumulatedContent && !messageAdded) {
            console.log('Adding assistant message to history (from stream done)');
            messageAdded = true;
            setMessages(prev => {
              const newMessages = [...prev, {
                role: 'assistant' as const,
                content: accumulatedContent,
                timestamp: Date.now(),
              }];
              console.log('New messages array:', newMessages);
              return newMessages;
            });
            setCurrentMessage('');
          }
          setIsStreaming(false);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event: AGUIEvent = JSON.parse(data);
              setEvents(prev => [...prev, event]);
              
              // Handle different event types
              switch (event.type) {
                case 'content':
                  accumulatedContent += event.content;
                  setCurrentMessage(accumulatedContent);
                  console.log('Content chunk received, total length:', accumulatedContent.length);
                  break;
                  
                case 'tool_call':
                  setActiveTool(event.name);
                  break;
                  
                case 'tool_result':
                case 'tool_error':
                  setActiveTool(null);
                  break;
                  
                case 'done':
                  // Done event received - add message ONLY if not already added
                  if (accumulatedContent && !messageAdded) {
                    console.log('Adding assistant message to history (from done event)');
                    messageAdded = true;
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: accumulatedContent,
                      timestamp: Date.now(),
                    }]);
                    setCurrentMessage('');
                  }
                  setIsStreaming(false);
                  break;
                  
                case 'error':
                  console.error('Stream error:', event.error);
                  setIsStreaming(false);
                  break;
              }
            } catch (e) {
              console.error('Failed to parse event:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error);
        setEvents(prev => [...prev, {
          type: 'error',
          error: error.message,
          timestamp: Date.now(),
        }]);
      }
      setIsStreaming(false);
    }
  }, [messages]);
  
  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setActiveTool(null);
  }, []);
  
  const clearHistory = useCallback(() => {
    setMessages([]);
    setEvents([]);
    setCurrentMessage('');
  }, []);
  
  return {
    events,
    messages,
    currentMessage,
    activeTool,
    isStreaming,
    startStream,
    stopStream,
    clearHistory,
  };
}
