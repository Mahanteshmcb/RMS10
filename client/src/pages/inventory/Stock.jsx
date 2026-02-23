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

  return (
    <div>
      <h2>Inventory Stock</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Material</th>
            <th>Qty</th>
            <th>Threshold</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id} className="border-t">
              <td>{s.raw_material_id}</td>
              <td>{s.quantity}</td>
              <td>{s.threshold}</td>
              <td>
                <input
                  type="number"
                  value={s.threshold}
                  onChange={e => updateThreshold(s.id, parseFloat(e.target.value))}
                  className="border p-1 w-16"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
