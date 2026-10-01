import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, TextInput } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
      setError('¡Escoge una misión antes de lanzar el reto!');
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
        <View style={styles.exitoBadge}>
          <Ionicons name="checkmark-done-circle" size={80} color={colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.tituloExito}>
          ¡RETO ENVIADO!
        </Text>
        <Text variant="bodyMedium" style={styles.subExito}>
          El estudiante ha recibido tu recomendación en su inventario.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* CABECERA */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.seccion}>
          🎯 ELIGE LA MISIÓN OBJETIVO
        </Text>
        <Text variant="bodySmall" style={styles.subtituloHeader}>
          Selecciona la prueba que necesita reforzar tu aprendiz.
        </Text>
      </View>

      {/* ESTADO VACÍO */}
      {misiones.length === 0 && (
        <View style={styles.cardVacio}>
          <MaterialCommunityIcons name="ghost-outline" size={36} color={colors.textSecondary} />
          <Text variant="bodyMedium" style={styles.vacioTexto}>
            {error || 'No hay misiones candidatas disponibles por ahora.'}
          </Text>
        </View>
      )}

      {/* LISTA DE MISIONES */}
      {misiones.map((m) => {
        const activa = misionSeleccionada === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => setMisionSeleccionada(m.id)}
          >
            <View style={[styles.cardMision, activa && styles.cardActiva]}>
              <View style={styles.cardHeaderRow}>
                <Text variant="titleSmall" style={styles.misionTitulo}>
                  {m.titulo}
                </Text>
                <View style={[styles.radioIcon, activa && styles.radioIconActivo]}>
                  {activa && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
              </View>

              <View style={styles.tagRow}>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeText}>
                    {m.modalidadNombre} · {m.nivelTitulo}
                  </Text>
                </View>
              </View>

              {m.competencia && (
                <Text variant="bodySmall" style={styles.misionComp}>
                  ⚔️ {m.competencia}
                </Text>
              )}

              {m.fallos > 0 && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={16} color={colors.warning} />
                  <Text variant="bodySmall" style={styles.misionFallos}>
                    {m.fallos} intento(s) fallido(s) registrado(s)
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}

      {/* SECCIÓN NOTA */}
      <View style={styles.sectionNota}>
        <Text variant="titleMedium" style={styles.seccion}>
          📜 NOTA DEL MAESTRO (OPCIONAL)
        </Text>
        <TextInput
          label="Mensaje o consejo para el estudiante"
          placeholder="Ej: ¡Revisa este concepto antes de tu próximo intento!"
          value={nota}
          onChangeText={setNota}
          mode="outlined"
          multiline
          numberOfLines={3}
          contentStyle={{ fontSize: 16 }}
          style={styles.input}
          outlineColor="#000"
          activeOutlineColor={colors.primary}
        />
      </View>

      {error && misiones.length > 0 ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-decagram" size={20} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {/* BOTÓN DE ASIGNAR */}
      <View style={styles.btnShadow}>
        <PrimaryButton
          onPress={asignar}
          loading={enviando}
          disabled={!misionSeleccionada || enviando}
        >
          ¡ASIGNAR RECOMENDACIÓN! 🚀
        </PrimaryButton>
      </View>
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
    padding: 18,
    gap: 14,
    backgroundColor: colors.backgroundAlt,
    paddingBottom: 32,
  },
  header: {
    gap: 2,
    marginBottom: 2,
  },
  seccion: {
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtituloHeader: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardVacio: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000',
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  vacioTexto: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardMision: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#000',
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cardActiva: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    transform: [{ translateY: -2 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  misionTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
  },
  radioIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  radioIconActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeInfo: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  misionComp: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning + '18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  misionFallos: {
    color: colors.warning,
    fontWeight: 'bold',
  },
  sectionNota: {
    gap: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.error + '18',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnShadow: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginTop: 8,
  },
  exitoBadge: {
    marginBottom: 8,
  },
  tituloExito: {
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    transform: [{ rotate: '-2deg' }],
  },
  subExito: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});