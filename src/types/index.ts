export type BusinessType =
  | 'Cafe / Restaurant'
  | 'Salon / Beauty'
  | 'Local Business'
  | 'Startup'
  | 'Personal Brand'
  | 'Other';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type InquiryPriority = 'low' | 'normal' | 'high';

export interface Inquiry {
  id: string;
  name: string;
  business_name?: string | null;
  email?: string | null;
  phone: string;
  service?: string | null;
  budget?: string | null;
  message: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  admin_notes?: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price?: string | null;
  features: string[];
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: number | null;
  description?: string | null;
  features: string[];
  highlighted: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  project_url?: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number | null;
  max_discount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  times_used: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  full_name?: string | null;
  created_at?: string;
}

export interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface SiteSettings {
  brand?: {
    name?: string;
    tagline?: string;
    eyebrow?: string;
    headline?: string;
    description?: string;
    supportingLine?: string;
  };
  contact?: {
    email?: string;
    whatsapp?: string;
    whatsappDisplay?: string;
    domain?: string;
    location?: string;
    hours?: string;
  };
  about?: {
    heading?: string;
    paragraph1?: string;
    paragraph2?: string;
  };
  socials?: {
    github?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export type AdminView =
  | 'overview'
  | 'inquiries'
  | 'projects'
  | 'services'
  | 'pricing'
  | 'coupons'
  | 'faqs'
  | 'content'
  | 'settings';

