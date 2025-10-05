import { OpenRouterClient } from './client';

export interface ListingData {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  description: string;
  features: string[];
  yearBuilt?: number;
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

  async generateListingDescription(listing: ListingData): Promise<string> {
    const prompt = `Write a compelling real estate listing description for the following property. Make it engaging, highlight key features, and appeal to potential buyers. Keep it professional but warm.

Property Details:
- Address: ${listing.address}, ${listing.city}, ${listing.state}
- Price: $${listing.price.toLocaleString()}
- ${listing.bedrooms} bedrooms, ${listing.bathrooms} bathrooms
- ${listing.sqft.toLocaleString()} sqft
- Property Type: ${listing.propertyType}
${listing.yearBuilt ? `- Year Built: ${listing.yearBuilt}` : ''}
- Features: ${listing.features.join(', ')}

Current Description: ${listing.description}

Generate an improved, professionally written listing description (3-4 paragraphs, 150-200 words). Focus on lifestyle benefits, not just features.`;

    const response = await this.client.chat([
      {
        role: 'system',
        content: 'You are a professional real estate copywriter who creates compelling property descriptions that sell homes.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ] as any, { temperature: 0.8 });

    return response.choices[0]?.message?.content || '';
  }

  async generateSocialMediaPosts(listing: ListingData): Promise<{
    facebook: string;
    instagram: string;
    twitter: string;
  }> {
    const prompt = `Create 3 engaging social media posts for this property listing:

Property: ${listing.address}, ${listing.city}, ${listing.state}
Price: $${listing.price.toLocaleString()}
${listing.bedrooms} bed, ${listing.bathrooms} bath, ${listing.sqft.toLocaleString()} sqft
Type: ${listing.propertyType}
Key Features: ${listing.features.slice(0, 5).join(', ')}

Create:
1. FACEBOOK POST (100-150 words): Warm, detailed, community-focused
2. INSTAGRAM CAPTION (80-100 words): Visual, lifestyle-focused, with emojis
3. TWITTER/X POST (200-250 characters): Concise, punchy, attention-grabbing

Format each clearly labeled. Include relevant real estate hashtags for each platform.`;

    const response = await this.client.chat([
      {
        role: 'system',
        content: 'You are a social media marketing expert for real estate. You create engaging posts that drive traffic and interest.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ] as any, { temperature: 0.9 });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the response to extract each platform's post
    const facebookMatch = content.match(/FACEBOOK.*?:([\s\S]*?)(?=INSTAGRAM|$)/i);
    const instagramMatch = content.match(/INSTAGRAM.*?:([\s\S]*?)(?=TWITTER|X POST|$)/i);
    const twitterMatch = content.match(/(?:TWITTER|X POST).*?:([\s\S]*?)$/i);

    return {
      facebook: facebookMatch?.[1].trim() || content,
      instagram: instagramMatch?.[1].trim() || content,
      twitter: twitterMatch?.[1].trim() || content.substring(0, 250),
    };
  }

  async generateEmailTemplate(listing: ListingData): Promise<string> {
    const prompt = `Create an email template for agents to send to their client list about this new listing:

Property: ${listing.address}, ${listing.city}, ${listing.state}
Price: $${listing.price.toLocaleString()}
${listing.bedrooms} bed, ${listing.bathrooms} bath, ${listing.sqft.toLocaleString()} sqft
Features: ${listing.features.join(', ')}

Create a professional email template with:
- Catchy subject line
- Engaging opening
- Key property highlights
- Call to action
- Professional closing

Format: Subject line, then email body. Keep it warm but professional.`;

    const response = await this.client.chat([
      {
        role: 'system',
        content: 'You are a real estate email marketing specialist who creates emails that get opened and generate leads.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ] as any, { temperature: 0.8 });

    return response.choices[0]?.message?.content || '';
  }

  async generateAllMarketing(listing: ListingData): Promise<MarketingContent> {
    // Generate all content in parallel for speed
    const [listingDescription, socialMediaPosts, emailTemplate] = await Promise.all([
      this.generateListingDescription(listing),
      this.generateSocialMediaPosts(listing),
      this.generateEmailTemplate(listing),
    ]);

    // Generate hashtags based on property
    const hashtags = this.generateHashtags(listing);

    return {
      listingDescription,
      socialMediaPosts,
      emailTemplate,
      hashtags,
    };
  }

  private generateHashtags(listing: ListingData): string[] {
    const hashtags = [
      'RealEstate',
      'HomeForSale',
      'HouseHunting',
      listing.city.replace(/\s+/g, ''),
      listing.state,
    ];

    // Add property type specific hashtags
    if (listing.propertyType.includes('single-family')) {
      hashtags.push('SingleFamilyHome', 'DreamHome');
    } else if (listing.propertyType.includes('condo')) {
      hashtags.push('CondoLiving', 'UrbanLiving');
    } else if (listing.propertyType.includes('townhouse')) {
      hashtags.push('Townhouse', 'ModernLiving');
    }

    // Add feature-based hashtags
    if (listing.features.some(f => f.toLowerCase().includes('pool'))) {
      hashtags.push('PoolHome');
    }
    if (listing.features.some(f => f.toLowerCase().includes('garage'))) {
      hashtags.push('GarageIncluded');
    }
    if (listing.features.some(f => f.toLowerCase().includes('updated'))) {
      hashtags.push('UpdatedHome', 'MoveInReady');
    }

    return hashtags;
  }
}
