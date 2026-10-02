import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { api } from '../../../api/client';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../theme/colors';

interface EstudianteInfo {
  id: string;
  nombre: string;
  email: string;
  universidad: string | null;
  carrera: string | null;
  semestre: string | null;
}

interface CompetenciaDebil {
  competencia: string;
  fallos: number | string;
  incorrectos: number | string;
  parciales: number | string;
}

interface CompetenciasResponse {
  estudiante: EstudianteInfo;
  competenciasDebiles: CompetenciaDebil[];
  totalCompetencias: number;
}

export default function EstudianteDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<CompetenciasResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (id) cargar();
    }, [id]),
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const { data } = await api.get(
        `/reportes/estudiantes/${id}/competencias-debiles`,
      );
      setData(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'No se pudo cargar el estudiante';
      setError(Array.isArray(msg) ? msg[0] : msg);
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

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Estudiante no encontrado'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* INFO DEL ESTUDIANTE */}
      <Card style={styles.cardInfo}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.nombre}>
            {data.estudiante.nombre}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {data.estudiante.email}
          </Text>
          {(data.estudiante.carrera ||
            data.estudiante.universidad ||
            data.estudiante.semestre) && (
            <Text variant="bodySmall" style={styles.extra}>
              {[
                data.estudiante.carrera,
                data.estudiante.universidad,
                data.estudiante.semestre
                  ? `Semestre ${data.estudiante.semestre}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* COMPETENCIAS DÉBILES */}
      <Text variant="titleMedium" style={styles.seccion}>
        Competencias con más fallos
      </Text>

      {data.competenciasDebiles.length === 0 && (
        <Text style={styles.vacio}>
          Este estudiante no tiene fallos registrados todavía 🎉
        </Text>
      )}

      {data.competenciasDebiles.map((c, i) => (
        <Card key={i} style={styles.cardComp}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.compNombre}>
              {c.competencia}
            </Text>
            <View style={styles.compStats}>
              <Text style={[styles.compStat, { color: colors.error }]}>
                ❌ {c.incorrectos} incorrectos
              </Text>
              <Text style={[styles.compStat, { color: colors.warning }]}>
                💡 {c.parciales} parciales
              </Text>
              <Text style={[styles.compStat, { color: colors.textSecondary }]}>
                Total: {c.fallos}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* BOTÓN ASIGNAR RECOMENDACIÓN */}
      <PrimaryButton
        onPress={() =>
          router.push(
            `/(docente)/asignar-recomendacion?estudianteId=${id}` as any,
          )
        }
      >
        📌 Asignar recomendación
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.backgroundAlt,
  },
  cardInfo: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  nombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  email: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  extra: {
    color: colors.textLight,
    marginTop: 4,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  vacio: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  cardComp: {
    backgroundColor: colors.card,
  },
  compNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  compStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compStat: {
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
});