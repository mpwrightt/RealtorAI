'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SellerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Seller portal error:', error);
  }, [error]);

  return (
    <div className="container py-12">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
