import { useState } from 'react';

function AnalyticsCharts({ incomes, expenses, budgets, savings, theme, CATEGORIES }) {
  const [filterType, setFilterType] = useState('month'); // 'week', 'month', 'year', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null); // 'income' or 'expense'

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const inputBg = isDark
    ? 'bg-slate-950/50 border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 text-white'
    : 'bg-slate-100 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 text-slate-900 focus:bg-white';
  const secondaryText = isDark ? 'text-slate-400' : 'text-slate-500';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  // 1. Dynamic filtering logic
  const getFilteredData = () => {
    const now = new Date();
    let start = null;
    let end = null;

    if (filterType === 'week') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (filterType === 'month') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (filterType === 'year') {
      start = new Date();
      start.setDate(now.getDate() - 365);
      start.setHours(0, 0, 0, 0);
    } else if (filterType === 'custom') {
      if (startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    const parseDate = (dStr) => (dStr ? new Date(dStr) : new Date(0));

    const filteredIncomes = incomes.filter(inc => {
      const d = parseDate(inc.income_date);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const filteredExpenses = expenses.filter(exp => {
      const d = parseDate(exp.date);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    return { filteredIncomes, filteredExpenses };
  };

  const { filteredIncomes, filteredExpenses } = getFilteredData();

  const totalIncome = filteredIncomes.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // 2. Chart data prep - Category breakdown
  const categoryTotals = {};
  CATEGORIES.forEach(cat => { categoryTotals[cat] = 0; });
  filteredExpenses.forEach(exp => {
    const cat = exp.category;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += parseFloat(exp.amount || 0);
    } else if (categoryTotals['MISCELLANEOUS'] !== undefined) {
      categoryTotals['MISCELLANEOUS'] += parseFloat(exp.amount || 0);
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + parseFloat(exp.amount || 0);
    }
  });

  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
  const totalExp = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const donutSegments = [];
  let accumulatedPercent = 0;
  if (totalExp > 0) {
    Object.entries(categoryTotals).forEach(([cat, amt], idx) => {
      if (amt > 0) {
        const percentage = amt / totalExp;
        donutSegments.push({
          category: cat,
          amount: amt,
          percentage: percentage * 100,
          color: colors[idx % colors.length],
          dashArray: `${percentage * 314.16} 314.16`,
          dashOffset: -accumulatedPercent * 314.16,
        });
        accumulatedPercent += percentage;
      }
    });
  }

  // 3. Chart data prep - Trend line chart
  const getTrendData = () => {
    const dataMap = {};
    if (filterType === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dataMap[dateStr] = { label: d.toLocaleDateString(undefined, { weekday: 'short' }), amount: 0, date: dateStr };
      }
    } else if (filterType === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dataMap[dateStr] = { label: d.getDate().toString(), amount: 0, date: dateStr };
      }
    } else if (filterType === 'year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        dataMap[yearMonth] = { label: d.toLocaleDateString(undefined, { month: 'short' }), amount: 0, date: yearMonth };
      }
    } else {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45) {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dataMap[dateStr] = { label: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), amount: 0, date: dateStr };
          }
        } else {
          for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            dataMap[yearMonth] = { label: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), amount: 0, date: yearMonth };
          }
        }
      } else {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dataMap[dateStr] = { label: d.toLocaleDateString(undefined, { weekday: 'short' }), amount: 0, date: dateStr };
        }
      }
    }

    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (filterType === 'year') {
        const yearMonth = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        if (dataMap[yearMonth]) dataMap[yearMonth].amount += parseFloat(exp.amount || 0);
      } else if (filterType === 'custom') {
        const keys = Object.keys(dataMap);
        if (keys[0] && keys[0].includes('-') && keys[0].length === 7) {
          const yearMonth = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
          if (dataMap[yearMonth]) dataMap[yearMonth].amount += parseFloat(exp.amount || 0);
        } else {
          const dateStr = exp.date;
          if (dataMap[dateStr]) dataMap[dateStr].amount += parseFloat(exp.amount || 0);
        }
      } else {
        const dateStr = exp.date;
        if (dataMap[dateStr]) dataMap[dateStr].amount += parseFloat(exp.amount || 0);
      }
    });

    return Object.values(dataMap);
  };

  const trendData = getTrendData();
  const maxAmount = Math.max(...trendData.map(d => d.amount), 10);
  const linePoints = trendData.map((d, idx) => {
    const x = 50 + (idx / Math.max(trendData.length - 1, 1)) * 420;
    const y = 170 - (d.amount / maxAmount) * 140;
    return { x, y, label: d.label, amount: d.amount, date: d.date };
  });

  const linePath = linePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = linePoints.length > 0
    ? `${linePath} L ${linePoints[linePoints.length - 1].x} 170 L ${linePoints[0].x} 170 Z`
    : '';

  // 4. Budget vs Actual logic
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const budgetComparison = budgets.map(b => {
    // Sum actual expenses in filtered list matching category and month (if month matches current month, or all-time)
    const spent = filteredExpenses
      .filter(exp => exp.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    return {
      category: b.category,
      limit: parseFloat(b.limit_amount),
      spent: spent,
      month: b.month,
      percent: b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0
    };
  }).filter(item => {
    // Only show current month budgets if filtering by week/month, otherwise show all active
    if (filterType === 'month' || filterType === 'week') {
      return item.month.toLowerCase() === currentMonthName.toLowerCase();
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Filters Control Header */}
      <div className={`p-5 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${cardBg}`}>
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center space-x-2">
            <span>📈</span> <span>Financial Analytics & Charts</span>
          </h2>
          <p className={`text-xs mt-1 ${secondaryText}`}>Analyze your spending habits, budgets, and savings progress.</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['week', 'month', 'year', 'custom'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 capitalize cursor-pointer ${
                filterType === type
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'week' ? 'This Week' : type === 'month' ? 'This Month' : type === 'year' ? 'This Year' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker Inputs */}
      {filterType === 'custom' && (
        <div className={`p-5 border rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn transition-all duration-300 ${cardBg}`}>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
            />
          </div>
        </div>
      )}

      {/* Summary Cards for Filtered Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${cardBg}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Filtered Income</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">₹{totalIncome.toFixed(2)}</div>
          </div>
          <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">💵</span>
        </div>
        <div className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${cardBg}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Filtered Expense</span>
            <div className="text-2xl font-black text-rose-500 mt-1">₹{totalExpense.toFixed(2)}</div>
          </div>
          <span className="text-2xl p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">💸</span>
        </div>
        <div className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${cardBg}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Net Savings</span>
            <div className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ₹{balance.toFixed(2)}
            </div>
          </div>
          <span className={`text-2xl p-2.5 rounded-xl ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {balance >= 0 ? '🐷' : '⚠️'}
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Line Chart: Monthly/Daily Spending Trend (Span 8) */}
        <div className={`lg:col-span-8 border rounded-2xl p-6 relative transition-all duration-300 ${cardBg}`}>
          <h3 className="text-sm font-black mb-5 uppercase tracking-wider flex items-center space-x-2">
            <span>📈</span> <span>Spending Trend Over Time</span>
          </h3>

          {trendData.length === 0 || maxAmount === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-500">
              No expense data recorded in this period.
            </div>
          ) : (
            <div className="relative">
              <svg viewBox="0 0 500 200" className="w-full h-52 overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y Grid Lines */}
                <line x1="50" y1="30" x2="470" y2="30" stroke={gridColor} strokeDasharray="3 3" />
                <line x1="50" y1="100" x2="470" y2="100" stroke={gridColor} strokeDasharray="3 3" />
                <line x1="50" y1="170" x2="470" y2="170" stroke={gridColor} />

                {/* Y-Axis Labels */}
                <text x="42" y="34" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">₹{Math.round(maxAmount)}</text>
                <text x="42" y="104" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">₹{Math.round(maxAmount / 2)}</text>
                <text x="42" y="174" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">₹0</text>

                {/* Area under the line */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {/* Main Trend Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Plot Points */}
                {linePoints.map((p, idx) => (
                  <g key={idx} className="group">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#f43f5e"
                      stroke={isDark ? '#0f172a' : '#ffffff'}
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-150 hover:r-6.5"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* X-Axis labels (spaced depending on filters) */}
                    {(trendData.length <= 12 || idx % Math.ceil(trendData.length / 10) === 0 || idx === trendData.length - 1) && (
                      <text x={p.x} y="188" textAnchor="middle" className="text-[9px] fill-slate-400 font-bold">
                        {p.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Line Chart Tooltip */}
              {hoveredPoint && (
                <div
                  className={`absolute p-2.5 rounded-xl border text-xs shadow-xl pointer-events-none transition-all duration-150 z-10 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  style={{
                    left: `${Math.min(Math.max((hoveredPoint.x / 500) * 100 - 10, 2), 80)}%`,
                    top: `${Math.max((hoveredPoint.y / 200) * 100 - 30, 0)}%`,
                  }}
                >
                  <div className="font-bold mb-0.5">{hoveredPoint.date}</div>
                  <div className="text-rose-500 font-extrabold">₹{hoveredPoint.amount.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bar Chart: Income vs Expense (Span 4) */}
        <div className={`lg:col-span-4 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${cardBg}`}>
          <div>
            <h3 className="text-sm font-black mb-5 uppercase tracking-wider flex items-center space-x-2">
              <span>📊</span> <span>Income vs Expense</span>
            </h3>
          </div>

          <div className="relative flex items-center justify-center py-4">
            {totalIncome === 0 && totalExpense === 0 ? (
              <div className="h-44 flex items-center justify-center text-sm text-slate-500">No income or expense data.</div>
            ) : (
              <div className="w-full">
                {(() => {
                  const maxVal = Math.max(totalIncome, totalExpense, 1);
                  const incHeight = (totalIncome / maxVal) * 140;
                  const expHeight = (totalExpense / maxVal) * 140;

                  return (
                    <div className="relative">
                      <svg viewBox="0 0 200 180" className="w-full h-44 overflow-visible">
                        {/* Grid lines */}
                        <line x1="30" y1="20" x2="180" y2="20" stroke={gridColor} strokeDasharray="3 3" />
                        <line x1="30" y1="85" x2="180" y2="85" stroke={gridColor} strokeDasharray="3 3" />
                        <line x1="30" y1="150" x2="180" y2="150" stroke={gridColor} />

                        {/* Y Labels */}
                        <text x="25" y="24" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">₹{Math.round(maxVal)}</text>
                        <text x="25" y="89" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">₹{Math.round(maxVal / 2)}</text>
                        <text x="25" y="154" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">₹0</text>

                        {/* Income Bar */}
                        <rect
                          x="55"
                          y={150 - incHeight}
                          width="30"
                          height={incHeight}
                          fill="url(#barIncomeGrad)"
                          rx="4"
                          className="cursor-pointer transition-all duration-200 hover:opacity-85"
                          onMouseEnter={() => setHoveredBar({ type: 'Income', amount: totalIncome })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {/* Expense Bar */}
                        <rect
                          x="115"
                          y={150 - expHeight}
                          width="30"
                          height={expHeight}
                          fill="url(#barExpenseGrad)"
                          rx="4"
                          className="cursor-pointer transition-all duration-200 hover:opacity-85"
                          onMouseEnter={() => setHoveredBar({ type: 'Expense', amount: totalExpense })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {/* X Labels */}
                        <text x="70" y="166" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">Income</text>
                        <text x="130" y="166" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">Expense</text>

                        <defs>
                          <linearGradient id="barIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="barExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#e11d48" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Tooltip for Bar Chart */}
                      {hoveredBar && (
                        <div
                          className={`absolute px-2.5 py-1.5 rounded-xl border text-xs shadow-xl pointer-events-none transition-all duration-150 z-10 bottom-24 ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                          style={{
                            left: hoveredBar.type === 'Income' ? '25%' : '55%',
                          }}
                        >
                          <div className="font-bold">{hoveredBar.type}</div>
                          <div className={`font-extrabold ${hoveredBar.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ₹{hoveredBar.amount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Expense Breakdown & Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Donut Chart: Expense Category Breakdown */}
        <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
          <h3 className="text-sm font-black mb-6 uppercase tracking-wider flex items-center space-x-2">
            <span>🍰</span> <span>Expense Breakdown by Category</span>
          </h3>

          {totalExp === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-500">No expense records found.</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Donut SVG Ring */}
              <div className="relative">
                <svg viewBox="0 0 160 160" className="w-40 h-40">
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="80"
                      cy="80"
                      r="50"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="15"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      transform="rotate(-90 80 80)"
                      className="transition-all duration-200 hover:stroke-[18px] cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(seg)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  ))}
                  <circle cx="80" cy="80" r="40" fill={isDark ? '#0f172a' : '#ffffff'} />
                  
                  {/* Text labels inside the donut */}
                  <text x="80" y="74" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider">
                    {hoveredCategory ? hoveredCategory.category : 'Total'}
                  </text>
                  <text x="80" y="93" textAnchor="middle" className="text-sm font-black fill-slate-200">
                    ₹{hoveredCategory ? hoveredCategory.amount.toFixed(0) : totalExp.toFixed(0)}
                  </text>
                </svg>
              </div>

              {/* Legends list */}
              <div className="space-y-2.5 w-full sm:w-1/2 max-h-48 overflow-y-auto pr-2">
                {Object.entries(categoryTotals).map(([cat, amt], idx) => {
                  if (amt === 0) return null;
                  const percent = ((amt / totalExp) * 100).toFixed(1);
                  const isHovered = hoveredCategory && hoveredCategory.category === cat;
                  
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-xs p-1.5 rounded-lg border transition-all ${
                        isHovered
                          ? isDark
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-slate-100 border-slate-200 font-bold'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                        <span className="font-semibold">{cat}</span>
                      </div>
                      <span className={`${secondaryText} font-bold`}>₹{amt.toFixed(0)} ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Budget vs Actual Spending Progress list */}
        <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
          <h3 className="text-sm font-black mb-6 uppercase tracking-wider flex items-center space-x-2">
            <span>🎯</span> <span>Budget vs Actual Spending</span>
          </h3>

          {budgetComparison.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-500 text-center">
              No budgets matching this period.<br />Define category budgets in the "Budget Limits" panel.
            </div>
          ) : (
            <div className="space-y-5 max-h-56 overflow-y-auto pr-2">
              {budgetComparison.map((item, idx) => {
                const isOver = item.spent > item.limit;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center space-x-2">
                        <span>{item.category}</span>
                        {isOver && (
                          <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[8px] uppercase tracking-wider animate-pulse">
                            Over Budget
                          </span>
                        )}
                      </span>
                      <span className={secondaryText}>
                        ₹{item.spent.toFixed(2)} / <span className="text-rose-500">₹{item.limit.toFixed(2)}</span> ({item.percent}%)
                      </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className={`w-full rounded-full h-3 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-red-500' : item.percent > 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Row 3: Savings Progress */}
      <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
        <h3 className="text-sm font-black mb-6 uppercase tracking-wider flex items-center space-x-2">
          <span>🐷</span> <span>Savings Progress Goals</span>
        </h3>

        {savings.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-sm text-slate-500">
            No savings goals established yet. Define goals in the "Savings Goals" panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savings.map((goal) => {
              const saved = parseFloat(goal.saved_amount || 0);
              const target = parseFloat(goal.target_amount || 1);
              const percent = Math.min(Math.round((saved / target) * 100), 100);
              
              // SVG circular progress details
              const radius = 35;
              const circum = 2 * Math.PI * radius; // 219.9
              const strokeOffset = circum - (percent / 100) * circum;

              return (
                <div
                  key={goal.id}
                  className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.02] ${
                    isDark ? 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-900/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="text-sm font-extrabold truncate">{goal.goal_name}</h4>
                    <p className={`text-[10px] ${secondaryText}`}>Target Date: {goal.deadline}</p>
                    <div className="text-xs">
                      <span className="font-extrabold text-emerald-500">₹{saved.toFixed(0)}</span>
                      <span className={`text-[10px] ${secondaryText}`}> of ₹{target.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Circular Dial Indicator */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 90 90" className="w-16 h-16">
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke={isDark ? '#1e293b' : '#e2e8f0'}
                        strokeWidth="7"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke="url(#dialSavingsGrad)"
                        strokeWidth="7"
                        strokeDasharray={circum}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 45 45)"
                        className="transition-all duration-500 ease-out"
                      />
                      <defs>
                        <linearGradient id="dialSavingsGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-xs font-black fill-slate-200">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsCharts;
