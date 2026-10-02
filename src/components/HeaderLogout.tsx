import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useJuegoStore } from '../store/juegoStore';
import { colors } from '../theme/colors';
import { NotificacionesBell } from './NotificacionesBell';
import { ExitConfirmationModal } from './ExitConfirmationModal';

interface Props {
  titulo?: string;
  mostrarPerfil?: boolean;
  mostrarNotificaciones?: boolean;
}

export function HeaderLogout({
  titulo,
  mostrarPerfil,
  mostrarNotificaciones,
}: Props) {
  const logout = useAuthStore((state) => state.logout);
  const usuario = useAuthStore((state) => state.usuario);
  const limpiarJuego = useJuegoStore((state) => state.limpiar);
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  const handleLogout = () => {
    logout();
    limpiarJuego();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {titulo ? (
        <Text variant="titleMedium" style={styles.titulo}>
          {titulo}
        </Text>
      ) : (
        <View />
      )}
      <View style={styles.actions}>
        {mostrarNotificaciones && <NotificacionesBell />}
        {mostrarPerfil && (
          <IconButton
            icon="account"
            iconColor={colors.textInverse}
            size={24}
            onPress={() =>
              router.push(
                usuario?.rol === 'docente'
                  ? '/(docente)/perfil'
                  : '/(estudiante)/perfil',
              )
            }
          />
        )}
        <IconButton
          icon="logout"
          iconColor={colors.textInverse}
          size={24}
          onPress={() => setConfirmarSalida(true)}
        />
      </View>
      <ExitConfirmationModal
        visible={confirmarSalida}
        title="¿Cerrar sesión?"
        message="Volverás a la pantalla de inicio y podrás entrar de nuevo cuando quieras."
        confirmLabel="Cerrar sesión"
        onCancel={() => setConfirmarSalida(false)}
        onConfirm={() => {
          setConfirmarSalida(false);
          handleLogout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    minWidth: 0,
  },
  titulo: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});