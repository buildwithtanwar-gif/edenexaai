import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  TrendingUp,
  FolderGit2,
  Briefcase,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  fetchLiveInquiries,
  fetchLiveProjects,
  fetchLiveServices,
  seedDatabaseFromAdmin,
} from '../../lib/adminStore';
import { Inquiry, AdminView } from '../../types';

interface DashboardOverviewProps {
  onNavigate: (view: AdminView) => void;
  onSelectInquiry: (inquiry: Inquiry) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onSelectInquiry,
}) => {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    contactedInquiries: 0,
    inProgressInquiries: 0,
    completedInquiries: 0,
    publishedProjects: 0,
    activeServices: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    const res = await seedDatabaseFromAdmin();
    setIsSeeding(false);
    setSeedMessage(res.message);
    await fetchMetrics();
    setTimeout(() => setSeedMessage(null), 4000);
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // 1. Fetch live inquiries breakdown matching live statuses
      const { data: inqList } = await fetchLiveInquiries('all', 'all', 'desc');
      const total = inqList.length;
      const newCount = inqList.filter((i) => i.status === 'new').length;
      const contactedCount = inqList.filter((i) => i.status === 'contacted').length;
      const inProgressCount = inqList.filter((i) => i.status === 'in_progress').length;
      const completedCount = inqList.filter((i) => i.status === 'completed').length;

      // 2. Fetch projects count
      const { data: projList } = await fetchLiveProjects(true);
      const projCount = projList.filter((p) => p.active !== false).length;

      // 3. Fetch active services count
      const { data: srvList } = await fetchLiveServices(true);
      const srvCount = srvList.filter((s) => s.active !== false).length;

      setStats({
        totalInquiries: total,
        newInquiries: newCount,
        contactedInquiries: contactedCount,
        inProgressInquiries: inProgressCount,
        completedInquiries: completedCount,
        publishedProjects: projCount || 0,
        activeServices: srvCount || 0,
      });

      setRecentInquiries(inqList.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching dashboard metrics:', err);
      setFetchError(err?.message || 'Failed to query live metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    const handleUpdate = () => {
      fetchMetrics();
    };

    window.addEventListener('edenexa_data_updated', handleUpdate);
    return () => window.removeEventListener('edenexa_data_updated', handleUpdate);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E6] text-[#EAAA00] border border-[#EAAA00]/40">New</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Contacted</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">Completed</span>;
      case 'rejected':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F6F8] text-[#7A7280] border border-[#DDE3E8]">{status}</span>;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 text-[#3A0F34]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Real-time inquiry metrics, active offerings, and lead pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DDE3E8] text-xs font-bold text-[#3A0F34] hover:border-[#EAAA00] shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#EAAA00] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Database Error Banner if any */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>{fetchError}</div>
        </div>
      )}

      {/* Empty Database Seed Banner */}
      {stats.activeServices === 0 && !isLoading && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E6] border border-[#EAAA00]/40 text-xs text-[#3A0F34] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="font-bold text-[#3A0F34] text-sm">Supabase Database Connected & Live!</div>
            <p className="text-[#5C5260] text-xs mt-1 leading-relaxed">
              Your Supabase tables (services, pricing, projects, faqs) are currently empty. You can initialize the standard Edenexa offerings with 1 click or create them manually.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shrink-0 shadow-md transition cursor-pointer"
          >
            {isSeeding ? 'Populating Tables...' : 'Seed Initial Agency Content'}
          </button>
        </div>
      )}

      {seedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inquiries */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              Total Inquiries
            </span>
            <div className="p-2 rounded-xl bg-[#FFF8E6] text-[#EAAA00] group-hover:scale-110 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#3A0F34] font-mono">
            {isLoading ? '...' : stats.totalInquiries}
          </div>
          <p className="text-[11px] text-[#7A7280] mt-1">Submitted through website</p>
        </div>

        {/* New Uncontacted Leads */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              New Leads
            </span>
            <div className="p-2 rounded-xl bg-[#FFF8E6] text-[#EAAA00] group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#EAAA00] font-mono">
            {isLoading ? '...' : stats.newInquiries}
          </div>
          <p className="text-[11px] text-[#7A7280] mt-1">Pending first contact</p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              In Discussion
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-600 font-mono">
            {isLoading ? '...' : stats.inProgressInquiries + stats.contactedInquiries}
          </div>
          <p className="text-[11px] text-[#7A7280] mt-1">Active client discussions</p>
        </div>

        {/* Completed Projects */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {isLoading ? '...' : stats.completedInquiries}
          </div>
          <p className="text-[11px] text-[#7A7280] mt-1">Confirmed & delivered</p>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          onClick={() => onNavigate('services')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              Active Services
            </span>
            <div className="text-2xl font-extrabold text-[#3A0F34] font-mono mt-1">
              {isLoading ? '...' : stats.activeServices} offerings
            </div>
            <p className="text-[11px] text-[#7A7280] mt-0.5">Live on services section</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8E6] text-[#EAAA00] group-hover:scale-110 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="p-6 rounded-2xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] hover:shadow-lg transition cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7280]">
              Showcase Projects
            </span>
            <div className="text-2xl font-extrabold text-[#3A0F34] font-mono mt-1">
              {isLoading ? '...' : stats.publishedProjects} projects
            </div>
            <p className="text-[11px] text-[#7A7280] mt-0.5">Live on portfolio section</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8E6] text-[#EAAA00] group-hover:scale-110 transition-transform">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Inquiries Table */}
      <div className="rounded-3xl bg-white border border-[#DDE3E8] overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-[#DDE3E8] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#3A0F34]">Recent Inquiries</h2>
            <p className="text-xs text-[#5C5260]">Latest customer leads submitted via public form</p>
          </div>
          <button
            onClick={() => onNavigate('inquiries')}
            className="inline-flex items-center gap-1.5 text-xs text-[#3A0F34] hover:text-[#EAAA00] font-bold transition cursor-pointer"
          >
            <span>View All Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#5C5260] border-b border-[#DDE3E8]">
              <tr>
                <th className="px-5 py-3 font-bold">Client / Business</th>
                <th className="px-5 py-3 font-bold">Phone / WhatsApp</th>
                <th className="px-5 py-3 font-bold">Service</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Received</th>
                <th className="px-5 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3E8]">
              {recentInquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-[#3A0F34]">{inq.name}</div>
                    {inq.business_name && (
                      <div className="text-[11px] text-[#7A7280]">{inq.business_name}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#3A0F34] font-medium">
                    {inq.phone}
                  </td>
                  <td className="px-5 py-3.5 text-[#3A0F34] font-medium">
                    {inq.service || 'Website Project'}
                  </td>
                  <td className="px-5 py-3.5">
                    {getStatusBadge(inq.status)}
                  </td>
                  <td className="px-5 py-3.5 text-[#7A7280] text-[11px] font-mono">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onSelectInquiry(inq)}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F6F8] hover:bg-[#FFF8E6] border border-[#DDE3E8] hover:border-[#EAAA00] text-[#3A0F34] text-xs font-bold transition cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

              {!isLoading && recentInquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#7A7280]">
                    No inquiries recorded yet. When visitors submit the public form, they will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
