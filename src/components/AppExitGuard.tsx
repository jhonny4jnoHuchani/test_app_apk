import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { ExitConfirmationModal } from './ExitConfirmationModal';

export function AppExitGuard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) {
        return false;
      }

      setVisible(true);
      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <ExitConfirmationModal
      visible={visible}
      onCancel={() => setVisible(false)}
      onConfirm={() => {
        setVisible(false);
        BackHandler.exitApp();
      }}
    />
  );
}