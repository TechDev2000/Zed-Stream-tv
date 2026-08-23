/* ===== CONFIG ===== */
const PASTEFY_API_KEY = 'mEQy1tvH7DTSuqOW0d8R2duwhwxZVYz0F0kfzRMijbypfrNRUUSTtnxj9AtN';
const SUBSCRIPTION_PASTE_ID = 'ePhfxmdW';
const LIVE_TV_API = 'https://pastefy.app/sh92Ia4P/raw';
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

  // Try API first
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

  // Fallback to raw URL
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
  // Also allow closing the gate by clicking outside
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

  // If device is already connected, allow access
  if (connected.includes(deviceId)) {
    console.log('[Device] Device already connected, access granted');
    return false;
  }

  // If under limit, add this device
  if (connected.length < limit) {
    console.log('[Device] Under limit, adding device...');
    await addDeviceToSubscription(sub, deviceId);
    return false;
  }

  // Device limit reached - show popup to remove another device
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
  const index = await fetchSubscriptionIndex();
  if (!index || !index.subscriptions) return;
  const idx = index.subscriptions.findIndex(s => s.subEmail && s.subEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
  if (idx >= 0) {
    const subEntry = index.subscriptions[idx];
    subEntry.connectedDevices = (subEntry.connectedDevices || []).filter(d => d !== devIdToRemove);
    subEntry.updatedAt = new Date().toISOString();
    await pastefyEdit(SUBSCRIPTION_PASTE_ID, 'Subscription Master Index', JSON.stringify(index, null, 2));
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
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  hideSubGate();
  if (subPollTimer) { clearInterval(subPollTimer); subPollTimer = null; }
  // Make sure init is hidden
  hideInit();
}

function hideLogin() {
  document.getElementById('loginOverlay').style.display = 'none';
}

async function onAuthSuccess(user) {
  hideLogin();
  document.getElementById('sidebarUser').style.display = 'block';
  document.getElementById('sidebarUserEmail').textContent = user.email;
  document.getElementById('sidebarDeviceInfo').style.display = 'block';
  document.getElementById('sidebarDeviceId').textContent = deviceId;
  document.getElementById('sidebarLogoutBtn').style.display = 'flex';
  document.getElementById('navProfile').style.display = 'flex';

  const hasConflict = await checkDeviceConflict();
  if (hasConflict) return;

  // Load subscription data for sidebar display (non-blocking)
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
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    errorEl.textContent = 'Please enter both email and password.';
    return;
  }

  btn.disabled = true;
  errorEl.textContent = '';

  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    btn.disabled = false;
    if (e.code === 'auth/user-not-found') errorEl.textContent = 'Account not found.';
    else if (e.code === 'auth/wrong-password') errorEl.textContent = 'Incorrect password.';
    else if (e.code === 'auth/invalid-email') errorEl.textContent = 'Invalid email address.';
    else if (e.code === 'auth/too-many-requests') errorEl.textContent = 'Too many attempts. Try again later.';
    else errorEl.textContent = e.message || 'Login failed.';
  }
}

async function performLogout() {
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
    info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>'
  };
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
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

function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }
menuBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

/* ===== LIVE TV SYSTEM ===== */
let liveChannels = [];
let liveCategories = [];
let activeLiveCategory = 'all';
let liveSearchQuery = '';

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

function getLiveCategories(channels) {
  const cats = new Set();
  channels.forEach(c => { if (c.category) cats.add(c.category); });
  const allCats = ['all', ...Array.from(cats).sort()];
  if (!matureUnlocked) return allCats.filter(c => c !== 'mature' && c !== '18+');
  return allCats;
}

function renderLiveCategoryChips() {
  const container = document.getElementById('liveCategoryChips');
  if (!container) return;
  container.innerHTML = liveCategories.map(cat => {
    const label = cat === 'all' ? 'All Channels' : cat.charAt(0).toUpperCase() + cat.slice(1);
    return `<button class="live-category-chip ${cat === activeLiveCategory ? 'active' : ''}" data-cat="${cat}">${label}</button>`;
  }).join('');
  container.querySelectorAll('.live-category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeLiveCategory = chip.dataset.cat;
      renderLiveCategoryChips();
      renderLiveChannels();
    });
  });
}

function isMatureChannel(channel) {
  return channel.category === 'mature' || channel.category === '18+' || channel.badge === '18+' || channel.badge === 'MATURE';
}

