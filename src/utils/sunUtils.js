import { LOCATION } from '../config/constants';

/**
 * Récupère les données du lever et coucher du soleil via l'API Open-Meteo
 * @param {Date} date - La date pour laquelle récupérer les données
 * @returns {Promise<Object>} Objet contenant sunrise, sunset et leurs valeurs décimales
 */
export async function fetchSunTimes(date) {
  const { latitude, longitude } = LOCATION;
  const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`
    );
    const data = await response.json();

    if (data.daily && data.daily.sunrise && data.daily.sunset) {
      // Les données sont déjà en heure locale grâce à timezone=auto
      const sunriseStr = data.daily.sunrise[0]; // Format: "2025-11-18T07:30"
      const sunsetStr = data.daily.sunset[0];

      const sunriseDate = new Date(sunriseStr);
      const sunsetDate = new Date(sunsetStr);

      const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      };

      return {
        sunrise: formatTime(sunriseDate),
        sunset: formatTime(sunsetDate),
        sunriseDecimal: sunriseDate.getHours() + sunriseDate.getMinutes() / 60,
        sunsetDecimal: sunsetDate.getHours() + sunsetDate.getMinutes() / 60
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données du soleil:', error);
  }

  // Fallback en cas d'erreur
  return { sunrise: '07:30', sunset: '17:00', sunriseDecimal: 7.5, sunsetDecimal: 17 };
}
