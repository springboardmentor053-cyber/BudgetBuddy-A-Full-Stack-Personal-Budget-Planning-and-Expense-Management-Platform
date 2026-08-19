import { useState } from "react";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/reports.css";

function Reports() {

  const today = new Date();

  // =====================================================
  // MONTHLY REPORT STATE
  // =====================================================

  const [month, setMonth] = useState(
    today.getMonth() + 1
  );

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [monthlyReport, setMonthlyReport] =
    useState(null);

  const [monthlyLoading, setMonthlyLoading] =
    useState(false);


  // =====================================================
  // EXPENSE REPORT STATE
  // =====================================================

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [expenseReport, setExpenseReport] =
    useState([]);

  const [expenseLoading, setExpenseLoading] =
    useState(false);


  // =====================================================
  // SAVINGS REPORT STATE
  // =====================================================

  const [savingsReport, setSavingsReport] =
    useState([]);

  const [savingsLoading, setSavingsLoading] =
    useState(false);


  // =====================================================
  // FINANCIAL SUMMARY STATE
  // =====================================================

  const [summaryReport, setSummaryReport] =
    useState(null);

  const [summaryFilter, setSummaryFilter] =
    useState("current_month");

  const [summaryLoading, setSummaryLoading] =
    useState(false);


  // =====================================================
  // EXPORT DATA STATE
  // =====================================================

  const [exportData, setExportData] = useState(null);

  const [exportLoading, setExportLoading] =
    useState(false);


  // =====================================================
  // MONTHLY REPORT
  // =====================================================

  const generateMonthlyReport = async () => {

    setMonthlyLoading(true);

    try {

      const response = await api.get(
        `reports/monthly/?month=${month}&year=${year}`
      );

      setMonthlyReport(response.data);

    } catch (error) {

      console.error(
        "Monthly report error:",
        error
      );

      if (error.response) {
        alert(
          JSON.stringify(error.response.data)
        );
      } else {
        alert(error.message);
      }

    } finally {

      setMonthlyLoading(false);

    }

  };


  // =====================================================
  // EXPENSE REPORT
  // =====================================================

  const generateExpenseReport = async () => {

    if (startDate && endDate && startDate > endDate) {

      alert(
        "Start date cannot be after end date."
      );

      return;

    }

    setExpenseLoading(true);

    try {

      let url = "reports/expenses/";

      if (startDate && endDate) {

        url +=
          `?start_date=${startDate}&end_date=${endDate}`;

      }

      const response = await api.get(url);

      setExpenseReport(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Expense report error:",
        error
      );

      if (error.response) {
        alert(
          JSON.stringify(error.response.data)
        );
      } else {
        alert(error.message);
      }

    } finally {

      setExpenseLoading(false);

    }

  };


  // =====================================================
  // SAVINGS REPORT
  // =====================================================

  const generateSavingsReport = async () => {

    setSavingsLoading(true);

    try {

      const response = await api.get(
        "reports/savings/"
      );

      setSavingsReport(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Savings report error:",
        error
      );

      if (error.response) {
        alert(
          JSON.stringify(error.response.data)
        );
      } else {
        alert(error.message);
      }

    } finally {

      setSavingsLoading(false);

    }

  };


  // =====================================================
  // FINANCIAL SUMMARY
  // =====================================================

  const generateSummaryReport = async () => {

    setSummaryLoading(true);

    try {

      const response = await api.get(
        `reports/summary/?filter=${summaryFilter}`
      );

      setSummaryReport(response.data);

    } catch (error) {

      console.error(
        "Financial summary error:",
        error
      );

      if (error.response) {
        alert(
          JSON.stringify(error.response.data)
        );
      } else {
        alert(error.message);
      }

    } finally {

      setSummaryLoading(false);

    }

  };


  // =====================================================
  // FETCH COMPLETE EXPORT DATA
  // =====================================================

  const fetchExportData = async () => {

    if (exportData) {
      return exportData;
    }

    setExportLoading(true);

    try {

      const response = await api.get(
        "reports/export/"
      );

      setExportData(response.data);

      return response.data;

    } catch (error) {

      console.error(
        "Export data error:",
        error
      );

      if (error.response) {
        alert(
          JSON.stringify(error.response.data)
        );
      } else {
        alert(error.message);
      }

      return null;

    } finally {

      setExportLoading(false);

    }

  };


  // =====================================================
  // JSON EXPORT
  // =====================================================

  const exportJSON = async () => {

    const data = await fetchExportData();

    if (!data) {
      return;
    }

    const jsonData =
      JSON.stringify(
        data,
        null,
        2
      );

    const blob = new Blob(
      [jsonData],
      {
        type: "application/json"
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "BudgetBuddy_Report.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  };


  // =====================================================
  // CSV HELPER
  // =====================================================

  const escapeCSV = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const stringValue =
      String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {

      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;

    }

    return stringValue;

  };


  // =====================================================
  // CSV EXPORT
  // =====================================================

  const exportCSV = async () => {

    const data = await fetchExportData();

    if (!data) {
      return;
    }


    const rows = [];


    // -------------------------------------------------
    // FINANCIAL SUMMARY
    // -------------------------------------------------

    rows.push([
      "FINANCIAL SUMMARY"
    ]);

    rows.push([
      "Total Income",
      data.financial_summary?.total_income ?? 0
    ]);

    rows.push([
      "Total Expense",
      data.financial_summary?.total_expense ?? 0
    ]);

    rows.push([
      "Current Balance",
      data.financial_summary?.current_balance ?? 0
    ]);

    rows.push([
      "Remaining Budget",
      data.financial_summary?.remaining_budget ?? 0
    ]);

    rows.push([
      "Total Savings",
      data.financial_summary?.total_savings ?? 0
    ]);

    rows.push([]);


    // -------------------------------------------------
    // EXPENSES
    // -------------------------------------------------

    rows.push([
      "EXPENSES"
    ]);

    rows.push([
      "Title",
      "Category",
      "Amount",
      "Date"
    ]);

    if (
      Array.isArray(data.expenses)
    ) {

      data.expenses.forEach(
        (expense) => {

          rows.push([
            expense.title,
            expense.category,
            expense.amount,
            expense.date
          ]);

        }
      );

    }

    rows.push([]);


    // -------------------------------------------------
    // INCOME
    // -------------------------------------------------

    rows.push([
      "INCOME"
    ]);

    rows.push([
      "Title",
      "Source",
      "Amount",
      "Date"
    ]);

    if (
      Array.isArray(data.income)
    ) {

      data.income.forEach(
        (income) => {

          rows.push([
            income.title,
            income.source,
            income.amount,
            income.income_date
          ]);

        }
      );

    }

    rows.push([]);


    // -------------------------------------------------
    // BUDGETS
    // -------------------------------------------------

    rows.push([
      "BUDGETS"
    ]);

    rows.push([
      "Category",
      "Budget Amount",
      "Month",
      "Year"
    ]);

    if (
      Array.isArray(data.budgets)
    ) {

      data.budgets.forEach(
        (budget) => {

          rows.push([
            budget.category,
            budget.budget_amount,
            budget.month,
            budget.year
          ]);

        }
      );

    }

    rows.push([]);


    // -------------------------------------------------
    // SAVINGS
    // -------------------------------------------------

    rows.push([
      "SAVINGS GOALS"
    ]);

    rows.push([
      "Goal",
      "Target Amount",
      "Saved Amount",
      "Target Date"
    ]);

    if (
      Array.isArray(data.savings)
    ) {

      data.savings.forEach(
        (saving) => {

          rows.push([
            saving.goal_name,
            saving.target_amount,
            saving.saved_amount,
            saving.target_date
          ]);

        }
      );

    }


    // -------------------------------------------------
    // CREATE CSV
    // -------------------------------------------------

    const csvContent =
      rows
        .map((row) =>
          row
            .map(escapeCSV)
            .join(",")
        )
        .join("\n");


    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;"
      }
    );


    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "BudgetBuddy_Report.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  };


  // =====================================================
  // PDF EXPORT
  // =====================================================

  const exportPDF = async () => {

    const data = await fetchExportData();

    if (!data) {
      return;
    }


    const doc = new jsPDF();


    // -------------------------------------------------
    // TITLE
    // -------------------------------------------------

    doc.setFontSize(20);

    doc.text(
      "BudgetBuddy Financial Report",
      14,
      20
    );


    doc.setFontSize(10);

    doc.text(
      `Generated by: ${
        data.report_info?.generated_by || "User"
      }`,
      14,
      28
    );

    doc.text(
      `Generated date: ${
        data.report_info?.generated_date || ""
      }`,
      14,
      34
    );


    // -------------------------------------------------
    // FINANCIAL SUMMARY
    // -------------------------------------------------

    doc.setFontSize(14);

    doc.text(
      "Financial Summary",
      14,
      46
    );


    autoTable(doc, {

      startY: 51,

      head: [
        [
          "Metric",
          "Amount"
        ]
      ],

      body: [

        [
          "Total Income",
          `Rs. ${
            data.financial_summary?.total_income ?? 0
          }`
        ],

        [
          "Total Expense",
          `Rs. ${
            data.financial_summary?.total_expense ?? 0
          }`
        ],

        [
          "Current Balance",
          `Rs. ${
            data.financial_summary?.current_balance ?? 0
          }`
        ],

        [
          "Remaining Budget",
          `Rs. ${
            data.financial_summary?.remaining_budget ?? 0
          }`
        ],

        [
          "Total Savings",
          `Rs. ${
            data.financial_summary?.total_savings ?? 0
          }`
        ]

      ]

    });


    // -------------------------------------------------
    // EXPENSES
    // -------------------------------------------------

    let currentY =
      doc.lastAutoTable.finalY + 12;


    doc.setFontSize(14);

    doc.text(
      "Expenses",
      14,
      currentY
    );


    const expenseRows =
      Array.isArray(data.expenses)
        ? data.expenses.map(
            (expense) => [

              expense.date,

              expense.title,

              expense.category,

              `Rs. ${expense.amount}`

            ]
          )
        : [];


    autoTable(doc, {

      startY: currentY + 5,

      head: [
        [
          "Date",
          "Title",
          "Category",
          "Amount"
        ]
      ],

      body: expenseRows,

    });


    // -------------------------------------------------
    // INCOME
    // -------------------------------------------------

    currentY =
      doc.lastAutoTable.finalY + 12;


    doc.setFontSize(14);

    doc.text(
      "Income",
      14,
      currentY
    );


    const incomeRows =
      Array.isArray(data.income)
        ? data.income.map(
            (income) => [

              income.income_date,

              income.title,

              income.source,

              `Rs. ${income.amount}`

            ]
          )
        : [];


    autoTable(doc, {

      startY: currentY + 5,

      head: [
        [
          "Date",
          "Title",
          "Source",
          "Amount"
        ]
      ],

      body: incomeRows,

    });


    // -------------------------------------------------
    // BUDGETS
    // -------------------------------------------------

    currentY =
      doc.lastAutoTable.finalY + 12;


    doc.setFontSize(14);

    doc.text(
      "Budgets",
      14,
      currentY
    );


    const budgetRows =
      Array.isArray(data.budgets)
        ? data.budgets.map(
            (budget) => [

              budget.category,

              `Rs. ${budget.budget_amount}`,

              budget.month,

              budget.year

            ]
          )
        : [];


    autoTable(doc, {

      startY: currentY + 5,

      head: [
        [
          "Category",
          "Budget",
          "Month",
          "Year"
        ]
      ],

      body: budgetRows,

    });


    // -------------------------------------------------
    // SAVINGS
    // -------------------------------------------------

    currentY =
      doc.lastAutoTable.finalY + 12;


    doc.setFontSize(14);

    doc.text(
      "Savings Goals",
      14,
      currentY
    );


    const savingsRows =
      Array.isArray(data.savings)
        ? data.savings.map(
            (saving) => [

              saving.goal_name,

              `Rs. ${saving.target_amount}`,

              `Rs. ${saving.saved_amount}`,

              saving.target_date

            ]
          )
        : [];


    autoTable(doc, {

      startY: currentY + 5,

      head: [
        [
          "Goal",
          "Target",
          "Saved",
          "Target Date"
        ]
      ],

      body: savingsRows,

    });


    // -------------------------------------------------
    // SAVE PDF
    // -------------------------------------------------

    doc.save(
      "BudgetBuddy_Report.pdf"
    );

  };


  // =====================================================
  // MONTH NAMES
  // =====================================================

  const months = [

    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" }

  ];


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="reports-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="reports-header">

            <div>
                <div className="reports-eyebrow">
                    PERSONAL FINANCE
                </div>

                <h1>
                    Financial Reports
                </h1>

                <p>
                    Analyze your income, expenses, budgets and savings.
                </p>
            </div>

            <div className="reports-header-icon">
                <i className="bi bi-bar-chart-line-fill"></i>
            </div>

        </div>


        {/* =================================================
            MONTHLY REPORT
        ================================================= */}

        <section className="report-section">

            <div className="report-section-header">

                <div className="report-section-title">

                    <div className="report-section-icon">
                        <i className="bi bi-calendar3"></i>
                    </div>

                    <div>
                        <h2>
                            Monthly Financial Report
                        </h2>

                        <p>
                            Generate a detailed report for a selected month.
                        </p>
                    </div>

                </div>

            </div>


            <div className="report-filters">

                <div className="report-field">

                    <label>
                        Month
                    </label>

                    <select
                        value={month}
                        onChange={(e) =>
                            setMonth(
                                Number(e.target.value)
                            )
                        }
                    >

                        {months.map((item) => (

                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.name}
                            </option>

                        ))}

                    </select>

                </div>


                <div className="report-field">

                    <label>
                        Year
                    </label>

                    <input
                        type="number"
                        value={year}
                        onChange={(e) =>
                            setYear(
                                Number(e.target.value)
                            )
                        }
                    />

                </div>


                <button
                    className="report-action-btn"
                    onClick={generateMonthlyReport}
                    disabled={monthlyLoading}
                >

                    <i className="bi bi-bar-chart-line me-1"></i>

                    {monthlyLoading
                        ? "Generating..."
                        : "Generate Monthly Report"}

                </button>

            </div>

        </section>


        {/* =================================================
            MONTHLY RESULT
        ================================================= */}

        {monthlyReport && (

            <section className="report-section">

                <div className="report-summary-grid">

                    <div className="report-summary-card income">

                        <span>
                            TOTAL INCOME
                        </span>

                        <strong>
                            ₹{Number(
                                monthlyReport.total_income || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                        <small>
                            Money received
                        </small>

                    </div>


                    <div className="report-summary-card expense">

                        <span>
                            TOTAL EXPENSE
                        </span>

                        <strong>
                            ₹{Number(
                                monthlyReport.total_expense || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                        <small>
                            Money spent
                        </small>

                    </div>


                    <div className="report-summary-card balance">

                        <span>
                            CURRENT BALANCE
                        </span>

                        <strong>
                            ₹{Number(
                                monthlyReport.current_balance || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                        <small>
                            Available balance
                        </small>

                    </div>


                    <div className="report-summary-card savings">

                        <span>
                            REMAINING BUDGET
                        </span>

                        <strong>
                            ₹{Number(
                                monthlyReport.remaining_budget || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                        <small>
                            Budget remaining
                        </small>

                    </div>

                </div>


                <div className="report-section-body">

                    <div className="report-panel">

                        <h3>
                            {monthlyReport.month}{" "}
                            {monthlyReport.year}
                        </h3>

                        <p>
                            Monthly financial overview
                        </p>

                        <div className="report-grid-two">

                            <div>

                                <span className="report-badge success">
                                    <i className="bi bi-arrow-down-circle"></i>
                                    Income
                                </span>

                                <h3 style={{ marginTop: "10px" }}>
                                    ₹{Number(
                                        monthlyReport.total_income || 0
                                    ).toLocaleString("en-IN")}
                                </h3>

                            </div>


                            <div>

                                <span className="report-badge danger">
                                    <i className="bi bi-arrow-up-circle"></i>
                                    Expenses
                                </span>

                                <h3 style={{ marginTop: "10px" }}>
                                    ₹{Number(
                                        monthlyReport.total_expense || 0
                                    ).toLocaleString("en-IN")}
                                </h3>

                            </div>


                            <div>

                                <span className="report-badge info">
                                    <i className="bi bi-piggy-bank"></i>
                                    Savings
                                </span>

                                <h3 style={{ marginTop: "10px" }}>
                                    ₹{Number(
                                        monthlyReport.total_savings || 0
                                    ).toLocaleString("en-IN")}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        )}


        {/* =================================================
            EXPENSE REPORT
        ================================================= */}

        <section className="report-section">

            <div className="report-section-header">

                <div className="report-section-title">

                    <div
                        className="report-section-icon"
                        style={{
                            background: "#fef2f2",
                            color: "#dc2626"
                        }}
                    >
                        <i className="bi bi-credit-card"></i>
                    </div>

                    <div>

                        <h2>
                            Expense Report
                        </h2>

                        <p>
                            Review expenses between two dates.
                        </p>

                    </div>

                </div>

            </div>


            <div className="report-filters">

                <div className="report-field">

                    <label>
                        Start Date
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(
                                e.target.value
                            )
                        }
                    />

                </div>


                <div className="report-field">

                    <label>
                        End Date
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(
                                e.target.value
                            )
                        }
                    />

                </div>


                <button
                    className="report-action-btn"
                    style={{
                        background: "#dc2626"
                    }}
                    onClick={generateExpenseReport}
                    disabled={expenseLoading}
                >

                    <i className="bi bi-search me-1"></i>

                    {expenseLoading
                        ? "Loading..."
                        : "Generate Expense Report"}

                </button>

            </div>


            <div className="report-section-body">

                {expenseReport.length > 0 ? (

                    <div className="report-table-wrapper">

                        <table className="report-table">

                            <thead>

                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>

                            </thead>

                            <tbody>

                                {expenseReport.map(
                                    (expense, index) => (

                                        <tr
                                            key={`${expense.title}-${expense.date}-${index}`}
                                        >

                                            <td>
                                                {expense.date}
                                            </td>

                                            <td>
                                                {expense.title}
                                            </td>

                                            <td>
                                                <span className="report-badge info">
                                                    {expense.category}
                                                </span>
                                            </td>

                                            <td className="report-negative">
                                                ₹{Number(
                                                    expense.amount || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="report-empty">

                        <i className="bi bi-receipt"></i>

                        <strong>
                            No expense report generated
                        </strong>

                        <span>
                            Select a date range and generate the report.
                        </span>

                    </div>

                )}

            </div>

        </section>


        {/* =================================================
            SAVINGS REPORT
        ================================================= */}

        <section className="report-section">

            <div className="report-section-header">

                <div className="report-section-title">

                    <div
                        className="report-section-icon"
                        style={{
                            background: "#ecfdf5",
                            color: "#059669"
                        }}
                    >
                        <i className="bi bi-piggy-bank-fill"></i>
                    </div>

                    <div>

                        <h2>
                            Savings Goals Report
                        </h2>

                        <p>
                            Track your savings goals and progress.
                        </p>

                    </div>

                </div>


                <button
                    className="report-action-btn"
                    style={{
                        background: "#059669"
                    }}
                    onClick={generateSavingsReport}
                    disabled={savingsLoading}
                >

                    <i className="bi bi-bullseye me-1"></i>

                    {savingsLoading
                        ? "Loading..."
                        : "Generate Report"}

                </button>

            </div>


            <div className="report-section-body">

                {savingsReport.length > 0 ? (

                    <div className="report-table-wrapper">

                        <table className="report-table">

                            <thead>

                                <tr>
                                    <th>Goal</th>
                                    <th>Target</th>
                                    <th>Saved</th>
                                    <th>Remaining</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Target Date</th>
                                </tr>

                            </thead>

                            <tbody>

                                {savingsReport.map(
                                    (goal, index) => {

                                        const progress =
                                            Math.min(
                                                Number(
                                                    goal.progress_percentage
                                                ) || 0,
                                                100
                                            );

                                        return (

                                            <tr
                                                key={`${goal.goal_name}-${index}`}
                                            >

                                                <td>
                                                    <strong>
                                                        {goal.goal_name}
                                                    </strong>
                                                </td>

                                                <td>
                                                    ₹{Number(
                                                        goal.target_amount || 0
                                                    ).toLocaleString("en-IN")}
                                                </td>

                                                <td className="report-positive">
                                                    ₹{Number(
                                                        goal.saved_amount || 0
                                                    ).toLocaleString("en-IN")}
                                                </td>

                                                <td>
                                                    ₹{Number(
                                                        goal.remaining_amount || 0
                                                    ).toLocaleString("en-IN")}
                                                </td>

                                                <td style={{ minWidth: "160px" }}>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                flex: 1,
                                                                height: "7px",
                                                                background: "#e2e8f0",
                                                                borderRadius: "999px",
                                                                overflow: "hidden"
                                                            }}
                                                        >

                                                            <div
                                                                style={{
                                                                    width: `${progress}%`,
                                                                    height: "100%",
                                                                    background: "#10b981",
                                                                    borderRadius: "999px"
                                                                }}
                                                            ></div>

                                                        </div>

                                                        <strong>
                                                            {progress.toFixed(0)}%
                                                        </strong>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            goal.status === "Completed"
                                                                ? "report-badge success"
                                                                : "report-badge warning"
                                                        }
                                                    >

                                                        <i
                                                            className={
                                                                goal.status === "Completed"
                                                                    ? "bi bi-check-circle"
                                                                    : "bi bi-clock"
                                                            }
                                                        ></i>

                                                        {goal.status}

                                                    </span>

                                                </td>

                                                <td>
                                                    {goal.target_date}
                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="report-empty">

                        <i className="bi bi-piggy-bank"></i>

                        <strong>
                            No savings report generated
                        </strong>

                        <span>
                            Click Generate Report to view your savings goals.
                        </span>

                    </div>

                )}

            </div>

        </section>


        {/* =================================================
            FINANCIAL SUMMARY
        ================================================= */}

        <section className="report-section">

            <div className="report-section-header">

                <div className="report-section-title">

                    <div
                        className="report-section-icon"
                        style={{
                            background: "#f5f3ff",
                            color: "#7c3aed"
                        }}
                    >
                        <i className="bi bi-graph-up-arrow"></i>
                    </div>

                    <div>

                        <h2>
                            Financial Summary
                        </h2>

                        <p>
                            Compare your financial position for a selected period.
                        </p>

                    </div>

                </div>

            </div>


            <div className="report-filters">

                <div className="report-field">

                    <label>
                        Period
                    </label>

                    <select
                        value={summaryFilter}
                        onChange={(e) =>
                            setSummaryFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="current_month">
                            Current Month
                        </option>

                        <option value="previous_month">
                            Previous Month
                        </option>

                    </select>

                </div>


                <button
                    className="report-action-btn"
                    style={{
                        background: "#7c3aed"
                    }}
                    onClick={generateSummaryReport}
                    disabled={summaryLoading}
                >

                    <i className="bi bi-graph-up me-1"></i>

                    {summaryLoading
                        ? "Loading..."
                        : "Generate Summary"}

                </button>

            </div>


            {summaryReport && (

                <div className="report-section-body">

                    <div className="report-summary-grid">

                        <div className="report-summary-card income">

                            <span>
                                TOTAL INCOME
                            </span>

                            <strong>
                                ₹{Number(
                                    summaryReport
                                        .financial_summary
                                        ?.total_income || 0
                                ).toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div className="report-summary-card expense">

                            <span>
                                TOTAL EXPENSE
                            </span>

                            <strong>
                                ₹{Number(
                                    summaryReport
                                        .financial_summary
                                        ?.total_expense || 0
                                ).toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div className="report-summary-card balance">

                            <span>
                                CURRENT BALANCE
                            </span>

                            <strong>
                                ₹{Number(
                                    summaryReport
                                        .financial_summary
                                        ?.current_balance || 0
                                ).toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div className="report-summary-card savings">

                            <span>
                                REMAINING BUDGET
                            </span>

                            <strong>
                                ₹{Number(
                                    summaryReport
                                        .financial_summary
                                        ?.remaining_budget || 0
                                ).toLocaleString("en-IN")}
                            </strong>

                        </div>

                    </div>


                    <div className="report-panel">

                        <h3>
                            Expenses in Selected Period
                        </h3>

                        <p>
                            Detailed expense activity for this period.
                        </p>


                        {summaryReport.expense_summary?.length > 0 ? (

                            <div className="report-table-wrapper">

                                <table className="report-table">

                                    <thead>

                                        <tr>
                                            <th>Date</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Amount</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {summaryReport.expense_summary.map(
                                            (expense, index) => (

                                                <tr
                                                    key={`${expense.title}-${expense.date}-${index}`}
                                                >

                                                    <td>
                                                        {expense.date}
                                                    </td>

                                                    <td>
                                                        {expense.title}
                                                    </td>

                                                    <td>
                                                        <span className="report-badge info">
                                                            {expense.category}
                                                        </span>
                                                    </td>

                                                    <td className="report-negative">
                                                        ₹{Number(
                                                            expense.amount || 0
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        ) : (

                            <div className="report-empty">

                                <i className="bi bi-receipt"></i>

                                <strong>
                                    No expenses found
                                </strong>

                                <span>
                                    No expenses were recorded for this period.
                                </span>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </section>


        {/* =================================================
            EXPORT
        ================================================= */}

        <section className="report-section">

            <div className="report-section-header">

                <div className="report-section-title">

                    <div
                        className="report-section-icon"
                        style={{
                            background: "#f1f5f9",
                            color: "#475569"
                        }}
                    >
                        <i className="bi bi-download"></i>
                    </div>

                    <div>

                        <h2>
                            Export Financial Data
                        </h2>

                        <p>
                            Download your complete BudgetBuddy financial data.
                        </p>

                    </div>

                </div>

            </div>


            <div className="report-export-grid">

                <button
                    className="report-export-btn"
                    onClick={exportPDF}
                    disabled={exportLoading}
                >

                    <i className="bi bi-file-earmark-pdf-fill"></i>

                    Download PDF

                </button>


                <button
                    className="report-export-btn"
                    onClick={exportCSV}
                    disabled={exportLoading}
                >

                    <i className="bi bi-file-earmark-spreadsheet-fill"></i>

                    Download CSV

                </button>


                <button
                    className="report-export-btn"
                    onClick={exportJSON}
                    disabled={exportLoading}
                >

                    <i className="bi bi-filetype-json"></i>

                    Download JSON

                </button>

            </div>


            {exportLoading && (

                <div
                    style={{
                        padding: "0 22px 20px",
                        color: "#64748b",
                        fontSize: "11px"
                    }}
                >

                    <i className="bi bi-arrow-repeat me-1"></i>

                    Preparing your financial data...

                </div>

            )}

        </section>

    </div>
);

}

export default Reports;