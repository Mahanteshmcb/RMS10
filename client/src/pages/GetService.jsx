import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GetService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    address: '',
    city: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/onboarding/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      const result = await response.json();
      setSuccess(result);
      setFormData({
        name: '',
        email: '',
        phone: '',
        owner_name: '',
        address: '',
        city: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏪 Get Your Restaurant Online</h1>
          <p className="text-xl text-gray-600">Join thousands of restaurants using RMS to manage their operations</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-500 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-900 mb-4">✓ Request Submitted Successfully!</h2>
            <div className="space-y-3 text-green-800">
              <p className="text-lg">
                <strong>Your Request ID:</strong> <code className="bg-green-100 px-3 py-1 rounded font-mono">{success.id}</code>
              </p>
              <p>
                We've received your onboarding request. Our team will review it and contact you within 24-48 hours.
              </p>
              <p className="text-sm">
                You can track your request status at: <code className="bg-green-100 px-3 py-1 rounded">/onboarding/status/{success.id}</code>
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Form Card */}
        {!success && (
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="font-semibold">Error: {error}</p>
                </div>
              )}

              {/* Restaurant Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Restaurant Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., The Golden Fork"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City/Location *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., New York"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Owner Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner/Manager Name *
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">✨ What You Get:</h4>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>✓ Complete Restaurant Management System</li>
                  <li>✓ Online Ordering & Menu Management</li>
                  <li>✓ Staff Management & Payroll</li>
                  <li>✓ Kitchen Display System (KDS)</li>
                  <li>✓ Customer Analytics & Reporting</li>
                  <li>✓ Multi-channel Ordering (Dine-in, Takeaway, Delivery)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                {loading ? '⏳ Submitting...' : '🚀 Request Service Now'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We'll get back to you within 24-48 hours with your admin credentials
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
