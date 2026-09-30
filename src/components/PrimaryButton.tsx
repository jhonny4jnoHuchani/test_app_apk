import * as Haptics from 'expo-haptics';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  icon?: string;
  /** Color del botón. Por defecto primary; pásale getAcento(modalidad) para el acento dinámico. */
  color?: string;
  /** Estilo del contenedor (márgenes, width, etc.) */
  style?: StyleProp<ViewStyle>;
}

const RADIO = 16;

export function PrimaryButton({
  onPress,
  loading,
  disabled,
  children,
  icon,
  color = colors.primary,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const inactivo = !!(disabled || loading);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    // Rebote suave al soltar
    scale.value = withSpring(1, { damping: 8, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Animated.View
      style={[
        {
          borderRadius: RADIO,
          backgroundColor: inactivo ? colors.borderDark : color,
          // Sombra tintada con el color del botón (no gris genérico)
          shadowColor: color,
          shadowOpacity: inactivo ? 0 : 0.35,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 10,
          elevation: inactivo ? 0 : 6,
        },
        animStyle,
        style,
      ]}
    >
      <Button
        mode="contained"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        loading={loading}
        disabled={inactivo}
        icon={icon}
        buttonColor={color}
        textColor={colors.textInverse}
        style={{ borderRadius: RADIO }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          fontFamily: fonts.titleBold,
          fontWeight: 'normal',
          fontSize: 17,
          letterSpacing: 0.3,
        }}
      >
        {children}
      </Button>
    </Animated.View>
  );
}