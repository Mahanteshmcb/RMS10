import { useState, useEffect } from 'react';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState(1);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchTables = () => {
    fetch('/api/pos/tables')
      .then(r => r.json())
      .then(data => setTables(data))
      .catch(err => console.error('tables fetch', err));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const submit = () => {
    const payload = { name: newName, seats: newSeats };
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/pos/tables/${editing.id}` : '/api/pos/tables';
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => {
        setNewName('');
        setEditing(null);
        fetchTables();
      });
  };

  const startEdit = t => {
    setEditing(t);
    setNewName(t.name);
    setNewSeats(t.seats || 1);
  };

  const del = id => {
    if (window.confirm('Delete table?')) {
      fetch(`/api/pos/tables/${id}`, { method: 'DELETE' })
        .then(() => fetchTables());
    }
  };

  const toggleStatus = t => {
    const next = t.status === 'vacant' ? 'occupied' : 'vacant';
    fetch(`/api/pos/tables/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: t.name, status: next }),
    }).then(() => fetchTables());
  };

  const filtered = tables.filter(t => (filter === 'all' ? true : t.status === filter));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tables</h1>
      <p>Add or manage tables and chair counts. Guests can reserve tables via
      the public menu or an in‑restaurant scanner will mark them occupied; waiters
      can also toggle status manually.</p>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Table name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border p-1 mr-2"
        />
        <input
          type="number"
          min="1"
          placeholder="Seats"
          value={newSeats}
          onChange={e => setNewSeats(e.target.value)}
          className="border p-1 mr-2 w-20"
        />
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={submit}
        >
          {editing ? 'Update' : 'Add'} Table
        </button>
      </div>
      <div className="mt-4">
        <label className="mr-2">Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-1">
          <option value="all">All</option>
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
          <option value="billed">Billed</option>
        </select>
      </div>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th className="border px-2">ID</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Seats</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id} className="border-t">
              <td className="px-2 py-1">{t.id}</td>
              <td className="px-2 py-1">{t.name}</td>
              <td className="px-2 py-1">{t.seats || 1}</td>
              <td className="px-2 py-1">{t.status}</td>
              <td className="px-2 py-1 space-x-1">
                <button
                  className="text-sm text-blue-600"
                  onClick={() => startEdit(t)}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-600"
                  onClick={() => del(t.id)}
                >
                  Delete
                </button>
                <button
                  className="text-sm text-green-600"
                  onClick={() => toggleStatus(t)}
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
