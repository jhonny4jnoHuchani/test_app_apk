import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface Props {
  nombre?: string | null;
  email?: string | null;
  rol: 'estudiante' | 'docente';
  universidad?: string | null;
  carrera?: string | null;
  semestre?: string | null;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{etiqueta}</Text>
      <Text style={styles.value}>{valor?.trim() || 'Sin registrar'}</Text>
    </View>
  );
}

export function DatosPerfilCard({
  nombre,
  email,
  rol,
  universidad,
  carrera,
  semestre,
}: Props) {
  return (
    <Card style={styles.card}>
      <Card.Title
        title="Mis datos"
        titleStyle={styles.title}
        left={() => <Text style={styles.icon}>👤</Text>}
      />
      <Card.Content style={styles.content}>
        <Dato etiqueta="Nombre" valor={nombre} />
        <Dato etiqueta="Correo" valor={email} />
        <Dato etiqueta="Tipo de cuenta" valor={rol === 'estudiante' ? 'Estudiante' : 'Docente'} />
        {rol === 'estudiante' && (
          <>
            <View style={styles.divider} />
            <Dato etiqueta="Universidad" valor={universidad} />
            <Dato etiqueta="Carrera" valor={carrera} />
            <Dato etiqueta="Semestre" valor={semestre} />
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 15,
    backgroundColor: colors.card,
  },
  title: {
    color: colors.ink,
    fontFamily: 'LilitaOne',
    fontSize: 19,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  label: {
    color: colors.brown,
    fontFamily: 'NunitoBold',
    fontSize: 13,
  },
  value: {
    flex: 1,
    color: colors.ink,
    fontFamily: 'Nunito',
    fontSize: 13,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 7,
    backgroundColor: colors.border,
  },
});