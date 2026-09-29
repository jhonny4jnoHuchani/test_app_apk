import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { assets } from '../theme/assets';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  variant?: 'app' | 'login';
  style?: StyleProp<ViewStyle>;
}

export function RetroBackground({ children, variant = 'app', style }: Props) {
  return (
    <ImageBackground
      source={variant === 'login' ? assets.login : assets.fondoRandom}
      resizeMode="cover"
      style={[styles.container, style]}
      imageStyle={variant === 'login' ? styles.loginImage : styles.image}
    >
      <View
        pointerEvents="none"
        style={[styles.tint, variant === 'login' && styles.loginTint]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    opacity: 0.42,
  },
  loginImage: {
    opacity: 1,
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.backgroundOverlay,
  },
  loginTint: {
    backgroundColor: 'rgba(27, 23, 20, 0.03)',
  },
});