import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { obtenerContadorNoLeidas } from '../api/notificaciones.api';
import { useNotificacionesStore } from '../store/notificacionesStore';
import { colors } from '../theme/colors';

export function NotificacionesBell() {
  const noLeidas = useNotificacionesStore((state) => state.noLeidas);
  const setNoLeidas = useNotificacionesStore((state) => state.setNoLeidas);

  useEffect(() => {
    cargarContador();
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarContador, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarContador = async () => {
    try {
      const { noLeidas } = await obtenerContadorNoLeidas();
      setNoLeidas(noLeidas);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="bell"
        iconColor={colors.textInverse}
        size={24}
        onPress={() => router.push('/(estudiante)/notificaciones')}
      />
      {noLeidas > 0 && (
        <Badge style={styles.badge} size={18}>
          {noLeidas > 9 ? '9+' : noLeidas}
        </Badge>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
  },
});