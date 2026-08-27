import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaPhone,
  FaCalendarDays,
  FaBriefcase,
  FaMoneyBillWave,
  FaArrowRight,
} from "react-icons/fa6";

import api from "../../services/api";
import DoctorAvatar from "./DoctorAvatar";

export default function FeaturedDoctors({ filters }) {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    let url = "/doctors?";

    if (filters.search) {
      url += `search=${filters.search}&`;
    }

    if (filters.specialization) {
      url += `specialization=${filters.specialization}`;
    }

    api
      .get(url)
      .then((response) => {
        if (response.data.success) {
          setDoctors(response.data.data);
        }
      })
      .catch((error) => console.error(error));
  }, [filters]);

  return (
    <section className="py-20 md:py-24 bg-primary-light/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 reveal-up">
          <span className="eyebrow">Our Specialists</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mt-3">
            Featured Doctors
          </h2>
          <p className="text-muted mt-4 text-lg">
            Meet our experienced, highly-rated specialists
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {doctors.length > 0 ? (
            doctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="card overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 reveal-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="bg-primary h-28 flex justify-center items-end relative">
                  <span className="absolute top-4 right-4 badge bg-white/90 text-primary">
                    Available
                  </span>
                  <div className="translate-y-12">
                    <DoctorAvatar doctor={doctor} size="md" />
                  </div>
                </div>

                <div className="p-6 pt-16">
                  <h3 className="text-xl font-display font-semibold text-center text-ink">
                    {doctor.name}
                  </h3>

                  <p className="text-center text-accent-dark font-semibold mt-1.5 text-sm uppercase tracking-wide">
                    {doctor.specialization?.name}
                  </p>

                  <div className="flex justify-center items-center gap-2 mt-4">
                    <FaStar className="text-accent" />
                    <span className="font-semibold text-sm">4.9</span>
                    <span className="text-muted text-sm">(120 Reviews)</span>
                  </div>

                  <div className="border-t border-line my-6"></div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center gap-3 text-ink/80">
                      <FaBriefcase className="text-primary" />
                      <span>{doctor.experience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink/80">
                      <FaMoneyBillWave className="text-primary" />
                      <span>Rs. {doctor.consultation_fee} consultation</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink/80">
                      <FaPhone className="text-primary" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink/80">
                      <FaCalendarDays className="text-primary" />
                      <span>{doctor.available_days}</span>
                    </div>
                  </div>

                  <Link to={`/book/${doctor.id}`} className="block mt-7">
                    <button className="btn-primary w-full">
                      Book Appointment
                      <FaArrowRight />
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20">
              <h3 className="text-xl text-muted">No Doctors Found</h3>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
