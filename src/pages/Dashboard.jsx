import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import EmployeeTable from '../components/EmployeeTable';
import { Users, DollarSign, CheckCircle, Building2, Plus, Factory } from 'lucide-react';
import { getCurrentUser, getEntreprise, fetchEmployees, fetchEntreprises, generateMonthlyPayslips, fetchPayslips } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const user = getCurrentUser();
  const entreprise = getEntreprise();
  const isSuper = user?.role === 'SUPER_ADMIN' && !user?.dbName;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [initMessage, setInitMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    async function load() {
      if (isSuper) {
        try {
          setLoadingCompanies(true);
          const data = await fetchEntreprises();
          setCompanies(data || []);
        } catch (error) {
          console.error('Erreur chargement entreprises:', error);
          setCompanies([]);
        } finally {
          setLoadingCompanies(false);
        }
      } else {
        try {
          const [employeesData, payslipsData] = await Promise.all([
            fetchEmployees(),
            fetchPayslips()
          ]);
          setEmployees(employeesData.map(e => ({
            name: e.nom,
            company: entreprise?.nom || 'Mon Entreprise',
            position: e.poste,
            salary: String(e.tauxSalaire),
            status: e.actif ? 'Actif' : 'Inactif',
            id: e.id
          })));
          setPayslips(Array.isArray(payslipsData) ? payslipsData : []);
        } catch (error) {
          console.error('Erreur chargement données:', error);
          setEmployees([]);
          setPayslips([]);
          if (error.message.includes('BD tenant non trouvée')) {
            setInitMessage('Entreprise non initialisée. Veuillez aller à la page Entreprises et cliquer sur "Initialiser données".');
          }
        }
      }
    }
    load();
  }, [isSuper, entreprise?.nom]);

  const commonStats = [
    { title: 'Employés actifs', value: employees.filter(e => e.status === 'Actif').length.toString(), change: '+0%', changeType: 'positive', icon: Users, color: 'blue' },
    { title: 'Masse salariale', value: '—', change: '+0%', changeType: 'positive', icon: DollarSign, color: 'purple' },
    { title: 'Montant payé', value: '—', change: '+0%', changeType: 'positive', icon: CheckCircle, color: 'purple' }
  ];

  const adminStats = commonStats;

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
                alert('Entreprise initialisée avec succès ! Veuillez recharger la page.');
                window.location.reload();
              } catch (error) {
                alert('Erreur lors de l\'initialisation: ' + error.message);
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
                      await generateMonthlyPayslips(period);
                      alert(`Bulletins générés pour ${period} avec succès !`);
                      window.location.reload();
                    } catch (error) {
                      alert('Erreur lors de la génération: ' + error.message);
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
          {adminStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Content */}
      {isSuper ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Entreprises</h2>
          {loadingCompanies ? (
            <div className="text-sm text-gray-500">Chargement des entreprises...</div>
          ) : (companies || []).length === 0 ? (
            <div className="text-sm text-gray-500">Aucune entreprise</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(companies || []).map((c) => (
                <div key={c.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <img src={c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nom)}&background=6a0dad&color=fff`} className="w-12 h-12 rounded mr-3" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{c.nom}</h3>
                      <p className="text-sm text-gray-500">{c.adresse || 'Adresse non spécifiée'}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Devise:</span>
                      <span className="font-medium">{c.paiement}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Utilisateurs:</span>
                      <span className="font-medium">{c._count?.users || c.users?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Employés:</span>
                      <span className="font-medium">{c._count?.employees || 0}</span>
                    </div>
                  </div>
                  <button
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    onClick={() => navigate(`/entreprises/${c.id}`)}
                  >
                    Ouvrir
                  </button>
                </div>
              ))}
            </div>
          )}
          {!loadingCompanies && globalStats && (
            <div className="mt-8">
              <ChartCard
                title="Répartition des employés par entreprise"
                data={(companies || []).map(c => ({
                  name: c.nom,
                  value: c._count?.employees || 0
                }))}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Évolution des salaires" data={[]} />
            <ChartCard title="Répartition par département" data={[]} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Évolutions de l'entreprise</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                <div className="text-sm text-gray-600">Employés actifs</div>
                <div className="text-xs text-green-600 mt-1">+0 ce mois</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {employees.reduce((sum, emp) => sum + parseFloat(emp.salary.replace(/[^0-9.-]+/g, '')), 0).toLocaleString()} XOF
                </div>
                <div className="text-sm text-gray-600">Masse salariale</div>
                <div className="text-xs text-green-600 mt-1">+0% ce mois</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Paiements ce mois</div>
                <div className="text-xs text-green-600 mt-1">+0 ce mois</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Informations des employés</h2>
            <div className="space-y-4">
              {employees.map((employee, index) => {
                const employeePayslips = (Array.isArray(payslips) ? payslips : []).filter(p => p.employeeId === employee.id);
                const latestPayslip = employeePayslips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                const totalPaid = employeePayslips.reduce((sum, p) => sum + Number(p.montant || 0), 0);
                const remaining = latestPayslip ? Number(latestPayslip.net) - totalPaid : 0;

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3
                          className="font-medium text-lg cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowEmployeeModal(true);
                          }}
                        >
                          {employee.name}
                        </h3>
                        <p className="text-gray-600">{employee.position}</p>
                        <p className="text-sm text-gray-500">Entreprise: {employee.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{employee.salary} XOF</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </div>
                    </div>

                    {latestPayslip && (
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="font-medium text-sm mb-2">Dernier bulletin de paie</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Brut:</span>
                            <span className="font-medium ml-1">{latestPayslip.brut} XOF</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Déductions:</span>
                            <span className="font-medium ml-1">{latestPayslip.deductions} XOF</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Net:</span>
                            <span className="font-medium ml-1">{latestPayslip.net} XOF</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Statut:</span>
                            <span className={`font-medium ml-1 ${
                              latestPayslip.status === 'PAYE' ? 'text-green-600' :
                              latestPayslip.status === 'PARTIEL' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {latestPayslip.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total payé:</span>
                            <span className="font-medium">{totalPaid} XOF</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Restant à payer:</span>
                            <span className={`font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {remaining} XOF
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {employeePayslips.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">Historique des paiements</h4>
                        <div className="space-y-1">
                          {employeePayslips.slice(0, 3).map((payment, idx) => (
                            <div key={idx} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                              <span>{new Date(payment.date).toLocaleDateString('fr-FR')}</span>
                              <span className="font-medium">{payment.montant} XOF</span>
                              <span className="text-gray-500">{payment.mode}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal employé */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Détails de l'employé</h2>
            <div className="space-y-3">
              <div>
                <label className="font-medium">Nom:</label>
                <p>{selectedEmployee.name}</p>
              </div>
              <div>
                <label className="font-medium">Poste:</label>
                <p>{selectedEmployee.position}</p>
              </div>
              <div>
                <label className="font-medium">Salaire:</label>
                <p>{selectedEmployee.salary} XOF</p>
              </div>
              <div>
                <label className="font-medium">Statut:</label>
                <p>{selectedEmployee.status}</p>
              </div>
              <div>
                <label className="font-medium">Entreprise:</label>
                <p>{selectedEmployee.company}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
