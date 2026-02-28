import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import AuthContext from '../../context/AuthContext';

export default function LowStock() {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;
    fetch('/api/inventory/stock/low', { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
      .then(setItems)
      .catch(e => console.error('Error fetching low stock:', e));

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
  }, [token]);

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
