import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, getEntreprise, changeUserRole, fetchPendingPayslipsCount, fetchPendingPayslips } from '../services/api';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const entreprise = getEntreprise();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'SUPER_ADMIN');
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationsRef = useRef(null);

  // Fermer le menu utilisateur lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notification count and pending payslips
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const count = await fetchPendingPayslipsCount();
        setNotificationCount(count);
        if (count > 0) {
          const pendingPayslips = await fetchPendingPayslips();
          setNotifications(pendingPayslips);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de notifications:', error);
        setNotificationCount(0);
        setNotifications([]);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Gestionnaire clavier pour le menu
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setShowUserMenu(false);
    }
  };

  return (
    <header
      className="bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 shadow-lg px-6 py-4 flex items-center justify-between"
      role="banner"
    >
      <div className="flex items-center space-x-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden text-white"
          aria-label="Ouvrir le menu latéral"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          {entreprise?.logo ? (
            <img
              src={entreprise.logo}
              alt={`Logo de ${entreprise.nom}`}
              className="w-8 h-8 rounded"
            />
          ) : (
            <Building className="w-8 h-8 text-white" aria-hidden="true" />
          )}
          <h1 className="text-xl font-bold text-white hidden sm:block">{entreprise?.nom || 'Gestionnaire Salaires'}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <label htmlFor="search-input" className="sr-only">Rechercher</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            id="search-input"
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 backdrop-blur-sm w-64"
            aria-describedby="search-help"
          />
          <span id="search-help" className="sr-only">Tapez pour rechercher dans l'application</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${notificationCount} notifications non lues`}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div
              ref={notificationsRef}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
              role="menu"
              aria-label="Notifications"
            >
              <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500">{notificationCount} bulletins en attente</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Aucune notification</div>
                ) : (
                  notifications.slice(0, 10).map((payslip) => (
                    <div key={payslip.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/payslips')}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{payslip.employee.nom}</p>
                          <p className="text-xs text-gray-500">Salaire: {payslip.brut} XOF</p>
                          <p className="text-xs text-gray-500">Statut: {payslip.status}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(payslip.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {notifications.length > 10 && (
                  <div className="px-4 py-3 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => navigate('/payslips')}>
                      Voir toutes les notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
            onKeyDown={handleKeyDown}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            aria-label="Menu utilisateur"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || user?.email || 'User')}&background=ffffff&color=6b46c1&size=40`}
              alt={`Avatar de ${user?.nom || user?.email || 'Utilisateur'}`}
              className="w-8 h-8 rounded-full border-2 border-white/20"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.nom || user?.email || 'Utilisateur'}</p>
              <p className="text-xs opacity-75">{entreprise?.nom || 'Entreprise'}</p>
            </div>
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
          {showUserMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
              role="menu"
              aria-label="Menu utilisateur"
              onKeyDown={handleKeyDown}
            >
              <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-100" role="none">
                  <p className="text-sm font-medium text-gray-900">{user?.nom || user?.email || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  <p className="text-xs text-gray-500">{entreprise?.nom || 'Entreprise'}</p>
                </div>
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  tabIndex={0}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>Mon Profil</span>
                </button>
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  tabIndex={0}
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span>Paramètres</span>
                </button>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Changer de rôle</label>
                    <select
                      id="role-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {(user?.role === 'SUPER_ADMIN' || (user?.role === 'ADMIN' && user?.id === 1)) && <option value="SUPER_ADMIN">Super Admin</option>}
                      <option value="ADMIN">Admin</option>
                      <option value="CAISSIER">Caissier</option>
                    </select>
                    <button
                      onClick={async () => {
                        try {
                          const res = await changeUserRole(user.id, selectedRole);
                          localStorage.setItem('accessToken', res.data.accesToken);
                          localStorage.setItem('user', JSON.stringify(res.data.user));
                          if (res.data.user.entreprise) {
                            localStorage.setItem('entreprise', JSON.stringify(res.data.user.entreprise));
                          } else {
                            localStorage.removeItem('entreprise');
                          }
                          navigate('/dashboard');
                        } catch (error) {
                          alert('Erreur lors du changement de rôle: ' + error.message);
                        }
                      }}
                      className="mt-2 w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700"
                    >
                      Changer
                    </button>
                  </div>
                )}
                <hr className="my-1 border-gray-200" role="separator" />
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                  tabIndex={0}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
