import React from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function EmployeeDashboardContent({
  dashboardData,
  currentUser
}) {
  const { workedHours, absences, schedule, currentMonth, currentYear } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Heures travaillées ({currentMonth}/{currentYear})
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {workedHours || 0} h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Jours d'absence ({currentMonth}/{currentYear})
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {absences?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Statut
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Actif
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emploi du temps et Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Emploi du temps */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <CalendarDays className="inline-block mr-2 h-5 w-5" />
              Emploi du temps
            </h3>
            <div className="space-y-3">
              {schedule && Object.entries(schedule).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {day === 'monday' ? 'Lundi' :
                     day === 'tuesday' ? 'Mardi' :
                     day === 'wednesday' ? 'Mercredi' :
                     day === 'thursday' ? 'Jeudi' :
                     day === 'friday' ? 'Vendredi' :
                     day === 'saturday' ? 'Samedi' : 'Dimanche'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {hours ? `${hours.start} - ${hours.end}` : 'Repos'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Absences récentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <AlertCircle className="inline-block mr-2 h-5 w-5" />
              Absences récentes
            </h3>
            {absences && absences.length > 0 ? (
              <div className="space-y-3">
                {absences.slice(0, 5).map((absence, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm text-gray-900">
                      {new Date(absence.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Absent
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune absence ce mois-ci</p>
            )}
          </div>
        </div>
      </div>


      {/* Ajout du QR Code employé */}
      <div className="mt-12 bg-white p-6 max-w-sm mx-auto rounded shadow text-center">
        <h2 className="text-lg font-semibold mb-4">Mon QR Code</h2>
        <QRCodeSVG
          value={currentUser.nom.toString()}  // encode juste le matricule/id
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
        <p className="mt-2 text-gray-700">
          Présentez ce QR Code pour votre pointage
        </p>
      </div>
    </div>
  );
}