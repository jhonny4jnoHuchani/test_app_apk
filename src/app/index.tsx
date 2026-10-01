import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { assets } from '../theme/assets';
import { colors } from '../theme/colors';

export default function Index() {
  const usuario = useAuthStore((state) => state.usuario);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <ImageBackground source={assets.portada} resizeMode="cover" style={styles.splash}>
        <View style={styles.splashShade} />
        <ActivityIndicator size="large" color={colors.paperLight} />
      </ImageBackground>
    );
  }

  if (!usuario) {
    return <Redirect href="/(auth)/login" />;
  }

  if (usuario.rol === 'docente') {
    return <Redirect href="/(docente)" />;
  }

  return <Redirect href="/(estudiante)/lobby" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 70,
    backgroundColor: colors.ink,
  },
  splashShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 14, 12, 0.18)',
  },
});