import { Redirect } from 'expo-router';

// El registro ahora vive en la ventana emergente abierta desde el login.
export default function RegistroRoute() {
  return <Redirect href="/(auth)/login" />;
}