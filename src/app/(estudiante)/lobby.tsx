import { router, useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useState } from "react";

import {
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ActivityIndicator, Text } from "react-native-paper";

import { useFonts } from "expo-font";

import { LilitaOne_400Regular } from "@expo-google-fonts/lilita-one";

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

import { Rye_400Regular } from "@expo-google-fonts/rye";

import {
  ModalidadDelEstudiante,
  obtenerMisModalidades,
} from "../../api/juego.api";

import { GameCard } from "../../components/GameCard";
import { HeaderLogout } from "../../components/HeaderLogout";
import { RoundedNavigationHeader } from "../../components/RoundedNavigationHeader";

import { useAuthStore } from "../../store/authStore";
import { useJuegoStore } from "../../store/juegoStore";

import { colors, getAcento } from "../../theme/colors";

const EMOJIS: Record<string, string> = {
  monografia: "📝",
  tesina: "🎓",
  tesis: "🏛️",
  articulo: "📄",
};

export default function LobbyScreen() {
  const usuario = useAuthStore((state) => state.usuario);

  const setModalidad = useJuegoStore((state) => state.setModalidad);

  const [modalidades, setModalidades] = useState<
    ModalidadDelEstudiante[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Rye_400Regular,
  });

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerMisModalidades();

      setModalidades(data.modalidades);
    } catch (err) {
      console.error("Error cargando modalidades:", err);

      setError("No se pudieron cargar tus modalidades");
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleEntrar = (modalidad: ModalidadDelEstudiante) => {
    setModalidad({
      id: modalidad.modalidadId,
      nombre: modalidad.nombre,
      descripcion: modalidad.descripcion,
      ordenMundo: modalidad.ordenMundo,
    });

    router.push(
      `/(estudiante)/mapa?modalidadId=${modalidad.modalidadId}`
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/items/image.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Capa suave encima del fondo */}
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ================= HEADER ================= */}

          <RoundedNavigationHeader>
            <View style={styles.headerIzquierda}>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerTitle,
                  {
                    textTransform: "uppercase",
                  },
                ]}
              >
                {usuario?.rol}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.headerSubtitle,
                  {
                    textTransform: "uppercase",
                  },
                ]}
              >
                {usuario?.nombre}
              </Text>
            </View>

            <HeaderLogout
              titulo=""
              mostrarPerfil
              mostrarNotificaciones
            />
          </RoundedNavigationHeader>

          {/* ================= CONTENIDO ================= */}

          <ScrollView
            contentContainerStyle={styles.scroll}
            refreshControl={
              <RefreshControl
                refreshing={cargando}
                onRefresh={cargar}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {/* ================= ACCESOS ================= */}

            <View style={styles.accesosRapidos}>
              <GameCard
                style={styles.accesoBoton}
                contentStyle={styles.accesoContenido}
                entradaDelay={0}
                onPress={() =>
                  router.push(
                    "/(estudiante)/recomendaciones"
                  )
                }
              >
                <Text style={styles.accesoIcono}>
                  📌
                </Text>

                <Text style={styles.accesoTexto}>
                  Recomendaciones
                </Text>
              </GameCard>

              <GameCard
                style={styles.accesoBoton}
                contentStyle={styles.accesoContenido}
                entradaDelay={80}
                onPress={() =>
                  router.push(
                    "/(estudiante)/unirse-grupo"
                  )
                }
              >
                <Text style={styles.accesoIcono}>
                  👥
                </Text>

                <Text style={styles.accesoTexto}>
                  Unirme a grupo
                </Text>
              </GameCard>
            </View>

            {/* ================= ERROR ================= */}

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            {/* ================= TITULO ================= */}

            <View style={styles.tituloSeccionBox}>
              <Text style={styles.seccion}>
                Mis mundos de investigación
              </Text>

              <View style={styles.lineaDecorativa} />
            </View>

            {/* ================= MUNDOS ================= */}

            {modalidades.map((m, i) => {
              const proximamente = m.totalNiveles === 0;

              const emoji =
                EMOJIS[m.nombre] ?? "📘";

              const completada =
                m.estado === "completada";

              const enProgreso =
                m.estado === "en_progreso";

              const acento = proximamente
                ? colors.misionBloqueada
                : completada
                ? colors.success
                : getAcento(m.nombre);

              return (
                <GameCard
                  key={m.modalidadId}
                  accent={acento}
                  disabled={proximamente}
                  entradaDelay={160 + i * 90}
                  onPress={() => handleEntrar(m)}
                >
                  {/* ================= CABECERA ================= */}

                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.emojiCirculo,
                        {
                          backgroundColor: `${acento}26`,
                          borderColor: acento,
                        },
                      ]}
                    >
                      <Text style={styles.cardEmoji}>
                        {emoji}
                      </Text>
                    </View>

                    <View style={styles.cardTituloBox}>
                      <Text style={styles.mundoNumero}>
                        MUNDO {i + 1}
                      </Text>

                      <Text style={styles.cardTitulo}>
                        {m.descripcion}
                      </Text>

                      <Text style={styles.cardEstado}>
                        {proximamente
                          ? "🔒 Próximamente"
                          : completada
                          ? "🏆 Completado"
                          : enProgreso
                          ? `📊 ${m.porcentaje}% completado`
                          : "✨ Listo para comenzar"}
                      </Text>
                    </View>
                  </View>

                  {/* ================= PROGRESO ================= */}

                  {!proximamente && (
                    <>
                      <View style={styles.progressBar}>
                        <MotiView
                          from={{
                            width: "0%",
                          }}
                          animate={{
                            width: `${m.porcentaje}%`,
                          }}
                          transition={{
                            type: "timing",
                            duration: 700,
                            delay: 300 + i * 90,
                          }}
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: acento,
                            },
                          ]}
                        />
                      </View>

                      {/* ================= ESTADISTICAS ================= */}

                      <View style={styles.statsRow}>
                        <Text style={styles.stat}>
                          ⚡ {m.xpTotal} XP
                        </Text>

                        <Text style={styles.stat}>
                          📚 {m.nivelesCompletados}/
                          {m.totalNiveles} niveles
                        </Text>
                      </View>

                      {/* ================= TEMA ================= */}

                      {m.temaInvestigacion ? (
                        <Text
                          style={styles.tema}
                          numberOfLines={2}
                        >
                          🔬 {m.temaInvestigacion}
                        </Text>
                      ) : (
                        <Text style={styles.temaVacio}>
                          Sin tema definido
                        </Text>
                      )}

                      {/* ================= BOTON ================= */}

                      <View
                        style={[
                          styles.continuarBox,
                          {
                            borderColor: acento,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.entrarTexto,
                            {
                              color: acento,
                            },
                          ]}
                        >
                          {enProgreso
                            ? "Continuar →"
                            : completada
                            ? "Volver a jugar →"
                            : "Comenzar →"}
                        </Text>
                      </View>
                    </>
                  )}
                </GameCard>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  /* ================= FONDO ================= */

  background: {
    flex: 1,
  },

  /*
   * Esta capa permite oscurecer/suavizar
   * ligeramente la imagen de fondo.
   */

  overlay: {
    flex: 1,
    backgroundColor: "rgba(244, 232, 200, 0.15)",
  },

  /* ================= GENERAL ================= */

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  /* ================= HEADER ================= */

  headerIzquierda: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    color: colors.textInverse,
    fontFamily: "LilitaOne_400Regular",
    fontSize: 22,
    letterSpacing: 0.2,

    textShadowColor: "rgba(0,0,0,0.25)",

    textShadowOffset: {
      width: 2,
      height: 2,
    },

    textShadowRadius: 0,
  },

  headerSubtitle: {
    color: colors.textInverse,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    opacity: 0.9,
    marginTop: 3,
  },

  /* ================= SCROLL ================= */

  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  /* ================= ACCESOS ================= */

  accesosRapidos: {
    flexDirection: "row",
    gap: 12,
  },

  accesoBoton: {
    flex: 1,
  },

  accesoContenido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 8,
  },

  accesoIcono: {
    fontSize: 18,
  },

  accesoTexto: {
    fontFamily: "LilitaOne_400Regular",
    fontSize: 13,
    color: colors.textPrimary,
  },

  /* ================= TITULO ================= */

  tituloSeccionBox: {
    marginTop: 2,
    marginBottom: -2,
  },

  seccion: {
    color: colors.textPrimary,
    fontFamily: "LilitaOne_400Regular",
    fontSize: 22,
    letterSpacing: 0.2,

    textShadowColor: "rgba(0,0,0,0.12)",

    textShadowOffset: {
      width: 1,
      height: 2,
    },

    textShadowRadius: 0,
  },

  lineaDecorativa: {
    width: 145,
    height: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
    borderRadius: 2,

    transform: [
      {
        rotate: "-1deg",
      },
    ],
  },

  /* ================= ERROR ================= */

  error: {
    color: colors.error,
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
  },

  /* ================= CARD ================= */

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  emojiCirculo: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,

    transform: [
      {
        rotate: "-3deg",
      },
    ],
  },

  cardEmoji: {
    fontSize: 29,
  },

  cardTituloBox: {
    flex: 1,
  },

  mundoNumero: {
    color: colors.primary,
    fontFamily: "Rye_400Regular",
    fontSize: 10,
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  cardTitulo: {
    color: colors.textPrimary,
    fontFamily: "LilitaOne_400Regular",
    fontSize: 18,
    letterSpacing: 0.1,

    textShadowColor: "rgba(0,0,0,0.10)",

    textShadowOffset: {
      width: 1,
      height: 1,
    },

    textShadowRadius: 0,
  },

  cardEstado: {
    color: colors.textSecondary,
    marginTop: 3,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
  },

  /* ================= PROGRESO ================= */

  progressBar: {
    height: 10,
    backgroundColor: colors.progressBackground,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.35)",
    marginTop: 4,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  /* ================= ESTADISTICAS ================= */

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },

  stat: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
  },

  /* ================= TEMA ================= */

  tema: {
    color: colors.textPrimary,
    fontStyle: "italic",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    marginTop: 1,
  },

  temaVacio: {
    color: colors.textLight,
    fontStyle: "italic",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    marginTop: 1,
  },

  /* ================= CONTINUAR ================= */

  continuarBox: {
    alignSelf: "flex-end",
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomWidth: 2,
  },

  entrarTexto: {
    fontFamily: "LilitaOne_400Regular",
    fontSize: 14,
    textAlign: "right",
    letterSpacing: 0.2,
  },
});