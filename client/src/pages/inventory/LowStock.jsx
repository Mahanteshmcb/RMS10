import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function LowStock() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/inventory/stock/low')
      .then(r => r.json())
      .then(setItems);

    const socket = io('http://localhost:3000/inventory');
    socket.on('low_stock', data => {
      setItems(prev => {
        if (prev.find(i => i.raw_material_id === data.raw_material_id)) {
          return prev;
        }
        return [...prev, data];
      });
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Low Stock Alerts</h2>
      <button
        onClick={() => setItems([])}
        className="mb-2 px-2 py-1 bg-red-500 text-white text-sm"
      >
        Clear
      </button>
      <ul>
        {items.map(i => (
          <li key={i.id}>
            material {i.raw_material_id} qty {i.quantity} (threshold {i.threshold})
          </li>
        ))}
      </ul>
    </div>
  );
}
