// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';
import api from '../api/axios';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await api.get('/api/setup/status');
        if (response.data.setupRequired) {
          navigate('/setup', { replace: true });
        } else {
          setCheckingSetup(false);
        }
      } catch (err) {
        console.error(err);
        setCheckingSetup(false);
      }
    };
    checkSetup();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-aeon-dark flex items-center justify-center text-aeon-cyan animate-pulse">
        Initializing Aeon System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aeon-dark flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-sm w-full bg-gray-900 p-8 rounded-lg border border-aeon-cyan shadow-lg shadow-aeon-cyan/20">
        <h1 className="text-3xl font-bold text-aeon-purple mb-6 text-center">Aeon Access</h1>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-purple focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 focus:border-aeon-purple focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-aeon-cyan text-black hover:bg-aeon-cyan/80 font-bold py-2 px-4 rounded transition-colors mt-4"
          >
            Login
          </button>
        </form>
      </div>
      <div className="mt-8 text-gray-600 text-xs">
        Powered by OverSignature. © 2024 Zafrid.
      </div>
    </div>
  );
};

export default Login;
