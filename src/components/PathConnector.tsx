import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export interface PuntoCamino {
  x: number;
  y: number;
  completado: boolean;
}

interface Props {
  puntos: PuntoCamino[];
  width: number;
  height: number;
  accent: string;
}

export function PathConnector({ puntos, width, height, accent }: Props) {
  const dots: { x: number; y: number; key: string; color: string }[] = [];

  puntos.slice(0, -1).forEach((point, index) => {
    const next = puntos[index + 1];
    const half = (next.y - point.y) / 2;
    const controlOne = { x: point.x, y: point.y + half };
    const controlTwo = { x: next.x, y: next.y - half };
    const color = point.completado ? accent : colors.borderDark;

    for (let step = 1; step < 18; step += 1) {
      const t = step / 18;
      const inverse = 1 - t;
      const x =
        inverse ** 3 * point.x +
        3 * inverse ** 2 * t * controlOne.x +
        3 * inverse * t ** 2 * controlTwo.x +
        t ** 3 * next.x;
      const y =
        inverse ** 3 * point.y +
        3 * inverse ** 2 * t * controlOne.y +
        3 * inverse * t ** 2 * controlTwo.y +
        t ** 3 * next.y;
      dots.push({ x, y, key: `${index}-${step}`, color });
    }
  });

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { width, height }]}
    >
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={[
            styles.dot,
            { left: dot.x - 3, top: dot.y - 3, backgroundColor: dot.color },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});