import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { Grupo, listarMisGruposDocente } from '../../api/grupos.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { RetroBackground } from '../../components/RetroBackground';

export default function DocenteHomeScreen() {
  const usuario = useAuthStore((state) => state.usuario);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await listarMisGruposDocente();
      setGrupos(data);
    } catch (err: any) {
      setError('No se pudieron cargar tus grupos');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RetroBackground>
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIzquierda}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Panel Docente
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {usuario?.email}
          </Text>
        </View>
        <HeaderLogout titulo="" mostrarNotificaciones />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargar}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* BOTÓN CREAR GRUPO */}
        <Pressable
          onPress={() => router.push('/(docente)/crear-grupo')}
          style={({ pressed }) => [
            styles.botonCrear,
            pressed && styles.botonCrearPressed,
          ]}
        >
          <Text style={styles.botonCrearIcono}>➕</Text>
          <Text variant="titleMedium" style={styles.botonCrearTexto}>
            Crear nuevo grupo
          </Text>
        </Pressable>


        <Pressable
          onPress={() => router.push('/(docente)/recomendaciones')}
          style={({ pressed }) => [
            styles.botonSecundario,
            pressed && styles.botonSecundarioPressed,
          ]}
        >
          <Text style={styles.botonCrearIcono}>📌</Text>
          <Text variant="titleMedium" style={styles.botonSecundarioTexto}>
            Mis recomendaciones
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* LISTA DE GRUPOS */}
        <Text variant="titleMedium" style={styles.seccion}>
          Mis grupos ({grupos.length})
        </Text>

        {grupos.length === 0 && (
          <Text style={styles.vacio}>
            Aún no tienes grupos. ¡Crea el primero!
          </Text>
        )}

        {grupos.map((grupo) => (
          <Pressable
            key={grupo.id}
            onPress={() => router.push(`/(docente)/grupo/${grupo.id}`)}
          >
            <Card style={[styles.card, !grupo.activo && styles.cardInactivo]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.cardTitulo}>
                    {grupo.nombre}
                  </Text>
                  {!grupo.activo && (
                    <Text style={styles.badgeInactivo}>Inactivo</Text>
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <Text variant="bodyMedium" style={styles.codigoLabel}>
                    Código:
                  </Text>
                  <Text variant="titleMedium" style={styles.codigo}>
                    {grupo.codigoAcceso}
                  </Text>
                </View>

                <View style={styles.cardStats}>
                  <Text variant="bodySmall" style={styles.stat}>
                    👥 {grupo.cantidadEstudiantes ?? 0} estudiantes
                  </Text>
                  {grupo.fechaExpiracion && (
                    <Text variant="bodySmall" style={styles.stat}>
                      📅 Expira:{' '}
                      {new Date(grupo.fechaExpiracion).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
    </RetroBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    backgroundColor: colors.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIzquierda: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textInverse,
    opacity: 0.85,
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  botonCrear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.red,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingVertical: 16,
  },
  botonCrearPressed: {
    opacity: 0.85,
  },
  botonCrearIcono: {
    fontSize: 20,
    color: colors.textInverse,
  },
  botonCrearTexto: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  seccion: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  vacio: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardInactivo: {
    borderLeftColor: colors.textLight,
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitulo: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  badgeInactivo: {
    backgroundColor: colors.textLight,
    color: colors.textInverse,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  codigoLabel: {
    color: colors.textSecondary,
  },
  codigo: {
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 3,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    color: colors.textSecondary,
  },

    botonSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.paperLight,
    borderRadius: 7,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  botonSecundarioPressed: {
    backgroundColor: colors.primaryLight,
  },
  botonSecundarioTexto: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});