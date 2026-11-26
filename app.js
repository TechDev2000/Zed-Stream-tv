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
