/* ===== VIDEO PLAYER & PICTURE-IN-PICTURE CONTROLLER ===== */
const QUALITY_PREF_STORAGE_KEY = 'zedstream_quality_pref_v1';
const ASPECT_MODE_STORAGE_KEY = 'zedstream_aspect_mode_v1';

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
  keepingCssFsOnNativeExit: false,
  customPos: null,
  aspectMode: 'fit',
  qualityPref: 'auto',
  qualityLevels: [],
  activeQualityLevel: -1,
  detectedHeight: 0,
  privateStream: false,
  loadToken: 0
};

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

function extractHlsQualityLevels(hls) {
  if (!hls || !Array.isArray(hls.levels)) return [];
  const byHeight = new Map();
  hls.levels.forEach((lvl, idx) => {
    const height = Number(lvl.height || 0);
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
  const tracks = shakaPlayer.getVariantTracks() || [];
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
    if (lvl && lvl.height) return formatQualityHeight(lvl.height);
  }
  if (playerState.detectedHeight > 0) {
    return formatQualityHeight(playerState.detectedHeight);
  }
  return '';
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

  let html = '<div class="player-quality-menu-head"><span>Quality Format</span><span>' + (isAuto ? 'ABR On' : 'Manual') + '</span></div>';
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
    if (lvl.height >= 1080) subParts.push('Full HD');
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
      closeQualityMenu();
    });
  });
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

function toggleQualityMenu() {
  const menu = document.getElementById('playerQualityMenu');
  const btn = document.getElementById('playerQualityBtn');
  if (!menu || !btn) return;
  const next = !menu.classList.contains('open');
  if (next) closeAspectMenu();
  menu.classList.toggle('open', next);
  btn.setAttribute('aria-expanded', next ? 'true' : 'false');
}

