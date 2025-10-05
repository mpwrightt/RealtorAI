'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Mail, MessageSquare, Send, User } from 'lucide-react';

interface BuyerMessagesProps {
  agentId: Id<"agents">;
  sessionId: Id<"buyerSessions">;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
}

export default function BuyerMessages({
  agentId,
  sessionId,
  clientName,
  clientPhone,
  clientEmail,
}: BuyerMessagesProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  
  const conversation = useQuery(api.messages.getConversation, {
    agentId,
    clientId: sessionId,
  });
  
  const sendMessage = useMutation(api.messages.simulateInboundMessage);
  const markAsRead = useMutation(api.messages.markConversationAsRead);
  
  // Mark all as read when component mounts or messages change
  useState(() => {
    if (conversation && conversation.length > 0) {
      markAsRead({ agentId, clientId: sessionId });
    }
  });
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    await sendMessage({
      agentId,
      clientType: 'buyer',
      clientId: sessionId,
      clientName,
      clientPhone,
      clientEmail,
      type: messageType,
      body: message,
    });
    
    setMessage('');
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages with Your Agent
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {!conversation || conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Send a message below to start a conversation with your agent
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.slice().reverse().map((msg: any) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-semibold">Your Agent</span>
                      </div>
                    )}
                    {msg.subject && (
                      <div className="font-semibold text-sm mb-1">{msg.subject}</div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      {msg.type === 'sms' ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Reply Box */}
        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            <Button
              variant={messageType === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('sms')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              SMS
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('email')}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder={`Type your ${messageType === 'sms' ? 'SMS' : 'email'} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Press {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to send
            </p>
            <Button onClick={handleSend} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send to Agent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
