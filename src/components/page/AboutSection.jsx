import { motion } from "framer-motion";
import about from "../../assets/about.png";

export default function AboutSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,_#F1E2FE_0%,_#F3ECFF_10%,_#EEF7FF_90%)] py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start items-center justify-center gap-10 mb-5 mt-5">
        <motion.div
          className="w-full md:w-1/2 text-left mx-auto"
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

	NxtCure is the premier tool for clinical trials that enables patients and physicians to navigate the complex world of research and treatment innovation.
	  <br />
	  <br />
	Every year, millions of patients express an interest in clinical trial participation, yet 73% report an inability to find them. At NxtCure, with innovative technology developed at MIT and University of Cambridge, we help patients find trials that match their unique medical profiles and assist physicians assess the availability, necessity, and scientific rigor of clinical trials, especially when FDA-approved treatments already exist.
	  <br />
	  <br />
New legislation provides the steroids that makes NxtCure effective. In 2018, the Right to Try Act enabled patients diagnosed with life-threatening conditions who have already exhausted approved treatments to access investigational therapies. As a result, Phase 1 clinical trials on numerous promising interventions are no longer limited to healthy patients. At NxtCure we believe in the urgency of clinical trial enrollment for patients with advanced prognosis for their disease.
	  <br />
	  <br />
Indeed, only approximately 40% of clinical trials are able to meet their enrollment targets on time. In fact, 11% of trials fail to enroll even a single participant. These trials are often delayed, often due to recruitment challenges that stem from strict exclusion criteria, lack of awareness among physicians and potential candidate patients, and distrust or fear, especially among underserved communities. Furthermore, administrative burdens hamper the ability of clinics and hospitals to market and disseminate information about these trials.
	  <br />
	  <br />
NxtCare has been built from the ground up with all of these problems in mind.
 The rapidly shifted medical research landscape has created confusion but also opportunity: though there is a lot of breakthrough current research, there is not enough patient recruitment. Nxtcure hopes to reduce the administrative burden, to build trust among communities, and to make an impact upon the culture of clinical trials. Furthermore, Nxtcure advocates for including patients in these breakthrough medicines that have been tested for years but have been inaccessible to patients until now. NxtCure promises to reset the clinical trial system to be more accessible, inclusive, and impactful both for the patients who need them and the physicians who guide their care.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
