import { router, useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import {
  ModalidadDelEstudiante,
  obtenerMisModalidades,
} from '../../api/juego.api';
import { GameCard } from '../../components/GameCard';
import { HeaderLogout } from '../../components/HeaderLogout';
import { RetroBackground } from '../../components/RetroBackground';
import { useAuthStore } from '../../store/authStore';
import { useJuegoStore } from '../../store/juegoStore';
import { colors, getAcento } from '../../theme/colors';
import { fonts } from '../../theme/typography';

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
    router.push(`/(estudiante)/mapa?modalidadId=${modalidad.modalidadId}`);
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
            <GameCard
              style={styles.accesoBoton}
              contentStyle={styles.accesoContenido}
              entradaDelay={0}
              onPress={() => router.push('/(estudiante)/recomendaciones')}
            >
              <Text style={styles.accesoIcono}>📌</Text>
              <Text style={styles.accesoTexto}>Recomendaciones</Text>
            </GameCard>

            <GameCard
              style={styles.accesoBoton}
              contentStyle={styles.accesoContenido}
              entradaDelay={80}
              onPress={() => router.push('/(estudiante)/unirse-grupo')}
            >
              <Text style={styles.accesoIcono}>➕</Text>
              <Text style={styles.accesoTexto}>Unirme a grupo</Text>
            </GameCard>
          </View>

          {/* ERROR */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text variant="titleMedium" style={styles.seccion}>
            Mis mundos de investigación
          </Text>

          {/* CARDS DE MODALIDADES */}
          {modalidades.map((m, i) => {
            const proximamente = m.totalNiveles === 0;
            const emoji = EMOJIS[m.nombre] ?? '📘';
            const completada = m.estado === 'completada';
            const enProgreso = m.estado === 'en_progreso';
            const acento = proximamente
              ? colors.misionBloqueada
              : completada
              ? colors.success
              : getAcento(m.nombre);

            return (
              <GameCard
                key={m.modalidadId}
                accent={acento}
                disabled={proximamente}
                entradaDelay={160 + i * 90}
                onPress={() => handleEntrar(m)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.emojiCirculo, { backgroundColor: `${acento}26` }]}>
                    <Text style={styles.cardEmoji}>{emoji}</Text>
                  </View>
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
                    {/* Barra de progreso animada */}
                    <View style={styles.progressBar}>
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${m.porcentaje}%` }}
                        transition={{ type: 'timing', duration: 700, delay: 300 + i * 90 }}
                        style={[styles.progressFill, { backgroundColor: acento }]}
                      />
                    </View>

                    <View style={styles.statsRow}>
                      <Text variant="bodySmall" style={styles.stat}>
                        ⚡ {m.xpTotal} XP
                      </Text>
                      <Text variant="bodySmall" style={styles.stat}>
                        📚 {m.nivelesCompletados}/{m.totalNiveles} niveles
                      </Text>
                    </View>

                    {m.temaInvestigacion ? (
                      <Text variant="bodySmall" style={styles.tema} numberOfLines={2}>
                        🔬 {m.temaInvestigacion}
                      </Text>
                    ) : (
                      <Text variant="bodySmall" style={styles.temaVacio}>
                        Sin tema definido
                      </Text>
                    )}

                    <Text style={[styles.entrarTexto, { color: acento }]}>
                      {enProgreso
                        ? 'Continuar →'
                        : completada
                        ? 'Volver a jugar →'
                        : 'Comenzar →'}
                    </Text>
                  </>
                )}
              </GameCard>
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
    paddingBottom: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  headerIzquierda: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textInverse,
  },
  headerSubtitle: {
    color: colors.textInverse,
    opacity: 0.85,
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  accesosRapidos: {
    flexDirection: 'row',
    gap: 12,
  },
  accesoBoton: {
    flex: 1,
  },
  accesoContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  accesoIcono: {
    fontSize: 18,
  },
  accesoTexto: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textPrimary,
  },
  seccion: {
    color: colors.textPrimary,
    marginTop: 8,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiCirculo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTituloBox: {
    flex: 1,
  },
  cardTitulo: {
    color: colors.textPrimary,
  },
  cardEstado: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.progressBackground,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemi,
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
    fontFamily: fonts.titleBold,
    fontSize: 15,
    textAlign: 'right',
    marginTop: 4,
  },
});