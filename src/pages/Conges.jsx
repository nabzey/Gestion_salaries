import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Trash2
} from 'lucide-react';
import {
  getCurrentUser,
  createCongeRequest,
  getMyCongeRequests,
  cancelCongeRequest,
  getCongeBalance
} from '../services/api';

export default function Conges() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [congeRequests, setCongeRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    typeConge: '',
    dateDebut: '',
    dateFin: '',
    motif: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
      const [requestsData, balanceData] = await Promise.all([
        getMyCongeRequests(),
        getCongeBalance()
      ]);
      setCongeRequests(requestsData);
      setBalance(balanceData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createCongeRequest(formData);
      setShowForm(false);
      setFormData({
        typeConge: '',
        dateDebut: '',
        dateFin: '',
        motif: ''
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;
    try {
      await cancelCongeRequest(id);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROUVE': return 'bg-green-100 text-green-800';
      case 'REJETE': return 'bg-red-100 text-red-800';
      case 'ANNULE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROUVE': return <CheckCircle className="h-4 w-4" />;
      case 'REJETE': return <XCircle className="h-4 w-4" />;
      case 'ANNULE': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROUVE': return 'Approuvé';
      case 'REJETE': return 'Rejeté';
      case 'ANNULE': return 'Annulé';
      default: return 'En attente';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'ANNUEL': return 'Congé annuel';
      case 'MALADIE': return 'Congé maladie';
      case 'SANS_SOLDE': return 'Congé sans solde';
      case 'MATERNITE': return 'Congé maternité';
      case 'PATERNITE': return 'Congé paternité';
      case 'EXCEPTIONNEL': return 'Congé exceptionnel';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                ← Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mes congés</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos demandes de congé et consultez votre solde
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Balance */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Congés annuels restants
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {balance.congesAnnuels.restants} / {balance.congesAnnuels.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Congés maladie restants
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {balance.congesMaladie.restants} / {balance.congesMaladie.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Demandes en attente
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {balance.congesEnAttente}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Mes demandes de congé
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {congeRequests.length > 0 ? (
              congeRequests.map((request) => (
                <li key={request.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {getTypeText(request.typeConge)}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Du {new Date(request.dateDebut).toLocaleDateString('fr-FR')} au {new Date(request.dateFin).toLocaleDateString('fr-FR')}
                        {request.motif && (
                          <span className="ml-2">- {request.motif}</span>
                        )}
                      </div>
                      {request.commentaireRH && (
                        <div className="mt-1 text-sm text-gray-500">
                          Commentaire RH: {request.commentaireRH}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'EN_ATTENTE' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-gray-500">
                Aucune demande de congé
              </li>
            )}
          </ul>
        </div>

        {/* New Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nouvelle demande de congé
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type de congé
                    </label>
                    <select
                      value={formData.typeConge}
                      onChange={(e) => setFormData({...formData, typeConge: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="ANNUEL">Congé annuel</option>
                      <option value="MALADIE">Congé maladie</option>
                      <option value="SANS_SOLDE">Congé sans solde</option>
                      <option value="MATERNITE">Congé maternité</option>
                      <option value="PATERNITE">Congé paternité</option>
                      <option value="EXCEPTIONNEL">Congé exceptionnel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Motif (optionnel)
                    </label>
                    <textarea
                      value={formData.motif}
                      onChange={(e) => setFormData({...formData, motif: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Envoi...' : 'Envoyer la demande'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
