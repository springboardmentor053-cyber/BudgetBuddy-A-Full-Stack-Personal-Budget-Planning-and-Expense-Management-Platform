import { useEffect, useState } from "react";
import {
  getMonthlyReport,
  getExpenseReport,
  getSavingsReport,
  getFinancialSummaryReport,
  getExportReport,
} from "../../services/reportServices";

function ReportsDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
  new Date().getMonth() + 1
);

const [selectedYear, setSelectedYear] = useState(
  new Date().getFullYear()
);
  useEffect(() => {
    async function loadReports() {
      try {
        const [
          summaryRes,
          monthlyRes,
          expenseRes,
          savingsRes,
        ] = await Promise.all([
          getFinancialSummaryReport(),
          getMonthlyReport(selectedMonth, selectedYear),
          getExpenseReport(selectedMonth, selectedYear),
          getSavingsReport(),
        ]);
        console.log("SUMMARY RESPONSE:", summaryRes.data);
console.log("MONTHLY RESPONSE:", monthlyRes.data);
        setSummary(summaryRes.data);
        setMonthly(monthlyRes.data);
        setExpenses(expenseRes.data);
        
        console.log("Expense API:", expenseRes.data);
        console.log("Selected Month:", selectedMonth);
        console.log("Selected Year:", selectedYear);

        // Savings API returns an array
        setSavings(savingsRes.data);
      } catch (err) {
        console.log(err);
      }
    }

    loadReports();
  }, [selectedMonth, selectedYear]);
//   async function downloadReport() {
//   try {
//     const response = await getExportReport();

//     const url = window.URL.createObjectURL(
//       new Blob([response.data])
//     );

//     const link = document.createElement("a");

//     link.href = url;
//     link.setAttribute(
//       "download",
//       "Financial_Report.csv"
//     );

//     document.body.appendChild(link);

//     link.click();

//     link.remove();

//     window.URL.revokeObjectURL(url);

//   } catch (error) {
//     console.log(error);
//   }
// }
const handleDownload = async () => {
  try {
    const response = await getExportReport();

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Financial_Report.csv");

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed", error);
  }
};
const totalExpenses = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount),
  0
);

const highestExpense =
  expenses.length > 0
    ? Math.max(...expenses.map((expense) => Number(expense.amount)))
    : 0;

const averageExpense =
  expenses.length > 0
    ? totalExpenses / expenses.length
    : 0;
  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Reports Dashboard
      </h1>
      {/* Financial Summary */}

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 mb-8">

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Financial Summary
        </h2>

        {summary?.financial_summary && (

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

            <div className="bg-green-100 dark:bg-green-900 p-5 rounded-xl">
              <h3 className="text-gray-800 dark:text-white font-semibold">Income</h3>
              <p className="text-2xl font-bold  text-green-700 dark:text-green-300">
                ₹{summary.financial_summary.total_income}
              </p>
            </div>    

            <div className="bg-red-100 dark:bg-red-900 p-5 rounded-xl">
              <h3 className="text-gray-800 dark:text-white font-semibold">Expense</h3>
              <p className="text-2xl font-bold  text-red-700 dark:text-red-300">
                ₹{summary.financial_summary.total_expense}
              </p>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-xl">
              <h3 className="text-gray-800 dark:text-white font-semibold">Balance</h3>
              <p className="text-2xl font-bold  text-blue-700 dark:text-blue-300">
                ₹{summary.financial_summary.current_balance}
              </p>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900 p-5 rounded-xl">
              <h3 className="text-gray-800 dark:text-white font-semibold">Savings</h3>
              <p className="text-2xl font-bold  text-purple-700 dark:text-purple-300">
                ₹{summary.financial_summary.total_savings}
              </p>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900 p-5 rounded-xl">
              <h3 className="text-gray-800 dark:text-white font-semibold">Budget Left</h3>
              <p className="text-2xl font-bold  text-yellow-700 dark:text-yellow-300">
                ₹{summary.financial_summary.remaining_budget}
              </p>
            </div>

          </div>

        )}
      </div>
      {/* Monthly Report */}

<div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">

  {/* Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Monthly Report
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mt-1">
        View your financial performance for a specific month.
      </p>
    </div>


    {/* Month / Year */}

    <div className="flex gap-3">

      <select
        value={selectedMonth}
        onChange={(e) =>
          setSelectedMonth(Number(e.target.value))
        }
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-700
                   text-gray-800 dark:text-white
                   focus:outline-none"
      >
        <option value={1}>January</option>
        <option value={2}>February</option>
        <option value={3}>March</option>
        <option value={4}>April</option>
        <option value={5}>May</option>
        <option value={6}>June</option>
        <option value={7}>July</option>
        <option value={8}>August</option>
        <option value={9}>September</option>
        <option value={10}>October</option>
        <option value={11}>November</option>
        <option value={12}>December</option>
      </select>


      <select
        value={selectedYear}
        onChange={(e) =>
          setSelectedYear(Number(e.target.value))
        }
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-700
                   text-gray-800 dark:text-white
                   focus:outline-none"
      >
        <option value={2006}>2006</option>
        <option value={2007}>2007</option>
        <option value={2008}>2008</option>
        <option value={2009}>2009</option>
        <option value={2010}>2010</option>
        <option value={2011}>2011</option>
        <option value={2012}>2012</option>
        <option value={2013}>2013</option>
        <option value={2014}>2014</option>
        <option value={2015}>2015</option>
        <option value={2016}>2016</option>
        <option value={2017}>2017</option>
        <option value={2018}>2018</option>
        <option value={2019}>2019</option>
        <option value={2020}>2020</option>
        <option value={2021}>2021</option>
        <option value={2022}>2022</option>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
        <option value={2027}>2027</option>
        <option value={2028}>2028</option>
        <option value={2029}>2029</option>
        <option value={2030}>2030</option>
        <option value={2031}>2031</option>
        <option value={2032}>2032</option>
      </select>

    </div>

  </div>


  {/* Report Cards */}

  {monthly && (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

      {/* Income */}

      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5">

        <p className="text-sm text-green-700 dark:text-green-300">
          Total Income
        </p>

        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
          ₹{monthly.total_income}
        </h3>

      </div>


      {/* Expense */}

      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-5">

        <p className="text-sm text-red-700 dark:text-red-300">
          Total Expense
        </p>

        <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
          ₹{monthly.total_expense}
        </h3>

      </div>


      {/* Balance */}

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">

        <p className="text-sm text-blue-700 dark:text-blue-300">
          Current Balance
        </p>

        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
          ₹{monthly.current_balance}
        </h3>

      </div>


      {/* Savings */}

      <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5">

        <p className="text-sm text-purple-700 dark:text-purple-300">
          Total Savings
        </p>

        <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
          ₹{monthly.total_savings}
        </h3>

      </div>


      {/* Budget */}

      <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-5">

        <p className="text-sm text-orange-700 dark:text-orange-300">
          Budget Remaining
        </p>
        <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
          ₹{monthly.remaining_budget}
        </h3>

      </div>

    </div>

  )}

