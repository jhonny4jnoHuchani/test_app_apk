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
  background: '#F3E4BC',
  backgroundAlt: '#E8D5A5',
  card: '#FFF5D9',
  cardSoft: '#F1E2B8',
  backgroundOverlay: 'rgba(243, 228, 188, 0.84)',
  paper: '#E7C66F',
  paperLight: '#F6E2A7',

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

export const modalidadColors = {
  tesis: '#5B4FE9',
  tesina: '#2EC4B6',
  monografia: '#FF9F1C',
  articulo: '#E71D8C',
} as const;

export type ModalidadClave = keyof typeof modalidadColors;

// Tolerante a mayúsculas, tildes y sufijos ("Artículo científico" → articulo)
export const getAcento = (modalidad?: string): string => {
  if (!modalidad) return colors.primary;
  const clave = modalidad
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const encontrada = (Object.keys(modalidadColors) as ModalidadClave[]).find(
    (k) => clave.startsWith(k),
  );
  return encontrada ? modalidadColors[encontrada] : colors.primary;
};
export type Colors = typeof colors;