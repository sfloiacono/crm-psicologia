# Consultorio Psiconflor

Aplicación web para organizar un consultorio de psicología: agenda, registro de sesiones, cobros, comprobantes de pago y gastos.

## Qué incluye

- **Agenda** con vistas de día, semana y mes. Las sesiones se generan solas a partir del horario habitual de cada paciente (semanal, quincenal o mensual).
- **Panel de pendientes**, con las sesiones pasadas que falta registrar y los pagos pendientes.
- **Registro en dos niveles**: primero el estado de la sesión (Realizada, Canceló paciente, Feriado, etc.) y, por separado, el pago.
- **Cancelaciones que se cobran**: los estados configurados como "A elegir" permiten decidir en cada sesión si se cobra.
- **Semanas**: análisis semanal con gráfico, tabla y detalle editable.
- **Caja mensual**: cobrado, pendiente, porcentaje para instituciones, gastos y neto del mes.
- **Pacientes**: ficha completa, historial de horarios y comprobantes de pago (imagen o PDF).
- **Gastos**: egresos del consultorio por categoría.
- **Configuración**: todas las listas desplegables son editables, y se puede elegir la paleta de colores y la tipografía.

## Dónde se guardan los datos

Los datos se guardan en **Firebase** (Google), en el proyecto `consultorio-psiconflor`, y se sincronizan al instante entre todos los dispositivos.

- Se ingresa con una **cuenta de Google**. Solo pueden entrar las cuentas autorizadas.
- Todas las cuentas autorizadas **comparten los mismos datos** del consultorio.
- Si no hay conexión, la app sigue funcionando y guarda los cambios cuando vuelve internet.
- Los comprobantes (imágenes o PDF) se guardan achicados en la misma base, con un máximo de 700 KB por archivo.

### Sumar o quitar una cuenta autorizada

Hay que cambiarla en **dos lugares**, y las dos listas tienen que coincidir:

1. **En Firebase:** Firestore Database > Reglas. Agregar o borrar el email en la lista y tocar **Publicar**.
2. **En este repositorio:** en el archivo `firebase.js`, en la lista `AUTORIZADOS`. Después, subir el archivo a GitHub.

## Estructura

```
index.html             Estructura de la página
firebase.js            Conexión con Firebase y lista de cuentas autorizadas
styles.css             Estilos, paletas y tipografías
app.js                 Lógica de la aplicación
manifest.webmanifest   Datos para instalarla en el celular
sw.js                  Permite instalarla y abrirla sin conexión
icons/                 Íconos de la aplicación
```

## Publicarla con GitHub Pages

1. En el repositorio, entrá a **Settings > Pages**.
2. En **Source**, elegí **Deploy from a branch**.
3. En **Branch**, elegí `main` y la carpeta `/ (root)`, y tocá **Save**.
4. En uno o dos minutos, la aplicación queda disponible en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

### Instalarla en el celular

- **Android (Chrome):** abrí la dirección, tocá el menú ⋮ y elegí **Instalar aplicación** o **Agregar a la pantalla principal**.
- **iPhone (Safari):** abrí la dirección, tocá **Compartir** y elegí **Agregar a inicio**.

### Actualizar la aplicación

Cuando subas cambios, abrí `sw.js` y aumentá el número de `VERSION` (por ejemplo, de `'v1'` a `'v2'`). Así los dispositivos que ya la instalaron descargan la versión nueva.

## Privacidad

- Este repositorio contiene **solo el código**. Nunca subas datos reales de pacientes (planillas, copias de seguridad, comprobantes).
- El archivo `.gitignore` bloquea por defecto las planillas de Excel, los CSV y las copias de seguridad de la app.

## Próximos pasos

- PIN de 4 dígitos para abrir la app en el día a día.
- Revisión de los requisitos de la Ley 25.326 de Protección de Datos Personales para datos de salud.
