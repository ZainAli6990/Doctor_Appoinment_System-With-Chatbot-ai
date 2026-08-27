import {
  FaHeartPulse,
  FaBrain,
  FaTooth,
  FaBone,
  FaEye,
  FaBaby,
} from "react-icons/fa6";

export default function Departments() {
  const departments = [
    { icon: <FaHeartPulse />, name: "Cardiology" },
    { icon: <FaBrain />, name: "Neurology" },
    { icon: <FaTooth />, name: "Dentistry" },
    { icon: <FaBone />, name: "Orthopedic" },
    { icon: <FaEye />, name: "Ophthalmology" },
    { icon: <FaBaby />, name: "Pediatrics" },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 reveal-up">
          <span className="eyebrow">Departments</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mt-3">
            Browse by Specialty
          </h2>
          <p className="text-muted mt-4">
            Find the right doctor for your needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {departments.map((item, index) => (
            <div
              key={index}
              className="card p-6 text-center hover:-translate-y-2 hover:border-primary/40 transition-all duration-300 reveal-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="text-3xl mb-4 flex justify-center text-primary">
                {item.icon}
              </div>
              <h3 className="font-semibold text-ink text-sm">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
