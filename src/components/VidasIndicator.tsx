import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  vidas: number;
  vidasIniciales: number;
}

export function VidasIndicator({ vidas, vidasIniciales }: Props) {
  const pocasVidas = vidas === 1;

  return (
    <View style={styles.container}>
      {Array.from({ length: vidasIniciales }).map((_, i) => (
        <MotiView
          key={i}
          from={{ scale: 1 }}
          animate={{
            scale: pocasVidas && i < vidas ? [1, 1.2, 1] : 1,
          }}
          transition={{
            type: 'timing',
            duration: 600,
            loop: pocasVidas && i < vidas,
          }}
        >
          <Text style={styles.corazon}>{i < vidas ? '❤️' : '🖤'}</Text>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  corazon: {
    fontSize: 20,
  },
});