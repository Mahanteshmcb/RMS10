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
      setItems(prev => [...prev, data]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Low Stock Alerts</h2>
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
