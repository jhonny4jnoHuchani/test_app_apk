import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Text } from 'react-native-paper';
import { Insignia, obtenerInsigniasDisponibles } from '../../api/insignias.api';
import { obtenerMiProgreso } from '../../api/juego.api';
import { InsigniaCard } from '../../components/InsigniaCard';
import { XPBar } from '../../components/XPBar';
import { useAuthStore } from '../../store/authStore';
import { useJuegoStore } from '../../store/juegoStore';
import { colors } from '../../theme/colors';

export default function PerfilScreen() {
  const usuario = useAuthStore((state) => state.usuario);
  const { modalidadActual, xpTotal, porcentaje, temaInvestigacion, setMapa, niveles } =
    useJuegoStore();

  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [insigniasData] = await Promise.all([
        obtenerInsigniasDisponibles(),
      ]);

      setInsignias(insigniasData.insignias);

      // Si hay modalidad, refrescar progreso
      if (modalidadActual) {
        const progreso = await obtenerMiProgreso(modalidadActual.id);
        setMapa({
          niveles,
          xpTotal: progreso.xpTotal,
          puntosInvestigacionTotal: progreso.puntosInvestigacionTotal,
          porcentaje: progreso.porcentaje,
          temaInvestigacion: progreso.temaInvestigacion,
        });
      }
    } catch (err) {
      console.warn('Error cargando perfil', err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const obtenidas = insignias.filter((i) => i.obtenida).length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={cargarDatos}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header con avatar */}
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={(usuario?.email?.[0] ?? 'U').toUpperCase()}
          style={{ backgroundColor: colors.primary }}
        />
        <Text variant="titleLarge" style={styles.email}>
          {usuario?.email}
        </Text>
        <Text variant="bodyMedium" style={styles.rol}>
          {usuario?.rol === 'estudiante' ? '🎓 Estudiante' : '👨‍🏫 Docente'}
        </Text>
      </View>

      {/* Progreso */}
      {modalidadActual && (
        <Card style={styles.card}>
          <Card.Title title="📊 Mi progreso" />
          <Card.Content>
            <XPBar xpActual={xpTotal} porcentaje={porcentaje} />

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumero}>
                  {xpTotal}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  XP total
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumero}>
                  {porcentaje}%
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Completado
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumero}>
                  {obtenidas}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Insignias
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Tema de investigación */}
      {temaInvestigacion && (
        <Card style={styles.card}>
          <Card.Title title="🔬 Mi tema de investigación" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.tema}>
              {temaInvestigacion}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Insignias */}
      <Text variant="titleLarge" style={styles.seccion}>
        🏆 Mis insignias ({obtenidas}/{insignias.length})
      </Text>

      {insignias.map((ins) => (
        <InsigniaCard key={ins.id} insignia={ins} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  email: {
    marginTop: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  rol: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.background,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumero: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textSecondary,
  },
  tema: {
    lineHeight: 22,
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
});