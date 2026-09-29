import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import {
    ModalidadDelEstudiante,
    obtenerMisModalidades,
} from '../../api/juego.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { useAuthStore } from '../../store/authStore';
import { useJuegoStore } from '../../store/juegoStore';
import { colors } from '../../theme/colors';
import { RetroBackground } from '../../components/RetroBackground';

const EMOJIS: Record<string, string> = {
  monografia: '📝',
  tesina: '🎓',
  tesis: '🏛️',
  articulo: '📄',
};

export default function LobbyScreen() {
  const usuario = useAuthStore((state) => state.usuario);
  const setModalidad = useJuegoStore((state) => state.setModalidad);

  const [modalidades, setModalidades] = useState<ModalidadDelEstudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Recargar cada vez que la pantalla tiene foco
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerMisModalidades();
      setModalidades(data.modalidades);
    } catch (err: any) {
      setError('No se pudieron cargar tus modalidades');
    } finally {
      setCargando(false);
    }
  };

  const handleEntrar = (modalidad: ModalidadDelEstudiante) => {
    // Seteamos la modalidad en el store para que el mapa la use
    setModalidad({
      id: modalidad.modalidadId,
      nombre: modalidad.nombre,
      descripcion: modalidad.descripcion,
      ordenMundo: modalidad.ordenMundo,
    });
    router.push(
      `/(estudiante)/mapa?modalidadId=${modalidad.modalidadId}`,
    );
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RetroBackground>
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIzquierda}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            ¡Hola, {usuario?.email?.split('@')[0] ?? 'estudiante'}!
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Elige un mundo para continuar
          </Text>
        </View>
        <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargar}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ACCESOS RÁPIDOS */}
        <View style={styles.accesosRapidos}>
          <Pressable
            style={styles.accesoBoton}
            onPress={() => router.push('/(estudiante)/recomendaciones')}
          >
            <Text style={styles.accesoIcono}>📌</Text>
            <Text style={styles.accesoTexto}>Recomendaciones</Text>
          </Pressable>

          <Pressable
            style={styles.accesoBoton}
            onPress={() => router.push('/(estudiante)/unirse-grupo')}
          >
            <Text style={styles.accesoIcono}>➕</Text>
            <Text style={styles.accesoTexto}>Unirme a grupo</Text>
          </Pressable>
        </View>

        {/* ERROR */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* CARDS DE MODALIDADES */}
        <Text variant="titleMedium" style={styles.seccion}>
          Mis mundos de investigación
        </Text>

        {modalidades.map((m) => {
          const proximamente = m.totalNiveles === 0;
          const emoji = EMOJIS[m.nombre] ?? '📘';
          const completada = m.estado === 'completada';
          const enProgreso = m.estado === 'en_progreso';

          return (
            <Pressable
              key={m.modalidadId}
              disabled={proximamente}
              onPress={() => handleEntrar(m)}
              style={({ pressed }) => [
                styles.card,
                completada && styles.cardCompletada,
                proximamente && styles.cardBloqueada,
                pressed && !proximamente && styles.cardPressed,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{emoji}</Text>
                <View style={styles.cardTituloBox}>
                  <Text variant="titleMedium" style={styles.cardTitulo}>
                    {m.descripcion}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardEstado}>
                    {proximamente
                      ? '🔒 Próximamente'
                      : completada
                      ? '🏆 Completado'
                      : enProgreso
                      ? `📊 ${m.porcentaje}% completado`
                      : '✨ Listo para comenzar'}
                  </Text>
                </View>
              </View>

              {!proximamente && (
                <>
                  {/* Barra de progreso */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${m.porcentaje}%` },
                      ]}
                    />
                  </View>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <Text variant="bodySmall" style={styles.stat}>
                      ⚡ {m.xpTotal} XP
                    </Text>
                    <Text variant="bodySmall" style={styles.stat}>
                      📚 {m.nivelesCompletados}/{m.totalNiveles} niveles
                    </Text>
                  </View>

                  {/* Tema */}
                  {m.temaInvestigacion ? (
                    <Text
                      variant="bodySmall"
                      style={styles.tema}
                      numberOfLines={2}
                    >
                      🔬 {m.temaInvestigacion}
                    </Text>
                  ) : (
                    <Text variant="bodySmall" style={styles.temaVacio}>
                      Sin tema definido
                    </Text>
                  )}

                  {/* Botón implícito */}
                  <Text style={styles.entrarTexto}>
                    {enProgreso
                      ? 'Continuar →'
                      : completada
                      ? 'Volver a jugar →'
                      : 'Comenzar →'}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
    </RetroBackground>
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
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    backgroundColor: colors.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIzquierda: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textInverse,
    opacity: 0.85,
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  accesosRapidos: {
    flexDirection: 'row',
    gap: 12,
  },
  accesoBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 246, 217, 0.92)',
    borderRadius: 7,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  accesoIcono: {
    fontSize: 18,
  },
  accesoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: 10,
  },
  cardPressed: {
    backgroundColor: colors.paperLight,
  },
  cardCompletada: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  cardBloqueada: {
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardTituloBox: {
    flex: 1,
  },
  cardTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cardEstado: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    color: colors.textSecondary,
  },
  tema: {
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  temaVacio: {
    color: colors.textLight,
    fontStyle: 'italic',
  },
  entrarTexto: {
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
});