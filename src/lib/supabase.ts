import { createClient } from '@supabase/supabase-js';
import {
  Service,
  PricingPackage,
  Project,
  FAQ,
  SiteSettings,
  Inquiry,
  InquiryStatus,
  InquiryPriority,
  BusinessType,
  Coupon
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PRICING,
  INITIAL_FAQS,
  INITIAL_SETTINGS
} from './initialData';

/**
 * Normalizes Supabase URLs.
 * If the user enters a dashboard URL (e.g. https://supabase.com/dashboard/project/<PROJECT_ID>/...),
 * this safely converts it into the valid REST API endpoint: https://<PROJECT_ID>.supabase.co
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');

  const dashboardMatch = url.match(
    /(?:supabase\.com\/dashboard\/project|app\.supabase\.com\/project)\/([a-zA-Z0-9_-]+)/
  );
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Strip trailing slash
  return url.replace(/\/+$/, '');
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = rawSupabaseAnonKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey !== 'your-anon-public-key' &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Dispatches a global event so UI components immediately reload fresh state across the app.
 */
export function notifyDataUpdated(entity: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('edenexa_data_updated', {
          detail: { entity, timestamp: Date.now() },
        })
      );
    }
  } catch (err) {
    console.warn('Failed to dispatch update event:', err);
  }
}

/**
 * Maps raw database inquiries row to typed Inquiry object.
 * Source of truth: live inquiries table columns:
 * id, name, business_name, email, phone, service, budget, message, status, priority, admin_notes, created_at
 */
export function mapDbInquiry(row: any): Inquiry {
  const allowedStatuses: InquiryStatus[] = ['new', 'contacted', 'in_progress', 'completed', 'rejected'];
  const status: InquiryStatus = allowedStatuses.includes(row.status) ? row.status : 'new';
  const priority: InquiryPriority = ['low', 'normal', 'high'].includes(row.priority) ? row.priority : 'normal';

  return {
    id: row.id,
    name: row.name || 'Anonymous Client',
    business_name: row.business_name || null,
    email: row.email || null,
    phone: row.phone || '',
    service: row.service || 'Custom Website',
    budget: row.budget || null,
    message: row.message || '',
    status,
    priority,
    admin_notes: row.admin_notes || null,
    created_at: row.created_at || new Date().toISOString(),
  };
}

/**
 * Validates a promo coupon code against the live Supabase `coupons` table.
 * Does NOT increment times_used from client-side for anonymous visitors.
 */
export async function validateCouponCode(
  rawCode: string,
  numericBudget?: number | null
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountDisplay?: string;
  error?: string;
}> {
  const cleanCode = rawCode?.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  if (!supabase || !isSupabaseConfigured) {
    return { valid: false, error: 'Coupons system is currently offline.' };
  }

  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.warn('Coupon lookup notice:', error.message);
      return { valid: false, error: 'Failed to verify coupon code.' };
    }

    if (!coupon) {
      return { valid: false, error: 'Invalid or expired coupon code.' };
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'This coupon is not active yet.' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'This coupon has expired.' };
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, error: 'This coupon has reached its maximum usage limit.' };
    }

    if (coupon.min_order_value && numericBudget && numericBudget < coupon.min_order_value) {
      return {
        valid: false,
        error: `Requires a minimum budget of ₹${coupon.min_order_value.toLocaleString('en-IN')}.`,
      };
    }

    const discountDisplay =
      coupon.discount_type === 'percentage'
        ? `${coupon.discount_value}% Off`
        : `₹${coupon.discount_value.toLocaleString('en-IN')} Off`;

    return {
      valid: true,
      coupon,
      discountDisplay,
    };
  } catch (err: any) {
    console.warn('Coupon validation error:', err);
    return { valid: false, error: 'Unable to validate coupon at this time.' };
  }
}

/**
 * Submit inquiry to Supabase inquiries table.
 * Live columns: name, email, phone, service, budget, message, business_name, status, priority.
 * The business category is included in message as a "[Category: ...]" line.
 * Checks error on every call and provides a friendly message with WhatsApp fallback.
 */
