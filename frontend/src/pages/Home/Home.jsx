import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/common/Footer";
import { motion } from "framer-motion";
import { FaChartPie, FaPiggyBank, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex flex-col justify-center items-center px-8">

        <motion.h1
          initial={{opacity:0,y:-40}}
          animate={{opacity:1,y:0}}
          transition={{duration:1}}
          className="text-6xl font-bold text-center"
        >
          Smart Budget Planning
        </motion.h1>

        <p className="mt-6 text-xl text-gray-300 text-center max-w-3xl">
          Track your income, monitor expenses, create budgets,
          achieve savings goals and become financially smarter.
        </p>

        <button
  onClick={() => navigate("/register")}
  className="mt-10 px-8 py-4 bg-cyan-500 rounded-xl hover:bg-cyan-400 text-xl"
>
  Get Started
</button>

      </section>

      <section className="bg-slate-900 py-20">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <FaWallet className="mx-auto text-5xl text-cyan-400"/>
            <h2 className="text-white text-2xl mt-5">Expense Tracking</h2>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <FaPiggyBank className="mx-auto text-5xl text-green-400"/>
            <h2 className="text-white text-2xl mt-5">Savings Goals</h2>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <FaChartPie className="mx-auto text-5xl text-pink-400"/>
            <h2 className="text-white text-2xl mt-5">Analytics</h2>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}