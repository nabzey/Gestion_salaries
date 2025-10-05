import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, XCircle, Play, Eye, FileText } from 'lucide-react';
import { fetchPayRuns, approvePayRun, closePayRun, fetchPayslips, getCurrentUser, getEntreprise } from '../services/api';

const statusConfig = {
  BROUILLON: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: Clock },
  APPROUVE: { label: 'Approuvé', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  CLOTURE: { label: 'Clôturé', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export default function PayRuns() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const entreprise = getEntreprise();
  const [payRuns, setPayRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !entreprise) {
      navigate('/entreprises');
      return;
    }
    if (user && user.dbName && entreprise) {
      loadPayRuns();
    }
  }, [user, entreprise, navigate]);

  const loadPayRuns = async () => {
    try {
      setLoading(true);
      const data = await fetchPayRuns();
      setPayRuns(data);
    } catch (error) {
      console.error('Erreur chargement PayRuns:', error);
      setPayRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payRunId) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver ce cycle de paie ?')) return;

    try {
      await approvePayRun(payRunId);
      await loadPayRuns();
      alert('Cycle de paie approuvé avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'approbation: ' + error.message);
    }
  };

  const handleClose = async (payRunId) => {
    if (!confirm('Êtes-vous sûr de vouloir clôturer ce cycle de paie ? Cette action est irréversible.')) return;

    try {
      await closePayRun(payRunId);
      await loadPayRuns();
      alert('Cycle de paie clôturé avec succès !');
    } catch (error) {
      alert('Erreur lors de la clôture: ' + error.message);
    }
  };

  const viewDetails = async (payRun) => {
    setSelectedPayRun(payRun);
    try {
      const payslipsData = await fetchPayslips({ payRunId: payRun.id });
      setPayslips(payslipsData);
      setShowDetails(true);
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
    }
  };

  const getTotalAmounts = (payslips) => {
    const totalBrut = payslips.reduce((sum, p) => sum + Number(p.brut), 0);
    const totalDeductions = payslips.reduce((sum, p) => sum + Number(p.deductions), 0);
    const totalNet = payslips.reduce((sum, p) => sum + Number(p.net), 0);
    return { totalBrut, totalDeductions, totalNet };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cycles de Paie</h1>
          <p className="text-gray-600 mt-2">Gérez les périodes de paie et leurs statuts</p>
        </div>
      </div>

      {loading && <div className="text-center py-8">Chargement...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(payRuns || []).map((payRun) => {
          const StatusIcon = statusConfig[payRun.status].icon;
          const totals = getTotalAmounts(payRun.payslips || []);

          return (
            <div key={payRun.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">
                      {new Date(payRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                    </h3>
                    <p className="text-sm text-gray-500">{payRun.type}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payRun.status].color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[payRun.status].label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bulletins:</span>
                  <span className="font-medium">{payRun.payslips?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Brut:</span>
                  <span className="font-medium">{totals.totalBrut.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Net:</span>
                  <span className="font-medium text-green-600">{totals.totalNet.toLocaleString()} XOF</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewDetails(payRun)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>

                {payRun.status === 'BROUILLON' && (
                  <button
                    onClick={() => handleApprove(payRun.id)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                )}

                {payRun.status === 'APPROUVE' && (
                  <button
                    onClick={() => handleClose(payRun.id)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Clôturer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {payRuns.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cycle de paie</h3>
          <p className="mt-1 text-sm text-gray-500">Générez des bulletins mensuels pour créer des cycles de paie.</p>
        </div>
      )}

      {/* Modal détails */}
      {showDetails && selectedPayRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Détails du cycle - {new Date(selectedPayRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(() => {
                  const totals = getTotalAmounts(payslips);
                  return (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{totals.totalBrut.toLocaleString()}</div>
                        <div className="text-sm text-blue-600">Total Brut (XOF)</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{totals.totalDeductions.toLocaleString()}</div>
                        <div className="text-sm text-red-600">Total Déductions (XOF)</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{totals.totalNet.toLocaleString()}</div>
                        <div className="text-sm text-green-600">Total Net (XOF)</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-4">Statuts des bulletins ({payslips.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">{payslips.filter(p => p.status === 'EN_ATTENTE').length}</div>
                    <div className="text-sm text-gray-600">En attente</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{payslips.filter(p => p.status === 'PARTIEL').length}</div>
                    <div className="text-sm text-yellow-600">Partiels</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{payslips.filter(p => p.status === 'PAYE').length}</div>
                    <div className="text-sm text-green-600">Payés</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{payslips.length}</div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-4">Bulletins de paie détaillés</h4>
              <div className="space-y-3">
                {payslips.map((payslip) => (
                  <div key={payslip.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{payslip.employee.nom}</h5>
                        <p className="text-sm text-gray-600">{payslip.employee.poste}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {Number(payslip.net).toLocaleString()} XOF
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payslip.status === 'PAYE' ? 'bg-green-100 text-green-800' :
                            payslip.status === 'PARTIEL' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payslip.status === 'PAYE' ? 'Payé' :
                             payslip.status === 'PARTIEL' ? 'Partiel' :
                             'En attente'}
                          </span>
                          {selectedPayRun.status === 'CLOTURE' && (
                            <button
                              onClick={() => navigate('/payslips')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Télécharger PDF
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Brut:</span>
                        <span className="font-medium ml-1">{Number(payslip.brut).toLocaleString()} XOF</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Déductions:</span>
                        <span className="font-medium ml-1">{Number(payslip.deductions).toLocaleString()} XOF</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Paiements:</span>
                        <span className="font-medium ml-1">{payslip.payments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
