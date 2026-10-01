import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  establecerTema,
  listarModalidades,
  Modalidad,
  obtenerMapa,
  obtenerMiProgreso
} from '../../api/juego.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { MissionPathMap } from '../../components/MissionPathMap';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoundedNavigationHeader } from '../../components/RoundedNavigationHeader';
import { useJuegoStore } from '../../store/juegoStore';
import { colors } from '../../theme/colors';

type Etapa = 'cargando' | 'escribir-tema' | 'mapa' | 'error';

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const { modalidadId: modalidadIdParam } = useLocalSearchParams<{
    modalidadId?: string;
  }>();

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

  // ============================================================
  // RENDER SEGÚN ETAPA
  // ============================================================

  if (etapa === 'cargando') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }



  if (etapa === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <PrimaryButton onPress={() => router.replace('/(estudiante)/lobby')}>
          Volver al lobby
        </PrimaryButton>
      </View>
    );
  }



  if (etapa === 'escribir-tema') {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        <Text variant="headlineMedium" style={styles.title}>
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
          contentStyle={{ fontSize: 16 }}
          style={styles.input}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <PrimaryButton onPress={guardarTema} loading={guardandoTema}>
          Comenzar la aventura
        </PrimaryButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a mis mundos"
          hitSlop={12}
          onPress={() => router.replace('/(estudiante)/lobby')}
          style={styles.introBackButton}
        >
          <Feather name="arrow-left" size={18} color={colors.textSecondary} />
          <Text style={styles.introBackText}>Volver</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Etapa MAPA
  return (
    <View style={styles.mapaContainer}>

      <RoundedNavigationHeader>
        <View style={styles.headerIzquierda}>
          <Text variant="titleLarge" numberOfLines={1} style={styles.headerTitle}>
            {modalidadActual?.nombre?.toUpperCase() ?? 'TESIS'}
          </Text>

          
          <View style={styles.stats}>
            <Text variant="bodyMedium" style={styles.statText}>
              ⚡ {xpTotal} XP
            </Text>
            <Text variant="bodyMedium" style={styles.statText}>
              📊 {porcentaje}%
            </Text>
          </View>
        </View>
        <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
      </RoundedNavigationHeader>


      <MissionPathMap
        niveles={niveles}
        modalidadId={modalidadActual?.id}
        refreshing={refrescando}
        onRefresh={refrescarMapa}
      />
      <View
        style={[
          styles.backFooter,
          {
            paddingBottom: Math.max(insets.bottom + 10, 10),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a mis mundos"
          hitSlop={12}
          onPress={() => router.replace('/(estudiante)/lobby')}
          style={styles.backBoton}
        >
          <Feather name="arrow-left" size={18} color={colors.textPrimary} />
          <Text style={styles.backTexto}>Volver</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
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
  modalidades: {
    gap: 16,
  },
  modalidadCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalidadCardPressed: {
    backgroundColor: colors.primaryLight,
  },
  modalidadTitle: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  mapaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    color: colors.textInverse,
  },
  headerIzquierda: {
    flex: 1,
    minWidth: 0,
  },
  backBoton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
  },
  backFooter: {
    paddingTop: 4,
    paddingHorizontal: 22,
    backgroundColor: colors.background,
  },
  backTexto: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 15,
  },
  introBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 'auto',
    paddingVertical: 4,
  },
  introBackText: {
    color: colors.textSecondary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
});