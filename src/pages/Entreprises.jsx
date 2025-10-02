import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  User,
  TrendingUp,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

const Entreprises = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entreprises, setEntreprises] = useState([]);
  const [stats, setStats] = useState({ totalEntreprises: 0, entreprisesActives: 0, totalEmployes: 0, caTotal: 0 });
  const [form, setForm] = useState({ nom: '', logo: '', adresse: '', paiement: 'XOF', adminNom: '', adminEmail: '', adminPassword: '' });
  const [createAdmin, setCreateAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const sectors = ['Technologie', 'Finance', 'Santé', 'Éducation', 'Commerce', 'Industrie'];

  const handleCreate = async () => {
    // Validation côté client
    if (!form.nom.trim()) {
      setError('Le nom de l\'entreprise est requis');
      return;
    }
    if (!form.adresse.trim()) {
      setError('L\'adresse de l\'entreprise est requise');
      return;
    }
    if (createAdmin) {
      if (!form.adminNom.trim() || !form.adminEmail.trim() || !form.adminPassword.trim()) {
        setError('Tous les champs administrateur sont requis');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      const { createEntreprise } = await import('../services/api');
      const payload = {
        nom: form.nom.trim(),
        logo: form.logo.trim() || undefined,
        adresse: form.adresse.trim(),
        paiement: form.paiement,
      };

      if (createAdmin && form.adminNom.trim() && form.adminEmail.trim() && form.adminPassword.trim()) {
        payload.adminNom = form.adminNom.trim();
        payload.adminEmail = form.adminEmail.trim();
        payload.adminPassword = form.adminPassword.trim();
      }
      await createEntreprise(payload);
      setShowAddModal(false);
      setForm({ nom: '', logo: '', adresse: '', paiement: 'XOF', adminNom: '', adminEmail: '', adminPassword: '' });
      setCreateAdmin(false);
      // refresh list
      const { fetchEntreprises } = await import('../services/api');
      const data = await fetchEntreprises();
      const adapted = data.map((e) => ({
        id: e.id,
        name: e.nom,
        sector: e.sector || 'N/A',
        employees: e._count?.users ?? e.users?.length ?? 0,
        revenue: e.revenue || '—',
        status: 'active',
        logo: e.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.nom)}&background=0d9488&color=fff`,
        raw: e,
      }));
      setEntreprises(adapted);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const { fetchEntreprises, fetchGlobalStats } = await import('../services/api');
        const [entreprisesData, statsData] = await Promise.all([
          fetchEntreprises(),
          fetchGlobalStats()
        ]);
        // Adapter données pour affichage (ajouter champs de démo si absents)
        const entreprises = entreprisesData?.data || entreprisesData || [];
        const adapted = entreprises.map((e) => ({
          id: e.id,
          name: e.nom,
          sector: e.sector || 'N/A',
          employees: e._count?.users ?? e.users?.length ?? 0,
          revenue: e.revenue || '—',
          status: 'active',
          logo: e.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.nom)}&background=0d9488&color=fff`,
          raw: e,
        }));
        setEntreprises(adapted);
        const stats = statsData?.data || statsData || {};
        setStats(stats);
      } catch (err) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredEntreprises = entreprises.filter(entreprise => {
    const matchesSearch = entreprise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || entreprise.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const getStatusConfig = (status) => {
    return status === 'active' 
      ? { label: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800', dotColor: 'bg-green-500' }
      : { label: 'Inactive', bgColor: 'bg-red-100', textColor: 'text-red-800', dotColor: 'bg-red-500' };
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <span className={`w-2 h-2 rounded-full ${config.dotColor} mr-1.5`}></span>
        {config.label}
      </span>
    );
  };

// eslint-disable-next-line no-unused-vars
  const ActionButton = ({ icon: IconComponent, onClick, variant = 'default', tooltip }) => {
    const variants = {
      default: 'text-gray-400 hover:text-gray-600',
      primary: 'text-purple-500 hover:text-purple-600',
      secondary: 'text-blue-500 hover:text-blue-600',
      danger: 'text-red-500 hover:text-red-600'
    };

    return (
      <button
        onClick={onClick}
        className={`p-1.5 rounded-lg hover:bg-gray-50 transition-colors ${variants[variant]}`}
        title={tooltip}
      >
        <IconComponent className="w-4 h-4" />
      </button>
    );
  };

// eslint-disable-next-line no-unused-vars
  const StatsCard = ({ title, value, icon: IconComponent, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-gray-600 mt-2">Gérez toutes vos entreprises partenaires</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter entreprise</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total entreprises"
          value={stats.totalEntreprises.toString()}
          icon={Building2}
          color="bg-blue-500"
          change="+0 ce mois"
        />
        <StatsCard
          title="Entreprises actives"
          value={stats.entreprisesActives.toString()}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatsCard
          title="Total employés"
          value={stats.totalEmployes.toString()}
          icon={Users}
          color="bg-purple-500"
          change="+0 ce mois"
        />
        <StatsCard
          title="CA Total"
          value={`${stats.caTotal.toLocaleString()} XOF`}
          icon={TrendingUp}
          color="bg-purple-500"
          change="+0% ce mois"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sector Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="all">Tous les secteurs</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-gray-500">Chargement...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA (XOF)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntreprises.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</p>
                      <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntreprises.map((entreprise) => (
                  <tr key={entreprise.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="flex items-center text-left" onClick={() => navigate(`/entreprises/${entreprise.id}`)}>
                        <img
                          className="h-12 w-12 rounded-lg"
                          src={entreprise.logo}
                          alt={entreprise.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 hover:underline">
                            {entreprise.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: #{entreprise.id.toString().padStart(3, '0')}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{entreprise.sector}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {entreprise.employees}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {entreprise.revenue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={entreprise.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <ActionButton
                          icon={Eye}
                          variant="primary"
                          tooltip="Voir plus"
                          onClick={async () => {
                            try {
                              const { impersonateEntreprise } = await import('../services/api');
                              await impersonateEntreprise(entreprise.id);
                              navigate('/dashboard');
                            } catch (e) {
                              alert(e.message || 'Erreur');
                            }
                          }}
                        />
                        <ActionButton
                          icon={User}
                          tooltip="Utilisateurs"
                          onClick={() => navigate(`/entreprises/${entreprise.id}`)}
                        />
                        <ActionButton
                          icon={Download}
                          variant="primary"
                          tooltip="Initialiser données"
                          onClick={async () => {
                            try {
                              const { initEntreprise } = await import('../services/api');
                              setLoading(true);
                              await initEntreprise(entreprise.id);
                              alert('Données initialisées');
                            } catch (e) {
                              alert(e.message || 'Erreur');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        />
                        <ActionButton
                          icon={Edit}
                          variant="secondary"
                          tooltip="Modifier"
                          onClick={() => console.log('Edit', entreprise.id)}
                        />
                        <ActionButton
                          icon={Trash2}
                          variant="danger"
                          tooltip="Supprimer"
                          onClick={() => console.log('Delete', entreprise.id)}
                        />
                        <ActionButton
                          icon={MoreHorizontal}
                          tooltip="Plus d'actions"
                          onClick={() => console.log('More', entreprise.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEntreprises.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{filteredEntreprises.length}</span> sur{' '}
                <span className="font-medium">{entreprises.length}</span> entreprises
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50">
                  Précédent
                </button>
                <div className="flex items-center space-x-1">
                  <button className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg">1</button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
                </div>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter une nouvelle entreprise</h3>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-96">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez le nom de l'entreprise"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (URL optionnel)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez l'adresse"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise de paiement
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  value={form.paiement}
                  readOnly
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createAdmin}
                    onChange={(e) => setCreateAdmin(e.target.checked)}
                    className="mr-2"
                  />
                  Créer un administrateur automatiquement
                </label>
              </div>
              {createAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'admin
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nom de l'admin"
                      value={form.adminNom}
                      onChange={(e) => setForm({ ...form, adminNom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de l'admin
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="admin@entreprise.com"
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe de l'admin
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Mot de passe"
                      value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entreprises;