import { useState, useEffect } from 'react';

export default function Settings() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [modules, setModules] = useState([]);
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
    // Load restaurant info and module configuration
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/pos/categories', { headers: getHeaders() }).then(r => r.json()),
    ])
      .then(([data]) => {
        setRestaurantInfo({ name: 'My Restaurant', email: 'admin@resto.com' });
        setModules([
          { name: 'POS', enabled: true },
          { name: 'Inventory', enabled: true },
          { name: 'KDS', enabled: true },
          { name: 'Reporting', enabled: true },
        ]);
      })
      .catch(err => {
        console.error('settings fetch', err);
        setError('Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleModule = (moduleName) => {
    setModules(prev =>
      prev.map(m =>
        m.name === moduleName ? { ...m, enabled: !m.enabled } : m
      )
    );
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
                  <button className="text-sm text-red-600">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
