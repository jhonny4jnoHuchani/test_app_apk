import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
      setError('¡Ey! Necesitamos un nombre para la aventura');
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
      const msg = err?.response?.data?.message ?? '¡Rayos! Algo salió mal';
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
      <ScrollView 
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER ESTILO VINTAGE / CARTOON */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="cards-playing-outline" size={36} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.titulo}>
            ¡NUEVO GRUPO!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitulo}>
            Prepara tu escenario
          </Text>
        </View>

        {/* TARJETA INFORMATIVA ESTILO ANUNCIO / PERGAMINO */}
        <View style={styles.infoCard}>
          <Ionicons name="dice-outline" size={26} color={colors.primary} />
          <Text variant="bodySmall" style={styles.infoText}>
            Se creará un <Text style={styles.boldText}>código de 6 dígitos</Text> de forma automática.
          </Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          <TextInput
            label="Nombre del grupo"
            value={nombre}
            onChangeText={(text) => {
              setNombre(text);
              if (error) setError('');
            }}
            mode="outlined"
            placeholder="Ej. Los Insuperables 3°A"
            contentStyle={{ fontSize: 16 }}
            style={styles.input}
            outlineColor="#000"
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon={() => <Ionicons name="star" size={20} color={colors.primary} />} />}
          />

          <TextInput
            label="Fecha de expiración (opcional)"
            value={fechaExpiracion}
            onChangeText={setFechaExpiracion}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            contentStyle={{ fontSize: 16 }}
            style={styles.input}
            outlineColor="#000"
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon={() => <Ionicons name="hourglass-outline" size={20} color={colors.textSecondary} />} />}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="skull-outline" size={20} color={colors.error} />
              <HelperText type="error" visible={!!error} style={styles.errorText}>
                {error}
              </HelperText>
            </View>
          ) : null}
        </View>

        {/* BOTONES CON ESTILO 3D "PUSH" DE CARTOON */}
        <View style={styles.actions}>
          <View style={styles.btnShadow}>
            <PrimaryButton onPress={handleCrear} loading={loading}>
              CREAR GRUPO
            </PrimaryButton>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.cancelBtn, 
              pressed && styles.cancelBtnPressed,
              loading && styles.disabledBtn
            ]} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>CANCELAR</Text>
          </Pressable>
        </View>
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
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  iconBadge: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 50,
    padding: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  titulo: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: 1,
    textAlign: 'center',
    transform: [{ rotate: '-1.5deg' }], // Inclinación cómica clásica
  },
  subtitulo: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  infoText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  form: {
    gap: 14,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.error + '18',
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontWeight: 'bold',
    paddingHorizontal: 0,
  },
  actions: {
    gap: 14,
    marginTop: 10,
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
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cancelBtnPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 1, height: 1 },
  },
  cancelText: {
    color: colors.textPrimary,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});