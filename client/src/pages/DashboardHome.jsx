// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect } from 'react';
import api from '../api/axios';

const DashboardHome = () => {
  const [servers, setServers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch Servers
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await api.get('/api/minecraft');
        setServers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch servers", err);
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  // Ping Servers (poll every 60s)
  useEffect(() => {
    if (servers.length === 0) return;

    const pingAll = async () => {
      const newStatuses = {};
      for (const server of servers) {
        try {
          const res = await api.get(`/api/minecraft/status/${server.id}`);
          newStatuses[server.id] = res.data;
        } catch (err) {
          newStatuses[server.id] = { online: false, error: 'Failed to ping' };
        }
      }
      setStatuses(newStatuses);
    };

    pingAll();
    const interval = setInterval(pingAll, 60000);
    return () => clearInterval(interval);
  }, [servers]);

  if (loading) return <div className="text-aeon-cyan">Loading dashboard...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Card */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg">
        <h3 className="text-aeon-purple font-bold mb-2 uppercase tracking-wider text-sm">Network Health</h3>
        <div className="text-3xl font-bold text-white">{servers.length} <span className="text-base font-normal text-gray-500">Servers Configured</span></div>
      </div>

      {/* Server Status Widgets */}
      {servers.map((server) => {
        const status = statuses[server.id];
        const isOnline = status?.online;

        return (
          <div key={server.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">{server.ip_address}:{server.port}</h3>
                <span className={`text-xs px-2 py-1 rounded ${isOnline ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            {isOnline ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Players</span>
                  <span className="text-white">{status.players} / {status.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="text-white">{status.version}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-800">
                   <p className="text-xs text-gray-400 italic truncate">{status.motd}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Waiting for response...
              </div>
            )}
          </div>
        );
      })}
      
      {servers.length === 0 && (
        <div className="col-span-full bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">No servers configured. Ask an Executive to add one.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
