import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { login as loginApi } from "../../api/auth.api";
import { PrimaryButton } from "../../components/PrimaryButton";
import { RegistroModal } from "../../components/RegistroModal";
import { RetroBackground } from "../../components/RetroBackground";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorAnimacion, setErrorAnimacion] = useState(false);
  const [registroVisible, setRegistroVisible] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;

  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loginStore = useAuthStore((state) => state.login);

  useEffect(() => {
    return () => {
      if (errorTimer.current) {
        clearTimeout(errorTimer.current);
      }
    };
  }, []);

  const mostrarError = (mensaje: string) => {
    setError(mensaje);
    setErrorAnimacion(true);

    errorOpacity.setValue(0);

    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();

    if (errorTimer.current) {
      clearTimeout(errorTimer.current);
    }

    errorTimer.current = setTimeout(() => {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setErrorAnimacion(false);
        }
      });
    }, 1500);
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      mostrarError("Ingresa email y contraseña");
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({
        email,
        password,
      });

      loginStore({
        usuario: response.usuario,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      if (response.usuario.rol === "docente") {
        router.replace("/(docente)");
      } else {
        router.replace("/(estudiante)/lobby");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Error al iniciar sesión";

      mostrarError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RetroBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(insets.top + 16, 24),
              paddingBottom: Math.max(insets.bottom + 20, 24),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.topSpacer} />

          <View style={styles.form}>
            {/* Animación de error flotante */}
            {errorAnimacion && (
              <Animated.View
                style={[
                  styles.errorAnimation,
                  {
                    opacity: errorOpacity,
                  },
                ]}
              >
                <Image
                  source={require("../../../assets/items/Error_Login.png")}
                  style={styles.errorImage}
                />
              </Animated.View>
            )}

            {/* EMAIL */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textColor={colors.ink}
              outlineColor="rgba(0, 0, 0, 0.55)"
              activeOutlineColor={colors.primary}
              theme={{
                colors: {
                  background: "rgba(255, 246, 217, 0.78)",
                },
              }}
              left={<TextInput.Icon icon="email" />}
              contentStyle={styles.inputContent}
              style={styles.input}
            />

            {/* CONTRASEÑA */}
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textColor={colors.ink}
              outlineColor="rgba(0, 0, 0, 0.55)"
              activeOutlineColor={colors.primary}
              theme={{
                colors: {
                  background: "rgba(255, 246, 217, 0.78)",
                },
              }}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              contentStyle={styles.inputContent}
              style={styles.input}
            />

            {/* BOTÓN INICIAR SESIÓN */}
            <PrimaryButton onPress={handleLogin} loading={loading}>
              Iniciar sesión
            </PrimaryButton>

            {/* REGISTRO EN VENTANA EMERGENTE */}
            <View style={styles.accountRow}>
              <Text style={styles.loginText}>¿No tienes una cuenta?</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRegistroVisible(true)}
                hitSlop={8}
              >
                <Text style={styles.loginLink}>Regístrate</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RegistroModal
        visible={registroVisible}
        onClose={() => setRegistroVisible(false)}
      />
    </RetroBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
  },

  topSpacer: {
    flexGrow: 1,
    minHeight: 64,
  },

  form: {
    alignSelf: "center",
    gap: 14,
    maxWidth: 430,
    padding: 10,
    paddingBottom: 24,
    backgroundColor: "transparent",
    position: "relative",
    width: "100%",
  },

  input: {
    backgroundColor: "rgba(255, 246, 217, 0.78)",
    borderRadius: 7,
    minHeight: 56,
  },

  inputContent: {
    fontSize: 16,
  },

  /* ERROR FLOTANTE */
  errorAnimation: {
    position: "absolute",
    top: -96,
    alignSelf: "center",
    zIndex: 10,
  },

  errorImage: {
    width: 180,
    height: 128,
    resizeMode: "contain",
  },

  /* FILA INFERIOR */
  accountRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  loginText: {
    color: colors.brown,
    fontSize: 12,
    fontWeight: "600",
  },

  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});
