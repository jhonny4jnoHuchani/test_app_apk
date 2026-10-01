import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Avatar, Text } from 'react-native-paper';
import { DatosPerfilCard } from '../../components/DatosPerfilCard';
import { PerfilResponse, obtenerPerfil } from '../../api/perfil.api';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

export default function PerfilDocenteScreen() {
  const usuario = useAuthStore((state) => state.usuario);
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerPerfil();
      setPerfil(data);
    } catch (error) {
      console.warn('No se pudieron actualizar los datos del perfil', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil]),
  );

  if (cargando && !perfil) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={cargarPerfil}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Avatar.Text
          size={82}
          label={(perfil?.nombre?.[0] ?? usuario?.nombre?.[0] ?? 'D').toUpperCase()}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {perfil?.nombre ?? usuario?.nombre ?? 'Docente'}
        </Text>
        <Text style={styles.subtitle}>Tu cuenta de docente</Text>
      </View>

      <DatosPerfilCard
        nombre={perfil?.nombre ?? usuario?.nombre}
        email={perfil?.email ?? usuario?.email}
        rol="docente"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 18,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  avatar: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  name: {
    marginTop: 3,
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 23,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.brown,
    fontFamily: 'Nunito',
    fontSize: 13,
  },
});