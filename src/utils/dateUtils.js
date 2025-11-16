/**
 * Formate une heure de 24h en format 12h (am/pm)
 * @param {string} time24 - Heure au format 24h (ex: "14:30")
 * @returns {string} Heure au format 12h (ex: "2:30pm" ou "2pm")
 */
export function formatTimeGoogle(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  // Omettre :00 si minutes = 00
  const minutesPart = minutes === '00' ? '' : `:${minutes}`;
  return `${h12}${minutesPart}${period}`;
}

/**
 * Normalise une date à minuit (00:00:00)
 * @param {Date} date - Date à normaliser
 * @returns {Date} Date normalisée
 */
export function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Formate une date pour l'affichage
 * @param {Date} date - Date à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date formatée
 */
export function formatDate(date, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Obtient le premier jour du mois
 * @param {Date} date - Date dans le mois
 * @returns {Date} Premier jour du mois
 */
export function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtient le dernier jour du mois
 * @param {Date} date - Date dans le mois
 * @returns {Date} Dernier jour du mois
 */
export function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Vérifie si deux dates sont le même jour
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {boolean} true si même jour
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
