import { motion } from "framer-motion";

import WaitlistBanner from "../components/WaitlistBanner";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/StatsSection";
import NxtCureSection from "../components/AboutSection";
import TrustedBySection from "../components/TrustedBySection";
import HowItStarted from "../components/HowItStarted";
import SecondPatientProfile from "../components/SecondPatientProfile";
import MeetTheTeamSection from "../components/MeetTheTeam";
import StayUpdated from "../components/StayUpdated";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        variants={sectionVariants}
      >
        <WaitlistBanner />
      </motion.div>


      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        variants={sectionVariants}
      >
        <HeroSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        variants={sectionVariants}
      >
        <FeaturesSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        variants={sectionVariants}
      >
        <NxtCureSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
        variants={sectionVariants}
      >
        <TrustedBySection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        variants={sectionVariants}
      >
        <HowItStarted />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        variants={sectionVariants}
      >
        <SecondPatientProfile />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
        variants={sectionVariants}
      >
        <MeetTheTeamSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
        variants={sectionVariants}
      >
        <StayUpdated />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.35 }}
        variants={sectionVariants}
      >
        <ContactForm />
      </motion.div>

      <Footer />
    </>
  );
}
