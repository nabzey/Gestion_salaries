import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useZxing } from "react-zxing";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { createEmployeePointage, fetchEmployeePointages, getCurrentUser } from "../services/api";

export default function EmployeePointage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [manualEmployeeId, setManualEmployeeId] = useState("");
  const [manualType, setManualType] = useState("ARRIVEE");
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'EMPLOYEE') {
      navigate('/login');
      return;
    }
    fetchPointages();
  }, [currentUser, navigate]);

  const fetchPointages = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeePointages();
      setPointages(data);
    } catch (err) {
      console.error('Erreur lors du chargement des pointages:', err);
    } finally {
      setLoading(false);
    }
  };

  // hook react-zxing
  const { ref } = useZxing({
    onDecodeResult(result) {
      const code = result.getText();
      setQrCode(code);
      handleScan(code);
    },
  });

  const handleScan = async (code) => {
    try {
      // Parser le QR code
      const parsed = JSON.parse(code);
      if (!parsed.employeeId) {
        throw new Error("QR code invalide");
      }

      // Créer le pointage
      const data = await createEmployeePointage({
        employeeId: parsed.employeeId,
        type: "ARRIVEE"
      });

      setMessage(
        `✅ Pointage réussi !\nEmployé: ${data.employee?.nom || parsed.name}\nType: ${data.type}\nHeure: ${new Date(
          data.heure
        ).toLocaleTimeString("fr-FR")}\n\n🔗 Les pointages sont enregistrés et consultables ci-dessous`
      );
      setMessageType("success");
      // Rafraîchir la liste des pointages
      fetchPointages();
    } catch (error) {
      setMessage(error.message || "Erreur lors du pointage");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">
                Pointages
              </h1>
              <p className="text-gray-600">Scanner votre QR code et consulter vos pointages</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Entreprise</p>
                <p className="text-sm font-medium">{currentUser.entreprise?.nom}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Scanner QR */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 text-center">
              Scanner votre QR Code
            </h2>

            {/* caméra */}
            <video ref={ref} className="w-full rounded-lg border mb-4" />

            {message && (
              <div
                className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                  messageType === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="text-sm whitespace-pre-line">{message}</div>
              </div>
            )}

            {/* Pointage manuel */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className="mr-2">📝</span>
                Pointage manuel (si QR ne fonctionne pas)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Employé
                  </label>
                  <input
                    type="number"
                    value={manualEmployeeId}
                    onChange={(e) => setManualEmployeeId(e.target.value)}
                    placeholder="Ex: 123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez l'identifiant unique de l'employé</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de pointage
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="ARRIVEE">🚪 Arrivée</option>
                    <option value="DEPART">🚶 Départ</option>
                    <option value="PAUSE_DEBUT">☕ Début de pause</option>
                    <option value="PAUSE_FIN">▶️ Fin de pause</option>
                  </select>
                </div>
                <button
                  onClick={handleManualPointage}
                  disabled={!manualEmployeeId.trim() || !manualType}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">✅</span>
                  Enregistrer pointage manuel
                </button>
              </div>
            </div>
          </div>

          {/* Section Historique des pointages */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Clock className="inline-block mr-2 h-5 w-5" />
                Mes pointages récents
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : pointages && pointages.length > 0 ? (
                <div className="space-y-3">
                  {pointages.slice(0, 10).map((pointage, index) => (
                    <div key={pointage.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {pointage.type === 'ARRIVEE' ? 'Arrivée' :
                           pointage.type === 'DEPART' ? 'Départ' :
                           pointage.type === 'PAUSE_DEBUT' ? 'Début de pause' :
                           pointage.type === 'PAUSE_FIN' ? 'Fin de pause' : pointage.type}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(pointage.heure).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(pointage.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun pointage enregistré</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleManualPointage() {
    if (!manualEmployeeId.trim()) {
      setMessage("Veuillez entrer l'ID de l'employé");
      setMessageType("error");
      return;
    }

    try {
      const data = await createEmployeePointage({
        employeeId: parseInt(manualEmployeeId),
        type: manualType
      });

      setMessage(
        `✅ Pointage réussi !\nEmployé: ${data.employee?.nom || 'ID ' + manualEmployeeId}\nType: ${manualType}\nHeure: ${new Date(
          data.heure
        ).toLocaleTimeString("fr-FR")}\n\n🔗 Les pointages sont enregistrés et consultables ci-dessous`
      );
      setMessageType("success");
      setManualEmployeeId("");
      // Rafraîchir la liste des pointages
      fetchPointages();
    } catch (error) {
      setMessage(error.message || "Erreur lors du pointage");
      setMessageType("error");
    }
  }
}
