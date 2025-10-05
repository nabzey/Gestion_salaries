import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Search, Filter, DollarSign, User, Calendar } from 'lucide-react';
import { fetchPayslips, downloadPayslipPDF, getCurrentUser, getEntreprise } from '../services/api';

const statusConfig = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
  PARTIEL: { label: 'Partiel', color: 'bg-yellow-100 text-yellow-800' },
  PAYE: { label: 'Payé', color: 'bg-green-100 text-green-800' }
};

export default function Payslips() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const entreprise = useMemo(() => getEntreprise(), []);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('EN_ATTENTE');
  const [filterPayRun, setFilterPayRun] = useState('all');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !entreprise) {
      navigate('/entreprises');
      return;
    }
    if (user && user.dbName && entreprise) {
      loadPayslips();
    }
  }, [user, entreprise, navigate]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const data = await fetchPayslips();
      setPayslips(data);
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthly = async () => {
    if (!confirm('Êtes-vous sûr de vouloir générer les bulletins mensuels ? Cette action créera des bulletins pour tous les employés actifs.')) return;

    try {
      setLoading(true);
      const { generateMonthlyPayslips } = await import('../services/api');
      await generateMonthlyPayslips();
      await loadPayslips();
      alert('Bulletins mensuels générés avec succès !');
    } catch (error) {
      alert('Erreur lors de la génération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (payslipId) => {
    try {
      const blob = await downloadPayslipPDF(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${payslipId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement: ' + error.message);
    }
  };

  const filteredPayslips = payslips.filter(payslip => {
    const employeeName = payslip.employee?.nom || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payslip.status === filterStatus;
    const matchesPayRun = filterPayRun === 'all' || payslip.payRunId == filterPayRun;
    return matchesSearch && matchesStatus && matchesPayRun;
  });

  const getUniquePayRuns = () => {
    const payRuns = [...new Set(payslips.map(p => p.payRunId))];
    return payRuns.map(id => {
      const payslip = payslips.find(p => p.payRunId === id);
      return {
        id,
        periode: payslip?.payRun?.periode,
        type: payslip?.payRun?.type
      };
    });
  };

  const getTotals = () => {
    const total = filteredPayslips.length;
    const paye = filteredPayslips.filter(p => p.status === 'PAYE').length;
    const enAttente = filteredPayslips.filter(p => p.status === 'EN_ATTENTE').length;
    const partiel = filteredPayslips.filter(p => p.status === 'PARTIEL').length;
    const totalNet = filteredPayslips.reduce((sum, p) => sum + Number(p.net), 0);

    return { total, paye, enAttente, partiel, totalNet };
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulletins de Paie</h1>
          <p className="text-gray-600 mt-2">Gérez et consultez tous les bulletins de paie</p>
        </div>
        {user?.dbName && (
          <button
            onClick={handleGenerateMonthly}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Générer bulletins mensuels
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totals.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalNet.toLocaleString()} XOF</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">{totals.paye}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Payés</p>
              <p className="text-lg font-semibold text-green-600">{totals.paye}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">{totals.partiel}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Partiels</p>
              <p className="text-lg font-semibold text-yellow-600">{totals.partiel}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold">{totals.enAttente}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-lg font-semibold text-gray-600">{totals.enAttente}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par employé..."
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
            <option value="all">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PARTIEL">Partiel</option>
            <option value="PAYE">Payé</option>
          </select>
          <select
            value={filterPayRun}
            onChange={(e) => setFilterPayRun(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les cycles</option>
            {getUniquePayRuns().map(payRun => (
              <option key={payRun.id} value={payRun.id}>
                {payRun.periode ? new Date(payRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : `Cycle ${payRun.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table des bulletins */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && <div className="p-4 text-center">Chargement...</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Déductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut Bulletin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payslip.employee?.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payslip.employee?.poste}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {payslip.payRun?.periode ? new Date(payslip.payRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {Number(payslip.brut).toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {Number(payslip.deductions).toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {Number(payslip.net).toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[payslip.status].color}`}>
                      {statusConfig[payslip.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payslip.payRun?.status === 'BROUILLON' ? 'bg-red-100 text-red-800' :
                      payslip.payRun?.status === 'APPROUVE' ? 'bg-yellow-100 text-yellow-800' :
                      payslip.payRun?.status === 'CLOTURE' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payslip.payRun?.status === 'BROUILLON' ? 'Brouillon' :
                       payslip.payRun?.status === 'APPROUVE' ? 'Approuvé' :
                       payslip.payRun?.status === 'CLOTURE' ? 'Clôturé' :
                       'Inconnu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => downloadPDF(payslip.id)}
                      disabled={payslip.payRun?.status === 'BROUILLON'}
                      className={`p-1 rounded ${
                        payslip.payRun?.status === 'BROUILLON'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-900 hover:bg-blue-100'
                      }`}
                      title={payslip.payRun?.status === 'BROUILLON' ? 'Cycle en brouillon - Téléchargement indisponible' : 'Télécharger PDF'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayslips.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bulletin trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Ajustez vos filtres ou générez des bulletins mensuels.</p>
          </div>
        )}
      </div>
    </div>
  );
}
