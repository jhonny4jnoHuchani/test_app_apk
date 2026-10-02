import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

const displayFont = { fontFamily: 'LilitaOne', fontWeight: '400' as const };
const bodyFont = { fontFamily: 'Nunito', fontWeight: '400' as const };
const labelFont = displayFont;

const appFontConfig = {
  displayLarge: displayFont,
  displayMedium: displayFont,
  displaySmall: displayFont,
  headlineLarge: displayFont,
  headlineMedium: displayFont,
  headlineSmall: displayFont,
  titleLarge: displayFont,
  titleMedium: displayFont,
  titleSmall: displayFont,
  bodyLarge: bodyFont,
  bodyMedium: bodyFont,
  bodySmall: bodyFont,
  labelLarge: labelFont,
  labelMedium: labelFont,
  labelSmall: labelFont,
};

export const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: appFontConfig }),
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

export const studentPaperTheme = paperTheme;

export type AppTheme = typeof paperTheme;