import React, { useState, useEffect } from 'react';
import { AuditLog, User } from '../types';

interface AdminConsoleProps {
  token: string;
  onClose: () => void;
}

const DetailChip = ({ label, value }: { label: string, value: any }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs mx-1">
    <span className="text-slate-400 mr-1.5">{label}:</span>
    <span className="text-cyan-300 font-medium truncate max-w-[200px]" title={String(value)}>{String(value)}</span>
  </span>
);

const FormatDetails = ({ details }: { details: any }) => {
  try {
    const parsed = typeof details === 'string' ? JSON.parse(details) : details;
    if (typeof parsed !== 'object' || !parsed) return <span className="text-slate-400 italic">{String(details)}</span>;

    return (
      <span className="inline-flex flex-wrap gap-y-1 items-center">
        {Object.entries(parsed).map(([key, value]) => (
          <DetailChip key={key} label={key} value={value} />
        ))}
      </span>
    );
  } catch (e) {
    return <span className="text-slate-400">{String(details)}</span>;
  }
};

export const AdminConsole: React.FC<AdminConsoleProps> = ({ token, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', full_name: '', password: '' });

  const BASE_URL = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8003';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchLogs();
  }, [activeTab]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        setIsCreateModalOpen(false);
        setNewUser({ email: '', full_name: '', password: '' });
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to create user');
      }
    } catch (err) {
      alert('Error creating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleRoleChange = async (userId: string, roleName: string, action: 'add' | 'remove') => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_name: roleName, action }),
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh list
      } else {
        alert('Failed to update role');
      }
    } catch (err) {
      alert('Error updating role');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-6xl h-[80vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center border border-red-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nexo Admin Console</h2>
              <p className="text-slate-400 text-sm">Gestión de Seguridad y Auditoría</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Usuarios y Roles
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'logs' 
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logs de Auditoría
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              Cargando datos del sistema...
            </div>
          ) : error ? (
            <div className="text-red-400 text-center p-4 border border-red-900/50 rounded-lg bg-red-900/10">
              {error}
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Usuario
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Roles Actuales</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 text-sm">
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-white">{user.full_name}</td>
                      <td className="p-3 text-slate-400">{user.email}</td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          {user.roles.map(role => (
                            <span key={role.id} className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {!user.roles.some(r => r.name === 'Viewer') && (
                            <button 
                              onClick={() => handleRoleChange(user.id, 'Viewer', 'add')}
                              className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-800/50 hover:bg-green-900/50"
                            >
                              + Viewer
                            </button>
                          )}
                          {user.roles.some(r => r.name === 'Viewer') && (
                            <button 
                              onClick={() => handleRoleChange(user.id, 'Viewer', 'remove')}
                              className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-800/50 hover:bg-red-900/50"
                            >
                              - Viewer
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-2"
                            title="Eliminar Usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {logs.map(log => (
                <div key={log.id} className="p-3 bg-slate-950 rounded border border-slate-800 flex gap-4 items-start hover:border-slate-700 transition-colors">
                  <div className="text-slate-500 w-32 shrink-0">{new Date(log.timestamp).toLocaleString()}</div>
                  <div className={`w-24 shrink-0 font-bold ${
                    log.action_type === 'LOGIN' ? 'text-green-400' : 
                    log.action_type === 'ROLE_CHANGE' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {log.action_type}
                  </div>
                  <div className="flex-1 text-slate-300 break-all flex items-center flex-wrap gap-2">
                    <div className="flex items-center">
                      <span className="text-slate-500 mr-2">Actor:</span>
                      <span className="font-mono text-slate-400 bg-slate-900 px-1 rounded border border-slate-800" title={log.actor_id}>
                        {log.actor_id?.split('-')[0]}...
                      </span>
                    </div>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <div className="flex items-center">
                      <FormatDetails details={log.details} />
                    </div>
                  </div>
                  <div className="text-slate-600 font-mono text-xs">{log.ip_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
