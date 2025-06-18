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
	  You may choose to reach out to multiple clinical trials. Depending on your selections, you may need to submit a full assessment for each one separately. If you are eligible for several trials, NxtCure will provide you with an Eligibility Score for each one to help you prioritize based on fit, travel distance, and likelihood of candidacy. You can then choose which trial(s) to explore further. We’ll provide direct links to trial coordinators so you can contact them to start the screening process.
          </p>
	  <hr className="mt-6" />
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
	  Your privacy is our top priority. All uploaded electronic health records are anonymized and HIPAA-compliant. Personally identifiable information, including names, addresses, and full birth dates, is removed before data are analyzed. We do not sell or share your data with third parties.
          </p>
	  <hr className="mt-6" />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 text-left mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="cormorant text-2xl font-bold text-gray-800 mb-4">
	  	3.  When is NxtCure available?
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	  NxtCure will officially launch in Fall 2025 with early beta access beginning in August 2025 for select healthcare companies and patients. You can join the waitlist now to get early access and personalized onboarding.
          </p>
	  <hr className="mt-6" />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 text-left mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="cormorant text-2xl font-bold text-gray-800 mb-4">
		4. How can I use NxtCure?
          </h2>
	  <ul className="list-disc pl-5">
          <li
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	  	Patients: Upload your de-identified EHR, and receive personalized trial matches. Watch our demo video to walk through the upload and match process step-by-step.
	  </li>
          <li
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	  	Physicians: Log in to view FDA-approved treatments and have an AI powered clinical trial recommendation system for patients to trials after revision of all care options.
	  </li>
	  </ul>
	  	
	  <hr className="mt-6" />
        </motion.div>

      </div>
    </section>
  );
}
