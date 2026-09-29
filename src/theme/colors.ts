// ============================================================
// COLORES DE TESIS QUEST
// ============================================================
// Paleta de tinta, papel y colores planos inspirada en aventuras
// de cómic clásico, sin perder el contraste de una app educativa.
// ============================================================

export const colors = {
  // Primarios
  primary: '#C93B32',
  primaryDark: '#8F2924',
  primaryLight: '#E56A4D',

  // Secundarios
  secondary: '#3D8B82',
  secondaryDark: '#28645F',
  secondaryLight: '#76B7A9',

  // Estados
  success: '#3D8B82',
  warning: '#E2A52B',
  error: '#C93B32',
  info: '#39769B',

  // Corazones (vidas)
  heart: '#C93B32',
  heartEmpty: '#B9A994',

  // XP y progreso
  xp: '#E2A52B',
  xpDark: '#A86D18',
  progress: '#3D8B82',
  progressBackground: '#D8C7A6',

  // Fondos
  background: '#F6E9C9',
  backgroundAlt: '#EAD8B0',
  card: '#FFF6D9',
  backgroundOverlay: 'rgba(246, 233, 201, 0.82)',
  paper: '#E9C979',
  paperLight: '#F7E6B0',

  // Textos
  textPrimary: '#1B1714',
  textSecondary: '#624E3D',
  textLight: '#927A63',
  textInverse: '#FFF8E8',
  ink: '#1B1714',
  brown: '#624E3D',
  red: '#C93B32',
  white: '#FFF8E8',

  // Bordes y separadores
  border: '#C9B58E',
  borderDark: '#8C735A',

  // Estados de misión
  misionCompletada: '#10B981',
  misionEnProgreso: '#F59E0B',
  misionBloqueada: '#9CA3AF',

  // Insignias
  insigniaOro: '#FBBF24',
  insigniaPlata: '#9CA3AF',
  insigniaBronce: '#B45309',
  insigniaBloqueada: '#E5E7EB',

  // Sombras
  shadow: '#000000',
} as const;

export type Colors = typeof colors;