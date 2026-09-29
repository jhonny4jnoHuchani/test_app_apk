import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { unirseAGrupo } from '../../api/grupos.api';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';

export default function UnirseGrupoScreen() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleUnirse = async () => {
    if (codigo.trim().length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await unirseAGrupo(codigo.trim().toUpperCase());
      setExito(response.mensaje);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Código inválido';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.titulo}>
        Unirse a un grupo
      </Text>
      <Text variant="bodyMedium" style={styles.subtitulo}>
        Ingresa el código de 6 caracteres que te dio tu docente
      </Text>

      <TextInput
        label="Código de acceso"
        value={codigo}
        onChangeText={(t) => setCodigo(t.toUpperCase())}
        mode="outlined"
        maxLength={6}
        autoCapitalize="characters"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {exito ? <Text style={styles.exito}>{exito}</Text> : null}

      <PrimaryButton onPress={handleUnirse} loading={loading}>
        Unirme
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: 'center',
  },
  titulo: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitulo: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  exito: {
    color: colors.success,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});