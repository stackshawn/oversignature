// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ ip_address: '', port: 25565, rcon_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServers = async () => {
    try {
      const response = await api.get('/api/minecraft');
      setServers(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/minecraft', formData);
      setSuccess('Server added successfully');
      setFormData({ ip_address: '', port: 25565, rcon_password: '' });
      setShowAddForm(false);
      fetchServers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add server');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Network Servers</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-aeon-cyan text-black font-bold py-2 px-4 rounded hover:bg-aeon-cyan/80 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Server'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
          <h3 className="text-xl font-bold text-aeon-purple mb-4">Add New Server</h3>
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 text-sm">{success}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Port</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                  className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">RCON Password (Optional)</label>
              <input
                type="password"
                value={formData.rcon_password}
                onChange={(e) => setFormData({...formData, rcon_password: e.target.value})}
                className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-aeon-purple text-white font-bold py-2 px-4 rounded hover:bg-aeon-purple/80 transition-colors"
            >
              Confirm Add Server
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {servers.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded border border-dashed border-gray-700">
                <p className="text-gray-400">No servers configured yet.</p>
            </div>
        ) : (
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase">
                        <tr>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Port</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">RCON Configured</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.map((server) => (
                            <tr key={server.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{server.ip_address}</td>
                                <td className="px-6 py-4">{server.port}</td>
                                <td className="px-6 py-4">{server.type}</td>
                                <td className="px-6 py-4">
                                    {server.rcon_password ? (
                                        <span className="text-green-400">Yes</span>
                                    ) : (
                                        <span className="text-gray-600">No</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Servers;
