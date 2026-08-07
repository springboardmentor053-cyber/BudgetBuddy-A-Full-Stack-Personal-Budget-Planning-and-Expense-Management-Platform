import { useEffect, useState } from "react";
import {
  FaChartPie,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaWallet,
  FaExchangeAlt,
  FaPercentage,
  FaLayerGroup,
  FaFilter,
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

import { getDashboard, getMonthlyExpenseTrend, exportReportFile } from "../../api/analyticsApi";
import { useSettings } from "../../context/SettingsContext";

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
  const { formatMoney } = useSettings();
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};

      if (selectedMonth !== "ALL") {
        params.month = Number(selectedMonth);
      }
      if (selectedYear) {
        params.year = Number(selectedYear);
      }

      // Updated to call getDashboard instead of undefined getAnalyticsDashboard
      const response = await getDashboard(params);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExportingFormat(format);

      const response = await exportReportFile(format, selectedMonth, selectedYear);

      // Check for backend error payload hidden inside blob
      if (response.data?.type && response.data.type.includes("application/json")) {
        const text = await response.data.text();
        const errorJson = JSON.parse(text);
        alert(`Export failed: ${errorJson.error || errorJson.message || "Server error"}`);
        return;
      }

      const mimeTypes = {
        csv: "text/csv;charset=utf-8;",
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf: "application/pdf",
      };

      const extensions = { csv: "csv", excel: "xlsx", pdf: "pdf" };

      const blob = new Blob([response.data], {
        type: mimeTypes[format] || response.headers?.["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `financial_report_${selectedMonth}_${selectedYear}.${extensions[format] || format}`
      );

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error(`Error exporting ${format} report:`, error);
      alert(`Failed to export ${format.toUpperCase()} report.`);
    } finally {
      setExportingFormat(null);
    }
  };

  const monthNames = [
    { value: "ALL", label: "All Months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const financialSummary = analyticsData?.financial_summary || {};
  const expenseSummary = analyticsData?.expense_summary || {};
  const budgetSummary = analyticsData?.budget_summary || {};

  const rawCategoryData =
    expenseSummary.by_category ||
    analyticsData?.category_analysis ||
    analyticsData?.category_breakdown ||
    [];

  const categoryAnalysis = rawCategoryData
    .map((item) => ({
      name: item.category || item.name || "Uncategorized",
      value: Number(item.total ?? item.amount ?? item.value ?? 0),
    }))
    .filter((item) => item.value > 0);

  const rawMonthlyTrend = analyticsData?.monthly_trend || analyticsData?.monthly_trends || [];
  const monthlyTrend = rawMonthlyTrend.map((item) => ({
    month: item.month || "N/A",
    income: Number(item.income ?? 0),
    expense: Number(item.expense ?? 0),
  }));

  const recentTransactions = analyticsData?.recent_transactions || [];

  const totalIncome = Number(financialSummary.total_income || 0);
  const totalExpenses = Number(financialSummary.total_expense || 0);
  const netSavings = Number(financialSummary.net_savings ?? (totalIncome - totalExpenses));

  const budgetAllocated = Number(budgetSummary.allocated || 0);
  const budgetUsed = Number(budgetSummary.used || totalExpenses);
  const budgetUsedPercentage =
    budgetAllocated > 0 ? ((budgetUsed / budgetAllocated) * 100).toFixed(1) : 0;

  const totalTransactions = recentTransactions.length;

  const avgExpense =
    recentTransactions.length > 0
      ? recentTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) /
        recentTransactions.length
      : 0;

  const avgIncome =
    monthlyTrend.length > 0
      ? monthlyTrend.reduce((acc, curr) => acc + Number(curr.income || 0), 0) / monthlyTrend.length
      : 0;

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Financial Analytics & Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            In-depth breakdown across income sources, expense categories, and monthly trends.
          </p>
        </div>
      </div>

      {/* Filter Toolbar & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <FaFilter className="text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
            }
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthNames.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-28 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("csv")}
            disabled={exportingFormat === "csv"}
            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 px-5 py-2.5 rounded-2xl font-semibold transition text-sm disabled:opacity-50"
          >
            <FaFileCsv />
            <span>{exportingFormat === "csv" ? "Generating..." : "Export CSV"}</span>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat === "pdf"}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2.5 rounded-2xl font-semibold transition text-sm disabled:opacity-50"
          >
            <FaFilePdf />
            <span>{exportingFormat === "pdf" ? "Generating..." : "Export PDF"}</span>
          </button>

          <button
            onClick={() => handleExport("excel")}
            disabled={exportingFormat === "excel"}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-5 py-2.5 rounded-2xl font-semibold transition text-sm disabled:opacity-50"
          >
            <FaFileExcel />
            <span>{exportingFormat === "excel" ? "Generating..." : "Export Excel"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center text-slate-500 dark:text-slate-400">
          <p className="text-lg font-semibold animate-pulse">Fetching Analytics Dashboard...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</span>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <FaArrowUp />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
                {formatMoney(totalIncome)}
              </h2>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                  <FaArrowDown />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
                {formatMoney(totalExpenses)}
              </h2>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Savings</span>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                  <FaPiggyBank />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
                {formatMoney(netSavings)}
              </h2>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget Usage</span>
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                  <FaWallet />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
                {budgetUsedPercentage}%
              </h2>
            </div>
          </div>

          {/* Activity Highlights */}
          <div className="grid md:grid-cols-3 gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
                <FaExchangeAlt className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Recent Transactions</p>
                <p className="text-xl font-bold">{totalTransactions} Entries</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <FaPercentage className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Avg. Monthly Income</p>
                <p className="text-xl font-bold">{formatMoney(avgIncome)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500">
                <FaLayerGroup className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Avg. Recent Expense</p>
                <p className="text-xl font-bold">{formatMoney(avgExpense)}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <FaChartLine className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Income vs Expense Trajectory</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monthly comparison</p>
                </div>
              </div>

              <div className="h-72 w-full">
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => formatMoney(value)}
                      />
                      <Bar dataKey="income" fill="#10B981" name="Income" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expense" fill="#EF4444" name="Expenses" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No monthly trend data available
                  </div>
                )}
              </div>
            </div>

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
                {categoryAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryAnalysis}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {categoryAnalysis.map((entry, index) => (
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
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No categorical expenses found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}