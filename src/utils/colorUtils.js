/**
 * Détermine la couleur de texte (noir ou blanc) optimale pour un fond donné
 * @param {string} hexColor - Couleur de fond en hexadécimal
 * @returns {string} '#000000' ou '#ffffff'
 */
export function getTextColorForBackground(hexColor) {
  // Supprimer le # si présent
  const hex = hexColor.replace('#', '');

  // Convertir en RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculer la luminosité (formule YIQ)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Retourner noir ou blanc selon la luminosité
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

/**
 * Mappe les IDs de couleur Google Calendar vers des codes hexadécimaux
 * @param {string} colorId - ID de couleur Google (1-11)
 * @returns {string} Code couleur hexadécimal
 */
export function getGoogleColor(colorId) {
  const colors = {
    '1': '#a4bdfc', // Lavande
    '2': '#7ae7bf', // Sauge
    '3': '#dbadff', // Raisin
    '4': '#ff887c', // Flamingo
    '5': '#fbd75b', // Banane
    '6': '#ffb878', // Mandarine
    '7': '#46d6db', // Paon
    '8': '#e1e1e1', // Graphite
    '9': '#5484ed', // Myrtille
    '10': '#51b749', // Basilic
    '11': '#dc2127', // Tomate
  };
  return colors[colorId] || '#3b82f6';
}
