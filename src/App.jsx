import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Entreprises from './pages/Entreprises';
import Employees from './pages/Employees';
import EntrepriseDetails from './pages/EntrepriseDetails';
import PayRuns from './pages/PayRuns';
import Payslips from './pages/Payslips';
import Payments from './pages/Payments';
import Pointages from './pages/Pointages';
import EmployeePointage from './pages/EmployeePointage';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeePayslips from './pages/EmployeePayslips';
import EmployeePointages from './pages/EmployeePointages';
import Conges from './pages/Conges';
import Users from './pages/Users';
import VigilDashboard from './pages/VigilDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route
          path="/vigil-dashboard"
          element={
            <ProtectedRoute>
              <VigilDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-profile"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-pointage"
          element={
            <ProtectedRoute>
              <EmployeePointage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conges"
          element={
            <ProtectedRoute>
              <Conges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-payslips"
          element={
            <ProtectedRoute>
              <EmployeePayslips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-pointages"
          element={
            <ProtectedRoute>
              <EmployeePointages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/entreprises" element={<Entreprises />} />
                  <Route path="/entreprises/:id" element={<EntrepriseDetails />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/payruns" element={<PayRuns />} />
                  <Route path="/payslips" element={<Payslips />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/pointages" element={<Pointages />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
  )
}

export default App