function closeQualityMenu() {
  const menu = document.getElementById('playerQualityMenu');
  const btn = document.getElementById('playerQualityBtn');
  if (menu) menu.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
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
      closeAspectMenu();
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

function toggleAspectMenu() {
  const menu = document.getElementById('playerAspectMenu');
  const btn = document.getElementById('playerAspectBtn');
  if (!menu || !btn) return;
  const next = !menu.classList.contains('open');
  if (next) closeQualityMenu();
  menu.classList.toggle('open', next);
  btn.setAttribute('aria-expanded', next ? 'true' : 'false');
}

function closeAspectMenu() {
  const menu = document.getElementById('playerAspectMenu');
  const btn = document.getElementById('playerAspectBtn');
  if (menu) menu.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
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
}

function setPlayerLoading(active, msg) {
  const el = document.getElementById('playerLoadingOverlay');
  const txt = document.getElementById('playerLoadingText');
  if (!el) return;
  if (msg && txt) txt.textContent = msg;
  el.classList.toggle('active', !!active);
  if (active) revealPlayerControls();
  else scheduleHidePlayerControls(2600);
}

function setPlayerError(active, msg) {
  const el = document.getElementById('playerErrorOverlay');
  const txt = document.getElementById('playerErrorText');
  if (!el) return;
  if (msg && txt) txt.textContent = msg;
  el.classList.toggle('active', !!active);
  if (active) revealPlayerControls();
  else scheduleHidePlayerControls(2600);
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

async function loadStreamUrl(rawUrl) {
  const video = document.getElementById('playerVideo');
  if (!video || !rawUrl) return;

  const token = ++playerState.loadToken;
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
  setPlayerLoading(true, 'Connecting to stream...');

  await destroyPlayerEngines();
  if (token !== playerState.loadToken) return;

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
      if (playerState.streamIndex + 1 < playerState.streams.length) {
        switchBackupStream(true);
        return;
      }
      await destroyPlayerEngines();
      setPlayerLoading(false);
      setPlayerError(true, errMsg || 'Under maintenance. Try later.');
      updatePlayerQualityUI();
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

          let mimeOverride = null;
          if (detectedFormat === 'dash' && !/\.mpd(\?|$)/i.test(url)) mimeOverride = 'application/dash+xml';
          else if (detectedFormat === 'mss' && !/\.ism/i.test(url)) mimeOverride = 'application/vnd.ms-sstr+xml';
          await shakaPlayer.load(activeUrl, null, mimeOverride);
          if (token !== playerState.loadToken) return;

          playerState.qualityLevels = extractShakaQualityLevels(shakaPlayer);
          applyQualityPreference(playerState.qualityPref, -1, false);
          setPlayerLoading(false);
          video.play().catch(() => {});
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
          capLevelToPlayerSize: true,
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
          video.play().catch(() => {});
          updatePlayerPlaybackUI();
        });
        hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
          if (token !== playerState.loadToken) return;
          if (data && typeof data.level === 'number') {
            playerState.activeQualityLevel = data.level;
            updatePlayerQualityUI();
          }
        });
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (token !== playerState.loadToken || !data || !data.fatal) return;
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
          const playRes = mp.play();
          if (playRes && typeof playRes.catch === 'function') playRes.catch(() => {});
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
      video.play().catch(() => {});
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
  loadStreamUrl(playerState.streams[playerState.streamIndex]);
  if (!silent) {
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

function renderPlayerRandomChannels(currentChannel) {
  const shell = document.getElementById('playerShell');
  const rowEl = document.getElementById('playerRandomRow');
  if (!shell || !rowEl) return;

  const source = Array.isArray(liveChannels) ? liveChannels : [];
  const currentKey = currentChannel ? getChannelKey(currentChannel) : '';
  const currentNameLow = String((currentChannel && currentChannel.name) || '').trim().toLowerCase();

  const pool = source.filter((ch) => {
    if (!ch) return false;
    if (!matureUnlocked && isMatureChannel(ch)) return false;
    const rawLink = ch.link || ch.link2 || '';
    if (!/^https?:\/\//i.test(String(rawLink).trim())) return false;
    if (currentKey && getChannelKey(ch) === currentKey) return false;
    const chNameLow = String(ch.name || '').trim().toLowerCase();
    if (currentNameLow && chNameLow && chNameLow === currentNameLow) return false;
    return true;
  });

  if (pool.length === 0) {
    shell.classList.remove('has-random-channels');
    rowEl.innerHTML = '';
    return;
  }

  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  const picks = shuffled.slice(0, 12);
  const fallbackSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';

  rowEl.innerHTML = picks.map((ch, idx) => {
    const safeName = escapeHtml(ch.name || 'Channel');
    const safeCat = escapeHtml(ch.category ? formatCategoryLabel(ch.category) : 'Live TV');
    const imgHtml = ch.img
      ? `<img src="${escapeHtml(ch.img)}" alt="${safeName}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
      : '';
    return `
      <button type="button" class="player-random-card" role="listitem" data-randidx="${idx}" aria-label="Watch ${safeName}">
        <div class="player-random-thumb">
          ${fallbackSvg}
          ${imgHtml}
          <div class="player-random-thumb-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
        </div>
        <div class="player-random-info">
          <div class="player-random-name">${safeName}</div>
          <div class="player-random-cat">${safeCat}</div>
        </div>
      </button>`;
  }).join('');

  rowEl.scrollLeft = 0;
  shell.classList.add('has-random-channels');

  rowEl.querySelectorAll('.player-random-card').forEach((card) => {
    card.addEventListener('click', async () => {
      const idx = parseInt(card.dataset.randidx, 10);
      const ch = picks[idx];
      if (!ch) return;
      if (isMatureChannel(ch) && !matureUnlocked) {
        showPinModal(async (granted) => {
          if (granted) await playLiveChannel(ch);
        });
        return;
      }
      await playLiveChannel(ch);
    });
  });
}

function openVideoPlayer(channel) {
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

  playerState.channel = resolvedChannel;
  playerState.streams = streams;
  playerState.streamIndex = 0;
  playerState.open = true;

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
    if (channel.img) {
      thumbEl.innerHTML = '<img src="' + escapeHtml(channel.img) + '" alt="' + escapeHtml(chName) + '" onerror="this.remove()">';
    } else {
      thumbEl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>';
    }
  }
  if (switchBtn && switchLabel) {
    switchBtn.style.display = streams.length > 1 ? '' : 'none';
    switchLabel.textContent = 'Stream 1';
  }

  // Open in Theater mode (or preserve mini-PiP if user explicitly keeps mini-PiP, expanding on new pick)
  exitMiniPip(true);
  applyAspectMode(playerState.aspectMode, false);
  renderPlayerRandomChannels(resolvedChannel);
  shell.classList.add('open');
  shell.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('active');
  revealPlayerControls(3000);

  loadStreamUrl(streams[0]);
  updatePlayerPlaybackUI();
}

function enterMiniPip(silent) {
  const shell = document.getElementById('playerShell');
  const backdrop = document.getElementById('playerBackdrop');
  if (!shell || !playerState.open) return;

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
  playerState.chromeHover = false;
  if (playerState.chromeTimer) {
    clearTimeout(playerState.chromeTimer);
    playerState.chromeTimer = null;
  }
  playerState.channel = null;
  playerState.streams = [];
  playerState.privateStream = false;

  if (shell) {
    shell.classList.remove('open', 'pip', 'custom-pos', 'controls-visible', 'controls-hidden', 'dragging', 'has-random-channels');
    shell.style.left = '';
    shell.style.top = '';
    shell.setAttribute('aria-hidden', 'true');
  }
  const randomRow = document.getElementById('playerRandomRow');
  if (randomRow) randomRow.innerHTML = '';
  if (backdrop) backdrop.classList.remove('active');
  setPlayerLoading(false);
  setPlayerError(false);
}

function isPortraitMobileViewport() {
  if (window.innerHeight <= window.innerWidth) return false;
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  return Boolean(coarse || navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
}

function syncLandscapeFullscreenLayout() {
  const shell = document.getElementById('playerShell');
  if (!shell) return;
  const active = Boolean(playerState.cssFullscreen && playerState.open && !playerState.pip);
  shell.classList.toggle('landscape-fullscreen', active);
  document.body.classList.toggle('player-fs-lock', active);
  const nativeActive = Boolean(getFullscreenElement());
  const shouldRotate = active && !nativeActive && isPortraitMobileViewport();
  shell.classList.toggle('force-landscape', shouldRotate);
}

async function tryLockLandscape() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      await screen.orientation.lock('landscape');
      return true;
    }
    const legacyLock = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
    if (typeof legacyLock === 'function') {
      return Boolean(legacyLock.call(screen, 'landscape'));
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
  playerState.cssFullscreen = false;
  playerState.keepingCssFsOnNativeExit = false;
  syncLandscapeFullscreenLayout();
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
  playerState.cssFullscreen = true;
  syncLandscapeFullscreenLayout();
  updatePlayerPlaybackUI();
  revealPlayerControls(2600);

  let nativeEntered = false;
  try {
    await requestElementFullscreen(shell);
    nativeEntered = Boolean(getFullscreenElement());
  } catch (e) {
    nativeEntered = false;
  }

  const locked = await tryLockLandscape();
  syncLandscapeFullscreenLayout();
  updatePlayerPlaybackUI();

  if (nativeEntered && !locked) {
    playerState.landscapeFallbackTimer = setTimeout(async () => {
      playerState.landscapeFallbackTimer = null;
      if (!playerState.cssFullscreen || !playerState.open || playerState.pip) return;
      if (getFullscreenElement() === shell && isPortraitMobileViewport()) {
        playerState.keepingCssFsOnNativeExit = true;
        await exitDocumentFullscreen();
        playerState.keepingCssFsOnNativeExit = false;
        syncLandscapeFullscreenLayout();
        updatePlayerPlaybackUI();
        revealPlayerControls(2600);
      }
    }, 240);
  }
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
  const video = document.getElementById('playerVideo');
  const backdrop = document.getElementById('playerBackdrop');
  const shell = document.getElementById('playerShell');
  if (!video || !shell) return;

  function togglePlay() {
    if (!playerState.open) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    revealPipControlsTemporarily();
  }

  function toggleMute() {
    if (!playerState.open) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.8;
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
    video.volume = val;
    video.muted = val === 0;
    updatePlayerPlaybackUI();
  });

  document.getElementById('playerAspectBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAspectMenu();
  });

  document.getElementById('playerQualityBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQualityMenu();
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

  document.getElementById('playerFullscreenBtn')?.addEventListener('click', toggleFullscreen);
  document.getElementById('playerStreamSwitchBtn')?.addEventListener('click', () => switchBackupStream(false));

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
      loadStreamUrl(playerState.streams[playerState.streamIndex]);
    }
  });
  document.getElementById('playerRandomShuffleBtn')?.addEventListener('click', () => {
    if (!playerState.open) return;
    renderPlayerRandomChannels(playerState.channel);
  });

  video.addEventListener('play', () => {
    updatePlayerPlaybackUI();
    scheduleHidePlayerControls(2600);
  });
  video.addEventListener('pause', () => {
    updatePlayerPlaybackUI();
    revealPlayerControls();
  });
  video.addEventListener('volumechange', updatePlayerPlaybackUI);
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
    if (playerState.open) setPlayerLoading(true, 'Buffering...');
  });
  video.addEventListener('playing', () => {
    setPlayerLoading(false);
    setPlayerError(false);
    updatePlayerPlaybackUI();
    scheduleHidePlayerControls(2600);
  });
  video.addEventListener('canplay', () => {
    setPlayerLoading(false);
    updatePlayerPlaybackUI();
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
    if (playerState.streamIndex + 1 < playerState.streams.length) {
      switchBackupStream(true);
      return;
    }
    setPlayerLoading(false);
    setPlayerError(true, 'Under maintenance. Try later.');
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
  const headerEl = shell.querySelector('.player-header');
  const controlsEl = shell.querySelector('.player-controls');
  let lastTouchAt = 0;
  let lastRevealFromHiddenAt = 0;
  let lastStageTouchToggleAt = 0;
  let stageTouchStart = null;

  function isTouchSyntheticMouse(e) {
    if (Date.now() - lastTouchAt < 800) return true;
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

  shell.addEventListener('mousemove', (e) => {
    if (isTouchSyntheticMouse(e)) return;
    if (playerState.open && !playerState.pip) {
      triggerRevealControls(3000);
    }
  });
  shell.addEventListener('mouseleave', (e) => {
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

  if (stageEl) {
    stageEl.addEventListener('touchstart', (e) => {
      if (!playerState.open || playerState.pip) return;
      if (!e.touches || e.touches.length !== 1) { stageTouchStart = null; return; }
      if (e.target && e.target.closest('.player-status-overlay, .pip-overlay, button, input')) {
        stageTouchStart = null;
        return;
      }
      stageTouchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now()
      };
    }, { passive: true });

    stageEl.addEventListener('touchend', (e) => {
      if (!playerState.open || playerState.pip || !stageTouchStart) return;
      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      const start = stageTouchStart;
      stageTouchStart = null;
      if (!touch) return;
      if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 14) return;
      if (Date.now() - start.t > 500) return;
      if (isPlayerMenuOpen()) return;

      lastStageTouchToggleAt = Date.now();
      if (shell.classList.contains('controls-hidden')) {
        triggerRevealControls(3500);
      } else {
        hidePlayerControls(true);
      }
    }, { passive: true });

    stageEl.addEventListener('click', (e) => {
      if (!playerState.open || playerState.pip) return;
      if (Date.now() - lastStageTouchToggleAt < 600) return;
      if (e.target && e.target.closest('.player-status-overlay, .pip-overlay, button, input')) return;
      if (isPlayerMenuOpen()) return;
      if (shell.classList.contains('controls-hidden')) {
        triggerRevealControls(3000);
      } else if (Date.now() - lastRevealFromHiddenAt < 350) {
        triggerRevealControls(3000);
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
      if (!playerState.pip) revealPlayerControls(2600);
      updatePlayerPlaybackUI();
    } else if (playerState.keepingCssFsOnNativeExit) {
      syncLandscapeFullscreenLayout();
      updatePlayerPlaybackUI();
    } else if (playerState.cssFullscreen) {
      exitPlayerFullscreen();
    } else {
      tryUnlockOrientation();
      updatePlayerPlaybackUI();
    }
  }

  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((evName) => {
    document.addEventListener(evName, handleFullscreenChange);
  });

  window.addEventListener('resize', () => {
    if (playerState.cssFullscreen) {
      syncLandscapeFullscreenLayout();
    }
  });
  window.addEventListener('orientationchange', () => {
    if (playerState.cssFullscreen) {
      setTimeout(syncLandscapeFullscreenLayout, 120);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!playerState.open) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!playerState.pip) revealPlayerControls(3000);

    if (e.key === 'Escape') {
      const aMenu = document.getElementById('playerAspectMenu');
      if (aMenu && aMenu.classList.contains('open')) {
        e.preventDefault();
        closeAspectMenu();
        return;
      }
      const qMenu = document.getElementById('playerQualityMenu');
      if (qMenu && qMenu.classList.contains('open')) {
        e.preventDefault();
        closeQualityMenu();
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
    } else if (e.key === ' ' || e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key.toLowerCase() === 'p') {
      e.preventDefault();
      if (playerState.pip) exitMiniPip();
      else enterMiniPip(false);
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'z') {
      e.preventDefault();
      cycleAspectMode();
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
