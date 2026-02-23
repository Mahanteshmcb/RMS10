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

  return (
    <div>
      <h2>Units</h2>
      <ul>
        {units.map(u => (
          <li key={u.id}>
            {u.name} ({u.abbreviation})
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
