/* ===== FIREBASE ===== */
const firebaseConfig = {
  apiKey: "AIzaSyBsneacRpbQK5X1sakAhtWzpgWzawAnRBw",
  authDomain: "onstreamtv.firebaseapp.com",
  projectId: "onstreamtv",
  storageBucket: "onstreamtv.appspot.com",
  messagingSenderId: "440010537719",
  appId: "1:440010537719:web:8ab64d45df5b6958c1f1f2",
  measurementId: "G-ZDD761J2MQ"
};

let firebaseApp = null;
let firebaseAuth = null;
let currentUser = null;
let subData = null;
let subPollTimer = null;

function initFirebase() {
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseAuth.onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        hideInit();
        onAuthSuccess(user);
      } else {
        hideInit();
        showLogin();
      }
    });
  } catch (e) {
    console.error('Firebase init error:', e);
    hideInit();
    showToast('Error', 'Failed to initialize auth system.', 'error');
    showLogin();
  }
}

function hideInit() {
  document.getElementById('initOverlay').classList.add('hidden');
}

/* ===== DEVICE MANAGEMENT ===== */
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_STORAGE_KEY, id);
  }
  return id;
}

function generateDeviceFingerprint() {
  const raw = navigator.userAgent + '|' + screen.width + 'x' + screen.height + '|' + navigator.language;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(36).substring(0, 8);
}

const deviceId = getDeviceId();
const deviceFingerprint = generateDeviceFingerprint();
const fullDeviceId = deviceId + '_' + deviceFingerprint;

/* ===== PASTEFY API ===== */
async function pastefyGet(pasteId) {
  try {
    console.log('[Pastefy] Fetching paste:', pasteId);
    const r = await fetch('https://pastefy.app/api/v2/paste/' + pasteId, {
      headers: { 'Authorization': 'Bearer ' + PASTEFY_API_KEY }
    });
    console.log('[Pastefy] API status:', r.status);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[Pastefy] API error response:', text);
      return { error: 'HTTP ' + r.status + ' - ' + text.substring(0, 200) };
    }
    const data = await r.json();
    console.log('[Pastefy] API response keys:', Object.keys(data));
    return { data };
  } catch (e) {
    console.error('[Pastefy] API fetch error:', e.message);
    return { error: e.message };
  }
}

async function pastefyGetRaw(pasteId) {
  try {
    console.log('[Pastefy] Trying raw URL for:', pasteId);
    const r = await fetch('https://pastefy.app/' + pasteId + '/raw', {
      headers: { 'Authorization': 'Bearer ' + PASTEFY_API_KEY }
    });
    console.log('[Pastefy] Raw status:', r.status);
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const text = await r.text();
    console.log('[Pastefy] Raw response length:', text.length);
    return { text };
  } catch (e) {
    console.error('[Pastefy] Raw fetch error:', e.message);
    return { error: e.message };
  }
}

async function pastefyCreate(title, content, encrypted) {
  try {
    const r = await fetch('https://pastefy.app/api/v2/paste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + PASTEFY_API_KEY
      },
      body: JSON.stringify({ title, content, encrypted: !!encrypted })
    });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const data = await r.json();
    return { data };
  } catch (e) { return { error: e.message }; }
}

async function pastefyEdit(pasteId, title, content) {
  try {
    const r = await fetch('https://pastefy.app/api/v2/paste/' + pasteId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + PASTEFY_API_KEY
      },
      body: JSON.stringify({ title, content })
    });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const data = await r.json();
    return { data };
  } catch (e) { return { error: e.message }; }
}

async function pastefyDelete(pasteId) {
  try {
    const r = await fetch('https://pastefy.app/api/v2/paste/' + pasteId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + PASTEFY_API_KEY }
    });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    return { success: true };
  } catch (e) { return { error: e.message }; }
}

/* ===== SUBSCRIPTION MANAGER ===== */
async function fetchSubscriptionIndex() {
  console.log('[SubManager] Loading subscription index...');

  const apiResult = await pastefyGet(SUBSCRIPTION_PASTE_ID);
  if (!apiResult.error && apiResult.data) {
    try {
      const paste = apiResult.data;
      console.log('[SubManager] API response type:', typeof paste);
      console.log('[SubManager] API has content?', !!paste.content);
      console.log('[SubManager] API has paste.content?', !!(paste.paste && paste.paste.content));

      const rawContent = paste.paste ? paste.paste.content : paste.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent);
        console.log('[SubManager] Parsed via API. Subscriptions count:', parsed.subscriptions ? parsed.subscriptions.length : 0);
        return parsed;
      }
    } catch (e) {
      console.error('[SubManager] API parse error:', e.message);
    }
  } else if (apiResult.error) {
    console.error('[SubManager] API failed:', apiResult.error);
  }

  const rawResult = await pastefyGetRaw(SUBSCRIPTION_PASTE_ID);
  if (!rawResult.error && rawResult.text) {
    try {
      const parsed = JSON.parse(rawResult.text);
      console.log('[SubManager] Parsed via raw URL. Subscriptions count:', parsed.subscriptions ? parsed.subscriptions.length : 0);
      return parsed;
    } catch (e) {
      console.error('[SubManager] Raw parse error:', e.message);
    }
  } else if (rawResult.error) {
    console.error('[SubManager] Raw URL failed:', rawResult.error);
  }

  console.error('[SubManager] All methods failed to load subscription index');
  return null;
}

async function fetchSubscriptionForEmail(email) {
  console.log('[SubManager] Looking up subscription for:', email);
  const index = await fetchSubscriptionIndex();
  if (!index) {
    console.error('[SubManager] Index is null');
    return null;
  }
  if (!index.subscriptions) {
    console.error('[SubManager] Index has no subscriptions array. Keys:', Object.keys(index));
    return null;
  }
  const normalizedEmail = email.toLowerCase().trim();
  console.log('[SubManager] Checking', index.subscriptions.length, 'subscriptions against:', normalizedEmail);
  const sub = index.subscriptions.find(s => {
    const match = s.subEmail && s.subEmail.toLowerCase().trim() === normalizedEmail;
    if (match) console.log('[SubManager] Found match:', s.subEmail, '| status:', s.status, '| expiry:', s.expiryDate);
    return match;
  });
  if (!sub) {
    console.log('[SubManager] No subscription found for:', normalizedEmail);
    console.log('[SubManager] Available emails:', index.subscriptions.map(s => s.subEmail).join(', '));
  }
  return sub || null;
}

function getDaysLeft(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isSubscriptionValid(sub) {
  if (!sub) return false;
  const days = getDaysLeft(sub.expiryDate);
  return days > 0 && sub.status === 'active';
}

async function refreshSubscriptionData() {
  if (!currentUser || !currentUser.email) {
    console.log('[SubManager] No current user, skipping refresh');
    return;
  }
  console.log('[SubManager] Refreshing subscription for:', currentUser.email);
  const sub = await fetchSubscriptionForEmail(currentUser.email);
  subData = sub;
  const days = sub ? getDaysLeft(sub.expiryDate) : 0;

  console.log('[SubManager] Refresh result - found:', !!sub, '| days:', days);
  updateSidebarStatus(sub, days);
}

async function checkSubscriptionBeforePlay() {
  if (!currentUser || !currentUser.email) {
    showToast('Login Required', 'Please sign in to watch channels.', 'error');
    return false;
  }
  console.log('[SubManager] Checking subscription before play for:', currentUser.email);
  const sub = await fetchSubscriptionForEmail(currentUser.email);
  subData = sub;
  const days = sub ? getDaysLeft(sub.expiryDate) : 0;
  const valid = isSubscriptionValid(sub);

  console.log('[SubManager] Play check - found:', !!sub, '| days:', days, '| valid:', valid);
  updateSidebarStatus(sub, days);

  if (!valid) {
    showSubGate(days, sub);
    return false;
  }
  return true;
}

function updateSidebarStatus(sub, days) {
  const statusEl = document.getElementById('sidebarUserStatus');
  if (!statusEl) return;
  if (sub && days > 0) {
    statusEl.textContent = days + ' days left';
    statusEl.style.color = days <= 3 ? 'var(--accent)' : 'var(--success)';
  } else {
    statusEl.textContent = 'No active subscription';
    statusEl.style.color = 'var(--accent)';
  }
}

/* ===== SUBSCRIPTION GATE ===== */
function showSubGate(days, sub) {
  const overlay = document.getElementById('subGateOverlay');
  const desc = document.getElementById('subGateDesc');
  const daysEl = document.getElementById('subGateDays');
  const actionBtn = document.getElementById('subGateActionBtn');

  if (!sub) {
    desc.textContent = 'No subscription found for ' + currentUser.email + '. Please subscribe to continue watching.';
    daysEl.textContent = '0';
    daysEl.style.color = 'var(--accent)';
  } else if (sub.status !== 'active') {
    desc.textContent = 'Your subscription status is "' + sub.status + '". Please renew to continue watching.';
    daysEl.textContent = '0';
    daysEl.style.color = 'var(--accent)';
  } else if (days <= 0) {
    desc.textContent = 'Your subscription expired on ' + new Date(sub.expiryDate).toLocaleDateString() + '. Please renew to continue watching.';
    daysEl.textContent = '0';
    daysEl.style.color = 'var(--accent)';
  } else {
    desc.textContent = 'Your subscription is active. Enjoy watching!';
    daysEl.textContent = String(days);
    daysEl.style.color = days <= 3 ? 'var(--accent)' : 'var(--success)';
  }

  actionBtn.onclick = () => {
    window.location.href = 'go:payment';
  };
  document.getElementById('subGateCloseBtn').onclick = () => {
    overlay.classList.remove('active');
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  overlay.classList.add('active');
}

function hideSubGate() {
  document.getElementById('subGateOverlay').classList.remove('active');
}

/* ===== DEVICE CHECK ===== */
async function checkDeviceConflict() {
  if (!currentUser) return false;
  console.log('[Device] Checking device conflict for:', currentUser.email);
  const sub = await fetchSubscriptionForEmail(currentUser.email);
  if (!sub) {
    console.log('[Device] No subscription found, skipping device check');
    return false;
  }

  const connected = sub.connectedDevices || [];
  const limit = sub.deviceLimit || 1;

  console.log('[Device] Connected:', connected.length + '/' + limit, '| This device:', deviceId);

  if (connected.includes(deviceId)) {
    console.log('[Device] Device already connected, access granted');
    return false;
  }

  if (connected.length < limit) {
    console.log('[Device] Under limit, adding device...');
    await addDeviceToSubscription(sub, deviceId);
    return false;
  }

  console.log('[Device] Limit reached, showing popup');
  const otherDevice = connected[0] || 'unknown';
  showDevicePopup(otherDevice, limit);
  return true;
}

async function addDeviceToSubscription(sub, devId) {
  const index = await fetchSubscriptionIndex();
  if (!index || !index.subscriptions) return;
  const idx = index.subscriptions.findIndex(s => s.subEmail && s.subEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
  if (idx >= 0) {
    if (!index.subscriptions[idx].connectedDevices) index.subscriptions[idx].connectedDevices = [];
    if (!index.subscriptions[idx].connectedDevices.includes(devId)) {
      index.subscriptions[idx].connectedDevices.push(devId);
    }
    index.subscriptions[idx].updatedAt = new Date().toISOString();
    await pastefyEdit(SUBSCRIPTION_PASTE_ID, 'Subscription Master Index', JSON.stringify(index, null, 2));
  }
}

async function removeDeviceFromSubscription(sub, devIdToRemove) {
  try {
    const index = await fetchSubscriptionIndex();
    if (!index || !index.subscriptions) return false;
    const idx = index.subscriptions.findIndex(s => s.subEmail && s.subEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
    if (idx >= 0) {
      const subEntry = index.subscriptions[idx];
      subEntry.connectedDevices = (subEntry.connectedDevices || []).filter(d => d !== devIdToRemove);
      subEntry.updatedAt = new Date().toISOString();
      const result = await pastefyEdit(SUBSCRIPTION_PASTE_ID, 'Subscription Master Index', JSON.stringify(index, null, 2));
      return !result.error;
    }
    return false;
  } catch (e) {
    console.error('[Device] Remove error:', e);
    return false;
  }
}

function showDevicePopup(otherDeviceId, limit) {
  const overlay = document.getElementById('devicePopupOverlay');
  document.getElementById('devicePopupCurrentId').textContent = deviceId;
  document.getElementById('devicePopupOtherId').textContent = otherDeviceId;

  document.getElementById('devicePopupCancel').onclick = () => {
    overlay.classList.remove('active');
    performLogout();
  };

  document.getElementById('devicePopupRemove').onclick = async () => {
    overlay.classList.remove('active');
    await removeDeviceFromSubscription(subData, otherDeviceId);
    await addDeviceToSubscription(subData, deviceId);
    showToast('Device Updated', 'This device is now linked to your account.', 'success');
    await refreshSubscriptionData();
  };

  overlay.classList.add('active');
}

/* ===== AUTH FLOW ===== */
function showLogin() {
  stopSportsTicker();
  document.body.classList.remove('profile-active', 'sports-active', 'favorites-active', 'history-active');
  document.getElementById('sportsPage').classList.remove('active');
  document.getElementById('favoritesPage').classList.remove('active');
  document.getElementById('historyPage').classList.remove('active');
  document.getElementById('loginOverlay').style.display = 'flex';
  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  hideSubGate();
  if (subPollTimer) { clearInterval(subPollTimer); subPollTimer = null; }
  hideInit();
}

function hideLogin() {
  document.getElementById('loginOverlay').style.display = 'none';
}

async function onAuthSuccess(user) {
  hideLogin();
  document.getElementById('sidebarUser').style.display = 'block';
  document.getElementById('sidebarUserEmail').textContent = user.email;
  const avatarInitial = document.getElementById('sidebarUserInitial');
  if (avatarInitial && user.email) {
    avatarInitial.textContent = user.email.trim().charAt(0).toUpperCase();
  }
  document.getElementById('sidebarDeviceInfo').style.display = 'block';
  document.getElementById('sidebarDeviceId').textContent = deviceId;
  document.getElementById('sidebarLogoutBtn').style.display = 'flex';
  document.getElementById('navProfile').style.display = 'flex';

  const hasConflict = await checkDeviceConflict();
  if (hasConflict) return;

  await refreshSubscriptionData();

  if (subPollTimer) clearInterval(subPollTimer);
  subPollTimer = setInterval(async () => {
    if (currentUser) await refreshSubscriptionData();
  }, SUB_POLL_INTERVAL);
}

async function performLogin() {
  if (firebaseAuth.currentUser) {
    hideLogin();
    return;
  }
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    errorEl.textContent = 'Please enter both email and password.';
    return;
  }

  if (isSignUpMode) {
    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match.';
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      return;
    }
  }

  btn.disabled = true;
  btn.classList.add('loading');
  errorEl.textContent = '';

  try {
    if (isSignUpMode) {
      await firebaseAuth.createUserWithEmailAndPassword(email, password);
      showToast('Account Created', 'Welcome to ZedStream! Please subscribe to start watching.', 'success');
    } else {
      await firebaseAuth.signInWithEmailAndPassword(email, password);
    }
  } catch (e) {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (isSignUpMode) {
      if (e.code === 'auth/email-already-in-use') errorEl.textContent = 'An account with this email already exists.';
      else if (e.code === 'auth/invalid-email') errorEl.textContent = 'Invalid email address.';
      else if (e.code === 'auth/weak-password') errorEl.textContent = 'Password is too weak. Use at least 6 characters.';
      else errorEl.textContent = e.message || 'Sign up failed.';
    } else {
      if (e.code === 'auth/user-not-found') errorEl.textContent = 'Account not found.';
      else if (e.code === 'auth/wrong-password') errorEl.textContent = 'Incorrect password.';
      else if (e.code === 'auth/invalid-email') errorEl.textContent = 'Invalid email address.';
      else if (e.code === 'auth/too-many-requests') errorEl.textContent = 'Too many attempts. Try again later.';
      else errorEl.textContent = e.message || 'Login failed.';
    }
  }
}

async function performLogout() {
  if (typeof closeVideoPlayer === 'function') closeVideoPlayer();
  if (subPollTimer) { clearInterval(subPollTimer); subPollTimer = null; }
  try {
    await firebaseAuth.signOut();
  } catch (e) {
    console.error('Logout error:', e);
  }
  currentUser = null;
  subData = null;
  document.getElementById('sidebarUser').style.display = 'none';
  document.getElementById('sidebarDeviceInfo').style.display = 'none';
  document.getElementById('sidebarLogoutBtn').style.display = 'none';
  document.getElementById('navProfile').style.display = 'none';
  showLiveTVPage();
  showLogin();
}

/* ===== STYLED CONFIRM MODAL ===== */
let confirmCallback = null;

function showConfirmModal(title, message, onConfirm, onCancel) {
  const overlay = document.getElementById('confirmModalOverlay');
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalDesc').textContent = message;

  const confirmBtn = document.getElementById('confirmModalConfirm');
  const cancelBtn = document.getElementById('confirmModalCancel');

  confirmCallback = (result) => {
    overlay.classList.remove('active');
    if (result && onConfirm) onConfirm();
    if (!result && onCancel) onCancel();
    confirmCallback = null;
  };

  confirmBtn.onclick = () => { if (confirmCallback) confirmCallback(true); };
  cancelBtn.onclick = () => { if (confirmCallback) confirmCallback(false); };

  overlay.classList.add('active');
}

/* ===== TOAST SYSTEM ===== */
function showToast(title, message, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icons = {
    success: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>',
    reminder: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></svg>'
  };
  toast.innerHTML = `
    <div class="toast-icon ${escapeHtml(type)}">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close">×</button>
  `;
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  });
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }
  }, 4000);
}

