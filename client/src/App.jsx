import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Tables from './pages/Tables';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/inventory/Inventory';
import Menu from './pages/Menu';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Addons from './pages/Addons';
import KDS from './pages/KDS';
import Waiter from './pages/Waiter';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="tables" element={<Tables />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="inventory/*" element={<Inventory />} />
          <Route path="menu" element={<Menu />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="addons" element={<Addons />} />
          {/* legacy routes left outside layout if needed */}
          <Route path="kds" element={<KDS />} />
          <Route path="waiter" element={<Waiter />} />
        </Route>
      </Routes>
    </Router>
  );
}
