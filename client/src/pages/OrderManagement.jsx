import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function OrderManagement() {
  const { token, restaurantInfo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchPaymentMethods();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/pos/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      setOrders(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/pos/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tables');
      setTables(await response.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/pos/restaurant/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const methods = await response.json();
      setPaymentMethods(methods.map(m => m.method));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async () => {
    if (!customerInfo.customer_name || !customerInfo.customer_phone) {
      alert('Please enter customer name and phone');
      return;
    }
    if (orderType === 'delivery' && !customerInfo.delivery_address) {
      alert('Please enter delivery address');
      return;
    }

    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          table_id: orderType === 'dine-in' ? selectedTable : null,
          customer_name: customerInfo.customer_name,
          customer_phone: customerInfo.customer_phone,
          customer_email: customerInfo.customer_email,
          order_type: orderType,
          delivery_address: customerInfo.delivery_address,
          payment_method: paymentMethod,
          status: 'pending',
          total_amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      setShowNewOrder(false);
      setCart([]);
      setCustomerInfo({ customer_name: '', customer_phone: '', customer_email: '', delivery_address: '' });
      fetchOrders();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  const orderStats = {
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    total: orders.length
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📦 Order Management</h1>
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
        >
          {showNewOrder ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="text-sm text-blue-600 font-semibold">Total Orders</div>
          <div className="text-3xl font-bold text-blue-900">{orderStats.total}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <div className="text-sm text-yellow-600 font-semibold">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">{orderStats.pending}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-sm text-green-600 font-semibold">Completed</div>
          <div className="text-3xl font-bold text-green-900">{orderStats.completed}</div>
        </div>
      </div>

      {/* New Order Form */}
      {showNewOrder && (
        <div className="mb-8 p-6 bg-gray-50 border rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Create New Order</h2>
          
          {/* Order Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Order Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['dine-in', 'takeaway', 'delivery'].map(type => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    orderType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {type === 'dine-in' ? '🪑' : type === 'takeaway' ? '🛍️' : '🚗'} {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Dine-in: Table Selection */}
          {orderType === 'dine-in' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Table</label>
              <div className="grid grid-cols-4 gap-3">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`px-4 py-3 rounded font-semibold transition border-2 ${
                      selectedTable === table.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    Table {table.table_number}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Customer Name *</label>
              <input
                type="text"
                value={customerInfo.customer_name}
                onChange={(e) => setCustomerInfo({...customerInfo, customer_name: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone *</label>
              <input
                type="tel"
                value={customerInfo.customer_phone}
                onChange={(e) => setCustomerInfo({...customerInfo, customer_phone: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="10-digit number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={customerInfo.customer_email}
                onChange={(e) => setCustomerInfo({...customerInfo, customer_email: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="email@example.com"
              />
            </div>
            {orderType === 'delivery' && (
              <div>
                <label className="block text-sm font-semibold mb-1">Delivery Address *</label>
                <input
                  type="text"
                  value={customerInfo.delivery_address}
                  onChange={(e) => setCustomerInfo({...customerInfo, delivery_address: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Full address"
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {method.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
          >
            Create Order
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">#{order.id}</td>
                    <td className="px-6 py-3">
                      <div className="font-semibold">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-3 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-800">
                        {order.order_type || 'dine-in'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold">₹{order.total_amount?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className="text-sm">{order.payment_method || 'cash'}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
