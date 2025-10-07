import { OpenRouterClient, ChatMessage } from './client';

export interface ListingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: string;
  description: string;
  features: string[];
}

export interface MarketingContent {
  listingDescription: string;
  socialMediaPosts: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  emailTemplate: string;
  hashtags: string[];
}

export class MarketingGenerator {
  private client: OpenRouterClient;

  constructor() {
    this.client = new OpenRouterClient();
  }

  async generateFullMarketing(listing: ListingInfo): Promise<MarketingContent> {
    const systemPrompt = `You are a professional real estate marketing copywriter. Generate compelling, accurate, and engaging marketing content for property listings. Focus on highlighting key features, location benefits, and value propositions. Keep tone professional yet warm. Use emojis appropriately for social media posts.`;

    const userPrompt = `Generate complete marketing content for this property:

Address: ${listing.address}
City: ${listing.city}, ${listing.state} ${listing.zipCode}
Price: $${listing.price.toLocaleString()}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}
Square Feet: ${listing.sqft.toLocaleString()}
${listing.lotSize ? `Lot Size: ${listing.lotSize.toLocaleString()} sqft` : ''}
${listing.yearBuilt ? `Year Built: ${listing.yearBuilt}` : ''}
Property Type: ${listing.propertyType}
Features: ${listing.features.join(', ')}

Generate:
1. A professional 150-200 word listing description for MLS/website
2. A Facebook post (150 words max, engaging, includes emojis)
3. An Instagram post (shorter, emoji-heavy, includes call-to-action)
4. A Twitter/X post (280 characters max)
5. An email template for agent's client list (professional tone)
6. 8-10 relevant hashtags for social media

Format your response as JSON with this structure:
{
  "listingDescription": "...",
  "socialMediaPosts": {
    "facebook": "...",
    "instagram": "...",
    "twitter": "..."
  },
  "emailTemplate": "...",
  "hashtags": ["tag1", "tag2", ...]
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.client.chat(messages, {
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse marketing content');
      }

      const marketingContent: MarketingContent = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!marketingContent.listingDescription || 
          !marketingContent.socialMediaPosts || 
          !marketingContent.emailTemplate ||
          !marketingContent.hashtags) {
        throw new Error('Incomplete marketing content generated');
      }

      return marketingContent;
    } catch (error: any) {
      console.error('Marketing generation error:', error);
      // Fall back to template-based generation if AI fails
      return this.generateTemplateMarketing(listing);
    }
  }

  async generateListingDescription(listing: ListingInfo): Promise<string> {
    const systemPrompt = `You are a professional real estate copywriter. Write compelling property descriptions that highlight key features and sell the lifestyle. Keep descriptions between 150-200 words.`;

    const userPrompt = `Write a professional listing description for:
${listing.bedrooms}BR/${listing.bathrooms}BA ${listing.propertyType} in ${listing.city}, ${listing.state}
Price: $${listing.price.toLocaleString()}
Size: ${listing.sqft.toLocaleString()} sqft
Features: ${listing.features.join(', ')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.client.chat(messages, {
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || this.generateTemplateDescription(listing);
    } catch (error) {
      return this.generateTemplateDescription(listing);
    }
  }

  async generateSocialPost(listing: ListingInfo, platform: 'facebook' | 'instagram' | 'twitter'): Promise<string> {
    const platformGuidelines = {
      facebook: 'Write a 100-150 word Facebook post. Engaging, informative, includes emojis. Use 2-3 paragraphs.',
      instagram: 'Write an Instagram post. Short, emoji-heavy, includes call-to-action. 80-100 words max.',
      twitter: 'Write a Twitter/X post. 250 characters max. Concise, includes 1-2 emojis and key details.',
    };

    const systemPrompt = `You are a social media marketing expert for real estate. ${platformGuidelines[platform]}`;

    const userPrompt = `Create a ${platform} post for:
${listing.address}
${listing.bedrooms}BR/${listing.bathrooms}BA | ${listing.sqft.toLocaleString()} sqft
${listing.city}, ${listing.state} | $${listing.price.toLocaleString()}
Features: ${listing.features.slice(0, 3).join(', ')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.client.chat(messages, {
        temperature: 0.8,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || this.generateTemplateSocialPost(listing, platform);
    } catch (error) {
      return this.generateTemplateSocialPost(listing, platform);
    }
  }

  // Fallback template-based generation
  private generateTemplateMarketing(listing: ListingInfo): MarketingContent {
    return {
      listingDescription: this.generateTemplateDescription(listing),
      socialMediaPosts: {
        facebook: this.generateTemplateSocialPost(listing, 'facebook'),
        instagram: this.generateTemplateSocialPost(listing, 'instagram'),
        twitter: this.generateTemplateSocialPost(listing, 'twitter'),
      },
      emailTemplate: this.generateTemplateEmail(listing),
      hashtags: this.generateHashtags(listing),
    };
  }

  private generateTemplateDescription(listing: ListingInfo): string {
    return `Welcome to this stunning ${listing.bedrooms}-bedroom, ${listing.bathrooms}-bathroom ${listing.propertyType} located in the desirable ${listing.city} area. This beautiful home offers ${listing.sqft.toLocaleString()} square feet of well-designed living space${listing.lotSize ? ` on a ${listing.lotSize.toLocaleString()} square foot lot` : ''}. 

Key features include ${listing.features.slice(0, 5).join(', ')}, making this property perfect for those seeking comfort and style. ${listing.yearBuilt ? `Built in ${listing.yearBuilt}, this home` : 'This home'} combines modern amenities with timeless appeal.

Priced at $${listing.price.toLocaleString()}, this exceptional property offers incredible value in today's market. Don't miss the opportunity to make this house your home!`;
  }

  private generateTemplateSocialPost(listing: ListingInfo, platform: string): string {
    if (platform === 'facebook') {
      return `🏡 NEW LISTING ALERT! 🏡

Just listed this gorgeous ${listing.bedrooms}BR/${listing.bathrooms}BA home in ${listing.city}! 

✨ ${listing.sqft.toLocaleString()} sqft of beautiful living space
💰 $${listing.price.toLocaleString()}
📍 ${listing.city}, ${listing.state}

Featuring ${listing.features.slice(0, 3).join(', ')} and so much more! This one won't last long.

Interested? Send me a message or call to schedule your private showing today!

#RealEstate #HomeForSale #${listing.city.replace(/\s+/g, '')} #NewListing #DreamHome`;
    }

    if (platform === 'instagram') {
      return `✨ Just Listed! ✨

${listing.bedrooms}🛏️ ${listing.bathrooms}🛁 | ${listing.sqft.toLocaleString()} sqft
📍 ${listing.city}, ${listing.state}
💰 $${listing.price.toLocaleString()}

${listing.features[0]} 🌟
${listing.features[1] || 'Perfect location'} 🏘️

DM me for details or to schedule a showing! 👋

#NewListing #${listing.city}Homes #RealEstate #HomeForSale #DreamHome #HouseHunting`;
    }

    // Twitter
    return `🏠 NEW: ${listing.bedrooms}BR/${listing.bathrooms}BA in ${listing.city} - $${listing.price.toLocaleString()}. ${listing.features[0]}. DM for showing! #RealEstate #${listing.city}`;
  }

  private generateTemplateEmail(listing: ListingInfo): string {
    return `Subject: NEW LISTING: ${listing.address}

Hi there,

I'm excited to share this incredible new listing with you!

🏡 ${listing.address}
${listing.city}, ${listing.state} ${listing.zipCode}

${listing.bedrooms} Bedrooms | ${listing.bathrooms} Bathrooms | ${listing.sqft.toLocaleString()} sqft
💰 $${listing.price.toLocaleString()}

This beautiful ${listing.propertyType} features:
${listing.features.slice(0, 5).map(f => `• ${f}`).join('\n')}

${listing.yearBuilt ? `Built in ${listing.yearBuilt}, ` : ''}This home offers the perfect blend of comfort and style in a great ${listing.city} location.

Interested in learning more or scheduling a showing? Simply reply to this email or give me a call!

I'd love to show you this property before it's gone.

Best regards,
Your Real Estate Agent

P.S. Properties in this price range and location don't last long – let me know if you'd like to see it soon!`;
  }

  private generateHashtags(listing: ListingInfo): string[] {
    const base = [
      'RealEstate',
      'HomeForSale',
      'HouseHunting',
      'NewListing',
      listing.city.replace(/\s+/g, ''),
      `${listing.city.replace(/\s+/g, '')}Homes`,
      listing.state,
      listing.propertyType.replace(/-/g, ''),
    ];

    // Add contextual hashtags
    if (listing.price < 300000) base.push('AffordableHomes', 'FirstTimeHomeBuyer');
    if (listing.price > 800000) base.push('LuxuryHomes', 'LuxuryRealEstate');
    if (listing.bedrooms >= 4) base.push('FamilyHome');
    if (listing.features.some(f => f.toLowerCase().includes('pool'))) base.push('PoolHome');
    if (listing.features.some(f => f.toLowerCase().includes('modern'))) base.push('ModernHome');

    return base.slice(0, 10);
  }
}

// Singleton instance
export const marketingGenerator = new MarketingGenerator();
