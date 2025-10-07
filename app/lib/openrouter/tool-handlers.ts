// Helper functions to check if API keys are available
function hasRentCastKey(): boolean {
  return !!process.env.RENTCAST_API_KEY;
}

function hasRapidAPIKey(): boolean {
  return !!process.env.RAPIDAPI_KEY;
}

function hasGooglePlacesKey(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

export async function calculateComparables(args: {
  address: string;
  radius: number;
  minBeds?: number;
  maxPrice?: number;
}) {
  // Try RentCast API first
  if (hasRentCastKey()) {
    try {
      console.log('Fetching comparables from RentCast API...');
      const response = await fetch(
        `https://api.rentcast.io/v1/properties/comps?` +
        `address=${encodeURIComponent(args.address)}&` +
        `radius=${args.radius || 1}&` +
        `bedrooms=${args.minBeds || ''}`,
        {
          headers: {
            'X-Api-Key': process.env.RENTCAST_API_KEY!,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const comparables = data.slice(0, 10).map((prop: any) => ({
            address: prop.formattedAddress || prop.address || 'Unknown',
            city: prop.city || '',
            state: prop.state || '',
            salePrice: prop.price || prop.lastSalePrice || 0,
            saleDate: prop.lastSaleDate || new Date().toISOString().split('T')[0],
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms || 0,
            sqft: prop.squareFootage || 0,
            pricePerSqft: prop.squareFootage ? Math.round((prop.price || prop.lastSalePrice) / prop.squareFootage) : 0,
            daysOnMarket: prop.daysOnMarket || 0,
            distance: prop.distance || 0,
          }));

          const prices = comparables.map((c: any) => c.salePrice).filter((p: number) => p > 0);
          const avgPricePerSqft = comparables
            .map((c: any) => c.pricePerSqft)
            .filter((p: number) => p > 0)
            .reduce((sum: number, p: number) => sum + p, 0) / comparables.length;
          const avgDaysOnMarket = comparables
            .map((c: any) => c.daysOnMarket)
            .filter((d: number) => d > 0)
            .reduce((sum: number, d: number) => sum + d, 0) / comparables.length;

          console.log('✅ RentCast API returned', comparables.length, 'comparables');
          
          return {
            comparables,
            summary: {
              count: comparables.length,
              avgPricePerSqft: Math.round(avgPricePerSqft) || 0,
              avgDaysOnMarket: Math.round(avgDaysOnMarket) || 0,
              priceRange: {
                low: Math.min(...prices),
                high: Math.max(...prices),
              },
            },
          };
        }
      } else {
        console.warn('RentCast API failed with status:', response.status);
      }
    } catch (error) {
      console.error('RentCast API error:', error);
    }
  } else {
    console.log('⚠️ RentCast API key not configured, using mock data');
  }

  // Fallback to mock data
  console.log('Using mock data for comparables');
  const mockComps = [
    {
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      salePrice: 1200000,
      saleDate: '2024-01-15',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      pricePerSqft: 667,
      daysOnMarket: 21,
      distance: 0.3,
    },
    {
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      salePrice: 1350000,
      saleDate: '2024-02-01',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2000,
      pricePerSqft: 675,
      daysOnMarket: 14,
      distance: 0.5,
    },
    {
      address: '789 Pine Rd',
      city: 'San Francisco',
      state: 'CA',
      salePrice: 1100000,
      saleDate: '2023-12-10',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1600,
      pricePerSqft: 688,
      daysOnMarket: 35,
      distance: 0.7,
    },
  ];

  const avgPricePerSqft = mockComps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / mockComps.length;
  const avgDaysOnMarket = mockComps.reduce((sum, comp) => sum + comp.daysOnMarket, 0) / mockComps.length;

  return {
    comparables: mockComps,
    summary: {
      count: mockComps.length,
      avgPricePerSqft: Math.round(avgPricePerSqft),
      avgDaysOnMarket: Math.round(avgDaysOnMarket),
      priceRange: {
        low: Math.min(...mockComps.map(c => c.salePrice)),
        high: Math.max(...mockComps.map(c => c.salePrice)),
      },
    },
  };
}

export function calculateMortgage(args: {
  price: number;
  downPayment: number;
  interestRate: number;
  termYears?: number;
}) {
  const principal = args.price - args.downPayment;
  const monthlyRate = args.interestRate / 100 / 12;
  const numPayments = (args.termYears || 30) * 12;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;
  
  return {
    loanAmount: Math.round(principal),
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    downPaymentPercent: Math.round((args.downPayment / args.price) * 100),
    termYears: args.termYears || 30,
    interestRate: args.interestRate,
  };
}

export async function getSchoolRatings(args: {
  address: string;
  zipCode: string;
}) {
  // TODO: Replace with actual GreatSchools API integration
  
  return {
    elementary: [
      {
        name: 'Lincoln Elementary School',
        rating: 9,
        distance: 0.8,
        grades: 'K-5',
        type: 'Public',
      },
    ],
    middle: [
      {
        name: 'Roosevelt Middle School',
        rating: 8,
        distance: 1.2,
        grades: '6-8',
        type: 'Public',
      },
    ],
    high: [
      {
        name: 'Washington High School',
        rating: 7,
        distance: 2.1,
        grades: '9-12',
        type: 'Public',
      },
    ],
  };
}

export async function getWalkScore(args: {
  address: string;
  lat: number;
  lng: number;
}) {
  // TODO: Replace with actual Walk Score API integration
  
  return {
    walkScore: 85,
    walkDescription: 'Very Walkable - Most errands can be accomplished on foot',
    transitScore: 72,
    transitDescription: 'Excellent Transit - Many public transportation options',
    bikeScore: 78,
    bikeDescription: 'Very Bikeable - Biking is convenient for most trips',
  };
}

export async function getNearbyAmenities(args: {
  lat: number;
  lng: number;
  radius: number;
  types?: string[];
}) {
  // Try Google Places API
  if (hasGooglePlacesKey()) {
    try {
      console.log('Fetching amenities from Google Places API...');
      const radiusMeters = args.radius * 1609.34; // miles to meters
      
      const [restaurantsRes, groceryRes, parksRes] = await Promise.all([
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${args.lat},${args.lng}&` +
          `radius=${radiusMeters}&` +
          `type=restaurant&` +
          `key=${process.env.GOOGLE_PLACES_API_KEY}`
        ),
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${args.lat},${args.lng}&` +
          `radius=${radiusMeters}&` +
          `type=grocery_or_supermarket&` +
          `key=${process.env.GOOGLE_PLACES_API_KEY}`
        ),
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${args.lat},${args.lng}&` +
          `radius=${radiusMeters}&` +
          `type=park&` +
          `key=${process.env.GOOGLE_PLACES_API_KEY}`
        ),
      ]);

      const [restaurants, grocery, parks] = await Promise.all([
        restaurantsRes.json(),
        groceryRes.json(),
        parksRes.json(),
      ]);

      console.log('✅ Google Places API returned data');

      return {
        groceryStores: (grocery.results || []).slice(0, 3).map((p: any) => ({
          name: p.name,
          distance: 0, // Would need Distance Matrix API
          rating: p.rating || 0,
        })),
        restaurants: (restaurants.results || []).slice(0, 5).map((p: any) => ({
          name: p.name,
          distance: 0,
          rating: p.rating || 0,
          cuisine: p.types?.[0] || 'Unknown',
        })),
        parks: (parks.results || []).slice(0, 3).map((p: any) => ({
          name: p.name,
          distance: 0,
          acres: 0,
        })),
        schools: [],
        transit: [],
      };
    } catch (error) {
      console.error('Google Places API error:', error);
    }
  } else {
    console.log('⚠️ Google Places API key not configured, using mock data');
  }
  
  // Fallback to mock data
  console.log('Using mock data for amenities');
  return {
    groceryStores: [
      { name: 'Whole Foods Market', distance: 0.4, rating: 4.3 },
      { name: 'Safeway', distance: 0.6, rating: 4.1 },
    ],
    restaurants: [
      { name: 'The Local Bistro', distance: 0.2, rating: 4.5, cuisine: 'American' },
      { name: 'Sushi Place', distance: 0.3, rating: 4.6, cuisine: 'Japanese' },
    ],
    parks: [
      { name: 'Central Park', distance: 0.5, acres: 12.5 },
    ],
    schools: [
      { name: 'Lincoln Elementary', distance: 0.8, rating: 9 },
    ],
    transit: [
      { name: 'Main St Station', distance: 0.3, type: 'Bus' },
      { name: 'Downtown BART', distance: 1.2, type: 'Train' },
    ],
  };
}

export async function getMarketTrends(args: {
  city: string;
  state: string;
  zipCode?: string;
}) {
  // Try RentCast API for market statistics
  if (hasRentCastKey()) {
    try {
      console.log('Fetching market trends from RentCast API...');
      const response = await fetch(
        `https://api.rentcast.io/v1/listings/sale?` +
        `city=${encodeURIComponent(args.city)}&` +
        `state=${args.state}&` +
        `limit=50`,
        {
          headers: {
            'X-Api-Key': process.env.RENTCAST_API_KEY!,
          },
        }
      );

      if (response.ok) {
        const listings = await response.json();
        
        if (Array.isArray(listings) && listings.length > 0) {
          const prices = listings.map((l: any) => l.price).filter((p: number) => p > 0);
          const sqfts = listings.map((l: any) => l.squareFootage).filter((s: number) => s > 0);
          const pricesPerSqft = listings
            .filter((l: any) => l.price > 0 && l.squareFootage > 0)
            .map((l: any) => l.price / l.squareFootage);
          
          const sortedPrices = [...prices].sort((a, b) => a - b);
          const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
          const medianPricePerSqft = pricesPerSqft.length > 0
            ? pricesPerSqft.sort((a, b) => a - b)[Math.floor(pricesPerSqft.length / 2)]
            : 0;
          
          const daysOnMarket = listings
            .map((l: any) => l.daysOnMarket || 0)
            .filter((d: number) => d > 0);
          const avgDaysOnMarket = daysOnMarket.length > 0
            ? daysOnMarket.reduce((sum: number, d: number) => sum + d, 0) / daysOnMarket.length
            : 28;

          console.log('✅ RentCast API returned market data for', listings.length, 'listings');

          return {
            medianSalePrice: Math.round(medianPrice),
            medianPricePerSqft: Math.round(medianPricePerSqft),
            averageDaysOnMarket: Math.round(avgDaysOnMarket),
            inventoryLevel: listings.length < 20 ? 'Low' : listings.length < 50 ? 'Medium' : 'High',
            priceChange1Month: 2.3, // Would need historical data
            priceChange3Month: 5.1,
            priceChange1Year: 8.7,
            salesVolume: listings.length,
            activeListings: listings.length,
            newListings: Math.round(listings.length * 0.3),
            marketTemperature: avgDaysOnMarket < 20 ? 'Hot' : avgDaysOnMarket > 40 ? 'Cold' : 'Warm',
            buyerDemand: listings.length < 30 ? 'High' : 'Medium',
          };
        }
      } else {
        console.warn('RentCast API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Market trends API error:', error);
    }
  } else {
    console.log('⚠️ RentCast API key not configured, using mock data');
  }
  
  // Fallback to mock data
  console.log('Using mock data for market trends');
  return {
    medianSalePrice: 1250000,
    medianPricePerSqft: 680,
    averageDaysOnMarket: 28,
    inventoryLevel: 'Low',
    priceChange1Month: 2.3,
    priceChange3Month: 5.1,
    priceChange1Year: 8.7,
    salesVolume: 145,
    activeListings: 234,
    newListings: 42,
    marketTemperature: 'Hot',
    buyerDemand: 'High',
  };
}

export async function searchProperties(args: {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  cities?: string[];
  propertyTypes?: string[];
  features?: string[];
}) {
  // Note: This function is called from the API route which has access to Convex
  // We return instructions for the AI to interpret
  console.log('Search properties tool called with:', args);
  
  return {
    searchCriteria: args,
    note: 'This will search the database for matching properties. The API route will handle the actual Convex query.',
  };
}

export async function executeToolCall(toolName: string, args: any): Promise<any> {
  switch (toolName) {
    case 'search_properties':
      return await searchProperties(args);
    case 'calculate_comparables':
      return await calculateComparables(args);
    case 'calculate_mortgage':
      return calculateMortgage(args);
    case 'get_school_ratings':
      return await getSchoolRatings(args);
    case 'get_walk_score':
      return await getWalkScore(args);
    case 'get_nearby_amenities':
      return await getNearbyAmenities(args);
    case 'get_market_trends':
      return await getMarketTrends(args);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
