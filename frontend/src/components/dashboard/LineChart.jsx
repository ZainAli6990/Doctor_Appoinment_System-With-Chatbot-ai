import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LineChart({ data }) {
  return (
    <div className="card p-6 h-full">
      <h2 className="font-display text-xl font-semibold text-ink mb-5">
        Monthly Appointments
      </h2>

      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "#0a3e38",
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            y: {
              grid: { color: "#e1e8e4" },
              ticks: { font: { family: "Plus Jakarta Sans" } },
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: "Plus Jakarta Sans" } },
            },
          },
        }}
      />
    </div>
  );
}
