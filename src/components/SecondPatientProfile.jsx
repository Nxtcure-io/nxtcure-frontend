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
            Meet Ellen
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
	A former nurse, a grandmother, and the heart of her family, Ellen has cared for others in her small town for decades with nothing but her hands, her heart, and a belief in good health. Today, at 92 years old, she has run out of treatment options.
	  <br />
	  <br />
	Ellen lives with a severe form of heart disease that makes day-to-day life a burden. Her family scoured the medical establishment for treatment options, but as with so many others, current treatment was not responsive or effective.
	  <br />
	  <br />
At NxtCure, we believe stories like Ellen’s are exactly why clinical trials should exist. For those who have been told there are no more options or current options aren’t working, our platform connects Ellen and her family to clinical trials that may provide not just treatment, but hope.
	  <br />
	  <br />
To serve people like Ellen who have almost run out of hope, NxtCure commits itself to its belief that everyone deserves a chance to fight and no one should be left behind.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
