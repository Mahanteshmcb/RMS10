import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Waiter() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [now, setNow] = useState(Date.now());
  const [socket, setSocket] = useState(null);

  // Connect to waiter namespace and initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:3000/waiter', {
      auth: { token },
      reconnection: true
    });

    newSocket.on('connect', () => console.log('Connected to Waiter'));
    newSocket.on('new_order', data => {
      console.log('New order for table:', data);
      setOrders(prev => [{
        ...data,
        startTime: Date.now(),
        status: 'ready_for_service'
      }, ...prev]);
    });

    newSocket.on('disconnect', () => console.log('Disconnected from Waiter'));

    setSocket(newSocket);

    // Timer to update order ages
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, []);

  // Mark order as served
  const markServed = (orderId) => {
    fetch(`/api/pos/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ status: 'served' })
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">👨‍💼 Waiter Dashboard</h1>
        <p className="text-gray-300 mb-6">Manage table orders and service delivery</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ready_for_service', 'served', 'billed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-semibold text-lg transition ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
              }`}
            >
              {status === 'ready_for_service' ? '🍽️ Ready' : status === 'served' ? '✅ Served' : '💳 Billed'}
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
    </div>
  );
}

