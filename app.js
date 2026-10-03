/**
 * Dashboard de Control de Estudio
 * 
 * Cumple con AGENTS.md:
 * - JavaScript Vanilla sin dependencias ni build.
 * - Compatible con file:// (sin type="module" ni fetch local).
 * - Fechas estrictamente locales (sin toISOString ni UTC parsing).
 * - Persistencia en localStorage ('diario-estudio-sesiones' y 'diario-estudio-config').
 * - Control de fondos dinámicos (vídeos relajantes e imágenes locales).
 * - Iconografía Material Symbols (sin emojis).
 */

(function () {
  'use strict';

  // --- Claves de LocalStorage ---
  const STORAGE_SESSIONS_KEY = 'diario-estudio-sesiones';
  const STORAGE_CONFIG_KEY = 'diario-estudio-config';

  // --- Mapeo de Fondos Dinámicos (Assets) ---
  const BACKGROUNDS = {
    cafe: {
      type: 'video',
      src: 'assets/background-cafe.mp4',
      name: 'Café Cálido'
    },
    camping: {
      type: 'image',
      src: 'assets/background-camping.jpg',
      name: 'Camping Nocturno'
    },
    gato: {
      type: 'video',
      src: 'assets/background-gato.mp4',
      name: 'Gato Acogedor'
    },
    playa: {
      type: 'video',
      src: 'assets/background-playa.mp4',
      name: 'Playa Relajante'
    }
  };

  const DEFAULT_BG = 'cafe';

  // --- Elementos del DOM ---
  const headerTodayDateEl = document.getElementById('header-today-date');
  const bgSelectEl = document.getElementById('bg-select');
  const bgLayerAEl = document.getElementById('bg-layer-a');
  const bgLayerBEl = document.getElementById('bg-layer-b');
  let currentLayerKey = 'a';
  let currentBgId = null;
  let bgTransitionTimeout = null;
  let transitionCounter = 0;

  const streakCountEl = document.getElementById('streak-count');
  const streakBadgeEl = document.getElementById('streak-badge');
  const streakStatusTextEl = document.getElementById('streak-status-text');
  const statTodayMinutesEl = document.getElementById('stat-today-minutes');
  const statTotalSessionsEl = document.getElementById('stat-total-sessions');
  const statTotalHoursEl = document.getElementById('stat-total-hours');

  // Elementos del Calendario Mensual
  const calMonthTitleEl = document.getElementById('cal-month-title');
  const btnCalPrevEl = document.getElementById('btn-cal-prev');
  const btnCalNextEl = document.getElementById('btn-cal-next');
  const btnCalTodayEl = document.getElementById('btn-cal-today');
  const calendarGridEl = document.getElementById('calendar-grid');
  const calTooltipEl = document.getElementById('cal-tooltip');

  // Estado de navegación del calendario (fechas locales)
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth(); // 0 - 11

  const sessionFormEl = document.getElementById('session-form');
  const formErrorMsgEl = document.getElementById('form-error-msg');
  const a11yAnnouncerEl = document.getElementById('a11y-announcer');
  const inputTopicEl = document.getElementById('input-topic');
  const inputMinutesEl = document.getElementById('input-minutes');
  const inputDateEl = document.getElementById('input-date');

  const historyListEl = document.getElementById('history-list');
  const historyEmptyEl = document.getElementById('history-empty');
  const historyCountBadgeEl = document.getElementById('history-count-badge');

  /**
   * Emite un mensaje de estado para tecnologías asistenciales y lectores de pantalla (WCAG 4.1.3).
   */
  function announceA11y(message) {
    if (!a11yAnnouncerEl || !message) return;
    a11yAnnouncerEl.textContent = '';
    setTimeout(() => {
      if (a11yAnnouncerEl) a11yAnnouncerEl.textContent = message;
    }, 50);
  }

  // Elementos del Temporizador Pomodoro
  const cardTimerEl = document.getElementById('card-timer');
  const timerBadgeEl = document.getElementById('timer-badge');
  const tabPomodoroEl = document.getElementById('tab-pomodoro');
  const tabDeepEl = document.getElementById('tab-deep');
  const tabCustomEl = document.getElementById('tab-custom');
  const timerModeBtns = document.querySelectorAll('.timer-mode-btn');
  const timerCustomConfigEl = document.getElementById('timer-custom-config');
  const customFocusMinutesEl = document.getElementById('custom-focus-minutes');
  const customBreakMinutesEl = document.getElementById('custom-break-minutes');
  const timerTopicInputEl = document.getElementById('timer-topic-input');
  const timerRingBarEl = document.getElementById('timer-ring-bar');
  const timerPhaseLabelEl = document.getElementById('timer-phase-label');
  const timerDigitsEl = document.getElementById('timer-digits');
  const timerCycleIndicatorEl = document.getElementById('timer-cycle-indicator');
  const btnTimerResetEl = document.getElementById('btn-timer-reset');
  const btnTimerToggleEl = document.getElementById('btn-timer-toggle');
  const timerMainIconEl = document.getElementById('timer-main-icon');
  const timerMainTextEl = document.getElementById('timer-main-text');
  const btnTimerSkipEl = document.getElementById('btn-timer-skip');
  const timerFinishAlertEl = document.getElementById('timer-finish-alert');
  const timerAlertTextEl = document.getElementById('timer-alert-text');

  // Estado del Temporizador
  const FULL_DASH_ARRAY = 439.82; // 2 * PI * 70
  let timerMode = 'pomodoro'; // 'pomodoro' | 'deep' | 'custom'
  let timerPhase = 'focus'; // 'focus' | 'break'
  let timerIsRunning = false;
  let timerSecondsLeft = 25 * 60;
  let timerTotalSeconds = 25 * 60;
  let timerCycleCount = 1;
  let timerIntervalId = null;
  let timerEndTime = 0;
  let timerAlertTimeout = null;

  // Elementos de Configuración y Widgets
  const switchClockEl = document.getElementById('switch-clock');
  const flipClockWrapperEl = document.getElementById('flip-clock-wrapper');
  const flipHoursEl = document.getElementById('flip-hours');
  const flipMinutesEl = document.getElementById('flip-minutes');
  const flipSecondsEl = document.getElementById('flip-seconds');
  let flipClockIntervalId = null;

  const switchWaterEl = document.getElementById('switch-water');
  const waterReminderToastEl = document.getElementById('water-reminder-toast');
  const btnCloseWaterToastEl = document.getElementById('btn-close-water-toast');
  let waterReminderIntervalId = null;
  const WATER_REMINDER_MS = 45 * 60 * 1000; // Intervalo de 45 minutos

  // Elementos del Modal de Métricas (Fase 4)
  const btnOpenMetricsEl = document.getElementById('btn-open-metrics');
  const metricsModalEl = document.getElementById('metrics-modal');
  const metricsModalBackdropEl = document.getElementById('metrics-modal-backdrop');
  const btnCloseMetricsEl = document.getElementById('btn-close-metrics');
  const metricsModalBestStreakEl = document.getElementById('metrics-modal-best-streak');
  const metricsModalTotalSessionsEl = document.getElementById('metrics-modal-total-sessions');
  const metricsModalTotalHoursEl = document.getElementById('metrics-modal-total-hours');

  // --- Manejo Seguro de Fechas Locales (Sin UTC) ---

  /**
   * Convierte un objeto Date en cadena 'AAAA-MM-DD' según la zona horaria local.
   */
  function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parsea 'AAAA-MM-DD' a un objeto Date local (año, mes - 1, día).
   */
  function parseLocalDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date();
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /**
   * Formatea la fecha para mostrar en la interfaz en español amigable.
   */
  function formatFriendlyDate(dateStr) {
    const todayStr = formatLocalDate(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterdayDate);

    if (dateStr === todayStr) {
      return 'Hoy';
    } else if (dateStr === yesterdayStr) {
      return 'Ayer';
    }

    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // --- Capa de Configuración, Temas y Fondos ---

  function loadConfig() {
    try {
      const data = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (!data) return { theme: DEFAULT_BG, background: DEFAULT_BG, minimizedCards: [], showClock: false, waterReminder: false };
      const parsed = JSON.parse(data);
      const bg = parsed && parsed.background ? parsed.background : DEFAULT_BG;
      const theme = parsed && parsed.theme ? parsed.theme : bg;
      const minimizedCards = Array.isArray(parsed && parsed.minimizedCards) ? parsed.minimizedCards : [];
      const showClock = Boolean(parsed && parsed.showClock);
      const waterReminder = Boolean(parsed && parsed.waterReminder);
      return {
        background: bg,
        theme: theme,
        minimizedCards: minimizedCards,
        showClock: showClock,
        waterReminder: waterReminder
      };
    } catch (err) {
      console.warn('Error al leer configuración de localStorage:', err);
      return { theme: DEFAULT_BG, background: DEFAULT_BG, minimizedCards: [], showClock: false, waterReminder: false };
    }
  }

  function saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (err) {
      console.error('Error al guardar configuración en localStorage:', err);
    }
  }

  /**
   * Aplica la paleta cromática adaptativa asociada al fondo.
   */
  function applyTheme(themeId) {
    const actualTheme = BACKGROUNDS[themeId] ? themeId : DEFAULT_BG;
    document.documentElement.setAttribute('data-theme', actualTheme);
  }

  /**
   * Configura el medio (vídeo o imagen) en la capa especificada.
   */
  function setLayerMedia(layerEl, bgData) {
    if (!layerEl) return;
    const videoEl = layerEl.querySelector('.bg-media-video');
    const imgEl = layerEl.querySelector('.bg-media-img');

    if (bgData.type === 'video') {
      if (imgEl) {
        imgEl.classList.remove('is-visible');
        imgEl.removeAttribute('src');
      }
      if (videoEl) {
        videoEl.src = bgData.src;
        videoEl.classList.add('is-visible');
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => { });
        }
      }
    } else if (bgData.type === 'image') {
      if (videoEl) {
        videoEl.pause();
        videoEl.classList.remove('is-visible');
        videoEl.removeAttribute('src');
      }
      if (imgEl) {
        imgEl.src = bgData.src;
        imgEl.classList.add('is-visible');
      }
    }
  }

  /**
   * Limpia y detiene los medios de una capa inactiva para ahorrar recursos.
   */
  function clearLayerMedia(layerEl) {
    if (!layerEl) return;
    const videoEl = layerEl.querySelector('.bg-media-video');
    const imgEl = layerEl.querySelector('.bg-media-img');
    if (videoEl) {
      videoEl.pause();
      videoEl.classList.remove('is-visible');
      videoEl.removeAttribute('src');
      videoEl.load();
    }
    if (imgEl) {
      imgEl.classList.remove('is-visible');
      imgEl.removeAttribute('src');
    }
  }

  /**
   * Aplica el fondo dinámico seleccionado con efecto de disolución gradual (crossfade).
   */
  function applyBackground(bgId, isInitial = false) {
    const bgData = BACKGROUNDS[bgId] || BACKGROUNDS[DEFAULT_BG];
    const actualId = BACKGROUNDS[bgId] ? bgId : DEFAULT_BG;

    if (bgSelectEl) {
      bgSelectEl.value = actualId;
    }

    if (actualId === currentBgId && !isInitial) {
      return;
    }

    // Carga inicial directa sin transición para evitar pantallas en blanco
    if (isInitial) {
      currentBgId = actualId;
      applyTheme(actualId);
      if (bgLayerAEl) {
        setLayerMedia(bgLayerAEl, bgData);
        bgLayerAEl.classList.add('is-active');
      }
      if (bgLayerBEl) {
        bgLayerBEl.classList.remove('is-active');
        clearLayerMedia(bgLayerBEl);
      }
      currentLayerKey = 'a';
      return;
    }

    // Cancelar cualquier transición en curso
    transitionCounter++;
    const thisTransitionId = transitionCounter;
    if (bgTransitionTimeout) {
      clearTimeout(bgTransitionTimeout);
      bgTransitionTimeout = null;
    }

    const outgoingLayer = currentLayerKey === 'a' ? bgLayerAEl : bgLayerBEl;
    const incomingLayer = currentLayerKey === 'a' ? bgLayerBEl : bgLayerAEl;
    const nextLayerKey = currentLayerKey === 'a' ? 'b' : 'a';

    currentBgId = actualId;
    applyTheme(actualId);

    // Preparar el medio en la capa entrante
    setLayerMedia(incomingLayer, bgData);

    // Función para activar la transición gradual
    function triggerCrossfade() {
      if (thisTransitionId !== transitionCounter) return;

      incomingLayer.classList.add('is-active');
      outgoingLayer.classList.remove('is-active');
      currentLayerKey = nextLayerKey;

      // Esperar 850ms (duración de la transición CSS + margen de seguridad)
      bgTransitionTimeout = setTimeout(() => {
        if (thisTransitionId === transitionCounter) {
          clearLayerMedia(outgoingLayer);
          bgTransitionTimeout = null;
        }
      }, 850);
    }

    const inVideo = incomingLayer.querySelector('.bg-media-video');
    const inImg = incomingLayer.querySelector('.bg-media-img');

    if (bgData.type === 'video' && inVideo) {
      let triggered = false;
      const onReady = () => {
        if (!triggered) {
          triggered = true;
          inVideo.removeEventListener('playing', onReady);
          inVideo.removeEventListener('canplay', onReady);
          triggerCrossfade();
        }
      };

      inVideo.addEventListener('playing', onReady, { once: true });
      inVideo.addEventListener('canplay', onReady, { once: true });

      // Fallback si el navegador ya tenía el vídeo listo
      setTimeout(() => {
        if (!triggered) {
          triggered = true;
          triggerCrossfade();
        }
      }, 150);
    } else if (bgData.type === 'image' && inImg) {
      if (inImg.complete && inImg.naturalWidth > 0) {
        triggerCrossfade();
      } else {
        inImg.onload = () => triggerCrossfade();
        setTimeout(() => triggerCrossfade(), 100);
      }
    } else {
      triggerCrossfade();
    }
  }

  function handleBackgroundChange(e) {
    const selectedBg = e.target.value;
    const config = loadConfig();
    config.background = selectedBg;
    config.theme = selectedBg;
    saveConfig(config);
    applyBackground(selectedBg);
    const bgName = BACKGROUNDS[selectedBg] ? BACKGROUNDS[selectedBg].name : selectedBg;
    announceA11y(`Fondo ambiental cambiado a ${bgName}.`);
  }

  // --- Módulo de Gestión de Ventanas Flotantes y Minimización ---
  const CARDS_CONFIG = {
    'card-streak': {
      id: 'card-streak',
      name: 'Racha',
      fullName: 'Racha y Calendario',
      icon: 'local_fire_department'
    },
    'card-timer': {
      id: 'card-timer',
      name: 'Temporizador',
      fullName: 'Temporizador de Enfoque',
      icon: 'timer'
    },
    'card-form': {
      id: 'card-form',
      name: 'Registrar',
      fullName: 'Registrar Sesión',
      icon: 'edit_note'
    },
    'card-history': {
      id: 'card-history',
      name: 'Historial',
      fullName: 'Historial de Sesiones',
      icon: 'history_edu'
    },
    'card-settings': {
      id: 'card-settings',
      name: 'Ajustes',
      fullName: 'Configuración',
      icon: 'settings'
    }
  };

  const minimizedDockEl = document.getElementById('minimized-dock');
  const minimizedChipsListEl = document.getElementById('minimized-chips-list');
  const btnRestoreAllEl = document.getElementById('btn-restore-all');
  let minimizedCards = [];

  function updateCardsVisibility() {
    Object.keys(CARDS_CONFIG).forEach(cardId => {
      const cardEl = document.getElementById(cardId);
      if (!cardEl) return;
      if (minimizedCards.includes(cardId)) {
        cardEl.classList.add('is-minimized');
        cardEl.setAttribute('aria-hidden', 'true');
      } else {
        cardEl.classList.remove('is-minimized');
        cardEl.removeAttribute('aria-hidden');
      }
    });
  }

  function renderMinimizedDock() {
    if (!minimizedDockEl || !minimizedChipsListEl) return;

    if (minimizedCards.length === 0) {
      minimizedDockEl.style.display = 'none';
      minimizedChipsListEl.innerHTML = '';
      return;
    }

    minimizedDockEl.style.display = 'inline-flex';
    minimizedChipsListEl.innerHTML = '';

    if (btnRestoreAllEl) {
      btnRestoreAllEl.style.display = minimizedCards.length >= 2 ? 'inline-flex' : 'none';
    }

    minimizedCards.forEach(cardId => {
      const cardInfo = CARDS_CONFIG[cardId];
      if (!cardInfo) return;

      const chipBtn = document.createElement('button');
      chipBtn.type = 'button';
      chipBtn.className = 'minimized-chip';
      chipBtn.setAttribute('data-card', cardId);
      chipBtn.setAttribute('title', `Abrir ventana ${cardInfo.fullName}`);
      chipBtn.setAttribute('aria-label', `Abrir ventana ${cardInfo.fullName}`);

      chipBtn.innerHTML = `
        <span class="material-symbols-rounded minimized-chip-icon" aria-hidden="true">${cardInfo.icon}</span>
        <span class="minimized-chip-label">${cardInfo.name}</span>
      `;

      chipBtn.addEventListener('click', () => {
        restoreCard(cardId);
      });

      minimizedChipsListEl.appendChild(chipBtn);
    });
  }

  function minimizeCard(cardId) {
    if (!CARDS_CONFIG[cardId] || minimizedCards.includes(cardId)) return;
    minimizedCards.push(cardId);

    const config = loadConfig();
    config.minimizedCards = [...minimizedCards];
    saveConfig(config);

    updateCardsVisibility();
    renderMinimizedDock();

    announceA11y(`Ventana ${CARDS_CONFIG[cardId].fullName} minimizada arriba a la izquierda.`);
  }

  function restoreCard(cardId) {
    if (!minimizedCards.includes(cardId)) return;
    minimizedCards = minimizedCards.filter(id => id !== cardId);

    const config = loadConfig();
    config.minimizedCards = [...minimizedCards];
    saveConfig(config);

    updateCardsVisibility();
    renderMinimizedDock();

    const cardInfo = CARDS_CONFIG[cardId];
    announceA11y(`Ventana ${cardInfo ? cardInfo.fullName : cardId} abierta.`);

    // Devolver foco accesible a la tarjeta restaurada
    const restoredCardEl = document.getElementById(cardId);
    if (restoredCardEl) {
      const firstFocusable = restoredCardEl.querySelector('button, input, select, [tabindex="0"]');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  function restoreAllCards() {
    if (minimizedCards.length === 0) return;
    minimizedCards = [];

    const config = loadConfig();
    config.minimizedCards = [];
    saveConfig(config);

    updateCardsVisibility();
    renderMinimizedDock();

    announceA11y('Todas las ventanas han sido abiertas.');
  }

  function initMinimizedManager() {
    const config = loadConfig();
    minimizedCards = Array.isArray(config.minimizedCards)
      ? config.minimizedCards.filter(id => !!CARDS_CONFIG[id])
      : [];

    document.querySelectorAll('.btn-card-minimize').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardId = btn.getAttribute('data-card');
        if (cardId) minimizeCard(cardId);
      });
    });

    if (btnRestoreAllEl) {
      btnRestoreAllEl.addEventListener('click', restoreAllCards);
    }

    updateCardsVisibility();
    renderMinimizedDock();
  }

  // --- Capa de Datos (LocalStorage) ---

  /**
   * Carga las sesiones almacenadas de localStorage.
   * @returns {Array<{ date: string, topic: string, minutes: number }>}
   */
  function loadSessions() {
    try {
      const data = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.warn('Error al leer sesiones de localStorage:', err);
      return [];
    }
  }

  /**
   * Guarda las sesiones en localStorage.
   */
  function saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error('Error al guardar sesiones en localStorage:', err);
    }
  }

  // --- Lógica de Racha y Estadísticas ---

  /**
   * Calcula la racha actual de días consecutivos.
   * Regla de AGENTS.md:
   * - Días consecutivos con al menos 1 sesión que terminan hoy.
   * - Si hoy no hay sesión pero ayer sí, la racha continúa activa.
   * - Varias sesiones el mismo día cuentan como 1 solo día.
   */
  function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) {
      return { streak: 0, hasToday: false, hasYesterday: false };
    }

    const uniqueDateSet = new Set(sessions.map(s => s.date));
    const today = new Date();
    const todayStr = formatLocalDate(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    const hasToday = uniqueDateSet.has(todayStr);
    const hasYesterday = uniqueDateSet.has(yesterdayStr);

    // Si ni hoy ni ayer se ha estudiado, la racha es 0
    if (!hasToday && !hasYesterday) {
      return { streak: 0, hasToday: false, hasYesterday: false };
    }

    let streak = 0;
    // Empezamos la comprobación desde hoy si se estudió hoy, o desde ayer si hoy aún no
    const checkDate = new Date();
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const targetStr = formatLocalDate(checkDate);
      if (uniqueDateSet.has(targetStr)) {
        streak++;
        // Retroceder un día
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, hasToday, hasYesterday };
  }

  /**
   * Calcula estadísticas rápidas (hoy, total sesiones, horas totales).
   */
  function calculateStats(sessions) {
    const todayStr = formatLocalDate(new Date());
    let todayMinutes = 0;
    let totalMinutes = 0;

    sessions.forEach(s => {
      const mins = Number(s.minutes) || 0;
      totalMinutes += mins;
      if (s.date === todayStr) {
        todayMinutes += mins;
      }
    });

    return {
      todayMinutes,
      totalSessions: sessions.length,
      totalHours: (totalMinutes / 60).toFixed(1)
    };
  }

  // --- Renderizado en el DOM ---

  function renderHeaderDate() {
    if (!headerTodayDateEl) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    headerTodayDateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function renderStreakAndStats(sessions) {
    const { streak, hasToday, hasYesterday } = calculateStreak(sessions);
    const stats = calculateStats(sessions);

    if (streakCountEl) {
      streakCountEl.textContent = streak;
    }

    if (streakBadgeEl) {
      if (streak === 0) {
        streakBadgeEl.textContent = 'Inactiva';
        streakBadgeEl.className = 'card-badge';
      } else if (hasToday) {
        streakBadgeEl.textContent = 'Al día';
        streakBadgeEl.className = 'card-badge badge-accent';
      } else if (hasYesterday) {
        streakBadgeEl.textContent = 'Pendiente hoy';
        streakBadgeEl.className = 'card-badge badge-accent';
      }
    }

    if (streakStatusTextEl) {
      if (streak === 0) {
        streakStatusTextEl.textContent = '¡Registra tu sesión de hoy para empezar!';
      } else if (hasToday) {
        streakStatusTextEl.textContent = streak === 1
          ? '¡Primer día completado! Sigue con este ritmo.'
          : `¡Gran constancia! ${streak} días seguidos al pie del cañón.`;
      } else if (hasYesterday) {
        streakStatusTextEl.textContent = `Tienes ${streak} día(s) activos. ¡Estudia hoy para no perderla!`;
      }
    }

    // Estadísticas
    if (statTodayMinutesEl) statTodayMinutesEl.textContent = `${stats.todayMinutes} min`;
    if (statTotalSessionsEl) statTotalSessionsEl.textContent = stats.totalSessions;
    if (statTotalHoursEl) statTotalHoursEl.textContent = `${stats.totalHours} h`;
  }

  function renderHistory(sessions) {
    historyListEl.innerHTML = '';
    historyCountBadgeEl.textContent = `${sessions.length} ${sessions.length === 1 ? 'registro' : 'registros'}`;

    if (sessions.length === 0) {
      historyEmptyEl.style.display = 'block';
      return;
    }

    historyEmptyEl.style.display = 'none';

    // Mostramos las sesiones más recientes primero
    const reversed = [...sessions].reverse();

    reversed.forEach((session, reversedIndex) => {
      const originalIndex = sessions.length - 1 - reversedIndex;

      const li = document.createElement('li');
      li.className = 'history-item';

      const left = document.createElement('div');
      left.className = 'history-item-left';

      const topicSpan = document.createElement('span');
      topicSpan.className = 'history-item-topic';
      topicSpan.textContent = session.topic || 'Sesión de estudio';

      const metaSpan = document.createElement('span');
      metaSpan.className = 'history-item-meta';
      metaSpan.textContent = `${formatFriendlyDate(session.date)} • ${session.date}`;

      left.appendChild(topicSpan);
      left.appendChild(metaSpan);

      const right = document.createElement('div');
      right.className = 'history-item-right';

      const minSpan = document.createElement('span');
      minSpan.className = 'history-item-minutes';
      minSpan.textContent = `${session.minutes} min`;

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-session';
      delBtn.type = 'button';
      delBtn.title = 'Eliminar sesión';
      delBtn.setAttribute('aria-label', `Eliminar sesión de ${session.topic}`);

      const delIcon = document.createElement('span');
      delIcon.className = 'material-symbols-rounded';
      delIcon.setAttribute('aria-hidden', 'true');
      delIcon.textContent = 'delete';
      delBtn.appendChild(delIcon);

      delBtn.addEventListener('click', () => handleDeleteSession(originalIndex));

      right.appendChild(minSpan);
      right.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(right);
      historyListEl.appendChild(li);
    });
  }

  // --- Utilidad de Escape HTML ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Manejo del Tooltip del Calendario ---
  function showCalendarTooltip(e, dateStr, daySessions, totalMins) {
    if (!calTooltipEl) return;

    const d = parseLocalDate(dateStr);
    const fullDateText = d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Agrupar materias y minutos
    const topicMap = new Map();
    daySessions.forEach(s => {
      const topicName = s.topic || 'Sesión de estudio';
      const mins = Number(s.minutes) || 0;
      topicMap.set(topicName, (topicMap.get(topicName) || 0) + mins);
    });

    let itemsHtml = '';
    topicMap.forEach((mins, topic) => {
      itemsHtml += `
        <li class="cal-tooltip-item">
          <span class="cal-tooltip-topic" title="${escapeHtml(topic)}">${escapeHtml(topic)}</span>
          <span class="cal-tooltip-time">${mins} min</span>
        </li>
      `;
    });

    calTooltipEl.innerHTML = `
      <div class="cal-tooltip-header">${fullDateText.charAt(0).toUpperCase() + fullDateText.slice(1)}</div>
      <div class="cal-tooltip-total">
        <span class="material-symbols-rounded">local_fire_department</span>
        <span>${totalMins} min totales (${daySessions.length} ${daySessions.length === 1 ? 'sesión' : 'sesiones'})</span>
      </div>
      <ul class="cal-tooltip-list">
        ${itemsHtml}
      </ul>
    `;

    calTooltipEl.classList.add('visible');
    calTooltipEl.setAttribute('aria-hidden', 'false');
    positionCalendarTooltip(e);
  }

  function positionCalendarTooltip(e) {
    if (!calTooltipEl || !calTooltipEl.classList.contains('visible')) return;

    const streakCard = document.getElementById('card-streak');
    if (!streakCard) return;

    const cardRect = streakCard.getBoundingClientRect();
    const tooltipRect = calTooltipEl.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (clientX === undefined && e.target) {
      const targetRect = e.target.getBoundingClientRect();
      clientX = targetRect.left + targetRect.width / 2;
      clientY = targetRect.top;
    }

    // Posicionamiento relativo a card-streak
    let left = clientX - cardRect.left - (tooltipRect.width / 2);
    let top = clientY - cardRect.top - tooltipRect.height - 10;

    // Mantener dentro de los bordes de la tarjeta
    if (left < 8) left = 8;
    if (left + tooltipRect.width > cardRect.width - 8) {
      left = cardRect.width - tooltipRect.width - 8;
    }
    if (top < 8) {
      // Si se sale por arriba, mostrar debajo del cursor
      top = clientY - cardRect.top + 20;
    }

    calTooltipEl.style.left = `${left}px`;
    calTooltipEl.style.top = `${top}px`;
  }

  function hideCalendarTooltip() {
    if (!calTooltipEl) return;
    calTooltipEl.classList.remove('visible');
    calTooltipEl.setAttribute('aria-hidden', 'true');
  }

  // --- Renderizado del Calendario Mensual ---
  function renderCalendar(sessions) {
    if (!calendarGridEl || !calMonthTitleEl) return;

    // Agrupar sesiones por fecha local 'AAAA-MM-DD'
    const sessionsByDate = new Map();
    sessions.forEach(s => {
      if (!sessionsByDate.has(s.date)) {
        sessionsByDate.set(s.date, []);
      }
      sessionsByDate.get(s.date).push(s);
    });

    // Título del mes
    const monthDate = new Date(calCurrentYear, calCurrentMonth, 1);
    const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    calMonthTitleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Calcular días y offsets (Semana española: Lunes = 0, Domingo = 6)
    const firstDayIndex = (monthDate.getDay() + 6) % 7;
    const totalDaysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    const todayStr = formatLocalDate(new Date());

    calendarGridEl.innerHTML = '';

    // Celdas vacías previas
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      calendarGridEl.appendChild(emptyCell);
    }

    // Días del mes
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthStr = String(calCurrentMonth + 1).padStart(2, '0');
      const dayStrFormatted = String(day).padStart(2, '0');
      const dateStr = `${calCurrentYear}-${monthStr}-${dayStrFormatted}`;

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;

      const isToday = (dateStr === todayStr);
      if (isToday) {
        cell.classList.add('is-today');
      }

      const daySessions = sessionsByDate.get(dateStr) || [];
      if (daySessions.length > 0) {
        cell.classList.add('has-study');
        cell.setAttribute('tabindex', '0');

        const totalMins = daySessions.reduce((acc, curr) => acc + (Number(curr.minutes) || 0), 0);
        cell.setAttribute('aria-label', `${day} de ${monthName}: ${daySessions.length} sesión(es), ${totalMins} min de estudio`);

        // Eventos interactivos para tooltip
        cell.addEventListener('mouseenter', (e) => showCalendarTooltip(e, dateStr, daySessions, totalMins));
        cell.addEventListener('mousemove', (e) => positionCalendarTooltip(e));
        cell.addEventListener('mouseleave', hideCalendarTooltip);
        cell.addEventListener('focus', (e) => showCalendarTooltip(e, dateStr, daySessions, totalMins));
        cell.addEventListener('blur', hideCalendarTooltip);
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') hideCalendarTooltip();
        });
      }

      calendarGridEl.appendChild(cell);
    }
  }

  function renderAll() {
    const sessions = loadSessions();
    renderStreakAndStats(sessions);
    renderCalendar(sessions);
    renderHistory(sessions);
  }

  // --- Handlers de Interacción ---

  function handlePrevMonth() {
    calCurrentMonth--;
    if (calCurrentMonth < 0) {
      calCurrentMonth = 11;
      calCurrentYear--;
    }
    hideCalendarTooltip();
    renderCalendar(loadSessions());
  }

  function handleNextMonth() {
    calCurrentMonth++;
    if (calCurrentMonth > 11) {
      calCurrentMonth = 0;
      calCurrentYear++;
    }
    hideCalendarTooltip();
    renderCalendar(loadSessions());
  }

  function handleTodayMonth() {
    const now = new Date();
    calCurrentYear = now.getFullYear();
    calCurrentMonth = now.getMonth();
    hideCalendarTooltip();
    renderCalendar(loadSessions());
  }

  function showFormError(inputEl, message) {
    if (formErrorMsgEl) {
      formErrorMsgEl.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">error</span><span>${escapeHtml(message)}</span>`;
      formErrorMsgEl.style.display = 'flex';
    }
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.focus();
    }
    announceA11y(`Error: ${message}`);
  }

  function clearFormErrors() {
    if (formErrorMsgEl) {
      formErrorMsgEl.style.display = 'none';
      formErrorMsgEl.textContent = '';
    }
    if (inputTopicEl) inputTopicEl.removeAttribute('aria-invalid');
    if (inputMinutesEl) inputMinutesEl.removeAttribute('aria-invalid');
    if (inputDateEl) inputDateEl.removeAttribute('aria-invalid');
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const topic = inputTopicEl.value.trim();
    const minutes = parseInt(inputMinutesEl.value, 10);
    const date = inputDateEl.value.trim();

    clearFormErrors();

    if (!topic) {
      showFormError(inputTopicEl, 'Por favor, introduce la materia o tema estudiado.');
      return;
    }

    if (isNaN(minutes) || minutes <= 0) {
      showFormError(inputMinutesEl, 'Por favor, introduce un número de minutos válido (mayor a 0).');
      return;
    }

    if (!date) {
      showFormError(inputDateEl, 'Por favor, selecciona una fecha.');
      return;
    }

    const sessions = loadSessions();
    const newSession = {
      date: date,
      topic: topic,
      minutes: minutes
    };

    sessions.push(newSession);
    saveSessions(sessions);

    // Si la sesión agregada es de otro mes, ajustamos la vista del calendario
    const sessionDateObj = parseLocalDate(date);
    calCurrentYear = sessionDateObj.getFullYear();
    calCurrentMonth = sessionDateObj.getMonth();

    // Reset de campos
    inputTopicEl.value = '';
    inputMinutesEl.value = '';
    inputTopicEl.focus();

    renderAll();
    announceA11y(`Sesión de ${topic} de ${minutes} minutos guardada correctamente.`);
  }

  function handleDeleteSession(index) {
    const sessions = loadSessions();
    if (index >= 0 && index < sessions.length) {
      const sessionToDelete = sessions[index];
      const confirmDelete = window.confirm(
        `¿Eliminar la sesión "${sessionToDelete.topic}" (${sessionToDelete.minutes} min) del ${sessionToDelete.date}?`
      );
      if (confirmDelete) {
        sessions.splice(index, 1);
        saveSessions(sessions);
        hideCalendarTooltip();
        renderAll();
        announceA11y(`Sesión de ${sessionToDelete.topic} eliminada.`);
      }
    }
  }

  // --- Inicialización ---
  function init() {
    renderHeaderDate();

    // Cargar configuración de fondo
    const config = loadConfig();
    applyBackground(config.background);

    if (bgSelectEl) {
      bgSelectEl.addEventListener('change', handleBackgroundChange);
    }

    // Controles de navegación del calendario mensual
    if (btnCalPrevEl) btnCalPrevEl.addEventListener('click', handlePrevMonth);
    if (btnCalNextEl) btnCalNextEl.addEventListener('click', handleNextMonth);
    if (btnCalTodayEl) btnCalTodayEl.addEventListener('click', handleTodayMonth);

    // Establecer fecha de hoy por defecto en el input (fecha local)
    if (inputDateEl) {
      const todayStr = formatLocalDate(new Date());
      inputDateEl.value = todayStr;
    }

    if (sessionFormEl) {
      sessionFormEl.addEventListener('submit', handleFormSubmit);
    }

    renderAll();
  }

  // --- Módulo del Temporizador Pomodoro ---

  /**
   * Obtiene la duración configurada en segundos según el modo y fase actuales.
   */
  function getPhaseDurationSeconds(mode, phase) {
    if (mode === 'pomodoro') {
      if (phase === 'focus') return 25 * 60;
      // Descanso largo cada 4 ciclos (15 min) o corto (5 min)
      return (timerCycleCount % 4 === 0) ? 15 * 60 : 5 * 60;
    } else if (mode === 'deep') {
      if (phase === 'focus') return 50 * 60;
      return 10 * 60;
    } else if (mode === 'custom') {
      const focusMins = Math.max(1, Math.min(180, parseInt(customFocusMinutesEl ? customFocusMinutesEl.value : 30, 10) || 30));
      const breakMins = Math.max(1, Math.min(60, parseInt(customBreakMinutesEl ? customBreakMinutesEl.value : 5, 10) || 5));
      return phase === 'focus' ? focusMins * 60 : breakMins * 60;
    }
    return 25 * 60;
  }

  /**
   * Formatea segundos a MM:SS
   */
  function formatTimerDigits(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Actualiza el display visual del temporizador, la barra de progreso y el título.
   */
  function updateTimerDisplay() {
    if (!timerDigitsEl) return;

    // Actualizar texto numérico
    timerDigitsEl.textContent = formatTimerDigits(timerSecondsLeft);

    // Actualizar anillo SVG circular
    if (timerRingBarEl) {
      const fraction = timerTotalSeconds > 0 ? (timerSecondsLeft / timerTotalSeconds) : 0;
      const offset = FULL_DASH_ARRAY * (1 - fraction);
      timerRingBarEl.style.strokeDashoffset = offset;
    }

    // Actualizar etiqueta de fase
    if (timerPhaseLabelEl) {
      if (timerPhase === 'focus') {
        timerPhaseLabelEl.textContent = 'Enfoque';
      } else {
        const isLongBreak = (timerMode === 'pomodoro' && timerCycleCount % 4 === 0);
        timerPhaseLabelEl.textContent = isLongBreak ? 'Descanso Largo' : 'Descanso Corto';
      }
    }

    // Actualizar indicador de ciclo
    if (timerCycleIndicatorEl) {
      timerCycleIndicatorEl.textContent = `Ciclo ${timerCycleCount} / 4`;
    }

    // Actualizar badge de estado
    if (timerBadgeEl) {
      if (!timerIsRunning && timerSecondsLeft === timerTotalSeconds) {
        timerBadgeEl.textContent = 'Listo';
        timerBadgeEl.className = 'card-badge badge-secondary';
      } else if (timerIsRunning) {
        if (timerPhase === 'focus') {
          timerBadgeEl.textContent = 'Enfoque';
          timerBadgeEl.className = 'card-badge badge-primary';
        } else {
          timerBadgeEl.textContent = 'Descanso';
          timerBadgeEl.className = 'card-badge badge-accent';
        }
      } else {
        timerBadgeEl.textContent = 'Pausa';
        timerBadgeEl.className = 'card-badge badge-coral';
      }
    }

    // Actualizar clase en tarjeta según fase
    if (cardTimerEl) {
      if (timerPhase === 'break') {
        cardTimerEl.classList.add('phase-break');
      } else {
        cardTimerEl.classList.remove('phase-break');
      }
    }

    // Actualizar título de la pestaña del navegador
    if (timerIsRunning) {
      const phasePrefix = timerPhase === 'focus' ? '🎯' : '☕';
      document.title = `${formatTimerDigits(timerSecondsLeft)} ${phasePrefix} | Dashboard de Estudio`;
    } else {
      document.title = 'Dashboard de Estudio';
    }
  }

  /**
   * Alarma sonora (hook preparado para recibir archivos de audio).
   */
  function playAlarmSound() {
    console.log('Alarma de temporizador disparada');
  }

  /**
   * Muestra la alerta de finalización con mensaje personalizado.
   */
  function showTimerAlert(message) {
    if (!timerFinishAlertEl || !timerAlertTextEl) return;

    if (timerAlertTimeout) {
      clearTimeout(timerAlertTimeout);
    }

    timerAlertTextEl.textContent = message;
    timerFinishAlertEl.style.display = 'flex';

    if (cardTimerEl) {
      cardTimerEl.classList.add('alarm-active');
    }

    timerAlertTimeout = setTimeout(() => {
      timerFinishAlertEl.style.display = 'none';
      if (cardTimerEl) {
        cardTimerEl.classList.remove('alarm-active');
      }
    }, 7000);
  }

  /**
   * Finaliza la fase actual: registra sesión si es focus y conmuta de fase.
   */
  function handleTimerComplete() {
    stopTimerInterval();
    playAlarmSound();

    if (timerPhase === 'focus') {
      // Registrar sesión de estudio automáticamente
      const focusMinutes = Math.max(1, Math.round(timerTotalSeconds / 60));
      const topicName = (timerTopicInputEl && timerTopicInputEl.value.trim())
        ? timerTopicInputEl.value.trim()
        : 'Enfoque';
      const todayStr = formatLocalDate(new Date());

      const sessions = loadSessions();
      sessions.push({
        date: todayStr,
        topic: topicName,
        minutes: focusMinutes
      });
      saveSessions(sessions);
      renderAll();

      showTimerAlert(`¡Sesión de ${focusMinutes} min ("${topicName}") completada y guardada!`);
      announceA11y(`¡Sesión de enfoque de ${focusMinutes} minutos completada y guardada en tu racha!`);

      // Pasar a fase de descanso
      timerPhase = 'break';
      timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
      timerSecondsLeft = timerTotalSeconds;
      setTimerButtonState(false);
      updateTimerDisplay();
    } else {
      // Fin del descanso
      showTimerAlert('¡Descanso finalizado! Listo para continuar enfocándote.');
      announceA11y('Descanso finalizado. Listo para continuar enfocándote.');
      timerCycleCount = (timerCycleCount % 4) + 1;
      timerPhase = 'focus';
      timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
      timerSecondsLeft = timerTotalSeconds;
      setTimerButtonState(false);
      updateTimerDisplay();
    }
  }

  /**
   * Ticker de intervalo con compensación precisa usando Date.now()
   */
  function tickTimer() {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
    timerSecondsLeft = remaining;

    if (timerSecondsLeft <= 0) {
      handleTimerComplete();
    } else {
      updateTimerDisplay();
    }
  }

  function startTimerInterval() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerEndTime = Date.now() + (timerSecondsLeft * 1000);
    timerIntervalId = setInterval(tickTimer, 250);
  }

  function stopTimerInterval() {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
    timerIsRunning = false;
  }

  function setTimerButtonState(running) {
    timerIsRunning = running;
    if (timerMainIconEl) {
      timerMainIconEl.textContent = running ? 'pause' : 'play_arrow';
    }
    if (timerMainTextEl) {
      timerMainTextEl.textContent = running ? 'Pausar' : 'Iniciar';
    }
  }

  function toggleTimer() {
    if (timerIsRunning) {
      // Pausar
      stopTimerInterval();
      setTimerButtonState(false);
      updateTimerDisplay();
    } else {
      // Iniciar / Reanudar
      if (timerSecondsLeft <= 0) {
        timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
        timerSecondsLeft = timerTotalSeconds;
      }
      timerIsRunning = true;
      setTimerButtonState(true);
      startTimerInterval();
      updateTimerDisplay();
    }
  }

  function resetTimer() {
    stopTimerInterval();
    setTimerButtonState(false);
    timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
    timerSecondsLeft = timerTotalSeconds;
    if (cardTimerEl) cardTimerEl.classList.remove('alarm-active');
    if (timerFinishAlertEl) timerFinishAlertEl.style.display = 'none';
    updateTimerDisplay();
  }

  function skipTimerPhase() {
    stopTimerInterval();
    setTimerButtonState(false);

    if (timerPhase === 'focus') {
      timerPhase = 'break';
    } else {
      timerPhase = 'focus';
      timerCycleCount = (timerCycleCount % 4) + 1;
    }

    timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
    timerSecondsLeft = timerTotalSeconds;
    if (cardTimerEl) cardTimerEl.classList.remove('alarm-active');
    if (timerFinishAlertEl) timerFinishAlertEl.style.display = 'none';
    updateTimerDisplay();
  }

  function switchTimerMode(newMode) {
    if (timerMode === newMode) return;

    timerMode = newMode;
    stopTimerInterval();
    setTimerButtonState(false);

    // Actualizar tabs activas
    timerModeBtns.forEach(btn => {
      const isSelected = btn.getAttribute('data-mode') === newMode;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // Mostrar/ocultar configuración personalizada
    if (timerCustomConfigEl) {
      timerCustomConfigEl.style.display = (newMode === 'custom') ? 'block' : 'none';
    }

    timerPhase = 'focus';
    timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
  }

  function handleCustomMinutesChange() {
    if (timerMode === 'custom' && !timerIsRunning) {
      timerTotalSeconds = getPhaseDurationSeconds('custom', timerPhase);
      timerSecondsLeft = timerTotalSeconds;
      updateTimerDisplay();
    }
  }

  function initTimer() {
    // Event listeners para los botones de modo con soporte para teclado WAI-ARIA tablist
    const tabArray = Array.from(timerModeBtns);
    timerModeBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        switchTimerMode(mode);
      });

      btn.addEventListener('keydown', (e) => {
        let targetIndex = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = (index + 1) % tabArray.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex = (index - 1 + tabArray.length) % tabArray.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = tabArray.length - 1;
        }

        if (targetIndex !== -1) {
          tabArray[targetIndex].focus();
          const mode = tabArray[targetIndex].getAttribute('data-mode');
          switchTimerMode(mode);
        }
      });
    });

    // Inputs de tiempo personalizado
    if (customFocusMinutesEl) {
      customFocusMinutesEl.addEventListener('input', handleCustomMinutesChange);
    }
    if (customBreakMinutesEl) {
      customBreakMinutesEl.addEventListener('input', handleCustomMinutesChange);
    }

    // Controles de acción
    if (btnTimerToggleEl) {
      btnTimerToggleEl.addEventListener('click', toggleTimer);
    }
    if (btnTimerResetEl) {
      btnTimerResetEl.addEventListener('click', resetTimer);
    }
    if (btnTimerSkipEl) {
      btnTimerSkipEl.addEventListener('click', skipTimerPhase);
    }

    // Estado inicial
    timerTotalSeconds = getPhaseDurationSeconds(timerMode, timerPhase);
    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
  }

  // --- Módulo Reloj Central Fliqlo ---

  function updateFlipClockDigits() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (flipHoursEl) flipHoursEl.textContent = hours;
    if (flipMinutesEl) flipMinutesEl.textContent = minutes;
    if (flipSecondsEl) flipSecondsEl.textContent = seconds;
  }

  function startFlipClock() {
    updateFlipClockDigits();
    if (flipClockIntervalId) clearInterval(flipClockIntervalId);
    flipClockIntervalId = setInterval(updateFlipClockDigits, 1000);
  }

  function stopFlipClock() {
    if (flipClockIntervalId) {
      clearInterval(flipClockIntervalId);
      flipClockIntervalId = null;
    }
  }

  function setFlipClockState(show, save = true) {
    if (!flipClockWrapperEl || !switchClockEl) return;
    switchClockEl.checked = show;
    switchClockEl.setAttribute('aria-checked', String(show));

    if (show) {
      flipClockWrapperEl.style.display = 'block';
      startFlipClock();
    } else {
      flipClockWrapperEl.style.display = 'none';
      stopFlipClock();
    }

    if (save) {
      const config = loadConfig();
      config.showClock = show;
      saveConfig(config);
      announceA11y(show ? 'Reloj central activado.' : 'Reloj central ocultado.');
    }
  }

  // --- Módulo Recordatorio de Agua ---

  function showWaterToast() {
    if (!waterReminderToastEl) return;
    waterReminderToastEl.style.display = 'flex';
    announceA11y('¡Recordatorio de agua! Es momento de tomar un vaso de agua.');
  }

  function hideWaterToast() {
    if (!waterReminderToastEl) return;
    waterReminderToastEl.style.display = 'none';
  }

  function startWaterReminderTimer() {
    if (waterReminderIntervalId) clearInterval(waterReminderIntervalId);
    waterReminderIntervalId = setInterval(() => {
      showWaterToast();
    }, WATER_REMINDER_MS);
  }

  function stopWaterReminderTimer() {
    if (waterReminderIntervalId) {
      clearInterval(waterReminderIntervalId);
      waterReminderIntervalId = null;
    }
    hideWaterToast();
  }

  function setWaterReminderState(active, save = true) {
    if (!switchWaterEl) return;
    switchWaterEl.checked = active;
    switchWaterEl.setAttribute('aria-checked', String(active));

    if (active) {
      startWaterReminderTimer();
    } else {
      stopWaterReminderTimer();
    }

    if (save) {
      const config = loadConfig();
      config.waterReminder = active;
      saveConfig(config);
      announceA11y(active ? 'Recordatorio de agua activado cada 45 minutos.' : 'Recordatorio de agua desactivado.');
    }
  }

  // --- Módulo Modal de Métricas ---

  function openMetricsModal() {
    if (!metricsModalEl) return;
    const sessions = loadSessions();
    const streakInfo = calculateStreak(sessions);

    if (metricsModalBestStreakEl) {
      metricsModalBestStreakEl.textContent = `${streakInfo.currentStreak} días`;
    }
    if (metricsModalTotalSessionsEl) {
      metricsModalTotalSessionsEl.textContent = `${sessions.length}`;
    }
    if (metricsModalTotalHoursEl) {
      const totalMin = sessions.reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
      const hours = (totalMin / 60).toFixed(1).replace('.0', '');
      metricsModalTotalHoursEl.textContent = `${hours} h`;
    }

    metricsModalEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    announceA11y('Ventana de Métricas y Actividad abierta.');

    if (btnCloseMetricsEl) {
      btnCloseMetricsEl.focus();
    }
  }

  function closeMetricsModal() {
    if (!metricsModalEl) return;
    metricsModalEl.style.display = 'none';
    document.body.style.overflow = '';
    announceA11y('Ventana de Métricas cerrada.');

    if (btnOpenMetricsEl) {
      btnOpenMetricsEl.focus();
    }
  }

  function initSettingsAndModals() {
    const config = loadConfig();

    // Reloj Flip
    setFlipClockState(config.showClock, false);
    if (switchClockEl) {
      switchClockEl.addEventListener('change', (e) => {
        setFlipClockState(e.target.checked, true);
      });
    }

    // Recordatorio de Agua
    setWaterReminderState(config.waterReminder, false);
    if (switchWaterEl) {
      switchWaterEl.addEventListener('change', (e) => {
        setWaterReminderState(e.target.checked, true);
      });
    }
    if (btnCloseWaterToastEl) {
      btnCloseWaterToastEl.addEventListener('click', hideWaterToast);
    }

    // Modal de Métricas
    if (btnOpenMetricsEl) {
      btnOpenMetricsEl.addEventListener('click', openMetricsModal);
    }
    if (btnCloseMetricsEl) {
      btnCloseMetricsEl.addEventListener('click', closeMetricsModal);
    }
    if (metricsModalBackdropEl) {
      metricsModalBackdropEl.addEventListener('click', closeMetricsModal);
    }

    // Cierre con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && metricsModalEl && metricsModalEl.style.display === 'flex') {
        closeMetricsModal();
      }
    });
  }

  // --- Inicialización ---
  function init() {
    renderHeaderDate();

    // Cargar configuración de fondo (carga inicial directa)
    const config = loadConfig();
    applyBackground(config.background, true);

    if (bgSelectEl) {
      bgSelectEl.addEventListener('change', handleBackgroundChange);
    }

    // Controles de navegación del calendario mensual
    if (btnCalPrevEl) btnCalPrevEl.addEventListener('click', handlePrevMonth);
    if (btnCalNextEl) btnCalNextEl.addEventListener('click', handleNextMonth);
    if (btnCalTodayEl) btnCalTodayEl.addEventListener('click', handleTodayMonth);

    // Establecer fecha de hoy por defecto en el input (fecha local)
    if (inputDateEl) {
      const todayStr = formatLocalDate(new Date());
      inputDateEl.value = todayStr;
    }

    if (sessionFormEl) {
      sessionFormEl.addEventListener('submit', handleFormSubmit);
    }

    if (inputTopicEl) {
      inputTopicEl.addEventListener('input', () => {
        if (inputTopicEl.getAttribute('aria-invalid') === 'true') clearFormErrors();
      });
    }
    if (inputMinutesEl) {
      inputMinutesEl.addEventListener('input', () => {
        if (inputMinutesEl.getAttribute('aria-invalid') === 'true') clearFormErrors();
      });
    }
    if (inputDateEl) {
      inputDateEl.addEventListener('input', () => {
        if (inputDateEl.getAttribute('aria-invalid') === 'true') clearFormErrors();
      });
    }

    // Inicializar Temporizador Pomodoro
    initTimer();

    // Inicializar Ajustes, Reloj Flip y Modales
    initSettingsAndModals();

    // Inicializar Gestor de Minimización de Ventanas
    initMinimizedManager();

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
