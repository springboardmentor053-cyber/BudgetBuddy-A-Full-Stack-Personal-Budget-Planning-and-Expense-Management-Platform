import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function IncomeExpenseChart({ income, expense }) {

    const data = {
        labels: ["Income", "Expense"],

        datasets: [
            {
                data: [income, expense],

                backgroundColor: [
                    "#198754",
                    "#dc3545",
                ],

                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="card shadow p-3">

            <h4 className="text-center mb-3">
                Income vs Expense
            </h4>

            <Pie data={data} />

        </div>
    );
}

export default IncomeExpenseChart;