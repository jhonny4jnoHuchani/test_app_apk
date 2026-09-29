import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { crearGrupo } from '../../api/grupos.api';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';

export default function CrearGrupoScreen() {
  const [nombre, setNombre] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCrear = async () => {
    setError('');

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await crearGrupo({
        nombre: nombre.trim(),
        fechaExpiracion: fechaExpiracion.trim() || undefined,
      });
      router.replace('/(docente)');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al crear el grupo';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.titulo}>
          Crear nuevo grupo
        </Text>
        <Text variant="bodyMedium" style={styles.subtitulo}>
          Se generará un código de 6 caracteres automáticamente.
        </Text>

        <TextInput
          label="Nombre del grupo"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Fecha de expiración (opcional)"
          value={fechaExpiracion}
          onChangeText={setFechaExpiracion}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <PrimaryButton onPress={handleCrear} loading={loading}>
          Crear grupo
        </PrimaryButton>

        <PrimaryButton onPress={() => router.back()}>Cancelar</PrimaryButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  titulo: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
  },
});