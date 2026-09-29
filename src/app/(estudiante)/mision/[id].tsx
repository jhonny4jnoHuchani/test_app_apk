import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import {
  EstadoMision,
  obtenerEstadoMision,
  responderMision,
  RespuestaMision,
} from "../../../api/misiones.api";
import { LoadingIA } from "../../../components/LoadingIA";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { ResultadoFeedback } from "../../../components/ResultadoFeedback";
import { VidasIndicator } from "../../../components/VidasIndicator";
import { MarcarErroresMision } from "../../../features/misiones/tipos/MarcarErroresMision";
import { colors } from "../../../theme/colors";

type Etapa = "cargando" | "teoria" | "mision" | "evaluando" | "resultado";

export default function MisionScreen() {
  const { id, origen: origenParam } = useLocalSearchParams<{
    id: string;
    origen?: string;
  }>();
  const [etapa, setEtapa] = useState<Etapa>("cargando");
  const [mision, setMision] = useState<EstadoMision | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [resultado, setResultado] = useState<RespuestaMision | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      cargarMision();
    }
  }, [id]);

  const cargarMision = async () => {
    try {
      setEtapa("cargando");
      const data = await obtenerEstadoMision(id!);
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

      const data = await responderMision(id!, textoFinal.trim(), origenFinal);
      setResultado(data);
      setEtapa("resultado");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Error al evaluar tu respuesta";
      setError(Array.isArray(msg) ? msg[0] : msg);
      setEtapa("mision");
    }
  };

  const continuar = () => {
    if (resultado?.intento.resultado === "correcto") {
      if (origenParam === "recomendacion_docente") {
        router.replace("/(estudiante)/recomendaciones");
      } else {
        router.replace("/(estudiante)/lobby");
      }
    } else {
      setRespuesta("");
      setResultado(null);
      setError("");
      cargarMision();
    }
  };

  if (etapa === "cargando") {
    return (
      <View style={styles.center}>
        <Text>Cargando misión...</Text>
      </View>
    );
  }

  if (etapa === "teoria" && mision?.teoria) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="📚 Antes de empezar" />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.teoria}>
              {mision.teoria}
            </Text>
          </Card.Content>
        </Card>
        <PrimaryButton onPress={() => setEtapa("mision")}>
          ¡Entendido, vamos!
        </PrimaryButton>
      </ScrollView>
    );
  }

  if (etapa === "evaluando") {
    return <LoadingIA />;
  }

  if (etapa === "resultado" && resultado) {
    return <ResultadoFeedback resultado={resultado} onContinuar={continuar} />;
  }

  // Etapa MISIÓN
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.titulo}>
            {mision?.titulo}
          </Text>
          <VidasIndicator
            vidas={mision?.vidasRestantes ?? 0}
            vidasIniciales={mision?.vidasIniciales ?? 3}
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge">{mision?.competencia}</Text>
          </Card.Content>
        </Card>

        {mision?.tipoInteraccion === "marcar_errores" ? (
          <MarcarErroresMision
            misionId={id!}
            onSubmit={(resp) => enviarRespuesta(resp)}
            disabled={mision?.completada}
          />
        ) : (
          <>
            <TextInput
              label="Tu respuesta"
              value={respuesta}
              onChangeText={setRespuesta}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              editable={!mision?.completada}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              onPress={() => enviarRespuesta()}
              disabled={mision?.completada || respuesta.length < 3}
            >
              Enviar respuesta
            </PrimaryButton>
          </>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titulo: {
    flex: 1,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginRight: 8,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
  },
  teoria: {
    lineHeight: 24,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
  },
  error: {
    color: colors.error,
    textAlign: "center",
  },
});
