import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import {
  establecerTema,
  listarModalidades,
  Modalidad,
  Nivel,
  obtenerMapa,
  obtenerMiProgreso
} from '../../api/juego.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useJuegoStore } from '../../store/juegoStore';
import { colors } from '../../theme/colors';

type Etapa = 'cargando' | 'escribir-tema' | 'mapa' | 'error';
const AppFlatList: any = FlatList;

export default function MapaScreen() {
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
      <ScrollView contentContainerStyle={styles.container}>
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
          style={styles.input}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <PrimaryButton onPress={guardarTema} loading={guardandoTema}>
          Comenzar la aventura
        </PrimaryButton>
      </ScrollView>
    );
  }

  // Etapa MAPA
  return (
    <View style={styles.mapaContainer}>

      <View style={styles.header}>
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
            <Text variant="bodyMedium" style={styles.statText}>
              ⚡ {xpTotal} XP
            </Text>
            <Text variant="bodyMedium" style={styles.statText}>
              📊 {porcentaje}%
            </Text>
          </View>
        </View>
        <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
      </View>


      <AppFlatList
        data={niveles}
        keyExtractor={(item: Nivel) => item.id}
        contentContainerStyle={styles.listaNiveles}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={refrescarMapa}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }: { item: Nivel }) => (
          <Pressable


            onPress={() => {
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
            }}


            style={[
              styles.nivelCard,
              item.completado && styles.nivelCompletado,
              item.bloqueado && styles.nivelBloqueado,
            ]}
          >
            <View style={styles.nivelNumero}>
              <Text style={styles.nivelNumeroTexto}>
                {item.completado ? '✓' : item.numero}
              </Text>
            </View>
            <View style={styles.nivelInfo}>
              <Text
                variant="titleMedium"
                style={[
                  styles.nivelTitulo,
                  item.bloqueado && styles.nivelTituloBloqueado,
                ]}
              >
                {item.titulo}
              </Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.nivelDesc,
                  item.bloqueado && styles.nivelDescBloqueado,
                ]}
                numberOfLines={2}
              >
                {item.descripcion}
              </Text>
            </View>


          <Text style={styles.nivelIcono}>
            {item.completado ? '⭐' : item.bloqueado ? '🔒' : item.tipo === 'boss' ? '👹' : '▶️'}
          </Text>


          </Pressable>
        )}
      />
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
  header: {
    padding: 16,
    backgroundColor: colors.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: colors.textInverse,
  },
  listaNiveles: {
    padding: 16,
    gap: 12,
  },
  nivelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.paperLight,
    borderWidth: 2,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 2,
  },
  nivelCompletado: {
    borderColor: colors.misionCompletada,
    backgroundColor: '#F0FDF4',
  },
  nivelBloqueado: {
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    opacity: 0.7,
  },
  nivelNumero: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nivelNumeroTexto: {
    color: colors.textInverse,
    fontWeight: 'bold',
    fontSize: 18,
  },
  nivelInfo: {
    flex: 1,
  },
  nivelTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  nivelTituloBloqueado: {
    color: colors.textLight,
  },
  nivelDesc: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  nivelDescBloqueado: {
    color: colors.textLight,
  },
  nivelIcono: {
    fontSize: 24,
    marginLeft: 8,
  },

  headerIzquierda: {
    flex: 1,
  },
  backBoton: {
    marginBottom: 4,
  },
  backTexto: {
    color: colors.textInverse,
    fontSize: 13,
    opacity: 0.9,
  },
});