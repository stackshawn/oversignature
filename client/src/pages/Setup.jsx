// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Setup = () => {
  const [formData, setFormData] = useState({
    workspaceName: '',
    username: '',
    password: '',
    confirmPassword: '',
    minecraftIgn: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if setup is actually required
    const checkStatus = async () => {
      try {
        const response = await api.get('/api/setup/status');
        if (!response.data.setupRequired) {
          navigate('/login');
        }
      } catch (err) {
        setError('Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.post('/api/setup/init', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed');
    }
  };

  if (loading) return <div className="min-h-screen bg-aeon-dark text-aeon-cyan flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-aeon-dark flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-aeon-purple shadow-lg shadow-aeon-purple/20">
        <h1 className="text-3xl font-bold text-aeon-cyan mb-6 text-center">OverSignature Setup</h1>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name</label>
            <input
              type="text"
              name="workspaceName"
              value={formData.workspaceName}
              onChange={handleChange}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Minecraft IGN</label>
            <input
              type="text"
              name="minecraftIgn"
              value={formData.minecraftIgn}
              onChange={handleChange}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-cyan focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-aeon-purple hover:bg-aeon-purple/80 text-white font-bold py-2 px-4 rounded transition-colors mt-4"
          >
            Initialize System
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
