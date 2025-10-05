import React, { useState } from "react";
import { useZxing } from "react-zxing";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createPointage } from "../services/api";

export default function EmployeePointage() {
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [manualEmployeeId, setManualEmployeeId] = useState("");
  const [manualType, setManualType] = useState("ARRIVEE");

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
      const data = await createPointage({
        employeeId: parsed.employeeId,
        type: "ARRIVEE"
      });

      setMessage(
        `✅ Pointage réussi !\nEmployé: ${data.employee?.nom || parsed.name}\nType: ${data.type}\nHeure: ${new Date(
          data.heure
        ).toLocaleTimeString("fr-FR")}\n\n🔗 Les pointages sont enregistrés et consultables dans la section Pointages`
      );
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Erreur lors du pointage");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Scanner votre QR Code
        </h1>

        {/* caméra */}
        <video ref={ref} className="w-full rounded-lg border" />

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
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
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
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
    </div>
  );

  async function handleManualPointage() {
    if (!manualEmployeeId.trim()) {
      setMessage("Veuillez entrer l'ID de l'employé");
      setMessageType("error");
      return;
    }

    try {
      const data = await createPointage({
        employeeId: parseInt(manualEmployeeId),
        type: manualType
      });

      setMessage(
        `✅ Pointage réussi !\nEmployé: ${data.employee?.nom || 'ID ' + manualEmployeeId}\nType: ${manualType}\nHeure: ${new Date(
          data.heure
        ).toLocaleTimeString("fr-FR")}\n\n🔗 Les pointages sont enregistrés et consultables dans la section Pointages`
      );
      setMessageType("success");
      setManualEmployeeId("");
    } catch (error) {
      setMessage(error.message || "Erreur lors du pointage");
      setMessageType("error");
    }
  }
}
