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

/* ===== MANUAL SUBTITLE LOAD HELPER ===== */
window.debugSubtitles = function() {
  console.log('=== SUBTITLE DEBUG ===');
  console.log('Video element:', playerVideo);
  console.log('TextTracks:', playerVideo ? playerVideo.textTracks : null);
  console.log('Track count:', playerVideo && playerVideo.textTracks ? playerVideo.textTracks.length : 0);
  if (playerVideo && playerVideo.textTracks) {
    for (let i = 0; i < playerVideo.textTracks.length; i++) {
      const tt = playerVideo.textTracks[i];
      console.log(`Track ${i}: kind=${tt.kind}, mode=${tt.mode}, label=${tt.label}, cues=${tt.cues ? tt.cues.length : 'null'}`);
    }
  }
  console.log('Selected URL:', selectedSubtitleUrl);
  console.log('Subtitles enabled:', subtitlesEnabled);
  console.log('Current subtitle tracks:', currentSubtitleTracks);
  console.log('======================');
};

window.reloadSubtitles = async function() {
  if (!selectedSubtitleUrl) {
    console.log('No subtitle currently selected');
    return;
  }
  console.log('Manually reloading subtitle:', selectedSubtitleUrl);
  await loadSubtitle(selectedSubtitleUrl, 'en');
};