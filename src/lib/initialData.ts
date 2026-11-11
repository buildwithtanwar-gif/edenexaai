import { FAQ, PricingPackage, Project, Service, SiteSettings } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'seed-srv-1',
    slug: 'business-websites',
    title: 'Business Websites',
    description: 'Professional websites that explain a business, showcase services, and provide clear contact options.',
    price: 'Starting at ₹1,499',
    features: [
      'Business introduction',
      'About and services section',
      'Clear contact details',
      'Responsive mobile-first layout',
      'Direct WhatsApp CTA',
      'Fast loading performance'
    ],
    active: true,
    sort_order: 1
  },
  {
    id: 'seed-srv-2',
    slug: 'cafe-restaurant-websites',
    title: 'Cafe & Restaurant Websites',
    description: 'Modern websites that present menus, photos, location, opening hours, and contact information.',
    price: 'Starting at ₹2,499',
    features: [
      'Visual menu showcase',
      'Location & Google Maps link',
      'Opening hours & table info',
      'Atmosphere & photo gallery',
      'WhatsApp & phone call buttons',
      'Mobile-optimized for patrons'
    ],
    active: true,
    sort_order: 2
  },
  {
    id: 'seed-srv-3',
    slug: 'landing-pages',
    title: 'Landing Pages',
    description: 'Focused landing pages for promotions, launches, campaigns, and specific services.',
    price: 'Starting at ₹1,199',
    features: [
      'Single goal focus',
      'Compelling benefit layout',
      'Lead inquiry form',
      'Key FAQs & proof points',
      'Conversion-optimized structure',
      'Fast loading performance'
    ],
    active: true,
    sort_order: 3
  },
  {
    id: 'seed-srv-4',
    slug: 'website-redesign',
    title: 'Website Redesign',
    description: 'Refresh an existing website with improved layout, typography, responsive behavior, and user experience.',
    price: 'Starting at ₹1,999',
    features: [
      'Visual & typographic upgrade',
      'Mobile layout correction',
      'Improved user journey',
      'Performance optimization',
      'Modern responsive styling',
      'Retained key content & links'
    ],
    active: true,
    sort_order: 4
  }
];

