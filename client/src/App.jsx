import { Routes, Route, Link } from 'react-router-dom';
import KDS from './pages/KDS';
import Waiter from './pages/Waiter';
import Inventory from './pages/inventory/Inventory';
import Reports from './pages/Reports';

export default function App() {
  return (
    <div className="p-4">
      <nav className="space-x-4">
        <Link to="/kds">KDS</Link>
        <Link to="/waiter">Waiter</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <Routes>
        <Route path="/kds" element={<KDS />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/inventory/*" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}
