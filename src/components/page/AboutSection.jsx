import { motion } from "framer-motion";
import about from "../../assets/about.png";

export default function AboutSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,_#F1E2FE_0%,_#F3ECFF_10%,_#EEF7FF_90%)] py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 mb-5 mt-5">
        <motion.div
          className="w-full md:items-center text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="cormorant text-5xl font-bold text-gray-800 mb-4">
            About Us
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
		NxtCure is the ultimate tool for clinical trials—empowering patients and physicians to navigate the complex world of research and treatment innovation.
		<br />
	  	<br />
		Every year, millions of patients are interested in joining clinical trials, yet 73% report having no idea how to find them. At NxtCure, we help patients discover trials that match their unique medical profiles, while enabling physicians to assess the availability, necessity, and scientific rigor of clinical trials—especially when FDA-approved treatments already exist.
	  	<br />
	  	<br />
		We’re built on the belief that today’s clinical trials are often too exclusive. Overly strict inclusion and exclusion criteria make recruitment difficult and leave many patients behind. As Kim et al. (BMC, 2020) noted, these narrow designs limit generalizability and underrepresented real-world populations. Bozkurt et al. (Lancet, 2022) found that out of 5.6 million U.S. adults eligible for heart failure treatment, only a small percentage qualified for trials due to restrictive eligibility requirements.
	  	<br />
	  	<br />
		NxtCure is reimagining clinical trials to be more accessible, inclusive, and impactful—for the patients who need them and the physicians who guide their care.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
