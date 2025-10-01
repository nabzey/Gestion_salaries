import React, { useState } from 'react';
import { Plus, UserCheck, Search, Filter, Shield, User, Settings } from 'lucide-react';

const mockUsers = [
  {
    id: 1,
    name: 'Alice Dupont',
    email: 'alice@entreprise-alpha.com',
    role: 'Administrateur',
    company: 'Entreprise Alpha',
    status: 'Actif',
    lastLogin: '2024-03-15',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Bob Martin',
    email: 'bob@entreprise-beta.com',
    role: 'Caissier',
    company: 'Entreprise Beta',
    status: 'Actif',
    lastLogin: '2024-03-14',
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    name: 'Super Admin',
    email: 'admin@gestion-salaires.com',
    role: 'Super-Administrateur',
    company: 'Toutes',
    status: 'Actif',
    lastLogin: '2024-03-15',
    createdAt: '2023-12-01'
  },
  {
    id: 4,
    name: 'Claire Leclerc',
    email: 'claire@entreprise-gamma.com',
    role: 'Administrateur',
    company: 'Entreprise Gamma',
    status: 'Inactif',
    lastLogin: '2024-02-28',
    createdAt: '2024-02-01'
  }
];

const roleConfig = {
  'Super-Administrateur': { color: 'bg-purple-100 text-purple-800', icon: Shield },
  'Administrateur': { color: 'bg-blue-100 text-blue-800', icon: Settings },
  'Caissier': { color: 'bg-green-100 text-green-800', icon: User }
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roles = ['all', 'Super-Administrateur', 'Administrateur', 'Caissier'];
  const statuses = ['all', 'Actif', 'Inactif'];

  const addUser = () => {
    // Mock add user
    console.log('Add new user');
  };

  const toggleStatus = (id) => {
    // Mock toggle
    console.log(`Toggle status for user ${id}`);
  };

  const getRoleIcon = (role) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <div className="text-sm text-gray-500">({filteredUsers.length} utilisateurs)</div>
        </div>
        <button
          onClick={addUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'Tous les rôles' : role}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Tous les statuts' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${roleConfig[user.role].color}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'Actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className={`p-1 rounded ${
                      user.status === 'Actif'
                        ? 'text-red-600 hover:bg-red-100'
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                    title={user.status === 'Actif' ? 'Désactiver' : 'Activer'}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100">
                    Éditer
                  </button>
                  <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Ajustez vos filtres ou ajoutez un nouvel utilisateur.</p>
          </div>
        )}
      </div>
    </div>
  );
}
