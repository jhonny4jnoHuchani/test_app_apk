import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !detalle) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Grupo no encontrado'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER DEL GRUPO */}
      <View style={styles.headerGrupo}>
        <Text variant="titleLarge" style={styles.headerTitulo}>
          {detalle.grupo.nombre}
        </Text>
        <View style={styles.headerInfo}>
          <Text variant="bodyMedium" style={styles.headerCodigo}>
            🔑 {detalle.grupo.codigoAcceso}
          </Text>
          {!detalle.grupo.activo && (
            <Text style={styles.headerInactivo}>Inactivo</Text>
          )}
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TabBtn
          label="Estudiantes"
          activo={tab === 'estudiantes'}
          onPress={() => setTab('estudiantes')}
        />
        <TabBtn
          label="Ranking"
          activo={tab === 'ranking'}
          onPress={() => setTab('ranking')}
        />
        <TabBtn
          label="Resumen"
          activo={tab === 'resumen'}
          onPress={() => setTab('resumen')}
        />
        <TabBtn
          label="Fallos"
          activo={tab === 'misiones'}
          onPress={() => setTab('misiones')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* TAB ESTUDIANTES */}
        {tab === 'estudiantes' && (
          <>
            <Text variant="titleMedium" style={styles.seccion}>
              Estudiantes ({detalle.estudiantes.length})
            </Text>

            {detalle.estudiantes.length === 0 && (
              <Text style={styles.vacio}>
                Aún no hay estudiantes en este grupo.
                Comparte el código {detalle.grupo.codigoAcceso}.
              </Text>
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
              <Text style={styles.vacio}>Sin datos todavía</Text>
            )}

            {ranking.map((est, idx) => (
              <Card key={est.id} style={styles.rankCard}>
                <Card.Content style={styles.rankContent}>
                  <View style={styles.rankPos}>
                    <Text style={styles.rankPosTexto}>
                      {idx === 0
                        ? '🥇'
                        : idx === 1
                        ? '🥈'
                        : idx === 2
                        ? '🥉'
                        : `#${idx + 1}`}
                    </Text>
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
                    <Text variant="titleSmall" style={styles.rankXP}>
                      ⚡ {est.xpTotal}
                    </Text>
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
                label="Estudiantes"
                valor={String(resumen.totalEstudiantes)}
              />
              <ResumenBox
                label="XP promedio"
                valor={String(resumen.xpPromedio)}
              />
              <ResumenBox
                label="% promedio"
                valor={`${resumen.porcentajePromedio}%`}
              />
              <ResumenBox
                label="Activos 7d"
                valor={String(resumen.estudiantesActivosUltimos7Dias)}
              />
            </View>

            <Text variant="titleMedium" style={styles.seccion}>
              Competencias débiles del grupo
            </Text>

            {resumen.competenciasDebiles.length === 0 && (
              <Text style={styles.vacio}>
                Sin datos de fallos todavía
              </Text>
            )}

            {resumen.competenciasDebiles.map((c, i) => (
              <Card key={i} style={styles.card}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.compNombre}>
                    {c.competencia}
                  </Text>
                  <Text variant="bodySmall" style={styles.compFallos}>
                    {c.fallos} fallos registrados
                  </Text>
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
              <Text style={styles.vacio}>
                Sin datos de fallos todavía
              </Text>
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
                    <Text style={[styles.misionStat, { color: colors.error }]}>
                      ❌ {m.incorrectos}
                    </Text>
                    <Text style={[styles.misionStat, { color: colors.warning }]}>
                      💡 {m.parciales}
                    </Text>
                    <Text style={[styles.misionStat, { color: colors.success }]}>
                      ✅ {m.correctos}
                    </Text>
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

function TabBtn({
  label,
  activo,
  onPress,
}: {
  label: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, activo && styles.tabBtnActivo]}
    >
      <Text
        variant="bodySmall"
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
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
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
        </Card.Content>
      </Card>
    </Pressable>
  );
}

function ResumenBox({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.resumenBox}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  headerGrupo: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  headerTitulo: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  headerCodigo: {
    color: colors.textInverse,
    letterSpacing: 2,
  },
  headerInactivo: {
    color: colors.textInverse,
    backgroundColor: colors.textLight,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
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
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  vacio: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
  },
  estNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  estEmail: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  estExtra: {
    color: colors.textLight,
    marginTop: 4,
  },
  rankCard: {
    backgroundColor: colors.card,
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankPos: {
    width: 40,
    alignItems: 'center',
  },
  rankPosTexto: {
    fontSize: 22,
    fontWeight: 'bold',
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
  },
  rankXP: {
    color: colors.xp,
    fontWeight: 'bold',
  },
  rankPct: {
    color: colors.textSecondary,
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
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
    marginTop: 4,
  },
  compNombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  compFallos: {
    color: colors.error,
    marginTop: 4,
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
    gap: 16,
    marginTop: 8,
  },
  misionStat: {
    fontWeight: 'bold',
  },
});