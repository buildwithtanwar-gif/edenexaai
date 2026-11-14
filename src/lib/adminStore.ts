import {
  Service,
  PricingPackage,
  Project,
  FAQ,
  SiteSettings,
  Inquiry,
  InquiryStatus,
  InquiryPriority,
  Coupon
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PRICING,
  INITIAL_FAQS,
  INITIAL_SETTINGS
} from './initialData';
import { supabase, isSupabaseConfigured, mapDbInquiry, notifyDataUpdated } from './supabase';

export { notifyDataUpdated };

// ==========================================
// 1. SERVICES
// Live table: id, title, slug, description, price (text), features, active, sort_order, created_at
// ==========================================
export async function fetchLiveServices(includeInactive = false): Promise<{
  data: Service[];
  fromDatabase: boolean;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('services').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching live services:', error.message);
        return {
          data: includeInactive ? INITIAL_SERVICES : INITIAL_SERVICES.filter((s) => s.active),
          fromDatabase: false,
        };
      }

      if (data) {
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
      console.warn('Failed to reach Supabase services:', err?.message || err);
      return {
        data: includeInactive ? INITIAL_SERVICES : INITIAL_SERVICES.filter((s) => s.active),
        fromDatabase: false,
      };
    }
  }

  const list = includeInactive ? INITIAL_SERVICES : INITIAL_SERVICES.filter((s) => s.active);
  return { data: list, fromDatabase: false };
}

export async function saveLiveService(service: Partial<Service>): Promise<Service> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save service.');
  }

  const payload: Record<string, any> = {
    title: service.title?.trim(),
    slug: service.slug?.trim().toLowerCase().replace(/\s+/g, '-'),
    description: service.description?.trim() || null,
    price: service.price?.trim() || null,
    features: Array.isArray(service.features) ? service.features : [],
    active: service.active !== false,
    sort_order: service.sort_order ?? 0,
  };

  if (!payload.title || !payload.slug) {
    throw new Error('Title and slug are required fields.');
  }

  let savedRecord: Service;

  if (service.id && !service.id.startsWith('seed-')) {
    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', service.id)
      .select()
      .single();

    if (error) {
      console.warn('Error updating service:', error.message);
      throw new Error(`Failed to update service: ${error.message}`);
    }
    savedRecord = data;
  } else {
    const { data, error } = await supabase
      .from('services')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting service:', error.message);
      throw new Error(`Failed to create service: ${error.message}`);
    }
    savedRecord = data;
  }

  notifyDataUpdated('services');
  return savedRecord;
}

export async function deleteLiveService(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete service.');
  }

  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) {
    console.warn('Error deleting service:', error.message);
    throw new Error(`Failed to delete service: ${error.message}`);
  }

  notifyDataUpdated('services');
}

// ==========================================
// 2. PRICING PACKAGES
// Live table: id, name, price (numeric), description, features, highlighted, active, sort_order, created_at
// ==========================================
export async function fetchLivePricing(includeInactive = false): Promise<{
  data: PricingPackage[];
  fromDatabase: boolean;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('pricing_packages').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching live pricing packages:', error.message);
        return {
          data: includeInactive ? INITIAL_PRICING : INITIAL_PRICING.filter((p) => p.active),
          fromDatabase: false,
        };
      }

      if (data) {
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
      console.warn('Failed to reach Supabase pricing packages:', err?.message || err);
      return {
        data: includeInactive ? INITIAL_PRICING : INITIAL_PRICING.filter((p) => p.active),
        fromDatabase: false,
      };
    }
  }

  const list = includeInactive ? INITIAL_PRICING : INITIAL_PRICING.filter((p) => p.active);
  return { data: list, fromDatabase: false };
}