/* ===== SIDEBAR ===== */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuBtn = document.getElementById('menuBtn');
const sidebarClose = document.getElementById('sidebarClose');

function openSidebar() {
  if (typeof hideChannelPreview === 'function') hideChannelPreview();
  if (typeof minimizePlayerIfTheater === 'function') minimizePlayerIfTheater();
  if (sidebar) sidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('open');
}
function closeSidebar() {
  if (sidebar) sidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('open');
}
if (menuBtn) menuBtn.addEventListener('click', openSidebar);
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
    closeSidebar();
  }
});

const copyDevBtn = document.getElementById('sidebarDeviceCopy');
if (copyDevBtn) {
  copyDevBtn.addEventListener('click', () => {
    const idText = document.getElementById('sidebarDeviceId')?.textContent;
    if (!idText || idText === '—') return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(idText).then(() => {
        showToast('Copied', 'Device ID copied to clipboard.', 'success');
      }).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = idText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Copied', 'Device ID copied to clipboard.', 'success');
      } catch (e) {}
      ta.remove();
    }
  });
}

/* ===== LIVE TV SYSTEM ===== */
let liveChannels = [];
let comingUpNext = [];
let comingUpTimer = null;
let comingUpAutoTimer = null;
let comingUpAutoPaused = false;
let comingUpAutoRow = null;
const LIVE_CATEGORY_ORDER = [
  'all',
  'movies',
  'movies_series',
  'news',
  'sports',
  'entertainment',
  'kids',
  'documentary',
  'music',
  'lifestyle_travel',
  'religious',
  'mature',
  '18+'
];
const DEFAULT_LIVE_CATEGORIES = [
  'all',
  'movies',
  'movies_series',
  'news',
  'sports',
  'entertainment',
  'kids',
  'documentary',
  'music',
  'lifestyle_travel',
  'religious'
];

let liveCategories = [...DEFAULT_LIVE_CATEGORIES];
let activeLiveCategory = 'all';
let liveSearchQuery = '';
let sportsCatalogData = null;
let activeSportFilter = 'all';
let activeSportStatus = 'all';
let sportsSearchQuery = '';
let sportsTicker = null;
let sportsTickCount = 0;
const SPORTS_BATCH_SIZE = 36;
let sportsVisibleLimit = SPORTS_BATCH_SIZE;
let sportsRenderedList = [];
let sportsGridDelegatedWired = false;

async function fetchLiveChannels() {
  try {
    const r = await fetch(LIVE_TV_API, { cache: 'no-store' });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const text = await r.text();
    if (!text || !text.trim()) return { error: 'Empty response' };
    let data;
    try { data = JSON.parse(text); } catch(e) { return { error: 'Invalid JSON' }; }
    return { data };
  } catch(e) { return { error: e.message || 'Network error' }; }
}

function sortCategoriesByPriority(categories) {
  return Array.from(categories).sort((a, b) => {
    const ia = LIVE_CATEGORY_ORDER.indexOf(a);
    const ib = LIVE_CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return String(a).localeCompare(String(b));
  });
}

function getLiveCategories(channels) {
  const cats = new Set();
  if (Array.isArray(channels) && channels.length > 0) {
    channels.forEach(c => {
      if (c && c.category) cats.add(String(c.category).trim());
    });
  }
  if (cats.size === 0) {
    DEFAULT_LIVE_CATEGORIES.forEach(c => { if (c !== 'all') cats.add(c); });
  }
  const ordered = sortCategoriesByPriority(cats);
  const allCats = ['all', ...ordered.filter(c => c !== 'all')];
  if (!matureUnlocked) return allCats.filter(c => c !== 'mature' && c !== '18+');
  return allCats;
}