export async function submitInquiry(payload: {
  name: string;
  business_name?: string | null;
  email?: string | null;
  phone: string;
  business_type?: string;
  service?: string;
  budget?: string | null;
  requirements: string;
  coupon_code?: string | null;
}): Promise<{
  success: boolean;
  error?: string;
  whatsappFallbackUrl?: string;
}> {
  try {
    const trimmedName = payload.name?.trim() || '';
    if (!trimmedName) {
      return { success: false, error: 'Full name is required.' };
    }

    const trimmedPhone = payload.phone?.trim() || '';
    if (trimmedPhone.length < 8 || trimmedPhone.length > 25) {
      return { success: false, error: 'A valid WhatsApp / phone number is required.' };
    }

    const requirementsText = payload.requirements?.trim() || '';
    if (!requirementsText) {
      return { success: false, error: 'Project requirements are required.' };
    }

    if (!supabase || !isSupabaseConfigured) {
      return {
        success: false,
        error: 'Database connection is not configured on the server. Please reach out to us directly on WhatsApp.',
      };
    }

    const categoryTag = payload.business_type ? `[Category: ${payload.business_type}]` : '';
    const couponTag = payload.coupon_code ? `[Coupon: ${payload.coupon_code}]` : '';
    const tags = [categoryTag, couponTag].filter(Boolean).join(' ');

    const fullMessage = tags ? `${tags}\n\n${requirementsText}` : requirementsText;

    const insertRecord: Record<string, any> = {
      name: trimmedName.slice(0, 120),
      business_name: payload.business_name?.trim() ? payload.business_name.trim().slice(0, 150) : null,
      email: payload.email?.trim() ? payload.email.trim().slice(0, 150) : null,
      phone: trimmedPhone.slice(0, 25),
      service: (payload.service?.trim() || 'Custom Website').slice(0, 100),
      budget: payload.budget?.trim() ? payload.budget.trim().slice(0, 50) : null,
      message: fullMessage.slice(0, 3000),
      status: 'new',
      priority: 'normal',
    };

    const { error: insertError } = await supabase
      .from('inquiries')
      .insert(insertRecord);

    if (insertError) {
      console.warn('Supabase inquiries insert error:', insertError.message);
      return {
        success: false,
        error: `Submission failed: ${insertError.message || 'Unable to save inquiry'}. Please message us on WhatsApp for immediate support.`,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.warn('Inquiry submission error:', err?.message || err);
    return {
      success: false,
      error: 'A network error occurred. Please try again or reach out directly on WhatsApp.',
    };
  }
}

/**
 * Fetch services from Supabase.
 * Live columns: id, title, slug, description, price (text), features, active, sort_order, created_at.
 */
export async function getServices(includeInactive = false): Promise<{
  data: Service[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('services').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase services query notice:', error.message);
        return { data: INITIAL_SERVICES, fromDatabase: false, error: error.message };
      }

      if (data && data.length > 0) {
        const mapped: Service[] = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description || null,
          price: s.price || null,
          features: Array.isArray(s.features) ? s.features : [],
          active: s.active !== false,
          sort_order: s.sort_order || 0,
          created_at: s.created_at,
        }));
        return { data: mapped, fromDatabase: true };
      }
    } catch (err: any) {
      console.warn('Unable to reach Supabase services endpoint:', err?.message || err);
      return { data: INITIAL_SERVICES, fromDatabase: false, error: err?.message };
    }
  }

  return {
    data: includeInactive ? INITIAL_SERVICES : INITIAL_SERVICES.filter((s) => s.active),
    fromDatabase: false,
  };
}

/**
 * Fetch pricing packages from Supabase.
 * Live columns: id, name, price (numeric), description, features, highlighted, active, sort_order, created_at.
 * If price is null, represents custom package ("Let's Discuss").
 */
export async function getPricingPackages(includeInactive = false): Promise<{
  data: PricingPackage[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('pricing_packages').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase pricing packages query notice:', error.message);
        return { data: INITIAL_PRICING, fromDatabase: false, error: error.message };
      }

      if (data && data.length > 0) {
        const mapped: PricingPackage[] = data.map((p: any) => {
          const numPrice = p.price !== null && p.price !== undefined ? Number(p.price) : null;
          return {
            id: p.id,
            name: p.name,
            price: isNaN(numPrice as number) ? null : numPrice,
            description: p.description || null,
            features: Array.isArray(p.features) ? p.features : [],
            highlighted: Boolean(p.highlighted),
            active: p.active !== false,
            sort_order: p.sort_order || 0,
            created_at: p.created_at,
          };
        });
        return { data: mapped, fromDatabase: true };
      }
    } catch (err: any) {
      console.warn('Unable to reach Supabase pricing packages endpoint:', err?.message || err);
      return { data: INITIAL_PRICING, fromDatabase: false, error: err?.message };
    }
  }

  return {
    data: includeInactive ? INITIAL_PRICING : INITIAL_PRICING.filter((p) => p.active),
    fromDatabase: false,
  };
}

/**
 * Fetch projects from Supabase.
 * Live columns: id, title, slug, description, image_url, project_url, category, featured, active, sort_order, created_at.
 * Filter by active (not published).
 */
