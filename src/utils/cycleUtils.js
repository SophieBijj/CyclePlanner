/**
 * Calcule les informations de phase du cycle menstruel
 * @param {number} cycleDay - Jour du cycle (1-28 ou plus)
 * @param {number} cycleLength - Longueur totale du cycle
 * @returns {Object} Informations sur la phase (nom, couleur, description, etc.)
 */
export function getPhaseInfo(cycleDay, cycleLength) {
  const ovulationDay = cycleLength - 14;

  if (cycleDay >= 1 && cycleDay <= 5) {
    // Dégradé pour les règles : J1 très foncé, progression vers rose clair
    const menstruationColors = {
      1: { color: '#882c45', border: '#6b2336', text: '#fff' }, // J1: bordeaux très foncé
      2: { color: '#b3495a', border: '#882c45', text: '#fff' }, // J2: bordeaux moyen
      3: { color: '#df6268', border: '#b3495a', text: '#7f1d1d' }, // J3: rose-rouge
      4: { color: '#fa8a8e', border: '#df6268', text: '#7f1d1d' }, // J4: rose moyen
      5: { color: '#f4abb4', border: '#fa8a8e', text: '#7f1d1d' } // J5: rose clair
    };

    return {
      name: 'Menstruation',
      shortName: 'Lune rouge',
      color: menstruationColors[cycleDay].color,
      border: menstruationColors[cycleDay].border,
      text: menstruationColors[cycleDay].text,
      description: 'Repos, introspection, détoxification'
    };
  } else if (cycleDay >= 6 && cycleDay < ovulationDay - 5) {
    return {
      name: 'Folliculaire',
      shortName: 'Jeune Fille',
      color: '#DDE9EF',
      border: '#AACBE0',
      text: '#164e63',
      description: 'Créativité, nouveaux projets, brainstorming'
    };
  } else if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1) {
    // Période de fertilité de 7 jours avec dégradés de transition
    const fertilityColors = [
      { color: 'url(#gradient-fertility-start)', border: '#AACBE0', text: '#164e63', isGradient: true }, // J-5: dégradé bleu → jaune
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-4: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-3: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-2: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-1: jaune fertilité
      { color: '#f9f505', border: '#e8e404', text: '#713f12' }, // J ovulation: jaune SATURÉ (plus vif)
      { color: 'url(#gradient-fertility-end)', border: '#CF90C1', text: '#78350f', isGradient: true } // J+1: dégradé jaune → rose
    ];

    // Calculer l'index dans le tableau (0 pour J-5, 5 pour J ovulation, 6 pour J+1)
    const colorIndex = cycleDay - (ovulationDay - 5);
    const colorInfo = fertilityColors[colorIndex];

    return {
      name: 'Ovulation',
      shortName: 'Mère',
      color: colorInfo.color,
      border: colorInfo.border,
      text: colorInfo.text,
      isGradient: colorInfo.isGradient,
      description: 'Communication, collaboration, être présente'
    };
  } else if (cycleDay === cycleLength - 3) {
    // Dégradé lutéale → SPM
    return {
      name: 'Lutéale',
      shortName: 'Transition',
      color: 'url(#gradient-luteal-spm)',
      border: '#a855f7',
      text: '#701a75',
      isGradient: true,
      description: 'Intuition, focus, nettoyage'
    };
  } else if (cycleDay === cycleLength - 2) {
    // SPM normal
    return {
      name: 'SPM',
      shortName: 'SPM',
      color: '#93417A',
      border: '#6d2f5a',
      text: '#fff',
      description: 'Détails, finition, laisser passer la vague'
    };
  } else if (cycleDay >= cycleLength - 1 && cycleDay <= cycleLength) {
    // Dégradé SPM → menstruation (2 derniers jours)
    return {
      name: 'SPM',
      shortName: 'Transition',
      color: 'url(#gradient-spm-menstruation)',
      border: '#6d2f5a',
      text: '#fff',
      isGradient: true,
      description: 'Détails, finition, laisser passer la vague'
    };
  } else {
    return {
      name: 'Lutéale',
      shortName: 'Enchanteresse',
      color: '#CF90C1',
      border: '#a855f7',
      text: '#701a75',
      description: 'Intuition, focus, nettoyage'
    };
  }
}

/**
 * Calcule la longueur moyenne d'un cycle basée sur l'historique
 * @param {Array} cycleHistory - Historique des cycles
 * @returns {number} Longueur moyenne du cycle
 */
export function getAverageCycleLength(cycleHistory) {
  if (!cycleHistory || cycleHistory.length === 0) return 28;

  const totalLength = cycleHistory.reduce((sum, cycle) => sum + cycle.length, 0);
  return Math.round(totalLength / cycleHistory.length);
}
