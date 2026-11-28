/* ===== ANDROID WEBVIEW POLYFILLS ===== */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) throw new TypeError('find called on null or undefined');
    if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
    var list = Object(this), length = list.length >>> 0, thisArg = arguments[1], value;
    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };
}
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) throw new TypeError('findIndex called on null or undefined');
    if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
    var list = Object(this), length = list.length >>> 0, thisArg = arguments[1];
    for (var i = 0; i < length; i++) {
      if (predicate.call(thisArg, list[i], i, list)) return i;
    }
    return -1;
  };
}
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') start = 0;
    if (start + search.length > this.length) return false;
    return this.indexOf(search, start) !== -1;
  };
}
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do { if (el.matches(s)) return el; el = el.parentElement || el.parentNode; } while (el !== null && el.nodeType === 1);
    return null;
  };
}
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
if (!Object.assign) {
  Object.assign = function(target) {
    if (target == null) throw new TypeError('Cannot convert undefined or null to object');
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) to[nextKey] = nextSource[nextKey];
        }
      }
    }
    return to;
  };
}
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
(function() {
  var toggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(token, force) {
    if (arguments.length > 1) {
      if (force) this.add(token); else this.remove(token);
      return !!force;
    }
    return toggle.call(this, token);
  };
})();

/* ===== CONFIG ===== */
const PASTEFY_API_KEY = 'mEQy1tvH7DTSuqOW0d8R2duwhwxZVYz0F0kfzRMijbypfrNRUUSTtnxj9AtN';
const SUBSCRIPTION_PASTE_ID = 'ePhfxmdW';
const LIVE_TV_API = 'https://pastefy.app/sh92Ia4P/raw';
const SPORTS_CATALOG_API = 'https://api.parky.watch/api/sports/catalog';
const DEVICE_STORAGE_KEY = 'zedstream_device_id';
const SUB_POLL_INTERVAL = 30000;

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
let inFlightSubIndexPromise = null;
let cachedSubIndex = null;
let cachedSubIndexAt = 0;

function invalidateSubIndexCache() {
  cachedSubIndex = null;
  cachedSubIndexAt = 0;
}

async function pastefyGet(pasteId) {
  const safeId = encodeURIComponent(String(pasteId || '').trim());
  const headers = { 'Authorization': 'Bearer ' + PASTEFY_API_KEY };
  const endpoints = [
    { url: '/api/pastefy/paste/' + safeId, isProxy: true },
    { url: 'https://pastefy.app/api/v2/paste/' + safeId, isProxy: false }
  ];
  let lastError = 'Network error';

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    try {
      const r = await fetch(ep.url, { headers, cache: 'no-store' });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (ep.isProxy && (r.status === 404 || (r.ok && !ct.includes('application/json')))) {
        continue;
      }
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        lastError = 'HTTP ' + r.status + (text ? ' - ' + text.substring(0, 200) : '');
        continue;
      }
      const data = await r.json();
      return { data };
    } catch (e) {
      lastError = (e && e.message) || 'Failed to fetch';
    }
  }
  console.error('[Pastefy] API fetch error:', lastError);
  return { error: lastError };
}

async function pastefyGetRaw(pasteId) {
  const safeId = encodeURIComponent(String(pasteId || '').trim());
  const headers = { 'Authorization': 'Bearer ' + PASTEFY_API_KEY };
  const endpoints = [
    { url: '/api/pastefy/raw/' + safeId, isProxy: true },
    { url: 'https://pastefy.app/' + safeId + '/raw', isProxy: false }
  ];
  let lastError = 'Network error';

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    try {
      const r = await fetch(ep.url, { headers, cache: 'no-store' });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (ep.isProxy && (r.status === 404 || (r.ok && ct.includes('text/html')))) {
        continue;
      }
      if (!r.ok) {
        lastError = 'HTTP ' + r.status;
        continue;
      }
      const text = await r.text();
      if (ep.isProxy && /^\s*<!doctype\s+html/i.test(text)) {
        continue;
      }
      return { text };
    } catch (e) {
      lastError = (e && e.message) || 'Failed to fetch';
    }
  }
  console.error('[Pastefy] Raw fetch error:', lastError);
  return { error: lastError };
}

async function pastefyCreate(title, content, encrypted) {
  const payload = JSON.stringify({ title, content, encrypted: !!encrypted });
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + PASTEFY_API_KEY
  };
  const endpoints = ['/api/pastefy/paste', 'https://pastefy.app/api/v2/paste'];
  let lastError = 'Network error';
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const r = await fetch(endpoints[i], { method: 'POST', headers, body: payload });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (i === 0 && (r.status === 404 || (r.ok && !ct.includes('application/json')))) continue;
      if (!r.ok) { lastError = 'HTTP ' + r.status; continue; }
      const data = await r.json();
      invalidateSubIndexCache();
      return { data };
    } catch (e) {
      lastError = (e && e.message) || 'Failed to fetch';
    }
  }
  return { error: lastError };
}

async function pastefyEdit(pasteId, title, content) {
  const safeId = encodeURIComponent(String(pasteId || '').trim());
  const payload = JSON.stringify({ title, content });
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + PASTEFY_API_KEY
  };
  const endpoints = ['/api/pastefy/paste/' + safeId, 'https://pastefy.app/api/v2/paste/' + safeId];
  let lastError = 'Network error';
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const r = await fetch(endpoints[i], { method: 'PUT', headers, body: payload });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (i === 0 && (r.status === 404 || (r.ok && !ct.includes('application/json')))) continue;
      if (!r.ok) { lastError = 'HTTP ' + r.status; continue; }
      const data = await r.json();
      invalidateSubIndexCache();
      return { data };
    } catch (e) {
      lastError = (e && e.message) || 'Failed to fetch';
    }
  }
  return { error: lastError };
}

async function pastefyDelete(pasteId) {
  const safeId = encodeURIComponent(String(pasteId || '').trim());
  const headers = { 'Authorization': 'Bearer ' + PASTEFY_API_KEY };
  const endpoints = ['/api/pastefy/paste/' + safeId, 'https://pastefy.app/api/v2/paste/' + safeId];
  let lastError = 'Network error';
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const r = await fetch(endpoints[i], { method: 'DELETE', headers });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (i === 0 && (r.status === 404 || (r.ok && ct.includes('text/html')))) continue;
      if (!r.ok) { lastError = 'HTTP ' + r.status; continue; }
      invalidateSubIndexCache();
      return { success: true };
    } catch (e) {
      lastError = (e && e.message) || 'Failed to fetch';
    }
  }
  return { error: lastError };
}

/* ===== SUBSCRIPTION MANAGER ===== */
let lastSubIndexError = null;

function subscriptionMatchesEmail(sub, normalizedEmail) {
  if (!sub || !normalizedEmail) return false;
  const candidates = [sub.subEmail, sub.userEmail, sub.email];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (typeof c === 'string' && c.trim().toLowerCase() === normalizedEmail) {
      return true;
    }
  }
  return false;
}

async function fetchSubscriptionIndex(forceRefresh) {
  if (!forceRefresh && cachedSubIndex && (Date.now() - cachedSubIndexAt) < 2500) {
    lastSubIndexError = null;
    return cachedSubIndex;
  }
  if (!forceRefresh && inFlightSubIndexPromise) {
    return inFlightSubIndexPromise;
  }

  inFlightSubIndexPromise = (async () => {
    lastSubIndexError = null;
    const apiResult = await pastefyGet(SUBSCRIPTION_PASTE_ID);
    if (!apiResult.error && apiResult.data) {
      try {
        const paste = apiResult.data;
        const rawContent = paste.paste ? paste.paste.content : paste.content;
        if (rawContent) {
          const parsedRaw = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
          const normalized = Array.isArray(parsedRaw) ? { subscriptions: parsedRaw } : parsedRaw;
          if (normalized && Array.isArray(normalized.subscriptions)) {
            cachedSubIndex = normalized;
            cachedSubIndexAt = Date.now();
            return normalized;
          }
        }
      } catch (e) {
        lastSubIndexError = e.message || 'API parse error';
        console.error('[SubManager] API parse error:', e.message);
      }
    } else if (apiResult.error) {
      lastSubIndexError = apiResult.error;
      console.error('[SubManager] API failed:', apiResult.error);
    }

    const rawResult = await pastefyGetRaw(SUBSCRIPTION_PASTE_ID);
    if (!rawResult.error && rawResult.text) {
      try {
        const parsedRaw = JSON.parse(rawResult.text);
        const normalized = Array.isArray(parsedRaw) ? { subscriptions: parsedRaw } : parsedRaw;
        if (normalized && Array.isArray(normalized.subscriptions)) {
          lastSubIndexError = null;
          cachedSubIndex = normalized;
          cachedSubIndexAt = Date.now();
          return normalized;
        }
      } catch (e) {
        lastSubIndexError = e.message || 'Raw parse error';
        console.error('[SubManager] Raw parse error:', e.message);
      }
    } else if (rawResult.error) {
      lastSubIndexError = rawResult.error;
      console.error('[SubManager] Raw URL failed:', rawResult.error);
    }

    if (!lastSubIndexError) lastSubIndexError = 'Failed to load subscription index';
    console.error('[SubManager] All methods failed to load subscription index');
    return null;
  })();

  try {
    return await inFlightSubIndexPromise;
  } finally {
    inFlightSubIndexPromise = null;
  }
}

