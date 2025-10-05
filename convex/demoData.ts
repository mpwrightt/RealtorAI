import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

// Check if user is the demo admin
export const isDemoAdmin = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return args.email === "mawrigh602@gmail.com";
  },
});

// Create comprehensive demo data for presentation
export const createDemoData = mutation({
  args: {
    externalId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify this is the demo admin
    if (args.email !== "mawrigh602@gmail.com") {
      throw new Error("Unauthorized: Demo data can only be created for demo admin");
    }

    // Find or create user
    let user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        externalId: args.externalId,
        name: "Matthew Wright",
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Check if agent already exists
    let agent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();

    if (!agent) {
      const inviteCode = nanoid(12);
      const agentId = await ctx.db.insert("agents", {
        userId: user._id,
        agencyName: "Wright Realty Group",
        licenseNumber: "CA-DRE-01234567",
        email: args.email,
        phone: "+1 (555) 123-4567",
        bio: "Award-winning real estate professional with 15+ years of experience in the San Francisco Bay Area. Specializing in luxury residential properties and first-time homebuyers. My commitment is to provide exceptional service and expert guidance throughout your real estate journey.",
        inviteCode,
        active: true,
        createdAt: Date.now(),
      });
      agent = await ctx.db.get(agentId);
    }

    if (!agent) {
      throw new Error("Failed to create agent");
    }

    // Clear existing demo listings for this agent
    const existingListings = await ctx.db
      .query("listings")
      .withIndex("byAgentId", (q) => q.eq("agentId", agent._id))
      .collect();
    
    for (const listing of existingListings) {
      await ctx.db.delete(listing._id);
    }

    // Create 15 diverse property listings
    const listings = await createDemoListings(ctx, agent._id);

    // Create 5 buyer sessions with different preferences
    const buyerSessions = await createDemoBuyerSessions(ctx, agent._id);

    // Create 3 seller sessions
    const sellerSessions = await createDemoSellerSessions(ctx, agent._id, listings.slice(0, 3).map(l => l._id));

    // Create property views for analytics
    await createDemoPropertyViews(ctx, buyerSessions, listings);

    // Create offers
    await createDemoOffers(ctx, buyerSessions, listings);

    // Create agent interactions
    await createDemoInteractions(ctx, agent._id, buyerSessions);

    return {
      success: true,
      agent,
      stats: {
        listings: listings.length,
        buyerSessions: buyerSessions.length,
        sellerSessions: sellerSessions.length,
      },
      buyerSessionCodes: buyerSessions.map(s => s.sessionCode),
      sellerSessionCodes: sellerSessions.map(s => s.sessionCode),
    };
  },
});

