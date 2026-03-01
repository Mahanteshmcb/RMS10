import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function Waiter() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [now, setNow] = useState(Date.now());
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // helper to include auth and tenant headers
  const getHeaders = (json = true) => {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    const t = localStorage.getItem('token');
    if (t) h.Authorization = 'Bearer ' + t;
    const rid = localStorage.getItem('restaurantId');
    if (rid) h['x-restaurant-id'] = rid;
    return h;
  };

  // Connect to waiter namespace and initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    // ensure restaurantId is included in socket query
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

    const newSocket = io('http://localhost:3000/waiter', {
      auth: { token },
      query: { restaurantId: String(restaurantId) },
      reconnection: true
    });

    newSocket.on('connect', () => console.log('Connected to Waiter'));
    // when a new order is created (table occupied)
    newSocket.on('new_order', data => {
      console.log('New order notification for waiter:', data);
      setOrders(prev => [{
        ...data,
        startTime: Date.now(),
        status: 'pending'
      }, ...prev]);
    });
    // when order becomes ready in kitchen
    newSocket.on('order_ready', data => {
      console.log('Order ready for service:', data);
      setOrders(prev => [{
        ...data,
        startTime: Date.now(),
        status: 'ready_for_service'
      }, ...prev]);
    });

    newSocket.on('disconnect', () => console.log('Disconnected from Waiter'));

    setSocket(newSocket);

    // timer to update ages
    const timer = setInterval(() => setNow(Date.now()), 1000);

    // fetch any in-progress orders when component mounts
    fetchOrders();

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, []);

  // Fetch order list filtered by current states
  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch('/api/pos/orders?status=ready_for_service', {
      headers: getHeaders()
    })
      .then(r => r.json())
      .then(async rows => {
        const formatted = [];
        for (const o of rows) {
          let items = [];
          try {
            const r2 = await fetch(`/api/pos/orders/${o.id}`, {
              headers: getHeaders()
            });
            if (r2.ok) {
              const detail = await r2.json();
              items = detail.items || [];
            }
          } catch {}
          formatted.push({
            orderId: o.id,
            tableName: o.table_id ? `Table ${o.table_id}` : null,
            customerName: o.customer_name,
            items,
            totalAmount: o.total_amount,
            orderType: o.order_type
          });
        }
        setOrders(formatted);
      })
      .catch(err => console.error('Failed to fetch waiter orders', err));
  };

  // Mark order as served
  const markServed = (orderId) => {
    fetch(`/api/pos/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'served', notes: 'Served by waiter' })
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to update');
        return r.json();
      })
      .then(() => {
        setOrders(prev =>
          prev.map(o => o.orderId === orderId ? { ...o, status: 'served' } : o)
        );
      })
      .catch(err => alert('Error: ' + err.message));
  };

  // Format elapsed time
  const getElapsedTime = (startTime) => {
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredOrders = orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">👨‍💼 Waiter Dashboard</h1>
          <p className="text-gray-300 mb-6">Manage table orders and service delivery</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          + New Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['pending','ready_for_service', 'served', 'billed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded font-semibold text-lg transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
            }`}
          >
            {status === 'pending' ? '⌛ Pending' : status === 'ready_for_service' ? '🍽️ Ready' : status === 'served' ? '✅ Served' : '💳 Billed'}
            {' '}({orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-purple-800 bg-opacity-50 rounded-lg">
          <p className="text-2xl text-purple-200">
            {filter === 'ready_for_service' ? '📭 No orders ready' : filter === 'served' ? '✨ All tables served!' : '🎊 All settled!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div
              key={order.orderId}
              className={`rounded-lg p-4 border-2 transition ${
                order.status === 'ready_for_service'
                  ? 'bg-yellow-900 border-yellow-600'
                  : order.status === 'served'
                  ? 'bg-green-900 border-green-600'
                  : 'bg-purple-800 border-purple-600'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold">Order #{order.orderId}</h2>
                  {order.tableName && (
                    <p className="text-lg text-gray-200">
                      🪑 {order.tableName}
                    </p>
                  )}
                  {order.customerName && (
                    <p className="text-sm text-gray-400">👤 {order.customerName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    order.status === 'ready_for_service'
                      ? 'text-yellow-200'
                      : order.status === 'served'
                      ? 'text-green-200'
                      : 'text-purple-200'
                  }`}>
                    {getElapsedTime(order.startTime)}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    order.status === 'ready_for_service'
                      ? 'bg-yellow-600 text-white'
                      : order.status === 'served'
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {order.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-black bg-opacity-30 rounded p-3 mb-4">
                <p className="text-sm text-gray-300 mb-2">Items:</p>
                <div className="space-y-1">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="text-white text-lg">
                        • {item.quantity}x {item.name || `Item ${item.item_id}`}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No items detail</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="text-sm text-gray-300 mb-4 space-y-1">
                <p>💰 Total: ${order.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>

              {/* Action Button */}
              {order.status === 'ready_for_service' && (
                <button
                  onClick={() => markServed(order.orderId)}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg transition"
                >
                  ✅ Order Served
                </button>
              )}
              {order.status === 'served' && (
                <button
                  onClick={() => {
                    fetch(`/api/pos/orders/${order.orderId}/status`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                      },
                      body: JSON.stringify({ status: 'billed' })
                    })
                      .then(r => {
                        if (!r.ok) throw new Error('Failed to update');
                        setOrders(prev =>
                          prev.map(o => o.orderId === order.orderId ? { ...o, status: 'billed' } : o)
                        );
                      })
                      .catch(err => alert('Error: ' + err.message));
                  }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition"
                >
                  💳 Settled
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

