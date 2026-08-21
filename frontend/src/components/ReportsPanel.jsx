import { useState, useEffect } from 'react';
import { reportService } from '../services/api';

function ReportsPanel({ theme, CATEGORIES, getCategoryLabel }) {
  const getStartOfCurrentMonth = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [filterType, setFilterType] = useState('current_month'); // 'current_month', 'previous_month', 'custom'
  const [startDate, setStartDate] = useState(getStartOfCurrentMonth());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const inputBg = isDark
    ? 'bg-slate-950/50 border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 text-white'
    : 'bg-slate-100 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 text-slate-900 focus:bg-white';
  const selectBg = isDark
    ? 'bg-slate-950/50 border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 text-white'
    : 'bg-slate-100 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 text-slate-900 focus:bg-white';
  const secondaryText = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderColor = isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200';
  const tableRowBorder = isDark ? 'divide-slate-850' : 'divide-slate-100';

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportService.getCombinedReport(filterType, startDate, endDate);
      setReportData(data);
    } catch {
      setError('Failed to generate report for the selected range.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterType !== 'custom' || (startDate && endDate)) {
      fetchReport();
    }
  }, [filterType, startDate, endDate]);

  const handleExport = async (format) => {
    try {
      const data = await reportService.exportReport(format, filterType, startDate, endDate);
      
      let filename = `financial_report_${filterType}`;
      if (filterType === 'custom') {
        filename += `_${startDate}_to_${endDate}`;
      } else {
        const d = new Date();
        filename += `_${d.getFullYear()}_${d.getMonth() + 1}`;
      }

      if (format === 'csv') {
        // Handle CSV blob download
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.setAttribute('download', `${filename}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch {
      setError(`Failed to export report as ${format.toUpperCase()}.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className={`p-6 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${cardBg}`}>
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center space-x-2">
            <span>📋</span> <span>Financial Reports & Data Exports</span>
          </h2>
          <p className={`text-xs mt-1 ${secondaryText}`}>Generate consolidated monthly financial reports and download your raw records.</p>
        </div>

        {/* Range Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { type: 'current_month', label: 'Current Month' },
            { type: 'previous_month', label: 'Previous Month' },
            { type: 'custom', label: 'Custom Period' }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => setFilterType(item.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                filterType === item.type
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Pickers for Custom Range */}
      {filterType === 'custom' && (
        <div className={`p-5 border rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn transition-all duration-300 ${cardBg}`}>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
            />
          </div>
        </div>
      )}

      {error && (
        <div className={`p-4 border rounded-xl text-sm flex items-center justify-between transition-all ${
          isDark ? 'bg-red-950/40 border-red-900/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-900 font-bold ml-2 cursor-pointer">×</button>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className={`text-sm ${secondaryText}`}>Compiling financial summary...</span>
        </div>
      ) : reportData ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${cardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Income</span>
              <div className="text-xl font-black text-emerald-500 mt-1">₹{reportData.financial_summary.total_income.toFixed(2)}</div>
            </div>
            <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${cardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Expense</span>
              <div className="text-xl font-black text-rose-500 mt-1">₹{reportData.financial_summary.total_expense.toFixed(2)}</div>
            </div>
            <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${cardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Savings Dial</span>
              <div className="text-xl font-black text-pink-500 mt-1">₹{reportData.financial_summary.total_savings.toFixed(2)}</div>
            </div>
            <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${cardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Remaining Budget</span>
              <div className="text-xl font-black text-indigo-500 mt-1">₹{reportData.financial_summary.remaining_budget.toFixed(2)}</div>
            </div>
            <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${cardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Net Flow</span>
              <div className={`text-xl font-black mt-1 ${reportData.financial_summary.current_balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ₹{reportData.financial_summary.current_balance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Export Controls */}
          <div className={`p-5 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${cardBg}`}>
            <div>
              <span className="font-extrabold text-sm flex items-center gap-1.5">
                <span>📂</span> Export Options
              </span>
              <p className={`text-xs mt-1 ${secondaryText}`}>Download records compiled inside this period filter.</p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-md hover:shadow-emerald-500/10"
              >
                Download CSV 📊
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-md hover:shadow-indigo-500/10"
              >
                Download JSON ⚙️
              </button>
            </div>
          </div>

          {/* Tabular Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incomes Table */}
            <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
              <h3 className="text-sm font-black mb-4 uppercase tracking-wider">Incomes logged</h3>
              {reportData.income_summary.length === 0 ? (
                <p className={`text-xs ${secondaryText}`}>No incomes tracked in this range.</p>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b uppercase font-bold tracking-wider ${tableHeaderColor}`}>
                        <th className="pb-2">Title</th>
                        <th className="pb-2">Source</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowBorder}`}>
                      {reportData.income_summary.map((inc, i) => (
                        <tr key={i} className="hover:bg-slate-800/5">
                          <td className="py-2.5 font-bold">{inc.title}</td>
                          <td className="py-2.5 font-semibold text-slate-400">{inc.source}</td>
                          <td className="py-2.5 text-slate-500">{inc.date}</td>
                          <td className="py-2.5 text-right font-black text-emerald-500">₹{inc.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expenses Table */}
            <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
              <h3 className="text-sm font-black mb-4 uppercase tracking-wider">Expenses logged</h3>
              {reportData.expense_summary.length === 0 ? (
                <p className={`text-xs ${secondaryText}`}>No expenses logged in this range.</p>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b uppercase font-bold tracking-wider ${tableHeaderColor}`}>
                        <th className="pb-2">Details</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowBorder}`}>
                      {reportData.expense_summary.map((exp, i) => (
                        <tr key={i} className="hover:bg-slate-800/5">
                          <td className="py-2.5 font-bold truncate max-w-[120px]">{exp.title}</td>
                          <td className="py-2.5 font-semibold text-slate-400">{getCategoryLabel(exp.category)}</td>
                          <td className="py-2.5 text-slate-500">{exp.date}</td>
                          <td className="py-2.5 text-right font-black text-rose-500">₹{exp.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Budgets Progress Table */}
            <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
              <h3 className="text-sm font-black mb-4 uppercase tracking-wider">Budgets Limit Utilization</h3>
              {reportData.budget_summary.length === 0 ? (
                <p className={`text-xs ${secondaryText}`}>No budgets configured for this period.</p>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b uppercase font-bold tracking-wider ${tableHeaderColor}`}>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Limit</th>
                        <th className="pb-2">Spent</th>
                        <th className="pb-2 text-right">Spent %</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowBorder}`}>
                      {reportData.budget_summary.map((b, i) => {
                        const isOver = b.spent_amount > b.limit_amount;
                        return (
                          <tr key={i} className="hover:bg-slate-800/5">
                            <td className="py-2.5 font-bold flex items-center space-x-1.5">
                              <span>{getCategoryLabel(b.category)}</span>
                              {isOver && <span className="text-[8px] px-1 bg-red-500/10 text-red-500 rounded uppercase font-bold">Over</span>}
                            </td>
                            <td className="py-2.5 text-slate-400">₹{b.limit_amount.toFixed(0)}</td>
                            <td className="py-2.5 text-slate-400">₹{b.spent_amount.toFixed(0)}</td>
                            <td className={`py-2.5 text-right font-black ${isOver ? 'text-red-500' : 'text-rose-500'}`}>
                              {b.progress_percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Savings Goals progress Table */}
            <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
              <h3 className="text-sm font-black mb-4 uppercase tracking-wider">Savings Goal Summaries</h3>
              {reportData.savings_summary.length === 0 ? (
                <p className={`text-xs ${secondaryText}`}>No savings goals tracked.</p>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b uppercase font-bold tracking-wider ${tableHeaderColor}`}>
                        <th className="pb-2">Goal Name</th>
                        <th className="pb-2">Target</th>
                        <th className="pb-2">Saved</th>
                        <th className="pb-2 text-right">Completion</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowBorder}`}>
                      {reportData.savings_summary.map((g, i) => (
                        <tr key={i} className="hover:bg-slate-800/5">
                          <td className="py-2.5 font-bold">{g.goal_name}</td>
                          <td className="py-2.5 text-slate-400">₹{g.target_amount.toFixed(0)}</td>
                          <td className="py-2.5 text-emerald-500 font-bold">₹{g.saved_amount.toFixed(0)}</td>
                          <td className="py-2.5 text-right font-black text-indigo-500">{g.progress_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className={`text-center py-12 text-sm ${secondaryText}`}>No report compiled inside this range.</p>
      )}
    </div>
  );
}

export default ReportsPanel;
