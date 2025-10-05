'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

interface BuyerSessionsTableProps {
  sessions: any[];
}

export default function BuyerSessionsTable({ sessions }: BuyerSessionsTableProps) {
  const copyLink = (sessionCode: string) => {
    const url = `${window.location.origin}/buyer/${sessionCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(timestamp).toLocaleDateString();
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No buyer sessions yet</p>
          <Link href="/dashboard/buyers/new">
            <Button>
              Create Your First Buyer Session
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Preferences</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell className="font-medium">
                  {session.buyerName}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {session.buyerEmail}
                    {session.buyerPhone && (
                      <div className="text-muted-foreground">{session.buyerPhone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {session.preferences.minPrice && session.preferences.maxPrice && (
                      <div>
                        ${(session.preferences.minPrice / 1000).toFixed(0)}k - ${(session.preferences.maxPrice / 1000).toFixed(0)}k
                      </div>
                    )}
                    {session.preferences.bedrooms && (
                      <div className="text-muted-foreground">
                        {session.preferences.bedrooms}+ beds
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatRelativeTime(session.lastActive)}
                </TableCell>
                <TableCell>
                  <Badge variant={session.active ? 'default' : 'secondary'}>
                    {session.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyLink(session.sessionCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Link href={`/buyer/${session.sessionCode}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Preferences</DropdownMenuItem>
                        <DropdownMenuItem>Send Properties</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
