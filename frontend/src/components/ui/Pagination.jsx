import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink transition-colors"
      >
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && (
            <span className="px-1 text-muted text-sm">…</span>
          )}
          <button
            onClick={() => onChange(p)}
            className={`h-9 min-w-9 px-2 rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? "bg-primary text-white"
                : "border border-line text-ink hover:border-primary hover:text-primary"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink transition-colors"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}
