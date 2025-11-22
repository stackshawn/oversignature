// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

const Staff = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Helper to check if current user is Admin+
  const isAdmin = ['Owner', 'Executive', 'Admin'].includes(auth.user?.role);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/workspace/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePromote = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionLoading(true);
    try {
      await api.post(`/api/workspace/users/${userId}/role`, { role: newRole });
      setMessage({ type: 'success', text: 'Role updated successfully' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update role' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStrike = async (userId) => {
    const reason = prompt("Enter reason for strike:");
    if (!reason) return;
    
    setActionLoading(true);
    try {
      await api.post(`/api/workspace/users/${userId}/strike`, { reason });
      setMessage({ type: 'success', text: 'Strike issued successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to issue strike' });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
        case 'Owner': return 'text-red-500 font-bold';
        case 'Executive': return 'text-aeon-purple font-bold';
        case 'Admin': return 'text-yellow-500 font-semibold';
        case 'Moderator': return 'text-green-400';
        default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Staff Directory</h2>
      
      {message && (
        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
        </div>
      )}

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-gray-200 uppercase">
                <tr>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Minecraft IGN</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                        <td className={`px-6 py-4 ${getRoleColor(user.role)}`}>{user.role}</td>
                        <td className="px-6 py-4">{user.minecraft_ign || '-'}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                            {isAdmin && auth.user.id !== user.id && (
                                <>
                                    <button 
                                        onClick={() => handleStrike(user.id)}
                                        disabled={actionLoading}
                                        className="text-red-400 hover:text-red-300 text-xs border border-red-900 bg-red-900/20 px-2 py-1 rounded"
                                    >
                                        Strike
                                    </button>
                                    {/* Simple Promote Logic: Toggle Admin/Mod for demo */}
                                    {user.role !== 'Admin' && (
                                        <button 
                                            onClick={() => handlePromote(user.id, 'Admin')}
                                            disabled={actionLoading}
                                            className="text-yellow-400 hover:text-yellow-300 text-xs border border-yellow-900 bg-yellow-900/20 px-2 py-1 rounded"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                    {user.role === 'Admin' && (
                                        <button 
                                            onClick={() => handlePromote(user.id, 'Moderator')}
                                            disabled={actionLoading}
                                            className="text-gray-400 hover:text-gray-300 text-xs border border-gray-700 bg-gray-800 px-2 py-1 rounded"
                                        >
                                            Demote
                                        </button>
                                    )}
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Staff;
