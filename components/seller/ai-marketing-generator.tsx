'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  Sparkles, 
  Copy, 
  Check,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Loader2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIMarketingGeneratorProps {
  listingId: Id<"listings">;
  agentId: Id<"agents">;
}

export default function AIMarketingGenerator({ listingId, agentId }: AIMarketingGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const campaign = useQuery(api.marketing.getCampaignByListing, { listingId });
  const generateMarketing = useAction(api.marketing.generateMarketing);
  const saveCampaign = useMutation(api.marketing.saveCampaign);
  
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const content = await generateMarketing({ listingId });
      
      await saveCampaign({
        listingId,
        agentId,
        type: "full",
        generatedContent: content,
        status: "draft",
      });
      
      toast({
        title: "Marketing content generated!",
        description: "Your AI-powered marketing materials are ready to use.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate marketing content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!campaign && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Marketing Generator
          </CardTitle>
          <CardDescription>
            Generate professional marketing content for your listing in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-16 w-16 mx-auto text-primary mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Ready to market your property?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Our AI will generate:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Listing Description</p>
                  <p className="text-xs text-muted-foreground">Professional copy</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Facebook className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Social Media Posts</p>
                  <p className="text-xs text-muted-foreground">Facebook, Instagram, Twitter</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email Template</p>
                  <p className="text-xs text-muted-foreground">Ready to send</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Hashtags</p>
                  <p className="text-xs text-muted-foreground">Optimized for reach</p>
                </div>
              </div>
            </div>
            <Button onClick={handleGenerate} size="lg" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Marketing Content
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Takes about 10-15 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating your marketing content...</h3>
            <p className="text-sm text-muted-foreground">
              Our AI is crafting professional marketing materials for your listing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Marketing
            </CardTitle>
            <CardDescription>
              Professional marketing content ready to use
            </CardDescription>
          </div>
          <Button onClick={handleGenerate} variant="outline" size="sm" disabled={isGenerating}>
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="listing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listing">
              <FileText className="h-4 w-4 mr-2" />
              Listing
            </TabsTrigger>
            <TabsTrigger value="social">
              <Facebook className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="hashtags">
              <Sparkles className="h-4 w-4 mr-2" />
              Tags
            </TabsTrigger>
          </TabsList>

          {/* Listing Description */}
          <TabsContent value="listing" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Property Description</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.generatedContent.listingDescription || '', 'listing')}
                >
                  {copiedField === 'listing' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Textarea
                value={campaign.generatedContent.listingDescription}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>

          {/* Social Media Posts */}
          <TabsContent value="social" className="space-y-4">
            {campaign.generatedContent.socialMediaPosts && (
              <>
                {/* Facebook */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(campaign.generatedContent.socialMediaPosts?.facebook || '', 'facebook')}
                    >
                      {copiedField === 'facebook' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={campaign.generatedContent.socialMediaPosts.facebook}
                    readOnly
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      Instagram
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(campaign.generatedContent.socialMediaPosts?.instagram || '', 'instagram')}
                    >
                      {copiedField === 'instagram' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={campaign.generatedContent.socialMediaPosts.instagram}
                    readOnly
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Twitter/X
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(campaign.generatedContent.socialMediaPosts?.twitter || '', 'twitter')}
                    >
                      {copiedField === 'twitter' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={campaign.generatedContent.socialMediaPosts.twitter}
                    readOnly
                    className="min-h-[80px] font-mono text-sm"
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Email Template */}
          <TabsContent value="email" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Email to Client List</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.generatedContent.emailTemplate || '', 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Textarea
                value={campaign.generatedContent.emailTemplate}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </TabsContent>

          {/* Hashtags */}
          <TabsContent value="hashtags" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Recommended Hashtags</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.generatedContent.hashtags.map((h: string) => `#${h}`).join(' '), 'hashtags')}
                >
                  {copiedField === 'hashtags' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.generatedContent.hashtags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-primary">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Click copy to get all hashtags formatted for social media
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Copy and paste this content to your social media, email platform, or MLS listing. Feel free to edit and personalize!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
