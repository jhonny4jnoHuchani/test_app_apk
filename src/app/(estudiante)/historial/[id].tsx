import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { api } from '../../../api/client';
import { colors } from '../../../theme/colors';

export default function HistorialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) cargar();
  }, [id]);

  const cargar = async () => {
    try {
      const response = await api.get(`/juego/misiones/${id}/mi-historial`);
      setData(response.data);
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

  const getColor = (resultado: string) => {
    if (resultado === 'correcto') return colors.success;
    if (resultado === 'parcial') return colors.warning;
    return colors.error;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.titulo}>
        {data?.mision?.titulo}
      </Text>
      <Text variant="bodyMedium" style={styles.total}>
        Total intentos: {data?.totalIntentos ?? 0}
      </Text>

      {data?.historial?.length === 0 && (
        <Text style={styles.vacio}>Aún no hay intentos</Text>
      )}

      {data?.historial?.map((intento: any) => (
        <Card key={intento.intentoId} style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text
                variant="titleSmall"
                style={[styles.resultado, { color: getColor(intento.resultado) }]}
              >
                {intento.resultado?.toUpperCase()}
              </Text>
              <Text variant="bodySmall" style={styles.puntuacion}>
                {intento.puntuacion}/100
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.respuesta}>
              "{intento.respuesta}"
            </Text>
            <Text variant="bodySmall" style={styles.fecha}>
              {new Date(intento.createdAt).toLocaleString()}
            </Text>
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
  titulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  total: {
    color: colors.textSecondary,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultado: {
    fontWeight: 'bold',
  },
  puntuacion: {
    color: colors.textSecondary,
  },
  respuesta: {
    fontStyle: 'italic',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  fecha: {
    color: colors.textLight,
    fontSize: 11,
  },
});