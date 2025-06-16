import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark, MessageCircle } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [patientData, setPatientData] = useState("");

  useEffect(() => {
    if (location.state && location.state.results) {
      setResults(location.state.results);
      setPatientData(location.state.patientData || "");
    } else {
      navigate('/patients');
    }
  }, [location.state, navigate]);

  const getSuccessRate = (similarity) => {
    return Math.round(similarity * 100);
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
                      <span className="font-medium">Eligibility Highlights:</span> {trial.inclusion.substring(0, 100)}...
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {trial.country}
                    </p>
                    <p className="text-purple-600 font-medium">
                      Success Rate: {getSuccessRate(trial.similarity)}%
                    </p>
                  </div>

                  <button className="mt-6 bg-purple-100 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-200 transition">
                    View Details
                  </button>
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
