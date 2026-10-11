import { useState } from "react";
import ChatWindow from "./ChatWindow";

const QUICK_SYMPTOMS = [
  "Headache", "Fever", "Nausea", "Fatigue", "Chest pain",
  "Shortness of breath", "Sore throat", "Cough", "Stomach ache",
  "Dizziness", "Rash", "Back pain", "Joint pain", "Vomiting",
];

export default function App() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [started, setStarted] = useState(false);

  if (started) {
    return <ChatWindow age={age} gender={gender} quickSymptoms={QUICK_SYMPTOMS} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🩺</div>
        <h1 className="text-4xl font-bold text-white mb-2">MediBot</h1>
        <p className="text-gray-400 text-lg max-w-md">
          AI-powered symptom checker. Describe how you feel and get instant triage guidance.
        </p>
        <p className="text-yellow-500 text-sm mt-2 font-medium">
          ⚠ Not a medical diagnosis — always consult a real doctor.
        </p>
      </div>

      {/* Optional Profile */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mb-6">
        <h2 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wider">
          Optional: Your Profile (for better results)
        </h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-gray-400 text-xs mb-1 block">Age</label>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-400 text-xs mb-1 block">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStarted(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-3 rounded-xl text-lg transition-colors"
      >
        Start Symptom Check →
      </button>
    </div>
  );
}
