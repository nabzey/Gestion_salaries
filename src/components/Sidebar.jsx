import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, FileText, CreditCard, Clock, BarChart3 } from 'lucide-react';

export default function Sidebar() {

  const menu = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
    { to: '/employees', label: 'Employés', icon: <Users className="w-5 h-5 mr-2" /> },
    { to: '/pointages', label: 'Pointages', icon: <Clock className="w-5 h-5 mr-2" /> },
    { to: '/payruns', label: 'Cycles de Paie', icon: <Calendar className="w-5 h-5 mr-2" /> },
    { to: '/payslips', label: 'Bulletins', icon: <FileText className="w-5 h-5 mr-2" /> },
    { to: '/payments', label: 'Paiements', icon: <CreditCard className="w-5 h-5 mr-2" /> },
    // Suppression de la gestion des utilisateurs de la sidebar comme demandé
  ];

  return (
    <aside className="w-80 bg-gradient-to-b from-purple-300 via-purple-400 to-indigo-500 text-white  flex flex-col shadow-lg">
      <div className="p-10 font-extrabold text-3xl tracking-wide flex items-center space-x-4">
        <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center text-indigo-600 font-black text-2xl">G</div>
        <span>Gestion Salaires</span>
      </div>
      <nav className="flex-1 px-8">
        <ul className="space-y-6 mt-12">
          {menu.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-5 py-4 rounded-2xl transition-colors duration-300 ${
                    isActive ? 'bg-white bg-opacity-25 font-semibold' : 'hover:bg-white hover:bg-opacity-20'
                  }`
                }
              >
                {link.icon}
                <span className="ml-4 text-lg">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-8 border-t border-white border-opacity-30">
        <button className="w-full text-left text-base hover:bg-white hover:bg-opacity-25 rounded-lg px-5 py-3 transition">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
