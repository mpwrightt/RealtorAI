'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { useAGUIStream } from '@/hooks/use-ag-ui-stream';
import AGUITranscript from './transcript';

interface EnhancedChatWidgetProps {
  sessionId: string;
  context?: any;
  className?: string;
}

export default function EnhancedChatWidget({ 
  sessionId, 
  context,
  className = '' 
}: EnhancedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const { 
    events,
    messages, 
    currentMessage, 
    activeTool,
    isStreaming, 
    startStream, 
    stopStream,
    clearHistory,
  } = useAGUIStream();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;
    
    const message = input;
    setInput('');
    
    await startStream(sessionId, message, context);
  };
  
  const handleClear = () => {
    if (confirm('Clear conversation history?')) {
      clearHistory();
    }
  };
  
  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg ${className}`}
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <div className="flex gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  disabled={isStreaming}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !currentMessage ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                  <div className="text-4xl">🏠</div>
                  <div className="space-y-1">
                    <p className="font-medium">Ask me anything!</p>
                    <p className="text-sm text-muted-foreground">
                      I can help you find properties, calculate mortgages, check schools, and more.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 pt-2">
                    <p>Try asking:</p>
                    <p>"What are the schools like nearby?"</p>
                    <p>"Calculate monthly payment for this home"</p>
                    <p>"What's the walkability score?"</p>
                  </div>
                </div>
              </div>
            ) : (
              <AGUITranscript 
                messages={messages}
                events={events}
                currentMessage={currentMessage}
                activeTool={activeTool}
              />
            )}
          </CardContent>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isStreaming}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isStreaming}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {isStreaming && (
              <Button
                onClick={stopStream}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                Stop
              </Button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
