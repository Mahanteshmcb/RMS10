import { NavLink, Routes, Route } from 'react-router-dom';
import Units from './Units';
import Materials from './Materials';
import Vendors from './Vendors';
import Stock from './Stock';
import Recipes from './Recipes';
import PurchaseOrders from './PurchaseOrders';
import LowStock from './LowStock';

export default function Inventory() {
  const [error, setError] = useState(null);

  // quick check to surface permission errors or missing module
  useEffect(() => {
    fetch('/api/inventory/units')
      .then(r => {
        if (!r.ok) throw new Error(`Inventory API ${r.status}`);
      })
      .catch(e => setError(e.message));
  }, []);

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
