import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, UserCheck, UserX, Users } from 'lucide-react';
import { fetchEmployees, getEntreprise, getCurrentUser, fetchEntreprises, createEmployee, toggleEmployeeStatus, setEntreprise } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContract, setFilterContract] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entreprise, setEntrepriseState] = useState(() => getEntreprise());
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        if (currentUser?.role === 'SUPER_ADMIN') {
          // Fetch all entreprises and their employees
          const allEntreprises = await fetchEntreprises();
          let allEmployees = [];
          for (const ent of allEntreprises) {
            const data = await fetchEmployees({ entrepriseId: ent.id });
            const adapted = data.map(e => ({
              id: `${ent.id}-${e.id}`, // unique id
              name: e.nom,
              position: e.poste,
              contractType: e.typeContrat,
              rate: String(e.tauxSalaire),
              status: e.actif ? 'Actif' : 'Inactif',
              company: ent.nom,
              raw: e,
            }));
            allEmployees = allEmployees.concat(adapted);
          }
          setEmployees(allEmployees);
        } else {
          const query = entreprise ? { entrepriseId: entreprise.id } : {};
          const data = await fetchEmployees(query);
          // Adapter les données pour l'affichage
          const adapted = data.map(e => ({
            id: e.id,
            name: e.nom,
            position: e.poste,
            contractType: e.typeContrat,
            rate: String(e.tauxSalaire),
            status: e.actif ? 'Actif' : 'Inactif',
            company: entreprise?.nom || 'Mon Entreprise',
            raw: e,
          }));
          setEmployees(adapted);
        }
      } catch (err) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [entreprise, currentUser?.role]);

  useEffect(() => {
    async function loadEntreprises() {
      const currentUser = getCurrentUser();
      if (currentUser?.role === 'SUPER_ADMIN') {
        try {
          const fetched = await fetchEntreprises();
          setEntreprises(fetched);
        } catch (err) {
          console.error('Erreur lors du chargement des entreprises:', err);
        }
      }
    }
    loadEntreprises();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || employee.status.toLowerCase() === filterStatus;
      const matchesContract = filterContract === 'all' || employee.contractType === filterContract;
      return matchesSearch && matchesStatus && matchesContract;
    });
  }, [employees, searchTerm, filterStatus, filterContract]);

  // Pagination (5 par page)
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredEmployees.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, employees]);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const contractTypes = ['all', 'FIXE', 'JOURNALIER', 'HONORAIRE'];
  const statuses = ['all', 'Actif', 'Inactif'];

  const professionOptions = [
    'Développeur', 'Comptable', 'Caissier', 'Chauffeur', 'Technicien',
    'Agent', 'Responsable RH', 'Ingénieur', 'Commercial', 'Magasinier',
  ];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nom: '', poste: '', typeContrat: 'FIXE', tauxSalaire: '', joursTravailles: '', coordonneesBancaires: '', entrepriseId: '' });
  const rateLabel = form.typeContrat === 'FIXE'
    ? 'Salaire mensuel'
    : form.typeContrat === 'JOURNALIER'
      ? 'Taux journalier'
      : 'Salaire horaire';

  const toggleStatus = async (id) => {
    try {
      await toggleEmployeeStatus(id);
      // Refresh list after toggle
      const query = entreprise ? { entrepriseId: entreprise.id } : {};
      const data = await fetchEmployees(query);
      const adapted = data.map(e => ({
        id: e.id,
        name: e.nom,
        position: e.poste,
        contractType: e.typeContrat,
        rate: String(e.tauxSalaire),
        status: e.actif ? 'Actif' : 'Inactif',
        company: entreprise?.nom || 'Mon Entreprise',
        raw: e,
      }));
      setEmployees(adapted);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de statut');
    }
  };

  async function handleCreate() {
    try {
      const currentUser = getCurrentUser();
      let entrepriseId = entreprise?.id;

      // If super admin, allow selecting entrepriseId
      if (currentUser?.role === 'SUPER_ADMIN') {
        // Fetch entreprises for selection if not already fetched
        if (!entreprises.length) {
          const fetched = await fetchEntreprises();
          setEntreprises(fetched);
        }
      }

      const payload = {
        nom: form.nom,
        poste: form.poste,
        typeContrat: form.typeContrat,
        tauxSalaire: parseFloat(form.tauxSalaire),
        coordonneesBancaires: form.coordonneesBancaires || null,
        ...(form.typeContrat === 'JOURNALIER' && form.joursTravailles
          ? { joursTravailles: parseInt(form.joursTravailles, 10) }
          : {}),
        entrepriseId: entrepriseId,
      };

      // If super admin and entrepriseId selected in form, override
      if (currentUser?.role === 'SUPER_ADMIN' && form.entrepriseId) {
        payload.entrepriseId = parseInt(form.entrepriseId, 10);
      }

      await createEmployee(payload);
      setShowAdd(false);

      // For super admin, if entrepriseId selected, set the entreprise context
      if (currentUser?.role === 'SUPER_ADMIN' && form.entrepriseId) {
        const selectedEntreprise = entreprises.find(ent => ent.id === parseInt(form.entrepriseId));
        if (selectedEntreprise) {
          setEntreprise(selectedEntreprise);
          setEntrepriseState(selectedEntreprise);
        }
      }

      // refresh list
      const query = entreprise ? { entrepriseId: entreprise.id } : {};
      const data = await fetchEmployees(query);
      const adapted = data.map(e => ({
        id: e.id,
        name: e.nom,
        position: e.poste,
        contractType: e.typeContrat,
        rate: String(e.tauxSalaire),
        status: e.actif ? 'Actif' : 'Inactif',
        company: entreprise?.nom || 'Mon Entreprise',
        raw: e,
      }));
      setEmployees(adapted);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Employés {entreprise ? `- ${entreprise.nom}` : ''}</h1>
          <div className="text-sm text-gray-500">({filteredEmployees.length} employés)</div>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </button>
      </div>

      {/* Entreprise Banner (Admin/Caissier) */}
      {entreprise && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={entreprise.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entreprise.nom)}&background=0d9488&color=fff`}
                alt={entreprise.nom}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">{entreprise.nom}</div>
                <div className="text-sm text-gray-500">{entreprise.adresse} • Devise: {entreprise.paiement}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => navigate('/employees')}
              >
                Ajouter un employé
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => navigate('/users')}
              >
                Gérer utilisateurs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
          <select
            value={filterContract}
            onChange={(e) => setFilterContract(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {contractTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Tous les contrats' : type}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </button>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un employé</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={form.nom} onChange={(e)=>setForm({...form, nom:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input
                  list="profession-options"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.poste}
                  onChange={(e)=>setForm({...form, poste:e.target.value})}
                  placeholder="Sélectionner ou taper une profession"
                />
                <datalist id="profession-options">
                  {professionOptions.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={form.typeContrat} onChange={(e)=>setForm({...form, typeContrat:e.target.value})}>
                    <option value="FIXE">FIXE</option>
                    <option value="JOURNALIER">JOURNALIER</option>
                    <option value="HONORAIRE">HONORAIRE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{rateLabel}</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border rounded-lg" value={form.tauxSalaire} onChange={(e)=>setForm({...form, tauxSalaire:e.target.value})} />
                </div>
              </div>
              {form.typeContrat === 'JOURNALIER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jours travaillés</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border rounded-lg" value={form.joursTravailles} onChange={(e)=>setForm({...form, joursTravailles:e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coordonnées bancaires</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={form.coordonneesBancaires} onChange={(e)=>setForm({...form, coordonneesBancaires:e.target.value})} />
              </div>
              {currentUser?.role === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.entrepriseId || ''}
                    onChange={(e) => setForm({ ...form, entrepriseId: e.target.value })}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button className="px-4 py-2" onClick={() => setShowAdd(false)}>Annuler</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleCreate}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-gray-500">Chargement...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de contrat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux/Salaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageData.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.contractType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.rate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'Actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleStatus(employee.id)}
                    className={`p-1 rounded ${
                      employee.status === 'Actif'
                        ? 'text-red-600 hover:bg-red-100'
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                    title={employee.status === 'Actif' ? 'Désactiver' : 'Activer'}
                  >
                    {employee.status === 'Actif' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{Math.min(filteredEmployees.length, startIndex + pageData.length)}</span> sur{' '}
              <span className="font-medium">{filteredEmployees.length}</span> employés
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 text-sm rounded-lg ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Essayez d'ajuster vos filtres ou ajoutez un nouvel employé.</p>
          </div>
        )}
      </div>
    </div>
  );
}

