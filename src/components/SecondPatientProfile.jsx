import { motion } from "framer-motion";
import rosa from "../assets/rosa.png";

export default function SecondPatientProfile() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,_#F1E2FE_0%,_#F3ECFF_10%,_#EEF7FF_90%)] py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 mb-5 mt-5">
        <motion.div
          className="w-full md:w-1/2"
          style={{ width: "60%" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img
            src={rosa}
            alt="Patient interacting"
            className="rounded-xl shadow-md"
          />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="cormorant text-5xl font-bold text-gray-800 mb-4">
            Meet Señora Rosa – NxtCure Patient
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
		This is Señora Rosa- a former nurse, a grandmother, and the heart of her family. Years ago, as a nurse she cared for others in her small town with nothing but her hands, her heart, and a belief in healing. Today, at 92 years old, she’s searching for treatment options.
	  <br />
	  <br />
Rosa is living with a severe form of heart disease that has made day-to-day life challenging. Her family searched for treatment options, but like so many others, current treatment was not responsive or effective.
	  <br />
	  <br />
But at NxtCure, we believe stories like Rosa’s are exactly why clinical trials should exist- for those who have been told there are no more options or current options aren’t working. With our platform, we’re helping Rosa and her family explore clinical trials that may provide not just treatment, but hope.
	  <br />
Because everyone deserves a chance and no one should be left behind.

          </p>
        </motion.div>
      </div>
    </section>
  );
}
