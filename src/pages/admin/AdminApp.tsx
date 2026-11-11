import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { AdminThemeProvider } from './AdminThemeContext';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLogin } from './AdminLogin';
import { DashboardOverview } from './DashboardOverview';
import { InquiriesManager } from './InquiriesManager';
import { ServicesManager } from './ServicesManager';
import { PricingManager } from './PricingManager';
import { ProjectsManager } from './ProjectsManager';
import { FaqsManager } from './FaqsManager';
import { ContentManager } from './ContentManager';
import { SettingsManager } from './SettingsManager';
import { CouponsManager } from './CouponsManager';
import { Inquiry, AdminView } from '../../types';

export interface AdminAppProps {
  currentPath: string;
  navigateTo: (path: string, sectionId?: string) => void;
  loadPublicData: () => Promise<void>;
}

function AdminContent({ currentPath, navigateTo, loadPublicData }: AdminAppProps) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [selectedInquiryForAdmin, setSelectedInquiryForAdmin] = useState<Inquiry | null>(null);

  // Safe redirect if already logged in as admin and navigating to /admin/login
  useEffect(() => {
    if (currentPath === '/admin/login' && !authLoading && user && isAdmin) {
      navigateTo('/admin');
    }
  }, [currentPath, authLoading, user, isAdmin, navigateTo]);

  // Safe redirect if unauthenticated user attempts to access protected /admin routes
  useEffect(() => {
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login' && !authLoading && (!user || !isAdmin)) {
      navigateTo('/admin/login');
    }
  }, [currentPath, authLoading, user, isAdmin, navigateTo]);

  if (currentPath === '/admin/login') {
    return (
      <AdminLogin
        onSuccess={() => navigateTo('/admin')}
        onBackToWebsite={() => navigateTo('/')}
      />
    );
  }

  if (authLoading || (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center text-[#5C5260] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#EAAA00]" />
        <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#3A0F34]">
          {authLoading ? 'Verifying Admin Session...' : 'Redirecting to Admin Login...'}
        </span>
      </div>
    );
  }

  // Determine subview from pathname
  let activeAdminView: AdminView = 'overview';
  if (currentPath === '/admin/inquiries') activeAdminView = 'inquiries';
  else if (currentPath === '/admin/projects') activeAdminView = 'projects';
  else if (currentPath === '/admin/services') activeAdminView = 'services';
  else if (currentPath === '/admin/pricing') activeAdminView = 'pricing';
  else if (currentPath === '/admin/coupons') activeAdminView = 'coupons';
  else if (currentPath === '/admin/faqs') activeAdminView = 'faqs';
  else if (currentPath === '/admin/content') activeAdminView = 'content';
  else if (currentPath === '/admin/settings') activeAdminView = 'settings';

  return (
    <AdminLayout
      currentView={activeAdminView}
      onSelectView={(view) => {
        const path = view === 'overview' ? '/admin' : `/admin/${view}`;
        navigateTo(path);
      }}
      onExitToPublic={() => {
        loadPublicData();
        navigateTo('/');
      }}
    >
      {activeAdminView === 'overview' && (
        <DashboardOverview
          onNavigate={(view) => {
            const path = view === 'overview' ? '/admin' : `/admin/${view}`;
            navigateTo(path);
          }}
          onSelectInquiry={(inq) => {
            setSelectedInquiryForAdmin(inq);
            navigateTo('/admin/inquiries');
          }}
        />
      )}
      {activeAdminView === 'inquiries' && (
        <InquiriesManager
          initialSelectedInquiry={selectedInquiryForAdmin}
          onClearInitialInquiry={() => setSelectedInquiryForAdmin(null)}
        />
      )}
      {activeAdminView === 'services' && <ServicesManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'pricing' && <PricingManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'projects' && <ProjectsManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'coupons' && <CouponsManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'faqs' && <FaqsManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'content' && <ContentManager onDataUpdated={loadPublicData} />}
      {activeAdminView === 'settings' && <SettingsManager onDataUpdated={loadPublicData} />}
    </AdminLayout>
  );
}

export default function AdminApp(props: AdminAppProps) {
  return (
    <AuthProvider>
      <AdminThemeProvider>
        <AdminContent {...props} />
      </AdminThemeProvider>
    </AuthProvider>
  );
}
