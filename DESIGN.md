# DESIGN.md — Sistema de Diseño Minimalista, Acogedor y Flat con Tarjetas Flotantes

Sistema de diseño moderno, acogedor, minimalista y flat para un espacio de estudio productivo y estético. Se basa en **tarjetas flotantes perimetrales con acabado flat y bordes suavizados**, dispuestas en laterales y esquinas para otorgar el máximo protagonismo a los **fondos dinámicos en alta resolución**.

---

## 1. Principios Visuales y Arquitectura de Maquetación

### 1.1. Filosofía de Diseño: Minimalismo Acogedor (Cozy & Flat)
- **Superficies Flat y Limpias:** Las tarjetas usan fondos sutilmente translúcidos con `backdrop-filter: blur(16px)`, eliminando bordes toscos y priorizando la jerarquía tonal suave.
- **Reducción de Bordes:** Los divisores y bordes se minimizan a líneas ultrafinas y de bajo contraste (`rgba(..., 0.07 - 0.24)`) o fondos planos diferenciados (`--surface-item`, `--surface-input`).
- **Identidad Cromática Diferenciada por Tema:**
  - **Café Cálido:** Paleta tostada con carácter (caramelo tostado, moka, crema teñida de café y terracota).
  - **Playa Relajante:** Paleta marina luminosa y viva (turquesa océano, cristal de agua marina, sol dorado y coral vivo).
  - **Camping Nocturno:** Bosque profundo con calidez de brasa y fogata.
  - **Gato Acogedor:** Monocromo estricto en blanco y negro (modo oscuro minimalista).

### 1.2. Capa de Fondo Dinámico (Hero Wallpaper)
- **Contenedor (`.bg-container`):** Ocupa toda la pantalla (`position: fixed; inset: 0; z-index: -2; overflow: hidden;`).
- **Medios:** Soporte para vídeo continuo en bucle (`<video autoplay loop muted playsinline>`) e imágenes fijas con `object-fit: cover`.
- **Capa Ambiental (`.bg-overlay`):** Velo semi-transparente que unifica el contraste y legibilidad con desenfoque y saturación suave (`rgba(12, 16, 20, 0.30)` en temas claros; `0.45` en tema gato).
- **Transición por Disolución (Crossfade):** Sistema de dos capas activas (`bg-layer-a` y `bg-layer-b`) con animación de fundido de 850ms.

### 1.3. Distribución Espacial Flotante
- **Distribución Perimetral:** Columnas flotantes a los lados (izquierda: Racha + Temporizador; derecha: Registro + Historial; inferior: Métricas) dejando el centro despejado.
- **Superficies y Sombras:**
  - **Tarjetas:** `--surface-card` con radio de 20px y sombra ambiental difuminada `--shadow-card`.
  - **Inputs y Contenedores:** Fondos con tinte tonal acorde al tema (`--surface-input`), sin contornos duros, con anillo de foco dinámico.

---

## 2. Sistema Cromático Adaptativo y Paletas por Fondo

Todas las vistas y componentes consumen variables CSS (`var(--...)` o `color-mix(...)`). Al cambiar el fondo ambiental, el atributo `data-theme` en `<html>` actualiza dinámicamente toda la interfaz.

### 2.1. Paletas Cromáticas

#### 🐱 Gato Acogedor (`[data-theme="gato"]` — Monocromático Oscuro / Blanco y Negro)
- **Concepto:** Estética oscura monocromática minimalista, superficies en carbón oscuro y contraste nítido en blanco puro y gris neutro.
- `--bg-gradient:` `linear-gradient(145deg, #09090b 0%, #121215 50%, #1c1c21 100%)`
- `--surface-card:` `rgb(18 18 20)`
- `--surface-border:` `rgb(38 38 44)`
- `--surface-input:` `rgb(28 28 32)`
- `--surface-input-focus:` `#000000`
- `--surface-item:` `rgb(26 26 30)`
- `--surface-item-hover:` `rgb(38 38 44)`
- `--surface-badge-neutral:` `rgb(34 34 40)`
- `--color-primary:` `#ffffff` (Blanco nítido)
- `--color-primary-hover:` `#e4e4e7`
- `--color-accent:` `#a1a1aa` (Gris neutro)
- `--color-coral:` `#71717a` (Gris medio)
- `--color-info:` `#d4d4d8`
- `--text-main:` `#fafafa`
- `--text-muted:` `#8b8b94`
- `--text-on-primary:` `#09090b` (Negro profundo)
- `--text-accent:` `#ffffff`
- `--text-info:` `#f4f4f5`

