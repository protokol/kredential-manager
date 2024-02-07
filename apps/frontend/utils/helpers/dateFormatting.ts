import { format } from 'date-fns';

/**
 * @param {Date} date
 * @returns {string} formatted date
 * Example: Nov 20, 2020
 */
export const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');

export const formatShortDate = (date: Date) => format(date, 'dd.MM.yyyy');

// Example: 16.05.2023, 15:35:25
export const formatDateTime = (date: Date) =>
  format(date, 'dd.MM.yyyy, HH:mm:ss');

// Example: 16.05.2023, 15:35:25 +03:00
export const formatDateTimeWithTimezone = (date: Date) =>
  format(date, 'dd.MM.yyyy, hh:mma XXX');

// Example: 5y 3m
export const shortTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years) {
    if (months % 12 === 0) return `${years}y`;

    return `${years}y ${months % 12}m`;
  }

  if (months) {
    if (days % 30 === 0) return `${months}m`;
    return `${months}m ${days % 30}d`;
  }

  if (days) {
    if (hours % 24 === 0) return `${days}d`;

    return `${days}d ${hours % 24}h`;
  }

  if (hours) {
    if (minutes % 60 === 0) return `${hours}h`;

    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes) {
    if (seconds % 60 === 0) return `${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
};
