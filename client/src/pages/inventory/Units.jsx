import { useEffect, useState } from 'react';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState('');
  const [abbr, setAbbr] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAbbr, setEditAbbr] = useState('');

  useEffect(() => {
    fetch('/api/inventory/units').then(r => r.json()).then(setUnits);
  }, []);

  function add() {
    if (!name.trim()) return alert('Name required');
    fetch('/api/inventory/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, abbreviation: abbr }),
    })
      .then(r => r.json())
      .then(u => setUnits(prev => [...prev, u]));
    setName('');
    setAbbr('');
  }

  function remove(id) {
    fetch(`/api/inventory/units/${id}`, { method: 'DELETE' }).then(() =>
      setUnits(prev => prev.filter(u => u.id !== id))
    );
  }

  function update(id, newName, newAbbr) {
    fetch(`/api/inventory/units/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, abbreviation: newAbbr }),
    })
      .then(r => r.json())
      .then(updated =>
        setUnits(prev => prev.map(u => (u.id === id ? updated : u)))
      );
  }

  return (
    <div>
      <h2>Units</h2>
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Abbrev</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map(u => (
            <tr key={u.id} className="border-t">
              <td className="px-2 py-1">
                {editing === u.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  u.name
                )}
              </td>
              <td className="px-2 py-1">
                {editing === u.id ? (
                  <input
                    value={editAbbr}
                    onChange={e => setEditAbbr(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  u.abbreviation
                )}
              </td>
              <td className="px-2 py-1 space-x-1">
                {editing === u.id ? (
                  <>
                    <button
                      onClick={() => {
                        update(u.id, editName, editAbbr);
                        setEditing(null);
                      }}
                      className="text-green-600 text-sm"
                    >
                      save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-gray-600 text-sm"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(u.id);
                        setEditName(u.name);
                        setEditAbbr(u.abbreviation || '');
                      }}
                      className="text-blue-500 text-sm"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => remove(u.id)}
                      className="text-red-500 text-sm"
                    >
                      delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-x-2">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-1"
        />
        <input
          placeholder="Abbreviation"
          value={abbr}
          onChange={e => setAbbr(e.target.value)}
          className="border p-1"
        />
        <button onClick={add} className="px-2 py-1 bg-green-500 text-white">
          Add
        </button>
      </div>
    </div>
  );
}
