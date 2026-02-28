import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Tables from './pages/Tables';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/inventory/Inventory';
import Menu from './pages/Menu';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Addons from './pages/Addons';
import Login from './pages/Login';
import KDS from './pages/KDS';
import Waiter from './pages/Waiter';
import Manager from './pages/Manager';
import StaffManagement from './pages/StaffManagement';
import SalaryManagement from './pages/SalaryManagement';
import OrderManagement from './pages/OrderManagement';
import GetService from './pages/GetService';

// Dashboard pages
import OwnerDashboard from './pages/dashboards/OwnerDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import WaiterDashboard from './pages/dashboards/WaiterDashboard';
import ChefDashboard from './pages/dashboards/ChefDashboard';

// public-facing pages
import PublicRestaurants from './pages/PublicRestaurants';
import PublicMenu from './pages/PublicMenu';
import RestaurantMenuPublic from './pages/RestaurantMenuPublic';

function DashboardRouter() {
  return (
    <Routes>
      <Route path="owner" element={<OwnerDashboard />} />
      <Route path="manager" element={<ManagerDashboard />} />
      <Route path="waiter" element={<WaiterDashboard />} />
      <Route path="chef" element={<ChefDashboard />} />
      <Route path="" element={<OwnerDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/get-service" element={<GetService />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard/*" element={<DashboardRouter />} />
          <Route path="tables" element={<Tables />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="inventory/*" element={<Inventory />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="addons" element={<Addons />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="salary" element={<SalaryManagement />} />
          {/* legacy routes left outside layout if needed */}
          <Route path="kds" element={<KDS />} />
          <Route path="waiter" element={<Waiter />} />
          <Route path="manager" element={<Manager />} />
        </Route>
        {/* public pages */}
        <Route path="/public/restaurants" element={<PublicRestaurants />} />
        <Route path="/r/:slug" element={<RestaurantMenuPublic />} />
      </Routes>
    </AuthProvider>
  );
}
