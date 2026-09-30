import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";

import { login as loginApi } from "../../api/auth.api";
import { PrimaryButton } from "../../components/PrimaryButton";
import { RetroBackground } from "../../components/RetroBackground";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

const INPUT_BG = "rgba(255, 255, 255, 0.9)";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorAnimacion, setErrorAnimacion] = useState(false);

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
    <RetroBackground variant="login">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Espacio superior flexible */}
          <View style={styles.topSpacer} />

          <MotiView
            from={{ opacity: 0, translateY: 32 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 16, delay: 250 }}
            style={styles.form}
          >
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
              outlineColor={colors.borderDark}
              outlineStyle={{ borderRadius: 16 }}
              activeOutlineColor={colors.primary}
              theme={{ colors: { background: INPUT_BG } }}
              left={<TextInput.Icon icon="email" />}
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
              outlineColor={colors.borderDark}
              outlineStyle={{ borderRadius: 16 }}
              activeOutlineColor={colors.primary}
              theme={{ colors: { background: INPUT_BG } }}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            {/* BOTÓN INICIAR SESIÓN */}
            <PrimaryButton onPress={handleLogin} loading={loading}>
              Iniciar sesión
            </PrimaryButton>

            {/* ENLACE INFERIOR EN FLEX */}
            <View style={styles.accountRow}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>

              <Text
                style={styles.loginLink}
                onPress={() => router.push("/(auth)/registro")}
              >
                Inicia sesión
              </Text>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },

  topSpacer: {
    flex: 1,
    minHeight: 280,
  },

  form: {
    paddingBottom: 80,
    gap: 14,
    padding: 10,
    backgroundColor: "transparent",
    position: "relative",
  },

  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 16,
  },

  /* ERROR FLOTANTE */
  errorAnimation: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    zIndex: 10,
  },

  errorImage: {
    width: 210,
    height: 150,
    resizeMode: "contain",
  },

  /* FILA INFERIOR */
  accountRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  loginText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fonts.bodySemi,
  },

  loginLink: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fonts.titleBold,
  },
});