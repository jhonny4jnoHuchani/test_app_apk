import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  children: ReactNode;
  /** Color de acento (sombra, borde, gradiente). Usa getAcento(modalidad). */
  accent?: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Si se define, la card entra con fade + subida; el valor es el retraso en ms (escalonado). */
  entradaDelay?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const RADIO = 20;

export function GameCard({
  children,
  accent = colors.primary,
  onPress,
  disabled,
  entradaDelay,
  style,
  contentStyle,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const interactiva = !!onPress && !disabled;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <MotiView
      from={entradaDelay !== undefined ? { opacity: 0, translateY: 24 } : undefined}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 420, delay: entradaDelay ?? 0 }}
      style={style}
    >
      <Animated.View
        style={[
          {
            borderRadius: RADIO,
            backgroundColor: colors.card,
            shadowColor: accent,
            shadowOpacity: disabled ? 0 : 0.28,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 12,
            elevation: disabled ? 0 : 5,
          },
          animStyle,
        ]}
      >
        <Pressable
          disabled={!interactiva}
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 300 });
          }}
        >
          <LinearGradient
            colors={[colors.card, `${accent}1F`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.contenido, { borderColor: `${accent}40` }, contentStyle]}
          >
            {children}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    borderRadius: RADIO,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
    overflow: 'hidden',
  },
});