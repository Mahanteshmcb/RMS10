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

  // helper to build headers including auth and tenant
  const buildHeaders = () => {
    const h = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) h.Authorization = 'Bearer ' + token;
    // pull restaurantId from separate key or user object
    let rid = localStorage.getItem('restaurantId');
    if (!rid) {
      const store = localStorage.getItem('user');
      if (store) {
        try { rid = JSON.parse(store).restaurantId; } catch {}
      }
    }
    if (rid) h['x-restaurant-id'] = rid;
    return h;
  };

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    fetch('/api/pos/kds/orders', { headers: buildHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(data => {
        console.log('KDS Orders:', data);
        setOrders(data || []);
      })
      .catch(err => {
        console.error('kds fetch', err);
        setError('Failed to load orders');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // connect to kds namespace for real-time updates with restaurantId
    const token = localStorage.getItem('token');
    let restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          restaurantId = JSON.parse(storedUser).restaurantId;
        } catch {}
      }
    }
    restaurantId = restaurantId || 1;

    const socket = socketIo('http://localhost:3000/kds', {
      auth: { token },
      query: { restaurantId: String(restaurantId) }
    });
    socket.on('connect', () => console.log('Connected to KDS socket'));
    socket.on('new_order', () => {
      console.log('New order event received');
      fetchOrders();
    });
    socket.on('order_ready', () => {
      console.log('Order ready event received');
      fetchOrders();
    });
    return () => socket.disconnect();
  }, []);

  const markReady = itemId => {
    fetch(`/api/pos/kds/items/${itemId}/ready`, {
      method: 'POST',
      headers: buildHeaders(),
    })
      .then(() => fetchOrders())
      .catch(err => console.error('markReady failed', err));
  };

  // filter items by status - API returns flattened rows
  const visible = orders.filter(row => {
    if (filter === 'all') return true;
    return row.item_status === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">👨‍🍳 Kitchen Display System</h1>
      <p className="text-gray-600 mb-6">View pending orders and mark items as ready for service.</p>
      
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
      
      <div className="mb-6">
        <label className="mr-2 font-semibold">Filter:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Items</option>
          <option value="pending">⏳ Pending</option>
          <option value="ready">✅ Ready</option>
          <option value="completed">🎉 Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(item => (
          <div 
            key={item.item_id} 
            className={`border-2 rounded-lg p-4 shadow ${
              item.item_status === 'pending'
                ? 'border-yellow-400 bg-yellow-50'
                : item.item_status === 'ready'
                ? 'border-green-400 bg-green-50'
                : 'border-gray-400 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-lg">{item.item_name}</div>
                <div className="text-sm text-gray-600">
                  {item.table_name ? `🪑 Table: ${item.table_name}` : '📦 Takeout/Delivery'}
                </div>
                <div className="text-sm text-gray-600">Order #{item.order_id}</div>
              </div>
              <div
                className={`px-3 py-1 rounded text-white text-xs font-bold ${
                  item.item_status === 'pending'
                    ? 'bg-yellow-500'
                    : item.item_status === 'ready'
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`}
              >
                {item.item_status?.toUpperCase() || 'PENDING'}
              </div>
            </div>
            <div className="text-base font-semibold mb-3">
              Quantity: <span className="text-xl text-blue-600">{item.quantity}</span>
            </div>
            
            {item.item_status === 'pending' && (
              <button
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                onClick={() => markReady(item.item_id)}
              >
                ✅ Mark Ready
              </button>
            )}
            {item.item_status === 'ready' && (
              <div className="text-center text-green-700 font-semibold py-2">
                Ready for Service
              </div>
            )}
          </div>
        ))}
      </div>

      {visible.length === 0 && !loading && (
        <div className="mt-8 text-center text-gray-500 py-12">
          <div className="text-6xl mb-2">✨</div>
          <p className="text-xl">
            {filter === 'all' ? 'No items to display' : `No ${filter} items`}
          </p>
        </div>
      )}
    </div>
  );
}
