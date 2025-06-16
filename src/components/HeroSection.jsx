import { motion } from "framer-motion";
import yale from "../assets/Yale_University_logo.png";
import harvard from "../assets/harvard-university.png";
import schwarzman from "../assets/sc.png";
import broad from "../assets/broad.png";
import forbes from "../assets/forbes.png";
import mit from "../assets/mit.png";
import cambridge from "../assets/cambridge.png";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 py-6 text-center bg-[radial-gradient(circle_at_center,_#F1E2FE_10%,_#F3ECFF_30%,_#EEF7FF_80%)]">
      <motion.div
        className="max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="font-bold leading-tight mt-2"
          style={{ fontSize: "4rem" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <span className="cormorant text-black bg-clip-text">
	  	AI powered Clinical Trials Matching
          </span>
        </motion.h1>

        <motion.p
          className="cormorant text-gray-600 mb-6"
          style={{
            fontSize: "1.4rem",
            marginTop: "-12px",
            fontStyle: "italic",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          For Patients and Physicians
        </motion.p>

        <motion.p
          className="text-md text-gray-500 mb-8"
          style={{ fontSize: "1.2rem" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your healing journey, guided with care and precision. At NxtCure, we
          make finding the right care feel less overwhelming.
        </motion.p>

        <motion.button
          className="bg-blue-500 button_hvr text-white px-5 py-3 text-lg rounded-full shadow-md transition-all duration-300 mb-12"
          style={{ fontSize: "1rem", cursor: "pointer", fontWeight: "500" }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Get Started
        </motion.button>

        <motion.h3
          className="expert-tab text-gray-500 text-sm font-medium mb-15"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Built by Experts
        </motion.h3>

        <motion.div
          className="flex justify-center items-center flex-wrap gap-15 px-4 mt-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <img src={yale} alt="Yale" className="h-7 object-contain" />
          <img src={harvard} alt="Harvard" className="h-8 object-contain" />
          <img src={mit} alt="MIT" className="h-8 object-contain" />
          <img
            src={schwarzman}
            alt="Schwarzman Scholars"
            className="h-9 object-contain"
          />
          <img src={cambridge} alt="Univeristy of Cambridge" className="h-8 object-contain" />
          <img
            src={broad}
            alt="Broad Institute"
            className="h-7 object-contain"
          />
          <img src={forbes} alt="Forbes" className="h-6 object-contain" />
        </motion.div>
      </motion.div>
    </section>
  );
}
