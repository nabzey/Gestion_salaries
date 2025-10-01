import { useState } from 'react';
import { login as loginApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('superadmin@example.com');
  const [password, setPassword] = useState('superadmin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Assurez-vous que 'loginApi' est importé et fonctionne correctement
      await loginApi(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Utilise un message d'erreur par défaut si la propriété 'message' n'existe pas
      setError(err.message || "Erreur de connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-md p-8 border border-gray-200 w-full mx-4 sm:mx-0">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Connexion</h1>
        <p className="text-gray-500 text-center mt-2">Super Admin / Admin / Caissier</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition duration-150 ease-in-out"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p>Comptes démo :</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Super Admin: superadmin@example.com / superadmin123</li>
            <li>Admin: admin@demo.com / admin123</li>
            <li>Caissier: caissier@demo.com / caissier123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}