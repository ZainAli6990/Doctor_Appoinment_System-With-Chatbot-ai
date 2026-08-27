export default function StatCard({
  title,
  value,
  icon,
  tone = "primary",
}) {
  const tones = {
    primary: { bg: "bg-primary", ring: "bg-primary-light text-primary" },
    accent: { bg: "bg-accent", ring: "bg-accent-light text-accent-dark" },
    success: { bg: "bg-success", ring: "bg-success-light text-success" },
    danger: { bg: "bg-danger", ring: "bg-danger-light text-danger" },
  };
  const t = tones[tone] ?? tones.primary;

  return (
    <div className="card p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${t.ring} opacity-60 group-hover:scale-125 transition-transform duration-500`} />

      <div className="flex items-center justify-between relative">
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">
            {title}
          </p>
          <h2 className="font-mono text-3xl font-semibold text-ink mt-2">
            {value}
          </h2>
        </div>

        <div className={`${t.bg} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg relative`}>
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1.5 w-full bg-paper-dim rounded-full overflow-hidden relative">
        <div className={`${t.bg} h-full w-2/3 rounded-full`}></div>
      </div>
    </div>
  );
}
