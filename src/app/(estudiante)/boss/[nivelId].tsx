import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, Card, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  consultarSesionBoss,
  iniciarBoss,
  obtenerSesionActivaBoss,
  responderBoss,
  SesionBoss
} from '../../../api/boss.api';
import { Mision, obtenerMapa } from '../../../api/juego.api';
import { LoadingIA } from '../../../components/LoadingIA';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../theme/colors';

type Etapa = 'iniciando' | 'teoria' | 'mision' | 'evaluando' | 'resultado' | 'error';

export default function BossScreen() {
  const insets = useSafeAreaInsets();
  const { nivelId, modalidadId } = useLocalSearchParams<{
    nivelId: string;
    modalidadId?: string;
  }>();

  const [etapa, setEtapa] = useState<Etapa>('iniciando');
  const [sesion, setSesion] = useState<SesionBoss | null>(null);
  const [mision, setMision] = useState<Mision | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [resultadoFinal, setResultadoFinal] = useState<
    'superado' | 'no_superado' | null
  >(null);
  const [evaluacion, setEvaluacion] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // CARGA INICIAL
  // ============================================================
  useEffect(() => {
    if (nivelId && modalidadId) {
      arrancar();
    } else {
      setError('Faltan parámetros para iniciar el Boss');
      setEtapa('error');
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nivelId, modalidadId]);

  const arrancar = async () => {
    try {
      setEtapa('iniciando');
      setError('');

      // 1. ¿Hay sesión activa? Si sí, continuar. Si no, iniciar nueva.
      const activa = await obtenerSesionActivaBoss(nivelId!);
      console.log('activa:', activa, 'tipo:', typeof activa);

      // Si activa no tiene id válido, crear nueva
      const s = activa && activa.id
        ? activa
        : await iniciarBoss(nivelId!);
      setSesion(s);
      setTiempoRestante(s.tiempoRestanteSegundos);

      // 2. Sacar la misión del nivel desde el mapa
      const mapa = await obtenerMapa(Number(modalidadId));
      const nivel = mapa.niveles.find((n) => String(n.id) === String(nivelId));

      if (!nivel || !nivel.misiones[0]) {
        setError('Este Boss no tiene misión configurada');
        setEtapa('error');
        return;
      }

      setMision(nivel.misiones[0]);

      // 3. NO arrancar timer todavía.
      // Si no tiene teoría, arranca directo. Si tiene, arranca al dar "Entendido".
      const tieneTeoria = !!nivel.misiones[0].teoria;

      if (!tieneTeoria) {
        iniciarTimer(s.tiempoRestanteSegundos);
        setEtapa('mision');
      } else {
        setEtapa('teoria');
      }


    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'No se pudo iniciar el Boss';
      setError(Array.isArray(msg) ? msg[0] : msg);
      setEtapa('error');
    }
  };

  // ============================================================
  // TIMER
  // ============================================================
  const iniciarTimer = (segundos: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTiempoRestante(segundos);

    intervalRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        const nuevo = prev - 1;
        if (nuevo <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Forzar cierre: consultar sesión para que backend marque no_superado
          manejarExpiracion();
          return 0;
        }
        return nuevo;
      });
    }, 1000);
  };

  const manejarExpiracion = async () => {
    try {
      if (!sesion) return;
      const s = await consultarSesionBoss(sesion.id);
      setSesion(s);
      setResultadoFinal(s.resultadoFinal);
      setEtapa('resultado');
    } catch {
      setResultadoFinal('no_superado');
      setEtapa('resultado');
    }
  };

  // ============================================================
  // RESPONDER
  // ============================================================
  const enviarRespuesta = async () => {
    console.log('=== ENVIAR RESPUESTA ===');
    console.log('sesion:', sesion);
    console.log('mision:', mision);
    console.log('respuesta:', respuesta);

    if (!sesion || !mision) {
      console.log('FALTA sesion o mision');
      return;
    }
    if (respuesta.trim().length < 3) {
      setError('Escribe una respuesta más completa');
      return;
    }

    try {
      setError('');
      setEtapa('evaluando');

      console.log('LLAMANDO A responderBoss...');
      const res = await responderBoss(sesion.id, mision.id, respuesta.trim());
      console.log('RESPUESTA:', res);




      setEvaluacion(res);
      setSesion((prev) =>
        prev
          ? {
              ...prev,
              finalizado: res.boss.finalizado,
              resultadoFinal: res.boss.resultadoFinal,
              tiempoRestanteSegundos: res.boss.tiempoRestanteSegundos,
            }
          : prev,
      );

      // Sincronizar timer con lo que devolvió el backend
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (res.boss.tiempoRestanteSegundos > 0 && !res.boss.finalizado) {
        iniciarTimer(res.boss.tiempoRestanteSegundos);
      } else {
        setTiempoRestante(0);
      }

      // Si el Boss terminó → pantalla resultado
      if (res.boss.finalizado) {
        setResultadoFinal(res.boss.resultadoFinal);
        setEtapa('resultado');
      } else {
        // No finalizó pero tampoco acierto completo → volver a intentar
        if (res.intento.resultado === 'correcto') {
          // Correcto pero el backend dice que no finalizó (raro con 1 misión)
          setResultadoFinal('superado');
          setEtapa('resultado');
        } else {
          setRespuesta('');
          setEtapa('mision');
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Error al evaluar tu respuesta';
      setError(Array.isArray(msg) ? msg[0] : msg);
      setEtapa('mision');
    }
  };

  // ============================================================
  // FORMATO DE TIEMPO
  // ============================================================
  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = Math.floor(seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const volverAlMapa = () => {
    router.replace(`/(estudiante)/mapa?modalidadId=${modalidadId}`);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (etapa === 'iniciando') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Iniciando Boss...</Text>
      </View>
    );
  }

  if (etapa === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <PrimaryButton onPress={volverAlMapa}>Volver al mapa</PrimaryButton>
      </View>
    );
  }

  if (etapa === 'evaluando') {
    return <LoadingIA />;
  }

  if (etapa === 'teoria' && mision?.teoria) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24 },
        ]}
      >
        <View style={styles.timerHeader}>
          <Text style={styles.timerTexto}>⏱️ {formatearTiempo(tiempoRestante)}</Text>
        </View>
        <Card style={styles.card}>
          <Card.Title title="📚 Antes de empezar" />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.teoria}>
              {mision.teoria}
            </Text>
          </Card.Content>
        </Card>


        <PrimaryButton
          onPress={() => {
            iniciarTimer(sesion?.tiempoRestanteSegundos ?? 900);
            setEtapa('mision');
          }}
        >
          ¡Entendido, vamos!
        </PrimaryButton>


      </ScrollView>
    );
  }

  if (etapa === 'resultado') {
    const superado = resultadoFinal === 'superado';
    return (
      <View style={styles.center}>
        <Text style={styles.emojiResultado}>{superado ? '🏆' : '⏱️'}</Text>
        <Text variant="headlineMedium" style={styles.tituloResultado}>
          {superado ? '¡Boss superado!' : 'Se acabó el tiempo'}
        </Text>
        <Text variant="bodyLarge" style={styles.textoResultado}>
          {superado
            ? 'Has completado el desafío del Boss con éxito.'
            : 'No lograste superar al Boss esta vez. Puedes intentarlo de nuevo.'}
        </Text>

        {evaluacion?.intento && (
          <Card style={styles.cardResultado}>
            <Card.Content>
              <Text variant="bodyMedium">
                Resultado: {evaluacion.intento.resultado}
              </Text>
              <Text variant="bodyMedium">
                Puntuación: {evaluacion.intento.puntuacion}
              </Text>
              {evaluacion.evaluacion?.explicacion && (
                <Text variant="bodySmall" style={styles.explicacion}>
                  {evaluacion.evaluacion.explicacion}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <PrimaryButton onPress={volverAlMapa}>Volver al mapa</PrimaryButton>
      </View>
    );
  }

  // Etapa MISIÓN
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.timerHeader}>
          <Text style={styles.timerTexto}>⏱️ {formatearTiempo(tiempoRestante)}</Text>
        </View>

        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.titulo}>
            {mision?.titulo}
          </Text>
        </View>

        {mision?.competencia && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyLarge">{mision.competencia}</Text>
            </Card.Content>
          </Card>
        )}

        <TextInput
          label="Tu respuesta"
          value={respuesta}
          onChangeText={setRespuesta}
          mode="outlined"
          multiline
          numberOfLines={6}
          contentStyle={{ fontSize: 16 }}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={() => {
            console.log('BOTON TOCADO, respuesta:', respuesta);
            enviarRespuesta();
          }}
          disabled={respuesta.trim().length < 3}
          style={[
            styles.botonEnviar,
            respuesta.trim().length < 3 && styles.botonEnviarDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.botonEnviarTexto}>Enviar respuesta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );

}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
    gap: 16,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  timerHeader: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  timerTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    flex: 1,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    textAlign: 'center',
  },
  emojiResultado: {
    fontSize: 72,
  },
  tituloResultado: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  textoResultado: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardResultado: {
    width: '100%',
    backgroundColor: colors.backgroundAlt,
  },
  explicacion: {
    marginTop: 8,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
    botonEnviar: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEnviarDisabled: {
    opacity: 0.5,
  },
  botonEnviarPressed: {
    opacity: 0.8,
  },
  botonEnviarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});