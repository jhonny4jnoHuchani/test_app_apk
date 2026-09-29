import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, TextInput } from 'react-native-paper';
import { api } from '../../api/client';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';

interface MisionCandidata {
  id: string;
  titulo: string;
  competencia: string | null;
  nivelTitulo: string;
  modalidadNombre: string;
  fallos: number;
}

export default function AsignarRecomendacionScreen() {
  const { estudianteId } = useLocalSearchParams<{ estudianteId: string }>();

  const [misiones, setMisiones] = useState<MisionCandidata[]>([]);
  const [misionSeleccionada, setMisionSeleccionada] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (estudianteId) cargarMisiones();
  }, [estudianteId]);

  const cargarMisiones = async () => {
    try {
      setCargando(true);
      setError('');
      const { data } = await api.get(
        `/reportes/estudiantes/${estudianteId}/misiones-candidatas`,
      );
      setMisiones(data.misiones ?? data);
    } catch (err: any) {
      // Si el endpoint no existe todavía, no rompemos la UI.
      // Dejamos lista vacía y avisamos al docente.
      setError(
        'Aún no se puede cargar la lista de misiones. Usa el modo manual o pide al backend habilitar /misiones-candidatas.',
      );
      setMisiones([]);
    } finally {
      setCargando(false);
    }
  };

  const asignar = async () => {
    if (!misionSeleccionada) {
      setError('Selecciona una misión');
      return;
    }

    try {
      setEnviando(true);
      setError('');
      await api.post('/recomendaciones', {
        estudianteId,
        misionId: misionSeleccionada,
        nota: nota.trim() || undefined,
      });
      setExito(true);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'No se pudo asignar la recomendación';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (exito) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✅</Text>
        <Text variant="titleLarge" style={styles.tituloExito}>
          Recomendación asignada
        </Text>
        <Text variant="bodyMedium" style={styles.subExito}>
          El estudiante recibirá una notificación.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleMedium" style={styles.seccion}>
        Selecciona una misión
      </Text>

      {misiones.length === 0 && (
        <Card style={styles.cardVacio}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.vacioTexto}>
              {error || 'No hay misiones candidatas disponibles.'}
            </Text>
          </Card.Content>
        </Card>
      )}

      {misiones.map((m) => {
        const activa = misionSeleccionada === m.id;
        return (
          <Card
            key={m.id}
            style={[styles.cardMision, activa && styles.cardActiva]}
            onPress={() => setMisionSeleccionada(m.id)}
          >
            <Card.Content>
              <Text variant="titleSmall" style={styles.misionTitulo}>
                {m.titulo}
              </Text>
              <Text variant="bodySmall" style={styles.misionSub}>
                {m.modalidadNombre} · {m.nivelTitulo}
              </Text>
              {m.competencia && (
                <Text variant="bodySmall" style={styles.misionComp}>
                  Competencia: {m.competencia}
                </Text>
              )}
              {m.fallos > 0 && (
                <Text variant="bodySmall" style={styles.misionFallos}>
                  ⚠️ {m.fallos} intento(s) fallido(s)
                </Text>
              )}
            </Card.Content>
          </Card>
        );
      })}

      <Text variant="titleMedium" style={styles.seccion}>
        Nota para el estudiante (opcional)
      </Text>

      <TextInput
        label="Ej: Refuerza esta competencia antes del examen"
        value={nota}
        onChangeText={setNota}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      {error && misiones.length > 0 ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <PrimaryButton
        onPress={asignar}
        loading={enviando}
        disabled={!misionSeleccionada || enviando}
      >
        Asignar recomendación
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
    gap: 12,
  },
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.backgroundAlt,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  cardVacio: {
    backgroundColor: colors.card,
  },
  vacioTexto: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardMision: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActiva: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  misionTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  misionSub: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  misionComp: {
    color: colors.textLight,
    marginTop: 4,
  },
  misionFallos: {
    color: colors.warning,
    marginTop: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  tituloExito: {
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  subExito: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});