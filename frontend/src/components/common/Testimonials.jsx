import { FaStar } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";

export default function Testimonials() {
  const reviews = [
    {
      name: "Ali Hassan",
      text: "Excellent service. Booking an appointment was quick and easy — highly recommended!",
    },
    {
      name: "Fatima Noor",
      text: "Very professional doctors. The whole process was smooth and hassle free.",
    },
    {
      name: "Ahmed Khan",
      text: "One of the best online doctor booking systems I have ever used.",
    },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 reveal-up">
          <span className="eyebrow">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mt-3">
            What Our Patients Say
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="card p-8 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 reveal-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1 mb-5 text-accent">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              <p className="text-ink/80 leading-7">"{review.text}"</p>

              <div className="flex items-center gap-3 mt-7 pt-5 border-t border-line">
                <FaUserCircle className="text-4xl text-primary" />
                <h3 className="font-semibold text-ink">{review.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