export async function saveLivePricing(pkg: Partial<PricingPackage>): Promise<PricingPackage> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save package.');
  }

  const numericPrice =
    pkg.price === null || pkg.price === undefined || pkg.price === ('' as any) || isNaN(Number(pkg.price))
      ? null
      : Number(pkg.price);

  const payload: Record<string, any> = {
    name: pkg.name?.trim(),
    price: numericPrice,
    description: pkg.description?.trim() || null,
    features: Array.isArray(pkg.features) ? pkg.features : [],
    highlighted: Boolean(pkg.highlighted),
    active: pkg.active !== false,
    sort_order: pkg.sort_order ?? 0,
  };

  if (!payload.name) {
    throw new Error('Package name is required.');
  }

  let savedRecord: PricingPackage;

  if (pkg.id && !pkg.id.startsWith('seed-')) {
    const { data, error } = await supabase
      .from('pricing_packages')
      .update(payload)
      .eq('id', pkg.id)
      .select()
      .single();

    if (error) {
      console.warn('Error updating pricing package:', error.message);
      throw new Error(`Failed to update pricing package: ${error.message}`);
    }
    savedRecord = data;
  } else {
    const { data, error } = await supabase
      .from('pricing_packages')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting pricing package:', error.message);
      throw new Error(`Failed to create pricing package: ${error.message}`);
    }
    savedRecord = data;
  }

  notifyDataUpdated('pricing');
  return savedRecord;
}

export async function deleteLivePricing(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete package.');
  }

  const { error } = await supabase.from('pricing_packages').delete().eq('id', id);
  if (error) {
    console.warn('Error deleting pricing package:', error.message);
    throw new Error(`Failed to delete pricing package: ${error.message}`);
  }

  notifyDataUpdated('pricing');
}

// ==========================================
// 3. PROJECTS & PORTFOLIO
// Live table: id, title, slug, category, description, image_url, project_url, featured, active, sort_order, created_at
// ==========================================
export async function fetchLiveProjects(includeInactive = false): Promise<{
  data: Project[];
  fromDatabase: boolean;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('projects').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching live projects:', error.message);
        return { data: [], fromDatabase: false };
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
      console.warn('Failed to reach Supabase projects:', err?.message || err);
      return { data: [], fromDatabase: false };
    }
  }

  return { data: [], fromDatabase: false };
}

export async function saveLiveProject(project: Partial<Project>): Promise<Project> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save project.');
  }

  const payload: Record<string, any> = {
    title: project.title?.trim(),
    slug: project.slug?.trim().toLowerCase().replace(/\s+/g, '-'),
    category: project.category?.trim() || null,
    description: project.description?.trim() || null,
    image_url: project.image_url?.trim() || null,
    project_url: project.project_url?.trim() || null,
    featured: Boolean(project.featured),
    active: project.active !== false,
    sort_order: project.sort_order ?? 0,
  };

  if (!payload.title || !payload.slug) {
    throw new Error('Title and slug are required fields.');
  }

  let savedRecord: Project;

  if (project.id && !project.id.startsWith('seed-')) {
    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', project.id)
      .select()
      .single();

    if (error) {
      console.warn('Error updating project:', error.message);
      throw new Error(`Failed to update project: ${error.message}`);
    }
    savedRecord = data;
  } else {
    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting project:', error.message);
      throw new Error(`Failed to create project: ${error.message}`);
    }
    savedRecord = data;
  }

  notifyDataUpdated('projects');
  return savedRecord;
}

export async function deleteLiveProject(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete project.');
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.warn('Error deleting project:', error.message);
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  notifyDataUpdated('projects');
}

// ==========================================
// 4. FAQS
// Live table: id, question, answer, active, sort_order, created_at
// ==========================================
export async function fetchLiveFaqs(includeInactive = false): Promise<{
  data: FAQ[];
  fromDatabase: boolean;
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from('faqs').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching live FAQs:', error.message);
        return {
          data: includeInactive ? INITIAL_FAQS : INITIAL_FAQS.filter((f) => f.active),
          fromDatabase: false,
        };
      }

      if (data) {
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
      console.warn('Failed to reach Supabase FAQs:', err?.message || err);
      return {
        data: includeInactive ? INITIAL_FAQS : INITIAL_FAQS.filter((f) => f.active),
        fromDatabase: false,
      };
    }
  }

  const list = includeInactive ? INITIAL_FAQS : INITIAL_FAQS.filter((f) => f.active);
  return { data: list, fromDatabase: false };
}

