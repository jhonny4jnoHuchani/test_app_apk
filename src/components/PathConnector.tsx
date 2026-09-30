import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {puntos.slice(0, -1).map((p, i) => {
          const q = puntos[i + 1];
          const mitad = (q.y - p.y) / 2;
          // Curva en S: sale vertical de un nodo y llega vertical al siguiente
          const d = `M ${p.x} ${p.y} C ${p.x} ${p.y + mitad}, ${q.x} ${q.y - mitad}, ${q.x} ${q.y}`;

          return p.completado ? (
            <Path
              key={`t-${i}`}
              d={d}
              stroke={accent}
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <Path
              key={`t-${i}`}
              d={d}
              stroke={colors.borderDark}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray="0.1 16"
              fill="none"
            />
          );
        })}
      </Svg>
    </View>
  );
}