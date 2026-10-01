import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { assets } from '../theme/assets';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function RetroBackground({ children, style }: Props) {
  return (
    <ImageBackground
      source={assets.login}
      resizeMode="cover"
      style={[styles.container, style]}
      imageStyle={styles.loginImage}
    >
      <View
        pointerEvents="none"
        style={[styles.tint, styles.loginTint]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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