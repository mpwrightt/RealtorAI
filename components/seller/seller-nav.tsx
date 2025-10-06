import Link from "next/link";
import { Home, BarChart3, FileText, Settings, MessageSquare, Sparkles, CalendarCheck } from "lucide-react";
import ContactAgentButton from './contact-agent-button';

interface SellerNavProps {
  session: any;
}

export default function SellerNav({ session }: SellerNavProps) {
  const sessionCode = session.sessionCode;
  
  const navItems = [
    {
      href: `/seller/${sessionCode}`,
      icon: Home,
      label: "Dashboard",
    },
    {
      href: `/seller/${sessionCode}/offers`,
      icon: FileText,
      label: "Offers",
    },
    {
      href: `/seller/${sessionCode}/open-houses`,
      icon: CalendarCheck,
      label: "Open Houses",
    },
    {
      href: `/seller/${sessionCode}/messages`,
      icon: MessageSquare,
      label: "Messages",
    },
    {
      href: `/seller/${sessionCode}/marketing`,
      icon: Sparkles,
      label: "Marketing",
    },
    {
      href: `/seller/${sessionCode}/analytics`,
      icon: BarChart3,
      label: "Analytics",
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">Seller Portal</h1>
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
            Welcome, <span className="font-medium text-foreground">{session.sellerName}</span>
          </div>
          <ContactAgentButton
            agentId={session.agentId}
            sessionId={session._id}
            clientName={session.sellerName}
            clientPhone={session.phone}
            clientEmail={session.email}
          />
        </div>
      </div>
    </nav>
  );
}