function renderLiveCategoryChips(scrollActiveIntoView = false) {
  const container = document.getElementById('liveCategoryChips');
  if (!container) return;

  liveCategories = getLiveCategories(liveChannels);
  if (!liveCategories.includes(activeLiveCategory)) {
    activeLiveCategory = 'all';
  }

  container.innerHTML = liveCategories.map(cat => {
    const label = cat === 'all' ? 'All Channels' : formatCategoryLabel(cat);
    const isActive = cat === activeLiveCategory;
    return `<button type="button" class="live-category-chip ${isActive ? 'active' : ''}" data-cat="${escapeHtml(cat)}" role="tab" aria-selected="${isActive ? 'true' : 'false'}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
  }).join('');

  container.querySelectorAll('.live-category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const nextCat = chip.dataset.cat || 'all';
      if (typeof hideChannelPreview === 'function') hideChannelPreview();
      activeLiveCategory = nextCat;
      renderLiveCategoryChips(true);
      renderLiveChannels();
    });
  });

  if (scrollActiveIntoView) {
    const activeChip = container.querySelector('.live-category-chip.active');
    if (activeChip && typeof activeChip.scrollIntoView === 'function') {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
}

const CHANNEL_VIEW_STORAGE_KEY = 'zedstream_channel_view_v1';
let liveViewMode = 'grid';

function loadLiveViewMode() {
  try {
    const saved = localStorage.getItem(CHANNEL_VIEW_STORAGE_KEY);
    liveViewMode = saved === 'list' ? 'list' : 'grid';
  } catch (e) {
    liveViewMode = 'grid';
  }
}

function saveLiveViewMode(mode) {
  liveViewMode = mode === 'list' ? 'list' : 'grid';
  try {
    localStorage.setItem(CHANNEL_VIEW_STORAGE_KEY, liveViewMode);
  } catch (e) {}
}

function applyLiveViewMode(mode) {
  saveLiveViewMode(mode);
  const grid = document.getElementById('liveGrid');
  const gridBtn = document.getElementById('viewGridBtn');
  const listBtn = document.getElementById('viewListBtn');
  const isList = liveViewMode === 'list';

  if (grid) {
    grid.classList.toggle('list-view', isList);
  }
  if (gridBtn) {
    gridBtn.classList.toggle('active', !isList);
    gridBtn.setAttribute('aria-pressed', !isList ? 'true' : 'false');
  }
  if (listBtn) {
    listBtn.classList.toggle('active', isList);
    listBtn.setAttribute('aria-pressed', isList ? 'true' : 'false');
  }
  if (typeof hideChannelPreview === 'function') {
    hideChannelPreview();
  }
}

function initLiveViewToggle() {
  loadLiveViewMode();
  applyLiveViewMode(liveViewMode);

  const gridBtn = document.getElementById('viewGridBtn');
  const listBtn = document.getElementById('viewListBtn');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      if (liveViewMode !== 'grid') applyLiveViewMode('grid');
    });
  }
  if (listBtn) {
    listBtn.addEventListener('click', () => {
      if (liveViewMode !== 'list') applyLiveViewMode('list');
    });
  }
}

function isMatureChannel(channel) {
  return channel.category === 'mature' || channel.category === '18+' || channel.badge === '18+' || channel.badge === 'MATURE';
}

const FAV_STORAGE_KEY = 'zedstream_favorites_v1';
let favoritesList = [];
let activeFavCategory = 'all';

function getChannelKey(ch) {
  if (!ch) return '';
  if (ch.id) return String(ch.id);
  const name = String(ch.name || '').trim().toLowerCase();
  const link = String(ch.link || ch.link2 || '').trim();
  return name + '|' + link;
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    favoritesList = Array.isArray(parsed) ? parsed.filter(c => c && (c.name || c.link || c.link2)) : [];
  } catch (e) {
    favoritesList = [];
  }
  updateSidebarFavCount();
}

function saveFavorites() {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favoritesList));
  } catch (e) {}
  updateSidebarFavCount();
}

function isFavoriteChannel(ch) {
  const key = getChannelKey(ch);
  if (!key) return false;
  return favoritesList.some(f => getChannelKey(f) === key);
}

function updateSidebarFavCount() {
  const countEl = document.getElementById('sidebarFavCount');
  if (!countEl) return;
  const visible = matureUnlocked ? favoritesList : favoritesList.filter(c => !isMatureChannel(c));
  countEl.textContent = visible.length > 0 ? String(visible.length) : '';
}

function pickChannelDrmFields(src, fallback) {
  const keys = ['drm', 'clearKeys', 'clearkey', 'keyId', 'kid', 'drmKeyId', 'key', 'drmKey', 'licenseUrl', 'licenseServer', 'licenseServerUrl', 'drmLicense', 'drmLicenseUrl', 'drmScheme', 'drmType', 'drmHeaders', 'licenseHeaders', 'type', 'format'];
  const out = {};
  keys.forEach(k => {
    if (src && src[k] !== undefined && src[k] !== '') out[k] = src[k];
    else if (fallback && fallback[k] !== undefined && fallback[k] !== '') out[k] = fallback[k];
  });
  return out;
}

function syncFavoritesWithLiveChannels() {
  if (!Array.isArray(liveChannels) || liveChannels.length === 0 || favoritesList.length === 0) {
    updateSidebarFavCount();
    return;
  }
  let changed = false;
  favoritesList = favoritesList.map(fav => {
    const key = getChannelKey(fav);
    const match = liveChannels.find(ch => getChannelKey(ch) === key || (ch.name && fav.name && ch.name.toLowerCase() === fav.name.toLowerCase()));
    if (match) {
      changed = true;
      return {
        id: match.id || fav.id || '',
        name: match.name || fav.name,
        category: match.category || fav.category || 'live',
        badge: match.badge || fav.badge || '',
        img: match.img || fav.img || '',
        link: match.link || fav.link || '',
        link2: match.link2 || fav.link2 || '',
        addedAt: fav.addedAt || Date.now()
      };
    }
    return fav;
  });
  if (changed) saveFavorites();
  else updateSidebarFavCount();
}

function toggleFavoriteChannel(ch) {
  const key = getChannelKey(ch);
  if (!key) return false;
  const idx = favoritesList.findIndex(f => getChannelKey(f) === key);
  let added = false;
  if (idx >= 0) {
    favoritesList.splice(idx, 1);
    showToast('Removed from Favorites', (ch.name || 'Channel') + ' removed from Favorites.', 'info');
  } else {
    favoritesList.unshift({
      id: ch.id || '',
      name: ch.name || 'Channel',
      category: ch.category || 'live',
      badge: ch.badge || '',
      img: ch.img || '',
      link: ch.link || '',
      link2: ch.link2 || '',
      addedAt: Date.now()
    });
    added = true;
    showToast('Added to Favorites', (ch.name || 'Channel') + ' saved to Favorites.', 'success');
  }
  saveFavorites();
  renderLiveChannels();
  if (document.getElementById('favoritesPage')?.classList.contains('active')) {
    renderFavoritesPage();
  }
  if (document.getElementById('historyPage')?.classList.contains('active')) {
    renderHistoryPage();
  }
  return added;
}

function clearAllFavorites() {
  if (favoritesList.length === 0) return;
  showConfirmModal('Clear Favorites', 'Remove all saved channels from your Favorites list?', () => {
    favoritesList = [];
    activeFavCategory = 'all';
    saveFavorites();
    renderLiveChannels();
    renderFavoritesPage();
    showToast('Favorites Cleared', 'All saved channels were removed.', 'info');
  });
}

/* ===== WATCH HISTORY ===== */
const HISTORY_STORAGE_KEY = 'zedstream_watch_history_v1';
const MAX_WATCH_HISTORY = 50;
let watchHistoryList = [];
let activeHistoryCategory = 'all';

function loadWatchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    watchHistoryList = Array.isArray(parsed)
      ? parsed.filter(c => c && (c.name || c.link || c.link2)).slice(0, MAX_WATCH_HISTORY)
      : [];
  } catch (e) {
    watchHistoryList = [];
  }
  updateSidebarHistoryCount();
}

function saveWatchHistory() {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(watchHistoryList));
  } catch (e) {}
  updateSidebarHistoryCount();
}

function updateSidebarHistoryCount() {
  const countEl = document.getElementById('sidebarHistoryCount');
  if (!countEl) return;
  const visible = matureUnlocked ? watchHistoryList : watchHistoryList.filter(c => !isMatureChannel(c));
  countEl.textContent = visible.length > 0 ? String(visible.length) : '';
}

function syncHistoryWithLiveChannels() {
  if (!Array.isArray(liveChannels) || liveChannels.length === 0 || watchHistoryList.length === 0) {
    updateSidebarHistoryCount();
    return;
  }
  let changed = false;
  watchHistoryList = watchHistoryList.map(item => {
    const key = getChannelKey(item);
    const match = liveChannels.find(ch =>
      getChannelKey(ch) === key ||
      (ch.name && item.name && ch.name.toLowerCase() === item.name.toLowerCase())
    );
    if (match) {
      changed = true;
      return {
        id: match.id || item.id || '',
        name: match.name || item.name,
        category: match.category || item.category || 'live',
        badge: match.badge || item.badge || '',
        img: match.img || item.img || '',
        link: match.link || item.link || '',
        link2: match.link2 || item.link2 || '',
        watchedAt: item.watchedAt || Date.now()
      };
    }
    return item;
  });
  if (changed) saveWatchHistory();
  else updateSidebarHistoryCount();
}

function recordWatchHistory(ch) {
  if (!ch || !(ch.name || ch.link || ch.link2)) return;
  const key = getChannelKey(ch);
  const nameLower = String(ch.name || '').trim().toLowerCase();
  const matchFromLive = Array.isArray(liveChannels)
    ? liveChannels.find(c => getChannelKey(c) === key || (nameLower && c.name && c.name.trim().toLowerCase() === nameLower))
    : null;
  const source = matchFromLive || ch;
  const entry = {
    id: source.id || ch.id || '',
    name: source.name || ch.name || 'Channel',
    category: source.category || ch.category || 'live',
    badge: source.badge || ch.badge || '',
    img: source.img || ch.img || '',
    link: source.link || ch.link || '',
    link2: source.link2 || ch.link2 || '',
    watchedAt: Date.now()
  };
  const entryKey = getChannelKey(entry);
  watchHistoryList = watchHistoryList.filter(item => {
    const itemKey = getChannelKey(item);
    if (entryKey && itemKey === entryKey) return false;
    if (nameLower && item.name && item.name.trim().toLowerCase() === nameLower && item.link === entry.link) return false;
    return true;
  });
  watchHistoryList.unshift(entry);
  if (watchHistoryList.length > MAX_WATCH_HISTORY) {
    watchHistoryList = watchHistoryList.slice(0, MAX_WATCH_HISTORY);
  }
  saveWatchHistory();
  if (document.getElementById('historyPage')?.classList.contains('active')) {
    renderHistoryPage();
  }
}

function removeHistoryItem(ch) {
  const key = getChannelKey(ch);
  if (!key) return;
  watchHistoryList = watchHistoryList.filter(item => getChannelKey(item) !== key);
  saveWatchHistory();
  renderHistoryPage();
  showToast('Removed from History', (ch.name || 'Channel') + ' removed from watch history.', 'info');
}

function clearAllWatchHistory() {
  if (watchHistoryList.length === 0) return;
  showConfirmModal('Clear Watch History', 'Remove all recently watched channels from your Watch History?', () => {
    watchHistoryList = [];
    activeHistoryCategory = 'all';
    saveWatchHistory();
    renderHistoryPage();
    showToast('History Cleared', 'Your watch history has been cleared.', 'info');
  });
}

function formatWatchedTime(ts) {
  if (!ts || typeof ts !== 'number') return 'Recently watched';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Watched just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Watched ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Watched ${diffHr}h ago`;
  const d = new Date(ts);
  return 'Watched ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ===== CHANNEL HOVER PREVIEW TOOLTIP ===== */
let previewShowTimer = null;
let previewActiveCard = null;
let previewSuppressTouchUntil = 0;

function formatCategoryLabel(cat) {
  const raw = String(cat || '').trim();
  if (!raw) return 'Live TV';
  const lower = raw.toLowerCase();
  if (lower === 'all') return 'All Channels';
  if (lower === 'mature' || raw === '18+') return '18+ Mature';
  if (lower === 'movies_series') return 'Movies & Series';
  if (lower === 'lifestyle_travel') return 'Lifestyle & Travel';
  return raw
    .split(/[_\s&]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function hideChannelPreview() {
  if (!previewShowTimer && !previewActiveCard) return;
  if (previewShowTimer) {
    clearTimeout(previewShowTimer);
    previewShowTimer = null;
  }
  previewActiveCard = null;
  const tip = document.getElementById('channelPreviewTooltip');
  if (!tip || !tip.classList.contains('visible')) return;
  tip.classList.remove('visible');
  tip.setAttribute('aria-hidden', 'true');
}

function positionChannelPreview(cardEl, tip) {
  const rect = cardEl.getBoundingClientRect();
  const headerEl = document.querySelector('header');
  const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
  const margin = 12;
  const gap = 10;
  const tipW = tip.offsetWidth || 268;
  const tipH = tip.offsetHeight || 220;

  let left = rect.left + (rect.width - tipW) / 2;
  left = Math.min(Math.max(margin, left), Math.max(margin, window.innerWidth - tipW - margin));

  const fitsAbove = (rect.top - tipH - gap) >= (headerBottom + 6);
  const fitsBelow = (rect.bottom + tipH + gap) <= (window.innerHeight - margin);
  const placeBelow = !fitsAbove && fitsBelow;

  let top = placeBelow ? (rect.bottom + gap) : (rect.top - tipH - gap);
  if (!fitsAbove && !fitsBelow) {
    top = Math.max(headerBottom + 6, Math.min(rect.top - tipH - gap, window.innerHeight - tipH - margin));
  }

  tip.classList.toggle('below', placeBelow);
  tip.style.left = Math.round(left) + 'px';
  tip.style.top = Math.round(top) + 'px';
}

function showChannelPreview(cardEl, ch) {
  if (!cardEl || !ch) return;
  if (Date.now() < previewSuppressTouchUntil) return;
  if (typeof ptrOverlaysOpen === 'function' && ptrOverlaysOpen()) return;

  const tip = document.getElementById('channelPreviewTooltip');
  const mediaEl = document.getElementById('channelPreviewMedia');
  const metaEl = document.getElementById('channelPreviewMeta');
  const hintEl = document.getElementById('channelPreviewHint');
  if (!tip || !mediaEl || !metaEl || !hintEl) return;

  const isMature = isMatureChannel(ch);
  const isLocked = isMature && !matureUnlocked;
  const isFav = isFavoriteChannel(ch);
  const link = ch.link || ch.link2 || '';
  const hasWebStream = /^https?:\/\//i.test(ch.link || '') || /^https?:\/\//i.test(ch.link2 || '');
  const hasDualStream = /^https?:\/\//i.test(ch.link || '') && /^https?:\/\//i.test(ch.link2 || '') && ch.link2 !== ch.link;
  const isUnavailable = !!ch.disabled || !link;

  if (isLocked) {
    mediaEl.innerHTML =
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg>' +
      '<div class="channel-preview-media-scrim"></div>' +
      '<div class="channel-preview-media-title">' + escapeHtml(ch.name || '18+ Channel') + '</div>';
  } else {
    const fallbackSvg = '<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';
    const imgHtml = ch.img
      ? '<img src="' + escapeHtml(ch.img) + '" alt="' + escapeHtml(ch.name || 'Channel') + '" referrerpolicy="no-referrer" onerror="this.remove()">'
      : '';
    mediaEl.innerHTML =
      fallbackSvg +
      imgHtml +
      '<div class="channel-preview-media-scrim"></div>' +
      '<div class="channel-preview-media-title">' + escapeHtml(ch.name || 'Channel') + '</div>';
  }

  const metaParts = [];
  const catLabel = formatCategoryLabel(ch.category || ch.badge || 'Live TV');
  metaParts.push('<span>' + escapeHtml(catLabel) + '</span>');

  if (isUnavailable) {
    metaParts.push('<span class="channel-preview-status locked">Stream Unavailable</span>');
  } else if (hasWebStream) {
    metaParts.push('<span class="channel-preview-status">' + (hasDualStream ? 'Web Player (2 Streams)' : 'Web Player') + '</span>');
  } else {
    metaParts.push('<span class="channel-preview-status">External Stream</span>');
  }

  if (isLocked) {
    metaParts.push('<span class="channel-preview-status locked">18+ PIN Required</span>');
  } else if (isFav) {
    metaParts.push('<span class="channel-preview-status saved">Favorited</span>');
  }

  metaEl.innerHTML = metaParts.join('<span class="channel-preview-sep" aria-hidden="true">&middot;</span>');

  if (isLocked) {
    hintEl.textContent = 'Click card to enter PIN and unlock channel.';
  } else if (isUnavailable) {
    hintEl.textContent = 'No active stream link is currently configured.';
  } else if (hasWebStream) {
    hintEl.textContent = isFav
      ? 'Click card to watch in player · Heart to remove favorite'
      : 'Click card to watch in player · Heart to save favorite';
  } else {
    hintEl.textContent = isFav
      ? 'Click card to launch stream · Heart to remove favorite'
      : 'Click card to launch stream · Heart to save favorite';
  }

  previewActiveCard = cardEl;
  positionChannelPreview(cardEl, tip);
  tip.classList.add('visible');
  tip.setAttribute('aria-hidden', 'false');
}

function initChannelPreview() {
  window.addEventListener('scroll', hideChannelPreview, { passive: true });
  window.addEventListener('resize', hideChannelPreview);
  document.addEventListener('touchstart', () => {
    previewSuppressTouchUntil = Date.now() + 800;
    hideChannelPreview();
  }, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideChannelPreview();
  });
}

function buildChannelCardHtml(ch, i, query) {
  const catClass = ch.category ? (ch.category.toLowerCase().includes('movie') ? 'movies' : ch.category.toLowerCase().includes('lifestyle') ? 'lifestyle' : ch.category.toLowerCase().includes('travel') ? 'lifestyle' : ch.category.split(/[\s&]+/)[0].trim().toLowerCase()) : 'live';
  const isMature = isMatureChannel(ch);
  const isFav = isFavoriteChannel(ch);
  const safeName = escapeHtml(ch.name || 'Channel');
  const safeCat = escapeHtml(ch.category || 'Live');
  const safeBadge = escapeHtml(ch.badge || catClass);
  const imgHtml = ch.img
    ? `<img src="${escapeHtml(ch.img)}" alt="${safeName}" loading="lazy" onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('afterbegin', '<svg width=32 height=32 viewBox=\\'0 0 24 24\\' fill=\\'rgba(255,255,255,0.15)\\'><path d=\\'M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z\\'></path></svg>')">`
    : `<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
  const heartSvg = isFav
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

  return `
    <div class="live-card" tabindex="0" data-liveidx="${i}" ${isMature ? 'data-mature="true"' : ''}>
      <div class="live-card-img-wrap">
        ${imgHtml}
        <div class="live-card-badge ${catClass}">${safeBadge}</div>
        <div class="live-card-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
        ${isMature && !matureUnlocked ? `
          <div class="mature-blur-overlay">
            <div class="lock-icon"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg></div>
            <div class="lock-text">18+ Locked</div>
          </div>` : ''}
      </div>
      <div class="live-card-info">
        <div class="live-card-name">${highlightSearch(safeName, query)}</div>
        <div class="live-card-cat">${safeCat}</div>
      </div>
      <button type="button" class="live-card-fav ${isFav ? 'active' : ''}" data-favidx="${i}" aria-label="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">${heartSvg}</button>
    </div>`;
}

function wireChannelCards(grid, list) {
  hideChannelPreview();
  grid.querySelectorAll('.live-card-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideChannelPreview();
      const idx = parseInt(btn.dataset.favidx);
      const ch = list[idx];
      if (!ch) return;
      if (isMatureChannel(ch) && !matureUnlocked) {
        showPinModal((granted) => {
          if (granted) toggleFavoriteChannel(ch);
        });
        return;
      }
      toggleFavoriteChannel(ch);
    });
  });

  grid.querySelectorAll('.live-card').forEach(el => {
    const idx = parseInt(el.dataset.liveidx);
    const ch = list[idx];
    if (!ch) return;

    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      if (previewShowTimer) clearTimeout(previewShowTimer);
      previewShowTimer = setTimeout(() => {
        showChannelPreview(el, ch);
      }, 150);
    });

    el.addEventListener('mouseenter', () => {
      if (Date.now() < previewSuppressTouchUntil) return;
      if (previewShowTimer) clearTimeout(previewShowTimer);
      previewShowTimer = setTimeout(() => {
        showChannelPreview(el, ch);
      }, 150);
    });

    el.addEventListener('mouseleave', () => {
      hideChannelPreview();
    });

    el.addEventListener('focusin', (e) => {
      if (e.target && e.target.closest && e.target.closest('.live-card-fav')) return;
      showChannelPreview(el, ch);
    });

    el.addEventListener('focusout', (e) => {
      if (!e.relatedTarget || !el.contains(e.relatedTarget)) {
        hideChannelPreview();
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.target !== el) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });

    el.addEventListener('click', async (e) => {
      if (e.target && e.target.closest('.live-card-fav')) return;
      hideChannelPreview();
      if (el.dataset.mature && !matureUnlocked) {
        showPinModal(async (granted) => { if (granted) await playLiveChannel(ch); });
        return;
      }
      await playLiveChannel(ch);
    });
  });
}

function renderFavoritesPage() {
  const grid = document.getElementById('favoritesGrid');
  const chipsEl = document.getElementById('favoritesCategoryChips');
  const subtitleEl = document.getElementById('favoritesSubtitle');
  const clearBtn = document.getElementById('favoritesClearBtn');
  if (!grid) return;

  const visibleFavs = matureUnlocked ? favoritesList : favoritesList.filter(c => !isMatureChannel(c));
  if (subtitleEl) {
    subtitleEl.textContent = visibleFavs.length === 1 ? '1 saved channel' : visibleFavs.length + ' saved channels';
  }
  if (clearBtn) {
    clearBtn.style.display = visibleFavs.length > 0 ? '' : 'none';
  }

  if (chipsEl) {
    const rawCats = new Set(visibleFavs.map(c => c.category).filter(Boolean));
    const cats = ['all', ...sortCategoriesByPriority(rawCats).filter(c => c !== 'all')];
    if (!cats.includes(activeFavCategory)) activeFavCategory = 'all';
    if (cats.length > 2) {
      chipsEl.style.display = '';
      chipsEl.innerHTML = cats.map(cat => {
        const label = cat === 'all' ? 'All Favorites' : formatCategoryLabel(cat);
        const isActive = cat === activeFavCategory;
        return `<button type="button" class="live-category-chip ${isActive ? 'active' : ''}" data-cat="${escapeHtml(cat)}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
      }).join('');
      chipsEl.querySelectorAll('.live-category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          activeFavCategory = chip.dataset.cat;
          renderFavoritesPage();
        });
      });
    } else {
      chipsEl.style.display = 'none';
      chipsEl.innerHTML = '';
    }
  }

  const filtered = activeFavCategory === 'all' ? visibleFavs : visibleFavs.filter(c => c.category === activeFavCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
        </div>
        <div class="empty-state-title">No Favorites Yet</div>
        <div class="empty-state-desc">Tap the heart icon on any Live TV channel card to save it here for quick access.</div>
        <button type="button" class="pin-btn primary" id="favoritesBrowseBtn" style="flex:0 0 auto;padding:10px 22px;">Browse Channels</button>
      </div>`;
    document.getElementById('favoritesBrowseBtn')?.addEventListener('click', showLiveTVPage);
    return;
  }

  grid.innerHTML = filtered.map((ch, i) => buildChannelCardHtml(ch, i, '')).join('');
  wireChannelCards(grid, filtered);
}

function showFavoritesPage() {
  if (typeof minimizePlayerIfTheater === 'function') minimizePlayerIfTheater();
  stopSportsTicker();
  stopComingUpAutoSlide();
  document.body.classList.remove('profile-active', 'sports-active', 'history-active');
  document.body.classList.add('favorites-active');
  document.getElementById('liveTVSection').style.display = 'none';
  document.getElementById('sportsPage').classList.remove('active');
  document.getElementById('profilePage').classList.remove('active');
  document.getElementById('historyPage').classList.remove('active');
  document.getElementById('favoritesPage').classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navFavorites')?.classList.add('active');
  renderFavoritesPage();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderHistoryPage() {
  const listEl = document.getElementById('historyList');
  const chipsEl = document.getElementById('historyCategoryChips');
  const subtitleEl = document.getElementById('historySubtitle');
  const clearBtn = document.getElementById('historyClearBtn');
  if (!listEl) return;

  const visibleHistory = matureUnlocked ? watchHistoryList : watchHistoryList.filter(c => !isMatureChannel(c));
  if (subtitleEl) {
    subtitleEl.textContent = visibleHistory.length === 0
      ? 'Channels you watched recently'
      : (visibleHistory.length === 1 ? '1 recently watched channel' : visibleHistory.length + ' recently watched channels');
  }
  if (clearBtn) {
    clearBtn.style.display = visibleHistory.length > 0 ? '' : 'none';
  }

  if (chipsEl) {
    const rawCats = new Set(visibleHistory.map(c => c.category).filter(Boolean));
    const cats = ['all', ...sortCategoriesByPriority(rawCats).filter(c => c !== 'all')];
    if (!cats.includes(activeHistoryCategory)) activeHistoryCategory = 'all';
    if (cats.length > 2) {
      chipsEl.style.display = '';
      chipsEl.innerHTML = cats.map(cat => {
        const label = cat === 'all' ? 'All History' : formatCategoryLabel(cat);
        const isActive = cat === activeHistoryCategory;
        return `<button type="button" class="live-category-chip ${isActive ? 'active' : ''}" data-cat="${escapeHtml(cat)}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
      }).join('');
      chipsEl.querySelectorAll('.live-category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          activeHistoryCategory = chip.dataset.cat;
          renderHistoryPage();
        });
      });
    } else {
      chipsEl.style.display = 'none';
      chipsEl.innerHTML = '';
    }
  }

  const filtered = activeHistoryCategory === 'all'
    ? visibleHistory
    : visibleHistory.filter(c => c.category === activeHistoryCategory);

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg>
        </div>
        <div class="empty-state-title">No Watch History</div>
        <div class="empty-state-desc">Channels you watch in Live TV will appear here so you can jump back in anytime.</div>
        <button type="button" class="pin-btn primary" id="historyBrowseBtn" style="flex:0 0 auto;padding:10px 22px;">Browse Channels</button>
      </div>`;
    document.getElementById('historyBrowseBtn')?.addEventListener('click', showLiveTVPage);
    return;
  }

  listEl.innerHTML = filtered.map((ch, i) => {
    const safeName = escapeHtml(ch.name || 'Channel');
    const catLabel = escapeHtml(formatCategoryLabel(ch.category || ch.badge || 'Live TV'));
    const watchedText = escapeHtml(formatWatchedTime(ch.watchedAt));
    const isFav = isFavoriteChannel(ch);
    const isMature = isMatureChannel(ch);
    const fallbackIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
    const thumbImg = ch.img
      ? `<img src="${escapeHtml(ch.img)}" alt="${safeName}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
      : '';
    const heartSvg = isFav
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    return `
      <div class="history-item" tabindex="0" role="button" data-historyidx="${i}" ${isMature ? 'data-mature="true"' : ''} aria-label="Watch ${safeName}">
        <div class="history-item-thumb">
          ${fallbackIcon}
          ${thumbImg}
          <div class="history-item-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
        </div>
        <div class="history-item-info">
          <div class="history-item-name">${safeName}</div>
          <div class="history-item-meta">
            <span>${catLabel}</span>
            <span class="history-item-sep" aria-hidden="true">&middot;</span>
            <span>${watchedText}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button type="button" class="history-action-btn fav ${isFav ? 'active' : ''}" data-hfavidx="${i}" aria-label="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">${heartSvg}</button>
          <button type="button" class="history-action-btn remove" data-hremoveidx="${i}" aria-label="Remove ${safeName} from history" title="Remove from history">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  listEl.querySelectorAll('.history-action-btn.fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = filtered[parseInt(btn.dataset.hfavidx)];
      if (!ch) return;
      toggleFavoriteChannel(ch);
    });
  });

  listEl.querySelectorAll('.history-action-btn.remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = filtered[parseInt(btn.dataset.hremoveidx)];
      if (!ch) return;
      removeHistoryItem(ch);
    });
  });

  listEl.querySelectorAll('.history-item').forEach(row => {
    const ch = filtered[parseInt(row.dataset.historyidx)];
    if (!ch) return;
    row.addEventListener('keydown', (e) => {
      if (e.target !== row) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
    row.addEventListener('click', async (e) => {
      if (e.target && e.target.closest('.history-action-btn')) return;
      if (row.dataset.mature && !matureUnlocked) {
        showPinModal(async (granted) => { if (granted) await playLiveChannel(ch); });
        return;
      }
      await playLiveChannel(ch);
    });
  });
}

function showHistoryPage() {
  if (typeof minimizePlayerIfTheater === 'function') minimizePlayerIfTheater();
  stopSportsTicker();
  stopComingUpAutoSlide();
  document.body.classList.remove('profile-active', 'sports-active', 'favorites-active');
  document.body.classList.add('history-active');
  document.getElementById('liveTVSection').style.display = 'none';
  document.getElementById('favoritesPage').classList.remove('active');
  document.getElementById('sportsPage').classList.remove('active');
  document.getElementById('profilePage').classList.remove('active');
  document.getElementById('historyPage').classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navHistory')?.classList.add('active');
  renderHistoryPage();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderLiveChannels() {
  const grid = document.getElementById('liveGrid');
  if (!grid) return;

  const hasQuery = (liveSearchQuery || '').trim().length > 0;
  const chipsEl = document.getElementById('liveCategoryChips');
  const countEl = document.getElementById('liveFilterCount');
  const cunSection = document.getElementById('comingUpSection');
  if (chipsEl) chipsEl.style.display = '';
  if (cunSection) {
    if (hasQuery) {
      cunSection.style.display = 'none';
    } else {
      renderComingUpNext();
    }
  }

  const channels = Array.isArray(liveChannels) ? liveChannels : [];
  let displayChannels = channels;
  if (!matureUnlocked) displayChannels = channels.filter(c => !isMatureChannel(c));
  const query = liveSearchQuery.trim().toLowerCase();
  if (query) {
    displayChannels = displayChannels.filter(c =>
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.category && c.category.toLowerCase().includes(query)) ||
      (c.category && formatCategoryLabel(c.category).toLowerCase().includes(query))
    );
  }
  const filtered = activeLiveCategory === 'all' ? displayChannels : displayChannels.filter(c => c.category === activeLiveCategory);

  if (countEl) {
    if (channels.length === 0) {
      countEl.textContent = '';
    } else {
      const noun = filtered.length === 1 ? 'channel' : 'channels';
      if (activeLiveCategory === 'all') {
        countEl.textContent = `${filtered.length} ${noun}`;
      } else {
        countEl.textContent = `${filtered.length} in ${formatCategoryLabel(activeLiveCategory)}`;
      }
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>
        </div>
        <div class="empty-state-title">No Channels Found</div>
        <div class="empty-state-desc">Try a different search term, select another category, or unlock 18+ content.</div>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((ch, i) => buildChannelCardHtml(ch, i, query)).join('');
  wireChannelCards(grid, filtered);
}

function showChannelsPreloader() {
  const el = document.getElementById('channelsPreloader');
  if (el) el.classList.add('active');
}

function hideChannelsPreloader() {
  const el = document.getElementById('channelsPreloader');
  if (el) el.classList.remove('active');
}

/* ===== SPORTS CATALOG (Coming Up Next) ===== */
async function fetchSportsCatalog() {
  try {
    const r = await fetch(SPORTS_CATALOG_API, { cache: 'no-store' });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const data = await r.json();
    return { data };
  } catch (e) {
    return { error: e.message || 'Network error' };
  }
}

function mapSportsCatalog(catalog) {
  var now = Date.now();
  var MAX_AHEAD = 7 * 24 * 60 * 60 * 1000;
  var sportNames = {};
  (catalog.sports || []).forEach(function(s) { sportNames[s.id] = s.name; });
  return (catalog.matches || [])
    .map(function(m) {
      var ts = (typeof m.date === 'number' && m.date > 0 && m.date < 1e12) ? m.date * 1000 : m.date;
      return { m: m, ts: ts };
    })
    .filter(function(x) {
      if (!x.m || !x.ts) return false;
      if (x.ts <= now) return false;
      if (x.ts > now + MAX_AHEAD) return false;
      if (x.m.game && x.m.game.state === 'post') return false;
      return true;
    })
    .sort(function(a, b) { return a.ts - b.ts; })
    .slice(0, 20)
    .map(function(x) {
      var m = x.m;
      var firstCh = (m.channels && m.channels.length)
        ? (typeof m.channels[0] === 'string' ? m.channels[0] : (m.channels[0].name || m.channels[0].channel || ''))
        : '';
      var ev = {
        title: m.title || 'Upcoming event',
        time: new Date(x.ts).toISOString(),
        channel: (m.game && m.game.league) || sportNames[m.category] || m.category || 'Sports',
        sport: sportNames[m.category] || m.category || '',
        note: firstCh || (m.popular ? 'Featured' : ''),
        _match: m
      };
      if (m.game) {
        ev.home = (m.game.home && (m.game.home.name || m.game.home.team)) || '';
        ev.away = (m.game.away && (m.game.away.name || m.game.away.team)) || '';
      }
      return ev;
    });
}

async function loadLiveTV() {
  showChannelsPreloader();
  const grid = document.getElementById('liveGrid');
  if (grid) {
    grid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      grid.innerHTML += `<div class="skeleton"><div class="skeleton-img" style="aspect-ratio:16/9;"></div><div class="skeleton-text"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>`;
    }
  }
  const result = await fetchLiveChannels();
  if (result.error) {
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
          </div>
          <div class="empty-state-title">Failed to Load Channels</div>
          <div class="empty-state-desc">${result.error}. Please try again later.</div>
        </div>`;
    }
    hideChannelsPreloader();
    return;
  }
  let staticComingUp = [];
  if (Array.isArray(result.data)) {
    liveChannels = result.data;
  } else {
    liveChannels = result.data.channels || result.data.liveChannels || [];
    staticComingUp = result.data.comingUpNext || [];
  }
  comingUpNext = staticComingUp;
  renderComingUpNext();
  liveCategories = getLiveCategories(liveChannels);
  if (!matureUnlocked && (activeLiveCategory === 'mature' || activeLiveCategory === '18+')) activeLiveCategory = 'all';
  syncFavoritesWithLiveChannels();
  syncHistoryWithLiveChannels();
  renderLiveCategoryChips();
  renderLiveChannels();
  if (playerState.open && !playerState.pip && typeof renderPlayerRandomChannels === 'function') {
    renderPlayerRandomChannels(playerState.channel);
  }
  if (document.getElementById('favoritesPage')?.classList.contains('active')) {
    renderFavoritesPage();
  }
  if (document.getElementById('historyPage')?.classList.contains('active')) {
    renderHistoryPage();
  }
  hideChannelsPreloader();

  fetchSportsCatalog().then(function (sportsResult) {
    if (sportsResult.error || !sportsResult.data || !Array.isArray(sportsResult.data.matches)) return;
    sportsCatalogData = sportsResult.data;
    if (!Array.isArray(sportsCatalogData.sports)) sportsCatalogData.sports = [];
    const sportsEvents = mapSportsCatalog(sportsResult.data);
    comingUpNext = sportsEvents.concat(staticComingUp);
    renderComingUpNext();
  }).catch(function () {});
}

