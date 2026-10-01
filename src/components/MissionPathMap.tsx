import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Nivel } from '../api/juego.api';
import { colors } from '../theme/colors';
import { LevelNode, NODE_SIZE_BOSS } from './LevelNode';
import { PathConnector } from './PathConnector';

const ROW_HEIGHT = 148;
const TOP_PADDING = 52;

interface Props {
  niveles: Nivel[];
  modalidadId?: number;
  refreshing: boolean;
  onRefresh: () => void;
}

export function MissionPathMap({
  niveles,
  modalidadId,
  refreshing,
  onRefresh,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [mapWidth, setMapWidth] = useState(Math.min(screenWidth, 520));

  const labelWidth = Math.max(112, Math.min(148, mapWidth - 24));
  const amplitude = Math.min(mapWidth * 0.2, 78);
  const points = useMemo(
    () =>
      niveles.map((nivel, index) => ({
        x: mapWidth / 2 + amplitude * Math.sin((index * Math.PI) / 2),
        y: TOP_PADDING + NODE_SIZE_BOSS / 2 + index * ROW_HEIGHT,
        completado: nivel.completado,
      })),
    [amplitude, mapWidth, niveles],
  );
  const currentLevelId = niveles.find(
    (nivel) => !nivel.completado && !nivel.bloqueado,
  )?.id;
  const mapHeight =
    TOP_PADDING +
    NODE_SIZE_BOSS +
    Math.max(niveles.length - 1, 0) * ROW_HEIGHT +
    88;

  const openLevel = (nivel: Nivel) => {
    if (nivel.bloqueado) return;

    if (nivel.tipo === 'boss') {
      router.push(
        `/(estudiante)/boss/${nivel.id}?modalidadId=${modalidadId ?? ''}`,
      );
      return;
    }

    const nextMission =
      nivel.misiones.find((mision) => !mision.bloqueada && !mision.completada) ??
      nivel.misiones.find((mision) => !mision.bloqueada);
    if (nextMission) {
      router.push(
        `/(estudiante)/mision/${encodeURIComponent(nextMission.id)}?modalidadId=${modalidadId ?? ''}`,
      );
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View
        style={[styles.map, { height: mapHeight }]}
        onLayout={(event) => {
          const measuredWidth = event.nativeEvent.layout.width;
          if (measuredWidth > 0 && measuredWidth !== mapWidth) {
            setMapWidth(measuredWidth);
          }
        }}
      >
        <View pointerEvents="none" style={styles.cloudOne} />
        <View pointerEvents="none" style={styles.cloudTwo} />
        <PathConnector
          puntos={points}
          width={mapWidth}
          height={mapHeight}
          accent={colors.secondary}
        />
        {niveles.map((nivel, index) => (
          <LevelNode
            key={nivel.id}
            index={index}
            numero={nivel.numero}
            titulo={nivel.titulo}
            esBoss={nivel.tipo === 'boss'}
            completado={nivel.completado}
            bloqueado={nivel.bloqueado}
            esActual={nivel.id === currentLevelId}
            accent={colors.primary}
            x={points[index].x}
            y={points[index].y}
            labelWidth={labelWidth}
            onPress={() => openLevel(nivel)}
          />
        ))}
        {niveles.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>El mapa se está preparando</Text>
            <Text style={styles.emptyCopy}>
              Vuelve a intentarlo en un momento.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  map: {
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  cloudOne: {
    position: 'absolute',
    top: 34,
    left: -44,
    width: 132,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 248, 232, 0.42)',
  },
  cloudTwo: {
    position: 'absolute',
    top: 268,
    right: -48,
    width: 148,
    height: 48,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 248, 232, 0.38)',
  },
  empty: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    alignItems: 'center',
    padding: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 20,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: 6,
    color: colors.brown,
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
});