import { useEffect, useState } from "react";

import {
  FaUserDoctor,
  FaUsers,
  FaCalendarCheck,
  FaStethoscope,
} from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";
import LineChart from "../../components/dashboard/LineChart";
import PieChart from "../../components/dashboard/PieChart";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentAppointments from "../../components/dashboard/RecentAppointments";
import LatestPatients from "../../components/dashboard/LatestPatients";

import api from "../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    users: 0,
    appointments: 0,
    specializations: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, chartRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/dashboard/chart"),
      ]);

      setStats(dashboardRes.data.cards);

      setLineData({
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        datasets: [
          {
            label: "Appointments",
            data: chartRes.data.monthlyAppointments,
            borderColor: "#0f5c52",
            backgroundColor: "rgba(15,92,82,0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
      });

      setPieData({
        labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
        datasets: [
          {
            data: [
              chartRes.data.appointmentStatus.Pending,
              chartRes.data.appointmentStatus.Confirmed,
              chartRes.data.appointmentStatus.Completed,
              chartRes.data.appointmentStatus.Cancelled,
            ],
            backgroundColor: ["#c8891f", "#2f8f5b", "#0f5c52", "#c4433b"],
            hoverBackgroundColor: ["#a8720f", "#237348", "#0a3e38", "#a4342d"],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar
          title="Dashboard Overview"
          subtitle="Here's what's happening at your clinic today"
        />

        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <StatCard title="Doctors" value={stats.doctors} icon={<FaUserDoctor />} tone="primary" />
            <StatCard title="Registered Users" value={stats.users} icon={<FaUsers />} tone="success" />
            <StatCard title="Appointments" value={stats.appointments} icon={<FaCalendarCheck />} tone="accent" />
            <StatCard title="Specializations" value={stats.specializations} icon={<FaStethoscope />} tone="danger" />
            <StatCard title="Pending" value={stats.pending} icon={<FaCalendarCheck />} tone="accent" />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <QuickActions />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
            <div className="h-[420px]">
              {lineData && <LineChart data={lineData} />}
            </div>

            <div className="h-[420px]">
              {pieData && <PieChart data={pieData} />}
            </div>
          </div>

          {/* Latest Patients + Recent Appointments */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
            <LatestPatients />
            <RecentAppointments />
          </div>

          {/* Welcome Card */}
          <div className="mt-8 bg-primary-dark rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />
            <h2 className="font-display text-3xl font-semibold relative">
              Welcome Admin 👋
            </h2>
            <p className="mt-3 text-white/70 text-lg relative max-w-2xl">
              Manage doctors, patients, appointments and specializations
              from one powerful dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