function renderLiveChannels() {
  const grid = document.getElementById('liveGrid');
  if (!grid) return;
  const channels = Array.isArray(liveChannels) ? liveChannels : [];
  let displayChannels = channels;
  if (!matureUnlocked) displayChannels = channels.filter(c => !isMatureChannel(c));
  const query = liveSearchQuery.trim().toLowerCase();
  if (query) {
    displayChannels = displayChannels.filter(c =>
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.category && c.category.toLowerCase().includes(query))
    );
  }
  const filtered = activeLiveCategory === 'all' ? displayChannels : displayChannels.filter(c => c.category === activeLiveCategory);

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

  grid.innerHTML = filtered.map((ch, i) => {
    const catClass = ch.category || 'live';
    const isMature = isMatureChannel(ch);
    const imgHtml = ch.img ? `<img src="${ch.img}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg width=32 height=32 viewBox=\'0 0 24 24\' fill=\'rgba(255,255,255,0.15)\'><path d=\'M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z\'></path></svg>'">` : `<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
    return `
      <div class="live-card" data-liveidx="${i}" ${isMature ? 'data-mature="true"' : ''}>
        <div class="live-card-img-wrap">
          ${imgHtml}
          <div class="live-indicator"><span class="live-indicator-dot"></span>LIVE</div>
          <div class="live-card-badge ${catClass}">${ch.badge || catClass}</div>
          <div class="live-card-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
          ${isMature && !matureUnlocked ? `
            <div class="mature-blur-overlay">
              <div class="lock-icon"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg></div>
              <div class="lock-text">18+ Locked</div>
            </div>` : ''}
        </div>
        <div class="live-card-info">
          <div class="live-card-name">${highlightSearch(ch.name, query)}</div>
          <div class="live-card-cat">${ch.category || 'Live'}</div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.live-card').forEach(el => {
    el.addEventListener('click', async () => {
      const idx = parseInt(el.dataset.liveidx);
      const ch = filtered[idx];
      if (!ch) return;
      if (el.dataset.mature && !matureUnlocked) {
        showPinModal(async (granted) => { if (granted) await playLiveChannel(ch); });
        return;
      }
      await playLiveChannel(ch);
    });
  });
}

async function loadLiveTV() {
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
    return;
  }
  liveChannels = result.data || [];
  liveCategories = getLiveCategories(liveChannels);
  if (!matureUnlocked && (activeLiveCategory === 'mature' || activeLiveCategory === '18+')) activeLiveCategory = 'all';
  renderLiveCategoryChips();
  renderLiveChannels();
}

async function playLiveChannel(channel) {
  // Check subscription before playing
  const hasAccess = await checkSubscriptionBeforePlay();
  if (!hasAccess) return;

  const link = channel.link || channel.link2 || '';
  if (!link) { showToast('No Link', 'This channel has no link configured.', 'error'); return; }
  window.location.href = link;
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
    pinInputs[index].classList.toggle('filled', !!value);
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
    updateLockButtonState();
    showToast('18+ Locked', 'Mature channels are now hidden.', 'info');
    renderLiveChannels();
    renderLiveCategoryChips();
  } else {
    showPinModal((granted) => {
      if (!granted) return;
      renderLiveChannels();
      renderLiveCategoryChips();
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
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    liveSearchQuery = e.target.value;
    if (clearBtn) clearBtn.style.display = liveSearchQuery ? 'flex' : 'none';
    renderLiveChannels();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      liveSearchQuery = '';
      if (clearBtn) clearBtn.style.display = 'none';
      renderLiveChannels();
      searchInput.blur();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      liveSearchQuery = '';
      clearBtn.style.display = 'none';
      renderLiveChannels();
      searchInput.focus();
    });
  }
}


/* ===== PROFILE PAGE ===== */
function showProfilePage() {
  document.getElementById('liveTVSection').style.display = 'none';
  document.getElementById('profilePage').classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navProfile').classList.add('active');
  renderProfilePage();
}

function showLiveTVPage() {
  document.getElementById('liveTVSection').style.display = 'block';
  document.getElementById('profilePage').classList.remove('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navLiveTV').classList.add('active');
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

  // Render device list
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

    // Attach remove handlers
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

/* ===== REMOVE DEVICE (updated to return success) ===== */
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

/* ===== NAVIGATION ===== */
document.getElementById('navLiveTV').addEventListener('click', () => {
  closeSidebar();
  showLiveTVPage();
});
document.getElementById('navProfile').addEventListener('click', () => {
  closeSidebar();
  showProfilePage();
});
document.getElementById('profileBackBtn').addEventListener('click', showLiveTVPage);
document.getElementById('profilePaymentBtn').addEventListener('click', () => {
  window.location.href = 'go:payment';
});

/* ===== LOGIN EVENT LISTENERS ===== */
document.getElementById('loginBtn').addEventListener('click', performLogin);
document.getElementById('loginEmail').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginOverlay').style.display !== 'none') performLogin();
});
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginOverlay').style.display !== 'none') performLogin();
});

/* Password show/hide toggle */
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

/* Forgot password */
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

/* ===== INIT ===== */
initFirebase();
initPinSystem();
initSearch();
loadLiveTV();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('pinModalOverlay').classList.contains('active')) closePinModal();
    if (document.getElementById('confirmModalOverlay').classList.contains('active')) {
      document.getElementById('confirmModalOverlay').classList.remove('active');
      if (confirmCallback) { confirmCallback(false); confirmCallback = null; }
    }
    if (sidebar.classList.contains('open')) closeSidebar();
  }
});