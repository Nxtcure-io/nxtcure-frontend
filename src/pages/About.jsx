import { motion } from "framer-motion";

import AboutSection from "../components/page/AboutSection";
import Footer from "../components/Footer";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        variants={sectionVariants}
      >
        <AboutSection />
      </motion.div>

      <Footer />
    </>
  );
}
