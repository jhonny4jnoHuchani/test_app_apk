import { Feather } from '@expo/vector-icons';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const HEADER_CONTENT_HEIGHT = 80;

interface RoundedNavigationHeaderProps {
  children: ReactNode;
}

export function RoundedNavigationHeader({
  children,
}: RoundedNavigationHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          height: HEADER_CONTENT_HEIGHT + insets.top,
          paddingTop: insets.top,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function StackScreenNavigationHeader({
  back,
  navigation,
  options,
  route,
}: NativeStackHeaderProps) {
  const title =
    typeof options.headerTitle === 'string'
      ? options.headerTitle
      : options.title ?? route.name;

  return (
    <RoundedNavigationHeader>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={colors.textInverse} />
        </Pressable>
      )}
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </RoundedNavigationHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
  },
  backButton: {
    width: 44,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.textInverse,
    fontFamily: 'LilitaOne',
    fontSize: 21,
    fontWeight: '400',
  },
});