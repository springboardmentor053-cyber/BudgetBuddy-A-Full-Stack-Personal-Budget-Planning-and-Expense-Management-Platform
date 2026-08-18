import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);


function BudgetUtilizationChart({
  totalBudget = 0,
  totalExpense = 0,
}) {

  // =====================================================
  // VALUES
  // =====================================================

  const budget =
    Number(totalBudget) || 0;


  const expense =
    Number(totalExpense) || 0;


  const remaining =
    Math.max(
      budget - expense,
      0
    );


  const percentage =
    budget > 0
      ? (expense / budget) * 100
      : 0;


  const displayPercentage =
    percentage.toFixed(1);


  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = {

    labels: [
      "Spent",
      "Remaining",
    ],

    datasets: [

      {

        data:
          budget > 0
            ? [
                Math.min(
                  expense,
                  budget
                ),
                remaining,
              ]
            : [0, 1],

        backgroundColor: [
          "#dc3545",
          "#198754",
        ],

        borderColor: "#ffffff",

        borderWidth: 3,

        hoverOffset: 8,

      },

    ],

  };


  // =====================================================
  // CHART OPTIONS
  // =====================================================

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "68%",

    plugins: {

      legend: {

        position: "bottom",

        labels: {

          padding: 18,

          usePointStyle: true,

          pointStyle: "circle",

          font: {
            size: 13,
          },

        },

      },


      tooltip: {

        callbacks: {

          label: function (context) {

            const value =
              Number(context.raw) || 0;


            return ` ₹ ${value.toLocaleString(
              "en-IN"
            )}`;

          },

        },

      },

    },

  };


  // =====================================================
  // NO BUDGET
  // =====================================================

  if (budget <= 0) {

    return (

      <div className="card shadow border-0 h-100">

        <div className="card-body">

          <h4 className="text-center mb-4">

            📊 Budget Utilization

          </h4>


          <div className="text-center text-muted py-5">

            <div
              style={{
                fontSize: "45px",
              }}
            >
              📊
            </div>

            <h5 className="mt-3">

              No Budget Data

            </h5>

            <p className="mb-0">

              Create a budget to see
              utilization.

            </p>

          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // WARNING STATUS
  // =====================================================

  let statusText =
    "Budget is within the safe limit.";

  let statusClass =
    "text-success";


  if (percentage >= 100) {

    statusText =
      "Budget exceeded!";

    statusClass =
      "text-danger";

  } else if (percentage >= 90) {

    statusText =
      "High warning: budget is almost exceeded.";

    statusClass =
      "text-danger";

  } else if (percentage >= 80) {

    statusText =
      "Warning: you have used 80%+ of your budget.";

    statusClass =
      "text-warning";

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="card shadow border-0 h-100">

      <div className="card-body">

        <h4 className="text-center mb-2">

          📊 Budget Utilization

        </h4>


        <p className="text-center text-muted mb-3">

          Budget: ₹{" "}
          {budget.toLocaleString(
            "en-IN"
          )}

        </p>


        <div
          style={{
            height: "300px",
            position: "relative",
          }}
        >

          <Doughnut

            data={chartData}

            options={options}

          />

        </div>


        {/* Percentage */}

        <div className="text-center mt-3">

          <h3 className="fw-bold">

            {displayPercentage}% Used

          </h3>


          <div className="row mt-3">

            <div className="col-6">

              <small className="text-muted">
                Spent
              </small>

              <h6 className="text-danger fw-bold">

                ₹{" "}
                {expense.toLocaleString(
                  "en-IN"
                )}

              </h6>

            </div>


            <div className="col-6">

              <small className="text-muted">
                Remaining
              </small>

              <h6 className="text-success fw-bold">

                ₹{" "}
                {remaining.toLocaleString(
                  "en-IN"
                )}

              </h6>

            </div>

          </div>


          <p
            className={`${statusClass} small fw-semibold mt-2 mb-0`}
          >

            {statusText}

          </p>

        </div>

      </div>

    </div>

  );

}


export default BudgetUtilizationChart;