import { useState, useEffect } from 'react';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState(null);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

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
              <div key={item.id} className="border p-2 rounded">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
                <div className="text-sm font-bold text-green-600">₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