</div>

      {/* Expense Analytics */}

<div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
      Expense Analytics
    </h2>

    <p className="text-gray-500 dark:text-gray-400 mt-1">
      Analyze your spending and recent expenses.
    </p>

  </div>


  {/* Expense Statistics */}

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-5">

      <p className="text-sm text-red-700 dark:text-red-300">
        Total Expenses
      </p>

      <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
        ₹{totalExpenses.toFixed(2)}
      </h3>

    </div>


    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">

      <p className="text-sm text-blue-700 dark:text-blue-300">
        Number of Expenses
      </p>

      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
        {expenses.length}
      </h3>

    </div>


    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-5">

      <p className="text-sm text-orange-700 dark:text-orange-300">
        Highest Expense
      </p>

      <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
        ₹{highestExpense.toFixed(2)}
      </h3>

    </div>


    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5">

      <p className="text-sm text-purple-700 dark:text-purple-300">
        Average Expense
      </p>

      <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
        ₹{averageExpense.toFixed(2)}
      </h3>

    </div>

  </div>


  {/* Expense List */}

  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
    Expense Details
  </h3>


  {expenses.length === 0 ? (

    <p className="text-gray-500 dark:text-gray-400">
      No expenses found.
    </p>

  ) : (

    <div className="space-y-3">

      {expenses.map((expense: any, index: number) => (

        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700
                     bg-gray-50 dark:bg-gray-700
                     rounded-xl p-4"
        >

          <div className="flex flex-col md:flex-row md:justify-between gap-3">

            <div>

              <h4 className="font-semibold text-gray-800 dark:text-white">
                {expense.title}
              </h4>

              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                {expense.category}
              </p>

            </div>


            <div className="md:text-right">

              <p className="font-bold text-red-600 dark:text-red-400">
                ₹{expense.amount}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {expense.date}
              </p>

            </div>

          </div>


          {expense.description && (

            <p className="text-sm text-gray-500 dark:text-gray-300 mt-3">
              {expense.description}
            </p>

          )}

        </div>

      ))}

    </div>

  )}

</div>
{/* Savings Report */}

<div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 border border-gray-200 dark:border-gray-700">

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
      Savings Goals
    </h2>

    <p className="text-gray-500 dark:text-gray-400 mt-1">
      Track your progress towards your savings goals.
    </p>

  </div>

  {savings.length === 0 ? (

    <p className="text-gray-500 dark:text-gray-400">
      No Savings Goals Found
    </p>

  ) : (

    <div className="space-y-6">

      {savings.map((goal: any, index: number) => {

        const progress =
          goal.target_amount > 0
            ? (goal.saved_amount / goal.target_amount) * 100
            : 0;

        const progressValue = Math.min(
          100,
          Math.max(0, progress)
        );

        const remaining = Math.max(
          0,
          goal.target_amount - goal.saved_amount
        );

        return (

          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700
                       bg-gray-50 dark:bg-gray-700
                       rounded-xl p-5"
          >

            {/* Goal Header */}

            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {goal.goal_name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  ₹{goal.saved_amount} saved of ₹{goal.target_amount}
                </p>

              </div>

              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(progress)}%
              </span>

            </div>


            {/* Progress Bar */}

            <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">

              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{
                  width: `${progressValue}%`,
                }}
              />

            </div>


            {/* Details */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Target
                </p>

                <p className="font-semibold text-gray-800 dark:text-white">
                  ₹{goal.target_amount}
                </p>

              </div>


              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Saved
                </p>

                <p className="font-semibold text-green-600 dark:text-green-400">
                  ₹{goal.saved_amount}
                </p>

              </div>


              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining
                </p>

                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  ₹{remaining}
                </p>

              </div>

            </div>


            {/* Status + Date */}

            <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200 dark:border-gray-600">

              <span className="text-sm text-gray-600 dark:text-gray-300">
                Status: <b>{goal.status}</b>
              </span>

              {goal.target_date && (

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Target date: {goal.target_date}
                </span>

              )}

            </div>

          </div>

        );

      })}

    </div>

  )}


  {/* Download */}

  {savings.length > 0 && (

    <div className="flex justify-center mt-8">

      <button
        onClick={handleDownload}
        className="bg-indigo-600 hover:bg-indigo-700
                   text-white px-6 py-3 rounded-lg
                   font-semibold transition"
      >
        Download CSV Report
      </button>

    </div>

  )}

</div>  

    </div>
  );
}

export default ReportsDashboard;