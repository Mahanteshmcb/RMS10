import { useEffect, useState } from 'react';
import { useAuth, hasPermission } from '../../hooks/useAuth';

export default function Stock() {
  const { token, user } = useAuth();
  const role = user?.role || 'guest';
  const canManage = hasPermission(role, ['owner','manager']);
  const [stock, setStock] = useState([]);

  const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;
    fetch('/api/inventory/stock', { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))).then(setStock).catch(e => console.error('Error fetching stock:', e));
  }, [token]);

  const updateThreshold = (id, threshold) => {
    fetch('/api/inventory/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id, threshold }),
    }).then(() => {
      setStock(prev => prev.map(s => (s.id === id ? { ...s, threshold } : s)));
    }).catch(e => console.error('Error updating threshold:', e));
  };

  const updateQuantity = (id, qty) => {
    fetch('/api/inventory/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id, quantity: qty }),
    }).then(() => {
      setStock(prev => prev.map(s => (s.id === id ? { ...s, quantity: qty } : s)));
    }).catch(e => console.error('Error updating quantity:', e));
  };

  return (
    <div>
      <h2>Inventory Stock</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2">Material</th>
            <th className="border px-2">Qty</th>
            <th className="border px-2">Threshold</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id} className="border-t">
              <td className="px-2 py-1">{s.raw_material_id}</td>
              <td className="px-2 py-1">
                {canManage ? (
                  <input
                    type="number"
                    value={s.quantity}
                    onChange={e => updateQuantity(s.id, parseFloat(e.target.value))}
                    className="border p-1 w-20"
                  />
                ) : (
                  s.quantity
                )}
              </td>
              <td className="px-2 py-1">
                {canManage ? (
                  <input
                    type="number"
                    value={s.threshold}
                    onChange={e => updateThreshold(s.id, parseFloat(e.target.value))}
                    className="border p-1 w-20"
                  />
                ) : (
                  s.threshold
                )}
              </td>
              <td className="px-2 py-1">
                {/* nothing for now */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
