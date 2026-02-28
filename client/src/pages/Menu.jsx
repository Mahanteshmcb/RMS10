import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState(null);

  const { token, user } = useAuth();
  const getHeaders = (json = true) => {
    const headers = {};
    if (json) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

  const canManage = user && (user.role === 'owner' || user.role === 'manager');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/pos/categories', { headers: getHeaders() }).then(r => r.json()),
      fetch('/api/pos/menu-items', { headers: getHeaders() }).then(r => r.json())
    ])
      .then(([cats, items]) => {
        setCategories(cats || []);
        setItems(items || []);
      })
      .catch(err => {
        console.error('menu fetch', err);
        setError('Failed to load menu');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item =>
    (search === '' || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  // create / edit state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category_id: '', name: '', description: '', base_price: '', tax_rate: '', image_url: '' });

  function openCreate() {
    setEditing(null);
    setForm({ category_id: (categories[0] && categories[0].id) || '', name: '', description: '', base_price: '', tax_rate: '', image_url: '' });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({
      category_id: item.category_id || '',
      name: item.name || '',
      description: item.description || '',
      base_price: item.base_price != null ? item.base_price.toString() : '',
      tax_rate: item.tax_rate != null ? item.tax_rate.toString() : '',
      image_url: item.image_url || ''
    });
    setShowForm(true);
  }

  function submitForm() {
    // build payload with proper types
    const payload = {
      ...form,
      base_price: parseFloat(form.base_price) || 0,
      tax_rate: parseFloat(form.tax_rate) || 0,
      category_id: form.category_id || null
    };
    if (editing) {
      fetch(`/api/pos/menu-items/${editing}`, { method: 'PUT', headers: getHeaders(true), body: JSON.stringify(payload) })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
        .then(updated => {
          setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
          setShowForm(false);
        })
        .catch(e => alert('Update failed: ' + e.message));
    } else {
      fetch('/api/pos/menu-items', { method: 'POST', headers: getHeaders(true), body: JSON.stringify(payload) })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
        .then(created => {
          setItems(prev => [...prev, created]);
          setShowForm(false);
        })
        .catch(e => alert('Create failed: ' + e.message));
    }
  }

  function removeItem(id) {
    if (!confirm('Delete this item?')) return;
    fetch(`/api/pos/menu-items/${id}`, { method: 'DELETE', headers: getHeaders(false) })
      .then(r => { if (!r.ok) throw new Error(r.status); setItems(prev => prev.filter(i => i.id !== id)); })
      .catch(e => alert('Delete failed: ' + e.message));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <p>Browse categories and menu items available for ordering.</p>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 w-64 rounded"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Categories</h2>
          <div className="space-y-1">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`p-2 cursor-pointer rounded ${
                  openCategory === cat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Items</h2>
          <div className="space-y-2">
            {filtered.map(item => (
              <div key={item.id} className="border p-2 rounded flex">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover mr-3" />
                  ) : null}
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                    <div className="text-sm font-bold text-green-600">₹{item.base_price}</div>
                  </div>
                  {canManage && (
                    <div className="ml-2 space-x-1 flex flex-col items-end">
                      <button onClick={() => openEdit(item)} className="text-blue-500 text-sm">edit</button>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm">delete</button>
                    </div>
                  )}
                </div>
            ))}
          </div>
        </div>
      </div>
      {canManage && (
        <div className="mt-6">
          {!showForm ? (
            <button onClick={openCreate} className="px-3 py-1 bg-blue-600 text-white rounded">Add Menu Item</button>
          ) : (
            <div className="border p-4 rounded">
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="border p-1">
                  <option value="">-- category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="border p-1" />
                <input type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} placeholder="Price" className="border p-1" />
                <input type="number" step="0.01" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} placeholder="Tax %" className="border p-1" />
                <input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className="border p-1 col-span-2" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="border p-1 col-span-2" />
              </div>
              <div className="mt-2 space-x-2">
                <button onClick={submitForm} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                <button onClick={() => setShowForm(false)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
