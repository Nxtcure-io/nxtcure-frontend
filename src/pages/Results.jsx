import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark, MessageCircle, X, Phone, Mail, User, Building } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [patientData, setPatientData] = useState("");
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (location.state && location.state.results) {
      setResults(location.state.results);
      setPatientData(location.state.patientData || "");
    } else {
      navigate('/patients');
    }
  }, [location.state, navigate]);

  const handleViewDetails = (trial) => {
    setSelectedTrial(trial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrial(null);
  };

  const getTrialLink = (nctId) => {
    return `https://clinicaltrials.gov/ct2/show/${nctId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EHR Analysis Results</h1>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="text-gray-500">Free Tier: 0 Lookups Remaining</span>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition">
              Buy Premium
            </button>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We've analyzed your Electronic Health Record and found clinical trials that 
            match your health profile. Explore the options below to take the next step in 
            your care journey.
          </p>
        </motion.div>

        {/* Results Grid */}
        <div className="space-y-6">
          {results.map((trial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {trial.title}
                  </h3>

                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Condition:</span> {trial.condition}
                    </p>
                    <p>
                      <span className="font-medium">Eligibility Highlights:</span> {trial.inclusion ? trial.inclusion.substring(0, 100) + "..." : "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {trial.country || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {trial.status}
                    </p>
                    <p>
                      <span className="font-medium">Enrollment:</span> {trial.enrollment ? `${trial.enrollment} participants` : "Not specified"}
                    </p>
                    {trial.nct_id && (
                      <p>
                        <span className="font-medium">Study ID:</span>{" "}
                        <a 
                          href={getTrialLink(trial.nct_id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {trial.nct_id}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <button 
                      onClick={() => handleViewDetails(trial)}
                      className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-200 transition"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleViewDetails(trial)}
                      className="bg-green-100 text-green-700 px-6 py-2 rounded-lg hover:bg-green-200 transition flex items-center space-x-2"
                    >
                      <Phone size={16} />
                      <span>Show Contact Details</span>
                    </button>
                  </div>
                </div>

                {/* Bookmark Icon */}
                <button className="ml-6 p-2 hover:bg-gray-50 rounded-lg transition">
                  <Bookmark size={24} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No clinical trials found. Please try searching again.</p>
            <button 
              onClick={() => navigate('/patients')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Search Again
            </button>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showModal && selectedTrial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Clinical Trial Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trial Information</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">NCT ID:</span> {selectedTrial.nct_id}</p>
                    {selectedTrial.nct_id && (
                      <p>
                        <span className="font-medium">Study Link:</span>{" "}
                        <a 
                          href={getTrialLink(selectedTrial.nct_id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View on ClinicalTrials.gov
                        </a>
                      </p>
                    )}
                    <p><span className="font-medium">Title:</span> {selectedTrial.title}</p>
                    <p><span className="font-medium">Condition:</span> {selectedTrial.condition}</p>
                    <p><span className="font-medium">Status:</span> {selectedTrial.status}</p>
                    <p><span className="font-medium">Phase:</span> {selectedTrial.phase || "Not specified"}</p>
                    <p><span className="font-medium">Enrollment:</span> {selectedTrial.enrollment ? `${selectedTrial.enrollment} participants` : "Not specified"}</p>
                    <p><span className="font-medium">Location:</span> {selectedTrial.country || "Not specified"}</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedTrial.summary || "Not provided"}</p>
                </div>

                {/* Inclusion Criteria */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Inclusion Criteria</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedTrial.inclusion || "Not provided"}</p>
                </div>

                {/* Exclusion Criteria */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Exclusion Criteria</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedTrial.exclusion || "Not provided"}</p>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedTrial.contact_name || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">{selectedTrial.contact_role || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone size={20} className="text-purple-600" />
                      <p className="text-gray-700">{selectedTrial.contact_phone || 'Not provided'}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-purple-600" />
                      <p className="text-gray-700">{selectedTrial.contact_email || 'Not provided'}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building size={20} className="text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedTrial.lead_sponsor || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">{selectedTrial.sponsor_type || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Close
                </button>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                  Apply for Trial
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition">
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center space-x-8 text-gray-500 text-sm">
            <a href="#" className="hover:text-gray-700 transition">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition">Support</a>
            <a href="#" className="hover:text-gray-700 transition">FAQs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Results;