// Helper function to create diverse listings
async function createDemoListings(ctx: any, agentId: any) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const listingsData = [
    {
      address: "2847 Steiner Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94123",
      price: 3250000,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 2800,
      lotSize: 0.12,
      yearBuilt: 2018,
      propertyType: "single-family",
      status: "active",
      description: "Stunning Victorian-style home in prestigious Pacific Heights. Completely renovated with modern luxury finishes while preserving original architectural details. Chef's kitchen with Thermador appliances, spa-like master bath, and private rear garden. Walk to Fillmore Street shopping and dining.",
      features: ["Bay Windows", "Hardwood Floors", "Marble Countertops", "Wine Cellar", "Smart Home", "Central AC", "Private Garden", "2-Car Garage"],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
      ],
      coordinates: { lat: 37.7989, lng: -122.4382 },
    },
    {
      address: "1255 Post Street, Unit 804",
      city: "San Francisco",
      state: "CA",
      zipCode: "94109",
      price: 1450000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1400,
      lotSize: 0,
      yearBuilt: 2020,
      propertyType: "condo",
      status: "active",
      description: "Modern luxury condo in the heart of Nob Hill. Floor-to-ceiling windows with panoramic city views. Open-concept living with European oak floors and Bosch appliances. Building amenities include fitness center, rooftop deck, and 24/7 concierge.",
      features: ["City Views", "Hardwood Floors", "Stainless Appliances", "In-Unit Laundry", "Gym", "Rooftop Deck", "Doorman", "1 Parking"],
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800",
      ],
      coordinates: { lat: 37.7886, lng: -122.4175 },
    },
    {
      address: "845 Alabama Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94110",
      price: 2100000,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2200,
      lotSize: 0.08,
      yearBuilt: 1920,
      propertyType: "townhouse",
      status: "active",
      description: "Charming Edwardian townhouse in vibrant Mission District. Beautifully updated with period details intact. Spacious living areas, chef's kitchen, private deck, and finished basement. Steps to Dolores Park, Valencia Street restaurants and cafes.",
      features: ["Original Details", "Updated Kitchen", "Deck", "Basement", "Hardwood Floors", "Gas Fireplace", "1-Car Parking"],
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      ],
      coordinates: { lat: 37.7599, lng: -122.4073 },
    },
    {
      address: "3356 Clay Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94118",
      price: 4950000,
      bedrooms: 5,
      bathrooms: 4.5,
      sqft: 4200,
      lotSize: 0.18,
      yearBuilt: 2019,
      propertyType: "single-family",
      status: "active",
      description: "Architectural masterpiece in Presidio Heights. Custom-built smart home with elevator, home theater, and panoramic views. Gourmet kitchen, luxurious master suite, landscaped garden with outdoor kitchen. Minutes to Presidio trails and beaches.",
      features: ["Elevator", "Home Theater", "Panoramic Views", "Smart Home", "Outdoor Kitchen", "Wine Room", "3-Car Garage", "Security System"],
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      ],
      coordinates: { lat: 37.7886, lng: -122.4516 },
    },
    {
      address: "456 Lombard Street, Unit 201",
      city: "San Francisco",
      state: "CA",
      zipCode: "94133",
      price: 975000,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 850,
      lotSize: 0,
      yearBuilt: 2015,
      propertyType: "condo",
      status: "active",
      description: "Bright and modern one-bedroom condo in North Beach. Open floor plan with high ceilings and large windows. Updated kitchen and bath, in-unit laundry. Perfect for first-time buyers or pied-à-terre. Walk to restaurants, nightlife, and waterfront.",
      features: ["High Ceilings", "Updated Kitchen", "In-Unit Laundry", "Deeded Parking", "Low HOA", "Pet Friendly"],
      images: [
        "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800",
        "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
      ],
      coordinates: { lat: 37.8024, lng: -122.4156 },
    },
    {
      address: "2134 Bush Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94115",
      price: 1850000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1950,
      lotSize: 0.06,
      yearBuilt: 1928,
      propertyType: "single-family",
      status: "pending",
      description: "Classic San Francisco home in Lower Pacific Heights. Original charm with modern updates. Bright living spaces, updated kitchen, and sunny backyard. Excellent Japantown location near shops, restaurants, and transit.",
      features: ["Original Charm", "Updated Kitchen", "Backyard", "Hardwood Floors", "Cove Ceilings", "1-Car Garage"],
      images: [
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
        "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800",
      ],
      coordinates: { lat: 37.7852, lng: -122.4321 },
    },
    {
      address: "789 Guerrero Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94110",
      price: 1650000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1600,
      lotSize: 0.05,
      yearBuilt: 2017,
      propertyType: "condo",
      status: "active",
      description: "Contemporary condo in the heart of the Mission. Sleek design with concrete floors, exposed ducts, and designer fixtures. Rooftop terrace with stunning city views. Prime location near Valencia Street corridor.",
      features: ["Rooftop Terrace", "Concrete Floors", "Modern Design", "City Views", "Walk Score 98", "Bike Storage", "1 Parking"],
      images: [
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ],
      coordinates: { lat: 37.7631, lng: -122.4241 },
    },
    {
      address: "5500 Grand Lake Drive",
      city: "San Antonio",
      state: "TX",
      zipCode: "78244",
      price: 575000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2850,
      lotSize: 0.25,
      yearBuilt: 2016,
      propertyType: "single-family",
      status: "active",
      description: "Spacious family home in desirable San Antonio neighborhood. Open-concept living with high ceilings and abundant natural light. Gourmet kitchen with granite counters and island. Master suite with spa bath. Large backyard with covered patio.",
      features: ["Open Concept", "Granite Counters", "Master Suite", "Covered Patio", "2-Car Garage", "Energy Efficient", "Community Pool"],
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ],
      coordinates: { lat: 29.5652, lng: -98.3003 },
    },
    {
      address: "156 Dolores Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      price: 2850000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2600,
      lotSize: 0.10,
      yearBuilt: 2021,
      propertyType: "townhouse",
      status: "active",
      description: "Brand new construction townhouse across from Dolores Park. Ultra-modern design with smart home technology throughout. Chef's kitchen, rooftop deck with BBQ and fire pit. Direct park views and incredible walkability.",
      features: ["New Construction", "Smart Home", "Rooftop Deck", "Park Views", "High-End Finishes", "Elevator", "2-Car Parking"],
      images: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
        "https://images.unsplash.com/photo-1600573472549-e86c06c0d6b6?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      ],
      coordinates: { lat: 37.7621, lng: -122.4263 },
    },
    {
      address: "2901 Broadway Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94115",
      price: 6750000,
      bedrooms: 6,
      bathrooms: 5.5,
      sqft: 5400,
      lotSize: 0.22,
      yearBuilt: 2020,
      propertyType: "single-family",
      status: "active",
      description: "Exceptional new construction estate in coveted Cow Hollow. Highest quality finishes throughout including Calacatta marble, custom millwork, and Gaggenau appliances. Home theater, gym, wine cellar, and landscaped gardens. Unparalleled luxury living.",
      features: ["New Construction", "Luxury Finishes", "Home Theater", "Gym", "Wine Cellar", "Garden", "4-Car Garage", "Smart Home"],
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
      ],
      coordinates: { lat: 37.7968, lng: -122.4389 },
    },
    {
      address: "1428 Valencia Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94110",
      price: 1250000,
      bedrooms: 2,
      bathrooms: 1.5,
      sqft: 1350,
      lotSize: 0.04,
      yearBuilt: 1910,
      propertyType: "condo",
      status: "active",
      description: "Charming Mission District condo with vintage details and modern updates. Cozy living space with fireplace, updated kitchen, and sunny bedroom. Deeded parking included. Walkable to everything the Mission has to offer.",
      features: ["Fireplace", "Updated Kitchen", "Deeded Parking", "Hardwood Floors", "Walk Score 99", "Near BART"],
      images: [
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
        "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800",
        "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800",
      ],
      coordinates: { lat: 37.7505, lng: -122.4211 },
    },
    {
      address: "678 Noe Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94114",
      price: 3100000,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3000,
      lotSize: 0.11,
      yearBuilt: 2019,
      propertyType: "single-family",
      status: "active",
      description: "Stunning contemporary home in Noe Valley. Light-filled open spaces with walls of glass overlooking private garden. High-end kitchen with breakfast bar, luxurious master suite, and bonus room. Premium location near shops and parks.",
      features: ["Contemporary Design", "Walls of Glass", "Garden", "Bonus Room", "High-End Kitchen", "2-Car Garage", "Radiant Heat"],
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      ],
      coordinates: { lat: 37.7503, lng: -122.4337 },
    },
    {
      address: "234 Green Street, Unit 5C",
      city: "San Francisco",
      state: "CA",
      zipCode: "94133",
      price: 1175000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      lotSize: 0,
      yearBuilt: 2018,
      propertyType: "condo",
      status: "active",
      description: "Modern Telegraph Hill condo with spectacular views. Open living/dining area leads to private balcony overlooking the bay. Chef's kitchen, spa bathroom, in-unit laundry. Building has gym and guest suite. Walk to Coit Tower and waterfront.",
      features: ["Bay Views", "Balcony", "Chef's Kitchen", "In-Unit Laundry", "Gym", "Guest Suite", "1 Parking"],
      images: [
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
      ],
      coordinates: { lat: 37.8013, lng: -122.4067 },
    },
    {
      address: "1567 Haight Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94117",
      price: 1450000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      lotSize: 0.06,
      yearBuilt: 1925,
      propertyType: "single-family",
      status: "pending",
      description: "Classic Victorian flat in the heart of Haight-Ashbury. Period details throughout including crown molding and bay windows. Updated kitchen and baths, hardwood floors, and private garden. Iconic San Francisco living.",
      features: ["Victorian Details", "Bay Windows", "Updated Kitchen", "Garden", "Hardwood Floors", "Near Golden Gate Park"],
      images: [
        "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      ],
      coordinates: { lat: 37.7701, lng: -122.4469 },
    },
    {
      address: "4521 California Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94118",
      price: 2650000,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2400,
      lotSize: 0.09,
      yearBuilt: 2020,
      propertyType: "townhouse",
      status: "active",
      description: "Sophisticated new townhouse in Inner Richmond. Three levels of luxury living with elevator, designer finishes, and private rooftop terrace. Gourmet kitchen, spa-inspired bathrooms, and smart home technology. Steps to Presidio and Golden Gate Park.",
      features: ["Elevator", "Rooftop Terrace", "New Construction", "Smart Home", "Designer Finishes", "2-Car Garage", "Near Parks"],
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
        "https://images.unsplash.com/photo-1600573472549-e86c06c0d6b6?w=800",
      ],
      coordinates: { lat: 37.7841, lng: -122.4623 },
    },
  ];

  const listings = [];
  for (let i = 0; i < listingsData.length; i++) {
    const data = listingsData[i];
    const listingId = await ctx.db.insert("listings", {
      agentId,
      ...data,
      videos: [],
      createdAt: now - (i * oneDay * 3), // Stagger creation dates
      updatedAt: now - (i * oneDay * 2),
    });
    const listing = await ctx.db.get(listingId);
    listings.push(listing);
  }

  return listings;
}

