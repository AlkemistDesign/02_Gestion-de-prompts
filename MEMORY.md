# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Rediseño estético y de accesibilidad completado: interfaz minimalista, acogedora y flat adaptativa (temas Playa, Café, Camping y Gato).
- Auditoría WCAG 2.2 completada (skip link, foco `:focus-visible`, reducción de movimiento, `#a11y-announcer`, `role="switch"` y diálogos accesibles `aria-modal="true"`).
- Tarjeta de Configuración abajo a la derecha: selector de fondo ambiental, switch de Reloj central (Fliqlo), switch de Recordatorio de agua (cada 45 min) y 2 switches placeholder ("Próximamente"). Minimizabilidad completa integrada en el dock.
- Reloj central estilo Fliqlo: widget flip-clock central retro/minimalista con números tabulares y línea de división horizontal.
- Modal/Popup de Métricas: diálogo inmersivo a pantalla completa (con márgenes laterales estilo tarjeta) accesible desde el botón "Métricas" en la cabecera.
- Recordatorio de agua: temporizador de 45 min con banner/toast flotante y anuncio sonoro/a11y no intrusivo.

## Decisiones (y por qué)
- **Botón Métricas en cabecera:** Sustituye al antiguo selector de fondos superior para despejar el header y abrir el nuevo modal amplio de métricas.
- **Selector de fondo integrado en Ajustes:** Consolida todos los controles visuales en la tarjeta de Configuración abajo a la derecha.
- **Popup de Métricas modal:** Ocupa el 92vw / 88vh con bordes redondeados y desenfoque para dar una vista panorámica sin saturar el grid perimetral principal.
- **Reloj Central desacoplado:** Ubicado en `.ambient-center-space` para no obstaculizar los fondos ambientales cuando está desactivado.
- **Persistencia ampliada en `diario-estudio-config`:** Almacena `showClock` y `waterReminder` junto a `minimizedCards`, `theme` y `background`.

## Aprendizajes y errores a evitar
- Mantener compatibilidad directa con `file://` (sin módulos JS ni dependencias externas).
- Añadir siempre `aria-hidden="true"` en los iconos de ligadura de Material Symbols.
- Toda animación debe contemplar `@media (prefers-reduced-motion: reduce)`.
- Devolver el foco accesible (`.focus()`) a la tarjeta o botón activador al cerrar ventanas modales o restaurar desde el dock.