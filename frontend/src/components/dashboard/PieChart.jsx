import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data }) {
  return (
    <div className="card p-6 h-full">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Appointment Status
        </h2>
        <p className="text-muted text-sm mt-1">
          Overview of all appointments
        </p>
      </div>

      <div className="h-72 flex justify-center items-center">
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  boxWidth: 12,
                  padding: 20,
                  usePointStyle: true,
                  pointStyle: "circle",
                  font: {
                    size: 13,
                    weight: "600",
                    family: "Plus Jakarta Sans",
                  },
                },
              },
              tooltip: {
                backgroundColor: "#0a3e38",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
                cornerRadius: 8,
              },
            },
            animation: {
              animateRotate: true,
              animateScale: true,
            },
          }}
        />
      </div>
    </div>
  );
}
