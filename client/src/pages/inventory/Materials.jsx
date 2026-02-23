import { useEffect, useState } from 'react';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
    fetch('/api/inventory/units').then(r => r.json()).then(setUnits);
  }, []);

  function add() {
    fetch('/api/inventory/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, unit_id: unitId }),
    })
      .then(r => r.json())
      .then(m => setMaterials(prev => [...prev, m]));
    setName('');
    setUnitId('');
  }

  return (
    <div>
      <h2>Raw Materials</h2>
      <ul>
        {materials.map(m => (
          <li key={m.id}>
            {m.name} (unit {m.unit_id || 'none'})
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
        <select
          value={unitId}
          onChange={e => setUnitId(e.target.value)}
          className="border p-1"
        >
          <option value="">--unit--</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button onClick={add} className="px-2 py-1 bg-green-500 text-white">
          Add
        </button>
      </div>
    </div>
  );
}
