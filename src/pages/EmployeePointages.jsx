import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { getCurrentUser, fetchEmployeePointages } from '../services/api';
import EmployeeSidebar from '../components/EmployeeSidebar';

export default function EmployeePointages() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'EMPLOYEE') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeePointages();
      setPointages(data);
    } catch (err) {
      setError('Erreur lors du chargement des pointages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">
                Mes pointages
              </h1>
              <p className="text-gray-600">Historique complet de vos pointages</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Entreprise</p>
                <p className="text-sm font-medium">{currentUser.entreprise?.nom}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <EmployeeSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  <Clock className="inline-block mr-2 h-5 w-5" />
                  Mes pointages récents
                </h3>
                {pointages && pointages.length > 0 ? (
                  <div className="space-y-3">
                    {pointages.map((pointage, index) => (
                      <div key={pointage.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {pointage.type === 'ARRIVEE' ? 'Arrivée' :
                             pointage.type === 'DEPART' ? 'Départ' :
                             pointage.type === 'PAUSE_DEBUT' ? 'Début de pause' :
                             pointage.type === 'PAUSE_FIN' ? 'Fin de pause' : pointage.type}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(pointage.heure).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(pointage.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun pointage enregistré</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}