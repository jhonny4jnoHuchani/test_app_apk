import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CompatibilidadTema,
  establecerTema,
  listarModalidades,
  Modalidad,
  ModalidadSugerida,
  obtenerMapa,
  obtenerMiProgreso,
  TemaInvalidoResponse,
} from '../../api/juego.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { MissionPathMap } from '../../components/MissionPathMap';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoundedNavigationHeader } from '../../components/RoundedNavigationHeader';
import { useJuegoStore } from '../../store/juegoStore';
import { colors } from '../../theme/colors';

type Etapa = 'cargando' | 'escribir-tema' | 'mapa' | 'error';

type PartesTema = {
  variable: string;
  poblacion: string;
  contexto: string;
  tiempo: string;
};

const TEMA_EJEMPLO =
  'Impacto del uso de redes sociales en la autoestima de adolescentes de colegios privados de Cochabamba durante la gestión 2025';

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const { modalidadId: modalidadIdParam } = useLocalSearchParams<{
    modalidadId?: string;
  }>();

  const [etapa, setEtapa] = useState<Etapa>('cargando');
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);
  const [tema, setTema] = useState('');
  const [modoConstructor, setModoConstructor] = useState(false);
  const [partesTema, setPartesTema] = useState<PartesTema>({
    variable: '',
    poblacion: '',
    contexto: '',
    tiempo: '',
  });
  const [guardandoTema, setGuardandoTema] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [errorValidacion, setErrorValidacion] =
    useState<TemaInvalidoResponse | null>(null);
  const [avisoCarrera, setAvisoCarrera] = useState<{
    advertencia: string | null;
    sugerencia: string | null;
  } | null>(null);

  const {
    modalidadActual,
    niveles,
    temaInvestigacion,
    xpTotal,
    porcentaje,
    setModalidad,
    setMapa,
  } = useJuegoStore();



  // Al montar: resolver modalidad (por URL, por store, o desde la lista)
  useEffect(() => {
    resolverModalidad();
  }, [modalidadIdParam]);

  const resolverModalidad = async () => {
    try {
      setEtapa('cargando');
      setError('');

      const idBuscado = modalidadIdParam
        ? Number(modalidadIdParam)
        : modalidadActual?.id;

      if (!idBuscado) {
        router.replace('/(estudiante)/lobby');
        return;
      }

      // Si ya la tenemos en el store y coincide el id, usar directo
      if (modalidadActual && modalidadActual.id === idBuscado) {
        await cargarMapa(modalidadActual.id);
        return;
      }

      // Si no, buscarla en la lista
      const lista = await listarModalidades();
      setModalidades(lista);
      const encontrada = lista.find((m) => m.id === idBuscado);

      if (!encontrada) {
        router.replace('/(estudiante)/lobby');
        return;
      }

      setModalidad(encontrada);
      await cargarMapa(encontrada.id);
    } catch (err: any) {
      setError('No se pudo cargar la modalidad');
      setEtapa('error');
    }
  };





  const cargarMapa = async (modalidadId: number) => {
    try {
      setEtapa('cargando');

      const [mapa, progreso] = await Promise.all([
        obtenerMapa(modalidadId),
        obtenerMiProgreso(modalidadId),
      ]);

      setMapa({
        niveles: mapa.niveles,
        xpTotal: mapa.progreso.xpTotal,
        puntosInvestigacionTotal: mapa.progreso.puntosInvestigacionTotal,
        porcentaje: mapa.progreso.porcentaje,
        temaInvestigacion: progreso.temaInvestigacion,
      });

      // Si no tiene tema, pedirlo
      if (!progreso.temaInvestigacion) {
        setEtapa('escribir-tema');
      } else {
        setEtapa('mapa');
      }

    } catch (err: any) {
      setError('No se pudo cargar el mapa');
      setEtapa('error');
    }
  };

  const validarTemaLocal = (temaTexto: string): string | null => {
    if (temaTexto.length < 20) {
      return 'El tema debe tener al menos 20 caracteres.';
    }
    if (temaTexto.length > 300) {
      return 'El tema no debe superar los 300 caracteres.';
    }
    const palabras = temaTexto
      .split(/\s+/)
      .filter((palabra) => palabra.length > 2);
    if (palabras.length < 4) {
      return 'El tema debe contener al menos 4 palabras significativas.';
    }
    return null;
  };

  const guardarTemaEnModalidad = async (
    modalidad: Modalidad,
    temaTexto: string,
  ) => {
    try {
      setGuardandoTema(true);
      setError('');
      setErrorValidacion(null);
      const respuesta = await establecerTema(modalidad.id, temaTexto);
      const advertencia = respuesta.validacion?.advertenciaCarrera?.trim() || null;
      const sugerencia = respuesta.validacion?.sugerenciaCarrera?.trim() || null;

      setAvisoCarrera(
        advertencia || sugerencia ? { advertencia, sugerencia } : null,
      );
      setModalidad(modalidad);
      await cargarMapa(modalidad.id);
    } catch (err: any) {
      const data = err?.response?.data as TemaInvalidoResponse | undefined;
      const tieneDetallesValidacion = Boolean(
        data &&
          (data.razon ||
            data.explicacion ||
            data.sugerencia ||
            data.elementosFaltantes?.length ||
            data.elementosPresentes?.length ||
            data.compatibilidad ||
            data.modalidadSugerida),
      );

      if (tieneDetallesValidacion && data) {
        setErrorValidacion(data);
        setError('');
      } else {
        const mensaje = data?.message ?? err?.message ?? 'Error guardando el tema';
        setError(Array.isArray(mensaje) ? mensaje.join('\n') : mensaje);
        setErrorValidacion(null);
      }
    } finally {
      setGuardandoTema(false);
    }
  };

  const guardarTema = async () => {
    if (!modalidadActual) return;
    const temaLimpio = tema.trim();
    const errorLocal = validarTemaLocal(temaLimpio);

    if (errorLocal) {
      setError(errorLocal);
      setErrorValidacion(null);
      return;
    }

    await guardarTemaEnModalidad(modalidadActual, temaLimpio);
  };

  const usarTemaSugerido = () => {
    if (!errorValidacion?.sugerencia) return;
    setTema(errorValidacion.sugerencia);
    setError('');
    setErrorValidacion(null);
  };

  const actualizarParteTema = (parte: keyof PartesTema, valor: string) => {
    setPartesTema((actual) => ({ ...actual, [parte]: valor }));
    setError('');
    setErrorValidacion(null);
  };

  const armarTemaDesdePartes = () => {
    const variable = partesTema.variable.trim();
    const poblacion = partesTema.poblacion.trim();
    const contexto = partesTema.contexto.trim();
    const tiempo = partesTema.tiempo.trim();
    const cantidadDePartes = [variable, poblacion, contexto, tiempo].filter(
      Boolean,
    ).length;

    if (!variable || !poblacion) {
      setError('Completa la variable y la población para armar el título.');
      return;
    }
    if (cantidadDePartes < 3) {
      setError('Completa al menos 3 de las 4 piezas para armar el tema.');
      return;
    }

    const variableConArticulo = /^(el|la|los|las|un|una)\b/i.test(variable)
      ? variable
      : `el ${variable}`;
    const fraseVariable = /^el\b/i.test(variableConArticulo)
      ? `del ${variableConArticulo.slice(3)}`
      : `de ${variableConArticulo}`;
    const titulo = `Impacto ${fraseVariable} en ${poblacion}${
      contexto ? ` de ${contexto}` : ''
    }${tiempo ? ` durante ${tiempo}` : ''}`;
    setTema(titulo);
    setError('');
    setErrorValidacion(null);
    setModoConstructor(false);
  };

  const cargarEjemplo = () => {
    setTema(TEMA_EJEMPLO);
    setError('');
    setErrorValidacion(null);
    setModoConstructor(false);
  };

  const probarModalidadSugerida = async (
    modalidadSugerida: ModalidadSugerida,
  ) => {
    const modalidad =
      modalidades.find((item) => item.id === modalidadSugerida.id) ?? {
        id: modalidadSugerida.id,
        nombre: modalidadSugerida.nombre,
        descripcion: '',
        ordenMundo: 0,
      };
    const temaLimpio = tema.trim();
    const errorLocal = validarTemaLocal(temaLimpio);

    if (errorLocal) {
      setError(errorLocal);
      return;
    }

    setModalidad(modalidad);
    await guardarTemaEnModalidad(modalidad, temaLimpio);
  };

  const refrescarMapa = async () => {
    if (!modalidadActual) return;
    setRefrescando(true);
    try {
      await cargarMapa(modalidadActual.id);
    } finally {
      setRefrescando(false);
    }
  };

  // ============================================================
  // RENDER SEGÚN ETAPA
  // ============================================================

  if (etapa === 'cargando') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }



  if (etapa === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <PrimaryButton onPress={() => router.replace('/(estudiante)/lobby')}>
          Volver al lobby
        </PrimaryButton>
      </View>
    );
  }



  if (etapa === 'escribir-tema') {
    const palabrasSignificativas = tema
      .trim()
      .split(/\s+/)
      .filter((palabra) => palabra.length > 2);
    const elementosFaltantes = errorValidacion?.elementosFaltantes ?? [];
    const elementosPresentes = errorValidacion?.elementosPresentes ?? [];
    const modalidadSugerida = errorValidacion?.modalidadSugerida ?? null;
    const compatibilidad: CompatibilidadTema | undefined =
      errorValidacion?.compatibilidad;
    const longitudTema = tema.trim().length;
    const cumpleMinimoCaracteres = longitudTema >= 20;
    const cumpleMaximoCaracteres = longitudTema <= 300;
    const cumpleMinimoPalabras = palabrasSignificativas.length >= 4;
    const progresoCaracteres: `${number}%` =
      `${Math.min(100, (longitudTema / 300) * 100)}%`;

    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top + 18, 26),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        <View style={styles.screenFrame}>
          <View style={styles.introHero}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Feather name="book-open" size={23} color={colors.primaryDark} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>NUEVA INVESTIGACIÓN</Text>
                <Text style={styles.heroMode}>
                  {modalidadActual?.nombre?.toUpperCase() ?? 'TU MODALIDAD'}
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Feather name="compass" size={14} color={colors.xpDark} />
                <Text style={styles.heroBadgeText}>Misión 1</Text>
              </View>
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              Dale forma a tu tema
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Una buena pregunta empieza por definir qué estudiarás, en quién,
              dónde y cuándo.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Feather name="target" size={18} color={colors.secondaryDark} />
              </View>
              <View style={styles.sectionHeadingCopy}>
                <Text style={styles.sectionTitle}>Arma tu tema</Text>
                <Text style={styles.sectionSubtitle}>
                  Incluye al menos 3 de estas 4 piezas
                </Text>
              </View>
            </View>

            <View style={styles.elementGrid}>
              <View style={styles.elementCard}>
                <Feather name="activity" size={16} color={colors.primary} />
                <View style={styles.elementCardCopy}>
                  <Text style={styles.elementCardTitle}>Variable</Text>
                  <Text style={styles.elementCardHint}>¿Qué estudiarás?</Text>
                </View>
              </View>
              <View style={styles.elementCard}>
                <Feather name="users" size={16} color={colors.secondaryDark} />
                <View style={styles.elementCardCopy}>
                  <Text style={styles.elementCardTitle}>Población</Text>
                  <Text style={styles.elementCardHint}>¿A quiénes?</Text>
                </View>
              </View>
              <View style={styles.elementCard}>
                <Feather name="map-pin" size={16} color={colors.xpDark} />
                <View style={styles.elementCardCopy}>
                  <Text style={styles.elementCardTitle}>Contexto</Text>
                  <Text style={styles.elementCardHint}>¿Dónde?</Text>
                </View>
              </View>
              <View style={styles.elementCard}>
                <Feather name="calendar" size={16} color={colors.info} />
                <View style={styles.elementCardCopy}>
                  <Text style={styles.elementCardTitle}>Tiempo</Text>
                  <Text style={styles.elementCardHint}>¿Cuándo?</Text>
                </View>
              </View>
            </View>

            <View style={styles.modeSwitcher}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !modoConstructor }}
                onPress={() => {
                  setModoConstructor(false);
                  setError('');
                  setErrorValidacion(null);
                }}
                style={[
                  styles.modeOption,
                  !modoConstructor && styles.modeOptionSelected,
                ]}
              >
                <Feather
                  name="edit-3"
                  size={16}
                  color={!modoConstructor ? colors.textInverse : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modeOptionText,
                    !modoConstructor && styles.modeOptionTextSelected,
                  ]}
                >
                  Escribirlo
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: modoConstructor }}
                onPress={() => {
                  setModoConstructor(true);
                  setError('');
                }}
                style={[
                  styles.modeOption,
                  modoConstructor && styles.modeOptionSelected,
                ]}
              >
                <Feather
                  name="layers"
                  size={16}
                  color={modoConstructor ? colors.textInverse : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modeOptionText,
                    modoConstructor && styles.modeOptionTextSelected,
                  ]}
                >
                  Paso a paso
                </Text>
              </Pressable>
            </View>

            {modoConstructor && (
              <View style={styles.builderCard}>
                <View style={styles.builderIntro}>
                  <Text style={styles.builderTitle}>Completa las piezas</Text>
                  <Text style={styles.builderHint}>
                    Necesitas variable, población y al menos una pieza más.
                  </Text>
                </View>
                <TextInput
                  label="Variable o fenómeno"
                  placeholder="Ej. uso de redes sociales"
                  value={partesTema.variable}
                  onChangeText={(value) => actualizarParteTema('variable', value)}
                  mode="outlined"
                  dense
                  style={styles.builderInput}
                />
                <TextInput
                  label="Población"
                  placeholder="Ej. adolescentes de secundaria"
                  value={partesTema.poblacion}
                  onChangeText={(value) => actualizarParteTema('poblacion', value)}
                  mode="outlined"
                  dense
                  style={styles.builderInput}
                />
                <TextInput
                  label="Contexto o lugar"
                  placeholder="Ej. colegios de Cochabamba"
                  value={partesTema.contexto}
                  onChangeText={(value) => actualizarParteTema('contexto', value)}
                  mode="outlined"
                  dense
                  style={styles.builderInput}
                />
                <TextInput
                  label="Periodo de estudio"
                  placeholder="Ej. la gestión 2025"
                  value={partesTema.tiempo}
                  onChangeText={(value) => actualizarParteTema('tiempo', value)}
                  mode="outlined"
                  dense
                  style={styles.builderInput}
                />
                <PrimaryButton
                  onPress={armarTemaDesdePartes}
                  icon="auto-fix"
                >
                  Armar título editable
                </PrimaryButton>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={cargarEjemplo}
              style={styles.exampleCard}
            >
              <View style={styles.exampleIcon}>
                <Feather name="zap" size={17} color={colors.xpDark} />
              </View>
              <View style={styles.exampleCopy}>
                <Text style={styles.exampleTitle}>¿Necesitas una idea?</Text>
                <Text style={styles.exampleHint}>Cargar un ejemplo editable</Text>
              </View>
              <Feather name="arrow-right" size={17} color={colors.secondaryDark} />
            </Pressable>

            <View style={styles.inputHeading}>
              <Text style={styles.inputLabel}>Tu título de investigación</Text>
              <Text style={styles.inputOptional}>editable</Text>
            </View>
            <TextInput
              label="Escribe tu tema aquí"
              accessibilityLabel="Tema de investigación"
              value={tema}
              onChangeText={(texto) => {
                setTema(texto);
                setError('');
                setErrorValidacion(null);
              }}
              mode="outlined"
              multiline
              numberOfLines={4}
              maxLength={300}
              placeholder="Ej. Impacto del uso de redes sociales en..."
              contentStyle={styles.inputContent}
              style={styles.input}
            />

            <View style={styles.inputMetaRow}>
              <Text style={styles.inputCounter}>
                {longitudTema}/300 caracteres
              </Text>
              <Text style={styles.inputCounter}>
                {palabrasSignificativas.length}/4 palabras significativas
              </Text>
            </View>
            <View
              style={styles.characterTrack}
              accessibilityLabel={`${longitudTema} de 300 caracteres`}
            >
              <View
                style={[
                  styles.characterProgress,
                  { width: progresoCaracteres },
                ]}
              />
            </View>

            <View style={styles.requirementsRow}>
              <View
                style={[
                  styles.requirementPill,
                  cumpleMinimoCaracteres && styles.requirementPillMet,
                ]}
              >
                <Feather
                  name={cumpleMinimoCaracteres ? 'check-circle' : 'circle'}
                  size={14}
                  color={
                    cumpleMinimoCaracteres
                      ? colors.secondaryDark
                      : colors.textLight
                  }
                />
                <Text style={styles.requirementText}>20+ caracteres</Text>
              </View>
              <View
                style={[
                  styles.requirementPill,
                  cumpleMinimoPalabras && styles.requirementPillMet,
                ]}
              >
                <Feather
                  name={cumpleMinimoPalabras ? 'check-circle' : 'circle'}
                  size={14}
                  color={
                    cumpleMinimoPalabras
                      ? colors.secondaryDark
                      : colors.textLight
                  }
                />
                <Text style={styles.requirementText}>4+ palabras</Text>
              </View>
              <View
                style={[
                  styles.requirementPill,
                  cumpleMaximoCaracteres && styles.requirementPillMet,
                ]}
              >
                <Feather
                  name={cumpleMaximoCaracteres ? 'check-circle' : 'alert-circle'}
                  size={14}
                  color={
                    cumpleMaximoCaracteres ? colors.secondaryDark : colors.error
                  }
                />
                <Text style={styles.requirementText}>Máximo 300</Text>
              </View>
            </View>

        {error ? (
          <View style={styles.simpleError} accessibilityLiveRegion="polite">
            <Feather name="alert-triangle" size={17} color={colors.error} />
            <Text style={styles.simpleErrorText}>{error}</Text>
          </View>
        ) : null}

        {errorValidacion ? (
          <View
            style={styles.validationCard}
            accessibilityLiveRegion="polite"
            accessibilityRole="summary"
          >
            <View style={styles.validationHeading}>
              <Feather name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.validationTitle}>
                {compatibilidad?.conModalidad === false
                  ? 'El tema no encaja con esta modalidad'
                  : elementosFaltantes.length > 0
                    ? 'Completa algunos elementos del tema'
                    : 'El tema necesita ajustes'}
              </Text>
            </View>

            {!!errorValidacion.razon && (
              <Text style={styles.validationBody}>{errorValidacion.razon}</Text>
            )}
            {!!errorValidacion.explicacion && (
              <Text style={styles.validationBody}>
                {errorValidacion.explicacion}
              </Text>
            )}
            {compatibilidad?.conModalidad === false &&
              !!compatibilidad.comentario && (
                <Text style={styles.validationBody}>
                  {compatibilidad.comentario}
                </Text>
              )}

            {elementosPresentes.length > 0 && (
              <View style={styles.elementGroup}>
                <Text style={styles.elementLabel}>Elementos presentes</Text>
                <View style={styles.elementTags}>
                  {elementosPresentes.map((elemento, index) => (
                    <Text key={`${elemento}-${index}`} style={styles.presentTag}>
                      {elemento}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {elementosFaltantes.length > 0 && (
              <View style={styles.elementGroup}>
                <Text style={styles.elementLabel}>Elementos por agregar</Text>
                <View style={styles.elementTags}>
                  {elementosFaltantes.map((elemento, index) => (
                    <Text key={`${elemento}-${index}`} style={styles.missingTag}>
                      {elemento}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {!!errorValidacion.sugerencia && (
              <View style={styles.suggestionBlock}>
                <Text style={styles.suggestionLabel}>Título sugerido</Text>
                <Text style={styles.suggestionText}>
                  {errorValidacion.sugerencia}
                </Text>
                <Text style={styles.suggestionUseHint}>
                  Copia el título en el campo para revisarlo antes de enviarlo.
                </Text>
                <PrimaryButton
                  onPress={usarTemaSugerido}
                  disabled={guardandoTema}
                >
                  Usar este tema
                </PrimaryButton>
              </View>
            )}

            {modalidadSugerida && (
              <Pressable
                accessibilityRole="button"
                disabled={guardandoTema}
                onPress={() => probarModalidadSugerida(modalidadSugerida)}
                style={[
                  styles.alternateModalityButton,
                  guardandoTema && styles.disabledButton,
                ]}
              >
                <Feather name="repeat" size={17} color={colors.secondaryDark} />
                <Text style={styles.alternateModalityText}>
                  {guardandoTema
                    ? 'Probando modalidad…'
                    : `Probar en ${modalidadSugerida.nombre}`}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        <PrimaryButton
          onPress={guardarTema}
          loading={guardandoTema}
          disabled={
            guardandoTema ||
            !cumpleMinimoCaracteres ||
            !cumpleMaximoCaracteres ||
            !cumpleMinimoPalabras
          }
          icon="arrow-right"
        >
          Guardar tema y comenzar
        </PrimaryButton>
        <Text style={styles.submitHint}>
          La IA revisará los elementos y la modalidad. La carrera solo genera
          una recomendación.
        </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a mis mundos"
          hitSlop={12}
          onPress={() => router.replace('/(estudiante)/lobby')}
          style={styles.screenBackButton}
        >
          <Feather name="arrow-left" size={18} color={colors.textSecondary} />
          <Text style={styles.introBackText}>Volver</Text>
        </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Etapa MAPA
  return (
    <View style={styles.mapaContainer}>

      <RoundedNavigationHeader>
        <View style={styles.headerIzquierda}>
          <Text variant="titleLarge" numberOfLines={1} style={styles.headerTitle}>
            {modalidadActual?.nombre?.toUpperCase() ?? 'TESIS'}
          </Text>

          
          <View style={styles.stats}>
            <Text variant="bodyMedium" style={styles.statText}>
              ⚡ {xpTotal} XP
            </Text>
            <Text variant="bodyMedium" style={styles.statText}>
              📊 {porcentaje}%
            </Text>
          </View>
        </View>
        <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
      </RoundedNavigationHeader>

      {avisoCarrera && (
        <View
          style={styles.careerNotice}
          accessibilityLiveRegion="polite"
          accessibilityRole="summary"
        >
          <View style={styles.careerNoticeHeading}>
            <Feather name="info" size={19} color={colors.xpDark} />
            <Text style={styles.careerNoticeTitle}>Tema guardado</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar aviso"
              hitSlop={10}
              onPress={() => setAvisoCarrera(null)}
              style={styles.noticeClose}
            >
              <Feather name="x" size={19} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.careerNoticeBody}>
            {avisoCarrera.advertencia ??
              'El tema se guardó correctamente. Esta sugerencia no bloquea tu avance.'}
          </Text>
          {avisoCarrera.sugerencia && (
            <Text style={styles.careerSuggestion}>
              Enfoque sugerido para tu carrera: {avisoCarrera.sugerencia}
            </Text>
          )}
        </View>
      )}

      <MissionPathMap
        niveles={niveles}
        modalidadId={modalidadActual?.id}
        refreshing={refrescando}
        onRefresh={refrescarMapa}
      />
      <View
        style={[
          styles.backFooter,
          {
            paddingBottom: Math.max(insets.bottom + 10, 10),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a mis mundos"
          hitSlop={12}
          onPress={() => router.replace('/(estudiante)/lobby')}
          style={styles.backBoton}
        >
          <Feather name="arrow-left" size={18} color={colors.textPrimary} />
          <Text style={styles.backTexto}>Volver</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
  },
  screenFrame: {
    width: '100%',
    maxWidth: 620,
    gap: 14,
  },
  introHero: {
    padding: 20,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 22,
    backgroundColor: colors.primary,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  heroIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  heroEyebrow: {
    color: colors.textInverse,
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroMode: {
    color: colors.paperLight,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFF1C7',
  },
  heroBadgeText: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 12,
  },
  formCard: {
    gap: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 22,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 2,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#D6E9DE',
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 18,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  elementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  elementCard: {
    width: '48%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paperLight,
  },
  elementCardCopy: {
    flex: 1,
    gap: 1,
  },
  elementCardTitle: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 13,
  },
  elementCardHint: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.backgroundAlt,
  },
  modeOption: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeOptionSelected: {
    backgroundColor: colors.primary,
  },
  modeOptionText: {
    color: colors.textSecondary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
  modeOptionTextSelected: {
    color: colors.textInverse,
  },
  builderCard: {
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.paperLight,
  },
  builderIntro: {
    gap: 3,
    marginBottom: 2,
  },
  builderTitle: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 16,
  },
  builderHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  builderInput: {
    backgroundColor: colors.card,
  },
  exampleCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: '#FFF1C7',
  },
  exampleIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#F6E2A7',
  },
  exampleCopy: {
    flex: 1,
    gap: 2,
  },
  exampleTitle: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
  exampleHint: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  inputHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -7,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 15,
  },
  inputOptional: {
    color: colors.textLight,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginTop: 17,
    marginBottom: 5,
    color: colors.textInverse,
    fontFamily: 'LilitaOne',
    fontSize: 27,
    lineHeight: 32,
  },
  subtitle: {
    marginBottom: 0,
    color: colors.textInverse,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.94,
  },
  hint: {
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  modalidades: {
    gap: 16,
  },
  modalidadCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalidadCardPressed: {
    backgroundColor: colors.primaryLight,
  },
  modalidadTitle: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.card,
    marginBottom: 0,
  },
  inputContent: {
    minHeight: 112,
    fontSize: 16,
    lineHeight: 23,
  },
  inputMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  characterTrack: {
    height: 7,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.progressBackground,
  },
  characterProgress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  inputCounter: {
    color: colors.textLight,
    fontSize: 11,
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  requirementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.backgroundAlt,
  },
  requirementPillMet: {
    borderColor: colors.secondaryLight,
    backgroundColor: '#D6E9DE',
  },
  requirementText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  simpleError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E4A397',
    borderRadius: 11,
    backgroundColor: '#FCE7E1',
  },
  simpleErrorText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19,
  },
  submitHint: {
    marginTop: -6,
    color: colors.textLight,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  validationCard: {
    marginBottom: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: 14,
    backgroundColor: colors.card,
    gap: 10,
  },
  validationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  validationTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 18,
  },
  validationBody: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  elementGroup: {
    gap: 6,
  },
  elementLabel: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
  elementTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  presentTag: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#D6E9DE',
    color: colors.secondaryDark,
    fontSize: 12,
  },
  missingTag: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F6D8CF',
    color: colors.primaryDark,
    fontSize: 12,
  },
  suggestionBlock: {
    gap: 8,
  },
  suggestionLabel: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  suggestionUseHint: {
    color: colors.textLight,
    fontSize: 12,
  },
  alternateModalityButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
  },
  alternateModalityText: {
    color: colors.secondaryDark,
    fontFamily: 'LilitaOne',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  careerNotice: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    backgroundColor: '#FFF1C7',
  },
  careerNoticeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  careerNoticeTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 16,
  },
  noticeClose: {
    padding: 2,
  },
  careerNoticeBody: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  careerSuggestion: {
    marginTop: 7,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  mapaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    color: colors.textInverse,
  },
  headerIzquierda: {
    flex: 1,
    minWidth: 0,
  },
  backBoton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
  },
  backFooter: {
    paddingTop: 4,
    paddingHorizontal: 22,
    backgroundColor: colors.background,
  },
  backTexto: {
    color: colors.textPrimary,
    fontFamily: 'LilitaOne',
    fontSize: 15,
  },
  screenBackButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
    paddingVertical: 8,
  },
  introBackText: {
    color: colors.textSecondary,
    fontFamily: 'LilitaOne',
    fontSize: 14,
  },
});