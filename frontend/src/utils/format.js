/**
 * Formats a raw number into a cleanly readable string with comma separators.
 * Example: 15000 -> "15,000"
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return "0";
  return new Intl.NumberFormat().format(number);
};

/**
 * Returns today's local date formatted as a standard ISO string (YYYY-MM-DD).
 */
export const todayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Extracts initials from a full name string.
 * Example: "John Doe" -> "JD"
 */
export const initials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Converts a snake_case or camelCase string into capitalized words.
 * Example: "student_placement" -> "Student Placement"
 */
export const labelize = (str) => {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Formats a date string into a clean, human-readable layout.
 * Example: "2026-06-07" -> "Jun 7, 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Fallback if string is irregular
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};