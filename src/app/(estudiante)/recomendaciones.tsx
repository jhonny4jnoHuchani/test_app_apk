import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import {
  listarMisRecomendaciones,
  Recomendacion,
} from '../../api/recomendaciones.api';
import { colors } from '../../theme/colors';

export default function RecomendacionesScreen() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await listarMisRecomendaciones();
      setRecomendaciones(data);
    } catch {} finally {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {recomendaciones.length === 0 && (
        <Text style={styles.vacio}>No tienes recomendaciones pendientes</Text>
      )}

      {recomendaciones.map((rec) => (
        <Card
          key={rec.id}
          style={[styles.card, rec.completada && styles.cardCompletada]}
        >
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleSmall" style={styles.titulo}>
                {rec.misionTitulo}
              </Text>
              {rec.completada && <Text style={styles.check}>✅</Text>}
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

            <Text variant="bodySmall" style={styles.docente}>
              Asignada por: {rec.docenteNombre}
            </Text>

            {!rec.completada && (
              <Button
                mode="contained"
                style={styles.boton}
                buttonColor={colors.primary}

                onPress={() =>
                  router.push(
                    `/(estudiante)/mision/${rec.misionId}?origen=recomendacion_docente`,
                  )
                }

              >
                Ir a la misión
              </Button>
            )}
          </Card.Content>
        </Card>
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
    gap: 12,
    backgroundColor: colors.background,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardCompletada: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: colors.success,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    flex: 1,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  check: {
    fontSize: 20,
  },
  competencia: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nota: {
    color: colors.textPrimary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  docente: {
    color: colors.textLight,
    fontSize: 11,
    marginBottom: 12,
  },
  boton: {
    marginTop: 8,
  },
});