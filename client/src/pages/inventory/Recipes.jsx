import { useEffect, useState } from 'react';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [menuItemId, setMenuItemId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [amount, setAmount] = useState('');
  const [unitId, setUnitId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch('/api/inventory/recipes').then(r => r.json()).then(setRecipes);
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
    fetch('/api/inventory/units').then(r => r.json()).then(setUnits);
  }, []);

  function add() {
    fetch('/api/inventory/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_item_id: menuItemId, raw_material_id: materialId, amount, unit_id: unitId }),
    })
      .then(r => r.json())
      .then(rp => setRecipes(prev => [...prev, rp]));
    setMenuItemId('');
    setMaterialId('');
    setAmount('');
    setUnitId('');
  }

  function remove(id) {
    fetch(`/api/inventory/recipes/${id}`, { method: 'DELETE' }).then(() =>
      setRecipes(prev => prev.filter(rp => rp.id !== id))
    );
  }

  function update(id) {
    const n = prompt('menu item id');
    const m = prompt('material id');
    const a = prompt('amount');
    const u = prompt('unit id');
    if (n !== null && m !== null && a !== null) {
      fetch(`/api/inventory/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_item_id: n, raw_material_id: m, amount: a, unit_id: u }),
      })
        .then(r => r.json())
        .then(updated =>
          setRecipes(prev => prev.map(rp => (rp.id === id ? updated : rp)))
        );
    }
  }

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.map(rp => (
          <li key={rp.id} className="flex items-center space-x-2">
            <span>
              menu {rp.menu_item_id} uses material {rp.raw_material_id} x{rp.amount}
            </span>
            <button
              onClick={() => remove(rp.id)}
              className="text-red-500 text-sm"
            >
              delete
            </button>
            <button
              onClick={() => update(rp.id)}
              className="text-blue-500 text-sm"
            >
              edit
            </button>
          </li>
        ))}
      </ul>
      <div className="space-x-2">
        <input
          placeholder="Menu Item ID"
          value={menuItemId}
          onChange={e => setMenuItemId(e.target.value)}
          className="border p-1"
        />
        <select
          value={materialId}
          onChange={e => setMaterialId(e.target.value)}
          className="border p-1"
        >
          <option value="">--material--</option>
          {materials.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-1 w-16"
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
