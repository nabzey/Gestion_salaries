import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  return Boolean(token);
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    const currentPath = window.location.pathname;
    const isEmployeeRoute = currentPath.startsWith('/employee-');
    return <Navigate to={isEmployeeRoute ? "/employee-login" : "/login"} replace />;
  }
  return children;
}
