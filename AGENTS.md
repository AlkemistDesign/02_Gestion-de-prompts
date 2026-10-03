# AGENTS.md — Dashboard de Control de Estudio

Aplicación web estática para gestionar sesiones de estudio (temporizador/reproductor, calendario/racha, registro) y fondos visuales animados con tarjetas flotantes en laterales y esquinas.

## Stack y Estructura
- **Tecnologías:** HTML5, CSS3 y JavaScript vanilla puros (sin frameworks, npm, bundlers ni dependencias).
- **Archivos:** `index.html` (estructura), `styles.css` (diseño/variables) y `app.js` (lógica y datos).
- **Compatibilidad:** Debe funcionar abriendo `index.html` mediante `file://` (sin `type="module"` ni `fetch` local). Pero puedes poner tipografías de google fonts y material design online.

## Reglas de Diseño y Estilos
- **Origen estético:** Sigue estrictamente la guía visual definida en `DESIGN.md`.
- **Regla cromática:** No utilices colores fijos en CSS; usa siempre las Custom Properties (`var(--...)`) para permitir el cambio dinámico de tema y fondo.

## Persistencia y Datos (`localStorage`)
- `diario-estudio-sesiones`: Array de `{ date: "AAAA-MM-DD", topic, minutes }`.
- `diario-estudio-config`: Objeto de configuración `{ theme: "nombre-tema", background: "id-fondo", minimizedCards: [...], showClock: boolean, waterReminder: boolean }`.

## Manejo de Fechas y Racha
- Usa siempre la fecha local del usuario (nunca `toISOString()` ni `new Date("AAAA-MM-DD")` en UTC).
- **Racha:** Días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión pero ayer sí, la racha continúa activa. Varias sesiones el mismo día cuentan como 1 solo día.

## Límites del Proyecto
- ✅ **Siempre:** Textos en español, código simple y cambios incrementales.
- ✅ **Siempre:** actualizar `MEMORY.md` al terminar cada tarea. 
- ⚠️ **Pregunta antes:** Si necesitas crear archivos nuevos o alterar el formato de datos guardados.
- 🚫 **Nunca:** Añadir paso de build, dependencias ni servidores locales.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 