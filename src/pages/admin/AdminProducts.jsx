import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '', is_active: true, slug: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({ name: product.name, description: product.description || '', price: product.price, stock: product.stock || 0, category_id: product.category_id || '', image_url: product.image_url || '', is_active: product.is_active !== false, slug: product.slug || '' });
    setModal(true);
  };

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '', is_active: true, slug: '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    await fetchProducts();
    setModal(false);
    setSaving(false);
  };

  const toggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Products ({products.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="py-16 text-center animate-pulse text-slate-400">Loading products...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Product</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Price</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Stock</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {product.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-400">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{product.categories?.name || '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-primary">{fmt(product.price)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-amber-500' : 'text-slate-700'}`}>{product.stock ?? '∞'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.is_active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Edit"><Edit2 className="h-3.5 w-3.5 text-primary" /></button>
                        <button onClick={() => toggleActive(product)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title={product.is_active !== false ? 'Hide' : 'Show'}>
                          {product.is_active !== false ? <EyeOff className="h-3.5 w-3.5 text-slate-500" /> : <Eye className="h-3.5 w-3.5 text-green-500" />}
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="text-sm font-medium block mb-1">Product Name *</label>
                <input required className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium block mb-1">Slug (URL)</label>
                <input className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="auto-generated-from-name" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
              <div><label className="text-sm font-medium block mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:outline-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Price (₦) *</label>
                  <input required type="number" min="0" className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div><label className="text-sm font-medium block mb-1">Stock</label>
                  <input type="number" min="0" className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
              </div>
              <div><label className="text-sm font-medium block mb-1">Category</label>
                <select className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div><label className="text-sm font-medium block mb-1">Image URL</label>
                <input className="w-full h-10 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="prod_active" className="w-4 h-4 rounded" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="prod_active" className="text-sm font-medium">Active (visible in store)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 h-10 rounded-lg border font-medium text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
