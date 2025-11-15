// Configuration Google Calendar API
export const GOOGLE_CLIENT_ID = '711219272291-i1je9vqn1b4p0asn4fov7bdohoa08q38.apps.googleusercontent.com';
export const GOOGLE_API_KEY = 'AIzaSyA81G3xJq6iTJitDv6GO_rvjaOucTpeDNA';

export const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
];

export const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks';

// Configuration géographique (Montréal)
export const LOCATION = {
  latitude: 45.5017,
  longitude: -73.5673,
  city: 'Montréal'
};

// Configuration du cycle par défaut
export const DEFAULT_CYCLE_CONFIG = {
  cycleLength: 28,
  cycleStartDate: null
};

// Phases du cycle
export const CYCLE_PHASES = {
  MENSTRUATION: 'Menstruation',
  FOLLICULAR: 'Folliculaire',
  OVULATION: 'Ovulation',
  LUTEAL: 'Lutéale',
  SPM: 'SPM'
};

// Archétypes lunaires
export const LUNAR_ARCHETYPES = {
  MENSTRUATION: 'Lune rouge',
  FOLLICULAR: 'Jeune Fille',
  OVULATION: 'Mère',
  LUTEAL: 'Enchanteresse',
  SPM: 'SPM'
};

// Phase emojis de la lune
export const MOON_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

// Référence nouvelle lune pour calculs
export const KNOWN_NEW_MOON = new Date(Date.UTC(2025, 9, 21, 13, 25)); // 21 octobre 2025
export const LUNAR_CYCLE_DAYS = 29.53058867;
