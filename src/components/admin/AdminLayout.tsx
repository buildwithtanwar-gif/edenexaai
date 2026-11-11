import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  DollarSign,
  FolderGit2,
  HelpCircle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { SupabaseStatusBadge } from '../common/SupabaseStatusBadge';

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

interface AdminLayoutProps {
  currentView: AdminView;
  onSelectView: (view: AdminView) => void;
  onExitToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onSelectView,
  onExitToPublic,
  children,
}) => {
  const { user, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inquiries', label: 'Inquiries & Leads', icon: <Inbox className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects & Work', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing Packages', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons & Promos', icon: <Tag className="w-4 h-4" /> },
    { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'content', label: 'Website Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Agency Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (view: AdminView) => {
    onSelectView(view);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#3A0F34] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#DDE3E8] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo size="sm" showText={false} />
          <span className="font-extrabold text-sm text-[#3A0F34]">Edenexa Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut()}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Log out of admin session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-[#F4F6F8] border border-[#DDE3E8] text-[#3A0F34]"
            aria-label="Toggle navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#DDE3E8] flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Portal Title */}
          <div className="p-5 border-b border-[#DDE3E8] flex items-center justify-between">
            <div>
              <Logo size="sm" />
              <div className="text-[10px] text-[#EAAA00] font-mono font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#EAAA00]" />
                <span>Admin Console</span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-[#7A7280] hover:text-[#3A0F34]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF8E6] text-[#3A0F34] border border-[#EAAA00]/50 shadow-xs'
                      : 'text-[#5C5260] hover:text-[#3A0F34] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <span className={isActive ? 'text-[#EAAA00]' : 'text-[#7A7280]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User info & logout */}
        <div className="p-4 border-t border-[#DDE3E8] space-y-3 bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-[11px] font-bold text-[#3A0F34] truncate">
                {user?.email || 'Administrator'}
              </div>
              <div className="text-[10px] text-[#7A7280] font-mono">Role: verified admin</div>
            </div>
            <SupabaseStatusBadge compact />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#DDE3E8]">
            <button
              onClick={onExitToPublic}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5C5260] hover:text-[#3A0F34] transition py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Public Site</span>
            </button>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition cursor-pointer"
              title="Sign out of admin console"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
};
