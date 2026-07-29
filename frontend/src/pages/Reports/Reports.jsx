import { useEffect, useState, useMemo } from "react";
import {
  FaChartPie,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaWallet,
  FaExchangeAlt,
  FaPercentage,
  FaLayerGroup,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { getIncome } from "../../api/incomeApi";
import { getExpenses } from "../../api/expenseApi";
import { getDashboard } from "../../api/dashboardApi";
import { useSettings } from "../../context/SettingsContext"; // Dynamic currency context

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#64748B",
];

export default function Reports() {
  // Extract dynamic money formatting function
  const { formatMoney } = useSettings();

  const [loading, setLoading] = useState(true);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    fetchAllReportsData();
  }, []);

  const fetchAllReportsData = async () => {
    try {
      setLoading(true);

      const [incomeRes, expenseRes, dashboardRes] = await Promise.all([
        getIncome().catch(() => ({ data: [] })),
        getExpenses ? getExpenses().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        getDashboard().catch(() => ({ data: {} })),
      ]);

      setIncomeList(incomeRes.data || []);
      setExpenseList(expenseRes.data || []);
      setDashboardData(dashboardRes.data || {});
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- COMPUTE ANALYTICS & FREQUENCIES ---
  const reportMetrics = useMemo(() => {
    const totalIncome = incomeList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalExpenses = expenseList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalSavings = Math.max(0, totalIncome - totalExpenses);

    const totalBudget = Number(dashboardData.total_budget || 0);
    const budgetUsedPercentage = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

    // 1. Monthly Trajectory (Bar Chart Data)
    const monthlyMap = {};

    incomeList.forEach((item) => {
      const rawDate = item.income_date || item.date || item.created_at;
      const date = rawDate ? new Date(rawDate) : new Date();
      const monthKey = date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, Income: 0, Expenses: 0 };
      monthlyMap[monthKey].Income += Number(item.amount || 0);
    });

    expenseList.forEach((item) => {
      const rawDate = item.expense_date || item.date || item.created_at;
      const date = rawDate ? new Date(rawDate) : new Date();
      const monthKey = date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, Income: 0, Expenses: 0 };
      monthlyMap[monthKey].Expenses += Number(item.amount || 0);
    });

    const monthlyData = Object.values(monthlyMap);

    // 2. Expense Category Breakdown (Pie Chart & List Data)
    const categoryMap = {};
    expenseList.forEach((item) => {
      const cat = item.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.amount || 0);
    });

    const categoryData = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
      percentage: totalExpenses > 0 ? ((categoryMap[cat] / totalExpenses) * 100).toFixed(1) : 0,
    }));

    // 3. Income Source Breakdown
    const sourceMap = {};
    incomeList.forEach((item) => {
      const src = item.source || "Other";
      sourceMap[src] = (sourceMap[src] || 0) + Number(item.amount || 0);
    });

    const sourceData = Object.keys(sourceMap).map((src) => ({
      name: src,
      value: sourceMap[src],
      percentage: totalIncome > 0 ? ((sourceMap[src] / totalIncome) * 100).toFixed(1) : 0,
    }));

    // 4. Frequency Metrics
    const totalTransactions = incomeList.length + expenseList.length;
    const avgExpenseTransaction = expenseList.length > 0 ? Math.round(totalExpenses / expenseList.length) : 0;
    const avgIncomeTransaction = incomeList.length > 0 ? Math.round(totalIncome / incomeList.length) : 0;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      budgetUsedPercentage,
      monthlyData,
      categoryData,
      sourceData,
      totalTransactions,
      avgExpenseTransaction,
      avgIncomeTransaction,
    };
  }, [incomeList, expenseList, dashboardData]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <p className="text-lg font-semibold animate-pulse">Analyzing Financial Data & Generating Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-white">

      {/* Page Header & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white">
            Financial Analytics & Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            In-depth breakdown across income sources, expense categories, and monthly trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-3 rounded-2xl font-semibold transition">
            <FaFilePdf />
            <span>Export PDF</span>
          </button>
          <button className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-5 py-3 rounded-2xl font-semibold transition">
            <FaFileExcel />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</span>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><FaArrowUp /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {formatMoney(reportMetrics.totalIncome)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">{incomeList.length} total income logs</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500"><FaArrowDown /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {formatMoney(reportMetrics.totalExpenses)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">{expenseList.length} total expense logs</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Savings</span>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><FaPiggyBank /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {formatMoney(reportMetrics.totalSavings)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">Remaining liquidity</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget Usage</span>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400"><FaWallet /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {reportMetrics.budgetUsedPercentage}%
          </h2>
          <p className="text-xs text-slate-400 mt-2">Relative to set overall budget</p>
        </div>

      </div>

      {/* Transaction Frequency Highlights */}
      <div className="grid md:grid-cols-3 gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500"><FaExchangeAlt className="text-xl" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Activity</p>
            <p className="text-xl font-bold">{reportMetrics.totalTransactions} Transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500"><FaPercentage className="text-xl" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Avg. Income Log</p>
            <p className="text-xl font-bold">{formatMoney(reportMetrics.avgIncomeTransaction)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500"><FaLayerGroup className="text-xl" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Avg. Expense Log</p>
            <p className="text-xl font-bold">{formatMoney(reportMetrics.avgExpenseTransaction)}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Chart 1: Income vs Expenses Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Income vs Expense Trajectory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly side-by-side comparison</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {reportMetrics.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportMetrics.monthlyData}>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => formatMoney(value)}
                  />
                  <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No date logs available for charts</div>
            )}
          </div>
        </div>

        {/* Chart 2: Category Pie Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500">
              <FaChartPie className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Expense Category Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Spending ratio by category</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {reportMetrics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportMetrics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportMetrics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    formatter={(value) => formatMoney(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No categorical expenses found</div>
            )}
          </div>
        </div>

      </div>

      {/* Categorical Breakdown & Progress Ratios */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Expense Category Shares */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Expense Distribution by Category</h2>
          <div className="space-y-4">
            {reportMetrics.categoryData.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{cat.name}</span>
                  <span className="font-bold">{formatMoney(cat.value)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Source Shares */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Income Breakdown by Source</h2>
          <div className="space-y-4">
            {reportMetrics.sourceData.map((src, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{src.name}</span>
                  <span className="font-bold">{formatMoney(src.value)} ({src.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Monthly Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Monthly Summary Table</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <th className="pb-4">Month</th>
                <th className="pb-4">Income</th>
                <th className="pb-4">Expenses</th>
                <th className="pb-4">Savings</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm font-semibold">
              {reportMetrics.monthlyData.length > 0 ? (
                reportMetrics.monthlyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="py-4 text-slate-900 dark:text-white">{row.month}</td>
                    <td className="text-emerald-500">{formatMoney(row.Income)}</td>
                    <td className="text-rose-500">{formatMoney(row.Expenses)}</td>
                    <td className="text-amber-500">{formatMoney(Math.max(0, row.Income - row.Expenses))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400 font-normal">
                    No transaction history found to generate monthly reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}