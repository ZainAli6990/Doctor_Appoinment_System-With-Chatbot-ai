import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";
import api from "../../services/api";

export default function DoctorDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/doctor/dashboard")
      .then((response) => setData(response.data.data))
      .catch((error) => console.log(error));
  }, []);

  const cards = data?.cards ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar
          title="Doctor Dashboard"
          subtitle={data?.doctor ? `Dr. ${data.doctor.name} — ${data.doctor.specialization?.name ?? ""}` : "Welcome back"}
        />

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <StatCard title="Total" value={cards.total} icon={<FaCalendarCheck />} tone="primary" />
            <StatCard title="Pending" value={cards.pending} icon={<FaClock />} tone="accent" />
            <StatCard title="Confirmed" value={cards.confirmed} icon={<FaCircleCheck />} tone="success" />
            <StatCard title="Completed" value={cards.completed} icon={<FaCircleCheck />} tone="primary" />
            <StatCard title="Cancelled" value={cards.cancelled} icon={<FaCircleXmark />} tone="danger" />
          </div>

          <div className="mt-8 bg-primary-dark rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />
            <h2 className="font-display text-3xl font-semibold relative">
              Welcome, Dr. {data?.doctor?.name?.split(" ")[0] ?? ""} 👋
            </h2>
            <p className="mt-3 text-white/70 text-lg relative max-w-2xl">
              Manage your appointments and keep your availability up to date
              from your Doctor Portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
