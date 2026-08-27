import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import api from "../../services/api";

export default function LatestPatients() {
  const [patients, setPatients] = useState([]);

  const loadPatients = async () => {
    try {
      const response = await api.get("/patients/latest");
      setPatients(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="card p-6 h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display text-xl font-semibold text-ink">
          Latest Patients
        </h2>

        <span className="badge bg-primary-light text-primary">Last 5</span>
      </div>

      <div className="space-y-2">
        {patients.length === 0 ? (
          <p className="text-center text-muted py-8">No patients found</p>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="flex justify-between items-center border-b border-line/60 last:border-b-0 py-3 px-2 hover:bg-primary-light/40 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <FaUser className="text-sm" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink text-sm">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-muted">{patient.email}</p>
                </div>
              </div>

              <span className="badge bg-accent-light text-accent-dark">
                {patient.gender}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