async function playLiveChannel(channel) {
  if (currentNetworkState === NETWORK_STATES.OFFLINE || currentNetworkState === NETWORK_STATES.NO_DATA || !navigator.onLine) {
    showToast('No Network Available', 'You cannot play this channel. It requires an active internet connection.', 'error');
    checkNetworkState();
    return;
  }

  const hasAccess = await checkSubscriptionBeforePlay();
  if (!hasAccess) return;

  const link = channel.link || channel.link2 || '';
  if (!link) { showToast('No Link', 'This channel has no link configured.', 'error'); return; }

  recordWatchHistory(channel);

  if (/^https?:\/\//i.test(link)) {
    openVideoPlayer(channel);
    return;
  }

  window.location.href = link;
}

/* ===== COMING UP NEXT — AUTO SLIDE ===== */
function cunSmoothScrollTo(row, target, dur) {
  if (!dur) dur = 500;
  var start = row.scrollLeft;
  var dist = target - start;
  if (dist === 0) return;
  var t0 = null;
  function stepFn(ts) {
    if (t0 === null) t0 = ts;
    var p = (ts - t0) / dur;
    if (p > 1) p = 1;
    var eased = 1 - Math.pow(1 - p, 3);
    row.scrollLeft = Math.round(start + dist * eased);
    if (p < 1 && comingUpAutoRow === row) requestAnimationFrame(stepFn);
  }
  if (window.requestAnimationFrame) requestAnimationFrame(stepFn);
  else row.scrollLeft = target;
}

