import { MotiView } from 'moti';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { assets } from '../theme/assets';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  variant?: 'app' | 'login';
  style?: StyleProp<ViewStyle>;
}

export function RetroBackground({ children, variant = 'app', style }: Props) {
  const esLogin = variant === 'login';

  return (
    <View style={[styles.container, style]}>
      {/* Imagen: fade + zoom-out suave de entrada */}
      <MotiView
        from={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: esLogin ? 1 : 0.42, scale: 1 }}
        transition={{ type: 'timing', duration: 900 }}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={esLogin ? assets.login : assets.fondoRandom}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      </MotiView>

      <View
        pointerEvents="none"
        style={[styles.tint, esLogin && styles.loginTint]}
      />

      {/* Contenido: solo fade, para no competir con animaciones propias de cada pantalla */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 450, delay: 150 }}
        style={styles.contenido}
      >
        {children}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  contenido: {
    flex: 1,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundOverlay,
  },
  loginTint: {
    backgroundColor: 'rgba(30, 27, 51, 0.03)',
  },
});