import {
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaArrowRight,
} from "react-icons/fa";

function QuickActions() {
  const actions = [
    {
      title: "Add Income",
      subtitle: "Record your earnings",
      icon: <FaWallet />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Add Expense",
      subtitle: "Track your spending",
      icon: <FaMoneyBillWave />,
      color: "bg-rose-100 text-rose-600",
    },
    {
      title: "Create Budget",
      subtitle: "Manage your monthly budget",
      icon: <FaPiggyBank />,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {actions.map((item, index) => (

        <div
          key={index}
          className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 group"
        >

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${item.color}`}
          >
            {item.icon}
          </div>

          <h3 className="mt-6 text-xl font-bold text-slate-800">
            {item.title}
          </h3>

          <p className="text-slate-500 mt-2">
            {item.subtitle}
          </p>

          <div className="mt-6 flex justify-end">

            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition flex items-center justify-center">

              <FaArrowRight />

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}

export default QuickActions;