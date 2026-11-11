import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Briefcase, Save, Loader2, AlertCircle } from 'lucide-react';
import { Service } from '../../types';
import { fetchLiveServices, saveLiveService, deleteLiveService } from '../../lib/adminStore';

interface ServicesManagerProps {
  onDataUpdated?: () => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ onDataUpdated }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit / Create Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields matching live schema: title, slug, description, price (text), features, active, sort_order
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);

  const fetchServices = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchLiveServices(true);
      setServices(res.data);
    } catch (err: any) {
      console.error('Error fetching services in admin:', err);
      setErrorMessage(err?.message || 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormPrice('Starting at ₹1,499');
    setFormFeatures([]);
    setNewFeatureInput('');
    setFormActive(true);
    setFormSortOrder(services.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setFormTitle(srv.title);
    setFormSlug(srv.slug);
    setFormDescription(srv.description || '');
    setFormPrice(srv.price || '');
    setFormFeatures(Array.isArray(srv.features) ? [...srv.features] : []);
    setNewFeatureInput('');
    setFormActive(srv.active !== false);
    setFormSortOrder(srv.sort_order || 1);
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
    if (!formTitle.trim() || !formSlug.trim()) {
      showToast('Title and slug are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Service> = {
        title: formTitle.trim(),
        slug: formSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: formDescription.trim() || null,
        price: formPrice.trim() || null,
        features: formFeatures,
        active: formActive,
        sort_order: formSortOrder,
      };

      await saveLiveService({ ...(editingService ? { id: editingService.id } : {}), ...payload });
      setIsModalOpen(false);
      showToast('Service saved in database ✓', 'success');
      await fetchServices();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Error saving service: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLiveService(id);
      setDeleteConfirmId(null);
      showToast('Service deleted from database', 'success');
      await fetchServices();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Error deleting service: ${err?.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleActive = async (srv: Service) => {
    try {
      await saveLiveService({ id: srv.id, title: srv.title, slug: srv.slug, active: !srv.active });
      showToast('Service status updated in database ✓', 'success');
      await fetchServices();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Error toggling service status: ${err?.message || 'Database error'}`, 'error');
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
            Services Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Manage agency offerings, pricing indicators, bullet deliverables, and visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading services from database...
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DDE3E8] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#EAAA00] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#3A0F34]">No services registered</h3>
          <p className="text-xs text-[#5C5260] max-w-sm mx-auto">
            Create standard service offerings to display on the agency services section.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] font-bold text-xs cursor-pointer shadow-sm"
          >
            Create First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`flex flex-col justify-between p-6 rounded-3xl bg-white border transition-all duration-200 ${
                srv.active !== false ? 'border-[#DDE3E8] shadow-xs hover:shadow-md' : 'border-dashed border-[#DDE3E8] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-[#EAAA00] uppercase tracking-wider">
                    {srv.slug}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      srv.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-[#F4F6F8] text-[#7A7280] border border-[#DDE3E8]'
                    }`}
                  >
                    {srv.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-[#3A0F34]">{srv.title}</h3>

                {srv.price && (
                  <div className="mt-1 text-xs font-mono font-bold text-[#EAAA00]">
                    {srv.price}
                  </div>
                )}

                {srv.description && (
                  <p className="text-xs text-[#5C5260] mt-2 mb-4 leading-relaxed">
                    {srv.description}
                  </p>
                )}

                {/* Features */}
                {Array.isArray(srv.features) && srv.features.length > 0 && (
                  <div className="space-y-1.5 my-4 pt-3 border-t border-[#DDE3E8]">
                    <div className="text-[10px] font-mono uppercase text-[#7A7280] font-bold mb-1">
                      Deliverables:
                    </div>
                    {srv.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-[#5C5260]">
                        <Check className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#DDE3E8] flex items-center justify-between mt-4">
                <button
                  onClick={() => handleToggleActive(srv)}
                  className="text-xs font-semibold text-[#5C5260] hover:text-[#3A0F34] cursor-pointer"
                >
                  {srv.active !== false ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(srv)}
                    className="p-1.5 rounded-lg text-[#3A0F34] hover:bg-[#F4F6F8] border border-[#DDE3E8] transition cursor-pointer"
                    title="Edit service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === srv.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(srv.id)}
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
                      onClick={() => setDeleteConfirmId(srv.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <h3 className="text-base font-bold text-[#3A0F34]">
                {editingService ? 'Edit Service' : 'Add New Service'}
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
                <label className="block text-[#3A0F34] font-bold mb-1">Service Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingService) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Business Websites"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. business-websites"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>

                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Display Price (Text)</label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. Starting at ₹1,499"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed description of the service and target audience..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              {/* Feature Items List */}
              <div className="space-y-2">
                <label className="block text-[#3A0F34] font-bold">Included Deliverables</label>
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
                    placeholder="e.g. Mobile-first responsive layout"
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

              <div className="grid grid-cols-2 gap-3 pt-2">
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
                    id="serviceActive"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EAAA00] focus:ring-[#EAAA00]"
                  />
                  <label htmlFor="serviceActive" className="text-xs font-bold text-[#3A0F34] cursor-pointer">
                    Active / Live on Website
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
                  <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
