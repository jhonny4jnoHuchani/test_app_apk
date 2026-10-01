import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import {
    listarMisAsignaciones,
    Recomendacion,
} from '../../api/recomendaciones.api';
import { colors } from '../../theme/colors';

export default function RecomendacionesDocenteScreen() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await listarMisAsignaciones();
      setRecomendaciones(data);
    } catch (err: any) {
      setError('No se pudieron cargar tus recomendaciones');
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

  const pendientes = recomendaciones.filter((r) => !r.completada);
  const completadas = recomendaciones.filter((r) => r.completada);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {recomendaciones.length === 0 && (
        <Text style={styles.vacio}>
          Aún no has asignado recomendaciones
        </Text>
      )}

      {/* PENDIENTES */}
      {pendientes.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.seccion}>
            ⏳ Pendientes ({pendientes.length})
          </Text>

          {pendientes.map((rec) => (
            <Card key={rec.id} style={[styles.card, styles.cardPendiente]}>
              <Card.Content>
                <View style={styles.header}>
                  <Text variant="titleSmall" style={styles.titulo}>
                    {rec.misionTitulo ?? `Misión ${rec.misionId}`}
                  </Text>
                  <Text style={styles.badgePendiente}>PENDIENTE</Text>
                </View>

                {rec.competencia && (
                  <Text variant="bodySmall" style={styles.competencia}>
                    Competencia: {rec.competencia}
                  </Text>
                )}

                {rec.nota && (
                  <Text variant="bodySmall" style={styles.nota}>
                    📝 {rec.nota}
                  </Text>
                )}

                <Text variant="bodySmall" style={styles.fecha}>
                  Asignada: {new Date(rec.createdAt).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* COMPLETADAS */}
      {completadas.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.seccion}>
            ✅ Completadas ({completadas.length})
          </Text>

          {completadas.map((rec) => (
            <Card key={rec.id} style={[styles.card, styles.cardCompletada]}>
              <Card.Content>
                <View style={styles.header}>
                  <Text variant="titleSmall" style={styles.titulo}>
                    {rec.misionTitulo ?? `Misión ${rec.misionId}`}
                  </Text>
                  <Text style={styles.badgeCompletada}>COMPLETADA</Text>
                </View>

                {rec.competencia && (
                  <Text variant="bodySmall" style={styles.competencia}>
                    Competencia: {rec.competencia}
                  </Text>
                )}

                {rec.nota && (
                  <Text variant="bodySmall" style={styles.nota}>
                    📝 {rec.nota}
                  </Text>
                )}

                <Text variant="bodySmall" style={styles.fecha}>
                  Asignada: {new Date(rec.createdAt).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
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
    gap: 12,
    backgroundColor: colors.backgroundAlt,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  vacio: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
  },
  cardPendiente: {
    borderLeftColor: colors.warning,
  },
  cardCompletada: {
    borderLeftColor: colors.success,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titulo: {
    flex: 1,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  badgePendiente: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.warning,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeCompletada: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.success,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  competencia: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nota: {
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  fecha: {
    color: colors.textLight,
    fontSize: 11,
    marginTop: 4,
  },
});