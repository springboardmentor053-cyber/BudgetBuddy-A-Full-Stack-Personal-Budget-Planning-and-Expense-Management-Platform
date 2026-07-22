import { motion } from "framer-motion";

export default function StatCard({
  title,
  amount,
  icon,
  color,
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700"
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            ₹{Number(amount).toLocaleString("en-IN")}
          </h2>

        </div>

        <div
          className={`text-4xl ${color} bg-slate-700 p-4 rounded-2xl`}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
}