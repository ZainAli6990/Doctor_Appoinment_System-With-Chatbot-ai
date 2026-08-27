import { FaUserDoctor } from "react-icons/fa6";

export default function DoctorAvatar({ doctor, size = "md" }) {
  if (size === "sm") {
    return doctor?.photo_url ? (
      <img
        src={doctor.photo_url}
        alt={doctor.name}
        className="h-9 w-9 rounded-lg object-cover"
      />
    ) : (
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
        <FaUserDoctor className="text-sm" />
      </span>
    );
  }

  const sizes = {
    md: "h-24 w-24 text-5xl",
    lg: "h-32 w-32 text-6xl",
  };
  const cls = sizes[size] ?? sizes.md;

  if (doctor?.photo_url) {
    return (
      <img
        src={doctor.photo_url}
        alt={doctor.name}
        className={`${cls} rounded-2xl object-cover shadow-lg border-4 border-white`}
      />
    );
  }

  return (
    <div
      className={`${cls} rounded-2xl bg-white flex items-center justify-center shadow-lg border-4 border-white text-primary`}
    >
      <FaUserDoctor />
    </div>
  );
}
