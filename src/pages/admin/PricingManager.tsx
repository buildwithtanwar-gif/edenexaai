import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  DollarSign,
  Save,
  Loader2,
  AlertCircle,
  Star,
  Sparkles,
  Zap
} from 'lucide-react';
import { PricingPackage } from '../../types';
import {
  fetchLivePricing,
  saveLivePricing,
  deleteLivePricing,
} from '../../lib/adminStore';

interface PricingManagerProps {
  onDataUpdated?: () => void;
}

export const PricingManager: React.FC<PricingManagerProps> = ({ onDataUpdated }) => {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [currentPackage, setCurrentPackage] = useState<PricingPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields matching live schema: name, price (numeric | null), description, features, highlighted, active, sort_order
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<string>(''); // string input for numeric price or blank for custom
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [formHighlighted, setFormHighlighted] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);

  const loadPackages = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchLivePricing(true);
      setPackages(res.data);
    } catch (err: any) {
      console.error('Error fetching pricing packages in admin:', err);
      setErrorMessage(err?.message || 'Failed to fetch packages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const openCreateModal = () => {
    setCurrentPackage(null);
    setFormName('');
    setFormPrice('1499');
    setFormDescription('');
    setFormFeatures([]);
    setNewFeatureInput('');
    setFormHighlighted(false);
    setFormActive(true);
    setFormSortOrder(packages.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PricingPackage) => {
    setCurrentPackage(pkg);
    setFormName(pkg.name);
    setFormPrice(pkg.price !== null && pkg.price !== undefined ? String(pkg.price) : '');
    setFormDescription(pkg.description || '');
    setFormFeatures(Array.isArray(pkg.features) ? [...pkg.features] : []);
    setNewFeatureInput('');
    setFormHighlighted(pkg.highlighted);
    setFormActive(pkg.active !== false);
    setFormSortOrder(pkg.sort_order || 1);
    setIsModalOpen(true);
  };

  const addFeature = () => {
    if (newFeatureInput.trim()) {
      setFormFeatures([...formFeatures, newFeatureInput.trim()]);
      setNewFeatureInput('');
    }
  };

  const removeFeature = (idx: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== idx));
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Package name is required.', 'error');
      return;
    }

    const trimmedPrice = formPrice.trim();
    let numericPrice: number | null = null;
    if (trimmedPrice !== '') {
      const parsed = Number(trimmedPrice);
      if (isNaN(parsed) || parsed < 0) {
        showToast('Price must be a valid positive number or left blank for "Let\'s Discuss".', 'error');
        return;
      }
      numericPrice = parsed;
    }

    setIsSaving(true);
    try {
      const payload: Partial<PricingPackage> = {
        ...(currentPackage ? { id: currentPackage.id } : {}),
        name: formName.trim(),
        price: numericPrice,
        description: formDescription.trim() || null,
        features: formFeatures,
        highlighted: formHighlighted,
        active: formActive,
        sort_order: formSortOrder,
      };

      await saveLivePricing(payload);
      setIsModalOpen(false);
      showToast(`Package "${formName.trim()}" saved in database! ✓`, 'success');

      await loadPackages();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLivePricing(id);
      setDeleteConfirmId(null);
      showToast('Package deleted from database', 'success');
      await loadPackages();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleActive = async (pkg: PricingPackage) => {
    try {
      const updated = { ...pkg, active: !pkg.active };
      await saveLivePricing(updated);
      showToast(`Package "${pkg.name}" status updated in database ✓`, 'success');
      await loadPackages();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Status update failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleHighlight = async (pkg: PricingPackage) => {
    try {
      const updated = { ...pkg, highlighted: !pkg.highlighted };
      await saveLivePricing(updated);
      showToast(`Package "${pkg.name}" highlight updated in database ✓`, 'success');
      await loadPackages();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Highlight update failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 text-[#3A0F34]">
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
            <Check className="w-4 h-4 text-[#EAAA00]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
            Pricing Packages Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Configure standard packages, transparent rates, inclusions, and featured flags.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Packages Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading pricing packages from database...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DDE3E8] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#EAAA00] flex items-center justify-center mx-auto">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#3A0F34]">No pricing packages found</h3>
          <p className="text-xs text-[#5C5260] max-w-sm mx-auto">
            Create standard pricing tiers or custom quote packages to display on the pricing section.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] font-bold text-xs cursor-pointer shadow-sm"
          >
            Create First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const displayPrice =
              pkg.price === null || pkg.price === undefined
                ? "Let's Discuss"
                : `₹${Number(pkg.price).toLocaleString('en-IN')}`;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between p-6 rounded-3xl bg-white border transition-all duration-200 ${
                  pkg.highlighted
                    ? 'border-2 border-[#EAAA00] shadow-md shadow-[#EAAA00]/10'
                    : 'border-[#DDE3E8] shadow-xs hover:shadow-md'
                } ${pkg.active !== false ? '' : 'opacity-70 border-dashed'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pkg.active !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-[#F4F6F8] text-[#7A7280] border border-[#DDE3E8]'
                      }`}
                    >
                      {pkg.active !== false ? 'Active' : 'Hidden'}
                    </span>

                    <button
                      onClick={() => handleToggleHighlight(pkg)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        pkg.highlighted
                          ? 'bg-[#EAAA00] text-[#3A0F34] border-[#EAAA00]'
                          : 'bg-white text-[#7A7280] border-[#DDE3E8] hover:border-[#EAAA00]'
                      }`}
                      title="Toggle recommended badge"
                    >
                      <Star className="w-3 h-3" />
                      <span>{pkg.highlighted ? 'Featured' : 'Mark Featured'}</span>
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#3A0F34]">{pkg.name}</h3>

                  {pkg.description && (
                    <p className="text-xs text-[#5C5260] mt-1 mb-4 leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>
                  )}

                  <div className="my-4 pb-4 border-b border-[#DDE3E8]">
                    <div className="text-2xl font-extrabold text-[#3A0F34] font-mono">
                      {displayPrice}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#7A7280] font-bold">
                      Inclusions ({pkg.features?.length || 0}):
                    </div>
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-[#5C5260]">
                            <Check className="w-3.5 h-3.5 text-[#EAAA00] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#7A7280] italic">No deliverables listed</div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-[#DDE3E8] flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className="text-xs font-semibold text-[#5C5260] hover:text-[#3A0F34] cursor-pointer"
                  >
                    {pkg.active !== false ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-1.5 rounded-lg text-[#3A0F34] hover:bg-[#F4F6F8] border border-[#DDE3E8] transition cursor-pointer"
                      title="Edit package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === pkg.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(pkg.id)}
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
                        onClick={() => setDeleteConfirmId(pkg.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <h3 className="text-base font-bold text-[#3A0F34]">
                {currentPackage ? 'Edit Pricing Package' : 'Create Pricing Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7A7280] hover:text-[#3A0F34] hover:bg-[#DDE3E8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Package Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Starter Website"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">
                  Price (Numeric in ₹, or leave blank for "Let's Discuss")
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7A7280]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 1499 (leave blank for custom quote)"
                    min={0}
                    step={1}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>
                <span className="text-[10px] text-[#7A7280] mt-1 block">
                  Numeric value only. If left empty, package will display as "Let's Discuss".
                </span>
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Package Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief overview of who this package is for..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              {/* Feature Items List */}
              <div className="space-y-2">
                <label className="block text-[#3A0F34] font-bold">Inclusions & Deliverables</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder="e.g. Responsive mobile design"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3.5 py-2 rounded-xl bg-[#3A0F34] text-white font-bold hover:bg-[#250A21] transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {formFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#DDE3E8] text-xs"
                    >
                      <span className="text-[#3A0F34]">{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="highlighted"
                    checked={formHighlighted}
                    onChange={(e) => setFormHighlighted(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EAAA00] focus:ring-[#EAAA00]"
                  />
                  <label htmlFor="highlighted" className="text-xs font-bold text-[#3A0F34] cursor-pointer">
                    Recommended
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EAAA00] focus:ring-[#EAAA00]"
                  />
                  <label htmlFor="active" className="text-xs font-bold text-[#3A0F34] cursor-pointer">
                    Active / Live
                  </label>
                </div>
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
                  <span>{currentPackage ? 'Save Changes' : 'Create Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
