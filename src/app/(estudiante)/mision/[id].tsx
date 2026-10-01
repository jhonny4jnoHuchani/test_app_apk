import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Card, Text, TextInput } from "react-native-paper";
import {
  EstadoMision,
  obtenerEstadoMision,
  responderMision,
  RespuestaMision,
} from "../../../api/misiones.api";
import { obtenerMapa } from "../../../api/juego.api";
import { buscarSiguienteMision } from "../../../api/progreso-mision";
import { LoadingIA } from "../../../components/LoadingIA";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { ResultadoFeedback } from "../../../components/ResultadoFeedback";
import { VidasIndicator } from "../../../components/VidasIndicator";
import { MarcarErroresMision } from "../../../features/misiones/tipos/MarcarErroresMision";
import { useJuegoStore } from "../../../store/juegoStore";
import { colors } from "../../../theme/colors";

type Etapa = "cargando" | "teoria" | "mision" | "evaluando" | "resultado";

const esperar = (milisegundos: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milisegundos));

export default function MisionScreen() {
  const {
    id,
    origen: origenParam,
    modalidadId: modalidadIdParam,
  } = useLocalSearchParams<{
    id: string;
    origen?: string;
    modalidadId?: string;
  }>();
  const misionId = Array.isArray(id) ? id[0] : id;
  const modalidadIdDeRuta = Array.isArray(modalidadIdParam)
    ? modalidadIdParam[0]
    : modalidadIdParam;
  const [etapa, setEtapa] = useState<Etapa>("cargando");
  const [mision, setMision] = useState<EstadoMision | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [resultado, setResultado] = useState<RespuestaMision | null>(null);
  const [error, setError] = useState("");
  const [transicionando, setTransicionando] = useState(false);
  const [mensajeTransicion, setMensajeTransicion] = useState("");
  const transicionOpacity = useRef(new Animated.Value(0)).current;
  const timerTransicion = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avanceEnCurso = useRef(false);
  const { modalidadActual, temaInvestigacion, setMapa } = useJuegoStore();
  const modalidadId = modalidadActual?.id ?? Number(modalidadIdDeRuta);

  useEffect(() => {
    if (misionId) {
      cargarMision(misionId);
    }
    return () => {
      if (timerTransicion.current) clearTimeout(timerTransicion.current);
    };
  }, [misionId]);

  const cargarMision = async (idMision: string) => {
    try {
      avanceEnCurso.current = false;
      setTransicionando(false);
      setMensajeTransicion("");
      transicionOpacity.setValue(0);
      setResultado(null);
      setRespuesta("");
      setError("");
      setEtapa("cargando");
      const data = await obtenerEstadoMision(idMision);
      setMision(data);
      setEtapa(data.teoria ? "teoria" : "mision");
    } catch (err) {
      setError("No se pudo cargar la misión");
      setEtapa("mision");
    }
  };

  const enviarRespuesta = async (respuestaTexto?: string) => {
    const textoFinal = respuestaTexto ?? respuesta;

    if (textoFinal.trim().length < 3) {
      setError("Escribe una respuesta más completa");
      return;
    }

    try {
      setError("");
      setEtapa("evaluando");
      const origenFinal =
        origenParam === "recomendacion_docente"
          ? "recomendacion_docente"
          : "nivel";

      const data = await responderMision(
        misionId!,
        textoFinal.trim(),
        origenFinal,
      );
      setResultado(data);
      setEtapa("resultado");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Error al evaluar tu respuesta";
      setError(Array.isArray(msg) ? msg[0] : msg);
      setEtapa("mision");
    }
  };

  const continuar = async () => {
    if (resultado?.intento.resultado === "correcto") {
      if (avanceEnCurso.current) return;
      avanceEnCurso.current = true;
      let destino = "/(estudiante)/lobby";
      let texto = "¡Misión superada!";
      setTransicionando(true);
      setMensajeTransicion("Preparando la siguiente misión…");
      Animated.timing(transicionOpacity, {
        toValue: 1,
        duration: 230,
        useNativeDriver: true,
      }).start();

      if (origenParam === "recomendacion_docente") {
        destino = "/(estudiante)/recomendaciones";
        texto = "¡Buen trabajo!";
      } else if (Number.isFinite(modalidadId) && modalidadId > 0) {
        let siguienteId: string | undefined;
        let huboErrorDeMapa = false;

        // El mapa puede tardar un instante en reflejar el desbloqueo tras responder.
        for (let intento = 0; intento < 4 && !siguienteId; intento += 1) {
          try {
            const mapa = await obtenerMapa(modalidadId);
            setMapa({
              niveles: mapa.niveles,
              xpTotal: mapa.progreso.xpTotal,
              puntosInvestigacionTotal: mapa.progreso.puntosInvestigacionTotal,
              porcentaje: mapa.progreso.porcentaje,
              temaInvestigacion,
            });
            siguienteId = buscarSiguienteMision(
              mapa.niveles,
              misionId ?? "",
            )?.id;
          } catch {
            huboErrorDeMapa = true;
          }

          if (!siguienteId && intento < 3) {
            await esperar(300 * (intento + 1));
          }
        }

        if (siguienteId) {
          destino = `/(estudiante)/mision/${encodeURIComponent(siguienteId)}?modalidadId=${modalidadId}`;
          texto = "¡A por la siguiente misión!";
        } else {
          destino = `/(estudiante)/mapa?modalidadId=${modalidadId}`;
          texto = huboErrorDeMapa ? "Volviendo al mapa…" : "¡Mapa actualizado!";
        }
      }

      setMensajeTransicion(texto);
      timerTransicion.current = setTimeout(() => {
        router.replace(destino as any);
      }, 430);
    } else {
      setRespuesta("");
      setResultado(null);
      setError("");
      if (misionId) cargarMision(misionId);
    }
  };

  if (etapa === "cargando") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.textoCargando}>Cargando misión...</Text>
      </View>
    );
  }

  // ETAPA TEORÍA PREVIA (ESTILO ESPECÍFICO)
  if (etapa === "teoria" && mision?.teoria) {
    return (
      <ScrollView contentContainerStyle={styles.scrollTeoria}>
        {/* ICONO SUPERIOR ENMARCADO CON ÍCONO ANIMADO */}
        <View style={styles.iconoBoxContainer}>
          <Text style={styles.iconoCuphead}>☕️</Text>
        </View>

        {/* TÍTULO Y SUBTÍTULO CENTRADOS */}
        <Text style={styles.tituloTeoria}>Teoría Previa</Text>
        <Text style={styles.subtituloTeoria}>
          Lee atentamente los conceptos antes de iniciar el reto.
        </Text>

        {/* TARJETA CONTENEDORA PRINCIPAL */}
        <View style={styles.cardCupheadTeoria}>
          <View style={styles.headerInternoTeoria}>
            <Text style={styles.headerInternoTexto}>💡 CONCEPTO CLAVE</Text>
          </View>

          <View style={styles.cajaTextoInterna}>
            <Text style={styles.teoriaTexto}>{mision.teoria}</Text>
          </View>

          <PrimaryButton onPress={() => setEtapa("mision")}>
            ¡Entendido, a jugar!
          </PrimaryButton>
        </View>
      </ScrollView>
    );
  }

  if (etapa === "evaluando") {
    return <LoadingIA />;
  }

  if (etapa === "resultado" && resultado) {
    return (
      <View style={styles.resultadoRoot}>
        <ResultadoFeedback resultado={resultado} onContinuar={continuar} />
        {transicionando && (
          <Animated.View
            style={[styles.transitionOverlay, { opacity: transicionOpacity }]}
          >
            <View style={styles.transitionCard}>
              <Text style={styles.transitionIcon}>☕</Text>
              <Text style={styles.transitionTitle}>{mensajeTransicion}</Text>
              <Text style={styles.transitionSubtitle}>Cargando tu aventura…</Text>
            </View>
          </Animated.View>
        )}
      </View>
    );
  }

  // ETAPA MISIÓN (NORMAL Y SIN CAMBIOS)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ENCABEZADO Y VIDAS */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text variant="titleMedium" style={styles.titulo}>
              {mision?.titulo}
            </Text>
          </View>
          <VidasIndicator
            vidas={mision?.vidasRestantes ?? 0}
            vidasIniciales={mision?.vidasIniciales ?? 3}
          />
        </View>

        {/* TARJETA DE OBJETIVO / RETO */}
        <Card style={styles.cardMision} mode="contained">
          <Card.Content>
            <Text variant="bodyLarge" style={styles.competenciaTexto}>
              {mision?.competencia}
            </Text>
          </Card.Content>
        </Card>

        {mision?.tipoInteraccion === "marcar_errores" ? (
          <MarcarErroresMision
            misionId={misionId!}
            onSubmit={(resp) => enviarRespuesta(resp)}
            disabled={mision?.completada}
          />
        ) : (
          <View style={styles.areaRespuesta}>
            <TextInput
              label="Escribe tu respuesta aquí..."
              value={respuesta}
              onChangeText={setRespuesta}
              mode="outlined"
              multiline
              numberOfLines={6}
              contentStyle={{ fontSize: 16 }}
              style={styles.input}
              outlineColor={colors.borderDark}
              activeOutlineColor={colors.secondary}
              textColor={colors.textPrimary}
              placeholderTextColor={colors.textLight}
              outlineStyle={styles.inputOutline}
              editable={!mision?.completada}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>⚠️ {error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              onPress={() => enviarRespuesta()}
              disabled={mision?.completada || respuesta.trim().length < 3}
            >
              Enviar respuesta
            </PrimaryButton>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  resultadoRoot: {
    flex: 1,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(24, 18, 14, 0.76)",
  },
  transitionCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 22,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 10,
  },
  transitionIcon: {
    color: colors.primary,
    fontSize: 40,
  },
  transitionTitle: {
    marginTop: 7,
    color: colors.ink,
    fontFamily: "LilitaOne",
    fontSize: 23,
    textAlign: "center",
  },
  transitionSubtitle: {
    marginTop: 6,
    color: colors.brown,
    fontFamily: "Nunito",
    fontSize: 14,
    textAlign: "center",
  },
  textoCargando: {
    fontFamily: "LilitaOne",
    color: colors.primary,
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 18,
    gap: 18,
    paddingBottom: 36,
  },

  /* ======================================================
     1. ESTILOS DE TEORÍA PREVIA (ESTILO DE TU ÚLTIMA FOTO)
     ====================================================== */
  scrollTeoria: {
    padding: 20,
    alignItems: "center",
    backgroundColor: colors.background,
    paddingBottom: 40,
  },
  iconoBoxContainer: {
    width: 72,
    height: 72,
    backgroundColor: colors.card,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconoCuphead: {
    fontSize: 36,
  },
  tituloTeoria: {
    fontFamily: "LilitaOne",
    fontSize: 26,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtituloTeoria: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  cardCupheadTeoria: {
    width: "100%",
    backgroundColor: colors.card,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  headerInternoTeoria: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInternoTexto: {
    fontFamily: "LilitaOne",
    fontSize: 14,
    color: colors.brown,
    letterSpacing: 0.5,
  },
  cajaTextoInterna: {
    backgroundColor: colors.paperLight,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: 12,
    padding: 16,
  },
  teoriaTexto: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 23,
    fontWeight: "500",
  },

  /* ======================================================
     2. ESTILOS DE LA PANTALLA MISIÓN (NORMALES / ORIGINALES)
     ====================================================== */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: 16,
    padding: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  subtituloHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  titulo: {
    fontFamily: "LilitaOne",
    fontSize: 20,
    color: colors.primary,
  },
  cardMision: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  competenciaTexto: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
  areaRespuesta: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.card,
    fontSize: 15,
  },
  inputOutline: {
    borderWidth: 1.5,
    borderRadius: 14,
  },
  errorContainer: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  error: {
    color: colors.error,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
  },
});