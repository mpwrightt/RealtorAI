'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { MessageSquare, Send } from 'lucide-react';
import SellerNotificationSettings from './notification-settings';

interface SellerMessagesClientProps {
  sessionId: Id<"sellerSessions">;
  agentName: string;
}

export default function SellerMessagesClient({ sessionId, agentName }: SellerMessagesClientProps) {
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.messages.getSellerMessages, { sellerSessionId: sessionId });
  const sendMessage = useMutation(api.messages.sendSellerMessage);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage({
        sellerSessionId: sessionId,
        body: messageText,
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with {agentName}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-2">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.direction === 'inbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {msg.direction === 'outbound' && (
                          <div className="text-xs font-semibold mb-1">{agentName}</div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <div className="text-xs opacity-70 mt-2">
                          {formatDate(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t space-y-3">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Press {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to send
                </p>
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <SellerNotificationSettings sessionId={sessionId} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>💬 Messages are sent in real-time to your agent</p>
            <p>🔔 Configure notifications to stay updated on responses</p>
            <p>📱 Messages can be received via SMS if enabled</p>
            <p>📧 Email notifications are sent for new messages</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
