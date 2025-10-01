import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEntrepriseById, fetchEntrepriseUsers, getEntreprisePersonnel } from '../services/api';
import { Users, ArrowLeft, User } from 'lucide-react';

export default function EntrepriseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entreprise, setEntreprise] = useState(null);
  const [users, setUsers] = useState({ admins: [], caissiers: [] });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const ent = await getEntrepriseById(id);
        setEntreprise(ent);
        const u = await fetchEntrepriseUsers(id);
        setUsers(u);
        const personnel = await getEntreprisePersonnel(id);
        setEmployees(personnel.employees || []);
      } catch (e) {
        setError(e.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Chargement...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;
  if (!entreprise) return <div className="p-4">Entreprise introuvable</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <img src={entreprise.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entreprise.nom)}&background=0d9488&color=fff`} className="w-14 h-14 rounded" />
          <div>
            <div className="text-xl font-semibold">{entreprise.nom}</div>
            <div className="text-sm text-gray-500">{entreprise.adresse} • Devise: {entreprise.paiement}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Admins</h3>
          <ul className="divide-y divide-gray-200">
            {users.admins.length === 0 && <li className="text-sm text-gray-500">Aucun admin</li>}
            {users.admins.map(u => (
              <li key={u.id} className="py-2">
                <div className="font-medium">{u.nom}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Caissiers</h3>
          <ul className="divide-y divide-gray-200">
            {users.caissiers.length === 0 && <li className="text-sm text-gray-500">Aucun caissier</li>}
            {users.caissiers.map(u => (
              <li key={u.id} className="py-2">
                <div className="font-medium">{u.nom}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Employés</h3>
          <ul className="divide-y divide-gray-200">
            {employees.length === 0 && <li className="text-sm text-gray-500">Aucun employé</li>}
            {employees.map(emp => (
              <li key={emp.id} className="py-2">
                <div className="font-medium">{emp.nom}</div>
                <div className="text-xs text-gray-500">{emp.poste} • {emp.tauxSalaire} XOF</div>
                <div className="text-xs text-gray-400">
                  {emp.actif ? 'Actif' : 'Inactif'} • {emp.typeContrat}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
