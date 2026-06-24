const API = 'https://api.bobtvafrica.site';
const PER_PAGE = 18;
const STORAGE_KEYS = {
  WATCHLIST: 'bobtv_watchlist',
  CONTINUE: 'bobtv_continue',
  SETTINGS: 'bobtv_settings'
};

let activeTab = 'movies';
let currentPage = 1;
let lastPage = 1;
let currentData = [];
let currentItem = null;
let searchQuery = '';
let hlsInstance = null;
let tvDetailData = null;
let popularData = [];
let currentView = 'browse';

// ── HERO CAROUSEL STATE ──
let heroCarouselData = [];
let heroCurrentIndex = 0;
let heroAutoPlayInterval = null;
let heroIsHovering = false;
let heroProgressInterval = null;
let heroProgressStartTime = 0;
const HERO_AUTOPLAY_DELAY = 8000; // 8 seconds per slide (Netflix style)
const HERO_KB_VARIANTS = ['zoom-out', 'pan-right', 'pan-left', 'zoom-out', 'pan-right'];

// ── INFINITE SCROLL STATE ──
let isLoadingMore = false;
let hasMorePages = true;
let infiniteScrollObserver = null;
let allLoadedData = []; // Accumulates all items across pages

// Player state
let currentSources = [];
let currentSubtitles = [];
let currentQuality = null;
let playerControlsVisible = true;
let controlsHideTimer = null;
let isDraggingProgress = false;
let wasPlayingBeforeDrag = false;
let currentPlaybackSpeed = 1;
let subtitlesEnabled = true;
let currentSubtitleTracks = [];
let selectedSubtitleUrl = null;
let nextEpisodeData = null;
let prevEpisodeData = null;
let nextEpisodeTimer = null;
let lastVolume = 1;
let isMuted = false;
let currentPlayingItem = null;
let currentSubtitlePosition = 'bottom';
const SUBTITLE_POSITIONS = [
  { id: 'bottom', label: 'Bottom', desc: 'Default position above controls', icon: 'bottom' },
  { id: 'top', label: 'Top', desc: 'Below the title bar', icon: 'top' },
  { id: 'middle', label: 'Middle', desc: 'Centered on screen', icon: 'middle' },
  { id: 'lower-third', label: 'Lower Third', desc: 'Broadcast-style placement', icon: 'lower-third' },
  { id: 'very-bottom', label: 'Very Bottom', desc: 'Flush with bottom edge', icon: 'very-bottom' }
];

let progressSaveInterval = null;

// ── WATCHLIST & CONTINUE WATCHING SYSTEM ──

function getWatchlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]'); }
  catch(e) { return []; }
}

function saveWatchlist(list) {
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
  updateWatchlistBadge();
}

function isInWatchlist(item) {
  const list = getWatchlist();
  return list.some(w => w.id === item.id && w.type === (item.first_air_date ? 'tv' : 'movie'));
}

function toggleWatchlist(item, btnEl) {
  const list = getWatchlist();
  const type = item.first_air_date ? 'tv' : 'movie';
  const idx = list.findIndex(w => w.id === item.id && w.type === type);

  if (idx >= 0) {
    list.splice(idx, 1);
    showToast('Removed from Watchlist', `"${item.title || item.name}" has been removed.`, 'info');
  } else {
    list.unshift({
      id: item.id,
      tmdb_id: item.tmdb_id,
      type: type,
      title: item.title || item.name,
      poster_url: item.poster_url,
      backdrop_url: item.backdrop_url,
      vote_average: item.vote_average,
      genres: item.genres || [],
      release_date: item.release_date || item.first_air_date,
      runtime: item.runtime,
      number_of_episodes: item.number_of_episodes,
      number_of_seasons: item.number_of_seasons,
      overview: item.overview,
      addedAt: Date.now()
    });
    showToast('Added to Watchlist', `"${item.title || item.name}" has been added.`, 'success');
  }

  saveWatchlist(list);

  // Update all matching buttons
  if (btnEl) {
    const isActive = idx < 0; // was added
    btnEl.classList.toggle('active', isActive);
    const textSpan = btnEl.querySelector('span');
    if (textSpan) textSpan.textContent = isActive ? 'In Watchlist' : 'Add to Watchlist';
  }

  // Update hero button if applicable
  updateHeroWatchlistBtn();

  // Refresh grid buttons
  refreshGridWatchlistButtons();

  // If on watchlist view, refresh
  if (currentView === 'watchlist') {
    renderWatchlistView();
  }
}

function updateWatchlistBadge() {
  const list = getWatchlist();
  const badge = document.getElementById('watchlistBadge');
  if (badge) {
    badge.textContent = list.length;
    badge.style.display = list.length > 0 ? 'inline-block' : 'none';
  }
}

function getContinueWatching() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE) || '[]'); }
  catch(e) { return []; }
}

function saveContinueWatching(list) {
  // Keep max 50 items, sorted by most recently watched
  list = list.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.CONTINUE, JSON.stringify(list));
  updateContinueBadge();
}

function updateContinueWatching(item, currentTime, duration, season, episode, episodeName) {
  const list = getContinueWatching();
  const type = item.first_air_date ? 'tv' : 'movie';
  const key = type === 'tv' ? `${item.id}_S${season}E${episode}` : String(item.id);

  const existingIdx = list.findIndex(c => c.key === key);
  const entry = {
    key: key,
    id: item.id,
    tmdb_id: item.tmdb_id,
    type: type,
    title: item.title || item.name,
    poster_url: item.poster_url,
    backdrop_url: item.backdrop_url,
    vote_average: item.vote_average,
    genres: item.genres || [],
    release_date: item.release_date || item.first_air_date,
    currentTime: currentTime,
    duration: duration,
    progress: duration > 0 ? (currentTime / duration) : 0,
    season: season,
    episode: episode,
    episodeName: episodeName,
    updatedAt: Date.now()
  };

  if (existingIdx >= 0) {
    list[existingIdx] = entry;
  } else {
    list.unshift(entry);
  }

  saveContinueWatching(list);
}

function removeFromContinue(key) {
  const list = getContinueWatching();
  const idx = list.findIndex(c => c.key === key);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveContinueWatching(list);
  }
}

function updateContinueBadge() {
  const list = getContinueWatching();
  const badge = document.getElementById('continueBadge');
  if (badge) {
    badge.textContent = list.length;
    badge.style.display = list.length > 0 ? 'inline-block' : 'none';
  }
}

function updateHeroWatchlistBtn() {
  const btn = document.getElementById('heroWatchlistBtn');
  const text = document.getElementById('heroWatchlistText');
  if (!btn || !currentItem) return;
  const inList = isInWatchlist(currentItem);
  btn.classList.toggle('active', inList);
  if (text) text.textContent = inList ? 'In Watchlist' : 'Add to Watchlist';
}

function refreshGridWatchlistButtons() {
  document.querySelectorAll('.card-watchlist-btn, .slider-watchlist-btn').forEach(btn => {
    const idx = parseInt(btn.dataset.idx);
    const isSlider = btn.classList.contains('slider-watchlist-btn');
    const dataArr = isSlider ? popularData : currentData;
    const item = dataArr[idx];
    if (item) {
      btn.classList.toggle('active', isInWatchlist(item));
    }
  });
}

// ── TOAST SYSTEM ──
function showToast(title, message, type = 'info') {
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
    if (toast.parentNode) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ── DOM REFS ──
const grid = document.getElementById('grid');
const heroTitle = document.getElementById('heroTitle');
const heroMeta = document.getElementById('heroMeta');
const heroOverview = document.getElementById('heroOverview');
const heroBtn = document.getElementById('heroBtn');
const heroBadge = document.getElementById('heroBadge');
const sectionTitle = document.getElementById('sectionTitle');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const tabGroup = document.getElementById('tabGroup');
const detailsModal = document.getElementById('detailsModal');
const detailsClose = document.getElementById('detailsClose');
const detailsContent = document.getElementById('detailsContent');
const playerModal = document.getElementById('playerModal');

const continueTrack = document.getElementById('continueTrack');
const continueWatchingSection = document.getElementById('continueWatchingSection');
const continuePrev = document.getElementById('continuePrev');
const continueNext = document.getElementById('continueNext');
const heroWatchlistBtn = document.getElementById('heroWatchlistBtn');
const heroCarousel = document.getElementById('heroCarousel');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuBtn = document.getElementById('menuBtn');
const sidebarClose = document.getElementById('sidebarClose');
const paginationControls = document.getElementById('paginationControls');
const heroSection = document.getElementById('heroCarousel');

/* ── PLAYER DOM REFS ── */
const playerTopBar = document.getElementById('playerTopBar');
const playerBackBtn = document.getElementById('playerBackBtn');
const playerTopTitle = document.getElementById('playerTopTitle');
const playerTopSubtitle = document.getElementById('playerTopSubtitle');
const playerVideoArea = document.getElementById('playerVideoArea');
const playerVideoWrapper = document.getElementById('playerVideoWrapper');
let playerVideo = document.getElementById('playerVideo');
const playerCenterOverlay = document.getElementById('playerCenterOverlay');
const playerCenterBtn = document.getElementById('playerCenterBtn');
const centerPlayIcon = document.getElementById('centerPlayIcon');
const centerPauseIcon = document.getElementById('centerPauseIcon');
const playerLoading = document.getElementById('playerLoading');
const playerLoadingText = document.getElementById('playerLoadingText');
const playerBufferRing = document.getElementById('playerBufferRing');
const playerErrorOverlay = document.getElementById('playerErrorOverlay');
const playerErrorMsg = document.getElementById('playerErrorMsg');
const playerErrorRetry = document.getElementById('playerErrorRetry');
const playerControlsBar = document.getElementById('playerControlsBar');
const playerProgressArea = document.getElementById('playerProgressArea');
const playerProgressTrack = document.getElementById('playerProgressTrack');
const playerProgressBuffer = document.getElementById('playerProgressBuffer');
const playerProgressFill = document.getElementById('playerProgressFill');
const playerProgressThumb = document.getElementById('playerProgressThumb');
const playerHoverTime = document.getElementById('playerHoverTime');
const playerPlayBtn = document.getElementById('playerPlayBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const playerSkipBackBtn = document.getElementById('playerSkipBackBtn');
const playerSkipForwardBtn = document.getElementById('playerSkipForwardBtn');
const playerVolumeWrap = document.getElementById('playerVolumeWrap');
const playerVolumeBtn = document.getElementById('playerVolumeBtn');
const playerVolumeSlider = document.getElementById('playerVolumeSlider');
const playerVolumeFill = document.getElementById('playerVolumeFill');
const volHighIcon = document.getElementById('volHighIcon');
const volLowIcon = document.getElementById('volLowIcon');
const volMuteIcon = document.getElementById('volMuteIcon');
const playerTimeDisplay = document.getElementById('playerTimeDisplay');
const playerQualityBtn = document.getElementById('playerQualityBtn');
const qualityLabel = document.getElementById('qualityLabel');
const playerQualityDropdown = document.getElementById('playerQualityDropdown');
const playerSpeedBtn = document.getElementById('playerSpeedBtn');
const speedLabel = document.getElementById('speedLabel');
const playerSpeedDropdown = document.getElementById('playerSpeedDropdown');
const playerSubBtn = document.getElementById('playerSubBtn');
const playerSubDropdown = document.getElementById('playerSubDropdown');
const playerSubPosBtn = document.getElementById('playerSubPosBtn');
const playerSubPosDropdown = document.getElementById('playerSubPosDropdown');

const playerFsBtn = document.getElementById('playerFsBtn');
const fsEnterIcon = document.getElementById('fsEnterIcon');
const fsExitIcon = document.getElementById('fsExitIcon');
const playerPrevEpisodeBtn = document.getElementById('playerPrevEpisodeBtn');
const playerNextEpisodeBtn = document.getElementById('playerNextEpisodeBtn');
const nextEpisodeToast = document.getElementById('nextEpisodeToast');
const nextEpisodeTitle = document.getElementById('nextEpisodeTitle');
const nextEpisodePlay = document.getElementById('nextEpisodePlay');
const nextEpisodeCancel = document.getElementById('nextEpisodeCancel');

/* ── SIDEBAR ── */
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}
menuBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.sidebar-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    if (!view) return;

    document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    closeSidebar();
    switchView(view);
  });
});

