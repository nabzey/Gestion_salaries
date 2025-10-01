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
import { logout, getCurrentUser, getEntreprise } from '../services/api';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const entreprise = getEntreprise();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Fermer le menu utilisateur lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <button
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label="3 notifications non lues">
            3
          </span>
        </button>
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
