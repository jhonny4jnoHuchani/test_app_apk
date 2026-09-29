import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textInverse,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    onSecondary: colors.textInverse,
    background: colors.background,
    surface: colors.card,
    surfaceVariant: colors.backgroundAlt,
    error: colors.error,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.borderDark,
    outlineVariant: colors.borderDark,
  },
};

export type AppTheme = typeof paperTheme;