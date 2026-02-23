import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const socket = io('http://localhost:3000/kds');

  useEffect(() => {
    // fetch initial orders
    fetch('/api/pos/kds/orders', { headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(setOrders);

    socket.on('new_order', data => {
      setOrders(prev => [...prev, data]);
    });

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      socket.disconnect();
      clearInterval(timer);
    };

    return () => socket.disconnect();
  }, []);

  function markReady(itemId) {
    fetch(`/api/pos/kds/items/${itemId}/ready`, { method: 'POST' });
    setOrders(prev => prev.filter(o => o.item_id !== itemId));
  }

  return (
    <div>
      <h1>Kitchen Display</h1>
      <ul>
        {orders.map(o => {
          const age = now - new Date(o.item_created).getTime();
          const mins = Math.floor(age / 60000);
          const secs = Math.floor((age % 60000) / 1000);
          return (
            <li key={o.item_id} className="mb-2">
              Order {o.order_id} - Table {o.table_id} - {o.item_name} x{o.quantity} 
              (<span>{mins}:{secs.toString().padStart(2,'0')}</span>) {' '}
              <button onClick={() => markReady(o.item_id)}>Ready</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
