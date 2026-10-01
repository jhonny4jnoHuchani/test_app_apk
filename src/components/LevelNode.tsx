import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

export const NODE_SIZE = 76;
export const NODE_SIZE_BOSS = 96;
const BASE_DEPTH = 6;

interface Props {
  numero: number | string;
  titulo: string;
  esBoss: boolean;
  completado: boolean;
  bloqueado: boolean;
  esActual: boolean;
  accent: string;
  x: number;
  y: number;
  index: number;
  labelWidth: number;
  onPress: () => void;
}

function shade(hex: string, amount = 0.72) {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  const channels = [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ].map((channel) => Math.round(channel * amount));
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

export function LevelNode({
  numero,
  titulo,
  esBoss,
  completado,
  bloqueado,
  esActual,
  accent,
  x,
  y,
  index,
  labelWidth,
  onPress,
}: Props) {
  const size = esBoss ? NODE_SIZE_BOSS : NODE_SIZE;
  const color = completado
    ? colors.secondary
    : bloqueado
      ? colors.misionBloqueada
      : esBoss
        ? colors.xp
        : accent;
  const content = completado
    ? '✓'
    : bloqueado
      ? '🔒'
      : esBoss
        ? '👹'
        : String(numero);
  const isEmoji = bloqueado || (esBoss && !completado);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.55 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 13, delay: 80 + index * 75 }}
      style={[
        styles.wrapper,
        { left: x - labelWidth / 2, top: y - size / 2, width: labelWidth },
      ]}
    >
      {esActual && (
        <MotiView
          pointerEvents="none"
          from={{ scale: 0.9, opacity: 0.42 }}
          animate={{ scale: 1.42, opacity: 0 }}
          transition={{ type: 'timing', duration: 1450, loop: true }}
          style={[
            styles.pulse,
            {
              top: (size - (size + 22)) / 2,
              left: (labelWidth - size - 22) / 2,
              width: size + 22,
              height: size + 22,
              borderRadius: (size + 22) / 2,
              backgroundColor: color,
            },
          ]}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${titulo}${bloqueado ? ', bloqueado' : ''}`}
        accessibilityState={{ disabled: bloqueado }}
        disabled={bloqueado}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          { width: size, height: size + BASE_DEPTH },
          pressed && !bloqueado && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.base,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: shade(color),
            },
          ]}
        />
        <View
          style={[
            styles.face,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              borderColor: bloqueado ? colors.borderDark : colors.ink,
              opacity: bloqueado ? 0.88 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.number,
              isEmoji && styles.emoji,
              esBoss && isEmoji && { fontSize: 38 },
            ]}
          >
            {content}
          </Text>
        </View>
        {completado && (
          <View style={styles.starBadge}>
            <Text style={styles.star}>★</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.label}>
        <Text
          numberOfLines={2}
          style={[styles.labelText, bloqueado && styles.lockedLabel]}
        >
          {titulo}
        </Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  pressable: {
    alignItems: 'center',
  },
  pressed: {
    transform: [{ translateY: 4 }],
  },
  base: {
    position: 'absolute',
    top: BASE_DEPTH,
  },
  face: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 0,
    elevation: 4,
  },
  number: {
    color: colors.textInverse,
    fontFamily: 'LilitaOne',
    fontSize: 30,
    textShadowColor: 'rgba(0,0,0,0.16)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  emoji: {
    fontSize: 27,
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  star: {
    color: colors.xpDark,
    fontSize: 15,
  },
  label: {
    minHeight: 27,
    maxWidth: '100%',
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 0,
    elevation: 1,
  },
  labelText: {
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 12,
    textAlign: 'center',
  },
  lockedLabel: {
    color: colors.textLight,
  },
});