import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Tag, Save, Loader2, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { Coupon } from '../../types';
import { fetchLiveCoupons, saveLiveCoupon, deleteLiveCoupon } from '../../lib/adminStore';

interface CouponsManagerProps {
  onDataUpdated?: () => void;
}

export const CouponsManager: React.FC<CouponsManagerProps> = ({ onDataUpdated }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState('10');
  const [formMinOrderValue, setFormMinOrderValue] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formValidFrom, setFormValidFrom] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formActive, setFormActive] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCoupons = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchLiveCoupons();
      setCoupons(res.data);
    } catch (err: any) {
      console.error('Error fetching coupons in admin:', err);
      setErrorMessage(err?.message || 'Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setCurrentCoupon(null);
    setFormCode('');
    setFormDescription('');
    setFormDiscountType('percentage');
    setFormDiscountValue('10');
    setFormMinOrderValue('');
    setFormMaxDiscount('');
    setFormValidFrom('');
    setFormValidUntil('');
    setFormUsageLimit('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setCurrentCoupon(c);
    setFormCode(c.code);
    setFormDescription(c.description || '');
    setFormDiscountType(c.discount_type);
    setFormDiscountValue(String(c.discount_value));
    setFormMinOrderValue(c.min_order_value !== null && c.min_order_value !== undefined ? String(c.min_order_value) : '');
    setFormMaxDiscount(c.max_discount !== null && c.max_discount !== undefined ? String(c.max_discount) : '');
    setFormValidFrom(c.valid_from ? c.valid_from.split('T')[0] : '');
    setFormValidUntil(c.valid_until ? c.valid_until.split('T')[0] : '');
    setFormUsageLimit(c.usage_limit !== null && c.usage_limit !== undefined ? String(c.usage_limit) : '');
    setFormActive(c.active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Coupon code is required.', 'error');
      return;
    }

    const val = Number(formDiscountValue);
    if (isNaN(val) || val <= 0) {
      showToast('Discount value must be a valid positive number.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Coupon> = {
        ...(currentCoupon ? { id: currentCoupon.id } : {}),
        code: cleanCode,
        description: formDescription.trim() || null,
        discount_type: formDiscountType,
        discount_value: val,
        min_order_value: formMinOrderValue.trim() ? Number(formMinOrderValue.trim()) : null,
        max_discount: formMaxDiscount.trim() ? Number(formMaxDiscount.trim()) : null,
        valid_from: formValidFrom.trim() ? new Date(formValidFrom.trim()).toISOString() : null,
        valid_until: formValidUntil.trim() ? new Date(formValidUntil.trim()).toISOString() : null,
        usage_limit: formUsageLimit.trim() ? Number(formUsageLimit.trim()) : null,
        active: formActive,
      };

      await saveLiveCoupon(payload);
      setIsModalOpen(false);
      showToast(`Coupon "${cleanCode}" saved in database ✓`, 'success');
      await loadCoupons();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLiveCoupon(id);
      setDeleteConfirmId(null);
      showToast('Coupon deleted from database', 'success');
      await loadCoupons();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await saveLiveCoupon({ id: c.id, code: c.code, active: !c.active });
      showToast(`Coupon "${c.code}" status updated ✓`, 'success');
      await loadCoupons();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Update failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 text-[#3A0F34]">
      {/* Toast Notification */}
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
            <Check className="w-4 h-4 text-[#EAAA00]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
            Coupons & Referral Promos
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Manage promotional discount codes verified against the live database for public inquiries.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coupon</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Coupons Table / Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading coupons from database...
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DDE3E8] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#EAAA00] flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#3A0F34]">No coupons found in database</h3>
          <p className="text-xs text-[#5C5260] max-w-sm mx-auto">
            Create promotional codes (e.g. WELCOME10) that clients can enter when submitting project inquiries.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] font-bold text-xs cursor-pointer shadow-sm"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-[#DDE3E8] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#5C5260] border-b border-[#DDE3E8]">
                <tr>
                  <th className="px-5 py-3 font-bold">Code</th>
                  <th className="px-5 py-3 font-bold">Discount</th>
                  <th className="px-5 py-3 font-bold">Description</th>
                  <th className="px-5 py-3 font-bold">Min Order / Cap</th>
                  <th className="px-5 py-3 font-bold">Usage</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3E8]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="px-5 py-3.5 font-mono font-extrabold text-[#3A0F34] text-sm">
                      {c.code}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#EAAA00]">
                        {c.discount_type === 'percentage'
                          ? `${c.discount_value}% Off`
                          : `₹${Number(c.discount_value).toLocaleString('en-IN')} Off`}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[#5C5260]">
                      {c.description || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-[#5C5260] font-mono text-[11px]">
                      {c.min_order_value ? `Min ₹${c.min_order_value.toLocaleString('en-IN')}` : 'No min'}
                      {c.max_discount ? ` · Cap ₹${c.max_discount.toLocaleString('en-IN')}` : ''}
                    </td>

                    <td className="px-5 py-3.5 text-[#5C5260] font-mono text-[11px]">
                      {c.times_used} uses {c.usage_limit ? `/ ${c.usage_limit} max` : ''}
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          c.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-[#F4F6F8] text-[#7A7280] border border-[#DDE3E8] hover:bg-[#DDE3E8]'
                        }`}
                      >
                        {c.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-[#3A0F34] hover:bg-[#F4F6F8] border border-[#DDE3E8] transition cursor-pointer"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === c.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 rounded bg-[#DDE3E8] text-[#3A0F34] text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <h3 className="text-base font-bold text-[#3A0F34]">
                {currentCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7A7280] hover:text-[#3A0F34] hover:bg-[#DDE3E8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>

                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Discount Type</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-semibold focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Discount Value *</label>
                <input
                  type="number"
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(e.target.value)}
                  min={1}
                  required
                  placeholder="e.g. 10 for 10% or 500 for ₹500"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 10% launch discount on all websites"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(e.target.value)}
                    placeholder="Optional, e.g. 1500"
                    min={0}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="Optional, e.g. 1000"
                    min={0}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="Optional, e.g. 100"
                    min={1}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#EAAA00] focus:ring-[#EAAA00]"
                />
                <label htmlFor="couponActive" className="text-xs font-bold text-[#3A0F34] cursor-pointer">
                  Active (Clients can redeem this code)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDE3E8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F8] text-[#3A0F34] font-semibold text-xs border border-[#DDE3E8] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{currentCoupon ? 'Save Changes' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