export const INITIAL_PRICING: PricingPackage[] = [
  {
    id: 'seed-pkg-1',
    name: 'Starter Website',
    price: 1499,
    description: 'Essential digital presence for emerging businesses and local service providers.',
    features: [
      'Single-page website',
      'Business introduction',
      'Services or menu section',
      'Contact information',
      'WhatsApp CTA',
      'Responsive design',
      'One agreed revision round'
    ],
    highlighted: false,
    active: true,
    sort_order: 1
  },
  {
    id: 'seed-pkg-2',
    name: 'Business Website',
    price: 3999,
    description: 'Comprehensive multi-section website designed for established local brands and businesses.',
    features: [
      'Up to four agreed pages or equivalent sections',
      'About and services',
      'Gallery or portfolio',
      'Contact section',
      'Responsive design',
      'WhatsApp integration',
      'Two agreed revision rounds'
    ],
    highlighted: true,
    active: true,
    sort_order: 2
  },
  {
    id: 'seed-pkg-3',
    name: 'Custom Website',
    price: null, // "Let's Discuss"
    description: 'Tailored web architecture for startups, custom concepts, or specialized feature sets.',
    features: [
      'Custom requirements',
      'Tailored page structure',
      'Feature-based estimate',
      'Agreed scope',
      'Agreed delivery timeline',
      'Flexible architecture discussion'
    ],
    highlighted: false,
    active: true,
    sort_order: 3
  }
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'seed-faq-1',
    question: 'How does pricing work, and are there any hidden fees?',
    answer: 'Our listed prices (starting at ₹1,499 for Starter and ₹3,999 for Business) are upfront design and frontend build fees for the agreed scope. There are no hidden fees from our side. Third-party expenses such as domain registration, web hosting, paid email inboxes, or payment gateway fees are external and excluded unless specifically agreed.',
    active: true,
    sort_order: 1
  },
  {
    id: 'seed-faq-2',
    question: 'How long does it typically take to deliver a completed website?',
    answer: 'A Starter single-page website typically takes 3 to 5 business days after all content, branding assets, and requirements are received. A Business website generally takes 7 to 10 business days depending on page count and feedback turnaround.',
    active: true,
    sort_order: 2
  },
  {
    id: 'seed-faq-3',
    question: 'Are domain registration and web hosting included in the price?',
    answer: 'Domain names (e.g. yourbusiness.com) and hosting servers are separate recurring costs paid directly to registrar and hosting providers. We guide you through selecting the most cost-effective hosting options (including ₹0 free-tier hosting platforms like Cloudflare Pages, Vercel, or Netlify when suitable) and assist with setup.',
    active: true,
    sort_order: 3
  },
  {
    id: 'seed-faq-4',
    question: 'How many revision rounds are included with my project?',
    answer: 'The Starter package includes one agreed revision round, and the Business package includes two agreed revision rounds. Revisions allow you to fine-tune copy, imagery placement, colors, and layout adjustments within the agreed project scope.',
    active: true,
    sort_order: 4
  },
  {
    id: 'seed-faq-5',
    question: 'Can you build dedicated websites for cafes and restaurants?',
    answer: 'Yes, we specialize in cafe and restaurant website concepts and production sites. We organize your menu, display operating hours, integrate Google Maps location, and add one-click WhatsApp table inquiry buttons.',
    active: true,
    sort_order: 5
  },
  {
    id: 'seed-faq-6',
    question: 'Do your cafe and restaurant packages include online ordering or live table booking?',
    answer: 'Our standard packages provide visual menu presentation and direct WhatsApp / phone inquiry links. Advanced custom features such as real-time online ordering systems, POS synchronization, or automated table booking engines fall under the Custom Website scope.',
    active: true,
    sort_order: 6
  },
  {
    id: 'seed-faq-7',
    question: 'Can we collect online payments through our website?',
    answer: 'Direct payment gateway integration (Razorpay, Cashfree, UPI QR, Stripe) requires custom backend integration and legal merchant accounts. We can implement payment links, UPI QR triggers, or full gateway checkouts under a Custom Website scope.',
    active: true,
    sort_order: 7
  },
  {
    id: 'seed-faq-8',
    question: 'What do I need to prepare before we get started?',
    answer: 'To get started, please provide your business name, logo (if you have one), details about your services or menu items, contact information, photos of your work/venue, and any specific preferences or reference websites you like.',
    active: true,
    sort_order: 8
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  brand: {
    name: 'EDENEXA',
    tagline: 'Your Vision. Built for the Web.',
    eyebrow: 'HIGH-PERFORMANCE WEB STUDIO',
    headline: 'Your Business Deserves a High-Performance Website.',
    description: 'We design and build bespoke, responsive websites that help businesses showcase their brand, build trust, and make it easier for customers to connect.',
    supportingLine: 'Mobile-first design · Transparent pricing · Built around your business'
  },
  contact: {
    email: '',
    whatsapp: '',
    whatsappDisplay: '',
    domain: '',
    location: 'India',
    hours: 'Mon – Sat, 10:00 AM – 7:00 PM IST'
  },
  about: {
    heading: 'About Edenexa',
    paragraph1: 'Edenexa is a web development studio focused on building clean, modern, and practical websites for businesses. We combine modern workflows with hands-on frontend development to create responsive digital experiences tailored to each project’s goals.',
    paragraph2: 'Our approach is simple: understand the business, agree on the scope, design thoughtfully, and build a website that makes it easier for customers to discover and contact you.'
  },
  socials: {
    github: '',
    instagram: '',
    linkedin: '',
    twitter: ''
  }
};
