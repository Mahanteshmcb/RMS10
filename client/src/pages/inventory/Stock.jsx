import { useEffect, useState } from 'react';

export default function Stock() {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    fetch('/api/inventory/stock').then(r => r.json()).then(setStock);
  }, []);

  const updateThreshold = (id, threshold) => {
    fetch('/api/inventory/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, threshold }),
    }).then(() => {
      setStock(prev => prev.map(s => (s.id === id ? { ...s, threshold } : s)));
    });
  };

  const updateQuantity = (id, qty) => {
    fetch('/api/inventory/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: qty }),
    }).then(() => {
      setStock(prev => prev.map(s => (s.id === id ? { ...s, quantity: qty } : s)));
    });
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
                <input
                  type="number"
                  value={s.quantity}
                  onChange={e => updateQuantity(s.id, parseFloat(e.target.value))}
                  className="border p-1 w-20"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={s.threshold}
                  onChange={e => updateThreshold(s.id, parseFloat(e.target.value))}
                  className="border p-1 w-20"
                />
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
