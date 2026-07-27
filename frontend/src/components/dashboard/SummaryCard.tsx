import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaWallet,
  FaPiggyBank,
} from "react-icons/fa6";

interface Props {
  title: string;
  amount: string;
  color: string;
}

function SummaryCard({ title, amount, color }: Props) {

  function getIcon() {

    switch (title) {

      case "Income":
        return <FaArrowTrendUp className="text-green-600 text-2xl" />;

      case "Expenses":
        return <FaArrowTrendDown className="text-red-600 text-2xl" />;

      case "Current Balance":
        return <FaWallet className="text-blue-600 text-2xl" />;

      default:
        return <FaPiggyBank className="text-purple-600 text-2xl" />;
    }

  }

  return (

    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition duration-300">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">

            {title}

          </p>

          <h2 className={`text-3xl font-bold mt-3 ${color}`}>

            {amount}

          </h2>

        </div>

        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">

          {getIcon()}

        </div>

      </div>

    </div>

  );

}

export default SummaryCard;