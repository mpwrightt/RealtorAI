import Link from "next/link";
import { Home, Search, Heart, FileText, MessageSquare, Bell, Calendar } from "lucide-react";
import ContactAgentButton from './contact-agent-button';
import { Id } from '@/convex/_generated/dataModel';

interface BuyerNavProps {
  session: any; // Will have all session fields including agentId
}

export default function BuyerNav({ session }: BuyerNavProps) {
  const sessionCode = session.sessionCode;
  
  const navItems = [
    {
      href: `/buyer/${sessionCode}`,
      icon: Home,
      label: "Dashboard",
    },
    {
      href: `/buyer/${sessionCode}/properties`,
      icon: Search,
      label: "Browse",
    },
    {
      href: `/buyer/${sessionCode}/favorites`,
      icon: Heart,
      label: "Favorites",
    },
    {
      href: `/buyer/${sessionCode}/offers`,
      icon: FileText,
      label: "Offers",
    },
    {
      href: `/buyer/${sessionCode}/messages`,
      icon: MessageSquare,
      label: "Messages",
    },
    {
      href: `/buyer/${sessionCode}/alerts`,
      icon: Bell,
      label: "Alerts",
    },
    {
      href: `/buyer/${sessionCode}/tours`,
      icon: Calendar,
      label: "Tours",
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">Property Portal</h1>
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{session.buyerName}</span>
          </div>
          <ContactAgentButton
            agentId={session.agentId}
            sessionId={session._id}
            sessionType="buyer"
            clientName={session.buyerName}
            clientPhone={session.phone}
            clientEmail={session.email}
          />
        </div>
      </div>
    </nav>
  );
}
