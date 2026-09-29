import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Insignia } from '../api/insignias.api';
import { colors } from '../theme/colors';

interface Props {
  insignia: Insignia;
}

export function InsigniaCard({ insignia }: Props) {
  return (
    <Card
      style={[
        styles.card,
        !insignia.obtenida && styles.cardBloqueada,
      ]}
    >
      <Card.Content style={styles.content}>
        <Text style={styles.icono}>
          {insignia.obtenida ? '🏅' : '🔒'}
        </Text>
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            style={[
              styles.nombre,
              !insignia.obtenida && styles.textoBloqueado,
            ]}
          >
            {insignia.nombre}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.descripcion,
              !insignia.obtenida && styles.textoBloqueado,
            ]}
          >
            {insignia.descripcion}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: colors.insigniaOro,
  },
  cardBloqueada: {
    backgroundColor: colors.backgroundAlt,
    borderLeftColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icono: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  descripcion: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  textoBloqueado: {
    color: colors.textLight,
  },
});