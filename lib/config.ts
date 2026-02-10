// Environment configuration and constants

export const config = {
  // Firebase
  firebase: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  },

  // WhatsApp Cloud API
  whatsapp: {
    apiVersion: "v18.0",
    baseUrl: "https://graph.facebook.com",
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o-mini",
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

  // App URLs
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    name: "PropLead",
  },

  // Trial Period
  trial: {
    durationDays: 7,
  },

  // Subscription Plans
  plans: {
    starter: {
      name: "Starter",
      price: 999,
      leadsLimit: 100,
      teamMembers: 1,
      razorpayPlanId: process.env.RAZORPAY_STARTER_PLAN_ID || "",
    },
    pro: {
      name: "Pro",
      price: 2499,
      leadsLimit: 500,
      teamMembers: 5,
      razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || "",
    },
    agency: {
      name: "Agency",
      price: 4999,
      leadsLimit: -1, // unlimited
      teamMembers: -1, // unlimited
      razorpayPlanId: process.env.RAZORPAY_AGENCY_PLAN_ID || "",
    },
  },
} as const;

// Lead Status Pipeline Order
export const LEAD_STATUS_ORDER = [
  "new",
  "contacted",
  "visit_scheduled",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;

// Lead Status Labels
export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  visit_scheduled: "Visit Scheduled",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

// Lead Source Labels
export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  portal: "Portal",
  manual: "Manual",
  csv: "CSV Import",
  facebook: "Facebook",
  "walk-in": "Walk-in",
};

// Property Type Labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  flat: "Flat/Apartment",
  plot: "Plot",
  villa: "Villa",
  commercial: "Commercial",
  other: "Other",
};

// Task Type Labels
export const TASK_TYPE_LABELS: Record<string, string> = {
  call: "Call",
  visit: "Site Visit",
  followup: "Follow-up",
  other: "Other",
};

// Lead Priority Colors
export const PRIORITY_COLORS: Record<string, string> = {
  HOT: "bg-red-500",
  WARM: "bg-yellow-500",
  COLD: "bg-blue-500",
};

// Lead Priority Icons/Emojis
export const PRIORITY_ICONS: Record<string, string> = {
  HOT: "🔥",
  WARM: "🟡",
  COLD: "❄️",
};
