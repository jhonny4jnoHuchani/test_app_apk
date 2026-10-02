import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../theme/colors";

const MENSAJES = [
  "Pensando...",
  "Analizando tu respuesta...",
  "Consultando al tutor...",
  "Evaluando criterios...",
  "Preparando feedback...",
];

export function LoadingIA() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndice((prev) => (prev + 1) % MENSAJES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/items/CupheadLoading.gif")}
        style={styles.gif}
        contentFit="contain"
        autoplay
      />

      <Text variant="titleMedium" style={styles.mensaje}>
        {MENSAJES[indice]}
      </Text>

      <Text variant="bodySmall" style={styles.subtitulo}>
        Esto puede tardar unos segundos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },

  gif: {
    width: 140,
    height: 140,
  },

  mensaje: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: "bold",
  },

  subtitulo: {
    marginTop: 8,
    color: colors.textSecondary,
  },
});