// Helper function to create buyer sessions
async function createDemoBuyerSessions(ctx: any, agentId: any) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const buyersData = [
    {
      buyerName: "Michael & Sarah Chen",
      buyerEmail: "chen.family@email.com",
      preferences: {
        minPrice: 1500000,
        maxPrice: 3000000,
        bedrooms: 3,
        bathrooms: 2,
        propertyTypes: ["single-family", "townhouse"],
        cities: ["San Francisco"],
        mustHaveFeatures: ["Parking", "Updated Kitchen", "Garden"],
      },
    },
    {
      buyerName: "Jessica Rodriguez",
      buyerEmail: "j.rodriguez@email.com",
      preferences: {
        minPrice: 900000,
        maxPrice: 1400000,
        bedrooms: 2,
        bathrooms: 1,
        propertyTypes: ["condo"],
        cities: ["San Francisco"],
        mustHaveFeatures: ["In-Unit Laundry", "Parking"],
      },
    },
    {
      buyerName: "David & Emma Thompson",
      buyerEmail: "thompson.home@email.com",
      preferences: {
        minPrice: 2000000,
        maxPrice: 4000000,
        bedrooms: 4,
        bathrooms: 3,
        propertyTypes: ["single-family"],
        cities: ["San Francisco"],
        mustHaveFeatures: ["Garden", "Garage", "Updated Kitchen"],
      },
    },
    {
      buyerName: "Alex Kim",
      buyerEmail: "alex.kim@email.com",
      preferences: {
        minPrice: 800000,
        maxPrice: 1200000,
        bedrooms: 1,
        bathrooms: 1,
        propertyTypes: ["condo"],
        cities: ["San Francisco"],
        mustHaveFeatures: ["Views", "Gym"],
      },
    },
    {
      buyerName: "Robert & Linda Martinez",
      buyerEmail: "martinez.family@email.com",
      preferences: {
        minPrice: 3000000,
        maxPrice: 6000000,
        bedrooms: 5,
        bathrooms: 4,
        propertyTypes: ["single-family"],
        cities: ["San Francisco"],
        mustHaveFeatures: ["Luxury Finishes", "Views", "Garage", "Smart Home"],
      },
    },
  ];

  const sessions = [];
  for (let i = 0; i < buyersData.length; i++) {
    const data = buyersData[i];
    const sessionCode = nanoid(16);
    const sessionId = await ctx.db.insert("buyerSessions", {
      agentId,
      ...data,
      sessionCode,
      active: true,
      createdAt: now - (i * oneDay * 5),
      lastActive: now - (i * oneDay),
    });
    const session = await ctx.db.get(sessionId);
    sessions.push(session);
  }

  return sessions;
}

