import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { FAQ } from '../../types';
import { fetchLiveFaqs, saveLiveFaq, deleteLiveFaq } from '../../lib/adminStore';

interface FaqsManagerProps {
  onDataUpdated?: () => void;
}

export const FaqsManager: React.FC<FaqsManagerProps> = ({ onDataUpdated }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchLiveFaqs(true);
      setFaqs(res.data);
    } catch (err: any) {
      console.error('Error fetching FAQs in admin:', err);
      setErrorMessage(err?.message || 'Failed to fetch FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setCurrentFaq(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormActive(true);
    setFormSortOrder(faqs.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setCurrentFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormActive(faq.active);
    setFormSortOrder(faq.sort_order || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formQuestion.trim() || !formAnswer.trim()) {
      showToast('Question and answer are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<FAQ> = {
        ...(currentFaq ? { id: currentFaq.id } : {}),
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        active: formActive,
        sort_order: formSortOrder,
      };

      await saveLiveFaq(payload);
      setIsModalOpen(false);
      await fetchFaqs();
      showToast('FAQ saved successfully.', 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Save failed: ${err.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLiveFaq(id);
      setDeleteConfirmId(null);
      await fetchFaqs();
      showToast('FAQ deleted successfully.', 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const updated = { ...faq, active: !faq.active };
      await saveLiveFaq(updated);
      await fetchFaqs();
      showToast(`FAQ marked as ${updated.active ? 'active' : 'hidden'}.`, 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Status toggle failed: ${err.message || 'Database error'}`, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 text-[#3A0F34]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-xs opacity-60 hover:opacity-100 font-bold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
            FAQ Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Manage frequently asked questions, detailed answers, ordering, and public visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs transition shadow-md shadow-[#EAAA00]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading FAQs from database...
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#DDE3E8] p-8">
          <p className="text-sm font-bold text-[#3A0F34] mb-1">No FAQs in database</p>
          <p className="text-xs text-[#5C5260] mb-4">Click below to create your first FAQ entry.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] font-bold text-xs"
          >
            Create FAQ
          </button>
        </div>
      ) : (
        /* FAQs List */
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`p-5 rounded-2xl border transition-all bg-white ${
                faq.active
                  ? 'border-[#DDE3E8] shadow-sm hover:border-[#EAAA00]'
                  : 'border-[#DDE3E8] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EAAA00] font-mono">
                    #{faq.sort_order}
                  </span>
                  <h3 className="text-sm font-bold text-[#3A0F34]">{faq.question}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(faq)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase transition cursor-pointer ${
                      faq.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-[#F4F6F8] text-[#7A7280]'
                    }`}
                  >
                    {faq.active ? 'Active' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-1.5 rounded-lg bg-[#F4F6F8] hover:bg-[#FFF8E6] text-[#3A0F34] border border-[#DDE3E8] hover:border-[#EAAA00] transition cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === faq.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded bg-[#DDE3E8] text-[#3A0F34] text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(faq.id)}
                      className="p-1.5 rounded-lg bg-[#F4F6F8] hover:bg-rose-50 text-[#7A7280] hover:text-rose-600 border border-[#DDE3E8] transition cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#5C5260] leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <h3 className="text-base font-bold text-[#3A0F34]">
                {currentFaq ? 'Edit FAQ' : 'Create FAQ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#7A7280] hover:text-[#3A0F34]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Question *</label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  required
                  placeholder="e.g. How does pricing work?"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Answer *</label>
                <textarea
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  required
                  rows={4}
                  placeholder="Clear and transparent answer"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="activeToggleFaq"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded border-[#DDE3E8] text-[#EAAA00] focus:ring-[#EAAA00]"
                  />
                  <label htmlFor="activeToggleFaq" className="text-[#3A0F34] font-bold cursor-pointer">
                    Active (Visible in Accordion)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDE3E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F8] text-[#5C5260] hover:text-[#3A0F34] font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold shadow-md shadow-[#EAAA00]/25 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#3A0F34]" /> : <Save className="w-4 h-4 text-[#3A0F34]" />}
                  <span>Save FAQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
