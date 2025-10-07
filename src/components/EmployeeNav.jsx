import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Calendar } from 'lucide-react';

export default function EmployeeNav() {
  const navigate = useNavigate();

  return (
    <div className="mt-8 bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/employee-pointage')}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Timer className="mr-2 h-4 w-4" />
            Pointer mon arrivée/départ
          </button>
          <button
            onClick={() => navigate('/conges')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Demander des congés
          </button>
        </div>
      </div>
    </div>
  );
}