import { Stack } from 'expo-router';

export default function EstudianteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#C93B32' },
        headerTintColor: '#FFF8E8',
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Stack.Screen name="lobby" options={{ headerShown: false }} />
      <Stack.Screen name="mapa" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="mision/[id]" options={{ title: 'Misión' }} />
      <Stack.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="historial/[id]" options={{ title: 'Historial' }} />
      <Stack.Screen name="recomendaciones" options={{ title: 'Mis Recomendaciones' }} />
      <Stack.Screen name="unirse-grupo" options={{ title: 'Unirse a Grupo' }} />
      <Stack.Screen name="boss/[nivelId]" options={{ headerShown: false }} />
    </Stack>
  );
}