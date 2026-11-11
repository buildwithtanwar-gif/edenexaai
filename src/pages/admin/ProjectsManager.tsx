import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, X, Save, Loader2, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { Project } from '../../types';
import { fetchLiveProjects, saveLiveProject, deleteLiveProject } from '../../lib/adminStore';

interface ProjectsManagerProps {
  onDataUpdated?: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ onDataUpdated }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields matching live schema: title, slug, category, description, image_url, project_url, featured, active, sort_order
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectUrl, setFormProjectUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);

  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchLiveProjects(true);
      setProjects(res.data);
    } catch (err: any) {
      console.error('Error fetching projects in admin:', err);
      setErrorMessage(err?.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setCurrentProject(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('Business Website');
    setFormDescription('');
    setFormProjectUrl('');
    setFormImageUrl('');
    setFormFeatured(false);
    setFormActive(true);
    setFormSortOrder(projects.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setCurrentProject(proj);
    setFormTitle(proj.title);
    setFormSlug(proj.slug);
    setFormCategory(proj.category || 'Business Website');
    setFormDescription(proj.description || '');
    setFormProjectUrl(proj.project_url || '');
    setFormImageUrl(proj.image_url || '');
    setFormFeatured(proj.featured);
    setFormActive(proj.active !== false);
    setFormSortOrder(proj.sort_order || 1);
    setIsModalOpen(true);
  };

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr) return true;
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
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

    if (formProjectUrl.trim() && !validateUrl(formProjectUrl.trim())) {
      showToast('Please provide a valid project URL starting with http:// or https://', 'error');
      return;
    }

    if (formImageUrl.trim() && !validateUrl(formImageUrl.trim())) {
      showToast('Image URL must be a valid http:// or https:// link, or left blank.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Project> = {
        title: formTitle.trim(),
        slug: formSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        category: formCategory.trim() || null,
        description: formDescription.trim() || null,
        project_url: formProjectUrl.trim() || null,
        image_url: formImageUrl.trim() || null,
        featured: formFeatured,
        active: formActive,
        sort_order: formSortOrder,
      };

      await saveLiveProject({ ...(currentProject ? { id: currentProject.id } : {}), ...payload });
      setIsModalOpen(false);
      showToast(`Project "${formTitle.trim()}" saved in database ✓`, 'success');
      await fetchProjects();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLiveProject(id);
      setDeleteConfirmId(null);
      showToast('Project deleted from database', 'success');
      await fetchProjects();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Database error'}`, 'error');
    }
  };

  const handleToggleActive = async (proj: Project) => {
    try {
      const updated = { ...proj, active: !proj.active };
      await saveLiveProject(updated);
      showToast(`Project "${proj.title}" active status updated in database ✓`, 'success');
      await fetchProjects();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(`Update failed: ${err?.message || 'Database error'}`, 'error');
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
            Projects & Showcase Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
            Manage portfolio case studies, live links, and showcase visibility on the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Projects Grid / Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading projects from database...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DDE3E8] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#EAAA00] flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#3A0F34]">No portfolio projects yet</h3>
          <p className="text-xs text-[#5C5260] max-w-sm mx-auto">
            Add your first completed client project or case study to display on the public portfolio.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] font-bold text-xs cursor-pointer shadow-sm"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`flex flex-col justify-between rounded-2xl bg-white border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                proj.active !== false ? 'border-[#DDE3E8]' : 'border-dashed border-[#DDE3E8] opacity-75'
              }`}
            >
              <div>
                {/* Project Image Preview Header */}
                <div className="relative h-44 bg-[#F4F6F8] overflow-hidden border-b border-[#DDE3E8]">
                  {proj.image_url ? (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#7A7280]">
                      No Preview Image
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {proj.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAAA00] text-[#3A0F34] shadow-xs">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        proj.active !== false
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#F4F6F8] text-[#7A7280] border border-[#DDE3E8]'
                      }`}
                    >
                      {proj.active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-mono text-[#EAAA00] font-bold uppercase tracking-wider">
                    {proj.category || 'General Web'}
                  </div>
                  <h3 className="font-extrabold text-[#3A0F34] text-base leading-snug">
                    {proj.title}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-[#5C5260] line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.project_url && (
                    <a
                      href={proj.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#EAAA00] hover:underline font-mono truncate max-w-full pt-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{proj.project_url}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-[#DDE3E8] bg-[#F8FAFC] flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(proj)}
                  className="flex items-center gap-1.5 text-xs text-[#5C5260] hover:text-[#3A0F34] font-medium transition cursor-pointer"
                >
                  {proj.active !== false ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#7A7280]" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-1.5 rounded-lg text-[#3A0F34] hover:bg-white hover:border border-[#DDE3E8] transition cursor-pointer"
                    title="Edit project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === proj.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(proj.id)}
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
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete project"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
              <h3 className="text-base font-bold text-[#3A0F34]">
                {currentProject ? 'Edit Project' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7A7280] hover:text-[#3A0F34] hover:bg-[#DDE3E8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!currentProject) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Artisanal Cafe & Bakery"
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
                    placeholder="e.g. artisanal-cafe"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>
                <div>
                  <label className="block text-[#3A0F34] font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Cafe / Restaurant"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Project Overview / Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the client, the project scope, and what was delivered..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Live Project / Demo URL</label>
                <input
                  type="url"
                  value={formProjectUrl}
                  onChange={(e) => setFormProjectUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
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
                    id="featured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#EAAA00] focus:ring-[#EAAA00]"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-[#3A0F34] cursor-pointer">
                    Featured
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
                    Active / Visible
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  <span>{currentProject ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
