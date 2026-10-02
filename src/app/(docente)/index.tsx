import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageBackground, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Grupo, listarMisGruposDocente } from '../../api/grupos.api';
import { HeaderLogout } from '../../components/HeaderLogout';
import { GameCard } from '../../components/GameCard';
import { RoundedNavigationHeader } from '../../components/RoundedNavigationHeader';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  console.log('Grupos cargados:', usuario); // Log para verificar los grupos cargados

  return (
    <ImageBackground
      source={require('../../../assets/items/image.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <RoundedNavigationHeader>
          <View style={styles.headerIzquierda}>
            <Text variant="headlineSmall" numberOfLines={1}  style={[styles.headerTitle, { textTransform: 'uppercase' }]}>
              {usuario?.rol}
            </Text>
            <Text variant="bodySmall" numberOfLines={1} style={[styles.headerSubtitle, { textTransform: 'uppercase' }]}>
              {usuario?.nombre}
            </Text>
          </View>
          <HeaderLogout titulo="" mostrarPerfil mostrarNotificaciones />
        </RoundedNavigationHeader>

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
          <GameCard
            accent={colors.primary}
            entradaDelay={0}
            onPress={() => router.push('/(docente)/crear-grupo')}
            contentStyle={styles.botonCrear}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.textInverse} />
            <Text variant="titleMedium" style={styles.botonCrearTexto}>
              Crear nuevo grupo
            </Text>
          </GameCard>

          <GameCard
            accent={colors.secondaryDark}
            entradaDelay={80}
            onPress={() => router.push('/(docente)/recomendaciones')}
            contentStyle={styles.botonSecundario}
          >
            <MaterialCommunityIcons name="star-box-outline" size={22} color={colors.secondaryDark} />
            <Text variant="titleMedium" style={styles.botonSecundarioTexto}>
              Mis recomendaciones
            </Text>
          </GameCard>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.seccionHeader}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.secondaryDark} />
            <Text variant="titleSmall" style={styles.seccion}>
              Mis grupos
            </Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{grupos.length}</Text>
            </View>
          </View>

          {grupos.length === 0 && (
            <View style={styles.vacioCard}>
              <MaterialCommunityIcons name="account-group-outline" size={36} color={colors.secondaryDark} />
              <Text style={styles.vacio}>
                Aún no tienes grupos registrados. ¡Crea el primero para comenzar!
              </Text>
            </View>
          )}

          {grupos.map((grupo, index) => (
            <GameCard
              key={grupo.id}
              accent={grupo.activo ? colors.primary : colors.textLight}
              entradaDelay={index * 60}
              onPress={() => router.push(`/(docente)/grupo/${grupo.id}`)}
              contentStyle={[
                styles.card,
                !grupo.activo && styles.cardInactivo,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitulo}>
                  {grupo.nombre}
                </Text>
                {!grupo.activo && (
                  <View style={styles.badgeInactivo}>
                    <Text style={styles.badgeInactivoTexto}>Inactivo</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.codigoHeader}>
                  <MaterialCommunityIcons name="key-outline" size={16} color={colors.secondaryDark} />
                  <Text variant="bodySmall" style={styles.codigoLabel}>
                    Código de acceso:
                  </Text>
                </View>
                <View style={styles.codigoBadge}>
                  <Text style={styles.codigo}>{grupo.codigoAcceso}</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people-outline" size={16} color={colors.secondaryDark} />
                  <Text variant="bodySmall" style={styles.stat}>
                    {grupo.cantidadEstudiantes ?? 0} estudiantes
                  </Text>
                </View>

                {grupo.fechaExpiracion && (
                  <View style={styles.statItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text variant="bodySmall" style={styles.stat}>
                      Expira: {new Date(grupo.fechaExpiracion).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </GameCard>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
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
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(244, 232, 200, 0.15)',
  },
  /* CABECERA / NAVEGADOR EN FONDO ROJO */
  headerIzquierda: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: 'LilitaOne',
    color: '#FFFFFF', // Texto blanco sobre el fondo rojo
    fontSize: 22,
    flexShrink: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)', // Blanco translúcido para la subtítulo
    marginTop: 2,
    flexShrink: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  botonCrear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    minHeight: 60,
    paddingVertical: 14,
  },
  botonSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
    minHeight: 60,
    paddingVertical: 14,
  },
  botonCrearTexto: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  botonSecundarioTexto: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  seccion: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  badgeCount: {
    backgroundColor: colors.paperLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeCountText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  vacioCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondaryLight + '55',
    padding: 22,
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.secondaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 3,
  },
  vacio: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  cardInactivo: {
    opacity: 0.72,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cardTitulo: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  badgeInactivo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeInactivoTexto: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '12',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '26',
  },
  codigoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codigoLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  codigoBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codigo: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    fontSize: 15,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stat: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});