import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // simulate loading
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-4 pl-4 pr-4">
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="w-full max-w-[1440px] bg-white rounded-md shadow-md overflow-auto border border-gray-400"
            style={{ height: "95vh", boxShadow: "1px 4px 8px #908DDC" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7 }}
          >
            <Navbar />
            <main>
              <Home />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
