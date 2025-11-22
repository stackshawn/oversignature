// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthProvider';

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  // Role hierarchy definitions (matching backend)
  const ROLES = {
    OWNER: 'Owner',
    EXECUTIVE: 'Executive',
    ADMIN: 'Admin',
    MODERATOR: 'Moderator',
    HELPER: 'Helper'
  };
  const ROLE_HIERARCHY = [ROLES.OWNER, ROLES.EXECUTIVE, ROLES.ADMIN, ROLES.MODERATOR, ROLES.HELPER];

  const hasRole = (userRole, requiredRole) => {
      // If no specific role is required, just need to be logged in (which is checked by auth.token existence below)
      if (!requiredRole) return true;
      
      const userIndex = ROLE_HIERARCHY.indexOf(userRole);
      const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
      
      if (userIndex === -1 || requiredIndex === -1) return false;
      return userIndex <= requiredIndex;
  };

  return (
    auth?.token
      ? (allowedRoles ? (hasRole(auth.user.role, allowedRoles[0]) ? <Outlet /> : <Navigate to="/unauthorized" state={{ from: location }} replace />) : <Outlet />)
      : <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
