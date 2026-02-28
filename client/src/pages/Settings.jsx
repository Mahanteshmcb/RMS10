import { useState, useEffect } from 'react';

export default function Settings() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [modules, setModules] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

  useEffect(() => {
    // Load restaurant info, modules, and table list
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/pos/restaurant', { headers: getHeaders() }).then(r => r.json()),
      fetch('/api/modules', { headers: getHeaders() }).then(r => (r.ok ? r.json() : [])),
      fetch('/api/pos/tables', { headers: getHeaders() }).then(r => r.json()),
    ])
      .then(([info, modulesData, tableData]) => {
        setRestaurantInfo(info);
        const mapped = (modulesData || []).map(m => ({ name: m.module.charAt(0).toUpperCase() + m.module.slice(1), enabled: m.enabled }));
        // ensure POS always present
        if (!mapped.find(m => m.name === 'Pos')) mapped.unshift({ name: 'Pos', enabled: true });
        setModules(mapped);
        setTables(tableData);
      })
      .catch(err => {
        console.error('settings fetch', err);
        setError('Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleModule = (moduleName) => {
    // update UI immediately
    setModules(prev => prev.map(m => (m.name === moduleName ? { ...m, enabled: !m.enabled } : m)));
    // persist change to server (moduleName is capitalized in UI, convert to lower)
    const modKey = moduleName.toLowerCase();
    const current = modules.find(m => m.name === moduleName);
    const newEnabled = !current?.enabled;
    fetch(`/api/modules/${modKey}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ enabled: newEnabled }),
    }).catch(err => console.error('module toggle error', err));
  };

  const saveRestaurant = () => {
    fetch('/api/pos/restaurant', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name: restaurantInfo.name, email: restaurantInfo.email }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Save failed');
        return r.json();
      })
      .then(data => {
        setRestaurantInfo(data);
        alert('Saved');
      })
      .catch(err => alert('Save failed: ' + err.message));
  };

  const removeTable = (id) => {
    if (!window.confirm('Delete table?')) return;
    fetch(`/api/pos/tables/${id}`, { method: 'DELETE', headers: getHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('Delete failed');
        setTables(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => alert('Delete failed: ' + err.message));
  };

  const addTable = (name, seats = 1) => {
    fetch('/api/pos/tables', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, seats }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Add failed');
        return r.json();
      })
      .then(row => setTables(prev => [...prev, row]))
      .catch(err => alert('Add failed: ' + err.message));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Manage restaurant configuration, users, and module settings.</p>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="mt-4 flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'modules'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('modules')}
        >
          Modules
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'qr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('qr')}
        >
          QR Codes
        </button>
      </div>
      {activeTab === 'general' && restaurantInfo && (
        <div className="border rounded p-4">
          <h2 className="font-bold mb-4">Restaurant Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input
                type="text"
                value={restaurantInfo.name}
                onChange={e =>
                  setRestaurantInfo({ ...restaurantInfo, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={restaurantInfo.email}
                onChange={e =>
                  setRestaurantInfo({ ...restaurantInfo, email: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <button onClick={saveRestaurant} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      )}
      {activeTab === 'modules' && (
        <div className="border rounded p-4">
          <h2 className="font-bold mb-4">Module Configuration</h2>
          <div className="space-y-2">
            {modules.map(m => (
              <div key={m.name} className="flex items-center justify-between border p-3 rounded">
                <div className="font-semibold">{m.name}</div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={m.enabled}
                    onChange={() => toggleModule(m.name)}
                    className="mr-2"
                  />
                  <span className="text-sm">{m.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="border rounded p-4">
          <h2 className="font-bold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">Manage team members and their access levels.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add New User
          </button>
          <table className="w-full mt-4 border">
            <thead>
              <tr>
                <th className="border px-2 text-left">Name</th>
                <th className="border px-2 text-left">Role</th>
                <th className="border px-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-2">Admin User</td>
                <td className="border px-2 py-2">Owner</td>
                <td className="border px-2 py-2">
                  <button className="text-sm text-blue-600 mr-2">Edit</button>
                  <button onClick={() => alert('User remove not implemented')} className="text-sm text-red-600">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'qr' && restaurantInfo && (
        <div className="border rounded p-4">
          <h2 className="font-bold mb-4">🔗 Table QR Codes & Management</h2>
          {tables.length === 0 ? (
            <p className="text-gray-600 mb-4">No tables. Go to Tables page or add one below.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {tables.map(t => (
                <div key={t.id} className="border p-4 rounded bg-white shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">{t.name}</p>
                      <p className="text-sm text-gray-600">{t.seats || 1} seats</p>
                    </div>
                    <button onClick={() => removeTable(t.id)} className="text-red-600 hover:text-red-800 font-bold text-lg">✕</button>
                  </div>
                  <div className="flex justify-center mb-3 bg-gray-100 p-3 rounded">
                    <img
                      src={`/api/public/qr/restaurant/${restaurantInfo.slug}/table/${t.id}`}
                      alt={`QR for ${t.name}`}
                      className="w-40 h-40"
                    />
                  </div>
                  <a href={`/r/${restaurantInfo.slug}?table=${t.id}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block text-center">
                    🍽️ View menu for this table
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">✚ Add New Table</h3>
            <div className="space-y-2">
              <input type="text" id="newTableName" placeholder="Table name (e.g., Table 1)" className="w-full px-3 py-2 border rounded" />
              <input type="number" id="newTableSeats" placeholder="Seats" defaultValue="4" min="1" max="20" className="w-full px-3 py-2 border rounded" />
              <button onClick={() => {
                const name = document.getElementById('newTableName').value;
                const seats = parseInt(document.getElementById('newTableSeats').value || '4', 10);
                if (!name.trim()) { alert('Enter table name'); return; }
                addTable(name, seats);
                document.getElementById('newTableName').value = '';
                document.getElementById('newTableSeats').value = '4';
              }} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold">+ Add Table</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