function stopComingUpAutoSlide() {
  if (comingUpAutoTimer) { clearInterval(comingUpAutoTimer); comingUpAutoTimer = null; }
  comingUpAutoRow = null;
}

function startComingUpAutoSlide(row) {
  stopComingUpAutoSlide();
  comingUpAutoRow = row;
  comingUpAutoPaused = false;

  var pause = function() { comingUpAutoPaused = true; };
  var resume = function() { setTimeout(function() { comingUpAutoPaused = false; }, 3000); };

  row.addEventListener('touchstart', pause, { passive: true });
  row.addEventListener('touchmove', pause, { passive: true });
  row.addEventListener('touchend', resume, { passive: true });
  row.addEventListener('touchcancel', resume, { passive: true });
  row.addEventListener('mousedown', pause);
  row.addEventListener('mouseup', resume);
  row.addEventListener('mouseenter', pause);
  row.addEventListener('mouseleave', resume);

  comingUpAutoTimer = setInterval(function() {
    if (!comingUpAutoRow || comingUpAutoPaused) return;
    var section = document.getElementById('comingUpSection');
    if (!section || section.style.display === 'none') return;
    if (document.hidden) return;
    var card = comingUpAutoRow.querySelector('.coming-up-card');
    if (!card) return;
    var step = card.offsetWidth + 10;
    var maxScroll = comingUpAutoRow.scrollWidth - comingUpAutoRow.clientWidth;
    if (maxScroll <= 0) return;

    var atEnd = comingUpAutoRow.scrollLeft >= maxScroll - 4;

    if (atEnd) {
      cunSmoothScrollTo(comingUpAutoRow, 0, 900);
    } else {
      var next = comingUpAutoRow.scrollLeft + step;
      if (next > maxScroll) next = maxScroll;
      cunSmoothScrollTo(comingUpAutoRow, next);
    }
  }, 3500);
}

/* ===== COMING UP NEXT ===== */
function parseEventTime(t) {
  if (!t) return NaN;
  var ts = new Date(String(t).replace(' ', 'T')).getTime();
  return ts;
}

function formatCountdown(ts) {
  var diff = ts - Date.now();
  if (isNaN(ts)) return '';
  if (diff <= 0) return 'LIVE';
  var mins = Math.floor(diff / 60000);
  var d = Math.floor(mins / 1440);
  var h = Math.floor((mins % 1440) / 60);
  var m = mins % 60;
  if (d > 0) return 'In ' + d + 'd ' + h + 'h';
  if (h > 0) return 'In ' + h + 'h ' + m + 'm';
  if (m > 0) return 'In ' + m + 'm';
  return 'Starting...';
}

function formatEventDate(ts) {
  try {
    var d = new Date(ts), now = new Date();
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var day = 24 * 60 * 60 * 1000;
    if (ts >= startToday && ts < startToday + day) return 'Today';
    if (ts >= startToday + day && ts < startToday + 2 * day) return 'Tomorrow';
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch (e) { return ''; }
}

function formatEventTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (e) { return ''; }
}

function cunIsSameLocalDay(ts, refTs) {
  var d = new Date(ts), r = new Date(refTs);
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth() && d.getDate() === r.getDate();
}

function cunIsVisible(ev, nowTs) {
  var THREE_HOURS = 3 * 60 * 60 * 1000;
  var FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  if (isNaN(ev._ts)) return false;
  if (ev._ts > nowTs + FORTY_EIGHT_HOURS) return false;
  if (nowTs > ev._ts + THREE_HOURS) return false;
  return true;
}

function renderComingUpNext() {
  var section = document.getElementById('comingUpSection');
  var row = document.getElementById('comingUpRow');
  var countEl = document.getElementById('comingUpCount');
  if (!section || !row) return;

  if (comingUpTimer) { clearInterval(comingUpTimer); comingUpTimer = null; }
  stopComingUpAutoSlide();

  var now = Date.now();
  var events = (comingUpNext || [])
    .map(function(ev) { ev._ts = parseEventTime(ev.time); return ev; })
    .filter(function(ev) { return !isNaN(ev._ts) && ev._ts > now; })
    .sort(function(a, b) { return a._ts - b._ts; });

  if (events.length === 0) {
    section.style.display = 'none';
    row.innerHTML = '';
    if (countEl) countEl.textContent = '';
    return;
  }

  section.style.display = 'block';
  if (countEl) countEl.textContent = events.length + (events.length === 1 ? ' event' : ' events');

  row.innerHTML = events.map(function(ev, i) {
    var vs = (ev.home && ev.away) ? (ev.home + ' vs ' + ev.away) : (ev.title || 'Upcoming event');
    var leagueLabel = (ev.sport && ev.channel && ev.sport.toLowerCase() !== ev.channel.toLowerCase())
      ? (ev.sport + ' · ' + ev.channel)
      : (ev.channel || ev.sport || 'Live Event');
    var noteText = ev.note || '';
    return '' +
    '<div class="coming-up-card" tabindex="0" role="button" data-cunidx="' + i + '">' +
      '<div class="coming-up-info">' +
        '<div class="coming-up-card-top">' +
          '<span class="coming-up-league">' + escapeHtml(leagueLabel) + '</span>' +
          '<span class="coming-up-countdown" data-ts="' + ev._ts + '"><span class="cd-text">' + formatCountdown(ev._ts) + '</span></span>' +
        '</div>' +
        '<div class="coming-up-name">' + escapeHtml(vs) + '</div>' +
        '<div class="coming-up-card-foot">' +
          '<span class="coming-up-meta">' +
            '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>' +
            '<span>' + escapeHtml(formatEventDate(ev._ts)) + ' · ' + escapeHtml(formatEventTime(ev._ts)) + '</span>' +
          '</span>' +
          (noteText ? '<span class="coming-up-channel-label">' + escapeHtml(noteText) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  row.querySelectorAll('.coming-up-card').forEach(function(el) {
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
    el.addEventListener('click', async function() {
      var ev = events[parseInt(el.dataset.cunidx)];
      if (!ev) return;
      if (ev.link) {
        await playLiveChannel({ name: ev.title, link: ev.link, category: ev.channel });
      } else if (ev._match) {
        showEventChannels(ev._match);
      } else {
        showToast(ev.title || 'Upcoming', formatCountdown(ev._ts) + ' — ' + formatEventTime(ev._ts) + (ev.channel ? ' on ' + ev.channel : ''), 'info');
      }
    });
  });

  var viewAllBtn = document.getElementById('comingUpViewSportsBtn');
  if (viewAllBtn && !viewAllBtn.dataset.wired) {
    viewAllBtn.dataset.wired = '1';
    viewAllBtn.addEventListener('click', showSportsPage);
  }
  var prevBtn = document.getElementById('cunPrevBtn');
  if (prevBtn && !prevBtn.dataset.wired) {
    prevBtn.dataset.wired = '1';
    prevBtn.addEventListener('click', function() {
      comingUpAutoPaused = true;
      cunSmoothScrollTo(row, Math.max(0, row.scrollLeft - 260), 380);
    });
  }
  var nextBtn = document.getElementById('cunNextBtn');
  if (nextBtn && !nextBtn.dataset.wired) {
    nextBtn.dataset.wired = '1';
    nextBtn.addEventListener('click', function() {
      comingUpAutoPaused = true;
      var maxScroll = row.scrollWidth - row.clientWidth;
      cunSmoothScrollTo(row, Math.min(maxScroll, row.scrollLeft + 260), 380);
    });
  }

  comingUpTimer = setInterval(function() {
    var nowTs = Date.now();
    var badges = row.querySelectorAll('.coming-up-countdown');
    badges.forEach(function(b) {
      var ts = parseInt(b.dataset.ts);
      var txt = formatCountdown(ts);
      var txtEl = b.querySelector('.cd-text');
      if (txtEl) txtEl.textContent = txt;
    });
    for (var i = 0; i < events.length; i++) {
      if (events[i]._ts <= nowTs) { renderComingUpNext(); return; }
    }
  }, 15000);

  startComingUpAutoSlide(row);
}

/* ===== SPORTS SECTION ===== */
function stopSportsTicker() {
  if (sportsTicker) { clearInterval(sportsTicker); sportsTicker = null; }
}

function startSportsTicker() {
  stopSportsTicker();
  sportsTickCount = 0;
  sportsTicker = setInterval(() => {
    const page = document.getElementById('sportsPage');
    if (!page || !page.classList.contains('active')) return;
    if (document.hidden) return;
    updateSportsCountdowns();
    sportsTickCount++;
  }, 15000);
}

function sportBadgeClass(id) {
  id = String(id || '').toLowerCase();
  if (id.indexOf('american') !== -1 || id.indexOf('nfl') !== -1) return 'american-football';
  if (id.indexOf('football') !== -1 || id.indexOf('soccer') !== -1) return 'football';
  if (id.indexOf('basketball') !== -1 || id.indexOf('nba') !== -1) return 'basketball';
  if (id.indexOf('tennis') !== -1) return 'tennis';
  if (id.indexOf('cricket') !== -1) return 'cricket';
  if (id.indexOf('baseball') !== -1 || id.indexOf('mlb') !== -1) return 'baseball';
  if (id.indexOf('hockey') !== -1 || id.indexOf('nhl') !== -1) return 'hockey';
  if (id.indexOf('rugby') !== -1) return 'rugby';
  if (id.indexOf('boxing') !== -1 || id.indexOf('mma') !== -1 || id.indexOf('fight') !== -1 || id.indexOf('ufc') !== -1) return 'combat';
  if (id.indexOf('golf') !== -1) return 'golf';
  if (id.indexOf('volleyball') !== -1) return 'volleyball';
  if (id.indexOf('f1') !== -1 || id.indexOf('racing') !== -1 || id.indexOf('moto') !== -1) return 'motorsport';
  return 'other';
}

function renderSportsChips() {
  const container = document.getElementById('sportsChips');
  if (!container) return;
  const sports = (sportsCatalogData && sportsCatalogData.sports) || [];
  let html = '<button type="button" class="sport-chip ' + (activeSportFilter === 'all' ? 'active' : '') + '" data-sport="all" role="tab" aria-selected="' + (activeSportFilter === 'all' ? 'true' : 'false') + '">All Sports</button>';
  html += sports.map(s => {
    const name = s.name || s.id;
    const isAct = s.id === activeSportFilter;
    return '<button type="button" class="sport-chip ' + sportBadgeClass(s.id) + (isAct ? ' active' : '') + '" data-sport="' + escapeHtml(s.id) + '" role="tab" aria-selected="' + (isAct ? 'true' : 'false') + '">' + escapeHtml(name) + '</button>';
  }).join('');
  container.innerHTML = html;
  container.querySelectorAll('.sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeSportFilter = chip.dataset.sport || 'all';
      renderSportsChips();
      renderSportsMatches();
    });
  });
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function sanitizeTeamHexColor(hex) {
  const clean = String(hex || '').replace(/^#/, '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return '#' + clean + '38';
  return '';
}

function teamBadgeHtml(team, fallbackName) {
  var name = (team && (team.name || team.team || team.title)) || fallbackName;
  var abbr = team && team.abbr ? String(team.abbr).trim().slice(0, 4).toUpperCase() : '';
  var logo = team && (team.logo || team.badge || team.crest || team.image || team.icon || team.img);
  var tint = sanitizeTeamHexColor(team && team.color);
  var initials = abbr || String(name).split(/\s+/).map(function(w) { return w ? w.charAt(0) : ''; }).join('').slice(0, 3).toUpperCase() || '?';
  var img = logo ? '<img src="' + escapeHtml(logo) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' : '';
  var styleAttr = tint ? ' style="--team-tint:' + tint + ';"' : '';
  return '<div class="match-team-badge"' + styleAttr + '>' + img + '<span class="match-team-initials">' + escapeHtml(initials) + '</span></div>';
}

function parseTeamsFromMatchTitle(title) {
  const raw = String(title || '').trim();
  if (!raw) return null;
  const parts = raw.split(/\s+(?:vs\.?|v\.?|@)\s+/i);
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return {
      home: { name: parts[0].trim() },
      away: { name: parts[1].trim() }
    };
  }
  return null;
}

function formatChannelsSummary(channels) {
  if (!Array.isArray(channels) || channels.length === 0) return 'Stream options inside';
  const names = channels.map(c => (typeof c === 'string') ? c : (c && (c.name || c.channel) || '')).filter(Boolean);
  if (names.length === 0) return 'Stream options inside';
  if (names.length <= 2) return names.join(' · ');
  return names.slice(0, 2).join(' · ') + ' +' + (names.length - 2);
}

/* ===== MATCH REMINDERS (5-MIN PRE-START TOAST) ===== */
const MATCH_REMINDERS_STORAGE_KEY = 'zedstream_match_reminders_v1';
const MATCH_REMIND_BEFORE_MS = 5 * 60 * 1000;
let matchReminders = [];
let matchReminderSweepInterval = null;
const matchReminderTimeouts = new Map();

function normalizeMatchTimestamp(ts) {
  const n = Number(ts || 0);
  if (!n || Number.isNaN(n)) return 0;
  return (n > 0 && n < 1e12) ? n * 1000 : n;
}

function getMatchKey(m) {
  if (!m) return '';
  if (m.id) return String(m.id);
  return [m.category || '', m.title || '', normalizeMatchTimestamp(m.date)].join('|');
}

function getMatchDisplayTitle(m) {
  if (!m) return 'Upcoming match';
  if (m.title) return String(m.title);
  const home = m.game && m.game.home && (m.game.home.name || m.game.home.team);
  const away = m.game && m.game.away && (m.game.away.name || m.game.away.team);
  if (home && away) return home + ' vs ' + away;
  return 'Upcoming match';
}

function loadMatchReminders() {
  try {
    const raw = localStorage.getItem(MATCH_REMINDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - 10 * 60 * 1000;
    matchReminders = Array.isArray(parsed)
      ? parsed.filter(r => r && r.key && r.startAt > cutoff)
      : [];
  } catch (e) {
    matchReminders = [];
  }
}

function saveMatchReminders() {
  try {
    localStorage.setItem(MATCH_REMINDERS_STORAGE_KEY, JSON.stringify(matchReminders));
  } catch (e) {}
}

function isMatchReminderSet(m) {
  const key = getMatchKey(m);
  if (!key) return false;
  return matchReminders.some(r => r.key === key);
}

function clearMatchReminderTimeouts() {
  matchReminderTimeouts.forEach(tid => clearTimeout(tid));
  matchReminderTimeouts.clear();
}

function fireMatchReminderToast(reminder) {
  if (!reminder || reminder.notified) return;
  reminder.notified = true;
  saveMatchReminders();

  const now = Date.now();
  const remainingMs = reminder.startAt - now;
  const minsLeft = Math.max(0, Math.ceil(remainingMs / 60000));
  const timePart = minsLeft > 1
    ? 'starts in ' + minsLeft + ' minutes'
    : (minsLeft === 1 ? 'starts in 1 minute' : 'is starting now');
  const leaguePart = reminder.league ? ' (' + reminder.league + ')' : '';
  showToast('Match Starting Soon', reminder.title + leaguePart + ' ' + timePart + '.', 'reminder');
}

function checkMatchReminders() {
  const now = Date.now();
  const cutoff = now - 10 * 60 * 1000;
  let pruned = false;
  const next = [];
  for (const r of matchReminders) {
    if (!r || !r.key || r.startAt <= cutoff) {
      pruned = true;
      continue;
    }
    if (!r.notified && now >= (r.startAt - MATCH_REMIND_BEFORE_MS)) {
      fireMatchReminderToast(r);
    }
    next.push(r);
  }
  if (pruned) {
    matchReminders = next;
    saveMatchReminders();
    updateSportsNotifyButtons();
  }
}

function scheduleMatchReminderTimers() {
  clearMatchReminderTimeouts();
  const now = Date.now();
  const MAX_TIMEOUT = 24 * 60 * 60 * 1000;
  matchReminders.forEach(r => {
    if (!r || r.notified) return;
    const triggerAt = r.startAt - MATCH_REMIND_BEFORE_MS;
    const delay = triggerAt - now;
    if (delay <= 0) {
      fireMatchReminderToast(r);
    } else if (delay <= MAX_TIMEOUT) {
      const tid = setTimeout(() => {
        matchReminderTimeouts.delete(r.key);
        checkMatchReminders();
      }, delay);
      matchReminderTimeouts.set(r.key, tid);
    }
  });
}

function initMatchReminders() {
  loadMatchReminders();
  checkMatchReminders();
  scheduleMatchReminderTimers();
  if (matchReminderSweepInterval) clearInterval(matchReminderSweepInterval);
  matchReminderSweepInterval = setInterval(() => {
    checkMatchReminders();
    scheduleMatchReminderTimers();
  }, 15000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkMatchReminders();
      scheduleMatchReminderTimers();
    }
  });
}

