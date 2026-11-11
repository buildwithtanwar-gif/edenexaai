import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { TechStrip } from './components/public/TechStrip';
import { ServicesSection } from './components/public/ServicesSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { PricingSection } from './components/public/PricingSection';
import { AboutSection } from './components/public/AboutSection';
import { FaqSection } from './components/public/FaqSection';
import { ContactSection } from './components/public/ContactSection';
import { ProcessSection } from './components/public/ProcessSection';
import { WhyEdenexaSection } from './components/public/WhyEdenexaSection';
import { CustomCursor } from './components/common/CustomCursor';
import { IntroSequence } from './components/common/IntroSequence';
import { Footer } from './components/public/Footer';
import { FloatingWhatsApp } from './components/public/FloatingWhatsApp';
import { ScrollReveal } from './components/common/ScrollReveal';

import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { TermsOfService } from './pages/public/TermsOfService';
import { useAnalytics } from './hooks/useAnalytics';

import {
  getServices,
  getPricingPackages,
  getProjects,
  getFaqs,
  getSiteSettings
} from './lib/supabase';
import {
  INITIAL_SERVICES,
  INITIAL_PRICING,
  INITIAL_PROJECTS,
  INITIAL_FAQS,
  INITIAL_SETTINGS
} from './lib/initialData';
import { Service, PricingPackage, Project, FAQ, SiteSettings } from './types';
import { Loader2 } from 'lucide-react';

// Lazy-loaded Admin Application (completely code-split with its own auth context)
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

