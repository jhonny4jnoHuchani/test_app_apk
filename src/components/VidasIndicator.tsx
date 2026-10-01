import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  vidas: number;
  vidasIniciales: number;
}

interface HeartLifeProps {
  active: boolean;
  pulse: boolean;
}

function HeartLife({ active, pulse }: HeartLifeProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.stopAnimation();
    scale.setValue(1);

    if (!active || !pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 240,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [active, pulse, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={21}
        color={active ? colors.heart : colors.heartEmpty}
        accessibilityLabel={active ? 'Vida disponible' : 'Vida perdida'}
      />
    </Animated.View>
  );
}

export function VidasIndicator({ vidas, vidasIniciales }: Props) {
  const pocasVidas = vidas === 1;

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`${vidas} de ${vidasIniciales} vidas`}
    >
      {Array.from({ length: vidasIniciales }).map((_, i) => (
        <HeartLife
          key={i}
          active={i < vidas}
          pulse={pocasVidas && i < vidas}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});