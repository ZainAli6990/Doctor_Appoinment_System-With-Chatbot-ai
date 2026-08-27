export function statusBadgeClass(status) {
  switch (status) {
    case "Confirmed":
      return "badge-confirmed";
    case "Completed":
      return "badge-completed";
    case "Cancelled":
      return "badge-cancelled";
    case "Pending":
    default:
      return "badge-pending";
  }
}