// Helper function to create seller sessions
async function createDemoSellerSessions(ctx: any, agentId: any, listingIds: any[]) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const sellersData = [
    {
      sellerName: "Patricia Williams",
      sellerEmail: "p.williams@email.com",
    },
    {
      sellerName: "James Anderson",
      sellerEmail: "j.anderson@email.com",
    },
    {
      sellerName: "Maria Garcia",
      sellerEmail: "m.garcia@email.com",
    },
  ];

  const sessions = [];
  for (let i = 0; i < sellersData.length && i < listingIds.length; i++) {
    const data = sellersData[i];
    const sessionCode = nanoid(16);
    const sessionId = await ctx.db.insert("sellerSessions", {
      agentId,
      listingId: listingIds[i],
      ...data,
      sessionCode,
      active: true,
      createdAt: now - (i * oneDay * 4),
      lastActive: now - (i * oneDay * 2),
    });
    const session = await ctx.db.get(sessionId);
    sessions.push(session);
  }

  return sessions;
}

// Helper function to create property views
async function createDemoPropertyViews(ctx: any, buyerSessions: any[], listings: any[]) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Create 50-80 views across different buyers and properties
  const viewCount = 65;
  for (let i = 0; i < viewCount; i++) {
    const session = buyerSessions[Math.floor(Math.random() * buyerSessions.length)];
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const viewDuration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes

    await ctx.db.insert("propertyViews", {
      buyerSessionId: session._id,
      listingId: listing._id,
      timestamp: now - (daysAgo * oneDay),
      viewDuration,
      viewerType: "buyer",
      imagesViewed: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => i),
      videosWatched: [],
      sectionsVisited: ["details", "photos", Math.random() > 0.5 ? "map" : "features"],
    });
  }
}

