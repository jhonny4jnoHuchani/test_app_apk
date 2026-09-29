import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface Props {
  xpActual: number;
  xpSiguiente?: number;
  porcentaje: number;
}

export function XPBar({ xpActual, porcentaje }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="bodySmall" style={styles.label}>
          ⚡ {xpActual} XP
        </Text>
        <Text variant="bodySmall" style={styles.label}>
          {porcentaje}%
        </Text>
      </View>
      <View style={styles.barBackground}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${Math.min(porcentaje, 100)}%` }}
          transition={{ type: 'timing', duration: 1000 }}
          style={styles.barFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  barBackground: {
    height: 12,
    backgroundColor: colors.progressBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.xp,
    borderRadius: 6,
  },
});