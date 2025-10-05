'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Mail } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface ContactAgentButtonProps {
  agentId: Id<"agents">;
  sessionId: Id<"sellerSessions">;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
}

export default function ContactAgentButton({
  agentId,
  sessionId,
  clientName,
  clientPhone,
  clientEmail,
}: ContactAgentButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'sms' | 'email'>('sms');
  const [sending, setSending] = useState(false);
  
  const sendMessage = useMutation(api.messages.simulateInboundMessage);
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await sendMessage({
        agentId,
        clientType: 'seller',
        clientId: sessionId,
        clientName,
        clientPhone,
        clientEmail,
        type,
        body: message,
      });
      
      setMessage('');
      setOpen(false);
      alert('Message sent to your agent!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message to Your Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium">Message Type</label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={type === 'sms' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('sms')}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS
              </Button>
              <Button
                variant={type === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('email')}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Your Message</label>
            <Textarea
              placeholder={`Type your ${type === 'sms' ? 'text' : 'email'} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] mt-2"
            />
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || sending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
