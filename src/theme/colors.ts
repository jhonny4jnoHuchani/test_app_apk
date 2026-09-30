// ============================================================
// COLORES DE TESIS QUEST — Paleta "Aventura Académica"
// ============================================================
// Se conservan las claves históricas (ink, brown, red, paper...)
// como alias para no romper componentes existentes.
// ============================================================

export const colors = {
  // Primarios
  primary: '#5B4FE9',
  primaryDark: '#4338C7',
  primaryLight: '#8B82F0',

  // Secundario / XP dorado
  secondary: '#FFB020',
  secondaryDark: '#D98F00',
  secondaryLight: '#FFD37A',

  // Estados
  success: '#2ECC71',
  warning: '#FFB020',
  error: '#FF5A5F',
  info: '#5B4FE9',

  // Corazones (vidas)
  heart: '#FF5A5F',
  heartEmpty: '#D9D5EA',

  // XP y progreso
  xp: '#FFB020',
  xpDark: '#D98F00',
  progress: '#2ECC71',
  progressBackground: '#E4E0F5',

  // Fondos
  background: '#F5F3FF',
  backgroundAlt: '#EAE6FB',
  card: '#FFFFFF',
  backgroundOverlay: 'rgba(245, 243, 255, 0.82)',
  paper: '#EDE9FE',
  paperLight: '#F5F3FF',

  // Textos
  textPrimary: '#1E1B33',
  textSecondary: '#6B667D',
  textLight: '#9A96AD',
  textInverse: '#FFFFFF',
  ink: '#1E1B33',
  brown: '#6B667D',
  red: '#FF5A5F',
  white: '#FFFFFF',

  // Bordes y separadores
  border: '#E4E0F5',
  borderDark: '#C9C3E6',

  // Estados de misión
  misionCompletada: '#2ECC71',
  misionEnProgreso: '#FFB020',
  misionBloqueada: '#B8B4C9',

  // Insignias
  insigniaOro: '#FBBF24',
  insigniaPlata: '#9CA3AF',
  insigniaBronce: '#B45309',
  insigniaBloqueada: '#E5E7EB',

  // Sombras (tintadas con el primary, no gris genérico)
  shadow: '#5B4FE9',
} as const;

// Acento dinámico por modalidad (solo cambia headers/detalles)
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