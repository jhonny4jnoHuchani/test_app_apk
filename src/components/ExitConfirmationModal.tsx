import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmationModal({
  visible,
  title = '¿Salir de la aventura?',
  message = 'Tu progreso guardado estará disponible cuando regreses.',
  confirmLabel = 'Salir',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.pin} />
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(17, 14, 12, 0.72)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 8,
    backgroundColor: colors.paper,
    borderWidth: 3,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.3,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    elevation: 8,
  },
  pin: {
    alignSelf: 'center',
    width: 46,
    height: 8,
    marginTop: -31,
    marginBottom: 18,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.ink,
    transform: [{ rotate: '-3deg' }],
  },
  title: {
    color: colors.ink,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: colors.brown,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  button: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  cancel: {
    backgroundColor: colors.paperLight,
  },
  confirm: {
    backgroundColor: colors.red,
  },
  cancelText: {
    color: colors.ink,
    fontWeight: '800',
  },
  confirmText: {
    color: colors.white,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 2 }],
  },
});