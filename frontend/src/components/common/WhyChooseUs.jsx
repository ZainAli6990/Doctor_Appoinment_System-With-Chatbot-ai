import {
  FaUserDoctor,
  FaCalendarCheck,
  FaShieldHeart,
  FaHeadset,
} from "react-icons/fa6";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <FaUserDoctor />,
      title: "Experienced Doctors",
      description: "500+ qualified doctors across multiple specialties.",
      number: "500+",
    },
    {
      icon: <FaCalendarCheck />,
      title: "Easy Appointment",
      description: "Book your appointment online within a few seconds.",
      number: "24/7",
    },
    {
      icon: <FaShieldHeart />,
      title: "Trusted Healthcare",
      description: "Your health and privacy are always protected.",
      number: "100%",
    },
    {
      icon: <FaHeadset />,
      title: "Friendly Support",
      description: "Support team available anytime you need help.",
      number: "365",
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-primary-dark text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/40 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16 reveal-up">
          <span className="eyebrow !text-accent">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3">
            Healthcare You Can Trust
          </h2>
          <p className="text-white/70 text-lg mt-5 max-w-2xl mx-auto">
            We connect patients with experienced doctors and make
            healthcare simple, secure and accessible.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 reveal-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h4 className="font-mono text-3xl font-semibold mb-2">
                {item.number}
              </h4>
              <h3 className="text-lg font-display font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm leading-6">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
