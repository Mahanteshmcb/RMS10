import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Manager() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ready: 0,
    served: 0,
    billed: 0,
    revenue: 0
  });
  const [now, setNow] = useState(Date.now());

  // Connect to manager namespace and fetch initial orders
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Fetch initial orders
    fetch('/api/pos/orders', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch orders');
        return r.json();
      })
      .then(data => {
        const orderList = Array.isArray(data) ? data : [];
        setOrders(orderList);
        updateStats(orderList);
      })
      .catch(err => console.error('Fetch error:', err));

    // Connect to socket for real-time updates
    const newSocket = io('http://localhost:3000', {
      auth: { token },
      reconnection: true
    });

    newSocket.on('connect', () => console.log('Manager connected'));
    newSocket.on('new_order', data => {
      console.log('New order:', data);
      setOrders(prev => [{
        id: data.orderId,
        ...data,
        startTime: Date.now(),
        status: 'pending'
      }, ...prev]);
    });

    newSocket.on('order_status_updated', data => {
      console.log('Order status updated:', data);
      setOrders(prev =>
        prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o)
      );
    });

    newSocket.on('table_update', data => {
      console.log('Table updated:', data);
    });

    newSocket.on('disconnect', () => console.log('Manager disconnected'));

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, []);

  // Update stats when orders change
  useEffect(() => {
    updateStats(orders);
  }, [orders]);

  const updateStats = (orderList) => {
    const pendingCount = orderList.filter(o => o.status === 'pending').length;
    const readyCount = orderList.filter(o => o.status === 'ready').length;
    const servedCount = orderList.filter(o => o.status === 'served').length;
    const billedCount = orderList.filter(o => o.status === 'billed').length;
    const revenue = orderList
      .filter(o => o.status === 'billed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    setStats({
      total: orderList.length,
      pending: pendingCount,
      ready: readyCount,
      served: servedCount,
      billed: billedCount,
      revenue
    });
  };

  const getElapsedTime = (timestamp) => {
    const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const elapsed = Math.floor((now - ts) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return 'bg-red-100 border-red-300 text-red-900';
    if (status === 'ready') return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    if (status === 'served') return 'bg-blue-100 border-blue-300 text-blue-900';
    if (status === 'billed') return 'bg-green-100 border-green-300 text-green-900';
    return 'bg-gray-100 border-gray-300 text-gray-900';
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">📊 Manager Dashboard</h1>
        <p className="text-gray-600 mb-6">Real-time overview of restaurant operations</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
            <p className="text-sm text-gray-600 font-semibold">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
            <p className="text-sm text-gray-600 font-semibold">Pending</p>
            <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-600">
            <p className="text-sm text-gray-600 font-semibold">Ready</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.ready}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-semibold">Served</p>
            <p className="text-3xl font-bold text-blue-500">{stats.served}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
            <p className="text-sm text-gray-600 font-semibold">Billed</p>
            <p className="text-3xl font-bold text-green-600">{stats.billed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
            <p className="text-sm text-gray-600 font-semibold">Revenue</p>
            <p className="text-3xl font-bold text-purple-600">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'ready', 'served', 'billed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({
                status === 'all' ? stats.total :
                status === 'pending' ? stats.pending :
                status === 'ready' ? stats.ready :
                status === 'served' ? stats.served :
                stats.billed
              })
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? '📭 No orders yet' : `✨ No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Table</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-bold text-blue-600">#{order.id}</td>
                      <td className="px-4 py-3">
                        {order.tableName || order.table_id ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            🪑 {order.tableName || `Table ${order.table_id}`}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {order.customerName || order.customer_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
                          {Array.isArray(order.items) ? order.items.length : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        ${(order.totalAmount || order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {getElapsedTime(order.startTime || order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
