import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      fetch('/api/public/restaurants')
        .then(r => r.json())
        .then(data => setRestaurants(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
        <p className="text-gray-600 mb-6">Use the sidebar to navigate to your management tools and features.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-2">🚀 Quick Actions</h3>
            <p className="text-blue-700 text-sm mb-4">Access all your management features from the sidebar navigation</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-2">📊 Analytics</h3>
            <p className="text-green-700 text-sm mb-4">View reports and analytics in the Reports section</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🍽️ Restaurant Management System</h1>
          <p className="text-xl text-gray-700 mb-8">
            Comprehensive solution for restaurant owners to manage operations, staff, orders, and customers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/get-service"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              🚀 Request Service
            </Link>
            <Link
              to="/public/restaurants"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              🔍 Browse Restaurants
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2">Easy Onboarding</h3>
            <p className="text-gray-600">Quick and simple registration process for restaurant owners</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2">Staff Management</h3>
            <p className="text-gray-600">Manage employees, schedules, and payroll all in one place</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">Get insights into your business with detailed analytics</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="text-xl font-bold mb-2">Order Management</h3>
            <p className="text-gray-600">Handle dine-in, takeaway, and delivery orders seamlessly</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">👨‍🍳</div>
            <h3 className="text-xl font-bold mb-2">Kitchen Display System</h3>
            <p className="text-gray-600">Streamline kitchen operations with real-time order tracking</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-xl font-bold mb-2">Payment Processing</h3>
            <p className="text-gray-600">Support multiple payment methods for customer convenience</p>
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">🌟 Featured Restaurants</h2>
            
            {loading && <p className="text-center text-gray-600">Loading restaurants...</p>}
            {error && <p className="text-center text-red-600">Error: {error}</p>}
            
            {!loading && restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map(r => (
                  <a
                    key={r.id}
                    href={`/r/${r.slug}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition"
                  >
                    <h3 className="font-bold text-lg text-blue-600 hover:text-blue-800">{r.name}</h3>
                    <p className="text-sm text-gray-500">ID: {r.id}</p>
                    <p className="text-xs text-gray-400 mt-2">📍 Click to view menu</p>
                  </a>
                ))}
              </div>
            ) : (
              !loading && <p className="text-center text-gray-500">No restaurants available yet. Be the first!</p>
            )}
            
            <div className="mt-8 text-center">
              <Link
                to="/get-service"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
              >
                Your restaurant could be here! Request service now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
