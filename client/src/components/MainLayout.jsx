import { Link, NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-300 font-semibold' : ''}`;

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 border-r">
        <div className="p-4 text-xl font-bold">RMS Dashboard</div>
        <nav className="flex flex-col space-y-1 p-2">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/tables" className={linkClass}>
            Tables
          </NavLink>
          <NavLink to="/kitchen" className={linkClass}>
            Kitchen
          </NavLink>
          <NavLink to="/inventory" className={linkClass}>
            Inventory
          </NavLink>
          <NavLink to="/menu" className={linkClass}>
            Menu
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            Reports
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
          <NavLink to="/addons" className={linkClass}>
            Addons
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
