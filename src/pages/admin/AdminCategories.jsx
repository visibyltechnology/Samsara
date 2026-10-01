import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Tag, Plus, Edit2, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', is_bundle: false });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    setCategories(data || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', is_bundle: false });
    setModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug || '', is_bundle: cat.is_bundle || false });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      is_bundle: form.is_bundle
    };

    let errorObj = null;
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      errorObj = error;
    } else {
      const { error } = await supabase.from('categories').insert([payload]);
      errorObj = error;
    }
    
    if (errorObj) {
      alert(`Error saving category: ${errorObj.message}`);
      console.error("Save error:", errorObj);
    } else {
      await fetchCategories();
      setModal(false);
    }
    setSaving(false);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Products inside it might lose their grouping.')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Categories</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-300">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-300">Slug</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-300">Eligible for Subscription</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-white flex items-center gap-3">
                      <div className="p-2 bg-slate-700 rounded-lg text-slate-300"><Tag className="h-4 w-4" /></div>
                      {cat.name}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">{cat.slug || '—'}</td>
                    <td className="px-5 py-4">
                      {cat.is_bundle ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-5">{editing ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Category Name *</label>
                <input required className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Daily food Essentials" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Slug (URL snippet)</label>
                <input className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Leave blank to auto-generate" />
              </div>
              
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 border border-slate-600 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors">
                  <input type="checkbox" checked={form.is_bundle} onChange={e => setForm(f => ({ ...f, is_bundle: e.target.checked }))} className="w-5 h-5 rounded border-slate-500 text-primary focus:ring-primary/50 bg-slate-900" />
                  <div>
                    <p className="text-sm font-bold text-white">Food Bundle / Subscription Eligible</p>
                    <p className="text-xs text-slate-400 mt-0.5">Allow users to build custom subscriptions from products in this category.</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModal(false)} className="flex-1 h-10 rounded-lg border border-slate-600 text-slate-300 font-medium text-sm hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
