/**
 * Time formatting.
 *
 * Every timestamp in the domain model is a real `Date` (a Firestore
 * `Timestamp` once live). Display strings are produced here at render time,
 * never stored — storing "2 hours ago" makes a value that cannot be sorted,
 * compared, or aged.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now" · "10 minutes ago" · "2 hours ago" · "Yesterday" · "Aug 8, 2026" */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diff = now.getTime() - date.getTime();

  if (diff < 0) return formatDateTime(date, now);
  if (diff < MINUTE) return 'Just now';

  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diff < 2 * DAY) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "Today at 11:20 AM" · "Yesterday at 4:00 PM" · "Aug 7, 2026 at 9:15 AM" */
export function formatDateTime(date: Date, now: Date = new Date()): string {
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Today at ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;

  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${day} at ${time}`;
}

/** Calendar date (no instant): "2026-09-07" -> "September 7, 2026" */
export function formatCalendarDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Relative future: "In 6 hours" · "In 3 days" · past -> "Expired" */
export function formatUntil(date: Date, now: Date = new Date()): string {
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  if (diff < HOUR) {
    const mins = Math.max(1, Math.floor(diff / MINUTE));
    return `In ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  const days = Math.floor(diff / DAY);
  return `In ${days} ${days === 1 ? 'day' : 'days'}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
