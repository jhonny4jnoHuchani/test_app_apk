import { router } from 'expo-router';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unirseAGrupo } from '../../api/grupos.api';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';

export default function UnirseGrupoScreen() {
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Platform.OS === 'web' ? 83 : Math.max(insets.top, 20),
          paddingBottom:
            Platform.OS === 'web' ? 34 : Math.max(insets.bottom + 24, 32),
        },
      ]}
    >
      <View style={styles.heroIcon}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={32}
          color={colors.secondaryDark}
        />
      </View>
      <Text variant="headlineSmall" style={styles.titulo}>
        Conecta con tu grupo
      </Text>
      <Text variant="bodyMedium" style={styles.subtitulo}>
        Ingresa el código de 6 caracteres que te compartió tu docente.
      </Text>

      <View style={styles.panel}>
        <View style={styles.panelHeading}>
          <MaterialCommunityIcons
            name="key-outline"
            size={19}
            color={colors.secondaryDark}
          />
          <Text variant="titleSmall" style={styles.panelTitle}>
            Código de acceso
          </Text>
        </View>
        <TextInput
          accessibilityLabel="Código de acceso del grupo"
          value={codigo}
          onChangeText={(value) => {
            setCodigo(value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            if (error) setError('');
          }}
          mode="outlined"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleUnirse}
          placeholder="ABC123"
          outlineColor={colors.border}
          activeOutlineColor={colors.secondary}
          style={styles.input}
          contentStyle={styles.codeInput}
          error={Boolean(error)}
        />
        <HelperText type="info" visible={!error && !exito} style={styles.helper}>
          Usa letras y números, sin espacios.
        </HelperText>

        {error ? (
          <View style={[styles.feedback, styles.errorBox]}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color={colors.error}
            />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}
        {exito ? (
          <View style={[styles.feedback, styles.successBox]}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color={colors.success}
            />
            <Text style={styles.exito}>{exito}</Text>
          </View>
        ) : null}

        <PrimaryButton
          onPress={handleUnirse}
          loading={loading}
          disabled={codigo.length !== 6}
          icon="account-plus-outline"
        >
          Unirme al grupo
        </PrimaryButton>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backLink}
      >
        <Text style={styles.backText}>Volver a mis mundos</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 13,
    backgroundColor: colors.background,
  },
  heroIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: colors.paperLight,
    borderWidth: 2,
    borderColor: colors.ink,
    marginBottom: 2,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
  titulo: {
    fontFamily: 'LilitaOne',
    fontWeight: '400',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitulo: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 310,
    lineHeight: 22,
    marginBottom: 5,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    padding: 18,
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 0,
    elevation: 4,
  },
  panelHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 1,
  },
  panelTitle: {
    color: colors.textPrimary,
  },
  helper: {
    color: colors.textLight,
    marginTop: -8,
    marginBottom: -6,
  },
  input: {
    backgroundColor: colors.white,
  },
  codeInput: {
    fontFamily: 'Nunito',
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 5,
    paddingVertical: 6,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  errorBox: {
    backgroundColor: '#FCE9E5',
  },
  error: {
    color: colors.error,
    flex: 1,
    fontSize: 13,
  },
  successBox: {
    backgroundColor: colors.cardSoft,
  },
  exito: {
    color: colors.success,
    flex: 1,
    fontSize: 13,
  },
  backLink: {
    padding: 10,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});