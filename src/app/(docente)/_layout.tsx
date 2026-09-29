import { Stack } from 'expo-router';

export default function DocenteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#C93B32' },
        headerTintColor: '#FFF8E8',
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="crear-grupo" options={{ title: 'Crear Grupo' }} />
      <Stack.Screen name="grupo/[id]" options={{ title: 'Detalle del Grupo' }} />
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