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


function SavingsProgressChart({
  goals = [],
}) {

  // =====================================================
  // NO DATA
  // =====================================================

  if (!goals || goals.length === 0) {

    return (

      <div className="card shadow border-0 h-100">

        <div className="card-body">

          <h4 className="text-center mb-4">
            🎯 Savings Progress
          </h4>

          <div className="text-center text-muted py-5">

            <div style={{ fontSize: "45px" }}>
              🎯
            </div>

            <h5 className="mt-3">
              No Savings Goals
            </h5>

            <p className="mb-0">
              Create a savings goal to
              track your progress.
            </p>

          </div>

        </div>

      </div>

    );
  }


  // =====================================================
  // TOTAL SAVINGS VALUES
  // =====================================================

  const totalTarget = goals.reduce(
    (total, goal) =>
      total +
      (Number(goal.target_amount) || 0),
    0
  );


  const totalSaved = goals.reduce(
    (total, goal) =>
      total +
      (Number(goal.saved_amount) || 0),
    0
  );


  const remaining = Math.max(
    totalTarget - totalSaved,
    0
  );


  const progress =
    totalTarget > 0
      ? Math.min(
          (totalSaved / totalTarget) * 100,
          100
        )
      : 0;


  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = {

    labels: [
      "Saved",
      "Remaining",
    ],

    datasets: [

      {
        data: [
          Math.min(
            totalSaved,
            totalTarget
          ),
          remaining,
        ],

        backgroundColor: [
          "#198754",
          "#e9ecef",
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
  // RENDER
  // =====================================================

  return (

    <div className="card shadow border-0 h-100">

      <div className="card-body">

        <h4 className="text-center mb-2">
          🎯 Savings Progress
        </h4>

        <p className="text-center text-muted mb-3">
          Overall savings progress
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


        {/* Overall percentage */}

        <div className="text-center mt-3">

          <h3 className="text-success fw-bold">

            {progress.toFixed(1)}%

          </h3>

          <p className="text-muted mb-3">
            of your total savings target
          </p>


          <div className="row">

            <div className="col-6">

              <small className="text-muted">
                Saved
              </small>

              <h6 className="text-success fw-bold">

                ₹{" "}
                {totalSaved.toLocaleString(
                  "en-IN"
                )}

              </h6>

            </div>


            <div className="col-6">

              <small className="text-muted">
                Target
              </small>

              <h6 className="text-primary fw-bold">

                ₹{" "}
                {totalTarget.toLocaleString(
                  "en-IN"
                )}

              </h6>

            </div>

          </div>


          <p className="small text-muted mt-2 mb-0">

            Remaining: ₹{" "}
            {remaining.toLocaleString(
              "en-IN"
            )}

          </p>

        </div>

      </div>

    </div>

  );
}


export default SavingsProgressChart;