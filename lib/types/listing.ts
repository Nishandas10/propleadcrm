import { Timestamp } from "firebase/firestore";

// Property Listing Types
export type ListingStatus =
  | "draft"
  | "active"
  | "pending"
  | "sold"
  | "rented"
  | "inactive";
export type ListingType = "sale" | "rent";
export type PropertyCategory =
  | "apartment"
  | "villa"
  | "townhouse"
  | "penthouse"
  | "studio"
  | "office"
  | "retail"
  | "warehouse"
  | "land"
  | "building";

export interface ListingPhoto {
  id: string;
  url: string;
  thumbnail_url: string;
  caption?: string;
  order: number;
  is_primary: boolean;
}

export interface VirtualTour {
  id: string;
  type: "360" | "video" | "matterport";
  url: string;
  thumbnail_url?: string;
  title?: string;
}

export interface ListingAmenity {
  id: string;
  name: string;
  icon?: string;
  category: "indoor" | "outdoor" | "building" | "nearby";
}

export interface SyncStatus {
  platform: "property_finder" | "bayut" | "dubizzle" | "website";
  synced: boolean;
  last_synced_at?: Timestamp;
  listing_url?: string;
  error?: string;
}

export interface PropertyListing {
  id: string;
  agent_id: string;

  // Basic Info
  title: string;
  description: string;
  reference_number: string;

  // Property Details
  listing_type: ListingType;
  property_category: PropertyCategory;
  status: ListingStatus;

  // Location
  address: string;
  area: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;

  // Specifications
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  plot_size_sqft?: number;
  floor_number?: number;
  total_floors?: number;
  parking_spaces: number;
  furnished: "furnished" | "semi-furnished" | "unfurnished";

  // Pricing
  price: number;
  price_per_sqft?: number;
  rental_period?: "yearly" | "monthly" | "weekly" | "daily";

  // Media
  photos: ListingPhoto[];
  virtual_tours: VirtualTour[];
  floor_plan_url?: string;

  // Features
  amenities: string[];
  highlights: string[];

  // Sync Status
  sync_status: SyncStatus[];

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  published_at?: Timestamp;

  // Stats
  views: number;
  inquiries: number;
  favorites: number;
}

// Lead Ad Integration Types
export type LeadAdPlatform = "facebook" | "instagram" | "google";
export type IntegrationStatus = "active" | "inactive" | "error" | "pending";

export interface LeadAdIntegration {
  id: string;
  agent_id: string;
  platform: LeadAdPlatform;
  status: IntegrationStatus;

  // Connection Details
  account_id: string;
  account_name: string;
  page_id?: string;
  page_name?: string;

  // Zapier/Webhook
  webhook_url: string;
  zapier_connected: boolean;

  // Settings
  auto_assign: boolean;
  default_status: string;
  default_source: string;
  notification_email?: string;

  // Stats
  total_leads_imported: number;
  last_lead_at?: Timestamp;

  // Metadata
  connected_at: Timestamp;
  last_sync_at?: Timestamp;
  error_message?: string;
}

export interface LeadAdCampaign {
  id: string;
  integration_id: string;
  platform: LeadAdPlatform;

  campaign_id: string;
  campaign_name: string;
  ad_set_name?: string;
  ad_name?: string;

  status: "active" | "paused" | "completed";

  // Stats
  leads_count: number;
  spend?: number;
  cost_per_lead?: number;

  start_date: Timestamp;
  end_date?: Timestamp;
}

// Analytics Types
export interface SalesMetric {
  period: string;
  revenue: number;
  deals_closed: number;
  avg_deal_size: number;
  commission: number;
}

export interface LeadConversionMetric {
  period: string;
  total_leads: number;
  qualified_leads: number;
  converted_leads: number;
  conversion_rate: number;
  avg_conversion_time_days: number;
}

export interface RevenueProjection {
  period: string;
  projected_revenue: number;
  actual_revenue?: number;
  pipeline_value: number;
  confidence: number;
}

export interface SourcePerformance {
  source: string;
  leads: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  cost_per_lead?: number;
  roi?: number;
}

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  leads_handled: number;
  deals_closed: number;
  revenue: number;
  conversion_rate: number;
  avg_response_time_mins: number;
  customer_rating: number;
}
