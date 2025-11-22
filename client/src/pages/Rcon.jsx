// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Rcon = () => {
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]); // Array of { type: 'input'|'output', text: string }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await api.get('/api/minecraft');
        // Filter for servers that have RCON enabled (assumed if password is set, though we don't send password to client, we can check if backend handles it, but for now just show all and let backend fail if no password)
        setServers(response.data);
        if (response.data.length > 0) {
          setSelectedServerId(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch servers", err);
      }
    };
    fetchServers();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!command.trim() || !selectedServerId) return;

    const cmd = command;
    setCommand('');
    
    // Add input to history
    setHistory(prev => [...prev, { type: 'input', text: `> ${cmd}` }]);
    setLoading(true);

    try {
      const response = await api.post('/api/minecraft/rcon', {
        serverId: selectedServerId,
        command: cmd
      });
      
      setHistory(prev => [...prev, { type: 'output', text: response.data.output || '(No Output)' }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', text: err.response?.data?.message || err.response?.data?.error || 'Connection Failed' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">RCON Terminal</h2>
        <select 
          value={selectedServerId}
          onChange={(e) => setSelectedServerId(e.target.value)}
          className="bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 focus:border-aeon-cyan focus:outline-none"
        >
          {servers.map(s => (
            <option key={s.id} value={s.id}>{s.ip_address}:{s.port}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 bg-black border border-gray-800 rounded-lg p-4 overflow-y-auto font-mono text-sm shadow-inner shadow-aeon-purple/10">
        {history.length === 0 && (
            <div className="text-gray-600 italic">Type a command to start...</div>
        )}
        {history.map((entry, i) => (
          <div key={i} className={`mb-1 break-words ${
            entry.type === 'input' ? 'text-aeon-cyan font-bold' : 
            entry.type === 'error' ? 'text-red-400' : 'text-gray-300'
          }`}>
            {entry.text}
          </div>
        ))}
        {loading && <div className="text-aeon-purple animate-pulse">... transmitting ...</div>}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter Minecraft Command (e.g., /say Hello)"
          className="flex-1 bg-gray-900 text-white border border-gray-700 rounded p-3 focus:border-aeon-cyan focus:outline-none font-mono"
          disabled={loading || !selectedServerId}
        />
        <button 
          type="submit" 
          disabled={loading || !selectedServerId}
          className="bg-aeon-purple text-white font-bold py-2 px-6 rounded hover:bg-aeon-purple/80 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Rcon;