function AppContent() {
  useAnalytics();

  // Route State: extracts from window.location.pathname
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeNavSection, setActiveNavSection] = useState('home');

  // Pre-fill selections from Public CTAs to Contact form
  const [selectedPackageForContact, setSelectedPackageForContact] = useState<string>('Custom Website Project');

  // Live Data State
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [servicesFromDb, setServicesFromDb] = useState(false);

  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>(INITIAL_PRICING);
  const [pricingFromDb, setPricingFromDb] = useState(false);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [projectsFromDb, setProjectsFromDb] = useState(false);

  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [faqsFromDb, setFaqsFromDb] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically inject <meta name="robots" content="noindex,nofollow"> on /admin routes
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      let created = false;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
        created = true;
      }
      meta.setAttribute('content', 'noindex,nofollow');

      return () => {
        if (created && meta && meta.parentNode) {
          meta.parentNode.removeChild(meta);
        } else if (meta) {
          meta.removeAttribute('content');
        }
      };
    }
  }, [currentPath]);

  // Fetch Public Data on Mount & when updated
  const loadPublicData = async () => {
    try {
      const [srvRes, pkgRes, projRes, faqRes, settingsRes] = await Promise.all([
        getServices(false),
        getPricingPackages(false),
        getProjects(false),
        getFaqs(false),
        getSiteSettings()
      ]);

      if (srvRes.data) {
        setServices(srvRes.data);
        setServicesFromDb(srvRes.fromDatabase);
      }
      if (pkgRes.data) {
        setPricingPackages(pkgRes.data);
        setPricingFromDb(pkgRes.fromDatabase);
      }
      if (projRes.data) {
        setProjects(projRes.data);
        setProjectsFromDb(projRes.fromDatabase);
      }
      if (faqRes.data) {
        setFaqs(faqRes.data);
        setFaqsFromDb(faqRes.fromDatabase);
      }
      if (settingsRes.data) {
        setSiteSettings(settingsRes.data);
      }
    } catch (err) {
      console.warn('Notice loading public datasets:', err);
    }
  };

  useEffect(() => {
    loadPublicData();

    const handleDataUpdate = () => {
      loadPublicData();
    };

    window.addEventListener('edenexa_data_updated', handleDataUpdate);
    return () => {
      window.removeEventListener('edenexa_data_updated', handleDataUpdate);
    };
  }, []);

  // Handle navigation
  const navigateTo = (path: string, sectionId?: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
    if (sectionId) {
      setActiveNavSection(sectionId);
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSectionScroll = (sectionId: string) => {
    if (currentPath.startsWith('/admin') || currentPath === '/privacy' || currentPath === '/terms') {
      window.history.pushState({}, '', `/${sectionId === 'home' ? '' : sectionId}`);
      setCurrentPath(`/${sectionId === 'home' ? '' : sectionId}`);
      setActiveNavSection(sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    setActiveNavSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState({}, '', '/');
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      window.history.pushState({}, '', `/${sectionId}`);
    }
  };

  // If path directly matches public route on first load (e.g. /pricing)
  useEffect(() => {
    if (!currentPath.startsWith('/admin') && currentPath !== '/privacy' && currentPath !== '/terms') {
      const trimmed = currentPath.replace(/^\//, '');
      if (trimmed && ['services', 'pricing', 'portfolio', 'process', 'why-us', 'about', 'faq', 'contact'].includes(trimmed)) {
        setTimeout(() => {
          const el = document.getElementById(trimmed);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveNavSection(trimmed);
          }
        }, 150);
      }
    }
  }, []);

  // 1. LEGAL / POLICY PAGES (Public)
  if (currentPath === '/privacy') {
    return (
      <PrivacyPolicy
        onBack={() => navigateTo('/')}
        contactEmail={siteSettings.contact?.email}
      />
    );
  }

  if (currentPath === '/terms') {
    return (
      <TermsOfService
        onBack={() => navigateTo('/')}
        contactEmail={siteSettings.contact?.email}
      />
    );
  }

  // 2. ADMIN APPLICATION ROUTES (Completely encapsulated in lazy AdminApp with Suspense)
  if (currentPath.startsWith('/admin')) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center text-[#5C5260] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#EAAA00]" />
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#3A0F34]">
              Loading Admin Console...
            </span>
          </div>
        }
      >
        <AdminApp
          currentPath={currentPath}
          navigateTo={navigateTo}
          loadPublicData={loadPublicData}
        />
      </Suspense>
    );
  }

  const hasPublishedProjects = projects.some((p) => p.active !== false);

  // 3. PUBLIC MAIN SITE VIEW (Zero admin code or auth context mounted)
  return (
    <div className="min-h-screen bg-white text-[#3A0F34] flex flex-col selection:bg-[#EAAA00]/30 selection:text-[#3A0F34]">
      {/* Desktop Custom Precision Cursor */}
      <CustomCursor />

      {/* First-Visit Intro Sequence */}
      <IntroSequence onComplete={() => {}} />

      {/* Sticky Navigation Header with Scroll Progress Bar */}
      <Navbar
        activeSection={activeNavSection}
        onNavigate={handleSectionScroll}
        onOpenAdmin={() => navigateTo('/admin/login')}
        hasProjects={hasPublishedProjects}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          eyebrow={siteSettings.brand?.eyebrow}
          headline={siteSettings.brand?.headline}
          description={siteSettings.brand?.description}
          supportingLine={siteSettings.brand?.supportingLine}
          onStartProject={() => handleSectionScroll('contact')}
          onExploreWork={() => handleSectionScroll('portfolio')}
        />

        {/* Real Tech Stack Strip */}
        <TechStrip />

        {/* 6 Core Capabilities */}
        <ScrollReveal>
          <ServicesSection
            services={services}
            fromDatabase={servicesFromDb}
            onSelectService={(serviceTitle) => {
              setSelectedPackageForContact(serviceTitle);
              handleSectionScroll('contact');
            }}
          />
        </ScrollReveal>

        {/* Portfolio Section */}
        <ScrollReveal>
          <PortfolioSection
            projects={projects}
            fromDatabase={projectsFromDb}
            onBuildSimilar={(projectTitle) => {
              setSelectedPackageForContact(`Custom build similar to ${projectTitle}`);
              handleSectionScroll('contact');
            }}
          />
        </ScrollReveal>

        {/* Process Section */}
        <ScrollReveal>
          <ProcessSection />
        </ScrollReveal>

        {/* Why Edenexa Section */}
        <ScrollReveal>
          <WhyEdenexaSection onStartProject={() => handleSectionScroll('contact')} />
        </ScrollReveal>

        {/* Real Dynamic Pricing Packages */}
        <ScrollReveal>
          <PricingSection
            packages={pricingPackages}
            fromDatabase={pricingFromDb}
            publicWhatsAppNumber={siteSettings.contact?.whatsapp}
            onSelectPackage={(pkg) => {
              setSelectedPackageForContact(pkg.name);
              handleSectionScroll('contact');
            }}
          />
        </ScrollReveal>

        {/* About Section */}
        <ScrollReveal>
          <AboutSection
            heading={siteSettings.about?.heading}
            paragraph1={siteSettings.about?.paragraph1}
            paragraph2={siteSettings.about?.paragraph2}
          />
        </ScrollReveal>

        {/* Frequently Asked Questions */}
        <ScrollReveal>
          <FaqSection faqs={faqs} fromDatabase={faqsFromDb} />
        </ScrollReveal>

        {/* Real Inquiry Form (Database Persisted) */}
        <ScrollReveal>
          <ContactSection
            pricingPackages={pricingPackages}
            selectedPackageName={selectedPackageForContact}
            publicEmail={siteSettings.contact?.email}
            publicWhatsAppNumber={siteSettings.contact?.whatsapp}
            publicWhatsAppDisplay={siteSettings.contact?.whatsappDisplay}
            workingHours={siteSettings.contact?.hours}
            location={siteSettings.contact?.location}
          />
        </ScrollReveal>
      </main>

      {/* Agency Footer */}
      <Footer
        tagline={siteSettings.brand?.tagline}
        publicEmail={siteSettings.contact?.email}
        location={siteSettings.contact?.location}
        hasProjects={hasPublishedProjects}
        onNavigate={handleSectionScroll}
        onNavigateLegal={(path) => navigateTo(path)}
        onOpenAdmin={() => navigateTo('/admin/login')}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp
        phoneNumber={siteSettings.contact?.whatsapp}
        displayNumber={siteSettings.contact?.whatsappDisplay}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