// Helper function to create offers
async function createDemoOffers(ctx: any, buyerSessions: any[], listings: any[]) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const offersData = [
    {
      session: buyerSessions[0],
      listing: listings[0],
      amount: 3100000,
      status: "pending",
      daysAgo: 2,
    },
    {
      session: buyerSessions[1],
      listing: listings[4],
      amount: 950000,
      status: "accepted",
      daysAgo: 7,
    },
    {
      session: buyerSessions[2],
      listing: listings[3],
      amount: 4800000,
      status: "pending",
      daysAgo: 5,
    },
    {
      session: buyerSessions[3],
      listing: listings[1],
      amount: 1425000,
      status: "rejected",
      daysAgo: 14,
    },
    {
      session: buyerSessions[0],
      listing: listings[2],
      amount: 2050000,
      status: "countered",
      daysAgo: 10,
    },
  ];

  for (const data of offersData) {
    const offerAmount = data.amount;
    const downPayment = Math.floor(offerAmount * 0.2); // 20% down
    
    await ctx.db.insert("offers", {
      buyerSessionId: data.session._id,
      listingId: data.listing._id,
      offerAmount,
      earnestMoney: Math.floor(offerAmount * 0.01), // 1% earnest money
      downPayment,
      financingType: downPayment >= offerAmount * 0.5 ? "cash" : "conventional",
      contingencies: ["Inspection", "Financing", "Appraisal"],
      status: data.status,
      closingDate: new Date(now + (45 * oneDay)).toISOString().split('T')[0],
      aiAnalysis: {
        marketComparison: data.amount > data.listing.price ? "Above asking price" : "Below asking price",
        strengths: [
          "Strong offer relative to asking price",
          "Pre-approved financing",
          "Flexible closing date",
        ],
        risks: [
          "Competitive market may drive price higher",
          "Inspection could reveal issues",
        ],
        recommendation: data.amount > data.listing.price ? "Competitive offer, good chance of acceptance" : "Consider increasing offer amount",
        confidence: Math.floor(Math.random() * 30) + 70,
      },
      createdAt: now - (data.daysAgo * oneDay),
      updatedAt: now - (data.daysAgo * oneDay),
    });
  }
}