#### ☕ Café Cálido (`[data-theme="cafe"]` — Caramelo Tostado, Canela & Crema Moka)
- **Concepto:** Cafetería acogedora con superficies tostadas teñidas de café con leche, canela terracota, caramelo ámbar y espresso oscuro.
- `--bg-gradient:` `linear-gradient(145deg, #2c1206 0%, #4a210d 50%, #6e3518 100%)`
- `--surface-card:` `rgb(244 226 206)` (Galleta tostada / crema de caramelo sólida)
- `--surface-border:` `rgb(255 228 209)`
- `--surface-input:` `rgb(248 238 227)`
- `--surface-input-focus:` `#fdf5eb`
- `--surface-item:` `rgb(254 236 219)`
- `--surface-item-hover:` `rgb(253 243 230)`
- `--surface-badge-neutral:` `rgb(245 217 195)`
- `--color-primary:` `#b8541a` (Canela terracota cálida)
- `--color-primary-hover:` `#994110`
- `--color-accent:` `#db7c1e` (Caramelo tostado)
- `--color-coral:` `#c73e28` (Pimentón / teja cálido)
- `--color-info:` `#7a4422` (Espresso)
- `--text-main:` `#2d1407` (Café oscuro tostado)
- `--text-muted:` `#6d4830` (Moka medio)
- `--text-on-primary:` `#ffffff`
- `--text-accent:` `#522103`
- `--text-info:` `#5e2b0c`

#### ⛺ Camping Nocturno (`[data-theme="camping"]` — Fogata & Musgo Nocturno)
- **Concepto:** Bosque nocturno acogedor con superficies verde musgo oscuro y acentos cálidos de brasa y fogata.
- `--bg-gradient:` `linear-gradient(145deg, #091910 0%, #0e271a 50%, #173626 100%)`
- `--surface-card:` `rgb(14 28 20)` (Verde bosque profundo sólido)
- `--surface-border:` `rgb(28 50 36)`
- `--surface-input:` `rgb(20 38 28)`
- `--surface-input-focus:` `rgb(24 46 34)`
- `--surface-item:` `rgb(22 42 30)`
- `--surface-item-hover:` `rgb(30 56 40)`
- `--surface-badge-neutral:` `rgb(26 48 35)`
- `--color-primary:` `#e69138` (Ámbar fogata cálido)
- `--color-primary-hover:` `#cf7e27`
- `--color-accent:` `#f5b041` (Dorado de brasa)
- `--color-coral:` `#e76f51` (Coral nocturno)
- `--color-info:` `#7ecba1` (Menta suave)
- `--text-main:` `#fdfbf7` (Blanco cálido)
- `--text-muted:` `#a3bba9` (Musgo claro)
- `--text-on-primary:` `#1a150e` (Carbón oscuro)
- `--text-accent:` `#fef3c7`
- `--text-info:` `#b4e8cb`

#### 🏖️ Playa Relajante (`[data-theme="playa"]` — Turquesa Marino & Brisa Costera)
- **Concepto:** Frescor tropical y oceánico con superficies agua marina sólida, turquesa marino vivo, sol dorado y azul marino profundo.
- `--bg-gradient:` `linear-gradient(145deg, #0d4659 0%, #166b82 50%, #228f9e 100%)`
- `--surface-card:` `rgb(218 242 244)` (Agua marina clara sólida)
- `--surface-border:` `rgb(238 250 251)`
- `--surface-input:` `rgb(236 247 249)`
- `--surface-input-focus:` `#ffffff`
- `--surface-item:` `rgb(202 235 239)`
- `--surface-item-hover:` `rgb(240 252 253)`
- `--surface-badge-neutral:` `rgb(195 228 233)`
- `--color-primary:` `#0d8a90` (Turquesa marino vivo)
- `--color-primary-hover:` `#096f74`
- `--color-accent:` `#f39c12` (Dorado sol tropical)
- `--color-coral:` `#e74c3c` (Coral arrecife vivo)
- `--color-info:` `#2980b9` (Azul océano)
- `--text-main:` `#0b2c34` (Azul marino profundo)
- `--text-muted:` `#3c6b75` (Pizarra marina)
- `--text-on-primary:` `#ffffff`
- `--text-accent:` `#744200`
- `--text-info:` `#0d4e78`

---

## 3. Tipografía, Iconografía y Componentes

- **Tipografía:** `Plus Jakarta Sans` con jerarquía equilibrada de pesos (400, 500, 600, 700, 800) y números tabulares para temporizadores y estadísticas.
- **Iconografía:** Google Material Symbols Rounded en versión vectorial limpia, sin bordes innecesarios en contenedores de iconos.
- **Componentes Flat:**
  - **Píldoras y Badges:** Fondos sin borde grueso con opacidad calculada (`color-mix`).
  - **Temporizador Circular:** Anillo SVG con trazo esbelto (6px) y transición lineal suave.
  - **Calendario:** Celdas circulares flat con realce directo de días completados mediante `--color-primary` y tooltip flotante con efecto blur.