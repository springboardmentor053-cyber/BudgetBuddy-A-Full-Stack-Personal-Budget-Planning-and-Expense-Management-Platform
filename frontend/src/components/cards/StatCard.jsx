import { motion } from "framer-motion";

export default function StatCard({
  title,
  amount,
  icon,
  color = "text-blue-600",
  bg = "from-slate-50 to-slate-100",
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`
        h-44
        rounded-3xl
        bg-gradient-to-br
        ${bg}
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        p-6
        flex
        flex-col
        justify-between
      `}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            ₹{Number(amount).toLocaleString("en-IN")}
          </h2>

        </div>

        <div
          className={`
            w-14
            h-14
            rounded-2xl
            bg-white
            shadow-md
            flex
            items-center
            justify-center
            text-2xl
            ${color}
          `}
        >
          {icon}
        </div>

      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">

        <span className="text-xs text-slate-500">
          Updated just now
        </span>

        <span className="text-xs font-semibold text-green-600 bg-white px-3 py-1 rounded-full shadow-sm">
          Active
        </span>

      </div>
    </motion.div>
  );
}