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


function CategoryExpenseChart({ data = [] }) {

  // =====================================================
  // CATEGORY COLORS
  // =====================================================

  const colors = [
    "#0d6efd",
    "#fd7e14",
    "#198754",
    "#6f42c1",
    "#dc3545",
    "#20c997",
    "#ffc107",
    "#6610f2",
    "#d63384",
    "#0dcaf0",
  ];


  // =====================================================
  // PREPARE DATA
  // =====================================================

  const labels = data.map(
    (item) => item.category
  );


  const values = data.map(
    (item) => Number(item.total) || 0
  );


  const chartData = {

    labels,

    datasets: [

      {
        label: "Expense",

        data: values,

        backgroundColor: data.map(
          (_, index) =>
            colors[index % colors.length]
        ),

        borderColor: "#ffffff",

        borderWidth: 3,

        hoverOffset: 8,

      },

    ],

  };


  // =====================================================
  // TOTAL EXPENSE
  // =====================================================

  const totalExpense = values.reduce(
    (total, value) =>
      total + value,
    0
  );


  // =====================================================
  // OPTIONS
  // =====================================================

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "62%",

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


            const percentage =
              totalExpense > 0
                ? (
                    (value /
                      totalExpense) *
                    100
                  ).toFixed(1)
                : 0;


            return ` ₹ ${value.toLocaleString(
              "en-IN"
            )} (${percentage}%)`;

          },

        },

      },

    },

  };


  // =====================================================
  // NO DATA
  // =====================================================

  if (data.length === 0) {

    return (

      <div className="card shadow border-0 h-100">

        <div className="card-body">

          <h4 className="text-center mb-4">
            🍩 Expense Categories
          </h4>

          <div className="text-center text-muted py-5">

            <div
              style={{
                fontSize: "45px",
              }}
            >
              📭
            </div>

            <h5 className="mt-3">
              No Expense Data
            </h5>

            <p className="mb-0">
              Add expenses to see
              category analysis.
            </p>

          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // CHART
  // =====================================================

  return (

    <div className="card shadow border-0 h-100">

      <div className="card-body">

        <h4 className="text-center mb-2">

          🍩 Expense Categories

        </h4>


        <p className="text-center text-muted mb-3">

          Total: ₹{" "}
          {totalExpense.toLocaleString(
            "en-IN"
          )}

        </p>


        <div
          style={{
            height: "330px",
            position: "relative",
          }}
        >

          <Doughnut

            data={chartData}

            options={options}

          />

        </div>

      </div>

    </div>

  );

}


export default CategoryExpenseChart;