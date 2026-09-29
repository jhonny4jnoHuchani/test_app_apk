import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from '../theme/paperTheme';
import { AppExitGuard } from '../components/AppExitGuard';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AppExitGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(estudiante)" />
          <Stack.Screen name="(docente)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}