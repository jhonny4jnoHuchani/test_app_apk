import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import {
  establecerTema,
  listarModalidades,
  Modalidad,
  Nivel,
  obtenerMapa,
  obtenerMiProgreso,
} from '../../api/juego.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { LevelNode, NODE_SIZE_BOSS } from '../../components/LevelNode';
import { PathConnector } from '../../components/PathConnector';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Skeleton } from '../../components/Skeleton';
import { useJuegoStore } from '../../store/juegoStore';
import { colors, getAcento } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type Etapa = 'cargando' | 'escribir-tema' | 'mapa' | 'error';

const ROW_H = 132; // separación vertical entre nodos
const PAD_TOP = 24;

// Fondo del mapa: base plana + gradiente sutil hacia el acento
function FondoAcento({ acento, children }: { acento: string; children: ReactNode }) {
  return (
    <View style={styles.mapaContainer}>
      <LinearGradient
        pointerEvents="none"
        colors={[`${acento}00`, `${acento}2E`]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export default function MapaScreen() {
  const { modalidadId: modalidadIdParam } = useLocalSearchParams<{
    modalidadId?: string;
  }>();
  const { width } = useWindowDimensions();

  const [etapa, setEtapa] = useState<Etapa>('cargando');
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);
  const [tema, setTema] = useState('');
  const [guardandoTema, setGuardandoTema] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const {
    modalidadActual,
    niveles,
    temaInvestigacion,
    xpTotal,
    porcentaje,
    setModalidad,
    setMapa,
  } = useJuegoStore();

  const acento = getAcento(modalidadActual?.nombre);

  // Al montar: resolver modalidad (por URL, por store, o desde la lista)
  useEffect(() => {
    resolverModalidad();
  }, [modalidadIdParam]);

  const resolverModalidad = async () => {
    try {
      setEtapa('cargando');
      setError('');

      const idBuscado = modalidadIdParam
        ? Number(modalidadIdParam)
        : modalidadActual?.id;

      if (!idBuscado) {
        router.replace('/(estudiante)/lobby');
        return;
      }

      // Si ya la tenemos en el store y coincide el id, usar directo
      if (modalidadActual && modalidadActual.id === idBuscado) {
        await cargarMapa(modalidadActual.id);
        return;
      }

      // Si no, buscarla en la lista
      const lista = await listarModalidades();
      setModalidades(lista);
      const encontrada = lista.find((m) => m.id === idBuscado);

      if (!encontrada) {
        router.replace('/(estudiante)/lobby');
        return;
      }

      setModalidad(encontrada);
      await cargarMapa(encontrada.id);
    } catch (err: any) {
      setError('No se pudo cargar la modalidad');
      setEtapa('error');
    }
  };

  const cargarMapa = async (modalidadId: number) => {
    try {
      setEtapa('cargando');

      const [mapa, progreso] = await Promise.all([
        obtenerMapa(modalidadId),
        obtenerMiProgreso(modalidadId),
      ]);

      setMapa({
        niveles: mapa.niveles,
        xpTotal: mapa.progreso.xpTotal,
        puntosInvestigacionTotal: mapa.progreso.puntosInvestigacionTotal,
        porcentaje: mapa.progreso.porcentaje,
        temaInvestigacion: progreso.temaInvestigacion,
      });

      // Si no tiene tema, pedirlo
      if (!progreso.temaInvestigacion) {
        setEtapa('escribir-tema');
      } else {
        setEtapa('mapa');
      }
    } catch (err: any) {
      setError('No se pudo cargar el mapa');
      setEtapa('error');
    }
  };

  const seleccionarModalidad = (modalidad: Modalidad) => {
    setModalidad(modalidad);
  };

  const guardarTema = async () => {
    if (!modalidadActual) return;
    if (tema.trim().length < 10) {
      setError('El tema debe tener al menos 10 caracteres');
      return;
    }

    try {
      setGuardandoTema(true);
      setError('');
      await establecerTema(modalidadActual.id, tema.trim());
      await cargarMapa(modalidadActual.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error guardando el tema';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setGuardandoTema(false);
    }
  };

  const refrescarMapa = async () => {
    if (!modalidadActual) return;
    setRefrescando(true);
    try {
      await cargarMapa(modalidadActual.id);
    } finally {
      setRefrescando(false);
    }
  };

  const irANivel = (item: Nivel) => {
    if (item.bloqueado) return;

    // Si es Boss → pantalla Boss
    if (item.tipo === 'boss') {
      router.push(
        `/(estudiante)/boss/${item.id}?modalidadId=${modalidadActual?.id}`,
      );
      return;
    }

    // Nivel normal → primera misión
    if (item.misiones[0]) {
      router.push(`/(estudiante)/mision/${item.misiones[0].id}`);
    }
  };

  // ============================================================
  // RENDER SEGÚN ETAPA
  // ============================================================

  if (etapa === 'cargando') {
    return (
      <FondoAcento acento={acento}>
        <View
          style={[
            styles.header,
            styles.headerSkeleton,
            { backgroundColor: acento, shadowColor: acento },
          ]}
        />
        <View style={styles.skelLista}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              width={NODE_SIZE}
              height={NODE_SIZE}
              radius={NODE_SIZE / 2}
              style={{ transform: [{ translateX: [0, 60, 0, -60][i % 4] }] }}
            />
          ))}
        </View>
      </FondoAcento>
    );
  }

  if (etapa === 'error') {
    return (
      <FondoAcento acento={acento}>
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <PrimaryButton
            color={acento}
            onPress={() => router.replace('/(estudiante)/lobby')}
          >
            Volver al lobby
          </PrimaryButton>
        </View>
      </FondoAcento>
    );
  }

  if (etapa === 'escribir-tema') {
    return (
      <FondoAcento acento={acento}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="headlineMedium" style={[styles.title, { color: acento }]}>
            Tu tema de investigación
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Escribe el tema que quieres investigar en {modalidadActual?.nombre}.
          </Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Ejemplo: "Impacto del uso de redes sociales en la autoestima de
            adolescentes de colegios privados de Cochabamba, 2025"
          </Text>

          <TextInput
            label="Mi tema"
            value={tema}
            onChangeText={setTema}
            mode="outlined"
            multiline
            numberOfLines={4}
            outlineColor={colors.borderDark}
            outlineStyle={{ borderRadius: 16 }}
            activeOutlineColor={acento}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton color={acento} onPress={guardarTema} loading={guardandoTema}>
            Comenzar la aventura
          </PrimaryButton>
        </ScrollView>
      </FondoAcento>
    );
  }

  // ============================================================
  // ETAPA MAPA
  // ============================================================

  // Nivel actual = el primero disponible que aún no está completado
  const idActual = niveles.find((n) => !n.completado && !n.bloqueado)?.id;

  // Zig-zag: 0, +A, 0, -A, ... alrededor del centro
  const amplitud = Math.min(width * 0.22, 90);
  const puntos = niveles.map((n, i) => ({
    x: width / 2 + amplitud * Math.sin((i * Math.PI) / 2),
    y: PAD_TOP + NODE_SIZE_BOSS / 2 + i * ROW_H,
    completado: n.completado,
  }));
  const altoTotal =
    PAD_TOP + NODE_SIZE_BOSS + Math.max(niveles.length - 1, 0) * ROW_H + 110;

  return (
    <FondoAcento acento={acento}>
      <View style={[styles.header, { backgroundColor: acento, shadowColor: acento }]}>
        <View style={styles.headerIzquierda}>
          <Pressable
            onPress={() => router.replace('/(estudiante)/lobby')}
            style={styles.backBoton}
          >
            <Text style={styles.backTexto}>← Lobby</Text>
          </Pressable>
          <Text variant="titleLarge" style={styles.headerTitle}>
            {modalidadActual?.nombre?.toUpperCase() ?? 'TESIS'}
          </Text>

          <View style={styles.stats}>
            <View style={styles.pill}>
              <Text style={styles.pillTexto}>⚡ {xpTotal} XP</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillTexto}>📊 {porcentaje}%</Text>
            </View>
          </View>
        </View>
        <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={refrescarMapa}
            colors={[acento]}
            tintColor={acento}
          />
        }
      >
        <View style={{ height: altoTotal }}>
          <PathConnector
            puntos={puntos}
            width={width}
            height={altoTotal}
            accent={acento}
          />
          {niveles.map((n, i) => (
            <LevelNode
              key={n.id}
              index={i}
              numero={n.numero}
              titulo={n.titulo}
              esBoss={n.tipo === 'boss'}
              completado={n.completado}
              bloqueado={n.bloqueado}
              esActual={n.id === idActual}
              accent={acento}
              x={puntos[i].x}
              y={puntos[i].y}
              onPress={() => irANivel(n)}
            />
          ))}
        </View>
      </ScrollView>
    </FondoAcento>
  );
}

const NODE_SIZE = 76;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 24,
  },
  hint: {
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
  },
  mapaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  headerSkeleton: {
    height: 130,
  },
  headerIzquierda: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textInverse,
    letterSpacing: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillTexto: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  backBoton: {
    marginBottom: 4,
  },
  backTexto: {
    color: colors.textInverse,
    fontSize: 13,
    fontFamily: fonts.bodySemi,
    opacity: 0.9,
  },
  skelLista: {
    alignItems: 'center',
    gap: 44,
    paddingTop: 40,
  },
});