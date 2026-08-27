import {
  FaUserDoctor,
  FaUsers,
  FaCalendarCheck,
  FaHospital,
} from "react-icons/fa6";

export default function StatsSection() {
  const stats = [
    { icon: <FaUserDoctor />, number: "500+", title: "Qualified Doctors" },
    { icon: <FaUsers />, number: "10K+", title: "Happy Patients" },
    { icon: <FaCalendarCheck />, number: "25K+", title: "Appointments Booked" },
    { icon: <FaHospital />, number: "20+", title: "Specializations" },
  ];

  return (
    <section className="relative -mt-16 z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="card grid grid-cols-2 lg:grid-cols-4 divide-y divide-line/70 lg:divide-y-0 lg:divide-x">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-7 reveal-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-2xl text-primary">
                {item.icon}
              </div>
              <div>
                <h3 className="font-mono text-2xl font-semibold text-ink">
                  {item.number}
                </h3>
                <p className="text-sm text-muted mt-0.5">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
