import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  EstudianteEnGrupo,
  GrupoDetalle,
  obtenerDetalleGrupo,
} from '../../../api/grupos.api';
import {
  MisionFallada,
  RankingEstudiante,
  ResumenGrupo,
  obtenerMisionesFalladas,
  obtenerRankingGrupo,
  obtenerResumenGrupo,
} from '../../../api/reportes.api';
import { RoundedNavigationHeader } from '../../../components/RoundedNavigationHeader';
import { colors } from '../../../theme/colors';

type Tab = 'estudiantes' | 'ranking' | 'resumen' | 'misiones';

export default function GrupoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tab, setTab] = useState<Tab>('estudiantes');
  const [detalle, setDetalle] = useState<GrupoDetalle | null>(null);
  const [ranking, setRanking] = useState<RankingEstudiante[]>([]);
  const [resumen, setResumen] = useState<ResumenGrupo | null>(null);
  const [misionesFalladas, setMisionesFalladas] = useState<MisionFallada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (id) cargar();
    }, [id]),
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');

      const [d, r, res, m] = await Promise.all([
        obtenerDetalleGrupo(id!),
        obtenerRankingGrupo(id!),
        obtenerResumenGrupo(id!),
        obtenerMisionesFalladas(id!),
      ]);

      setDetalle(d);
      setRanking(r.ranking);
      setResumen(res);
      setMisionesFalladas(m.misiones);
    } catch (err: any) {
      setError('No se pudo cargar el grupo');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <GrupoHeader nombre="Detalle del grupo" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !detalle) {
    return (
      <View style={styles.container}>
        <GrupoHeader nombre="Detalle del grupo" />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.error}>{error || 'Grupo no encontrado'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GrupoHeader
        nombre={detalle.grupo.nombre}
        codigoAcceso={detalle.grupo.codigoAcceso}
        activo={detalle.grupo.activo}
      />

      {/* TABS NAVEGACIÓN */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TabBtn
            label="Estudiantes"
            icon="people-outline"
            activo={tab === 'estudiantes'}
            onPress={() => setTab('estudiantes')}
          />
          <TabBtn
            label="Ranking"
            icon="trophy-outline"
            activo={tab === 'ranking'}
            onPress={() => setTab('ranking')}
          />
          <TabBtn
            label="Resumen"
            icon="bar-chart-outline"
            activo={tab === 'resumen'}
            onPress={() => setTab('resumen')}
          />
          <TabBtn
            label="Fallos"
            icon="warning-outline"
            activo={tab === 'misiones'}
            onPress={() => setTab('misiones')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* TAB ESTUDIANTES */}
        {tab === 'estudiantes' && (
          <>
            <View style={styles.seccionHeader}>
              <Text variant="titleMedium" style={styles.seccion}>
                Estudiantes
              </Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{detalle.estudiantes.length}</Text>
              </View>
            </View>

            {detalle.estudiantes.length === 0 && (
              <View style={styles.vacioContainer}>
                <Ionicons name="people-circle-outline" size={48} color={colors.textLight} />
                <Text style={styles.vacio}>
                  Aún no hay estudiantes en este grupo.{'\n'}
                  Comparte el código <Text style={styles.codeHighlight}>{detalle.grupo.codigoAcceso}</Text>
                </Text>
              </View>
            )}

            {detalle.estudiantes.map((est) => (
              <EstudianteCard
                key={est.id}
                estudiante={est}
                onPress={() =>
                  router.push(`/(docente)/estudiante/${est.id}` as any)
                }
              />
            ))}
          </>
        )}

        {/* TAB RANKING */}
        {tab === 'ranking' && (
          <>
            <Text variant="titleMedium" style={styles.seccion}>
              Ranking por XP
            </Text>

            {ranking.length === 0 && (
              <View style={styles.vacioContainer}>
                <Ionicons name="ribbon-outline" size={48} color={colors.textLight} />
                <Text style={styles.vacio}>Sin datos de ranking todavía</Text>
              </View>
            )}

            {ranking.map((est, idx) => (
              <Card key={est.id} style={[styles.card, styles.rankCard]}>
                <Card.Content style={styles.rankContent}>
                  <View style={styles.rankPos}>
                    {idx === 0 ? (
                      <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                    ) : idx === 1 ? (
                      <MaterialCommunityIcons name="trophy" size={24} color="#C0C0C0" />
                    ) : idx === 2 ? (
                      <MaterialCommunityIcons name="trophy" size={24} color="#CD7F32" />
                    ) : (
                      <Text style={styles.rankPosTexto}>#{idx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.rankInfo}>
                    <Text variant="titleSmall" style={styles.rankNombre}>
                      {est.nombre}
                    </Text>
                    <Text variant="bodySmall" style={styles.rankEmail}>
                      {est.email}
                    </Text>
                  </View>
                  <View style={styles.rankStats}>
                    <View style={styles.xpBadge}>
                      <Ionicons name="flash" size={12} color={colors.xp} />
                      <Text variant="titleSmall" style={styles.rankXP}>
                        {est.xpTotal}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.rankPct}>
                      {est.porcentajeMax}%
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* TAB RESUMEN */}
        {tab === 'resumen' && resumen && (
          <>
            <Text variant="titleMedium" style={styles.seccion}>
              Resumen del grupo
            </Text>

            <View style={styles.resumenGrid}>
              <ResumenBox
                icon="people-outline"
                label="Estudiantes"
                valor={String(resumen.totalEstudiantes)}
              />
              <ResumenBox
                icon="flash-outline"
                label="XP promedio"
                valor={String(resumen.xpPromedio)}
              />
              <ResumenBox
                icon="pie-chart-outline"
                label="% promedio"
                valor={`${resumen.porcentajePromedio}%`}
              />
              <ResumenBox
                icon="time-outline"
                label="Activos 7d"
                valor={String(resumen.estudiantesActivosUltimos7Dias)}
              />
            </View>

            <Text variant="titleMedium" style={[styles.seccion, { marginTop: 12 }]}>
              Competencias débiles del grupo
            </Text>

            {resumen.competenciasDebiles.length === 0 && (
              <View style={styles.vacioContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                <Text style={styles.vacio}>Sin datos de fallos todavía</Text>
              </View>
            )}

            {resumen.competenciasDebiles.map((c, i) => (
              <Card key={i} style={styles.card}>
                <Card.Content style={styles.compContent}>
                  <View style={styles.compInfo}>
                    <Text variant="titleSmall" style={styles.compNombre}>
                      {c.competencia}
                    </Text>
                    <Text variant="bodySmall" style={styles.compFallos}>
                      {c.fallos} fallos registrados
                    </Text>
                  </View>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* TAB MISIONES FALLADAS */}
        {tab === 'misiones' && (
          <>
            <Text variant="titleMedium" style={styles.seccion}>
              Misiones donde más fallan
            </Text>

            {misionesFalladas.length === 0 && (
              <View style={styles.vacioContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.success} />
                <Text style={styles.vacio}>Sin misiones falladas aún</Text>
              </View>
            )}

            {misionesFalladas.map((m) => (
              <Card key={m.misionId} style={styles.card}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.misionTitulo}>
                    {m.titulo}
                  </Text>
                  {m.competencia && (
                    <Text variant="bodySmall" style={styles.misionComp}>
                      {m.competencia}
                    </Text>
                  )}
                  <View style={styles.misionStats}>
                    <View style={[styles.statItem, { backgroundColor: colors.error + '15' }]}>
                      <Ionicons name="close-circle-outline" size={14} color={colors.error} />
                      <Text style={[styles.misionStat, { color: colors.error }]}>
                        {m.incorrectos}
                      </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.warning + '15' }]}>
                      <Ionicons name="help-circle-outline" size={14} color={colors.warning} />
                      <Text style={[styles.misionStat, { color: colors.warning }]}>
                        {m.parciales}
                      </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.success + '15' }]}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                      <Text style={[styles.misionStat, { color: colors.success }]}>
                        {m.correctos}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function GrupoHeader({
  nombre,
  codigoAcceso,
  activo = true,
}: {
  nombre: string;
  codigoAcceso?: string;
  activo?: boolean;
}) {
  return (
    <RoundedNavigationHeader>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver a mis grupos"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
      </Pressable>
      <View style={styles.headerContenido}>
        <Text numberOfLines={1} style={styles.headerTitulo}>
          {nombre}
        </Text>
        {(codigoAcceso || !activo) && (
          <View style={styles.headerInfo}>
            {codigoAcceso && (
              <View style={styles.chipCodigo}>
                <Ionicons name="key-outline" size={13} color={colors.textInverse} />
                <Text variant="labelSmall" style={styles.headerCodigo}>
                  {codigoAcceso}
                </Text>
              </View>
            )}
            {!activo && (
              <View style={styles.badgeInactivo}>
                <Text style={styles.headerInactivo}>Inactivo</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </RoundedNavigationHeader>
  );
}

function TabBtn({
  label,
  icon,
  activo,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, activo && styles.tabBtnActivo]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={activo ? colors.primary : colors.textSecondary}
      />
      <Text
        variant="labelSmall"
        style={[styles.tabTexto, activo && styles.tabTextoActivo]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EstudianteCard({
  estudiante,
  onPress,
}: {
  estudiante: EstudianteEnGrupo;
  onPress: () => void;
}) {
  const inicial = estudiante.nombre ? estudiante.nombre.charAt(0).toUpperCase() : '?';

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content style={styles.estContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{inicial}</Text>
          </View>
          <View style={styles.estInfo}>
            <Text variant="titleSmall" style={styles.estNombre}>
              {estudiante.nombre}
            </Text>
            <Text variant="bodySmall" style={styles.estEmail}>
              {estudiante.email}
            </Text>
            {(estudiante.carrera || estudiante.universidad) && (
              <Text variant="bodySmall" style={styles.estExtra}>
                {[estudiante.carrera, estudiante.universidad]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </Card.Content>
      </Card>
    </Pressable>
  );
}

function ResumenBox({
  icon,
  label,
  valor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
}) {
  return (
    <View style={styles.resumenBox}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginBottom: 4 }} />
      <Text variant="headlineSmall" style={styles.resumenValor}>
        {valor}
      </Text>
      <Text variant="bodySmall" style={styles.resumenLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    // justify: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
    gap: 8,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  backButton: {
    width: 44,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContenido: {
    flex: 1,
    minWidth: 0,
  },
  headerTitulo: {
    color: colors.textInverse,
    fontFamily: 'LilitaOne',
    fontSize: 20,
    fontWeight: '400',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  chipCodigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  headerCodigo: {
    color: colors.textInverse,
    letterSpacing: 1.2,
    fontWeight: 'bold',
  },
  badgeInactivo: {
    backgroundColor: colors.textLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerInactivo: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tabsContainer: {
    backgroundColor: colors.card,
    elevation: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActivo: {
    borderBottomColor: colors.primary,
  },
  tabTexto: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextoActivo: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  badgeCount: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  vacioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  vacio: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 0,
  },
  estContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  estInfo: {
    flex: 1,
  },
  estNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  estEmail: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  estExtra: {
    color: colors.textLight,
    marginTop: 3,
  },
  rankCard: {
    marginBottom: 2,
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankPos: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPosTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  rankInfo: {
    flex: 1,
  },
  rankNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  rankEmail: {
    color: colors.textLight,
    fontSize: 11,
  },
  rankStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankXP: {
    color: colors.xp,
    fontWeight: 'bold',
  },
  rankPct: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  resumenBox: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumenValor: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  resumenLabel: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  compContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compInfo: {
    flex: 1,
  },
  compNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  compFallos: {
    color: colors.error,
    marginTop: 2,
    fontWeight: '500',
  },
  misionTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  misionComp: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  misionStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  misionStat: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});