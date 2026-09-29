import { MotiView } from 'moti';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RespuestaMision } from '../api/misiones.api';
import { colors } from '../theme/colors';

interface Props {
  resultado: RespuestaMision;
  onContinuar: () => void;
}

export function ResultadoFeedback({ resultado, onContinuar }: Props) {
  const { intento, evaluacion, insigniasNuevas } = resultado;

  const getColor = () => {
    switch (intento.resultado) {
      case 'correcto':
        return colors.success;
      case 'parcial':
        return colors.warning;
      default:
        return colors.error;
    }
  };

  const getIcono = () => {
    switch (intento.resultado) {
      case 'correcto':
        return '🎉';
      case 'parcial':
        return '💡';
      default:
        return '❌';
    }
  };

  const getTitulo = () => {
    switch (intento.resultado) {
      case 'correcto':
        return '¡Correcto!';
      case 'parcial':
        return 'Casi lo logras';
      default:
        return 'Incorrecto';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>


      <View style={[styles.header, { backgroundColor: getColor() }]}>
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Text style={styles.icono}>{getIcono()}</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: 'timing', duration: 400 }}
        >
          <Text variant="headlineMedium" style={styles.titulo}>
            {getTitulo()}
          </Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 400, type: 'spring', damping: 10 }}
        >
          <Text variant="titleLarge" style={styles.puntuacion}>
            {intento.puntuacion}/100
          </Text>
        </MotiView>
      </View>



      <View style={styles.body}>
        <Text variant="titleMedium" style={styles.seccion}>
          Criterios evaluados
        </Text>

        {evaluacion.criterios.map((c, i) => (
          <View key={i} style={styles.criterio}>
            <Text style={styles.criterioIcono}>
              {c.cumplido ? '✅' : '❌'}
            </Text>
            <View style={styles.criterioInfo}>
              <Text variant="titleSmall" style={styles.criterioNombre}>
                {c.nombre.replace(/_/g, ' ')}
              </Text>
              <Text variant="bodySmall" style={styles.criterioComentario}>
                {c.comentario}
              </Text>
            </View>
          </View>
        ))}

        {evaluacion.pista && (
          <View style={styles.pistaBox}>
            <Text variant="titleSmall" style={styles.pistaTitulo}>
              💡 Pista del tutor
            </Text>
            <Text variant="bodyMedium" style={styles.pistaTexto}>
              {evaluacion.pista}
            </Text>
          </View>
        )}

        <View style={styles.explicacionBox}>
          <Text variant="titleSmall" style={styles.explicacionTitulo}>
            📝 Explicación
          </Text>
          <Text variant="bodyMedium" style={styles.explicacionTexto}>
            {evaluacion.explicacion}
          </Text>
        </View>

        {insigniasNuevas.length > 0 && (
          <View style={styles.insigniasBox}>
            <Text variant="titleMedium" style={styles.insigniasTitulo}>
              🏆 ¡Nuevas insignias!
            </Text>
            {insigniasNuevas.map((ins) => (
              <View key={ins.id} style={styles.insignia}>
                <Text style={styles.insigniaIcono}>🏅</Text>
                <View style={styles.insigniaInfo}>
                  <Text variant="titleSmall" style={styles.insigniaNombre}>
                    {ins.nombre}
                  </Text>
                  <Text variant="bodySmall" style={styles.insigniaDesc}>
                    {ins.descripcion}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}


        <View style={styles.footer}>
          <Text
            variant="titleMedium"
            style={styles.continuarBoton}
            onPress={onContinuar}
          >
            {intento.resultado === 'correcto'
              ? 'Volver al mapa →'
              : 'Intentar de nuevo →'}
          </Text>
        </View>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  icono: {
    fontSize: 64,
  },
  titulo: {
    color: colors.textInverse,
    fontWeight: 'bold',
    marginTop: 8,
  },
  puntuacion: {
    color: colors.textInverse,
    marginTop: 8,
  },
  body: {
    padding: 24,
  },
  seccion: {
    color: colors.textPrimary,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  criterio: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  criterioIcono: {
    fontSize: 20,
  },
  criterioInfo: {
    flex: 1,
  },
  criterioNombre: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  criterioComentario: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  pistaBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  pistaTitulo: {
    color: colors.warning,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pistaTexto: {
    color: colors.textPrimary,
  },
  explicacionBox: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  explicacionTitulo: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explicacionTexto: {
    color: colors.textPrimary,
  },
  insigniasBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  insigniasTitulo: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  insignia: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  insigniaIcono: {
    fontSize: 32,
  },
  insigniaInfo: {
    flex: 1,
  },
  insigniaNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  insigniaDesc: {
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  continuarBoton: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});