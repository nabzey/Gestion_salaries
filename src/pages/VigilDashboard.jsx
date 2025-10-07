import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Scan, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { createPointage } from '../services/api';
import { getCurrentUser } from '../services/api';

export default function VigilDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const [error, setError] = useState('');

  // Redirect if not vigil
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'VIGIL') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleScan = async (result) => {
    if (result) {
      try {
        const qrData = JSON.parse(result);
        if (qrData.type === 'employee_pointage' && qrData.employeeId && qrData.name) {
          setScanResult({ employeeId: qrData.employeeId, name: qrData.name });
          setScanning(false);
        } else {
          setError('QR code invalide');
        }
      } catch (err) {
        setError('Erreur lors de la lecture du QR code');
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    setError('Erreur de caméra');
  };

  const handleConfirmPointage = async (type) => {
    if (!scanResult) return;

    try {
      setError('');
      await createPointage({
        employeeId: scanResult.employeeId,
        type: type
      });

      setLastScanned({
        name: scanResult.name,
        type: type,
        time: new Date().toLocaleTimeString('fr-FR')
      });

      setScanResult(null);
      setTimeout(() => setLastScanned(null), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors du pointage');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setError('');
  };

  const stopScanning = () => {
    setScanning(false);
  };

  if (!currentUser || currentUser.role !== 'VIGIL') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                ← Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Pointage des Employés</h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Scannez les QR codes des employés pour enregistrer leurs pointages
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Scanner QR Code
              </h3>

              {!scanning ? (
                <div className="text-center">
                  <QrCode className="mx-auto h-24 w-24 text-gray-400 mb-4" />
                  <button
                    onClick={startScanning}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Commencer le scan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Fonctionnalité de scan QR en développement.
                      <br />
                      Pour tester, entrez manuellement le code QR d'un employé :
                    </p>
                    <input
                      type="text"
                      placeholder='Ex: {"employeeId":1,"name":"Jean Dupont","type":"employee_pointage"}'
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          try {
                            handleScan(e.target.value.trim());
                          } catch (err) {
                            setError('Format JSON invalide');
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={stopScanning}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Arrêter le scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Résultat du scan
              </h3>

              {scanResult ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Employé détecté: {scanResult.name}
                        </p>
                        <p className="text-sm text-green-700">
                          ID: {scanResult.employeeId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Type de pointage:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleConfirmPointage('ARRIVEE')}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Arrivée
                      </button>
                      <button
                        onClick={() => handleConfirmPointage('DEPART')}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Départ
                      </button>
                      <button
                        onClick={() => handleConfirmPointage('PAUSE_DEBUT')}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Début Pause
                      </button>
                      <button
                        onClick={() => handleConfirmPointage('PAUSE_FIN')}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Fin Pause
                      </button>
                    </div>
                  </div>
                </div>
              ) : lastScanned ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">
                        Pointage enregistré
                      </p>
                      <p className="text-sm text-blue-700">
                        {lastScanned.name} - {lastScanned.type} à {lastScanned.time}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scan className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun QR code scanné</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Scannez un QR code d'employé pour continuer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Instructions
            </h3>
            <div className="prose prose-sm text-gray-600">
              <ul className="list-disc pl-5 space-y-1">
                <li>Cliquez sur "Commencer le scan" pour activer la caméra</li>
                <li>Présentez le QR code d'un employé devant la caméra</li>
                <li>Sélectionnez le type de pointage approprié</li>
                <li>Le pointage sera automatiquement enregistré dans le système</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
