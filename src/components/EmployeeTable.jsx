import React from 'react';

export default function EmployeeTable({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniers employés</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Entreprise</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Poste</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Salaire</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((employee, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{employee.name}</td>
                <td className="py-3 px-4">{employee.company}</td>
                <td className="py-3 px-4">{employee.position}</td>
                <td className="py-3 px-4">{employee.salary}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
