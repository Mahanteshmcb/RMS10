import { useState, useEffect } from 'react';
import { io as socketIo } from 'socket.io-client';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState('4');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

  const fetchTables = () => {
    setLoading(true);
    setError(null);
    fetch('/api/pos/tables', { headers: getHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('fetch failed: ' + r.status);
        return r.json();
      })
      .then(data => {
        setTables(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(err => {
        console.error('tables fetch', err);
        setError('Unable to load tables: ' + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
    const socket = socketIo();
    socket.on('table_update', () => fetchTables());
    return () => socket.disconnect();
  }, []);

  const submit = () => {
    if (!newName.trim()) {
      alert('Please enter a table name');
      return;
    }
    const payload = { name: newName, seats: parseInt(newSeats) || 1 };
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/pos/tables/${editing.id}` : '/api/pos/tables';
    fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) })
      .then(r => {
        if (!r.ok) throw new Error('submit failed');
        return r.json();
      })
      .then(() => {
        setNewName('');
        setNewSeats('4');
        setEditing(null);
        setShowForm(false);
        fetchTables();
        alert('Table saved successfully');
      })
      .catch(err => {
        alert('Error: ' + err.message);
      });
  };

  const startEdit = t => {
    setEditing(t);
    setNewName(t.name);
    setNewSeats(t.seats || 4);
    setShowForm(true);
  };

  const cancel = () => {
    setEditing(null);
    setNewName('');
    setNewSeats('4');
    setShowForm(false);
  };

  const del = id => {
    if (window.confirm('Delete this table? This action cannot be undone.')) {
      fetch(`/api/pos/tables/${id}`, { method: 'DELETE', headers: getHeaders() })
        .then(r => {
          if (!r.ok) throw new Error('delete failed');
          fetchTables();
          alert('Table deleted');
        })
        .catch(err => alert('Delete failed: ' + err.message));
    }
  };

  const toggleStatus = t => {
    let next;
    if (t.status === 'vacant') next = 'occupied';
    else if (t.status === 'occupied') next = 'vacant';
    else next = 'vacant';
    fetch(`/api/pos/tables/${t.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name: t.name, status: next, seats: t.seats }),
    })
      .then(r => {
        if (!r.ok) throw new Error('status update failed');
        fetchTables();
      })
      .catch(err => alert('Failed to update: ' + err.message));
  };

  const toggleReserve = t => {
    const next = t.status === 'reserved' ? 'vacant' : 'reserved';
    fetch(`/api/pos/tables/${t.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name: t.name, status: next, seats: t.seats }),
    })
      .then(r => {
        if (!r.ok) throw new Error('reserve update failed');
        fetchTables();
      })
      .catch(err => alert('Failed to update: ' + err.message));
  };

  const filtered = tables.filter(t => (filter === 'all' ? true : t.status === filter));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">🪑 Tables Management</h1>
      <p className="text-gray-600 mb-6">Manage dining tables, their capacity, and status. Waiters can mark tables as occupied or reserved.</p>

      {loading && <div className="text-center py-8"><p className="text-gray-500">Loading tables...</p></div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editing ? '✏️ Edit Table' : '➕ Add New Table'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Table Name</label>
              <input
                type="text"
                placeholder="e.g. Table 1, Corner Booth, etc."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Seats</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newSeats}
                onChange={e => setNewSeats(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={submit}
              >
                {editing ? '✓ Update' : '✓ Add'} Table
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={cancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Table Button */}
      {!showForm && (
        <button
          className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          onClick={() => setShowForm(true)}
        >
          + New Table
        </button>
      )}

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <label className="font-semibold text-gray-700">Filter:</label>
        {['all', 'vacant', 'occupied', 'reserved', 'billed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} {filtered.filter(t => (status === 'all' ? true : t.status === status)).length}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No tables yet. Add your first table to get started!</p>
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            onClick={() => setShowForm(true)}
          >
            + Create First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div
              key={t.id}
              className={`border-2 rounded-lg p-4 transition ${
                t.status === 'vacant'
                  ? 'border-green-300 bg-green-50 hover:shadow-md'
                  : t.status === 'occupied'
                  ? 'border-orange-300 bg-orange-50 hover:shadow-md'
                  : t.status === 'reserved'
                  ? 'border-yellow-300 bg-yellow-50 hover:shadow-md'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                  <p className="text-sm text-gray-600">{t.seats || 1} {t.seats === 1 ? 'seat' : 'seats'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  t.status === 'vacant' ? 'bg-green-200 text-green-900' :
                  t.status === 'occupied' ? 'bg-orange-200 text-orange-900' :
                  t.status === 'reserved' ? 'bg-yellow-200 text-yellow-900' :
                  'bg-gray-200 text-gray-900'
                }`}>
                  {t.status?.toUpperCase() || 'VACANT'}
                </span>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <button
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
                  onClick={() => startEdit(t)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="w-full text-sm text-red-600 hover:text-red-800 font-medium py-1"
                  onClick={() => del(t.id)}
                >
                  🗑️ Delete
                </button>
                <button
                  className="w-full text-sm text-green-600 hover:text-green-800 font-medium py-1"
                  onClick={() => toggleStatus(t)}
                >
                  {t.status === 'vacant' ? '🔴 Mark Occupied' : t.status === 'occupied' ? '🟢 Mark Vacant' : '🔄 Clear'}
                </button>
                <button
                  className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-1"
                  onClick={() => toggleReserve(t)}
                >
                  {t.status === 'reserved' ? '❌ Cancel Reserve' : '🔖 Reserve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
