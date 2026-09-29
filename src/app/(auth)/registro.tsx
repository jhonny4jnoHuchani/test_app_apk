import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HelperText, TextInput as PaperTextInput } from "react-native-paper";
import { register as registerApi } from "../../api/auth.api";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"estudiante" | "docente">("estudiante");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginStore = useAuthStore((state) => state.login);

  const handleRegister = async () => {
    setError("");
    if (!nombre || !email || !password) {
      setError("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      setLoading(true);
      const response = await registerApi({
        nombre,
        email,
        password,
        rol,
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
      const msg = err?.response?.data?.message ?? "Error al registrarse";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  // Tema personalizado reutilizable para los inputs cuando están activos/enfocados
  const inputTheme = {
    colors: {
      onSurfaceVariant: "rgba(92, 60, 35, 0.65)", // Color de la etiqueta cuando está abajo
      primary: colors.primary || "#1E88E5", // Color cuando sube (puedes cambiar "#1E88E5" por "blue" o "red")
      background: "rgba(255, 248, 225, 0.92)",
      error: "#D32F2F", // Color en caso de error (rojo)
    },
  };

  return (
    <ImageBackground
      source={require("../../../assets/items/random.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* FORMULARIO */}
          <View style={styles.form}>
            {/* NOMBRE COMPLETO */}
            <PaperTextInput
              mode="outlined"
              label="Nombre Completo"
              value={nombre}
              onChangeText={setNombre}
              style={styles.paperInput}
              outlineStyle={styles.paperOutline}
              textColor={colors.ink}
              activeOutlineColor={colors.primary || "#1E88E5"} // Cambia a azul o el color activo deseado
              outlineColor={colors.brown}
              theme={inputTheme}
            />

            {/* CORREO ELECTRÓNICO */}
            <PaperTextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.paperInput}
              outlineStyle={styles.paperOutline}
              textColor={colors.ink}
              activeOutlineColor={colors.primary || "#1E88E5"}
              outlineColor={colors.brown}
              theme={inputTheme}
            />

            {/* CONTRASEÑA */}
            <View style={styles.passwordWrapper}>
              <PaperTextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.paperInput}
                outlineStyle={styles.paperOutline}
                textColor={colors.ink}
                activeOutlineColor={colors.primary || "#1E88E5"}
                outlineColor={colors.brown}
                theme={inputTheme}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButtonInside}
              >
                <Text style={styles.eye}>{showPassword ? "◉" : "◌"}</Text>
              </Pressable>
            </View>

            {/* SELECCIÓN DE PERSONAJE */}
            <View style={styles.roleSection}>
              <Text style={styles.fieldLabel}>ELIGE TU PERSONAJE</Text>
              <View style={styles.roles}>
                <Pressable
                  onPress={() => setRol("estudiante")}
                  style={[
                    styles.roleCard,
                    rol === "estudiante" && styles.roleCardActive,
                  ]}
                >
                  <Image
                    source={require("../../../assets/items/estudiante_stiker.png")}
                    style={styles.roleImage}
                    resizeMode="contain"
                  />
                </Pressable>
                <Pressable
                  onPress={() => setRol("docente")}
                  style={[
                    styles.roleCard,
                    rol === "docente" && styles.roleCardActive,
                  ]}
                >
                  <Image
                    source={require("../../../assets/items/docente_stiker.png")}
                    style={styles.roleImage}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <HelperText type="error" visible={!!error} style={styles.error}>
                {error}
              </HelperText>
            ) : null}

            <PrimaryButton onPress={handleRegister} loading={loading}>
              CREAR CUENTA
            </PrimaryButton>

            <Pressable onPress={() => router.back()} style={styles.loginButton}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    // paddingVertical: ,
  },
  /* FORM */
  form: {
    marginTop: 80,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: 12,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  /* ESTILOS DE LOS INPUTS FLOTANTES */
  paperInput: {
    height: 52,
    backgroundColor: "rgba(255, 248, 225, 0.92)",
    fontSize: 14,
  },
  paperOutline: {
    borderWidth: 2,
    borderRadius: 10,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeButtonInside: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 6,
  },
  eye: {
    fontSize: 20,
    color: colors.brown,
    fontWeight: "900",
  },
  /* PERSONAJES */
  roleSection: {
    marginTop: 4,
    gap: 7,
  },
  roles: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    height: 105,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(92, 60, 35, 0.35)",
    borderRadius: 14,
    backgroundColor: "rgba(255, 246, 217, 0.55)",
  },
  roleCardActive: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 220, 130, 0.35)",
    transform: [{ scale: 1.03 }],
  },
  roleImage: {
    width: 95,
    height: 95,
  },
  /* ERROR */
  error: {
    marginHorizontal: -8,
    marginVertical: -5,
  },
  /* LOGIN */
  loginButton: {
    alignItems: "center",
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
    marginTop: 2,
  },
});
