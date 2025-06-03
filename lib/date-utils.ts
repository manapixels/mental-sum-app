/**
 * Formats a date relative to today
 * Returns "Today", "Yesterday", or "x days ago"
 */
export function formatRelativeDate(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return "N/A";
  }

  const targetDate = new Date(date);
  const today = new Date();

  // Set time to start of day for accurate day comparison
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const targetStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  // Calculate difference in days
  const diffTime = todayStart.getTime() - targetStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays > 1) {
    return `${diffDays} days ago`;
  } else {
    // Future date (shouldn't happen for lastSessionDate, but handling it)
    return targetDate.toLocaleDateString();
  }
}
