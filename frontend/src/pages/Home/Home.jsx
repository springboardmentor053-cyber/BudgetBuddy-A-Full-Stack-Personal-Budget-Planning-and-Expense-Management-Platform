import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaChartPie,
  FaPiggyBank,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import PublicNavbar from "../../components/navbar/PublicNavbar";
import Footer from "../../components/common/Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col justify-between">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight"
        >
          Master Your Money with{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            BudgetBuddy
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed"
        >
          Track your income, monitor expenses, create custom budgets, and hit your target savings goals effortlessly.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate("/register")}
            className="group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/20 transition duration-300 flex items-center justify-center gap-3"
          >
            Get Started Free
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/login"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg rounded-2xl border border-slate-700/80 transition duration-300 text-center"
          >
            Log In
          </Link>
        </motion.div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-cyan-400" /> Free to use
          </div>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-cyan-400" /> Secure JWT Auth
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-cyan-400" /> Full Visual Reports
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built for Smart Financial Control
          </h2>
          <p className="text-slate-400 mt-3">
            Everything you need to organize your personal finances in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-cyan-500/50 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl mb-6">
              <FaWallet />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Expense Tracking</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Keep precise records of your spending habits and categorize expenses for easy reference.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-teal-500/50 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-2xl mb-6">
              <FaPiggyBank />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Savings Goals</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Define target goals for vacations, emergency funds, or purchases and track your progress.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-blue-500/50 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl mb-6">
              <FaChartPie />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Visual Analytics</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Understand cash flow trends with visual breakdowns comparing income and expenditure over time.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-10 sm:p-14 rounded-3xl shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to organize your budget?
          </h2>
          <p className="text-slate-300 text-base max-w-md mx-auto mb-8">
            Create an account in less than a minute to start managing your personal expenses.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg rounded-2xl shadow-lg shadow-cyan-500/20 transition duration-300"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}