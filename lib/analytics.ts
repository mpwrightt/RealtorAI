// Analytics tracking utilities
// Supports Google Analytics, Vercel Analytics, and custom events

// Type definitions for events
export type AnalyticsEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

// Google Analytics - track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
};

// Google Analytics - track events
export const event = ({ action, category, label, value }: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track specific user actions
export const trackEvent = {
  // Authentication
  signUp: (method: string) => {
    event({
      action: 'sign_up',
      category: 'Authentication',
      label: method,
    });
  },

  signIn: (method: string) => {
    event({
      action: 'sign_in',
      category: 'Authentication',
      label: method,
    });
  },

  // Buyer Portal Actions
  createBuyerSession: () => {
    event({
      action: 'create_buyer_session',
      category: 'Portal',
      label: 'Buyer',
    });
  },

  viewProperty: (propertyId: string) => {
    event({
      action: 'view_property',
      category: 'Property',
      label: propertyId,
    });
  },

  favoriteProperty: (propertyId: string) => {
    event({
      action: 'favorite_property',
      category: 'Property',
      label: propertyId,
    });
  },

  submitOffer: (propertyId: string, amount: number) => {
    event({
      action: 'submit_offer',
      category: 'Conversion',
      label: propertyId,
      value: amount,
    });
  },

  scheduleTour: (propertyId: string) => {
    event({
      action: 'schedule_tour',
      category: 'Engagement',
      label: propertyId,
    });
  },

  // AI Features
  useAIChat: (query: string) => {
    event({
      action: 'use_ai_chat',
      category: 'AI',
      label: query.substring(0, 50), // First 50 chars
    });
  },

  generateMarketing: (type: string) => {
    event({
      action: 'generate_marketing',
      category: 'AI',
      label: type,
    });
  },

  // Seller Portal Actions
  createSellerSession: () => {
    event({
      action: 'create_seller_session',
      category: 'Portal',
      label: 'Seller',
    });
  },

  viewAnalytics: () => {
    event({
      action: 'view_analytics',
      category: 'Engagement',
      label: 'Seller Dashboard',
    });
  },

  createOpenHouse: () => {
    event({
      action: 'create_open_house',
      category: 'Events',
      label: 'Open House',
    });
  },

  // SMS Campaigns
  createSMSCampaign: (recipientCount: number) => {
    event({
      action: 'create_sms_campaign',
      category: 'Marketing',
      label: 'SMS',
      value: recipientCount,
    });
  },

  sendSMSCampaign: (recipientCount: number) => {
    event({
      action: 'send_sms_campaign',
      category: 'Marketing',
      label: 'SMS',
      value: recipientCount,
    });
  },

  // Client Management
  addLead: () => {
    event({
      action: 'add_lead',
      category: 'CRM',
      label: 'Lead',
    });
  },

  updateLeadStatus: (status: string) => {
    event({
      action: 'update_lead_status',
      category: 'CRM',
      label: status,
    });
  },

  // Messaging
  sendMessage: (recipientType: string) => {
    event({
      action: 'send_message',
      category: 'Communication',
      label: recipientType,
    });
  },

  // Landing Page
  clickCTA: (ctaName: string) => {
    event({
      action: 'click_cta',
      category: 'Landing Page',
      label: ctaName,
    });
  },

  viewPricing: () => {
    event({
      action: 'view_pricing',
      category: 'Landing Page',
      label: 'Pricing Section',
    });
  },

  // Errors
  trackError: (errorType: string, errorMessage: string) => {
    event({
      action: 'error',
      category: 'Error',
      label: `${errorType}: ${errorMessage.substring(0, 100)}`,
    });
  },
};

// Custom event tracking for business metrics
export const trackBusinessMetric = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'business_metric', {
      metric_name: metric,
      metric_value: value,
    });
  }
};

// Track conversion value (for ad platforms)
export const trackConversion = (value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      value: value,
      currency: currency,
    });
  }
};

// Initialize analytics (call in app/layout.tsx)
export const initAnalytics = () => {
  // Log analytics initialization
  if (typeof window !== 'undefined') {
    console.log('[Analytics] Initialized');
  }
};
