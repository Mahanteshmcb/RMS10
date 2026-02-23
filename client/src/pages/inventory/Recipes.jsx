import { useEffect, useState } from 'react';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [menuItemId, setMenuItemId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [amount, setAmount] = useState('');
  const [unitId, setUnitId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editMenu, setEditMenu] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editUnit, setEditUnit] = useState('');

  useEffect(() => {
    fetch('/api/inventory/recipes').then(r => r.json()).then(setRecipes);
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
    fetch('/api/inventory/units').then(r => r.json()).then(setUnits);
  }, []);

  function add() {
    if (!menuItemId || !materialId || !amount) return alert('All fields required');
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
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2">Menu Item</th>
            <th className="border px-2">Material</th>
            <th className="border px-2">Amount</th>
            <th className="border px-2">Unit</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(rp => (
            <tr key={rp.id} className="border-t">
              <td className="px-2 py-1">
                {editing === rp.id ? (
                  <input
                    value={editMenu}
                    onChange={e => setEditMenu(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  rp.menu_item_id
                )}
              </td>
              <td className="px-2 py-1">
                {editing === rp.id ? (
                  <select
                    value={editMaterial}
                    onChange={e => setEditMaterial(e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">--material--</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                ) : (
                  materials.find(m => m.id === rp.raw_material_id)?.name || ''
                )}
              </td>
              <td className="px-2 py-1">
                {editing === rp.id ? (
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  rp.amount
                )}
              </td>
              <td className="px-2 py-1">
                {editing === rp.id ? (
                  <select
                    value={editUnit}
                    onChange={e => setEditUnit(e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">--unit--</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                ) : (
                  units.find(u => u.id === rp.unit_id)?.name || ''
                )}
              </td>
              <td className="px-2 py-1 space-x-1">
                {editing === rp.id ? (
                  <>
                    <button
                      onClick={() => {
                        update(rp.id,
                          editMenu, editMaterial, editAmount, editUnit);
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
                        setEditing(rp.id);
                        setEditMenu(rp.menu_item_id);
                        setEditMaterial(rp.raw_material_id);
                        setEditAmount(rp.amount);
                        setEditUnit(rp.unit_id || '');
                      }}
                      className="text-blue-500 text-sm"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => remove(rp.id)}
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
