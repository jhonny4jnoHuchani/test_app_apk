# Quest Estudiante — prueba

Este ZIP contiene el proyecto fuente actualizado. No incluye un APK instalable.

## Probar con Expo Go

1. Extrae el ZIP y abre una terminal en la carpeta `quest-estudiante-prueba`.
2. Instala las dependencias con `npm install`.
3. Inicia la app con `npm start`.
4. Escanea el código QR con Expo Go en el teléfono.

Para usar login y otras pantallas que consultan datos, el teléfono también debe
poder conectarse al servidor de la API configurado en `src/api/client.ts`.

## Cambios incluidos

- Mapa de misiones en zigzag, con niveles, jefes y camino animado al estilo de
  la paleta de Replica.
- Transición breve al completar una misión; si hay otra disponible, la abre
  automáticamente.
- Registro emergente desde el login. Los estudiantes completan universidad,
  carrera y semestre; los docentes solo ven sus datos básicos.
- Perfil de estudiante con datos académicos y perfil de docente con sus datos
  básicos.