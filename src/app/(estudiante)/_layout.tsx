import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { studentPaperTheme } from '../../theme/paperTheme';
import { StackScreenNavigationHeader } from '../../components/RoundedNavigationHeader';

export default function EstudianteLayout() {
  return (
    <PaperProvider theme={studentPaperTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          header: (props:any) => <StackScreenNavigationHeader {...props} />,
          headerStyle: { backgroundColor: colors.primary },
          headerShadowVisible: false,
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontFamily: 'LilitaOne',
            fontSize: 21,
            fontWeight: '400',
          },
          headerBackTitleStyle: { fontFamily: 'Nunito' },
        }}
      >
        <Stack.Screen name="lobby" options={{ headerShown: false }} />
        <Stack.Screen name="mapa" options={{ headerShown: false }} />
        <Stack.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
        <Stack.Screen
          name="mision/[id]"
          options={{ title: 'Misión', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />
        <Stack.Screen name="historial/[id]" options={{ title: 'Historial' }} />
        <Stack.Screen name="recomendaciones" options={{ title: 'Mis Recomendaciones' }} />
        <Stack.Screen name="unirse-grupo" options={{ title: 'Unirse a Grupo' }} />
        <Stack.Screen name="boss/[nivelId]" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}