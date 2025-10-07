import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { getCurrentUser, fetchEmployeePayslips, downloadEmployeePayslipPDF } from '../services/api';
import EmployeeSidebar from '../components/EmployeeSidebar';

export default function EmployeePayslips() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [payslips, setPayslips] = useState([]);
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
      const data = await fetchEmployeePayslips();
      setPayslips(data);
    } catch (err) {
      setError('Erreur lors du chargement des bulletins');
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
      a.download = `bulletin_${payslipId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement: ' + err.message);
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
                Mes bulletins de paie
              </h1>
              <p className="text-gray-600">Consultez et téléchargez vos bulletins de salaire</p>
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
                  <FileText className="inline-block mr-2 h-5 w-5" />
                  Mes bulletins de paie
                </h3>
                {payslips && payslips.length > 0 ? (
                  <div className="space-y-3">
                    {payslips.map((payslip) => (
                      <div key={payslip.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {payslip.payRun?.periode ? new Date(payslip.payRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'Période inconnue'}
                          </span>
                          <div className="text-sm text-gray-500">
                            Brut: {Number(payslip.brut).toLocaleString()} XOF |
                            Net: {Number(payslip.net).toLocaleString()} XOF
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payslip.status === 'PAYE' ? 'bg-green-100 text-green-800' :
                            payslip.status === 'PARTIEL' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payslip.status === 'PAYE' ? 'Payé' :
                             payslip.status === 'PARTIEL' ? 'Partiel' :
                             'En attente'}
                          </span>
                          <button
                            onClick={() => downloadPayslip(payslip.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="mr-1 h-4 w-4" />
                            PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun bulletin de paie disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}