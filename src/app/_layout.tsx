import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from '../theme/paperTheme';
import { AppExitGuard } from '../components/AppExitGuard';
import { colors } from '../theme/colors';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    LilitaOne: require('../../assets/fonts/LilitaOne-Regular.ttf'),
    Nunito: require('../../assets/fonts/NunitoSans-Regular.ttf'),
    NunitoBold: require('../../assets/fonts/NunitoSans-Bold.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setHidden(false);
      NavigationBar.setStyle('dark');
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AppExitGuard />
        <View style={styles.appFrame}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(estudiante)" />
            <Stack.Screen name="(docente)" />
          </Stack>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appFrame: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    flex: 1,
    maxWidth: 520,
    width: '100%',
  },
});