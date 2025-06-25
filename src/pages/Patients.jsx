import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Brain, Loader2 } from "lucide-react";

export default function Patient() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("history");
  const [historyText, setHistoryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  
  const [manualData, setManualData] = useState({
    age: "",
    gender: "",
    condition: "",
    medications: "",
    familyConditions: "",
    diagnosisDate: "",
    diseaseStatus: "",
    priorTreatments: [],
    testProcedure: "",
    testResult: "",
    city: "",
    state: "",
    travelDistance: "",
    drugAllergies: "",
    ethnicity: "",
    height: "",
    weight: "",
    comorbidities: [],
    otherComorbidities: ""
  });

  const [otherPriorTreatment, setOtherPriorTreatment] = useState("");
  const [otherComorbidity, setOtherComorbidity] = useState("");

  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    deidentify: false
  });

  const handleManualDataChange = (field, value) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriorTreatmentChange = (treatment) => {
    setManualData(prev => ({
      ...prev,
      priorTreatments: prev.priorTreatments.includes(treatment)
        ? prev.priorTreatments.filter(t => t !== treatment)
        : [...prev.priorTreatments, treatment]
    }));
  };

  const handleComorbidityChange = (comorbidity) => {
    setManualData(prev => ({
      ...prev,
      comorbidities: prev.comorbidities.includes(comorbidity)
        ? prev.comorbidities.filter(c => c !== comorbidity)
        : [...prev.comorbidities, comorbidity]
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setCheckboxes(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const validateForm = () => {
    if ((method === "history" || method === "manual") && (!checkboxes.terms || !checkboxes.deidentify)) {
      alert("Please accept the Terms and Conditions and enable De-Identify Data to continue.");
      return false;
    }
    return true;
  };

  const handleFindTrials = async (inputText = null) => {
    console.log('handleFindTrials called with method:', method);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    let textToSend = inputText;
    
    if (!textToSend) {
      if (method === "history") {
        textToSend = historyText;
        console.log('Using history text:', textToSend);
      } else if (method === "manual") {
        const priorTreatmentsText = manualData.priorTreatments.length > 0 
          ? manualData.priorTreatments.join(", ") + (otherPriorTreatment ? `, ${otherPriorTreatment}` : "")
          : "none";
        
        const comorbiditiesText = manualData.comorbidities.length > 0
          ? manualData.comorbidities.join(", ") + (otherComorbidity ? `, ${otherComorbidity}` : "")
          : "none";

        textToSend = `I am ${manualData.age} years old and I am ${manualData.gender}. I am looking for a clinical trial for ${manualData.condition}. I currently take ${manualData.medications || "no medications"}. I have a family history of ${manualData.familyConditions || "no family history"}. I was diagnosed in ${manualData.diagnosisDate} and am currently in ${manualData.diseaseStatus} status. I previously received ${priorTreatmentsText}. I had ${manualData.testProcedure || "no specific tests"} which showed ${manualData.testResult || "no specific results"}. I live in ${manualData.city}, ${manualData.state} and am willing to travel up to ${manualData.travelDistance}. I have ${manualData.drugAllergies || "no known drug allergies"}. My ethnicity is ${manualData.ethnicity}. My height is ${manualData.height} and my weight is ${manualData.weight} lbs. I have ${comorbiditiesText} as comorbidities.`;
        console.log('Generated text from form:', textToSend);
      }
    }

    if (!textToSend || !textToSend.trim()) {
      console.log('No text to send');
      alert("Please enter a valid description.");
      return;
    }

    console.log('Starting matching process...');
    setLoading(true);
    setShowLoadingPage(true);
    
    try {
      console.log('Calling backend for BERT matching...');
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiUrl}/bert-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientDescription: textToSend }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error(`Failed to get matches: ${response.status} ${errorText}`);
      }

      const matches = await response.json();
      
      console.log('Final matches from API:', matches.length);
      
      navigate('/results', { 
        state: { 
          results: matches || [],
          patientData: textToSend
        } 
      });

    } catch (err) {
      console.error("Matching Error:", err);
      alert("Error finding matches. Please try again.");
    } finally {
      setLoading(false);
      setShowLoadingPage(false);
    }
  };

  // Loading Page Component
  if (showLoadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Clinical Trials</h2>
          <p className="text-gray-600 mb-6">Analyzing your information and matching with available trials...</p>
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Brain size={20} />
            <span className="text-sm">AI-powered matching in progress</span>
          </div>
        </div>
      </div>
    );
  }

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
          </div>
        );
      case "manual":
        return (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={manualData.age}
                  onChange={(e) => handleManualDataChange("age", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={manualData.gender}
                  onChange={(e) => handleManualDataChange("gender", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <input
                type="text"
                placeholder="e.g., Heart Disease, Diabetes, Cancer"
                value={manualData.condition}
                onChange={(e) => handleManualDataChange("condition", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
              <input
                type="text"
                placeholder="e.g., Metformin, Lisinopril, Aspirin"
                value={manualData.medications}
                onChange={(e) => handleManualDataChange("medications", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family History</label>
              <input
                type="text"
                placeholder="e.g., Heart disease, Diabetes, Cancer"
                value={manualData.familyConditions}
                onChange={(e) => handleManualDataChange("familyConditions", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis Date</label>
                <input
                  type="month"
                  value={manualData.diagnosisDate}
                  onChange={(e) => handleManualDataChange("diagnosisDate", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disease Status</label>
                <select
                  value={manualData.diseaseStatus}
                  onChange={(e) => handleManualDataChange("diseaseStatus", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="remission">Remission</option>
                  <option value="relapsed">Relapsed</option>
                  <option value="refractory">Refractory</option>
                  <option value="stable">Stable</option>
                  <option value="progressing">Progressing</option>
                  <option value="newly diagnosed">Newly Diagnosed</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prior Treatments</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['surgery', 'chemotherapy', 'radiation therapy', 'immunotherapy', 'targeted therapy', 'stem cell transplant'].map(treatment => (
                  <label key={treatment} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={manualData.priorTreatments.includes(treatment)}
                      onChange={() => handlePriorTreatmentChange(treatment)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{treatment}</span>
                  </label>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other treatments"
                value={otherPriorTreatment}
                onChange={(e) => setOtherPriorTreatment(e.target.value)}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test/Procedure</label>
                <input
                  type="text"
                  placeholder="e.g., MRI, Biopsy, Blood test"
                  value={manualData.testProcedure}
                  onChange={(e) => handleManualDataChange("testProcedure", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Result</label>
                <input
                  type="text"
                  placeholder="e.g., MRD-positive, FLT3 mutation"
                  value={manualData.testResult}
                  onChange={(e) => handleManualDataChange("testResult", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={manualData.city}
                  onChange={(e) => handleManualDataChange("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={manualData.state}
                  onChange={(e) => handleManualDataChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Distance</label>
                <select
                  value={manualData.travelDistance}
                  onChange={(e) => handleManualDataChange("travelDistance", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select distance</option>
                  <option value="25 mi">25 mi</option>
                  <option value="50 mi">50 mi</option>
                  <option value="100 mi">100 mi</option>
                  <option value="250 mi">250 mi</option>
                  <option value="nationwide">Nationwide</option>
                  <option value="specify region">Specify region</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drug Allergies</label>
                <select
                  value={manualData.drugAllergies}
                  onChange={(e) => handleManualDataChange("drugAllergies", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="no known drug allergies">No known drug allergies</option>
                  <option value="specify allergies">Specify allergies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Race/Ethnicity</label>
                <select
                  value={manualData.ethnicity}
                  onChange={(e) => handleManualDataChange("ethnicity", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select ethnicity</option>
                  <option value="White">White</option>
                  <option value="Black or African American">Black or African American</option>
                  <option value="Asian">Asian</option>
                  <option value="Hispanic or Latino">Hispanic or Latino</option>
                  <option value="Native American">Native American</option>
                  <option value="Pacific Islander">Pacific Islander</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  placeholder="e.g., 5'8&quot;"
                  value={manualData.height}
                  onChange={(e) => handleManualDataChange("height", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  placeholder="Enter weight in pounds"
                  value={manualData.weight}
                  onChange={(e) => handleManualDataChange("weight", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comorbidities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['diabetes', 'hypertension', 'chronic kidney disease', 'asthma', 'obesity', 'COPD'].map(comorbidity => (
                  <label key={comorbidity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={manualData.comorbidities.includes(comorbidity)}
                      onChange={() => handleComorbidityChange(comorbidity)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{comorbidity}</span>
                  </label>
                ))}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualData.comorbidities.includes('no major comorbidities')}
                    onChange={() => handleComorbidityChange('no major comorbidities')}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">No major comorbidities</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="Other comorbidities"
                value={otherComorbidity}
                onChange={(e) => setOtherComorbidity(e.target.value)}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200"
        >
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Find Your Clinical Trial</h1>
              <p className="mt-3 text-md text-gray-600 max-w-2xl mx-auto">
                Provide your medical information using one of the methods below. Our AI will find the best trials for you.
              </p>
            </div>

            {/* Tab-like buttons */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setMethod("history")}
                  className={`flex-1 py-3 text-center font-medium text-sm sm:text-base transition-colors duration-200 ${
                    method === 'history' 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Medical History
                </button>
                <button
                  onClick={() => setMethod("manual")}
                  className={`flex-1 py-3 text-center font-medium text-sm sm:text-base transition-colors duration-200 ${
                    method === 'manual' 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Detailed Form
                </button>
                <button
                  onClick={() => setMethod("mychart")}
                  className={`flex-1 py-3 text-center font-medium text-sm sm:text-base transition-colors duration-200 ${
                    method === 'mychart' 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  MyChart
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleFindTrials(); }}>
              {renderUploadMethod()}

              {(method === "history" || method === "manual") && (
                <>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={checkboxes.terms}
                          onChange={(e) => handleCheckboxChange("terms", e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <label htmlFor="terms" className="text-sm font-medium text-gray-800">
                            I accept the Terms and Conditions
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            You agree to our terms of service and privacy policy.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="deidentify"
                          checked={checkboxes.deidentify}
                          onChange={(e) => handleCheckboxChange("deidentify", e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <label htmlFor="deidentify" className="text-sm font-medium text-gray-800">
                            De-Identify My Data
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Enable this to protect your privacy before submitting.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Finding Trials...
                        </>
                      ) : (
                        "Find Clinical Trials"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
