import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import {
  marcarComoLeida,
  marcarTodasComoLeidas,
  Notificacion,
  obtenerMisNotificaciones,
} from '../../api/notificaciones.api';
import { useNotificacionesStore } from '../../store/notificacionesStore';
import { colors } from '../../theme/colors';

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const { setNoLeidas, marcarLeidaLocal } = useNotificacionesStore();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data.notificaciones);
      setNoLeidas(data.notificaciones.filter((n) => !n.leida).length);
    } catch {} finally {
      setCargando(false);
    }
  };

  const handleLeer = async (id: string) => {
    await marcarComoLeida(id);
    marcarLeidaLocal(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const handleLeerTodas = async () => {
    await marcarTodasComoLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
  };

    const handleTap = async (notif: Notificacion) => {
    // 1. Si no está leída, marcarla como leída
    if (!notif.leida) {
      await handleLeer(notif.id);
    }

    // 2. Navegar según el tipo de notificación
    switch (notif.tipo) {
      case 'recomendacion_asignada':
      case 'recomendacion_completada':
        router.push('/(estudiante)/recomendaciones');
        break;
      case 'insignia_obtenida':
        router.push('/(estudiante)/perfil');
        break;
      case 'nivel_completado':
        router.push('/(estudiante)/lobby');
        break;
      default:
        break;
    }
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'recomendacion_asignada':
        return '📌';
      case 'recomendacion_completada':
        return '✅';
      case 'insignia_obtenida':
        return '🏆';
      case 'nivel_completado':
        return '🎉';
      default:
        return '🔔';
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={cargar}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {noLeidas > 0 && (
        <Pressable onPress={handleLeerTodas} style={styles.marcarTodas}>
          <Text variant="bodyMedium" style={styles.marcarTodasTexto}>
            Marcar todas como leídas
          </Text>
        </Pressable>
      )}

      {notificaciones.length === 0 && (
        <Text variant="bodyLarge" style={styles.vacio}>
          No tienes notificaciones
        </Text>
      )}

      {notificaciones.map((notif) => (
        <Pressable
          key={notif.id}
          onPress={() => handleTap(notif)}
        >
          <Card style={[styles.card, !notif.leida && styles.cardNoLeida]}>
            <Card.Content style={styles.content}>
              <Text style={styles.icono}>{getIcono(notif.tipo)}</Text>
              <View style={styles.info}>
                <Text variant="titleSmall" style={styles.titulo}>
                  {notif.titulo}
                </Text>
                <Text variant="bodySmall" style={styles.mensaje}>
                  {notif.mensaje}
                </Text>
              </View>
              {!notif.leida && <View style={styles.punto} />}
            </Card.Content>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 8,
    backgroundColor: 'transparent',
  },
  marcarTodas: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  marcarTodasTexto: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 7,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
  cardNoLeida: {
    backgroundColor: colors.paperLight,
    borderColor: colors.red,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icono: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  titulo: {
    fontWeight: 'bold',
    color: colors.ink,
  },
  mensaje: {
    color: colors.brown,
    marginTop: 2,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
  },
});