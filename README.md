# Consultorio: organizador de pacientes

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

## Dónde se guardan los datos (importante)

En esta versión, los datos se guardan **en el navegador de cada dispositivo** (almacenamiento local):

- no se sincronizan entre la computadora y el celular;
- si se borran los datos del navegador, se pierde lo cargado;
- los comprobantes tienen un límite de 1,5 MB cada uno.

Descargá una copia de seguridad seguido, desde **Configuración > Tus datos**.

Esta versión sirve para probar la aplicación. Para uso real con pacientes está prevista la etapa 2 (ver más abajo).

## Estructura

```
index.html             Estructura de la página
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

## Próximos pasos (etapa 2)

- Inicio de sesión con usuario y contraseña.
- Base de datos en la nube (por ejemplo, Supabase o Firebase), para sincronizar los datos entre dispositivos.
- Almacenamiento de comprobantes en la nube, sin el límite de tamaño.
- Revisión de los requisitos de la Ley 25.326 de Protección de Datos Personales para datos de salud.