function switchView(view) {
  currentView = view;

  // Always hide profile section unless we're on profile view
  document.getElementById('profileSection').classList.add('hidden');

  // Reset tab group for browse view
  if (view === 'browse') {
    if (!requireLogin()) return;
    heroSection.classList.remove('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.remove('hidden');
    searchInput.parentElement.classList.remove('hidden');
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    isLoadingMore = false;
    hasMorePages = true;
    allLoadedData = [];
    switchTab(activeTab);
    setupInfiniteScroll();
    return;
  }

  if (view === 'movies') {
    if (!requireLogin()) return;
    heroSection.classList.remove('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.remove('hidden');
    searchInput.parentElement.classList.remove('hidden');
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    isLoadingMore = false;
    hasMorePages = true;
    allLoadedData = [];
    switchTab('movies');
    setupInfiniteScroll();
    return;
  }

  if (view === 'tv') {
    if (!requireLogin()) return;
    heroSection.classList.remove('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.remove('hidden');
    searchInput.parentElement.classList.remove('hidden');
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    isLoadingMore = false;
    hasMorePages = true;
    allLoadedData = [];
    switchTab('tv');
    setupInfiniteScroll();
    return;
  }

  if (view === 'watchlist') {
    heroSection.classList.add('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.add('hidden');
    searchInput.parentElement.classList.add('hidden');
    continueWatchingSection.classList.add('hidden');
    
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    // Disconnect observer for non-paginated views
    if (infiniteScrollObserver) {
      infiniteScrollObserver.disconnect();
      infiniteScrollObserver = null;
    }
    renderWatchlistView();
    return;
  }

  if (view === 'continue') {
    heroSection.classList.add('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.add('hidden');
    searchInput.parentElement.classList.add('hidden');
    continueWatchingSection.classList.add('hidden');
    
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    // Disconnect observer for non-paginated views
    if (infiniteScrollObserver) {
      infiniteScrollObserver.disconnect();
      infiniteScrollObserver = null;
    }
    renderContinueView();
    return;
  }

  if (view === 'livetv') {
    if (!requireLogin()) return;
    heroSection.classList.add('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.add('hidden');
    searchInput.parentElement.classList.add('hidden');
    continueWatchingSection.classList.add('hidden');
    
    document.getElementById('liveTVSection').classList.remove('hidden');
    document.getElementById('mainGridSection').classList.add('hidden');
    sectionTitle.textContent = 'Live TV';
    loadLiveTV();
    updateLiveUnlockButton();
    return;
  }

  if (view === 'kids') {
    if (!requireLogin()) return;
    heroSection.classList.remove('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.remove('hidden');
    searchInput.parentElement.classList.remove('hidden');
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.remove('hidden');
    isLoadingMore = false;
    hasMorePages = true;
    allLoadedData = [];
    switchTab('kids_movies');
    setupInfiniteScroll();
    return;
  }

  if (view === 'profile') {
    heroSection.classList.add('hidden');
    paginationControls.classList.add('hidden');
    tabGroup.classList.add('hidden');
    searchInput.parentElement.classList.add('hidden');
    continueWatchingSection.classList.add('hidden');
    
    document.getElementById('liveTVSection').classList.add('hidden');
    document.getElementById('mainGridSection').classList.add('hidden');
    document.getElementById('profileSection').classList.remove('hidden');
    renderProfileView();
    return;
  }
}

function renderWatchlistView() {
  sectionTitle.textContent = 'My Watchlist';
  const list = getWatchlist();
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
        </div>
        <div class="empty-state-title">Your Watchlist is Empty</div>
        <div class="empty-state-desc">Browse movies and TV shows to add them to your watchlist.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((item, i) => {
    const year = (item.release_date || '').split('-')[0] || 'N/A';
    const isTV = item.type === 'tv';
    const eps = isTV ? `${item.number_of_episodes || '?'} eps` : (item.runtime ? `${item.runtime} min` : '');
    const genres = (item.genres || []).slice(0, 2).map(g => `<span>${g}</span>`).join('');
    return `<div class="card" data-watchidx="${i}">
      <div class="card-poster"><img src="${item.poster_url}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">
        <div class="card-badge">★ ${item.vote_average}</div>
        <div class="card-overlay"><div class="tags">${genres}</div></div>
        <button class="card-watchlist-btn active" data-watchidx="${i}" title="Remove from Watchlist">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
        </button>
      </div>
      <div class="card-info"><div class="card-title">${item.title}</div>
        <div class="card-sub"><span class="card-year">${year}</span><span>${eps}</span></div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.card').forEach(el => {
    const idx = parseInt(el.dataset.watchidx);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.card-watchlist-btn')) return;
      const item = list[idx];
      if (item) {
        // Reconstruct item object for openDetails
        const fullItem = {
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          name: item.title,
          poster_url: item.poster_url,
          backdrop_url: item.backdrop_url,
          vote_average: item.vote_average,
          genres: item.genres,
          release_date: item.release_date,
          first_air_date: item.type === 'tv' ? item.release_date : null,
          runtime: item.runtime,
          number_of_episodes: item.number_of_episodes,
          number_of_seasons: item.number_of_seasons,
          overview: item.overview
        };
        currentItem = fullItem;
        openDetails(fullItem);
      }
    });
  });

  grid.querySelectorAll('.card-watchlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.watchidx);
      const item = list[idx];
      if (item) {
        const fullItem = {
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          name: item.title,
          poster_url: item.poster_url,
          backdrop_url: item.backdrop_url,
          vote_average: item.vote_average,
          genres: item.genres,
          release_date: item.release_date,
          first_air_date: item.type === 'tv' ? item.release_date : null,
          runtime: item.runtime,
          number_of_episodes: item.number_of_episodes,
          number_of_seasons: item.number_of_seasons,
          overview: item.overview
        };
        toggleWatchlist(fullItem, btn);
      }
    });
  });
}

function renderContinueView() {
  sectionTitle.textContent = 'Continue Watching';
  const list = getContinueWatching();
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>
        </div>
        <div class="empty-state-title">Nothing to Continue</div>
        <div class="empty-state-desc">Start watching a movie or episode and it will appear here.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((item, i) => {
    const year = (item.release_date || '').split('-')[0] || 'N/A';
    const isTV = item.type === 'tv';
    const progressPct = Math.round((item.progress || 0) * 100);
    const progressText = isTV 
      ? `S${item.season}E${item.episode} — ${progressPct}%`
      : `${progressPct}% watched`;
    const timeLeft = item.duration > 0 
      ? formatTime(Math.max(0, item.duration - item.currentTime)) + ' left'
      : '';

    return `<div class="card" data-contidx="${i}">
      <div class="card-poster"><img src="${item.poster_url}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">
        <div class="card-badge">★ ${item.vote_average}</div>
        <div class="card-overlay">
          <div class="tags"><span>${progressText}</span></div>
        </div>
        <button class="card-remove-btn" data-contidx="${i}" title="Remove from Continue Watching">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
        </button>
      </div>
      <div class="card-info">
        <div class="card-title">${item.title}${isTV ? ` — S${item.season}E${item.episode}` : ''}</div>
        <div class="card-sub"><span class="card-year">${year}</span><span>${timeLeft}</span></div>
        <div style="width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:6px;overflow:hidden;">
          <div style="width:${progressPct}%;height:100%;background:var(--accent);border-radius:2px;"></div>
        </div>
      </div>
    </div>`;
  }).join('');

  // Click on card body to resume watching
  grid.querySelectorAll('.card').forEach(el => {
    const idx = parseInt(el.dataset.contidx);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.card-remove-btn')) return;
      const item = list[idx];
      if (item) {
        const fullItem = {
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          name: item.title,
          poster_url: item.poster_url,
          backdrop_url: item.backdrop_url,
          vote_average: item.vote_average,
          genres: item.genres,
          release_date: item.release_date,
          first_air_date: item.type === 'tv' ? item.release_date : null,
          number_of_episodes: item.number_of_episodes,
          number_of_seasons: item.number_of_seasons,
          overview: item.overview
        };
        currentItem = fullItem;
        if (item.type === 'tv') {
          // Fetch TV details first to enable prev/next episode navigation
          getTVDetails(item.id).then(detailResp => {
            if (detailResp && !detailResp.error && detailResp.data) {
              tvDetailData = detailResp.data;
              console.log('[EpisodeNav] Continue Watching - TV details loaded');
            }
            playEpisode(item.tmdb_id, item.season, item.episode, item.title, item.episodeName);
            setTimeout(() => {
              if (playerVideo && item.currentTime > 0) {
                playerVideo.currentTime = item.currentTime;
              }
            }, 1500);
          }).catch(() => {
            playEpisode(item.tmdb_id, item.season, item.episode, item.title, item.episodeName);
            setTimeout(() => {
              if (playerVideo && item.currentTime > 0) {
                playerVideo.currentTime = item.currentTime;
              }
            }, 1500);
          });
        } else {
          playMovie(fullItem);
          setTimeout(() => {
            if (playerVideo && item.currentTime > 0) {
              playerVideo.currentTime = item.currentTime;
            }
          }, 1500);
        }
      }
    });
  });

  // Remove button handlers
  grid.querySelectorAll('.card-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.contidx);
      const item = list[idx];
      if (item) {
        removeFromContinue(item.key);
        showToast('Removed', `"${item.title}" removed from Continue Watching.`, 'info');
        renderContinueView();
        updateContinueBadge();
      }
    });
  });
}

function renderContinueWatchingSlider() {
  const list = getContinueWatching();
  if (list.length === 0) {
    continueWatchingSection.classList.add('hidden');
    return;
  }

  continueWatchingSection.classList.remove('hidden');
  continueTrack.innerHTML = list.slice(0, 15).map((item, i) => {
    const year = (item.release_date || '').split('-')[0] || 'N/A';
    const progressPct = Math.round((item.progress || 0) * 100);
    const isTV = item.type === 'tv';
    const subtitle = isTV ? `S${item.season}E${item.episode}` : year;

    return `<div class="slider-card" data-contidx="${i}">
      <div class="slider-card-poster">
        <img src="${item.poster_url}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">
        <div class="slider-card-rating">★ ${item.vote_average}</div>
        <div class="slider-card-progress"><div class="slider-card-progress-fill" style="width:${progressPct}%"></div></div>
      </div>
      <div class="slider-card-info">
        <div class="slider-card-title">${item.title}</div>
        <div class="slider-card-sub"><span>${subtitle}</span><span>${progressPct}%</span></div>
      </div>
    </div>`;
  }).join('');

  continueTrack.querySelectorAll('.slider-card').forEach(el => {
    const idx = parseInt(el.dataset.contidx);
    el.addEventListener('click', () => {
      if (!gateContentAccess()) return;
      const item = list[idx];
      if (item) {
        const fullItem = {
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          name: item.title,
          poster_url: item.poster_url,
          backdrop_url: item.backdrop_url,
          vote_average: item.vote_average,
          genres: item.genres,
          release_date: item.release_date,
          first_air_date: item.type === 'tv' ? item.release_date : null,
          overview: item.overview
        };
        currentItem = fullItem;
        if (item.type === 'tv') {
          // Fetch TV details first to enable prev/next episode navigation
          getTVDetails(item.id).then(detailResp => {
            if (detailResp && !detailResp.error && detailResp.data) {
              tvDetailData = detailResp.data;
            }
            playEpisode(item.tmdb_id, item.season, item.episode, item.title, item.episodeName);
            setTimeout(() => {
              if (playerVideo && item.currentTime > 0) {
                playerVideo.currentTime = item.currentTime;
              }
            }, 1500);
          }).catch(() => {
            playEpisode(item.tmdb_id, item.season, item.episode, item.title, item.episodeName);
            setTimeout(() => {
              if (playerVideo && item.currentTime > 0) {
                playerVideo.currentTime = item.currentTime;
              }
            }, 1500);
          });
        } else {
          playMovie(fullItem);
          setTimeout(() => {
            if (playerVideo && item.currentTime > 0) {
              playerVideo.currentTime = item.currentTime;
            }
          }, 1500);
        }
      }
    });
  });
}


function renderProfileView() {
  if (!currentUser || !currentSubscription) {
    document.getElementById('profileSection').innerHTML = `
      <div class="empty-state" style="padding: 100px 20px;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
        </div>
        <div class="empty-state-title">Not Logged In</div>
        <div class="empty-state-desc">Please log in to view your account details.</div>
      </div>
    `;
    return;
  }

  const sub = currentSubscription;
  const daysLeft = getDaysRemaining(sub);
  const isActive = isSubscriptionValid(sub);
  const initials = (sub.serviceName || sub.subEmail || 'U').charAt(0).toUpperCase();
  const devices = sub.connectedDevices || [];
  const limit = sub.deviceLimit || 1;
  const planName = (sub.subTier || sub.planType || 'Standard');

  // Profile Header
  document.getElementById('netflixAvatar').textContent = initials;
  document.getElementById('netflixProfileName').textContent = sub.serviceName || 'Subscriber';
  document.getElementById('netflixProfileEmail').textContent = sub.subEmail || currentUser.email;

  const planTag = document.getElementById('netflixPlanTag');
  planTag.textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
  planTag.className = 'netflix-tag ' + (isActive ? 'netflix-tag-active' : 'netflix-tag-expired');

  const statusDot = document.getElementById('netflixStatusDot');
  const statusText = document.getElementById('netflixStatusText');
  statusDot.className = 'netflix-status-dot ' + (isActive ? '' : 'inactive');
  statusText.textContent = isActive ? 'Active' : 'Expired';
  statusText.style.color = isActive ? 'var(--success)' : 'var(--accent)';

  // Membership
  document.getElementById('netflixEmail').textContent = sub.subEmail || currentUser.email;
  document.getElementById('netflixPlan').textContent = planName.charAt(0).toUpperCase() + planName.slice(1);

  const statusEl = document.getElementById('netflixStatus');
  statusEl.innerHTML = `<strong>${(sub.status || 'unknown').charAt(0).toUpperCase() + sub.status.slice(1)}</strong>` + 
    (isActive ? '' : ' <span style="color: var(--accent); margin-left: 8px;">Renew to continue watching</span>');

  document.getElementById('netflixExpiry').textContent = sub.expiryDate 
    ? new Date(sub.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'N/A';
  document.getElementById('netflixPrice').textContent = (sub.price ? '$' + sub.price : '-') + (sub.billingCycle ? ' / ' + sub.billingCycle : '');

  // Progress bar
  const totalDays = 30;
  const pct = Math.min(100, Math.max(0, (daysLeft / totalDays) * 100));
  const progressFill = document.getElementById('netflixProgressFill');
  progressFill.style.width = pct + '%';
  progressFill.className = 'netflix-progress-fill ' + (daysLeft <= 3 ? 'red' : daysLeft <= 7 ? 'yellow' : '');
  document.getElementById('netflixProgressText').textContent = daysLeft + (daysLeft === 1 ? ' day' : ' days') + ' left';

  // Current Device
  document.getElementById('netflixCurrentDeviceId').textContent = deviceId;

  // Device count
  document.getElementById('netflixDeviceCount').textContent = `${devices.length} / ${limit} devices`;

  // Device list
  const listEl = document.getElementById('netflixDeviceList');
  if (devices.length === 0) {
    listEl.innerHTML = `
      <div class="netflix-device-item" style="justify-content: center; color: var(--text-tertiary);">
        No devices connected
      </div>
    `;
  } else {
    listEl.innerHTML = devices.map((dev, idx) => {
      const isCurrent = dev === deviceId;
      return `
        <div class="netflix-device-item ${isCurrent ? 'current' : ''}">
          <div class="netflix-device-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg>
          </div>
          <div class="netflix-device-details">
            <div class="netflix-device-name">${dev}</div>
            <div class="netflix-device-meta">${isCurrent ? 'This device — currently active' : 'Other device'}</div>
          </div>
          <span class="netflix-device-status ${isCurrent ? 'current' : 'other'}">${isCurrent ? 'Current' : 'Other'}</span>
          ${!isCurrent ? `<button class="netflix-device-remove" data-device="${dev}">Remove</button>` : ''}
        </div>
      `;
    }).join('');

    // Attach remove handlers
    listEl.querySelectorAll('.netflix-device-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const devToRemove = btn.dataset.device;
        if (!devToRemove || !currentUser) return;

        btn.disabled = true;
        btn.textContent = 'Removing...';

        const result = await removeDeviceFromSubscription(currentUser.email, devToRemove);

        if (result.error) {
          showToast('Error', 'Failed to remove device: ' + result.error, 'error');
          btn.disabled = false;
          btn.textContent = 'Remove';
          return;
        }

        showToast('Device Removed', 'Device has been removed from your account.', 'success');

        // Refresh subscription data and re-render
        const fresh = await getUserSubscription(currentUser.email);
        if (!fresh.error) {
          currentSubscription = fresh.subscription;
        }
        renderProfileView();
      });
    });
  }
}


/* ── API HELPERS ── */
async function apiFetch(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) {
      const body = await r.text();
      let msg;
      try { const j = JSON.parse(body); msg = j.error?.message || j.message || r.statusText; } catch(e) { msg = r.statusText; }
      return { error: msg };
    }
    return await r.json();
  } catch(e) {
    return { error: e.message || 'Network error' };
  }
}

async function fetchMovies(page) { return apiFetch(`${API}/api/content/movies?page=${page}&per_page=${PER_PAGE}`); }
async function fetchTV(page) { return apiFetch(`${API}/api/content/tv-shows?page=${page}&per_page=${PER_PAGE}`); }
async function fetchOnAir() { return apiFetch(`${API}/api/content/tv-shows/on-the-air`); }
async function fetchKidsMovies(page) { return apiFetch(`${API}/api/content/kids/movies?page=${page}&per_page=${PER_PAGE}`); }
async function fetchKidsTV(page) { return apiFetch(`${API}/api/content/kids/tv-shows?page=${page}&per_page=${PER_PAGE}`); }
async function searchMovies(q, page) { return apiFetch(`${API}/api/content/movies/search?page=${page}&per_page=${PER_PAGE}&q=${encodeURIComponent(q)}`); }
async function searchTV(q, page) { return apiFetch(`${API}/api/content/tv-shows/search?page=${page}&per_page=${PER_PAGE}&q=${encodeURIComponent(q)}`); }
async function searchKidsMovies(q, page) { return apiFetch(`${API}/api/content/kids/movies/search?page=${page}&per_page=${PER_PAGE}&q=${encodeURIComponent(q)}`); }
async function searchKidsTV(q, page) { return apiFetch(`${API}/api/content/kids/tv-shows/search?page=${page}&per_page=${PER_PAGE}&q=${encodeURIComponent(q)}`); }
async function getMovieStreams(tmdbId) {
  if (!tmdbId) return { error: 'No TMDB ID' };
  return apiFetch(`${API}/v1/movies/${tmdbId}`);
}
async function getTVDetails(internalId) {
  if (!internalId) return { error: 'No internal ID' };
  return apiFetch(`${API}/api/content/tv-shows/${internalId}`);
}
async function getTVEpisodeStream(tmdbId, season, episode) {
  if (!tmdbId) return { error: 'No TMDB ID' };
  return apiFetch(`${API}/v1/tv/${tmdbId}/seasons/${season}/episodes/${episode}`);
}

/* ── SUBTITLE FETCHING ── */
const SUBTITLE_API = 'https://sub.wyzie.io';
// Get your free API key at: https://store.wyzie.io/redeem
// Free tier: 1,000 requests/day
function getSubtitleApiKey() {
  return 'wyzie-o0wr2smjtn4fvuhu8o5tt2qc04f6pban';
}

async function fetchSubtitles(tmdbId, season, episode) {
  if (!tmdbId) return { error: 'No TMDB ID' };
  try {
    let url = `${SUBTITLE_API}/search?id=${tmdbId}`;
    if (season !== undefined && episode !== undefined) {
      url += `&season=${season}&episode=${episode}`;
    }
    // Add API key if available
    const apiKey = getSubtitleApiKey();
    if (apiKey) {
      url += `&key=${encodeURIComponent(apiKey)}`;
    }
    console.log('[Subtitles] Fetching:', url.replace(apiKey, '***'));
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error('[Subtitles] HTTP error:', resp.status, text.substring(0, 200));
      return { error: `HTTP ${resp.status}: ${text.substring(0, 100)}` };
    }
    const data = await resp.json();
    console.log('[Subtitles] Response:', data);
    // Handle different response formats
    if (Array.isArray(data)) {
      return { subtitles: data };
    } else if (data && data.results) {
      return { subtitles: data.results };
    } else if (data && data.subtitles) {
      return { subtitles: data.subtitles };
    } else {
      return { subtitles: data };
    }
  } catch(e) {
    console.error('[Subtitles] Error:', e.message);
    return { error: e.message };
  }
}

async function fetchSubtitleContent(subUrl) {
  try {
    // Try direct fetch first
    let resp = await fetch(subUrl);
    if (!resp.ok) {
      // Try with CORS proxy if direct fetch fails
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(subUrl)}`;
      resp = await fetch(proxyUrl);
      if (!resp.ok) {
        // Try another CORS proxy as fallback
        const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(subUrl)}`;
        resp = await fetch(proxyUrl2);
        if (!resp.ok) return { error: `HTTP ${resp.status}` };
      }
    }
    const text = await resp.text();
    return { content: text };
  } catch(e) {
    return { error: e.message };
  }
}

/* ===== SRT to WebVTT Converter ===== */
function srtToWebVTT(srtContent) {
  if (!srtContent) return '';

  // Check if already WebVTT
  if (srtContent.trim().startsWith('WEBVTT')) {
    return srtContent;
  }

  // Parse SRT format and convert to WebVTT
  // SRT format: cue number, timing line, text lines, blank line
  const lines = srtContent.split(/\r?\n/);
  let vtt = 'WEBVTT\n\n';
  let i = 0;

  while (i < lines.length) {
    // Skip empty lines
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    // Try to parse cue number (optional in some SRT files)
    const cueNum = parseInt(lines[i].trim());
    if (!isNaN(cueNum) && lines[i].trim() === String(cueNum)) {
      i++;
    }

    // Check if we have a timing line
    if (i < lines.length && lines[i].includes('-->')) {
      // Convert SRT timing to WebVTT timing
      let timingLine = lines[i].trim();

      // Replace comma with dot in timestamps (SRT -> WebVTT)
      timingLine = timingLine.replace(/,(\d{3})/g, '.$1');

      vtt += timingLine + '\n';
      i++;

      // Collect cue text until blank line or end
      const cueText = [];
      while (i < lines.length && lines[i].trim()) {
        cueText.push(lines[i].trim());
        i++;
      }

      if (cueText.length > 0) {
        vtt += cueText.join('\n') + '\n\n';
      }
    } else {
      // Not a timing line, skip
      i++;
    }
  }

  return vtt;
}
function createSubtitleBlobUrl(content, format) {
  let vttContent = content;

  // Convert SRT to WebVTT if needed
  if (format === 'srt' || format === 'SRT' || !content.trim().startsWith('WEBVTT')) {
    vttContent = srtToWebVTT(content);
  }

  // Create Blob URL (bypasses CORS issues)
  const blob = new Blob([vttContent], { type: 'text/vtt' });
  return URL.createObjectURL(blob);
}

function isTVTab() { return activeTab === 'tv' || activeTab === 'kids_tv'; }
function yearStr(item) { return (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A'; }

function showSkeletons() {
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++)
    grid.innerHTML += `<div class="skeleton"><div class="skeleton-img"></div><div class="skeleton-text"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>`;
}

/* ── HERO CAROUSEL FUNCTIONS ── */

function initHeroCarousel() {
    const carousel = document.getElementById('heroCarousel');
    if (!carousel) return;

    // Pause on hover (Netflix behavior: pause auto-advance on hover)
    carousel.addEventListener('mouseenter', () => {
        heroIsHovering = true;
        stopHeroAutoPlay();
        pauseHeroProgress();
    });

    carousel.addEventListener('mouseleave', () => {
        heroIsHovering = false;
        resumeHeroProgress();
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopHeroAutoPlay();
            pauseHeroProgress();
        } else if (!heroIsHovering) {
            resumeHeroProgress();
        }
    });

    // Nav buttons
    document.getElementById('heroPrevBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        heroPrevSlide();
    });

    document.getElementById('heroNextBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        heroNextSlide();
    });

    // Progress bar clicks for direct navigation
    const progressContainer = document.getElementById('heroCarouselProgress');
    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('hero-progress-bar')) {
                const bars = Array.from(progressContainer.querySelectorAll('.hero-progress-bar'));
                const idx = bars.indexOf(e.target);
                if (idx !== -1) {
                    heroGoToSlide(idx);
                }
            }
        });
    }
}

function renderHeroCarousel(data) {
    const track = document.getElementById('heroCarouselTrack');
    const dotsContainer = document.getElementById('heroCarouselDots');
    const progressContainer = document.getElementById('heroCarouselProgress');

    if (!track || !data || data.length === 0) return;

    heroCarouselData = data.slice(0, 5); // Max 5 featured items
    heroCurrentIndex = 0;

    // Build slides with Ken Burns variants
    track.innerHTML = heroCarouselData.map((item, i) => {
        const kbVariant = HERO_KB_VARIANTS[i % HERO_KB_VARIANTS.length];
        return `<div class="hero-carousel-slide ${i === 0 ? 'active' : ''}" data-hero-index="${i}" data-kb="${kbVariant}">
            <div class="hero-img" style="background-image: url('${item.backdrop_url}')"></div>
        </div>`;
    }).join('');

    // Build Netflix-style progress bars
    if (progressContainer) {
        progressContainer.innerHTML = heroCarouselData.map((_, i) => 
            `<div class="hero-progress-bar ${i === 0 ? 'active' : ''}" data-progress-index="${i}">
                <div class="hero-progress-fill"></div>
            </div>`
        ).join('');
    }

    // Build dots (mobile fallback)
    if (dotsContainer) {
        dotsContainer.innerHTML = heroCarouselData.map((_, i) => 
            `<button class="hero-carousel-dot ${i === 0 ? 'active' : ''}" data-hero-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`
        ).join('');

        // Dot click handlers
        dotsContainer.querySelectorAll('.hero-carousel-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(dot.dataset.heroDot);
                heroGoToSlide(index);
            });
        });
    }

    // Update content for first slide
    updateHeroContent(0);

    // Start auto-play with progress
    startHeroAutoPlay();
}

function updateHeroContent(index) {
    const item = heroCarouselData[index];
    if (!item) return;

    // Restart CSS animations by removing and re-adding content
    const content = document.getElementById('heroContent');
    if (content) {
        content.style.animation = 'none';
        content.offsetHeight; // trigger reflow
    }

    const genres = (item.genres || []).slice(0, 3).join(' · ');
    const year = yearStr(item);
    const eps = item.number_of_episodes ? `${item.number_of_episodes} eps` : (item.runtime ? `${item.runtime} min` : '');
    const isTV = !!item.first_air_date;

    // Netflix-style meta with match score
    const matchScore = Math.round((item.vote_average / 10) * 95 + 5); // Convert to 0-100 match
    const metaHTML = `
        <span class="meta-match">${matchScore}% Match</span>
        <span class="meta-separator"></span>
        <span>${year}</span>
        ${eps ? `<span class="meta-separator"></span><span>${eps}</span>` : ''}
        <span class="meta-separator"></span>
        <span class="hero-rating">★ ${item.vote_average}</span>
        ${genres ? `<span class="meta-separator"></span><span>${genres}</span>` : ''}
    `;

    if (heroTitle) heroTitle.textContent = item.title || item.name;
    if (heroMeta) heroMeta.innerHTML = metaHTML;
    if (heroOverview) heroOverview.textContent = item.overview || 'No overview available.';
    if (heroBadge) heroBadge.textContent = isTV ? (item.status || 'TV Series') : 'Now Streaming';

    // Update rank display (optional, for top 10 style)
    const rankEl = document.getElementById('heroRank');
    if (rankEl) {
        if (index < 3) {
            rankEl.textContent = String(index + 1);
            rankEl.style.display = 'block';
        } else {
            rankEl.style.display = 'none';
        }
    }

    // Update currentItem for watchlist functionality
    currentItem = item;

    // Update hero button
    if (heroBtn) {
        heroBtn.disabled = false;
        heroBtn.onclick = () => { 
            if (!gateContentAccess()) return; 
            if (currentItem) openDetails(currentItem); 
        };
    }

    updateHeroWatchlistBtn();
}

function heroGoToSlide(index) {
    if (index < 0 || index >= heroCarouselData.length) return;

    const dots = document.querySelectorAll('.hero-carousel-dot');
    const slides = document.querySelectorAll('.hero-carousel-slide');
    const progressBars = document.querySelectorAll('.hero-progress-bar');

    heroCurrentIndex = index;

    // Update slides (crossfade)
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update progress bars
    progressBars.forEach((bar, i) => {
        bar.classList.remove('active', 'completed');
        if (i < index) {
            bar.classList.add('completed');
        } else if (i === index) {
            bar.classList.add('active');
        }
    });

    // Update content
    updateHeroContent(index);

    // Reset auto-play timer
    if (!heroIsHovering) {
        stopHeroAutoPlay();
        startHeroAutoPlay();
    }
}

function heroNextSlide() {
    const nextIndex = (heroCurrentIndex + 1) % heroCarouselData.length;
    heroGoToSlide(nextIndex);
}

function heroPrevSlide() {
    const prevIndex = (heroCurrentIndex - 1 + heroCarouselData.length) % heroCarouselData.length;
    heroGoToSlide(prevIndex);
}

function startHeroAutoPlay() {
    stopHeroAutoPlay();
    if (heroCarouselData.length > 1) {
        heroProgressStartTime = Date.now();

        // Animate the current progress bar
        const progressBars = document.querySelectorAll('.hero-progress-bar');
        const activeBar = progressBars[heroCurrentIndex];
        if (activeBar) {
            activeBar.classList.add('active');
            const fill = activeBar.querySelector('.hero-progress-fill');
            if (fill) {
                fill.style.animation = 'none';
                fill.offsetHeight; // trigger reflow
                fill.style.animation = `progressFill ${HERO_AUTOPLAY_DELAY}ms linear forwards`;
            }
        }

        heroAutoPlayInterval = setInterval(() => {
            heroNextSlide();
        }, HERO_AUTOPLAY_DELAY);
    }
}

function stopHeroAutoPlay() {
    if (heroAutoPlayInterval) {
        clearInterval(heroAutoPlayInterval);
        heroAutoPlayInterval = null;
    }
    // Stop progress animation
    const progressBars = document.querySelectorAll('.hero-progress-bar');
    progressBars.forEach(bar => {
        const fill = bar.querySelector('.hero-progress-fill');
        if (fill) {
            fill.style.animation = 'none';
        }
        bar.classList.remove('active');
    });
}

function pauseHeroProgress() {
    if (!heroAutoPlayInterval) return;
    const progressBars = document.querySelectorAll('.hero-progress-bar');
    const activeBar = progressBars[heroCurrentIndex];
    if (activeBar) {
        const fill = activeBar.querySelector('.hero-progress-fill');
        if (fill) {
            fill.style.animationPlayState = 'paused';
        }
    }
}

function resumeHeroProgress() {
    if (!heroAutoPlayInterval) {
        startHeroAutoPlay();
        return;
    }
    const progressBars = document.querySelectorAll('.hero-progress-bar');
    const activeBar = progressBars[heroCurrentIndex];
    if (activeBar) {
        const fill = activeBar.querySelector('.hero-progress-fill');
        if (fill) {
            fill.style.animationPlayState = 'running';
        }
    }
}

function renderHero(item) {
    if (!item) return;
    // Single item fallback - wrap in array for carousel with Ken Burns
    renderHeroCarousel([item]);
}


// Popular slider removed
continuePrev.addEventListener('click', () => { continueTrack.scrollBy({ left: -340, behavior: 'smooth' }); });
continueNext.addEventListener('click', () => { continueTrack.scrollBy({ left: 340, behavior: 'smooth' }); });

/* ===== AUTO SLIDER SYSTEM ===== */
const AUTO_SLIDE_INTERVAL = 4000;

let autoSlideIntervals = {};
let isSliderHovered = {};

function initAutoSlider(trackId, dotsId) {
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsId);
  if (!track) return;

  if (autoSlideIntervals[trackId]) {
    clearInterval(autoSlideIntervals[trackId]);
    delete autoSlideIntervals[trackId];
  }

  function buildDots() {
    if (!dotsContainer) return;
    const cards = track.querySelectorAll('.slider-card');
    if (cards.length === 0) return;
    const trackWidth = track.clientWidth;
    const cardWidth = cards[0].offsetWidth + 14;
    const visibleCards = Math.max(1, Math.floor(trackWidth / cardWidth));
    const totalPages = Math.max(1, Math.ceil(cards.length / visibleCards));
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.dataset.page = i;
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * trackWidth, behavior: 'smooth' });
        updateActiveDot(i);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateActiveDot(activeIndex) {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function getCurrentPage() {
    const trackWidth = track.clientWidth;
    return Math.round(track.scrollLeft / trackWidth);
  }

  function autoSlide() {
    if (isSliderHovered[trackId]) return;
    const trackWidth = track.clientWidth;
    const cards = track.querySelectorAll('.slider-card');
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 14;
    const visibleCards = Math.max(1, Math.floor(trackWidth / cardWidth));
    const totalPages = Math.max(1, Math.ceil(cards.length / visibleCards));
    const currentPage = getCurrentPage();
    const nextPage = (currentPage + 1) % totalPages;
    track.scrollTo({ left: nextPage * trackWidth, behavior: 'smooth' });
    updateActiveDot(nextPage);
  }

  function resetAutoSlide() {
    if (autoSlideIntervals[trackId]) {
      clearInterval(autoSlideIntervals[trackId]);
      autoSlideIntervals[trackId] = setInterval(autoSlide, AUTO_SLIDE_INTERVAL);
    }
  }

  track.addEventListener('mouseenter', () => { isSliderHovered[trackId] = true; });
  track.addEventListener('mouseleave', () => { isSliderHovered[trackId] = false; });

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateActiveDot(getCurrentPage());
    }, 100);
  }, { passive: true });

  buildDots();
  const resizeObserver = new ResizeObserver(() => buildDots());
  resizeObserver.observe(track);

  autoSlideIntervals[trackId] = setInterval(autoSlide, AUTO_SLIDE_INTERVAL);
}

function initAllAutoSliders() {
  initAutoSlider('continueTrack', 'continueDots');
  // Popular slider removed
}

function renderGrid(data, append = false) {
  const sentinel = document.getElementById('infiniteScrollSentinel');
  const endMsg = document.getElementById('infiniteScrollEnd');

  if (!append) {
    grid.innerHTML = '';
    allLoadedData = [];
    hasMorePages = true;
    if (sentinel) sentinel.style.opacity = '0';
    if (endMsg) endMsg.style.display = 'none';
  }

  if (!data || data.error || !data.data || data.data.length === 0) {
    if (!append) {
      grid.innerHTML = '<div class="empty-message">No content found. Try a different search.</div>';
    }
    hasMorePages = false;
    if (sentinel) sentinel.style.opacity = '0';
    return;
  }

  const newItems = data.data;
  currentPage = (data.pagination && data.pagination.current_page) ? data.pagination.current_page : 1;
  lastPage = (data.pagination && data.pagination.last_page) ? data.pagination.last_page : 1;
  hasMorePages = currentPage < lastPage;

  if (!append) {
    currentData = newItems;
    currentItem = currentData[0];
    // Populate hero carousel with first 5 items, or single item fallback
    if (currentData.length > 1) {
      renderHeroCarousel(currentData.slice(0, 5));
    } else {
      renderHero(currentData[0]);
    }
  } else {
    currentData = currentData.concat(newItems);
  }

  // Accumulate all data for indexing
  const baseIndex = allLoadedData.length;
  allLoadedData = allLoadedData.concat(newItems);

  // Hide sentinel while not loading
  if (sentinel) sentinel.style.opacity = '0';

  // Show end message if no more pages
  if (!hasMorePages && endMsg) {
    endMsg.style.display = 'block';
  }

  const cardsHtml = newItems.map((item, i) => {
    const globalIdx = baseIndex + i;
    const isTVItem = item.first_air_date || item.number_of_seasons;
    const year = yearStr(item);
    const eps = isTVItem ? `${item.number_of_episodes || '?'} eps` : (item.runtime ? `${item.runtime} min` : '');
    const genres = (item.genres || []).slice(0, 2).map(g => `<span>${g}</span>`).join('');
    const inWatchlist = isInWatchlist(item);
    return `<div class="card" data-idx="${globalIdx}" style="animation: fadeInUp 0.5s var(--ease-out) ${(i * 0.03).toFixed(2)}s both;">
      <div class="card-poster"><img src="${item.poster_url}" alt="${item.title || item.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="card-badge">★ ${item.vote_average}</div>
        <div class="card-overlay"><div class="tags">${genres}</div></div>
        <button class="card-watchlist-btn ${inWatchlist ? 'active' : ''}" data-idx="${globalIdx}" title="${inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
        </button>
      </div>
      <div class="card-info"><div class="card-title">${item.title || item.name}</div>
        <div class="card-sub"><span class="card-year">${year}</span><span>${eps}</span></div>
      </div>
    </div>`;
  }).join('');

  if (append) {
    grid.insertAdjacentHTML('beforeend', cardsHtml);
  } else {
    grid.innerHTML = cardsHtml;
  }

  grid.querySelectorAll('.card').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    // Remove existing listeners to prevent duplicates
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    newEl.addEventListener('click', (e) => {
      if (e.target.closest('.card-watchlist-btn')) return;
      currentItem = allLoadedData[idx];
      openDetails(allLoadedData[idx]);
    });
    const btn = newEl.querySelector('.card-watchlist-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = allLoadedData[idx];
        if (item) toggleWatchlist(item, btn);
      });
    }
  });
}

async function load(page = 1, append = false) {
  if (isLoadingMore) return;
  isLoadingMore = true;

  const sentinel = document.getElementById('infiniteScrollSentinel');
  if (sentinel && append) sentinel.style.opacity = '1';

  if (!append) showSkeletons();

  const q = searchQuery;

  if (q) {
    sectionTitle.textContent = `Search: "${q}"`;
    let data;
    if (activeTab === 'kids_movies') data = await searchKidsMovies(q, page);
    else if (activeTab === 'kids_tv') data = await searchKidsTV(q, page);
    else data = isTVTab() ? await searchTV(q, page) : await searchMovies(q, page);
    renderGrid(data, append);
    if (!append) {
      
      continueWatchingSection.classList.add('hidden');
    }
    isLoadingMore = false;
    return;
  }

  if (activeTab === 'kids_movies') {
    sectionTitle.textContent = 'Kids Movies';
    const data = await fetchKidsMovies(page);
    renderGrid(data, append);
    if (!append) {
      
      continueWatchingSection.classList.add('hidden');
    }
    isLoadingMore = false;
    return;
  }

  if (activeTab === 'kids_tv') {
    sectionTitle.textContent = 'Kids TV Shows';
    const data = await fetchKidsTV(page);
    renderGrid(data, append);
    if (!append) {
      
      continueWatchingSection.classList.add('hidden');
    }
    isLoadingMore = false;
    return;
  }

  sectionTitle.textContent = activeTab === 'movies' ? 'Movies' : 'TV Shows';
  const data = activeTab === 'movies' ? await fetchMovies(page) : await fetchTV(page);
  renderGrid(data, append);

  if (!append) {
    // Show continue watching on browse
    renderContinueWatchingSlider();
    initAutoSlider('continueTrack', 'continueDots');

    
  }

  isLoadingMore = false;
}

function switchTab(type) {
  if (!requireLogin()) return;
  activeTab = type;
  searchQuery = '';
  searchInput.value = '';
  if (type === 'tv' || type === 'onair' || type === 'kids_tv') searchInput.placeholder = 'Search TV shows...';
  else if (type === 'kids_movies') searchInput.placeholder = 'Search kids movies...';
  else searchInput.placeholder = 'Search movies...';
  tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  tabGroup.querySelector(`.tab-btn[data-type="${type}"]`)?.classList.add('active');
  document.getElementById('liveTVSection').classList.add('hidden');
  document.getElementById('mainGridSection').classList.remove('hidden');

  // Update sidebar nav
  document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
  if (type === 'movies') document.getElementById('navMovies')?.classList.add('active');
  else if (type === 'tv') document.getElementById('navTV')?.classList.add('active');
  else if (type === 'kids_movies' || type === 'kids_tv') document.getElementById('navKids')?.classList.add('active');
  else document.getElementById('navBrowse')?.classList.add('active');

  // Reset infinite scroll state
  isLoadingMore = false;
  hasMorePages = true;
  allLoadedData = [];

  load(1, false);
  setupInfiniteScroll();
  initAllAutoSliders();
}

/* ── DETAILS ── */
async function openDetails(item) {
  if (!gateContentAccess()) return;
  if (!item) return;
  currentItem = item;
  detailsModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  tvDetailData = null;

  const isTVItem = !!item.first_air_date || !!item.number_of_seasons;
  const typeLabel = isTVItem ? 'TV Series' : 'Movie';
  const year = yearStr(item);
  const endYear = item.last_air_date ? item.last_air_date.split('-')[0] : '';
  const yearRange = isTVItem && endYear ? `${year} – ${endYear}` : (isTVItem ? `${year} – Present` : year);
  const runtime = isTVItem ? `${item.number_of_episodes || '?'} eps • ${item.number_of_seasons || '?'} Seasons` : (item.runtime ? `${item.runtime} min` : '');
  const status = item.status || 'Unknown';
  const lang = (item.original_language || 'en').toUpperCase();
  const inWatchlist = isInWatchlist(item);

  const posterUrl = item.poster_url || item.poster_path || '';
  const backdropUrl = item.backdrop_url || item.backdrop_path || '';
  const title = item.title || item.name || 'Unknown';

  let episodesHtml = '';
  if (isTVItem) {
    const detailResp = await getTVDetails(item.id);
    if (detailResp && !detailResp.error && detailResp.data && detailResp.data.seasons) {
      tvDetailData = detailResp.data;
      episodesHtml = buildEpisodesUI(detailResp.data);
    }
  }

  detailsContent.innerHTML = `
    <div class="modal-hero">
      <div class="modal-hero-bg" style="background-image:url('${backdropUrl}')"></div>
      <div class="modal-hero-content">
        <div class="modal-poster">${posterUrl ? `<img src="${posterUrl}" alt="${title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg width='40' height='40' viewBox='0 0 24 24' fill='rgba(255,255,255,0.2)'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'></path></svg>'">` : '<svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>'}</div>
        <div class="modal-hero-info">
          <div class="modal-type">${typeLabel}</div>
          <h1 class="modal-title">${title}</h1>
          <div class="modal-meta">
            <span class="rating">★ ${item.vote_average || 'N/A'}</span>
            <span class="dot"></span><span>${yearRange}</span>
            ${runtime ? `<span class="dot"></span><span>${runtime}</span>` : ''}
            <span class="dot"></span><span class="status-badge">${status}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="hero-btn" id="detailsPlayBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"></path></svg>
              ${isTVItem ? 'Select Episode' : 'Play Now'}
            </button>
            <button class="modal-watchlist-btn ${inWatchlist ? 'active' : ''}" id="detailsWatchlistBtn">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
              <span id="detailsWatchlistText">${inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-body">
      <p class="modal-overview">${item.overview || 'No overview available.'}</p>
      <div class="modal-genres">${(item.genres || []).map(g => `<span>${g}</span>`).join('')}</div>
      <div class="modal-grid">
        <div class="modal-info-item"><div class="label">Status</div><div class="value">${status}</div></div>
        <div class="modal-info-item"><div class="label">Type</div><div class="value">${item.type || typeLabel}</div></div>
        <div class="modal-info-item"><div class="label">Language</div><div class="value">${lang}</div></div>
        <div class="modal-info-item"><div class="label">Rating</div><div class="value">${item.vote_average}/10</div></div>
        <div class="modal-info-item"><div class="label">Votes</div><div class="value">${(item.vote_count || 0).toLocaleString()}</div></div>
      </div>
      ${episodesHtml}
    </div>`;

  document.getElementById('detailsPlayBtn').addEventListener('click', () => {
    if (isTVItem) { const s = document.getElementById('episodesSection'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }
    else playMovie(item);
  });

  const wlBtn = document.getElementById('detailsWatchlistBtn');
  if (wlBtn) {
    wlBtn.addEventListener('click', () => {
      toggleWatchlist(item, wlBtn);
      const text = document.getElementById('detailsWatchlistText');
      if (text) text.textContent = isInWatchlist(item) ? 'In Watchlist' : 'Add to Watchlist';
    });
  }

  document.querySelectorAll('.season-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderEpisodesForSeason(parseInt(tab.dataset.season));
    });
  });
  wireEpisodeCards();
}

function buildEpisodesUI(data) {
  if (!data.seasons || data.seasons.length === 0) return '';
  const seasons = data.seasons;
  const tabs = seasons.map((s, i) => `<button class="season-tab ${i === 0 ? 'active' : ''}" data-season="${s.season_number}">Season ${s.season_number}</button>`).join('');
  let firstEpisodes = '';
  if (seasons[0] && seasons[0].episodes) {
    firstEpisodes = seasons[0].episodes.map(ep => episodeCardHtml(data.tmdb_id, ep, ep.season_number || seasons[0].season_number)).join('');
  }
  return `<div id="episodesSection" style="margin-top:24px"><h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Episodes</h3><div class="season-header">${tabs}</div><div class="episode-grid" id="episodesGrid">${firstEpisodes}</div></div>`;
}

function episodeCardHtml(tmdbId, ep, seasonNum) {
  // Check if this episode has progress
  const key = `${tmdbId}_S${seasonNum}E${ep.episode_number}`;
  const contList = getContinueWatching();
  const contEntry = contList.find(c => c.key === key);
  const progressPct = contEntry ? Math.round((contEntry.progress || 0) * 100) : 0;
  const progressText = contEntry ? `${formatTime(contEntry.currentTime)} / ${formatTime(contEntry.duration)}` : '';

  // Build full image URL for episode still
  let stillUrl = ep.still_path || '';
  if (stillUrl && !stillUrl.startsWith('http')) {
    stillUrl = 'https://image.tmdb.org/t/p/w300' + stillUrl;
  }

  return `<div class="episode-card" data-tmdbid="${tmdbId}" data-season="${seasonNum}" data-episode="${ep.episode_number}" data-epname="${(ep.name || '').replace(/"/g, '"')}">
    <div class="episode-thumb"><img src="${stillUrl}" alt="${ep.name || ''}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='var(--bg-3)'"></div>
    <div class="episode-info">
      <div class="episode-num">Episode ${ep.episode_number}</div>
      <div class="episode-name">${ep.name || 'Episode ' + ep.episode_number}</div>
      <div class="episode-ov">${ep.overview || 'No description.'}</div>
      ${progressPct > 0 ? `<div class="episode-progress-bar"><div class="episode-progress-fill" style="width:${progressPct}%"></div></div><div class="episode-progress-text">${progressText}</div>` : ''}
    </div>
    <div class="episode-play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>
  </div>`;
}

function renderEpisodesForSeason(seasonNum) {
  if (!tvDetailData || !tvDetailData.seasons) return;
  const season = tvDetailData.seasons.find(s => s.season_number === seasonNum);
  if (!season || !season.episodes) return;
  const g = document.getElementById('episodesGrid');
  if (!g) return;
  g.innerHTML = season.episodes.map(ep => episodeCardHtml(tvDetailData.tmdb_id, ep, seasonNum)).join('');
  wireEpisodeCards();
}

function wireEpisodeCards() {
  document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => {
      const tmdbId = card.dataset.tmdbid;
      const season = parseInt(card.dataset.season);
      const ep = parseInt(card.dataset.episode);
      const epName = card.dataset.epname;
      const showName = tvDetailData ? (tvDetailData.name || tvDetailData.title) : '';
      // Ensure currentItem is set with full TV show data for progress tracking
      if (tvDetailData) {
        currentItem = {
          id: tvDetailData.id,
          tmdb_id: tvDetailData.tmdb_id || tmdbId,
          title: showName,
          name: showName,
          poster_url: tvDetailData.poster_url || currentItem?.poster_url || '',
          backdrop_url: tvDetailData.backdrop_url || currentItem?.backdrop_url || '',
          vote_average: tvDetailData.vote_average || currentItem?.vote_average || 0,
          genres: tvDetailData.genres || currentItem?.genres || [],
          first_air_date: tvDetailData.first_air_date || currentItem?.first_air_date,
          number_of_episodes: tvDetailData.number_of_episodes,
          number_of_seasons: tvDetailData.number_of_seasons,
          overview: tvDetailData.overview || currentItem?.overview || ''
        };
      }
      playEpisode(tmdbId, season, ep, showName, epName);
    });
  });
}

/* ── PLAYER CONTROLS ── */

function updateEpisodeNavButtons() {
  if (playerPrevEpisodeBtn) {
    playerPrevEpisodeBtn.disabled = !prevEpisodeData;
  }
  if (playerNextEpisodeBtn) {
    playerNextEpisodeBtn.disabled = !nextEpisodeData;
  }
}

function openPlayerUI(title, subtitle) {
  playerModal.classList.add('active');
  // Reset episode nav buttons until episode data is loaded
  updateEpisodeNavButtons();
  document.body.style.overflow = 'hidden';
  playerTopTitle.textContent = title;
  playerTopSubtitle.textContent = subtitle || 'Loading stream...';
  playerLoading.classList.remove('hidden-loading');
  playerLoadingText.textContent = 'Loading stream...';
  playerErrorOverlay.classList.remove('active');
  playerBufferRing.classList.remove('visible');
  nextEpisodeToast.classList.remove('active');
  destroyHls();
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
  playerVideo.innerHTML = '';
  playerVideo.playbackRate = currentPlaybackSpeed;
  currentSources = [];
  currentSubtitles = [];
  currentQuality = null;
  nextEpisodeData = null;
  closeQualityDropdown();
  closeSpeedDropdown();
  showControls();
  resetProgress();
  updatePlayPauseIcons(false);

  // Clear old progress save interval
  if (progressSaveInterval) clearInterval(progressSaveInterval);

  // ===== FORCE LANDSCAPE MODE =====
  forceLandscapeMode();
}

function resetProgress() {
  playerProgressFill.style.width = '0%';
  playerProgressBuffer.style.width = '0%';
  playerProgressThumb.style.left = '0%';
  playerTimeDisplay.textContent = '0:00 / 0:00';
}

function showControls() {
  playerControlsVisible = true;
  playerTopBar.classList.remove('hidden-bar');
  playerControlsBar.classList.remove('hidden-bar');
  clearTimeout(controlsHideTimer);
  // Don't auto-hide controls while dropdown is open
  const dropdownOpen = (playerQualityDropdown && playerQualityDropdown.classList.contains('open')) ||
                       (playerSpeedDropdown && playerSpeedDropdown.classList.contains('open')) ||
                       (playerSubDropdown && playerSubDropdown.classList.contains('open'));
  if (!dropdownOpen) {
    controlsHideTimer = setTimeout(hideControls, 3000);
  }
}

function hideControls() {
  if (isDraggingProgress) return;
  // Don't hide controls if quality or speed dropdown is open
  if (playerQualityDropdown && playerQualityDropdown.classList.contains('open')) return;
  if (playerSubDropdown && playerSubDropdown.classList.contains('open')) return;
  if (playerSpeedDropdown && playerSpeedDropdown.classList.contains('open')) return;
  playerControlsVisible = false;
  playerTopBar.classList.add('hidden-bar');
  playerControlsBar.classList.add('hidden-bar');
  // Don't close dropdowns here - let them close on their own
}

function toggleControls() {
  if (playerControlsVisible) hideControls();
  else showControls();
}

/* Play/Pause */
let togglePlayPauseLock = false;
function togglePlayPause() {
  if (!playerVideo.src && !hlsInstance) return;
  // Prevent rapid double-toggling that causes UI freeze
  if (togglePlayPauseLock) return;
  togglePlayPauseLock = true;
  setTimeout(() => { togglePlayPauseLock = false; }, 300);

  if (playerVideo.paused) {
    playerVideo.play().catch(() => {});
  } else {
    playerVideo.pause();
  }
}

function updatePlayPauseIcons(isPlaying) {
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    centerPlayIcon.style.display = 'none';
    centerPauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    centerPlayIcon.style.display = 'block';
    centerPauseIcon.style.display = 'none';
  }
}

playerPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayPause(); });
playerCenterBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayPause(); });

playerVideo.addEventListener('play', () => {
  updatePlayPauseIcons(true);
  playerCenterBtn.classList.remove('visible');
  showControls();
});
playerVideo.addEventListener('pause', () => {
  updatePlayPauseIcons(false);
  playerCenterBtn.classList.add('visible');
  showControls();
});

/* Skip buttons */
playerSkipBackBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playerVideo.currentTime = Math.max(0, playerVideo.currentTime - 10);
  showControls();
});
playerSkipForwardBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playerVideo.currentTime = Math.min(playerVideo.duration || Infinity, playerVideo.currentTime + 10);
  showControls();
});

/* Previous Episode button */
playerPrevEpisodeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (prevEpisodeData && !playerPrevEpisodeBtn.disabled) {
    playEpisode(prevEpisodeData.tmdbId, prevEpisodeData.season, prevEpisodeData.episode, prevEpisodeData.showName, prevEpisodeData.name);
  }
  showControls();
});

/* Next Episode button */
playerNextEpisodeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (nextEpisodeData && !playerNextEpisodeBtn.disabled) {
    playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
  }
  showControls();
});

/* Progress bar */
function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}:${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  return `${min}:${sec.toString().padStart(2,'0')}`;
}

function updateProgress() {
  if (isDraggingProgress) return;
  const dur = playerVideo.duration || 0;
  const cur = playerVideo.currentTime || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  playerProgressFill.style.width = pct + '%';
  playerProgressThumb.style.left = pct + '%';

  if (playerVideo.buffered.length > 0) {
    const bufEnd = playerVideo.buffered.end(playerVideo.buffered.length - 1);
    const bufPct = dur > 0 ? (bufEnd / dur) * 100 : 0;
    playerProgressBuffer.style.width = bufPct + '%';
  }

  playerTimeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;

  // Save progress periodically
  if (currentPlayingItem && dur > 0 && cur > 0) {
    const progress = cur / dur;
    // Only save if not at the very end (within 5% of end = finished)
    if (progress < 0.95) {
      updateContinueWatching(
        currentPlayingItem.item,
        cur,
        dur,
        currentPlayingItem.season,
        currentPlayingItem.episode,
        currentPlayingItem.episodeName
      );
    } else {
      // Remove from continue watching if finished
      const key = currentPlayingItem.type === 'tv' 
        ? `${currentPlayingItem.item.id}_S${currentPlayingItem.season}E${currentPlayingItem.episode}`
        : String(currentPlayingItem.item.id);
      removeFromContinue(key);
    }
  }
}

playerVideo.addEventListener('timeupdate', updateProgress);
playerVideo.addEventListener('progress', updateProgress);

// Progress hover
playerProgressArea.addEventListener('mousemove', (e) => {
  const rect = playerProgressTrack.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  const dur = playerVideo.duration || 0;
  const time = dur * pct;
  playerHoverTime.textContent = formatTime(time);
  playerHoverTime.style.left = (pct * 100) + '%';
  playerHoverTime.classList.add('visible');
});
playerProgressArea.addEventListener('mouseleave', () => {
  playerHoverTime.classList.remove('visible');
});

// Progress click / drag
function seekToPct(pct) {
  const dur = playerVideo.duration || 0;
  if (dur > 0) {
    playerVideo.currentTime = dur * pct;
    updateProgress();
  }
}

playerProgressArea.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  isDraggingProgress = true;
  wasPlayingBeforeDrag = !playerVideo.paused;
  if (wasPlayingBeforeDrag) playerVideo.pause();
  const rect = playerProgressTrack.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  playerProgressFill.style.width = (pct * 100) + '%';
  playerProgressThumb.style.left = (pct * 100) + '%';
  playerHoverTime.classList.add('visible');
});

document.addEventListener('mousemove', (e) => {
  if (!isDraggingProgress) return;
  const rect = playerProgressTrack.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  playerProgressFill.style.width = (pct * 100) + '%';
  playerProgressThumb.style.left = (pct * 100) + '%';
  const dur = playerVideo.duration || 0;
  playerHoverTime.textContent = formatTime(dur * pct);
  playerHoverTime.style.left = (pct * 100) + '%';
});

document.addEventListener('mouseup', () => {
  if (!isDraggingProgress) return;
  const pct = parseFloat(playerProgressFill.style.width) / 100;
  seekToPct(pct);
  isDraggingProgress = false;
  playerHoverTime.classList.remove('visible');
  if (wasPlayingBeforeDrag) playerVideo.play().catch(() => {});
  showControls();
});

/* Volume */
function updateVolumeUI() {
  const vol = playerVideo.muted ? 0 : playerVideo.volume;
  playerVolumeFill.style.width = (vol * 100) + '%';
  volHighIcon.style.display = vol > 0.5 ? 'block' : 'none';
  volLowIcon.style.display = vol > 0 && vol <= 0.5 ? 'block' : 'none';
  volMuteIcon.style.display = vol === 0 ? 'block' : 'none';
}

playerVolumeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (playerVideo.muted || playerVideo.volume === 0) {
    playerVideo.muted = false;
    playerVideo.volume = lastVolume > 0 ? lastVolume : 0.5;
  } else {
    lastVolume = playerVideo.volume;
    playerVideo.muted = true;
    playerVideo.volume = 0;
  }
  updateVolumeUI();
  showControls();
});

playerVolumeSlider.addEventListener('click', (e) => {
  e.stopPropagation();
  const rect = playerVolumeSlider.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  playerVideo.muted = false;
  playerVideo.volume = pct;
  updateVolumeUI();
});

playerVolumeSlider.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  playerVolumeWrap.classList.add('active-volume');
  const moveHandler = (ev) => {
    const rect = playerVolumeSlider.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    playerVideo.muted = false;
    playerVideo.volume = pct;
    updateVolumeUI();
  };
  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    playerVolumeWrap.classList.remove('active-volume');
  };
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
});

playerVideo.volume = 1;
updateVolumeUI();

/* Speed selector */
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
function buildSpeedMenu() {
  playerSpeedDropdown.innerHTML = speedOptions.map(s => {
    const isActive = Math.abs(currentPlaybackSpeed - s) < 0.01;
    return `<button class="speed-opt ${isActive ? 'active' : ''}" data-speed="${s}">${s}x</button>`;
  }).join('');
  playerSpeedDropdown.querySelectorAll('.speed-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = parseFloat(btn.dataset.speed);
      currentPlaybackSpeed = s;
      playerVideo.playbackRate = s;
      speedLabel.textContent = s + 'x';
      buildSpeedMenu();
      closeSpeedDropdown();
      showControls();
    });
  });
}
buildSpeedMenu();

playerSpeedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  const isOpen = playerSpeedDropdown.classList.contains('open');
  if (isOpen) {
    closeSpeedDropdown();
  } else {
    closeQualityDropdown();
    closeSubDropdown();
    buildSpeedMenu();
    // Position dropdown above the button using fixed positioning (drop-up)
    const btn = e.currentTarget || playerSpeedBtn;
    const rect = btn.getBoundingClientRect();
    playerSpeedDropdown.style.setProperty('position', 'fixed', 'important');
    playerSpeedDropdown.style.setProperty('left', rect.left + 'px', 'important');
    playerSpeedDropdown.style.setProperty('bottom', (window.innerHeight - rect.top + 8) + 'px', 'important');
    playerSpeedDropdown.style.setProperty('top', 'auto', 'important');
    playerSpeedDropdown.style.setProperty('right', 'auto', 'important');
    playerSpeedDropdown.classList.add('open');
    playerSpeedBtn.classList.add('open');
  }
  showControls();
});

/* ===== LANGUAGE NAME RESOLVER ===== */
// Maps ISO 639-1/2 codes to full English language names
// Uses Intl.DisplayNames API when available (modern browsers)
// Falls back to a comprehensive static map for older WebView/Chrome 60-69

const LANGUAGE_NAME_MAP = {
  'aa': 'Afar', 'ab': 'Abkhazian', 'ae': 'Avestan', 'af': 'Afrikaans',
  'ak': 'Akan', 'am': 'Amharic', 'an': 'Aragonese', 'ar': 'Arabic',
  'as': 'Assamese', 'av': 'Avaric', 'ay': 'Aymara', 'az': 'Azerbaijani',
  'ba': 'Bashkir', 'be': 'Belarusian', 'bg': 'Bulgarian', 'bh': 'Bihari',
  'bi': 'Bislama', 'bm': 'Bambara', 'bn': 'Bengali', 'bo': 'Tibetan',
  'br': 'Breton', 'bs': 'Bosnian', 'ca': 'Catalan', 'ce': 'Chechen',
  'ch': 'Chamorro', 'co': 'Corsican', 'cr': 'Cree', 'cs': 'Czech',
  'cu': 'Old Church Slavonic', 'cv': 'Chuvash', 'cy': 'Welsh', 'da': 'Danish',
  'de': 'German', 'dv': 'Divehi', 'dz': 'Dzongkha', 'ee': 'Ewe',
  'el': 'Greek', 'en': 'English', 'eo': 'Esperanto', 'es': 'Spanish',
  'et': 'Estonian', 'eu': 'Basque', 'fa': 'Persian', 'ff': 'Fula',
  'fi': 'Finnish', 'fj': 'Fijian', 'fo': 'Faroese', 'fr': 'French',
  'fy': 'Western Frisian', 'ga': 'Irish', 'gd': 'Scottish Gaelic',
  'gl': 'Galician', 'gn': 'Guarani', 'gu': 'Gujarati', 'gv': 'Manx',
  'ha': 'Hausa', 'he': 'Hebrew', 'hi': 'Hindi', 'ho': 'Hiri Motu',
  'hr': 'Croatian', 'ht': 'Haitian Creole', 'hu': 'Hungarian', 'hy': 'Armenian',
  'hz': 'Herero', 'ia': 'Interlingua', 'id': 'Indonesian', 'ie': 'Interlingue',
  'ig': 'Igbo', 'ii': 'Nuosu', 'ik': 'Inupiak', 'in': 'Indonesian',
  'io': 'Ido', 'is': 'Icelandic', 'it': 'Italian', 'iu': 'Inuktitut',
  'ja': 'Japanese', 'jv': 'Javanese', 'ka': 'Georgian', 'kg': 'Kongo',
  'ki': 'Kikuyu', 'kj': 'Kwanyama', 'kk': 'Kazakh', 'kl': 'Kalaallisut',
  'km': 'Khmer', 'kn': 'Kannada', 'ko': 'Korean', 'kr': 'Kanuri',
  'ks': 'Kashmiri', 'ku': 'Kurdish', 'kv': 'Komi', 'kw': 'Cornish',
  'ky': 'Kyrgyz', 'la': 'Latin', 'lb': 'Luxembourgish', 'lg': 'Ganda',
  'li': 'Limburgish', 'ln': 'Lingala', 'lo': 'Lao', 'lt': 'Lithuanian',
  'lu': 'Luba-Katanga', 'lv': 'Latvian', 'mg': 'Malagasy', 'mh': 'Marshallese',
  'mi': 'Maori', 'mk': 'Macedonian', 'ml': 'Malayalam', 'mn': 'Mongolian',
  'mo': 'Moldavian', 'mr': 'Marathi', 'ms': 'Malay', 'mt': 'Maltese',
  'my': 'Burmese', 'na': 'Nauru', 'nb': 'Norwegian Bokmål', 'nd': 'Northern Ndebele',
  'ne': 'Nepali', 'ng': 'Ndonga', 'nl': 'Dutch', 'nn': 'Norwegian Nynorsk',
  'no': 'Norwegian', 'nr': 'Southern Ndebele', 'nv': 'Navajo', 'ny': 'Chichewa',
  'oc': 'Occitan', 'oj': 'Ojibwe', 'om': 'Oromo', 'or': 'Oriya',
  'os': 'Ossetian', 'pa': 'Punjabi', 'pi': 'Pali', 'pl': 'Polish',
  'ps': 'Pashto', 'pt': 'Portuguese', 'qu': 'Quechua', 'rm': 'Romansh',
  'rn': 'Kirundi', 'ro': 'Romanian', 'ru': 'Russian', 'rw': 'Kinyarwanda',
  'sa': 'Sanskrit', 'sc': 'Sardinian', 'sd': 'Sindhi', 'se': 'Sami',
  'sg': 'Sango', 'sh': 'Serbo-Croatian', 'si': 'Sinhalese', 'sk': 'Slovak',
  'sl': 'Slovenian', 'sm': 'Samoan', 'sn': 'Shona', 'so': 'Somali',
  'sq': 'Albanian', 'sr': 'Serbian', 'ss': 'Siswati', 'st': 'Sesotho',
  'su': 'Sundanese', 'sv': 'Swedish', 'sw': 'Swahili', 'ta': 'Tamil',
  'te': 'Telugu', 'tg': 'Tajik', 'th': 'Thai', 'ti': 'Tigrinya',
  'tk': 'Turkmen', 'tl': 'Tagalog', 'tn': 'Setswana', 'to': 'Tonga',
  'tr': 'Turkish', 'ts': 'Tsonga', 'tt': 'Tatar', 'tw': 'Twi',
  'ty': 'Tahitian', 'ug': 'Uyghur', 'uk': 'Ukrainian', 'ur': 'Urdu',
  'uz': 'Uzbek', 've': 'Venda', 'vi': 'Vietnamese', 'vo': 'Volapük',
  'wa': 'Walloon', 'wo': 'Wolof', 'xh': 'Xhosa', 'yi': 'Yiddish',
  'yo': 'Yoruba', 'za': 'Zhuang', 'zh': 'Chinese', 'zu': 'Zulu',
  // Common 3-letter and extended codes
  'zho': 'Chinese', 'cmn': 'Mandarin Chinese', 'yue': 'Cantonese',
  'cmn-Hans': 'Chinese (Simplified)', 'cmn-Hant': 'Chinese (Traditional)',
  'zh-Hans': 'Chinese (Simplified)', 'zh-Hant': 'Chinese (Traditional)',
  'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
  'eng': 'English', 'spa': 'Spanish', 'fre': 'French', 'fra': 'French',
  'ger': 'German', 'deu': 'German', 'ita': 'Italian', 'por': 'Portuguese',
  'rus': 'Russian', 'jpn': 'Japanese', 'kor': 'Korean', 'hin': 'Hindi',
  'ara': 'Arabic', 'ben': 'Bengali', 'tam': 'Tamil', 'tel': 'Telugu',
  'mar': 'Marathi', 'tur': 'Turkish', 'vie': 'Vietnamese', 'pol': 'Polish',
  'ukr': 'Ukrainian', 'ind': 'Indonesian', 'nld': 'Dutch', 'swe': 'Swedish',
  'cze': 'Czech', 'ces': 'Czech', 'gre': 'Greek', 'ell': 'Greek',
  'rum': 'Romanian', 'ron': 'Romanian', 'hun': 'Hungarian', 'fin': 'Finnish',
  'dan': 'Danish', 'nor': 'Norwegian', 'heb': 'Hebrew', 'tha': 'Thai',
  'msa': 'Malay', 'may': 'Malay', 'fil': 'Filipino', 'tag': 'Tagalog',
  'srp': 'Serbian', 'hrv': 'Croatian', 'bos': 'Bosnian', 'slv': 'Slovenian',
  'slk': 'Slovak', 'lit': 'Lithuanian', 'lav': 'Latvian', 'est': 'Estonian',
  'alb': 'Albanian', 'sqi': 'Albanian', 'mac': 'Macedonian', 'mkd': 'Macedonian',
  'bul': 'Bulgarian', 'bel': 'Belarusian', 'kaz': 'Kazakh', 'uzb': 'Uzbek',
  'kir': 'Kyrgyz', 'tuk': 'Turkmen', 'taj': 'Tajik', 'mon': 'Mongolian',
  'nep': 'Nepali', 'sin': 'Sinhalese', 'mya': 'Burmese', 'khm': 'Khmer',
  'lao': 'Lao', 'pan': 'Punjabi', 'guj': 'Gujarati', 'kan': 'Kannada',
  'mal': 'Malayalam', 'ori': 'Oriya', 'ass': 'Assamese', 'san': 'Sanskrit',
  'urd': 'Urdu', 'fas': 'Persian', 'per': 'Persian', 'pus': 'Pashto',
  'kur': 'Kurdish', 'aze': 'Azerbaijani', 'arm': 'Armenian', 'hye': 'Armenian',
  'geo': 'Georgian', 'kat': 'Georgian', 'afr': 'Afrikaans', 'amh': 'Amharic',
  'som': 'Somali', 'swa': 'Swahili', 'yor': 'Yoruba', 'ibo': 'Igbo',
  'zul': 'Zulu', 'xho': 'Xhosa', 'sot': 'Sesotho', 'tsn': 'Setswana',
  'ven': 'Venda', 'nso': 'Northern Sotho', 'ssw': 'Siswati', 'tsonga': 'Tsonga',
  // Additional common subtitle language codes
  'und': 'Undetermined', 'mul': 'Multiple Languages', 'mis': 'Uncoded',
  'sgn': 'Sign Languages', 'art': 'Artificial Languages', 'qaa': 'Reserved',
  'qab': 'Reserved', 'qac': 'Reserved', 'qad': 'Reserved', 'qae': 'Reserved',
  'qaf': 'Reserved', 'qag': 'Reserved', 'qah': 'Reserved', 'qai': 'Reserved',
  'qaj': 'Reserved', 'qak': 'Reserved', 'qal': 'Reserved', 'qam': 'Reserved',
  'qan': 'Reserved', 'qao': 'Reserved', 'qap': 'Reserved', 'qaq': 'Reserved',
  'qar': 'Reserved', 'qas': 'Reserved', 'qat': 'Reserved', 'qau': 'Reserved',
  'qav': 'Reserved', 'qaw': 'Reserved', 'qax': 'Reserved', 'qay': 'Reserved',
  'qaz': 'Reserved', 'qba': 'Reserved', 'qbb': 'Reserved', 'qbc': 'Reserved',
  'qbd': 'Reserved', 'qbe': 'Reserved', 'qbf': 'Reserved', 'qbg': 'Reserved',
  'qbh': 'Reserved', 'qbi': 'Reserved', 'qbj': 'Reserved', 'qbk': 'Reserved',
  'qbl': 'Reserved', 'qbm': 'Reserved', 'qbn': 'Reserved', 'qbo': 'Reserved',
  'qbp': 'Reserved', 'qbq': 'Reserved', 'qbr': 'Reserved', 'qbs': 'Reserved',
  'qbt': 'Reserved', 'qbu': 'Reserved', 'qbv': 'Reserved', 'qbw': 'Reserved',
  'qbx': 'Reserved', 'qby': 'Reserved', 'qbz': 'Reserved', 'qca': 'Reserved',
  'qcb': 'Reserved', 'qcc': 'Reserved', 'qcd': 'Reserved', 'qce': 'Reserved',
  'qcf': 'Reserved', 'qcg': 'Reserved', 'qch': 'Reserved', 'qci': 'Reserved',
  'qcj': 'Reserved', 'qck': 'Reserved', 'qcl': 'Reserved', 'qcm': 'Reserved',
  'qcn': 'Reserved', 'qco': 'Reserved', 'qcp': 'Reserved', 'qcq': 'Reserved',
  'qcr': 'Reserved', 'qcs': 'Reserved', 'qct': 'Reserved', 'qcu': 'Reserved',
  'qcv': 'Reserved', 'qcw': 'Reserved', 'qcx': 'Reserved', 'qcy': 'Reserved',
  'qcz': 'Reserved', 'qda': 'Reserved', 'qdb': 'Reserved', 'qdc': 'Reserved',
  'qdd': 'Reserved', 'qde': 'Reserved', 'qdf': 'Reserved', 'qdg': 'Reserved',
  'qdh': 'Reserved', 'qdi': 'Reserved', 'qdj': 'Reserved', 'qdk': 'Reserved',
  'qdl': 'Reserved', 'qdm': 'Reserved', 'qdn': 'Reserved', 'qdo': 'Reserved',
  'qdp': 'Reserved', 'qdq': 'Reserved', 'qdr': 'Reserved', 'qds': 'Reserved',
  'qdt': 'Reserved', 'qdu': 'Reserved', 'qdv': 'Reserved', 'qdw': 'Reserved',
  'qdx': 'Reserved', 'qdy': 'Reserved', 'qdz': 'Reserved', 'qea': 'Reserved',
  'qeb': 'Reserved', 'qec': 'Reserved', 'qed': 'Reserved', 'qee': 'Reserved',
  'qef': 'Reserved', 'qeg': 'Reserved', 'qeh': 'Reserved', 'qei': 'Reserved',
  'qej': 'Reserved', 'qek': 'Reserved', 'qel': 'Reserved', 'qem': 'Reserved',
  'qen': 'Reserved', 'qeo': 'Reserved', 'qep': 'Reserved', 'qeq': 'Reserved',
  'qer': 'Reserved', 'qes': 'Reserved', 'qet': 'Reserved', 'qeu': 'Reserved',
  'qev': 'Reserved', 'qew': 'Reserved', 'qex': 'Reserved', 'qey': 'Reserved',
  'qez': 'Reserved', 'qfa': 'Reserved', 'qfb': 'Reserved', 'qfc': 'Reserved',
  'qfd': 'Reserved', 'qfe': 'Reserved', 'qff': 'Reserved', 'qfg': 'Reserved',
  'qfh': 'Reserved', 'qfi': 'Reserved', 'qfj': 'Reserved', 'qfk': 'Reserved',
  'qfl': 'Reserved', 'qfm': 'Reserved', 'qfn': 'Reserved', 'qfo': 'Reserved',
  'qfp': 'Reserved', 'qfq': 'Reserved', 'qfr': 'Reserved', 'qfs': 'Reserved',
  'qft': 'Reserved', 'qfu': 'Reserved', 'qfv': 'Reserved', 'qfw': 'Reserved',
  'qfx': 'Reserved', 'qfy': 'Reserved', 'qfz': 'Reserved', 'qga': 'Reserved',
  'qgb': 'Reserved', 'qgc': 'Reserved', 'qgd': 'Reserved', 'qge': 'Reserved',
  'qgf': 'Reserved', 'qgg': 'Reserved', 'qgh': 'Reserved', 'qgi': 'Reserved',
  'qgj': 'Reserved', 'qgk': 'Reserved', 'qgl': 'Reserved', 'qgm': 'Reserved',
  'qgn': 'Reserved', 'qgo': 'Reserved', 'qgp': 'Reserved', 'qgq': 'Reserved',
  'qgr': 'Reserved', 'qgs': 'Reserved', 'qgt': 'Reserved', 'qgu': 'Reserved',
  'qgv': 'Reserved', 'qgw': 'Reserved', 'qgx': 'Reserved', 'qgy': 'Reserved',
  'qgz': 'Reserved', 'qha': 'Reserved', 'qhb': 'Reserved', 'qhc': 'Reserved',
  'qhd': 'Reserved', 'qhe': 'Reserved', 'qhf': 'Reserved', 'qhg': 'Reserved',
  'qhh': 'Reserved', 'qhi': 'Reserved', 'qhj': 'Reserved', 'qhk': 'Reserved',
  'qhl': 'Reserved', 'qhm': 'Reserved', 'qhn': 'Reserved', 'qho': 'Reserved',
  'qhp': 'Reserved', 'qhq': 'Reserved', 'qhr': 'Reserved', 'qhs': 'Reserved',
  'qht': 'Reserved', 'qhu': 'Reserved', 'qhv': 'Reserved', 'qhw': 'Reserved',
  'qhx': 'Reserved', 'qhy': 'Reserved', 'qhz': 'Reserved'
};

// Cache for Intl.DisplayNames to avoid recreating
let _intlDisplayNames = null;

function getLanguageName(code) {
  if (!code || typeof code !== 'string') return 'Unknown';

  const normalizedCode = code.toLowerCase().trim();

  // Try Intl.DisplayNames API first (modern browsers)
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      if (!_intlDisplayNames) {
        _intlDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      }
      const name = _intlDisplayNames.of(normalizedCode);
      if (name && name !== normalizedCode) {
        return name;
      }
    }
  } catch(e) {
    // Intl API not available or code not supported, fall through
  }

  // Fallback to static map
  if (LANGUAGE_NAME_MAP[normalizedCode]) {
    return LANGUAGE_NAME_MAP[normalizedCode];
  }

  // Try without region/script suffix (e.g., "zh-CN" -> "zh")
  const baseCode = normalizedCode.split('-')[0];
  if (baseCode && baseCode !== normalizedCode && LANGUAGE_NAME_MAP[baseCode]) {
    return LANGUAGE_NAME_MAP[baseCode];
  }

  // Last resort: capitalize the code
  return code.charAt(0).toUpperCase() + code.slice(1);
}

/* Subtitle button */
playerSubBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSubDropdown();
  showControls();
});

playerSubPosBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSubPosDropdown();
  showControls();
});


/* ===== SUBTITLE POSITION FUNCTIONS ===== */

function initSubtitlePosition() {
  // Load saved position from localStorage
  const saved = localStorage.getItem('zedstream_subtitle_position');
  if (saved && SUBTITLE_POSITIONS.some(p => p.id === saved)) {
    currentSubtitlePosition = saved;
  }
  applySubtitlePosition(currentSubtitlePosition);
}

function applySubtitlePosition(position) {
  // Remove all position classes
  const wrapper = document.getElementById('playerVideoWrapper');
  if (!wrapper) return;

  SUBTITLE_POSITIONS.forEach(p => {
    wrapper.classList.remove('sub-pos-' + p.id);
  });

  // Add new position class
  wrapper.classList.add('sub-pos-' + position);

  // Update button indicator
  if (playerSubPosBtn) {
    playerSubPosBtn.classList.toggle('has-position', position !== 'bottom');
  }

  // Save preference
  localStorage.setItem('zedstream_subtitle_position', position);
  currentSubtitlePosition = position;

  console.log('[Subtitles] Position set to:', position);
}

function toggleSubPosDropdown() {
  const isOpen = playerSubPosDropdown.classList.contains('open');
  if (isOpen) {
    closeSubPosDropdown();
  } else {
    closeQualityDropdown();
    closeSpeedDropdown();
    closeSubDropdown();
    buildSubPosMenu();
    // Position dropdown above the button using fixed positioning
    const btn = playerSubPosBtn;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      playerSubPosDropdown.style.setProperty('position', 'fixed', 'important');
      playerSubPosDropdown.style.setProperty('left', rect.left + 'px', 'important');
      playerSubPosDropdown.style.setProperty('bottom', (window.innerHeight - rect.top + 8) + 'px', 'important');
      playerSubPosDropdown.style.setProperty('top', 'auto', 'important');
      playerSubPosDropdown.style.setProperty('right', 'auto', 'important');
    }
    playerSubPosDropdown.classList.add('open');
    playerSubPosBtn.classList.add('active');
  }
  showControls();
}

function closeSubPosDropdown() {
  playerSubPosDropdown.classList.remove('open');
  playerSubPosBtn.classList.remove('active');
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(hideControls, 3000);
}

function buildSubPosMenu() {
  playerSubPosDropdown.innerHTML = '';

  // Header label
  const header = document.createElement('div');
  header.className = 'subpos-group-label';
  header.textContent = 'Subtitle Position';
  playerSubPosDropdown.appendChild(header);

  // Position icons SVG
  const posIcons = {
    'bottom': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 18h16v2H4zm0-5h16v2H4zm0-5h16v2H4z"></path></svg>',
    'top': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>',
    'middle': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 11h16v2H4z"></path></svg>',
    'lower-third': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 16h16v2H4zm0-3h16v2H4z"></path></svg>',
    'very-bottom': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 20h16v2H4z"></path></svg>'
  };

  SUBTITLE_POSITIONS.forEach(pos => {
    const opt = document.createElement('button');
    opt.className = 'subpos-opt';
    const isActive = currentSubtitlePosition === pos.id;
    if (isActive) opt.classList.add('active');

    opt.innerHTML = `
      <span class="subpos-icon">${posIcons[pos.icon] || ''}</span>
      <div class="subpos-label">
        ${pos.label}
        <span class="subpos-desc">${pos.desc}</span>
      </div>
    `;

    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      applySubtitlePosition(pos.id);
      buildSubPosMenu();
      closeSubPosDropdown();
      showControls();
      showToast('Subtitle Position', `Position set to: ${pos.label}`, 'info');
    });

    playerSubPosDropdown.appendChild(opt);
  });
}

/* ===== END SUBTITLE POSITION FUNCTIONS ===== */

function toggleSubDropdown() {
  const isOpen = playerSubDropdown.classList.contains('open');
  if (isOpen) {
    closeSubDropdown();
  } else {
    closeQualityDropdown();
    closeSpeedDropdown();
    buildSubtitleMenu();
    playerSubDropdown.classList.add('open');
    playerSubBtn.classList.add('active');
  }
}

function closeSubDropdown() {
  playerSubDropdown.classList.remove('open');
  playerSubBtn.classList.remove('active');
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(hideControls, 3000);
}

function buildSubtitleMenu() {
  playerSubDropdown.innerHTML = '';

  // API key is hardcoded - no user configuration needed

  if (!currentSubtitleTracks || currentSubtitleTracks.length === 0) {
    playerSubDropdown.innerHTML = '<div class="sub-empty">No subtitles available</div>';
    return;
  }
  currentSubtitleTracks.forEach((sub, idx) => {
    const opt = document.createElement('button');
    opt.className = 'sub-opt';
    const isActive = selectedSubtitleUrl === sub.url;
    if (isActive) opt.classList.add('active');

    // Use full language name instead of raw code
    const rawLang = sub.languageName || sub.language || sub.lang || 'Unknown';
    const langName = getLanguageName(rawLang);

    opt.innerHTML = `${langName} <span class="sub-lang">${sub.format || 'SRT'}</span>`;
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSubtitle(sub.url, sub.language);
      buildSubtitleMenu();
      closeSubDropdown();
      showControls();
    });
    playerSubDropdown.appendChild(opt);
  });
  // Add "Off" option
  const offOpt = document.createElement('button');
  offOpt.className = 'sub-opt';
  if (!selectedSubtitleUrl && !subtitlesEnabled) offOpt.classList.add('active');
  offOpt.innerHTML = 'Off';
  offOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    disableSubtitles();
    buildSubtitleMenu();
    closeSubDropdown();
    showControls();
  });
  playerSubDropdown.appendChild(offOpt);
}

async function loadSubtitle(url, lang) {
  if (!url) return;
  selectedSubtitleUrl = url;
  subtitlesEnabled = true;

  // Remove existing subtitle tracks and revoke old blob URLs
  const existing = playerVideo.querySelectorAll('track');
  existing.forEach(t => {
    if (t.src && t.src.startsWith('blob:')) {
      URL.revokeObjectURL(t.src);
    }
    t.remove();
  });

  // Show loading state
  playerSubBtn.classList.add('active');
  playerTopSubtitle.textContent = 'Loading subtitles...';

  // Fetch subtitle content
  const result = await fetchSubtitleContent(url);
  if (result.error) {
    console.error('[Subtitles] Failed to load:', result.error);
    showToast('Subtitle Error', 'Failed to load subtitle: ' + result.error, 'error');
    playerSubBtn.classList.remove('active');
    playerTopSubtitle.textContent = 'Subtitle failed to load';
    return;
  }

  // Detect format from URL or content
  const format = url.toLowerCase().endsWith('.srt') ? 'srt' : 
                 url.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt';

  // Convert to WebVTT and create Blob URL (bypasses CORS)
  const blobUrl = createSubtitleBlobUrl(result.content, format);

  // Create and add track element
  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.label = lang || 'Subtitle';
  track.srclang = lang || 'en';
  track.src = blobUrl;
  track.default = true;

  playerVideo.appendChild(track);

  // Force the track to show using textTracks API
  const video = playerVideo;

  // Wait a moment for the track to be processed
  setTimeout(() => {
    if (video.textTracks && video.textTracks.length > 0) {
      const textTrack = video.textTracks[video.textTracks.length - 1];
      textTrack.mode = 'showing';

      // Monitor cue changes for debugging
      textTrack.oncuechange = () => {
        const cues = textTrack.activeCues;
        if (cues && cues.length > 0) {
          console.log('[Subtitles] Active cue:', cues[0].text);
        }
      };
    }
  }, 500);

  playerSubBtn.classList.add('active');
  const displayLang = getLanguageName(lang);
  playerTopSubtitle.textContent = 'Subtitles: ' + (displayLang || 'On');
  showToast('Subtitle', `Loaded: ${lang || 'Subtitle'}`, 'success');

  console.log('[Subtitles] Track loaded successfully. Blob URL created.');
}

function disableSubtitles() {
  subtitlesEnabled = false;
  selectedSubtitleUrl = null;

  // Get all track elements BEFORE removing them
  const existing = playerVideo.querySelectorAll('track');

  existing.forEach(t => {
    // First disable the track
    t.mode = 'disabled';

    // Revoke blob URL to prevent memory leaks
    if (t.src && t.src.startsWith('blob:')) {
      URL.revokeObjectURL(t.src);
    }

    // CRITICAL FIX: Actually remove the track from the DOM
    // Just setting mode='disabled' is not enough in all browsers
    if (t.parentNode) {
      t.parentNode.removeChild(t);
    }
  });

  // Also clear any textTracks that might be cached
  if (playerVideo.textTracks) {
    for (let i = 0; i < playerVideo.textTracks.length; i++) {
      playerVideo.textTracks[i].mode = 'disabled';
    }
  }

  playerSubBtn.classList.remove('active');
  playerTopSubtitle.textContent = 'Subtitles: Off';

  console.log('[Subtitles] Disabled and removed all tracks');
}

function closeSpeedDropdown() {
  playerSpeedDropdown.classList.remove('open');
  playerSpeedBtn.classList.remove('open');
  // Reset inline styles
  playerSpeedDropdown.style.removeProperty('position');
  playerSpeedDropdown.style.removeProperty('left');
  playerSpeedDropdown.style.removeProperty('bottom');
  playerSpeedDropdown.style.removeProperty('top');
  playerSpeedDropdown.style.removeProperty('right');
  // Restart auto-hide timer when dropdown closes
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(hideControls, 3000);
}

/* Subtitles toggle */

/* Quality selector */

/* ============================================================
   SMART PLAYBACK ENGINE v2.0 — Reliable Automatic Source-Switching
   ============================================================ */

// ── SOURCE HEALTH TRACKING ──
const SOURCE_SCORE_KEY = 'zedstream_source_scores';
const MAX_SCORE_HISTORY = 20;
const SCORE_DECAY_MS = 7 * 24 * 60 * 60 * 1000;

function getSourceScores() {
  try {
    const raw = localStorage.getItem(SOURCE_SCORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const cleaned = {};
    for (const [url, data] of Object.entries(parsed)) {
      if (now - data.lastUpdate < SCORE_DECAY_MS) cleaned[url] = data;
    }
    return cleaned;
  } catch(e) { return {}; }
}

function saveSourceScores(scores) {
  localStorage.setItem(SOURCE_SCORE_KEY, JSON.stringify(scores));
}

function recordSourceAttempt(url, success, timeToFirstFrame, errorType) {
  const scores = getSourceScores();
  if (!scores[url]) scores[url] = { attempts: [], lastUpdate: Date.now(), avgTTFF: 0 };
  const entry = scores[url];
  entry.attempts.push({ success, timeToFirstFrame, errorType, timestamp: Date.now() });
  if (entry.attempts.length > MAX_SCORE_HISTORY) entry.attempts = entry.attempts.slice(-MAX_SCORE_HISTORY);
  entry.lastUpdate = Date.now();
  const successfulTTFFs = entry.attempts.filter(a => a.success && a.timeToFirstFrame).map(a => a.timeToFirstFrame);
  entry.avgTTFF = successfulTTFFs.length > 0 ? successfulTTFFs.reduce((a, b) => a + b, 0) / successfulTTFFs.length : Infinity;
  saveSourceScores(scores);
}

function calculateSourceScore(url, quality) {
  const scores = getSourceScores();
  const entry = scores[url];
  if (!entry || entry.attempts.length === 0) return 0.5;
  const attempts = entry.attempts;
  const successRate = attempts.filter(a => a.success).length / attempts.length;
  let speedScore = 0.5;
  if (entry.avgTTFF !== Infinity) speedScore = Math.max(0, Math.min(1, 1 - (entry.avgTTFF - 2000) / 8000));
  let qualityScore = 0.5;
  if (quality) {
    const map = { '4K': 1.0, '2160p': 1.0, '1440p': 0.95, '1080p': 0.9, '720p': 0.7, '480p': 0.5, '360p': 0.3 };
    qualityScore = map[quality] || 0.5;
  }
  const score = (successRate * 0.45) + (speedScore * 0.30) + (qualityScore * 0.25);
  const lastAttempt = attempts[attempts.length - 1];
  if (!lastAttempt.success) {
    const minutesSinceFail = (Date.now() - lastAttempt.timestamp) / 60000;
    if (minutesSinceFail < 30) return score * 0.3;
    else if (minutesSinceFail < 120) return score * 0.6;
  }
  return score;
}

function rankSources(sources) {
  if (!sources || sources.length === 0) return [];
  return sources.map(src => ({
    ...src,
    _score: calculateSourceScore(src.url, src.quality),
    _qualityRank: qualityToRank(src.quality)
  })).sort((a, b) => {
    if (Math.abs(a._score - b._score) > 0.15) return b._score - a._score;
    return b._qualityRank - a._qualityRank;
  });
}

function qualityToRank(quality) {
  const map = { '4K': 7, '2160p': 7, '1440p': 6, '1080p': 5, '720p': 4, '480p': 3, '360p': 2, 'Auto': 1 };
  return map[quality] || 0;
}

let fallbackState = { currentSourceIndex: 0, sources: [], isAutoSwitching: false, retryCount: 0, maxRetries: 2, lastErrorType: null, loadStartTime: 0, sourceSwitchTimer: null };

function resetFallbackState() {
  fallbackState = { currentSourceIndex: 0, sources: [], isAutoSwitching: false, retryCount: 0, maxRetries: 2, lastErrorType: null, loadStartTime: 0, sourceSwitchTimer: null };
}

let bandwidthMonitor = { samples: [], lastCheck: 0, stallCount: 0, downgradePending: false, upgradePending: false, currentLevel: -1 };

function recordBandwidthSample(bps) {
  const now = Date.now();
  bandwidthMonitor.samples.push({ bps, timestamp: now });
  bandwidthMonitor.samples = bandwidthMonitor.samples.filter(s => now - s.timestamp < 30000);
  bandwidthMonitor.lastCheck = now;
}

function getAverageBandwidth() {
  if (bandwidthMonitor.samples.length === 0) return null;
  return bandwidthMonitor.samples.reduce((a, s) => a + s.bps, 0) / bandwidthMonitor.samples.length;
}

function shouldDowngradeQuality() { return bandwidthMonitor.stallCount >= 3; }

function shouldUpgradeQuality() {
  const avgBps = getAverageBandwidth();
  if (!avgBps || !hlsInstance) return false;
  const currentLevel = hlsInstance.currentLevel;
  if (currentLevel < 0) return false;
  const levels = hlsInstance.levels;
  if (!levels || currentLevel >= levels.length - 1) return false;
  const nextLevel = levels[currentLevel + 1];
  if (!nextLevel || !nextLevel.bitrate) return false;
  return avgBps > nextLevel.bitrate * 2;
}

function autoSwitchSource() {
  if (fallbackState.isAutoSwitching) return;
  if (fallbackState.sources.length === 0) return;
  fallbackState.isAutoSwitching = true;
  fallbackState.currentSourceIndex++;
  if (fallbackState.currentSourceIndex >= fallbackState.sources.length) {
    playerLoading.classList.add('hidden-loading');
    playerErrorMsg.textContent = 'All video sources are currently unavailable. Please try again later.';
    playerErrorOverlay.classList.add('active');
    fallbackState.isAutoSwitching = false;
    return;
  }
  const nextSource = fallbackState.sources[fallbackState.currentSourceIndex];
  playerLoading.classList.remove('hidden-loading');
  playerLoadingText.textContent = `Source ${fallbackState.currentSourceIndex} failed. Trying alternative ${fallbackState.currentSourceIndex + 1}/${fallbackState.sources.length}...`;
  currentQuality = nextSource;
  playerTopSubtitle.textContent = `${nextSource.quality || 'Auto'}`;
  clearTimeout(fallbackState.sourceSwitchTimer);
  fallbackState.sourceSwitchTimer = setTimeout(() => { loadVideoSource(nextSource.url, nextSource.type, currentSubtitles, true); }, 800);
}

async function loadEmbeddedSubtitles(subtitles) {
  for (const sub of subtitles) {
    try {
      const subResult = await fetchSubtitleContent(sub.url);
      if (!subResult.error) {
        const format = sub.url.toLowerCase().endsWith('.srt') ? 'srt' : 'vtt';
        const blobUrl = createSubtitleBlobUrl(subResult.content, format);
        const track = document.createElement('track');
        track.kind = 'subtitles'; track.label = sub.label || 'Subtitle'; track.srclang = sub.lang || 'en';
        track.src = blobUrl; if (sub.default) track.default = true;
        playerVideo.appendChild(track);
      }
    } catch(e) { console.error('[SmartPlayback] Failed to load embedded subtitle:', e); }
  }
  setTimeout(() => { const tracks = playerVideo.querySelectorAll('track'); tracks.forEach(t => t.mode = subtitlesEnabled ? 'showing' : 'hidden'); }, 1000);
}

function buildQualityMenu(sources) {
  currentSources = sources || [];
  playerQualityDropdown.innerHTML = '';

  if (!sources || sources.length === 0) {
    playerQualityDropdown.innerHTML = `<div class="quality-opt" style="cursor:default;opacity:0.4">No options</div>`;
    return;
  }

  // ── HLS LEVELS (adaptive bitrate) ──
  if (hlsInstance && hlsInstance.levels && hlsInstance.levels.length > 1) {
    const hlsHeader = document.createElement('div');
    hlsHeader.className = 'quality-group-label';
    hlsHeader.textContent = 'Quality';
    hlsHeader.style.cssText = 'padding: 10px 18px 6px; font-size: 11px; color: var(--text-quaternary); text-transform: uppercase; letter-spacing: 1px; font-weight: 700;';
    playerQualityDropdown.appendChild(hlsHeader);

    // Auto option
    const autoOpt = document.createElement('button');
    autoOpt.className = 'quality-opt';
    autoOpt.innerHTML = `Auto <span class="prov-name">Adaptive Bitrate</span>`;
    if (hlsInstance.currentLevel === -1) autoOpt.classList.add('active');
    autoOpt.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      hlsInstance.currentLevel = -1; 
      buildQualityMenu(currentSources); 
      closeQualityDropdown(); 
      showToast('Quality', 'Switched to Auto (adaptive bitrate)', 'info'); 
    });
    playerQualityDropdown.appendChild(autoOpt);

    // Sort levels by height descending
    const sortedLevels = hlsInstance.levels.map((level, idx) => ({ level, idx })).sort((a, b) => (b.level.height || 0) - (a.level.height || 0));
    sortedLevels.forEach(({ level, idx }) => {
      const levelOpt = document.createElement('button');
      levelOpt.className = 'quality-opt';
      const height = level.height || '?';
      const levelName = level.name || height + 'p';
      const bitrate = level.bitrate ? (level.bitrate / 1000000).toFixed(1) + ' Mbps' : '';
      const codec = level.videoCodec ? level.videoCodec.split('.')[0].toUpperCase() : '';
      levelOpt.innerHTML = `${levelName} <span class="prov-name">${bitrate}${codec ? ' • ' + codec : ''}</span>`;
      if (hlsInstance.currentLevel === idx) levelOpt.classList.add('active');
      levelOpt.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        hlsInstance.currentLevel = idx; 
        buildQualityMenu(currentSources); 
        closeQualityDropdown(); 
        showToast('Quality', `Switched to ${levelName}`, 'info'); 
      });
      playerQualityDropdown.appendChild(levelOpt);
    });
  } 
  // ── NON-HLS: Show quality formats from sources ──
  else {
    // Group sources by quality label
    const qualityMap = new Map();
    sources.forEach(src => {
      const q = src.quality || 'Auto';
      if (!qualityMap.has(q)) {
        qualityMap.set(q, []);
      }
      qualityMap.get(q).push(src);
    });

    // Sort qualities by resolution rank (highest first)
    const qualityOrder = ['4K', '2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', 'Auto'];
    const sortedQualities = Array.from(qualityMap.keys()).sort((a, b) => {
      const rankA = qualityOrder.indexOf(a);
      const rankB = qualityOrder.indexOf(b);
      if (rankA !== -1 && rankB !== -1) return rankA - rankB;
      if (rankA !== -1) return -1;
      if (rankB !== -1) return 1;
      return a.localeCompare(b);
    });

    if (sortedQualities.length > 1) {
      const qualityHeader = document.createElement('div');
      qualityHeader.className = 'quality-group-label';
      qualityHeader.textContent = 'Quality';
      qualityHeader.style.cssText = 'padding: 10px 18px 6px; font-size: 11px; color: var(--text-quaternary); text-transform: uppercase; letter-spacing: 1px; font-weight: 700;';
      playerQualityDropdown.appendChild(qualityHeader);

      sortedQualities.forEach(q => {
        const srcList = qualityMap.get(q);
        const bestSrc = srcList[0]; // pick first source with this quality
        const opt = document.createElement('button');
        opt.className = 'quality-opt';
        const isActive = currentQuality && currentQuality.quality === q;
        if (isActive) opt.classList.add('active');
        const typeLabel = bestSrc.type === 'hls' ? 'HLS' : (bestSrc.type || 'MP4');
        opt.innerHTML = `${q} <span class="prov-name">${typeLabel}</span>`;
        opt.addEventListener('click', (e) => { 
          e.stopPropagation(); 
          // Find the best source with this quality
          const targetSrc = srcList.find(s => s.url) || bestSrc;
          switchQuality(targetSrc); 
        });
        playerQualityDropdown.appendChild(opt);
      });
    } else if (sortedQualities.length === 1) {
      // Only one quality available, show it
      const q = sortedQualities[0];
      const srcList = qualityMap.get(q);
      const bestSrc = srcList[0];
      const opt = document.createElement('button');
      opt.className = 'quality-opt active';
      const typeLabel = bestSrc.type === 'hls' ? 'HLS' : (bestSrc.type || 'MP4');
      opt.innerHTML = `${q} <span class="prov-name">${typeLabel}</span>`;
      opt.style.cursor = 'default';
      opt.style.opacity = '0.6';
      playerQualityDropdown.appendChild(opt);
    }
  }

  updateQualityLabel();
}

function switchQuality(src) {
  currentQuality = src;
  const currentTime = playerVideo.currentTime || 0;
  const wasPlaying = !playerVideo.paused;

  playerTopSubtitle.textContent = `${src.quality || 'Auto'}`;
  loadVideoSource(src.url, src.type, currentSubtitles);

  const checkLoaded = setInterval(() => {
    if (playerVideo.readyState >= 1) {
      playerVideo.currentTime = currentTime;
      if (wasPlaying) playerVideo.play().catch(() => {});
      clearInterval(checkLoaded);
    }
  }, 100);
  setTimeout(() => { clearInterval(checkLoaded); }, 5000);

  closeQualityDropdown();
  buildQualityMenu(currentSources);
}

function updateQualityLabel() {
  let label = 'Auto';
  if (hlsInstance && hlsInstance.currentLevel >= 0 && hlsInstance.levels && hlsInstance.levels[hlsInstance.currentLevel]) {
    const level = hlsInstance.levels[hlsInstance.currentLevel];
    label = level.name || (level.height ? level.height + 'p' : 'HD');
  } else if (hlsInstance && hlsInstance.currentLevel === -1) {
    label = 'Auto';
  } else if (currentQuality) {
    label = currentQuality.quality || 'Auto';
  }
  qualityLabel.textContent = label;

}

/* Toggle quality dropdown - fallback function */
function toggleQualityDropdown(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  if (!currentSources || currentSources.length === 0) {
    console.log('[Quality] No sources available');
    showToast('Quality', 'No quality options available yet', 'info');
    return;
  }
  buildQualityMenu(currentSources);
  const isOpen = playerQualityDropdown.classList.contains('open');
  if (isOpen) {
    closeQualityDropdown();
  } else {
    closeSpeedDropdown();
    // Position dropdown near the clicked button using fixed positioning
    const btn = e ? e.currentTarget : playerQualityBtn;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      // Use fixed positioning relative to viewport to avoid clipping issues
      // DROP UP: position above the clicked button
      playerQualityDropdown.style.setProperty('position', 'fixed', 'important');
      playerQualityDropdown.style.setProperty('left', rect.left + 'px', 'important');
      playerQualityDropdown.style.setProperty('bottom', (window.innerHeight - rect.top + 8) + 'px', 'important');
      playerQualityDropdown.style.setProperty('top', 'auto', 'important');
      playerQualityDropdown.style.setProperty('right', 'auto', 'important');
    } else {
      // Fallback: position above controls bar (drop up)
      playerQualityDropdown.style.setProperty('position', 'absolute', 'important');
      playerQualityDropdown.style.setProperty('left', 'auto', 'important');
      playerQualityDropdown.style.setProperty('top', 'auto', 'important');
      playerQualityDropdown.style.setProperty('bottom', 'calc(100% + 12px)', 'important');
      playerQualityDropdown.style.setProperty('right', '0', 'important');
    }
    playerQualityDropdown.classList.add('open');
    playerQualityBtn.classList.add('open');
    console.log('[Quality] Dropdown opened with', playerQualityDropdown.children.length, 'items');
  }
  showControls();
}

function closeQualityDropdown() {
  playerQualityDropdown.classList.remove('open');
  playerQualityBtn.classList.remove('open');
  // Restart auto-hide timer when dropdown closes
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(hideControls, 3000);
}



/* Fullscreen */
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    playerModal.requestFullscreen().catch(() => {});
  }
}

// Lock screen to landscape when entering fullscreen (Android WebView support)
function lockLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function unlockOrientation() {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
}

playerFsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fsEnterIcon.style.display = 'none';
    fsExitIcon.style.display = 'block';
    lockLandscape();
  } else {
    fsEnterIcon.style.display = 'block';
    fsExitIcon.style.display = 'none';
    unlockOrientation();
  }
});

/* Back button */
playerBackBtn.addEventListener('click', (e) => { e.stopPropagation(); closePlayer(); });

/* Click video area to toggle play/pause */
playerVideoArea.addEventListener('click', (e) => {
  // Only toggle if clicking directly on the video area, not on interactive elements
  const target = e.target;
  const isInteractive = target.closest('.player-center-btn, .player-control-btn, .player-quality-btn, .player-speed-btn, .player-sub-btn, .player-back-btn, .player-progress-area, .player-volume-slider, .player-quality-dropdown, .player-speed-dropdown, .player-sub-dropdown, .next-toast-btn');
  if (isInteractive) return;
  togglePlayPause();
});

/* Mouse move shows controls */
playerModal.addEventListener('mousemove', () => { showControls(); });
playerModal.addEventListener('mouseleave', () => { if (!playerVideo.paused) hideControls(); });

/* Keyboard shortcuts */
document.addEventListener('keydown', (e) => {
  if (!playerModal.classList.contains('active')) return;

  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  switch(e.key) {
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      playerVideo.currentTime = Math.max(0, playerVideo.currentTime - 5);
      showControls();
      break;
    case 'ArrowRight':
      e.preventDefault();
      playerVideo.currentTime = Math.min(playerVideo.duration || Infinity, playerVideo.currentTime + 5);
      showControls();
      break;
    case 'ArrowUp':
      e.preventDefault();
      playerVideo.volume = Math.min(1, playerVideo.volume + 0.1);
      playerVideo.muted = false;
      updateVolumeUI();
      showControls();
      break;
    case 'ArrowDown':
      e.preventDefault();
      playerVideo.volume = Math.max(0, playerVideo.volume - 0.1);
      updateVolumeUI();
      showControls();
      break;
    case 'f':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'm':
      e.preventDefault();
      playerVolumeBtn.click();
      break;
    case 'c':
    case 'C':
      e.preventDefault();
      toggleSubDropdown();
      break;
    case 'v':
    case 'V':
      e.preventDefault();
      toggleSubPosDropdown();
      break;
    case 'n':
    case 'N':
      e.preventDefault();
      if (nextEpisodeData) {
        playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
      }
      break;
    case 'p':
    case 'P':
      e.preventDefault();
      if (prevEpisodeData) {
        playEpisode(prevEpisodeData.tmdbId, prevEpisodeData.season, prevEpisodeData.episode, prevEpisodeData.showName, prevEpisodeData.name);
      }
      break;
    case 'Escape':
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        closePlayer();
      }
      break;
  }
});

/* Video event handlers */
playerVideo.addEventListener('waiting', () => {
  playerBufferRing.classList.add('visible');
});
playerVideo.addEventListener('playing', () => {
  playerBufferRing.classList.remove('visible');
  playerLoading.classList.add('hidden-loading');
  playerErrorOverlay.classList.remove('active');
});
playerVideo.addEventListener('canplay', () => {
  playerLoading.classList.add('hidden-loading');
  playerBufferRing.classList.remove('visible');
});
playerVideo.addEventListener('error', () => {
  playerLoading.classList.add('hidden-loading');
  playerBufferRing.classList.remove('visible');
  playerErrorMsg.textContent = 'Failed to load the video stream. The source may be unavailable.';
  playerErrorOverlay.classList.add('active');
});
playerVideo.addEventListener('ended', () => {
  updatePlayPauseIcons(false);
  showControls();
  if (nextEpisodeData) {
    // Auto-play next episode after a brief 3-second delay (to show "Up Next" toast)
    showNextEpisodeToast();
  }
  // Mark as finished in continue watching
  if (currentPlayingItem) {
    const key = currentPlayingItem.type === 'tv' 
      ? `${currentPlayingItem.item.id}_S${currentPlayingItem.season}E${currentPlayingItem.episode}`
      : String(currentPlayingItem.item.id);
    removeFromContinue(key);
  }
});

/* Error retry */
playerErrorRetry.addEventListener('click', (e) => {
  e.stopPropagation();
  playerErrorOverlay.classList.remove('active');
  playerControlsBar.classList.remove('hidden-bar');
  playerTopBar.classList.remove('hidden-bar');
  showControls();
  if (fallbackState.sources.length > 0 && fallbackState.currentSourceIndex < fallbackState.sources.length - 1) {
    autoSwitchSource();
  } else if (currentQuality) {
    const currentTime = playerVideo.currentTime || 0;
    const wasPlaying = !playerVideo.paused;
    loadVideoSourceForQuality(currentQuality.url, currentQuality.type, currentSubtitles, currentTime, wasPlaying);
  }
});

/* Next episode */
let isAutoPlayingNext = false;

function showNextEpisodeToast() {
  if (!nextEpisodeData) return;
  nextEpisodeTitle.textContent = nextEpisodeData.name || `Episode ${nextEpisodeData.episode}`;
  nextEpisodeToast.classList.add('active');
  // Auto-play next episode after 3 seconds (brief toast to show what's coming)
  let countdown = 3;
  nextEpisodePlay.textContent = `Playing in ${countdown}s`;
  nextEpisodeTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(nextEpisodeTimer);
      nextEpisodeToast.classList.remove('active');
      isAutoPlayingNext = true;
      playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
      isAutoPlayingNext = false;
    } else {
      nextEpisodePlay.textContent = `Playing in ${countdown}s`;
    }
  }, 1000);
}

nextEpisodePlay.addEventListener('click', (e) => {
  e.stopPropagation();
  clearInterval(nextEpisodeTimer);
  nextEpisodeToast.classList.remove('active');
  if (nextEpisodeData) {
    isAutoPlayingNext = true;
    playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
    isAutoPlayingNext = false;
  }
});

nextEpisodeCancel.addEventListener('click', (e) => {
  e.stopPropagation();
  clearInterval(nextEpisodeTimer);
  nextEpisodeToast.classList.remove('active');
});

/* Close dropdowns on outside click */
document.addEventListener('click', (e) => {
  if (playerQualityBtn && playerQualityDropdown && 
      !playerQualityBtn.contains(e.target) && !playerQualityDropdown.contains(e.target)) {
    closeQualityDropdown();
  }
  if (playerSpeedBtn && playerSpeedDropdown && 
      !playerSpeedBtn.contains(e.target) && !playerSpeedDropdown.contains(e.target)) {
    closeSpeedDropdown();
  }
  if (playerSubBtn && playerSubDropdown &&
      !playerSubBtn.contains(e.target) && !playerSubDropdown.contains(e.target)) {
    closeSubDropdown();
  }
  if (playerSubPosBtn && playerSubPosDropdown &&
      !playerSubPosBtn.contains(e.target) && !playerSubPosDropdown.contains(e.target)) {
    closeSubPosDropdown();
  }
});

/* ── PLAYBACK ENGINE ── */

/* Load video source for quality switching (preserves HLS instance) */
function loadVideoSourceForQuality(url, type, subtitles, resumeTime, wasPlaying) {
  playerLoading.classList.remove('hidden-loading');
  playerLoadingText.textContent = 'Switching quality...';
  playerErrorOverlay.classList.remove('active');
  const isHls = type === 'hls';
  if (isHls && hlsInstance) {
    hlsInstance.loadSource(url);
    const onManifestParsed = () => {
      hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      playerLoading.classList.add('hidden-loading');
      if (resumeTime > 0) playerVideo.currentTime = resumeTime;
      if (wasPlaying) playerVideo.play().catch(() => {});
      buildQualityMenu(currentSources);
    };
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, () => buildQualityMenu(currentSources));
    setTimeout(() => { hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed); playerLoading.classList.add('hidden-loading'); }, 8000);
  } else {
    loadVideoSource(url, type, subtitles);
    const checkLoaded = setInterval(() => {
      if (playerVideo.readyState >= 1) {
        if (resumeTime > 0) playerVideo.currentTime = resumeTime;
        if (wasPlaying) playerVideo.play().catch(() => {});
        clearInterval(checkLoaded);
      }
    }, 100);
    setTimeout(() => clearInterval(checkLoaded), 5000);
  }
}

function loadVideoSource(url, type, subtitles, isFallback) {
  destroyHls();
  const oldVideo = playerVideo;
  const newVideo = oldVideo.cloneNode(false);
  oldVideo.parentNode.replaceChild(newVideo, oldVideo);
  playerVideo = newVideo;
  attachVideoListeners();
  playerLoading.classList.remove('hidden-loading');
  playerLoadingText.textContent = isFallback ? 'Switching to alternative source...' : 'Loading stream...';
  playerErrorOverlay.classList.remove('active');
  playerBufferRing.classList.remove('visible');
  fallbackState.loadStartTime = Date.now();
  const isHls = type === 'hls';

  if (isHls && Hls.isSupported()) {
    const hls = new Hls({
      maxBufferLength: 30, maxMaxBufferLength: 60, enableWorker: true, startLevel: -1,
      abrEwmaDefaultEstimate: 500000, abrBandWidthFactor: 0.95, abrBandWidthUpFactor: 0.7,
      manifestLoadingMaxRetry: 2, manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 2, levelLoadingRetryDelay: 1000,
      fragLoadingMaxRetry: 3, fragLoadingRetryDelay: 1000,
      lowLatencyMode: false, backBufferLength: 90
    });
    hls.loadSource(url);
    hls.attachMedia(playerVideo);

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      if (data.stats && data.stats.bwEstimate) recordBandwidthSample(data.stats.bwEstimate);
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      bandwidthMonitor.currentLevel = data.level;
      const level = hls.levels[data.level];
      console.log('[SmartPlayback] Quality switched to:', level ? (level.name || level.height + 'p') : 'auto');
      buildQualityMenu(currentSources);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const ttff = Date.now() - fallbackState.loadStartTime;
      recordSourceAttempt(url, true, ttff);
      playerLoading.classList.add('hidden-loading');
      const tryPlay = () => {
        if (playerVideo.paused) playerVideo.play().catch((err) => { if (err.name === 'NotAllowedError') setTimeout(tryPlay, 200); });
      };
      tryPlay();
      if (data.levels && data.levels.length > 1) buildQualityMenu(currentSources);
      fallbackState.retryCount = 0;
      fallbackState.isAutoSwitching = false;
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log('[SmartPlayback] HLS error:', data.type, data.details, data.fatal ? 'FATAL' : 'recoverable');
      if (data.fatal) {
        fallbackState.lastErrorType = data.type;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (fallbackState.retryCount < fallbackState.maxRetries) {
            fallbackState.retryCount++;
            playerLoadingText.textContent = `Connection issue, retrying (${fallbackState.retryCount}/${fallbackState.maxRetries})...`;
            hls.startLoad();
          } else {
            recordSourceAttempt(url, false, null, 'network_fatal');
            autoSwitchSource();
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          setTimeout(() => {
            if (fallbackState.lastErrorType === Hls.ErrorTypes.MEDIA_ERROR) {
              recordSourceAttempt(url, false, null, 'media_fatal');
              autoSwitchSource();
            }
          }, 3000);
        } else {
          recordSourceAttempt(url, false, null, 'fatal_' + data.type);
          autoSwitchSource();
        }
      }
    });
    hls.on(Hls.Events.BUFFER_STALLED_ERROR, () => {
      bandwidthMonitor.stallCount++;
      if (shouldDowngradeQuality() && !bandwidthMonitor.downgradePending) {
        bandwidthMonitor.downgradePending = true;
        const currentLevel = hls.currentLevel;
        if (currentLevel > 0) {
          hls.currentLevel = Math.max(0, currentLevel - 1);
          showToast('Quality Adjusted', 'Switched to lower quality for smoother playback', 'info');
        }
        setTimeout(() => { bandwidthMonitor.stallCount = 0; bandwidthMonitor.downgradePending = false; }, 10000);
      }
    });
    hlsInstance = hls;
    if (subtitles && subtitles.length > 0) loadEmbeddedSubtitles(subtitles);
  } else if (isHls && playerVideo.canPlayType('application/vnd.apple.mpegurl')) {
    playerVideo.src = url;
    playerVideo.addEventListener('loadedmetadata', () => {
      const ttff = Date.now() - fallbackState.loadStartTime;
      recordSourceAttempt(url, true, ttff);
      playerLoading.classList.add('hidden-loading');
      playerVideo.play().catch(() => {});
    }, { once: true });
    playerVideo.addEventListener('error', () => { recordSourceAttempt(url, false, null, 'native_error'); autoSwitchSource(); }, { once: true });
  } else {
    playerVideo.src = url;
    playerVideo.addEventListener('loadedmetadata', () => {
      const ttff = Date.now() - fallbackState.loadStartTime;
      recordSourceAttempt(url, true, ttff);
      playerLoading.classList.add('hidden-loading');
      playerVideo.play().catch(() => {});
    }, { once: true });
    playerVideo.addEventListener('error', () => { recordSourceAttempt(url, false, null, 'direct_error'); autoSwitchSource(); }, { once: true });
  }
  playerVideo.playbackRate = currentPlaybackSpeed;
}

function attachVideoListeners() {
  playerVideo.addEventListener('play', () => {
    updatePlayPauseIcons(true);
    playerCenterBtn.classList.remove('visible');
    showControls();
  });
  playerVideo.addEventListener('pause', () => {
    updatePlayPauseIcons(false);
    playerCenterBtn.classList.add('visible');
    showControls();
  });
  playerVideo.addEventListener('timeupdate', updateProgress);
  playerVideo.addEventListener('progress', updateProgress);
  playerVideo.addEventListener('waiting', () => { playerBufferRing.classList.add('visible'); });
  playerVideo.addEventListener('playing', () => {
    playerBufferRing.classList.remove('visible');
    playerLoading.classList.add('hidden-loading');
    playerErrorOverlay.classList.remove('active');
  });
  playerVideo.addEventListener('canplay', () => {
    playerLoading.classList.add('hidden-loading');
    playerBufferRing.classList.remove('visible');
  });
  playerVideo.addEventListener('error', () => {
    playerLoading.classList.add('hidden-loading');
    playerBufferRing.classList.remove('visible');
    playerErrorMsg.textContent = 'Failed to load the video stream. The source may be unavailable.';
    playerErrorOverlay.classList.add('active');
    playerControlsBar.classList.add('hidden-bar');
    playerTopBar.classList.add('hidden-bar');
  });
  
  
}

function destroyHls() {
  if (hlsInstance) {
    try { hlsInstance.detachMedia(); hlsInstance.destroy(); } catch(e) {}
    hlsInstance = null;
  }
}

/* ── PLAY MOVIE / EPISODE ── */

async function playMovie(item) {
  if (!gateContentAccess()) return;
  if (currentUser && currentUser.email) {
    const result = await getUserSubscription(currentUser.email);
    if (!result.error && result.subscription) {
      const lockouts = result.subscription.deviceLockouts || [];
      if (lockouts.find(l => l.deviceId === deviceId)) {
        showToast('Access Denied', 'This device was removed from your account. Signing out...', 'error');
        setTimeout(() => logoutUser(), 2000);
        return;
      }
    }
  }
  closeDetails();
  if (!item.tmdb_id) {
    openPlayerUI(item.title || item.name, 'No TMDB ID');
    playerTopSubtitle.textContent = 'Cannot play: missing TMDB ID';
    playerLoading.classList.add('hidden-loading');
    return;
  }
  openPlayerUI(item.title || item.name, 'Loading stream...');
  bandwidthMonitor = { samples: [], lastCheck: 0, stallCount: 0, downgradePending: false, upgradePending: false, currentLevel: -1 };
  currentSubtitleTracks = []; selectedSubtitleUrl = null; playerSubBtn.classList.remove('active');
  const subResult = await fetchSubtitles(item.tmdb_id);
  if (!subResult.error && subResult.subtitles) currentSubtitleTracks = subResult.subtitles;
  currentPlayingItem = { item: item, type: 'movie', season: null, episode: null, episodeName: null };
  const data = await getMovieStreams(item.tmdb_id);
  if (data && !data.error && data.sources && data.sources.length > 0) {
    currentSources = data.sources; currentSubtitles = data.subtitles || [];
    resetFallbackState(); fallbackState.sources = rankSources(data.sources);
    const best = fallbackState.sources[0]; currentQuality = best;
    playerTopSubtitle.textContent = `${best.quality || 'Auto'}`;
    loadVideoSource(best.url, best.type, data.subtitles);
    buildQualityMenu(data.sources);
  } else {
    playerTopSubtitle.textContent = data?.error || 'No sources available';
    playerLoading.classList.add('hidden-loading');
    playerErrorMsg.textContent = data?.error || 'No sources available for this title.';
    playerErrorOverlay.classList.add('active');
    playerControlsBar.classList.add('hidden-bar');
    playerTopBar.classList.add('hidden-bar');
  }
}

async function playEpisode(tmdbId, season, episode, showName, epName) {
  if (!gateContentAccess()) return;
  closeDetails();
  if (!tmdbId) {
    openPlayerUI('Episode', 'No TMDB ID');
    playerTopSubtitle.textContent = 'Cannot play: missing TMDB ID';
    playerLoading.classList.add('hidden-loading');
    return;
  }
  const label = showName ? `${showName} – S${season}E${episode}` : `S${season}E${episode}`;
  if (isAutoPlayingNext && playerModal.classList.contains('active')) {
    playerTopTitle.textContent = `${label}${epName ? ': ' + epName : ''}`;
    playerTopSubtitle.textContent = 'Loading next episode...';
    playerLoading.classList.remove('hidden-loading');
    playerLoadingText.textContent = 'Loading next episode...';
    playerErrorOverlay.classList.remove('active');
    nextEpisodeToast.classList.remove('active');
  } else {
    openPlayerUI(`${label}${epName ? ': ' + epName : ''}`, 'Loading stream...');
  }
  bandwidthMonitor = { samples: [], lastCheck: 0, stallCount: 0, downgradePending: false, upgradePending: false, currentLevel: -1 };
  currentSubtitleTracks = []; selectedSubtitleUrl = null; playerSubBtn.classList.remove('active');
  const subResult = await fetchSubtitles(tmdbId, season, episode);
  if (!subResult.error && subResult.subtitles) currentSubtitleTracks = subResult.subtitles;
  const itemForProgress = currentItem || (tvDetailData ? {
    id: tvDetailData.id, tmdb_id: tvDetailData.tmdb_id || tmdbId, title: showName, name: showName,
    poster_url: tvDetailData.poster_url || '', backdrop_url: tvDetailData.backdrop_url || '',
    vote_average: tvDetailData.vote_average || 0, genres: tvDetailData.genres || [],
    first_air_date: tvDetailData.first_air_date, overview: tvDetailData.overview || ''
  } : null);
  if (itemForProgress) currentPlayingItem = { item: itemForProgress, type: 'tv', season: season, episode: episode, episodeName: epName };
  try {
    const data = await getTVEpisodeStream(tmdbId, season, episode);
    if (data && !data.error && data.sources && data.sources.length > 0) {
      currentSources = data.sources; currentSubtitles = data.subtitles || [];
      resetFallbackState(); fallbackState.sources = rankSources(data.sources);
      const best = fallbackState.sources[0]; currentQuality = best;
      playerTopSubtitle.textContent = `${best.quality || 'Auto'}`;
      loadVideoSource(best.url, best.type, data.subtitles);
      buildQualityMenu(data.sources);
      nextEpisodeData = null; prevEpisodeData = null;
      if (tvDetailData && tvDetailData.seasons) {
        const currentSeason = tvDetailData.seasons.find(s => s.season_number === season);
        if (currentSeason && currentSeason.episodes) {
          const currentEpIdx = currentSeason.episodes.findIndex(ep => ep.episode_number === episode);
          if (currentEpIdx > 0) {
            const prevEp = currentSeason.episodes[currentEpIdx - 1];
            prevEpisodeData = { tmdbId, season, episode: prevEp.episode_number, showName, name: prevEp.name };
          } else if (currentEpIdx === 0) {
            const prevSeason = tvDetailData.seasons.find(s => s.season_number === season - 1);
            if (prevSeason && prevSeason.episodes && prevSeason.episodes.length > 0) {
              const prevEp = prevSeason.episodes[prevSeason.episodes.length - 1];
              prevEpisodeData = { tmdbId, season: season - 1, episode: prevEp.episode_number, showName, name: prevEp.name };
            }
          }
          if (currentEpIdx >= 0 && currentEpIdx < currentSeason.episodes.length - 1) {
            const nextEp = currentSeason.episodes[currentEpIdx + 1];
            nextEpisodeData = { tmdbId, season, episode: nextEp.episode_number, showName, name: nextEp.name };
          } else if (currentEpIdx === currentSeason.episodes.length - 1) {
            const nextSeason = tvDetailData.seasons.find(s => s.season_number === season + 1);
            if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
              const nextEp = nextSeason.episodes[0];
              nextEpisodeData = { tmdbId, season: season + 1, episode: nextEp.episode_number, showName, name: nextEp.name };
            }
          }
        }
      }
      if (!tvDetailData && tmdbId) {
        if (episode > 1) prevEpisodeData = { tmdbId, season, episode: episode - 1, showName, name: `Episode ${episode - 1}` };
        nextEpisodeData = { tmdbId, season, episode: episode + 1, showName, name: `Episode ${episode + 1}` };
      }
      updateEpisodeNavButtons();
    } else {
      playerTopSubtitle.textContent = data?.error || 'No sources available';
      playerLoading.classList.add('hidden-loading');
      playerErrorMsg.textContent = data?.error || 'No sources available for this episode.';
      playerErrorOverlay.classList.add('active');
    }
  } catch(e) {
    playerTopSubtitle.textContent = 'Failed to load episode';
    playerLoading.classList.add('hidden-loading');
    playerErrorMsg.textContent = 'Failed to load episode stream.';
    playerErrorOverlay.classList.add('active');
  }
}

function pickBestSource(sources) {
  const ranked = rankSources(sources);
  if (ranked.length === 0) return null;
  console.log('[SmartPlayback] Source ranking:');
  ranked.forEach((s, i) => console.log(`  ${i+1}. ${s.provider?.name || 'Unknown'} ${s.quality || 'Auto'} (score: ${s._score.toFixed(2)})`));
  return ranked[0];
}

setInterval(() => {
  if (hlsInstance && hlsInstance.currentLevel >= 0 && shouldUpgradeQuality() && !bandwidthMonitor.upgradePending) {
    bandwidthMonitor.upgradePending = true;
    const currentLevel = hlsInstance.currentLevel;
    const levels = hlsInstance.levels;
    if (currentLevel < levels.length - 1) {
      hlsInstance.currentLevel = currentLevel + 1;
      showToast('Quality Improved', 'Switched to higher quality', 'info');
    }
    setTimeout(() => { bandwidthMonitor.upgradePending = false; }, 30000);
  }
}, 15000);

window.debugSourceScores = function() {
  const scores = getSourceScores();
  console.log('=== SOURCE SCORES ===');
  for (const [url, data] of Object.entries(scores)) {
    const successRate = data.attempts.filter(a => a.success).length / data.attempts.length;
    console.log(`${url.substring(0, 60)}...`);
    console.log(`  Score: ${calculateSourceScore(url).toFixed(3)}`);
    console.log(`  Success rate: ${(successRate * 100).toFixed(1)}% (${data.attempts.filter(a => a.success).length}/${data.attempts.length})`);
    console.log(`  Avg TTFF: ${data.avgTTFF === Infinity ? 'N/A' : (data.avgTTFF / 1000).toFixed(2) + 's'}`);
    console.log(`  Last update: ${new Date(data.lastUpdate).toLocaleString()}`);
  }
  console.log('=====================');
  return scores;
};

window.clearSourceScores = function() {
  localStorage.removeItem(SOURCE_SCORE_KEY);
  console.log('Source scores cleared');
};

function closeDetails() { detailsModal.classList.remove('active'); document.body.style.overflow = ''; tvDetailData = null; }

/* ===== LANDSCAPE MODE FORCE ===== */
let _originalOrientation = null;
let _landscapeLockInterval = null;

function forceLandscapeMode() {
  // Store original orientation if not already stored
  if (!_originalOrientation && screen.orientation) {
    _originalOrientation = screen.orientation.type;
  }

  // Method 1: Try Screen Orientation API (Chrome, Android, modern browsers)
  if (screen.orientation && screen.orientation.lock) {
    // First request fullscreen, then lock orientation (required by spec)
    const enterFullscreen = () => {
      if (!document.fullscreenElement && playerModal.requestFullscreen) {
        return playerModal.requestFullscreen().catch(() => {});
      }
      return Promise.resolve();
    };

    enterFullscreen().then(() => {
      screen.orientation.lock('landscape').catch((err) => {
        console.log('[Landscape] Screen Orientation API failed:', err.message);
        // Fallback: use CSS rotation for unsupported browsers
        applyCSSLandscapeFallback();
      });
    });
  } else {
    // Method 2: CSS fallback for iOS Safari and unsupported browsers
    applyCSSLandscapeFallback();
  }

  // Method 3: Continuous check to maintain landscape
  _landscapeLockInterval = setInterval(() => {
    if (!playerModal.classList.contains('active')) {
      clearInterval(_landscapeLockInterval);
      _landscapeLockInterval = null;
      return;
    }
    const isLandscape = window.innerWidth > window.innerHeight;
    if (!isLandscape && window.innerWidth <= 900) {
      // Show rotate overlay
      const overlay = document.getElementById('landscapeOverlay');
      if (overlay) overlay.classList.add('active');
    } else {
      const overlay = document.getElementById('landscapeOverlay');
      if (overlay) overlay.classList.remove('active');
    }
  }, 500);
}

function applyCSSLandscapeFallback() {
  // For iOS Safari and browsers without Screen Orientation API
  // We use CSS to rotate the player container when in portrait
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait && window.innerWidth <= 900) {
    // Show the rotate overlay instead of forcing rotation
    // (CSS rotation causes touch coordinate issues)
    const overlay = document.getElementById('landscapeOverlay');
    if (overlay) overlay.classList.add('active');
  }
}

function unlockLandscapeMode() {
  // Clear the landscape check interval
  if (_landscapeLockInterval) {
    clearInterval(_landscapeLockInterval);
    _landscapeLockInterval = null;
  }

  // Hide landscape overlay
  const overlay = document.getElementById('landscapeOverlay');
  if (overlay) overlay.classList.remove('active');

  // Unlock Screen Orientation API
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock().catch(() => {});
  }

  // Exit fullscreen
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  _originalOrientation = null;
}

function closePlayer() {
  playerModal.classList.remove('active');
  nextEpisodeData = null;
  prevEpisodeData = null;
  updateEpisodeNavButtons();
  document.body.style.overflow = '';
  destroyHls();
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
  playerVideo.innerHTML = '';
  closeQualityDropdown();
  closeSpeedDropdown();
  nextEpisodeToast.classList.remove('active');
  if (nextEpisodeTimer) clearInterval(nextEpisodeTimer);
  if (progressSaveInterval) clearInterval(progressSaveInterval);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  unlockOrientation();
  unlockLandscapeMode(); // Restore original orientation
  currentPlayingItem = null;
}

/* ── EVENTS ── */
tabGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  if (!requireLogin()) return;
  if (btn.dataset.type === 'livetv') {
    heroSection.classList.add('hidden');
    paginationControls.classList.add('hidden');
    continueWatchingSection.classList.add('hidden');
    
    document.getElementById('liveTVSection').classList.remove('hidden');
    document.getElementById('mainGridSection').classList.add('hidden');
    sectionTitle.textContent = 'Live TV';
    // Disconnect observer for Live TV
    if (infiniteScrollObserver) {
      infiniteScrollObserver.disconnect();
      infiniteScrollObserver = null;
    }
    loadLiveTV();
    updateLiveUnlockButton();
    // Update active state
    tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update sidebar
    document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('navLiveTV')?.classList.add('active');
    return;
  }
  // Leaving Live TV - restore all sections that switchTab/load need
  document.getElementById('liveTVSection').classList.add('hidden');
  document.getElementById('mainGridSection').classList.remove('hidden');
  heroSection.classList.remove('hidden');
  paginationControls.classList.add('hidden');
  continueWatchingSection.classList.remove('hidden');
  
  isLoadingMore = false;
  hasMorePages = true;
  allLoadedData = [];
  switchTab(btn.dataset.type);
  setupInfiniteScroll();
});

// ── INFINITE SCROLL OBSERVER ──
function setupInfiniteScroll() {
  const sentinel = document.getElementById('infiniteScrollSentinel');
  if (!sentinel) return;

  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
  }

  infiniteScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoadingMore && hasMorePages) {
        const nextPage = currentPage + 1;
        if (nextPage <= lastPage) {
          load(nextPage, true);
        }
      }
    });
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0
  });

  infiniteScrollObserver.observe(sentinel);
}

// Keep prev/next buttons for accessibility but they also trigger infinite-style loading
prevBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
nextBtn.addEventListener('click', () => {
  if (!isLoadingMore && hasMorePages) {
    const nextPage = currentPage + 1;
    if (nextPage <= lastPage) {
      load(nextPage, true);
    }
  }
});

/* ── UNIFIED DEBOUNCED SEARCH ── */
let searchDebounceTimer = null;
let searchAbortController = null;
const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_MIN_CHARS = 2;

function debounceSearch(query) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  if (searchAbortController) { searchAbortController.abort(); searchAbortController = null; }

  const q = query.trim();

  // Show/hide clear button
  const clearBtn = document.getElementById('searchClearBtn');
  const searchRow = document.getElementById('searchInput')?.closest('.search-row');
  if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
  if (searchRow && !q) searchRow.classList.remove('searching');

  if (!q) {
    // Clear search — restore full UI
    document.body.classList.remove('search-mode');
    searchQuery = '';
    if (currentView === 'browse' || currentView === 'movies' || currentView === 'tv' || currentView === 'kids') {
      isLoadingMore = false; hasMorePages = true; allLoadedData = [];
      load(1, false);
      setupInfiniteScroll();
    }
    return;
  }

  if (q.length < SEARCH_MIN_CHARS) return;

  // Enter search mode — hide hero, tabs, continue watching
  document.body.classList.add('search-mode');

  searchDebounceTimer = setTimeout(() => {
    performUnifiedSearch(q);
  }, SEARCH_DEBOUNCE_MS);
}

async function performUnifiedSearch(q) {
  if (!requireLogin()) return;

  // Cancel any in-flight search
  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();

  searchQuery = q;
  isLoadingMore = false;
  hasMorePages = true;
  allLoadedData = [];

  // Show loading spinner
  const searchRow = document.getElementById('searchInput')?.closest('.search-row');
  if (searchRow) searchRow.classList.add('searching');

  // Ensure search mode is active — hide everything except results grid
  document.body.classList.add('search-mode');
  document.getElementById('liveTVSection').classList.add('hidden');
  document.getElementById('mainGridSection').classList.remove('hidden');
  paginationControls.classList.add('hidden');

  // ALWAYS search ALL content types — unified search across everything
  sectionTitle.textContent = `Searching "${q}"...`;
  showSkeletons();

  try {
    // Fire all 4 search APIs in parallel for maximum speed
    const [moviesRes, tvRes, kidsMoviesRes, kidsTVRes] = await Promise.all([
      searchMovies(q, 1),
      searchTV(q, 1),
      searchKidsMovies(q, 1),
      searchKidsTV(q, 1)
    ]);

    // Merge all results
    let merged = [];
    let totalPages = 1;

    const allResults = [moviesRes, tvRes, kidsMoviesRes, kidsTVRes];
    const typeLabels = { 0: 'movie', 1: 'tv', 2: 'kids_movie', 3: 'kids_tv' };

    allResults.forEach((res, idx) => {
      if (res && !res.error && res.data && res.data.length > 0) {
        // Tag each item with its source type for potential filtering
        const tagged = res.data.map(item => ({
          ...item,
          _searchSource: typeLabels[idx]
        }));
        merged = merged.concat(tagged);
        if (res.pagination) {
          totalPages = Math.max(totalPages, res.pagination.last_page || 1);
        }
      }
    });

    // Deduplicate by ID
    const seen = new Set();
    merged = merged.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // Sort by vote_average descending (best content first)
    merged.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    const unifiedResult = {
      data: merged,
      pagination: { current_page: 1, last_page: totalPages }
    };

    sectionTitle.textContent = merged.length > 0
      ? `Results for "${q}" (${merged.length})`
      : `No results for "${q}"`;
    renderGrid(unifiedResult, false);

    // Disable infinite scroll for search results (already got everything from page 1 of each type)
    if (infiniteScrollObserver) {
      infiniteScrollObserver.disconnect();
      infiniteScrollObserver = null;
    }
    const sentinel = document.getElementById('infiniteScrollSentinel');
    if (sentinel) sentinel.style.opacity = '0';

  } catch (err) {
    if (err.name !== 'AbortError') {
      sectionTitle.textContent = `Search error for "${q}"`;
      grid.innerHTML = '<div class="empty-message">Search failed. Please try again.</div>';
    }
  } finally {
    if (searchRow) searchRow.classList.remove('searching');
  }
}

// Clear search button
document.getElementById('searchClearBtn')?.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  debounceSearch('');
});

// Input event with debounce
searchInput.addEventListener('input', (e) => {
  if (!requireLogin()) return;
  debounceSearch(e.target.value);
});

// Enter key still works for immediate search
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!requireLogin()) return;
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const q = searchInput.value.trim();
    if (q) document.body.classList.add('search-mode');
    performUnifiedSearch(q);
  }
});

searchBtn.addEventListener('click', () => {
  if (!requireLogin()) return;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  const q = searchInput.value.trim();
  if (q) document.body.classList.add('search-mode');
  performUnifiedSearch(q);
});

detailsClose.addEventListener('click', closeDetails);
detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeDetails(); });

heroWatchlistBtn.addEventListener('click', () => {
  if (currentItem) toggleWatchlist(currentItem, heroWatchlistBtn);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !playerModal.classList.contains('active')) {
    if (detailsModal.classList.contains('active')) closeDetails();
    if (sidebar.classList.contains('open')) closeSidebar();
  }
});


// ── LIVE TV SYSTEM ──
const LIVE_TV_API = 'https://pastefy.app/sh92Ia4P/raw';
let liveChannels = [];
let liveCategories = [];
let activeLiveCategory = 'all';

async function fetchLiveChannels() {
  try {
    const r = await fetch(LIVE_TV_API);
    if (!r.ok) return { error: 'Failed to fetch channels' };
    const data = await r.json();
    return { data };
  } catch(e) {
    return { error: e.message };
  }
}

function getLiveCategories(channels) {
  const cats = new Set();
  channels.forEach(c => { if (c.category) cats.add(c.category); });
  const allCats = ['all', ...Array.from(cats).sort()];
  // If mature is locked, filter out mature/18+ categories
  if (!matureUnlocked) {
    return allCats.filter(c => c !== 'mature' && c !== '18+');
  }
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

function handleLiveUnlockClick() {
  showPinModal((granted) => {
    if (!granted) return;
    // verifyPin() already set matureUnlocked = true and sessionStorage
    if (currentView === 'livetv') {
      renderLiveChannels();
      renderLiveCategoryChips();
      updateLiveUnlockButton();
    }
  });
}

function handleLock18Click() {
  closeSidebar();
  if (matureUnlocked) {
    // Already unlocked — lock immediately without PIN
    matureUnlocked = false;
    sessionStorage.removeItem(PIN_STORAGE_KEY);
    updateLockButtonState();
    showToast('18+ Locked', 'Mature channels are now hidden.', 'info');
    if (currentView === 'livetv') {
      renderLiveChannels();
      renderLiveCategoryChips();
      updateLiveUnlockButton();
    }
  } else {
    // Locked — require PIN to unlock
    showPinModal((granted) => {
      if (!granted) return;
      // verifyPin() already set matureUnlocked = true and sessionStorage
      // Just refresh the UI
      if (currentView === 'livetv') {
        renderLiveChannels();
        renderLiveCategoryChips();
        updateLiveUnlockButton();
      }
    });
  }
}

const PIN_STORAGE_KEY = 'bobtv_mature_unlocked';
const PIN_CODE = '6969'; // Default PIN - can be changed
let matureUnlocked = false;
let pinCallback = null;
let pinInputs = [];
let currentPinIndex = 0;

function initPinSystem() {
  console.log('[PIN] initPinSystem starting...');
  // Check if previously unlocked in this session
  const unlocked = sessionStorage.getItem(PIN_STORAGE_KEY);
  matureUnlocked = unlocked === 'true';
  updateLockButtonState();

  pinInputs = document.querySelectorAll('.pin-input');
  console.log('[PIN] Found pin inputs:', pinInputs.length);
  const numpadBtns = document.querySelectorAll('.pin-numpad-btn');

  // Input field handlers
  pinInputs.forEach((input, idx) => {
    input.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setPinDigit(idx, e.key);
        if (idx < 3) {
          pinInputs[idx + 1].focus();
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        if (input.value) {
          setPinDigit(idx, '');
        } else if (idx > 0) {
          pinInputs[idx - 1].focus();
          setPinDigit(idx - 1, '');
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        pinInputs[idx - 1].focus();
      } else if (e.key === 'ArrowRight' && idx < 3) {
        pinInputs[idx + 1].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        verifyPin();
      } else if (e.key === 'Escape') {
        closePinModal();
      }
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 1);
      setPinDigit(idx, val);
      if (val && idx < 3) {
        pinInputs[idx + 1].focus();
      }
    });

    input.addEventListener('focus', () => {
      currentPinIndex = idx;
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      paste.split('').forEach((digit, i) => {
        if (i < 4) setPinDigit(i, digit);
      });
      if (paste.length >= 4) {
        verifyPin();
      } else if (paste.length > 0 && paste.length < 4) {
        pinInputs[paste.length].focus();
      }
    });
  });

  // Numpad handlers
  numpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.num;
      if (num === 'clear') {
        clearPin();
        pinInputs[0].focus();
      } else {
        if (currentPinIndex < 4) {
          setPinDigit(currentPinIndex, num);
          if (currentPinIndex < 3) {
            pinInputs[currentPinIndex + 1].focus();
          } else {
            // All digits filled, auto-verify after short delay
            setTimeout(verifyPin, 200);
          }
        }
      }
    });
  });

  // Action buttons
  const pinCancelBtn = document.getElementById('pinCancelBtn');
  const pinSubmitBtn = document.getElementById('pinSubmitBtn');
  const pinModalOverlay = document.getElementById('pinModalOverlay');
  const lock18Btn = document.getElementById('lock18SidebarBtn');

  if (pinCancelBtn) pinCancelBtn.addEventListener('click', closePinModal);
  if (pinSubmitBtn) pinSubmitBtn.addEventListener('click', verifyPin);
  if (pinModalOverlay) {
    pinModalOverlay.addEventListener('click', (e) => {
      if (e.target === pinModalOverlay) closePinModal();
    });
  }

  // Sidebar lock button — handled by inline onclick, no event listener needed here

  // Live TV header unlock button — handled by inline onclick
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
  console.log('[PIN] showPinModal called');
  pinCallback = callback;
  clearPin();
  const overlay = document.getElementById('pinModalOverlay');
  console.log('[PIN] overlay found:', !!overlay);
  if (overlay) overlay.classList.add('active');
  setTimeout(() => {
    if (pinInputs && pinInputs[0]) pinInputs[0].focus();
  }, 300);
}

function hidePinOverlay() {
  const overlay = document.getElementById('pinModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closePinModal() {
  hidePinOverlay();
  if (pinCallback) {
    pinCallback(false);
    pinCallback = null;
  }
}

function verifyPin() {
  const entered = getPinValue();
  if (entered.length !== 4) {
    showPinError('Please enter all 4 digits.');
    return;
  }
  if (entered === PIN_CODE) {
    matureUnlocked = true;
    sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
    updateLockButtonState();
    hidePinOverlay();
    showToast('Access Granted', '18+ channels are now unlocked.', 'success');
    if (pinCallback) {
      const cb = pinCallback;
      pinCallback = null;
      cb(true);
    }
  } else {
    showPinError('Incorrect PIN. Please try again.');
    if (pinInputs && pinInputs.length > 0) {
      pinInputs.forEach(inp => {
        if (inp) {
          inp.classList.add('error');
          inp.value = '';
          inp.classList.remove('filled');
        }
      });
      setTimeout(() => {
        pinInputs.forEach(inp => { if (inp) inp.classList.remove('error'); });
        if (pinInputs[0]) pinInputs[0].focus();
      }, 500);
    }
  }
}

function showPinError(msg) {
  const err = document.getElementById('pinErrorMsg');
  if (err) {
    err.textContent = msg;
    err.classList.add('visible');
  }
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
  updateLiveUnlockButton();
}

function updateLiveUnlockButton() {
  const liveBtn = document.getElementById('liveUnlock18Btn');
  if (!liveBtn) return;
  // Show unlock button only on Live TV view when locked and there ARE mature channels
  const hasMature = liveChannels.some(c => isMatureChannel(c));
  if (currentView === 'livetv' && !matureUnlocked && hasMature) {
    liveBtn.style.display = 'inline-flex';
  } else {
    liveBtn.style.display = 'none';
  }
}

function requirePinForMature(callback) {
  console.log('[PIN] requirePinForMature called, matureUnlocked:', matureUnlocked);
  if (matureUnlocked) {
    callback(true);
    return;
  }
  showPinModal(callback);
}

// ── MATURE CONTENT RENDERING ──


function isMatureChannel(channel) {
  return channel.category === 'mature' || channel.category === '18+' || channel.badge === '18+' || channel.badge === 'MATURE';
}

function renderLiveChannels() {
  const grid = document.getElementById('liveGrid');
  if (!grid) return;
  let displayChannels = liveChannels;
  if (!matureUnlocked) {
    displayChannels = liveChannels.filter(c => !isMatureChannel(c));
  }
  const filtered = activeLiveCategory === 'all' ? displayChannels : displayChannels.filter(c => c.category === activeLiveCategory);
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg></div><div class="empty-state-title">No Channels Found</div><div class="empty-state-desc">Try selecting a different category or unlock 18+ content.</div></div>`;
    return;
  }
  grid.innerHTML = filtered.map((ch, i) => {
    const catClass = ch.category || 'live';
    const isMature = isMatureChannel(ch);
    const imgHtml = ch.img ? `<img src="${ch.img}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg width=32 height=32 viewBox=\'0 0 24 24\' fill=\'rgba(255,255,255,0.15)\'><path d=\'M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z\'></path></svg>'">` : `<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>`;
    return `<div class="live-card" data-liveidx="${i}" ${isMature ? 'data-mature="true"' : ''}><div class="live-card-img-wrap">${imgHtml}<div class="live-indicator"><span class="live-indicator-dot"></span>LIVE</div><div class="live-card-badge ${catClass}">${ch.badge || catClass}</div><div class="live-card-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>${isMature && !matureUnlocked ? `<div class="mature-blur-overlay"><div class="lock-icon"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg></div><div class="lock-text">18+ Locked</div></div>` : ''}</div><div class="live-card-info"><div class="live-card-name">${ch.name}</div><div class="live-card-cat">${ch.category || 'Live'}</div></div></div>`;
  }).join('');
  grid.querySelectorAll('.live-card').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.liveidx);
      const ch = filtered[idx];
      if (!ch) return;
      if (el.dataset.mature && !matureUnlocked) {
        showPinModal((granted) => { if (granted) playLiveChannel(ch); });
        return;
      }
      playLiveChannel(ch);
    });
  });
}

async function loadLiveTV() {
  if (!requireLogin()) return;
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
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-quaternary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></div><div class="empty-state-title">Failed to Load Channels</div><div class="empty-state-desc">${result.error}. Please try again later.</div></div>`;
    }
    return;
  }
  liveChannels = result.data || [];
  liveCategories = getLiveCategories(liveChannels);
  if (!matureUnlocked && (activeLiveCategory === 'mature' || activeLiveCategory === '18+')) {
    activeLiveCategory = 'all';
  }
  renderLiveCategoryChips();
  renderLiveChannels();
  updateLiveUnlockButton();
  const badge = document.getElementById('liveBadge');
  if (badge) { badge.textContent = liveChannels.length; badge.style.display = liveChannels.length > 0 ? 'inline-block' : 'none'; }
}

async function playLiveChannel(channel) {
  if (!gateContentAccess()) return;
  const link = channel.link || channel.link2 || '';
  if (!link) { showToast('No Link', 'This channel has no link configured.', 'error'); return; }
  window.location.href = link;
}
async function playLiveChannel(channel) {
  if (!gateContentAccess()) return;
  const link = channel.link || channel.link2 || '';
  if (!link) {
    showToast('No Link', 'This channel has no link configured.', 'error');
    return;
  }
  window.location.href = link;
}

// ── CLOSE PLAYER CLEANUP FOR LIVE TV ──
// Live TV channels navigate directly via go: links, no player cleanup needed

// Initialize
updateWatchlistBadge();
updateContinueBadge();
load(1, false);
setupInfiniteScroll();
initAllAutoSliders();
initPinSystem();

/* ============================================================
   ADAPTIVE VIDEO PLAYER — Phone, Tablet & TV Optimizations
   ============================================================ */

function detectDeviceType() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLandscape = width > height;
  if (width >= 2000) return 'tv4k';
  if (width >= 1400) return 'tv';
  if (width <= 400) return 'phone-small';
  if (width <= 700) return 'phone';
  if (width <= 900) return 'tablet';
  return 'desktop';
}

let currentDeviceType = detectDeviceType();

function applyAdaptiveControls() {
  const device = detectDeviceType();
  currentDeviceType = device;
  let hideDelay = 3000;
  if (device === 'tv' || device === 'tv4k') hideDelay = 5000;
  if (device === 'phone' || device === 'phone-small') hideDelay = 2500;
  window._adaptiveHideDelay = hideDelay;
  if ('ontouchstart' in window) {
    const progressArea = document.getElementById('playerProgressArea');
    if (progressArea) progressArea.style.padding = '14px 0';
  }
}

const _origShowControls = window.showControls;
window.showControls = function() {
  playerControlsVisible = true;
  playerTopBar.classList.remove('hidden-bar');
  playerControlsBar.classList.remove('hidden-bar');
  clearTimeout(controlsHideTimer);
  const delay = window._adaptiveHideDelay || 3000;
  controlsHideTimer = setTimeout(hideControls, delay);
};

function handleOrientationChange() {
  const device = detectDeviceType();
  const isLandscape = window.innerWidth > window.innerHeight;
  if ((device === 'phone' || device === 'phone-small' || device === 'tablet') && isLandscape) {
    if (playerModal.classList.contains('active') && !document.fullscreenElement) {
      playerModal.requestFullscreen().catch(() => {});
    }
  }
  applyAdaptiveControls();
  updateProgress();
}

window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', (function() {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const newDevice = detectDeviceType();
      if (newDevice !== currentDeviceType) applyAdaptiveControls();
      handleOrientationChange();
    }, 250);
  };
})());

let touchStartX = 0, touchStartY = 0, touchStartTime = 0, isTouchDragging = false;

function initTouchGestures() {
  if (!('ontouchstart' in window)) return;
  const videoArea = document.getElementById('playerVideoArea');
  if (!videoArea) return;
  videoArea.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isTouchDragging = false;
    }
  }, { passive: true });
  videoArea.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) && elapsed > 100) {
      isTouchDragging = true;
      const seekAmount = dx > 0 ? 10 : -10;
      playerVideo.currentTime = Math.max(0, Math.min(playerVideo.duration || Infinity, playerVideo.currentTime + seekAmount));
      touchStartX = e.touches[0].clientX;
      showControls();
    }
    if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx) && elapsed > 100) {
      isTouchDragging = true;
      const volChange = dy < 0 ? 0.05 : -0.05;
      playerVideo.volume = Math.max(0, Math.min(1, playerVideo.volume + volChange));
      playerVideo.muted = false;
      updateVolumeUI();
      touchStartY = e.touches[0].clientY;
      showControls();
    }
  }, { passive: true });
  videoArea.addEventListener('touchend', (e) => {
    const elapsed = Date.now() - touchStartTime;
    // Don't toggle if touch ended on an interactive element (buttons, controls)
    const target = e.target;
    const isInteractive = target.closest('.player-center-btn, .player-control-btn, .player-quality-btn, .player-speed-btn, .player-sub-btn, .player-back-btn, .player-progress-area, .player-volume-slider, .player-quality-dropdown, .player-speed-dropdown, .player-sub-dropdown, .next-toast-btn');
    if (!isTouchDragging && elapsed < 300 && !isInteractive) {
      togglePlayPause();
    }
    isTouchDragging = false;
  });
}

let lastTapTime = 0, lastTapX = 0;
function initDoubleTapGestures() {
  if (!('ontouchstart' in window)) return;
  const videoArea = document.getElementById('playerVideoArea');
  if (!videoArea) return;
  videoArea.addEventListener('touchend', (e) => {
    // Skip if touching interactive controls
    const target = e.target;
    const isInteractive = target.closest('.player-center-btn, .player-control-btn, .player-quality-btn, .player-speed-btn, .player-sub-btn, .player-back-btn, .player-progress-area, .player-volume-slider, .player-quality-dropdown, .player-speed-dropdown, .player-sub-dropdown, .next-toast-btn');
    if (isInteractive) return;

    const currentTime = Date.now();
    const tapX = e.changedTouches[0].clientX;
    const screenWidth = window.innerWidth;
    if (currentTime - lastTapTime < 300) {
      const isRightSide = tapX > screenWidth / 2;
      const skipAmount = isRightSide ? 10 : -10;
      playerVideo.currentTime = Math.max(0, Math.min(playerVideo.duration || Infinity, playerVideo.currentTime + skipAmount));
      showToast('Skip', (skipAmount > 0 ? '+' : '') + skipAmount + 's', 'info');
      showControls();
      const feedback = document.createElement('div');
      feedback.style.cssText = 'position:absolute;top:50%;' + (isRightSide ? 'right:20%;' : 'left:20%;') + 'transform:translateY(-50%);background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);color:#fff;padding:16px 24px;border-radius:50%;font-size:24px;font-weight:700;z-index:20;animation:skipFeedback 0.5s ease-out forwards;pointer-events:none;';
      feedback.innerHTML = isRightSide ? '››' : '‹‹';
      const style = document.createElement('style');
      style.textContent = '@keyframes skipFeedback { 0%{opacity:0;transform:translateY(-50%) scale(0.5);} 50%{opacity:1;transform:translateY(-50%) scale(1.2);} 100%{opacity:0;transform:translateY(-50%) scale(1);} }';
      document.head.appendChild(style);
      videoArea.appendChild(feedback);
      setTimeout(() => { feedback.remove(); style.remove(); }, 500);
    }
    lastTapTime = currentTime;
    lastTapX = tapX;
  });
}

function initTVRemoteSupport() {
  const isTV = /SmartTV|TV|Web0S|Tizen|NetCast|HbbTV|PlayStation|Xbox|AppleTV|CrKey|Roku/.test(navigator.userAgent);
  if (!isTV && currentDeviceType !== 'tv' && currentDeviceType !== 'tv4k') return;
  document.addEventListener('keydown', (e) => {
    if (!playerModal.classList.contains('active')) return;
    switch(e.key) {
      case 'MediaPlay': case 'MediaPlayPause': e.preventDefault(); togglePlayPause(); break;
      case 'MediaPause': e.preventDefault(); if (!playerVideo.paused) playerVideo.pause(); break;
      case 'MediaStop': e.preventDefault(); closePlayer(); break;
      case 'MediaFastForward': case 'ArrowRight': e.preventDefault(); playerVideo.currentTime = Math.min(playerVideo.duration || Infinity, playerVideo.currentTime + 30); showControls(); break;
      case 'MediaRewind': case 'ArrowLeft': e.preventDefault(); playerVideo.currentTime = Math.max(0, playerVideo.currentTime - 10); showControls(); break;
      case 'VolumeUp': e.preventDefault(); playerVideo.volume = Math.min(1, playerVideo.volume + 0.1); updateVolumeUI(); showControls(); break;
      case 'VolumeDown': e.preventDefault(); playerVideo.volume = Math.max(0, playerVideo.volume - 0.1); updateVolumeUI(); showControls(); break;
      case 'VolumeMute': e.preventDefault(); playerVolumeBtn.click(); break;
      case 'Enter': case 'OK': e.preventDefault(); if (!playerControlsVisible) showControls(); else togglePlayPause(); break;
      case 'Back': case 'Escape': e.preventDefault(); closePlayer(); break;
    }
  });
}

function initAdaptivePlayer() {
  applyAdaptiveControls();
  initTouchGestures();
  initDoubleTapGestures();
  initTVRemoteSupport();
  document.body.classList.add('device-' + currentDeviceType);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdaptivePlayer);
} else {
  initHeroCarousel();
initAdaptivePlayer();
}

const _origOpenPlayerUI = window.openPlayerUI;
window.openPlayerUI = function(title, subtitle) {
  _origOpenPlayerUI(title, subtitle);
  applyAdaptiveControls();
  // Force landscape immediately when player opens
  forceLandscapeMode();
  // Initialize subtitle position
  initSubtitlePosition();
};






// ============================================================
// FIREBASE AUTH & SUBMANAGER INTEGRATION — WORKING V4
// Fixes: correct auth header, direct paste access, proper error handling
// ============================================================

// --- Firebase Config ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBsneacRpbQK5X1sakAhtWzpgWzawAnRBw",
  authDomain: "onstreamtv.firebaseapp.com",
  projectId: "onstreamtv",
  storageBucket: "onstreamtv.appspot.com",
  messagingSenderId: "440010537719",
  appId: "1:440010537719:web:8ab64d45df5b6958c1f1f2",
  measurementId: "G-ZDD761J2MQ"
};

// --- Pastefy Config ---
// IMPORTANT: The API key must be from the SAME account that owns the paste!
// Get your API key at: https://pastefy.app/apikeys
const PASTEFY_API_KEY = "mEQy1tvH7DTSuqOW0d8R2duwhwxZVYz0F0kfzRMijbypfrNRUUSTtnxj9AtN";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

// --- CRITICAL: Set your subscription_master_index paste ID here ---
// This is the paste that contains your subscription database JSON.
// Find it in your Pastefy dashboard. The URL looks like:
// https://pastefy.app/XXXXXXX  or  https://pastefy.app/XXXXXXX/raw
// Your ID is the XXXXXXX part.
const SUBSCRIPTION_PASTE_ID = "ePhfxmdW";  // Your subscription_master_index paste ID

// --- App State ---
let firebaseApp = null;
let firebaseAuth = null;
let currentUser = null;
let currentSubscription = null;
let deviceId = null;
let subPollInterval = null;
let isCheckingSubscription = false;
let _subCheckFailCount = 0;

// --- Generate Device ID ---
function getDeviceId() {
  let id = localStorage.getItem('bobtv_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bobtv_device_id', id);
  }
  return id;
}

deviceId = getDeviceId();
console.log('[ZedStream] Device ID:', deviceId);

// --- Initialize Firebase ---
function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('[Firebase] SDK not loaded');
    showLoginError('Auth service unavailable. Refresh the page.');
    return false;
  }
  try {
    if (firebase.apps && firebase.apps.length > 0) {
      firebaseApp = firebase.apps[0];
    } else {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    }
    firebaseAuth = firebase.auth();
    return true;
  } catch(e) {
    console.error('[Firebase] Init error:', e.message);
    showLoginError('Auth init failed: ' + e.message);
    return false;
  }
}

// ============================================================
// PASTEFY API — FIXED CALL HELPER
// Per docs: Authorization header can be "Bearer TOKEN" or "Token TOKEN"
// The API key must belong to the same account that owns the paste.
// ============================================================

async function pastefyApiCall(endpoint, options = {}) {
  const url = `${PASTEFY_BASE}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${PASTEFY_API_KEY}`,
    'Accept': 'application/json',
    ...(options.headers || {})
  };
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    console.log('[Pastefy] >>>', options.method || 'GET', url);
    const resp = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body
    });
    console.log('[Pastefy] <<< Status:', resp.status, resp.statusText);

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[Pastefy] Error body:', text.substring(0, 300));
      return { error: `HTTP ${resp.status}: ${resp.statusText}`, details: text };
    }

    const data = await resp.json();
    console.log('[Pastefy] Response keys:', Object.keys(data));
    return data;
  } catch(e) {
    console.error('[Pastefy] Network error:', e.message);
    return { error: 'Network error: ' + e.message };
  }
}

async function pastefyGetRaw(pasteId) {
  try {
    const url = `${PASTEFY_BASE}/paste/${pasteId}/raw`;
    console.log('[Pastefy] >>> GET raw', url);
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PASTEFY_API_KEY}`,
        'Accept': 'text/plain,application/json'
      }
    });
    console.log('[Pastefy] <<< Raw Status:', resp.status);
    if (!resp.ok) {
      const text = await resp.text();
      return { error: `HTTP ${resp.status}: ${resp.statusText}`, details: text };
    }
    const text = await resp.text();
    console.log('[Pastefy] Raw content length:', text.length);
    return { content: text };
  } catch(e) {
    return { error: 'Network error: ' + e.message };
  }
}

