import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CreditCard, Download, Search, Filter, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getEntreprise } from '../services/api';

const statusConfig = {
  'PAYE': 'bg-green-100 text-green-800',
  'PARTIEL': 'bg-yellow-100 text-yellow-800',
  'EN_ATTENTE': 'bg-gray-100 text-gray-800'
};

const methodConfig = {
  'ESPECES': '💵',
  'VIREMENT_BANCAIRE': '🏦',
  'ORANGE_MONEY': '📱',
  'WAVE': '🌊'
};

export default function Payments() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const entreprise = useMemo(() => getEntreprise(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ montant: '', mode: 'ESPECES', payslipId: '', date: '' });

  useEffect(() => {
    if (!user) {
      console.log('Utilisateur non connecté, redirection vers login');
      navigate('/login');
      return;
    }
    console.log('Utilisateur connecté:', user);

    if (user.role === 'SUPER_ADMIN' && !entreprise) {
      navigate('/entreprises');
      return;
    }
  }, [user, navigate, entreprise]);

  useEffect(() => {
    async function loadData() {
      if (!user || (user.role === 'SUPER_ADMIN' && !entreprise)) {
        return;
      }
      try {
        setLoading(true);
        setError('');
        const { fetchPayments, fetchEmployees } = await import('../services/api');
        const [paymentsData, employeesData] = await Promise.all([
          fetchPayments(),
          fetchEmployees()
        ]);
        setPayments(paymentsData);
        setEmployees(employeesData);
      } catch (err) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, entreprise]);

  const filteredPayments = payments.filter(payment => {
    const employeeName = payment.payslip?.employee?.nom || '';
    const employeeId = payment.payslip?.employee?.id;
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.payslip?.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.mode === filterMethod;
    const matchesEmployee = filterEmployee === 'all' || employeeId == filterEmployee;
    return matchesSearch && matchesStatus && matchesMethod && matchesEmployee;
  });

  const statuses = ['all', 'EN_ATTENTE', 'PARTIEL', 'PAYE'];
  const methods = ['all', 'ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE'];

  const handleCreate = async () => {
    if (!form.montant || !form.payslipId) {
      setError('Montant et ID bulletin requis');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { createPayment } = await import('../services/api');
      const payload = {
        montant: parseFloat(form.montant),
        mode: form.mode,
        payslipId: parseInt(form.payslipId),
        date: form.date || undefined,
      };
      await createPayment(payload);
      setShowAddModal(false);
      setForm({ montant: '', mode: 'ESPECES', payslipId: '', date: '' });
      // Refresh
      const { fetchPayments } = await import('../services/api');
      const data = await fetchPayments();
      setPayments(data);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async (payment) => {
    try {
      const { downloadPaymentReceipt } = await import('../services/api');
      const blob = await downloadPaymentReceipt(payment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_paiement_${payment.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
          <div className="text-sm text-gray-500">({filteredPayments.length} paiements)</div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau paiement
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      {/* Filters */}
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
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Tous les statuts' : status}
              </option>
            ))}
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {methods.map(method => (
              <option key={method} value={method}>
                {method === 'all' ? 'Toutes les méthodes' : method.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les employés</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut Bulletin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.payslip?.employee?.nom || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Bulletin: {payment.payslipId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {payment.montant} XOF
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>{methodConfig[payment.mode]}</span>
                    {payment.mode.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[payment.payslip?.status || 'EN_ATTENTE']}`}>
                    {payment.payslip?.status || 'EN_ATTENTE'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => generateReceipt(payment)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Télécharger reçu"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100">
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Ajustez vos filtres ou ajoutez un nouveau paiement.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un paiement</h3>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-96">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 100000"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="WAVE">Wave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Bulletin de paie
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 1"
                  value={form.payslipId}
                  onChange={(e) => setForm({ ...form, payslipId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date (optionnel)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
}
