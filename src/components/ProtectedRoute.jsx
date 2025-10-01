import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  return Boolean(token);
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
