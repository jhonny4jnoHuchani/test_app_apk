# Quest Estudiante — prueba

Este ZIP contiene el proyecto fuente actualizado. No incluye un APK instalable.

## Probar con Expo Go

1. Extrae el ZIP y abre una terminal en la carpeta `quest-estudiante-frontend`.
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
- Formulario de investigación rediseñado con constructor guiado, ejemplo
  editable, medidores en vivo y selección entre escritura libre y paso a paso.
- Validación del tema de investigación: requisitos de texto, detalles de los
  elementos presentes y faltantes, título corregido y modalidad alternativa.
- Aviso no bloqueante cuando el tema se guarda con una observación sobre la
  carrera del estudiante.

La integración conserva el endpoint del backend existente en
`src/api/client.ts`; este paquete contiene solo el frontend.