export async function saveLiveFaq(faq: Partial<FAQ>): Promise<FAQ> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save FAQ.');
  }

  const payload: Record<string, any> = {
    question: faq.question?.trim(),
    answer: faq.answer?.trim(),
    active: faq.active !== false,
    sort_order: faq.sort_order ?? 0,
  };

  if (!payload.question || !payload.answer) {
    throw new Error('Question and answer are required.');
  }

  let savedRecord: FAQ;

  if (faq.id && !faq.id.startsWith('seed-')) {
    const { data, error } = await supabase
      .from('faqs')
      .update(payload)
      .eq('id', faq.id)
      .select()
      .single();

    if (error) {
      console.warn('Error updating FAQ:', error.message);
      throw new Error(`Failed to update FAQ: ${error.message}`);
    }
    savedRecord = data;
  } else {
    const { data, error } = await supabase
      .from('faqs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting FAQ:', error.message);
      throw new Error(`Failed to create FAQ: ${error.message}`);
    }
    savedRecord = data;
  }

  notifyDataUpdated('faqs');
  return savedRecord;
}

export async function deleteLiveFaq(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete FAQ.');
  }

  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) {
    console.warn('Error deleting FAQ:', error.message);
    throw new Error(`Failed to delete FAQ: ${error.message}`);
  }

  notifyDataUpdated('faqs');
}

// ==========================================
// 5. SITE SETTINGS
// Live table: key, value, updated_at
// ==========================================
export async function fetchLiveSettings(): Promise<{ data: SiteSettings }> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error) {
        console.warn('Error fetching site settings:', error.message);
        return { data: INITIAL_SETTINGS };
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

        return { data: merged };
      }
    } catch (err: any) {
      console.warn('Failed to reach Supabase settings:', err?.message || err);
      return { data: INITIAL_SETTINGS };
    }
  }

  return { data: INITIAL_SETTINGS };
}

export async function saveLiveSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save settings.');
  }

  const updates: { key: string; value: any; updated_at: string }[] = [];
  const now = new Date().toISOString();

  if (partial.brand) {
    updates.push({ key: 'brand', value: partial.brand, updated_at: now });
  }
  if (partial.contact) {
    updates.push({ key: 'contact', value: partial.contact, updated_at: now });
    if (partial.contact.whatsapp) {
      updates.push({ key: 'whatsapp_number', value: partial.contact.whatsapp, updated_at: now });
    }
    if (partial.contact.email) {
      updates.push({ key: 'contact_email', value: partial.contact.email, updated_at: now });
    }
  }
  if (partial.about) {
    updates.push({ key: 'about', value: partial.about, updated_at: now });
  }
  if (partial.socials) {
    updates.push({ key: 'socials', value: partial.socials, updated_at: now });
    updates.push({ key: 'social_links', value: partial.socials, updated_at: now });
  }
  if (partial.seo) {
    updates.push({ key: 'seo', value: partial.seo, updated_at: now });
  }

  for (const item of updates) {
    const { error } = await supabase.from('site_settings').upsert(item, { onConflict: 'key' });
    if (error) {
      console.warn(`Error saving site setting '${item.key}':`, error.message);
      throw new Error(`Failed to save ${item.key} settings: ${error.message}`);
    }
  }

  notifyDataUpdated('settings');
  const fresh = await fetchLiveSettings();
  return fresh.data;
}

// ==========================================
// 6. INQUIRIES & LEADS
// Live table: id, name, email, phone, service, budget, message, status, priority, admin_notes, created_at, business_name
// Allowed statuses: new, contacted, in_progress, completed, rejected
// NO updated_at, full_name, whatsapp_number, business_type, package_interest, requirements
// ==========================================
export async function fetchLiveInquiries(
  statusFilter = 'all',
  priorityFilter = 'all',
  sortOrder: 'desc' | 'asc' = 'desc'
): Promise<{ data: Inquiry[]; fromDatabase: boolean }> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: [], fromDatabase: false };
  }

  let query = supabase.from('inquiries').select('*').order('created_at', { ascending: sortOrder === 'asc' });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  if (priorityFilter !== 'all') {
    query = query.eq('priority', priorityFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Error fetching inquiries:', error.message);
    throw new Error(`Failed to fetch inquiries: ${error.message}`);
  }

  const mapped = (data || []).map(mapDbInquiry);
  return { data: mapped, fromDatabase: true };
}

