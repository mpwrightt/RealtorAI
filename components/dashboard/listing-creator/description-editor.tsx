'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DescriptionEditorProps {
  description: string;
  onChange: (description: string) => void;
  draftId: Id<'listingDrafts'>;
  disabled?: boolean;
}

export default function DescriptionEditor({
  description,
  onChange,
  draftId,
  disabled,
}: DescriptionEditorProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [tone, setTone] = useState<'professional' | 'warm' | 'luxury'>('professional');

  const regenerate = useAction(api.listingAnalysis.regenerateDescription);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newDescription = await regenerate({ draftId, tone });
      onChange(newDescription);
    } catch (error) {
      console.error('Error regenerating description:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Property Description</Label>
        <div className="flex items-center gap-2">
          <Select value={tone} onValueChange={(value: any) => setTone(value)} disabled={disabled || isRegenerating}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="warm">Warm & Inviting</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={disabled || isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={description}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isRegenerating}
          rows={8}
          className="resize-none"
          placeholder="AI will generate a compelling description based on your property details and photos..."
        />
        {isRegenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is writing a new description...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-primary">AI-Generated Description</p>
          <p className="text-xs text-muted-foreground mt-1">
            Feel free to edit this description or regenerate with a different tone.
            The AI has analyzed your photos and property details to create compelling copy.
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Tips for great descriptions:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Highlight unique features and recent updates</li>
          <li>Describe the lifestyle and neighborhood</li>
          <li>Use sensory language to help buyers imagine living there</li>
          <li>Keep it concise but informative (3-4 paragraphs ideal)</li>
        </ul>
      </div>
    </div>
  );
}
