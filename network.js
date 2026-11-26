/* ===== ADVANCED NETWORK DETECTION ===== */
const NETWORK_STATES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  NO_DATA: 'no_data',
  CHECKING: 'checking'
};

let currentNetworkState = NETWORK_STATES.CHECKING;
let networkCheckTimer = null;
const NETWORK_CHECK_INTERVAL = 15000;
const NETWORK_CHECK_URL = 'https://www.google.com/favicon.ico?_=';

function initNetworkDetection() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;

  checkNetworkState();

  window.addEventListener('online', () => {
    setTimeout(checkNetworkState, 500);
  });
  window.addEventListener('offline', () => {
    setNetworkState(NETWORK_STATES.OFFLINE);
  });

  networkCheckTimer = setInterval(checkNetworkState, NETWORK_CHECK_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkNetworkState();
    }
  });
}

async function checkNetworkState() {
  if (!navigator.onLine) {
    setNetworkState(NETWORK_STATES.OFFLINE);
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(NETWORK_CHECK_URL + Date.now(), {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    setNetworkState(NETWORK_STATES.ONLINE);
  } catch (err) {
    if (err.name === 'AbortError') {
      setNetworkState(NETWORK_STATES.NO_DATA);
    } else {
      const connType = getConnectionType();
      if (connType === 'cellular' || connType === '4g' || connType === '3g' || connType === '2g') {
        setNetworkState(NETWORK_STATES.NO_DATA);
      } else {
        setNetworkState(NETWORK_STATES.OFFLINE);
      }
    }
  }
}

function getConnectionType() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    return conn.effectiveType || conn.type || 'unknown';
  }
  return 'unknown';
}

function setNetworkState(state) {
  if (currentNetworkState === state) return;
  const prevState = currentNetworkState;
  currentNetworkState = state;

  const banner = document.getElementById('offlineBanner');
  if (!banner) return;

  const iconEl = banner.querySelector('svg');
  const textEl = banner.querySelector('span');

  banner.classList.remove('visible', 'no-data', 'offline-state');
  document.body.classList.remove('offline', 'no-data');

  switch (state) {
    case NETWORK_STATES.ONLINE:
      if (prevState !== NETWORK_STATES.CHECKING) {
        showToast('Connected', 'Your internet connection is active.', 'success');
      }
      break;

    case NETWORK_STATES.OFFLINE:
      banner.classList.add('visible', 'offline-state');
      document.body.classList.add('offline');
      if (iconEl) iconEl.innerHTML = '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"></path>';
      if (textEl) textEl.textContent = 'No internet connection';
      if (prevState === NETWORK_STATES.ONLINE) {
        showToast('Disconnected', 'You have lost your internet connection.', 'error');
      }
      break;

    case NETWORK_STATES.NO_DATA:
      banner.classList.add('visible', 'no-data');
      document.body.classList.add('no-data');
      if (iconEl) iconEl.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>';
      if (textEl) textEl.textContent = 'No data bundles — Connect to WiFi or buy data';
      if (prevState === NETWORK_STATES.ONLINE) {
        showToast('No Data', 'Your data bundles may have run out. Please check your balance.', 'error');
      }
      break;
  }
}

function stopNetworkChecks() {
  if (networkCheckTimer) {
    clearInterval(networkCheckTimer);
    networkCheckTimer = null;
  }
}

/* ===== PULL TO REFRESH (silent — no visible indicator) ===== */
const PTR_THRESHOLD = 45;
let ptrStartY = 0;
let ptrCurrentDist = 0;
let ptrActive = false;
let ptrRefreshing = false;
let ptrPointerDown = false;

function ptrOverlaysOpen() {
  const playerShell = document.getElementById('playerShell');
  const playerTheaterOpen = !!(playerShell && playerShell.classList.contains('open') && !playerShell.classList.contains('pip'));
  return playerTheaterOpen
    || document.getElementById('pinModalOverlay').classList.contains('active')
    || document.getElementById('confirmModalOverlay').classList.contains('active')
    || document.getElementById('devicePopupOverlay').classList.contains('active')
    || document.getElementById('subGateOverlay').classList.contains('active')
    || document.getElementById('eventChannelsOverlay').classList.contains('active')
    || document.getElementById('sidebar').classList.contains('open')
    || document.getElementById('loginOverlay').style.display !== 'none'
    || !document.getElementById('initOverlay').classList.contains('hidden');
}
