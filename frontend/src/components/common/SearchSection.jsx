import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import api from "../../services/api";

export default function SearchSection({ onSearch }) {
  const [specializations, setSpecializations] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    api
      .get("/specializations")
      .then((response) => {
        if (response.data.success) {
          setSpecializations(response.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleSearch = () => {
    onSearch({
      search: doctorName,
      specialization: specialization,
    });
  };

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10 reveal-up">
          <span className="eyebrow">Search</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mt-3">
            Find Your Doctor
          </h2>
        </div>

        <div className="card p-3 reveal-up" style={{ animationDelay: "120ms" }}>
          <div className="grid md:grid-cols-[1.4fr_1fr_auto] gap-3">
            <input
              type="text"
              placeholder="Search doctor by name..."
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="input-field !border-transparent bg-paper-dim/60"
            />

            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="select-field !border-transparent bg-paper-dim/60"
            >
              <option value="">All Specializations</option>
              {specializations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button onClick={handleSearch} className="btn-accent">
              <FaMagnifyingGlass />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
