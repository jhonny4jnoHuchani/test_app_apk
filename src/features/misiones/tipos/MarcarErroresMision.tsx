import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';
import { obtenerTextoGenerado } from '../../../api/misiones.api';
import { colors } from '../../../theme/colors';

interface Props {
  misionId: string;
  onSubmit: (respuesta: string) => void;
  disabled?: boolean;
}

interface Palabra {
  texto: string;
  marcada: boolean;
  esEspacio: boolean;
}

export function MarcarErroresMision({ misionId, onSubmit, disabled }: Props) {
  const [cargando, setCargando] = useState(true);
  const [instruccion, setInstruccion] = useState('');
  const [palabras, setPalabras] = useState<Palabra[]>([]);
  const [modoMarcar, setModoMarcar] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTexto();
  }, [misionId]);

  const cargarTexto = async () => {
    try {
      setCargando(true);
      setError('');

      const data = await obtenerTextoGenerado(misionId);
      setInstruccion(data.instruccion);

      // Convertir el texto en array de palabras (preservando espacios y puntuación)
      const palabrasArray = data.texto.split(/(\s+)/).map((parte) => ({
        texto: parte,
        marcada: false,
        esEspacio: /^\s+$/.test(parte),
      }));

      setPalabras(palabrasArray);
    } catch (err) {
      setError('No se pudo generar el texto. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const togglePalabra = (index: number) => {
    if (disabled || !modoMarcar) return;

    const palabra = palabras[index];
    if (palabra.esEspacio) return;

    const nuevas = [...palabras];
    nuevas[index] = { ...palabra, marcada: !palabra.marcada };
    setPalabras(nuevas);
  };

  const limpiarMarcas = () => {
    setPalabras(palabras.map((p) => ({ ...p, marcada: false })));
  };

  const enviar = () => {
    const palabrasMarcadas = palabras.filter((p) => p.marcada);

    if (palabrasMarcadas.length === 0) {
      setError('Marca al menos una palabra o frase que creas que tiene error');
      return;
    }

    setError('');

    // Reconstruir fragmentos marcados (agrupar palabras contiguas marcadas)
    const textoMarcado = palabras
      .map((p) => (p.marcada ? p.texto : ' '))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    const respuesta = `Marqué como errores el siguiente fragmento del texto: "${textoMarcado}"`;

    onSubmit(respuesta);
  };

  const totalMarcadas = palabras.filter((p) => p.marcada).length;

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.textoCargando}>Generando texto con IA...</Text>
        <Text style={styles.subtextoCargando}>Esto puede tardar unos segundos</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="📖 Texto para analizar" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.instruccion}>
            {instruccion}
          </Text>

          {/* Banner de modo marcar */}
          <View
            style={[
              styles.bannerModo,
              modoMarcar && styles.bannerModoActivo,
            ]}
          >
            <IconButton
              icon="pencil"
              size={24}
              iconColor={modoMarcar ? colors.textInverse : colors.primary}
              onPress={() => setModoMarcar(!modoMarcar)}
              disabled={disabled}
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.bannerTexto,
                modoMarcar && styles.bannerTextoActivo,
              ]}
            >
              {modoMarcar
                ? '✏️ Modo marcar ACTIVADO — toca las palabras erróneas'
                : '✏️ Toca el lápiz para activar el modo marcar'}
            </Text>
          </View>

          {/* Texto con palabras tocables */}
          {/* Texto completo con palabras tocables (Text anidados) */}
          <Text style={styles.textoCompleto}>
            {palabras.map((palabra, i) =>
              palabra.esEspacio ? (
                <Text key={i}>{palabra.texto}</Text>
              ) : (
                <Text
                  key={i}
                  onPress={() => togglePalabra(i)}
                  style={palabra.marcada ? styles.palabraMarcada : undefined}
                >
                  {palabra.texto}
                </Text>
              ),
            )}
          </Text>

          
        </Card.Content>
      </Card>

      {totalMarcadas > 0 && (
        <View style={styles.contadorRow}>
          <Text variant="bodyMedium" style={styles.contador}>
            {totalMarcadas} palabra{totalMarcadas === 1 ? '' : 's'} marcada
            {totalMarcadas === 1 ? '' : 's'}
          </Text>
          <Text
            variant="bodyMedium"
            style={styles.limpiar}
            onPress={limpiarMarcas}
          >
            Limpiar todo
          </Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={enviar}
        disabled={disabled || totalMarcadas === 0}
        style={[
          styles.botonEnviar,
          (disabled || totalMarcadas === 0) && styles.botonEnviarDeshabilitado,
        ]}
      >
        <Text variant="titleMedium" style={styles.botonEnviarTexto}>
          Enviar respuesta
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  textoCargando: {
    marginTop: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtextoCargando: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
  },
  instruccion: {
    color: colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bannerModo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingRight: 12,
    marginBottom: 16,
  },
  bannerModoActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bannerTexto: {
    flex: 1,
    color: colors.textSecondary,
  },
  bannerTextoActivo: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  textoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  espacio: {
    fontSize: 17,
    lineHeight: 30,
  },
  palabraWrapper: {
    borderRadius: 4,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },

  palabraTexto: {
    fontSize: 17,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  palabraTextoMarcada: {
    color: colors.error,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  contadorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contador: {
    color: colors.textSecondary,
  },
  limpiar: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  botonEnviar: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonEnviarDeshabilitado: {
    backgroundColor: colors.border,
  },
  botonEnviarTexto: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
textoCompleto: {
    fontSize: 17,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  palabraMarcada: {
    backgroundColor: '#FEE2E2',
    color: colors.error,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});