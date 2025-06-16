import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";

export default function Patient() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("upload");
  const [fileName, setFileName] = useState("No file chosen");
  const [historyText, setHistoryText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Manual input states
  const [manualData, setManualData] = useState({
    condition: "",
    medications: "",
    allergies: ""
  });

  // Checkbox states
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    deidentify: false
  });

  const handleFileChange = (e) => {
    setFileName(e.target.files[0]?.name || "No file chosen");
  };

  const handleManualDataChange = (field, value) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setCheckboxes(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const validateForm = () => {
    // Check if both checkboxes are checked (only for history and manual methods)
    if ((method === "history" || method === "manual") && (!checkboxes.terms || !checkboxes.deidentify)) {
      alert("Please accept the Terms and Conditions and enable De-Identify Data to continue.");
      return false;
    }
    return true;
  };

  const handleFindTrials = async (inputText = null) => {
    if (!validateForm()) {
      return;
    }

    let textToSend = inputText;
    
    if (!textToSend) {
      if (method === "history") {
        textToSend = historyText;
      } else if (method === "manual") {
        textToSend = `Medical Condition: ${manualData.condition}. Medications: ${manualData.medications}. Allergies: ${manualData.allergies}`;
      }
    }

    if (!textToSend || !textToSend.trim()) {
      alert("Please enter a valid description.");
      return;
    }

    setLoading(true);
    try {
      // Use environment-aware API URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      // Navigate to results page with the data
      navigate('/results', { 
        state: { 
          results: data.matches || [],
          patientData: textToSend
        } 
      });

    } catch (err) {
      console.error("API Error:", err);
      alert("Error fetching matches. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const renderUploadMethod = () => {
    switch (method) {
      case "history":
        return (
          <div className="mt-6 space-y-4">
            <textarea
              placeholder="Enter complete medical history (e.g., Patient has heart disease, taking beta blockers, no known allergies)..."
              value={historyText}
              onChange={(e) => setHistoryText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[150px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => handleFindTrials()}
              className="bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white px-6 py-3 rounded-lg w-full transition hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Finding Trials..." : "Find Matching Trials"}
            </button>
          </div>
        );
      case "manual":
        return (
          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Medical Condition (e.g., Heart Disease, Diabetes)"
              value={manualData.condition}
              onChange={(e) => handleManualDataChange("condition", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Current Medications (e.g., Metformin, Lisinopril)"
              value={manualData.medications}
              onChange={(e) => handleManualDataChange("medications", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Known Allergies (e.g., Penicillin, None)"
              value={manualData.allergies}
              onChange={(e) => handleManualDataChange("allergies", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => handleFindTrials()}
              className="bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white px-6 py-3 rounded-lg w-full transition hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Finding Trials..." : "Find Matching Trials"}
            </button>
          </div>
        );
      case "upload":
        return (
          <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 mt-6 text-center bg-white shadow-sm">
            <label className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <UploadCloud size={48} className="text-purple-400" />
                <span className="font-semibold text-gray-600 mt-2">Drag & Drop or Browse</span>
                <span className="text-sm text-gray-500 mt-1">Upload medical records (PDF, DOC, TXT)</span>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
              />
              <div className="mt-4 bg-white border border-gray-300 rounded-md px-4 py-2 w-full max-w-lg mx-auto text-sm text-gray-600">
                <strong>Choose File</strong> &nbsp; {fileName}
              </div>
            </label>
            <div className="mt-4">
              <button className="bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white px-6 py-3 rounded-lg hover:opacity-90 transition">
                Process File
              </button>
              <p className="text-xs text-gray-500 mt-2">File upload processing not yet implemented</p>
            </div>
          </div>
        );
      case "mychart":
        return (
          <div className="text-center text-gray-700 mt-6">
            <p className="mb-4">You'll be redirected to securely log in to your MyChart account.</p>
            <button className="bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white px-6 py-3 rounded-lg hover:opacity-90 transition">
              Login via MyChart
            </button>
            <p className="text-xs text-gray-500 mt-2">MyChart integration not yet implemented</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 flex flex-col items-center">
      {/* Progress Bar */}
      <div className="w-full max-w-5xl mb-10">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-[#5F5AE8]"></div>
          <div className="flex-1 h-2 bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7]"></div>
          <div className="w-7 h-7 rounded-full bg-gray-300"></div>
          <div className="flex-1 h-2 bg-gray-300"></div>
          <div className="w-7 h-7 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span className="text-black font-semibold">Upload EHR</span>
          <span>View Trials</span>
          <span>Connect with Trials</span>
        </div>
      </div>

      {/* Upload Box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl bg-white rounded-2xl p-10 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-2">Upload Your Health Records</h2>
        <p className="text-sm text-gray-500 mb-6">Secure and HIPAA-Compliant</p>

        {/* Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {["history", "manual", "upload", "mychart"].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`py-2 px-4 rounded-lg border transition-all ${
                method === m
                  ? "bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {{
                history: "Enter Patient History",
                manual: "Manually Enter",
                upload: "Upload EHR",
                mychart: "Login via MyChart",
              }[m]}
            </button>
          ))}
        </div>

        {renderUploadMethod()}

        {/* Checkboxes - Only show for history and manual methods */}
        {(method === "history" || method === "manual") && (
          <>
            <div className="flex items-start space-x-2 mt-6">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1" 
                checked={checkboxes.terms}
                onChange={(e) => handleCheckboxChange("terms", e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree with <span className="font-semibold text-purple-600">Terms and Conditions</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            <div className="flex items-start space-x-2 mt-2 mb-6">
              <input 
                type="checkbox" 
                id="deidentify" 
                className="mt-1" 
                checked={checkboxes.deidentify}
                onChange={(e) => handleCheckboxChange("deidentify", e.target.checked)}
              />
              <label htmlFor="deidentify" className="text-sm text-gray-700">
                De-Identify my Data
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            
            {/* Validation Message */}
            {(!checkboxes.terms || !checkboxes.deidentify) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Required:</span> Please check both boxes above to proceed with finding trials.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Footer */}
      <div className="mt-12 text-sm text-gray-500 flex space-x-4">
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Support</a>
        <a href="#" className="hover:underline">FAQs</a>
      </div>
    </div>
  );
}
