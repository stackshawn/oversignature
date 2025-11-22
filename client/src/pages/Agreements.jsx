// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthProvider';

const Agreements = () => {
  const { auth } = useContext(AuthContext);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [signature, setSignature] = useState('');
  const [signError, setSignError] = useState('');
  
  // Admin State
  const [users, setUsers] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({ targetUserId: '', title: '', content: '' });
  const [assignMessage, setAssignMessage] = useState('');

  const isAdmin = ['Owner', 'Executive', 'Admin'].includes(auth.user?.role);

  useEffect(() => {
    fetchAgreements();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchAgreements = async () => {
    try {
      const response = await api.get('/api/agreements');
      setAgreements(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/workspace/users');
      setUsers(response.data);
    } catch (err) { console.error(err); }
  };

  const handleSign = async () => {
    try {
      await api.post(`/api/agreements/${selectedAgreement.id}/sign`, { signature });
      setSelectedAgreement(null);
      setSignature('');
      fetchAgreements();
    } catch (err) {
      setSignError(err.response?.data?.message || 'Failed to sign');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/agreements/assign', assignData);
      setAssignMessage('Agreement assigned successfully');
      setAssignData({ targetUserId: '', title: '', content: '' });
      setShowAssignForm(false);
      fetchAgreements();
    } catch (err) {
      setAssignMessage('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-aeon-cyan">Loading agreements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Legal Agreements</h2>
        {isAdmin && (
           <button 
             onClick={() => setShowAssignForm(!showAssignForm)}
             className="bg-aeon-cyan text-black font-bold py-2 px-4 rounded hover:bg-aeon-cyan/80 transition-colors"
           >
             {showAssignForm ? 'Cancel' : 'Assign New'}
           </button>
        )}
      </div>

      {/* Assign Form (Admin) */}
      {showAssignForm && (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold text-aeon-purple mb-4">Assign Agreement</h3>
            {assignMessage && <div className="text-white mb-2">{assignMessage}</div>}
            <form onSubmit={handleAssign} className="space-y-4">
                <select 
                  value={assignData.targetUserId}
                  onChange={(e) => setAssignData({...assignData, targetUserId: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white"
                  required
                >
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Title (e.g., NDA)" 
                  value={assignData.title}
                  onChange={(e) => setAssignData({...assignData, title: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white"
                  required
                />
                <textarea 
                  placeholder="Content..." 
                  rows="4"
                  value={assignData.content}
                  onChange={(e) => setAssignData({...assignData, content: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white"
                  required
                />
                <button type="submit" className="w-full bg-aeon-purple text-white py-2 rounded">Assign</button>
            </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {agreements.length === 0 && !showAssignForm && (
            <div className="text-center py-12 bg-gray-900/50 rounded border border-dashed border-gray-700">
                <p className="text-gray-400">No agreements pending.</p>
            </div>
        )}
        {agreements.map((agg) => (
            <div key={agg.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-lg">{agg.title}</h3>
                    <p className="text-xs text-gray-500">Issued: {new Date(agg.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                    {agg.is_signed ? (
                        <div className="text-green-400 text-sm flex items-center gap-2">
                            <span>✓ Signed</span>
                            <span className="text-xs text-gray-600">({new Date(agg.signed_at).toLocaleDateString()})</span>
                        </div>
                    ) : (
                        <button 
                           onClick={() => setSelectedAgreement(agg)}
                           className="bg-aeon-purple text-white px-4 py-2 rounded text-sm hover:bg-aeon-purple/80"
                        >
                            Review & Sign
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Sign Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 w-full max-w-2xl rounded-lg border border-aeon-cyan shadow-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedAgreement.title}</h2>
                <div className="bg-black/50 p-4 rounded text-gray-300 max-h-64 overflow-y-auto mb-6 whitespace-pre-wrap border border-gray-800">
                    {selectedAgreement.content}
                </div>
                
                {signError && <div className="text-red-400 mb-4 text-sm">{signError}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type your full username to sign: <strong>{auth.user.username}</strong></label>
                        <input 
                          type="text" 
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-aeon-cyan focus:outline-none"
                          placeholder={auth.user.username}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedAgreement(null); setSignError(''); setSignature(''); }}
                          className="text-gray-400 hover:text-white px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button 
                          onClick={handleSign}
                          disabled={!signature}
                          className="bg-aeon-cyan text-black font-bold px-6 py-2 rounded disabled:opacity-50"
                        >
                            Sign Agreement
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Agreements;
