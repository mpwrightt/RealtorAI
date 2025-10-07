export const calculateComparablesSchema = {
  type: 'function' as const,
  function: {
    name: 'calculate_comparables',
    description: 'Find and analyze comparable property sales in the area to determine fair market value',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Full property address to find comparables for',
        },
        radius: {
          type: 'number',
          description: 'Search radius in miles (typically 0.5 to 3 miles)',
        },
        minBeds: {
          type: 'number',
          description: 'Minimum number of bedrooms',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum sale price to consider',
        },
      },
      required: ['address', 'radius'],
    },
  },
};

export const calculateMortgageSchema = {
  type: 'function' as const,
  function: {
    name: 'calculate_mortgage',
    description: 'Calculate monthly mortgage payment, total interest, and amortization details',
    parameters: {
      type: 'object',
      properties: {
        price: {
          type: 'number',
          description: 'Purchase price of the property',
        },
        downPayment: {
          type: 'number',
          description: 'Down payment amount',
        },
        interestRate: {
          type: 'number',
          description: 'Annual interest rate as percentage (e.g., 6.5 for 6.5%)',
        },
        termYears: {
          type: 'number',
          description: 'Loan term in years (default: 30)',
        },
      },
      required: ['price', 'downPayment', 'interestRate'],
    },
  },
};

export const getSchoolRatingsSchema = {
  type: 'function' as const,
  function: {
    name: 'get_school_ratings',
    description: 'Get ratings and information for schools near a property',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Property address',
        },
        zipCode: {
          type: 'string',
          description: 'Property ZIP code',
        },
      },
      required: ['address', 'zipCode'],
    },
  },
};

export const getWalkScoreSchema = {
  type: 'function' as const,
  function: {
    name: 'get_walk_score',
    description: 'Get Walk Score, Transit Score, and Bike Score for a property location',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Full property address',
        },
        lat: {
          type: 'number',
          description: 'Latitude coordinate',
        },
        lng: {
          type: 'number',
          description: 'Longitude coordinate',
        },
      },
      required: ['address', 'lat', 'lng'],
    },
  },
};

export const getNearbyAmenitiesSchema = {
  type: 'function' as const,
  function: {
    name: 'get_nearby_amenities',
    description: 'Find nearby amenities like shops, restaurants, parks, and services',
    parameters: {
      type: 'object',
      properties: {
        lat: {
          type: 'number',
          description: 'Latitude coordinate',
        },
        lng: {
          type: 'number',
          description: 'Longitude coordinate',
        },
        radius: {
          type: 'number',
          description: 'Search radius in miles',
        },
        types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Types of amenities to search for (e.g., grocery, restaurant, park)',
        },
      },
      required: ['lat', 'lng', 'radius'],
    },
  },
};

export const getMarketTrendsSchema = {
  type: 'function' as const,
  function: {
    name: 'get_market_trends',
    description: 'Get real estate market trends and statistics for an area',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name',
        },
        state: {
          type: 'string',
          description: 'State code (e.g., CA, TX)',
        },
        zipCode: {
          type: 'string',
          description: 'ZIP code for more specific data',
        },
      },
      required: ['city', 'state'],
    },
  },
};

export const searchPropertiesSchema = {
  type: 'function' as const,
  function: {
    name: 'search_properties',
    description: 'Search for properties based on specific criteria like price, bedrooms, location, and features',
    parameters: {
      type: 'object',
      properties: {
        minPrice: {
          type: 'number',
          description: 'Minimum price in dollars',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price in dollars',
        },
        bedrooms: {
          type: 'number',
          description: 'Minimum number of bedrooms',
        },
        bathrooms: {
          type: 'number',
          description: 'Minimum number of bathrooms',
        },
        cities: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of cities to search in',
        },
        propertyTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Property types: single-family, condo, townhouse, multi-family',
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required features (e.g., "Parking", "Pool", "Garden")',
        },
      },
      required: [],
    },
  },
};

export const realEstateTools = [
  searchPropertiesSchema,
  calculateComparablesSchema,
  calculateMortgageSchema,
  getSchoolRatingsSchema,
  getWalkScoreSchema,
  getNearbyAmenitiesSchema,
  getMarketTrendsSchema,
];
