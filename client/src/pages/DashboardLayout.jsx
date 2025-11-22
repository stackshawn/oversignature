// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthProvider';

const DashboardLayout = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-aeon-dark text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-aeon-cyan tracking-wider">AEON</h1>
          <p className="text-xs text-gray-500 mt-1">OverSignature System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800 hover:text-aeon-cyan transition-colors">
            Dashboard
          </Link>
          {/* Placeholder for other links based on requirements */}
          <div className="text-xs font-semibold text-gray-600 uppercase mt-6 mb-2 px-4">Management</div>
          <Link to="/staff" className="block px-4 py-2 rounded hover:bg-gray-800 hover:text-aeon-cyan transition-colors">
            Staff
          </Link>
          <Link to="/agreements" className="block px-4 py-2 rounded hover:bg-gray-800 hover:text-aeon-cyan transition-colors">
            Agreements
          </Link>
          
          <div className="text-xs font-semibold text-gray-600 uppercase mt-6 mb-2 px-4">Network</div>
          <Link to="/servers" className="block px-4 py-2 rounded hover:bg-gray-800 hover:text-aeon-cyan transition-colors">
            Servers
          </Link>
          <Link to="/rcon" className="block px-4 py-2 rounded hover:bg-gray-800 hover:text-aeon-cyan transition-colors">
            RCON
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-2 px-4">
            <p className="text-sm font-bold text-white">{auth.user?.username}</p>
            <p className="text-xs text-aeon-purple">{auth.user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-200">Workspace Overview</h2>
          {/* Placeholder for Workspace Selector */}
          <div className="text-sm text-gray-500">
            v1.0.0
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-aeon-dark">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-black/30 border-t border-gray-800 py-2 px-6 text-center">
          <p className="text-xs text-gray-600 font-mono">
            Powered by OverSignature. © 2024 Zafrid. Under the Aeon Brand.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
