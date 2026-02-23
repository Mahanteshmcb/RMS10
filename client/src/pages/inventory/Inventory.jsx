import { NavLink, Routes, Route } from 'react-router-dom';
import Units from './Units';
import Materials from './Materials';
import Vendors from './Vendors';
import Stock from './Stock';
import Recipes from './Recipes';
import PurchaseOrders from './PurchaseOrders';

export default function Inventory() {
  return (
    <div>
      <h1>Inventory Management</h1>
      <nav className="space-x-4 mb-4">
        <NavLink to="units">Units</NavLink>
        <NavLink to="materials">Materials</NavLink>
        <NavLink to="vendors">Vendors</NavLink>
        <NavLink to="stock">Stock</NavLink>
        <NavLink to="recipes">Recipes</NavLink>
        <NavLink to="purchase-orders">POs</NavLink>
      </nav>
      <Routes>
        <Route path="units" element={<Units />} />
        <Route path="materials" element={<Materials />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="stock" element={<Stock />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
      </Routes>
    </div>
  );
}
