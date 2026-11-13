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
  adminBasePath: string;
}

function AdminContent({ currentPath, navigateTo, loadPublicData, adminBasePath }: AdminAppProps) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [selectedInquiryForAdmin, setSelectedInquiryForAdmin] = useState<Inquiry | null>(null);

  const normalizedPath = currentPath.length > 1 ? currentPath.replace(/\/+$/, '') : currentPath;
  const loginPath = `${adminBasePath}/login`;
  const isLoginRoute = normalizedPath === loginPath;
  const isInsideAdmin = normalizedPath === adminBasePath || normalizedPath.startsWith(`${adminBasePath}/`);

  // Safe redirect if already logged in as admin and navigating to login route
  useEffect(() => {
    if (isLoginRoute && !authLoading && user && isAdmin) {
      navigateTo(adminBasePath);
    }
  }, [isLoginRoute, authLoading, user, isAdmin, navigateTo, adminBasePath]);

  // Safe redirect if unauthenticated user attempts to access protected admin routes
  useEffect(() => {
    if (isInsideAdmin && !isLoginRoute && !authLoading && (!user || !isAdmin)) {
      navigateTo(loginPath);
    }
  }, [isInsideAdmin, isLoginRoute, authLoading, user, isAdmin, navigateTo, loginPath]);

  if (isLoginRoute) {
    return (
      <AdminLogin
        onSuccess={() => navigateTo(adminBasePath)}
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
  if (normalizedPath === `${adminBasePath}/inquiries`) activeAdminView = 'inquiries';
  else if (normalizedPath === `${adminBasePath}/projects`) activeAdminView = 'projects';
  else if (normalizedPath === `${adminBasePath}/services`) activeAdminView = 'services';
  else if (normalizedPath === `${adminBasePath}/pricing`) activeAdminView = 'pricing';
  else if (normalizedPath === `${adminBasePath}/coupons`) activeAdminView = 'coupons';
  else if (normalizedPath === `${adminBasePath}/faqs`) activeAdminView = 'faqs';
  else if (normalizedPath === `${adminBasePath}/content`) activeAdminView = 'content';
  else if (normalizedPath === `${adminBasePath}/settings`) activeAdminView = 'settings';

  return (
    <AdminLayout
      currentView={activeAdminView}
      onSelectView={(view) => {
        const path = view === 'overview' ? adminBasePath : `${adminBasePath}/${view}`;
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
            const path = view === 'overview' ? adminBasePath : `${adminBasePath}/${view}`;
            navigateTo(path);
          }}
          onSelectInquiry={(inq) => {
            setSelectedInquiryForAdmin(inq);
            navigateTo(`${adminBasePath}/inquiries`);
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
