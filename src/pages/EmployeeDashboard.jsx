import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  getCurrentUser,
  fetchEmployeeDashboard
} from '../services/api';
import EmployeeSidebar from '../components/EmployeeSidebar';
import EmployeeNav from '../components/EmployeeNav';
import EmployeeDashboardContent from '../components/EmployeeDashboardContent';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [dashboardData, setDashboardData] = useState(null);
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
      const dashboardData = await fetchEmployeeDashboard();
      setDashboardData(dashboardData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
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

  const { workedHours, absences, schedule, currentMonth, currentYear } = dashboardData || {};

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
                ← deconnexion
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour, {currentUser.nom}
              </h1>
              <p className="text-gray-600">{currentUser.poste}</p>
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
            <EmployeeDashboardContent
              dashboardData={dashboardData}
              currentUser={currentUser}
            />
            <EmployeeNav />
          </div>
        </div>
      </div>
    </div>
  );
}
