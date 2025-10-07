import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getCurrentUser,
  fetchEmployeePointages,
  fetchEmployeePayslips,
  downloadEmployeePayslipPDF
} from '../services/api';

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [pointages, setPointages] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showPassword, setShowPassword] = useState(false);

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
      const [pointagesData, payslipsData] = await Promise.all([
        fetchEmployeePointages(),
        fetchEmployeePayslips()
      ]);
      setPointages(pointagesData);
      setPayslips(payslipsData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payslipId) => {
    try {
      const blob = await downloadEmployeePayslipPDF(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-paie-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erreur lors du téléchargement');
      console.error(err);
    }
  };

  const getPointageTypeText = (type) => {
    switch (type) {
      case 'ARRIVEE': return 'Arrivée';
      case 'DEPART': return 'Départ';
      case 'PAUSE_DEBUT': return 'Début de pause';
      case 'PAUSE_FIN': return 'Fin de pause';
      default: return type;
    }
  };

  const getPointageTypeColor = (type) => {
    switch (type) {
      case 'ARRIVEE': return 'text-green-600 bg-green-100';
      case 'DEPART': return 'text-red-600 bg-red-100';
      case 'PAUSE_DEBUT': return 'text-yellow-600 bg-yellow-100';
      case 'PAUSE_FIN': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Consultez vos informations personnelles, pointages et bulletins de paie
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

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'info', name: 'Informations', icon: User },
              { id: 'pointages', name: 'Pointages', icon: Clock },
              { id: 'payslips', name: 'Bulletins de paie', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-sm text-gray-900">{currentUser.nom}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Poste</p>
                      <p className="text-sm text-gray-900">{currentUser.poste}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Entreprise</p>
                      <p className="text-sm text-gray-900">{currentUser.entreprise?.nom}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <p className="text-sm text-gray-900">Actif</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rôle</p>
                      <p className="text-sm text-gray-900">Employé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Mon QR Code</h4>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      {currentUser.qrCode ? (
                        <div className="mb-4">
                          <QRCodeCanvas value={currentUser.qrCode} size={128} />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">📱</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        Présentez ce QR Code pour votre pointage
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {currentUser.id}
                      </p>
                      {currentUser.qrCode && (
                        <div className="mt-2 p-2 bg-white rounded text-xs font-mono break-all">
                          {currentUser.qrCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pointages' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Historique des pointages
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vos arrivées, départs et pauses du mois en cours
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {pointages.length > 0 ? (
                pointages.map((pointage) => (
                  <li key={`${pointage.id}-${pointage.type}`} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getPointageTypeColor(pointage.type)}`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {getPointageTypeText(pointage.type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(pointage.date).toLocaleDateString('fr-FR')} à {new Date(pointage.heure).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center text-gray-500">
                  Aucun pointage enregistré ce mois-ci
                </li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mes bulletins de paie
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Téléchargez vos bulletins de paie
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {payslips.length > 0 ? (
                payslips.map((payslip) => (
                  <li key={payslip.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Bulletin de paie - {payslip.payRun.periode ? new Date(payslip.payRun.periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Période inconnue'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Brut: {payslip.brut} XOF | Déductions: {payslip.deductions} XOF | Net: {payslip.net} XOF
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payslip.status === 'PAYE' ? 'bg-green-100 text-green-800' :
                              payslip.status === 'PARTIEL' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payslip.status === 'PAYE' ? 'Payé' :
                               payslip.status === 'PARTIEL' ? 'Paiement partiel' :
                               'En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => downloadPayslip(payslip.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center text-gray-500">
                  Aucun bulletin de paie disponible
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}