function getDaysLeft(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const raw = String(expiryDateStr).trim();
  if (!raw) return 0;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + 'T23:59:59.999Z' : raw;
  const expiry = new Date(normalized);
  if (Number.isNaN(expiry.getTime())) return 0;
  const diff = expiry.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getEffectiveSubscriptionStatus(sub) {
  if (!sub || typeof sub !== 'object') return 'none';
  const rawStatus = typeof sub.status === 'string' ? sub.status.trim().toLowerCase() : '';
  const blockedStatuses = new Set(['cancelled', 'canceled', 'suspended', 'banned', 'disabled', 'paused', 'revoked', 'inactive']);
  if (blockedStatuses.has(rawStatus)) return rawStatus;
  const days = getDaysLeft(sub.expiryDate);
  if (days <= 0) return 'expired';
  // Active when expiry is in the future and status is active, trial, missing, or stale "expired" prior to sync
  return 'active';
}

function isSubscriptionValid(sub) {
  if (!sub) return false;
  const days = getDaysLeft(sub.expiryDate);
  return days > 0 && getEffectiveSubscriptionStatus(sub) === 'active';
}

async function fetchSubscriptionForEmail(email, options) {
  const opts = options || {};
  if (!email) return null;
  const normalizedEmail = String(email).toLowerCase().trim();
  console.log('[SubManager] Looking up subscription for:', normalizedEmail);
  const index = await fetchSubscriptionIndex(Boolean(opts.forceRefresh));
  if (!index) {
    console.error('[SubManager] Index is null');
    return null;
  }
  if (!Array.isArray(index.subscriptions)) {
    console.error('[SubManager] Index has no subscriptions array. Keys:', Object.keys(index));
    return null;
  }

  const matches = index.subscriptions.filter(s => subscriptionMatchesEmail(s, normalizedEmail));
  if (!matches.length) {
    console.log('[SubManager] No subscription found for:', normalizedEmail);
    return null;
  }

  matches.sort((a, b) => {
    const aValid = isSubscriptionValid(a) ? 1 : 0;
    const bValid = isSubscriptionValid(b) ? 1 : 0;
    if (aValid !== bValid) return bValid - aValid;
    const aDays = getDaysLeft(a.expiryDate);
    const bDays = getDaysLeft(b.expiryDate);
    if (aDays !== bDays) return bDays - aDays;
    const aUpd = Date.parse(a.updatedAt || a.createdAt || 0) || 0;
    const bUpd = Date.parse(b.updatedAt || b.createdAt || 0) || 0;
    return bUpd - aUpd;
  });

  let sub = matches[0];

  // If master index record looks inactive/expired but references a dedicated sub paste, verify it once
  if (sub && !isSubscriptionValid(sub) && sub.pastefyId) {
    try {
      const subPaste = await pastefyGet(sub.pastefyId);
      if (!subPaste.error && subPaste.data) {
        const rawSub = subPaste.data.paste ? subPaste.data.paste.content : subPaste.data.content;
        if (rawSub) {
          const parsedSub = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;
          if (parsedSub && typeof parsedSub === 'object') {
            const masterUpd = Date.parse(sub.updatedAt || 0) || 0;
            const pasteUpd = Date.parse(parsedSub.updatedAt || 0) || 0;
            if (isSubscriptionValid(parsedSub) || pasteUpd > masterUpd) {
              sub = { ...sub, ...parsedSub, connectedDevices: sub.connectedDevices || parsedSub.connectedDevices };
            }
          }
        }
      }
    } catch (e) {
      console.warn('[SubManager] Individual paste check failed:', e.message);
    }
  }

  console.log('[SubManager] Found match:', sub.subEmail || sub.userEmail || sub.email, '| effectiveStatus:', getEffectiveSubscriptionStatus(sub), '| expiry:', sub.expiryDate);
  return sub;
}

async function refreshSubscriptionData() {
  if (!currentUser || !currentUser.email) {
    console.log('[SubManager] No current user, skipping refresh');
    return;
  }
  console.log('[SubManager] Refreshing subscription for:', currentUser.email);
  const sub = await fetchSubscriptionForEmail(currentUser.email);
  if (!sub && lastSubIndexError && isSubscriptionValid(subData)) {
    console.warn('[SubManager] Keeping existing valid subscription after transient fetch error:', lastSubIndexError);
    updateSidebarStatus(subData, getDaysLeft(subData.expiryDate));
    return;
  }
  subData = sub;
  const days = sub ? getDaysLeft(sub.expiryDate) : 0;

  console.log('[SubManager] Refresh result - found:', !!sub, '| days:', days, '| valid:', isSubscriptionValid(sub));
  updateSidebarStatus(sub, days);
}

async function checkSubscriptionBeforePlay() {
  if (!currentUser || !currentUser.email) {
    showToast('Login Required', 'Please sign in to watch channels.', 'error');
    return false;
  }
  console.log('[SubManager] Checking subscription before play for:', currentUser.email);
  let sub = await fetchSubscriptionForEmail(currentUser.email);
  if (!sub && lastSubIndexError) {
    sub = await fetchSubscriptionForEmail(currentUser.email, { forceRefresh: true });
  }

  if (!sub && lastSubIndexError) {
    if (isSubscriptionValid(subData)) {
      console.warn('[SubManager] Using verified session subscription while index endpoint is unreachable');
      return true;
    }
    showToast('Connection Issue', 'Unable to verify subscription status right now. Please try again.', 'error');
    return false;
  }

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
  if (isSubscriptionValid(sub) && days > 0) {
    statusEl.textContent = days + (days === 1 ? ' day left' : ' days left');
    statusEl.style.color = days <= 3 ? 'var(--accent)' : 'var(--success)';
  } else if (sub && getEffectiveSubscriptionStatus(sub) !== 'expired' && getEffectiveSubscriptionStatus(sub) !== 'none') {
    const eff = getEffectiveSubscriptionStatus(sub);
    statusEl.textContent = 'Subscription ' + eff;
    statusEl.style.color = 'var(--accent)';
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
  const effStatus = getEffectiveSubscriptionStatus(sub);

  if (!sub) {
    desc.textContent = 'No subscription found for ' + currentUser.email + '. Please subscribe to continue watching.';
    daysEl.textContent = '0';
    daysEl.style.color = 'var(--accent)';
  } else if (effStatus === 'expired' || days <= 0) {
    const expLabel = sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'an earlier date';
    desc.textContent = 'Your subscription expired on ' + expLabel + '. Please renew to continue watching.';
    daysEl.textContent = '0';
    daysEl.style.color = 'var(--accent)';
  } else if (effStatus !== 'active') {
    desc.textContent = 'Your subscription status is "' + effStatus + '". Please contact support or renew to continue watching.';
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
  if (!index || !index.subscriptions || !currentUser || !currentUser.email) return;
  const normalizedEmail = currentUser.email.toLowerCase().trim();
  const idx = index.subscriptions.findIndex(s => subscriptionMatchesEmail(s, normalizedEmail));
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
    if (!index || !index.subscriptions || !currentUser || !currentUser.email) return false;
    const normalizedEmail = currentUser.email.toLowerCase().trim();
    const idx = index.subscriptions.findIndex(s => subscriptionMatchesEmail(s, normalizedEmail));
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
  authReadyForAutoRestore = true;
  if (typeof maybeRestoreLastWatchedChannel === 'function') {
    maybeRestoreLastWatchedChannel();
  }

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
  authReadyForAutoRestore = false;
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
  const candidates = ['/api/pastefy/raw/sh92Ia4P', LIVE_TV_API];
  let lastErr = 'Network error';
  for (let i = 0; i < candidates.length; i++) {
    try {
      const r = await fetch(candidates[i], { cache: 'no-store' });
      const ct = (r.headers && r.headers.get('content-type')) || '';
      if (i === 0 && (r.status === 404 || (r.ok && ct.includes('text/html')))) continue;
      if (!r.ok) { lastErr = 'HTTP ' + r.status; continue; }
      const text = await r.text();
      if (i === 0 && /^\s*<!doctype\s+html/i.test(text)) continue;
      if (!text || !text.trim()) { lastErr = 'Empty response'; continue; }
      const data = JSON.parse(text);
      return { data };
    } catch (e) {
      lastErr = (e && e.message) || 'Network error';
    }
  }
  return { error: lastErr };
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

/* ===== BLUR-UP THUMBNAIL PLACEHOLDER HELPERS ===== */
const loadedThumbUrlCache = new Set();

function getThumbHue(seed) {
  const s = String(seed || 'channel');
  let hash = 215;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 360;
}

function onThumbImgLoad(img) {
  if (!img) return;
  const src = img.currentSrc || img.getAttribute('src') || '';
  if (src) loadedThumbUrlCache.add(src);
  img.classList.add('is-loaded');
  const box = img.closest ? img.closest('.thumb-blur-box') : img.parentElement;
  if (box) {
    box.classList.remove('is-error');
    box.classList.add('is-loaded');
  }
}

function onThumbImgError(img) {
  if (!img) return;
  const box = img.closest ? img.closest('.thumb-blur-box') : img.parentElement;
  if (box) {
    box.classList.remove('is-loaded');
    box.classList.add('is-error');
  }
  if (typeof img.remove === 'function') img.remove();
  else img.style.display = 'none';
}

function hydrateBlurUpThumbnails(rootEl) {
  const scope = rootEl || document;
  if (!scope || !scope.querySelectorAll) return;
  scope.querySelectorAll('img.thumb-blur-img').forEach((img) => {
    const src = img.currentSrc || img.getAttribute('src') || '';
    if (img.complete) {
      if (img.naturalWidth > 0) {
        img.classList.add('is-instant', 'is-loaded');
        if (src) loadedThumbUrlCache.add(src);
        const box = img.closest ? img.closest('.thumb-blur-box') : img.parentElement;
        if (box) {
          box.classList.remove('is-error');
          box.classList.add('is-loaded');
        }
      } else {
        onThumbImgError(img);
      }
    } else if (src && loadedThumbUrlCache.has(src)) {
      img.classList.add('is-instant');
    }
  });
}

function buildBlurUpThumbImgHtml(imgUrl, altText, opts) {
  const o = opts || {};
  const url = String(imgUrl || '').trim();
  if (!url) return '';
  const isAlreadyLoaded = loadedThumbUrlCache.has(url);
  const eager = Boolean(o.eager);
  const w = o.width || 320;
  const h = o.height || 180;
  const cls = 'thumb-blur-img' + (isAlreadyLoaded ? ' is-instant' : '');
  const loadingAttr = eager ? 'eager' : 'lazy';
  return '<img class="' + cls + '" src="' + escapeHtml(url) + '" alt="' + escapeHtml(altText || 'Channel') + '" width="' + w + '" height="' + h + '" loading="' + loadingAttr + '" decoding="async" referrerpolicy="no-referrer" onload="onThumbImgLoad(this)" onerror="onThumbImgError(this)">';
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

  mediaEl.classList.remove('is-loaded', 'is-error');
  mediaEl.classList.add('thumb-blur-box');
  mediaEl.style.setProperty('--thumb-hue', String(getThumbHue((ch.name || '') + '|' + (ch.category || ''))));

  if (isLocked) {
    mediaEl.classList.add('is-error');
    mediaEl.innerHTML =
      '<svg class="thumb-fallback-icon" width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg>' +
      '<div class="channel-preview-media-scrim"></div>' +
      '<div class="channel-preview-media-title">' + escapeHtml(ch.name || '18+ Channel') + '</div>';
  } else {
    const fallbackSvg = '<svg class="thumb-fallback-icon" width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';
    const imgHtml = ch.img ? buildBlurUpThumbImgHtml(ch.img, ch.name || 'Channel', { eager: true }) : '';
    if (!imgHtml) mediaEl.classList.add('is-error');
    mediaEl.innerHTML =
      fallbackSvg +
      imgHtml +
      '<div class="channel-preview-media-scrim"></div>' +
      '<div class="channel-preview-media-title">' + escapeHtml(ch.name || 'Channel') + '</div>';
    hydrateBlurUpThumbnails(mediaEl);
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
  const thumbHue = getThumbHue((ch.name || '') + '|' + (ch.category || ''));
  const hasImg = Boolean(ch.img && String(ch.img).trim());
  const fallbackIcon = `<svg class="thumb-fallback-icon" width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
  const imgHtml = hasImg ? buildBlurUpThumbImgHtml(ch.img, ch.name || 'Channel') : '';
  const heartSvg = isFav
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

  return `
    <div class="live-card" tabindex="0" data-liveidx="${i}" ${isMature ? 'data-mature="true"' : ''}>
      <div class="live-card-img-wrap thumb-blur-box${hasImg ? '' : ' is-error'}" style="--thumb-hue:${thumbHue};">
        ${fallbackIcon}
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
  hydrateBlurUpThumbnails(grid);
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
    const fallbackIcon = `<svg class="thumb-fallback-icon" width="26" height="26" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
    const hasImg = Boolean(ch.img && String(ch.img).trim());
    const thumbHue = getThumbHue((ch.name || '') + '|' + (ch.category || ''));
    const thumbImg = hasImg ? buildBlurUpThumbImgHtml(ch.img, ch.name || 'Channel') : '';
    const heartSvg = isFav
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    return `
      <div class="history-item" tabindex="0" role="button" data-historyidx="${i}" ${isMature ? 'data-mature="true"' : ''} aria-label="Watch ${safeName}">
        <div class="history-item-thumb thumb-blur-box${hasImg ? '' : ' is-error'}" style="--thumb-hue:${thumbHue};">
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

  hydrateBlurUpThumbnails(listEl);

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
  if (document.getElementById('favoritesPage')?.classList.contains('active')) {
    renderFavoritesPage();
  }
  if (document.getElementById('historyPage')?.classList.contains('active')) {
    renderHistoryPage();
  }
  if (playerState.open && typeof renderPlayerRelatedChannels === 'function') {
    renderPlayerRelatedChannels();
  }
  hideChannelsPreloader();
  channelsReadyForAutoRestore = true;
  if (typeof maybeRestoreLastWatchedChannel === 'function') {
    maybeRestoreLastWatchedChannel();
  }

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

  if (liveSearchQuery && liveSearchQuery.trim().length > 0 && typeof saveSearchQueryToHistory === 'function') {
    saveSearchQueryToHistory(liveSearchQuery);
  }
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
    const evHue = getThumbHue(m.title || m.category || 'Sports');
    const hasPoster = Boolean(poster && String(poster).trim());
    const fallbackSvg = '<svg class="thumb-fallback-icon" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path></svg>';
    const thumbHtml = hasPoster
      ? buildBlurUpThumbImgHtml(poster, m.title || 'Event', { width: 120, height: 92 })
      : '';
    const schedLine = isLive
      ? 'Live broadcast' + (detail ? ' · ' + detail : '')
      : formatEventDate(matchTs) + ' · ' + formatEventTime(matchTs);
    bodyHtml =
      '<div class="match-event-body">' +
        '<div class="match-event-thumb thumb-blur-box' + (hasPoster ? '' : ' is-error') + '" style="--thumb-hue:' + evHue + ';">' + fallbackSvg + thumbHtml + '</div>' +
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
  hydrateBlurUpThumbnails(grid);
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
    if (playerState.open && typeof renderPlayerRelatedChannels === 'function') renderPlayerRelatedChannels();
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
    if (document.getElementById('profilePage')?.classList.contains('active')) renderProfilePage();
    if (playerState.open && typeof renderPlayerRelatedChannels === 'function') renderPlayerRelatedChannels();
  } else {
    showPinModal((granted) => {
      if (!granted) return;
      updateSidebarFavCount();
      updateSidebarHistoryCount();
      renderLiveCategoryChips();
      renderLiveChannels();
      if (document.getElementById('favoritesPage')?.classList.contains('active')) renderFavoritesPage();
      if (document.getElementById('historyPage')?.classList.contains('active')) renderHistoryPage();
      if (document.getElementById('profilePage')?.classList.contains('active')) renderProfilePage();
      if (playerState.open && typeof renderPlayerRelatedChannels === 'function') renderPlayerRelatedChannels();
    });
  }
}

function highlightSearch(text, query) {
  if (!query || !text) return text || '';
  const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/* ===== SEARCH ===== */
const SEARCH_HISTORY_STORAGE_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 5;

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const cleaned = [];
    for (let i = 0; i < parsed.length; i++) {
      const q = String(parsed[i] || '').trim();
      if (!q) continue;
      const lower = q.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      cleaned.push(q);
      if (cleaned.length >= MAX_SEARCH_HISTORY) break;
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

function saveSearchHistoryList(list) {
  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify((list || []).slice(0, MAX_SEARCH_HISTORY)));
  } catch (e) {}
}

function saveSearchQueryToHistory(rawQuery) {
  const query = String(rawQuery || '').trim();
  if (!query) return loadSearchHistory();
  const lower = query.toLowerCase();
  const current = loadSearchHistory().filter(item => item.toLowerCase() !== lower);
  const next = [query, ...current].slice(0, MAX_SEARCH_HISTORY);
  saveSearchHistoryList(next);
  return next;
}

function removeSearchQueryFromHistory(rawQuery) {
  const lower = String(rawQuery || '').trim().toLowerCase();
  const next = loadSearchHistory().filter(item => item.toLowerCase() !== lower);
  saveSearchHistoryList(next);
  return next;
}

function initSearch() {
  const searchWrap = document.getElementById('headerSearchWrap') || document.querySelector('.header-search-wrap');
  const searchInput = document.getElementById('liveSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const suggestionsEl = document.getElementById('searchSuggestions');
  if (!searchInput) { console.warn('[Search] Input not found'); return; }
  if (!clearBtn) { console.warn('[Search] Clear button not found'); }

  let activeSuggestionIdx = -1;
  let searchHistorySaveTimer = null;
  let blurCloseTimer = null;

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

  function getFilteredSuggestions() {
    const history = loadSearchHistory();
    const typed = String(liveSearchQuery || '').trim().toLowerCase();
    if (!typed) return history;
    return history.filter(item => item.toLowerCase().includes(typed) && item.toLowerCase() !== typed);
  }

  function closeSuggestions() {
    if (!suggestionsEl) return;
    suggestionsEl.classList.remove('open');
    activeSuggestionIdx = -1;
    searchInput.setAttribute('aria-expanded', 'false');
  }

  function applySuggestion(query) {
    const cleaned = String(query || '').trim();
    if (!cleaned) return;
    if (searchHistorySaveTimer) {
      clearTimeout(searchHistorySaveTimer);
      searchHistorySaveTimer = null;
    }
    searchInput.value = cleaned;
    liveSearchQuery = cleaned;
    saveSearchQueryToHistory(cleaned);
    updateClearBtn();
    updateSearchMode();
    renderLiveChannels();
    closeSuggestions();
  }

  function renderSuggestions(forceOpen) {
    if (!suggestionsEl) return;
    const items = getFilteredSuggestions();
    if (!items.length) {
      suggestionsEl.innerHTML = '';
      closeSuggestions();
      return;
    }

    if (activeSuggestionIdx >= items.length) {
      activeSuggestionIdx = items.length - 1;
    }

    const head = document.createElement('div');
    head.className = 'search-suggestions-head';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'Recent Searches';
    const clearHistoryBtn = document.createElement('button');
    clearHistoryBtn.type = 'button';
    clearHistoryBtn.className = 'search-suggestions-clear';
    clearHistoryBtn.textContent = 'Clear';
    clearHistoryBtn.addEventListener('mousedown', (e) => e.preventDefault());
    clearHistoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveSearchHistoryList([]);
      renderSuggestions(false);
      searchInput.focus();
    });
    head.appendChild(titleSpan);
    head.appendChild(clearHistoryBtn);

    suggestionsEl.innerHTML = '';
    suggestionsEl.appendChild(head);

    items.forEach((queryText, idx) => {
      const row = document.createElement('div');
      row.className = 'search-suggestion-row' + (idx === activeSuggestionIdx ? ' active' : '');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-suggestion-item';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', idx === activeSuggestionIdx ? 'true' : 'false');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>';
      const label = document.createElement('span');
      label.className = 'search-suggestion-label';
      label.textContent = queryText;
      btn.appendChild(label);
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applySuggestion(queryText);
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'search-suggestion-remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + queryText);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('mousedown', (e) => e.preventDefault());
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeSearchQueryFromHistory(queryText);
        renderSuggestions(true);
        searchInput.focus();
      });

      row.appendChild(btn);
      row.appendChild(removeBtn);
      suggestionsEl.appendChild(row);
    });

    if (forceOpen || document.activeElement === searchInput) {
      suggestionsEl.classList.add('open');
      searchInput.setAttribute('aria-expanded', 'true');
    }
  }

  function commitCurrentSearchQuery() {
    if (searchHistorySaveTimer) {
      clearTimeout(searchHistorySaveTimer);
      searchHistorySaveTimer = null;
    }
    const q = String(searchInput.value || '').trim();
    if (q) {
      saveSearchQueryToHistory(q);
    }
  }

  searchInput.addEventListener('focus', () => {
    if (blurCloseTimer) {
      clearTimeout(blurCloseTimer);
      blurCloseTimer = null;
    }
    activeSuggestionIdx = -1;
    renderSuggestions(true);
  });

  searchInput.addEventListener('blur', () => {
    commitCurrentSearchQuery();
    blurCloseTimer = setTimeout(() => {
      closeSuggestions();
    }, 140);
  });

  searchInput.addEventListener('input', (e) => {
    liveSearchQuery = e.target.value;
    activeSuggestionIdx = -1;
    updateClearBtn();
    updateSearchMode();
    renderLiveChannels();
    renderSuggestions(true);

    if (searchHistorySaveTimer) clearTimeout(searchHistorySaveTimer);
    const trimmed = String(liveSearchQuery || '').trim();
    if (trimmed.length >= 2) {
      searchHistorySaveTimer = setTimeout(() => {
        saveSearchQueryToHistory(trimmed);
      }, 1100);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = getFilteredSuggestions();
    if (e.key === 'ArrowDown') {
      if (!items.length) return;
      e.preventDefault();
      activeSuggestionIdx = activeSuggestionIdx < items.length - 1 ? activeSuggestionIdx + 1 : 0;
      renderSuggestions(true);
      return;
    }
    if (e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      activeSuggestionIdx = activeSuggestionIdx > 0 ? activeSuggestionIdx - 1 : items.length - 1;
      renderSuggestions(true);
      return;
    }
    if (e.key === 'Enter') {
      if (suggestionsEl && suggestionsEl.classList.contains('open') && activeSuggestionIdx >= 0 && items[activeSuggestionIdx]) {
        e.preventDefault();
        applySuggestion(items[activeSuggestionIdx]);
        return;
      }
      commitCurrentSearchQuery();
      closeSuggestions();
      return;
    }
    if (e.key === 'Escape') {
      if (suggestionsEl && suggestionsEl.classList.contains('open')) {
        e.preventDefault();
        closeSuggestions();
        return;
      }
      if (searchHistorySaveTimer) {
        clearTimeout(searchHistorySaveTimer);
        searchHistorySaveTimer = null;
      }
      searchInput.value = '';
      liveSearchQuery = '';
      updateClearBtn();
      updateSearchMode();
      renderLiveChannels();
      searchInput.blur();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('mousedown', (e) => e.preventDefault());
    clearBtn.addEventListener('click', () => {
      if (searchHistorySaveTimer) {
        clearTimeout(searchHistorySaveTimer);
        searchHistorySaveTimer = null;
      }
      searchInput.value = '';
      liveSearchQuery = '';
      activeSuggestionIdx = -1;
      updateClearBtn();
      updateSearchMode();
      renderLiveChannels();
      searchInput.focus();
      renderSuggestions(true);
    });
  }

  document.addEventListener('click', (e) => {
    if (searchWrap && !searchWrap.contains(e.target)) {
      closeSuggestions();
    }
  });

  const voiceBtn = document.getElementById('searchVoiceBtn');
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec && voiceBtn) {
    if (searchWrap) searchWrap.classList.add('has-voice');
    let recognition = null;
    let isListening = false;
    const defaultPlaceholder = searchInput.getAttribute('placeholder') || 'Search channels...';

    function setVoiceListeningState(active) {
      isListening = Boolean(active);
      voiceBtn.classList.toggle('listening', isListening);
      voiceBtn.setAttribute('aria-pressed', isListening ? 'true' : 'false');
      voiceBtn.title = isListening ? 'Stop voice search' : 'Search channels by voice';
      searchInput.placeholder = isListening ? 'Listening... say a channel or "play ..."' : defaultPlaceholder;
    }

    function normalizeSpokenTranscript(rawText) {
      return String(rawText || '').replace(/[\s.!?]+$/g, '').trim();
    }

    function findBestVoiceChannelMatch(queryText) {
      const q = String(queryText || '').trim().toLowerCase();
      if (!q || !Array.isArray(liveChannels)) return null;
      const accessible = (typeof matureUnlocked !== 'undefined' && matureUnlocked)
        ? liveChannels
        : liveChannels.filter(c => !(typeof isMatureChannel === 'function' && isMatureChannel(c)));
      const exact = accessible.find(c => c && c.name && String(c.name).trim().toLowerCase() === q);
      if (exact) return exact;
      const starts = accessible.find(c => c && c.name && String(c.name).trim().toLowerCase().startsWith(q));
      if (starts) return starts;
      return accessible.find(c => c && (
        (c.name && String(c.name).toLowerCase().includes(q)) ||
        (c.category && String(c.category).toLowerCase().includes(q))
      )) || null;
    }

    function applyVoiceQuery(rawTranscript, isFinal) {
      const cleaned = normalizeSpokenTranscript(rawTranscript);
      if (!cleaned) return;
      const lower = cleaned.toLowerCase();

      if (isFinal && (lower === 'clear search' || lower === 'reset search' || lower === 'clear')) {
        if (searchHistorySaveTimer) {
          clearTimeout(searchHistorySaveTimer);
          searchHistorySaveTimer = null;
        }
        searchInput.value = '';
        liveSearchQuery = '';
        activeSuggestionIdx = -1;
        updateClearBtn();
        updateSearchMode();
        renderLiveChannels();
        closeSuggestions();
        return;
      }

      const playCmdMatch = cleaned.match(/^(?:play|watch|open)\s+(.+)$/i);
      const searchText = playCmdMatch ? playCmdMatch[1].trim() : cleaned;
      if (!searchText) return;

      if (typeof showLiveTVPage === 'function' && !document.getElementById('liveTVSection')?.offsetParent) {
        showLiveTVPage();
      }
      if (typeof playerState !== 'undefined' && playerState.open && !playerState.pip && typeof minimizePlayerIfTheater === 'function') {
        minimizePlayerIfTheater();
      }

      searchInput.value = searchText;
      liveSearchQuery = searchText;
      activeSuggestionIdx = -1;
      updateClearBtn();
      updateSearchMode();
      renderLiveChannels();

      if (isFinal) {
        saveSearchQueryToHistory(searchText);
        closeSuggestions();
        if (playCmdMatch) {
          const matchedChannel = findBestVoiceChannelMatch(searchText);
          if (matchedChannel && typeof playLiveChannel === 'function') {
            playLiveChannel(matchedChannel);
          } else {
            showToast('Voice Search', 'Showing channels for "' + searchText + '".', 'info');
          }
        }
      }
    }

    voiceBtn.addEventListener('mousedown', (e) => e.preventDefault());
    voiceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isListening && recognition) {
        try { recognition.stop(); } catch (err) {}
        return;
      }
      try {
        recognition = new SpeechRec();
        recognition.lang = navigator.language || 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setVoiceListeningState(true);
          closeSuggestions();
        };

        recognition.onresult = (ev) => {
          let transcript = '';
          let isFinal = false;
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const res = ev.results[i];
            if (res && res[0] && res[0].transcript) {
              transcript += res[0].transcript;
            }
            if (res && res.isFinal) isFinal = true;
          }
          if (transcript) {
            applyVoiceQuery(transcript, isFinal);
          }
        };

        recognition.onerror = (ev) => {
          const code = ev && ev.error ? ev.error : '';
          setVoiceListeningState(false);
          if (code === 'not-allowed' || code === 'service-not-allowed') {
            showToast('Microphone Blocked', 'Allow microphone permission to search channels by voice.', 'error');
          } else if (code === 'audio-capture') {
            showToast('No Microphone Found', 'Connect a microphone to use voice search.', 'error');
          } else if (code === 'no-speech') {
            showToast('No Speech Detected', 'Tap the mic and speak a channel name.', 'info');
          } else if (code && code !== 'aborted') {
            showToast('Voice Search Unavailable', 'Could not capture voice input (' + code + ').', 'error');
          }
        };

        recognition.onend = () => {
          setVoiceListeningState(false);
          recognition = null;
        };

        recognition.start();
      } catch (err) {
        setVoiceListeningState(false);
        showToast('Voice Search Unavailable', 'Could not start speech recognition in this browser.', 'error');
      }
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

function formatProfileDate(dateStr) {
  if (!dateStr) return '—';
  const raw = String(dateStr).trim();
  if (!raw) return '—';
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + 'T23:59:59.999Z' : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateProfileAccountPanel() {
  const emailText = currentUser?.email || '—';
  const detailEmailEl = document.getElementById('profileDetailEmail');
  const devIdEl = document.getElementById('profileCurrentDeviceId');
  const libEl = document.getElementById('profileLibrarySummary');
  const matureStatusEl = document.getElementById('profileMatureStatus');
  const matureBtnEl = document.getElementById('profileMatureBtn');

  if (detailEmailEl) detailEmailEl.textContent = emailText;
  if (devIdEl) devIdEl.textContent = deviceId || '—';

  const visibleFavCount = (matureUnlocked ? favoritesList : favoritesList.filter(c => !isMatureChannel(c))).length;
  const visibleHistoryCount = (matureUnlocked ? watchHistoryList : watchHistoryList.filter(c => !isMatureChannel(c))).length;
  if (libEl) {
    libEl.textContent = `${visibleFavCount} favorite${visibleFavCount === 1 ? '' : 's'} · ${visibleHistoryCount} watched`;
  }
  if (matureStatusEl) {
    matureStatusEl.textContent = matureUnlocked ? 'Unlocked for this session' : 'PIN Locked';
  }
  if (matureBtnEl) {
    matureBtnEl.textContent = matureUnlocked ? 'Lock 18+' : 'Unlock';
  }
}

async function renderProfilePage() {
  if (!currentUser) return;

  const email = String(currentUser.email || '').trim();
  const emailEl = document.getElementById('profileEmail');
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  const metaLineEl = document.getElementById('profileMetaLine');
  const payBtnLabelEl = document.getElementById('profilePaymentBtnLabel');
  if (emailEl) emailEl.textContent = email || '—';
  if (avatarEl) {
    const initialSource = email || 'Z';
    avatarEl.textContent = initialSource.charAt(0).toUpperCase();
  }

  updateProfileAccountPanel();

  const sub = subData || await fetchSubscriptionForEmail(currentUser.email);
  subData = sub;

  const cardsContainer = document.getElementById('profileCards');
  const deviceList = document.getElementById('profileDeviceList');
  const limitText = document.getElementById('profileDeviceLimitText');
  const limitBar = document.getElementById('profileDeviceLimitBar');
  const limitProgress = limitBar ? limitBar.parentElement : null;

  if (!sub) {
    if (nameEl) nameEl.textContent = 'ZedStream Account';
    if (metaLineEl) {
      metaLineEl.innerHTML = `<span class="profile-status-inline inactive"><span class="profile-status-dot"></span>No Active Subscription</span><span class="profile-meta-sep">·</span><span>Subscribe to unlock Live TV channels</span>`;
    }
    if (payBtnLabelEl) payBtnLabelEl.textContent = 'Subscribe Now';
    cardsContainer.innerHTML = `
      <div class="profile-empty-sub">
        <div>
          <div class="profile-empty-sub-title">No active subscription found</div>
          <div class="profile-empty-sub-desc">Link a plan to ${escapeHtml(email || 'this account')} to stream Live TV and manage devices.</div>
        </div>
        <button type="button" class="profile-btn profile-btn-primary" id="profileEmptyPayBtn">View Plans</button>
      </div>`;
    const emptyPayBtn = document.getElementById('profileEmptyPayBtn');
    if (emptyPayBtn) emptyPayBtn.addEventListener('click', () => { window.location.href = 'go:payment'; });
    deviceList.innerHTML = '<div class="device-empty">No devices registered on this account.</div>';
    limitText.textContent = '0 / 0 active';
    limitBar.style.width = '0%';
    if (limitProgress) limitProgress.setAttribute('aria-valuenow', '0');
    return;
  }

  const days = Math.max(0, getDaysLeft(sub.expiryDate));
  const status = getEffectiveSubscriptionStatus(sub);
  const statusClass = status === 'active' ? 'active' : (status === 'expired' ? 'expired' : 'inactive');
  const statusLabel = status === 'active' ? 'Active' : (status === 'expired' ? 'Expired' : status.replace(/^\w/, c => c.toUpperCase()));
  const plan = String(sub.planName || sub.planType || sub.subTier || 'Basic').trim();
  const planFormatted = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Basic';
  const rawPrice = typeof sub.price === 'string'
    ? sub.price.replace(/[^\d.-]/g, '')
    : sub.price;
  const priceNum = Number(rawPrice || 0);
  const priceFormatted = Number.isFinite(priceNum)
    ? (Number.isInteger(priceNum)
      ? `ZMW ${priceNum.toLocaleString('en-US')}`
      : `ZMW ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    : 'ZMW 0';
  const billing = String(sub.billingCycle || 'monthly').trim().toLowerCase();
  const billingLabel = billing.charAt(0).toUpperCase() + billing.slice(1);
  const billingUnit = billing.replace(/ly$/i, '') || 'month';
  const limit = Math.max(1, Number(sub.deviceLimit || 1));
  const connected = Array.isArray(sub.connectedDevices) ? sub.connectedDevices : [];
  const serviceName = String(sub.serviceName || 'ZedStream').trim() || 'ZedStream';
  const formattedExpiry = formatProfileDate(sub.expiryDate);
  const expiryMetaText = status === 'active'
    ? `Renews ${formattedExpiry}`
    : (formattedExpiry !== '—' ? `Ended ${formattedExpiry}` : 'Renewal required');

  if (nameEl) nameEl.textContent = `${serviceName} · ${planFormatted}`;
  if (payBtnLabelEl) payBtnLabelEl.textContent = status === 'active' ? 'Manage Billing' : 'Renew Subscription';
  if (metaLineEl) {
    metaLineEl.innerHTML = `
      <span class="profile-status-inline ${statusClass}"><span class="profile-status-dot"></span>${escapeHtml(statusLabel)}</span>
      <span class="profile-meta-sep">·</span>
      <span>${escapeHtml(planFormatted)} (${escapeHtml(billingLabel)})</span>
      <span class="profile-meta-sep">·</span>
      <span>${escapeHtml(expiryMetaText)}</span>
    `;
  }

  cardsContainer.innerHTML = `
    <div class="profile-kpi-cell">
      <div class="profile-kpi-label">Subscription</div>
      <div class="profile-kpi-value status-${statusClass}">${escapeHtml(statusLabel)}</div>
      <div class="profile-kpi-sub">${escapeHtml(expiryMetaText)}</div>
    </div>
    <div class="profile-kpi-cell">
      <div class="profile-kpi-label">Time Remaining</div>
      <div class="profile-kpi-value">${days}<span class="profile-kpi-unit">${days === 1 ? 'day' : 'days'}</span></div>
      <div class="profile-kpi-sub">${days > 0 ? 'Active access period' : 'Renewal needed to stream'}</div>
    </div>
    <div class="profile-kpi-cell">
      <div class="profile-kpi-label">Current Plan</div>
      <div class="profile-kpi-value">${escapeHtml(planFormatted)}</div>
      <div class="profile-kpi-sub">${escapeHtml(billingLabel)} billing cycle</div>
    </div>
    <div class="profile-kpi-cell">
      <div class="profile-kpi-label">Plan Rate</div>
      <div class="profile-kpi-value">${escapeHtml(priceFormatted)}<span class="profile-kpi-unit">/ ${escapeHtml(billingUnit)}</span></div>
      <div class="profile-kpi-sub">Up to ${limit} device${limit === 1 ? '' : 's'}</div>
    </div>
  `;

  if (connected.length === 0) {
    deviceList.innerHTML = '<div class="device-empty">No devices connected yet. Play any channel to register this browser.</div>';
  } else {
    deviceList.innerHTML = connected.map((devId, idx) => {
      const isCurrent = devId === deviceId;
      return `
        <div class="device-item">
          <div class="device-item-icon ${isCurrent ? 'current' : ''}">
            <svg viewBox="0 0 24 24"><path d="${isCurrent
              ? 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z'
              : 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z'}"></path></svg>
          </div>
          <div class="device-item-info">
            <div class="device-item-title-row">
              <span class="device-item-label">${isCurrent ? 'This Browser' : 'Registered Device #' + (idx + 1)}</span>
              ${isCurrent ? '<span class="device-item-session">Current session</span>' : ''}
            </div>
            <div class="device-item-id" title="${escapeHtml(String(devId))}">${escapeHtml(String(devId))}</div>
          </div>
          <div class="device-item-action">
            ${!isCurrent
              ? `<button type="button" class="device-item-remove" data-devid="${escapeHtml(String(devId))}" aria-label="Remove device ${escapeHtml(String(devId))}">
                  <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                  <span>Remove</span>
                </button>`
              : '<span class="device-item-current-note">Active here</span>'}
          </div>
        </div>`;
    }).join('');

    deviceList.querySelectorAll('.device-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
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

  const pct = Math.min(Math.round((connected.length / limit) * 100), 100);
  limitText.textContent = `${connected.length} / ${limit} active`;
  limitBar.style.width = pct + '%';
  limitBar.style.background = connected.length >= limit ? 'var(--accent)' : 'var(--success)';
  if (limitProgress) limitProgress.setAttribute('aria-valuenow', String(pct));
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
  document.getElementById('profileRefreshBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!currentUser || !currentUser.email) return;
    btn.disabled = true;
    btn.classList.add('loading');
    try {
      const fresh = await fetchSubscriptionForEmail(currentUser.email, { forceRefresh: true });
      if (fresh) {
        subData = fresh;
        updateSidebarStatus(subData, getDaysLeft(subData.expiryDate));
      } else if (!lastSubIndexError) {
        subData = null;
        updateSidebarStatus(null, 0);
      }
      await renderProfilePage();
      showToast('Account Refreshed', 'Subscription and device status updated.', 'success');
    } catch (err) {
      showToast('Refresh Failed', 'Could not refresh account details right now.', 'error');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
  document.getElementById('profileCopyDeviceBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!deviceId) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(deviceId);
      } else {
        const ta = document.createElement('textarea');
        ta.value = deviceId;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btn.textContent = 'Copied';
      showToast('Device ID Copied', 'Copied this browser device ID to clipboard.', 'success');
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    } catch (_) {
      showToast('Copy Failed', 'Select and copy the device ID manually.', 'info');
    }
  });
  document.getElementById('profileFavoritesBtn')?.addEventListener('click', showFavoritesPage);
  document.getElementById('profileHistoryBtn')?.addEventListener('click', showHistoryPage);
  document.getElementById('profileMatureBtn')?.addEventListener('click', handleLock18Click);
  document.getElementById('profileLogoutBtn')?.addEventListener('click', performLogout);
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

/* ===== VIDEO PLAYER & PICTURE-IN-PICTURE CONTROLLER ===== */
const QUALITY_PREF_STORAGE_KEY = 'zedstream_quality_pref_v1';
const ASPECT_MODE_STORAGE_KEY = 'zedstream_aspect_mode_v1';
const LAST_WATCHED_CHANNEL_STORAGE_KEY = 'zedstream_last_channel_v1';
const PLAYER_VOLUME_STORAGE_KEY = 'zedstream_player_volume_v1';

let authReadyForAutoRestore = false;
let channelsReadyForAutoRestore = false;
let lastChannelAutoRestored = false;

const ASPECT_MODES = [
  { key: 'fit', label: 'Fit', desc: 'Original ratio, full picture' },
  { key: 'fill', label: 'Fill', desc: 'Stretch to fill screen' },
  { key: 'zoom', label: 'Zoom', desc: 'Crop edges & fill frame' }
];

const playerState = {
  open: false,
  pip: false,
  nativePip: false,
  channel: null,
  streamIndex: 0,
  streams: [],
  hls: null,
  shaka: null,
  mpegts: null,
  onEngineFallback: null,
  shakaPolyfillsInstalled: false,
  controlsTimer: null,
  chromeTimer: null,
  chromeHover: false,
  aspectOsdTimer: null,
  landscapeFallbackTimer: null,
  cssFullscreen: false,
  userFullscreen: false,
  autoLandscape: false,
  landscapeDismissed: false,
  manualRotateDeg: 0,
  preFsScrollY: null,
  keepingCssFsOnNativeExit: false,
  customPos: null,
  aspectMode: 'fit',
  qualityPref: 'auto',
  qualityLevels: [],
  activeQualityLevel: -1,
  detectedHeight: 0,
  privateStream: false,
  relatedChannels: [],
  userPaused: false,
  suppressVolumeSave: false,
  autoRetryCount: 0,
  maxAutoRetries: 5,
  autoRetryDelayMs: 3000,
  autoRetryTimer: null,
  autoRetryTickTimer: null,
  autoRetryDeadline: 0,
  autoRetryUserCancelled: false,
  roundFailCount: 0,
  stallWatchdogTimer: null,
  bufferHealthTimer: null,
  lastBufferingAt: 0,
  lastStallAt: 0,
  rebufferTimestamps: [],
  engineBuffering: false,
  hasStartedPlayback: false,
  loadToken: 0
};

function loadPlayerVolume() {
  const video = document.getElementById('playerVideo');
  if (!video) return;
  let volume = 1;
  let muted = false;
  try {
    const raw = localStorage.getItem(PLAYER_VOLUME_STORAGE_KEY);
    if (raw !== null && raw !== '') {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'number' && Number.isFinite(parsed)) {
        volume = Math.min(1, Math.max(0, parsed));
        muted = volume === 0;
      } else if (parsed && typeof parsed === 'object') {
        if (typeof parsed.volume === 'number' && Number.isFinite(parsed.volume)) {
          volume = Math.min(1, Math.max(0, parsed.volume));
        }
        if (typeof parsed.muted === 'boolean') {
          muted = parsed.muted;
        }
      }
    }
  } catch (e) {}

  playerState.suppressVolumeSave = true;
  try {
    video.volume = volume;
    video.muted = muted;
  } catch (e) {}
  updatePlayerPlaybackUI();
  playerState.suppressVolumeSave = false;
}

function savePlayerVolume() {
  if (playerState.suppressVolumeSave) return;
  const video = document.getElementById('playerVideo');
  if (!video) return;
  try {
    const vol = Number.isFinite(video.volume) ? Math.min(1, Math.max(0, Number(video.volume.toFixed(3)))) : 1;
    localStorage.setItem(PLAYER_VOLUME_STORAGE_KEY, JSON.stringify({
      volume: vol,
      muted: Boolean(video.muted)
    }));
  } catch (e) {}
}

function saveLastWatchedChannel(channel) {
  if (!channel) return;
  const primary = normalizePlayableStreamUrl(channel.link);
  const backup = normalizePlayableStreamUrl(channel.link2);
  if (!primary && !backup) return;
  try {
    const drmFields = typeof pickChannelDrmFields === 'function' ? pickChannelDrmFields(channel) : {};
    const snapshot = {
      id: channel.id || '',
      name: channel.name || 'Live TV',
      category: channel.category || 'live',
      badge: channel.badge || '',
      img: channel.img || '',
      link: channel.link || '',
      link2: channel.link2 || '',
      type: channel.type || '',
      format: channel.format || '',
      mimeType: channel.mimeType || '',
      ...drmFields,
      savedAt: Date.now()
    };
    localStorage.setItem(LAST_WATCHED_CHANNEL_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {}
}

function loadLastWatchedChannel() {
  try {
    const raw = localStorage.getItem(LAST_WATCHED_CHANNEL_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return null;
    const link = normalizePlayableStreamUrl(saved.link);
    const link2 = normalizePlayableStreamUrl(saved.link2);
    if (!link && !link2) return null;

    if (Array.isArray(liveChannels) && liveChannels.length > 0) {
      const savedKey = typeof getChannelKey === 'function' ? getChannelKey(saved) : '';
      const savedName = String(saved.name || '').trim().toLowerCase();
      const match = liveChannels.find((ch) =>
        (savedKey && typeof getChannelKey === 'function' && getChannelKey(ch) === savedKey) ||
        (savedName && ch.name && String(ch.name).trim().toLowerCase() === savedName)
      );
      if (match) {
        return {
          ...saved,
          ...match,
          ...(typeof pickChannelDrmFields === 'function' ? pickChannelDrmFields(match, saved) : {})
        };
      }
    }
    return saved;
  } catch (e) {
    return null;
  }
}

async function attemptPlayerPlayback(video, targetPlayer) {
  if (!video || playerState.userPaused) return;
  const player = targetPlayer && typeof targetPlayer.play === 'function' ? targetPlayer : video;
  try {
    const res = player.play();
    if (res && typeof res.then === 'function') {
      await res;
    }
  } catch (err) {
    if (err && err.name === 'NotAllowedError' && !video.muted) {
      playerState.suppressVolumeSave = true;
      video.muted = true;
      updatePlayerPlaybackUI();
      setTimeout(() => { playerState.suppressVolumeSave = false; }, 120);
      try {
        const retryRes = player.play();
        if (retryRes && typeof retryRes.then === 'function') {
          await retryRes;
        }
        showToast('Tap Unmute for Audio', 'Restored your last channel muted due to browser autoplay policy.', 'info');
      } catch (e2) {
        updatePlayerPlaybackUI();
      }
    }
  }
}

function maybeRestoreLastWatchedChannel() {
  if (!authReadyForAutoRestore || !channelsReadyForAutoRestore || lastChannelAutoRestored || playerState.open) {
    return;
  }
  if (!currentUser || !currentUser.email || !navigator.onLine) return;
  if (typeof currentNetworkState !== 'undefined' && (currentNetworkState === NETWORK_STATES.OFFLINE || currentNetworkState === NETWORK_STATES.NO_DATA)) {
    return;
  }
  if (typeof isSubscriptionValid !== 'function' || !isSubscriptionValid(subData)) {
    return;
  }

  const savedChannel = loadLastWatchedChannel();
  lastChannelAutoRestored = true;
  if (!savedChannel) return;

  if (typeof isMatureChannel === 'function' && isMatureChannel(savedChannel) && typeof matureUnlocked !== 'undefined' && !matureUnlocked) {
    return;
  }

  loadPlayerVolume();
  openVideoPlayer(savedChannel, { isAutoRestore: true });
}

function normalizeClearKeyHex(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const hexCandidate = s.replace(/^0x/i, '').replace(/-/g, '').toLowerCase();
  if (/^[0-9a-f]{32}$/.test(hexCandidate)) return hexCandidate;
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? b64 + '='.repeat(4 - (b64.length % 4)) : b64;
    const bin = atob(pad);
    if (bin.length === 16) {
      let out = '';
      for (let i = 0; i < bin.length; i++) {
        out += bin.charCodeAt(i).toString(16).padStart(2, '0');
      }
      return out;
    }
  } catch (e) {}
  return '';
}

function parseClearKeysInput(raw, fallbackKey) {
  const out = {};
  if (!raw && !fallbackKey) return out;

  if (typeof raw === 'string' && fallbackKey) {
    const kidHex = normalizeClearKeyHex(raw);
    const keyHex = normalizeClearKeyHex(fallbackKey);
    if (kidHex && keyHex) out[kidHex] = keyHex;
    return out;
  }

  if (Array.isArray(raw)) {
    raw.forEach(item => {
      if (!item) return;
      if (typeof item === 'string') {
        Object.assign(out, parseClearKeysInput(item));
      } else if (typeof item === 'object') {
        const kidHex = normalizeClearKeyHex(item.kid || item.keyId || item.id);
        const keyHex = normalizeClearKeyHex(item.k || item.key || item.value);
        if (kidHex && keyHex) out[kidHex] = keyHex;
      }
    });
    return out;
  }

  if (typeof raw === 'object' && raw !== null) {
    if (Array.isArray(raw.keys)) {
      return parseClearKeysInput(raw.keys);
    }
    if ((raw.keyId || raw.kid) && (raw.key || raw.k)) {
      const kidHex = normalizeClearKeyHex(raw.keyId || raw.kid);
      const keyHex = normalizeClearKeyHex(raw.key || raw.k);
      if (kidHex && keyHex) out[kidHex] = keyHex;
      return out;
    }
    Object.entries(raw).forEach(([k, v]) => {
      const kidHex = normalizeClearKeyHex(k);
      const keyHex = normalizeClearKeyHex(v);
      if (kidHex && keyHex) out[kidHex] = keyHex;
    });
    return out;
  }

  const str = String(raw || '').trim();
  if (!str) return out;
  if (str.startsWith('{') || str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      return parseClearKeysInput(parsed);
    } catch (e) {}
  }

  str.split(/[\n,;]+/).forEach(pair => {
    const clean = pair.trim();
    if (!clean) return;
    const sepIdx = clean.indexOf(':');
    if (sepIdx > 0) {
      const kidHex = normalizeClearKeyHex(clean.slice(0, sepIdx));
      const keyHex = normalizeClearKeyHex(clean.slice(sepIdx + 1));
      if (kidHex && keyHex) out[kidHex] = keyHex;
    }
  });
  return out;
}

function parseDrmHeadersInput(raw) {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const clean = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (k && v != null && String(k).trim()) clean[String(k).trim()] = String(v);
    });
    return Object.keys(clean).length ? clean : null;
  }
  const str = String(raw || '').trim();
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parseDrmHeadersInput(parsed);
    }
  } catch (e) {}
  return null;
}

function parseStreamAndInlineDrm(rawUrl) {
  const str = String(rawUrl || '').trim();
  if (!str) return { url: '', inlineDrm: null };
  const pipeIdx = str.indexOf('|');
  if (pipeIdx === -1) return { url: str, inlineDrm: null };
  const cleanUrl = str.slice(0, pipeIdx).trim();
  const paramStr = str.slice(pipeIdx + 1).trim();
  const params = new URLSearchParams(paramStr.replace(/\|/g, '&'));
  const scheme = (params.get('drmScheme') || params.get('drm') || '').toLowerCase();
  const license = params.get('drmLicense') || params.get('licenseUrl') || params.get('license') || '';
  const clearKeyParam = params.get('clearkey') || params.get('clearKeys') || '';
  const kidParam = params.get('keyId') || params.get('kid') || '';
  const keyParam = params.get('key') || '';
  let clearKeys = {};
  if (clearKeyParam) Object.assign(clearKeys, parseClearKeysInput(clearKeyParam));
  if (kidParam && keyParam) Object.assign(clearKeys, parseClearKeysInput(kidParam, keyParam));
  let licenseUrl = '';
  if (license) {
    const parsedKeys = parseClearKeysInput(license);
    if (Object.keys(parsedKeys).length > 0 && (!scheme || scheme === 'clearkey')) {
      Object.assign(clearKeys, parsedKeys);
    } else if (/^https?:\/\//i.test(license)) {
      licenseUrl = license;
    }
  }
  const hasDrm = Object.keys(clearKeys).length > 0 || !!licenseUrl;
  return {
    url: cleanUrl || str,
    inlineDrm: hasDrm ? { scheme: scheme || 'auto', clearKeys, licenseUrl, headers: null } : null
  };
}

function extractClearKeysFromUrl(urlStr) {
  const out = {};
  const str = String(urlStr || '').trim();
  if (!str) return out;
  try {
    const parsedUrl = new URL(str, window.location.origin);
    const params = parsedUrl.searchParams;
    const ckParam = params.get('clearkey') || params.get('clearKeys') || params.get('keys') || '';
    if (ckParam) Object.assign(out, parseClearKeysInput(ckParam));
    const kidParam = params.get('keyid') || params.get('kid') || params.get('keyId') || params.get('key_id') || '';
    const keyParam = params.get('key') || params.get('k') || '';
    if (kidParam && keyParam) {
      const kids = kidParam.split(',').map(s => s.trim()).filter(Boolean);
      const keys = keyParam.split(',').map(s => s.trim()).filter(Boolean);
      kids.forEach((kd, idx) => {
        const kv = keys[idx] || keys[0];
        if (kd && kv) Object.assign(out, parseClearKeysInput(kd, kv));
      });
    }
  } catch (e) {}
  return out;
}

async function fetchClearKeysFromLicenseUrl(licenseUrl, headers) {
  if (!licenseUrl || !/^https?:\/\//i.test(licenseUrl)) return {};
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 3500) : null;
    const opts = { method: 'GET', cache: 'no-store' };
    if (headers && Object.keys(headers).length) opts.headers = headers;
    if (controller) opts.signal = controller.signal;
    const resp = await fetch(licenseUrl, opts);
    if (timer) clearTimeout(timer);
    if (!resp || !resp.ok) return {};
    const text = await resp.text();
    if (!text) return {};
    return parseClearKeysInput(text.trim());
  } catch (e) {
    return {};
  }
}

function extractChannelDrmConfig(channel, rawUrl) {
  const { url, inlineDrm } = parseStreamAndInlineDrm(rawUrl);
  const drmObj = (channel && typeof channel.drm === 'object' && channel.drm) ? channel.drm : {};
  const clearKeys = {};

  if (channel) {
    if (channel.clearKeys) Object.assign(clearKeys, parseClearKeysInput(channel.clearKeys));
    if (channel.clearkey) Object.assign(clearKeys, parseClearKeysInput(channel.clearkey));
    if ((channel.keyId || channel.kid || channel.drmKeyId) && (channel.key || channel.drmKey)) {
      Object.assign(clearKeys, parseClearKeysInput(channel.keyId || channel.kid || channel.drmKeyId, channel.key || channel.drmKey));
    }
  }
  if (drmObj.clearKeys) Object.assign(clearKeys, parseClearKeysInput(drmObj.clearKeys));
  if (drmObj.clearkey) Object.assign(clearKeys, parseClearKeysInput(drmObj.clearkey));
  if ((drmObj.keyId || drmObj.kid) && (drmObj.key || drmObj.k)) {
    Object.assign(clearKeys, parseClearKeysInput(drmObj.keyId || drmObj.kid, drmObj.key || drmObj.k));
  }
  if (inlineDrm && inlineDrm.clearKeys) {
    Object.assign(clearKeys, inlineDrm.clearKeys);
  }

  let licenseUrl = String(
    (channel && (channel.licenseUrl || channel.licenseServer || channel.licenseServerUrl || channel.drmLicenseUrl))
    || drmObj.licenseUrl || drmObj.licenseServer || drmObj.licenseServerUrl
    || (inlineDrm && inlineDrm.licenseUrl) || ''
  ).trim();

  if (!licenseUrl && channel && channel.drmLicense) {
    const maybeKeys = parseClearKeysInput(channel.drmLicense);
    if (Object.keys(maybeKeys).length > 0) Object.assign(clearKeys, maybeKeys);
    else if (/^https?:\/\//i.test(String(channel.drmLicense).trim())) licenseUrl = String(channel.drmLicense).trim();
  }

  const servers = (drmObj.servers && typeof drmObj.servers === 'object') ? { ...drmObj.servers } : {};
  const schemeRaw = String((channel && (channel.drmScheme || channel.drmType)) || drmObj.scheme || drmObj.type || (inlineDrm && inlineDrm.scheme) || 'auto').toLowerCase();
  const headers = parseDrmHeadersInput((channel && (channel.drmHeaders || channel.licenseHeaders)) || drmObj.headers);

  if (licenseUrl && (schemeRaw === 'clearkey' || schemeRaw === 'auto' || /clearkey|clkey|keyid=/i.test(licenseUrl))) {
    const urlKeys = extractClearKeysFromUrl(licenseUrl);
    if (Object.keys(urlKeys).length > 0) Object.assign(clearKeys, urlKeys);
  }

  return {
    cleanUrl: url,
    scheme: schemeRaw || 'auto',
    clearKeys,
    licenseUrl,
    servers,
    headers
  };
}

function resolveEffectiveDrmConfig(rawUrl) {
  return extractChannelDrmConfig(playerState.channel, rawUrl);
}

function hasActiveDrmConfig(drmCfg) {
  if (!drmCfg) return false;
  return (drmCfg.clearKeys && Object.keys(drmCfg.clearKeys).length > 0)
    || !!drmCfg.licenseUrl
    || (drmCfg.servers && Object.keys(drmCfg.servers).length > 0);
}

function buildShakaDrmConfig(drmCfg) {
  const servers = { ...(drmCfg.servers || {}) };
  const clearKeys = { ...(drmCfg.clearKeys || {}) };
  const hasStaticClearKeys = Object.keys(clearKeys).length > 0;
  const scheme = (drmCfg.scheme || 'auto').toLowerCase();
  if (drmCfg.licenseUrl) {
    if (scheme === 'clearkey') {
      if (!hasStaticClearKeys) servers['org.w3.clearkey'] = drmCfg.licenseUrl;
    } else if (scheme === 'widevine') {
      servers['com.widevine.alpha'] = drmCfg.licenseUrl;
    } else if (scheme === 'playready') {
      servers['com.microsoft.playready'] = drmCfg.licenseUrl;
    } else {
      servers['com.widevine.alpha'] = servers['com.widevine.alpha'] || drmCfg.licenseUrl;
      servers['com.microsoft.playready'] = servers['com.microsoft.playready'] || drmCfg.licenseUrl;
      if (!hasStaticClearKeys) {
        servers['org.w3.clearkey'] = servers['org.w3.clearkey'] || drmCfg.licenseUrl;
      }
    }
  }
  const shakaDrm = {
    retryParameters: { maxAttempts: 3, baseDelay: 800, backoffFactor: 2 }
  };
  if (hasStaticClearKeys && scheme !== 'widevine' && scheme !== 'playready') {
    shakaDrm.clearKeys = clearKeys;
  }
  if (Object.keys(servers).length > 0) {
    shakaDrm.servers = servers;
  }
  return shakaDrm;
}

function loadQualityPref() {
  try {
    const saved = localStorage.getItem(QUALITY_PREF_STORAGE_KEY);
    if (saved) playerState.qualityPref = saved;
  } catch (e) {}
}

function saveQualityPref(pref) {
  playerState.qualityPref = pref;
  try {
    localStorage.setItem(QUALITY_PREF_STORAGE_KEY, pref);
  } catch (e) {}
}

function formatQualityHeight(height) {
  const h = Number(height || 0);
  if (!h) return '';
  if (h >= 2160) return '4K';
  if (h >= 1440) return '1440p';
  if (h >= 1080) return '1080p';
  if (h >= 720) return '720p';
  if (h >= 540) return '540p';
  if (h >= 480) return '480p';
  if (h >= 360) return '360p';
  if (h >= 240) return '240p';
  return h + 'p';
}

function formatQualityBitrate(bitrate) {
  const bps = Number(bitrate || 0);
  if (!bps) return '';
  if (bps >= 1000000) return (bps / 1000000).toFixed(1) + ' Mbps';
  return Math.round(bps / 1000) + ' kbps';
}

function parseResolutionHeight(lvl) {
  let height = Number((lvl && lvl.height) || 0);
  if (height > 0) return height;
  const resAttr = lvl && lvl.attrs && (lvl.attrs.RESOLUTION || lvl.attrs.resolution);
  if (resAttr) {
    const m = String(resAttr).match(/(\d+)\s*[xX]\s*(\d+)/);
    if (m && m[2]) return Number(m[2]) || 0;
  }
  const nameAttr = (lvl && (lvl.name || (lvl.attrs && (lvl.attrs.NAME || lvl.attrs.name)))) || '';
  if (nameAttr) {
    const m = String(nameAttr).match(/\b(\d{3,4})\s*p\b/i);
    if (m && m[1]) return Number(m[1]) || 0;
    if (/\b4k\b/i.test(String(nameAttr))) return 2160;
  }
  return 0;
}

function extractHlsQualityLevels(hls) {
  if (!hls || !Array.isArray(hls.levels)) return [];
  const byHeight = new Map();
  hls.levels.forEach((lvl, idx) => {
    const height = parseResolutionHeight(lvl);
    const bitrate = Number(lvl.bitrate || 0);
    const key = height ? 'h:' + height : 'i:' + idx;
    const prev = byHeight.get(key);
    if (!prev || bitrate > prev.bitrate) {
      const label = height ? formatQualityHeight(height) : formatQualityBitrate(bitrate) || ('Level ' + (idx + 1));
      byHeight.set(key, {
        index: idx,
        height,
        width: Number(lvl.width || 0),
        bitrate,
        label
      });
    }
  });
  return Array.from(byHeight.values()).sort((a, b) => (b.height - a.height) || (b.bitrate - a.bitrate));
}

function extractShakaQualityLevels(shakaPlayer) {
  if (!shakaPlayer || typeof shakaPlayer.getVariantTracks !== 'function') return [];
  const rawTracks = shakaPlayer.getVariantTracks() || [];
  const hasVideoTrack = rawTracks.some(t => Number(t.height || 0) > 0 || Number(t.width || 0) > 0 || !!t.videoCodec);
  const tracks = hasVideoTrack
    ? rawTracks.filter(t => Number(t.height || 0) > 0 || Number(t.width || 0) > 0 || !!t.videoCodec)
    : rawTracks;
  const byHeight = new Map();
  tracks.forEach(tr => {
    const height = Number(tr.height || 0);
    const bitrate = Number(tr.bandwidth || 0);
    const key = height ? 'h:' + height : 'i:' + tr.id;
    const prev = byHeight.get(key);
    if (!prev || bitrate > prev.bitrate) {
      const label = height ? formatQualityHeight(height) : formatQualityBitrate(bitrate) || ('Track ' + tr.id);
      byHeight.set(key, {
        index: tr.id,
        height,
        width: Number(tr.width || 0),
        bitrate,
        label
      });
    }
  });
  return Array.from(byHeight.values()).sort((a, b) => (b.height - a.height) || (b.bitrate - a.bitrate));
}

function getCurrentDetectedResolutionLabel() {
  if (playerState.shaka && typeof playerState.shaka.getVariantTracks === 'function') {
    const active = (playerState.shaka.getVariantTracks() || []).find(t => t.active);
    if (active && active.height) return formatQualityHeight(active.height);
  }
  if (playerState.hls && playerState.activeQualityLevel >= 0) {
    const lvl = playerState.hls.levels?.[playerState.activeQualityLevel];
    const h = lvl ? parseResolutionHeight(lvl) : 0;
    if (h) return formatQualityHeight(h);
  }
  if (playerState.detectedHeight > 0) {
    return formatQualityHeight(playerState.detectedHeight);
  }
  return '';
}

function positionPlayerDropdownMenu(menu) {
  if (!menu) return;
  menu.classList.remove('open-down');
  menu.style.maxHeight = '';
  if (!menu.classList.contains('open')) return;
  if (playerState.cssFullscreen || isPlayerFullscreen()) return;

  const shellEl = document.getElementById('playerShell');
  const controlsEl = shellEl ? shellEl.querySelector('.player-controls') : null;
  const anchorEl = controlsEl || menu.parentElement;
  if (!anchorEl) return;

  const anchorRect = anchorEl.getBoundingClientRect();
  const vv = window.visualViewport;
  let vpTop = vv ? vv.offsetTop : 0;
  let vpBottom = vpTop + (vv ? vv.height : window.innerHeight);

  if (shellEl) {
    const shellStyle = window.getComputedStyle(shellEl);
    if (shellStyle.overflowY === 'auto' || shellStyle.overflowY === 'scroll' || shellStyle.overflowY === 'hidden') {
      const shellRect = shellEl.getBoundingClientRect();
      vpTop = Math.max(vpTop, shellRect.top);
      vpBottom = Math.min(vpBottom, shellRect.bottom);
    }
  }

  const margin = 12;
  const gap = 8;
  const spaceAbove = Math.max(0, anchorRect.top - vpTop - margin - gap);
  const spaceBelow = Math.max(0, vpBottom - anchorRect.bottom - margin - gap);
  const naturalHeight = menu.scrollHeight || 0;

  if (naturalHeight > spaceAbove && spaceBelow > spaceAbove && spaceBelow >= 160) {
    menu.classList.add('open-down');
    menu.style.maxHeight = Math.max(150, Math.min(440, Math.floor(spaceBelow))) + 'px';
  } else {
    menu.style.maxHeight = Math.max(150, Math.min(440, Math.floor(spaceAbove || 260))) + 'px';
  }
}

function updatePlayerQualityUI() {
  const btn = document.getElementById('playerQualityBtn');
  const labelEl = document.getElementById('playerQualityLabel');
  const menuEl = document.getElementById('playerQualityMenu');
  if (!btn || !labelEl || !menuEl) return;

  const isAuto = playerState.qualityPref === 'auto';
  const detectedRes = getCurrentDetectedResolutionLabel();
  if (isAuto) {
    labelEl.textContent = detectedRes ? 'Auto · ' + detectedRes : 'Auto';
  } else {
    const activeLvl = playerState.qualityLevels.find(l => String(l.height || l.index) === playerState.qualityPref || l.index === playerState.activeQualityLevel);
    labelEl.textContent = (activeLvl && activeLvl.label) || (detectedRes || 'Auto');
  }
  btn.classList.toggle('active', isAuto);

  const checkSvg = '<svg class="player-quality-check" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>';
  const autoSub = detectedRes
    ? 'Adjusting automatically · ' + detectedRes
    : 'Adjusts to network & viewport';

  const countBadge = playerState.qualityLevels.length > 0 ? ' (' + playerState.qualityLevels.length + ')' : '';
  let html = '<div class="player-quality-menu-head"><span>Quality Format' + countBadge + '</span><span>' + (isAuto ? 'ABR On' : 'Manual') + '</span></div>';
  html += `
    <button type="button" class="player-quality-option ${isAuto ? 'active' : ''}" data-qpref="auto" role="menuitemradio" aria-checked="${isAuto ? 'true' : 'false'}">
      <span class="player-quality-option-main">
        <span class="player-quality-option-title">Auto (Recommended)</span>
        <span class="player-quality-option-sub">${escapeHtml(autoSub)}</span>
      </span>
      ${checkSvg}
    </button>`;

  playerState.qualityLevels.forEach(lvl => {
    const prefVal = String(lvl.height || lvl.index);
    const isSelected = !isAuto && (playerState.qualityPref === prefVal || playerState.activeQualityLevel === lvl.index);
    const subParts = [];
    if (lvl.height >= 2160) subParts.push('Ultra HD');
    else if (lvl.height >= 1080) subParts.push('Full HD');
    else if (lvl.height >= 720) subParts.push('HD');
    else if (lvl.height >= 480) subParts.push('SD');
    const br = formatQualityBitrate(lvl.bitrate);
    if (br) subParts.push(br);
    html += `
      <button type="button" class="player-quality-option ${isSelected ? 'active' : ''}" data-qpref="${escapeHtml(prefVal)}" data-qidx="${lvl.index}" role="menuitemradio" aria-checked="${isSelected ? 'true' : 'false'}">
        <span class="player-quality-option-main">
          <span class="player-quality-option-title">${escapeHtml(lvl.label)}</span>
          ${subParts.length ? '<span class="player-quality-option-sub">' + escapeHtml(subParts.join(' · ')) + '</span>' : ''}
        </span>
        ${checkSvg}
      </button>`;
  });

  menuEl.innerHTML = html;
  menuEl.querySelectorAll('.player-quality-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const pref = opt.dataset.qpref || 'auto';
      const idx = opt.dataset.qidx != null ? parseInt(opt.dataset.qidx) : -1;
      applyQualityPreference(pref, idx, true);
      closeQualityMenu(e.detail === 0);
    });
  });

  if (menuEl.classList.contains('open')) {
    positionPlayerDropdownMenu(menuEl);
  }
}

function applyQualityPreference(pref, explicitIndex, notifyUser) {
  saveQualityPref(pref || 'auto');
  const hls = playerState.hls;
  const shakaPlayer = playerState.shaka;
  if (shakaPlayer) {
    if (playerState.qualityPref === 'auto') {
      shakaPlayer.configure({ abr: { enabled: true } });
      const activeTrack = (shakaPlayer.getVariantTracks() || []).find(t => t.active);
      playerState.activeQualityLevel = activeTrack ? activeTrack.id : -1;
      if (notifyUser) {
        showToast('Auto Quality Enabled', 'Channel quality will adjust automatically for smooth playback.', 'info');
      }
    } else {
      const tracks = shakaPlayer.getVariantTracks() || [];
      let chosenLevel = null;
      if (typeof explicitIndex === 'number' && explicitIndex >= 0) {
        chosenLevel = playerState.qualityLevels.find(l => l.index === explicitIndex) || null;
      }
      if (!chosenLevel && playerState.qualityLevels.length > 0) {
        const wantedHeight = parseInt(playerState.qualityPref);
        chosenLevel = playerState.qualityLevels.find(l => String(l.height || l.index) === playerState.qualityPref) || null;
        if (!chosenLevel && !Number.isNaN(wantedHeight)) {
          let bestDiff = Infinity;
          playerState.qualityLevels.forEach(l => {
            const diff = Math.abs((l.height || 0) - wantedHeight);
            if (diff < bestDiff) { bestDiff = diff; chosenLevel = l; }
          });
        }
      }
      const targetTrack = chosenLevel ? tracks.find(t => t.id === chosenLevel.index) : null;
      if (targetTrack) {
        shakaPlayer.configure({ abr: { enabled: false } });
        shakaPlayer.selectVariantTrack(targetTrack, true);
        playerState.activeQualityLevel = targetTrack.id;
        if (notifyUser) {
          showToast('Quality Changed', 'Stream format set to ' + chosenLevel.label + '.', 'info');
        }
      } else {
        shakaPlayer.configure({ abr: { enabled: true } });
        saveQualityPref('auto');
      }
    }
  } else if (hls) {
    if (playerState.qualityPref === 'auto') {
      hls.currentLevel = -1;
      hls.nextLevel = -1;
      hls.loadLevel = -1;
      playerState.activeQualityLevel = hls.currentLevel;
      if (notifyUser) {
        showToast('Auto Quality Enabled', 'Channel quality will adjust automatically for smooth playback.', 'info');
      }
    } else {
      let targetIdx = (typeof explicitIndex === 'number' && explicitIndex >= 0) ? explicitIndex : -1;
      if (targetIdx < 0 && playerState.qualityLevels.length > 0) {
        const wantedHeight = parseInt(playerState.qualityPref);
        const exact = playerState.qualityLevels.find(l => String(l.height || l.index) === playerState.qualityPref);
        if (exact) {
          targetIdx = exact.index;
        } else if (!Number.isNaN(wantedHeight)) {
          let best = playerState.qualityLevels[0];
          let bestDiff = Infinity;
          playerState.qualityLevels.forEach(l => {
            const diff = Math.abs((l.height || 0) - wantedHeight);
            if (diff < bestDiff) { bestDiff = diff; best = l; }
          });
          if (best) targetIdx = best.index;
        }
      }
      if (targetIdx >= 0) {
        hls.currentLevel = targetIdx;
        hls.nextLevel = targetIdx;
        playerState.activeQualityLevel = targetIdx;
        const chosen = playerState.qualityLevels.find(l => l.index === targetIdx);
        if (notifyUser && chosen) {
          showToast('Quality Changed', 'Stream format set to ' + chosen.label + '.', 'info');
        }
      } else {
        hls.currentLevel = -1;
        saveQualityPref('auto');
      }
    }
  } else if (notifyUser && playerState.qualityPref === 'auto') {
    showToast('Auto Quality Enabled', 'Stream adjusts quality automatically.', 'info');
  }
  updatePlayerQualityUI();
}

function toggleQualityMenu(focusFirst) {
  const menu = document.getElementById('playerQualityMenu');
  const btn = document.getElementById('playerQualityBtn');
  if (!menu || !btn) return;
  const next = !menu.classList.contains('open');
  if (next) closeAspectMenu();
  menu.classList.toggle('open', next);
  btn.setAttribute('aria-expanded', next ? 'true' : 'false');
  if (next) {
    positionPlayerDropdownMenu(menu);
    if (focusFirst) {
      const targetOpt = menu.querySelector('.player-quality-option.active') || menu.querySelector('.player-quality-option');
      if (targetOpt) targetOpt.focus({ preventScroll: true });
    }
  }
}

function closeQualityMenu(restoreFocus) {
  const menu = document.getElementById('playerQualityMenu');
  const btn = document.getElementById('playerQualityBtn');
  if (menu) {
    menu.classList.remove('open', 'open-down');
    menu.style.maxHeight = '';
  }
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) btn.focus({ preventScroll: true });
  }
  scheduleHidePlayerControls(3000);
}

function loadAspectMode() {
  try {
    const saved = localStorage.getItem(ASPECT_MODE_STORAGE_KEY);
    if (saved && ASPECT_MODES.some(m => m.key === saved)) {
      playerState.aspectMode = saved;
    } else {
      playerState.aspectMode = 'fit';
    }
  } catch (e) {
    playerState.aspectMode = 'fit';
  }
  applyAspectMode(playerState.aspectMode, false);
}

function saveAspectMode(mode) {
  playerState.aspectMode = ASPECT_MODES.some(m => m.key === mode) ? mode : 'fit';
  try {
    localStorage.setItem(ASPECT_MODE_STORAGE_KEY, playerState.aspectMode);
  } catch (e) {}
}

function showAspectOsd(label) {
  const osd = document.getElementById('playerAspectOsd');
  if (!osd) return;
  osd.textContent = label;
  osd.classList.add('visible');
  if (playerState.aspectOsdTimer) clearTimeout(playerState.aspectOsdTimer);
  playerState.aspectOsdTimer = setTimeout(() => {
    osd.classList.remove('visible');
  }, 1100);
}

function updatePlayerAspectUI() {
  const labelEl = document.getElementById('playerAspectLabel');
  const btnEl = document.getElementById('playerAspectBtn');
  const menuEl = document.getElementById('playerAspectMenu');
  const current = ASPECT_MODES.find(m => m.key === playerState.aspectMode) || ASPECT_MODES[0];

  if (labelEl) labelEl.textContent = current.label;
  if (btnEl) {
    btnEl.classList.toggle('active', current.key !== 'fit');
    btnEl.title = 'Screen Mode: ' + current.label + ' (Z)';
  }
  if (!menuEl) return;

  const checkSvg = '<svg class="player-quality-check" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>';
  let html = '<div class="player-quality-menu-head"><span>Screen Mode</span><span>Fit / Fill / Zoom</span></div>';
  ASPECT_MODES.forEach(m => {
    const active = m.key === current.key;
    html += '<button type="button" class="player-quality-option' + (active ? ' active' : '') + '" role="menuitemradio" aria-checked="' + (active ? 'true' : 'false') + '" data-aspect-mode="' + m.key + '">'
      + '<span class="player-quality-option-main"><span class="player-quality-option-title">' + m.label + '</span><span class="player-quality-option-sub">' + m.desc + '</span></span>'
      + checkSvg
      + '</button>';
  });
  menuEl.innerHTML = html;

  menuEl.querySelectorAll('[data-aspect-mode]').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-aspect-mode') || 'fit';
      applyAspectMode(val, true);
      closeAspectMenu(e.detail === 0);
    });
  });
}

function applyAspectMode(mode, notifyOsd) {
  const valid = ASPECT_MODES.find(m => m.key === mode) || ASPECT_MODES[0];
  saveAspectMode(valid.key);
  const stage = document.getElementById('playerStage');
  if (stage) {
    stage.setAttribute('data-aspect', valid.key);
  }
  updatePlayerAspectUI();
  if (notifyOsd) {
    showAspectOsd(valid.label);
  }
}

function cycleAspectMode() {
  const idx = ASPECT_MODES.findIndex(m => m.key === playerState.aspectMode);
  const next = ASPECT_MODES[(idx + 1) % ASPECT_MODES.length];
  applyAspectMode(next.key, true);
}

function toggleAspectMenu(focusFirst) {
  const menu = document.getElementById('playerAspectMenu');
  const btn = document.getElementById('playerAspectBtn');
  if (!menu || !btn) return;
  const next = !menu.classList.contains('open');
  if (next) closeQualityMenu();
  menu.classList.toggle('open', next);
  btn.setAttribute('aria-expanded', next ? 'true' : 'false');
  if (next) {
    positionPlayerDropdownMenu(menu);
    if (focusFirst) {
      const targetOpt = menu.querySelector('.player-quality-option.active') || menu.querySelector('.player-quality-option');
      if (targetOpt) targetOpt.focus({ preventScroll: true });
    }
  }
}

function closeAspectMenu(restoreFocus) {
  const menu = document.getElementById('playerAspectMenu');
  const btn = document.getElementById('playerAspectBtn');
  if (menu) {
    menu.classList.remove('open', 'open-down');
    menu.style.maxHeight = '';
  }
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) btn.focus({ preventScroll: true });
  }
  scheduleHidePlayerControls(3000);
}

const PLAYER_ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>',
  volOn: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>',
  volOff: '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path></svg>',
  fsEnter: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>',
  fsExit: '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>'
};

function getFullscreenElement() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
    || null;
}

function isPlayerFullscreen() {
  return Boolean(getFullscreenElement() || playerState.cssFullscreen);
}

function isNativePipSupported(video) {
  if (!video) return false;
  if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') return true;
  if (typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode('picture-in-picture')) return true;
  return false;
}

function updatePlayerPlaybackUI() {
  const video = document.getElementById('playerVideo');
  const playBtn = document.getElementById('playerPlayBtn');
  const pipPlayBtn = document.getElementById('pipPlayBtn');
  const muteBtn = document.getElementById('playerMuteBtn');
  const pipMuteBtn = document.getElementById('pipMuteBtn');
  const volSlider = document.getElementById('playerVolume');
  const nativeBtn = document.getElementById('playerNativePipBtn');
  const pipNativeBtn = document.getElementById('pipNativeBtn');
  const miniPipBtn = document.getElementById('playerPipBtn');
  const fsBtn = document.getElementById('playerFullscreenBtn');
  if (!video) return;

  const isPaused = video.paused;
  const playHtml = isPaused ? PLAYER_ICONS.play : PLAYER_ICONS.pause;
  if (playBtn) playBtn.innerHTML = playHtml;
  if (pipPlayBtn) pipPlayBtn.innerHTML = playHtml;

  const isMuted = video.muted || video.volume === 0;
  const volHtml = isMuted ? PLAYER_ICONS.volOff : PLAYER_ICONS.volOn;
  if (muteBtn) muteBtn.innerHTML = volHtml;
  if (pipMuteBtn) pipMuteBtn.innerHTML = volHtml;
  if (volSlider) volSlider.value = isMuted ? '0' : String(video.volume);

  const nativeSupported = isNativePipSupported(video);
  if (nativeBtn) {
    nativeBtn.style.display = nativeSupported ? '' : 'none';
    nativeBtn.classList.toggle('active', playerState.nativePip);
  }
  if (pipNativeBtn) {
    pipNativeBtn.style.display = nativeSupported ? '' : 'none';
    pipNativeBtn.classList.toggle('active', playerState.nativePip);
  }
  if (miniPipBtn) {
    miniPipBtn.classList.toggle('active', playerState.pip);
  }
  if (fsBtn) {
    const fsActive = isPlayerFullscreen();
    fsBtn.innerHTML = fsActive ? PLAYER_ICONS.fsExit : PLAYER_ICONS.fsEnter;
    fsBtn.classList.toggle('active', fsActive);
    fsBtn.title = fsActive ? 'Exit Fullscreen (F)' : 'Fullscreen Landscape (F)';
    fsBtn.setAttribute('aria-label', fsActive ? 'Exit Fullscreen' : 'Enter Landscape Fullscreen');
  }
  const rotateBtn = document.getElementById('playerRotateBtn');
  if (rotateBtn) {
    const rot = playerState.manualRotateDeg || 0;
    rotateBtn.classList.toggle('active', rot === 90 || rot === 270);
    rotateBtn.title = rot ? ('Rotated ' + rot + '° — Tap to cycle (R)') : 'Rotate 90° / 270° (R)';
  }
}

function setPlayerLoading(active, msg) {
  const el = document.getElementById('playerLoadingOverlay');
  const txt = document.getElementById('playerLoadingText');
  if (!el) return;
  if (msg && txt) txt.textContent = msg;
  el.classList.toggle('active', !!active);
  if (active) {
    revealPlayerControls();
    armStallWatchdog();
  } else {
    clearStallWatchdog();
    scheduleHidePlayerControls(2600);
  }
}

function updateRetryOverlayUI(opts) {
  const metaEl = document.getElementById('playerRetryMeta');
  const progEl = document.getElementById('playerRetryProgress');
  const barEl = document.getElementById('playerRetryProgressBar');
  const cancelBtn = document.getElementById('playerCancelRetryBtn');
  const retryBtn = document.getElementById('playerRetryBtn');
  const cfg = opts || {};

  if (metaEl) {
    if (cfg.metaText) {
      metaEl.textContent = cfg.metaText;
      metaEl.style.display = '';
    } else {
      metaEl.textContent = '';
      metaEl.style.display = 'none';
    }
  }
  if (progEl) {
    progEl.classList.toggle('active', !!cfg.showProgress);
  }
  if (barEl && typeof cfg.progress === 'number') {
    const clamped = Math.max(0, Math.min(1, cfg.progress));
    barEl.style.transform = 'scaleX(' + clamped.toFixed(3) + ')';
  }
  if (cancelBtn) {
    cancelBtn.style.display = cfg.showCancel ? '' : 'none';
  }
  if (retryBtn) {
    retryBtn.textContent = cfg.retryLabel || 'Retry Now';
  }
}

function cancelStreamAutoRetry(resetCount) {
  if (playerState.autoRetryTimer) {
    clearTimeout(playerState.autoRetryTimer);
    playerState.autoRetryTimer = null;
  }
  if (playerState.autoRetryTickTimer) {
    clearInterval(playerState.autoRetryTickTimer);
    playerState.autoRetryTickTimer = null;
  }
  playerState.autoRetryDeadline = 0;
  if (resetCount) {
    playerState.autoRetryCount = 0;
    playerState.autoRetryUserCancelled = false;
    playerState.roundFailCount = 0;
  }
  updateRetryOverlayUI({ metaText: '', showProgress: false, progress: 0, showCancel: false });
}

function clearStallWatchdog() {
  if (playerState.stallWatchdogTimer) {
    clearTimeout(playerState.stallWatchdogTimer);
    playerState.stallWatchdogTimer = null;
  }
}

function armStallWatchdog(forceConnecting) {
  clearStallWatchdog();
  if (!playerState.open || !playerState.streams.length || playerState.userPaused) return;
  const video = document.getElementById('playerVideo');
  if (!forceConnecting && video && video.paused) return;
  const armedToken = playerState.loadToken;
  playerState.stallWatchdogTimer = setTimeout(() => {
    playerState.stallWatchdogTimer = null;
    if (!playerState.open || armedToken !== playerState.loadToken || playerState.userPaused) return;
    const vid = document.getElementById('playerVideo');
    const errEl = document.getElementById('playerErrorOverlay');
    if (errEl && errEl.classList.contains('active')) return;
    if (!forceConnecting && vid && vid.paused) return;
    if (vid && vid.readyState >= 3 && !vid.ended) return;
    handleStreamLoadFailure('Stream connection timed out.');
  }, 12000);
}

function getVideoBufferAheadSeconds(video) {
  if (!video || !video.buffered || typeof video.buffered.length !== 'number') return 0;
  const t = Number.isFinite(video.currentTime) ? video.currentTime : 0;
  let ahead = 0;
  for (let i = 0; i < video.buffered.length; i++) {
    try {
      const start = video.buffered.start(i);
      const end = video.buffered.end(i);
      if (t >= start - 0.15 && t <= end) {
        ahead = Math.max(ahead, end - t);
      } else if (start > t && start - t < 0.75) {
        ahead = Math.max(ahead, end - t);
      }
    } catch (e) {}
  }
  return Math.max(0, ahead);
}

function getEstimatedBandwidthBps() {
  try {
    if (playerState.hls && typeof playerState.hls.bandwidthEstimate === 'number' && Number.isFinite(playerState.hls.bandwidthEstimate) && playerState.hls.bandwidthEstimate > 0) {
      return playerState.hls.bandwidthEstimate;
    }
    if (playerState.shaka && typeof playerState.shaka.getStats === 'function') {
      const stats = playerState.shaka.getStats();
      if (stats && typeof stats.estimatedBandwidth === 'number' && Number.isFinite(stats.estimatedBandwidth) && stats.estimatedBandwidth > 0) {
        return stats.estimatedBandwidth;
      }
    }
    const conn = navigator && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
    if (conn && typeof conn.downlink === 'number' && Number.isFinite(conn.downlink) && conn.downlink > 0) {
      return conn.downlink * 1000000;
    }
  } catch (e) {}
  return 0;
}

function formatBandwidthCompact(bps) {
  if (!bps || !Number.isFinite(bps) || bps <= 0) return '';
  if (bps >= 1000000) return (bps / 1000000).toFixed(1) + ' Mbps';
  return Math.max(1, Math.round(bps / 1000)) + ' kbps';
}

function recordPlayerRebuffer(isStall) {
  const now = Date.now();
  playerState.lastBufferingAt = now;
  if (isStall) playerState.lastStallAt = now;
  playerState.rebufferTimestamps = (playerState.rebufferTimestamps || []).filter(ts => now - ts < 20000);
  playerState.rebufferTimestamps.push(now);
}

function evaluateBufferHealth() {
  const video = document.getElementById('playerVideo');
  const errEl = document.getElementById('playerErrorOverlay');
  if (!playerState.open || playerState.pip || playerState.userPaused || !video || (errEl && errEl.classList.contains('active'))) {
    return { visible: false, state: 'healthy', label: '', detail: '' };
  }

  const now = Date.now();
  playerState.rebufferTimestamps = (playerState.rebufferTimestamps || []).filter(ts => now - ts < 20000);
  const bufferAhead = getVideoBufferAheadSeconds(video);
  const estBps = getEstimatedBandwidthBps();
  const bwLabel = formatBandwidthCompact(estBps);
  const bufLabel = bufferAhead > 0 ? (bufferAhead.toFixed(1) + 's') : '';
  const loadingEl = document.getElementById('playerLoadingOverlay');
  const isLoading = Boolean(loadingEl && loadingEl.classList.contains('active'));
  const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    (typeof currentNetworkState !== 'undefined' && (currentNetworkState === NETWORK_STATES.OFFLINE || currentNetworkState === NETWORK_STATES.NO_DATA));

  if (isOffline) {
    return { visible: true, state: 'stalled', label: 'No Network', detail: bufLabel };
  }

  const recentStall = (now - (playerState.lastStallAt || 0)) < 4500 && bufferAhead < 2.8;
  if (recentStall) {
    const detail = [bufLabel, bwLabel].filter(Boolean).join(' · ');
    return { visible: true, state: 'stalled', label: 'Network Stalled', detail };
  }

  const activelyBuffering = Boolean(
    playerState.engineBuffering ||
    (isLoading && playerState.hasStartedPlayback) ||
    (playerState.hasStartedPlayback && video.readyState < 3 && bufferAhead < 1.2) ||
    ((now - (playerState.lastBufferingAt || 0)) < 1400 && bufferAhead < 2.5)
  );
  if (activelyBuffering) {
    const detail = [bufLabel, bwLabel].filter(Boolean).join(' · ');
    return { visible: true, state: 'buffering', label: 'Buffering', detail };
  }

  const lowThroughput = estBps > 0 && estBps < 750000 && bufferAhead < 4.5;
  const lowBuffer = playerState.hasStartedPlayback && (bufferAhead < 2.2 || playerState.rebufferTimestamps.length >= 2);
  if (lowThroughput || lowBuffer) {
    const label = lowThroughput ? 'Slow Network' : 'Low Buffer';
    const detail = [bufLabel, bwLabel].filter(Boolean).join(' · ');
    return { visible: true, state: 'weak', label, detail };
  }

  return { visible: false, state: 'healthy', label: '', detail: '' };
}

function updateBufferHealthIndicator() {
  const badge = document.getElementById('playerBufferBadge');
  const textEl = document.getElementById('playerBufferText');
  const detailEl = document.getElementById('playerBufferDetail');
  if (!badge) return;
  const status = evaluateBufferHealth();
  badge.setAttribute('data-state', status.state);
  badge.classList.toggle('visible', Boolean(status.visible));
  badge.setAttribute('aria-hidden', status.visible ? 'false' : 'true');
  if (status.visible) {
    if (textEl) textEl.textContent = status.label;
    if (detailEl) detailEl.textContent = status.detail || '';
  }
}

function resetBufferHealthState() {
  playerState.lastBufferingAt = 0;
  playerState.lastStallAt = 0;
  playerState.rebufferTimestamps = [];
  playerState.engineBuffering = false;
  playerState.hasStartedPlayback = false;
  updateBufferHealthIndicator();
}

function startBufferHealthMonitor() {
  stopBufferHealthMonitor();
  updateBufferHealthIndicator();
  playerState.bufferHealthTimer = setInterval(() => {
    if (!playerState.open || playerState.pip) {
      stopBufferHealthMonitor();
      return;
    }
    updateBufferHealthIndicator();
  }, 650);
}

function stopBufferHealthMonitor() {
  if (playerState.bufferHealthTimer) {
    clearInterval(playerState.bufferHealthTimer);
    playerState.bufferHealthTimer = null;
  }
  const badge = document.getElementById('playerBufferBadge');
  if (badge) {
    badge.classList.remove('visible');
    badge.setAttribute('data-state', 'healthy');
    badge.setAttribute('aria-hidden', 'true');
  }
}

function setPlayerError(active, msg) {
  const el = document.getElementById('playerErrorOverlay');
  const txt = document.getElementById('playerErrorText');
  if (!el) return;
  if (msg && txt) txt.textContent = msg;
  el.classList.toggle('active', !!active);
  if (active) {
    clearStallWatchdog();
    revealPlayerControls();
  } else {
    cancelStreamAutoRetry(false);
    scheduleHidePlayerControls(2600);
  }
}

function scheduleStreamAutoRetry(reasonMsg) {
  if (!playerState.open || !playerState.streams.length) return;
  cancelStreamAutoRetry(false);

  const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false)
    || (typeof networkState !== 'undefined' && typeof NETWORK_STATES !== 'undefined' && networkState === NETWORK_STATES.OFFLINE);

  if (isOffline) {
    setPlayerLoading(false);
    setPlayerError(true, reasonMsg || 'Connection lost.');
    updateRetryOverlayUI({
      metaText: 'Waiting for internet connection to retry automatically...',
      showProgress: false,
      showCancel: true,
      retryLabel: 'Retry Now'
    });
    return;
  }

  if (playerState.autoRetryUserCancelled) {
    setPlayerLoading(false);
    setPlayerError(true, reasonMsg || 'Stream interrupted.');
    updateRetryOverlayUI({
      metaText: 'Auto-retry paused. Tap Retry Now to reconnect.',
      showProgress: false,
      showCancel: false,
      retryLabel: 'Retry Now'
    });
    return;
  }

  if (playerState.autoRetryCount >= playerState.maxAutoRetries) {
    setPlayerLoading(false);
    setPlayerError(true, reasonMsg || 'Under maintenance. Try later.');
    updateRetryOverlayUI({
      metaText: 'Stopped after ' + playerState.maxAutoRetries + ' automatic retries.',
      showProgress: false,
      showCancel: false,
      retryLabel: 'Retry'
    });
    return;
  }

  playerState.autoRetryCount += 1;
  const attemptNum = playerState.autoRetryCount;
  const maxAttempts = playerState.maxAutoRetries;
  const delayMs = playerState.autoRetryDelayMs || 3000;
  const startedAt = Date.now();
  playerState.autoRetryDeadline = startedAt + delayMs;
  const scheduledToken = playerState.loadToken;

  setPlayerLoading(false);
  setPlayerError(true, reasonMsg || 'Stream failed to load.');

  const renderCountdown = () => {
    if (!playerState.open || scheduledToken !== playerState.loadToken) {
      cancelStreamAutoRetry(false);
      return;
    }
    const remainingMs = Math.max(0, playerState.autoRetryDeadline - Date.now());
    const secs = Math.max(1, Math.ceil(remainingMs / 1000));
    const ratio = remainingMs / delayMs;
    updateRetryOverlayUI({
      metaText: 'Auto-retrying in ' + secs + 's · Attempt ' + attemptNum + ' of ' + maxAttempts,
      showProgress: true,
      progress: ratio,
      showCancel: true,
      retryLabel: 'Retry Now'
    });
  };

  renderCountdown();
  playerState.autoRetryTickTimer = setInterval(renderCountdown, 100);
  playerState.autoRetryTimer = setTimeout(() => {
    cancelStreamAutoRetry(false);
    if (!playerState.open || scheduledToken !== playerState.loadToken) return;
    if (!playerState.streams.length) return;
    if (playerState.streams.length > 1) {
      playerState.streamIndex = (playerState.streamIndex + 1) % playerState.streams.length;
      const label = document.getElementById('playerStreamLabel');
      if (label) label.textContent = 'Stream ' + (playerState.streamIndex + 1);
    }
    loadStreamUrl(playerState.streams[playerState.streamIndex], { isAutoRetry: true });
  }, delayMs);
}

async function handleStreamLoadFailure(errMsg) {
  if (!playerState.open || !playerState.streams.length) return;
  if (playerState.streams.length > 1 && playerState.roundFailCount + 1 < playerState.streams.length) {
    playerState.roundFailCount += 1;
    switchBackupStream(true);
    return;
  }
  playerState.roundFailCount = 0;
  await destroyPlayerEngines();
  scheduleStreamAutoRetry(errMsg || 'Stream failed. Reconnecting...');
  updatePlayerQualityUI();
}

async function destroyPlayerEngines() {
  playerState.onEngineFallback = null;
  if (playerState.hls) {
    try { playerState.hls.destroy(); } catch (e) {}
    playerState.hls = null;
  }
  if (playerState.mpegts) {
    const mp = playerState.mpegts;
    playerState.mpegts = null;
    try { mp.pause(); } catch (e) {}
    try { mp.unload(); } catch (e) {}
    try { mp.detachMediaElement(); } catch (e) {}
    try { mp.destroy(); } catch (e) {}
  }
  if (playerState.shaka) {
    const sp = playerState.shaka;
    playerState.shaka = null;
    try {
      await Promise.race([
        sp.destroy(),
        new Promise((resolve) => setTimeout(resolve, 150))
      ]);
    } catch (e) {}
  }
  const video = document.getElementById('playerVideo');
  if (video && (video.getAttribute('src') || video.srcObject)) {
    try {
      video.pause();
      video.removeAttribute('src');
      video.srcObject = null;
      video.load();
    } catch (e) {}
  }
  playerState.qualityLevels = [];
  playerState.activeQualityLevel = -1;
  playerState.detectedHeight = 0;
}

function destroyHlsInstance() {
  playerState.loadToken++;
  destroyPlayerEngines();
}

function detectStreamFormatFromUrl(url, chType) {
  const clean = String(url || '').split('#')[0];
  const pathOnly = clean.split('?')[0].toLowerCase();
  const fullLow = clean.toLowerCase();
  const hint = String(chType || '').toLowerCase();

  if (
    /(\.mpd([?#&]|$)|\/mpd([/?#]|$)|format=mpd|type=dash|\/dash\/)/.test(fullLow)
    || hint === 'dash' || hint.includes('dash+xml')
  ) return 'dash';

  if (
    /(\.ism\/manifest([?#&]|$)|\.ismc?([?#&]|$)|format=ism|type=mss)/.test(fullLow)
    || hint === 'mss' || hint.includes('ms-sstr')
  ) return 'mss';

  if (
    /(\.m3u8?([?#&]|$)|format=m3u8|type=hls|\/hls\/)/.test(fullLow)
    || fullLow.includes('m3u8')
    || hint === 'hls' || hint.includes('mpegurl')
  ) return 'hls';

  if (
    /(\.flv([?#&]|$)|format=flv|type=flv)/.test(fullLow)
    || hint === 'flv' || hint.includes('x-flv')
  ) return 'flv';

  if (
    /(\.(ts|m2ts|mts)([?#&]|$)|format=ts|type=mpegts|output=ts|extension=ts)/.test(fullLow)
    || hint === 'mpegts' || hint === 'ts' || hint.includes('mp2t')
  ) return 'mpegts';

  if (
    /^(blob:|data:)/i.test(clean)
    || /\.(mp4|m4v|mov|webm|mkv|ogv|ogg|3gp|avi|wmv)([?#&]|$)/.test(pathOnly)
    || /^video\/(mp4|webm|ogg|quicktime|x-matroska|3gpp)/.test(hint)
  ) return 'native';

  return 'unknown';
}

function sniffFormatFromBytesAndMime(bytes, contentType) {
  const ct = String(contentType || '').toLowerCase();
  if (ct.includes('mpegurl')) return 'hls';
  if (ct.includes('dash+xml')) return 'dash';
  if (ct.includes('ms-sstr')) return 'mss';
  if (ct.includes('x-flv') || ct.includes('video/flv')) return 'flv';
  if (ct.includes('mp2t')) return 'mpegts';
  if (/video\/(mp4|webm|ogg|quicktime|x-matroska|3gpp)|application\/ogg/.test(ct)) return 'native';

  if (bytes && bytes.length > 0) {
    const sampleLen = Math.min(bytes.length, 512);
    let textHead = '';
    try {
      textHead = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, sampleLen)).trimStart();
    } catch (e) {}
    if (textHead.startsWith('#EXTM3U')) return 'hls';
    if (/^<\?xml[\s\S]{0,120}<MPD\b/i.test(textHead) || /^<MPD\b/i.test(textHead)) return 'dash';
    if (/SmoothStreamingMedia/i.test(textHead)) return 'mss';

    // FLV signature: 'F' 'L' 'V'
    if (bytes.length >= 3 && bytes[0] === 0x46 && bytes[1] === 0x4C && bytes[2] === 0x56) return 'flv';
    // MPEG-TS sync byte 0x47 (with 188-byte packet stride when available)
    if (bytes[0] === 0x47 && (bytes.length < 189 || bytes[188] === 0x47)) return 'mpegts';
    // ISO BMFF / MP4 / M4V / MOV ('ftyp' at offset 4)
    if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'native';
    // EBML (WebM / MKV)
    if (bytes.length >= 4 && bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'native';
    // Ogg ('OggS')
    if (bytes.length >= 4 && bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'native';
  }
  return 'unknown';
}

function isProxyStreamUrl(u) {
  const s = String(u || '');
  if (!s) return false;
  if (s.startsWith('/api/stream-proxy')) return true;
  try {
    return s.startsWith(window.location.origin + '/api/stream-proxy');
  } catch (e) {
    return false;
  }
}

function toProxyStreamUrl(targetUrl) {
  const s = String(targetUrl || '').trim();
  if (!s) return s;
  let origin = '';
  try {
    if (window.location && window.location.origin && window.location.origin !== 'null') {
      origin = window.location.origin;
    }
  } catch (e) {}
  if (isProxyStreamUrl(s)) {
    return (s.startsWith('/') && origin) ? (origin + s) : s;
  }
  if (!/^https?:\/\//i.test(s)) return s;
  return origin + '/api/stream-proxy?url=' + encodeURIComponent(s);
}

function shouldProxyStreamImmediately(targetUrl) {
  try {
    return window.location.protocol === 'https:' && /^http:\/\//i.test(String(targetUrl || '').trim());
  } catch (e) {
    return false;
  }
}

async function probeUnknownStreamFormat(url) {
  const proxied = isProxyStreamUrl(url);
  if (!url || (!proxied && !/^https?:\/\//i.test(url))) {
    return { format: 'unknown', corsBlocked: false };
  }
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutMs = proxied ? 6500 : 4500;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-2047' },
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    });
    const ct = resp.headers ? (resp.headers.get('content-type') || '') : '';
    const mimeOnly = sniffFormatFromBytesAndMime(null, ct);
    if (mimeOnly !== 'unknown') {
      if (resp.body && typeof resp.body.cancel === 'function') {
        try { resp.body.cancel(); } catch (e) {}
      }
      if (controller) try { controller.abort(); } catch (e) {}
      if (timer) clearTimeout(timer);
      return { format: mimeOnly, corsBlocked: false };
    }
    let bytes = null;
    if (resp.body && typeof resp.body.getReader === 'function') {
      const reader = resp.body.getReader();
      try {
        const first = await reader.read();
        if (first && first.value) bytes = first.value;
      } catch (e) {}
      try { reader.cancel(); } catch (e) {}
    } else if (typeof resp.arrayBuffer === 'function') {
      const buf = await resp.arrayBuffer();
      bytes = new Uint8Array(buf);
    }
    if (controller) try { controller.abort(); } catch (e) {}
    if (timer) clearTimeout(timer);
    return { format: sniffFormatFromBytesAndMime(bytes, ct), corsBlocked: false };
  } catch (e) {
    if (timer) clearTimeout(timer);
    return { format: 'unknown', corsBlocked: !proxied };
  }
}

function buildEngineCascade(detectedFormat, hasDrm, corsBlocked) {
  if (hasDrm) return ['shaka'];
  switch (detectedFormat) {
    case 'dash':
    case 'mss':
      return ['shaka', 'hls'];
    case 'hls':
      return ['hls', 'native', 'shaka'];
    case 'flv':
      return ['flv', 'native'];
    case 'mpegts':
      return ['mpegts', 'hls', 'native'];
    case 'native':
      return ['native', 'shaka'];
    default:
      return corsBlocked ? ['native', 'hls'] : ['hls', 'mpegts', 'flv', 'native', 'shaka'];
  }
}

async function loadStreamUrl(rawUrl, loadOpts) {
  const video = document.getElementById('playerVideo');
  if (!video || !rawUrl) return;

  const isAutoRetry = Boolean(loadOpts && loadOpts.isAutoRetry);
  const preserveRetryState = isAutoRetry || Boolean(loadOpts && loadOpts.preserveRetryState);
  const isBackupSwitch = Boolean(loadOpts && loadOpts.isBackupSwitch);
  const token = ++playerState.loadToken;
  cancelStreamAutoRetry(!preserveRetryState);
  clearStallWatchdog();
  resetBufferHealthState();
  playerState.userPaused = false;
  closeQualityMenu();
  const drmCfg = resolveEffectiveDrmConfig(rawUrl);
  const url = drmCfg.cleanUrl || rawUrl;
  const chType = String((playerState.channel && (playerState.channel.type || playerState.channel.format || playerState.channel.mimeType)) || '').toLowerCase();
  let detectedFormat = detectStreamFormatFromUrl(url, chType);
  const hasDrm = hasActiveDrmConfig(drmCfg);
  const isPrivateStream = hasDrm || detectedFormat === 'dash' || detectedFormat === 'mss';
  playerState.privateStream = isPrivateStream;

  updatePlayerQualityUI();
  setPlayerError(false);
  const loadingMsg = isAutoRetry && playerState.autoRetryCount > 0
    ? 'Reconnecting (Attempt ' + playerState.autoRetryCount + '/' + playerState.maxAutoRetries + ')...'
    : (isBackupSwitch ? 'Switching to backup stream...' : 'Connecting to stream...');
  setPlayerLoading(true, loadingMsg);

  await destroyPlayerEngines();
  if (token !== playerState.loadToken) return;
  armStallWatchdog(true);

  if (drmCfg.licenseUrl && (!drmCfg.clearKeys || Object.keys(drmCfg.clearKeys).length === 0) && (drmCfg.scheme === 'clearkey' || /clearkey|clkey|keyid=/i.test(drmCfg.licenseUrl))) {
    const fetchedKeys = await fetchClearKeysFromLicenseUrl(drmCfg.licenseUrl, drmCfg.headers);
    if (token !== playerState.loadToken) return;
    if (fetchedKeys && Object.keys(fetchedKeys).length > 0) {
      drmCfg.clearKeys = fetchedKeys;
    }
  }

  async function startPlayback(useProxy, allowProxyRetry) {
    if (token !== playerState.loadToken) return;

    const canProxy = /^https?:\/\//i.test(url) && !isProxyStreamUrl(url);
    const usingProxy = Boolean(useProxy && canProxy);
    const activeUrl = usingProxy ? toProxyStreamUrl(url) : url;
    const shouldAttemptProxyFallback = !usingProxy && Boolean(allowProxyRetry) && canProxy;

    let corsBlocked = false;
    if (!hasDrm && detectedFormat === 'unknown') {
      const probeRes = await probeUnknownStreamFormat(activeUrl);
      if (token !== playerState.loadToken) return;
      if (probeRes && probeRes.corsBlocked && shouldAttemptProxyFallback) {
        await startPlayback(true, false);
        return;
      }
      if (probeRes && probeRes.format && probeRes.format !== 'unknown') {
        detectedFormat = probeRes.format;
        if (detectedFormat === 'dash' || detectedFormat === 'mss') {
          playerState.privateStream = true;
        }
      }
      corsBlocked = Boolean(probeRes && probeRes.corsBlocked);
    }

    const rawOrder = buildEngineCascade(detectedFormat, hasDrm, corsBlocked);
    const engines = [];
    rawOrder.forEach((eng) => {
      if (engines.includes(eng)) return;
      if (eng === 'shaka' && !(window.shaka && window.shaka.Player && window.shaka.Player.isBrowserSupported())) return;
      if (eng === 'hls' && !(window.Hls && window.Hls.isSupported())) return;
      if ((eng === 'flv' || eng === 'mpegts') && !(window.mpegts && window.mpegts.isSupported())) return;
      engines.push(eng);
    });
    if (engines.length === 0) engines.push('native');

    const tryProxyOrFail = async (errMsg) => {
      if (token !== playerState.loadToken) return;
      if (shouldAttemptProxyFallback) {
        await startPlayback(true, false);
        return;
      }
      await handleStreamLoadFailure(errMsg || 'Stream connection failed.');
    };

    async function runEngineAt(stepIndex) {
      if (token !== playerState.loadToken) return;
      if (stepIndex >= engines.length) {
        await tryProxyOrFail('Under maintenance. Try later.');
        return;
      }

      const eng = engines[stepIndex];
      const hasMore = stepIndex + 1 < engines.length;
      await destroyPlayerEngines();
      if (token !== playerState.loadToken) return;

      let stepped = false;
      const advanceToNext = async () => {
        if (stepped || token !== playerState.loadToken) return;
        stepped = true;
        await runEngineAt(stepIndex + 1);
      };

      if (eng === 'shaka') {
        try {
          if (!playerState.shakaPolyfillsInstalled && window.shaka.polyfill) {
            window.shaka.polyfill.installAll();
            playerState.shakaPolyfillsInstalled = true;
          }
          const shakaPlayer = new window.shaka.Player();
          await shakaPlayer.attach(video);
          if (token !== playerState.loadToken) {
            try { await shakaPlayer.destroy(); } catch (e) {}
            return;
          }
          playerState.shaka = shakaPlayer;

          const shakaDrm = buildShakaDrmConfig(drmCfg);
          shakaPlayer.configure({
            drm: shakaDrm,
            manifest: {
              dash: {
                ignoreMinBufferTime: true
              }
            },
            streaming: {
              rebufferingGoal: 2,
              bufferingGoal: 15,
              bufferBehind: 30,
              ignoreTextStreamFailures: true,
              retryParameters: { maxAttempts: 4, baseDelay: 800, backoffFactor: 2 }
            },
            abr: {
              enabled: playerState.qualityPref === 'auto',
              defaultBandwidthEstimate: 2500000
            }
          });

          const netEngine = shakaPlayer.getNetworkingEngine();
          if (netEngine) {
            if (drmCfg.headers || usingProxy) {
              netEngine.registerRequestFilter((type, request) => {
                if (usingProxy && type !== window.shaka.net.NetworkingEngine.RequestType.LICENSE && Array.isArray(request.uris)) {
                  const apiPrefix = window.location.origin + '/api/';
                  request.uris = request.uris.map((u) => {
                    if (!u || isProxyStreamUrl(u)) return u;
                    if (u.startsWith(apiPrefix)) {
                      try {
                        const rel = u.slice(apiPrefix.length);
                        const resolved = new URL(rel, url).toString();
                        return new URL(toProxyStreamUrl(resolved), window.location.origin).toString();
                      } catch (e) {
                        return u;
                      }
                    }
                    if (/^https?:\/\//i.test(u)) {
                      try {
                        return new URL(toProxyStreamUrl(u), window.location.origin).toString();
                      } catch (e) {
                        return u;
                      }
                    }
                    return u;
                  });
                }
                if (drmCfg.headers && type === window.shaka.net.NetworkingEngine.RequestType.LICENSE) {
                  Object.entries(drmCfg.headers).forEach(([k, v]) => {
                    if (k && v != null) request.headers[k] = String(v);
                  });
                }
              });
            }
            if (drmCfg.scheme === 'clearkey' && drmCfg.licenseUrl && (!drmCfg.clearKeys || Object.keys(drmCfg.clearKeys).length === 0)) {
              netEngine.registerResponseFilter((type, response) => {
                if (type === window.shaka.net.NetworkingEngine.RequestType.MANIFEST && response && response.data) {
                  try {
                    const xml = new TextDecoder('utf-8').decode(response.data);
                    if (xml.includes('<ContentProtection') && !xml.toLowerCase().includes('e2719d58-a985-b3c9-781a-b030af78d30e')) {
                      const ckTag = '<ContentProtection schemeIdUri="urn:uuid:e2719d58-a985-b3c9-781a-b030af78d30e"/>';
                      let patched = xml.replace(/<AdaptationSet\b[\s\S]*?<\/AdaptationSet>/gi, (block) => {
                        if (!block.includes('<ContentProtection') || block.toLowerCase().includes('e2719d58-a985-b3c9-781a-b030af78d30e')) return block;
                        return block.replace(/(<ContentProtection\b[^>]*(?:\/>|>[\s\S]*?<\/ContentProtection>))/i, '$1\n' + ckTag);
                      });
                      if (patched === xml) {
                        patched = xml.replace(/(<ContentProtection\b[^>]*(?:\/>|>[\s\S]*?<\/ContentProtection>))/i, '$1\n' + ckTag);
                      }
                      response.data = new TextEncoder().encode(patched).buffer;
                    }
                  } catch (e) {}
                }
              });
            }
          }

          shakaPlayer.addEventListener('error', () => {
            if (token !== playerState.loadToken) return;
            if (hasMore) {
              advanceToNext();
            } else {
              tryProxyOrFail('Under maintenance. Try later.');
            }
          });
          shakaPlayer.addEventListener('buffering', (ev) => {
            if (token !== playerState.loadToken || playerState.shaka !== shakaPlayer) return;
            playerState.engineBuffering = Boolean(ev && ev.buffering);
            if (playerState.engineBuffering && playerState.hasStartedPlayback) {
              recordPlayerRebuffer(false);
            }
            updateBufferHealthIndicator();
          });

          const syncShakaQuality = () => {
            if (token !== playerState.loadToken || playerState.shaka !== shakaPlayer) return;
            const activeTrack = (shakaPlayer.getVariantTracks() || []).find(t => t.active);
            if (activeTrack) {
              playerState.activeQualityLevel = activeTrack.id;
              if (activeTrack.height) playerState.detectedHeight = activeTrack.height;
            }
            updatePlayerQualityUI();
          };
          shakaPlayer.addEventListener('adaptation', syncShakaQuality);
          shakaPlayer.addEventListener('variantchanged', syncShakaQuality);
          shakaPlayer.addEventListener('trackschanged', () => {
            if (token !== playerState.loadToken || playerState.shaka !== shakaPlayer) return;
            playerState.qualityLevels = extractShakaQualityLevels(shakaPlayer);
            syncShakaQuality();
          });

          let mimeOverride = null;
          if (detectedFormat === 'dash' && !/\.mpd(\?|$)/i.test(url)) mimeOverride = 'application/dash+xml';
          else if (detectedFormat === 'mss' && !/\.ism/i.test(url)) mimeOverride = 'application/vnd.ms-sstr+xml';
          await shakaPlayer.load(activeUrl, null, mimeOverride);
          if (token !== playerState.loadToken) return;

          playerState.qualityLevels = extractShakaQualityLevels(shakaPlayer);
          applyQualityPreference(playerState.qualityPref, -1, false);
          setPlayerLoading(false);
          attemptPlayerPlayback(video);
          updatePlayerPlaybackUI();
          return;
        } catch (err) {
          if (token !== playerState.loadToken) return;
          if (hasMore) {
            await advanceToNext();
          } else {
            await tryProxyOrFail('Under maintenance. Try later.');
          }
          return;
        }
      }

      if (eng === 'hls') {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          startLevel: -1,
          capLevelToPlayerSize: false,
          abrEwmaDefaultEstimate: 2500000,
          manifestLoadingTimeOut: detectedFormat === 'hls' ? 12000 : 4500
        });
        playerState.hls = hls;
        let hlsManifestParsed = false;
        const hlsProbeTimer = (detectedFormat !== 'hls' && (hasMore || shouldAttemptProxyFallback))
          ? setTimeout(() => {
              if (token !== playerState.loadToken || hlsManifestParsed || playerState.hls !== hls) return;
              if (hasMore) {
                advanceToNext();
              } else {
                tryProxyOrFail('Under maintenance. Try later.');
              }
            }, 4500)
          : null;
        hls.loadSource(activeUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          hlsManifestParsed = true;
          if (hlsProbeTimer) clearTimeout(hlsProbeTimer);
          if (token !== playerState.loadToken) return;
          playerState.qualityLevels = extractHlsQualityLevels(hls);
          applyQualityPreference(playerState.qualityPref, -1, false);
          setPlayerLoading(false);
          attemptPlayerPlayback(video);
          updatePlayerPlaybackUI();
        });
        if (window.Hls.Events.LEVELS_UPDATED) {
          hls.on(window.Hls.Events.LEVELS_UPDATED, () => {
            if (token !== playerState.loadToken || playerState.hls !== hls) return;
            playerState.qualityLevels = extractHlsQualityLevels(hls);
            updatePlayerQualityUI();
          });
        }
        hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
          if (token !== playerState.loadToken) return;
          if (data && typeof data.level === 'number') {
            playerState.activeQualityLevel = data.level;
            updatePlayerQualityUI();
          }
        });
        if (window.Hls.Events.FRAG_BUFFERED) {
          hls.on(window.Hls.Events.FRAG_BUFFERED, () => {
            if (token !== playerState.loadToken || playerState.hls !== hls) return;
            playerState.engineBuffering = false;
            updateBufferHealthIndicator();
          });
        }
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (token !== playerState.loadToken || !data) return;
          if (data.details === 'bufferStalledError' || data.details === 'fragLoadTimeOut') {
            recordPlayerRebuffer(true);
            updateBufferHealthIndicator();
          }
          if (!data.fatal) return;
          if (hlsProbeTimer) clearTimeout(hlsProbeTimer);
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR && !hasMore && !shouldAttemptProxyFallback) {
            hls.recoverMediaError();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR && shouldAttemptProxyFallback && !video.canPlayType('application/vnd.apple.mpegurl')) {
            startPlayback(true, false);
            return;
          }
          if (hasMore) {
            advanceToNext();
            return;
          }
          tryProxyOrFail('Under maintenance. Try later.');
        });
        return;
      }

      if (eng === 'flv' || eng === 'mpegts') {
        try {
          if (window.mpegts.LoggingControl) {
            window.mpegts.LoggingControl.enableAll = false;
            window.mpegts.LoggingControl.enableError = false;
            window.mpegts.LoggingControl.enableWarn = false;
          }
          const mp = window.mpegts.createPlayer(
            { type: eng === 'flv' ? 'flv' : 'mpegts', isLive: true, url: activeUrl },
            { enableWorker: true, enableStashBuffer: true, liveBufferLatencyChasing: false }
          );
          playerState.mpegts = mp;
          mp.on(window.mpegts.Events.ERROR, () => {
            if (token !== playerState.loadToken) return;
            if (hasMore) {
              advanceToNext();
            } else {
              tryProxyOrFail('Under maintenance. Try later.');
            }
          });
          mp.on(window.mpegts.Events.LOADING_COMPLETE, () => {
            if (token !== playerState.loadToken || playerState.mpegts !== mp) return;
            if (video.readyState < 2) {
              if (hasMore) advanceToNext();
              else tryProxyOrFail('Under maintenance. Try later.');
            }
          });
          mp.attachMediaElement(video);
          mp.load();
          attemptPlayerPlayback(video, mp);
          updatePlayerQualityUI();
          return;
        } catch (err) {
          if (token !== playerState.loadToken) return;
          if (hasMore) {
            await advanceToNext();
          } else {
            await tryProxyOrFail('Under maintenance. Try later.');
          }
          return;
        }
      }

      // Native HTML5 <video> (MP4, WebM, MKV, MOV, OGV, 3GP, Safari native HLS, blob:, data:)
      if (hasMore || shouldAttemptProxyFallback) {
        playerState.onEngineFallback = () => {
          if (token !== playerState.loadToken) return;
          if (hasMore) advanceToNext();
          else tryProxyOrFail('Under maintenance. Try later.');
        };
      }
      video.src = activeUrl;
      video.load();
      attemptPlayerPlayback(video);
      updatePlayerQualityUI();
    }

    await runEngineAt(0);
  }

  const startWithProxy = shouldProxyStreamImmediately(url);
  await startPlayback(startWithProxy, !startWithProxy);
}

function switchBackupStream(silent) {
  if (playerState.streams.length <= 1) return;
  playerState.streamIndex = (playerState.streamIndex + 1) % playerState.streams.length;
  const label = document.getElementById('playerStreamLabel');
  if (label) label.textContent = 'Stream ' + (playerState.streamIndex + 1);
  loadStreamUrl(playerState.streams[playerState.streamIndex], {
    isAutoRetry: Boolean(silent) && playerState.autoRetryCount > 0,
    preserveRetryState: Boolean(silent),
    isBackupSwitch: true
  });
  if (!silent) {
    cancelStreamAutoRetry(true);
    showToast('Switched Stream', 'Now playing Stream ' + (playerState.streamIndex + 1) + '.', 'info');
  }
}

function normalizePlayableStreamUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (s.startsWith('//')) return window.location.protocol + s;
  if (/^(https?:\/\/|blob:|data:)/i.test(s)) return s;
  return '';
}

function getRandomChannelsForPlayer(currentChannel, count) {
  const limit = count || 12;
  const pool = Array.isArray(liveChannels) ? liveChannels : [];
  if (!pool.length) return [];

  const curKey = currentChannel ? getChannelKey(currentChannel) : '';
  const curName = currentChannel && currentChannel.name ? String(currentChannel.name).trim().toLowerCase() : '';
  const seen = new Set();
  const candidates = [];

  for (let i = 0; i < pool.length; i++) {
    const ch = pool[i];
    if (!ch) continue;
    const playable = normalizePlayableStreamUrl(ch.link) || normalizePlayableStreamUrl(ch.link2);
    if (!playable) continue;
    if (typeof isMatureChannel === 'function' && isMatureChannel(ch) && typeof matureUnlocked !== 'undefined' && !matureUnlocked) continue;
    const key = getChannelKey(ch);
    const chName = ch.name ? String(ch.name).trim().toLowerCase() : '';
    if (curKey && key === curKey) continue;
    if (!curKey && curName && chName === curName) continue;
    if (curName && chName && chName === curName) continue;
    const dedupKey = key || chName || playable;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    candidates.push(ch);
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  return candidates.slice(0, limit);
}

function shouldShowRelatedChannels() {
  if (!playerState.open || playerState.pip || playerState.cssFullscreen || isPlayerFullscreen()) return false;
  const { w, h } = getViewportDimensions();
  if (w > 0 && h > 0 && w > h && h <= 540) return false;
  if (isTouchOrCompactDevice() && isDeviceLandscape()) return false;
  return true;
}

function syncRelatedChannelsVisibility() {
  const shell = document.getElementById('playerShell');
  const relatedEl = document.getElementById('playerRelated');
  if (!shell || !relatedEl) return false;

  const allowed = shouldShowRelatedChannels();
  if (allowed && (!Array.isArray(playerState.relatedChannels) || playerState.relatedChannels.length === 0)) {
    const generated = getRandomChannelsForPlayer(playerState.channel, 12);
    if (generated.length > 0) {
      playerState.relatedChannels = generated;
      populateRelatedChannelsTrack(generated);
    }
  }

  const hasItems = Array.isArray(playerState.relatedChannels) && playerState.relatedChannels.length > 0;
  const visible = allowed && hasItems;
  relatedEl.style.display = visible ? '' : 'none';
  shell.classList.toggle('has-related', visible);
  return visible;
}

function populateRelatedChannelsTrack(items) {
  const trackEl = document.getElementById('playerRelatedTrack');
  const metaEl = document.getElementById('playerRelatedMeta');
  if (!trackEl) return;

  if (metaEl) {
    metaEl.textContent = items.length ? (items.length + ' channels') : '';
  }
  if (!items.length) {
    trackEl.innerHTML = '';
    return;
  }

  const fallbackSvg = '<svg class="thumb-fallback-icon" viewBox="0 0 24 24"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';
  trackEl.innerHTML = items.map((ch, idx) => {
    const chName = ch.name || 'Live Channel';
    const chCat = ch.category ? String(ch.category).replace(/^\w/, c => c.toUpperCase()) : 'Live TV';
    const hue = getThumbHue(chName + '|' + (ch.category || ''));
    const hasImg = Boolean(ch.img && String(ch.img).trim());
    const imgHtml = hasImg ? buildBlurUpThumbImgHtml(ch.img, chName, { eager: false, width: 196, height: 110 }) : '';
    return (
      '<button type="button" class="player-related-card" role="listitem" data-related-idx="' + idx + '" title="' + escapeHtml(chName) + '">' +
        '<div class="player-related-thumb thumb-blur-box' + (hasImg ? '' : ' is-error') + '" style="--thumb-hue:' + hue + ';">' +
          fallbackSvg + imgHtml +
        '</div>' +
        '<div class="player-related-name">' + escapeHtml(chName) + '</div>' +
        '<div class="player-related-cat">' + escapeHtml(chCat) + '</div>' +
      '</button>'
    );
  }).join('');

  hydrateBlurUpThumbnails(trackEl);
  trackEl.scrollLeft = 0;

  trackEl.querySelectorAll('.player-related-card').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute('data-related-idx'));
      const targetCh = Number.isInteger(idx) ? playerState.relatedChannels[idx] : null;
      if (!targetCh) return;
      if (typeof playLiveChannel === 'function') {
        playLiveChannel(targetCh);
      } else {
        openVideoPlayer(targetCh);
      }
    });
  });
}

function renderPlayerRelatedChannels(forceReshuffle) {
  if (forceReshuffle || !Array.isArray(playerState.relatedChannels) || playerState.relatedChannels.length === 0) {
    playerState.relatedChannels = getRandomChannelsForPlayer(playerState.channel, 12);
  }
  populateRelatedChannelsTrack(playerState.relatedChannels);
  syncRelatedChannelsVisibility();
}

function openVideoPlayer(channel, openOpts) {
  if (typeof hideChannelPreview === 'function') hideChannelPreview();
  const shell = document.getElementById('playerShell');
  const backdrop = document.getElementById('playerBackdrop');
  if (!shell || !backdrop) return;

  let resolvedChannel = channel;
  if (channel && !channel.drm && !channel.clearKeys && !channel.clearkey && !channel.licenseUrl && !channel.drmLicense && Array.isArray(liveChannels)) {
    const chKey = getChannelKey(channel);
    const nameLow = String(channel.name || '').trim().toLowerCase();
    const liveMatch = liveChannels.find(c => getChannelKey(c) === chKey || (nameLow && c.name && c.name.trim().toLowerCase() === nameLow));
    if (liveMatch) {
      resolvedChannel = { ...channel, ...pickChannelDrmFields(liveMatch, channel) };
    }
  }

  const streams = [];
  const primaryUrl = normalizePlayableStreamUrl(resolvedChannel.link);
  const backupUrl = normalizePlayableStreamUrl(resolvedChannel.link2);
  if (primaryUrl) streams.push(primaryUrl);
  if (backupUrl && backupUrl !== primaryUrl) streams.push(backupUrl);
  if (streams.length === 0) return;

  cancelStreamAutoRetry(true);
  clearStallWatchdog();
  playerState.userPaused = false;
  playerState.channel = resolvedChannel;
  playerState.streams = streams;
  playerState.streamIndex = 0;
  playerState.open = true;
  if (!(openOpts && openOpts.isAutoRestore)) {
    lastChannelAutoRestored = true;
  }
  saveLastWatchedChannel(resolvedChannel);

  const titleEl = document.getElementById('playerTitle');
  const catEl = document.getElementById('playerCategory');
  const pipLabel = document.getElementById('pipChannelLabel');
  const thumbEl = document.getElementById('playerChannelThumb');
  const switchBtn = document.getElementById('playerStreamSwitchBtn');
  const switchLabel = document.getElementById('playerStreamLabel');

  const chName = channel.name || 'Live TV';
  if (titleEl) titleEl.textContent = chName;
  if (pipLabel) pipLabel.textContent = chName;
  if (catEl) catEl.textContent = channel.category ? String(channel.category).replace(/^\w/, c => c.toUpperCase()) : 'Live Channel';
  if (thumbEl) {
    thumbEl.classList.remove('is-loaded', 'is-error');
    thumbEl.classList.add('thumb-blur-box');
    thumbEl.style.setProperty('--thumb-hue', String(getThumbHue(chName + '|' + (channel.category || ''))));
    const fallbackSvg = '<svg class="thumb-fallback-icon" viewBox="0 0 24 24"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';
    if (channel.img && String(channel.img).trim()) {
      thumbEl.innerHTML = fallbackSvg + buildBlurUpThumbImgHtml(channel.img, chName, { eager: true, width: 88, height: 56 });
      hydrateBlurUpThumbnails(thumbEl);
    } else {
      thumbEl.classList.add('is-error');
      thumbEl.innerHTML = fallbackSvg;
    }
  }
  if (switchBtn && switchLabel) {
    switchBtn.style.display = streams.length > 1 ? '' : 'none';
    switchLabel.textContent = 'Stream 1';
  }

  // Open in Theater mode (or auto-detect landscape mode on mobile/tablet/compact devices)
  playerState.userFullscreen = false;
  playerState.autoLandscape = false;
  playerState.landscapeDismissed = false;
  playerState.manualRotateDeg = 0;
  exitMiniPip(true);
  applyAspectMode(playerState.aspectMode, false);
  shell.classList.add('open');
  shell.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('active');
  renderPlayerRelatedChannels(true);
  syncFloatingPlayerDimensions();
  detectAndSyncLandscapeMode();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      if (!playerState.open) return;
      detectAndSyncLandscapeMode();
      syncRelatedChannelsVisibility();
      if (playerState.cssFullscreen) syncLandscapeFullscreenLayout();
      else syncFloatingPlayerDimensions();
    });
  }
  revealPlayerControls(3000);

  loadStreamUrl(streams[0]);
  startBufferHealthMonitor();
  updatePlayerPlaybackUI();
}

function enterMiniPip(silent) {
  const shell = document.getElementById('playerShell');
  const backdrop = document.getElementById('playerBackdrop');
  if (!shell || !playerState.open) return;

  stopBufferHealthMonitor();

  playerState.manualRotateDeg = 0;
  exitPlayerFullscreen();

  playerState.pip = true;
  playerState.chromeHover = false;
  if (playerState.chromeTimer) {
    clearTimeout(playerState.chromeTimer);
    playerState.chromeTimer = null;
  }
  closeQualityMenu();
  closeAspectMenu();
  shell.classList.remove('controls-hidden');
  shell.classList.add('pip');
  shell.setAttribute('aria-modal', 'false');
  if (backdrop) backdrop.classList.remove('active');
  syncRelatedChannelsVisibility();
  syncFloatingPlayerDimensions();

  if (playerState.customPos) {
    applyClampedPipPosition(playerState.customPos.left, playerState.customPos.top);
  } else {
    shell.classList.remove('custom-pos');
    shell.style.left = '';
    shell.style.top = '';
  }

  revealPipControlsTemporarily();
  updatePlayerPlaybackUI();

  if (!silent) {
    showToast('Mini-Player Active', 'Continue browsing while watching Live TV.', 'info');
  }
}

function exitMiniPip(skipFocus) {
  const shell = document.getElementById('playerShell');
  const backdrop = document.getElementById('playerBackdrop');
  if (!shell) return;

  playerState.pip = false;
  shell.classList.remove('pip', 'custom-pos', 'controls-visible', 'dragging', 'controls-hidden');
  shell.style.left = '';
  shell.style.top = '';
  shell.setAttribute('aria-modal', 'true');

  if (playerState.open && backdrop) {
    backdrop.classList.add('active');
    syncRelatedChannelsVisibility();
    syncFloatingPlayerDimensions();
    startBufferHealthMonitor();
    revealPlayerControls(3000);
  }
  updatePlayerPlaybackUI();
  if (!skipFocus) {
    const playBtn = document.getElementById('playerPlayBtn');
    if (playBtn) playBtn.focus();
  }
}

function minimizePlayerIfTheater() {
  if (playerState.open && !playerState.pip) {
    enterMiniPip(true);
  }
}

async function toggleNativePip() {
  const video = document.getElementById('playerVideo');
  if (!video || !playerState.open) return;

  try {
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture();
      return;
    }
    if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === 'picture-in-picture') {
      video.webkitSetPresentationMode('inline');
      return;
    }

    if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') {
      await video.requestPictureInPicture();
      if (!playerState.pip) enterMiniPip(true);
      return;
    }
    if (typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode('picture-in-picture')) {
      video.webkitSetPresentationMode('picture-in-picture');
      if (!playerState.pip) enterMiniPip(true);
      return;
    }

    enterMiniPip(false);
  } catch (err) {
    console.warn('[PiP] Native PiP fallback to Mini-Player:', err);
    if (!playerState.pip) enterMiniPip(false);
    else showToast('Mini-Player Active', 'Browser Picture-in-Picture is unavailable here; using in-app mini-player.', 'info');
  }
}

function closeVideoPlayer() {
  const shell = document.getElementById('playerShell');
  const backdrop = document.getElementById('playerBackdrop');
  const video = document.getElementById('playerVideo');

  exitPlayerFullscreen();
  if (document.pictureInPictureElement && video && document.pictureInPictureElement === video) {
    document.exitPictureInPicture().catch(() => {});
  }

  playerState.loadToken++;
  cancelStreamAutoRetry(true);
  clearStallWatchdog();
  stopBufferHealthMonitor();
  resetBufferHealthState();
  playerState.userPaused = false;
  destroyPlayerEngines();
  closeQualityMenu();
  closeAspectMenu();
  updatePlayerQualityUI();
  if (video) {
    try { video.pause(); } catch (e) {}
    video.removeAttribute('src');
    try { video.load(); } catch (e) {}
  }

  playerState.open = false;
  playerState.pip = false;
  playerState.nativePip = false;
  playerState.userFullscreen = false;
  playerState.autoLandscape = false;
  playerState.landscapeDismissed = false;
  playerState.manualRotateDeg = 0;
  playerState.preFsScrollY = null;
  playerState.chromeHover = false;
  if (playerState.chromeTimer) {
    clearTimeout(playerState.chromeTimer);
    playerState.chromeTimer = null;
  }
  playerState.channel = null;
  playerState.streams = [];
  playerState.privateStream = false;
  playerState.relatedChannels = [];

  const relatedEl = document.getElementById('playerRelated');
  const relatedTrack = document.getElementById('playerRelatedTrack');
  if (relatedEl) relatedEl.style.display = 'none';
  if (relatedTrack) relatedTrack.innerHTML = '';

  if (shell) {
    shell.classList.remove('open', 'pip', 'has-related', 'player-compact-w', 'player-ultra-compact-w', 'custom-pos', 'controls-visible', 'controls-hidden', 'dragging', 'landscape-fullscreen', 'force-landscape');
    shell.style.left = '';
    shell.style.top = '';
    shell.style.removeProperty('--player-fit-w');
    shell.style.removeProperty('--player-fs-x');
    shell.style.removeProperty('--player-fs-y');
    shell.style.removeProperty('--player-fs-w');
    shell.style.removeProperty('--player-fs-h');
    shell.style.removeProperty('--player-fs-cx');
    shell.style.removeProperty('--player-fs-cy');
    shell.style.removeProperty('--player-fs-long');
    shell.style.removeProperty('--player-fs-short');
    shell.style.removeProperty('--player-rotate-deg');
    shell.scrollTop = 0;
    shell.setAttribute('aria-hidden', 'true');
  }
  document.documentElement.classList.remove('player-fs-lock');
  document.body.classList.remove('player-fs-lock');
  if (backdrop) backdrop.classList.remove('active');
  setPlayerLoading(false);
  setPlayerError(false);
}

function getVisualViewportBox() {
  const vv = window.visualViewport;
  const unzoomedVv = Boolean(vv && (!vv.scale || Math.abs(vv.scale - 1) < 0.05));
  const docW = document.documentElement.clientWidth || window.innerWidth || 0;
  const docH = window.innerHeight || document.documentElement.clientHeight || 0;
  if (unzoomedVv && vv.width > 0 && vv.height > 0) {
    return {
      x: Math.round(vv.offsetLeft || 0),
      y: Math.round(vv.offsetTop || 0),
      w: Math.round(Math.min(vv.width, docW || vv.width)),
      h: Math.round(vv.height)
    };
  }
  return {
    x: 0,
    y: 0,
    w: Math.round(docW),
    h: Math.round(docH)
  };
}

function getViewportDimensions() {
  const box = getVisualViewportBox();
  return { w: box.w, h: box.h };
}

function getScreenOrientationAngle() {
  try {
    if (screen.orientation && typeof screen.orientation.angle === 'number') {
      return ((screen.orientation.angle % 360) + 360) % 360;
    }
    if (typeof window.orientation === 'number') {
      return ((window.orientation % 360) + 360) % 360;
    }
  } catch (e) {}
  return 0;
}

function isTouchDeviceCapabilities() {
  const coarse = Boolean(window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(any-pointer: coarse)').matches));
  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  return coarse || hasTouch;
}

function isPortraitViewport() {
  const { w, h } = getViewportDimensions();
  return h > w;
}

function isDeviceLandscape() {
  const { w, h } = getViewportDimensions();
  if (w > 0 && h > 0) {
    if (w > h) return true;
    // Do NOT let desktop monitor screen.orientation.type override a portrait Chrome window;
    // only treat portrait viewport as mid-rotation landscape when touch device reports 90/270.
    const angle = getScreenOrientationAngle();
    return (angle === 90 || angle === 270) && isTouchDeviceCapabilities();
  }
  if (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) return true;
  return false;
}

function isTouchOrCompactDevice() {
  const { w, h } = getViewportDimensions();
  const minDim = Math.min(w || window.innerWidth || 0, h || window.innerHeight || 0);
  // Catch compact landscape phone/DevTools viewports in Chrome even when touch emulation is disabled
  if (w > h && h > 0 && h <= 560) return true;
  return isTouchDeviceCapabilities() && minDim > 0 && minDim <= 1024;
}

function syncFloatingPlayerDimensions() {
  const shell = document.getElementById('playerShell');
  if (!shell) return;
  if (!playerState.open || playerState.pip || playerState.cssFullscreen || isPlayerFullscreen()) {
    shell.style.removeProperty('--player-fit-w');
    if (!playerState.cssFullscreen) {
      shell.classList.remove('player-compact-w', 'player-ultra-compact-w');
    }
    return;
  }
  const { w, h } = getViewportDimensions();
  if (w <= 0 || h <= 0) return;

  const relatedEl = document.getElementById('playerRelated');
  const showingRelated = shell.classList.contains('has-related') && relatedEl && relatedEl.style.display !== 'none';
  const relatedReserve = showingRelated
    ? Math.max(relatedEl.offsetHeight || 0, w >= 1920 ? 196 : (w >= 1440 ? 172 : (w <= 480 ? 148 : 162)))
    : 0;

  const marginX = w <= 480 ? 0 : (w <= 680 ? 20 : (w <= 1024 ? 28 : (w >= 1920 ? 120 : (w >= 1440 ? 80 : 32))));
  const marginY = (w <= 480 ? 16 : (h <= 540 ? 20 : (w >= 1920 ? 96 : (w >= 1440 ? 72 : 48)))) + relatedReserve;
  const maxCapW = w >= 1920 ? 1520 : (w >= 1440 ? 1220 : (w <= 1024 ? 860 : 980));
  const maxAvailW = Math.max(180, w - marginX);
  const maxWidthFromHeight = Math.max(180, Math.floor((h - marginY) * 16 / 9));
  const fitW = Math.max(180, Math.min(w, maxCapW, maxAvailW, maxWidthFromHeight));
  shell.style.setProperty('--player-fit-w', fitW + 'px');
  shell.classList.toggle('player-compact-w', fitW <= 540);
  shell.classList.toggle('player-ultra-compact-w', fitW <= 400);
}

function syncLandscapeFullscreenLayout() {
  const shell = document.getElementById('playerShell');
  if (!shell) return;
  const active = Boolean(playerState.cssFullscreen && playerState.open && !playerState.pip);
  const angle = getScreenOrientationAngle();
  const fsEl = getFullscreenElement();
  const shellLockedByNativeFs = Boolean(fsEl && fsEl === shell);
  const vp = getVisualViewportBox();
  const manualDeg = playerState.manualRotateDeg === 90 || playerState.manualRotateDeg === 270 ? playerState.manualRotateDeg : 0;
  // Rotate 90deg/270deg when manually rotated OR when fullscreen on a portrait viewport / unswapped 90/270 orientation
  const autoPortraitRotate = active && !shellLockedByNativeFs && (vp.h > vp.w || ((angle === 90 || angle === 270) && vp.h >= vp.w));
  const shouldRotate = active && !shellLockedByNativeFs && (manualDeg !== 0 || autoPortraitRotate);
  const rotateDeg = manualDeg ? (manualDeg + 'deg') : (angle === 270 ? '270deg' : '90deg');

  if (active) {
    if (playerState.preFsScrollY === null) {
      playerState.preFsScrollY = window.scrollY || window.pageYOffset || 0;
    }
    shell.scrollTop = 0;
    shell.scrollLeft = 0;
    if (vp.w > 0 && vp.h > 0) {
      // Rotating 90deg/270deg swaps container width=vp.h and height=vp.w around visualViewport center (cx, cy) so video is never clipped.
      shell.style.setProperty('--player-fs-x', vp.x + 'px');
      shell.style.setProperty('--player-fs-y', vp.y + 'px');
      shell.style.setProperty('--player-fs-w', vp.w + 'px');
      shell.style.setProperty('--player-fs-h', vp.h + 'px');
      shell.style.setProperty('--player-fs-cx', Math.round(vp.x + vp.w / 2) + 'px');
      shell.style.setProperty('--player-fs-cy', Math.round(vp.y + vp.h / 2) + 'px');
      shell.style.setProperty('--player-rotate-deg', rotateDeg);
    }
    const effectiveContainerW = shouldRotate ? vp.h : vp.w;
    shell.classList.toggle('player-compact-w', effectiveContainerW > 0 && effectiveContainerW <= 540);
    shell.classList.toggle('player-ultra-compact-w', effectiveContainerW > 0 && effectiveContainerW <= 400);
  } else {
    shell.style.removeProperty('--player-fs-x');
    shell.style.removeProperty('--player-fs-y');
    shell.style.removeProperty('--player-fs-w');
    shell.style.removeProperty('--player-fs-h');
    shell.style.removeProperty('--player-fs-cx');
    shell.style.removeProperty('--player-fs-cy');
    shell.style.removeProperty('--player-fs-long');
    shell.style.removeProperty('--player-fs-short');
    shell.style.removeProperty('--player-rotate-deg');
  }

  shell.classList.toggle('landscape-fullscreen', active);
  document.documentElement.classList.toggle('player-fs-lock', active);
  document.body.classList.toggle('player-fs-lock', active);
  if (!active && playerState.preFsScrollY !== null) {
    const restoreY = playerState.preFsScrollY;
    playerState.preFsScrollY = null;
    if (restoreY > 0) {
      requestAnimationFrame(() => window.scrollTo(0, restoreY));
    }
  }
  shell.classList.toggle('force-landscape', shouldRotate);
  syncRelatedChannelsVisibility();
}

function togglePlayerRotate() {
  if (!playerState.open) return;
  if (playerState.pip) exitMiniPip(true);

  const nextMap = { 0: 90, 90: 270, 270: 0 };
  const nextDeg = nextMap[playerState.manualRotateDeg] || 0;
  playerState.manualRotateDeg = nextDeg;

  if (nextDeg === 90 || nextDeg === 270) {
    playerState.cssFullscreen = true;
    syncLandscapeFullscreenLayout();
    revealPlayerControls(3000);
  } else {
    const stayLandscape = playerState.userFullscreen || Boolean(getFullscreenElement()) || (isDeviceLandscape() && isTouchOrCompactDevice());
    if (!stayLandscape) {
      playerState.cssFullscreen = false;
      playerState.autoLandscape = false;
    }
    syncLandscapeFullscreenLayout();
    if (!playerState.cssFullscreen) {
      syncFloatingPlayerDimensions();
    }
    revealPlayerControls(3000);
  }
  updatePlayerPlaybackUI();
}

function detectAndSyncLandscapeMode() {
  if (!playerState.open || playerState.pip) return;
  const inLandscape = isDeviceLandscape();
  if (!inLandscape) {
    // Allow future auto-landscape detection once device returns to portrait
    playerState.landscapeDismissed = false;
    if (playerState.autoLandscape && !playerState.userFullscreen && !playerState.manualRotateDeg) {
      playerState.autoLandscape = false;
      playerState.cssFullscreen = false;
      syncLandscapeFullscreenLayout();
      syncRelatedChannelsVisibility();
      syncFloatingPlayerDimensions();
      updatePlayerPlaybackUI();
      revealPlayerControls(2600);
      return;
    }
    syncRelatedChannelsVisibility();
    syncFloatingPlayerDimensions();
    return;
  }

  if (isTouchOrCompactDevice() && !playerState.landscapeDismissed && !playerState.cssFullscreen && !isPlayerFullscreen()) {
    playerState.autoLandscape = true;
    playerState.cssFullscreen = true;
    syncLandscapeFullscreenLayout();
    updatePlayerPlaybackUI();
    revealPlayerControls(2600);
  } else {
    if (playerState.cssFullscreen) {
      syncLandscapeFullscreenLayout();
    } else {
      syncRelatedChannelsVisibility();
      syncFloatingPlayerDimensions();
    }
  }
}

async function tryLockLandscape() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      try {
        await screen.orientation.lock('landscape');
        return true;
      } catch (err1) {
        try {
          await screen.orientation.lock('landscape-primary');
          return true;
        } catch (err2) {}
      }
    }
    const legacyLock = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
    if (typeof legacyLock === 'function') {
      return Boolean(legacyLock.call(screen, 'landscape') || legacyLock.call(screen, 'landscape-primary'));
    }
  } catch (e) {}
  return false;
}

function tryUnlockOrientation() {
  try {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
      return;
    }
    const legacyUnlock = screen.unlockOrientation || screen.mozUnlockOrientation || screen.msUnlockOrientation;
    if (typeof legacyUnlock === 'function') {
      legacyUnlock.call(screen);
    }
  } catch (e) {}
}

function requestElementFullscreen(el) {
  if (!el) return Promise.reject(new Error('No element'));
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (typeof fn !== 'function') return Promise.reject(new Error('Fullscreen API unavailable'));
  try {
    const res = fn.call(el);
    return res && typeof res.then === 'function' ? res : Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

function exitDocumentFullscreen() {
  const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (typeof fn !== 'function') return Promise.resolve();
  try {
    const res = fn.call(document);
    return res && typeof res.then === 'function' ? res : Promise.resolve();
  } catch (err) {
    return Promise.resolve();
  }
}

function exitPlayerFullscreen() {
  if (playerState.landscapeFallbackTimer) {
    clearTimeout(playerState.landscapeFallbackTimer);
    playerState.landscapeFallbackTimer = null;
  }
  if (playerState.autoLandscape && isDeviceLandscape()) {
    playerState.landscapeDismissed = true;
  }
  playerState.cssFullscreen = false;
  playerState.userFullscreen = false;
  playerState.autoLandscape = false;
  playerState.manualRotateDeg = 0;
  playerState.keepingCssFsOnNativeExit = false;
  syncLandscapeFullscreenLayout();
  syncRelatedChannelsVisibility();
  syncFloatingPlayerDimensions();
  tryUnlockOrientation();
  if (getFullscreenElement()) {
    exitDocumentFullscreen().catch(() => {});
  }
  updatePlayerPlaybackUI();
  if (playerState.open && !playerState.pip) {
    revealPlayerControls(3000);
  }
}

async function enterPlayerFullscreen() {
  const shell = document.getElementById('playerShell');
  if (!shell || !playerState.open) return;
  if (playerState.pip) exitMiniPip(true);

  if (playerState.landscapeFallbackTimer) {
    clearTimeout(playerState.landscapeFallbackTimer);
    playerState.landscapeFallbackTimer = null;
  }
  playerState.keepingCssFsOnNativeExit = false;
  playerState.userFullscreen = true;
  playerState.autoLandscape = false;
  playerState.landscapeDismissed = false;
  playerState.cssFullscreen = true;
  syncLandscapeFullscreenLayout();
  updatePlayerPlaybackUI();
  revealPlayerControls(2600);

  const fsTarget = document.documentElement || shell;
  try {
    await requestElementFullscreen(fsTarget);
  } catch (e) {}

  await tryLockLandscape();
  syncLandscapeFullscreenLayout();
  updatePlayerPlaybackUI();
  revealPlayerControls(3500);

  playerState.landscapeFallbackTimer = setTimeout(() => {
    playerState.landscapeFallbackTimer = null;
    if (!playerState.cssFullscreen || !playerState.open || playerState.pip) return;
    syncLandscapeFullscreenLayout();
    updatePlayerPlaybackUI();
  }, 300);
}

function isPlayerMenuOpen() {
  const qMenu = document.getElementById('playerQualityMenu');
  const aMenu = document.getElementById('playerAspectMenu');
  return Boolean((qMenu && qMenu.classList.contains('open')) || (aMenu && aMenu.classList.contains('open')));
}

function shouldKeepPlayerControlsVisible(ignoreHover) {
  if (!playerState.open || playerState.pip) return true;
  const video = document.getElementById('playerVideo');
  const loadingEl = document.getElementById('playerLoadingOverlay');
  const errorEl = document.getElementById('playerErrorOverlay');
  if (isPlayerMenuOpen()) return true;
  if (!ignoreHover && playerState.chromeHover) return true;
  if (loadingEl && loadingEl.classList.contains('active')) return true;
  if (errorEl && errorEl.classList.contains('active')) return true;
  if (video && video.paused) return true;
  return false;
}

function hidePlayerControls(ignoreHover) {
  const shell = document.getElementById('playerShell');
  if (!shell) return;
  if (shouldKeepPlayerControlsVisible(ignoreHover)) return;
  if (playerState.chromeTimer) {
    clearTimeout(playerState.chromeTimer);
    playerState.chromeTimer = null;
  }
  shell.classList.add('controls-hidden');
}

function scheduleHidePlayerControls(delayMs) {
  if (playerState.chromeTimer) {
    clearTimeout(playerState.chromeTimer);
    playerState.chromeTimer = null;
  }
  if (shouldKeepPlayerControlsVisible(false)) return;
  const wait = typeof delayMs === 'number' ? delayMs : 3000;
  playerState.chromeTimer = setTimeout(() => {
    hidePlayerControls(false);
  }, wait);
}

function revealPlayerControls(autoHideDelay) {
  const shell = document.getElementById('playerShell');
  if (!shell || !playerState.open || playerState.pip) return;
  shell.classList.remove('controls-hidden');
  scheduleHidePlayerControls(typeof autoHideDelay === 'number' ? autoHideDelay : 3000);
}

function revealPipControlsTemporarily() {
  const shell = document.getElementById('playerShell');
  if (!shell || !playerState.pip) return;
  shell.classList.add('controls-visible');
  if (playerState.controlsTimer) clearTimeout(playerState.controlsTimer);
  playerState.controlsTimer = setTimeout(() => {
    shell.classList.remove('controls-visible');
  }, 3000);
}

function applyClampedPipPosition(targetLeft, targetTop) {
  const shell = document.getElementById('playerShell');
  if (!shell || !playerState.pip) return;
  const margin = 12;
  const rect = shell.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  const clampedLeft = Math.min(Math.max(margin, targetLeft), maxLeft);
  const clampedTop = Math.min(Math.max(margin, targetTop), maxTop);

  playerState.customPos = { left: clampedLeft, top: clampedTop };
  shell.classList.add('custom-pos');
  shell.style.left = clampedLeft + 'px';
  shell.style.top = clampedTop + 'px';
}

function initPipDrag() {
  const shell = document.getElementById('playerShell');
  const stage = document.getElementById('playerStage');
  if (!shell || !stage) return;

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  function onStart(clientX, clientY, target) {
    if (!playerState.pip) return;
    if (target && target.closest('button, input')) return;
    const rect = shell.getBoundingClientRect();
    dragging = true;
    moved = false;
    startX = clientX;
    startY = clientY;
    origLeft = rect.left;
    origTop = rect.top;
    shell.classList.add('dragging');
  }

  function onMove(clientX, clientY) {
    if (!dragging || !playerState.pip) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.hypot(dx, dy) > 6) moved = true;
    if (moved) {
      applyClampedPipPosition(origLeft + dx, origTop + dy);
    }
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    shell.classList.remove('dragging');
    if (!moved && playerState.pip) {
      if (shell.classList.contains('controls-visible')) {
        shell.classList.remove('controls-visible');
      } else {
        revealPipControlsTemporarily();
      }
    }
  }

  stage.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    onStart(e.clientX, e.clientY, e.target);
  });
  document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  stage.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!dragging || !e.touches || e.touches.length !== 1) return;
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);

  window.addEventListener('resize', () => {
    if (playerState.pip && playerState.customPos) {
      applyClampedPipPosition(playerState.customPos.left, playerState.customPos.top);
    }
  });
}

function initVideoPlayer() {
  loadQualityPref();
  loadAspectMode();
  loadPlayerVolume();
  const video = document.getElementById('playerVideo');
  const backdrop = document.getElementById('playerBackdrop');
  const shell = document.getElementById('playerShell');
  if (!video || !shell) return;

  function togglePlay() {
    if (!playerState.open) return;
    if (video.paused) {
      playerState.userPaused = false;
      video.play().catch(() => {});
    } else {
      playerState.userPaused = true;
      clearStallWatchdog();
      video.pause();
    }
    revealPipControlsTemporarily();
  }

  function toggleMute() {
    if (!playerState.open) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.8;
    savePlayerVolume();
    updatePlayerPlaybackUI();
    revealPipControlsTemporarily();
  }

  function toggleFullscreen() {
    if (!playerState.open) return;
    if (playerState.pip) exitMiniPip(true);
    if (!isPlayerFullscreen()) {
      enterPlayerFullscreen();
    } else {
      exitPlayerFullscreen();
    }
  }

  document.getElementById('playerPlayBtn')?.addEventListener('click', togglePlay);
  document.getElementById('pipPlayBtn')?.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  document.getElementById('playerMuteBtn')?.addEventListener('click', toggleMute);
  document.getElementById('pipMuteBtn')?.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(); });

  document.getElementById('playerVolume')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (Number.isFinite(val)) {
      video.volume = Math.min(1, Math.max(0, val));
      video.muted = video.volume === 0;
      savePlayerVolume();
      updatePlayerPlaybackUI();
    }
  });

  document.getElementById('playerAspectBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAspectMenu(e.detail === 0);
  });

  document.getElementById('playerQualityBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQualityMenu(e.detail === 0);
  });

  document.addEventListener('click', (e) => {
    const qWrap = document.getElementById('playerQualityWrap');
    if (qWrap && !qWrap.contains(e.target)) {
      closeQualityMenu();
    }
    const aWrap = document.getElementById('playerAspectWrap');
    if (aWrap && !aWrap.contains(e.target)) {
      closeAspectMenu();
    }
  });

  document.getElementById('playerPipBtn')?.addEventListener('click', () => {
    if (playerState.pip) exitMiniPip();
    else enterMiniPip(false);
  });
  document.getElementById('pipExpandBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    exitMiniPip();
  });

  document.getElementById('playerNativePipBtn')?.addEventListener('click', toggleNativePip);
  document.getElementById('pipNativeBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNativePip();
  });

  document.getElementById('playerRotateBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayerRotate();
  });
  document.getElementById('playerFullscreenBtn')?.addEventListener('click', toggleFullscreen);
  document.getElementById('playerStreamSwitchBtn')?.addEventListener('click', () => switchBackupStream(false));

  document.getElementById('playerRelatedShuffleBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    renderPlayerRelatedChannels(true);
    syncFloatingPlayerDimensions();
  });

  const relatedTrack = document.getElementById('playerRelatedTrack');
  if (relatedTrack) {
    relatedTrack.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        relatedTrack.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  document.getElementById('playerCloseBtn')?.addEventListener('click', closeVideoPlayer);
  document.getElementById('pipCloseBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeVideoPlayer();
  });

  backdrop?.addEventListener('click', () => {
    if (playerState.open && !playerState.pip) enterMiniPip(false);
  });

  document.getElementById('playerRetryBtn')?.addEventListener('click', () => {
    if (playerState.streams[playerState.streamIndex]) {
      cancelStreamAutoRetry(true);
      loadStreamUrl(playerState.streams[playerState.streamIndex]);
    }
  });

  document.getElementById('playerCancelRetryBtn')?.addEventListener('click', () => {
    playerState.autoRetryUserCancelled = true;
    cancelStreamAutoRetry(false);
    updateRetryOverlayUI({
      metaText: 'Auto-retry paused. Tap Retry Now to reconnect.',
      showProgress: false,
      showCancel: false,
      retryLabel: 'Retry Now'
    });
  });

  window.addEventListener('online', () => {
    if (!playerState.open || !playerState.streams.length || playerState.autoRetryUserCancelled) return;
    const errEl = document.getElementById('playerErrorOverlay');
    if (errEl && errEl.classList.contains('active')) {
      cancelStreamAutoRetry(true);
      loadStreamUrl(playerState.streams[playerState.streamIndex]);
    }
  });

  video.addEventListener('play', () => {
    playerState.userPaused = false;
    updatePlayerPlaybackUI();
    scheduleHidePlayerControls(2600);
  });
  video.addEventListener('pause', () => {
    clearStallWatchdog();
    updatePlayerPlaybackUI();
    revealPlayerControls();
  });
  video.addEventListener('volumechange', () => {
    savePlayerVolume();
    updatePlayerPlaybackUI();
  });
  video.addEventListener('loadedmetadata', () => {
    if (video.videoHeight > 0) {
      playerState.detectedHeight = video.videoHeight;
      updatePlayerQualityUI();
    }
  });
  video.addEventListener('resize', () => {
    if (video.videoHeight > 0) {
      playerState.detectedHeight = video.videoHeight;
      updatePlayerQualityUI();
    }
  });
  video.addEventListener('waiting', () => {
    if (playerState.open) {
      playerState.engineBuffering = true;
      if (playerState.hasStartedPlayback) recordPlayerRebuffer(false);
      setPlayerLoading(true, 'Buffering...');
      updateBufferHealthIndicator();
      if (!video.paused) armStallWatchdog(false);
    }
  });
  video.addEventListener('stalled', () => {
    if (playerState.open && !video.paused) {
      recordPlayerRebuffer(true);
      updateBufferHealthIndicator();
      armStallWatchdog(false);
    }
  });
  video.addEventListener('progress', () => {
    if (playerState.open && !playerState.pip) updateBufferHealthIndicator();
  });
  video.addEventListener('playing', () => {
    playerState.userPaused = false;
    playerState.hasStartedPlayback = true;
    playerState.engineBuffering = false;
    cancelStreamAutoRetry(true);
    clearStallWatchdog();
    setPlayerLoading(false);
    setPlayerError(false);
    updatePlayerPlaybackUI();
    updateBufferHealthIndicator();
    scheduleHidePlayerControls(2600);
  });
  video.addEventListener('canplay', () => {
    playerState.engineBuffering = false;
    clearStallWatchdog();
    setPlayerLoading(false);
    updatePlayerPlaybackUI();
    updateBufferHealthIndicator();
    scheduleHidePlayerControls(2600);
  });
  video.addEventListener('error', () => {
    if (!playerState.open || playerState.hls || playerState.shaka || playerState.mpegts) return;
    if (typeof playerState.onEngineFallback === 'function') {
      const cb = playerState.onEngineFallback;
      playerState.onEngineFallback = null;
      cb();
      return;
    }
    handleStreamLoadFailure('Stream playback failed.');
  });

  video.addEventListener('enterpictureinpicture', () => {
    playerState.nativePip = true;
    if (playerState.open && !playerState.pip) enterMiniPip(true);
    updatePlayerPlaybackUI();
  });
  video.addEventListener('leavepictureinpicture', () => {
    playerState.nativePip = false;
    updatePlayerPlaybackUI();
  });
  video.addEventListener('webkitpresentationmodechanged', () => {
    playerState.nativePip = video.webkitPresentationMode === 'picture-in-picture';
    if (playerState.nativePip && playerState.open && !playerState.pip) enterMiniPip(true);
    updatePlayerPlaybackUI();
  });

  const stageEl = document.getElementById('playerStage');
  const viewportEl = document.getElementById('playerViewport') || shell;
  const headerEl = shell.querySelector('.player-header');
  const controlsEl = shell.querySelector('.player-controls');
  let lastTouchAt = 0;
  let lastRevealFromHiddenAt = 0;
  let lastStageTouchToggleAt = 0;
  let stageTouchStart = null;

  function isTouchSyntheticMouse(e) {
    if (Date.now() - lastTouchAt < 1000) return true;
    if (e && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return true;
    return false;
  }

  function triggerRevealControls(delayMs) {
    const wasHidden = shell.classList.contains('controls-hidden');
    revealPlayerControls(delayMs);
    if (wasHidden) {
      lastRevealFromHiddenAt = Date.now();
    }
  }

  shell.addEventListener('touchstart', () => {
    lastTouchAt = Date.now();
    playerState.chromeHover = false;
  }, { passive: true });

  viewportEl.addEventListener('mousemove', (e) => {
    if (isTouchSyntheticMouse(e)) return;
    if (playerState.open && !playerState.pip) {
      triggerRevealControls(3000);
    }
  });
  viewportEl.addEventListener('mouseleave', (e) => {
    if (isTouchSyntheticMouse(e)) return;
    if (playerState.open && !playerState.pip) {
      playerState.chromeHover = false;
      scheduleHidePlayerControls(900);
    }
  });

  [headerEl, controlsEl].forEach((bar) => {
    if (!bar) return;
    bar.addEventListener('mouseenter', (e) => {
      if (isTouchSyntheticMouse(e)) return;
      playerState.chromeHover = true;
      triggerRevealControls(3000);
    });
    bar.addEventListener('mouseleave', (e) => {
      if (isTouchSyntheticMouse(e)) return;
      playerState.chromeHover = false;
      scheduleHidePlayerControls(2200);
    });
    bar.addEventListener('pointerdown', () => {
      triggerRevealControls(3000);
    });
    bar.addEventListener('touchstart', () => {
      triggerRevealControls(3500);
    }, { passive: true });
    bar.addEventListener('input', () => {
      triggerRevealControls(3000);
    });
  });

  const tapSurfaceEl = viewportEl || stageEl;
  const tapIgnoreSelector = '.player-header, .player-controls, .player-status-overlay, .pip-overlay, .player-quality-menu, .player-aspect-menu, button, input';
  if (tapSurfaceEl) {
    tapSurfaceEl.addEventListener('touchstart', (e) => {
      if (!playerState.open || playerState.pip) return;
      if (!e.touches || e.touches.length !== 1) { stageTouchStart = null; return; }
      if (e.target && e.target.closest(tapIgnoreSelector)) {
        stageTouchStart = null;
        return;
      }
      stageTouchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now()
      };
    }, { passive: true });

    tapSurfaceEl.addEventListener('touchcancel', () => {
      stageTouchStart = null;
    }, { passive: true });

    tapSurfaceEl.addEventListener('touchend', (e) => {
      if (!playerState.open || playerState.pip || !stageTouchStart) return;
      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      const start = stageTouchStart;
      stageTouchStart = null;
      if (!touch) return;
      if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 24) return;
      if (Date.now() - start.t > 650) return;
      if (isPlayerMenuOpen()) return;

      lastStageTouchToggleAt = Date.now();
      if (shell.classList.contains('controls-hidden')) {
        triggerRevealControls(3500);
      } else {
        hidePlayerControls(true);
      }
    }, { passive: true });

    tapSurfaceEl.addEventListener('click', (e) => {
      if (!playerState.open || playerState.pip) return;
      if (Date.now() - lastStageTouchToggleAt < 1000) return;
      if (e.target && e.target.closest(tapIgnoreSelector)) return;
      if (isPlayerMenuOpen()) return;
      if (shell.classList.contains('controls-hidden')) {
        triggerRevealControls(3500);
      } else if (Date.now() - lastRevealFromHiddenAt < 400) {
        triggerRevealControls(3500);
      } else {
        hidePlayerControls(true);
      }
    });
  }

  function handleFullscreenChange() {
    if (!playerState.open) return;
    const fsEl = getFullscreenElement();
    if (fsEl) {
      playerState.cssFullscreen = true;
      tryLockLandscape();
      syncLandscapeFullscreenLayout();
      syncRelatedChannelsVisibility();
      if (!playerState.pip) revealPlayerControls(2600);
      updatePlayerPlaybackUI();
      setTimeout(syncResponsivePlayerLayout, 120);
      setTimeout(syncResponsivePlayerLayout, 360);
    } else if (playerState.keepingCssFsOnNativeExit) {
      syncLandscapeFullscreenLayout();
      syncRelatedChannelsVisibility();
      updatePlayerPlaybackUI();
    } else if (playerState.cssFullscreen) {
      exitPlayerFullscreen();
    } else {
      tryUnlockOrientation();
      syncRelatedChannelsVisibility();
      syncFloatingPlayerDimensions();
      updatePlayerPlaybackUI();
    }
  }

  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((evName) => {
    document.addEventListener(evName, handleFullscreenChange);
  });

  function syncOpenDropdownMenus() {
    const qMenu = document.getElementById('playerQualityMenu');
    if (qMenu && qMenu.classList.contains('open')) positionPlayerDropdownMenu(qMenu);
    const aMenu = document.getElementById('playerAspectMenu');
    if (aMenu && aMenu.classList.contains('open')) positionPlayerDropdownMenu(aMenu);
  }

  function syncResponsivePlayerLayout() {
    if (!playerState.open) return;
    detectAndSyncLandscapeMode();
    syncRelatedChannelsVisibility();
    if (playerState.cssFullscreen) {
      syncLandscapeFullscreenLayout();
    } else {
      syncFloatingPlayerDimensions();
    }
    if (playerState.pip && playerState.customPos) {
      applyClampedPipPosition(playerState.customPos.left, playerState.customPos.top);
    }
    syncOpenDropdownMenus();
  }
  window.__syncZedStreamPlayerLayout = syncResponsivePlayerLayout;

  if (typeof ResizeObserver === 'function' && document.documentElement) {
    const vpResizeObserver = new ResizeObserver(() => {
      syncResponsivePlayerLayout();
    });
    vpResizeObserver.observe(document.documentElement);
  }
  window.addEventListener('resize', syncResponsivePlayerLayout);
  if (window.visualViewport && typeof window.visualViewport.addEventListener === 'function') {
    window.visualViewport.addEventListener('resize', syncResponsivePlayerLayout);
    window.visualViewport.addEventListener('scroll', syncResponsivePlayerLayout);
  }
  window.addEventListener('orientationchange', () => {
    syncResponsivePlayerLayout();
    setTimeout(syncResponsivePlayerLayout, 80);
    setTimeout(syncResponsivePlayerLayout, 220);
    setTimeout(syncResponsivePlayerLayout, 480);
  });
  if (screen.orientation && typeof screen.orientation.addEventListener === 'function') {
    screen.orientation.addEventListener('change', () => {
      syncResponsivePlayerLayout();
      setTimeout(syncResponsivePlayerLayout, 100);
      setTimeout(syncResponsivePlayerLayout, 260);
    });
  }
  if (window.matchMedia) {
    const landscapeMql = window.matchMedia('(orientation: landscape)');
    const onOrientationMqlChange = () => {
      syncResponsivePlayerLayout();
      setTimeout(syncResponsivePlayerLayout, 140);
    };
    if (typeof landscapeMql.addEventListener === 'function') {
      landscapeMql.addEventListener('change', onOrientationMqlChange);
    } else if (typeof landscapeMql.addListener === 'function') {
      landscapeMql.addListener(onOrientationMqlChange);
    }
  }

  function isVisibleFocusTarget(el) {
    if (!el || el.disabled) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getPlayerDpadRows() {
    const rows = [];
    const headerBtns = Array.from(shell.querySelectorAll('.player-header-actions button')).filter(isVisibleFocusTarget);
    if (headerBtns.length) rows.push(headerBtns);
    const controlEls = Array.from(shell.querySelectorAll('.player-controls button, .player-controls input')).filter(isVisibleFocusTarget);
    if (controlEls.length) rows.push(controlEls);
    const relatedEl = document.getElementById('playerRelated');
    if (relatedEl && isVisibleFocusTarget(relatedEl)) {
      const shuffleBtn = Array.from(relatedEl.querySelectorAll('.player-related-shuffle')).filter(isVisibleFocusTarget);
      if (shuffleBtn.length) rows.push(shuffleBtn);
      const cardEls = Array.from(relatedEl.querySelectorAll('.player-related-card')).filter(isVisibleFocusTarget);
      if (cardEls.length) rows.push(cardEls);
    }
    return rows;
  }

  function movePlayerFocusHorizontally(row, currentIdx, dir) {
    if (!row || !row.length) return;
    const nextIdx = Math.max(0, Math.min(row.length - 1, currentIdx + dir));
    const target = row[nextIdx];
    if (target) {
      target.focus({ preventScroll: true });
      if (target.closest && target.closest('.player-related-track')) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }

  function movePlayerFocusVertically(rows, rowIdx, activeEl, dir) {
    const nextRowIdx = rowIdx + dir;
    if (nextRowIdx < 0 || nextRowIdx >= rows.length) return;
    const targetRow = rows[nextRowIdx];
    if (!targetRow || !targetRow.length) return;
    const activeRect = activeEl.getBoundingClientRect();
    const activeCenterX = activeRect.left + activeRect.width / 2;
    let best = targetRow[0];
    let bestDist = Infinity;
    targetRow.forEach((candidate) => {
      const r = candidate.getBoundingClientRect();
      const dist = Math.abs((r.left + r.width / 2) - activeCenterX);
      if (dist < bestDist) {
        bestDist = dist;
        best = candidate;
      }
    });
    if (best) {
      best.focus({ preventScroll: true });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!playerState.open) return;
    const targetEl = e.target;
    const tag = targetEl && targetEl.tagName;
    const isRangeInput = tag === 'INPUT' && targetEl.type === 'range';
    if ((tag === 'INPUT' && !isRangeInput) || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!playerState.pip) revealPlayerControls(3000);

    const key = e.key || '';
    const keyLow = key.toLowerCase();

    if (key === 'Escape' || key === 'GoBack' || key === 'BrowserBack') {
      const aMenu = document.getElementById('playerAspectMenu');
      if (aMenu && aMenu.classList.contains('open')) {
        e.preventDefault();
        closeAspectMenu(true);
        return;
      }
      const qMenu = document.getElementById('playerQualityMenu');
      if (qMenu && qMenu.classList.contains('open')) {
        e.preventDefault();
        closeQualityMenu(true);
        return;
      }
      if (isPlayerFullscreen() && !getFullscreenElement()) {
        e.preventDefault();
        exitPlayerFullscreen();
        return;
      }
      if (!playerState.pip) {
        e.preventDefault();
        enterMiniPip(false);
      }
      return;
    }

    // Handle open Quality / Aspect menu keyboard & TV D-pad navigation
    const openMenu = document.querySelector('#playerQualityMenu.open, #playerAspectMenu.open');
    if (openMenu && !playerState.pip) {
      const opts = Array.from(openMenu.querySelectorAll('.player-quality-option')).filter(isVisibleFocusTarget);
      if (opts.length && (key === 'ArrowDown' || key === 'ArrowUp')) {
        e.preventDefault();
        const curIdx = opts.indexOf(document.activeElement);
        const dir = key === 'ArrowDown' ? 1 : -1;
        const nextIdx = curIdx < 0 ? 0 : (curIdx + dir + opts.length) % opts.length;
        opts[nextIdx].focus({ preventScroll: false });
        return;
      }
    }

    if (key === 'MediaPlayPause') {
      e.preventDefault();
      togglePlay();
    } else if (key === 'MediaPlay') {
      e.preventDefault();
      if (video.paused) togglePlay();
    } else if (key === 'MediaPause') {
      e.preventDefault();
      if (!video.paused) togglePlay();
    } else if (key === 'MediaStop') {
      e.preventDefault();
      closeVideoPlayer();
    } else if (key === 'VolumeMute' || key === 'AudioVolumeMute') {
      e.preventDefault();
      toggleMute();
    } else if (key === 'VolumeUp' || key === 'AudioVolumeUp') {
      e.preventDefault();
      video.muted = false;
      video.volume = Math.min(1, Math.round((video.volume + 0.1) * 100) / 100);
      updatePlayerPlaybackUI();
    } else if (key === 'VolumeDown' || key === 'AudioVolumeDown') {
      e.preventDefault();
      video.volume = Math.max(0, Math.round((video.volume - 0.1) * 100) / 100);
      video.muted = video.volume === 0;
      updatePlayerPlaybackUI();
    } else if (key === ' ' || keyLow === 'k') {
      if (key === ' ' && tag === 'BUTTON') return;
      e.preventDefault();
      togglePlay();
    } else if (keyLow === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (keyLow === 'p') {
      e.preventDefault();
      if (playerState.pip) exitMiniPip();
      else enterMiniPip(false);
    } else if (keyLow === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (keyLow === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      togglePlayerRotate();
    } else if (keyLow === 'z') {
      e.preventDefault();
      cycleAspectMode();
    } else if (!playerState.pip && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown')) {
      if (isRangeInput && (key === 'ArrowLeft' || key === 'ArrowRight')) return;
      e.preventDefault();
      const rows = getPlayerDpadRows();
      if (!rows.length) return;
      const active = document.activeElement;
      let foundRow = -1;
      let foundCol = -1;
      rows.forEach((row, rIdx) => {
        const cIdx = row.indexOf(active);
        if (cIdx >= 0) {
          foundRow = rIdx;
          foundCol = cIdx;
        }
      });
      if (foundRow < 0) {
        const playBtn = document.getElementById('playerPlayBtn');
        const initialFocus = (playBtn && isVisibleFocusTarget(playBtn)) ? playBtn : rows[0][0];
        if (initialFocus) initialFocus.focus({ preventScroll: true });
        return;
      }
      if (key === 'ArrowLeft') {
        movePlayerFocusHorizontally(rows[foundRow], foundCol, -1);
      } else if (key === 'ArrowRight') {
        movePlayerFocusHorizontally(rows[foundRow], foundCol, 1);
      } else if (key === 'ArrowUp') {
        movePlayerFocusVertically(rows, foundRow, active, -1);
      } else if (key === 'ArrowDown') {
        movePlayerFocusVertically(rows, foundRow, active, 1);
      }
    }
  });

  initPipDrag();
}

async function triggerPtrRefresh() {
  if (ptrRefreshing) return;
  ptrRefreshing = true;
  try {
    const sportsPage = document.getElementById('sportsPage');
    const profilePage = document.getElementById('profilePage');
    const favoritesPage = document.getElementById('favoritesPage');
    const historyPage = document.getElementById('historyPage');
    if (sportsPage && sportsPage.classList.contains('active')) {
      await loadSportsSection(true);
    } else if (profilePage && profilePage.classList.contains('active')) {
      await refreshSubscriptionData();
      await renderProfilePage();
    } else if (favoritesPage && favoritesPage.classList.contains('active')) {
      await loadLiveTV();
      renderFavoritesPage();
    } else if (historyPage && historyPage.classList.contains('active')) {
      await loadLiveTV();
      renderHistoryPage();
    } else {
      await loadLiveTV();
    }
    if (currentUser) {
      await refreshSubscriptionData();
    }
  } catch (e) {
    console.error('[PTR] Refresh error:', e);
  } finally {
    ptrRefreshing = false;
  }
}

function initPullToRefresh() {
  document.addEventListener('touchstart', (e) => {
    if (ptrRefreshing || ptrOverlaysOpen()) return;
    if (window.scrollY <= 0 && e.touches && e.touches.length === 1) {
      ptrStartY = e.touches[0].clientY;
      ptrCurrentDist = 0;
      ptrActive = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!ptrActive || ptrRefreshing || !e.touches || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - ptrStartY;
    if (dy > 0 && window.scrollY <= 0) {
      ptrCurrentDist = dy;
    } else {
      ptrActive = false;
      ptrCurrentDist = 0;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!ptrActive) return;
    const dist = ptrCurrentDist;
    ptrActive = false;
    ptrCurrentDist = 0;
    if (dist >= PTR_THRESHOLD && !ptrRefreshing && !ptrOverlaysOpen()) {
      triggerPtrRefresh();
    }
  }, { passive: true });

  document.addEventListener('touchcancel', () => {
    ptrActive = false;
    ptrCurrentDist = 0;
  }, { passive: true });

  document.addEventListener('mousedown', (e) => {
    if (ptrRefreshing || ptrOverlaysOpen() || e.button !== 0) return;
    if (window.scrollY <= 0) {
      ptrStartY = e.clientY;
      ptrCurrentDist = 0;
      ptrPointerDown = true;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!ptrPointerDown || ptrRefreshing) return;
    const dy = e.clientY - ptrStartY;
    if (dy > 0 && window.scrollY <= 0) {
      ptrCurrentDist = dy;
    } else {
      ptrPointerDown = false;
      ptrCurrentDist = 0;
    }
  });

  document.addEventListener('mouseup', () => {
    if (!ptrPointerDown) return;
    const dist = ptrCurrentDist;
    ptrPointerDown = false;
    ptrCurrentDist = 0;
    if (dist >= PTR_THRESHOLD && !ptrRefreshing && !ptrOverlaysOpen()) {
      triggerPtrRefresh();
    }
  });
}

/* ===== APP INIT ===== */
document.addEventListener('contextmenu', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  e.preventDefault();
});

function bootApp() {
  loadFavorites();
  loadWatchHistory();
  initMatchReminders();
  initSidebarNavigation();
  initNetworkDetection();
  initPinSystem();
  initSearch();
  initChannelPreview();
  initVideoPlayer();
  initPullToRefresh();
  initFirebase();
  initLiveViewToggle();
  renderLiveCategoryChips();
  loadLiveTV();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
