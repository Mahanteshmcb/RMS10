import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function RestaurantMenuPublic() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('table'); // Extract table ID from URL
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [orderType, setOrderType] = useState('dine-in');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRestaurantMenu();
  }, [slug]);

  const fetchRestaurantMenu = async () => {
    try {
      const response = await fetch(`/api/public/restaurants/${slug}`);
      if (!response.ok) throw new Error('Restaurant not found');
      const data = await response.json();
      setRestaurant(data.restaurant);
      setCategories(data.categories || []);
      setMenuItems(data.items || []);
      setPaymentMethods(data.paymentMethods || ['cash']);
      // default to first category if none selected yet
      if (selectedCategory === null && data.categories.length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (err) {
      console.error(err);
      alert('Error loading restaurant: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.id === itemId ? {...c, quantity} : c));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }
    if (cart.length === 0) {
      alert('Please add items to your order');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_slug: slug,
          table_id: tableId ? parseInt(tableId) : null,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          order_type: orderType,
          delivery_address: deliveryAddress,
          payment_method: selectedPayment,
          items: cart.map(item => ({item_id: item.id, quantity: item.quantity})),
          total_amount: cartTotal
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const result = await response.json();
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
      setCart([]);
      setCustomerInfo({name: '', phone: '', email: ''});
      setShowCart(false);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;
  if (!restaurant) return <div className="p-8 text-center text-red-600">Restaurant not found</div>;

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-sm text-gray-600">📍 {slug}</p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            🛒 Cart ({cart.length})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-lg mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedCategory === null ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 rounded ${
                      selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Menu Items Grid */}
            {!showCart ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                        >
                          + Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Cart View */
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Your Order</h2>

                {/* Order Type Selection */}
                <div className="mb-6 pb-6 border-b">
                  <label className="block font-semibold mb-3">Order Type</label>
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
                        {type === 'dine-in' ? '🪑' : type === 'takeaway' ? '🛍️' : '🚗'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-4">Items</h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-300 rounded"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-300 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                            >
                              🗑️
                            </button>
                            <span className="w-16 text-right font-bold">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-4">Your Details</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Full Name *"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Phone Number *"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="Email (optional)"
                      className="w-full px-3 py-2 border rounded"
                    />
                    {orderType === 'delivery' && (
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Delivery Address *"
                        className="w-full px-3 py-2 border rounded"
                      />
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6 pb-6 border-b">
                  <label className="block font-semibold mb-3">Payment Method</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total & Buttons */}
                <div className="space-y-3">
                  <div className="text-xl font-bold text-right">
                    Total: ₹{cartTotal.toLocaleString()}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded font-semibold"
                    >
                      ← Continue Shopping
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded font-semibold"
                    >
                      {processing ? '⏳ Processing...' : '✓ Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
