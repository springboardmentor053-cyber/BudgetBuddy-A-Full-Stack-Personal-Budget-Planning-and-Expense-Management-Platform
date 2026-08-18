import { useState } from "react";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    <div className="container-fluid mt-4 mb-5">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="card shadow-lg border-0 bg-dark text-white mb-4">

        <div className="card-body p-4">

          <h2 className="mb-2">
            📊 Financial Reports
          </h2>

          <p className="mb-0">
            Analyze your income, expenses,
            budgets and savings.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* MONTHLY REPORT */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            📅 Monthly Financial Report
          </h4>


          <div className="row">


            <div className="col-md-4 mb-3">

              <label className="form-label fw-bold">
                Month
              </label>

              <select
                className="form-select"
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


            <div className="col-md-3 mb-3">

              <label className="form-label fw-bold">
                Year
              </label>

              <input
                type="number"
                className="form-control"
                value={year}
                onChange={(e) =>
                  setYear(
                    Number(e.target.value)
                  )
                }
              />

            </div>


            <div className="col-md-5 mb-3 d-flex align-items-end">

              <button
                className="btn btn-primary w-100"
                onClick={
                  generateMonthlyReport
                }
                disabled={
                  monthlyLoading
                }
              >

                {monthlyLoading
                  ? "Generating..."
                  : "📊 Generate Monthly Report"}

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* MONTHLY RESULT */}
      {/* ================================================= */}

      {monthlyReport && (

        <>

          <div className="row mb-4">


            <div className="col-lg-3 col-md-6 mb-3">

              <div className="card shadow border-0 h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    💰 Total Income
                  </h6>

                  <h3 className="text-success fw-bold">
                    Rs. {monthlyReport.total_income}
                  </h3>

                </div>

              </div>

            </div>


            <div className="col-lg-3 col-md-6 mb-3">

              <div className="card shadow border-0 h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    💸 Total Expense
                  </h6>

                  <h3 className="text-danger fw-bold">
                    Rs. {monthlyReport.total_expense}
                  </h3>

                </div>

              </div>

            </div>


            <div className="col-lg-3 col-md-6 mb-3">

              <div className="card shadow border-0 h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    🏦 Current Balance
                  </h6>

                  <h3
                    className={
                      monthlyReport.current_balance >= 0
                        ? "text-primary fw-bold"
                        : "text-danger fw-bold"
                    }
                  >

                    Rs. {monthlyReport.current_balance}

                  </h3>

                </div>

              </div>

            </div>


            <div className="col-lg-3 col-md-6 mb-3">

              <div className="card shadow border-0 h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    📊 Remaining Budget
                  </h6>

                  <h3
                    className={
                      monthlyReport.remaining_budget >= 0
                        ? "text-warning fw-bold"
                        : "text-danger fw-bold"
                    }
                  >

                    Rs. {monthlyReport.remaining_budget}

                  </h3>

                </div>

              </div>

            </div>

          </div>


          <div className="card shadow border-0 mb-4">

            <div className="card-body">

              <h4>
                📅 {monthlyReport.month}{" "}
                {monthlyReport.year}
              </h4>

              <hr />

              <div className="row text-center">


                <div className="col-md-4 mb-3">

                  <h6 className="text-muted">
                    Income
                  </h6>

                  <h4 className="text-success">
                    Rs. {monthlyReport.total_income}
                  </h4>

                </div>


                <div className="col-md-4 mb-3">

                  <h6 className="text-muted">
                    Expenses
                  </h6>

                  <h4 className="text-danger">
                    Rs. {monthlyReport.total_expense}
                  </h4>

                </div>


                <div className="col-md-4 mb-3">

                  <h6 className="text-muted">
                    Savings
                  </h6>

                  <h4 className="text-primary">
                    Rs. {monthlyReport.total_savings}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </>

      )}


      {/* ================================================= */}
      {/* EXPENSE REPORT */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            💸 Expense Report
          </h4>


          <div className="row">


            <div className="col-md-4 mb-3">

              <label className="form-label fw-bold">
                Start Date
              </label>

              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="col-md-4 mb-3">

              <label className="form-label fw-bold">
                End Date
              </label>

              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="col-md-4 mb-3 d-flex align-items-end">

              <button
                className="btn btn-danger w-100"
                onClick={
                  generateExpenseReport
                }
                disabled={
                  expenseLoading
                }
              >

                {expenseLoading
                  ? "Loading..."
                  : "💸 Generate Expense Report"}

              </button>

            </div>

          </div>


          {expenseReport.length > 0 ? (

            <div className="table-responsive mt-4">

              <table className="table table-hover table-bordered align-middle">

                <thead className="table-danger">

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
                          {expense.category}
                        </td>

                        <td className="text-danger fw-bold">
                          Rs. {expense.amount}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="alert alert-light border mt-3 mb-0">

              No expense report generated yet.

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* SAVINGS REPORT */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <h4 className="mb-0">
              🎯 Savings Goals Report
            </h4>

            <button
              className="btn btn-primary"
              onClick={
                generateSavingsReport
              }
              disabled={
                savingsLoading
              }
            >

              {savingsLoading
                ? "Loading..."
                : "🎯 Generate Report"}

            </button>

          </div>


          {savingsReport.length > 0 ? (

            <div className="table-responsive">

              <table className="table table-hover table-bordered align-middle">

                <thead className="table-primary">

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
                    (goal, index) => (

                      <tr
                        key={`${goal.goal_name}-${index}`}
                      >

                        <td>
                          {goal.goal_name}
                        </td>

                        <td>
                          Rs. {goal.target_amount}
                        </td>

                        <td className="text-success fw-bold">
                          Rs. {goal.saved_amount}
                        </td>

                        <td>
                          Rs. {goal.remaining_amount}
                        </td>

                        <td style={{ minWidth: "150px" }}>

                          <div className="progress">

                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${Math.min(
                                  Number(
                                    goal.progress_percentage
                                  ) || 0,
                                  100
                                )}%`
                              }}
                            >

                              {goal.progress_percentage}%

                            </div>

                          </div>

                        </td>

                        <td>

                          <span
                            className={
                              goal.status === "Completed"
                                ? "badge bg-success"
                                : "badge bg-warning text-dark"
                            }
                          >

                            {goal.status}

                          </span>

                        </td>

                        <td>
                          {goal.target_date}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="alert alert-light border mb-0">

              Click <strong>Generate Report</strong>{" "}
              to view your savings goals.

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* FINANCIAL SUMMARY */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            📈 Financial Summary
          </h4>


          <div className="row">

            <div className="col-md-4 mb-3">

              <label className="form-label fw-bold">
                Period
              </label>

              <select
                className="form-select"
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


            <div className="col-md-4 mb-3 d-flex align-items-end">

              <button
                className="btn btn-info text-white w-100"
                onClick={
                  generateSummaryReport
                }
                disabled={
                  summaryLoading
                }
              >

                {summaryLoading
                  ? "Loading..."
                  : "📈 Generate Summary"}

              </button>

            </div>

          </div>


          {summaryReport && (

            <div className="row mt-3">


              <div className="col-lg-3 col-md-6 mb-3">

                <div className="card border-0 bg-light h-100">

                  <div className="card-body">

                    <h6 className="text-muted">
                      Total Income
                    </h6>

                    <h4 className="text-success">

                      Rs.{" "}
                      {
                        summaryReport
                          .financial_summary
                          ?.total_income
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-lg-3 col-md-6 mb-3">

                <div className="card border-0 bg-light h-100">

                  <div className="card-body">

                    <h6 className="text-muted">
                      Total Expense
                    </h6>

                    <h4 className="text-danger">

                      Rs.{" "}
                      {
                        summaryReport
                          .financial_summary
                          ?.total_expense
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-lg-3 col-md-6 mb-3">

                <div className="card border-0 bg-light h-100">

                  <div className="card-body">

                    <h6 className="text-muted">
                      Current Balance
                    </h6>

                    <h4 className="text-primary">

                      Rs.{" "}
                      {
                        summaryReport
                          .financial_summary
                          ?.current_balance
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-lg-3 col-md-6 mb-3">

                <div className="card border-0 bg-light h-100">

                  <div className="card-body">

                    <h6 className="text-muted">
                      Remaining Budget
                    </h6>

                    <h4 className="text-warning">

                      Rs.{" "}
                      {
                        summaryReport
                          .financial_summary
                          ?.remaining_budget
                      }

                    </h4>

                  </div>

                </div>

              </div>


              {/* EXPENSE DETAILS */}

              <div className="col-12 mt-3">

                <h5 className="mb-3">
                  💸 Expenses in Selected Period
                </h5>


                {summaryReport.expense_summary?.length > 0 ? (

                  <div className="table-responsive">

                    <table className="table table-bordered table-hover">

                      <thead className="table-danger">

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
                                {expense.category}
                              </td>

                              <td className="text-danger fw-bold">
                                Rs. {expense.amount}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                ) : (

                  <p className="text-muted">
                    No expenses found for this period.
                  </p>

                )}

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* EXPORT */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-5">

        <div className="card-body">

          <h4 className="mb-3">
            📥 Export Financial Data
          </h4>

          <p className="text-muted">
            Download your complete BudgetBuddy
            financial data in your preferred format.
          </p>


          <div className="d-flex flex-wrap gap-2">


            {/* PDF */}

            <button
              className="btn btn-danger"
              onClick={exportPDF}
              disabled={exportLoading}
            >

              📄 Download PDF

            </button>


            {/* CSV */}

            <button
              className="btn btn-success"
              onClick={exportCSV}
              disabled={exportLoading}
            >

              📊 Download CSV

            </button>


            {/* JSON */}

            <button
              className="btn btn-primary"
              onClick={exportJSON}
              disabled={exportLoading}
            >

              💾 Download JSON

            </button>

          </div>


          {exportLoading && (

            <div className="mt-3 text-muted">

              Preparing your financial data...

            </div>

          )}

        </div>

      </div>


    </div>

  );

}

export default Reports;