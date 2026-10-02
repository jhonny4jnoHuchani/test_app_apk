import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { register as registerApi } from '../api/auth.api';
import { PrimaryButton } from './PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function RegistroModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  const [rol, setRol] = useState<'estudiante' | 'docente'>('estudiante');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginStore = useAuthStore((state) => state.login);

  const handleRegister = async () => {
    setError('');
    if (!nombre.trim() || !email.trim() || !password) {
      setError('Completa nombre, correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (
      rol === 'estudiante' &&
      (!universidad.trim() || !carrera.trim() || !semestre.trim())
    ) {
      setError('Completa universidad, carrera y semestre.');
      return;
    }

    try {
      setLoading(true);
      const datosEstudio =
        rol === 'estudiante'
          ? {
              universidad: universidad.trim(),
              carrera: carrera.trim(),
              semestre: semestre.trim(),
            }
          : {};
      const response = await registerApi({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol,
        ...datosEstudio,
      });

      loginStore({
        usuario: {
          ...response.usuario,
          ...(rol === 'estudiante' && {
            universidad:
              response.usuario.universidad ?? (universidad.trim() || undefined),
            carrera: response.usuario.carrera ?? (carrera.trim() || undefined),
            semestre: response.usuario.semestre ?? (semestre.trim() || undefined),
          }),
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      if (rol === 'docente') router.replace('/(docente)');
      else router.replace('/(estudiante)/lobby');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Error al registrarse';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  const inputTheme = {
    colors: {
      primary: colors.primary,
      onSurfaceVariant: colors.brown,
      background: 'rgba(255, 248, 225, 0.94)',
      error: colors.error,
    },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar registro"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardArea}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              {
                paddingTop: Math.max(insets.top + 12, 20),
                paddingBottom: Math.max(insets.bottom + 12, 20),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                {
                  width: Math.min(width - 28, 480),
                },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.headingCopy}>
                  <Text style={styles.kicker}>TESIS QUEST</Text>
                  <Text style={styles.title}>Crear una cuenta</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar ventana de registro"
                  onPress={onClose}
                  hitSlop={12}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={22} color={colors.ink} />
                </Pressable>
              </View>
              <Text style={styles.subtitle}>
                Elige tu personaje y completa tus datos para comenzar.
              </Text>

              <View style={styles.form}>
                <TextInput
                  mode="outlined"
                  label="Nombre completo"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  autoComplete="name"
                  outlineColor={colors.borderDark}
                  activeOutlineColor={colors.primary}
                  textColor={colors.ink}
                  style={styles.input}
                  theme={inputTheme}
                />
                <TextInput
                  mode="outlined"
                  label="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  outlineColor={colors.borderDark}
                  activeOutlineColor={colors.primary}
                  textColor={colors.ink}
                  style={styles.input}
                  theme={inputTheme}
                />
                <TextInput
                  mode="outlined"
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  outlineColor={colors.borderDark}
                  activeOutlineColor={colors.primary}
                  textColor={colors.ink}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword((shown) => !shown)}
                    />
                  }
                  style={styles.input}
                  theme={inputTheme}
                />

                <View style={styles.roleSection}>
                  <Text style={styles.fieldLabel}>ELIGE TU PERSONAJE</Text>
                  <View style={styles.roles}>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: rol === 'estudiante' }}
                      onPress={() => setRol('estudiante')}
                      style={[
                        styles.roleCard,
                        rol === 'estudiante' && styles.roleCardActive,
                      ]}
                    >
                      <Image
                        source={require('../../assets/items/estudiante_stiker.png')}
                        style={styles.roleImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.roleLabel}>Estudiante</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: rol === 'docente' }}
                      onPress={() => setRol('docente')}
                      style={[
                        styles.roleCard,
                        rol === 'docente' && styles.roleCardActive,
                      ]}
                    >
                      <Image
                        source={require('../../assets/items/docente_stiker.png')}
                        style={styles.roleImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.roleLabel}>Docente</Text>
                    </Pressable>
                  </View>
                </View>

                {rol === 'estudiante' && (
                  <View style={styles.studyFields}>
                    <TextInput
                      mode="outlined"
                      label="Universidad"
                      value={universidad}
                      onChangeText={setUniversidad}
                      autoCapitalize="words"
                      outlineColor={colors.borderDark}
                      activeOutlineColor={colors.primary}
                      textColor={colors.ink}
                      style={styles.input}
                      theme={inputTheme}
                    />
                    <TextInput
                      mode="outlined"
                      label="Carrera"
                      value={carrera}
                      onChangeText={setCarrera}
                      autoCapitalize="words"
                      outlineColor={colors.borderDark}
                      activeOutlineColor={colors.primary}
                      textColor={colors.ink}
                      style={styles.input}
                      theme={inputTheme}
                    />
                    <TextInput
                      mode="outlined"
                      label="Semestre"
                      value={semestre}
                      onChangeText={setSemestre}
                      keyboardType="number-pad"
                      outlineColor={colors.borderDark}
                      activeOutlineColor={colors.primary}
                      textColor={colors.ink}
                      style={styles.input}
                      theme={inputTheme}
                    />
                  </View>
                )}

                {error ? (
                  <HelperText type="error" visible style={styles.error}>
                    {error}
                  </HelperText>
                ) : null}

                <PrimaryButton onPress={handleRegister} loading={loading}>
                  CREAR CUENTA
                </PrimaryButton>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  style={styles.loginLink}
                >
                  <Text style={styles.loginText}>
                    ¿Ya tienes cuenta? <Text style={styles.loginAccent}>Inicia sesión</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 15, 11, 0.72)',
  },
  keyboardArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  card: {
    padding: 18,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 20,
    backgroundColor: colors.background,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingCopy: {
    flex: 1,
  },
  kicker: {
    color: colors.primary,
    fontFamily: 'LilitaOne',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 1,
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 25,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  subtitle: {
    marginTop: 3,
    marginBottom: 12,
    color: colors.brown,
    fontFamily: 'Nunito',
    fontSize: 13,
  },
  form: {
    gap: 9,
  },
  input: {
    minHeight: 52,
    backgroundColor: 'rgba(255, 248, 225, 0.94)',
  },
  roleSection: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 11,
    letterSpacing: 1,
  },
  roles: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    minHeight: 88,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingHorizontal: 7,
    borderWidth: 2,
    borderColor: colors.borderDark,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  roleCardActive: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: '#F5DCA4',
  },
  roleImage: {
    width: 48,
    height: 52,
  },
  roleLabel: {
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 13,
  },
  studyFields: {
    gap: 9,
  },
  error: {
    marginVertical: -7,
    paddingHorizontal: 0,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 3,
  },
  loginText: {
    color: colors.brown,
    fontFamily: 'Nunito',
    fontSize: 12,
  },
  loginAccent: {
    color: colors.primary,
    fontFamily: 'LilitaOne',
  },
});