export async function updateLiveInquiryStatus(
  inquiryId: string,
  newStatus: InquiryStatus
): Promise<Inquiry> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot update inquiry.');
  }

  const allowedStatuses: InquiryStatus[] = ['new', 'contacted', 'in_progress', 'completed', 'rejected'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Allowed values: new, contacted, in_progress, completed, rejected.`);
  }

  // NOTE: Inquiries table does NOT have updated_at. Only send status!
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: newStatus })
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.warn('Error updating inquiry status:', error.message);
    throw new Error(`Failed to update inquiry status: ${error.message}`);
  }

  notifyDataUpdated('inquiries');
  return mapDbInquiry(data);
}

export async function updateLiveInquiryPriority(
  inquiryId: string,
  newPriority: InquiryPriority
): Promise<Inquiry> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot update inquiry.');
  }

  // NOTE: Inquiries table does NOT have updated_at. Only send priority!
  const { data, error } = await supabase
    .from('inquiries')
    .update({ priority: newPriority })
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.warn('Error updating inquiry priority:', error.message);
    throw new Error(`Failed to update inquiry priority: ${error.message}`);
  }

  notifyDataUpdated('inquiries');
  return mapDbInquiry(data);
}

export async function saveLiveInquiryNotes(
  inquiryId: string,
  adminNotes: string
): Promise<Inquiry> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save admin notes.');
  }

  // NOTE: Inquiries table does NOT have updated_at. Only send admin_notes!
  const { data, error } = await supabase
    .from('inquiries')
    .update({ admin_notes: adminNotes })
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.warn('Error saving inquiry notes:', error.message);
    throw new Error(`Failed to save admin notes: ${error.message}`);
  }

  notifyDataUpdated('inquiries');
  return mapDbInquiry(data);
}

export async function deleteLiveInquiry(inquiryId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete inquiry.');
  }

  const { data, error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', inquiryId)
    .select('id');

  if (error) {
    console.warn('Error deleting inquiry:', error.message);
    if (
      error.code === '42501' ||
      error.message.toLowerCase().includes('permission denied')
    ) {
      throw new Error(
        'Permission denied for table inquiries. Please run supabase/fix_inquiries_delete.sql in your Supabase SQL Editor.'
      );
    }
    throw new Error(`Failed to delete inquiry: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Delete blocked by database policy or inquiry was already deleted.');
  }

  notifyDataUpdated('inquiries');
}

// ==========================================
// 7. COUPONS & PROMOS
// Live table: id, code, description, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_until, usage_limit, times_used, active, created_at, updated_at
// ==========================================
export async function fetchLiveCoupons(): Promise<{ data: Coupon[]; fromDatabase: boolean }> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: [], fromDatabase: false };
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching coupons:', error.message);
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  const mapped: Coupon[] = (data || []).map((c: any) => ({
    id: c.id,
    code: c.code,
    description: c.description || null,
    discount_type: c.discount_type || 'percentage',
    discount_value: Number(c.discount_value) || 0,
    min_order_value: c.min_order_value !== null ? Number(c.min_order_value) : null,
    max_discount: c.max_discount !== null ? Number(c.max_discount) : null,
    valid_from: c.valid_from || null,
    valid_until: c.valid_until || null,
    usage_limit: c.usage_limit !== null ? Number(c.usage_limit) : null,
    times_used: Number(c.times_used) || 0,
    active: c.active !== false,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  return { data: mapped, fromDatabase: true };
}

export async function saveLiveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot save coupon.');
  }

  const cleanCode = coupon.code?.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Coupon code is required.');
  }

  const now = new Date().toISOString();
  const payload: Record<string, any> = {
    code: cleanCode,
    description: coupon.description?.trim() || null,
    discount_type: coupon.discount_type === 'fixed' ? 'fixed' : 'percentage',
    discount_value: Number(coupon.discount_value) || 0,
    min_order_value: coupon.min_order_value !== undefined && coupon.min_order_value !== null && !isNaN(Number(coupon.min_order_value)) ? Number(coupon.min_order_value) : null,
    max_discount: coupon.max_discount !== undefined && coupon.max_discount !== null && !isNaN(Number(coupon.max_discount)) ? Number(coupon.max_discount) : null,
    valid_from: coupon.valid_from || null,
    valid_until: coupon.valid_until || null,
    usage_limit: coupon.usage_limit !== undefined && coupon.usage_limit !== null && !isNaN(Number(coupon.usage_limit)) ? Number(coupon.usage_limit) : null,
    active: coupon.active !== false,
    updated_at: now,
  };

  let savedRecord: Coupon;

  if (coupon.id) {
    const { data, error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', coupon.id)
      .select()
      .single();

    if (error) {
      console.warn('Error updating coupon:', error.message);
      throw new Error(`Failed to update coupon: ${error.message}`);
    }
    savedRecord = data;
  } else {
    payload.times_used = 0;
    const { data, error } = await supabase
      .from('coupons')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting coupon:', error.message);
      throw new Error(`Failed to create coupon: ${error.message}`);
    }
    savedRecord = data;
  }

  notifyDataUpdated('coupons');
  return savedRecord;
}

