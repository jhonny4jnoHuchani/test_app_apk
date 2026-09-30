import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export const NODE_SIZE = 76;
export const NODE_SIZE_BOSS = 96;
export const LABEL_WIDTH = 150;
const BASE = 6; // grosor del borde 3D inferior

function oscurecer(hex: string, factor = 0.75): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Props {
  numero: number | string;
  titulo: string;
  esBoss: boolean;
  completado: boolean;
  bloqueado: boolean;
  esActual: boolean;
  accent: string;
  /** Centro del nodo dentro del contenedor del mapa */
  x: number;
  y: number;
  index: number;
  onPress: () => void;
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
  onPress,
}: Props) {
  const size = esBoss ? NODE_SIZE_BOSS : NODE_SIZE;
  const color = completado
    ? colors.success
    : bloqueado
    ? colors.misionBloqueada
    : esBoss
    ? colors.error
    : accent;

  const handlePress = () => {
    if (bloqueado) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const contenido = completado ? '✓' : bloqueado ? '🔒' : esBoss ? '👹' : String(numero);
  const esEmoji = bloqueado || (esBoss && !completado);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 12, delay: 80 + index * 70 }}
      style={[
        styles.wrap,
        { left: x - LABEL_WIDTH / 2, top: y - size / 2, width: LABEL_WIDTH },
      ]}
    >
      {/* Pulso del nivel actual */}
      {esActual && (
        <MotiView
          pointerEvents="none"
          from={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ type: 'timing', duration: 1500, loop: true, repeatReverse: false }}
          style={{
            position: 'absolute',
            top: -12,
            left: (LABEL_WIDTH - (size + 24)) / 2,
            width: size + 24,
            height: size + 24,
            borderRadius: (size + 24) / 2,
            backgroundColor: color,
          }}
        />
      )}

      <Pressable onPress={handlePress} style={{ width: size, height: size + BASE }}>
        {({ pressed }) => (
          <>
            {/* Base oscura (efecto 3D) */}
            <View
              style={{
                position: 'absolute',
                top: BASE,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: oscurecer(color),
              }}
            />
            {/* Cara del botón: baja al presionar */}
            <View
              style={[
                styles.cara,
                {
                  top: pressed && !bloqueado ? BASE - 2 : 0,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
                  shadowColor: color,
                  shadowOpacity: bloqueado ? 0 : 0.4,
                  elevation: bloqueado ? 0 : 6,
                },
              ]}
            >
              <Text
                style={[
                  esEmoji ? styles.emoji : styles.numero,
                  esEmoji && { fontSize: esBoss ? 42 : 28 },
                ]}
              >
                {contenido}
              </Text>
            </View>

            {completado && (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>⭐</Text>
              </View>
            )}
          </>
        )}
      </Pressable>

      <View style={styles.etiqueta}>
        <Text
          numberOfLines={2}
          style={[styles.etiquetaTexto, bloqueado && { color: colors.textLight }]}
        >
          {titulo}
        </Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  cara: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  numero: {
    fontFamily: fonts.titleBold,
    fontSize: 30,
    color: colors.textInverse,
  },
  emoji: {
    color: colors.textInverse,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: {
    fontSize: 14,
  },
  etiqueta: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  etiquetaTexto: {
    fontFamily: fonts.titleBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});