function toggleMatchReminder(m, sportName) {
  const key = getMatchKey(m);
  const startAt = normalizeMatchTimestamp(m.date);
  const title = getMatchDisplayTitle(m);
  const league = (m.game && m.game.league) || sportName || '';
  if (!key || !startAt) return false;

  const idx = matchReminders.findIndex(r => r.key === key);
  if (idx >= 0) {
    matchReminders.splice(idx, 1);
    saveMatchReminders();
    scheduleMatchReminderTimers();
    updateSportsNotifyButtons();
    showToast('Reminder Removed', 'Notification cancelled for ' + title + '.', 'info');
    return false;
  }

  const now = Date.now();
  if (startAt <= now) {
    showToast('Match Already Started', title + ' has already started.', 'info');
    return false;
  }

  const entry = {
    key,
    title,
    league,
    startAt,
    notified: false
  };
  matchReminders.push(entry);

  if (startAt - now <= MATCH_REMIND_BEFORE_MS) {
    fireMatchReminderToast(entry);
  } else {
    saveMatchReminders();
    showToast('Reminder Set', 'We will notify you 5 minutes before ' + title + ' starts.', 'success');
  }
  scheduleMatchReminderTimers();
  updateSportsNotifyButtons();
  return true;
}

function buildMatchNotifyButtonHtml(m, idx) {
  const active = isMatchReminderSet(m);
  const title = getMatchDisplayTitle(m);
  const label = active ? 'Cancel reminder for ' + title : 'Notify me 5m before ' + title;
  const bellSvg = active
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
  return '<button type="button" class="match-notify-btn' + (active ? ' active' : '') + '" data-notifyidx="' + idx + '" data-matchkey="' + escapeHtml(getMatchKey(m)) + '" aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="' + escapeHtml(label) + '" title="' + escapeHtml(active ? 'Reminder set (5m before)' : 'Notify 5m before start') + '">' + bellSvg + '</button>';
}

function updateSportsNotifyButtons() {
  document.querySelectorAll('#sportsGrid .match-notify-btn').forEach(btn => {
    const key = btn.dataset.matchkey;
    const active = key ? matchReminders.some(r => r.key === key) : false;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.title = active ? 'Reminder set (5m before)' : 'Notify 5m before start';
    btn.innerHTML = active
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
  });
}

function updateSportsSummaryUI(liveCount, upcomingCount, totalCount) {
  const allEl = document.getElementById('sportsAllCount');
  const liveEl = document.getElementById('sportsLiveCount');
  const upEl = document.getElementById('sportsUpcomingCount');
  if (allEl) allEl.textContent = totalCount > 0 ? String(totalCount) : '';
  if (liveEl) liveEl.textContent = liveCount > 0 ? String(liveCount) : '0';
  if (upEl) upEl.textContent = upcomingCount > 0 ? String(upcomingCount) : '0';

  const upd = document.getElementById('sportsUpdated');
  if (upd) {
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    upd.textContent = liveCount + ' live · ' + upcomingCount + ' upcoming · Updated ' + timeStr;
  }
}

function buildBroadcastMatchCardHtml(m, idx, sportNames, now) {
  const matchTs = normalizeMatchTimestamp(m.date);
  const isLive = (m.game && m.game.state === 'in') || matchTs <= now;
  const isUpcoming = !isLive && matchTs > now;
  const sportName = sportNames[m.category] || m.category || 'Sports';
  const league = (m.game && m.game.league) || '';
  const parsed = (!m.game || (!m.game.home && !m.game.away)) ? parseTeamsFromMatchTitle(m.title) : null;
  const home = (m.game && m.game.home) || (parsed && parsed.home) || null;
  const away = (m.game && m.game.away) || (parsed && parsed.away) || null;
  const detail = (m.game && m.game.detail) || '';
  const hasTeams = !!(home || away);
  const poster = m.poster || '';
  const countdownCls = 'coming-up-countdown' + (isLive ? ' live' : '');
  const notifyBtnHtml = isUpcoming ? buildMatchNotifyButtonHtml(m, idx) : '';
  const channelSummary = formatChannelsSummary(m.channels);
  const hasChannels = Array.isArray(m.channels) && m.channels.length > 0;
  const ctaLabel = isLive ? 'Watch' : (hasChannels ? 'Channels' : 'Details');

  const leagueHeaderHtml = (league && league.toLowerCase() !== sportName.toLowerCase())
    ? '<span class="match-sport-tag">' + escapeHtml(sportName) + '</span><span class="match-league-sep" aria-hidden="true">·</span><span class="match-league">' + escapeHtml(league) + '</span>'
    : '<span class="match-sport-tag">' + escapeHtml(league || sportName) + '</span>';

  const headerStrip =
    '<div class="match-status-row">' +
      '<div class="match-league-wrap">' + leagueHeaderHtml + '</div>' +
      '<div class="match-status-right">' +
        '<span class="' + countdownCls + '" data-ts="' + matchTs + '">' +
          (isLive ? '<span class="dot"></span>' : '') +
          '<span class="cd-text">' + formatCountdown(matchTs) + '</span>' +
        '</span>' +
        notifyBtnHtml +
      '</div>' +
    '</div>';

  let bodyHtml;
  if (hasTeams) {
    const hasScores = !!(m.game && m.game.state === 'in' && home && away);
    const homeScore = home && home.score != null ? home.score : '0';
    const awayScore = away && away.score != null ? away.score : '0';
    const homeRecord = (home && home.record) ? '<div class="match-team-record">' + escapeHtml(home.record) + '</div>' : '';
    const awayRecord = (away && away.record) ? '<div class="match-team-record">' + escapeHtml(away.record) + '</div>' : '';

    const centerHtml = hasScores
      ? '<div class="match-score-value live">' + escapeHtml(String(homeScore)) + ' – ' + escapeHtml(String(awayScore)) + '</div>' +
        '<div class="match-score-detail live">' + escapeHtml(detail || 'Live') + '</div>'
      : '<div class="match-score-time">' + escapeHtml(isLive ? 'LIVE' : formatEventTime(matchTs)) + '</div>' +
        '<div class="match-score-detail">' + escapeHtml(isLive ? (detail || 'In Progress') : formatEventDate(matchTs)) + '</div>';

    bodyHtml =
      '<div class="match-teams">' +
        '<div class="match-team">' +
          teamBadgeHtml(home, 'Home') +
          '<div class="match-team-name">' + escapeHtml((home && (home.name || home.team)) || 'TBD') + '</div>' +
          homeRecord +
        '</div>' +
        '<div class="match-score">' + centerHtml + '</div>' +
        '<div class="match-team">' +
          teamBadgeHtml(away, 'Away') +
          '<div class="match-team-name">' + escapeHtml((away && (away.name || away.team)) || 'TBD') + '</div>' +
          awayRecord +
        '</div>' +
      '</div>';
  } else {
    const thumbHtml = poster
      ? '<img src="' + escapeHtml(poster) + '" alt="' + escapeHtml(m.title || 'Event') + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
      : '<svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path></svg>';
    const schedLine = isLive
      ? 'Live broadcast' + (detail ? ' · ' + detail : '')
      : formatEventDate(matchTs) + ' · ' + formatEventTime(matchTs);
    bodyHtml =
      '<div class="match-event-body">' +
        '<div class="match-event-thumb">' + thumbHtml + '</div>' +
        '<div class="match-event-copy">' +
          '<div class="match-event-title">' + escapeHtml(m.title || 'Upcoming match') + '</div>' +
          '<div class="match-event-schedule">' + escapeHtml(schedLine) + '</div>' +
        '</div>' +
      '</div>';
  }

  const footerStrip =
    '<div class="match-footer">' +
      '<div class="match-broadcast">' +
        '<svg viewBox="0 0 24 24"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12z"></path></svg>' +
        '<span class="match-broadcast-text">' + escapeHtml(channelSummary) + '</span>' +
      '</div>' +
      '<span class="match-watch-cta">' + ctaLabel + '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"></path></svg></span>' +
    '</div>';

  return '<div class="sport-card match-card' + (isLive ? ' is-live' : '') + '" tabindex="0" data-idx="' + idx + '">' +
    headerStrip + bodyHtml + footerStrip +
  '</div>';
}

