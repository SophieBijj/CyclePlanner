import { KNOWN_NEW_MOON, LUNAR_CYCLE_DAYS, MOON_EMOJIS } from '../config/constants';

/**
 * Calcule les informations sur la phase lunaire pour une date donnée
 * @param {Date} date - La date pour laquelle calculer la phase lunaire
 * @returns {Object} Objet contenant l'emoji, le nom de la phase et l'âge lunaire
 */
export function getMoonInfo(date) {
  const diff = date - KNOWN_NEW_MOON;
  const daysSinceKnownNewMoon = diff / (1000 * 60 * 60 * 24);
  let lunarAge = daysSinceKnownNewMoon % LUNAR_CYCLE_DAYS;

  // Gérer les dates avant la référence
  if (lunarAge < 0) lunarAge += LUNAR_CYCLE_DAYS;

  const phase = Math.floor((lunarAge / LUNAR_CYCLE_DAYS) * 8);

  const moonNames = [
    'Nouvelle lune',
    'Premier croissant',
    'Premier quartier',
    'Gibbeuse croissante',
    'Pleine lune',
    'Gibbeuse décroissante',
    'Dernier quartier',
    'Dernier croissant'
  ];

  return {
    emoji: MOON_EMOJIS[phase],
    name: moonNames[phase],
    age: Math.round(lunarAge * 10) / 10
  };
}
