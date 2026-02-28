import { useEffect, useState } from 'react';
import { useAuth, hasPermission } from '../../hooks/useAuth';

export default function Materials() {
  const { token, user } = useAuth();
  const role = user?.role || 'guest';
  const canManage = hasPermission(role, ['owner','manager']);
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;
    fetch('/api/inventory/materials', { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))).then(setMaterials).catch(e => console.error('Error fetching materials:', e));
    fetch('/api/inventory/units', { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))).then(setUnits).catch(e => console.error('Error fetching units:', e));
  }, [token]);

  function add() {
    if (!name.trim()) return alert('Name required');
    fetch('/api/inventory/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name, unit_id: unitId }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
      .then(m => setMaterials(prev => [...prev, m]))
      .catch(e => console.error('Error adding material:', e));
    setName('');
    setUnitId('');
  }

  function remove(id) {
    fetch(`/api/inventory/materials/${id}`, { method: 'DELETE', headers: authHeaders() }).then(() =>
      setMaterials(prev => prev.filter(m => m.id !== id))
    ).catch(e => console.error('Error deleting material:', e));
  }

  function update(id, newName, newUnit) {
    fetch(`/api/inventory/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name: newName, unit_id: newUnit }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
      .then(updated =>
        setMaterials(prev => prev.map(m => (m.id === id ? updated : m)))
      )
      .catch(e => console.error('Error updating material:', e));
  }

  return (
    <div>
      <h2>Raw Materials</h2>
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Unit</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(m => (
            <tr key={m.id} className="border-t">
              <td className="px-2 py-1">
                {editing === m.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  m.name
                )}
              </td>
              <td className="px-2 py-1">
                {editing === m.id ? (
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
                  units.find(u => u.id === m.unit_id)?.name || 'none'
                )}
              </td>
              <td className="px-2 py-1 space-x-1">
                {editing === m.id ? (
                  <>
                    <button
                      onClick={() => {
                        update(m.id, editName, editUnit);
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
                  canManage && (
                    <>
                      <button
                        onClick={() => {
                          setEditing(m.id);
                          setEditName(m.name);
                          setEditUnit(m.unit_id || '');
                        }}
                        className="text-blue-500 text-sm"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="text-red-500 text-sm"
                      >
                        delete
                      </button>
                    </>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {canManage && (
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
      )}
    </div>
  );
}