function ensureSportsGridDelegation(grid) {
  if (!grid || sportsGridDelegatedWired) return;
  sportsGridDelegatedWired = true;
  grid.addEventListener('click', (e) => {
    const notifyBtn = e.target && e.target.closest ? e.target.closest('.match-notify-btn') : null;
    if (notifyBtn) {
      e.stopPropagation();
      const m = sportsRenderedList[parseInt(notifyBtn.dataset.notifyidx, 10)];
      if (!m) return;
      const sportNames = {};
      ((sportsCatalogData && sportsCatalogData.sports) || []).forEach(s => { sportNames[s.id] = s.name; });
      const sName = sportNames[m.category] || m.category || 'Sports';
      toggleMatchReminder(m, sName);
      return;
    }
    const card = e.target && e.target.closest ? e.target.closest('.sport-card') : null;
    if (!card) return;
    const m = sportsRenderedList[parseInt(card.dataset.idx, 10)];
    if (!m) return;
    showEventChannels(m);
  });
  grid.addEventListener('keydown', (e) => {
    const card = e.target && e.target.classList && e.target.classList.contains('sport-card') ? e.target : null;
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
}

function updateSportsLoadMoreUI(totalCount, renderedCount) {
  const wrap = document.getElementById('sportsLoadMoreWrap');
  if (!wrap) return;
  const remaining = totalCount - renderedCount;
  if (remaining <= 0) {
    wrap.style.display = 'none';
    wrap.innerHTML = '';
    return;
  }
  const nextBatch = Math.min(SPORTS_BATCH_SIZE, remaining);
  wrap.style.display = 'flex';
  wrap.innerHTML = '<button type="button" class="sports-load-more-btn" id="sportsLoadMoreBtn">Load ' + nextBatch + ' More Matches (' + remaining + ' remaining)</button>';
  document.getElementById('sportsLoadMoreBtn')?.addEventListener('click', () => {
    sportsVisibleLimit += SPORTS_BATCH_SIZE;
    renderSportsMatches(true);
  });
}

function renderSportsMatches(keepLimit) {
  const grid = document.getElementById('sportsGrid');
  if (!grid) return;
  ensureSportsGridDelegation(grid);
  if (!keepLimit) sportsVisibleLimit = SPORTS_BATCH_SIZE;

  const now = Date.now();
  const sportNames = {};
  ((sportsCatalogData && sportsCatalogData.sports) || []).forEach(s => { sportNames[s.id] = s.name; });

  const baseMatches = ((sportsCatalogData && sportsCatalogData.matches) || []).filter(m => {
    if (!m || !m.date) return false;
    const ts = normalizeMatchTimestamp(m.date);
    if (!ts) return false;
    if (m.game && m.game.state === 'post') return false;
    if (m.game && m.game.state === 'in') return true;
    if (ts < now - 6 * 60 * 60 * 1000) return false;
    return true;
  });

  const q = (sportsSearchQuery || '').trim().toLowerCase();
  let scoped = baseMatches;
  if (activeSportFilter !== 'all') scoped = scoped.filter(m => m.category === activeSportFilter);
  if (q) {
    scoped = scoped.filter(m => {
      const title = (m.title || '').toLowerCase();
      const league = (m.game && m.game.league || '').toLowerCase();
      const sName = (sportNames[m.category] || m.category || '').toLowerCase();
      const homeName = (m.game && m.game.home && (m.game.home.name || m.game.home.team) || '').toLowerCase();
      const awayName = (m.game && m.game.away && (m.game.away.name || m.game.away.team) || '').toLowerCase();
      const chText = Array.isArray(m.channels) ? m.channels.map(c => typeof c === 'string' ? c : (c && (c.name || c.channel) || '')).join(' ').toLowerCase() : '';
      return title.includes(q) || league.includes(q) || sName.includes(q) || homeName.includes(q) || awayName.includes(q) || chText.includes(q);
    });
  }

  const isMatchLive = (m) => (m.game && m.game.state === 'in') || normalizeMatchTimestamp(m.date) <= now;
  const liveAll = scoped.filter(isMatchLive).sort((a, b) => normalizeMatchTimestamp(a.date) - normalizeMatchTimestamp(b.date));
  const upcomingAll = scoped.filter(m => !isMatchLive(m)).sort((a, b) => normalizeMatchTimestamp(a.date) - normalizeMatchTimestamp(b.date));

  updateSportsSummaryUI(liveAll.length, upcomingAll.length, scoped.length);

  let list;
  if (activeSportStatus === 'live') list = liveAll;
  else if (activeSportStatus === 'upcoming') list = upcomingAll;
  else list = [...liveAll, ...upcomingAll];

  sportsRenderedList = list;

  if (list.length === 0) {
    updateSportsLoadMoreUI(0, 0);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path></svg>
        </div>
        <div class="empty-state-title">No Matches Found</div>
        <div class="empty-state-desc">Try clearing your search, switching status tabs, or selecting another sport.</div>
      </div>`;
    return;
  }

  const visibleList = list.slice(0, sportsVisibleLimit);
  let html = '';
  if (activeSportStatus === 'all') {
    const visibleLive = visibleList.filter((_, i) => i < liveAll.length);
    const visibleUpcoming = visibleList.slice(visibleLive.length);
    let idxOffset = 0;
    if (visibleLive.length > 0) {
      html += '<div class="sports-section-heading">' +
        '<div class="sports-section-title"><span class="sports-live-dot"></span>Live Now</div>' +
        '<div class="sports-section-count">' + liveAll.length + (liveAll.length === 1 ? ' match' : ' matches') + '</div>' +
      '</div>';
      html += visibleLive.map((m, i) => buildBroadcastMatchCardHtml(m, idxOffset + i, sportNames, now)).join('');
      idxOffset += visibleLive.length;
    }
    if (visibleUpcoming.length > 0) {
      html += '<div class="sports-section-heading">' +
        '<div class="sports-section-title">Upcoming Fixtures</div>' +
        '<div class="sports-section-count">' + upcomingAll.length + ' scheduled</div>' +
      '</div>';
      html += visibleUpcoming.map((m, i) => buildBroadcastMatchCardHtml(m, idxOffset + i, sportNames, now)).join('');
    }
  } else {
    html = visibleList.map((m, i) => buildBroadcastMatchCardHtml(m, i, sportNames, now)).join('');
  }

  grid.innerHTML = html;
  updateSportsLoadMoreUI(list.length, visibleList.length);
}

function updateSportsCountdowns() {
  const now = Date.now();
  document.querySelectorAll('#sportsGrid .coming-up-countdown').forEach(b => {
    const ts = parseInt(b.dataset.ts);
    const txtEl = b.querySelector('.cd-text');
    if (txtEl) txtEl.textContent = formatCountdown(ts);
    const isNowLive = ts <= now;
    b.classList.toggle('live', isNowLive);
    if (isNowLive) {
      const card = b.closest('.sport-card');
      if (card) card.classList.add('is-live');
      const notifyBtn = card?.querySelector('.match-notify-btn');
      if (notifyBtn) notifyBtn.remove();
    }
  });
}

async function loadSportsSection(force) {
  const grid = document.getElementById('sportsGrid');
  if (sportsCatalogData && !force) {
    renderSportsChips();
    renderSportsMatches();
    return;
  }
  updateSportsLoadMoreUI(0, 0);
  if (grid) {
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      grid.innerHTML += '<div class="skeleton" style="min-height:174px;display:flex;flex-direction:column;justify-content:space-between;padding:14px;"><div class="skeleton-line short"></div><div class="skeleton-line" style="height:36px;"></div><div class="skeleton-line short" style="margin-bottom:0;"></div></div>';
    }
  }
  const result = await fetchSportsCatalog();
  if (result.error) {
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
          </div>
          <div class="empty-state-title">Failed to Load Sports</div>
          <div class="empty-state-desc">${result.error}. Pull to retry or tap Refresh.</div>
        </div>`;
    }
    return;
  }
  sportsCatalogData = result.data || { sports: [], matches: [] };
  if (!Array.isArray(sportsCatalogData.sports)) sportsCatalogData.sports = [];
  if (!Array.isArray(sportsCatalogData.matches)) sportsCatalogData.matches = [];
  renderSportsChips();
  renderSportsMatches();
}

function showSportsPage() {
  if (typeof minimizePlayerIfTheater === 'function') minimizePlayerIfTheater();
  stopSportsTicker();
  stopComingUpAutoSlide();
  hideChannelPreview();
  document.body.classList.remove('profile-active', 'favorites-active', 'history-active');
  document.body.classList.add('sports-active');
  document.getElementById('liveTVSection').style.display = 'none';
  document.getElementById('favoritesPage').classList.remove('active');
  document.getElementById('historyPage').classList.remove('active');
  document.getElementById('profilePage').classList.remove('active');
  document.getElementById('sportsPage').classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navSports').classList.add('active');
  loadSportsSection(false);
  startSportsTicker();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ===== PIN SYSTEM ===== */
const PIN_STORAGE_KEY = 'zedstream_mature_unlocked';
const PIN_CODE = '6969';
let matureUnlocked = false;
let pinCallback = null;
let pinInputs = [];
let currentPinIndex = 0;

function initPinSystem() {
  matureUnlocked = sessionStorage.getItem(PIN_STORAGE_KEY) === 'true';
  updateLockButtonState();
  pinInputs = document.querySelectorAll('.pin-input');
  const numpadBtns = document.querySelectorAll('.pin-numpad-btn');

  pinInputs.forEach((input, idx) => {
    input.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setPinDigit(idx, e.key);
        if (idx < 3) pinInputs[idx + 1].focus();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        if (input.value) { setPinDigit(idx, ''); }
        else if (idx > 0) { pinInputs[idx - 1].focus(); setPinDigit(idx - 1, ''); }
      } else if (e.key === 'ArrowLeft' && idx > 0) { pinInputs[idx - 1].focus(); }
      else if (e.key === 'ArrowRight' && idx < 3) { pinInputs[idx + 1].focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); verifyPin(); }
      else if (e.key === 'Escape') { closePinModal(); }
    });
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 1);
      setPinDigit(idx, val);
      if (val && idx < 3) pinInputs[idx + 1].focus();
    });
    input.addEventListener('focus', () => { currentPinIndex = idx; });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      paste.split('').forEach((digit, i) => { if (i < 4) setPinDigit(i, digit); });
      if (paste.length >= 4) verifyPin();
      else if (paste.length > 0 && paste.length < 4) pinInputs[paste.length].focus();
    });
  });

  numpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.num;
      if (num === 'clear') { clearPin(); pinInputs[0].focus(); }
      else {
        if (currentPinIndex < 4) {
          setPinDigit(currentPinIndex, num);
          if (currentPinIndex < 3) pinInputs[currentPinIndex + 1].focus();
          else setTimeout(verifyPin, 200);
        }
      }
    });
  });

  document.getElementById('pinCancelBtn').addEventListener('click', closePinModal);
  document.getElementById('pinSubmitBtn').addEventListener('click', verifyPin);
  document.getElementById('pinModalOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('pinModalOverlay')) closePinModal(); });
}

function setPinDigit(index, value) {
  if (index >= 0 && index < 4) {
    pinInputs[index].value = value;
    if (!!value) pinInputs[index].classList.add('filled'); else pinInputs[index].classList.remove('filled');
  }
}

function clearPin() {
  pinInputs.forEach((input, i) => setPinDigit(i, ''));
  document.getElementById('pinErrorMsg').classList.remove('visible');
  pinInputs.forEach(inp => inp.classList.remove('error'));
}

function getPinValue() {
  return Array.from(pinInputs).map(inp => inp.value).join('');
}

function showPinModal(callback) {
  pinCallback = callback;
  clearPin();
  document.getElementById('pinModalOverlay').classList.add('active');
  setTimeout(() => { if (pinInputs[0]) pinInputs[0].focus(); }, 300);
}

function closePinModal() {
  document.getElementById('pinModalOverlay').classList.remove('active');
  if (pinCallback) { pinCallback(false); pinCallback = null; }
}

function verifyPin() {
  const entered = getPinValue();
  if (entered.length !== 4) { showPinError('Please enter all 4 digits.'); return; }
  if (entered === PIN_CODE) {
    matureUnlocked = true;
    sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
    updateLockButtonState();
    updateSidebarFavCount();
    updateSidebarHistoryCount();
    renderLiveCategoryChips();
    renderLiveChannels();
    if (document.getElementById('favoritesPage')?.classList.contains('active')) renderFavoritesPage();
    if (document.getElementById('historyPage')?.classList.contains('active')) renderHistoryPage();
    document.getElementById('pinModalOverlay').classList.remove('active');
    showToast('Access Granted', '18+ channels are now unlocked.', 'success');
    if (pinCallback) { const cb = pinCallback; pinCallback = null; cb(true); }
  } else {
    showPinError('Incorrect PIN. Please try again.');
    pinInputs.forEach(inp => { inp.classList.add('error'); inp.value = ''; inp.classList.remove('filled'); });
    setTimeout(() => { pinInputs.forEach(inp => inp.classList.remove('error')); if (pinInputs[0]) pinInputs[0].focus(); }, 500);
  }
}

function showPinError(msg) {
  const err = document.getElementById('pinErrorMsg');
  err.textContent = msg;
  err.classList.add('visible');
}

function updateLockButtonState() {
  const sidebarBtn = document.getElementById('lock18SidebarBtn');
  const sidebarText = document.getElementById('lock18SidebarText');
  if (sidebarBtn && sidebarText) {
    if (matureUnlocked) {
      sidebarBtn.classList.remove('locked');
      sidebarText.textContent = 'Lock 18+ Channels';
    } else {
      sidebarBtn.classList.add('locked');
      sidebarText.textContent = '18+ Locked';
    }
  }
}

function handleLock18Click() {
  closeSidebar();
  if (matureUnlocked) {
    matureUnlocked = false;
    sessionStorage.removeItem(PIN_STORAGE_KEY);
    if (activeLiveCategory === 'mature' || activeLiveCategory === '18+') activeLiveCategory = 'all';
    updateLockButtonState();
    updateSidebarFavCount();
    updateSidebarHistoryCount();
    showToast('18+ Locked', 'Mature channels are now hidden.', 'info');
    renderLiveCategoryChips();
    renderLiveChannels();
    if (document.getElementById('favoritesPage')?.classList.contains('active')) renderFavoritesPage();
    if (document.getElementById('historyPage')?.classList.contains('active')) renderHistoryPage();
  } else {
    showPinModal((granted) => {
      if (!granted) return;
      updateSidebarFavCount();
      updateSidebarHistoryCount();
      renderLiveCategoryChips();
      renderLiveChannels();
      if (document.getElementById('favoritesPage')?.classList.contains('active')) renderFavoritesPage();
      if (document.getElementById('historyPage')?.classList.contains('active')) renderHistoryPage();
    });
  }
}

