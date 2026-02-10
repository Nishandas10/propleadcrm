// Core TypeScript types for PropLead

import { Timestamp } from "firebase/firestore";

// User Types
export type UserRole = "owner" | "agent";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: Timestamp;
  whatsapp_config?: WhatsAppConfig;
  subscription: Subscription;
}

export interface WhatsAppConfig {
  phone_number_id: string;
  access_token: string;
  business_account_id: string;
  connected_at: Timestamp;
}

export interface Subscription {
  plan: "trial" | "starter" | "pro" | "agency";
  status: "active" | "expired" | "cancelled";
  expires_at: Timestamp;
  razorpay_subscription_id?: string;
}

// Lead Types
export type LeadSource =
  | "website"
  | "whatsapp"
  | "portal"
  | "manual"
  | "csv"
  | "facebook"
  | "walk-in";
export type LeadStatus =
  | "new"
  | "contacted"
  | "visit_scheduled"
  | "negotiation"
  | "closed_won"
  | "closed_lost";
export type PropertyType = "flat" | "plot" | "villa" | "commercial" | "other";
export type LeadPriority = "HOT" | "WARM" | "COLD";

export interface Lead {
  id: string;
  user_id: string;
  assigned_to?: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  budget?: number;
  location?: string;
  property_type?: PropertyType;
  status: LeadStatus;
  notes?: string;
  tags?: string[];
  lead_score: number;
  lead_priority: LeadPriority;
  last_interaction_at?: Timestamp;
  visit_scheduled_at?: Timestamp;
  message_count?: number;
  first_response_time?: number; // in minutes
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Message Types
export interface Message {
  id: string;
  lead_id: string;
  direction: "in" | "out";
  content: string;
  message_type: "text" | "template" | "image" | "document";
  template_name?: string;
  whatsapp_message_id?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  timestamp: Timestamp;
}

// Task Types
export type TaskType = "call" | "visit" | "followup" | "other";
export type TaskStatus = "pending" | "done" | "cancelled";

export interface Task {
  id: string;
  lead_id: string;
  user_id: string;
  assigned_to?: string;
  type: TaskType;
  title: string;
  description?: string;
  due_date: Timestamp;
  status: TaskStatus;
  completed_at?: Timestamp;
  created_at: Timestamp;
}

// Automation Types
export type AutomationTrigger =
  | "lead_created"
  | "after_hours"
  | "after_days"
  | "status_changed"
  | "no_response";

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  trigger: AutomationTrigger;
  trigger_value?: number; // hours/days depending on trigger
  trigger_status?: LeadStatus; // for status_changed trigger
  template_name: string;
  template_text: string;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Dashboard Stats
export interface DashboardStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  followups_due_today: number;
  conversion_rate: number;
  leads_by_source: Record<LeadSource, number>;
  leads_by_status: Record<LeadStatus, number>;
  recent_leads: Lead[];
  due_tasks: Task[];
}

// Note Type
export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: Timestamp;
}

// Team Member (for display purposes)
export interface TeamMember {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  lead_count?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Razorpay Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  status: string;
  current_start: number;
  current_end: number;
}

// WhatsApp Webhook Types
export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: {
      profile: {
        name: string;
      };
      wa_id: string;
    }[];
    messages?: {
      from: string;
      id: string;
      timestamp: string;
      text?: {
        body: string;
      };
      type: string;
    }[];
    statuses?: {
      id: string;
      status: string;
      timestamp: string;
      recipient_id: string;
    }[];
  };
  field: string;
}

// CSV Import Type
export interface CSVLeadRow {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  budget?: string;
  location?: string;
  property_type?: string;
  notes?: string;
}

// Form Embed Config
export interface FormEmbedConfig {
  id: string;
  user_id: string;
  form_name: string;
  fields: string[];
  webhook_url: string;
  created_at: Timestamp;
}

// Re-export listing types
export * from "./types/listing";
