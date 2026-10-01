import { MotiView } from 'moti';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RespuestaMision } from '../api/misiones.api';
import { colors } from '../theme/colors';

const destellos = [
  { simbolo: '✦', top: 22, left: '17%', delay: 100 },
  { simbolo: '★', top: 72, left: '25%', delay: 220 },
  { simbolo: '✧', top: 18, right: '18%', delay: 160 },
  { simbolo: '✦', top: 78, right: '24%', delay: 280 },
] as const;

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
        <View pointerEvents="none" style={styles.destellos}>
          {destellos.map((destello) => (
            <MotiView
              key={destello.simbolo + destello.delay}
              from={{ opacity: 0, scale: 0.25, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{
                type: 'spring',
                damping: 8,
                delay: destello.delay,
              }}
              style={[
                styles.destello,
                {
                  top: destello.top,
                  left: 'left' in destello ? destello.left : undefined,
                  right: 'right' in destello ? destello.right : undefined,
                },
              ]}
            >
              <Text style={styles.destelloTexto}>{destello.simbolo}</Text>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ scale: 0.45, rotate: '-20deg', translateY: 18 }}
          animate={{ scale: 1, rotate: '0deg', translateY: 0 }}
          transition={{ type: 'spring', damping: 9, stiffness: 125 }}
          style={styles.sello}
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
          from={{ opacity: 0, scale: 0.55, translateY: 14 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 380,
            type: 'spring',
            damping: 10,
            stiffness: 130,
          }}
          style={styles.puntuacionCaja}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              intento.resultado === 'correcto'
                ? 'Continuar a la siguiente misión o al mapa'
                : 'Intentar la misión de nuevo'
            }
            hitSlop={8}
            onPress={onContinuar}
            style={styles.continuarBoton}
          >
            <Text variant="titleMedium" style={styles.continuarTexto}>
              {intento.resultado === 'correcto'
                ? 'Continuar →'
                : 'Intentar de nuevo →'}
            </Text>
          </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 5,
    borderBottomColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 5,
  },
  destellos: {
    ...StyleSheet.absoluteFill,
  },
  destello: {
    position: 'absolute',
  },
  destelloTexto: {
    color: '#FFF3B0',
    fontSize: 27,
    textShadowColor: 'rgba(27, 23, 20, 0.28)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
  sello: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: colors.ink,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
    elevation: 5,
  },
  icono: {
    fontSize: 60,
  },
  titulo: {
    color: colors.textInverse,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: 'LilitaOne',
    fontSize: 33,
    textAlign: 'center',
    textShadowColor: 'rgba(27, 23, 20, 0.35)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
  puntuacionCaja: {
    marginTop: 13,
    minWidth: 116,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 3,
  },
  puntuacion: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontWeight: '700',
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
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuarTexto: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});