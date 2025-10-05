import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle,
  CreditCard,
  Users,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Plus,
  Factory,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { getCurrentUser, getEntreprise, fetchEmployees, fetchPayslips, fetchPayments, fetchPayRuns, fetchEntreprises } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const entreprise = getEntreprise();
  const isSuper = currentUser?.role === 'SUPER_ADMIN';
  const user = currentUser;
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payruns, setPayruns] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [initMessage, setInitMessage] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [message, setMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (currentUser?.dbName) {
      fetchData();
    }
  }, [selectedPeriod, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (currentUser?.role === 'SUPER_ADMIN') {
        // Pour le super admin, récupérer toutes les entreprises
        const entreprisesData = await fetchEntreprises();
        const allEntreprises = entreprisesData?.data || entreprisesData || [];
        setEntreprises(allEntreprises);
        setCompanies(allEntreprises);

        // Récupérer les statistiques globales
        const { fetchGlobalStats } = await import('../services/api');
        const globalStatsData = await fetchGlobalStats();
        setGlobalStats(globalStatsData?.data || globalStatsData);

        // Pour les données détaillées, utiliser les APIs individuelles
        let allEmployees = [];
        let allPayslips = [];
        let allPayments = [];
        let allPayruns = [];

        // Pour chaque entreprise, récupérer les données
        for (const ent of allEntreprises) {
          try {
            const empData = await fetchEmployees({ entrepriseId: ent.id });
            const payslipData = await fetchPayslips({ entrepriseId: ent.id });
            const paymentData = await fetchPayments({ entrepriseId: ent.id });
            const payrunData = await fetchPayRuns({ entrepriseId: ent.id });

            // Adapter les données avec l'ID entreprise
            const adaptedEmployees = empData.map(e => ({ ...e, entrepriseId: ent.id, entrepriseNom: ent.nom }));
            const adaptedPayslips = payslipData.map(p => ({ ...p, entrepriseId: ent.id, entrepriseNom: ent.nom }));
            const adaptedPayments = paymentData.map(p => ({ ...p, entrepriseId: ent.id, entrepriseNom: ent.nom }));
            const adaptedPayruns = payrunData.map(p => ({ ...p, entrepriseId: ent.id, entrepriseNom: ent.nom }));

            allEmployees = allEmployees.concat(adaptedEmployees);
            allPayslips = allPayslips.concat(adaptedPayslips);
            allPayments = allPayments.concat(adaptedPayments);
            allPayruns = allPayruns.concat(adaptedPayruns);
          } catch (error) {
            console.warn(`Erreur lors du chargement des données pour l'entreprise ${ent.nom}:`, error);
          }
        }

        setEmployees(allEmployees);
        setPayslips(allPayslips);
        setPayments(allPayments);
        setPayruns(allPayruns);
      } else {
        // Pour les autres utilisateurs, récupérer les données de leur entreprise via l'endpoint dashboard
        const { getDashboardData } = await import('../services/api');
        const dashboardInfo = await getDashboardData();
        setDashboardData(dashboardInfo);

        // Utiliser les données du dashboard pour les statistiques et récupérer les données détaillées
        const [empRes, payslipRes, paymentRes, payrunRes] = await Promise.all([
          fetchEmployees(),
          fetchPayslips(),
          fetchPayments(),
          fetchPayRuns()
        ]);
        setEmployees(empRes || []);
        setPayslips(payslipRes || []);
        setPayments(paymentRes || []);
        setPayruns(payrunRes || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeEmployees = employees.filter(e => e.actif);
  const salaryMass = activeEmployees.reduce((sum, emp) => sum + Number(emp.tauxSalaire || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.montant), 0);

  // Utiliser les données du dashboard si disponibles
  const kpis = dashboardData?.kpis || {};
  const dashboardStats = [
    {
      title: 'Employés actifs',
      value: (kpis.activeEmployees || activeEmployees.length).toString(),
      change: '+0%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Masse salariale',
      value: ((kpis.totalSalary || salaryMass) / 1000).toFixed(0) + 'k XOF',
      change: '+0%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Montant payé',
      value: ((kpis.totalPaid || totalPaid) / 1000).toFixed(0) + 'k XOF',
      change: '+0%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Montant restant',
      value: ((kpis.remainingAmount || 0) / 1000).toFixed(0) + 'k XOF',
      change: '+0%',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  // Calcul des données pour les graphiques
  const getMonthlyPayrollData = () => {
    // Utiliser les données du dashboard si disponibles
    if (dashboardData?.salaryEvolution && dashboardData.salaryEvolution.length > 0) {
      return dashboardData.salaryEvolution.map(item => ({
        month: new Date(item.month).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: item.totalSalary
      }));
    }

    // Fallback: calculer à partir des données locales
    const monthlyData = {};
    payslips.forEach(payslip => {
      if (payslip.payRun?.periode) {
        const date = new Date(payslip.payRun.periode);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, amount: 0 };
        }
        monthlyData[monthKey].amount += Number(payslip.net || 0);
      }
    });
    return Object.values(monthlyData).slice(-6); // Derniers 6 mois
  };

  const getPaymentMethodsData = () => {
    const methodCounts = {};
    payments.forEach(payment => {
      const method = payment.mode || 'INCONNU';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return Object.entries(methodCounts).map(([name, value], index) => ({
      name: name === 'VIREMENT_BANCAIRE' ? 'Virement bancaire' :
            name === 'ORANGE_MONEY' ? 'Orange Money' :
            name === 'WAVE' ? 'Wave' :
            name === 'ESPECES' ? 'Espèces' : name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const getDepartmentData = () => {
    const deptData = {};
    employees.forEach(employee => {
      const dept = employee.poste || 'Non spécifié';
      if (!deptData[dept]) {
        deptData[dept] = { department: dept, employees: 0, payroll: 0 };
      }
      deptData[dept].employees += 1;
      deptData[dept].payroll += Number(employee.tauxSalaire || 0);
    });
    return Object.values(deptData);
  };

  const getEntrepriseStats = () => {
    if (currentUser?.role !== 'SUPER_ADMIN') return null;

    const stats = {};
    entreprises.forEach(ent => {
      const entEmployees = employees.filter(e => e.entrepriseId === ent.id);
      const entPayslips = payslips.filter(p => p.entrepriseId === ent.id);
      const entPayments = payments.filter(p => p.entrepriseId === ent.id);

      stats[ent.id] = {
        nom: ent.nom,
        employees: entEmployees.length,
        activeEmployees: entEmployees.filter(e => e.actif).length,
        totalPayroll: entPayslips.reduce((sum, p) => sum + Number(p.net || 0), 0),
        totalPayments: entPayments.length,
        paidPayslips: entPayslips.filter(p => p.status === 'PAYE').length,
      };
    });
    return stats;
  };

  const stats = {
    totalPayroll: payslips.reduce((sum, p) => sum + Number(p.net || 0), 0),
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.actif).length,
    averageSalary: employees.length > 0
      ? employees.reduce((sum, e) => sum + Number(e.tauxSalaire || 0), 0) / employees.length
      : 0,
    totalPayments: payments.length,
    paidPayslips: payslips.filter(p => p.status === 'PAYE').length,
    totalEntreprises: entreprises.length,
  };

  const entrepriseStats = getEntrepriseStats();

  const monthlyPayrollData = getMonthlyPayrollData();
  const paymentMethodsData = getPaymentMethodsData();
  const departmentData = getDepartmentData();

  return (
    <div className="overflow-hidden space-y-8">
      {initMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded flex items-center justify-between">
          <span>{initMessage}</span>
          <button
            onClick={async () => {
              try {
                const { initEntreprise } = await import('../services/api');
                await initEntreprise(entreprise?.id);
                setMessage('Entreprise initialisée avec succès !');
              } catch (error) {
                setMessage('Erreur lors de l\'initialisation: ' + error.message);
              }
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            Initialiser maintenant
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isSuper ? (user?.nom || user?.email || 'Super Admin') : (entreprise?.nom || 'Dashboard')}</h1>
          {!isSuper && <p className="text-gray-500">Vue de votre entreprise</p>}
        </div>
        <div className="flex items-center gap-4">
          {isSuper ? (
            <button onClick={() => navigate('/entreprises')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une entreprise
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  defaultValue={new Date().toISOString().slice(0, 7)}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
                <button
                  onClick={async () => {
                    try {
                      const period = selectedPeriod || new Date().toISOString().slice(0, 7);
                      const { generateMonthlyPayslips } = await import('../services/api');
                      await generateMonthlyPayslips(period);
                      setMessage(`Bulletins générés pour ${period} avec succès !`);
                      await fetchData(); // Recharger les données
                    } catch (error) {
                      setMessage('Erreur lors de la génération: ' + error.message);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                >
                  Générer bulletins
                </button>
              </div>
              <button onClick={() => navigate('/employees')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un employé
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {message}
          <button
            onClick={() => setMessage('')}
            className="float-right text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      {isSuper ? (
        globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Entreprises"
              value={globalStats.totalEntreprises?.toString() || '0'}
              change="+0%"
              changeType="positive"
              icon={Building2}
              color="purple"
            />
            <StatsCard
              title="Total Utilisateurs"
              value={globalStats.totalUsers?.toString() || '0'}
              change="+0%"
              changeType="positive"
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Total Employés"
              value={globalStats.totalEmployees?.toString() || '0'}
              change="+0%"
              changeType="positive"
              icon={Factory}
              color="green"
            />
            <StatsCard
              title="Total Bulletins"
              value={globalStats.totalPayslips?.toString() || '0'}
              change="+0%"
              changeType="positive"
              icon={DollarSign}
              color="purple"
            />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Graphiques - Ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendance de la paie mensuelle */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Tendance de la paie mensuelle</h3>
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5.2%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPayrollData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`${value.toLocaleString()} XOF`, 'Montant']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition des méthodes de paiement */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Répartition des méthodes de paiement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethodsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analyse par poste */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Analyse par poste</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="department" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => [
                name === 'payroll' ? `${value.toLocaleString()} XOF` : value,
                name === 'payroll' ? 'Paie totale' : 'Employés'
              ]}
            />
            <Legend />
            <Bar dataKey="employees" fill="#3b82f6" name="Employés" />
            <Bar dataKey="payroll" fill="#10b981" name="Paie totale (XOF)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table des rapports mensuels */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Rapports de paie mensuels</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paie brute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paie nette
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payruns.slice(0, 10).map((payrun) => {
                  const payrunPayslips = payslips.filter(p => p.payRunId === payrun.id);
                  const totalBrut = payrunPayslips.reduce((sum, p) => sum + Number(p.brut || 0), 0);
                  const totalDeductions = payrunPayslips.reduce((sum, p) => sum + Number(p.deductions || 0), 0);
                  const totalNet = payrunPayslips.reduce((sum, p) => sum + Number(p.net || 0), 0);

                  return (
                    <tr key={payrun.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payrun.periode ? new Date(payrun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payrunPayslips.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalBrut.toLocaleString()} XOF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalDeductions.toLocaleString()} XOF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {totalNet.toLocaleString()} XOF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          payrun.status === 'CLOTURE' ? 'bg-green-100 text-green-800' :
                          payrun.status === 'APPROUVE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payrun.status === 'CLOTURE' ? 'Clôturé' :
                           payrun.status === 'APPROUVE' ? 'Approuvé' :
                           'Brouillon'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
