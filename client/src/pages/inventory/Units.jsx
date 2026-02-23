import { useEffect, useState } from 'react';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState('');
  const [abbr, setAbbr] = useState('');

  useEffect(() => {
    fetch('/api/inventory/units').then(r => r.json()).then(setUnits);
  }, []);

  function add() {
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
      <ul>
        {units.map(u => (
          <li key={u.id} className="flex items-center space-x-2">
            <span>
              {u.name} ({u.abbreviation})
            </span>
            <button
              onClick={() => remove(u.id)}
              className="text-red-500 text-sm"
            >
              delete
            </button>
            <button
              onClick={() => {
                const n = prompt('name', u.name);
                const a = prompt('abbr', u.abbreviation || '');
                if (n !== null) update(u.id, n, a);
              }}
              className="text-blue-500 text-sm"
            >
              edit
            </button>
          </li>
        ))}
      </ul>
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
