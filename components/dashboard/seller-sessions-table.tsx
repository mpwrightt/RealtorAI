'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, MoreHorizontal, Trash, Check, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SellerSessionsTable({ sessions }: { sessions: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPortalLink = (sessionCode: string, sessionId: string) => {
    const url = `${window.location.origin}/seller/${sessionCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(sessionId);
    toast.success('Portal link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No seller sessions yet</p>
          <Link href="/dashboard/sellers/new">
            <Button>Create Your First Seller Session</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Seller Sessions ({sessions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow 
                key={session._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => window.location.href = `/dashboard/sellers/${session._id}`}
              >
                <TableCell className="font-medium">
                  <Link 
                    href={`/dashboard/sellers/${session._id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {session.sellerName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/dashboard/listings/${session.listing?._id}`}
                    className="max-w-[200px] truncate hover:underline block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {session.listing?.address || 'N/A'}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {session.listing?.city}, {session.listing?.state}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {session.sellerEmail}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(session.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTime(session.lastActive)}
                </TableCell>
                <TableCell>
                  <Badge variant={session.active ? "default" : "secondary"}>
                    {session.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div 
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPortalLink(session.sessionCode, session._id)}
                    >
                      {copiedId === session._id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Link href={`/seller/${session.sessionCode}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sellers/${session._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyPortalLink(session.sessionCode, session._id)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Portal Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/seller/${session.sessionCode}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Portal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
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
