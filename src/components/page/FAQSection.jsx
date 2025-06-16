import { motion } from "framer-motion";

export default function FAQSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,_#F1E2FE_0%,_#F3ECFF_10%,_#EEF7FF_90%)] py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-col items-start items-center justify-center gap-10 mb-5 mt-5">
        <motion.div
          className="w-full md:w-1/2 text-left mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="cormorant text-5xl font-bold text-gray-800 mb-4">
	  	Frequently Asked Questions (FAQ)
	  </h1>
          <h2 className="cormorant text-2xl font-bold text-gray-800 mb-4">
           	1. What if my eligibility or chance of a match is high for multiple trials? Will I need to undergo a full assessment for each one?
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	  	If you are eligible for several trials, NxtCure will provide you with an Eligibility Score for each one to help you prioritize based on fit, travel distance, and likelihood of acceptance. You can then choose which trial(s) to explore further. We’ll provide direct links to trial coordinators so you can contact them to start the screening process.
          </p>
	  <hr className="nb-4" />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 text-left mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="cormorant text-2xl font-bold text-gray-800 mb-4">
		2. How is my personal data protected?
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	  Your privacy is our top priority. All uploaded electronic health records (EHRs) are anonymized and HIPAA-compliant. Personally identifiable information—such as names, addresses, and full birth dates—is removed before data is analyzed. Patients may upload de-identified records themselves or request our team to de-identify their documents securely. We do not sell or share your data with third parties.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
