import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaPhone,
  FaCalendarDays,
  FaBriefcase,
  FaMoneyBillWave,
  FaArrowRight,
  FaMagnifyingGlass,
} from "react-icons/fa6";

import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DoctorAvatar from "../../components/common/DoctorAvatar";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");

  useEffect(() => {
    api
      .get("/doctors")
      .then((response) => {
        if (response.data.success) {
          setDoctors(response.data.data);
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    api
      .get("/specializations")
      .then((response) => {
        if (response.data.success) {
          setSpecializations(response.data.data);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesName = doctor.name.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = !specFilter || String(doctor.specialization_id) === specFilter;
    return matchesName && matchesSpec;
  });

  return (
    <>
      <Navbar />

      <section className="bg-primary pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center reveal-up">
          <span className="eyebrow !text-accent">Our Team</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3">
            All Doctors
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Browse every specialist on SehatCare and book the one that fits
            your needs.
          </p>

          <div className="max-w-xl mx-auto mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-11 !bg-white"
              />
            </div>

            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="select-field !bg-white sm:w-56"
            >
              <option value="">All Specializations</option>
              {specializations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 -mt-6">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20 text-muted">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-20 text-muted">No doctors found.</div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="card overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 reveal-up"
                  style={{ animationDelay: `${index * 60}ms` }}
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
                        <span>
                          {doctor.available_days} · {doctor.available_time}
                        </span>
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
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
