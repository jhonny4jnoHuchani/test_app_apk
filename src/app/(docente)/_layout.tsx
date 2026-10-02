import { Stack } from 'expo-router';
import { colors } from '../../theme/colors';
import { StackScreenNavigationHeader } from '../../components/RoundedNavigationHeader';

export default function DocenteLayout() {
  return (
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="crear-grupo" options={{ title: 'Crear Grupo' }} />
      <Stack.Screen name="grupo/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="estudiante/[id]" options={{ title: 'Estudiante' }} />
      <Stack.Screen
        name="asignar-recomendacion"
        options={{ title: 'Asignar Recomendación' }}
      />
      <Stack.Screen
        name="recomendaciones"
        options={{ title: 'Mis Recomendaciones' }}
      />
    </Stack>
  );
}