export async function getProjects(includeInactive = false): Promise<{
  data: Project[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('projects').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase projects query notice:', error.message);
        return { data: [], fromDatabase: false, error: error.message };
      }

      if (data) {
        const mapped: Project[] = data.map((pr: any) => ({
          id: pr.id,
          title: pr.title,
          slug: pr.slug,
          category: pr.category || null,
          description: pr.description || null,
          image_url: pr.image_url || null,
          project_url: pr.project_url || null,
          featured: Boolean(pr.featured),
          active: pr.active !== false,
          sort_order: pr.sort_order || 0,
          created_at: pr.created_at,
        }));
        return { data: mapped, fromDatabase: true };
      }
    } catch (err: any) {
      console.warn('Unable to reach Supabase projects endpoint:', err?.message || err);
      return { data: [], fromDatabase: false, error: err?.message };
    }
  }

  return { data: [], fromDatabase: false };
}

/**
 * Fetch FAQs from Supabase.
 * Live columns: id, question, answer, active, sort_order, created_at.
 */
export async function getFaqs(includeInactive = false): Promise<{
  data: FAQ[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('faqs').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase FAQs query notice:', error.message);
        return { data: INITIAL_FAQS, fromDatabase: false, error: error.message };
      }

      if (data && data.length > 0) {
        const mapped: FAQ[] = data.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          active: f.active !== false,
          sort_order: f.sort_order || 0,
          created_at: f.created_at,
        }));
        return { data: mapped, fromDatabase: true };
      }
    } catch (err: any) {
      console.warn('Unable to reach Supabase FAQs endpoint:', err?.message || err);
      return { data: INITIAL_FAQS, fromDatabase: false, error: err?.message };
    }
  }

  return {
    data: includeInactive ? INITIAL_FAQS : INITIAL_FAQS.filter((f) => f.active),
    fromDatabase: false,
  };
}

/**
 * Fetch site settings from Supabase.
 * Live columns: key, value (jsonb), updated_at.
 */
export async function getSiteSettings(): Promise<{
  data: SiteSettings;
  fromDatabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error) {
        console.warn('Supabase site settings query notice:', error.message);
        return { data: INITIAL_SETTINGS, fromDatabase: false, error: error.message };
      }

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {};
        data.forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });

        const contactObj = typeof settingsMap.contact === 'object' && settingsMap.contact ? settingsMap.contact : {};
        const brandObj = typeof settingsMap.brand === 'object' && settingsMap.brand ? settingsMap.brand : {};
        const aboutObj = typeof settingsMap.about === 'object' && settingsMap.about ? settingsMap.about : {};
        const socialsObj = typeof settingsMap.socials === 'object' && settingsMap.socials ? settingsMap.socials : (settingsMap.social_links || {});
        const seoObj = typeof settingsMap.seo === 'object' && settingsMap.seo ? settingsMap.seo : {};

        const rawWa = settingsMap.whatsapp_number || contactObj.whatsapp || INITIAL_SETTINGS.contact?.whatsapp || '';
        const cleanWa = String(rawWa).replace(/[^0-9]/g, '');

        const merged: SiteSettings = {
          brand: {
            ...INITIAL_SETTINGS.brand,
            name: settingsMap.brand_name || brandObj.name || INITIAL_SETTINGS.brand?.name,
            ...brandObj,
          },
          contact: {
            ...INITIAL_SETTINGS.contact,
            email: settingsMap.contact_email || contactObj.email || INITIAL_SETTINGS.contact?.email,
            whatsapp: cleanWa,
            whatsappDisplay: contactObj.whatsappDisplay || (cleanWa ? `+${cleanWa}` : INITIAL_SETTINGS.contact?.whatsappDisplay),
            ...contactObj,
          },
          about: { ...INITIAL_SETTINGS.about, ...aboutObj },
          socials: {
            ...INITIAL_SETTINGS.socials,
            github: socialsObj.github || INITIAL_SETTINGS.socials?.github || '',
            instagram: socialsObj.instagram || INITIAL_SETTINGS.socials?.instagram || '',
            linkedin: socialsObj.linkedin || INITIAL_SETTINGS.socials?.linkedin || '',
            twitter: socialsObj.twitter || INITIAL_SETTINGS.socials?.twitter || '',
          },
          seo: {
            ...INITIAL_SETTINGS.seo,
            ...seoObj,
          },
        };

        return { data: merged, fromDatabase: true };
      }
    } catch (err: any) {
      console.warn('Unable to reach Supabase site settings endpoint:', err?.message || err);
      return { data: INITIAL_SETTINGS, fromDatabase: false, error: err?.message };
    }
  }

  return { data: INITIAL_SETTINGS, fromDatabase: false };
}

