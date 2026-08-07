import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [dashboardData, setDashboardData] = useState(null);
  const [savingsReport, setSavingsReport] = useState([]);
  const [combinedReport, setCombinedReport] = useState(null);
  const [expenseReport, setExpenseReport] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState({});
  const [expenseExtremes, setExpenseExtremes] = useState(null);
  const monthlyChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const printRef = useRef(null);
  const [activeReportTab, setActiveReportTab] = useState('trend');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter Mode: 'monthly' or 'custom'
  const [filterMode, setFilterMode] = useState('monthly');

  // Date Filters State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getIncomeSourceLabel = (value) => {
    const incomeSourceMap = {
      SALARY: 'Salary',
      FREELANCING: 'Freelancing',
      POCKET_MONEY: 'Pocket Money',
      INVESTMENTS: 'Investments',
      OTHER: 'Other Sources',
      SCHOLARSHIP: 'Scholarship',
      BUSINESS: 'Business',
    };
    if (!value) return 'Income';
    return incomeSourceMap[value] || value || 'Income';
  };

  const getIncomeDisplayTitle = (inc) => {
    const rawTitle = inc.title || '';
    if (!rawTitle || rawTitle.toUpperCase() === rawTitle) {
      return getIncomeSourceLabel(inc.source);
    }
    return rawTitle;
  };

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (filterMode === 'monthly') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (filterMode === 'custom') {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }

      const trendParams = filterMode === 'monthly' ? { all_time: true } : params;

      const [dashRes, savingsRes, combinedRes, expenseRes, incomeRes, trendRes, extremesRes] = await Promise.all([
        api.get('reports/dashboard/', { params }).catch(() => ({ data: {} })),
        api.get('reports/savings-report/').catch(() => ({ data: [] })),
        api.get('reports/combined-report/', { params }).catch(() => ({ data: null })),
        api.get('reports/expense-report/', { params }).catch(() => ({ data: [] })),
        api.get('income/').catch(() => ({ data: [] })),
        api.get('reports/monthly-trend/', { params: trendParams }).catch(() => ({ data: {} })),
        api.get('reports/expense-extremes/', { params }).catch(() => ({ data: null })),
      ]);

      setDashboardData(dashRes.data || {});
      setSavingsReport(Array.isArray(savingsRes.data) ? savingsRes.data : []);
      setCombinedReport(combinedRes.data || null);
      setMonthlyTrend(trendRes.data || {});
      setExpenseExtremes(extremesRes.data || null);

      const rawExpenses = Array.isArray(expenseRes.data) ? expenseRes.data : (expenseRes.data?.results || []);
      const fetchedExpenses = rawExpenses.map(item => ({
        ...item,
        type: 'expense',
        is_income: false,
        display_date: item.date || item.expense_date || item.created_at || 'N/A'
      }));

      const rawIncomes = Array.isArray(incomeRes.data) ? incomeRes.data : (incomeRes.data?.results || []);
      const fetchedIncomes = rawIncomes.map(item => {
        const fallbackSource = item.source === 'OTHER' ? (item.title || 'Other Sources') : getIncomeSourceLabel(item.source);
        return {
          ...item,
          type: 'income',
          is_income: true,
          title: item.title || fallbackSource,
          category: fallbackSource || item.category || 'Income',
          source: item.source,
          source_label: fallbackSource,
          display_date: item.income_date || item.created_at || 'N/A',
          text: item.description || `Income from ${fallbackSource}`
        };
      });

      setExpenseReport(fetchedExpenses);

      const combinedRecentList = [...fetchedExpenses, ...fetchedIncomes].sort((a, b) => {
        const dateA = new Date(a.display_date);
        const dateB = new Date(b.display_date);
        return dateB - dateA;
      });

      setRecentTransactions(combinedRecentList);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load reports data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [selectedMonth, selectedYear, filterMode]);

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    fetchAllReports();
  };

  const handleExportJSON = () => {
    if (!combinedReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(combinedReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Financial_Report_${filterMode}_${selectedMonth}_${selectedYear}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (!combinedReport) return;

    const sections = [];
    sections.push([`Financial Report - ${filterMode === 'monthly' ? `${selectedMonth}/${selectedYear}` : 'Custom Range'}`]);
    sections.push(['Generated At', new Date().toLocaleString()]);
    sections.push([]);

    const fs = combinedReport.financial_summary || {};
    const fsRows = [['Metric', 'Value']];
    Object.entries(fs).forEach(([k, v]) => fsRows.push([k.replace(/_/g, ' ').toUpperCase(), v]));
    sections.push(['Financial Summary']);
    fsRows.forEach(r => sections.push(r));
    sections.push([]);

    const expenses = combinedReport.expense_summary || [];
    sections.push(['Expense Summary']);
    if (expenses.length === 0) {
      sections.push(['No records']);
    } else {
      sections.push(['Title', 'Category', 'Amount', 'Date', 'Description']);
      expenses.forEach((e) => sections.push([e.title || '', e.category || '', e.amount ?? '', e.date || e.expense_date || e.display_date || '', e.description || '']));
    }
    sections.push([]);

    const incomes = combinedReport.income_summary || [];
    sections.push(['Income Summary']);
    if (incomes.length === 0) {
      sections.push(['No records']);
    } else {
      sections.push(['Title', 'Source', 'Amount', 'Date', 'Description']);
      incomes.forEach((i) => sections.push([i.title || i.source_label || '', i.source_label || '', i.amount ?? '', i.income_date || i.created_at || '', i.description || '']));
    }
    sections.push([]);

    const budgets = combinedReport.budget_summary || [];
    sections.push(['Budget Summary']);
    if (budgets.length === 0) {
      sections.push(['No records']);
    } else {
      sections.push(['Category', 'Budget Amount', 'Month', 'Year']);
      budgets.forEach((b) => sections.push([b.category || '', b.budget_amount ?? '', b.month ?? '', b.year ?? '']));
    }
    sections.push([]);

    const savings = combinedReport.savings_summary || [];
    sections.push(['Savings Summary']);
    if (savings.length === 0) {
      sections.push(['No records']);
    } else {
      sections.push(['Goal Name', 'Target Amount', 'Saved Amount', 'Remaining Amount', 'Progress %', 'Status']);
      savings.forEach((s) => sections.push([s.goal_name || '', s.target_amount ?? '', s.saved_amount ?? '', s.remaining_amount ?? '', s.progress_percentage ?? '', s.status || '']));
    }
    sections.push([]);

    const notes = combinedReport.latest_notifications || [];
    sections.push(['Latest Notifications']);
    if (notes.length === 0) {
      sections.push(['No records']);
    } else {
      sections.push(['Title', 'Message', 'Priority', 'Read', 'Created At']);
      notes.forEach((n) => sections.push([n.title || '', n.message || '', n.priority || '', n.is_read ? 'Yes' : 'No', n.created_at || '']));
    }

    const csvContent = sections.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `Financial_Report_${filterMode}_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleExportPDFDownload = async () => {
    if (!combinedReport) return;

    try {
      if (monthlyChartRef.current && monthlyChartRef.current.canvas) {
        monthlyChartRef.current.canvas.dataset.chart = 'monthly';
      }
      if (categoryChartRef.current && categoryChartRef.current.canvas) {
        categoryChartRef.current.canvas.dataset.chart = 'category';
      }
    } catch (e) {
      // ignore
    }

    const filename = `Financial_Report_${filterMode}_${selectedMonth}_${selectedYear}.pdf`;

    const container = document.createElement('div');
    container.style.width = '794px';
    container.style.boxSizing = 'border-box';
    container.style.padding = '18px';
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';
    container.style.color = '#222';
    container.style.background = '#ffffff';

    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .report-table{width:100%;border-collapse:collapse;margin-bottom:8px}
      .report-table th, .report-table td{border:1px solid #dcdcdc;padding:10px 12px;font-size:12px}
      .report-table th{background:#f0f4f8;color:#111;text-align:left}
      .report-section-title{font-size:16px;margin:12px 0 6px 0;color:#111}
      .report-header{background:#fff;color:#111;padding-bottom:8px}
      .report-title{margin:6px 0;color:#111}
      .report-chart{width:100%;max-width:680px;height:auto;display:block;margin:12px auto}
      .report-chart-compact{max-width:520px;max-height:360px;object-fit:contain}
      .report-chart-group{page-break-inside:avoid;break-inside:avoid;display:block;margin-top:16px;margin-bottom:16px}
      .report-chart-title{font-size:14px;margin:8px 0 4px 0;color:#111}
      .report-table thead{display:table-header-group}
      .report-table tbody{display:table-row-group}
      .avoid-break{page-break-inside:avoid;break-inside:avoid}
      @media print {
        .report-chart-group,.avoid-break{page-break-inside:avoid;break-inside:avoid}
      }
    `;
    container.appendChild(styleEl);

    const header = document.createElement('div');
    header.className = 'report-header';
    header.style.textAlign = 'center';
    header.innerHTML = `
      <h2 class="report-title" style="margin:6px 0">BudgetBuddy — Financial Report</h2>
      <div style="font-size:12px;color:#666;margin-bottom:8px">Generated: ${new Date().toLocaleString()}</div>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:8px 0 16px 0" />
    `;
    container.appendChild(header);

    const fs = combinedReport.financial_summary || {};
    const fsTable = document.createElement('table');
    fsTable.className = 'report-table avoid-break';
    fsTable.style.width = '100%';
    fsTable.style.borderCollapse = 'collapse';
    fsTable.innerHTML = `
      <thead>
        <tr><th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Metric</th><th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Value</th></tr>
      </thead>
      <tbody>
        ${Object.entries(fs).map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #eee">${k.replace(/_/g,' ').toUpperCase()}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${v}</td></tr>`).join('')}
      </tbody>
    `;
    container.appendChild(fsTable);

    container.appendChild(document.createElement('br'));

    const expenses = combinedReport.expense_summary || [];
    const expTable = document.createElement('table');
    expTable.className = 'report-table avoid-break';
    expTable.style.width = '100%';
    expTable.style.borderCollapse = 'collapse';
    expTable.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Title</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Category</th>
          <th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Amount</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Date</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.length === 0 ? `<tr><td colspan="4" style="padding:8px;border:1px solid #eee">No expense records</td></tr>` : expenses.map(e => `<tr><td style="padding:8px;border:1px solid #eee">${(e.title||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee">${(e.category||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${e.amount ?? ''}</td><td style="padding:8px;border:1px solid #eee">${e.date || e.expense_date || ''}</td></tr>`).join('')}
      </tbody>
    `;
    const expTitle = document.createElement('div'); expTitle.className = 'report-section-title'; expTitle.innerText = 'Expense Report'; container.appendChild(expTitle);
    container.appendChild(expTable);

    container.appendChild(document.createElement('br'));

    const incomes = combinedReport.income_summary || [];
    const incTable = document.createElement('table');
    incTable.className = 'report-table avoid-break';
    incTable.style.width = '100%';
    incTable.style.borderCollapse = 'collapse';
    incTable.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Title</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Source</th>
          <th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Amount</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Date</th>
        </tr>
      </thead>
      <tbody>
        ${incomes.length === 0 ? `<tr><td colspan="4" style="padding:8px;border:1px solid #eee">No income records</td></tr>` : incomes.map(i => `<tr><td style="padding:8px;border:1px solid #eee">${(i.title||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee">${(i.source_label || getIncomeSourceLabel(i.source) || '').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${i.amount ?? ''}</td><td style="padding:8px;border:1px solid #eee">${i.income_date || i.created_at || ''}</td></tr>`).join('')}
      </tbody>
    `;
    const incTitle = document.createElement('div'); incTitle.className = 'report-section-title'; incTitle.innerText = 'Income Report'; container.appendChild(incTitle);
    container.appendChild(incTable);

    container.appendChild(document.createElement('br'));

    const savings = combinedReport.savings_summary || [];
    const savTable = document.createElement('table');
    savTable.className = 'report-table avoid-break';
    savTable.style.width = '100%';
    savTable.style.borderCollapse = 'collapse';
    savTable.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Goal</th>
          <th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Target</th>
          <th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Saved</th>
          <th style="text-align:right;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Remaining</th>
        </tr>
      </thead>
      <tbody>
        ${savings.length === 0 ? `<tr><td colspan="4" style="padding:8px;border:1px solid #eee">No savings goals</td></tr>` : savings.map(s => `<tr><td style="padding:8px;border:1px solid #eee">${(s.goal_name||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${s.target_amount ?? ''}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${s.saved_amount ?? ''}</td><td style="padding:8px;border:1px solid #eee;text-align:right">${s.remaining_amount ?? ''}</td></tr>`).join('')}
      </tbody>
    `;
    const savTitle = document.createElement('div'); savTitle.className = 'report-section-title'; savTitle.innerText = 'Savings Summary'; container.appendChild(savTitle);
    container.appendChild(savTable);

    container.appendChild(document.createElement('br'));

    const notes = combinedReport.latest_notifications || [];
    const noteTable = document.createElement('table');
    noteTable.className = 'report-table avoid-break';
    noteTable.style.width = '100%';
    noteTable.style.borderCollapse = 'collapse';
    noteTable.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Title</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Message</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Priority</th>
          <th style="text-align:left;padding:8px;background:#f6f8fa;border:1px solid #eaeaea">Created At</th>
        </tr>
      </thead>
      <tbody>
        ${notes.length === 0 ? `<tr><td colspan="4" style="padding:8px;border:1px solid #eee">No notifications</td></tr>` : notes.map(n => `<tr><td style="padding:8px;border:1px solid #eee">${(n.title||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee">${(n.message||'').replace(/</g,'&lt;')}</td><td style="padding:8px;border:1px solid #eee">${n.priority || ''}</td><td style="padding:8px;border:1px solid #eee">${n.created_at || ''}</td></tr>`).join('')}
      </tbody>
    `;
    const noteTitle = document.createElement('div'); noteTitle.className = 'report-section-title'; noteTitle.innerText = 'Latest Notifications'; container.appendChild(noteTitle);
    container.appendChild(noteTable);

    try {
      const chartGroup = document.createElement('div');
      chartGroup.className = 'report-chart-group';
      if (monthlyChartRef.current && typeof monthlyChartRef.current.toBase64Image === 'function') {
        const img = document.createElement('img');
        img.src = monthlyChartRef.current.toBase64Image();
        img.className = 'report-chart';
        const mt = document.createElement('div');
        mt.className = 'report-chart-title';
        mt.innerText = 'Monthly Trend';
        chartGroup.appendChild(mt);
        chartGroup.appendChild(img);
      }
      if (categoryChartRef.current && typeof categoryChartRef.current.toBase64Image === 'function') {
        const img2 = document.createElement('img');
        img2.src = categoryChartRef.current.toBase64Image();
        img2.className = 'report-chart report-chart-compact';
        const cb = document.createElement('div');
        cb.className = 'report-chart-title';
        cb.innerText = 'Category Breakdown';
        chartGroup.appendChild(cb);
        chartGroup.appendChild(img2);
      }
      container.appendChild(chartGroup);
    } catch (err) {
      console.error('embed chart images failed', err);
    }

    document.body.appendChild(container);

    try {
      await html2pdf()
        .set({
          filename,
          margin: 10,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        })
        .from(container)
        .save();
    } catch (err) {
      console.error('html2pdf failed', err);
      const w = window.open('', '_blank');
      w.document.write(container.innerHTML);
      w.document.close();
      w.focus();
      w.print();
    }

    container.remove();
    try {
      if (monthlyChartRef.current && monthlyChartRef.current.canvas) delete monthlyChartRef.current.canvas.dataset.chart;
      if (categoryChartRef.current && categoryChartRef.current.canvas) delete categoryChartRef.current.canvas.dataset.chart;
    } catch (e) {}
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Reports & Analytics 📊">
        <div style={{ textAlign: 'center', padding: '60px', color: '#3498db', fontWeight: 'bold', fontSize: '1.2rem' }}>
          ✨ Fetching Analytics & Recent Activity...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="Reports & Analytics 📊">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ padding: '15px', color: '#e74c3c', backgroundColor: '#fde8e8', borderRadius: '10px', border: '1px solid #f8b4b4', fontWeight: 'bold' }}>
            {error}
          </div>
          <button 
            onClick={fetchAllReports} 
            style={{ marginTop: '15px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3498db', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </MainLayout>
    );
  }

  const financial_summary = dashboardData?.financial_summary || {};
  const category_wise_analysis = dashboardData?.category_wise_analysis || {};
  const monthly_trend = Object.keys(monthlyTrend).length > 0 ? monthlyTrend : (dashboardData?.monthly_trend || {});

  const income = Number(financial_summary.total_income || 0);
  const expense = Number(financial_summary.total_expense || 0);
  const savings = Number(financial_summary.total_savings || 0);
  const balance = Number(financial_summary.current_balance || 0);
  const remainingBudget = Number(financial_summary.remaining_budget || 0);

  // Financial Health Score Calculation (0 - 100)
  const calculateFinancialScore = () => {
    let score = 50; // base score
    if (income > 0) {
      const savingsRate = ((income - expense) / income) * 100;
      if (savingsRate >= 30) score += 30;
      else if (savingsRate >= 20) score += 20;
      else if (savingsRate >= 10) score += 10;
      else if (savingsRate < 0) score -= 20;
    }
    if (remainingBudget >= 0) score += 20;
    else score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateFinancialScore();
  const getScoreStatus = (val) => {
    if (val >= 80) return { label: 'Excellent', color: '#10b981' };
    if (val >= 60) return { label: 'Good', color: '#3b82f6' };
    if (val >= 40) return { label: 'Average', color: '#f59e0b' };
    return { label: 'Needs Improvement', color: '#ef4444' };
  };
  const healthStatus = getScoreStatus(healthScore);

  const categoryLabels = Object.keys(category_wise_analysis);
  const categoryValues = Object.values(category_wise_analysis);

  const monthLabels = Object.keys(monthly_trend);
  const monthValues = Object.values(monthly_trend);

  const generateWrittenInsights = () => {
    const insights = [];

    if (income > 0) {
      const expensePercentage = ((expense / income) * 100).toFixed(1);
      const savingsRate = (((income - expense) / income) * 100).toFixed(1);

      if (expense > income) {
        insights.push({
          type: 'danger',
          title: 'Deficit Alert',
          text: `Your total expenses (₹${expense}) exceed your income (₹${income}) for this period by ₹${expense - income}. Consider reviewing non-essential spending.`
        });
      } else {
        insights.push({
          type: savingsRate >= 20 ? 'success' : 'warning',
          title: 'Savings Ratio',
          text: `You have spent ${expensePercentage}% of your total income. Your net savings rate is sitting at ${savingsRate}%. ${
            savingsRate >= 20 ? 'Great job staying above the recommended 20% savings rule!' : 'Aiming for a 20%+ savings rate will accelerate your long-term goals.'
          }`
        });
      }
    }

    if (categoryLabels.length > 0 && expense > 0) {
      const maxCategoryValue = Math.max(...categoryValues);
      const topCategoryIndex = categoryValues.indexOf(maxCategoryValue);
      const topCategory = categoryLabels[topCategoryIndex];
      const categoryShare = ((maxCategoryValue / expense) * 100).toFixed(1);

      insights.push({
        type: 'info',
        title: 'Top Expense Category',
        text: `Your largest expenditure source is "${topCategory}", accounting for ₹${maxCategoryValue} (${categoryShare}% of your total expenses).`
      });
    }

    if (remainingBudget < 0) {
      insights.push({
        type: 'danger',
        title: 'Over-Budget',
        text: `You have exceeded your total defined budget limit by ₹${Math.abs(remainingBudget)}.`
      });
    } else if (remainingBudget > 0) {
      insights.push({
        type: 'success',
        title: 'Budget Availability',
        text: `You currently have ₹${remainingBudget} remaining in your total allocated budget.`
      });
    }

    return insights;
  };

  const writtenInsights = generateWrittenInsights();

  const categoryDoughnutData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
    datasets: [{
      data: categoryValues.length > 0 ? categoryValues : [1],
      backgroundColor: categoryValues.length > 0 ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2ECC71'] : ['#e2e8f0'],
      borderWidth: 2,
    }],
  };

  const getLast12Months = (endMonth, endYear) => {
    const months = [];
    let m = (endMonth || new Date().getMonth() + 1) - 1;
    let y = endYear || new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      months.unshift({ label: new Date(y, m).toLocaleString('en', { month: 'long' }), month: m + 1, year: y });
      m -= 1;
      if (m < 0) { m = 11; y -= 1; }
    }
    return months;
  };

  const last12 = getLast12Months(selectedMonth, selectedYear);
  const monthLabels12 = last12.map(m => `${m.label}`);
  const monthValues12 = last12.map((mObj) => {
    const longName = mObj.label;
    const shortName = new Date(mObj.year, mObj.month - 1).toLocaleString('en', { month: 'short' });
    const numeric = String(mObj.month);
    const monthYear = `${mObj.month}-${mObj.year}`;
    const longYear = `${longName} ${mObj.year}`;
    return (monthly_trend && (
      monthly_trend[longName] ?? monthly_trend[shortName] ?? monthly_trend[numeric] ?? monthly_trend[monthYear] ?? monthly_trend[longYear]
    )) || 0;
  });

  const monthlyLineData = {
    labels: monthLabels12,
    datasets: [{
      fill: true,
      label: 'Monthly Expense (₹)',
      data: monthValues12,
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.18)',
      tension: 0.4,
    }],
  };

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.88rem',
    fontWeight: '600',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a'
  };

  return (
    <MainLayout pageTitle="Reports & Analytics 📊">
      {/* Custom Scrollbar & Vertical Auto-Scroll Animations */}
      <style>
        {`
          .custom-activity-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .custom-activity-scroll::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.2);
            border-radius: 4px;
          }
          .custom-activity-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.25);
            border-radius: 4px;
          }

          .vertical-scroll-feed {
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: scrollUp 22s linear infinite;
          }

          .vertical-scroll-feed:hover {
            animation-play-state: paused;
          }

          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}
      </style>

      {/* Main Container */}
      <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', fontFamily: "'Inter', sans-serif" }}>
        
        {/* ================= SYMMETRICAL 3x2 TOP SECTION GRID ================= */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          width: '100%'
        }}>
          
          {/* --- TOP ROW (ROW 1) --- */}

          {/* 1. FILTER CONTROLS CARD (TOP-LEFT) */}
          <div style={{ 
            background: '#2b3d4e', 
            padding: '20px', 
            borderRadius: '16px', 
            boxShadow: '0 8px 25px rgba(43, 61, 78, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gap: '16px',
            gridColumn: '1 / 2',
            gridRow: '1 / 2'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎛️</span>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: '700' }}>Filter Controls</h3>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={handleExportJSON}
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: '#ffffff', 
                    padding: '6px 10px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    fontSize: '0.75rem',
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  JSON
                </button>

                <button 
                  onClick={handleExportCSV}
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                    color: '#ffffff', 
                    padding: '6px 10px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    fontSize: '0.75rem',
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  CSV
                </button>

                <button 
                  onClick={handleExportPDFDownload}
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                    color: '#ffffff', 
                    padding: '6px 10px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    fontSize: '0.75rem',
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  PDF
                </button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.35)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => setFilterMode('monthly')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: filterMode === 'monthly' ? '#ffffff' : 'transparent',
                    color: filterMode === 'monthly' ? '#2b3d4e' : '#94a3b8',
                    transition: 'all 0.2s'
                  }}
                >
                  📅 Monthly
                </button>
                <button
                  onClick={() => setFilterMode('custom')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: filterMode === 'custom' ? '#ffffff' : 'transparent',
                    color: filterMode === 'custom' ? '#2b3d4e' : '#94a3b8',
                    transition: 'all 0.2s'
                  }}
                >
                  📆 Custom
                </button>
              </div>

              {filterMode === 'monthly' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    style={{ ...selectStyle, flex: 1 }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('en', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{ ...selectStyle, width: '90px' }}
                  >
                    {[2024, 2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              )}

              {filterMode === 'custom' && (
                <form onSubmit={handleApplyCustomFilter} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      style={{ ...selectStyle, flex: 1, padding: '6px 10px' }} 
                      required
                    />
                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>to</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      style={{ ...selectStyle, flex: 1, padding: '6px 10px' }} 
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ 
                      padding: '8px 14px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      background: 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)', 
                      color: '#ffffff', 
                      fontSize: '0.8rem', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' 
                    }}
                  >
                    Apply Range
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 2. SNAPSHOT CARD 1: INCOME & EXPENSE (TOP-MIDDLE) */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
            borderRadius: '16px', 
            padding: '20px', 
            boxShadow: '0 8px 25px rgba(30, 60, 114, 0.25)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gridColumn: '2 / 3',
            gridRow: '1 / 2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Income & Expense Summary</h3>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.2)', margin: '12px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Income:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4ade80' }}>+₹{income}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Expense:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f87171' }}>-₹{expense}</span>
              </div>
            </div>
          </div>

          {/* --- BOTTOM ROW (ROW 2) --- */}

          {/* 3. SNAPSHOT CARD 2: BALANCE & SAVINGS (BOTTOM-LEFT) */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)', 
            borderRadius: '16px', 
            padding: '20px', 
            boxShadow: '0 8px 25px rgba(74, 0, 224, 0.25)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gridColumn: '1 / 2',
            gridRow: '2 / 3'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💰</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Balance & Savings Goals</h3>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.2)', margin: '12px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Current Balance:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38b6ff' }}>₹{balance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Savings:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f472b6' }}>₹{savings}</span>
              </div>
            </div>
          </div>

          {/* 4. NEW CARD: FINANCIAL HEALTH SCORE CARD (BOTTOM-MIDDLE) */}
          <div style={{ 
            background: '#2b3d4e', 
            borderRadius: '16px', 
            padding: '20px', 
            boxShadow: '0 8px 25px rgba(43, 61, 78, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gridColumn: '2 / 3',
            gridRow: '2 / 3'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: '700' }}>Financial Health Score</h3>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                color: healthStatus.color,
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {healthStatus.label}
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '10px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: healthStatus.color }}>{healthScore}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>/ 100</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${healthScore}%`, background: healthStatus.color, height: '100%', transition: 'width 0.4s ease' }} />
              </div>

              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                {healthScore >= 70 ? 'Keep maintaining high savings & low budget usage!' : 'Consider reducing overall spending to boost score.'}
              </span>
            </div>
          </div>

          {/* 5. EXTENDED RECENT ACTIVITY CARD (RIGHT SIDE SPANNING BOTH ROWS) */}
          <div style={{ 
            background: '#2b3d4e', 
            borderRadius: '16px', 
            padding: '20px', 
            boxShadow: '0 8px 25px rgba(43, 61, 78, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gridColumn: '3 / 4',
            gridRow: '1 / 3'
          }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: '700' }}>Recent Activity</h3>
                </div>
                <span style={{ fontSize: '0.7rem', background: '#38b6ff', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
                  LIVE
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '0 0 12px 0' }} />
            </div>

            {recentTransactions.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '20px 0' }}>
                No recent activity to display.
              </div>
            ) : (
              <div className="custom-activity-scroll" style={{ height: '310px', overflow: 'hidden', position: 'relative' }}>
                <div className="vertical-scroll-feed">
                  {[...recentTransactions, ...recentTransactions].map((item, idx) => {
                    const isIncome = item.is_income;
                    const itemTitle = item.title || (isIncome ? 'Income Source' : 'Expense Item');

                    return (
                      <div 
                        key={idx} 
                        style={{
                          background: 'rgba(15, 23, 42, 0.35)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.82rem' }}>
                            {itemTitle}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            {item.category || 'General'} • {item.display_date}
                          </span>
                        </div>

                        <span style={{ 
                          color: isIncome ? '#38ef7d' : '#ff4b2b', 
                          fontWeight: '800', 
                          fontSize: '0.88rem'
                        }}>
                          {isIncome ? '+' : '-'}₹{item.amount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ================= FINANCIAL SNAPSHOT BAR ================= */}
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#2c3e50', marginBottom: '14px', fontWeight: 'bold' }}>
            ⚡ Financial Breakdown ({filterMode === 'monthly' ? `${selectedMonth}/${selectedYear}` : 'Custom Range'})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', color: 'white', padding: '20px', borderRadius: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.9 }}>TOTAL INCOME</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>₹{income}</h3>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', color: 'white', padding: '20px', borderRadius: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.9 }}>TOTAL EXPENSE</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>₹{expense}</h3>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #2193b0, #6dd5ed)', color: 'white', padding: '20px', borderRadius: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.9 }}>CURRENT BALANCE</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>₹{balance}</h3>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', color: 'white', padding: '20px', borderRadius: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.9 }}>TOTAL SAVINGS</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>₹{savings}</h3>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f857a6, #ff5858)', color: 'white', padding: '20px', borderRadius: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.9 }}>REMAINING BUDGET</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>₹{remainingBudget}</h3>
            </div>
          </div>
        </div>

        {/* ================= EXPENSE REPORT TABLE ================= */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📋 Expense Report ({expenseReport.length} Records)
          </h3>
          {expenseReport.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No expense records found for this selection.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseReport.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{exp.title}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{exp.category}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#ef4444' }}>-₹{exp.amount}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{exp.display_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= INCOME REPORT ================= */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box', marginTop: '24px' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
            💰 Income Report ({(combinedReport?.income_summary || []).length} Records)
          </h3>
          {!(combinedReport?.income_summary || []).length ? (
            <p style={{ color: '#94a3b8' }}>No income records found for this selection.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th style={{ padding: '12px' }}>Source</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedReport?.income_summary?.map((inc) => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{inc.title}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{inc.source_label || inc.title || 'Income'}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#16a34a' }}>+₹{inc.amount}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{inc.income_date || inc.created_at || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= SAVINGS REPORT ================= */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box', marginTop: '24px' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
            🎯 Savings Goal Progress Report
          </h3>
          {savingsReport.length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No active savings goals found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {savingsReport.map((goal) => (
                <div key={goal.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#2c3e50' }}>{goal.goal_name}</strong>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: goal.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7', color: goal.status === 'COMPLETED' ? '#166534' : '#92400e', fontWeight: 'bold' }}>
                      {goal.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                    ₹{goal.saved_amount} of ₹{goal.target_amount} (Remaining: ₹{goal.remaining_amount}) • {goal.days_remaining ?? (goal.target_date ? Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))) : 'N/A')} days left
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(goal.progress_percentage || 0, 100)}%`, backgroundColor: '#3b82f6', height: '100%' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                    {goal.progress_percentage}% Saved
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= CHARTS & EXPENSE EXTREMES ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>🍩 Category Breakdown</h3>
            <div style={{ height: '220px' }}>
              <Doughnut ref={categoryChartRef} data={categoryDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>📈 Expense Trend & Extremes</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['trend', 'extremes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveReportTab(tab)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: activeReportTab === tab ? '#2b3d4e' : 'transparent',
                      color: activeReportTab === tab ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tab === 'trend' ? 'Monthly Trend' : 'Expense Extremes'}
                  </button>
                ))}
              </div>
            </div>

            {activeReportTab === 'trend' ? (
              <div style={{ height: '260px' }}>
                <Line ref={monthlyChartRef} data={monthlyLineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {expenseExtremes ? [
                  { label: 'Highest Expense', value: expenseExtremes.highest_expense },
                  { label: 'Lowest Expense', value: expenseExtremes.lowest_expense },
                  { label: 'Latest Expense', value: expenseExtremes.latest_expense },
                  { label: 'Oldest Expense', value: expenseExtremes.oldest_expense },
                ].map((item) => (
                  <div key={item.label} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>{item.label}</p>
                    {item.value ? (
                      <>
                        <p style={{ margin: '0', fontSize: '1rem', fontWeight: '800', color: '#1f2937' }}>₹{item.value.amount}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>{item.value.title}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{item.value.date || item.value.display_date}</p>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>N/A</p>
                    )}
                  </div>
                )) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No expense extremes available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= INSIGHTS ================= */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.3rem' }}>💡</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2c3e50', fontWeight: 'bold' }}>
              Key Financial Insights & Observations
            </h3>
          </div>

          {writtenInsights.length === 0 ? (
            <p style={{ color: '#94a3b8', margin: 0 }}>Add income and expenses to generate custom written insights.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {writtenInsights.map((item, idx) => {
                const isDanger = item.type === 'danger';
                const isSuccess = item.type === 'success';
                const isWarning = item.type === 'warning';

                const bgColor = isDanger ? '#fef2f2' : isSuccess ? '#f0fdf4' : isWarning ? '#fffbebf' : '#f8fafc';
                const borderColor = isDanger ? '#fca5a5' : isSuccess ? '#86efac' : isWarning ? '#fde047' : '#cbd5e1';
                const titleColor = isDanger ? '#991b1b' : isSuccess ? '#166534' : isWarning ? '#854d0e' : '#1e293b';

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      backgroundColor: bgColor, 
                      border: `1px solid ${borderColor}`, 
                      borderRadius: '12px', 
                      padding: '16px' 
                    }}
                  >
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: titleColor, fontWeight: '700' }}>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.4' }}>
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

export default Reports;