import { useEffect, useState } from 'react';
import { io as socketIo } from 'socket.io-client';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    fetch('/api/pos/kds/orders', { headers: getHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(data => setOrders(data || []))
      .catch(err => {
        console.error('kds fetch', err);
        setError('Failed to load orders');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // connect to kds namespace for real-time updates
    const socket = socketIo('/kds');
    socket.on('order_created', () => fetchOrders());
    socket.on('item_ready', () => fetchOrders());
    return () => socket.disconnect();
  }, []);

  const markReady = itemId => {
    fetch(`/api/pos/kds/items/${itemId}/ready`, {
      method: 'POST',
      headers: getHeaders(),
    })
      .then(() => fetchOrders())
      .catch(err => console.error('markReady failed', err));
  };

  // filter items by status
  const visible = [];
  orders.forEach(order => {
    if (order.line_items) {
      order.line_items.forEach(item => {
        if (filter === 'all' || item.status === filter) {
          visible.push({ ...item, tableId: order.table_id, orderId: order.id });
        }
      });
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kitchen Display System</h1>
      <p>View pending orders and mark items as ready for service.</p>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="mt-4">
        <label className="mr-2 font-semibold">Filter:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border p-1"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {visible.map(item => (
          <div key={item.id} className="border rounded p-4 bg-white shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-lg">{item.menu_item_name}</div>
                <div className="text-sm text-gray-600">Table {item.tableId}</div>
                <div className="text-sm text-gray-600">Order #{item.orderId}</div>
              </div>
              <div
                className={`px-2 py-1 rounded text-white text-sm font-semibold ${
                  item.status === 'pending'
                    ? 'bg-yellow-500'
                    : item.status === 'ready'
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`}
              >
                {item.status}
              </div>
            </div>
            <div className="text-sm mb-2">
              Qty: <strong>{item.quantity}</strong>
            </div>
            {item.special_instructions && (
              <div className="text-sm bg-yellow-100 p-2 rounded mb-2">
                <strong>Notes:</strong> {item.special_instructions}
              </div>
            )}
            {item.status === 'pending' && (
              <button
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => markReady(item.id)}
              >
                Mark Ready
              </button>
            )}
          </div>
        ))}
      </div>
      {visible.length === 0 && !loading && (
        <div className="mt-4 text-center text-gray-500">
          No items to display
        </div>
      )}
    </div>
  );
}
