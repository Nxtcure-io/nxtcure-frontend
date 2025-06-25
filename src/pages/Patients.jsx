import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Brain, Loader2 } from "lucide-react";
import { initializeBertMatcher, getBertMatcher } from "../utils/bertMatcher.js";

export default function Patient() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("history");
  const [historyText, setHistoryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [bertInitialized, setBertInitialized] = useState(false);
  const [initializingBert, setInitializingBert] = useState(false);
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

  useEffect(() => {
    // Initialize BERT in background without blocking UI
    initializeBertOnMount();
  }, []);

  const initializeBertOnMount = async () => {
    try {
      setInitializingBert(true);
      console.log('Initializing BERT matcher in background...');
      
      // Use setTimeout to prevent blocking the main thread
      setTimeout(async () => {
        try {
          console.log('Fetching trials data from /api/trials-data...');
          const response = await fetch('/api/trials-data');
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', errorText);
            throw new Error(`Failed to fetch trials data: ${response.status} ${errorText}`);
          }
          
          const trialsData = await response.json();
          console.log('Received trials data:', trialsData.length, 'trials');
          
          if (!trialsData || trialsData.length === 0) {
            throw new Error('No trials data received');
          }
          
          console.log('Initializing BERT matcher with', trialsData.length, 'trials...');
          await initializeBertMatcher(trialsData);
          
          setBertInitialized(true);
          console.log('BERT matcher initialized successfully');
        } catch (error) {
          console.error('Error initializing BERT:', error);
          setBertInitialized(false);
        } finally {
          setInitializingBert(false);
        }
      }, 100); // Small delay to prevent blocking
      
    } catch (error) {
      console.error('Error in BERT initialization setup:', error);
      setBertInitialized(false);
      setInitializingBert(false);
    }
  };

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
      let matches = [];
      let matchingMethod = 'keyword';

      // Try BERT if available, otherwise use keyword matching immediately
      if (bertInitialized) {
        console.log('BERT is initialized, attempting BERT matching...');
        try {
          const matcher = await getBertMatcher();
          matches = await matcher.findMatches(textToSend, 5, 0.2);
          matchingMethod = 'bert';
          console.log('BERT matching successful, found', matches.length, 'matches');
        } catch (error) {
          console.error('BERT matching failed, falling back to keyword:', error);
          matches = await fallbackKeywordMatch(textToSend);
        }
      } else {
        console.log('BERT not initialized, using keyword matching immediately...');
        matches = await fallbackKeywordMatch(textToSend);
      }
      
      console.log('Final matches:', matches.length, 'using method:', matchingMethod);
      
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

  const fallbackKeywordMatch = async (patientDescription) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiUrl}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientDescription }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Fallback API error:', error);
      return [];
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
          <div className="mt-6 space-y-6">
            {/* BERT Status */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {initializingBert ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700">Loading AI model in background...</span>
                  </>
                ) : bertInitialized ? (
                  <>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">AI model ready</span>
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700">Loading AI model in background...</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                You can submit the form anytime - AI will be used if available
              </p>
            </div>

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

            <button
              onClick={() => handleFindTrials()}
              className="bg-gradient-to-r from-[#5F5AE8] to-[#BB5AE7] text-white px-6 py-3 rounded-lg w-full transition hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Finding Trials..." : "Find Matching Trials"}
            </button>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Patient Information</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose how you'd like to provide your medical information. We'll use this to find 
            the most relevant clinical trials for your condition.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setMethod("history")}
              className={`p-4 rounded-lg border-2 transition-all ${
                method === "history"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">H</span>
                </div>
                <h3 className="font-semibold">Medical History</h3>
                <p className="text-sm text-gray-600">Enter your medical history</p>
              </div>
            </button>

            <button
              onClick={() => setMethod("manual")}
              className={`p-4 rounded-lg border-2 transition-all ${
                method === "manual"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">F</span>
                </div>
                <h3 className="font-semibold">Form Entry</h3>
                <p className="text-sm text-gray-600">Fill out detailed form</p>
              </div>
            </button>

            <button
              onClick={() => setMethod("mychart")}
              className={`p-4 rounded-lg border-2 transition-all ${
                method === "mychart"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">M</span>
                </div>
                <h3 className="font-semibold">MyChart</h3>
                <p className="text-sm text-gray-600">Connect your MyChart</p>
              </div>
            </button>
          </div>

          {renderUploadMethod()}

          {(method === "history" || method === "manual") && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.terms}
                    onChange={(e) => handleCheckboxChange("terms", e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      I accept the Terms and Conditions
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      By checking this box, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.deidentify}
                    onChange={(e) => handleCheckboxChange("deidentify", e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable De-Identify Data
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Remove personally identifiable information from your data for enhanced privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