async function pastefyEdit(pasteId, title, content) {
  return pastefyApiCall(`/paste/${pasteId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content, type: 'PASTE', encrypted: false })
  });
}

// ============================================================
// SUBSCRIPTION DATABASE — DIRECT ACCESS
// ============================================================

function getSubscriptionPasteId() {
  // Priority: manual override > hardcoded constant
  const manual = localStorage.getItem('bobtv_manual_paste_id');
  if (manual) return manual;
  if (SUBSCRIPTION_PASTE_ID && SUBSCRIPTION_PASTE_ID.trim() !== '') return SUBSCRIPTION_PASTE_ID;
  return null;
}

function setManualPasteId(id) {
  localStorage.setItem('bobtv_manual_paste_id', id);
  console.log('[SubManager] Manual paste ID set:', id);
}

async function fetchSubscriptionIndex() {
  const pasteId = getSubscriptionPasteId();
  if (!pasteId) {
    console.error('[SubManager] No paste ID configured!');
    console.error('[SubManager] Set SUBSCRIPTION_PASTE_ID in code or run: setManualPasteId("YOUR_ID")');
    return { error: 'No subscription database configured. Paste ID is missing.' };
  }

  console.log('[SubManager] Fetching subscription index from paste:', pasteId);

  // Strategy 1: Try /paste/:id endpoint first
  console.log('[SubManager] Trying /paste/:id ...');
  const pasteResult = await pastefyApiCall(`/paste/${pasteId}`);

  if (!pasteResult.error) {
    // Per API docs, response is the paste object with id, title, content, etc.
    const paste = pasteResult;
    if (paste && paste.content) {
      try {
        const parsed = JSON.parse(paste.content);
        console.log('[SubManager] SUCCESS via /paste. Subscriptions:', parsed.subscriptions ? parsed.subscriptions.length : 0);
        return parsed;
      } catch(e) {
        console.error('[SubManager] JSON parse failed:', e.message);
        console.error('[SubManager] Content preview:', paste.content.substring(0, 200));
      }
    } else {
      console.error('[SubManager] /paste response has no content field. Keys:', Object.keys(paste || {}));
    }
  } else {
    console.error('[SubManager] /paste failed:', pasteResult.error);
  }

  // Strategy 2: Try /paste/:id/raw endpoint
  console.log('[SubManager] Trying /paste/:id/raw ...');
  const rawResult = await pastefyGetRaw(pasteId);
  if (rawResult.error) {
    console.error('[SubManager] Raw endpoint failed:', rawResult.error);
    return { error: 'Failed to fetch subscription database: ' + rawResult.error };
  }

  try {
    const parsed = JSON.parse(rawResult.content);
    console.log('[SubManager] SUCCESS via /raw. Subscriptions:', parsed.subscriptions ? parsed.subscriptions.length : 0);
    return parsed;
  } catch(e) {
    console.error('[SubManager] JSON parse failed on raw:', e.message);
    console.error('[SubManager] Raw content preview:', rawResult.content.substring(0, 200));
    return { error: 'Invalid JSON in subscription database: ' + e.message };
  }
}

async function getUserSubscription(email) {
  if (!email) return { error: 'No email provided' };

  console.log('[SubManager] Looking up subscription for:', email);
  const index = await fetchSubscriptionIndex();

  if (index.error) {
    console.error('[SubManager] Index fetch failed:', index.error);
    return { error: index.error };
  }

  if (!index.subscriptions || !Array.isArray(index.subscriptions)) {
    console.error('[SubManager] No subscriptions array in index. Keys:', Object.keys(index));
    return { error: 'No subscriptions found in database' };
  }

  const sub = index.subscriptions.find(s => 
    s.subEmail && s.subEmail.toLowerCase() === email.toLowerCase()
  );

  if (!sub) {
    console.log('[SubManager] No subscription found for:', email);
    console.log('[SubManager] Available emails:', index.subscriptions.map(s => s.subEmail));
    return { error: 'No subscription found for this email' };
  }

  console.log('[SubManager] Found subscription:', sub.id, 'status:', sub.status);
  return { subscription: sub, index: index };
}

function isSubscriptionValid(sub) {
  if (!sub) return false;
  if (sub.status !== 'active') {
    console.log('[SubManager] Invalid status:', sub.status);
    return false;
  }
  if (sub.expiryDate) {
    const expiry = new Date(sub.expiryDate);
    const now = new Date();
    if (expiry <= now) {
      console.log('[SubManager] Expired:', sub.expiryDate);
      return false;
    }
  }
  return true;
}

function getDaysRemaining(sub) {
  if (!sub || !sub.expiryDate) return 0;
  const expiry = new Date(sub.expiryDate);
  const now = new Date();
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function isDeviceAllowed(sub, devId) {
  if (!sub) return false;
  const limit = sub.deviceLimit || 1;
  const devices = sub.connectedDevices || [];
  if (devices.includes(devId)) return true;
  return devices.length < limit;
}

async function addDeviceToSubscription(email, devId) {
  const result = await getUserSubscription(email);
  if (result.error) return result;
  const sub = result.subscription;
  const index = result.index;

  if (!sub.connectedDevices) sub.connectedDevices = [];

  // Clear any lockout for this device (they're signing in legitimately)
  if (sub.deviceLockouts) {
    const hadLockout = sub.deviceLockouts.some(l => l.deviceId === devId);
    if (hadLockout) {
      sub.deviceLockouts = sub.deviceLockouts.filter(l => l.deviceId !== devId);
      console.log('[SubManager] Cleared lockout for device', devId);
    }
  }

  if (!sub.connectedDevices.includes(devId)) {
    sub.connectedDevices.push(devId);
  }

  index.lastUpdated = new Date().toISOString();
  const editResult = await pastefyEdit(getSubscriptionPasteId(), 'Subscription Master Index', JSON.stringify(index, null, 2));
  if (editResult.error) return { error: editResult.error };
  return { success: true };
}

async function removeDeviceFromSubscription(email, devIdToRemove) {
  // Show preloader during device removal
  const preloader = document.getElementById('authPreloader');
  if (preloader) preloader.classList.remove('hidden');
  if (preloader) preloader.querySelector('.auth-preloader-text').textContent = 'Removing device...';
  if (preloader) preloader.querySelector('.auth-preloader-sub').textContent = 'Please wait while we update your account';

  const result = await getUserSubscription(email);
  if (result.error) return result;
  const sub = result.subscription;
  const index = result.index;

  if (sub.connectedDevices) {
    sub.connectedDevices = sub.connectedDevices.filter(d => d !== devIdToRemove);
  }

  // ===== ADD DEVICE TO LOCKOUT LIST =====
  if (!sub.deviceLockouts) sub.deviceLockouts = [];
  sub.deviceLockouts = sub.deviceLockouts.filter(l => l.deviceId !== devIdToRemove);
  sub.deviceLockouts.push({
    deviceId: devIdToRemove,
    timestamp: new Date().toISOString(),
    lockedBy: deviceId,
    reason: 'removed_by_user'
  });

  // Clean up old lockouts (older than 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  sub.deviceLockouts = sub.deviceLockouts.filter(l => l.timestamp > oneDayAgo);

  index.lastUpdated = new Date().toISOString();
  const editResult = await pastefyEdit(getSubscriptionPasteId(), 'Subscription Master Index', JSON.stringify(index, null, 2));
  if (editResult.error) return { error: editResult.error };

  console.log('[SubManager] Device', devIdToRemove, 'removed and locked out by', deviceId);
  // Hide preloader after removal completes
  if (preloader) preloader.classList.add('hidden');
  // Reset preloader text for next use
  if (preloader) preloader.querySelector('.auth-preloader-text').textContent = 'Initializing your account...';
  if (preloader) preloader.querySelector('.auth-preloader-sub').textContent = 'Please wait while we verify your subscription';
  return { success: true };
}

// ============================================================
// SUBSCRIPTION CHECKING & POLLING
// ============================================================

async function checkSubscription() {
  if (isCheckingSubscription) return;
  if (!currentUser || !currentUser.email) return;

  isCheckingSubscription = true;
  console.log('[SubManager] Checking subscription for:', currentUser.email);

  try {
    const result = await getUserSubscription(currentUser.email);

    if (result.error) {
      console.error('[SubManager] Lookup failed:', result.error);
      _subCheckFailCount++;
      if (_subCheckFailCount >= 3) {
        currentSubscription = null;
      }
      isCheckingSubscription = false;
      return;
    }

    _subCheckFailCount = 0;
    const sub = result.subscription;
    currentSubscription = sub;

    // ===== DEVICE LOCKOUT CHECK =====
    const lockouts = sub.deviceLockouts || [];
    const myLockout = lockouts.find(l => l.deviceId === deviceId);

    if (myLockout) {
      // If this device is in connectedDevices, the lockout is stale - clear it
      if (sub.connectedDevices && sub.connectedDevices.includes(deviceId)) {
        console.log('[SubManager] Stale lockout found for current device, clearing...');
        sub.deviceLockouts = lockouts.filter(l => l.deviceId !== deviceId);
        // Update the database to remove the stale lockout
        const index = result.index;
        index.lastUpdated = new Date().toISOString();
        await pastefyEdit(getSubscriptionPasteId(), 'Subscription Master Index', JSON.stringify(index, null, 2));
        console.log('[SubManager] Stale lockout cleared');
      } else {
        // Real lockout - this device was removed and is not connected
        console.log('[SubManager] THIS DEVICE HAS BEEN LOCKED OUT by', myLockout.lockedBy);
        showToast('Device Removed', 'This device was removed from your account by another device. Signing out...', 'error');
        setTimeout(() => logoutUser(), 2000);
        isCheckingSubscription = false;
        return;
      }
    }

    if (!isSubscriptionValid(sub)) {
      // User stays logged in but subscription is invalid - paywall will show on content click
      console.log('[SubManager] Subscription invalid/expired. User stays logged in, paywall active.');
      isCheckingSubscription = false;
      return;
    }

    if (!isDeviceAllowed(sub, deviceId)) {
      showDevicePopup(sub);
      isCheckingSubscription = false;
      return;
    }

    if (!sub.connectedDevices || !sub.connectedDevices.includes(deviceId)) {
      await addDeviceToSubscription(currentUser.email, deviceId);
    }

    hideSubscriptionGate();
    hidePaywall();

  } catch(e) {
    console.error('[SubManager] Unexpected error:', e);
    _subCheckFailCount++;
  }

  isCheckingSubscription = false;
}

function startSubscriptionPolling() {
  console.log('[SubManager] Starting polling (10s)');
  if (subPollInterval) clearInterval(subPollInterval);
  checkSubscription();
  subPollInterval = setInterval(checkSubscription, 10000);
}

function stopSubscriptionPolling() {
  if (subPollInterval) {
    clearInterval(subPollInterval);
    subPollInterval = null;
  }
}

// ============================================================
// UI FUNCTIONS
// ============================================================

function showLoginOverlay() {
  const overlay = document.getElementById('loginOverlay');
  if (overlay) {
    hideDevicePopup();
    hideSubscriptionGate();
    closePinModal();
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function hideLoginOverlay() {
  const overlay = document.getElementById('loginOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  const errText = document.getElementById('loginErrorText');
  if (err && errText) {
    errText.textContent = msg;
    err.classList.add('visible');
    setTimeout(() => err.classList.remove('visible'), 6000);
  }
}

function setLoginLoading(loading) {
  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
  }
}

function showDevicePopup(sub) {
  const overlay = document.getElementById('devicePopupOverlay');
  if (!overlay) return;

  const limitDisplay = document.getElementById('deviceLimitDisplay');
  const currentDev = document.getElementById('currentDeviceId');
  const otherDev = document.getElementById('otherDeviceId');

  if (limitDisplay) limitDisplay.textContent = sub.deviceLimit || 1;
  if (currentDev) currentDev.textContent = deviceId;

  const otherDevice = (sub.connectedDevices || []).find(d => d !== deviceId);
  if (otherDev) otherDev.textContent = otherDevice || 'Unknown device';

  overlay.classList.add('active');
}

function hideDevicePopup() {
  const overlay = document.getElementById('devicePopupOverlay');
  if (overlay) overlay.classList.remove('active');
}

function showSubscriptionGate(reason) {
  const overlay = document.getElementById('subGateOverlay');
  const title = document.getElementById('subGateTitle');
  const desc = document.getElementById('subGateDesc');

  if (!overlay || !title || !desc) return;

  switch(reason) {
    case 'expired':
      title.textContent = 'Subscription Expired';
      desc.innerHTML = 'Your subscription has expired.<br>Renew to continue watching ZedStream.';
      break;
    case 'no_subscription':
      title.textContent = 'Subscription Required';
      desc.innerHTML = 'No active subscription found.<br>Subscribe to unlock all content.';
      break;
    case 'invalid':
      title.textContent = 'Subscription Invalid';
      desc.innerHTML = 'Your subscription is not active.<br>Renew to continue watching.';
      break;
    default:
      title.textContent = 'Subscription Required';
      desc.innerHTML = 'Subscribe to continue watching ZedStream.';
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideSubscriptionGate() {
  const overlay = document.getElementById('subGateOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateSidebarUserInfo() {
  // Account details removed from sidebar per user request
  return;
}

async function performLogin(email, password) {
  if (!firebaseAuth) {
    showLoginError('Auth service unavailable. Refresh.');
    return false;
  }

  if (firebaseAuth.currentUser) {
    currentUser = firebaseAuth.currentUser;
    return true;
  }

  setLoginLoading(true);

  try {
    const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
    currentUser = result.user;

    const subResult = await getUserSubscription(currentUser.email);

    if (subResult.error) {
      showLoginError('No subscription found. Subscribe first.');
      await firebaseAuth.signOut();
      currentUser = null;
      setLoginLoading(false);
      return false;
    }

    currentSubscription = subResult.subscription;

    if (!isDeviceAllowed(currentSubscription, deviceId)) {
      showDevicePopup(currentSubscription);
      setLoginLoading(false);
      return false;
    }

    // Add device and clear any stale lockout for this device
    await addDeviceToSubscription(currentUser.email, deviceId);

    hideLoginOverlay();

    startSubscriptionPolling();
    showToast('Welcome Back', `Signed in as ${currentUser.email}`, 'success');
    setLoginLoading(false);
    return true;

  } catch(error) {
    let msg = 'Login failed';
    switch(error.code) {
      case 'auth/user-not-found': msg = 'No account found'; break;
      case 'auth/wrong-password': msg = 'Incorrect password'; break;
      case 'auth/invalid-email': msg = 'Invalid email'; break;
      case 'auth/too-many-requests': msg = 'Too many attempts'; break;
      case 'auth/invalid-credential': msg = 'Invalid credentials'; break;
      default: msg = error.message || 'Login failed';
    }
    showLoginError(msg);
    setLoginLoading(false);
    return false;
  }
}

async function performRegister(email, password) {
  if (!firebaseAuth) {
    showLoginError('Auth unavailable');
    return false;
  }
  setLoginLoading(true);
  try {
    const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    currentUser = result.user;
    showLoginError('Account created! Redirecting...');
    setTimeout(() => { window.location.href = '#'; }, 2000);
    setLoginLoading(false);
    return true;
  } catch(error) {
    let msg = 'Registration failed';
    switch(error.code) {
      case 'auth/email-already-in-use': msg = 'Email already used'; break;
      case 'auth/weak-password': msg = 'Password too weak'; break;
      default: msg = error.message || 'Registration failed';
    }
    showLoginError(msg);
    setLoginLoading(false);
    return false;
  }
}

async function logoutUser() {
  // Show preloader during sign out
  const preloader = document.getElementById('authPreloader');
  if (preloader) preloader.classList.remove('hidden');
  if (preloader) preloader.querySelector('.auth-preloader-text').textContent = 'Signing out...';
  if (preloader) preloader.querySelector('.auth-preloader-sub').textContent = 'Please wait while we secure your account';

  hideDevicePopup();
  hideSubscriptionGate();
  closePinModal();
  closeDetails();
  if (playerModal.classList.contains('active')) closePlayer();
stopSubscriptionPolling();

  if (currentUser && currentUser.email && currentSubscription) {
    try {
      await removeDeviceFromSubscription(currentUser.email, deviceId);
    } catch(e) {
      console.warn('[Auth] Device removal failed:', e.message);
    }
  }

  if (firebaseAuth) {
    try {
      await firebaseAuth.signOut();
    } catch(e) {
      console.warn('[Auth] SignOut error:', e.message);
    }
  }

  currentUser = null;
  currentSubscription = null;

  setTimeout(() => {
    // Hide preloader after logout completes
    if (preloader) preloader.classList.add('hidden');
    // Reset preloader text for next use
    if (preloader) preloader.querySelector('.auth-preloader-text').textContent = 'Initializing your account...';
    if (preloader) preloader.querySelector('.auth-preloader-sub').textContent = 'Please wait while we verify your subscription';
    showLoginOverlay();
    showToast('Logged Out', 'Signed out successfully.', 'info');
  }, 100);
}

// ============================================================
// AUTH STATE LISTENER
// ============================================================

function initAuth() {
  console.log('[Auth] Initializing...');

  // Show preloader while initializing
  const preloader = document.getElementById('authPreloader');
  if (preloader) preloader.classList.remove('hidden');

  if (!initFirebase()) {
    console.error('[Auth] Firebase init failed');
    if (preloader) preloader.classList.add('hidden');
    showLoginOverlay();
    return;
  }

  firebaseAuth.onAuthStateChanged(async (user) => {
    console.log('[Auth] State changed:', user ? user.email : 'null');

    if (user) {
      currentUser = user;

      const subResult = await getUserSubscription(user.email);

      if (subResult.error) {
        // No subscription found - user stays logged in, paywall on content click
        currentSubscription = null;
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.add('app-ready');
        hideLoginOverlay();
        startSubscriptionPolling();
        return;
      }

      currentSubscription = subResult.subscription;

      if (!isSubscriptionValid(currentSubscription)) {
        // Subscription expired/invalid - user stays logged in, paywall on content click
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.add('app-ready');
        hideLoginOverlay();
        startSubscriptionPolling();
        return;
      }

      if (!isDeviceAllowed(currentSubscription, deviceId)) {
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.add('app-ready');
        showDevicePopup(currentSubscription);
        return;
      }

      if (!currentSubscription.connectedDevices || !currentSubscription.connectedDevices.includes(deviceId)) {
        await addDeviceToSubscription(user.email, deviceId);
      }

      // Hide preloader before showing the app
      if (preloader) preloader.classList.add('hidden');

      // Show main app content
      document.body.classList.add('app-ready');

      hideLoginOverlay();
      hideSubscriptionGate();
      hidePaywall();

      startSubscriptionPolling();

    } else {
      currentUser = null;
      currentSubscription = null;
      stopSubscriptionPolling();
      hideDevicePopup();
      hideSubscriptionGate();
      hidePaywall();

      // Hide preloader when showing login
      if (preloader) preloader.classList.add('hidden');

      // Show login overlay (main app stays hidden behind it)
      showLoginOverlay();
    }
  });
}

// ============================================================
// PAYWALL SYSTEM — Content Access Gating
// Users stay logged in but must subscribe to watch content
// ============================================================

let paywallDismissed = false;

function hasValidSubscription() {
  if (!currentSubscription) return false;
  return isSubscriptionValid(currentSubscription);
}

function showPaywall(reason) {
  const overlay = document.getElementById('paywallOverlay');
  const title = document.getElementById('paywallTitle');
  const desc = document.getElementById('paywallDesc');
  const status = document.getElementById('paywallStatus');

  if (!overlay) return;

  switch(reason) {
    case 'expired':
      if (status) { status.textContent = 'Subscription Expired'; status.className = 'paywall-status expired'; }
      if (title) title.textContent = 'Renew Your Subscription';
      if (desc) desc.textContent = 'Your subscription has expired. Renew now to continue watching unlimited movies, TV shows, and live channels.';
      break;
    case 'no_subscription':
      if (status) { status.textContent = 'Subscription Required'; status.className = 'paywall-status'; }
      if (title) title.textContent = 'Unlock Premium Content';
      if (desc) desc.textContent = 'Subscribe now to get unlimited access to movies, TV shows, and 100+ live TV channels.';
      break;
    case 'invalid':
      if (status) { status.textContent = 'Subscription Inactive'; status.className = 'paywall-status expired'; }
      if (title) title.textContent = 'Reactivate Your Plan';
      if (desc) desc.textContent = 'Your subscription is not active. Reactivate to continue watching all content.';
      break;
    default:
      if (status) { status.textContent = 'Subscription Required'; status.className = 'paywall-status'; }
      if (title) title.textContent = 'Unlock Premium Content';
      if (desc) desc.textContent = 'Subscribe to continue watching ZedStream.';
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  paywallDismissed = false;
}

function hidePaywall() {
  const overlay = document.getElementById('paywallOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  paywallDismissed = false;
}

function dismissPaywall() {
  const overlay = document.getElementById('paywallOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  paywallDismissed = true;
}

/**
 * Gate content access — shows paywall if no valid subscription
 * Returns true if access is allowed, false if paywall was shown
 */
function requireLogin() {
  if (!currentUser) {
    showLoginOverlay();
    return false;
  }
  return true;
}

function gateContentAccess() {
  if (!currentUser) {
    showLoginOverlay();
    return false;
  }
  if (!hasValidSubscription()) {
    const days = currentSubscription ? getDaysRemaining(currentSubscription) : 0;
    if (days <= 0 && currentSubscription) {
      showPaywall('expired');
    } else if (!currentSubscription) {
      showPaywall('no_subscription');
    } else {
      showPaywall('invalid');
    }
    return false;
  }
  return true;
}

// Paywall event listeners
function initPaywallEvents() {
  const dismissBtn = document.getElementById('paywallDismissBtn');
  const subGateDismissBtn = document.getElementById('subGateDismissBtn');

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      dismissPaywall();
    });
  }

  if (subGateDismissBtn) {
    subGateDismissBtn.addEventListener('click', () => {
      hideSubscriptionGate();
    });
  }

  // Close paywall on overlay click
  const paywallOverlay = document.getElementById('paywallOverlay');
  if (paywallOverlay) {
    paywallOverlay.addEventListener('click', (e) => {
      if (e.target === paywallOverlay) {
        dismissPaywall();
      }
    });
  }

  // Close sub gate on overlay click
  const subGateOverlay = document.getElementById('subGateOverlay');
  if (subGateOverlay) {
    subGateOverlay.addEventListener('click', (e) => {
      if (e.target === subGateOverlay) {
        hideSubscriptionGate();
      }
    });
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function initAuthEvents() {
  
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const registerToggle = document.getElementById('registerToggle');
  const loginSubtitle = document.getElementById('loginSubtitle');

  if (!loginForm) {
    console.error('[Auth] Login form not found');
    return;
  }

  let isRegisterMode = false;

  if (registerToggle) {
      // Password show/hide toggle
  const passwordToggleBtn = document.getElementById('passwordToggleBtn');
  const loginPassword = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeOffIcon = document.getElementById('eyeOffIcon');

  if (passwordToggleBtn && loginPassword) {
    passwordToggleBtn.addEventListener('click', () => {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';
      passwordToggleBtn.title = isPassword ? 'Hide password' : 'Show password';
      if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : 'block';
      if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? 'block' : 'none';
    });
  }

  // Forgot password
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordOverlay = document.getElementById('forgotPasswordOverlay');
  const forgotPasswordBackBtn = document.getElementById('forgotPasswordBackBtn');
  const forgotPasswordDoneBtn = document.getElementById('forgotPasswordDoneBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotPasswordEmail = document.getElementById('forgotPasswordEmail');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const forgotPasswordError = document.getElementById('forgotPasswordError');
  const forgotPasswordErrorText = document.getElementById('forgotPasswordErrorText');
  const forgotPasswordFormWrap = document.getElementById('forgotPasswordFormWrap');
  const forgotPasswordSuccess = document.getElementById('forgotPasswordSuccess');
  const forgotPasswordEmailDisplay = document.getElementById('forgotPasswordEmailDisplay');

  function showForgotPassword() {
    if (forgotPasswordOverlay) {
      forgotPasswordOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (forgotPasswordEmail) forgotPasswordEmail.focus();
    }
  }

  function hideForgotPassword() {
    if (forgotPasswordOverlay) {
      forgotPasswordOverlay.classList.remove('active');
      document.body.style.overflow = '';
      // Reset form
      if (forgotPasswordForm) forgotPasswordForm.reset();
      if (forgotPasswordFormWrap) forgotPasswordFormWrap.style.display = 'block';
      if (forgotPasswordSuccess) forgotPasswordSuccess.classList.remove('visible');
      if (forgotPasswordError) forgotPasswordError.classList.remove('visible');
    }
  }

  function showForgotPasswordError(msg) {
    if (forgotPasswordError && forgotPasswordErrorText) {
      forgotPasswordErrorText.textContent = msg;
      forgotPasswordError.classList.add('visible');
    }
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotPassword();
    });
  }

  if (forgotPasswordBackBtn) {
    forgotPasswordBackBtn.addEventListener('click', () => hideForgotPassword());
  }

  if (forgotPasswordDoneBtn) {
    forgotPasswordDoneBtn.addEventListener('click', () => hideForgotPassword());
  }

  if (forgotPasswordOverlay) {
    forgotPasswordOverlay.addEventListener('click', (e) => {
      if (e.target === forgotPasswordOverlay) hideForgotPassword();
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!firebaseAuth) {
        showForgotPasswordError('Auth service unavailable. Please try again.');
        return;
      }
      const email = forgotPasswordEmail.value.trim();
      if (!email) {
        showForgotPasswordError('Please enter your email address.');
        return;
      }

      // Show loading
      if (forgotPasswordBtn) {
        forgotPasswordBtn.disabled = true;
        forgotPasswordBtn.classList.add('loading');
        forgotPasswordBtn.textContent = '';
      }

      try {
        await firebaseAuth.sendPasswordResetEmail(email);
        // Show success
        if (forgotPasswordFormWrap) forgotPasswordFormWrap.style.display = 'none';
        if (forgotPasswordSuccess) {
          forgotPasswordSuccess.classList.add('visible');
          if (forgotPasswordEmailDisplay) forgotPasswordEmailDisplay.textContent = email;
        }
      } catch (error) {
        let msg = 'Failed to send reset email';
        switch (error.code) {
          case 'auth/user-not-found': msg = 'No account found with this email.'; break;
          case 'auth/invalid-email': msg = 'Please enter a valid email address.'; break;
          case 'auth/too-many-requests': msg = 'Too many attempts. Please try again later.'; break;
          default: msg = error.message || 'Failed to send reset email';
        }
        showForgotPasswordError(msg);
      } finally {
        if (forgotPasswordBtn) {
          forgotPasswordBtn.disabled = false;
          forgotPasswordBtn.classList.remove('loading');
          forgotPasswordBtn.textContent = 'Send Reset Link';
        }
      }
    });
  }

  registerToggle.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      if (loginBtn) loginBtn.textContent = isRegisterMode ? 'Create Account' : 'Sign In';
      if (loginSubtitle) loginSubtitle.textContent = isRegisterMode ? 'Create your account' : 'Sign in to continue';
    });
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail ? loginEmail.value.trim() : '';
    const password = loginPassword ? loginPassword.value : '';
    if (!email || !password) {
      showLoginError('Enter email and password');
      return;
    }
    if (isRegisterMode) await performRegister(email, password);
    else await performLogin(email, password);
  });

  if (loginEmail) {
    loginEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const overlay = document.getElementById('loginOverlay');
        if (overlay && overlay.classList.contains('hidden')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }
  if (loginPassword) {
    loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const overlay = document.getElementById('loginOverlay');
        if (overlay && overlay.classList.contains('hidden')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }

  const deviceCancelBtn = document.getElementById('deviceCancelBtn');
  const deviceRemoveBtn = document.getElementById('deviceRemoveBtn');

  if (deviceCancelBtn) {
    deviceCancelBtn.addEventListener('click', () => {
      hideDevicePopup();
      logoutUser();
    });
  }

  if (deviceRemoveBtn) {
    deviceRemoveBtn.addEventListener('click', async () => {
      const otherDeviceEl = document.getElementById('otherDeviceId');
      const otherDevice = otherDeviceEl ? otherDeviceEl.textContent : '';

      // Show loading state on button
      deviceRemoveBtn.disabled = true;
      deviceRemoveBtn.textContent = 'Removing...';

      if (currentUser && otherDevice && otherDevice !== 'Unknown device') {
        const removeResult = await removeDeviceFromSubscription(currentUser.email, otherDevice);

        if (removeResult.error) {
          console.error('[Device] Remove failed:', removeResult.error);
          showToast('Error', 'Failed to remove device: ' + removeResult.error, 'error');
          deviceRemoveBtn.disabled = false;
          deviceRemoveBtn.textContent = 'Remove Other Device';
          return;
        }

        console.log('[Device] Other device removed, auto-logging in...');
        hideDevicePopup();

        // Now add current device and complete login flow
        const addResult = await addDeviceToSubscription(currentUser.email, deviceId);
        if (addResult.error) {
          console.error('[Device] Add device failed:', addResult.error);
          showToast('Error', 'Failed to add this device: ' + addResult.error, 'error');
          return;
        }

        // Fetch subscription again to confirm
        const subResult = await getUserSubscription(currentUser.email);
        if (subResult.error) {
          console.error('[Device] Subscription check failed:', subResult.error);
          showSubscriptionGate('no_subscription');
          return;
        }

        currentSubscription = subResult.subscription;

        if (!isSubscriptionValid(currentSubscription)) {
          const days = getDaysRemaining(currentSubscription);
          if (days <= 0) showSubscriptionGate('expired');
          else showSubscriptionGate('invalid');
          return;
        }

        // SUCCESS — hide login, show app, start polling
        hideLoginOverlay();
        hideSubscriptionGate();

        startSubscriptionPolling();
        showToast('Welcome Back', `Signed in as ${currentUser.email}`, 'success');

      } else {
        console.error('[Device] No current user or invalid other device');
        deviceRemoveBtn.disabled = false;
        deviceRemoveBtn.textContent = 'Remove Other Device';
      }
    });
  }

  const subGateDismissBtn = document.getElementById('subGateDismissBtn');
  if (subGateDismissBtn) {
    subGateDismissBtn.addEventListener('click', () => hideSubscriptionGate());
  }

  
  // Sign Out from sidebar
  const navSignOut = document.getElementById('navSignOut');
  if (navSignOut) {
    navSignOut.addEventListener('click', () => {
      closeSidebar();
      logoutUser();
    });
  }
initPaywallEvents();
  console.log('[Auth] Events attached');
}

// ============================================================
// DIAGNOSTIC & DEBUG — USE THESE TO FIX YOUR ISSUE
// ============================================================

/**
 * TEST 1: Check if your paste ID is correct and accessible
 * Run in console: await testPasteAccess('YOUR_PASTE_ID')
 */
window.testPasteAccess = async function(pasteId) {
  console.log('=== TESTING PASTE ACCESS ===');
  console.log('Paste ID:', pasteId);
  console.log('API Key:', PASTEFY_API_KEY.substring(0, 10) + '...');

  // Test 1: /paste/:id
  console.log('\n--- Test 1: /paste/:id ---');
  const r1 = await pastefyApiCall(`/paste/${pasteId}`);
  if (r1.error) {
    console.error('FAILED:', r1.error);
    console.log('\n>>> This means either:');
    console.log('    1. The paste ID is wrong (404)');
    console.log('    2. The API key does not have access (401/403)');
    console.log('    3. The paste is private and the API key owner is not the paste owner');
  } else {
    console.log('SUCCESS! Paste found:', r1.title || 'untitled');
    console.log('Has content field:', !!r1.content);
    console.log('Content length:', r1.content ? r1.content.length : 0);
    if (r1.content) {
      try {
        const parsed = JSON.parse(r1.content);
        console.log('Content is valid JSON!');
        console.log('\n>>> ROOT KEYS:', Object.keys(parsed));
        console.log('>>> FULL STRUCTURE:', JSON.stringify(parsed, null, 2).substring(0, 2000));
        if (parsed.subscriptions) {
          console.log('Subscriptions count:', parsed.subscriptions.length);
          console.log('First subscription:', JSON.stringify(parsed.subscriptions[0], null, 2).substring(0, 500));
        } else {
          console.error('\n>>> NO "subscriptions" ARRAY FOUND!');
          console.log('>>> Your paste must have a root "subscriptions" array like:');
          console.log(JSON.stringify({ subscriptions: [{ subEmail: 'user@example.com', status: 'active', expiryDate: '2026-12-31' }] }, null, 2));
        }
      } catch(e) {
        console.error('Content is NOT valid JSON!');
        console.log('First 500 chars:', r1.content.substring(0, 500));
      }
    }
  }

  // Test 2: /paste/:id/raw
  console.log('\n--- Test 2: /paste/:id/raw ---');
  const r2 = await pastefyGetRaw(pasteId);
  if (r2.error) {
    console.error('FAILED:', r2.error);
  } else {
    console.log('SUCCESS! Raw content length:', r2.content.length);
    try {
      const parsed = JSON.parse(r2.content);
      console.log('Content is valid JSON!');
      console.log('\n>>> ROOT KEYS:', Object.keys(parsed));
      if (parsed.subscriptions) {
        console.log('Subscriptions count:', parsed.subscriptions.length);
      } else {
        console.error('\n>>> NO "subscriptions" ARRAY FOUND in raw!');
      }
    } catch(e) {
      console.error('Content is NOT valid JSON!');
      console.log('First 500 chars:', r2.content.substring(0, 500));
    }
  }

  console.log('\n=== END TEST ===');
};

/**
 * TEST 2: Check subscription for a specific email
 * Run in console: await testSubscription('user@example.com')
 */
window.testSubscription = async function(email) {
  console.log('=== TESTING SUBSCRIPTION ===');
  console.log('Email:', email);
  console.log('Paste ID:', getSubscriptionPasteId());

  const result = await getUserSubscription(email);
  console.log('Result:', result);

  if (result.error) {
    console.error('FAILED:', result.error);
  } else {
    console.log('SUCCESS!');
    console.log('Subscription ID:', result.subscription.id);
    console.log('Status:', result.subscription.status);
    console.log('Expiry:', result.subscription.expiryDate);
    console.log('Days remaining:', getDaysRemaining(result.subscription));
    console.log('Device limit:', result.subscription.deviceLimit);
    console.log('Connected devices:', result.subscription.connectedDevices);
  }
  console.log('=== END TEST ===');
};

/**
 * Set paste ID without editing code
 * Run in console: setPasteId('YOUR_NEW_ID')
 */
window.setPasteId = function(id) {
  setManualPasteId(id);
  console.log('Paste ID set to:', id);
  console.log('Reload the page to use the new ID.');
};

// ============================================================
// INIT
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[ZedStream] DOM ready, init...');
    initHeroCarousel();
    initAuthEvents();
    initAuth();
  });
} else {
  console.log('[ZedStream] DOM already ready, init...');
  initAuthEvents();
  initAuth();
}

window.logoutUser = logoutUser;
window.getCurrentUser = () => currentUser;
window.getCurrentSubscription = () => currentSubscription;
window.getSubscriptionPasteId = getSubscriptionPasteId;
window.setManualPasteId = setManualPasteId;




</script>





<!-- ===== NETFLIX-STYLE PROFILE / MY ACCOUNT ===== -->
<div class="section hidden" id="profileSection">
  <div class="netflix-profile">

    <!-- Profile Hero Header -->
    <div class="netflix-profile-hero">
      <div class="netflix-profile-hero-bg"></div>
      <div class="netflix-profile-hero-content">
        <div class="netflix-avatar-large" id="netflixAvatar">?</div>
        <div class="netflix-profile-hero-info">
          <h1 class="netflix-profile-hero-name" id="netflixProfileName">Loading...</h1>
          <p class="netflix-profile-hero-email" id="netflixProfileEmail">...</p>
          <div class="netflix-profile-hero-meta">
            <span class="netflix-tag" id="netflixPlanTag">Standard</span>
            <span class="netflix-status-dot active" id="netflixStatusDot"></span>
            <span id="netflixStatusText">Active</span>
          </div>
        </div>
      </div>
    </div>

    <div class="netflix-container">

      <!-- Membership & Billing Card -->
      <div class="netflix-card">
        <div class="netflix-card-header">
          <div class="netflix-card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path></svg>
          </div>
          <div>
            <h2 class="netflix-card-title">Membership & Billing</h2>
            <p class="netflix-card-subtitle">Manage your subscription details</p>
          </div>
        </div>

        <div class="netflix-card-body">
          <div class="netflix-info-grid">
            <div class="netflix-info-item">
              <span class="netflix-info-label">Email Address</span>
              <span class="netflix-info-value" id="netflixEmail">-</span>
            </div>
            <div class="netflix-info-item">
              <span class="netflix-info-label">Plan</span>
              <span class="netflix-info-value">
                <strong id="netflixPlan">-</strong>
              </span>
            </div>
            <div class="netflix-info-item">
              <span class="netflix-info-label">Status</span>
              <span class="netflix-info-value" id="netflixStatus">-</span>
            </div>
            <div class="netflix-info-item">
              <span class="netflix-info-label">Next Billing Date</span>
              <span class="netflix-info-value" id="netflixExpiry">-</span>
            </div>
            <div class="netflix-info-item">
              <span class="netflix-info-label">Price</span>
              <span class="netflix-info-value" id="netflixPrice">-</span>
            </div>
          </div>

          <!-- Subscription Progress -->
          <div class="netflix-progress-section">
            <div class="netflix-progress-header">
              <span class="netflix-progress-label">Subscription Time Remaining</span>
              <span class="netflix-progress-days" id="netflixProgressText">0 days left</span>
            </div>
            <div class="netflix-progress-bar">
              <div class="netflix-progress-fill" id="netflixProgressFill" style="width: 0%"></div>
            </div>
          </div>

          <div class="netflix-card-actions">
            <button class="netflix-btn netflix-btn-primary" onclick="window.location.href='#'">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
              Change Plan
            </button>
            <button class="netflix-btn netflix-btn-secondary" onclick="window.location.href='#'">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>
              Renew Subscription
            </button>
          </div>
        </div>
      </div>

      <!-- Current Device Card -->
      <div class="netflix-card">
        <div class="netflix-card-header">
          <div class="netflix-card-icon device">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg>
          </div>
          <div>
            <h2 class="netflix-card-title">This Device</h2>
            <p class="netflix-card-subtitle">Your current active device</p>
          </div>
        </div>

        <div class="netflix-card-body">
          <div class="netflix-device-current">
            <div class="netflix-device-current-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg>
            </div>
            <div class="netflix-device-current-info">
              <div class="netflix-device-current-name">Current Device</div>
              <div class="netflix-device-current-id" id="netflixCurrentDeviceId">...</div>
              <div class="netflix-device-current-status">
                <span class="netflix-status-pulse"></span>
                Connected & Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Device Management Card -->
      <div class="netflix-card">
        <div class="netflix-card-header">
          <div class="netflix-card-icon devices">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"></path></svg>
          </div>
          <div>
            <h2 class="netflix-card-title">Device Management</h2>
            <p class="netflix-card-subtitle">Manage connected devices <span class="netflix-device-count" id="netflixDeviceCount">0 / 0</span></p>
          </div>
        </div>

        <div class="netflix-card-body">
          <div class="netflix-device-list" id="netflixDeviceList">
            <!-- Devices rendered here -->
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="netflix-quick-actions">
        <button class="netflix-quick-action" onclick="logoutUser()">
          <div class="netflix-quick-action-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
          </div>
          <span>Sign Out of All Devices</span>
          <svg class="netflix-quick-action-arrow" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
        </button>
      </div>

    </div>
  </div>
</div>

<!-- ===== PAYWALL MODAL ===== -->
<div class="paywall-overlay" id="paywallOverlay">
  <div class="paywall-modal">
    <div class="paywall-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
    </div>
    <div class="paywall-status" id="paywallStatus">Subscription Inactive</div>
    <div class="paywall-title" id="paywallTitle">Unlock Premium Content</div>
    <div class="paywall-desc" id="paywallDesc">Your subscription has expired or is inactive. Renew now to continue watching unlimited movies, TV shows, and live channels.</div>
    <div class="paywall-features">
      <div class="paywall-feature">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
        Unlimited Movies & TV Shows
      </div>
      <div class="paywall-feature">
        <svg viewBox="0 0 24 24"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"></path></svg>
        100+ Live TV Channels
      </div>
      <div class="paywall-feature">
        <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
        HD & 4K Streaming
      </div>
    </div>
    <a href="#" class="paywall-btn" id="paywallSubscribeBtn">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>
      Subscribe / Renew Now
    </a>
    <button class="paywall-btn paywall-btn-secondary" id="paywallDismissBtn">Continue Browsing</button>
  </div>
</div>

<!-- ===== LOGIN OVERLAY ===== -->
<div class="login-overlay" id="loginOverlay">
  <div class="login-container">
    <div class="login-logo">Zed<span>Stream</span></div>
    <div class="login-subtitle" id="loginSubtitle">Sign in to continue watching</div>
    <div class="login-error" id="loginError">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
      <span id="loginErrorText">Invalid email or password</span>
    </div>
    <form class="login-form" id="loginForm" onsubmit="return false;">
      <div class="login-input-group">
        <label>Email</label>
        <input type="email" class="login-input" id="loginEmail" placeholder="your@email.com" required autocomplete="email">
      </div>
      <div class="login-input-group">
        <label>Password</label>
        <div class="password-input-wrap">
          <input type="password" class="login-input" id="loginPassword" placeholder="••••••••" required autocomplete="current-password">
          <button type="button" class="password-toggle-btn" id="passwordToggleBtn" title="Show password">
            <svg id="eyeIcon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <svg id="eyeOffIcon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="display:none">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.66 2.66C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="login-options-row">
        <label class="remember-me-label">
          <input type="checkbox" id="rememberMe" checked>
          <span>Remember me</span>
        </label>
        <a class="forgot-password-link" id="forgotPasswordLink">Forgot Password?</a>
      </div>
      <button type="submit" class="login-btn" id="loginBtn">Sign In</button>
    </form>
    <div class="login-divider">or</div>
    <div class="login-toggle">
      Don't have an account? <a id="registerToggle">Create one</a>
    </div>
  </div>
</div>

<!-- ===== FORGOT PASSWORD MODAL ===== -->
<div class="forgot-password-overlay" id="forgotPasswordOverlay">
  <div class="forgot-password-modal">
    <div class="login-logo">Zed<span>Stream</span></div>
    <div class="login-subtitle">Reset your password</div>

    <div id="forgotPasswordFormWrap">
      <div class="login-error" id="forgotPasswordError" style="margin-bottom:16px;">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
        <span id="forgotPasswordErrorText">Error</span>
      </div>
      <form class="login-form" id="forgotPasswordForm" onsubmit="return false;">
        <div class="login-input-group">
          <label>Email</label>
          <input type="email" class="login-input" id="forgotPasswordEmail" placeholder="your@email.com" required autocomplete="email">
        </div>
        <button type="submit" class="login-btn" id="forgotPasswordBtn">Send Reset Link</button>
      </form>
      <button class="forgot-password-back-btn" id="forgotPasswordBackBtn">Back to Sign In</button>
    </div>

    <div class="forgot-password-success" id="forgotPasswordSuccess">
      <div class="forgot-password-success-icon">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
      </div>
      <div class="forgot-password-success-title">Check your email</div>
      <div class="forgot-password-success-text">We've sent a password reset link to <strong id="forgotPasswordEmailDisplay"></strong>. Follow the link to reset your password.</div>
      <button class="login-btn" id="forgotPasswordDoneBtn" style="margin-top:8px;">Back to Sign In</button>
    </div>
  </div>
</div>

<!-- ===== DEVICE DETECTION POPUP ===== --><div class="device-popup-overlay" id="devicePopupOverlay">
  <div class="device-popup">
    <div class="pin-modal-icon">
      <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
    </div>
    <div class="device-popup-title">Device Limit Reached</div>
    <div class="device-popup-desc">
      Your subscription allows <strong id="deviceLimitDisplay">1</strong> device(s).<br>
      You are currently logged in on another device.
    </div>
    <div class="device-id-label">Current Device</div>
    <div class="device-id-box" id="currentDeviceId">—</div>
    <div class="device-id-label">Other Device</div>
    <div class="device-id-box" id="otherDeviceId">—</div>
    <div class="device-popup-desc" style="margin-top:16px;">
      Remove the other device to continue on this one.
    </div>
    <div class="device-popup-actions">
      <button class="pin-btn secondary" id="deviceCancelBtn">Cancel</button>
      <button class="pin-btn primary" id="deviceRemoveBtn">Remove Other Device</button>
    </div>
  </div>
</div>

<!-- ===== SUBSCRIPTION GATE OVERLAY ===== -->
<div class="sub-gate-overlay" id="subGateOverlay">
  <div class="sub-gate-modal">
    <div class="sub-gate-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
    </div>
    <div class="sub-gate-title" id="subGateTitle">Subscription Required</div>
    <div class="sub-gate-desc" id="subGateDesc">
      Your subscription has expired or is not valid.<br>
      Please subscribe to continue watching Bob TV.
    </div>
    <a href="#" class="sub-gate-btn" id="subGateBtn">Subscribe Now</a>
    <button class="sub-gate-btn sub-gate-secondary" id="subGateDismissBtn">Dismiss</button>
    <button class="sub-gate-btn sub-gate-secondary" id="subGateLogoutBtn">Log Out</button>
  </div>
</div>


<!-- ===== AUTH PRELOADER ===== -->
<div class="auth-preloader" id="authPreloader">
  <div class="auth-preloader-content">
    <div class="auth-preloader-spinner"></div>
    <div class="auth-preloader-logo">Zed<span>Stream</span></div>
    <div class="auth-preloader-text">Initializing your account...</div>
    <div class="auth-preloader-sub">Please wait while we verify your subscription</div>
  </div>
</div>


<!-- ===== COPY PROTECTION ===== -->
<script>
(function() {
  'use strict';

  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Disable text selection
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Disable drag and drop
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Disable copy, cut, paste keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+U (view source)
    if (e.ctrlKey || e.metaKey) {
      const blockedKeys = ['c', 'x', 'v', 'a', 's', 'p', 'u'];
      if (blockedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    // F12 (DevTools), Ctrl+Shift+I/J/C
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Disable copy event
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Disable cut event
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Disable paste event (except on input fields for usability)
  document.addEventListener('paste', function(e) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
      e.preventDefault();
      return false;
    }
  }, true);

  // Prevent developer tools detection bypass attempts
  let devtoolsOpen = false;
  const threshold = 160;

  setInterval(function() {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        console.clear();
        console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cThis is a browser feature intended for developers.', 'font-size: 16px;');
      }
    } else {
      devtoolsOpen = false;
    }
  }, 500);

  // Disable print
  window.addEventListener('beforeprint', function(e) {
    e.preventDefault();
    return false;
  });

  // Override console methods to deter casual inspection
  const originalLog = console.log;
  console.log = function() {
    // Allow logs from our own app
    originalLog.apply(console, arguments);
  };

})();
