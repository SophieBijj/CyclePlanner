/**
 * Calcule les informations de phase du cycle menstruel
 * @param {number} cycleDay - Jour du cycle (1-28 ou plus)
 * @param {number} cycleLength - Longueur totale du cycle
 * @returns {Object} Informations sur la phase (nom, couleur, description, etc.)
 */
export function getPhaseInfo(cycleDay, cycleLength) {
  const ovulationDay = cycleLength - 14;

  if (cycleDay >= 1 && cycleDay <= 5) {
    // Dégradé progressif pour les règles avec transitions dans le dernier quart
    const menstruationColors = {
      1: { color: 'url(#gradient-menstruation-1-2)', border: '#6b2336', text: '#fff', isGradient: true }, // J1: bordeaux foncé → moyen
      2: { color: 'url(#gradient-menstruation-2-3)', border: '#882c45', text: '#fff', isGradient: true }, // J2: bordeaux moyen → rose-rouge
      3: { color: 'url(#gradient-menstruation-3-4)', border: '#b3495a', text: '#7f1d1d', isGradient: true }, // J3: rose-rouge → rose moyen
      4: { color: 'url(#gradient-menstruation-4-5)', border: '#df6268', text: '#7f1d1d', isGradient: true }, // J4: rose moyen → rose clair
      5: { color: 'url(#gradient-menstruation-5-follicular)', border: '#fa8a8e', text: '#7f1d1d', isGradient: true } // J5: rose clair → bleu
    };

    return {
      name: 'Menstruation',
      shortName: 'Lune rouge',
      color: menstruationColors[cycleDay].color,
      border: menstruationColors[cycleDay].border,
      text: menstruationColors[cycleDay].text,
      isGradient: menstruationColors[cycleDay].isGradient,
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
  } else if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 2) {
    // Période de fertilité de 8 jours avec dégradés de transition
    const fertilityColors = [
      { color: 'url(#gradient-fertility-start)', border: '#AACBE0', text: '#164e63', isGradient: true }, // J-5: dégradé bleu → jaune
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-4: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-3: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-2: jaune fertilité
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J-1: jaune fertilité
      { color: '#f9f505', border: '#e8e404', text: '#713f12' }, // J ovulation: jaune SATURÉ (plus vif)
      { color: '#fdfb93', border: '#f4f087', text: '#854d0e' }, // J+1: jaune normal
      { color: 'url(#gradient-fertility-end)', border: '#CF90C1', text: '#78350f', isGradient: true } // J+2: dégradé jaune → rose
    ];

    // Calculer l'index dans le tableau (0 pour J-5, 7 pour J+2)
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
  } else if (cycleDay === cycleLength - 2) {
    // Dégradé lutéale → SPM (avant-avant-dernier jour)
    return {
      name: 'Lutéale',
      shortName: 'Transition',
      color: 'url(#gradient-luteal-spm)',
      border: '#a855f7',
      text: '#701a75',
      isGradient: true,
      description: 'Intuition, focus, nettoyage'
    };
  } else if (cycleDay === cycleLength - 1) {
    // SPM normal (avant-dernier jour)
    return {
      name: 'SPM',
      shortName: 'SPM',
      color: '#93417A',
      border: '#6d2f5a',
      text: '#fff',
      description: 'Détails, finition, laisser passer la vague'
    };
  } else if (cycleDay === cycleLength) {
    // Dégradé SPM → menstruation (dernier jour du cycle)
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
 * Obtient la couleur solide d'une phase (sans gradient)
 * @param {Object} phaseInfo - Informations de la phase
 * @returns {string} Couleur solide
 */
export function getSolidColor(phaseInfo) {
  if (!phaseInfo.isGradient) {
    return phaseInfo.color;
  }

  // Mapper les gradients vers leurs couleurs solides principales
  const gradientColorMap = {
    'url(#gradient-menstruation-1-2)': '#882c45',
    'url(#gradient-menstruation-2-3)': '#b3495a',
    'url(#gradient-menstruation-3-4)': '#df6268',
    'url(#gradient-menstruation-4-5)': '#fa8a8e',
    'url(#gradient-menstruation-5-follicular)': '#f4abb4',
    'url(#gradient-fertility-start)': '#DDE9EF',
    'url(#gradient-fertility-end)': '#fdfb93',
    'url(#gradient-luteal-spm)': '#CF90C1',
    'url(#gradient-spm-menstruation)': '#93417A'
  };

  return gradientColorMap[phaseInfo.color] || phaseInfo.border || phaseInfo.color;
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
