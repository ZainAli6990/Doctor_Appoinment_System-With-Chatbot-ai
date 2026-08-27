import { Link } from "react-router-dom";
import {
  FaUserDoctor,
  FaUsers,
  FaCalendarPlus,
  FaStethoscope,
} from "react-icons/fa6";

const actions = [
  { title: "Add Doctor", icon: <FaUserDoctor />, link: "/dashboard/add-doctor" },
  { title: "Patients", icon: <FaUsers />, link: "/dashboard/patients" },
  { title: "Appointments", icon: <FaCalendarPlus />, link: "/dashboard/appointments" },
  { title: "Specializations", icon: <FaStethoscope />, link: "/dashboard/specializations" },
];

export default function QuickActions() {
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold text-ink mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group rounded-xl border border-line p-5 hover:border-primary hover:bg-primary-light/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              {action.icon}
            </div>
            <h3 className="font-semibold text-sm text-ink">{action.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
