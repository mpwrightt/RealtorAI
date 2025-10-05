'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Sparkles, Loader2, X, CheckCircle, Scale } from 'lucide-react';
import { useAGUIStream } from '@/hooks/use-ag-ui-stream';
import AGUITranscript from '@/components/ag-ui/transcript';
import Link from 'next/link';
import PropertyCard from './property-card';

import { Id } from "@/convex/_generated/dataModel";

interface DashboardAIAssistantProps {
  sessionCode: string;
  sessionId: Id<"buyerSessions">;
}

export default function DashboardAIAssistant({ sessionCode, sessionId }: DashboardAIAssistantProps) {
  const [input, setInput] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  
  const { 
    messages, 
    events,
    currentMessage, 
    activeTool,
    isStreaming, 
    startStream, 
    stopStream,
  } = useAGUIStream();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;
    
    const message = input;
    setInput('');
    
    // Build context with selected properties
    const selectedPropsData = displayProperties.filter((p: any) => 
      selectedProperties.has(p._id || p.id)
    );
    
    const context = {
      sessionType: 'buyer',
      sessionCode,
      selectedProperties: selectedPropsData.length > 0 ? selectedPropsData : undefined,
    };
    
    await startStream(sessionId, message, context);
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedProperties(new Set());
  };

  // Extract property results from the most recent search_properties tool result
  const displayProperties = (() => {
    // Find all tool calls
    const toolCalls = events.filter(e => e.type === 'tool_call' && e.name === 'search_properties');
    if (toolCalls.length === 0) return [];
    
    // Get the most recent one
    const latestToolCall = toolCalls[toolCalls.length - 1];
    
    // Find its result
    const result = events.find(e => 
      e.type === 'tool_result' && e.id === latestToolCall.id
    );
    
    return result?.result?.properties || [];
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Property Results - Left Side (2/3 width) */}
      <div className="lg:col-span-2 space-y-4">
        {displayProperties.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">
                  Found {displayProperties.length} {displayProperties.length === 1 ? 'Property' : 'Properties'}
                </h3>
                {selectedProperties.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {selectedProperties.size} selected
                    </Badge>
                    {selectedProperties.size >= 2 && (
                      <Link href={`/buyer/${sessionCode}/compare?ids=${Array.from(selectedProperties).join(',')}`}>
                        <Button variant="default" size="sm" className="h-7">
                          <Scale className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={clearSelection}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              <Link href={`/buyer/${sessionCode}/properties`}>
                <Button variant="outline" size="sm">
                  View All Properties
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {displayProperties.map((property: any) => {
                const propId = property._id || property.id;
                const isSelected = selectedProperties.has(propId);
                
                return (
                  <div 
                    key={propId}
                    className={`relative rounded-lg transition-all ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        onClick={() => togglePropertySelection(propId)}
                        variant={isSelected ? "default" : "secondary"}
                        size="sm"
                        className="shadow-md"
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                    <PropertyCard
                      listing={property}
                      sessionCode={sessionCode}
                      sessionId={sessionId as Id<"buyerSessions">}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Search results will appear here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use the AI assistant to search for properties matching your criteria
              </p>
              <div className="text-xs text-muted-foreground space-y-1 max-w-md mx-auto">
                <p className="font-medium">Try asking:</p>
                <p>"Show me 3 bedroom homes under $2M"</p>
                <p>"Find condos in Mission District with parking"</p>
                <p>"I need a single-family home with a garden"</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Interface - Right Side (1/3 width) */}
      <div className="lg:col-span-1">
        <Card className="border-2 border-primary/20 sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Ask me to find properties or analyze selections
              </p>
              {selectedProperties.size > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedProperties.size} {selectedProperties.size === 1 ? 'property' : 'properties'} in context
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <div className="border rounded-lg">
              <div className="h-[500px] overflow-y-auto p-4 bg-muted/30">
                {messages.length === 0 && !currentMessage ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="space-y-3">
                      <Sparkles className="h-8 w-8 mx-auto text-primary" />
                      <div>
                        <p className="text-sm font-medium">Start a search!</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Ask me anything about properties
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AGUITranscript 
                    messages={messages}
                    events={events}
                    currentMessage={currentMessage}
                    activeTool={activeTool}
                    disableAutoScroll={true}
                  />
                )}
              </div>
              
              <div className="p-3 border-t bg-background">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about properties..."
                    disabled={isStreaming}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!input.trim() || isStreaming}
                      className="flex-1"
                    >
                      {isStreaming ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                    {isStreaming && (
                      <Button
                        onClick={stopStream}
                        variant="outline"
                        size="sm"
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
