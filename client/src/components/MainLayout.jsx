import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, useRole } from '../hooks/useAuth';

export default function MainLayout() {
  const { user, token, logout } = useAuth();
  const role = useRole();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavigation = () => {
    const baseNav = [{ to: '/dashboard', label: '📊 Dashboard', roles: ['owner', 'manager', 'waiter', 'chef'] }];

    const roleNav = {
        owner: [
        { to: '/tables', label: '🪑 Tables', roles: ['owner', 'manager', 'waiter'] },
        { to: '/menu', label: '🍽️ Menu', roles: ['owner', 'manager'] },
        { to: '/orders', label: '📦 Orders', roles: ['owner', 'manager'] },
        { to: '/kitchen', label: '👨‍🍳 Kitchen (KDS)', roles: ['owner', 'chef'] },
        { to: '/inventory', label: '📦 Inventory', roles: ['owner', 'manager'] },
        { to: '/reports', label: '📊 Reports', roles: ['owner', 'manager'] },
        { to: '/staff', label: '👥 Staff Management', roles: ['owner', 'manager'] },
        { to: '/salary', label: '💰 Salary & Payroll', roles: ['owner', 'manager'] },
        { to: '/settings', label: '⚙️ Settings', roles: ['owner', 'manager'] },
      ],
      manager: [
        { to: '/tables', label: '🪑 Tables', roles: ['manager', 'waiter'] },
        { to: '/orders', label: '📦 Orders', roles: ['manager'] },
        { to: '/kitchen', label: '👨‍🍳 Kitchen', roles: ['manager', 'chef'] },
        { to: '/inventory', label: '📦 Inventory', roles: ['manager'] },
        { to: '/reports', label: '📊 Reports', roles: ['manager'] },
        { to: '/staff', label: '👥 Staff Management', roles: ['manager'] },
        { to: '/salary', label: '💰 Salary & Payroll', roles: ['manager'] },
        { to: '/settings', label: '⚙️ Settings', roles: ['manager'] },
      ],
      waiter: [
        { to: '/tables', label: '🪑 Tables', roles: ['waiter'] },
        { to: '/kitchen', label: '👨‍🍳 Kitchen Tracker', roles: ['waiter'] },
      ],
      chef: [
        { to: '/kitchen', label: '👨‍🍳 Kitchen Orders', roles: ['chef'] },
        { to: '/inventory', label: '📦 Ingredients', roles: ['chef'] },
      ],
    };

    const items = [...baseNav];
    if (roleNav[role]) {
      items.push(...roleNav[role].filter(item => item.roles.includes(role)));
    }

    return items;
  };

  const navigation = getNavigation();

  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-lg transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="font-bold text-xl text-blue-600">
              🍽️ RMS
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">
              {role === 'owner' ? '👑 Owner' : role === 'manager' ? '🎯 Manager' : role === 'waiter' ? '🏃 Waiter' : '👨‍🍳 Chef'}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end>
              <span className={sidebarOpen ? 'ml-0' : 'justify-center w-full'}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Management System</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.username}!</p>
          </div>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            🔔
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
