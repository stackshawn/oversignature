// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Setup from './pages/Setup';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        
        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            {/* Add more protected routes here */}
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
