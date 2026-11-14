import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  MessageSquare,
  Trash2,
  Save,
  X,
  Loader2,
  Tag,
  Check,
  CheckCircle2,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Inquiry, InquiryPriority, InquiryStatus } from '../../types';
import {
  fetchLiveInquiries,
  updateLiveInquiryStatus,
  updateLiveInquiryPriority,
  saveLiveInquiryNotes,
  deleteLiveInquiry,
} from '../../lib/adminStore';
import { buildWhatsAppUrl, buildLeadFollowUpMessage } from '../../lib/whatsapp';

interface InquiriesManagerProps {
  initialSelectedInquiry?: Inquiry | null;
  onClearInitialInquiry?: () => void;
}

export const STATUS_LIST: { id: InquiryStatus; label: string; desc: string }[] = [
  { id: 'new', label: 'New Lead', desc: 'Fresh inquiry received' },
  { id: 'contacted', label: 'Contacted', desc: 'Initial WhatsApp/Call sent' },
  { id: 'in_progress', label: 'In Progress', desc: 'Active proposal & scope discussion' },
  { id: 'completed', label: 'Completed', desc: 'Project confirmed & completed' },
  { id: 'rejected', label: 'Rejected', desc: 'Declined or unsuitable lead' },
];

export const InquiriesManager: React.FC<InquiriesManagerProps> = ({
  initialSelectedInquiry,
  onClearInitialInquiry,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [allInquiriesRaw, setAllInquiriesRaw] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Active Detail Drawer/Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, type === 'error' ? 6000 : 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [filteredRes, allRes] = await Promise.all([
        fetchLiveInquiries(statusFilter, priorityFilter, sortOrder),
        fetchLiveInquiries('all', 'all', 'desc'),
      ]);
      setInquiries(filteredRes.data);
      setAllInquiriesRaw(allRes.data);
      setIsFromDatabase(filteredRes.fromDatabase);
      setSelectedInquiry((curr) => {
        if (!curr) return null;
        const fresh = allRes.data.find((i) => i.id === curr.id);
        return fresh || curr;
      });
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      showToast(`Failed to load inquiries: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('edenexa_data_updated', handleUpdate);
    return () => window.removeEventListener('edenexa_data_updated', handleUpdate);
  }, [statusFilter, priorityFilter, sortOrder]);

  // Handle incoming navigation from Overview
  useEffect(() => {
    if (initialSelectedInquiry) {
      setSelectedInquiry(initialSelectedInquiry);
      setAdminNotesDraft(initialSelectedInquiry.admin_notes || '');
      if (onClearInitialInquiry) {
        onClearInitialInquiry();
      }
    }
  }, [initialSelectedInquiry]);

  // Compute status summary counts matching the 5 live statuses
  const statusCounts = {
    all: allInquiriesRaw.length,
    new: allInquiriesRaw.filter((i) => i.status === 'new').length,
    contacted: allInquiriesRaw.filter((i) => i.status === 'contacted').length,
    in_progress: allInquiriesRaw.filter((i) => i.status === 'in_progress').length,
    completed: allInquiriesRaw.filter((i) => i.status === 'completed').length,
    rejected: allInquiriesRaw.filter((i) => i.status === 'rejected').length,
  };

  // Client-side text search
  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      (inq.business_name && inq.business_name.toLowerCase().includes(q)) ||
      inq.phone.toLowerCase().includes(q) ||
      (inq.service && inq.service.toLowerCase().includes(q)) ||
      (inq.message && inq.message.toLowerCase().includes(q)) ||
      (inq.email && inq.email.toLowerCase().includes(q))
    );
  });

  // Update Status
  const handleUpdateStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const updated = await updateLiveInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? updated : i))
      );
      setAllInquiriesRaw((prev) =>
        prev.map((i) => (i.id === inquiryId ? updated : i))
      );
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(updated);
      }
      setOpenDropdownId(null);
      showToast(`Status updated to "${newStatus.replace('_', ' ').toUpperCase()}" ✓`, 'success');
    } catch (err: any) {
      showToast(`Failed to update status: ${err?.message || 'Database error'}`, 'error');
    }
  };

  // Update Priority
  const handleUpdatePriority = async (inquiryId: string, newPriority: InquiryPriority) => {
    try {
      const updated = await updateLiveInquiryPriority(inquiryId, newPriority);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? updated : i))
      );
      setAllInquiriesRaw((prev) =>
        prev.map((i) => (i.id === inquiryId ? updated : i))
      );
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(updated);
      }
      showToast('Priority updated successfully in database ✓', 'success');
    } catch (err: any) {
      showToast(`Failed to update priority: ${err?.message || 'Database error'}`, 'error');
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    try {
      const updated = await saveLiveInquiryNotes(selectedInquiry.id, adminNotesDraft);
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
      );
      setAllInquiriesRaw((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
      );
      showToast('Admin notes saved to database ✓', 'success');
    } catch (err: any) {
      showToast(`Failed to save admin notes: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Inquiry
  const handleDelete = async (inquiryId: string) => {
    try {
      await deleteLiveInquiry(inquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
      setAllInquiriesRaw((prev) => prev.filter((i) => i.id !== inquiryId));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
      }
      setDeleteConfirmId(null);
      showToast('Inquiry deleted from database', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Database error';
      showToast(
        msg.startsWith('Failed to') || msg.startsWith('Permission denied')
          ? msg
          : `Failed to delete inquiry: ${msg}`,
        'error'
      );
    }
  };

  const openInquiryModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setAdminNotesDraft(inq.admin_notes || '');
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return {
          label: 'New Lead',
          badgeClass: 'bg-[#FFF8E6] text-[#EAAA00] border-[#EAAA00]/40 font-bold',
          dotClass: 'bg-[#EAAA00]',
        };
      case 'contacted':
        return {
          label: 'Contacted',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
          dotClass: 'bg-blue-500',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
          dotClass: 'bg-purple-500',
        };
      case 'completed':
        return {
          label: 'Completed',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
          dotClass: 'bg-emerald-500',
        };
      case 'rejected':
      default:
        return {
          label: 'Rejected',
          badgeClass: 'bg-[#F4F6F8] text-[#7A7280] border-[#DDE3E8] font-bold',
          dotClass: 'bg-[#7A7280]',
        };
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 text-left text-[#3A0F34]">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn border ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-500'
              : 'bg-[#3A0F34] text-white border-[#EAAA00]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#EAAA00]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
            Inquiries & Leads Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Track customer inquiries, tick statuses, update priority, and manage client notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-white border border-[#DDE3E8] text-[#5C5260] font-semibold shadow-xs">
            {isFromDatabase ? '● Live Supabase DB' : '● Live Store Sync'}
          </span>

          <button
            onClick={loadData}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DDE3E8] text-xs font-bold text-[#3A0F34] hover:border-[#EAAA00] transition cursor-pointer shadow-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border shadow-xs ${
            statusFilter === 'all'
              ? 'bg-[#EAAA00] text-[#3A0F34] border-[#EAAA00]'
              : 'bg-white text-[#5C5260] border-[#DDE3E8] hover:text-[#3A0F34]'
          }`}
        >
          <span>All Leads</span>
          <span className="px-1.5 py-0.2 rounded-md bg-black/10 text-[10px] font-mono">
            {statusCounts.all}
          </span>
        </button>

        {STATUS_LIST.map((st) => {
          const isActive = statusFilter === st.id;
          const count = statusCounts[st.id] || 0;

          return (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border shadow-xs ${
                isActive
                  ? 'bg-[#EAAA00] text-[#3A0F34] border-[#EAAA00]'
                  : 'bg-white text-[#5C5260] border-[#DDE3E8] hover:text-[#3A0F34]'
              }`}
            >
              <span>{st.label}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/10 text-[10px] font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#DDE3E8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7A7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client name, business, phone, service..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-xs text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
          />
        </div>

        {/* Priority & Sort Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-[#5C5260] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Priority:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-xs font-medium text-[#3A0F34] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-xs font-medium text-[#3A0F34] focus:outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-3xl bg-white border border-[#DDE3E8] overflow-visible shadow-sm">
        <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#5C5260] border-b border-[#DDE3E8]">
              <tr>
                <th className="px-5 py-3 font-bold">Client / Business</th>
                <th className="px-5 py-3 font-bold">Phone / WhatsApp</th>
                <th className="px-5 py-3 font-bold">Service / Budget</th>
                <th className="px-5 py-3 font-bold">Status (Click to Change)</th>
                <th className="px-5 py-3 font-bold">Priority</th>
                <th className="px-5 py-3 font-bold">Received</th>
                <th className="px-5 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3E8]">
              {filteredInquiries.map((inq) => {
                const currentBadge = getStatusBadge(inq.status);
                const isDropdownOpen = openDropdownId === inq.id;

                const waUrl = buildWhatsAppUrl(
                  inq.phone,
                  buildLeadFollowUpMessage(inq.name, inq.business_name)
                );

                return (
                  <tr key={inq.id} className="hover:bg-[#F8FAFC] transition group">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#3A0F34] text-sm">{inq.name}</div>
                      {inq.business_name ? (
                        <div className="text-[11px] text-[#EAAA00] font-bold mt-0.5">{inq.business_name}</div>
                      ) : (
                        <div className="text-[10px] text-[#7A7280]">Individual Client</div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 space-y-0.5">
                      <div className="font-mono text-[#3A0F34] font-bold">{inq.phone}</div>
                      {inq.email && <div className="text-[11px] text-[#5C5260]">{inq.email}</div>}
                    </td>

                    <td className="px-5 py-3.5 space-y-0.5">
                      <div className="text-[#3A0F34] font-semibold">{inq.service || 'Website Project'}</div>
                      {inq.budget && <div className="text-[10px] text-[#EAAA00] font-bold">{inq.budget}</div>}
                    </td>

                    {/* INTERACTIVE STATUS TICK PICKER IN TABLE */}
                    <td className="px-5 py-3.5 relative">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : inq.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${currentBadge.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${currentBadge.dotClass}`} />
                          <span>{currentBadge.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-60 ml-1" />
                        </button>

                        {/* Dropdown Options Popup with Checkmark Tick */}
                        {isDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute left-0 top-full mt-1.5 z-50 w-52 rounded-2xl bg-white border border-[#DDE3E8] shadow-2xl p-1.5 space-y-1 animate-fadeIn">
                              <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider text-[#7A7280] border-b border-[#DDE3E8]">
                                Set Status:
                              </div>
                              {STATUS_LIST.map((st) => {
                                const isSelected = inq.status === st.id;

                                return (
                                  <button
                                    key={st.id}
                                    onClick={() => handleUpdateStatus(inq.id, st.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                                      isSelected
                                        ? 'bg-[#FFF8E6] text-[#3A0F34] border border-[#EAAA00]'
                                        : 'text-[#5C5260] hover:bg-[#F8FAFC] hover:text-[#3A0F34]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                          isSelected
                                            ? 'border-[#EAAA00] bg-[#EAAA00] text-[#3A0F34] font-bold'
                                            : 'border-[#DDE3E8] bg-white'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                      </div>
                                      <span>{st.label}</span>
                                    </div>
                                    {isSelected && (
                                      <span className="text-[10px] font-mono text-[#EAAA00]">✓ CURRENT</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Priority Selector */}
                    <td className="px-5 py-3.5">
                      <select
                        value={inq.priority}
                        onChange={(e) => handleUpdatePriority(inq.id, e.target.value as InquiryPriority)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border bg-white cursor-pointer ${
                          inq.priority === 'high'
                            ? 'text-rose-700 border-rose-300'
                            : inq.priority === 'normal'
                            ? 'text-[#3A0F34] border-[#EAAA00]/40'
                            : 'text-[#7A7280] border-[#DDE3E8]'
                        }`}
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5 text-[#7A7280] text-[11px] font-mono">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openInquiryModal(inq)}
                        className="px-3 py-1.5 rounded-xl bg-[#F4F6F8] hover:bg-[#FFF8E6] border border-[#DDE3E8] hover:border-[#EAAA00] text-[#3A0F34] text-xs font-bold transition cursor-pointer"
                      >
                        View & Notes
                      </button>

                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open WhatsApp Chat with customer"
                          className="inline-flex p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!isLoading && filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#7A7280]">
                    No inquiries found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail & Private Admin Notes Modal with Interactive Status Ticker */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <div>
                <h3 className="text-lg font-bold text-[#3A0F34] flex items-center gap-2">
                  <span>{selectedInquiry.name}</span>
                  {selectedInquiry.business_name && (
                    <span className="text-xs text-[#EAAA00] font-bold">
                      ({selectedInquiry.business_name})
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-[#7A7280] font-mono">
                  Inquiry ID: {selectedInquiry.id} · Received {new Date(selectedInquiry.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-[#7A7280] hover:text-[#3A0F34] hover:bg-[#DDE3E8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              
              {/* PRIMARY LEAD STATUS TICKER SECTION */}
              <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#EAAA00]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3A0F34] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EAAA00]" />
                    <span>Lead Status Progression (Click Option to Set):</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#5C5260]">
                    Current: <strong className="text-[#3A0F34] uppercase">{selectedInquiry.status.replace('_', ' ')}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {STATUS_LIST.map((st) => {
                    const isTicked = selectedInquiry.status === st.id;

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, st.id)}
                        className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isTicked
                            ? 'bg-white border-[#EAAA00] text-[#3A0F34] shadow-md ring-1 ring-[#EAAA00]'
                            : 'bg-white/60 border-[#DDE3E8] text-[#5C5260] hover:bg-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span className={isTicked ? 'text-[#3A0F34] font-extrabold' : 'text-[#5C5260]'}>
                              {st.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#7A7280] leading-tight">
                            {st.desc}
                          </div>
                        </div>

                        {/* Interactive Tick Checkbox Circle */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isTicked
                              ? 'bg-[#EAAA00] border-[#EAAA00] text-[#3A0F34]'
                              : 'border-[#DDE3E8] bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#DDE3E8]">
                <div>
                  <span className="text-[11px] text-[#7A7280] block font-medium">WhatsApp / Phone:</span>
                  <span className="font-mono text-[#3A0F34] font-bold text-xs">
                    {selectedInquiry.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7280] block font-medium">Email Address:</span>
                  <span className="text-[#3A0F34] text-xs">
                    {selectedInquiry.email || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7280] block font-medium">Service / Package:</span>
                  <span className="text-[#3A0F34] text-xs font-bold">{selectedInquiry.service || 'Custom Website'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7280] block font-medium">Estimated Budget:</span>
                  <span className="text-[#EAAA00] font-bold text-xs">
                    {selectedInquiry.budget || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Full Requirements / Message */}
              <div>
                <label className="block text-xs font-bold text-[#3A0F34] uppercase tracking-wider mb-2">
                  Client Project Requirements & Message:
                </label>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Private Admin Notes */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DDE3E8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#3A0F34] font-bold text-xs">
                    <span>Private Admin Notes (Confidential)</span>
                  </div>
                  <span className="text-[10px] text-[#7A7280]">
                    Never visible by visitors
                  </span>
                </div>

                <textarea
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                  placeholder="Record internal client discussions, custom quotes, timeline milestones, or follow-up notes here..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-[#DDE3E8] text-xs text-[#3A0F34] placeholder-[#7A7280]/50 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-bold text-xs transition cursor-pointer"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DDE3E8] bg-[#F4F6F8] flex items-center justify-between">
              {deleteConfirmId === selectedInquiry.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 font-bold">Confirm delete?</span>
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2.5 py-1 rounded bg-[#DDE3E8] text-[#3A0F34] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selectedInquiry.id)}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 py-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Inquiry</span>
                </button>
              )}

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-[#3A0F34] hover:bg-[#250A21] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