export async function deleteLiveCoupon(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase database is not configured. Cannot delete coupon.');
  }

  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) {
    console.warn('Error deleting coupon:', error.message);
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }

  notifyDataUpdated('coupons');
}

/**
 * Seed database with initial Edenexa capabilities and configuration from admin dashboard.
 */
export async function seedDatabaseFromAdmin(): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // 1. Seed services (upsert on slug)
    const srvPayload = INITIAL_SERVICES.map((s) => ({
      title: s.title,
      slug: s.slug,
      description: s.description || null,
      price: s.price || null,
      features: s.features,
      active: true,
      sort_order: s.sort_order,
    }));
    const { error: srvErr } = await supabase.from('services').upsert(srvPayload, { onConflict: 'slug' });
    if (srvErr) throw new Error(`Services seed error: ${srvErr.message}`);

    // 2. Seed pricing packages
    const { data: existingPackages } = await supabase.from('pricing_packages').select('id, name');
    const existingByName = new Map((existingPackages || []).map((p: any) => [p.name, p.id]));

    for (const p of INITIAL_PRICING) {
      const pkgRecord = {
        name: p.name,
        price: p.price,
        description: p.description || null,
        features: p.features,
        highlighted: p.highlighted,
        active: true,
        sort_order: p.sort_order,
      };

      const existingId = existingByName.get(p.name);
      if (existingId) {
        const { error: updErr } = await supabase.from('pricing_packages').update(pkgRecord).eq('id', existingId);
        if (updErr) throw new Error(`Pricing update error: ${updErr.message}`);
      } else {
        const { error: insErr } = await supabase.from('pricing_packages').insert([pkgRecord]);
        if (insErr) throw new Error(`Pricing insert error: ${insErr.message}`);
      }
    }

    // 3. Seed FAQs (upsert on question)
    const faqPayload = INITIAL_FAQS.map((f) => ({
      question: f.question,
      answer: f.answer,
      active: true,
      sort_order: f.sort_order,
    }));
    const { error: faqErr } = await supabase.from('faqs').upsert(faqPayload, { onConflict: 'question' });
    if (faqErr) throw new Error(`FAQs seed error: ${faqErr.message}`);

    // 4. Seed site settings
    const settingsPayload = [
      { key: 'brand', value: INITIAL_SETTINGS.brand },
      { key: 'contact', value: INITIAL_SETTINGS.contact },
      { key: 'about', value: INITIAL_SETTINGS.about },
      { key: 'socials', value: INITIAL_SETTINGS.socials },
    ];
    const { error: settingsErr } = await supabase.from('site_settings').upsert(settingsPayload, { onConflict: 'key' });
    if (settingsErr) throw new Error(`Settings seed error: ${settingsErr.message}`);

    notifyDataUpdated('all');
    return { success: true, message: 'Database successfully seeded with standard Edenexa content!' };
  } catch (err: any) {
    console.warn('Error seeding database:', err?.message || err);
    return { success: false, message: err?.message || 'Database seeding failed.' };
  }
}