function highlightSearch(text, query) {
  if (!query || !text) return text || '';
  const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/* ===== SEARCH ===== */
function initSearch() {
  const searchInput = document.getElementById('liveSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  if (!searchInput) { console.warn('[Search] Input not found'); return; }
  if (!clearBtn) { console.warn('[Search] Clear button not found'); }

  function updateClearBtn() {
    if (!clearBtn) return;
    if (liveSearchQuery && liveSearchQuery.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  function updateSearchMode() {
    var searching = !!(liveSearchQuery && liveSearchQuery.trim().length > 0);
    document.body.classList.toggle('searching', searching);
  }

  searchInput.addEventListener('input', (e) => {
    liveSearchQuery = e.target.value;
    updateClearBtn();
    updateSearchMode();
    renderLiveChannels();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      liveSearchQuery = '';
      updateClearBtn();
      updateSearchMode();
      renderLiveChannels();
      searchInput.blur();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      liveSearchQuery = '';
      updateClearBtn();
      updateSearchMode();
      renderLiveChannels();
      searchInput.focus();
    });
  }
}

/* ===== EVENT CHANNELS MODAL ===== */
function showEventChannels(m) {
  const overlay = document.getElementById('eventChannelsOverlay');
  const titleEl = document.getElementById('eventChannelsTitle');
  const listEl = document.getElementById('eventChannelsList');
  const channels = (m.channels && m.channels.length) ? m.channels : null;

  titleEl.textContent = m.title || 'Watch Live';

  if (!channels) {
    listEl.innerHTML = '<div style="font-size:13px;color:var(--text-tertiary);text-align:center;padding:8px;">No channel info available for this event.</div>';
  } else {
    listEl.innerHTML = channels.map((ch, i) => {
      const name = (typeof ch === 'string') ? ch : (ch.name || ch.channel || 'Channel');
      const found = findChannelInList(name);
      const tag = found
        ? '<span style="margin-left:auto;font-size:9px;font-weight:800;color:var(--success);background:rgba(34,197,94,0.12);padding:2px 8px;border-radius:9999px;letter-spacing:0.5px;">IN YOUR LIST</span>'
        : '<span style="margin-left:auto;font-size:9px;font-weight:700;color:var(--text-quaternary);padding:2px 8px;">NOT IN LIST</span>';
      return '<button class="pin-btn secondary" data-chidx="' + i + '" style="width:100%;display:flex;align-items:center;gap:10px;justify-content:flex-start;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>' +
        '<span>' + escapeHtml(name) + '</span>' + tag + '</button>';
    }).join('');

    listEl.querySelectorAll('button[data-chidx]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const chName = channels[parseInt(btn.dataset.chidx)];
        const name = (typeof chName === 'string') ? chName : (chName.name || chName.channel || '');
        overlay.classList.remove('active');
        await playEventChannel(name, m);
      });
    });
  }

  document.getElementById('eventChannelsClose').onclick = () => overlay.classList.remove('active');
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
  overlay.classList.add('active');
}

function findChannelInList(name) {
  const q = (name || '').toLowerCase().trim();
  if (!q || !Array.isArray(liveChannels)) return null;
  let ch = liveChannels.find(c => c.name && c.name.toLowerCase().trim() === q);
  if (ch) return ch;
  if (q.length >= 3) {
    const candidates = liveChannels.filter(c => {
      const cn = (c.name || '').toLowerCase();
      return cn.includes(q) || (cn.length > 3 && q.includes(cn));
    });
    if (candidates.length > 0) {
      candidates.sort((a, b) => (a.name || '').length - (b.name || '').length);
      return candidates[0];
    }
  }
  return null;
}

async function playEventChannel(channelName, match) {
  if (!channelName) return;
  const ch = findChannelInList(channelName);
  if (ch) {
    await playLiveChannel(ch);
  } else {
    showToast('Channel Not Found', '"' + channelName + '" was not found in your channel list (LIVE_TV_API). Check the name in your channels JSON.', 'info');
  }
}

/* ===== PROFILE PAGE ===== */
function showProfilePage() {
  if (typeof minimizePlayerIfTheater === 'function') minimizePlayerIfTheater();
  stopSportsTicker();
  stopComingUpAutoSlide();
  document.body.classList.remove('sports-active', 'favorites-active', 'history-active');
  document.getElementById('sportsPage').classList.remove('active');
  document.getElementById('favoritesPage').classList.remove('active');
  document.getElementById('historyPage').classList.remove('active');
  document.body.classList.add('profile-active');
  document.getElementById('liveTVSection').style.display = 'none';
  document.getElementById('profilePage').classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navProfile').classList.add('active');
  renderProfilePage();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function showLiveTVPage() {
  stopSportsTicker();
  document.body.classList.remove('profile-active', 'sports-active', 'favorites-active', 'history-active');
  document.getElementById('liveTVSection').style.display = 'block';
  document.getElementById('favoritesPage').classList.remove('active');
  document.getElementById('historyPage').classList.remove('active');
  document.getElementById('profilePage').classList.remove('active');
  document.getElementById('sportsPage').classList.remove('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navLiveTV').classList.add('active');
  const cunRow = document.getElementById('comingUpRow');
  if (cunRow && cunRow.children.length > 0) startComingUpAutoSlide(cunRow);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function renderProfilePage() {
  if (!currentUser) return;

  document.getElementById('profileEmail').textContent = currentUser.email;

  const sub = subData || await fetchSubscriptionForEmail(currentUser.email);
  subData = sub;

  const cardsContainer = document.getElementById('profileCards');
  const deviceList = document.getElementById('profileDeviceList');
  const limitText = document.getElementById('profileDeviceLimitText');
  const limitBar = document.getElementById('profileDeviceLimitBar');

  if (!sub) {
    cardsContainer.innerHTML = `
      <div class="profile-card" style="grid-column:1/-1;">
        <div class="profile-card-header">
          <div class="profile-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></div>
          <div class="profile-card-title">No Subscription</div>
        </div>
        <div class="profile-card-value">—</div>
        <div class="profile-card-label">No active subscription found for this account.</div>
      </div>`;
    deviceList.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-quaternary);font-size:13px;">No devices connected.</div>';
    limitText.textContent = '0 / 0 devices';
    limitBar.style.width = '0%';
    return;
  }

  const days = getDaysLeft(sub.expiryDate);
  const status = sub.status || 'unknown';
  const statusClass = status === 'active' ? 'active' : (status === 'expired' ? 'expired' : 'inactive');
  const statusLabel = status === 'active' ? 'Active' : (status === 'expired' ? 'Expired' : 'Inactive');
  const plan = sub.planType || sub.subTier || 'Basic';
  const price = sub.price || 0;
  const billing = sub.billingCycle || 'monthly';
  const limit = sub.deviceLimit || 1;
  const connected = sub.connectedDevices || [];
  const serviceName = sub.serviceName || 'ZedStream';

  document.getElementById('profileName').textContent = serviceName;

  cardsContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-card-header">
        <div class="profile-card-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></div>
        <div class="profile-card-title">Status</div>
      </div>
      <div class="profile-card-value">${days > 0 ? days : 0}</div>
      <div class="profile-card-label">Days Remaining</div>
      <div class="profile-card-status ${statusClass}"><span class="profile-card-status-dot"></span>${statusLabel}</div>
    </div>
    <div class="profile-card">
      <div class="profile-card-header">
        <div class="profile-card-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path></svg></div>
        <div class="profile-card-title">Plan</div>
      </div>
      <div class="profile-card-value">${plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
      <div class="profile-card-label">${billing.charAt(0).toUpperCase() + billing.slice(1)} Billing</div>
    </div>
    <div class="profile-card">
      <div class="profile-card-header">
        <div class="profile-card-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg></div>
        <div class="profile-card-title">Price</div>
      </div>
      <div class="profile-card-value">$${price}</div>
      <div class="profile-card-label">Per ${billing.replace('ly','')}</div>
    </div>
    <div class="profile-card">
      <div class="profile-card-header">
        <div class="profile-card-icon"><svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg></div>
        <div class="profile-card-title">Devices</div>
      </div>
      <div class="profile-card-value">${connected.length}</div>
      <div class="profile-card-label">Connected of ${limit} max</div>
    </div>
  `;

  if (connected.length === 0) {
    deviceList.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-quaternary);font-size:13px;">No devices connected.</div>';
  } else {
    deviceList.innerHTML = connected.map((devId, idx) => {
      const isCurrent = devId === deviceId;
      return `
        <div class="device-item">
          <div class="device-item-icon ${isCurrent ? 'current' : ''}">
            <svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg>
          </div>
          <div class="device-item-info">
            <div class="device-item-id">${devId}</div>
            <div class="device-item-meta">${isCurrent ? 'This device' : 'Connected device #' + (idx + 1)}</div>
          </div>
          ${!isCurrent ? `<button class="device-item-remove" data-devid="${devId}" title="Remove this device">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
          </button>` : ''}
        </div>`;
    }).join('');

    deviceList.querySelectorAll('.device-item-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const devIdToRemove = btn.dataset.devid;
        if (!devIdToRemove) return;
        showConfirmModal('Remove Device', 'Remove this device from your account? It will no longer be able to access ZedStream.', async () => {
          btn.disabled = true;
          const success = await removeDeviceFromSubscription(subData, devIdToRemove);
          if (success) {
            showToast('Device Removed', 'The device has been removed from your account.', 'success');
            await renderProfilePage();
            await refreshSubscriptionData();
          } else {
            showToast('Error', 'Failed to remove device. Please try again.', 'error');
            btn.disabled = false;
          }
        });
      });
    });
  }

  limitText.textContent = connected.length + ' / ' + limit + ' devices';
  limitBar.style.width = Math.min((connected.length / limit) * 100, 100) + '%';
  limitBar.style.background = connected.length >= limit ? 'var(--accent)' : 'var(--success)';
}

/* ===== NAVIGATION ===== */
function initSidebarNavigation() {
  document.getElementById('navLiveTV')?.addEventListener('click', () => {
    closeSidebar();
    showLiveTVPage();
  });
  document.getElementById('navFavorites')?.addEventListener('click', () => {
    closeSidebar();
    showFavoritesPage();
  });
  document.getElementById('favoritesBackBtn')?.addEventListener('click', showLiveTVPage);
  document.getElementById('favoritesClearBtn')?.addEventListener('click', clearAllFavorites);
  document.getElementById('navHistory')?.addEventListener('click', () => {
    closeSidebar();
    showHistoryPage();
  });
  document.getElementById('historyBackBtn')?.addEventListener('click', showLiveTVPage);
  document.getElementById('historyClearBtn')?.addEventListener('click', clearAllWatchHistory);
  document.getElementById('navSports')?.addEventListener('click', () => {
    closeSidebar();
    showSportsPage();
  });
  document.getElementById('sportsBackBtn')?.addEventListener('click', showLiveTVPage);
  document.getElementById('sportsRefreshBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.classList.add('loading');
    await loadSportsSection(true);
    btn.classList.remove('loading');
    btn.disabled = false;
  });
  document.querySelectorAll('#sportsStatusTabs .sports-status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeSportStatus = tab.dataset.status || 'all';
      document.querySelectorAll('#sportsStatusTabs .sports-status-tab').forEach(t => {
        const isAct = t === tab;
        t.classList.toggle('active', isAct);
        t.setAttribute('aria-selected', isAct ? 'true' : 'false');
      });
      renderSportsMatches();
    });
  });
  const sportsSearchInput = document.getElementById('sportsSearchInput');
  const sportsSearchClear = document.getElementById('sportsSearchClear');
  if (sportsSearchInput) {
    sportsSearchInput.addEventListener('input', () => {
      sportsSearchQuery = sportsSearchInput.value || '';
      if (sportsSearchClear) sportsSearchClear.classList.toggle('visible', sportsSearchQuery.trim().length > 0);
      renderSportsMatches();
    });
  }
  if (sportsSearchClear && sportsSearchInput) {
    sportsSearchClear.addEventListener('click', () => {
      sportsSearchInput.value = '';
      sportsSearchQuery = '';
      sportsSearchClear.classList.remove('visible');
      renderSportsMatches();
      sportsSearchInput.focus();
    });
  }
  document.getElementById('navProfile')?.addEventListener('click', () => {
    closeSidebar();
    showProfilePage();
  });
  document.getElementById('lock18SidebarBtn')?.addEventListener('click', handleLock18Click);
  document.getElementById('profileBackBtn')?.addEventListener('click', showLiveTVPage);
  document.getElementById('profilePaymentBtn')?.addEventListener('click', () => {
    window.location.href = 'go:payment';
  });
}

/* ===== LOGIN EVENT LISTENERS ===== */
document.getElementById('loginBtn').addEventListener('click', performLogin);
document.getElementById('loginEmail').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginOverlay').style.display !== 'none') performLogin();
});
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginOverlay').style.display !== 'none') performLogin();
});

document.getElementById('loginPasswordToggle').addEventListener('click', () => {
  const input = document.getElementById('loginPassword');
  const btn = document.getElementById('loginPasswordToggle');
  const icon = document.getElementById('loginPasswordToggleIcon');
  if (input.type === 'password') {
    input.type = 'text';
    btn.title = 'Hide password';
    icon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>';
  } else {
    input.type = 'password';
    btn.title = 'Show password';
    icon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
  }
});

document.getElementById('signupConfirmToggle').addEventListener('click', () => {
  const input = document.getElementById('signupConfirmPassword');
  const btn = document.getElementById('signupConfirmToggle');
  const icon = document.getElementById('signupConfirmToggleIcon');
  if (input.type === 'password') {
    input.type = 'text';
    btn.title = 'Hide password';
    icon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>';
  } else {
    input.type = 'password';
    btn.title = 'Show password';
    icon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
  }
});

let isSignUpMode = false;
document.getElementById('loginToggleLink').addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  const confirmField = document.getElementById('signupConfirmField');
  const btnText = document.getElementById('loginBtnText');
  const toggleText = document.getElementById('loginToggleText');
  const toggleLink = document.getElementById('loginToggleLink');
  const forgotLink = document.querySelector('.login-forgot');
  const errorEl = document.getElementById('loginError');
  const subtitle = document.querySelector('.login-subtitle');

  if (isSignUpMode) {
    confirmField.classList.remove('hidden');
    btnText.textContent = 'Sign Up';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign In';
    if (forgotLink) forgotLink.style.display = 'none';
    if (subtitle) subtitle.textContent = 'Create your account to start watching';
  } else {
    confirmField.classList.add('hidden');
    btnText.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign Up';
    if (forgotLink) forgotLink.style.display = 'flex';
    if (subtitle) subtitle.textContent = 'Sign in to continue watching';
  }
  errorEl.textContent = '';
});

document.getElementById('loginForgotLink').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const errorEl = document.getElementById('loginError');
  if (!email) {
    errorEl.textContent = 'Please enter your email address first.';
    document.getElementById('loginEmail').focus();
    return;
  }
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
    errorEl.style.color = 'var(--success)';
    errorEl.textContent = 'Password reset email sent! Check your inbox.';
    setTimeout(() => { errorEl.style.color = ''; errorEl.textContent = ''; }, 5000);
  } catch (e) {
    errorEl.style.color = '';
    if (e.code === 'auth/user-not-found') errorEl.textContent = 'No account found with that email.';
    else if (e.code === 'auth/invalid-email') errorEl.textContent = 'Invalid email address.';
    else errorEl.textContent = e.message || 'Failed to send reset email.';
  }
});
document.getElementById('sidebarLogoutBtn').addEventListener('click', () => {
  closeSidebar();
  performLogout();
});
document.getElementById('subGateLogoutBtn').addEventListener('click', performLogout);
