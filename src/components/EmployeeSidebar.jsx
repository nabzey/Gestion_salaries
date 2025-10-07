import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  User
} from 'lucide-react';

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/employee-dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/employee-dashboard'
    },
    {
      name: 'Mon Profil',
      path: '/employee-profile',
      icon: User,
      current: location.pathname === '/employee-profile'
    },
    {
      name: 'Pointages',
      path: '/employee-pointage',
      icon: Clock,
      current: location.pathname === '/employee-pointage'
    },
    {
      name: 'Congés',
      path: '/conges',
      icon: Calendar,
      current: location.pathname === '/conges'
    },
    {
      name: 'Bulletins',
      path: '/employee-payslips',
      icon: FileText,
      current: location.pathname === '/employee-payslips'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}