// Helper function to create agent interactions
async function createDemoInteractions(ctx: any, agentId: any, buyerSessions: any[]) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const interactionsData = [
    {
      session: buyerSessions[0],
      type: "email",
      subject: "Property Tour Request - 2847 Steiner Street",
      notes: "Clients interested in viewing this weekend. Very motivated buyers.",
      daysAgo: 3,
    },
    {
      session: buyerSessions[1],
      type: "call",
      subject: "Follow-up on 1255 Post Street",
      notes: "Discussed financing options and HOA fees. Will send pre-approval letter.",
      daysAgo: 5,
    },
    {
      session: buyerSessions[2],
      type: "meeting",
      subject: "In-person consultation",
      notes: "Met at office to review property options. Adjusted search criteria to focus on Noe Valley and Pacific Heights.",
      daysAgo: 8,
    },
    {
      session: buyerSessions[3],
      type: "email",
      subject: "New listings matching your criteria",
      notes: "Sent 3 new condo listings in North Beach and Telegraph Hill.",
      daysAgo: 1,
    },
    {
      session: buyerSessions[0],
      type: "call",
      subject: "Offer strategy discussion",
      notes: "Advised on competitive offer strategy for hot market. Discussed escalation clause.",
      daysAgo: 4,
    },
  ];

  for (const data of interactionsData) {
    await ctx.db.insert("agentInteractions", {
      sessionType: "buyer",
      sessionId: data.session._id,
      agentQuery: data.subject,
      agentResponse: data.notes,
      toolsUsed: [],
      timestamp: now - (data.daysAgo * oneDay),
    });
  }
}

// Clear all demo data for a fresh start
export const clearDemoData = mutation({
  args: {
    externalId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify this is the demo admin
    if (args.email !== "mawrigh602@gmail.com") {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (!user) {
      return { message: "No user found" };
    }

    const agent = await ctx.db
      .query("agents")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();

    if (!agent) {
      return { message: "No agent found" };
    }

    // Delete all related data
    const listings = await ctx.db
      .query("listings")
      .withIndex("byAgentId", (q) => q.eq("agentId", agent._id))
      .collect();
    
    for (const listing of listings) {
      await ctx.db.delete(listing._id);
    }

    const buyerSessions = await ctx.db
      .query("buyerSessions")
      .withIndex("byAgentId", (q) => q.eq("agentId", agent._id))
      .collect();
    
    for (const session of buyerSessions) {
      await ctx.db.delete(session._id);
    }

    const sellerSessions = await ctx.db
      .query("sellerSessions")
      .withIndex("byAgentId", (q) => q.eq("agentId", agent._id))
      .collect();
    
    for (const session of sellerSessions) {
      await ctx.db.delete(session._id);
    }

    return { message: "Demo data cleared successfully" };
  },
});
