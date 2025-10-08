'use client';

import { Loader2, Check, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessingStep {
  label: string;
  status: 'pending' | 'processing' | 'complete';
}

interface ProcessingLoaderProps {
  steps: ProcessingStep[];
}

export default function ProcessingLoader({ steps }: ProcessingLoaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          AI is analyzing your listing...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step.status === 'complete' && (
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                {step.status === 'processing' && (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="h-6 w-6 rounded-full border-2 border-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.status === 'complete' 
                    ? 'text-green-600 dark:text-green-400' 
                    : step.status === 'processing'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            This usually takes 30-60 seconds depending on the number of photos.
            The AI is analyzing images, detecting features, and generating a description.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
