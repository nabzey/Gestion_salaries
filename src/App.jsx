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
import Users from './pages/Users';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
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
