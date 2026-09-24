'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Search, Trash2, Edit3, 
  Upload, Download, AlertCircle, X, Tag, Eye, FolderKanban 
} from 'lucide-react';
import { Faq, FaqCategory } from '@/lib/db/types';

export default function FaqManagementPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws_technova_demo');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  // Category Management Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Add/Edit Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Array<{ question: string; answer: string; tags?: string[] }>>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fetchWorkspaceAndFaqs = async () => {
    setIsLoading(true);
    try {
      // 1. Get current workspace
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const wsId = meData.workspaces?.[0]?.id || 'ws_technova_demo';
      setActiveWorkspaceId(wsId);

      // 2. Get categories
      const catRes = await fetch(`/api/workspaces/${wsId}/categories`);
      const catData = await catRes.json();
      setCategories(catData.categories || []);

      // 3. Get FAQs
      const faqsRes = await fetch(`/api/workspaces/${wsId}/faqs`);
      const faqsData = await faqsRes.json();
      setFaqs(faqsData.faqs || []);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchWorkspaceAndFaqs();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    setCategoryModalError(null);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => [...prev, data.category]);
        setNewCatName('');
      } else {
        setCategoryModalError(data.error || 'Failed to create category');
      }
    } catch {
      setCategoryModalError('Network error creating category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Are you sure you want to delete this category? FAQs assigned to it will become unassigned.')) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/categories/${catId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        if (selectedCategory === catId) {
          setSelectedCategory('ALL');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch {
      alert('Network error deleting category');
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = 
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || f.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategoryId(categories[0]?.id || '');
    setFormTags('');
    setFormIsEnabled(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategoryId(faq.categoryId || '');
    setFormTags(faq.tags.join(', '));
    setFormIsEnabled(faq.isEnabled);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      setFormError('Both Question and Answer are required.');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (editingFaq) {
        // Edit existing FAQ
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}/faqs/${editingFaq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formQuestion.trim(),
            answer: formAnswer.trim(),
            categoryId: formCategoryId || undefined,
            tags: tagsArray,
            isEnabled: formIsEnabled,
          }),
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          fetchWorkspaceAndFaqs();
        } else {
          const d = await res.json();
          setFormError(d.error || 'Failed to update FAQ');
        }
      } else {
        // Create new FAQ
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}/faqs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formQuestion.trim(),
            answer: formAnswer.trim(),
            categoryId: formCategoryId || undefined,
            tags: tagsArray,
            isEnabled: formIsEnabled,
          }),
        });

        if (res.ok) {
          setIsAddModalOpen(false);
          fetchWorkspaceAndFaqs();
        } else {
          const d = await res.json();
          setFormError(d.error || 'Failed to create FAQ');
        }
      }
    } catch {
      setFormError('Network error saving FAQ.');
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/faqs/${faqId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFaqs(prev => prev.filter(f => f.id !== faqId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleEnabled = async (faq: Faq) => {
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/faqs/${faq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !faq.isEnabled }),
      });
      if (res.ok) {
        setFaqs(prev => prev.map(f => (f.id === faq.id ? { ...f, isEnabled: !f.isEnabled } : f)));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // CSV File Handler
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return;

      const parsed: Array<{ question: string; answer: string; tags?: string[] }> = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        // Simple regex parser for CSV
        const parts = lines[i].split(',').map(s => s.replace(/^"(.*)"$/, '$1').trim());
        if (parts[0] && parts[1]) {
          parsed.push({
            question: parts[0],
            answer: parts[1],
            tags: parts[2] ? parts[2].split(';').map(t => t.trim()) : [],
          });
        }
      }
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (csvPreview.length === 0) return;
    setImportStatus('Importing FAQs into database...');
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/faqs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: csvPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportStatus(`Successfully imported ${data.importedCount} FAQs!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setCsvFile(null);
          setCsvPreview([]);
          setImportStatus(null);
          fetchWorkspaceAndFaqs();
        }, 1200);
      } else {
        setImportStatus(`Import failed: ${data.error}`);
      }
    } catch {
      setImportStatus('Error importing CSV file.');
    }
  };

  const handleExportCsv = () => {
    const header = ['Question', 'Answer', 'Tags', 'Category', 'Views'];
    const rows = faqs.map(f => [
      `"${f.question.replace(/"/g, '""')}"`,
      `"${f.answer.replace(/"/g, '""')}"`,
      `"${f.tags.join(';')}"`,
      `"${categories.find(c => c.id === f.categoryId)?.name || 'General'}"`,
      f.viewCount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sahayak_faqs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Knowledge Base & FAQs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage the verified question-and-answer repository that powers your AI assistant.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            title="Manage Knowledge Base Categories"
          >
            <FolderKanban className="w-4 h-4 text-slate-500" /> Categories
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            title="Export all FAQs to CSV file"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-slate-500" /> Import CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs, tags, answers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none transition text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            All ({faqs.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading knowledge base...</div>
        ) : filteredFaqs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredFaqs.map(faq => {
              const cat = categories.find(c => c.id === faq.categoryId);
              return (
                <div key={faq.id} className="p-5 hover:bg-slate-50/70 transition flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{faq.question}</span>
                      {cat && (
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          {cat.name}
                        </span>
                      )}
                      {!faq.isEnabled && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Disabled
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pr-6">{faq.answer}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {faq.viewCount} views
                      </span>
                      {faq.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {faq.tags.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleToggleEnabled(faq)}
                      title={faq.isEnabled ? 'Disable FAQ' : 'Enable FAQ'}
                      className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
                        faq.isEnabled 
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-slate-200 text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {faq.isEnabled ? 'Active' : 'Off'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No FAQs match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try changing your filters or add a new question.</p>
          </div>
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Customer Question *
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={e => setFormQuestion(e.target.value)}
                  placeholder="e.g. What is your refund policy?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Approved Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formAnswer}
                  onChange={e => setFormAnswer(e.target.value)}
                  placeholder="Enter the official, verified business answer..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-800"
                  >
                    <option value="">General</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formIsEnabled ? 'true' : 'false'}
                    onChange={e => setFormIsEnabled(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-800"
                  >
                    <option value="true">Active & Searchable</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Search Keywords / Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="e.g. refund, return, money back, guarantee"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                >
                  {editingFaq ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Bulk Import FAQs via CSV</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload a <code>.csv</code> file with columns: <strong>Question, Answer, Tags</strong> (optional).
            </p>

            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition cursor-pointer bg-slate-50/50">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  {csvFile ? csvFile.name : 'Click to select or drag CSV file here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">UTF-8 encoded CSV files up to 5MB</p>
              </label>
            </div>

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Detected {csvPreview.length} valid rows</span>
                  <span className="text-emerald-600 font-bold">Ready to import</span>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {csvPreview.slice(0, 5).map((row, i) => (
                    <div key={i} className="p-2.5 bg-white">
                      <p className="font-semibold text-slate-900 truncate">Q: {row.question}</p>
                      <p className="text-slate-500 truncate text-[11px]">A: {row.answer}</p>
                    </div>
                  ))}
                  {csvPreview.length > 5 && (
                    <div className="p-2 bg-slate-50 text-center text-[10px] text-slate-400 font-medium">
                      + {csvPreview.length - 5} more rows...
                    </div>
                  )}
                </div>
              </div>
            )}

            {importStatus && (
              <p className="text-xs font-semibold text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-center">
                {importStatus}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={csvPreview.length === 0}
                onClick={handleBulkImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-40"
              >
                Import {csvPreview.length} FAQs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Category Management */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Manage FAQ Categories</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Categories allow visitors and support administrators to filter questions by topic or domain.
            </p>

            {categoryModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryModalError}</span>
              </div>
            )}

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active Categories ({categories.length})
              </label>
              {categories.length > 0 ? (
                <div className="space-y-1.5">
                  {categories.map(cat => {
                    const count = faqs.filter(f => f.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#3B82F6' }}
                          />
                          <span className="text-xs font-semibold text-slate-800 truncate">{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({count} FAQs)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No categories created yet.</p>
              )}
            </div>

            {/* Create New Category Section */}
            <form onSubmit={handleCreateCategory} className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Create New Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Shipping & Delivery"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none transition text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isSubmittingCat || !newCatName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 shrink-0"
                >
                  {isSubmittingCat ? 'Adding...' : 'Add'}
                </button>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500 font-medium">Color:</span>
                {['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#6366F1'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    className={`w-5 h-5 rounded-full transition ${
                      newCatColor === color ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </form>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
