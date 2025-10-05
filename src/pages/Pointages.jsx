import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, Search, User, Calendar, Play, Square, Coffee, Users, CheckCircle, Clock as ClockIcon, XCircle } from 'lucide-react';
import {
  getPointages,
  createPointage,
  fetchEmployees,
  getCurrentUser,
  getEntreprise,
  getAttendance
} from '../services/api';

const typeConfig = {
  ARRIVEE: { label: 'Arrivée', color: 'bg-green-100 text-green-800', icon: Play },
  DEPART: { label: 'Départ', color: 'bg-red-100 text-red-800', icon: Square },
  PAUSE_DEBUT: { label: 'Début Pause', color: 'bg-yellow-100 text-yellow-800', icon: Coffee },
  PAUSE_FIN: { label: 'Fin Pause', color: 'bg-blue-100 text-blue-800', icon: Play }
};

export default function Pointages() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const entreprise = useMemo(() => getEntreprise(), []);
  const [pointages, setPointages] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pointages');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState('ARRIVEE');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !entreprise) {
      navigate('/entreprises');
      return;
    }
    if (user && entreprise) {
      loadData();
    }
  }, [user, entreprise, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pointagesData, attendanceData, employeesData] = await Promise.all([
        getPointages(),
        getAttendance(),
        fetchEmployees()
      ]);
      setPointages(pointagesData);
      setAttendance(attendanceData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePointage = async () => {
    if (!selectedEmployee || !selectedType) {
      alert('Veuillez sélectionner un employé et un type de pointage');
      return;
    }

    try {
      await createPointage({
        employeeId: parseInt(selectedEmployee),
        type: selectedType,
        heure: new Date().toISOString()
      });
      setShowAdd(false);
      setSelectedEmployee('');
      setSelectedType('ARRIVEE');
      await loadData();
      alert('Pointage créé avec succès !');
    } catch (error) {
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  const attendanceStatusConfig = {
    PRESENT: { label: 'Présent', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    RETARD: { label: 'Retard', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    ABSENT: { label: 'Absent', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pointages & Présence</h1>
          <p className="text-gray-600 mt-2">Gestion des heures de travail et suivi de présence</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau pointage
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pointages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pointages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pointages
          </button>
          <button
            onClick={() => setActiveTab('presence')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'presence'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Présence
          </button>
        </nav>
      </div>

      {/* Modal ajout pointage */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau pointage</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employé</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nom} - {employee.poste}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de pointage</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ARRIVEE">Arrivée</option>
                  <option value="DEPART">Départ</option>
                  <option value="PAUSE_DEBUT">Début de pause</option>
                  <option value="PAUSE_FIN">Fin de pause</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                className="px-4 py-2"
                onClick={() => setShowAdd(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleCreatePointage}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on tab */}
      {activeTab === 'pointages' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading && <div className="p-4 text-center">Chargement...</div>}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pointages.map((pointage) => {
                const TypeIcon = typeConfig[pointage.type].icon;
                return (
                  <tr key={pointage.id}>
                    <td className="px-6 py-4">{pointage.employee?.nom}</td>
                    <td className="px-6 py-4">{new Date(pointage.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">{new Date(pointage.heure).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[pointage.type].color}`}>
                        <TypeIcon className="w-3 h-3 inline mr-1" />
                        {typeConfig[pointage.type].label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading && <div className="p-4 text-center">Chargement...</div>}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Heure d'arrivée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((att) => {
                const StatusIcon = attendanceStatusConfig[att.status].icon;
                return (
                  <tr key={`${att.employeeId}-${att.date}`}>
                    <td className="px-6 py-4">{att.employee?.nom}</td>
                    <td className="px-6 py-4">{new Date(att.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      {att.arrivalTime ? new Date(att.arrivalTime).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceStatusConfig[att.status].color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {attendanceStatusConfig[att.status].label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
