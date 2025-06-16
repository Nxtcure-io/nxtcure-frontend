import { motion } from "framer-motion";
import aibanner from "../assets/ai_banner.png";

export default function AIBanner() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-6 text-center">
      <motion.div
        className="max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      	<img src={aibanner} alt="AI Banner" className="h-10 mb-4" />
      </motion.div>
    </section>
  );
}
