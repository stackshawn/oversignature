// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'aeon-super-secret-key-change-in-prod';

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
  return next();
};

// Role hierarchy definitions
const ROLES = {
  OWNER: 'Owner',
  EXECUTIVE: 'Executive',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  HELPER: 'Helper'
};

const ROLE_HIERARCHY = [ROLES.OWNER, ROLES.EXECUTIVE, ROLES.ADMIN, ROLES.MODERATOR, ROLES.HELPER];

// Check if userRole is equal or higher than requiredRole
const hasRole = (userRole, requiredRole) => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // If role not found in hierarchy, deny
  if (userIndex === -1 || requiredIndex === -1) return false;
  
  // Lower index means higher rank
  return userIndex <= requiredIndex;
};

const verifyExecutive = (req, res, next) => {
  // Executive level includes Owner and Executive
  if (hasRole(req.user.role, ROLES.EXECUTIVE)) {
    return next();
  }
  return res.status(403).json({ message: 'Requires Executive Privileges' });
};

const verifyAdmin = (req, res, next) => {
  if (hasRole(req.user.role, ROLES.ADMIN)) {
    return next();
  }
  return res.status(403).json({ message: 'Requires Admin Privileges' });
};

const verifyStaff = (req, res, next) => {
  // Staff level includes everyone in the hierarchy (Helper and above)
  if (hasRole(req.user.role, ROLES.HELPER)) {
    return next();
  }
  return res.status(403).json({ message: 'Requires Staff Privileges' });
};

module.exports = {
  verifyToken,
  verifyExecutive,
  verifyAdmin,
  verifyStaff,
  SECRET_KEY
};
