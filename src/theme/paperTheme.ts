import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';
import { fonts } from './typography';

const titulo = { fontFamily: fonts.title, fontWeight: 'normal' as const };
const semi = { fontFamily: fonts.bodySemi, fontWeight: 'normal' as const };
const cuerpo = { fontFamily: fonts.body, fontWeight: 'normal' as const };

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 4, // MD3 lo multiplica x4 → esquinas de 16
  fonts: configureFonts({
    config: {
      displayLarge: titulo,
      displayMedium: titulo,
      displaySmall: titulo,
      headlineLarge: titulo,
      headlineMedium: titulo,
      headlineSmall: titulo,
      titleLarge: titulo,
      titleMedium: semi,
      titleSmall: semi,
      labelLarge: semi,
      labelMedium: semi,
      labelSmall: semi,
      bodyLarge: cuerpo,
      bodyMedium: cuerpo,
      bodySmall: cuerpo,
    },
  }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textInverse,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    onSecondary: colors.textPrimary, // texto oscuro sobre dorado, mejor contraste
    background: colors.background,
    surface: colors.card,
    surfaceVariant: colors.backgroundAlt,
    error: colors.error,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.borderDark,
    outlineVariant: colors.border,
  },
};

export type AppTheme = typeof paperTheme;