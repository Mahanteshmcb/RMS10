import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Units from './Units';
import Materials from './Materials';
import Vendors from './Vendors';
import Stock from './Stock';
import Recipes from './Recipes';
import PurchaseOrders from './PurchaseOrders';
import LowStock from './LowStock';

export default function Inventory() {
  const { token, loading } = useAuth();
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const h = token ? { Authorization: 'Bearer ' + token } : {};
    const rid = localStorage.getItem('restaurantId');
    if (rid) h['x-restaurant-id'] = rid;
    return h;
  };

  // quick check to surface permission errors or missing module
  useEffect(() => {
    if (!token || loading) return;
    fetch('/api/inventory/units', { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`Inventory API ${r.status}`);
        return r.json();
      })
      .catch(e => setError(e.message));
  }, [token, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Inventory unavailable: {error}
      </div>
    );
  }

  return (
    <div>
      <h1>Inventory Management</h1>
      <nav className="space-x-4 mb-4">
        <NavLink
          to="units"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Units
        </NavLink>
        <NavLink
          to="materials"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Materials
        </NavLink>
        <NavLink
          to="vendors"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Vendors
        </NavLink>
        <NavLink
          to="stock"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Stock
        </NavLink>
        <NavLink
          to="recipes"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Recipes
        </NavLink>
        <NavLink
          to="purchase-orders"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          POs
        </NavLink>
        <NavLink
          to="low"
          className={({ isActive }) => (isActive ? 'font-bold underline' : '')}
        >
          Low Stock
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<Units />} />
        <Route path="units" element={<Units />} />
        <Route path="materials" element={<Materials />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="stock" element={<Stock />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="low" element={<LowStock />} />
      </Routes>
    </div>
  );
}
