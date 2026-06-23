
// ZedStream - Protected Code v2.0
// Encryption: Double-XOR-192
// Anti-Debug: 5 vectors
// Integrity: SHA-256
// VM: State-obfuscated
(function(){
    "use strict";
    if(typeof window==='undefined'||typeof document==='undefined')return;
(function(){
var _k1=atob("RF1tKEJda2dZJWtJX2VRYWJjSk91dyNyIytfZXo1XV51aTRUfkc8d152cmddSWBPaStDeHVXQyR8JCVKeH0wZyQ7IyRldkB7bjhwOzR1cHNEbVY/UTxOXiVZVDktXmNrMXlaWV0jfX1ZOnY0KS5EYStFcStYKEFCYlppbElwb24="),_k2=atob("e3NFSDBKczw0JF56VT13MXBZJSE2YVV7LltpI0Jve20oUVIjM354LmZuaEx6dnhZOHVaZktjQyhHd04kTmE8QQ==");
window.__s=window.__s||function(_e,_l){
var _b=atob(_e),_r=[],_i=0;
for(;_i<_l;_i++){
_r.push(String.fromCharCode(
_b.charCodeAt(_i)^
_k1.charCodeAt(_i%_k1.length)^
_k2.charCodeAt(_i%_k2.length)
));
}
return _r.join('');
};
})();
(function(){
var _expected="9fb2daa91bcdffce3955fa8c51dc311b";
var _verify=function(){
try{
var _scripts=document.querySelectorAll('script');
var _found=false;
for(var _i=0;_i<_scripts.length;_i++){
var _src=_scripts[_i].src||'';
if(_src.indexOf('script.js')!==-1||_src===''){
_found=true;break;
}
}
}catch(e){}
};
_verify();
})();
(function(){
var _d=false;
(function(){
var _e=new Image();
Object.defineProperty(_e,'id',{
get:function(){
_d=true;
setTimeout(function(){try{document.body.innerHTML=''}catch(e){}},0);
return '';
}
});
try{console.log('%c',_e)}catch(e){}
})();
(function _chk(){
var _s=performance.now();
debugger;
var _e=performance.now();
if(_e-_s>100){
_d=true;
location.href='about:blank';
return;
}
setTimeout(_chk,2000+Math.random()*1000);
})();
(function _sz(){
var _w=window.outerWidth-window.innerWidth;
var _h=window.outerHeight-window.innerHeight;
if(_w>160||_h>160){
_d=true;
document.documentElement.style.display='none';
}
setTimeout(_sz,1000);
})();
var _origToString=Function.prototype.toString;
Function.prototype.toString=function(){
var _r=_origToString.call(this);
if(_r.indexOf('__s')!==-1||_r.indexOf('_chk')!==-1){
return '[native code]';
}
return _r;
};
document.addEventListener('keydown',function(e){
if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))){
e.preventDefault();
e.stopPropagation();
return false;
}
},true);
})();
(function(){
var _st=0,_mem=[],_pc=0,_stk=[];
var _exec=setTimeout;
var _realExec=function(_fn){_fn();};
var _nativeCheck=function(){
var _tests=[
Array.prototype.push.toString().indexOf('[native code]')!==-1,
Function.prototype.apply.toString().indexOf('[native code]')!==-1,
Date.now()!==0
];
if(!_tests.every(function(_t){return _t;})){
throw new Error();
}
};
setInterval(_nativeCheck,5000);
var _protect=function(_obj,_prop){
var _desc=Object.getOwnPropertyDescriptor(_obj,_prop);
if(_desc){
Object.defineProperty(_obj,_prop,{
configurable:false,
writable:false,
value:_desc.value
});
}
};
try{_protect(window,'localStorage');_protect(window,'sessionStorage');}catch(e){}
})();
const API = __s("V1pcEAEtN3QMcVwdaDdEJGRbCRwqdRcnfhlCIw==",28);
const PER_PAGE = 18;
const STORAGE_KEYS = {
WATCHLIST: __s("XUFKFARIbzoZYl1fYytS",15),
CONTINUE: __s("XUFKFARIezQDdVxdfz0=",14),
SETTINGS: __s("XUFKFARIaz4ZdVxdbSs=",14)
};
let activeTab = __s("UkFeCRdk",6);
let currentPage = 1;
let lastPage = 1;
let currentData = [];
let currentItem = null;
let searchQuery = '';
let hlsInstance = null;
let tvDetailData = null;
let popularData = [];
let currentView = __s("XVxHFwFy",6);
let heroCarouselData = [];
let heroCurrentIndex = 0;
let heroAutoPlayInterval = null;
let heroIsHovering = false;
let heroProgressInterval = null;
let heroProgressStartTime = 0;
const HERO_AUTOPLAY_DELAY = 8000;
const HERO_KB_VARIANTS = [__s("RUFHDV94bS8=",8), __s("T09GTQB+fzMZ",9), __s("T09GTR5yfi8=",8), __s("RUFHDV94bS8=",8), __s("T09GTQB+fzMZ",9)];
let isLoadingMore = false;
let hasMorePages = true;
let infiniteScrollObserver = null;
let allLoadedData = [];
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
let currentSubtitlePosition = __s("XUFcFB16",6);
const SUBTITLE_POSITIONS = [
{ id: __s("XUFcFB16",6), label: __s("fUFcFB16",6), desc: __s("e0tOAQd7bHsdbkZafjFJPjJbDQE1c1ZqYh5CNFc2VQ==",31), icon: __s("XUFcFB16",6) },
{ id: __s("S0FY",3), label: __s("a0FY",3), desc: __s("fUtEDwU3bDMIIUFafjRDcHBbHQ==",19), icon: __s("S0FY",3) },
{ id: __s("UkdMBB5y",6), label: __s("ckdMBB5y",6), desc: __s("fEtGFBdlfT9NblsTeTtUNXdU",18), icon: __s("UkdMBB5y",6) },
{ id: __s("U0FfBQA6bDMEc1E=",11), label: __s("c0FfBQA3TDMEc1E=",11), desc: __s("fVxHARZ0eSgZLEZHczRDcGJWDg0mexNneQ==",25), icon: __s("U0FfBQA6bDMEc1E=",11) },
{ id: __s("SUtaGV91dy8Zblg=",11), label: __s("aUtaGVJVdy8Zblg=",11), desc: __s("eUJdExo3bzIZaRVRZSxSP38aCgokcw==",22), icon: __s("SUtaGV91dy8Zblg=",11) }
];
let progressSaveInterval = null;
function getWatchlist() {
try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || __s("ZHM=",2)); }
catch(e) { return []; }
}
function saveWatchlist(list) {
localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
updateWatchlistBadge();
}
function isInWatchlist(item) {
const list = getWatchlist();
return list.some(w => w.id === item.id && w.type === (item.first_air_date ? __s("S1g=",2) : __s("UkFeCRc=",5)));
}
function toggleWatchlist(item, btnEl) {
const list = getWatchlist();
const type = item.first_air_date ? __s("S1g=",2) : __s("UkFeCRc=",5);
const idx = list.findIndex(w => w.id === item.id && w.type === type);
if (idx >= 0) {
list.splice(idx, 1);
showToast(__s("bUtFDwRyfHsLc1peKg9HJHFSAwcwYg==",22), `__s("G1VBFBd6Ni8EdVlWKiRacHtOCgNteBdkaA0=",26) has been removed.`, __s("VkBODw==",4));
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
showToast(__s("fkpMBRY3bDRNVlRHaTBKOWFO",18), `__s("G1VBFBd6Ni8EdVlWKiRacHtOCgNteBdkaA0=",26) has been added.`, __s("TFtLAxdkaw==",7));
}
saveWatchlist(list);
if (btnEl) {
const isActive = idx < 0;
btnEl.classList.toggle(__s("Xk1cCQRy",6), isActive);
const textSpan = btnEl.querySelector(__s("TF5JDg==",4));
if (textSpan) textSpan.textContent = isActive ? __s("dkAINxNjezMBaEZH",12) : __s("fkpMQAZ4OAwMdVZbZjFVJA==",16);
}
updateHeroWatchlistBtn();
refreshGridWatchlistButtons();
if (currentView === __s("SE9cAxp7cSgZ",9)) {
renderWatchlistView();
}
}
function updateWatchlistBadge() {
const list = getWatchlist();
const badge = document.getElementById(__s("SE9cAxp7cSgZQ1RXbT0=",14));
if (badge) {
badge.textContent = list.length;
badge.style.display = list.length > 0 ? __s("VkBECRxyNTkBblZY",12) : __s("UUFGBQ==",4);
}
}
function getContinueWatching() {
try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE) || __s("ZHM=",2)); }
catch(e) { return []; }
}
function saveContinueWatching(list) {
list = list.slice(0, 50);
localStorage.setItem(STORAGE_KEYS.CONTINUE, JSON.stringify(list));
updateContinueBadge();
}
function updateContinueWatching(item, currentTime, duration, season, episode, episodeName) {
const list = getContinueWatching();
const type = item.first_air_date ? __s("S1g=",2) : __s("UkFeCRc=",5);
const key = type === __s("S1g=",2) ? `${item.id}_S${season}E${episode}` : String(item.id);
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
const badge = document.getElementById(__s("XEFGFBt5bT4vYFFUbw==",13));
if (badge) {
badge.textContent = list.length;
badge.style.display = list.length > 0 ? __s("VkBECRxyNTkBblZY",12) : __s("UUFGBQ==",4);
}
}
function updateHeroWatchlistBtn() {
const btn = document.getElementById(__s("V0taDyV2bDgFbVxAfhpSPg==",16));
const text = document.getElementById(__s("V0taDyV2bDgFbVxAfgxDKGY=",17));
if (!btn || !currentItem) return;
const inList = isInWatchlist(currentItem);
btn.classList.toggle(__s("Xk1cCQRy",6), inList);
if (text) text.textContent = inList ? __s("dkAINxNjezMBaEZH",12) : __s("fkpMQAZ4OAwMdVZbZjFVJA==",16);
}
function refreshGridWatchlistButtons() {
document.querySelectorAll(__s("EU1JEhY6bzoZYl1fYytSfXBOAUJjOAVlZBRTNBUtR0c+UAoePk1pO0x2",42)).forEach(btn => {
const idx = parseInt(btn.dataset.idx);
const isSlider = btn.classList.contains(__s("TEJBBBdlNSwMdVZbZjFVJD9YGwA=",20));
const dataArr = isSlider ? popularData : currentData;
const item = dataArr[idx];
if (item) {
btn.classList.toggle(__s("Xk1cCQRy",6), isInWatchlist(item));
}
});
}
function showToast(title, message, type = __s("VkBODw==",4)) {
const container = document.getElementById(__s("S0FJEwZUdzUZYFxdbyo=",14));
const toast = document.createElement(__s("W0de",3));
toast.className = __s("S0FJEwY=",5);
const icons = {
success: __s("A11eB1JhcT4aQ1pLNwd5IzoYKxl3TydMTBp5AVQABB9kEVhLPVgwMRh8J3R4TDA0MjZ6V2thUTlwBBwGeE5/ahAQATQMUgcfAndscisOXnZ9BCJWJDpdE011TSMsXXxefEReCg8fXCB0I0cvFgtLVlhHFnAxZzZTDBMbZ3dwJ0cBEgcTBHAm",135),
error: __s("A11eB1JhcT4aQ1pLNwd5IzoYKxl3TydMTBp5AVQABB9kEVhLPVgwMRh8J3R4TDA0MjYhf29xQll3PT00eU5ZZBQlCSsPVkQIDCwbOS8jZHVSXyJHBDpZE011cyMsZ0Jef2lkEQ8cYmJzM0ssESJbVkpoZiJfJjIsa1RuB15EJ0x5RxhLMHooIi4wBAJOCX8mdkNaNyFQO25DJGcBbDISRg5VCg0OfSgMe3ZQT3VGLS5zciAoFwo8I0syHwYIICNVKS9Y",195),
info: __s("A11eB1JhcT4aQ1pLNwd5IzoYKxl3TydMTBp5AVQABB9kEVhLPVgwMRh8J3R4TDA0MjYhf29xQll3PT00eU5ZZBQlCSsPVkQIDCwbOS8jZHVSXyJHBDpZE011cyMsZ0Jef2lkEQ8cYmJzM0ssESJbVkpoZiJfJjIsa1RuB15EJ0x5RxhLMHooIi4wBAJOCX8mdkNaNyFQFW5DJGcFbDISRg5VMA0OfSgMe3ZQT3VGaC5zciAoFwo8I0syHwYIICNVKS9Y",195)
};
toast.innerHTML = `
<div class=__s("S0FJEwY6cTgCbxUXcSxfIHdH",18)>${icons[type]}</div>
<div class=__s("S0FJEwY6ezQDdVBdfg==",13)>
<div class=__s("S0FJEwY6bDIZbVA=",11)>${title}</div>
<div class=__s("S0FJEwY6dT4eclRUbw==",13)>${message}</div>
</div>
<button class=__s("S0FJEwY6ezcCclA=",11)>×</button>
`;
toast.querySelector(__s("EVpHAQFjNTgBbkZW",12)).addEventListener(__s("XEJBAxk=",5), () => {
toast.classList.add(__s("TUtFDwR+djw=",8));
setTimeout(() => toast.remove(), 300);
});
container.appendChild(toast);
setTimeout(() => {
if (toast.parentNode) {
toast.classList.add(__s("TUtFDwR+djw=",8));
setTimeout(() => toast.remove(), 300);
}
}, 4000);
}
const grid = document.getElementById(__s("WFxBBA==",4));
const heroTitle = document.getElementById(__s("V0taDyZ+bDcI",9));
const heroMeta = document.getElementById(__s("V0taDz9ybDo=",8));
const heroOverview = document.getElementById(__s("V0taDz1hfSkbaFBE",12));
const heroBtn = document.getElementById(__s("V0taDzBjdg==",7));
const heroBadge = document.getElementById(__s("V0taDzB2fDwI",9));
const sectionTitle = document.getElementById(__s("TEtLFBt4dg8EdVlW",12));
const pageInfo = document.getElementById(__s("T09PBTt5fjQ=",8));
const prevBtn = document.getElementById(__s("T1xNFjBjdg==",7));
const nextBtn = document.getElementById(__s("UUtQFDBjdg==",7));
const searchInput = document.getElementById(__s("TEtJEhF/UTUddEE=",11));
const searchBtn = document.getElementById(__s("TEtJEhF/Wi8D",9));
const tabGroup = document.getElementById(__s("S09KJwB4bSs=",8));
const detailsModal = document.getElementById(__s("W0tcARt7axYCZVRf",12));
const detailsClose = document.getElementById(__s("W0tcARt7axgBbkZW",12));
const detailsContent = document.getElementById(__s("W0tcARt7axgCb0FWZCw=",14));
const playerModal = document.getElementById(__s("T0JJGRdlVTQJYFk=",11));
const continueTrack = document.getElementById(__s("XEFGFBt5bT45c1RQYQ==",13));
const continueWatchingSection = document.getElementById(__s("XEFGFBt5bT46YEFQYjFIN0FfDBoqeRg=",23));
const continuePrev = document.getElementById(__s("XEFGFBt5bT49c1BF",12));
const continueNext = document.getElementById(__s("XEFGFBt5bT4jZE1H",12));
const heroWatchlistBtn = document.getElementById(__s("V0taDyV2bDgFbVxAfhpSPg==",16));
const heroCarousel = document.getElementById(__s("V0taDzF2ajQYclBf",12));
const sidebar = document.getElementById(__s("TEdMBRB2ag==",7));
const sidebarOverlay = document.getElementById(__s("TEdMBRB2ahQbZEdfayE=",14));
const menuBtn = document.getElementById(__s("UktGFTBjdg==",7));
const sidebarClose = document.getElementById(__s("TEdMBRB2ahgBbkZW",12));
const paginationControls = document.getElementById(__s("T09PCRx2bDICb3ZcZCxUP35J",18));
const heroSection = document.getElementById(__s("V0taDzF2ajQYclBf",12));
const playerTopBar = document.getElementById(__s("T0JJGRdlTDQdQ1RB",12));
const playerBackBtn = document.getElementById(__s("T0JJGRdlWjoOandHZA==",13));
const playerTopTitle = document.getElementById(__s("T0JJGRdlTDQdVVxHZj0=",14));
const playerTopSubtitle = document.getElementById(__s("T0JJGRdlTDQdUkBRfjFSPHc=",17));
const playerVideoArea = document.getElementById(__s("T0JJGRdlTjIJZFpyeD1H",15));
const playerVideoWrapper = document.getElementById(__s("T0JJGRdlTjIJZFpkeDlWIHdI",18));
let playerVideo = document.getElementById(__s("T0JJGRdlTjIJZFo=",11));
const playerCenterOverlay = document.getElementById(__s("T0JJGRdlWz4DdVBBRS5DIn5bFg==",19));
const playerCenterBtn = document.getElementById(__s("T0JJGRdlWz4DdVBBSCxI",15));
const centerPlayIcon = document.getElementById(__s("XEtGFBdlSDcMeHxQZTY=",14));
const centerPauseIcon = document.getElementById(__s("XEtGFBdlSDoYclB6aTdI",15));
const playerLoading = document.getElementById(__s("T0JJGRdlVDQMZVxdbQ==",13));
const playerLoadingText = document.getElementById(__s("T0JJGRdlVDQMZVxdbQxDKGY=",17));
const playerBufferRing = document.getElementById(__s("T0JJGRdlWi4LZ1BBWDFINw==",16));
const playerErrorOverlay = document.getElementById(__s("T0JJGRdlXSkfbkd8fD1UPHND",18));
const playerErrorMsg = document.getElementById(__s("T0JJGRdlXSkfbkd+eT8=",14));
const playerErrorRetry = document.getElementById(__s("T0JJGRdlXSkfbkdhbyxUKQ==",16));
const playerControlsBar = document.getElementById(__s("T0JJGRdlWzQDdUdcZitkMWA=",17));
const playerProgressArea = document.getElementById(__s("T0JJGRdlSCkCZkdWeStnIndb",18));
const playerProgressTrack = document.getElementById(__s("T0JJGRdlSCkCZkdWeStyInNZBA==",19));
const playerProgressBuffer = document.getElementById(__s("T0JJGRdlSCkCZkdWeStkJXRcChw=",20));
const playerProgressFill = document.getElementById(__s("T0JJGRdlSCkCZkdWeStgOX5W",18));
const playerProgressThumb = document.getElementById(__s("T0JJGRdlSCkCZkdWeStyOGdXDQ==",19));
const playerHoverTime = document.getElementById(__s("T0JJGRdlUDQbZEdnYzVD",15));
const playerPlayBtn = document.getElementById(__s("T0JJGRdlSDcMeHdHZA==",13));
const playIcon = document.getElementById(__s("T0JJGTt0dzU=",8));
const pauseIcon = document.getElementById(__s("T09dExdeezQD",9));
const playerSkipBackBtn = document.getElementById(__s("T0JJGRdlSzAEcXdSaTNkJHw=",17));
const playerSkipForwardBtn = document.getElementById(__s("T0JJGRdlSzAEcXNceC9HInZ4GwA=",20));
const playerVolumeWrap = document.getElementById(__s("T0JJGRdlTjQBdFhWXSpHIA==",16));
const playerVolumeBtn = document.getElementById(__s("T0JJGRdlTjQBdFhWSCxI",15));
const playerVolumeSlider = document.getElementById(__s("T0JJGRdlTjQBdFhWWTRPNHdI",18));
const playerVolumeFill = document.getElementById(__s("T0JJGRdlTjQBdFhWTDFKPA==",16));
const volHighIcon = document.getElementById(__s("SUFEKBtwcBIObls=",11));
const volLowIcon = document.getElementById(__s("SUFELB1gUTgCbw==",10));
const volMuteIcon = document.getElementById(__s("SUFELQdjfRIObls=",11));
const playerTimeDisplay = document.getElementById(__s("T0JJGRdlTDIAZHFaeShKMWs=",17));
const playerQualityBtn = document.getElementById(__s("T0JJGRdlSS4MbVxHcxpSPg==",16));
const qualityLabel = document.getElementById(__s("TltJDBtjYRcMY1Bf",12));
const playerQualityDropdown = document.getElementById(__s("T0JJGRdlSS4MbVxHcxxUP2JeABkt",21));
const playerSpeedBtn = document.getElementById(__s("T0JJGRdlSysIZFFxfjY=",14));
const speedLabel = document.getElementById(__s("TF5NBRZbeTkIbQ==",10));
const playerSpeedDropdown = document.getElementById(__s("T0JJGRdlSysIZFF3eDdWNH1NAQ==",19));
const playerSubBtn = document.getElementById(__s("T0JJGRdlSy4PQ0Fd",12));
const playerSubDropdown = document.getElementById(__s("T0JJGRdlSy4PRUdcejxJJ3w=",17));
const playerSubPosBtn = document.getElementById(__s("T0JJGRdlSy4PUVpASCxI",15));
const playerSubPosDropdown = document.getElementById(__s("T0JJGRdlSy4PUVpATipJIHZVGAA=",20));
const playerFsBtn = document.getElementById(__s("T0JJGRdlXigvdVs=",11));
const fsEnterIcon = document.getElementById(__s("WV1tDgZyahIObls=",11));
const fsExitIcon = document.getElementById(__s("WV1tGBtjUTgCbw==",10));
const playerPrevEpisodeBtn = document.getElementById(__s("T0JJGRdlSCkId3BDYytJNHd4GwA=",20));
const playerNextEpisodeBtn = document.getElementById(__s("T0JJGRdlVj4VdXBDYytJNHd4GwA=",20));
const nextEpisodeToast = document.getElementById(__s("UUtQFDdncSgCZVBnZTlVJA==",16));
const nextEpisodeTitle = document.getElementById(__s("UUtQFDdncSgCZVBnYyxKNQ==",16));
const nextEpisodePlay = document.getElementById(__s("UUtQFDdncSgCZVBjZjlf",15));
const nextEpisodeCancel = document.getElementById(__s("UUtQFDdncSgCZVBwazZFNX4=",17));
function openSidebar() {
sidebar.classList.add(__s("UF5NDg==",4));
sidebarOverlay.classList.add(__s("UF5NDg==",4));
}
function closeSidebar() {
sidebar.classList.remove(__s("UF5NDg==",4));
sidebarOverlay.classList.remove(__s("UF5NDg==",4));
}
menuBtn.addEventListener(__s("XEJBAxk=",5), openSidebar);
sidebarClose.addEventListener(__s("XEJBAxk=",5), closeSidebar);
sidebarOverlay.addEventListener(__s("XEJBAxk=",5), closeSidebar);
document.querySelectorAll(__s("EV1BBBd1eSlAb1RFJzFSNX8=",17)).forEach(item => {
item.addEventListener(__s("XEJBAxk=",5), () => {
const view = item.dataset.view;
if (!view) return;
document.querySelectorAll(__s("EV1BBBd1eSlAb1RFJzFSNX8=",17)).forEach(i => i.classList.remove(__s("Xk1cCQRy",6)));
item.classList.add(__s("Xk1cCQRy",6));
closeSidebar();
switchView(view);
});
});
function switchView(view) {
currentView = view;
return `<div class=__s("XE9aBA==",4) data-watchidx=__s("G1VBHQ==",4)>
<div class=__s("XE9aBF9ndygZZEc=",11)><img src=__s("G1VBFBd6NisCckFWeAdTIn5H",18) alt=__s("G1VBFBd6Ni8EdVlWdw==",13) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKg==",25)>
<div class=__s("XE9aBF91eT8KZA==",10)>★ ${item.vote_average}</div>
<div class=__s("XE9aBF94bj4fbVRK",12)><div class=__s("S09PEw==",4)>${genres}</div></div>
<button class=__s("XE9aBF9geS8OaVlaeSwLMmZUTw8gYh9/aA==",25) data-watchidx=__s("G1VBHQ==",4) title=__s("bUtFDwRyOD0fblgTXTlSM3pWBh03",21)>
<svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("ch8aQEAmNmhYbRgCJGwTfSMUXFwAI1g9LUEDaAtsBgF9CVRZfwFkaxggNB4HDTgjf2orPgoaND4bYEtZGCksFTx5SFthHANnaTIacE9wNmIAGkY+VXMrHEgzDjRfCDg1NxA5Wl9pK2QJdC1YYm4SDTMDC3wqZTdSBR4HejUxZgELHAhSQDcgdVhiBRM5dhFoPwlBWmMgWDE7XQ5oDW8GAmwWU0MBCHZ5Cik0GBJF",174)></path></svg>
</button>
</div>
<div class=__s("XE9aBF9+dj0C",9)><div class=__s("XE9aBF9jcS8BZA==",10)>${item.title}</div>
<div class=__s("XE9aBF9kbTk=",8)><span class=__s("XE9aBF9ufTof",9)>${year}</span><span>${eps}</span></div>
</div>
</div>`;
}).join('__s("FhUialI3fykEZRtCfz1UKUFfAwsgYhl7TBxabg==",28).card__s("FgBODwBSeTgFKVBfKmUYcGkwT05jNhVmYwNCZlE+XhNgGBYWP0ohEFZsMk5LEXx3JT9qe0oad21PMAMHUmQlHVVoRkx1WV9pO3hKBBctaTZ4XQBqAjN+VyM=",89)click__s("Ew4ABVs3JWVNej8TKngGcDJTCU5rc1h9bAJRI0x0RV8ySwMEORE=",38).card-watchlist-btn__s("FgcIEhdjbSkDOj8TKngGcDJZAAAwYlZgeRVbZgV6SlouTD0eKUEZYjI4OgsHHzh/N34xd0pRbSUbKGFOFjwsBn9oRkN6HGEiOXNAMhU6ciFAFBpqAjA7SmloWHkbEX5pawhnCgszQTZLNXcUIFIcGDMQC20za2EFS15TaGFkP0N2Wk0NUio4IGchFRMqeAZwMhpPBycsVmB5FVtoUT4KOX0YRldtGWR5GDhuRkNdR381ZDl3SlFtIk8+DwxpdWgKVWhGTHUcE2d6PA41CDxrJw4UGmoCMDVRYnZRf0M7OCY5CChaTn0lc1E1cx1peFVMdl0FOXo/bg8JJwdoJzFzDx8OCEACeGsvCHNqRng0HHB7TgoDbWYZenkVRBlNKEofVxhGV20ZZHkYODpJRlxzciMxaUFLRmw2GzofC1sybkc8IwIeOkxsMihwAktBaCdiFBRTPkd9bUp/Z2J7GVRqZ35NMloHKWA+ESJxDDYHXU52QkoqdmcISgUNB2gnMXMPH0lNDgBya2FNaEFWZ3ZBNXxICh1vHFYpLVAWZhh6BhMvXQoSLEohBlx5bk4dH3FiNDM3bFtYZW1INjQKV2hpClVoRkx1HBNnejwOJwg6dDZrVRpsODl6UW44HXMbVHUobVF4H05gOG4f",489)tv__s("HxEICQZydXUfZFlWaytDD3ZbGwtjLFZneBxaajJ6BhN9GEZXbRlkK012bkJKWiI2OCp8cxBGdWJPOgYLGhYsBn9oRkx1HBNnNGlDIwQ6WC1SaxZuDi50QW5xBzoGRX1rN0Z9Fww4dwxQMkEdIzFPV3dVWGEZayJKBQ0HaCcxc0FKQ0oFAEh3PTJyUFJ5N0gjKBoGGiZ7WGd4HVQjSgVJVQJLAxY+VioqFBI6CwcfODZxfjk+UUJlfk06DhkMPGVSOiVIAyNZQTEzeVlLQWgnYhQUUz4aZhEFKyIdOk8ROGVsWnofAClMJ1o5PkVzPklUf3lfKH5wCEoFDQdoJzFzQE9LRiQXY3kyAXIdVX80ShlmXwJHeBxWKS1QFmZFUAYTfRgbXnYzZHlFMSEhLR84cSM3fTBPQWV+QgAOAlN/eEktCQoAfQ==",325).card-watchlist-btn__s("FgBODwBSeTgFKVdHZHgbbjJBZU5jNlZreR4YJ1w+Y0U4VhI7JEowPFZ9aAM=",44)click__s("Ew4ABVs3JWVNej8TKngGcDJfQR03eQZZfx9GJ187UloyVk5edjNkeRg4OgtEUHZlJX5wekYUPSxLMhkdU1ViUncqEgJ7WFIzO29LNU8/ZjZXXBp6H3QgLysiHTpPEXtpd1t8WgcpYD4faT4UOitIY3pUUxAoQSJKBQ0HaG53cwdWWk0NWzdjUU0hFRMqeAZwcVUBHTc2EHxhHH8yXTcGDn1DbFdtGWR5GDg6CwdWfCxxN217UxppaBdZS04WPCwGf2hGTCFRVyUFdUp7QSFzJ1kaB3MDP0RMby43Ok8ROCY5CChaTilsJ1MxJFg6LFlVPURCOX8uLmAFDQdoJzFzDx8ORgEfciJ7BHVQXiQsTyR+X0NkYzZWKS1QFmYYelZcLkwDBRJMNjUCOHNfQlI2Zj4tbXtMa3V+V39hThY8LAZ/aEZMdV5SJDF4XC4RF3IwWA5TdxM4dgtpY15xC0N3dkZdehZCVyVzH3Q+WHN4HBhlX18oTCp0D1dMQC09MTpbWkMGFh1jfQQMd1BBaz9DfBgaT05jNlYpLVAWIV00VFYuAkYeOVwpd199dFlCTDQccX45Ph4UICwbcxkLWnltVToXAg0hWQlnM2hLLE86Yi5RVQB7ODl6UW4uNzpPETgmOQgoWk47bCFMIEEZOipjXHJETnczInYPSANTMXd0cxICEwg=",515)tv__s("HxEICQZydXUfZFlWaytDD3ZbGwtjLFZneBxaajJ6BhN9GEZXbRlkK012bkJKWiI2OCp8cxBGdWJPOgYLGhYsBn9oRkx1HBNnNGlDIwQ6WC1SaxZuDi50QW5xBzoGRX1rN0Z9Fww4dwxQMkEdIzFPV3dVWGEZayJKBQ0HaCcxc0FKQ0oFAEh3PTJyUFJ5N0gjKBoGGiZ7WGd4HVQjSgVJVQJLAxY+VioqFBI6CwcfODZxfjk+UUJlfk06DhkMPGVSOiVIAyNZQTEzeVlLQWgnYhQUUz4aZhEFKyIdOk8ROHJ2T28WCwpkJ1w8chEgLBReZlxHBGcub0YFT1MmLipZDx8OCEBSahJ7TSEVTiNjLHAyR0ZVSWt8A2sFWCVMM0ldfUoDGSlcNhpXdm5CSUp9QDg7bjYXFHsGG3MYC1VoZUkxHA8YOVkdMz9kWgIOJnMnWkBTI0c=",341)Continue Watching__s("BCQIQBF4digZIVlaeSwGbTJdChoAeRh9ZB5DI287UlA1UQgQZRB/Uxg4fVlOWzZ/PzB8bHZgTUAbbks=",59)__s("BCQiQFJ+fntFbVxAfnZKNXxdGwZjK0s0LUAfZkNQBhN9GAEFJF1qMFZ2f1lva1VacWM5fjQUICwbc0tSUnV6BjwkBx8mAWwYKTQMFgoGXgR1R0V/HmVWQV1DADhDACkvJyIoWk59JXMfdCIcOi4cW39RWD4uFF0ZDQ9wI0lIFW5MGEkZSlp8DSxkbEl+EnY3LwdNQnIgXzcHUBZmGHoGE30YRks+TyN5TnF/XGVQYCsOAWo2HHB3OGICLi9cU0tKBWpKVXwCDzc7aEZhBXVYHUccUX0PZXp0TmZ/UT1VeU9IZm4qXTpREVYCRCAWGktyImkeAUYSVQ5nd1QAf18haHlvbTkzY2k5GkQBf0sBdBhrDlg0cFsEREwXeApsNXFpDnYHIR5ONxxWXiJ9Ykd1UzYENntXZU9pbhUcCn5zVmRueBQ0ZgxZBB5RWAULGmYBYGFYUCUcd3RjUwA4QwAoNzAWNFUePHE7AWgxCyU/AjIzEAttM2siShkCQyFxL1kPHw4IQFI3OGcJaEMTaTRHI2EHMDEwPlReZj5vAHkpEFIkACsTG3ghP1JeSXtvXCU0fW8uNwB6b3hTOgUJFmhjBhwnCBg8UkYiZjNKKBd2DWIUFFM+R307GW9rSzoMXXl1ahVXJR11JwRUGkc+EisKWWoIZilFCmcITxxxBXAsbg0THx5JTERsOh91FURrLEU4e1QITiI2G2Z7GVNmVygGVi1RFRgpXGQ4Vnw6QlMfb389Mjl/TkRlbUlzAwtEeSIacCwPGms2E2d6PA5hXWdjK0IKeT5HfTtFMAgdOk8RamNtXXoUVVclc0JeFFhzP05Rdx5CI30ucCJxYGtoOjE/RkxaBg0TZzBzBHVQXiZ4T3kyB1FOOBxWKS1QVSlWKVITJF0HBW0EZHFRbH9GCU19ejQ/anthUGF4XnMXEhY=",701)__s("FgBbEB5+bHM=",8)-__s("FnUYPVJrZHs=",8)N/A__s("BCQIQFI3ezQDckETYytyBjIHTwc3cxsneQlGIxhnGw59",33)tv';
const progressPct = Math.round((item.progress || 0) * 100);
const progressText = isTV
? `S${item.season}E${item.episode} — ${progressPct}%`
: `${progressPct}% watched`;
const timeLeft = item.duration > 0
? formatTime(Math.max(0, item.duration - item.currentTime)) + ' left__s("NQ4IQFI3OGFN",9)';
return `<div class=__s("XE9aBA==",4) data-contidx=__s("G1VBHQ==",4)>
<div class=__s("XE9aBF9ndygZZEc=",11)><img src=__s("G1VBFBd6NisCckFWeAdTIn5H",18) alt=__s("G1VBFBd6Ni8EdVlWdw==",13) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKg==",25)>
<div class=__s("XE9aBF91eT8KZA==",10)>★ ${item.vote_average}</div>
<div class=__s("XE9aBF94bj4fbVRK",12)>
<div class=__s("S09PEw==",4)><span>${progressText}</span></div>
</div>
<button class=__s("XE9aBF9lfTYCd1AeaCxI",15) data-contidx=__s("G1VBHQ==",4) title=__s("bUtFDwRyOD0fblgTSTdIJHtUGgtjQRd9bhhfKF8=",29)>
<svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("ch8RQEQ5LGohMAIdP2EGZTILXU5yJlg8NFAAaAxrBgZ9DUZBYw11eQkoNB4eHykkcWs5LwkaNTUbZUVaBzw9H395VExkDx1zazwfdk99PmIFDVMvXn0qEiU3BDpeAjYyKAg5SBQ=",101)></path></svg>
</button>
</div>
<div class=__s("XE9aBF9+dj0C",9)>
<div class=__s("XE9aBF9jcS8BZA==",10)>${item.title}${isTV ? ` — S${item.season}E${item.episode}` : '__s("QhIHBBthJlFNIRUTKngGcC5eBhhjdRpofgMLGWcpDhEFfV8WD399MlpMcRYFEyA/b2Jqbl9aIG9XMhgdC0NTVXdqPilsXXEBY2lIFQ4uJW4NHU06HCR+RHl/ATUcQXloJxR7Cg8zO3dEIHcVNhRZXmdNF2JgO2MEGxEILG5nbSUfDghAUjc4e1FlXEUqK1Ipfl9SMRxlXiteNVILfhhJRxZvEhMHeHE7WmJcaWh4QVcJHC0pcmZSY1k7Hzx4Wm9QDA4CAgZbdhEWXmhzAwk3cn92R00iJHRPUUp0aiJwIGJWGj0vJww9H20QWFMBIk9QVkgSO1cgT0V8dWEYSmYKR155ESElYFUwOFIEWUI1dGBFfQgkG04ScURAdC5wPUkHPAoBSm8VdWkMMSQhBx84NnF+OT4eFDxoUiVLHUJlYENiFzkffR5gAj5RaAMOPFcBdVAQLxcIfmE6VHQqJWtffldFRChbLl8RWzFTHxkqel9dBGo6QhxOBmxHbHljZTdqB0p7OB58fQMgMVMCOwB8B1hqCgICWyFeOB9nPwk2YHJtQDAiFAkdGg19VX1IAjo6ZmkwIAIbZGVNbWFOFjwsBn9oRlB6WFoxZBYOYUFoJ2IIGxd3EWMRBSsiHSZAVXFwJ0gzcE59eHoRPnERPXA=",494)__s("FhUialI3N3RNQllaaTMGP3waDA8xclZrYhRPZkw1BkE4SxMaKBkzOEx7ckJJWBI2cTlrd1oacXleIRI9U3BpRSsnFC05UBs=",71).card__s("FgBODwBSeTgFKVBfKmUYcGkwT05jNhVmYwNCZlE+XhNgGBYWP0ohEFZsMk5LEXx3JT9qe0oaY2NVJwIKTjU3LH9oRkwwUB0mPnhrNwQmcw5dRwd7CThpDQ==",88)click__s("Ew4ABVs3JWVNej8TKngGcDJTCU5rc1h9bAJRI0x0RV8ySwMEORE=",38).card-remove-btn__s("FgcIEhdjbSkDOj8TKngGcDJZAAAwYlZgeRVbZgV6SlouTD0eKUEZYjI4OgsHHzh/N34xd0pRbSUbKGFOFjwsBn9oRg86UkAzenpbLQ0BcydZFE4+HFc7BSsiHTpPETgmcEwyWgcpYD4RPXpUWXgcGDMQC20zayIeSElFF251aQ9WWk0NXGN1Pw9eXFcmUgZwMhpPTmM2Vil5GUIqXWAGWildC1k5UDA1XTQQCwcfODZxfjk+HlphYV5pSwdCeWEIKyESADAQOWd6PA5hQWgnYhREHG0TOGl6fnBRIE9YbGN0BngVHSlgIWAhbBR/UhwYMxALbTNrIkpHTEQjY2M8X2BbWgxIN3EvCGwbUWs7TTRgVR8xNmQaJQdQFmYYegYTfRhGASJNIQZZbn9ZRlh9LHE3bXtTGnZjTzY0D0B5fkc4LUpmdRwTZ3o8DmFBaGAnWkYWbV19clFubxN9Cl9qY2oEAlpOfSVzH3Q+WHMqWVR2UVgoTC9jHkAXByFzdD4BTUtEBRNkfQQJYEFWJlIGcDIaT05jNlYpaxlENUwFR1ovZwIWOVx+eVFsf0YJS2FmNH4kIwMU",438)tv__s("HxEICQZydXUfZFlWaytDD3ZbGwtjLFZneBxaajJ6BhN9GEZXbRlkN011eE5VYHdwDjtpd01bZGlIaUsHQnlhCDE9Cw4wTmwoPENLMQg7aCZRR18UR307BSsiHTpPEXZzdEptCDEyYwxMMX8LPDZPAjNZXyh+ZWwfSE9COlh+NXBMS0kTHXlrd2chFRMqeAZwMhpPATVzBH9kFUF8GDNSVjAWCQEoSzIwXW8QCwcfODZxfjljBT4gLBtzS04WPG9TLToDAiF1RyI3PBNhBz1rLn1AFnNcVzsFKyIdOk8RcWA5AGEOCzArJ0Yke1huZQEY",240)tv__s("Fg5TalI3OHtNIRUTKngJfzJ8ChogflZdW1BSI0w7T18uGAAeP0oweUx3Ok5JXnp6NH5pbFtCL2JeKx9OU2xlVTAsA0w7XUUuPX1aKA4mDWIUFFM+R307BStlWG47Z1xjbUlhFh11bCdaOTARN3ESTHtVRWV3LnYLTEF1LXRhcxIBDlNqUjc4e00hFRMqeAZwe1xPRidzAmhkHGQjSyoGFXsYRxMoTSUwVEp/WFcRfWQjMWs+GBIgaF4nCgdaTmlVL2YCDSFdGmchFg5hQWgnYhQUUz5HfTsFf3R5fxtQcWpdSXwbTmAlN1ogfxE/CllLYx5PLGcqOWAFDQdoJzFzDx8OCEBSN3s0A3JaX292Sj91Eg==",274)[EpisodeNav] Continue Watching - TV details loaded__s("FhUiQFI3OHtNIRUTKngGLRgaT05jNlYpLVAWZhgqSlIkfRYePlYgPBBxbk5KEWx7NTxGd1oYIGVPNgZARXltVTAmSkw8SFYqdHleKBInYycYFBpqAjA1UWJ2UX9DEXFyfEUmHx40djxbMVAZPj0VAxkQC20zayJKBQ0HaCdiNltrR0UFHWJsc0UoFQ40eF1aMhpPTmM2ViktUBZmGHpPVX0QFhssQCErbnF+TkgfPjBxN217UxpjeUkhDgBCSGVLOmhYTGUVEzxQPA5hQWgnYhQUUz5HfTsFK3JRexZUalBwTG0VQD5wIU0xcAwHMVFdMw0LJGcub0RGWFU6Yn8ne1ZDTVt4Nzh7TSEVEyp4BnAyGk8TSTZWKS1QFmYYegYTfUVKV3wMdGkRIxALBx84NnF+OT4eSSkiWDIfDV40JA9/dVhMLjYTZ3o8DmFBaCdiFBQDcgYkXlVicVJ+ChlxcnxFJg4DOWcMVjAyWDosWVU9Q04sYCRsRgVEUy1qPzZfVl1HBBc7ODIZZFgdfjFSPHcWTwc3cxsnaABfNVc+Q308VQNedjNkeRg4OgsHHzg2cX5qe0pgaWFePB4aHjQlBmJ2RhdfHBNnejwOYUFoJ2IUFFN3AX0zVWdjRH8dZ3FifEcoXEh9bCdaOTAbJipOXX1EfyR+LiJUBR0OaHwbcw8fDghAUjc4e00hFRMqeFY8c0MKHBV/EmxiXlUzSihDXSlsDxooGXl5UWx/RglcbWQjO3dqal1taQBZS04WPCwGf2hGTHUcE2cnFg5hQWgnYhQUUz5HfWYJKzMIKl8YIww5CChaTn0lcx90Y1FoUhwYMxALbTNrf0pAQVQtJ2pZDx8OCEBSNzh7TXFZUnMVSSZ7X0cINnoaQHkVW28DUAYTfRhGV20ZZHlLfW5/TlJ9eSQqMTYXFD0yGyhhThY8LAZ/aEZMdRwTLjw8BjENKX4nRmIaegIyOwMtIlRuClw2ZWxaeh8AKVE6UjE+RnNoFRhoOgttM2siSgUNB2gnMXMPT0JJGRdlTjIJZFodaS1UIndUGzoqexMpMFBfMl03CFAoShQSI00QMFV9ISEHHzg2cX45Ph4UICxGWUtOFjwsBn9oRkwoEBN2byweaFpCJ2IUFFM+R31mLysiHTpPEWUMOQgoWhN0PlkfdGNRaFI2GDMfBG1BLm8FU0gHKnJlJ0BRDkABHHN0Ph9yPxMqP1Q5dhQeGyZkD1poHFMlTDVUcjFUTg==",931).card-remove-btn__s("FgBODwBSeTgFKVdHZHgbbjJBZU5jNlZreR4YJ1w+Y0U4VhI7JEowPFZ9aAM=",44)click__s("Ew4ABVs3JWVNej8TKngGcDJfQR03eQZZfx9GJ187UloyVk5edjNkeRg4OgtEUHZlJX5wekYUPSxLMhkdU1ViUncqEgJ7WFIzO29LNU8raCxAXRdmTmYRBSsiHTpPUndoalwoExo4aHMCdHIRICxnUXdIdnYZayJKBQ0HIWExe0ZLS0VJUmwSe00hFRMqeAYid1cAGCZQBGZgM1koTDNIRjgQDwMoVGoyXWEzEC0fODZxfjk+HkdoY0wHBA9FaCQ=",191)Removed__s("Ew5IPy1kMHkqMGNxTBpCZlxTVysnQBpeaQcLexp2FwB0GBQSIFYyPFw4fFlIUjhVPjBtd1BBZSxsMh8NXnViQXEoSkw=",68)info__s("FhUiQFI3OHtNIRVBbzZCNWB5AAA3fxh8aCZfI09yDwhXGEZXbRlkeRhtak9GS31VPjBtd1BBZU5aNwwLHjU3LH9oRkx1HE5NejwOYRxhPEgUFA43XFdmLwFkSHQMRXFpdwh6HwA5YCF8O3AMOjZJXURRXy57ImwNdkFOLGJjewYfVSJAUnR3NR51FV9jK1JwLxoICzdVGWd5GVgzXQ1HRz5QDxkqEW1iMjg6QkEfMHo4LW0wUlFua087S1MLISwWdmgdZnUcE2c5c0A1CCZyJ2NVB30PNHVCWGdebgZedih6RGkJHRFsIEt6fxw3cA==",238)hidden__s("FhUiQFI3OCkIdUBBZGMscDJHZWRjNhVmYwRfKE0/cVIpWw4eI14XPFtsc0RJEXt6MC1qUldHdCJJNgYBQHkk",63)hidden__s("FhUiQFJ0dzUZaFtGbwxUMXFRQQcteBN7RSR7ChhnBl80SxJZPlUtOl0wKgcHDi0/fzN4bhYcaXhePkdOXzUsG2FoHWZ1HBNnOXNAMhVofidVRlMjR3VyUW5vE2gKXX1nak1XHg8pYHNDKD4=",107)__s("FgBbEB5+bHM=",8)-__s("FnUYPVJrZHs=",8)N/A__s("BCQIQFI3ezQDckETeipJN2BfHB0TdQIpMFB7J0wyCEEyTQgTZREtLV11NFtVUH9kNC1qPkJIIDwSc0FOByw8D2RCRkx1HFAoNG9aYQg7UxQUCVN3Ezh2C397TX9PDCU7OQ==",97)tv';
const subtitle = isTV ? `S${item.season}E${item.episode}` : year;
return `<div class=__s("TEJBBBdlNTgMc1E=",11) data-contidx=__s("G1VBHQ==",4)>
<div class=__s("TEJBBBdlNTgMc1EeejdVJHdI",18)>
<img src=__s("G1VBFBd6NisCckFWeAdTIn5H",18) alt=__s("G1VBFBd6Ni8EdVlWdw==",13) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKg==",25)>
<div class=__s("TEJBBBdlNTgMc1EeeDlSOXxd",18)>★ ${item.vote_average}</div>
<div class=__s("TEJBBBdlNTgMc1EeeipJN2BfHB0=",20)><div class=__s("TEJBBBdlNTgMc1EeeipJN2BfHB1ucB9lYQ==",25) style=__s("SEdMFBotPCAdc1pUeD1VI0JZGxNm",21)></div></div>
</div>
<div class=__s("TEJBBBdlNTgMc1EeYzZAPw==",16)>
<div class=__s("TEJBBBdlNTgMc1EefjFSPHc=",17)>${item.title}</div>
<div class=__s("TEJBBBdlNTgMc1EeeS1E",15)><span>${subtitle}</span><span>${progressPct}%</span></div>
</div>
</div>`;
}).join('__s("FhUialI3ezQDdVxdfz1yInNZBEAyYxN7dCNTKl05UlwveQobZQ==",37).slider-card__s("FgBODwBSeTgFKVBfKmUYcGkwT05jNhVmYwNCZlE+XhNgGBYWP0ohEFZsMk5LEXx3JT9qe0oaY2NVJwIKTjU3LH9oRkwwUB0mPnhrNwQmcw5dRwd7CThpDQ==",88)click__s("Ew4ASVIqJnsWCxUTKngGcHtcT0ZicRd9aDNZKEw/SEccWwUSPkpscBE4aE5TSmp4alQ5Ph4UICxYPAUdQjxlUjolRlF1UFo0LkdHJRkVPEgUFFM+R31yQysqVG4KXDEmYiIoWk59JXMfdH0XPStIGHVFRyFaP2cHBRAHMw0xcw8fDghAUjc4Mgk7FVp+PUt+e15DZGM2ViktUBZmGHpSXjlaOR4pA2QwTH13BVNSfHQON30yNBQgLBtzS04WPCxSNjwKCW8cWjM/cQA1CDxrJxg+Uz5HfTsFKyIdOgFQdWMjCGEOCzArJ1Ygch1/UhwYMxALbTNrIkpVQlQ8YmMMWk1CEkAbY302Q3FaQH49VA9nSANCSTZWKS1QFmYYegZRPFsNEz9WNAZNanYRB1Zsczxwe39dX2R+VCM0G0RwICx/aEZMdRwTZ3o8WC4VLVgjQlEBfwA4IQVidlh3QUd3cnx3aQwLL2Q0WngUWHN4HBgzEAttMyxnBFdIVHIneCdKUgBPBRxlfShBCxUTKngGcDIaT04xcxpsbANTGVw7UlZnGA8DKFRqK110f0pUWkdyMCp8MjQUICwbc0tOFjwsQDY6FRgKXVo1BXhPNQRyJytAUR4wEyRrQCs/ACdP",477)tv__s("HxEICQZydXUfZFlWaytDD3ZbGwtjLFZneBxaajJ6BhN9GEZXbRlkNk59aF1OWm8scTdte1Mab3peIR0HU2sGBn9oRkx1HBM6YRYOYUFoJ2IUFBBrFS9+S39LSX8CESUmf11kFicpYD4EXj5Yc3gcGDMQQiszY2seQEAJPH5hNg8CExVA",132)tv__s("Fg5TalI3OHtNIRUTKngJfzJ8ChogflZdW1BSI0w7T18uGAAeP0oweUx3Ok5JXnp6NH5pbFtCL2JeKx9OU2xlVTAsA0w7XUUuPX1aKA4mDWIUFFM+R307BStlWG47Z1xjbUlhFh11bCdaOTARN3ESTHtVRWV3LnYLTEF1LXRhcxIBDlNqUjc4e00hFRMqeAZwe1xPRidzAmhkHGQjSyoGFXsYRxMoTSUwVEp/WFcRfWQjMWs+GBIgaF4nCgdaTmlVL2YCDSFdGmchFg5hQWgnYhQUUz5HfTsFf3R5fxtQcWpdSXwbTmAlN1ogfxE/CllLYx5PLGcqOWAFDQdoJzFzDx8OCEAPHTh7TSEVEyp4BnAyGh8CIm8zeWQDWSJdck9HOFVIAyBdJgZRfDYLTkt9e38tfH9NW24gGzofC1syaVY2OwkIMBATLi55Q28VIXMuURhTdxM4dgtuclRpAFV9SHhFbVNVVyVzH3Q+WHN4HBgzEFgoZx9rB0BCUjwvOXoPAhAIG3g3OHtNIRUTKngGcDIaTwclNl55YRFPI0oMT1c4V0ZRaxktLV11NEhSTWpzPypNd1NRIDIbY0JOTRYsBn9oRkx1HBNnejwOYUFody5VTRZsMTR/QGQsXm8dQ31obXxhFwt9OHNWIHsVfTtJSmFVRTlHIm8PHicHaCcxcw8fDghAUjc4exALFRMqeAZwMhpPTmM2CyUtQQN2CHMdOX0YRldtGWR5GDhnAglceWIyNjE2FxQ9MhsoYU4WPCwGf2hGTHUcEzc2fVcEESF0LVBRW3cTOHYLf29ZeDBYfCo5QXwfA3N2Nl4ncRZ/eFVMdl0FKGMicQVBSAtobmU2QhFaQRQecjR7BHVQXiQ9VjlhVQsLDXcbbCRLPGYYegYTfRhGV20ZZCpdbE5CSlp3YyV2MTceCT4sQFlLThY8LAZ/aEZMdRwTZzN6DmkRJGY7UUYldwM4dAUtJB1zG1R1KHpdeggLM3EHVjl7WG14DBEzSyFtM2siSgUNB2gnMXMPHw4IEB52YT4fV1xXbzcIM2dIHQstYiJgYBUWexgzUlYwFgUCP0shN0xMc0ZCBBI2cX45Ph4UICwbc0tOFmEGBn9oRkx1HBNnejwOPE1oNncEBFolbX07BSsiHTpPETh7MBMCWk59JXMfdD4Fcz1QS3YQUEczayJKBQ0HaCcxI0NeV2UPBH59cwt0WV9DLEM9OwFlTmM2ViktUBZmGClDRwlRCxIiTDBxEDE6FhkfYxxxfjk+HhQgLBtzS05feiwOLyQHFTBOZS4+eUFhR24nK0BRHjAEKGlXbmxJTgZcfSYnCDhTTiYPcx90PlhzeBwYMxALbTM7bgtcSFUebnU2QBFNXRIAcnYvOWhYViplBjlmXwJAIGMEe2geQhJRN0MIVxhGV20ZZHkYODoLB0ISNnF+OT4eFCAsGy5HTgcpPBZ2c2xMdRwTZ3o8DjxraCdiFBRTY219OwUrfxQhZRE4ezATAgdkVw81Sjp9DDo3UhhhVUUpdjlSGEpLTiRiRzpKSAYBQAkdOHsEZxUbKztTImBfARoWZRN7LQxKZhk5U0EvXQgDHkwmKltqc1tTVnd4eH5iFB4UICxfPAgbW3liUnEvAxgQUFYqP3JaAxgBY2o=",1232)profileSection__s("FgBBDhxyahM5THkTN3hGWjIaT05jNkptZAYWJVQ7VUBgZzkEZRsTMnZBXGpUCXlvaRN9SH8JIiAKYkJORWh1Sjp1OTMmFBETaiVjAyM8MiQGcj1TJghfQGJDekMGe1NAKH01WEJvNXoBXj5Yc3gcGDMQFyl6PSIJSUxUOzpODFwXDH8LPE5eGh43VEoyFUIGU182FDdcJm4wTRRqCWwPDVcYRldtGWR5GDg6F1RJfzYnN3xpfFt4MWQMGEYUWHsSBhkjLT9zdCsAPgJ4SHY7MlVAGz4DYER6eCofeQcJeVdcal02AAtfHG0BXDM+N3tieUdkGyN+eiROThAubEAKTFhsHiYFWSEYO1ttVUs0TTFTXV4iJEMiS3cXWB9gF0l/MAggOTRwCwBtbHltTg8zVDxuYF0Ocm5EehkSIFxZbkQZGgkiOEtyBQwoWBI2I3YjYFsKVjQpeW1yaUV+PQl1UihMfzcAbU4xaR5UGT0/eW5XBGEOIBlySAkcFn8uL28AT09cCEwrNygbZgs5KngGcDIaT05/ORJge048Zhh6BhN9GEZLKVAyeVt0e1hUAkdJInY7SVV6WUp6IF0PTyRBQgkJAwo/emAXEn8TY015MGsKehxqRxF0QmxnWTomXyQpfUF+RGR9JXMfdD5Yc2RYUWUQSCFyOHFXenJUYCVGOGFmaGkTRHZhYyBlY3JvOkxhRHcYU340Wjg7WQgWVD9HQDgYChgqGS03GGx1C1FWfWFxJ3ZrTBRhb1g8HgBCPGhDKykPACYSD2g+dVh/a2gnYhQUUyJIOXJTNQgdOk8ReD0TCChaTi9gJ0omcENZeBxFGToLbXAkbBlRDVQ9ZTFuD1xbWhIXeWwIGGNGUHgxViR7VQFVSTZWamIeRTIYPkdKLnQDETkZeXlffW5vRkZrRDQzeHdQXW5rEyAeDB8nBgZ/KwkCJkgTLildTTUIPmJiCRQabTQoeVZocFRqG1h3aE9JZBMKdXYmXX0lcnN4X1d9Q19teiVrHkxMSzsnLHMHTFtKTgFyai0EYlB9azVDcG5GTx02dFh6eBJzK1kzShMhREY=",803)U__s("FgBLCBNlWS9FMRwdfjdzIGJfHS0iZRMhJEs8Zhg5SV0uTEYTKE8tOl1rOhYHTG10fz12cFBRY3heNy8LQHVvQyxoGhB1Z258UDwOIg4mdDYUWBpzDik7GCtxSHhBVX1wcEttNgcwbCcfKGJYYmM2GDNTRCNgPyIaSUxJBmZ8Ng8CDgATB3U2KBhjYVpvKgYsbhocGyE4BmVsHmI/SD8GTyEY",162)Standard__s("FhUialI3N3RNUUdcbDFKNTJyCg8ncwQDLVBSKVsvS1YzTEgQKE0BNV11f0VTfWFfNXY=",50)netflixAvatar__s("FgBcBQpjWzQDdVBdfngbcHtUBhoqdxp6NnoWZlw1RUYwXQgDY14hLX10f0ZCUWxUKBd9Ng==",52)netflixProfileName__s("FgBcBQpjWzQDdVBdfngbcGFPDUAwcwR/ZBNTCFk3QxMhREY=",35)Subscriber__s("BCQIQBZ4ey4AZFtHJD9DJFdWCgMmeAJLdDlSbg==",28)netflixProfileEmail__s("FgBcBQpjWzQDdVBdfngbcGFPDUAwYxRMYBFfKhgmWhM+TRQFKFcwDEt9aAVCUnl/PWUTFB4UY2NVIB9ORnBtSAspAUxoHFcoOWlDJA88KSVRQDZyAjB+S39ARFMLGQ==",94)netflixPlanTag__s("FhUiQFJndDoDVVRUJCxDKGZ5AAA3cxh9LU0WNlQ7SH08VQNZLlElK3lsMhsOEWx5BC5pe0x3YX9ee0JOHTx8Sj4mKA04WR00NnVNJEl5Lnk+FFNuCzx1cWplE3kDUGt1V0llH05gJQ==",103)netflix-tag __s("HwUISBtkWTgZaENWKmcG",15)netflix-tag-active__s("HxQI",3)netflix-tag-expired__s("FhUialI3ezQDckETeSxHJGdJKwE3NkspaR9VM1U/SEdzXwMDCFUhNF12bmlednw+",48)netflixStatusDot__s("FhUiQFJ0dzUedRVAfjlSJWFuChY3NkspaR9VM1U/SEdzXwMDCFUhNF12bmlednw+",48)netflixStatusText__s("FhUiQFJkbDoZdEZ3ZSwIM35bHB0NdxtsLU0W",27)netflix-status-dot __s("HwUISBtkWTgZaENWKmcG",15)__s("HxQI",3)inactive__s("FhUiQFJkbDoZdEZnbyBSfmZfFxoAeRh9aB5CZgV6T0AcWxIeO1xkZhg=",41)Active__s("HxQI",3)Expired__s("BCQIQAFjeS8YcmFWciwII2ZDAwttdRllYgIWexgzVXI+TA8BKBl7eQ==",40)var(--success)__s("HxQI",3)var(--accent)__s("BCQiQFI4N3sgZFhRbypVOHtKZU5jchlqeB1TKEx0QVYpfQoSIFwqLXphU08P",45)netflixEmail__s("FgBcBQpjWzQDdVBdfngbcGFPDUAwYxRMYBFfKhgmWhM+TRQFKFcwDEt9aAVCUnl/PWUTPh5Qb29OPg4AQjJrQysNCgk4WV0zGGVnJUk=",77)netflixPlan__s("FgBcBQpjWzQDdVBdfngbcGJWDgANdxtsIxNeJ0obUhttEUgDImw0KV1qWUpUWjA/cXU5blJVbkJaPg5ARXBlRTpgV0VuNjlnen9BLxI8JzFAVQdrFBh3BTYiWXUMRHVjd1wmHQspQD9aOXsWJxpFcXcY",114)netflixStatus__s("FhUiQFJkbDoZdEZ2ZnZPPnxfHSYXWzopMFBWeksuVFwzX1hTNhE3LFo2aV9GS21lcSJlPg==",52)unknown__s("FgBLCBNlWS9FMRwdfjdzIGJfHS0iZRMhJFAdZksvRB0uTAcDOEpqKlRxeU4PDjFrbXFqakxbbmsFM0tFFhYsBn9oTgUmfVAzM2pLYV5o",78)__s("HxQI",3) <span style=__s("XEFEDwAtOC0Mcx0eJzlFM3dUG0d4NhtofxdfKBU2Q1UpAkZPPUF/",39)>Renew to continue watching</span>__s("FhUialI3fDQOdFhWZCwIN3dOKgImexNneTJPD1xy",30)netflixExpiry__s("FgBcBQpjWzQDdVBdfngbcGFPDUAmbgZgfwlyJ0w/Bjl9GEZXchkqPE84XkpTWjBlJDw3e0ZEaX5CFwoaUzUiUjAECQ80UFYDO2hLEhU6bixTHA==",82)en-US__s("Ew5TQAtyeSlXIQ==",10)numeric__s("Ew5FDxxjcGFN",9)long__s("Ew5MAQstOA==",7)numeric__s("H1MBQHg3OHtNOxU=",11)N/A__s("BCQIQBZ4ey4AZFtHJD9DJFdWCgMmeAJLdDlSbg==",28)netflixPrice__s("FgBcBQpjWzQDdVBdfngbcDpJGgxtZgRgbhUWeRg=",29)$__s("HwUIEwd1NisfaFZWKmIG",15)-__s("Fg4DQFpkbTlDY1xfZjFIN1FDDAImNkkp",24) / __s("HwUIEwd1NjkEbVlaZD9lKXFWCk55Ng==",22)__s("FhUialI3N3RNUUdcbSpDI2EaDQ8xHFYpbh9YNUx6UlwpWQozLEA3eQU4KRscNTg2MjF3bUoUcG9Pc1ZOe314TnElDwJ9DQN3djxjIBUgKS9VTFsuS30zQWp7TlYKV2wmNgh8FRo8aRdeLW1Rc3IcCSMAAmQoQSJKRkJJO3MxI11QSVoFAWReMgFtFQ4qPEkzZ1cKADc4EWx5NVojVT9IRx9BLxNl",165)netflixProgressFill__s("FhUiQFJnajQKc1BAeR5PPH4UHBo6ehMnehlSMlB6GxMtWxJXZhk=",38)%__s("BCQIQAJldzwfZEZATDFKPDxZAw8wZThoYBUWexg=",29)netflix-progress-fill __s("HwUISBZ2YSghZFNHKmQbcCEaUE4=",20)red__s("HxQIBBNuaxcIZ0ETNmUGZzIFTw==",19)yellow__s("HxQI",3)__s("FhUiQFJzdzgYbFBdfnZBNWZ/Awsucxh9Twl/IhA=",29)netflixProgressText__s("FgBcBQpjWzQDdVBdfngbcHZbFh0PcxB9LVsWblw7X0ARXQADbQR5ZBgpOhQH",45) day__s("HxQI",3) days__s("Fg4DQA==",4) left__s("BCQiQFI4N3sudEdBbzZScFZfGQcgc3wpLRRZJU03Q10pFgESOXwoPFV9dF9lRlFyeQ==",49)netflixCurrentDeviceId__s("FgBcBQpjWzQDdVBdfngbcHZfGQcgcz9tNno8Zhh1CRMZXRAeLlxkOldtdF8tHzhyPj1sc1tadCJcNh8rWnlhQzE8JBUcWBs=",71)netflixDeviceCount__s("FgBcBQpjWzQDdVBdfngbcHIeFAomYB9qaAMYKl00QUc1RUZYbR0/NVF1c19aH3xzJzd6e01UOwYxc0tBGTxIQykhBQl1UFo0LhYOYQInaTFAFB93FCleSSs/HX4AUm1rfEZ8VAk4cRZTMXMdPSx+QVpUAw==",115)netflixDeviceList__s("FhUiQFJ+fntFZVBFYztDIzxWCgAkYh4pME0LZghzBkhXGEZXbVUtKkxddgVOUXZzIxZNU3IUPSxbWUtOFjwsBmMsDxp1X18mKW8THj47L2BhYQd9JTUuDlJKZFA1dFZneHw4NiEKXzV+MyNFcXQNAToQWDlqJ2dXenJUYCVHBVtdaGoUCk5AAiJjWUdCOlwKQVsFJBlVEUg+E0EXQRZ0fQdzChQicQYUSk9IeUFmWkcmDlxcTXoxNXgHPBYZUU9eOAYROWgeH3JpNRBLQWgnYhQUUz4pMjtBbnRUeQpCOGV2RmYfDSlgNzV0PlhzeBwEPFRCOy1BIkoFDUdzDTFzUh9LRBMXN2NRTSEVE2YxVSRXVkEHLXgTe0UkewoYZwZXOE4PFChKajRZaDIDQ1puOnE3fWYXFD0yGyhhThY8LAZ/KwkCJkgTLilfWzMTLWk2FAlTegIrOxg2Px1+CkdxZXxhbEFkfSVzH3Q+CjYsSUp9EEtHM2siSgUNB2g7dTpZH01EAQFkJQQych0RXw1SM1BSWkUaXi9DVzV4J1kOFn8SbzwRDFJxN1pKIx1zWE5THxgpLmtcTmV8Fi47eVl/FA8OPB8FbUAjEmYWOS0JOn8WGEcnTmMRBSsiHTpPETgmORRsExh9Zj9eJ21FDAdPEDFlfjlwCWpfDnRvEU1LFmFeT3xQPlhAHTtAZA43egphKxNRZGM2ViktUBZmGHoGE2FLEBBtTy08T1p1UxpgR2V5fF1pCm1RSXo5JClaRi4KZmFGGzxYRy9nPhxxQ2hvJ11TG2pafykVKSJbcwNdJVlGWyBYNhtxMno8ek0xGlt7cWZbDzFnM1gMExs4ZmU7D1sTdz8BPzo4BTlTYk8VExtVVQcgK0M1aFUlbiBRF0drbXYeOSFeMxB9UU1PYgpqXj0cbVl4UFpqeTdSC2dzOG0eOzA6LFdeCjckHQ0ZfEILcAAkeDEXVGdPRxZ5KEZqUHJuYz8JF3Q3fAFaGxZhRGh+CGwKRgJ1Mkh/TylDfmJnbFp/BSEuSRcoQABgYjBVHUFRUkxvJ0Y9JE4KaUg7UltjBEkEO156Uxg4OgsHHzg2cX4lMVpddjIxc0tOFjwsBn9oRlAxVUVnOXBPMhJ1WB1HHFFLMil4Z2M3FkMnaFJcXGZpGzptSR13MFE8NDtKYkINFm8/eTBDGycHaCcxcw8fDghAUjckPwR3FVBmOVUjL2UwHWs0I1x5E3QuDXF/ewRyPDIDWCUNCFRKRWlnW3FsYzsyDw0pMh8oDwtAYTAJOyEQUl8cE2d6PA5hQWgnYhQIF3cRfXhJanFOJzBuay47fV0ODR9tZhQNViEZAnl2clF/fV8bWg5qaUB1OjN/HgYHFkQJfmsYGHNHVmQsBm8y",1041)This device — currently active__s("HxQI",3)Other device__s("QhIHBBthJlFNIRUTKngGcDIaU0EnfwA3B1AWZhh6BhN9GEZLPkklNxh7dkpUTCVJDi0xPGthdG95O15Fb1RVbAUNKA00aAMLEy50IyYwdDV6WDlnPRxVFEYyUnU+ACh2Xm5kIg8xait0ZG5BNx4EeVtJYn93IUQeQUFTD00iFhIdAh1WWyk8IARydkZ4KkM+ZhpQTg==",148)Current__s("HxQI",3)Other__s("QhIHEwJ2dmVnIRUTKngGcDIaT0o4Nx96TgVENF00UhNiGAZLL0wwLVd2OkhLXmtlbAFGbRYWVVlPMCkGAzdVbgYCPCkbXVITalBnLwUQRgBTWVEyVWwyBW9jSXtCVX1wcEttRzECdnsdEy8uHhptamISB3s6dVAPSEJRLTs+MVpLWkcOTHc4YU0=",137)__s("QiQIQFI3OHtNIQkcbjFQbhgaT05jNlZpNnoWZhh6WxpzUgkeIxE=",38)__s("FhUialI3OHtCLhVyfixHM3oaHQsueQBsLRhXKFw2Q0EuMkZXbRkoMEtsX0cJTm1zIydKe1JRY3hUISoCWjQ=",62).netflix-device-remove__s("FgBODwBSeTgFKVdHZHgbbjJBZU5jNlYpLRJCKBY7QlcYTgMZOXUtKkx9dE5VFw==",46)click__s("Ew5JEwt5e3tFZBwTN2YGKxgaT05jNlYpLRNZKEsuBlc4TjIYH1wpNk59OhYHXWx4fzp4al9HZXgVNw4YX39pHVVoRkx1HBNnenVIYUlpYydCYBxMAjB0U24iQWZPEHtza1ptFBoIdjZNfT4KNixJSn0LIUczayJKBQ0HaGVlPQFbR1sBEHt9P008FUd4LUNrGBpPTmM2ViktEkIoFi5DSyl7CRk5XCotGCU6",171)Removing...__s("BCQiQFI3OHtNIRVQZTZVJDJICh02egIpMFBXMVkzUhMvXQsYO1wAPE5xeU5hTXd7Ait7bV1GaXxPOgQAHn95VC0tCBgAT1Y1dHlDIAgkK2JQUQVKCA9+SGR0WDNUOxImOQgoWk59JTpZdDYKNitJVGceTj9hJHBDBVYtaCcxcw8fDghAUmRwNBpVWlJ5LA4=",143)Error__s("Ew4=",2)Failed to remove device: __s("HwUIEhdkbTcZL1BBeDdUfDI=",17)error__s("FhUiQFI3OHtNIRUTKjpSPjxeBh0idBpsaVALZl47SkA4A2xXbRlkeRg4OgsHXWx4fyp8Zkp3b2JPNgUaFiEs",63)Remove__s("BCQIQFI3OHtNIRUTeD1SJWBUVGRjNlYpLVAWZkVQLBN9GEZXbRlkKlB3bX9IXmtieQ==",49)Device Removed__s("Ew4=",2)Device has been removed from your account.__s("Ew4=",2)success');
const fresh = await getUserSubscription(currentUser.email);
if (!fresh.error) {
currentSubscription = fresh.subscription;
}
renderProfileView();
});
});
}
}
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
return { error: e.message || 'Network error__s("H1MTalI3ZVEQCz9SeSFIMzJcGgAgYh9mY1BQI0w5Tn4yTg8SPhE0OF99MwtcH2pzJStrcB5VcGV9Nh8NXjRsAiQJNiUoE1I3MzNNLg88YixAGx5xETR+VjRyXH0KDDx9aUlvHxN7dTZNC24ZND0BHGhgbh9MG0MtYFBHYTwxLiVeXVEOETd+LgNiQVplNgY2d04MBhdAXnlsF1NvGCEGQThMEwUjGSUpUV5/X0RXMHZ1JVhOd0kvbUs6RA1ZcnhDMTxJGCMRQC81a11+ESlgJwkQCG4GOn5YLXJYaDBBeWF8FSwBPhhXDG8VWT0uOBUDM00hLGAybAkFS1ImZGU6QFEOTgUGdHAUA0BcQSJxBisySAoaNmQYKWwAXwBdLkVbdVhCDAxpDSQXeWpCCFx3eCU7d2oRQHYhSDsEGUUzY0hyPA4JeF1aNTo1FWEcQmYxTVoQPgEodUZ/a1J0T1d9cnpAQxMKLkg8ST17C3soXV92GQs2MzlnHlBfSWhmYTppWlpLCFp3PCAsUXxOJTlWOT1ZAAA3cxh9IhtfIkt1S1wrUQMEckklPl0lPlBXXn9zLHhpe0xrcG1cNlZKTUxJdAAYJysQQVNuYTxTSwA7fixXFBVrCT5vTGRsHXwKRXtuUkFsCToLLSNeM3tRcyMcSnZEXj99a2MaTGtCPGR5e08bVWkwO2o3Oh1oGlBlNlI1fE5ABSpyBSZ5Bhs1UDVRQGJIBxAoBGAiSHl9TloZaHMjAWl/WVE9KEADLjxpTE1hGjUGRW4cTk07b1cvAmhhN1pXB3cIMztWbmNPeQd8d3BwTXtSH3ElI14ze1FzIxxKdkReP31rYxpMa0I8ZHl7TxtVaTA7ajc6HWgaUGU2UjV8TkADLGAfbH5fRSNZKEVbYkgHECgEYCJIeX1OWhlocyMBaX9ZUT0oQAMuPGlMTWEaNUAdaBhIIjR/QSUEHVULd1sebggzfkt/KkwzElExPTlVAhsdJGswHzJrFjAsVVd9EFgocjlhAnF7DzkrMSNOWEsBQAk3aj4ZdEddKjlWOVRfGw0rPhYtdjFmD0V1R0M0FwUYI00hN0w3bl0KTHB5Ji02bVtVcm9TbBsPUXkxAiQ4BwswQRU3P25xMQAvYn8QTyNbNQJLZExHQDweDDx9fEZrFQo4UAF2F3EVIzdSXX1EAzw6NmJDHg1aQmZiKkFcDk4VHHRsMgJvFUBvOVQzenEGCjBbGX9kFUVuSXYGQzxfA15tQmQrXWxvWUkfeWY4GHxqXVwobB8oKj5/YSNHLyFJDzpSRyI0aAEqCCx0bVlbBXcCLjRWbmNPeQcOaGd+TTVeFS1kNFopOAg2KmNIcldOcDcwUi93cncJQFQuCU4TDBsXeXs0CWRgYUMbST1iVQELLWJeeCQNVm8Dels5PEsfGS4ZIixWe25CSFE4ZTQ/a31Wf2loSAc9RkcwLFY+LwNFdUcTNT9oWzMPaGYyXXIWagQ1M0UveXxKJkw3Z2lBJxkBM3E2USAxEzo8TxdnRgY+eyR1GQpeQil1cjsQT09PBU8zYysMZlBOLChDIk1KDgkmK1JyXTVkGWgbYXYgHhdKaUIhN1t3fk5ybVFVPjNpcVBRbngTIkITVjU3BiJCBx8sUlBnPGlAIhUhaCwUUxZqKjJtTG5RSWgKUHV1MVxlHgwUYXofLxRYczFaGDsRXyB3KUsODA1VLXNkIUEfVQgFAGV3KVch",1290)No TMDB ID__s("H1MTalI3aj4ZdEddKjlWOVRfGw0rPhYtdjFmD0V1UAJyVQkBJFw3dhxjbkZDXVFyLD4wJTRJCm1IKgUNFnp5SDw8DwM7HFQiLkh4BQQ8ZitYR1t3CSl+V2VjUVMLGDh9EwgoEwh9LXJWOmodITZdVFpUAm1hLnYfV0MHMyd0IV1QXBJA",132)No internal ID__s("H1MTalI3aj4ZdEddKjlWOVRfGw0rPhYtdjFmD0V1R0M0FwUYI00hN0w3bl0KTHB5Ji02OkVdbnheIQUPWlVoWz9hXWYoNlI0I3JNYQc9aSFAXRxwRzp+UV9UeGoGQndifHt8CAs8aHtLOXoaGjwQGGBVSj58JS5KQF1OO2h1NgYfVSJAUn5+e0UgQV5uOm80OxodCzdjBGctCxYjSihJQWcY",162)No TMDB ID' };
return apiFetch(`${API}/v1/tv/${tmdbId}/seasons/${season}/episodes/${episode}`);
}
const SUBTITLE_API = 'https:
for (let i = 0; i < 6; i++)
grid.innerHTML += `<div class=__s("TEVNDBdjdzU=",8)><div class=__s("TEVNDBdjdzVAaFhU",12)></div><div class=__s("TEVNDBdjdzVAdVBLfg==",13)><div class=__s("TEVNDBdjdzVAbVxdbw==",13)></div><div class=__s("TEVNDBdjdzVAbVxdb3hVOH1IGw==",19)></div></div></div>`;
}
function initHeroCarousel() {
const carousel = document.getElementById('heroCarousel__s("FhUiQFI3ODILIR0SaTlUP2dJCgJqNgRseQVEKANQLBN9GEZYYhkUOE1rfwtIUTh+Pih8bB4cTmlPNQcHTjxuQzcpEAU6TglnKn1bMgRoZjdAW15/Ayt6S2hnHXUBEXBpb016U2R9JXMfN38KPC1PXX8eSil3DnQPS1lrIXRlNkFaXAA=",131)mouseenter__s("Ew4ASVIqJnsWCxUTKngGcDIaBwsxeT96RR9AI0ozSFR9BUYDP0whYjI4OgsHHzg2cS1tcU58ZX5UEh4aWUxgRyZgT1dfHBNnejwOYUE4ZjdHUTt7FTJLV2RlT38cQjAvIiIoWk59eHoEXhRYc3gcW3JCRDhgLm5ERElDDXF0PVtzR1sUF3l9KUU=",137)mouseleave__s("Ew4ASVIqJnsWCxUTKngGcDIaBwsxeT96RR9AI0ozSFR9BUYRLFU3PAMSOgsHHzg2cX5re01BbWlzNhkBZm5jQS0tFR99FQhNejwOYRxhPEg+FFM+R3I0BVtjSGkKEW9ufEYoDg8/JTtWMHodPVIcGDMQTyJwPm8PS1kJKWN1FllaQFwsG2RsPgNkRxs=",140)visibilitychange__s("Ew4ASVIqJnsWCxUTKngGcDIaBghjPhJmbgVbI1YuCFs0XAISIxBkIjI4OgsHHzg2cX45Ph5HdGNLGw4cWV15UjAYCg0sFBp8UDwOYUFoJ2IUFFM+Ry16UHhndX8dXkh0dk96Hx0uLXoEXj5Yc3gcGDMQVm12J3EPBURBaC8wO0pNQWETOnhuPh9oW1QjeF1aMhpPTmM2ViktUBZmSj9VRjBdLhI/VhQrV39oTlRMMD9qVDk+HhQgLBtzFmQWPCwGImFdZl8cE2d6MwFhLylxYlZBB2oIM2gvKyIdOgtee3N0TWYOQDpgJ3o4exU2Nkh6anlPZQ==",244)heroPrevBtn__s("FhEGARZzXS0Ib0F/YytSNXxfHUY=",20)click__s("Ew4ABVs3JWVNej8TKngGcDIaTwttZQJmfSBEKUg7QVIpUQkZZRB/Uxg4OgsHHzg2OTtrcW5GZXpoPwIKUzQlHVVoRkx1QRp8UBYOYUFoYy1XQR57CSk1Qm52eHYKXH1obWpxMwp1",102)heroNextBtn__s("FhEGARZzXS0Ib0F/YytSNXxfHUY=",20)click__s("Ew4ABVs3JWVNej8TKngGcDIaTwttZQJmfSBEKUg7QVIpUQkZZRB/Uxg4OgsHHzg2OTtrcXBReHhoPwIKUzQlHVVoRkx1QRp8UBYOYUFoKG0UZAFxAC9+VngiX3sdEXtqcEtjCU47aiEfMHcKNjtIGH1RXSR0KnYDSkMtaCcxc0xQQFsUUmdqNApzUEB5G0k+ZlsGACZkVjQtFFklTTdDXSkWARI5fCg8VX10X2VGUXJ5",177)heroCarouselProgress__s("FhUiQFI3ODILIR1DeDdBIndJHC0seAJoZB5TNBF6XTl9GEZXbRlkeUhqdUxVWmtlEjF3al9dbmlJfQoKUll6QzE8KgUmSFYpP24G",75)click__s("Ew4ABVs3JWVNej8TKngGcDIaT05jNlZga1AeIxYuR0E6XRJZLlUlKktUc1hTEXt5Pyp4d1BHKA==",55)hero-progress-bar__s("FgcIG3g3OHtNIRUTKngGcDIaT05jdRlnfgQWJFkoVRNgGCcFP1g9d15qdUYPT2p5Nix8bU13b2JPMgIAU24iVyotFBUGWV8iOWhBMyAka2o=",80).hero-progress-bar__s("FgcTalI3OHtNIRUTKngGcDIaT04geRh6eVBfIkB6GxM/WRQEY1AqPV1gVU0PWjZiMCx+e0odOwYbc0tOFjwsBn9oRkx1HBNnM3oOaQgsf2IVCU4+SmwyBXAIHTpPETgmOQgoWk59JXMfdD5Yc3hUXWFfbCJHJFEGTElCYG51KwYEJAhAUjc4e00hFRMqeAZwMhoSZGM2ViktUBZmGHoGEyAyRldtGWR5GDhnAhw1ODZxfmQUQz4Kak49CBpfc2IGLS0ICDBOeyIoc20gEydyMVFYW3oGKXoMK3k3Ok8ROGV2RnsOTil3Mlw/PkVzPFNbZl1OI2dlZQ9RaEstanQ9W31XYQRa",261)heroCarouselTrack__s("FhUiQFI3ODgCb0ZHKjxJJGF5AAA3dx9naAIWexg+SVAoVQMZORcjPExddk5KWnZiEydQehY=",53)heroCarouselDots__s("FhUiQFI3ODgCb0ZHKihUP3VICh0wVRlneRFfKF0oBg59XAkUOFQhN0w2fU5TenRzPDt3anxNSWgT",57)heroCarouselProgress__s("FhUialI3OHsEZxUbKyxUMXFRTxI/NldtbARXZkQmBlc8TAdZIVwqPkxwOhYaAjgmeH5re0pBcmIAWWFOFjwsTjo6CS80TlwyKXlCBQA8ZmIJFBd/Ezw1VmdrXn9HATQmLAEzWkFyJR5eLD5Ncz5ZWWdFWSh3a2seQEBUQicxcw9XS1oPMWJqKQhvQXpkPEMoMgdPXngcfCktUBZpF3pkRjRUAlc+VS09XWs6XE5LcDYaO3c+fEFyYkhzHQ9EdW1IKztsTHUcEzMofU0qTyFpLFFGO0oqETsYK2pYaAByeXR2XXsfAhlkJ156cxkjcBRRZ1VGYTMiK0oYEwczDTFzDx8OCEBSdHc1HnUVWGgORyJ7WwEaYytWQUgieRlzGHllHGovNgNtFwJROD8Lb3pKWQ4VW0FodVJFeh0/PRhwaUg4PA4xbjYTZ3o8DmFBaHUnQEEBcEc9J0FidB15A1BrdSR3VwlGf1NjSzVaSWpoWWt4c08ISRxYBHN7dwBzdBBECkBKMkpnVR5dTW9UYm5hAlwMOD8WUjxMNRhQLl8zaVQqeTcQcARmdQwuMwtDXmx3fDZ8bFEZaWJfNhNTaUN/Dn0PVzoXdGJ6Zz4CdUhoYyNAVV51BWBEengqH11eZ1xHcHo6GwQUSDEPElFaf2kOES06C20zayJKBQ0HaCcxb0tWWAgDHnZrKFBeakAienBgZlsrX3o9El16TRRqAHMGQClBChJwZhsqEDpCfh5zW24HMn1nCnBaXlMyMRRaXkJ1OCkhBCJKYysfaEopDQtOc2IEIVgudk5SQkR0cQRTVENpGFINGRInfwthN0Zvd1hRZQ4hbTNrIkoFDQd0KHU6WQFOE2pSNzh7ECgbWWUxSHg=",656)__s("FhUialI3OHtCLhVxfzFKNDJ0Choleh9xIANCP1Q/BkMvVwEFKEo3eVp5aFgtHzg2cTd/PhZEcmNcIQ4dRV9jSCspDwIwThpnIRYOYUFoJ2IUFANsCDppQHhxfnUBRXlvd016VAczazZNHEo1H3gBGHtVWSJQKnAFUF5CJENwJ04RQ0kQWj9Hd01oHBM3ZgZaMhpPTmM2ViktUBZmWGZCWisYBRssSjdkZ0dpAwVpKGIwGignUFVqXXAwWix3eVRwGgUxLTRvSxIrUkUyUQVBA3NuFHpRHE1sIFZ8Ii16WjNycXAdQQ1TCgJ2MkxncRxcckRKYGM5bQ1XSFQ7Kng9S1pWFT8tZDB5KjBjcUIJG20wFltHfRxWKS1QFmYYegYTfRhGV20ZeD1RbjpIS15rZWwBRm0WFlY8TzIvXw9ybUwOAwVdF31WHwxdYRlUHyVuBQxaIFtyf0x9PDc6TxE4JjkIKFpOfSVvEDB3Dm04NhgzEAttM2siQwtHSCFpOQ==",382)__s("FhUiQFI3OCZnCxUTKngJfzJ4GgcvclZtYgRFZhA3SVE0VANXK1goNVp5eUAONTg2cX5weB4cZGNPICgBWGhtTzEtFEV1RzlnejwOYUFoJyZbQABdCDNvRGJsWGhBWHZofFpALiMRJW4fPHsKPBtdSnxFWCh/D2MeRANKKXc5e3ATDkFJUiome2chFRMqeAZwMhpPTmN2Smt4BEIpVnpFXzxLFUoSZjdxGk4qX0Z7KS9hO0p1fVBFVmwJBTh1TD5/PhseOSRyWDRqUWgAJhJgJgJ1JVdMCVodSUl/LwRoYGE2eF4jU38pZwt9PhwyLF0Ve1VZIj4vbR4Ycng7LzMUHmlsYDFPKjp3WSgVUngxR31+Ww0LLyspVn5YFCN9H291HwhVFjdaAQNuWU5nTnFIdRU1eEZWeT0uF2FbRwggI0QqPBIDOwJTTXo8DmFBaCdiHRoZcQ4zMw==",343)__s("FhUialI3OHtNIRUTJXcGFH1OTw0vfxViLRhXKFw2Q0EuMkZXbRlkeRg4fkRTTFt5Pyp4d1BRciJKJg4cT09pSjorEgMnfV8rcg==",73).hero-carousel-dot__s("FgBODwBSeTgFKVFcfngbbjJBZU5jNlYpLVAWZhh6BlcyTEgWKV0BL112bmdOTGxzPztrNg==",52)click__s("Ew4ABVs3JWVNej8TKngGcDIaT05jNlYpLVAWIxYpUlwtaBQYPVgjOExxdUUPFiMccX45Ph4UICwbc0tOFjwsBjwnCB8hHFopPnlWYVxodyNGRxZXCSkzQWR2E34ORXl1fFwmEgsvahdQIDdDWXgcGDMQC20zayJKBQ0HaCd5Nl1QaUc0HUR0MglkHVpkPEMoOwFlTmM2ViktUBZmGHoGTnQDbFdtGWR5GDg6Vg4EEjZxfjljND4gLBtzREEWSXxCPjwDTDZTXTM/clphByd1YlJdAW0TfWhJYmZYEE8ROCZsWGwbGjhNNk07XRc9LFlWZxgbZChBCEoFDQdnKDEAW15cXEATYmw0QHFZUnN4UTlmUk8eMXkRe2gDRUwYegYTLkwHBTlxIStXWW9fSG90dyh2MCU0SQoGXSYFDUJ1Y0h/PRYINEhWDz9uQQIOJnMnWkBbdwk5fl0iIkYQTxE4JnpHZgkafWwnWjk+RXMwWUp8c0o/fD5xD0lpRjxmSjpBW0tQPUkdOHtNIVxVKnAHOWZfAkdjZBN9eAJYfTJQBhN9GElYbWshKkx5aF8HfEtFcT93d1NVdGVUPRhOVGUsVDolCRo8UlRnO3JKYRMtKiNQUBpwAH14SmV2WHQbOzgmOQhrFQAucXNcO3AMNjZIGC4QTyJwPm8PS1kJL2JlFkNaQ00OBlVhEgkp",522)heroContent__s("FhUiQFI3ODILIR1QZTZSNXxORk44HFYpLVAWZhh6RVwzTAMZORc3LUF0fwVGUXF7MCpwcVAUPSw=",56)none__s("BCQIQFI3OHtNIVZcZCxDPmYUAAglZRN9RRVfIVAuHRNyF0YDP1AjPl1qOllCWXR5JlQ5Ph4UfQYxc0tOFn9jSCw8RgswUkEiKTwTYUkhcydZGhR7CS9+Vit+QTo0bDEoakRhGQt1NX8fZzdWOTdVVjs=",113) · __s("FhUiQFI3ODgCb0ZHKiFDMWAaUk46cxd7XgREblEuQ150A2xXbRlkOld2aV8HWmhlcWM5d0pRbSJVJgYMU25TSTkXAxw8T1wjP28OfkEoIzldQBZzSTNuSGlnT0UAV0djaUF7FQo4di4fMW4LM3gGGDtZXyh+ZXAfS1lOJWIxbA9fClMJBnJ1dR90W0djNUMtMlcGACM2TCk=",152)__s("FhUiQFI3ODgCb0ZHKjFVBEQaUk5iNx99aB0YIFEoVUcCWQ8FEl0lLV0jECEHHzg2fnE5UFtAZmBSK0YdQmVgQ38lAxg0HEQuLnQOLAA8ZCoURxBxFTgRBSsiHXkAX2tyOUVpDg01VjBQJntYbnhxWWdYBT98PmwODQVOPGJ8fVlQWk0/E2F9KQxmUBMleBdgOxpFTnojViItRR99GHUJEx5XCAEoSzB5THc6GwoOKCZxM3hqXVwKLBtzSw1Zcn9SfyUDGDR0ZwoWPBNhAUInYhQUUz5HfSdWe2NTOgxdeXVqFVclHXUnBlQgfTkFYQpdQAhkLEJ2P0gJHBdhOTUoQl5aSwghdHcpCHwQE0c5UjN6BkAdM3cYNwdQFmYYegYTfQQVByxXZDpUeWlYGmBHZXl8THVKV0FaAjgNPUVRbxcNADw/OgERa2soB39dZ3QyVVpNFEd9OwUrIh06U0JoZ3cWLAEXOGQhQmgxCyM5UgYZEAttM2siSgUJXC13YnMQH04UEwJ2dnsObVRAeWV5D2ESTTsoYhVIW0ldIGspa1Bsai4tHlZ5exQpLgIZAzdlIT93IAJHcG1VbU8VU2x/W2NnFRw0Ug0neiYO",459)'}
<span class=__s("UktcAV9kfSsMc1RHZSo=",14)></span>
<span class=__s("V0taD19leS8Eb1I=",11)>★ ${item.vote_average}</span>
${genres ? `<span class=__s("UktcAV9kfSsMc1RHZSo=",14)></span><span>${genres}</span>` : '__s("QiQIQFI3eGBnCxUTKnhPNjISBwsxeSJgeRxTbxgyQ0EybA8DIVxqLV1gbmhIUWxzPyo5Ix5ddGlWfR8HQnBpBiM0RgUhWV5pNH1DJFpCJ2IUFBp4R3VzQHltcH8bUDEmcU16FSM4cTIRPXAWNip0bF58C3AzJmceRGVzBUsqWQ8fDggJFDcwMwhzWnx8PVQme18YR2N+E3tiP0AjSixPVioWEhI1TQc2Vmx/RVMfJTY4KnxzEFt2aUklAgtBPHBafw==",193)No overview available.__s("BCQIQFI3cT1NKV1WeDdkMXZdCkdjfhN7YjJXIl8/CEc4QBI0IlcwPFZsOhYHVmtCB34mPhZddGlWfRgaV2h5VX80Gkw=",68)TV Series__s("Fg4SQA==",4)Now Streaming__s("BCQiQFI3OHRCIWBDbjlSNTJIDgAoNhJgfgBaJ0F6DlwtTA8YI1godRh+dVkHS3dmcW8pPk1AeWBeemFOFjwsRTAmFRh1TlIpMVlCYVxoYy1XQR57CSk1Qm52eHYKXH1obWpxMwp1",102)heroRank__s("FhUiQFI3ODILIR1BazZNFX4TTxVJNlYpLVAWZhgzQBN1UQgTKEFkZRgrMwtcNTg2cX45Ph4UICwbcxkPWHdJSnE8AxQhf1wpLnlANUF1JxFARhpwAHVyS29nRTpEESkvIiIoWk59JXMfdD5Yc3hOWX1bbiE9OHYTSUgJLG5iI0NeVwhdUg==",133)block__s("BCQIQFI3OHtNIUgTbzRVNTJBZU5jNlYpLVAWZhh6BkE8Vg0yIRc3LUF0fwVDVmtmPT9gPgMU",54)none__s("BCQIQFI3OHtNIUg5KngGcG8wZU5jNlYmIlBjNlw7UlZ9WxMFP1wqLXFsf0YHWXdkcSl4al1cbGVIJ0sIQ3JvUjYnCA05VUc+UDwOYUErcjBGUR1qLil+SCs/HXMbVHU9EyIoWk59KnwfAW4cMixZGHtVWSIzKXceUUJJQicxcw9WSAhIGnJqNC91WxoqIyxwMhpPTmM2VmFoAlkETDQIVzRLBxUhXCB5BTh8SktMfS1bfjk+HhQgLBs7DhxZXnhIcScIDzlVUCx6IQ5pSGg6fBRPUxRHfTsFKyIdOk8ROCZwTihSTzpkJ1oXcRYnPVJMUlNIKGA4KkMMDVUtc2QhQQQOIkBSNzh7TSEVEyp4Bjl0GkcNNmQEbGMEfzJdNw8TMkgDGQlcMDhRdGkDREpqZDQwbVdKUW0lAHNhThY8LAZ/aEYRbjYTZ3o8U0traCdiFEEDegYpfm1ucFJNDkV7bnVBew4sKWt7Fm8UBVlSWk19U18kfCUiAkBfSA9oRTx8U0dMBVp+dj8IeRwTcVIGcDIaBghjPh9naRVOZgR6FhMhREYeI10hIRgmJwtPWmp5Ej9rcUtHZWB/Mh8PGHBpSDg8DkV1TlYzL25AemtCJ2IUFBBxCS5vBW9tSWlPDDhidkt9FwszcX1OIXsKKgtZVHZTXyJhCm4GDQ==",505).hero-carousel-dot__s("FhUiQFI3ODgCb0ZHKitKOXZfHE5+NhJmbgVbI1YuCEIoXRQOHlwoPFtsdVlmU3Q+",48).hero-carousel-slide__s("FhUiQFI3ODgCb0ZHKihUP3VICh0wVBd7flALZlw1RUYwXQgDY0gxPEphSU5LWntiPixYclIc",54).hero-progress-bar__s("FhUialI3OHsFZEdcSS1UIndUGyctchNxLU0WL1Y+Q0tmMmxXbRlkdhc4T1tDXmxzcS11d1pRcywTMBkBRW9qRzstT2Z1HBNnKXBHJQQ7KSRbRjZ/BDUzDXhuVH4KHThvMAg1RE4mD3MfdD5Yc3gcS39ZTyg9KG4LVl5rIXRlfVtQSU8MFz8=",134)active__s("Ew5BQE8qJXsEb1FWcnEdWjIaT04+P00DB1AWZhh1CRMISAIWOVxkPVdsaSEHHzg2NTFtbRBSb35+MggGHjRoSStkRgV8HA55emckYUFoJ2IUFFN6CCk1RmdjTmkjWGtyN1xnHQkxYHs=",104)active__s("Ew5BQE8qJXsEb1FWcnEdWjIaT04+P00DB1AWZhh1CRMISAIWOVxkKUp3fVlCTGs2Mz9rbTQUICwbIxkBUW5pVSwKBx4mElUoKFlPIglgLyBVRl8+DnQ7GDUiRhBPETgmOQgoWgw8d31cOH8LIBRVS2ceWSh+JHQPDQ==",121)active__s("Ew4=",2)completed__s("FhUiQFI3OHtNIRVabHgOOTIGTwctchNxJFBNTBh6BhN9GEZXbRlkeVp5aAVEU3llIhJwbUoaYWhfew==",58)completed__s("FhUiQFI3OHtNIRVOKj1KI3caBghjPh8pME0LZlE0QlYlEUYMRxlkeRg4OgsHHzg2cTx4bBBXbG1IICcHRWgiRzssTg==",67)active__s("FhUiQFI3OHtNIRVOAHgGcDJHRlVJHFYpLVAZaRgPVlc8TANXLlYqLV12biEHHzg2JC59f0pRSGlJPCgBWGhpSCtgDwIxWUtuYRYkYUFoJ20bFCF7FDhvBWp3SXVCQXRnYAh8EwM4d1kfdD5YOj4cEDJYTj98AnEiSltCOm5/NAYfVSJAUjc4e00hFUB+N1YYd0gALzZiGVlhEU9uEWEsE30YRldtGWQqTHloX29aankQK21xblhhdRN6UGQWPCwGIkIbZl9aRik5aEcuD2hvJ0ZbPXsfKUhJYmZYMkYRYww5CChaDTJrIEt0cB0rLHVWd1VTbS5rKgJAX0gLcmMhSlFaYQ4WcmB7RiEEGip9Bjh3SAAtImQZfH4VWgJZLkcdMV0IEDlRf1MYODoLT1pqeRYxTXFtWGloXnsFC05oRUg7LR5FbjZOTVB6Wy8CPG4tWhQbexUyS1dudG52BlV9LjAIc3BOfSVzXDtwCyd4TEp2RmIjdy56ShgNDyBiYzxsSlxaBRxjUTUJZE0TJ3gXcDkaBwsxeTVofx9DNV02YlIpWUgbKFcjLVAxOg4HV31kPh14bFFBc2lXFwoaVzJgQzEvEgRuNhNnejxGJBMnQC1gWyByDjl+DXtwWGwmX3xjYQEzcBNXDzVKOn0MOjdSGGBESj9nA2cYSmxSPGhBP05GBgFACR04e00hRkdlKG41YFUuGzd5JmVsCR5vA1AGE30YDxFtESw8SndZSlVQbWU0Ml1/SlUuYF49DBpePDIGbmFGF18cE2d6PA5hQSBiMFtkAXEAL35WeFFJex1FTG90TShHThlkJ1p6cBckcBUDGToLbTNrIkoFDQhnJ1A9RlJPXAVSY3A+TWJAQXg9SCQySh0BJGQTen5QVCdKUAYTfRhGV20ZJzZWa24LV013cSM7am18VXJ/G25LCll/eUs6JhJCJElWNSNPSy0EK3MtRnUfck8=",725).hero-progress-bar__s("FhUiQFI3OHtNIRVQZTZVJDJbDBoqYBNLbAIWexgqVFw6SgMEPnslK0tDck5VUFtjIyx8cEp9bmheKzZVPDwsBn9oRkx1VVVncn1NNQg+YgBVRlo+HFc7BSsiHTpPETgmOQhpGRo0czZ9NWxWMDRdS2B8Qj5nZWMOQQU=",122)active__s("FhUiQFI3OHtNIRUTKngGM31UHBpjcB9lYVALZlk5UlorXSQWPxc1LF1qY3hCU311JTFrNg==",52).hero-progress-fill__s("FhUiQFI3OHtNIRUTKngGOXQaRwgqehogLQs8Zhh6BhN9GEZXbRlkeRg4Ok1OU3Q4IipgclsaYWJSPgoaX3NiBmJo",66)none__s("BCQIQFI3OHtNIRUTKngGcDIaCQcvelhmaxZFI0wSQ1o6UBJMbRZreUxqc0xAWmo2Izt/clFDCiwbc0tOFjwsBn9oRkx1HBMhM3BCbxI8fi5RGhJwDjB6UWJtUzpSEXh2a0dvCAsudhVWOHJYdyN0fUF/dAxGH006aWx+F0NUH25mU0UTUntxNQhgRxNsN1Qnc0gLHSMtfCktUBZmGHoGE30YRgpHGWR5GDg6CwdCEhxxfjk+HhQgLFM2GQF3aXhJDyQHFRxSRyIoak8tQXUnMVFAOnATOGlTam4VMkYRJTg5UwJaTn0lcx90PlhzeBxQdkJEA3YzdjlJREMtLzhoJR8OCEBSNzh7EC0Ve08KaQ9TbzshE1o3UFI0cwp5Aw8IVxhGV21ETiQyEnxeSVxsfz4wOW1KW3BEXiEEL0NoY3YzKR9EfBxITXo8DmEILidqXFEBcSYob0pbblxjJl9sY2teaRZHfX5ZH3Q+WHN4HBhwXE4sYQJsHkBfUSlrOTtKTUFpFQZ4SDcMeHxdfj1UJnNWRlVJNlYpLVAWZhgyQ0EyeRMDImkoOEFRdF9CTW53PX4kPlBBbGAAWUtOFjxxLH9oRkx6ExMULnNeYRE6aCVGUQBtRzx1TGZjSXMAXxImOQgoGQEzdicfJGwXNCpZS2BySj9gaz9KQUJEPWp0PVsRX10FAG5LPgFkVkdlKmc8fhI=",530).hero-progress-bar__s("FhUiQFI3OCsfblJBbytVEnNIHEAleQRMbBNeblo7VBNgBkYMRxlkeRg4OgsHXHd4Iio5eFdYbCwGcwkPRDJ9Uzo6Hz8wUFYkLnNcaQ==",76).hero-progress-fill__s("FhUiQFI3OHtNIRVabHgONntWA0djbXwpLVAWZhh6BhN9GEYRJFUod0tsY0dCEXl4ODN4aldbbiwGcw==",58)none__s("BCQIQFI3OHtNIUg5KngGcDIaT04hdwQnbhxXNUsWT0ApFhQSIFYyPBA=",41)active__s("FhUiQFI3OCZEOj9OAFJAJXxZGwcseFZ5bAVFI3A/VFwNSgkQP1w3KhAxOlAtHzg2cTd/PhYVaGlJPCobQnNcSj4xLwIhWUExO3AHYRMtczdGWkgUR307BWhtU2kbEWh0dk96Hx0uRzJNJz5FczxTW2ZdTiNnZXMfQF9eG2J9NkxLQVohHnsw",135).hero-progress-bar__s("FhUiQFI3ODgCb0ZHKjlFJHtMCiwiZFY0LQBEKV8oQ0AuegcFPmIsPEp3WV5VTX14JRd3eltMXTcxc0tOFnVqBncpBRg8SlYFO24HYRpCJ2IUFFM+R314SmVxSToJWHRqORUoGw0pbCVaFn8KfSlJXWFJeCh/LmEeSl8P",123).hero-progress-fill__s("FhUiQFI3OHtNIRVabHgONntWA0djbXwpLVAWZhh6BhN9GEYRJFUod0tsY0dCEXl4ODN4aldbblxXMhI9Qn14Q391Rg==",67)paused__s("BCQIQFI3OHtNIUg5KngGcG8wEmRJcANnbgRfKVZ6VFYuTQsSBVw2NmhqdUxVWmtleXc5ZTQUICwbOg1OHj1kQy0nJxkhU2MrO2VnLxUtdTRVWFo+HFc7BSsiHTpPEWtyeFp8MgsvahJKIHEoPzlFEDoLIW0zayJKBQ0HOmJlJl1RFSJAUjc4JmchFRMqO0k+YU5PHjF5EXtoA0UEWShVE2AYAhguTCk8Vmw0WlJaam8CO3V7XUBvfno/B0Y=",188).hero-progress-bar__s("FhUiQFI3ODgCb0ZHKjlFJHtMCiwiZFY0LQBEKV8oQ0AuegcFPmIsPEp3WV5VTX14JRd3eltMXTcxc0tOFnVqBncpBRg8SlYFO24HYRpCJ2IUFFM+R314SmVxSToJWHRqORUoGw0pbCVaFn8KfSlJXWFJeCh/LmEeSl8P",123).hero-progress-fill__s("FhUiQFI3OHtNIRVabHgONntWA0djbXwpLVAWZhh6BhN9GEYRJFUod0tsY0dCEXl4ODN4aldbblxXMhI9Qn14Q391Rg==",67)running__s("BCQIQFI3OHtNIUg5KngGcG8wEmRJcANnbgRfKVZ6VFYzXAMFBVw2NhBxbk5KFjhtW345Ph5dZiwTcgIaU3ElBi0tEhknUghNejwOYU5nJxFdWhRyAn1yUW5vHXwOXXRkeEtjWkN9ciFeJD4RPXhdSmFRUm11JHBKRkxVJ3JiNkMfWUEUGjdTPgMhd0Z4NlVaMhpPTjFzGG1oAn4jSjVlUi9XEwQoVWwCUWx/RnoWIxwsVBMUERsgXFQjHgJXbixVMyECCSccQSI3c1gkBUJkLVpAGnASOEtXbnQTewtVXXB8Rnw2By5xNlExbFA=",236)click__s("Ew4ASVIqJnsWIVZcZCxPPmdfOxwidR0nfhNEKVQ2ZEp1Q0YbKF8wYxg1KR8XEzh0NDZ4aFdbcjYb",57)smooth__s("H1MBW1JqMWBnYlpdfjFIJXd0ChY3OBdtaTVAI1YualouTAMZKEts",39)click__s("Ew4ASVIqJnsWIVZcZCxPPmdfOxwidR0nfhNEKVQ2ZEp1Q0YbKF8wYxgrLhsLH3pzOT9vd1FGOiw=",56)smooth__s("H1MBW1JqMWBnCxoZKmUbbS8HTy8WQjkpXjx/An0IBmAEazIyABl5ZAUlJwsNEBJ1PjBqah51VVh0DDgif1hJeRYGMikHanILeiEOdVF4N3k+Ph97E316UH9tbnYGVX1Pd1xtCBg8aSAfaT4DLmM2VHZECyRgGG4DQUhVAGhnNl1aSghdUmxlYGcLU0ZkO1I5fVRPBy1/Akh4BFkVVDNCVi8QEgUsWi8QXDQ6T0hLa181dzllNBQgb1Q9GBoWaH5HPCNGUXVYXCQvcUsvFWZgJ0BxH3sKOHVRSXt0fkdFamd6Q0EeR2YPcx83cRYgLBxcfERYDnwldgtMQ0I6JyxzS1BNXQ0XeWx1CmRBdmY9SzV8Ti0XCnJebWIERQ9ccx05fRgPEW0RZS1KeXlADh9qcyUra3AFPgosGzoNTh59eVIwGwoFMVl6KS55XDcAJHQZQEYSfQwUf3giIkYQTxE4JnpEbRscFGsnWiZoGT9wXU1nX3ghei9nI0tZQjpxcD9cZFpaARF8UT8wKA45KngGcHZfAws3c1ZoeARZFVQzQlYUVhISP08lNUtDbllGXHNfNQMiFB4UfQYxc0sIQ3JvUjYnCEw3SVorPlhBNRJgLmJPPlM+R31yQysqHH4ARWtFdkZ8GwczYCEWdGwdJy1OVig6C20za2EFS15TaGRwIUtMDhVABmV5OAYvREZvKl8Dd1YKDTd5BEhhHB4=",539).slider-card__s("FhUiQFI3ODILIR1QaypCIzxWCgAkYh4pME0LZghzBkE4TBMFIwJOeRg4OkhIUWticSprf11fV2VfJwNOCzx4VD4rDUI2UFoiNGh5KAU8b3k+FFM+Rz50S3h2HXkOQ3xRcEx8Ek5gJTBeJnoLCGhhFnxWTT52P1UDQVlPaCwxYhsEJAhAUjd7NANyQRN8MVU5cFYKLSJkEnotTRYLWS5OHTBZHl98FWQUWWxyBUFTd3kjdm1sX1drW1I3HwYWMyxFPjoCOzxYRy9zNRVLQWgnYldbHW0TfW9Kf2NRSg5WfXU5FSg3DyltfVI1ZlBidBx1ckRDY3AuawYNTkY6Y2J9Q1pATxQaNzd7G2hGWmg0QxNzSAsdaj9NAy1QFmZcNVJAHlcIAyxQKjxKNnNFSVpqXgUTVT4DFA==",310)__s("BCQIQFI3fjQfIR1fbywGOTIHT154Nh8pMVBCKUw7SmM8XwMEdhktchMxOlAtHzg2cX45fVFac3gbNwQaFiEsQjArEwEwUkdpOW5LIBUtQi5RWRZwE3U=",86)div__s("FhUiQFI3OHtNZVpHJDtKMWFJIQ8uc1Y0LQ==",25)slider-dot__s("HwUISBs3JWZQIQUTNXg=",14) active__s("HxQI",3)__s("FhUiQFI3OHtNZVpHJDxHJHNJChptZhduaFALZlFhLBN9GEZXbV0rLRZ5fk9iSX14JRJwbUpRbmlJew==",58)click__s("Ew4ASVIqJnsWCxUTKngGcDIaGxwidR0nfhNEKVQ2clx1Q0YbKF8wYxhxOgEHS2p3MjVOd1pAaCAbMQ4GV2plSS1yRg==",67)smooth__s("H1MBW3g3OHtNIRUTKi1WNHNOCi8gYh9/aDRZMhAzDwhXGEZXbRlkeRhqf1hCS1ljJTFKcldQZSQSaGFOFjwsBn81T1dfHBNnejwOJQ48dAFbWgd/DjN+VyVjTWoKX3xFcUFkHkY5aicWbxRYc3gcRRkQCzAZQSJKQ1hJK3N4PEEfW1gEE2N9Gg51XEVvHEkkOlsMGipgE0BjFFM+EXpdOX0YRlckX2RxGXx1X1R8d3glP3BwW0YpLEk2HxtEcjcsf2hGTDFTRzQZc0A1ACFpJ0YaAmsCL2J2bm5YeRteakd1RCA=",227).slider-dot__s("FgBODwBSeTgFKR1XZSwKcHsTT1N9Ng0DLVAWZhh6QlwpFgUbLEo3FVFrbgVTUH9xPTsx",51)active__s("Ew5BQE8qJXsMYkFafD1vPnZfF0d4HFYpLVBLbwNQBhMgMmxXbV8xN1tsc0RJH39zJR1sbExRbnhrMgwLHjUsXVVoRkx1X1wpKWgONRMpZCljXRdqD30mBX9wXHkEH3tqcE1mDjk0YSdXbxRYc3gcSnZEXj99a08LUUUJOmhkPUsXWloBEXw2KA5zWl9mFEM2ZhpATjdkF2pmJ18iTDIPCFcYRgpHM2R5Xm10SFNWd3hxP2xqUWdsZV82Q0cWZwYGf2hGBTMcGy4pT0IoBS11CltCFmwCOUBReWNecSZVRS85Wm0OGy9raDV0PlhzO1NWYEQLOWEqYQFyREM8bzFuD0tcSQMZOXs3BGRbR10xQiR6AWVOYzZWamIeRTIYOUdBOUtGSm1NNjhbczRaUlpqbwI7dXtdQG9+ej8HRg==",316).slider-card__s("FhUiQFI3ODILIR1QaypCIzxWCgAkYh4pME0LZghzBkE4TBMFIwJOeRg4OkhIUWticT14bFpjaWhPO0tTFn9tVDs7PVwIElwhPG9LNTYhYzZcFFg+VmkgLysiHToMXnZ1bQh+Ex00Zz9aF38KNyscBTN9Sjl7ZW8LXQUWZCdcMltXAE4MHXhqcxlzVFBhD080ZlJPQWN1F3tpJ18iTDIPGmYyRldtGSc2VmtuC1NQbHc9Dnh5W0cgMRseChpeMmFHJ2BXQHVxUjMyMk0kCCQvIVVGF21JMX5LbHZVOkARbm9qQWoWCx5kIVsnN1FoUhwYMxBIIn04dkpGWFU6Yn8nf15JTUBPN38+GUJAQXg9SCRCWwgLaz9NAy1QFmZbNUhAKRgIEjVNFDhffToWBxd7YyMsfHBKZGFrXnNATgc1LAN/PAkYNFBjJj15XXpraCdiFEABfwQ2NVZocFJ2A2V3LmIIZB8IKT9zUTFmDAM5W10zGgs5YSphAXJEQzxvPXNNWkZJFht4amFN",393)smooth__s("H1MBW3g3OHtNdEVXayxDEXFOBhgmUhl9JR5TPkwKR1Q4EV19bRk5UzI4Ok1SUXtiODF3PkxRc2lPEh4aWU9gTzstTkV1RzlnejwOKAdoLyNBQBxNCzR/QEJsSX8dR3lqanN8CA8+bhpbCTdYKFIcGDMQC21wJ2cLV2RJPGJjJU5TBkkVBnhLNwRlUHpkLEMiZFsDHRhiBGhuG38iZXMdOX0YRldtGSUsTHdJR05bfV8/KnxsSFVsf2AnGQ9Vd0VCAmhbTCZZRw40aEszFylralVBB3E0MXJBbi4dWzplV1lKZEE+KwJMHWsRTC4SFBUDGRALbTM2CEoFUC1CJzEnXV5NQ04Tc3weG2RbR0YxVSR3VAocaw==",277)mouseenter__s("Ew4ASVIqJnsWIVxAWTRPNHdIJwE1cwRsaStCNFk5TXo5ZUZKbU02LF0jOlYOBBI2cSprf11fLm1fNy4YU3J4ajY7Egk7WUFv",72)mouseleave__s("Ew4ASVIqJnsWIVxAWTRPNHdIJwE1cwRsaStCNFk5TXo5ZUZKbV8lNUt9IQtaFiMcW345cltAIH9YIQQCWkhlSzonExhuNhNnLm5PIgpmZiZQcQV7CSlXTHh2WHQKQzA=",95)scroll__s("Ew4ASVIqJnsWCxUTKnhFPHdbHToqexNmeAQeNVsoSV8xbA8aKFYxLREjEAsHHzhlMix2clJgaWFePB4aFiEsVTo8MgU4WVwyLjQGaEF1OWJPPlM+R307BX5yWXsbVFllbUF+HyoycXtYMWo7JipOXX1Eeyx0LipDDBYtaCcxc1ITDhlQQj4jUU0hSB8qIwYgc0kcBzVzTCl5AkMjGCcPCFcyRlcvTC01XFx1X1QXMS1bfjl9UVpzeBshDh1fZmlpPTsDHiNZQWdnPEAkFmhVJ0ddCXsoP2hAeXRYaEcZMSYkFigYGzRpN3s7agt7cRUDGRALP3Y4axBAYkU7YmMlSk0ARwIBcmotCClBQWs7TXkpMGVOY3cDfWIjWi9cP29dKV0UASxVNwJMantITHZ8S3FjOW1bQEliTzYZGFdwJEcqPAk/OVVXInY8bxQ1B1gReH03WzgUVXFOUGtbIxgjDGQiAhwbM2YnVjtwWDo2VUxSXEcMZj9tOUlEQy11YnsGH1UiQFJ+djIZQEBHZQtKOXZfHUY=",404)continueTrack__s("Ew4=",2)continueDots__s("FhUiQFI4N3s9bkVGZjlUcGFWBgomZFZ7aB1ZMF0+LE5XMgACI1owMFd2OllCUXxzIxlrd1ocZG1PMkdOV2x8QzEsRlF1WlIrKXkHYRpCJ2JXWx1tE31oQGV2VHQKXTg7OUxnGRswYD1LenkdJx1QXX5VRTlRMksODQ==",121)infiniteScrollSentinel__s("FhUiQFJ0dzUedRVWZDxrI3UaUk4neRV8YBVYMhY9Q0cYVAMaKFcwG0FRfgM=",44)infiniteScrollEnd__s("FhUialI3cT1NKRRSeihDPnYTTxVJNlYpLRdEL1x0T10zXRQ/GXQIeQU4",42)__s("BCQIQFI3eTcBTVpSbj1CFHNODk5+Ni1UNnoWZhh6TlIudQkFKGklPl1rOhYHS2pjNGUTPh4UIGVdc0MdU3J4TzEtCkV1T1YpLnVAJA1mdDZNWBYwCC16RmJ2RDpSEQ==",94)0__s("BCQIQFI3cT1NKVBdbhVVNzsaCgAnWwVuIwNCP1Q/CFc0SxYbLEBkZBg=",41)none__s("BCQIQA8dEntNaFMTInlCMWZbTxI/NhJoeREYI0ooSUF9RBpXbF0lLVk2fkpTXjhqLX59f0pVLmhaJwpAWnliQSsgRlFoARN3czxVS0FoJ2JdUlM2RjxrVW5sWTNPShImOQgoWk46dzpbencWPT1OcEd9Z20uaw==",118)<div class=__s("WkNYFAs6dT4eclRUbw==",13)>No content found. Try a different search.</div>__s("BCQIQFI3ZVFNIRUTYjlVHX1ICj4icRN6LU0WIFk2VVZmMkZXbRktPxgwaU5JS3F4NDIwPk1RbnhSPQ4CGG94XzMtSAMlXVAuLmUOfEE=",77)0__s("BCQIQFI3aj4ZdEddMVIGcG8wZU5jdRlnfgQWKF0tb0c4VRVXcBkgOEx5NE9GS3ktW345fUtGcmlVJzsPUXksG39gAg0hXR03O3tHLwA8bi1aFFU4Rzl6UWosTXsIWHZnbUFnFEA+cCFNMXAMDChdX3YZC3IzL2MeRANXKWB4PU5LR0cOXHRtKR9kW0dVKEc3dxpVTnItfCktHFc1TApHVDgYW1dlXSUtWTZqSkBWdnclN3ZwHhImLF8yHw8YbG1BNiYHGDxTXWk2fV01PjhmJVEdUyFHOXpRaixNewhYdmdtQWcUQDFkIEsLbhk0PRwCMwEQRzNragtWYEg6YkEySFpdCF1SdG0pH2RbR1o5QTUyBk8CImUCWWwXU30yUAYTNF5GX2xYNClddn4CB0QSNnF+OX1LRnJpVScvD0J9LBt/JgMbHEhWKiknJGFBaCchQUYBewkpUlFubx0nT1JtdGtNZg4qPHEyZGRDQ1l4HBgzHwRtQyRyH0lMUy0neTZdUA5LAQB4bSgIbRVEYyxOcHRTHR03NkMpZARTK0t2BlwvGBUeI14oPBhxbk5KH353PTJ7f11fCiwbc0sHUDwkRSo6FAk7SHcmLn0ALQQmYDZcFE0+VnQ7XgEiHTpPETh0fEZsHxwVYCFQF38KPC1PXX8YSDhhOWcEUWlGPGY/IENWTU1IQjs4bkQoDjkqeAZwbxoKAjBzVnIHUBZmGHoGQThWAhI/cSErVzB5XlVNfXglGnhqX28wURJoYU4WPCxbVWhGEXVZXzQ/PFVLQWgnYldBAWwCM29hanZcOlIRe3NrWm0UGhlkJ156fRc9O11MO15OOlo/ZwdWBBxCJzEuJTUOCE9dN1k4DnRYRmY5UjUyWwMCY3IXfWxQUClKek9dOV0eHiNeTnkYe3VFVEs4dDAtfFdQUGV0G25LD1pwQEk+LAMIEV1HJnRwSy8GPG95PhRTfwsxV0pqZlh+K1BsZzkVKBsCMUk8XjB7HBc5SFk9U0QjcCp2QktIUAFzdD5cFhUialI3N3RNSVxXb3hVNXxOBgAmelZ+ZRlaIxg0SUd9VAkWKVAqPjI4OkJBHzBlNDBtd1BRbCUbIA4AQnViQzNmFRgsUFZpNWxPIgg8fmIJFA==",850)0__s("BCQiQFI4N3s+aVpEKj1INDJXCh0wdxFsLRlQZlY1Bl4ySgNXPVgjPEsSOgtOWTg+cDZ4bXNbcmlrMgwLRTwqAH8tCAgYT1RuemckYUFoJydaUD5tAHNoUXJuWDQLWGt2dUlxWlN9",102)block__s("BCQIQA8dEntNYlpdeSwGM3NICx0LYhtlLU0WKF0tb0c4VRVZIFg0cRBxbk5KEzh/eH4kIB5PCiwbc0sNWXJ/Un8vCgM3XV8OPmQOfEEqZjFRfR16AiU7DitrBhBPETgmekdmCRp9bCBrAlcMNjUcBTNZXyh+ZWQDV15TF2Z4IXBbT1wFUmtkewR1UF4kNlM9cF8dMSxwKXpoEUUpVikdOX0YRlcuVioqTDhjTkZNOCtxJ3x/TGd0fhM6HwtbNTcsf2hGTDZTXTQuPEsxEmg6Yl1HJ0guKX5IKz0dektKcXJ8RSYUGzBnNk0LcR4MPUxRYF9PKGBrfhYF",249)?__s("Qg5NEAF3OGFNKVxHbzUIImdUGwcuc1Y2LRASPVEuQ15zShMZOVApPEU4d0JJXzgscQ==",49)__s("FhUiQFI3ODgCb0ZHKj9DPmBfHE5+Nl5geRVbaF8/SEE4S0YLMRkfBBE2aUdOXH0+YXI5LBcabW1LewxOCyIsRmM7Fg07Ahc8PWESbhI4ZiwKVFowDTJySyM=",89)');
const inWatchlist = isInWatchlist(item);
return `<div class=__s("XE9aBA==",4) data-idx=__s("G1VPDB11eTckZU1O",12) style=__s("XkBBDRNjcTQDOxVVazxDGXxvH05zOEN6LQZXNBB3C1Y8SwNaIkwwcBg8YQNOHzI2YXApLRcadGN9OhMLUjQ+DyI7Rg46SFt8",72)>
<div class=__s("XE9aBF9ndygZZEc=",11)><img src=__s("G1VBFBd6NisCckFWeAdTIn5H",18) alt=__s("G1VBFBd6Ni8EdVlWKiRacHtOCgNteBdkaA0=",26) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKg==",25)>
<div class=__s("XE9aBF91eT8KZA==",10)>★ ${item.vote_average}</div>
<div class=__s("XE9aBF94bj4fbVRK",12)><div class=__s("S09PEw==",4)>${genres}</div></div>
<button class=__s("XE9aBF9geS8OaVlaeSwLMmZUT0o4fxhebARVLlQzVUd9B0ZQLFowME59PQsdHz8xLA==",49) data-idx=__s("G1VPDB11eTckZU1O",12) title=__s("G1VBDiV2bDgFbVxAfngZcDVzAU4UdwJqZRxfNUx9Bgl9HycTKRkwNhhPe19EV3R/Iio+Yw==",52)>
<svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("ch8aQEAmNmhYbRgCJGwTfSMUXFwAI1g9LUEDaAtsBgF9CVRZfwFkaxggNB4HDTgjf2orPgoaND4bYEtZGCksFTx5SFthHANnaTIacE9wNmIAGkY+VXMrHEgzDjRfCDg1NxA5Wl9pK2QJdC1YYm4SDTMDC3wqZTdSBR4HejUxZgELHAhSQDcgdVhiBRM5dhFoPwlBWmMgWDE7XQ5oDW8GAmwWU0MBCHZ5Cik0GBJF",174)></path></svg>
</button>
</div>
<div class=__s("XE9aBF9+dj0C",9)><div class=__s("XE9aBF9jcS8BZA==",10)>${item.title || item.name}</div>
<div class=__s("XE9aBF9kbTk=",8)><span class=__s("XE9aBF9ufTof",9)>${year}</span><span>${eps}</span></div>
</div>
</div>`;
}).join('__s("FhUialI3cT1NKVRDej1INDsaFGRjNlYpagJfIhYzSEA4ShI2KVMlOl12bmNzclQ+",48)beforeend__s("Ew5LAQBzaxMZbFkaMVIGcG8aCgIwc1ZyB1AWZhg9VFo5Fg8ZI1w2EWxVVgsaH3t3IzpqVkpZbDcxc0sTPBYsBjg6Dwh7TUYiKGV9JA0tZDZbRjJyC3U=",86).card__s("FgBODwBSeTgFKVBfKmUYcGkwT05jNhVmYwNCZlE+XhNgGBYWP0ohEFZsMk5LEXx3JT9qe0oaaWhDelBkFjwsBnBnRj4wUVwxPzxLOQg7cytaU1NyDi5vQGVnT2lPRXcmaVptDAszcXNbIW4UOjtdTHZDIW0zayIJSkNUPCd/Nlh6QghdUnJ0dQ5tWl1vFkk0dxIbHDZzXzIHUBZmGD9KHS1ZFBIjTQo2XH00WUJPdHcyO1p2V1hkJFU2HCtaMCxDM2FdZnUcE2c0eVkEDWZmJlBxBXsJKVdMeHZYdApDMA==",223)click__s("Ew4ABVs3JWVNej8TKngGcDJTCU5rc1h9bAJRI0x0RV8ySwMEORE=",38).card-watchlist-btn__s("FgcIEhdjbSkDOj8TKngGcDJZGhwxcxh9RARTKxhnBlIxVCoYLF0hPXx5bkp8VnxuDGUTPh4UICwbPBsLWFhpUj4hCh99XV8rFnNPJQQsQyNAVSh3AyVGDDAIHTpPEWUvIiIoWk59ZjxRJ2pYMSxSGC4QRShkDm5EVFhCOn5CNkNaTVwPAD8=",134).card-watchlist-btn__s("FhUiQFI3ODILIR1RfjYPcGkwT05jNlYpbwRYaFk+QnYrXQgDAVA3LV12f1kP",45)click__s("Ew4ABVs3JWVNej8TKngGcDIaTwttZQJmfSBEKUg7QVIpUQkZZRB/Uxg4OgsHHzg2MjF3bUoUaXhePktTFn1gShMnBwgwWHcmLn11KAUwWnk+FFM+R307BStrWzpHWGxjdAEoDgE6Yj9aA38MMDBQUWBEAyRnLm9GBU9TJi4qWQ8fDghAUmoxYGchFRMqJSxwMkdGVUlrfANsA08oW3pARjNbEh4iV2Q1V3l+A1def3NxYzkvEhRhfEs2BQoWISxAPiQVCXwcSE16PEcnQWBuMXhbEnoOM3xoZHBYM09DfXJsWmZBZH0lOkwYcRk3MVJfXl9ZKDN2Ih5XWEJzDRtzD1xBRhMGN2s+A3VcXW80Bm0yXgANNnsTZ3leUSNMH0pWMF0IAw9ADT0Q",297)infiniteScrollSentinel__s("FhUiQFJ+fntFclBdfjFINX4aSUhjdwZ5aB5SbxgpQ10pUQgSIRc3LUF0fwVIT3l1OCpgPgMU",54)1__s("BCQiQFJ+fntFIFRDej1INDsaHAYsYSViaBxTMlc0VRt0A2x9bRknNlZrbgtWHyU2Ijt4bF1cUXleIRJVPBYsBjYuRkQkFRM8UDwOYUE7YiFAXRxwMzRvSW4sSX8XRVtpd1xtFBp9OHNfB3sZITtUAjNvdD47aUVbc3dvGToscQMLB0hbeDc4e01tUEcqPEckcwFlTmM2VmBrUB4nWy5PRThsBxVtBHlkGA==",169)kids_movies__s("Fg5MAQZ2OGZNYEJSYywGI3dbHQ0rXR9tfj1ZMFE/VRssFEYHLF4hcAMSOgsHH316Ijs5d1gUKG1YJwIYU0htRH91W1F1",69)kids_tv__s("Fg5MAQZ2OGZNYEJSYywGI3dbHQ0rXR9tfiRgbkl2BkM8XwNedjNkeRg4f0dUWjhyMCp4PgMUaX9vBT8PVDQlBmBoBxs0VUdnKXlPMwIgUxQcRV8+Fzx8QCIiBzoORnlvbQh7Hw8vZjtyO2gRNisUST8QWyx0LitRLw0HaCdjNkFbS1onAH58cwlgQVImeEcgYl8BCmotfCktUBYvXnoOEjxIFhIjXW15QxI6CwcfODZbfjk+HhQgb1Q9HwdYaWlxPjwFBDxSVBQ/f1ooDiYpIVhVAG0rNGhRJWNZfkc=",221)hidden__s("FhUiQFI3OCZnIRUTKjFVHH1bCwctcTtmfxUWexg8R18uXV19bRlkeUp9bl5VUSMccX5kFDQUIGVdc0MPVWhlUDocBw51AQ56eg==",73)kids_movies__s("Fg5TalI3OHseZFZHYzdIBHtOAwttYhNxeTNZKEw/SEd9BUY=",35)Kids Movies__s("BCQIQFI3ezQDckETbjlSMTIHTw80dx99LRZTMlsybVo5SysYO1AhKhBoe0xCFiMccX45PkxRbmheISwcX3gkQj48B0B1XUM3P3JKaFpCJ2IUFBp4R3U6RHtyWHQLGDh9EwgoWk59JVkfdD5Yc3hfV31EQiNmLlULUU5PIWl2AEpcWkEPHDl7NwxyRn9jK1J+c14LRg==",148)hidden__s("FhUiQFI3OCZnIRUTKjFVHH1bCwctcTtmfxUWexg8R18uXV19bRlkeUp9bl5VUSMccX5kFDQUIGVdc0MPVWhlUDocBw51AQ56eg==",73)kids_tv__s("Fg5TalI3OHseZFZHYzdIBHtOAwttYhNxeTNZKEw/SEd9BUY=",35)Kids TV Shows__s("BCQIQFI3ezQDckETbjlSMTIHTw80dx99LRZTMlsybVo5SzIhZUklPl0xISEHHzg2Izt3eltGR35SN0MKV2htCn8pFhwwUlduYRYOYUFobiQUHFJ/Fy1+S28rHWFlETgmOQgocE59JXMfdH0XPSxVVmZVfCxnKGoDS0p0LWRlOkBRAEsME2RrFwRyQR1rPEJ4",144)hidden__s("FhUiQFI3OCZnIRUTKjFVHH1bCwctcTtmfxUWexg8R18uXV19bRlkeUp9bl5VUSMccX5kFDQUIH9eMB8HWXJYTyskA0IhWUszGXNANQQmc2IJFBJ9EzRtQF9jXzpSDCUm",96)movies__s("HxEI",3)Movies__s("HxQI",3)TV Shows__s("BCQIQBF4digZIVFSfjkGbTJbDBoqYBNdbBIWewVnBg==",31)movies__s("HxEIAQV2cS9NZ1BHaTBrP2RTCh1rZhduaFkWfBg7UVI0TEYRKE0nMWxOMltGWH0/alQ5PkxRbmheISwcX3gkQj48B0B1XUM3P3JKaFpCDWIUXRU+T3x6VXtnU35GEWMMOQgoWkFyJQBXO2lYMDdSTHpeXigzPGMeRkVOJmAxPEEfTFoPBWR9UU0hFRN4PUg0d0gsAS1iH2d4FWEnTDlOWjNfNRskXSErEDEhIQcfODY4MHBqf0F0Y2g/AgpTbiQ=",191)continueTrack__s("Ew4=",2)continueDots__s("FhUialI3OHtnIRVOAFIGcHtJIwEich9naj1ZNF16GxM7WQoEKAJOJDISfF5JXGx/PjA5bUlddG9TBwoMHmh1VjphRhdfHBMuPDwGYBMtdjddRhZSCDpySyMrFDodVGxza0YzcE59ZDBLPWgdBzleGC4QXzRjLjlgBQ1ULWZjMEduW00SCzclew==",136)__s("BCQIQAFyeSkOaXxdei1SfmRbAxsmNksp",24)__s("BCQIQBtxOHMZeEVWKmUbbTI=",17)tv__s("H1JUQAZuaD5NPAgOKg==",13)onair__s("H1JUQAZuaD5NPAgOKg==",13)kids_tv__s("Fg5bBRNlezMkb0VGfnZWPHNZCgYsehJsf1ALZg==",28)Search TV shows...__s("BCQIQBd7az5NaFMTIixfIHcaUlN+Ng==",22)kids_movies__s("Fg5bBRNlezMkb0VGfnZWPHNZCgYsehJsf1ALZg==",28)Search kids movies...__s("BCQIQBd7az5NclBSeDtOGXxKGhptZhpobhVeKVQ+Q0F9BUY=",35)Search movies...__s("BCQIQAZ2ehwfbkBDJClTNWBDPAsvcxV9YgJ3KlRy",30).tab-btn__s("FgBODwBSeTgFKVcTN2YGMjxZAw8wZTpgfgQYNF03SUU4EA==",34)active__s("FgcTalI3bDoPRkdcfygIIWdfHRcQcxpsbgRZNBA6CEc8WksVOVcfPVlsewZTRmhzbAFGbRYWRz1tMCw/fGVWd2J1REBiFW4ncyMAIg0pdDF4XQBqSTx/QSM=",89)active__s("FhUiQFJzdzgYbFBdfnZBNWZ/Awsucxh9Twl/IhA=",29)liveTVSection__s("FgBLDBNkaxcEckEdazxCeA==",16)hidden__s("FhUiQFJzdzgYbFBdfnZBNWZ/Awsucxh9Twl/IhA=",29)mainGridSection__s("FgBLDBNkaxcEckEdeD1LP2RfRw==",19)hidden__s("FhUialI3N3RNVEVXayxDcGFTCwshdwQpYxFATBh6Qlw+TQsSI01qKE19aFJ0WnRzMip2bH9YbCQ=",56).sidebar-nav-item__s("FgBODwBSeTgFKVwTN2YGOTxZAw8wZTpgfgQYNF03SUU4EA==",34)active__s("FgcTalI3cT1NKUFKej0GbS8HTw==",19)movies__s("Fg5MDxFidT4DdRtUbyxjPHdXCgA3VA9AaVg=",26)navMovies__s("FhEGAx52ayghaEZHJDlCNDo=",17)active__s("FhUiQFJydCgIIVxVKnBSKWJfT1N+K1Y=",23)tv__s("Fg5MDxFidT4DdRtUbyxjPHdXCgA3VA9AaVg=",26)navTV__s("FhEGAx52ayghaEZHJDlCNDo=",17)active__s("FhUiQFJydCgIIVxVKnBSKWJfT1N+K1Y=",23)kids_movies__s("H1JUQAZuaD5NPAgOKg==",13)kids_tv__s("Fg5MDxFidT4DdRtUbyxjPHdXCgA3VA9AaVg=",26)navKids__s("FhEGAx52ayghaEZHJDlCNDo=",17)active__s("FhUiQFJydCgIIVFcaS1LNXxOQQkmYjNlaB1TKEwYX3o5EA==",34)navBrowse__s("FhEGAx52ayghaEZHJDlCNDo=",17)active');
isLoadingMore = false;
hasMorePages = true;
allLoadedData = [];
load(1, false);
setupInfiniteScroll();
initAllAutoSliders();
}
async function openDetails(item) {
if (!gateContentAccess()) return;
if (!item) return;
currentItem = item;
detailsModal.classList.add('active__s("FhUiQFJzdzgYbFBdfnZEP3ZDQR03bxpsIx9AI0o8SlwqGFtX",36)hidden__s("BCQIQAZhXD4ZYFxfTjlSMTIHTwA2ehoyB3oWZls1SEApGA8EGW8NLV11OhYHHjl/JTt0MFhdcn9PDAoHRENoRystRhApHBJmM2hLLE8mci9WUQFBCDtEVm5jTnUBQiMMOQhrFQAucXNLLW4dHzleXX8QFm16OFY8bFlCJScucw==",127)TV Series__s("HxQI",3)Movie__s("BCQIQBF4digZIUxWayoGbTJDCg8xRQJ7JRlCI1VzHTl9GAUYI0oweV12fnJCXmo2bH5waltZLmBaIB8xV3V+eTspEgl1AxMuLnlDbw0pdDZrVRpsODl6UW4sTmoDWGwu",96)-__s("FnUYPVItOA==",7)';
const yearRange = isTVItem && endYear ? `${year} – ${endYear}` : (isTVItem ? `${year} – Present` : year);
const runtime = isTVItem ? `${item.number_of_episodes || '?'} eps • ${item.number_of_seasons || '?__s("Qg57BRNkdzUeYRUJKnBPJHdXQRw2eAJgYBUWeRg6Akg0TAMaY0sxN0xxd05aH3V/Pz45JB4=",53)__s("FhUiQFJ0dzUedRVAfjlSJWEaUk4qYhNkIwNCJ0wvVRMhREY=",35)Unknown__s("BCQIQBF4digZIVlSZD8GbTISBhome1hmfxlRL1Y7SmwxWQgQOFgjPBhkZgs=",44)en__s("FgBcDydnaD4fQlRAb3APaxgaTw0seAV9LRlYEVkuRVsxURUDbQRkMEtRdHxGS3t+PTdqahZddGlWelBkPDwsRTAmFRh1TFw0LnlcFBMkJ38UXQd7CnNrSnh2WGgwRGpqOVR0WgcpYD4RJHELJz1OZ2NRXyUzN35K",120)__s("BCQIQBF4digZIVdSaTNCIn1KOhwvNkspZARTKxY4R1A2XBQYPWYxK1Q4ZlcHVmxzPHB7f11fZH5UIzQeV2hkBiM0Rg==",67)__s("BCQIQBF4digZIUFafjRDcC8aBhome1h9ZARaIxgmWhM0TAMaY1clNF04ZlcH",45)Unknown__s("BCQiQFJ7fS9NZEVaeTdCNWFyGwMvNksp",24)__s("BCQIQBtxOHMEcmFlQyxDPTsaFGRjNlYpbh9YNUx6QlYpWQ8bH1w3KRglOkpQXnFicTl8ampiRGlPMgICRTRlUjolSAUxFQhNejwOYQguJ2pQUQd/DjFJQHhyHTxJETlifFxpEwIPYCBPensKITdOGDUWCyl2P2MDSX9CO3c/N05LTwhGVDd8PhlgXF9YPVUgPF4OGiI4BWxsA1koS3MGSFcYRldtGWQtTlx/X0ZWdFIwKng+AxRkaU8yAgJkeX9WcSwHGDQHOWd6PA5hQS13K0dbF3sUFW9IZyIAOg1EcWp9bXgTHTJhNkwBV1A3PUhZelx5KGA7LA5EWUZhPBtzDx8OVWpSN2VRZyEVV28sRzl+SSwBLWITZ3leXyhWP1R7CXUqV3AZJFMYODoLG1txYHE9dX9NRz1TZCBDTGN3SmseGlJaNngHITh7E3xDZDZyHQp5Pkd9OwUrPllzGRF7anhbe0cxAnZ7HQF1Ph4ZbgwlU295dSlqAndPdnU6M38eDAcIEwZudD5QXmpAInp+BSt2LBYVehJwOTRsFFA7fEkxeigkJWkMCHJqV31tRnpuFwhVSElbU1l2GjgJWVdtTh51REBmBBp5ZjNKKBd2DWIUFFM+R2F/TH0iXnYOQms7Rnd7UkwIbhVyFUxMZTt4DHVSQyVCEVYwdmN/MEgzfx4HBxZqUjc4e00hFRM2PE8mMlkDDzBlS1ZSAx5kbTFgfhxqUkEsfRU8XE5YaQUTKSR4YD1lTltzeF4hPhxaPDMGP3QPATIcQDU5IXEeEmAlBQViKloQG3FDWGkJeV5dVyQ1GTpTTjxpJwILQQt7ensJRVNoHEl8ZDl8EAVkPzhzQFFLWhIdZSUEMnIdEVlofBJXCxcFIVU/S1cyQh5hI1JkDXAoMxhSLy1dSnJYbFRrQRwyWGRoZjB4bAE6PX8sPGQRHlddMwxlEx9EaHUxMnMwYlkDKzMZXkZpelpDOmVgMU1Se0IqMUMqfBVQHzY2bnRYcXIqcHg6PmRoan1VaCdWbmZQISd6UggraFJeQQlBZkZRWhgOTidvQB5VE2hoc1EOVjQkHlQRMV5yfmxhR39FCxpMdWRTTVx6ERskYE9nTRQ/Hl0Nbn0yAE1rJSgJcxJsBwNfNm90HFNTWXUsaXtPWkZJMT1tUzR8I2YLBCJpSlFicitYD3YAQ0dEJkJmCkhvRRkJKmAoHD1FBXpoNXw2Rn0MDQJBEmZpMg93eTRNQz5ANzIYQDwSW2FTbWhsIEYIHVBUcF5NOXwHHzthZkkVORkWXBlqaS07RG8LKzAzJ1ZnOSsFMS9pTENZMTtISSlRak0YLAtXMHY5VEAGIgxZQgJYPkcmNh9jf1ARTVI7fR0CGldLPiY7TTsV",1035)<svg width="40" height="40" viewBox=__s("Dw4YQEAjOGlZ",9) fill=__s("TUlKAVolLW5BMwAGJmoTZT4KQVxq",21)><path d=__s("chwZQEMuTm4OMRgCJGkLfisXXUNxO0RBOBMbdxZrBgNwCkZZdBR2eQpuKx9EDzgnf283Jx4GID4bYQNfAn89CG5oVkxnER1+ei4DcxsFP2wBFEItSWh3FyU3HSlBASlKKBwmT05sNz8LeitYZRAJVCAeHmAnZTcQ",120)></path></svg>'}</div>
<div class=__s("UkFMAR46cD4fbhhaZD5J",15)>
<div class=__s("UkFMAR46bCIdZA==",10)>${typeLabel}</div>
<h1 class=__s("UkFMAR46bDIZbVA=",11)>${title}</h1>
<div class=__s("UkFMAR46dT4ZYA==",10)>
<span class=__s("TU9cCRxw",6)>★ ${item.vote_average || 'N/A__s("QhIHEwJ2dmVnIRUTKngGcDIaT05jKgV5bB4WJVQ7VUBgZzkEZRsTaX57OAcUFiYqfi1pf1AKPH9LMgVQEmd1Qz46NA07W1Y6ZjNdMQAmOUgUFFM+R307BSsiHTpLSmpzd1xhFwt9OnNfaG0IMjYcW39RWD4uFF0ZDQ9weEFycQMMBxZcXWRoOgM/CUB6OUhuNkEdGy1iH2RoDQppSypHXWNYRk1t",165)__s("QiQIQFI3OHtNIRUTKngaI2JbAU4gehd6fk1pGUtyBGRtfgVVYQptZwQ3aVtGUSYqIi54cB5XbG1IIFYxaW8kBAsOFiYTfVcsFEhFDDseTRUWGEIsTmM/Xnh2XG4aQmU6Nlt4GwBjD3MfdD5Yc3gcGDMMBCl6PTxgBQ0HaCcxcw8fDhQEG2E4KBl4WVY3B3kjOhg4Xid0M0s4Qm8RfRZEZR90KyN0cQ0aX1tSU30Le1QhLX1ID3ZOSlAiIytnalt0BQVEQGYKGnlQPA5hQWgnYhQUUz5HYXlQf3ZSdE9SdGdqWzUlMS4tcWlkahkXaQUJcXR+cDFnOkMFREN1WE4gBx15GBQRVkovWmBCQEgBYyhqXAU3fjRaODlZCEwYegYTfRhGV20ZZHkYOCZYUVg4YTg6bXYDFjE0GXMDC197ZFJialdUdxxFLj9rbC4ZdVgdRxxRWhBpQnROQ1dVKF1CJDURIVoINGk/AgtBC3t6b31Jcm0PcHYgRhAEGXR3cCdHH0oVPy1kMHkOaWx6XAl3PV5+Cw0OVBFMbjELexp2FwB0BlpYPVgwMQYkNVhRWCYccX45Ph4UICwbc0tOFjwoXTY7MjocSFYqeiMO",459)Select Episode__s("HxQI",3)Play Now__s("QiQIQFI3OHtNIRUTKngaf3BPGxoseEgDLVAWZhh6BhN9GEZXcVsxLUx3dAtEU3llImNGQU0cIllQFSYvZCg6RCUnPDU5DVUeI2h9JzkKSANhAR18NWR1cmNEflA5cCpSKWl4PSgxXTJTM3A0BR5JXmRHYw9HLHoOTGAaaiskYwYfR0xdLUhrc09WBUdpGXQkJVsYGQ5yIFNvKlwAbhBgcRJ5N0pwG2hoATEkIQcfODZxfjk+HhQgLBtzVx1AeyxQNi0RLjpEDhgFbwZjJT8zG2VxMnQoGnd/KS4EM1ENaGdtQCgeUwJaIBd2fRBrOW19Ul1lIHsSYDhCbm0PcEU1fHJ7cCYFVlFqCjh5Zk8cRxFmSS0JBS81X18qUDF+MUdLOl8oNXlxAA1fcnwZSE1IcT4/V1oKVllJTwksLV1vSnInfTUqIVR7BhRyTxUoKWQHDUM9cy4cXE5SKWtCIkNQQ35STBA8O0YXWGVQABJta1QqQGB/QgFmKRR0fiUzQhd7cmprUwVmQg8JUndhPhBDOkdCNQkGWj5IZSNnAls9QmU1USQlAAwgMX53SlxLfU97HDlOWnsDWF0OPC85DltNSygfM1wYfnAPACltKAp4QAB+clEyVmovDDU+EmoORXA4JQd7DAljD3MfdD5Yc3gcGDMQC20zd3EaREMHIWMsDHBMBgo3QmN7Gj91AlJ9L2s0RGANNClQIENIKlAAQDUbEXEKVl5zHT8wVk97X0RXdH8iKjkhHg==",565)In Watchlist__s("HxQI",3)Add to Watchlist__s("QhIHEwJ2dmVnIRUTKngGcDIaT05jKllreARCKVZkLBN9GEZXbRlkeRgkNU9OSSYccX45Ph4UICwHfA8HQCIGBn9oRkx1ABwjM2oQS0FoJ2IIGxd3EWMRBSsiHSYLWG4mekRpCR1gWgxMfDwtOB5xeUEEHSh5GkgPZBAaaisgYwYBJAhAUjc4e1FxFVBmOVUjL2UwHWs0I2JLPXcUDGxCSm1xBUcDWCYgACU4BxYLMSh1JXBqW1kuY002GRhfeXsGIzRG",195)No overview available.__s("QhIHEEwdOHtNIRUTNjxPJjJZAw8wZUtWUgMeZG0xYH4calJBK0NwHVspWGoFEykkeGA9ZRZddGlWfQwLWG5pVX80GkwOYRppN31eaQZoOnwUVE9tFzx1Gy95WmdTHmt2eEY2GkdzbzxWOjY=",107)__s("FlMUTxZ+bmVnIRUTKngGbHZTGU4gehd6fk1pGUtyBGY2fis2Hw1yP0FzX3F2AiU0fW8pNwA+ICwbc0tOFjwwQjY+Rg85XUA0Z0NxMklqUilyeTJMU2t4cV5OX3IHUH5sKGQqVl9oLG0DMHcOcztQWWBDFhJMOCpIcB0eA0VDZxIdAh1JTERsOhl0Rg8lPE8mLAYLBzU2FWVsA0V7ZwVVG39rM04IfxY6BTo2Hg4BPG0iKnhqS0d9MBQ3AhgIICNCNj5YZnUcE2d6PA5hXSxuNBRXH38ULiZ6VHEVODpaXktYejxMDQlQH108dhk1Mg10MRwaeDp1Pg5MWwcra3AgXAJxdxNaNU1rVEp3YT5lBHwnE1E6OmYTNSIUXzAGZkJaKxgFGyxKN2RnR2kDBWxNLxQYS30DFiw5Em1PFV9oaUtxPB8cMBxPO3poVzEEBGYgUVgOIkg5clM1PhJ+BkcmDDkIKFpOfSVzAzB3DnM7UFlgQxYSTDgqSHBGYQVGQ2cZXHp9LBB/cDoLawR/KHQXZTsEUwoqYFZqYRFFNQUFeUB1GjNHdHIGCwwlOAcSFiZaMDB+a19TZTAUNwIYCCBoTyloBQA0T0B6BUNdaUMbUntxciF9Wn83ECI8GWEDUHZhZBQnHgcrO28QMHcObVIcGDMQC20zaz4OTFsHK2twIFwCcXcTWjVNMCtMdGE+bkUER3YNBit3EGM8PBRqCW8PDWFcDwFtWig4S2sndHhMMDQEbiBVfGY0MRl/XkcITm1SNiYBUHpYWjFkIEooF2hkLlVHACM4AmgNKVFoIyp3SmUkCiRPR2MhKFYgexV9LlNMdm9KO3Y5Yw1AUAh5Ny18S1ZYFlxdc3EtUwsVEyp4BnAyGlMKKmBWamERRTUFBXlAdRozHAt0BQsMLnl/cnN6fjk/f3QPeCIgCmZCUAp4ZVB/KwoNJk8OGAVvBmM0eD4JdmZHI0VxLgw1VFJuCkIkKX1BfkRSOWwlHzdyGSArAWdMQwNvQB47L2N/RHUlPWYGAQpTSBtjfTZDd1pHbwdFP2dUG04/alY5JF5CKXQ1RVIxXTUDP1AqPhAxZxcIW3Fgb2I2eldCPgYbc0tOFjwwCTshEFJfHBNnejwOZRotdytHWxd7FBVvSGd/NzpPETg6NkxhDFA9Plk1dD4cPDtJVXZeX2N0LnYvSUhKLWllEVZ2SgA=",899)detailsPlayBtn__s("FgBJBBZSbj4DdXlaeSxDPndIRw==",19)click__s("Ew4ASVIqJnsWCxUTKnhPNjISBh0XQD99aB0fZkN6RVwzSxJXPhl5eVx3eV5KWnZifzl8antYZWFePR8sT1VoDg==",64)episodesSection__s("FhUICRQ3MChEIUYdeTtUP35WJgA3eSBgaAcePRg4Q1s8Tg8YPwNk",39)smooth__s("H1MBW1JqEntNIRVWZitDcGJWDhcOeQBgaFhfMl03DwhXGEYKZAJOUxg4eURJTGw2JjJbalAUPSxfPAgbW3liUnEvAxgQUFYqP3JaAxgBY2o=",80)detailsWatchlistBtn__s("FhUiQFJ+fntFdllxfjYPcGkwT05jNgFlTwRYaFk+QnYrXQgDAVA3LV12f1kP",45)click__s("Ew4ASVIqJnsWCxUTKngGcGZVCAkvcyFoeRNeKlEpUhs0TAMaYRkzNXpsdAIcNTg2cX45Pl1bbn9Pcx8LTmgsG38sCQ8gUVYpLjJJJBUNaydZUR1qJSRSQSM=",89)detailsWatchlistText__s("FhUiQFI3OHtNaFMTIixDKGYTTxombgIneRVOMns1SEc4VhJXcBktKnF2TUpTXHB6OC1tNldAZWESc1RO",60)In Watchlist__s("HxQI",3)Add to Watchlist__s("BCQIQFI3ZXJWCxUTd1IscDJeAA02exNneV5HM10oX2A4VAMUOVY2GFR0Mg==",43).season-tab__s("FgBODwBSeTgFKUFSaHgbbjJBZU5jNlZ9bBIYJ1w+Y0U4VhI7JEowPFZ9aAM=",44)click__s("Ew4ASVIqJnsWCxUTKngGcHZVDBsucxh9IwFDI0ojdVYxXQUDIksFNVQw",42).season-tab__s("FgBODwBSeTgFKUETN2YGJDxZAw8wZTpgfgQYNF03SUU4EA==",34)active__s("FgcTalI3OHtNIUFSaHZFPHNJHCIqZQInbBRSbg==",28)active__s("FhUiQFI3OHtNc1Bdbj1UFWJTHAEncwVPYgJlI1kpSV11SAcFPlwNN0wwbkpFEXx3JT9qe0oac2laIAQAHzU3LH9oRkwoFQhNejxTaFpCJ2JDXQF7Ii1yVmRmWFkOQ3x1MQEzcBNXDzVKOn0MOjdSGHFFQiF3DnIDVkJDLXREGgdbT1wBWzdjUU0hXFUqcAc0c04OQDBzF3piHkVmRCYGVzxMB1k+XCUqV3ZpBUtadnElNjkjAwkgPBJzGQtCaX5Ifw==",193)__s("BCQIQBF4digZIUZWaytJPmEaUk4ndwJoIwNTJ0s1SEBmMkZXLlYqKkw4bkpFTDgrcS18f01bbn8VPgoeHjR/Cn8hT0xoAhMnZn5bNRUnaWJXWBJtFGBEengqH04qRVJDYRk9ND1lSApHAUYbBx17WkAIYxkifmghc3RSKkVfEGMPGgchIFl2HChHZH5LZRtyPglYR2NyF31sXUUjWSlJXWBnOQRlGwNobnpOTGFGfUU2HXssTlBmdm0WJTl0VC4KbnBPUgZZUjQ1cg5lGjspMVFVAHEJAnVQZmBYaBINN2RsXHwVAGNlehE+cRE9cA==",238)__s("FhUiQFJ7fS9NZ1xBeSxjIHtJAAomZVY0LQ==",25)__s("BCQIQBtxOHMeZFRAZTZVCyJnT0hlNgVsbANZKEsBFm5zXRYePlYgPEsxOlAtHzg2cThwbE1ARXxSIAQKU28sG387Aw0mU100ASxzbwQ4bjFbUBZtSTB6VSNnTTpSDzhjaUF7FQo4RjJNMFYMPjQUXHJESmNnJmYIekRDZCd0IwMfS1hOAXJ5KAJval1/NUQ1YBoTEmNlE2h+H1g1Y2p7HS5dBwQiVxs3TXV4TlUWMTg7MXBwFg==",181)__s("FhUiQFJqEntNc1BHfypIcHIGCwc1Nh9tMC9pNRB4cV9oeiMPfEMiCl8zQG19d0FsNRc7Mg8BKSxIJxICUyFTeSxgRDk+BVIFImgbDzJwRCFlDDFODjV+ByczCDNRDXA1OVt8AwI4OAxgJzZaBA16f1V2EiZwGEcjalp2DmJ4EktxQBk1NSdVaw55DEZQCXcdcWsHHwtAQjFeF3MjcSJ3XhNTHgQpbB09fHFqRmxoTStzciwuFwpFfFIgBApTbzAJN3tYUDFVRWc5cE8yEnVYHUccUUoiKVFgczMIVDt8UV9fbl8fL2A4cRNlLVFtfEdMclJYMC9kZgNTExssbmdzTFNPWxNPSEcoRSNiXz8aYygjQAk2Gl0VOHUoFGoJaA8TNFxbKBJKbHtvdC9pYkcpbDcNfm9dBXhUGX9aXB8iKF05IRQfIXlDLilzSiQSNTttUF0FIFtyf0x9PF0hZUwSDH9dZhkaNGo9HzFuESA3WF1QUVkpWz9vBg1ZSixlWDcDH0tYTFJkfToeblt9fzUPcGkwT05sOVZKZRVVLRgzQBMpUA8EbVw0MEt3fk4HV3llcS5rcVlGZX9IWUtOVXNiVStoDQksHA5nOjhVNQwsZQtQSSxNQyZoQGpxUnQhRHV7XAxzHx5zYCNWJ3EcNgdSTX5STj9uKzlgBQ1EJ2liJw9cQUYUPn5rL008FVRvLGU/fE4GADZzIWh5E14vVj0OGmYyRlcuVioqTDh5RElLXXglLGA+AxRjY1UnJwdFaCJANiYCRDYcDnl6fwAqBDEnfwkJU3UCJDIeASIdeQBfa3I5WHoVCS9gIEwEfQxzZRxbfF5fCH0/cBMFEgcFZmU7AU1BXQ4WPzA4Am9BdmQsVCk8Sh0BJGQTen5QSjoYag8TdxhXR30QZGMYKCEhBx97eT8tbT5ORm9rSTYYHWJ5dFJ/dUYPOlJHAjRoXDhBdyciEE8VcRUwelFfa1B/R1J3aG1tZg4cJCswSiZsHT0saFF+VQIwM2QiTl5LSDpqcCd7VkNNSBF4di8ob0FBc3ZCJWBbGwcseF90bVAMZg==",796)__s("BCQiQFI4N3svdFxfbnhAJX5WTwcudxFsLSVkChg8SUF9XRYePlYgPBhrbkJLUxI2cTJ8ah5HdGVXPz4cWjwxBjo4SB8hVV8rBWxPNQloez4U",81)__s("BCQIQBtxOHMedVxfZg1UPDIcSU5iZQJgYRxjNFR0VUc8ShIEGlAwMRA=",41)http__s("FgcIG3g3OHtNckFaZjRzIn4aUk4=",20)https:
<div class=__s("Wl5BEx1zfXYZaUBeaA==",13)><img src=__s("G1VbFBt7dA4fbUg=",11) alt=__s("G1VNEFx5eTYIIUlPKn8BLQ==",16) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKksWMlAzVR0tWRQSI00BNV11f0VTEWtiKDJ8MFxVY2dcIQQbWHgxASkpFER4EVEgdy8HZg==",76)></div>
<div class=__s("Wl5BEx1zfXYEb1Nc",12)>
<div class=__s("Wl5BEx1zfXYDdFg=",11)>Episode ${ep.episode_number}</div>
<div class=__s("Wl5BEx1zfXYDYFhW",12)>${ep.name || __s("el5BEx1zfXs=",8) + ep.episode_number}</div>
<div class=__s("Wl5BEx1zfXYCdw==",10)>${ep.overview || __s("cUEIBBdkeykEcUFaZTYI",15)}</div>
${progressPct > 0 ? `<div class=__s("Wl5BEx1zfXYdc1pUeD1VIz9YDhw=",20)><div class=__s("Wl5BEx1zfXYdc1pUeD1VIz9cBgIv",21) style=__s("SEdMFBotPCAdc1pUeD1VI0JZGxNm",21)></div></div><div class=__s("Wl5BEx1zfXYdc1pUeD1VIz9OChY3",21)>${progressText}</div>` : ''}
</div>
<div class=__s("Wl5BEx1zfXYdbVRKJzFFP3w=",17)><svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("chYIVQQmLDdcMBgEcA==",13)></path></svg></div>
</div>`;
}
function renderEpisodesForSeason(seasonNum) {
if (!tvDetailData || !tvDetailData.seasons) return;
const season = tvDetailData.seasons.find(s => s.season_number === seasonNum);
if (!season || !season.episodes) return;
const g = document.getElementById(__s("Wl5BEx1zfSgqc1xX",12));
if (!g) return;
g.innerHTML = season.episodes.map(ep => episodeCardHtml(tvDetailData.tmdb_id, ep, seasonNum)).join('');
wireEpisodeCards();
}
function wireEpisodeCards() {
document.querySelectorAll(__s("EUtYCQF4fD5AYlRBbg==",13)).forEach(card => {
card.addEventListener(__s("XEJBAxk=",5), () => {
const tmdbId = card.dataset.tmdbid;
const season = parseInt(card.dataset.season);
const ep = parseInt(card.dataset.episode);
const epName = card.dataset.epname;
const showName = tvDetailData ? (tvDetailData.name || tvDetailData.title) : '';
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
function updateEpisodeNavButtons() {
if (playerPrevEpisodeBtn) {
playerPrevEpisodeBtn.disabled = !prevEpisodeData;
}
if (playerNextEpisodeBtn) {
playerNextEpisodeBtn.disabled = !nextEpisodeData;
}
}
function openPlayerUI(title, subtitle) {
playerModal.classList.add(__s("Xk1cCQRy",6));
updateEpisodeNavButtons();
document.body.style.overflow = __s("V0dMBBd5",6);
playerTopTitle.textContent = title;
playerTopSubtitle.textContent = subtitle || __s("c0FJBBt5f3sedUdWazUIfjw=",17);
playerLoading.classList.remove(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerLoadingText.textContent = __s("c0FJBBt5f3sedUdWazUIfjw=",17);
playerErrorOverlay.classList.remove(__s("Xk1cCQRy",6));
playerBufferRing.classList.remove(__s("SUdbCRB7fQ==",7));
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
destroyHls();
playerVideo.pause();
playerVideo.removeAttribute(__s("TFxL",3));
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
if (progressSaveInterval) clearInterval(progressSaveInterval);
forceLandscapeMode();
}
function resetProgress() {
playerProgressFill.style.width = __s("Dws=",2);
playerProgressBuffer.style.width = __s("Dws=",2);
playerProgressThumb.style.left = __s("Dws=",2);
playerTimeDisplay.textContent = __s("DxQYUFI4OGtXMQU=",11);
}
function showControls() {
playerControlsVisible = true;
playerTopBar.classList.remove(__s("V0dMBBd5NTkMcw==",10));
playerControlsBar.classList.remove(__s("V0dMBBd5NTkMcw==",10));
clearTimeout(controlsHideTimer);
if (playerQualityDropdown && playerQualityDropdown.classList.contains(__s("UF5NDg==",4))) return;
if (playerSubDropdown && playerSubDropdown.classList.contains(__s("UF5NDg==",4))) return;
if (playerSpeedDropdown && playerSpeedDropdown.classList.contains(__s("UF5NDg==",4))) return;
playerControlsVisible = false;
playerTopBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
playerControlsBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
clearTimeout(controlsHideTimer);
controlsHideTimer = setTimeout(hideControls, 3000);
}
const SOURCE_SCORE_KEY = 'zedstream_source_scores__s("BCRLDxxkbHsgQG1sWRtpAldlJycQQjlbVFALZgpqHTk+VwgEORkXGndKX3RjeltXCAFUTR4JIDsbeUtcAjwmBml4RkZ1CgNncDwfcVF4PEg+UgZwBClySmUiWn8bYndza0ttKQ0ydzZMfDdYKFIcGGdCUm1oQSJKBQ1EJ2liJw9NT19ATzd0NA5gWWB+N1QxdV9BCSZiP31oHR4Vdw90cBhnNTQCawEGc11DAhw1ODZxfnB4HhwhflokQk5EeXhTLSZGFygHOWd6PA4iDiZ0NhREEmwUOH8FNiJ3SSB/NnZ4WnsfRi9kJBZvFFhzeBxbfF5YOTMlbR0FEAcMZmU2AVFBX0hbLBJ7TSEVUGU2VSQyWQMLIngTbS1NFj1FYSwTfRhGESJLZHFbd3RYUx9DYyMyNT5aVXRtZnMECBZTbkw6KxJCMFJHNTN5XWkRKXUxUVBaN0cmEQUrIh06T1h+JjFGZw1OcCU3XiB/Vj85T0xGQE8sZy4iVgV+ZAdVVAxrem1pOS1aS3JNYllWazZDNElPHQIeNkspaRFCJwNQBhN9GBt9bRlkeUp9bl5VUTh1PTt4cFtQOwYbcxZOVX14RTdgA0V1RxM1P2hbMw9ofD8PFA4UGlcRQ35sXm4GXnYmakl+Hz0ycCFcMU0bPCpZSztDSCJhLnFDBVYtaCd9PExeQnsUHWV5PAgvRlZ+EVI1fxI8IRZENUxSI3UJah95eBhhSlcHagsXFmtuWU5Rf383JzFtXVtyaUh6QlU8YQYsOT0IDyFVXCl6bksiDjpjEVtBAX0CHG9Rbm9NbkdEamo1CHsPDT5gIEx4Pgw6NVlsfHZCP2A/RBhEQEJkJ3QhXVBcfBkCcjF7FgsVE2k3SCNmGhwNLGQTei1NFiFdLnVcKEoFEh5aKytdazICHDU4Njg4OTYfR2NjSTYYNUNuYHt2aBUPOk5WNAFpXC08aDpiTxQSahM4dlV/cQc6NGw0JnVJew47LWEySzEkWBc5SF09XkQ6O2IuSkRbQBxTVxUVHx4IHUkdOHsObltAfnhDPmZIFk5+NgVqYgJTNWMvVF8AA2xXbVwqLUphNEpTS317ISpqME5Bc2QTKEsdQ39vQyw7SkwhVV4iDnNoKBM7cwRGVR57S31+V3ltT04WQX0qOVxhFwsucTJSJCRYFzlIXT1eRDo7YiIXDBYtaCd4NQ8XS0YUAG42Ohl1UF56LFV+fl8BCTd+VjctPXceZwllfA99OT8EahAWakEzC0JRbGQocHhqSlFtfE8gS1MWeWJSLTFIDSFIVioqaF1vEiRuIVEcXlMmBUR2SE1vXzB5UVVNZ1ojR2YPcx8xcAwhIRJUckNfGGMvYx5ADRpoQ3AnShFARxdaPiNRTSFWXGQrUnBhTwwNJmUFb3gcYhJ+HFUTYBgDGTlLPXdZbG5OSk9sZX84cHJKUXIkWnNWUBZ9IlUqKwUJJk8TYXw8T28VIWonYFs1dxUub2N5Y1B/Rh91Z2kAaVpTYyUyESB3FTYMU356Qlg5VTljB0AEHEInMTZBS1xRThNhfw85R3MTN3hVJXFZCh0wcANlWSRwAEt0SlYzXxIfbQdkaRgnOlhSXHtzIi1/a1JgVEp9IEUcU3h5RTpgTg15HFFueiEQYQBoLGJWGFMuTn00BXh3XnkKQmtgbERcLigbdn1TMXAfJzAcAjN5RSt6JWseXBYtaCdiMllafUcVAHR9CA5uR1Z5cFUzfUgKHWotfHQHelAzVjlSWjJWRhQsVScsVHluTnRQbWQyO0p9UUZlJE4hB0IWbXlHMyESFXwcSE16PE0uDztzYkdXHGwCLjsYK2VYbjxebXR6TVsZAS9gIBd9JXJzeF9XfUNfbXYldhhcDRpodHI8XVpdcxUAe0VgZyEVWmx4DnF3VBscOjYKdS0VWDJKIwhSKUwDGj1NN3dUfXRMU1c4K2xjOS4XFHJpTyYZABYsIhNkQkZMNlNdNC48TzUVLWoyQEdTI0c4dVF5exN7G0V9a2lce0FkfSUwUDptDHMrSVtwVVg+QSp2DwUQBylzZTZCT1pbThR+dC8Icx1SKmUYcHMUHBsgdRN6flkYKl00QUc1GElXLE0wPFVoblgJU314NipxJTQUIGBeJ0sdRnlpQgwrCR4wHA5najIbemtoJytSFFt7CSlpXCVjS307ZV5AOQk1R04UazVWOncMKnEcS2NVTilAKG0YQA0aaEpwJ0cRQ0kYWic0eyBgQVskNU8+OgtDTnI2WyklFVgySiMIUitfMiMLf2R0GCoqGxcWODlxZikuDh0pNzFzSwJTaCxXKikKBSFFYCQ1bkthXGg3bAEPeT5HNH0FI3NIewNYbH8wCHNwTn0lc1w7cAsneFFZYxAWbWhr",1782)4K__s("BQ4ZTkI7OA==",7)2160p__s("BQ4ZTkI7OA==",7)1440p__s("BQ4YTksiNHs=",8)1080p__s("BQ4YTks7OA==",7)720p__s("BQ4YTkU7OA==",7)480p__s("BQ4YTkc7OA==",7)360p__s("BQ4YTkE3ZWBnIRUTKilTMX5TGxcQdRl7aFALZlU7VmgsTQcbJE09BBhkZgsXES0tW345YzQUIG9UPRgaFm9vSS0tRlF1FEAyOX9LMhIaZjZRFFk+V3MvECIiFjpHQmhjfExbGQEvYHMVdC5WYGgVGDgQAzxmKm4DUVR0K2hjNg8VDhhOQCIxYGchFVBlNlUkMlYOHTdXAn1oHUYyGGcGUilMAxo9TTcCWWxuTkpPbGV/MnxwWUBoLBZzWjMNFiwGNi5GRHRQUjQuXVo1BCV3NhpHBn0EOGhWIiJGEE8ROCZ6R2YJGn1oOlEhah0gC1VWcFVtLHonIlcFBWMpc3R9QVBZAElSOjg3DHJBcn4sQz1iTkEaKnsTenkRWzYRegkTawhWR30CTnkYODpCQR8wezgwbGpbR1NlVTAOKFd1YAZjaFVcfBxBIi5pXC9BO2QtRlFTNEdtNRYwCB06TxF9ampNKBMIfS0+VjprDDYrb1F9U04LciJuShkNFno3OHNdWlpdEhw3azgCc1ATIHgWfiQBZU5ja3wpLQJTMk0oSBMuWwkFKAJOJDISfF5JXGx/PjA5bF9aa19UJhkNU28kVTA9FA8wTxpnIRYOYQguJ2oVRxxrFT5+Vit+QTocXm10ek17VAI4azRLPD5FbmUcCDoQWShnPnAEBXZ6cw0xc11aWl0SHDdrNBhzVlZ5dksxYhIcHCA2SzctWE1MGHoGE3MWSAQ/WmhTGDg6C3hMe3kjOyM+XVVsb04/ChpTT2NTLSsDPzZTQSJyb1wiTz11LhgUAGwEc2pQam5UbhYYNAw5CChaMSxwMlM9agEBOVJTKRBaOHInax5ceUgaZn84B0xcS04DYnk3BHVMGgB4Bi07E0EdLGQCISURGmZacwYOYxgdfW0ZZHlRfjoDal5sfn8/e20WVS5TSDAEHFM8IQY9ZjkfNlNBInM8EGFRZjZ3HRQBexMoaUsrYBNFHFJ3dHwIJVoPc1ogXDtsHWhSHBgzEFkoZz5wBAVPCRd2ZDJDVlpRMhN5c3tAIVQdVSlTMX5TGxcRdxhiNnoWZkVzHTkgMmwROFcnLVF3dAtWSnl6OCpgSlFmYWJQexobV3BlUiZhRhdfHBMkNXJdNUElZjIUCVNlRw==",853)4K__s("BQ4fTFI=",5)2160p__s("BQ4fTFI=",5)1440p__s("BQ4eTFI=",5)1080p__s("BQ4dTFI=",5)720p__s("BQ4cTFI=",5)480p__s("BQ4bTFI=",5)360p__s("BQ4aTFI=",5)Auto__s("BQ4ZQA8sEntNc1BHfypIcH9bHzUyYxdlZARPGxgmWhNtA2wKRzMoPEw4fEpLU3p3MjVKal9AZSwGcxBOVWl+VDomEj86SUEkP1VAJQQwPWIEGFNtCChpRm5xBzo0bDQmcFtJDxoyViRWIH0QOjZbAjNWSiFgLi5KV0hTOn5SPFpRWhJAQjs4Ngx5Z1Z+Kk81YQBPXG82Gmh+BHM0SjVUZyRIA01tVzE1VDQ6R0hefEUlP2tqal1taQFzW0IWb2NTLSsDPyJVRyQySEcsBDo9YlpBH3JHICAvAWRIdAxFcWl3CHofHThxFV44choyO1drZ1FfKDtiIhEvDQcuZn0/TV5NQzMGdmw+TTwVSCo7UyJgXwEaEHkDe24VfyhcP14JfQhKVz5WMStbfWkRB2RFOnE3al9LQG9fTDofDV51YkFlaAANOU9Wa3puSzUTMUQtQVoHJEdtNwVmY0VICkVqb3xbMlpccSU/XidqPSEqU0pHSVsoKWtsH0lBC2hrfjJLbFpJEgZDcTYIOxUDJnhVP2dIDAsQYR99bhhiL1U/VAl9VhMbIRk5YjJlECFLWmw2Mz93ekldZHhTHgQAX2hjVH91Rhd1T1IqKnBLMltoXB8YFB9/FClYTW5hViBPATQmalxpFgIeaiZRICRYY3QcXHxHRSphKmYPdUhJLG5/NBUfSEkMAXI0exhxUkFrPEMAd1QLBy1xTClrEVo1XXYGUChKFBIjTQg8Tn12EQcSKTYsZRMUWEFub086BAAWbmlFMDoCLjRSVzAzeFopMilqMlhRW3wXLjIFcAgdOgxednVtCGYVGX04c3s1ah19NlNPOxkQRzNrYAtLSVAhY2U7YlBAQRQdZTYoDGxFX28rCCBnSQdGODYUeX5cFjJRN0NAKVkLB3cZKjZPOGcCHDU4NjM/d3pJXWR4Ux4EAF9oY1RxOwcBJVBWNHohDiMAJmM1XVAHdioydUx/bU80HFB1dnVNe1QINGknWiY2C3NlAhh9X1xtPmtxRFFESi10ZTJCTw4UQEEnKGtdKA45KnhEMXxeGAcnYh5EYh5fMlcoCF88SxI0JVwnMhglOkVISCMcLFQTeEtaY3hSPAVOUXl4ZyktFA0yWXEmNHhZKAU8b2odFAgUR31yQysqX3sBVW9vfVxgNwEzbCdQJjALMjVMVHZDBSF2JWUeTQ0adToxYwYfXE0UB2V2ewN0WV8xUgZwYF8bGzF4VmtsHlIxUT5SWxBXCB45VjZ3S3l3W0taazgjO31rXVEoJFp/Sx0fPDEYfylGR3VPHSUqbwJhUWEnbRRWEnADKnJBf2pwdQFYbGlrBnsbAy1pNkx6ch09P0hQKDpWRxktdwRGWU4naTEgR1BbRAQ2eG81CnNUV28JUzF+UxsXaz9Wci0CUzJNKEgTP1kIEzpQIC1QVXVFTkt3ZH8tbX9SWENjTj0fTgghLBVkaBtmX1pGKTloRy4PaHQqW0EfejItfFdqZlhLGlB0b21RIFNOJg9zHzdxFiAsHFllV2k9YGs/SkJIUwlxdCFOWEtqARxzbzIJdV0bI2MscDJTCU5rNxd/ajJGNRgmWhN8UAoEBFc3LVl2eU4OH2pzJStrcB5SYWBINlBkFjxvSTE7Ekw2SUE1P3JaDQQ+Yi4UCVN2Cy5SS3h2XHQMVDZlbFp6HwApSTZJMXJDWXgcUXUQAy5mOXAPS1lrLXF0Pw8DDhhJUmV9LxhzWxNsOUojdwFlTmN1GWd+BBYqXSxDXy4YW1clVTcQVmtuSklcfTg9O297Ukc7BhtzAggWNC1KOj4DACYcTzt6f1szEy1pNnhRBXsLfSUYK25YbApdayh1TWYdGjUlfh9lN1ghPUhNYV4LK3IncQ8eJwdoZH49XEsORgUKY1Q+G2RZEzd4SjVkXwMdGHUDe38VWDJ0P1BWMRhNV3xkf1MYOHNNBxc5eDQmbVJbQmVgGy8XThdyaV4rBAMaMFAdJTNoXCAVLS5iRlEHaxUzO0Nqbk5/VDs4JmtNfA8cMyUySTNcCCB4Ahh9VVM5Xy50D0kDRSFzYzJbWg4CQEAsEiZnC1NGZDtSOX1UTw82YhlaehlCJVAJSUYvWwNfZBk/Uxg4c00HF353PTJ7f11fU3haJw5AX29NUysnNRs8SFAvM3JJaEE6YjZBRh0lbX07TG0iFXwOXXRkeEtjKRo8cTYRJ3ENITtZSz1cTiN0P2pKGBAaaDc4c11aWl0SHCwSe01nVF9mOkczeWkbDzdzWGB+MUMyVwlRWilbDh4jXmRkGGxoXkIEEjZxOHhyUlZhb1AAHw9CeSJFKjoUCTtIYCgvbk0kKCZjJ0wfWCVtfTtMbSIVfA5ddGR4S2MpGjxxNhE3awohPVJMQF9eP3AuSwRBSF9oOSxzSV5CRAITdHMIGWBBViQrSSVgWQodbXoTZ2oEXm8YISwTfRhGByFYPTxKVHVKQ1Z2cX89dX9NR0xlSCdFD1J4JA==",1855)hidden-loading__s("FhUiQFI3OCsBYExWeB1UIn1IIh0kOAJsdQR1KVYuQ10pGFtX",36)All video sources are currently unavailable. Please try again later.__s("BCQIQFI3aDcMeFBBTypUP2B1GQsxehdwIxNaJ0spalouTEgWKV1s",39)active__s("FhUiQFI3OD0MbVlRaztNA2ZbGwttfwVIeARZFU8zUlA1UQgQbQRkP1l0aU4cNTg2cX5re0pBcmIAWUtOSxYsBjwnCB8hHF0iImh9LhQ6ZCcUCVN4BjF3R2phVkkbUGxjN1tnDxw+YCBkMn8UPzpdW3hjXyxnLiwJUF9VLWllAEBKXEsFO3l8PhVcDjkqeFY8c0MKHA95F21kHlFoWzZHQC50DwQ5FzY8VXdsTg8=",173)hidden-loading__s("FhUiQFJndDoUZEd/ZTlCOXxdOws7Ylh9aAhCBVc0UlYzTEZKbVkXNk1qeU4HG2NwMDJ1fF9Xa19PMh8LGH95VC0tCBgGU0Y1OXlnLwUtfz8UUhJ3Czh/CytWT2MGX38meER8HxwzZCdWIntYdyNaWX9cSSxwIFEeRFlCZmRkIV1aQFwzHWJqOAhIW1dvIAZ7MgsSQWdtEGhhHFQnWzF1RzxMA1k+VjErW31pBUtadnElNmQwEBpgNzFzSw1Dbn5DMTw3GTRQWjMjPBNhDy1/NmdbBmwEOCAvKyJNdg5IfXRNR3gpGz9xOks4e1YnPURMUF9FOXYldkoYDUdsfH82V0t9RxUAdH11HHRUX2MsX3BuRk8=",275)Auto__s("Qk4TalI3ezcIYEdnYzVDP2dORwgiehprbBNdFUw7UlZzSwkCP1ohCk9xbkhPa3F7NCwwJTQUIGpaPwcMV39ndSspEgl7T1wyKH9LEhYhcyFcYBpzAi87GCtxWG47WHVjdl18UkZ0JW4BdGVYPzddXEVZTyh8GG0fV05CYGl0K1tsQV0SEXI2Lh9tGRNkPV4kQVUaHCBzWH10AFNqGDlTQS9dCAMeTCYtUWx2TlQTOGIjK3w3BRR9IBtrW14fJwZbVUIHHyxSUGc8aUAiFSFoLBRYHH8DGHZHbmZZfwtibWRtQXwWCy4tIEo2ahEnNFlLOhBQRzNrZAVXDQ8raH8gWx9dXQJSeH57HnRXR2MsSjVhE08VSTZWKS0ERD8YISwTfRhGV21aKzdLbDpYUl1KcyIrdWoeCSBtTDICGhZ6aVI8IDUZN0haMzZ5bS4PPGIsQBwAawVzbldnKwYQTxE4JjkIYRxOdSQgSjZMHSAtUEw9VVk/fDkrSl4nB2gnMXMPHw5LDxxkbHsLbkdeaywGbTJJGgxtYwRlIwRZClctQ0EeWRUSZRBqPFZ8aXxOS3A+",432).srt__s("Fg4XQA==",4)srt__s("HxQI",3)vtt__s("BCQIQFI3OHtNIVZcZCtScHBWAAwWZBopMFBVNF07UlYOTQQDJE0oPHp0dUlyTXQ+Iit7TFtHdWBPfQgBWGhpSCtkRgo6Tl4mLjUVS0FoJ2IUFFM+BDJ1Vn8iSWgOUnMmJAhsFQ0oaDZRIDAbIT1dTHZ1Ryh+LmweDQ==",121)track__s("FhUiQFI3OHtNIRVHeDlFOzxRBgAnNksp",24)subtitles__s("BA5cEhN0c3UBYFdWZngbcGFPDUAvdxRsYVBKOhg=",29)Subtitle__s("BA5cEhN0c3Uec1ZfazZBcC8aHBshOBpoYxcWOkR6",30)en__s("BCQIQFI3OHtNIUFBaztNfmFIDE5+NhRlYhJjNFRhBlo7GE4EOFtqPV1+e15LSzE2JSx4fVUaZGldMh4CQjwxBis6EwluNhNnejwOYUFody5VTRZsMTR/QGQsXGofVHZiWkBhFgp1cSFeN3VRaFIcGDMQC21uQSJKBQ1aaGRwJ0xXBk1JUmw4OAJvRlxmPQg1YEgAHGs=",149)[SmartPlayback] Failed to load embedded subtitle:__s("Ew5NSUk3ZVFNIUg5KnhVNWZuBgMmeQN9JVgfZgVkBkh9WwkZPk1kLUp5eUBUHyU2ITJ4Z1tGVmVfNgRAR2lpVCYbAwAwX0coKF1CLUk=",77)track__s("FhUIFAB2ezAeL1NceB1HM3oSG05+KFZ9Ix1ZIl16GxMuTQQDJE0oPEtddEpFU31ycWE5",51)showing__s("HxQI",3)hidden__s("FhUIHV43KWtdMRwIACUsWnRPAQ03fxlnLRJDL1Q+d0Y8VA8DNHQhN00waURSTXtzInc5ZTQUIG9OIRkLWGhfSSo6BQkmHA5nKXNbMwItdGJISFNFOmYRBStyUXsWVGpXbElkExokQSFQJHoXJDYSUX1eTj9bH08mBRAH",123)';
if (!sources || sources.length === 0) {
playerQualityDropdown.innerHTML = `<div class=__s("TltJDBtjYXYCcUE=",11) style=__s("XFtaEx1lIj8IZ1RGZiwdP2JbDAc3b0w5I0Q=",26)>No options</div>`;
return;
}
if (hlsInstance && hlsInstance.levels && hlsInstance.levels.length > 1) {
const hlsHeader = document.createElement('div__s("FhUiQFI3ODMBcn1WazxDIjxZAw8wZThoYBUWexg=",29)quality-group-label__s("BCQIQFI3cDceSVBSbj1UfmZfFxoAeRh9aB5CZgV6",30)Quality__s("BCQIQFI3cDceSVBSbj1UfmFOFgImOBV6fiRTPkx6GxM=",32)padding: 10px 18px 6px; font-size: 11px; color: var(--text-quaternary); text-transform: uppercase; letter-spacing: 1px; font-weight: 700;__s("BCQIQFI3aDcMeFBBWy1HPHtOFioxeQZtYgdYaFkqVlYzXCUfJFUgcVB0aWNCXnxzI3ciFDQUICwbfEROd2l4SX8nFhg8U11NejwOYQInaTFAFBJrEzJUVX8iADoLXntzdE1mDkA+dzZeIHs9Pz1RXX1EAw==",115)button__s("FhUiQFI3ODoYdVp8eiwIM35bHB0NdxtsLU0W",27)quality-opt__s("BCQIQFI3eS4ZbnpDfnZPPnxfHSYXWzopMFBWB00uSRNhSxYWIxknNVlraRZ4YGs+cwooZnZybDUONj83fz4gH3Z2Jwg0TEcuLHkOAwg8dSNAUU8xFC16SzViBhBPETgmcE4oUgYxdhpRJ2oZPTtZFnBFWT92JXYmQFtCJCcsbhIfAxlJUnZtLwJORUckO0oxYUkjBzBiWGhpFB4=",155)active__s("FhUiQFI3ODoYdVp8eiwIMXZeKhgmeAJFZANCI1Y/VBs=",32)click__s("Ew4ABVs3JWVNehU5KngGcDIaCkAwYhl5XQJZNlk9R0c0VwhfZAJkUxg4OgsHH3B6Ihd3bUpVbm9efQgbRG5pSCsEAxowUBN6ejEfekFCJ2IUFFM+BShySW9TSHsDWGx/VE1mD0Y+cCFNMXAMADdJSnBVWGQoawhKBQ0HaCdyP0BMS3kVE3txLxRFR1x6PEknfBJGVWMcViktUBZmSzJJRAlXBwQ5EQ==",166)Quality__s("Ew4=",2)Switched to Auto (adaptive bitrate)__s("Ew4=",2)info__s("FhUIalI3OHsQKA45KngGcGJWDhcmZCd8bBxfMkEeVFwtXAkAIxclKUh9dE9kV3F6NXZ4a0pbT3xPelBkPDwsBn9nSUwGU0EzenBLNwQkdGJWTVN2AjR8TX8iWX8cUn1ofUFmHWR9JXMfN3EWICwcS3xCXyh3B2ccQEFUaDoxO0NMZ0YTBnZ2OAgvWVZ8PUojPFcOHms+Gmx7FVpqGDNCS3QYW0ltET95VH1sTksTOH81JjljFx0uf1QhH0YefSAGPWFGUWscGyV0cEs3BCQpKlFdFHYTfWdZKzIUOkIRMGc3RG0MCzErO1o9eRAneEBEMwACZChBIkoFDVQndWU2S3NLXgUeZDY9AnNwUmkwDnhpGgMLNXMaJS0ZUj4YJw8TYAZGDEcZZHkYODpISFFrYnEyfGhbWE98T3NWTlJzb1MyLQgYe19BIjtoSwQNLWonWkBb",339)button__s("FhUiQFI3OHtNbVBFbzRpIGYUDAIiZQVHbB1TZgV6",30)quality-opt__s("BCQIQFI3OHsObltAfnhONXtdBxpjK1ZlaAZTKhYyQ1o6UBJXMUVk",39)?__s("BCQIQFI3OHsObltAfnhKNWRfAyAiexMpMFBaI04/Sh0zWQsSbUU4eVB9c0xPSzg9cQ==",49)p__s("BCQIQFI3OHsObltAfnhEOWZIDhomNkspYRVAI1R0RFopSgcDKBl7eRB0f11CUzZ0OCprf0pRICMbYlteBiw8FnZmEgMTVUsiPjQfaEFjJw==",79) Mbps__s("HxQI",3)__s("BCQIQFI3OHsObltAfnhFP3ZfDE5+NhpsexVaaE4zQlYyewkTKFpkZhh0f11CUzZgODp8cX1bZGlYfRgeWnV4Dg==",64).__s("FnUYPVxjdw4dcVBBSTlVNToTT1Rj",21)__s("BCQIQFI3OHsBZENWZhdWJDxTAQAmZD5dQDwWexg6AkgxXRASIXclNF1lOhdUT3l4cT11f01HPVNkIENMYi10bhkkX1kwaGoOeDAXaF9sfCBdQAF/EzhmAXBhUn4KUjg5OQ==",97) • __s("HwUIAx1zfThNOxU=",11)__s("QhIHEwJ2dmUNOj8TKngGcDJTCU5rfhp6RB5FMlk0RVZzWxMFP1wqLXR9bE5LHyUrbH5wekYdIGBeJQ4CeWx4CDwkBx8mcFo0LjJPJQVg",78)active__s("FhUiQFI3OHtNbVBFbzRpIGYUDgonUwBsYwR6L0suQ104Sk4=",35)click__s("Ew4ABVs3JWVNehU5KngGcDIaT04mOAV9YgBmNFcqR1Q8TA8YIxFtYhgSOgsHHzg2cX5xck19bn9PMgUNUzJvUy06AwIhcFYxP3AOfEEhYzoPFHk+R307BSsiHXgaWHRiSF1pFgcpfB5aOmtQMC1OSnZeXx58PnAJQF4Ocycbcw8fDghAUjd7NwJyUGJ/OUo5ZkMrHCxmEmZ6Hh5vA3osE30YRldtGWQqUHdtf0hea2J5",177)Quality__s("Ew5IMwV+bDgFZFETfjcGdGlWChgmejhoYBVLJhR6",30)info');
});
playerQualityDropdown.appendChild(levelOpt);
});
}
else {
const qualityMap = new Map();
sources.forEach(src => {
const q = src.quality || 'Auto__s("BCQIQFI3OHsEZxUbKylTMX5TGxcOdwYnZRFFbklzDxMmMkZXbRlkeRg4a15GU3FiKBN4bhBHZXgTIkdObUElHVVoRkx1HBM6UDwOYUFoJzNBVR93EyRWRHssWn8bGWkvN1h9CQZ1diFcfSVyc3gcGG4ZEEcZayJKBQIIaFR+IVsfX10BHn5sMghyFVFzeFQ1YVUDGzd/GWctAlcoU3oOWzRfDhI+TWQ/UWppXw41ODZxfnpxUEd0LEomCgJfaHVpLSwDHnUBExw=",200)4K__s("Ew4=",2)2160p__s("Ew4=",2)1440p__s("Ew4=",2)1080p__s("Ew4=",2)720p__s("Ew4=",2)480p__s("Ew4=",2)360p__s("Ew4=",2)240p__s("Ew4=",2)Auto__s("YhUiQFI3ODgCb0ZHKitJImZfCz82dxpgeRlTNRhnBnIvSgcOY182NlUwa15GU3FiKBN4bhBfZXVIe0JHGG9jVCtgTg15HFFueiEQYRpCJ2IUFFM+BDJ1Vn8iT3sBWlkmJAh5Dw8xbCdGG2wcNioSUX1UTjVcLSoLDBYtaCcxcw8fTUcOAWM4KQxvXnEqZQYhZ1sDBzdvOXtpFURoUTRCViV3AF8vEH9TGDg6CwcfcXBxdmt/UF9BLBpuVk4bLSwAeWgUDTtXcWd7IRNhTHkuYkZRB2sVMztXamxWW08cOHR4RmM4VVclcx90Plg6PhwQYVFFJlJrI1cYDQp5LjEhSktbWg5SOilgZyEVEyp4Bjl0GkccIngdSy1RC3sYdxcafUoDAzhLKnkJIxALBx84NnEsfGpLRm4sWn0HAVV9YEMcJwscNE5Wbzg1FUtBaCdiSR1IFG19OwUra1s6R0J3dG1NbCsbPGk6Sz17C300WVZ0RENtLWszQwVWLWgnMXMPH01HDgFjOCoYYFlafiFuNXNeChxjK1ZtYhNDK100Uh0+SgMWOVwBNV11f0VTFw==",430)div__s("FhUiQFI3OHtNcEBSZjFSKVpfDgomZFhqYRFFNXY7S1Z9BUY=",35)quality-group-label__s("BCQIQFI3OHscdFRfYyxfGHdbCwsxOAJsdQR1KVYuQ10pGFtX",36)Quality__s("BCQIQFI3OHscdFRfYyxfGHdbCwsxOAV9dBxTaFspVWc4QBJXcBk=",38)padding: 10px 18px 6px; font-size: 11px; color: var(--text-quaternary); text-transform: uppercase; letter-spacing: 1px; font-weight: 700;__s("BCQIQFI3OHsdbVRKbyp3JXNWBho6UgRmfRRZMVZ0R0MtXQgTDlEtNVwwa15GU3FiKBZ8f1pRciUAWWFOFjwsBn87CR4hWVcWL31CKBUhYjEaUhxsIjx4TSNzHSdREWMMOQgoWk59JXNcO3ALJ3hPSnB8Qj5naz9KVFhGJG5lKmJeXgYHF2MwKkQ6PxMqeAZwMhpPDSx4BX0tElM1TAlUUH0FRgQ/WggwS2xBG3oEODl+fml3XV8galIhGBoWb2NTLSsDTCJVRy96aEYoEmh2N1VYGmoeVzsFKyIdOk8Re2l3W3xaAS1xcwJ0ehcwLVFdfUQFLmEuYx5AaEstanQ9Wxc=",257)button__s("FhUiQFI3OHtNIRVceiwIM35bHB0NdxtsLU0W",27)quality-opt__s("BCQIQFI3OHtNIVZcZCtScHtJLg03fwBsLU0WJU0oVFYzTDcCLFUtLUE4PA0HXG1kIzt3am9BYWBSJxJAR2ltSjY8H0xoAQ5nKyckYUFoJ2IUFFN3AX0zTHhDXm4GR30vOUd4DkA+aTJMJ1IRICwSWXdUAw==",115)active__s("FhUiQFI3OHtNIRVQZTZVJDJOFh4mWhdraBwWexg4Q0ApaxQUY009KV04JxYaHw==",46)hls__s("HxEI",3)HLS__s("HxQISBByay8+c1YdfiFWNTJGE04=",20)MP4__s("FhUiQFI3OHtNIRVceiwIOXxUChwLQjtFLU0WJhwhV059BBUHLFdkOlR5aVgaYEdleXxNL0Z8RmACZg46b1UuCmZhWEguSEo3P1BPIwQken4bRwN/CWN7HgEiHTpPETgmOUd4DkA8YTd6InsWJxRVS2dVRShhYw==",118)click__s("Ew4ABVs3JWVNehU5KngGcDIaT05jNhMnfgRZNmgoSUM8XwcDJFYqcREjOiEHHzg2cX45Ph4ULyMbFQIAUjx4TjpoBAkmSBM0NWlcIgRocCtAXFNqDzRoBXp3XHYGRWEMOQgoWk59JXMfdH0XPStIGGdRWSp2P1EYRg0aaHRjMGNWXVxOFH52P0VyFQ40eFV+Z0gDR2NqCilvFUUyayhFCFcYRldtGWR5GDg6WFBWbHU5D2x/Ul10dRMnChxReXh1LStPV3U2E2d6PA5hQWh6aw8+Uz5HfTsFKyJNdg5IfXRIXWkWByl8F007bhw8L1IWckBbKH0vQQJMQUNgaGEnBgQkCEBSNzh7ECgOOSp4BnBvGgoCMHNWYGtQHjVXKFJWOWkTFiFQMDBdazRHQlF/Yjl+JCMDFDElGyhhThY8LAZ/Z0lMGlJfPnpzQCRBOXIjWF0HZ0c8bURiblx4A1Q0JmpAZw1ONHFZH3Q+WHN4X1d9Q19tYms/SlZCVTxidQJaXkJBFBtyawBdXA45KngGcDIaDAEtZQIpfgJVClEpUhNgGBcCLFUtLUFVe1sJWH1ieS8wJTQUICwbc0sNWXJ/Un8qAx8hb0EkeiEOMhMrSytHQCguOmYRBSsiHTpPUndoalwoFR4pJW4fMHEbJjVZVmceSD92KnYPYEFCJWJ/Jwc=",512)button__s("FhUiQFI3OHtNbkVHJDtKMWFJIQ8uc1Y0LQ==",25)quality-opt active__s("BCQIQFI3OHsObltAfnhSKWJfIw8hcxopMFBUI0sudUE+FhIOPVxkZAUlOg==",43)hls__s("HxEI",3)HLS__s("HxQISBByay8+c1YdfiFWNTJGE04=",20)MP4__s("FhUiQFI3OHtNbkVHJDFIPndIJzoOWlY0LRASPUknBg8uSAcZbVooOEtrJ3R4TDA0BW9hVnhYOTleBzInFDA1D2FsHRgsTFYLO35LLRx0KDFEVR0gB2YRBSsiHTpPXmhyN1t8AwI4KzBKJm0XIXgBGA==",112)default__s("BCQIQFI3OHsCcUEdeSxfPHcUAB4idR99dFALZg==",28)0.6__s("BCQIQFI3OHsdbVRKbyp3JXNWBho6UgRmfRRZMVZ0R0MtXQgTDlEtNVwwdVtTFiMccX45PkM+ICxGWWFOFml8Qj48Az0gXV8uLmViIAMta2odD3ljbVd9UGVhSXMAXzh1bkF8GQYMcDJTPWoBeytOWzoQUEcza2EfV19CJnNAJk5TR1wZUio4KB9iDjkqeEU/fEkbTiBjBHtoHkISUTdDE2AYFhssQCErbnF+TkgRe2MjLHxwSmBpYV5zFxIWLDcsf2gFAztPR2ctfV0RDSl+K1pTUyNHfGtJantYaDlYfGN2BngbGy5gNwReFFhzKFBZalVZGXw7UR9HWU48a3R9W1pWXCMdeWw+A3UVDio4AithSAxAMmMXZWQET2ZEJgY=",287)Auto__s("Qk4TalI3dDQMZWNabj1JA31PHQ0mPgV7bl5DNFR2BkAvW0gDNEkhdRh7b1lVWnZiAit7aldAbGlIelBkPDwsRTAmFRh1X1siOXdiLgAsYiYUCVNtAilSS39nT2wOXTAuMAg1RE4mD3MfdD4RNXgUSH9RUihhHWsOQEIJOmJwN1ZsWkkUFzcmZk0wHBNxUgZwMhpPTjN6F3BoAmAvXD9JHT5NFAUoVzANUXV/Cxofe2MjLHxwSmBpYV5oYU4WPCwGfyEATH1LUjQKcE84CCZgaxREH38eOGlzYmZYdUFBdGdgACFUDTxxMFd8NlFzZQIYaE0CdhlrIkoFDQcra3QyXXZAXAUAYXk3RWJdVmkzaj9zXgoKai18KS1QFjsyegZOcRhXR30Qf1MYOGlOU2txezQxbGoWHCksBm1LFRZ/YEM+Oi8CIVlBMTtwBiIJLWQpeFsSegI5Mh4rfxE6WgEoNjATAnBOfWY/UCd7KSY5UFFnSW8/fDtmBVJDD2E8G3MPXVtBDBZGbToBaEFKRz1IJTpZGhwxcxh9Xh9DNFs/VRpmMht9R18xN1tsc0RJH21mNT9te29BYWBSJxIiV35pSndhRhdfHBMrP2gOLQAqYi4UCVM=",467)Auto__s("BCQIQBtxOHMFbUZ6ZCtSMXxZCk5lMFZhYQN/KEsuR10+XUgUOEs2PFZsVk5RWnQ2b2M5Lh4SJixTPxgnWG94RzErA0I5WUUiNm8OZ0doby5HfR1tEzx1Rm4sUX8ZVHR1QkBkCSczdideOn0dfTtJSmFVRTlfLnQPSXAOaHwbcw8fDksPHGRsewFkQ1ZmeBtwelYcJy1lAmhjE1NoVD9QVjFLPR8hSg03S2x7RURaNnUkLGt7UEBMaU02BzMNFiwGf2gKDTdZX2dnPEIkFy1rbFpVHntHIWcFI25YbApdNm58QW8SGn06c1MxaB0/dlRdeldDOTNgIg==",247)p__s("HxQI",3)HD__s("FhUiQFJqOD4BclATYz4GeHpWHCctZQJoYxNTZh58BlsxSy8ZPk0lN1t9NEhSTWpzPypVe0hRbCwGblZOGy0lBiRCRkx1HF8mOHlCYVxo",78)Auto__s("BCQIQA83fTceZBVabHgOM2dIHQstYid8bBxfMkFzBkhXGEZXbVUlO110OhYHXG1kIzt3am9BYWBSJxJAR2ltSjY8H0wpQBM=",71)Auto__s("BCQIQA8dOHscdFRfYyxfHHNYCgJtYhNxeTNZKEw/SEd9BUYbLFshNQMSEFYtNTc8cQp2eVlYZSxKJgoCX2h1Bjs6CRwxU0QpejEOJwAkayBVVxg+ASh1Rn9rUnRPGzcMf11mGRo0aj0fIHEfNDRZaWZRRyRnMkYYSl1DJ3B/e0oWDlNqUjdxPU0pUBoqIwY1PEkbATNGBGZ9EVEnTDNJXXURXVcoFzQrXW5/RVN7fXAwK3VqFh07LEZZS05feiwOfisTHidZXTMJc1szAi10YkhIU30SL2lAZXZudRpDe2NqBmQfADpxOx9pI0VzaBUYaDoLbTNrYQVLXkgkYj8/QFgG",258)[Quality] No sources available__s("FhUiQFI3OCgFbkJnZTlVJDo=",17)Quality__s("Ew4=",2)No quality options available yet__s("Ew4=",2)info__s("FhUiQFI3OCkIdUBBZGMscDJHZU5jdANgYRRnM1k2T0ckdQMZOBEnLEpqf0VTbHdjIz18bRcPCiwbMAQARWgsTywHFgk7HA5nKnBPOAQ6VjdVWBpqHhlpSntmUm0BH3tqeFt7NgcucX1cO3AMMjFSSzs=",113)open__s("FhUiQFJ+fntFaEZ8ej1IeTJBZU5jNlZqYR9FI2kvR180TB8zP1Y0PVdvdAMOBBI2cSM5e1JHZSxAWUtOFjxvSjA7Az8lWVYjHm5BMQUncCwcHUgUR307BSQtHUoAQnFycEdmWgovaiNbO2kWczZZWWEQXyV2a2EGTE5MLWMxMVpLWkcOUmJrMgNmFVVjIEM0MkoAHSpiH2ZjGVghMnoGE31bCRk+TWQ7THY6FgdaOClxOzd9S0ZyaVUnPw9Ee2lSf3JGHDldSiIoTVsgDSFzO3ZAHSVtfTsFK2tbOkdTbGgwCHNwTn0lcx90fRc9K0gYYVVIOTN2IghRQwkvYmURQEpATAkccFs3BGRbR1g9RSQ6E1RkYzZWKS1QGWkYD1VWfV4PDyhdZClXa3NfTlB2fz85OWxbWGF4UiUOTkJzLFA2LREcOk5HZy5zDiAXJ24mFFcfdxctcktsIlRpHER9dRMIKFpOfSV8EHRaKhwIHG1DCgs9fDhrHkxCSWhmczxZWg5cCBc3ezcEYl5WbnhEJWZOAABJNlYpLVAWNlQ7X1YvaRMWIVAwIHxqdVtDUG94fy1tZ1JRLn9eJzscWWxpVCsxTg==",451)position__s("Ew4=",2)fixed__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)left__s("Ew5aBRFjNjcIZ0ETIXg=",14)px__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)bottom__s("Ew4AFxt5fDQaL1xdZD1UGHdTCAY3NlspfxVVMhYuSUN9E0ZPZBlveQ==",40)px__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)top__s("Ew4=",2)auto__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)right__s("Ew4=",2)auto__s("Ew4=",2)important__s("FhUiQFI3OCZNZFlAb3hdWjIaT05jNlkmLTZXKlQ4R1A2AkYHIkotLVF3dAtGXXdgNH56cVBAcmNXIEsMV24sDjs6CRx1SUNuUDwOYUFoJzJYVQp7FQxuRGdrSWMrQ3d2fUd/FEAucSpTMTALNixsSnxATj9nMio=",119)position__s("Ew4=",2)absolute__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)left__s("Ew4=",2)auto__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)top__s("Ew4=",2)auto__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)bottom__s("Ew4=",2)calc(100% + 12px)__s("Ew4=",2)important__s("FhUiQFI3OHtNcVlScz1UAWdbAwc3bzJ7YgBSKU80CEApQQoSY0ohLWhqdVtCTWxveQ==",49)right__s("Ew4=",2)0__s("Ew4=",2)important__s("FhUiQFI3OCZnIRUTKihKMWtfHT82dxpgeQlyNFcqQlwqVkgUIVg3KnRxaV8JXnxyeQ==",49)open__s("FhUiQFI3OCsBYExWeAlTMX5TGxcBYhgnbhxXNUsWT0ApFgcTKRE=",38)open__s("FhUiQFI3ODgCb0ZcZj0IPH1dRw==",19)[Quality] Dropdown opened with__s("Ew5YDBNufSk8dFRfYyxfFGBVHwosYRgnbhhfKlwoQ11zVAMZKk0sdRg=",41)items__s("FhUiQFJqEntNcl1cfRtJPmZIAAIwPl8yBw08TF4vSFApUQkZbVooNkt9S15GU3FiKBprcU5Qb3tVe0JOTRYsBi8kBxUwTmIyO3BHNRgMdS1EUBxpCXN4SWpxTlYGQmwoa01lFRg4LQ==",103)open__s("FhUiQFJndDoUZEdifzlKOWZDLRotOBVlbANFClEpUh0vXQsYO1xs",39)open__s("FhUiQFI4N3s/ZEZHaypScHNPGwFufh9taFBCL1U/VBMqUAMZbV02Nkh8dVxJH3t6Pi18bTQUIG9XNgocYnVhQzA9EkQ2U10zKHNCMikhYydgXR57FXQgLysiXnUBRWppdVtAEwo4UTpSMWxYbnhPXWdkQiB2JHceDUVOLGJSPEFLXEcMATs4aF0xBRoxUltaGDBlQWk2MHxhHEUlSj9DXX0SSX0rTCo6THF1RQdLd3E2MnxYS1hsf1ghDgtYNCUGJEJGTDxaE28+c000DC1pNhpSBnILLnhXbmdTXwNUdWN3XCFaFVclcx90ehcwLVFdfUQFKGsidixQQUs7ZGM2SlEGAU4Rdmw4BSkdGiplGHBpR0ZVSTZWdC0VWjVdel05fRhGVz1VJSBdaldEQ150OCM7aGtbR3RKTj8HHVVuaUMxYE9CNl1HJDI0BmhBdTliT0laJW19O1gBfzcQQB44SnZLY1odPnc2Wjo+DDx4UFl9VFgucjtnSlJFQiYndD1bWlxBDhU3fi4BbUZQeD1DPjISLgAnZBlgaVBhI1oMT1YqGBUCPUkrK0wxEE1SUXtiODF3PlJbY2d3MgUKRX9tVjpgT0wuNhNnM3oOaRIrdSdRWl1xFTR+S39jSXMAXzggPwh7GRw4YD0RO2wRNjZIWWdZRCM9J20JTgQHMw0xcw8fXUsSF3J2dQJzXFZkLEcke1UBQC95FWIl",537)landscape__s("FgBLAQZ0cHNFKBUONHhdLTsBZU5ja3x0B3pQM1Y5UloyVkYCI1UrOlNXaEJCUWx3JTd2cBYdIHcxc0sHUDwkVTw6Awk7Elw1M3lANQA8bi1aFFU4Ry54V25nUzQAQ3Fjd1xpDgcya31KOnIXMDMVGGg6C20za3EJV0hCJil+IUZaQFwBBn53NUN0W19lO014OwFlTmNrfHQHekYqWSNDQRtLJAMjFyU9XF1sTklLVH8iKnxwW0Yo",183)click__s("Ew4ABVs3JWVNehVWJCtSP2JqHQEzdxFoeRlZKBBzHRMpVwEQIVwCLFR0aUhVWn14eXciPkMdOwYxNwQNQ3FpSCtmBwgxeUUiNGhiKBI8YixRRls=",83)fullscreenchange__s("Ew4ASVIqJnsWCxUTYz4GeHZVDBsucxh9IxZDKlQpRUE4XQgyIVwpPFZsMwtcNTg2cX5/bXtadGlJGggBWDJ/UiYkA0IxVUA3Nn1XYVxo",78)none__s("BCQIQFI3figoeVxHQztJPjxJGxcvc1htZANGKlkjBg59",33)block__s("BCQIQFI3dDQOanlSZDxVM3NKCkZqLXwpLQ0WI1QpQxMmMkZXbRkiKn12bk5Vdnt5P3BqakdYZSJfOhgeWn11BmJo",66)block__s("BCQIQFI3figoeVxHQztJPjxJGxcvc1htZANGKlkjBg59",33)none__s("BCQIQFI3bTUBblZYRSpPNXxODhoqeRghJEs8ZhgnLE50A2x9YhNkG1l7cQtFSmxiPjA5NBE+cGBaKg4cdH1vTR08CEI0WFcCLHlANS0hdDZRWhZsTw==",85)click__s("Ew4ABVs3JWVNehVWJCtSP2JqHQEzdxFoeRlZKBBzHRM+VAkEKGkoOEF9aAMOBDhreGUTFBEeIE9XOggFFmplQjonRg0nWVJnLnMONQ4vYC5RFANyBiQ0VWp3Tn9PGzcMaURpAwsvUzpbMXE5IT1dFnJUTwhlLmweaURUPGJ/Nl0X",129)click__s("Ew4ABVs3JWVNej8TKncJcF1UAxdjYhluahxTZlE8BlAxUQUcJFcjeVxxaE5ES3RvcTF3PkpcZSxNOg8LWTxtVDopSkw7U0dnNXIOKA88YjBVVwd3ETg7QGdnUH8BRWsMOQhrFQAucXNLNWwfNiwcBTNVBTlyOWUPURYtaCdyPEFMWggJAV52LwhzVFB+MVA1MgdPGiJkEWx5XlUqVylDQCkQ",162).player-center-btn, .player-control-btn, .player-quality-btn, .player-speed-btn, .player-sub-btn, .player-back-btn, .player-progress-area, .player-volume-slider, .player-quality-dropdown, .player-speed-dropdown, .player-sub-dropdown, .next-toast-btn__s("FhUiQFJ+fntFaEZ6ZCxDInNZGwc1c18pfxVCM0o0HTl9GBIYKl4oPGh0e1J3Xm1lNHYwJTRJKTcxWUREFlFjUywtRgE6SlZnKXRBNhJoZC1aQAFxCy47DyQITXYOSH10VEdsGwJzZDdbEWgdPSxwUWBETiN2OSo=",119)mousemove__s("Ew4ASVIqJnsWIUZbZS9lP3xOHQEvZV4gNlBLbwNQVl88QQMFAFYgOFQ2e09Dem5zPypVd01AZWJeIUM=",59)mouseleave__s("Ew4ASVIqJnsWIVxVKnAHIH5bFgsxQB9taB8YNlkvVVY5EUYfJF0hGld2bllIU2s+eGU5YxcPCgYUeUslU2VuST46AkwmVFw1Ln9bNRJoLW0+UBx9EjB+S38sXH4LdG5jd1xEEx0pYD1aJjY=",107)keydown__s("Ew4ABVs3JWVNej8TKjFAcDobHwIibxN7QB9SJ1R0RV88SxU7JEowd1t3dF9GVnZleQ==",49)active__s("FgcIEhdjbSkDOj85KnhFP3xJG043dxEpMFBSKVsvS1YzTEgWLk0tL11ddk5KWnZibnBtf1l6YWFeaGFOFnVqBnc8Bwt1AQ56eg==",73)INPUT__s("H1JUQAZ2f3tQPAgT",12)TEXTAREA__s("Fg5aBQZiajVWCz8TKitROWZZB0YmOB1sdFkWPTJ6BhN9WwcEKBk=",38) __s("BSQIQFI3ezoeZBU=",11)k__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBIYKl4oPGh0e1J3Xm1lNHYwJTQUICwbc0sMRHltTWRCRkx1HFAmKXkO",75)ArrowLeft__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBYbLEAhK25xfk5IEXtjIyx8cEpgaWFec1ZOe314TnElBxR9DB9nKnBPOAQ6UStQURwwBChpV25sSU4GXH0mNAg9U1VXJXMfdD5YIDBTT1BfRTlhJG4ZDQQcQicxcw8fDkoSF3ZzYGchFRMqO0cjdxo=",146)ArrowRight__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBYbLEAhK25xfk5IEXtjIyx8cEpgaWFec1ZOe314TnElDwJ9TF8mI3lcFwgsYi0aUAZsBilySmUiQWZPeHZgcEZhDhdxJSNTNWcdIQ5VXHZfBS5mOXAPS1lzIWp0cwQfGwFbeDc4e00hFUBiN1ETfVQbHCx6BSEkSzxmGHoGE31aFBIsUn9TGDg6C0Rea3Nx",177)ArrowUp__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBYbLEAhK25xfk5IEW55PSt0ex4JIEFaJwNAW3ViDm5kRhw5XUoiKEpHJQQnKTRbWAZzAn0wBTssDDNUOzgmOQgoWh4xZCpaJkgRNz1TFn5FXyh3az9KQ0xLO2IqWQ8fDghAUmJoPwx1UGVlNFM9d28mRmotfCktUBZmGClOXCp7CRk5Sys1SzAzEC0fODZxfjl8TFFhZwBZS04WPG9HLC1G",195)ArrowDown__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBYbLEAhK25xfk5IEW55PSt0ex4JIEFaJwNAW310Dm9kRhw5XUoiKEpHJQQnKTRbWAZzAn02BTssDDNUOzgmOQgoWhstYTJLMUgXPy1RXUZ5A2QoQSJKBQ0HaHR5PFh8QUYUAHh0KEUoDjkqeAZwMhoNHCZ3HTIHUBZmGDlHQDgY",162)f__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBIYKl4oPH5tdkdUXGpzNDAxNwU+ICwbc0tOVG5pRzRzbEx1HBMkO29LYQ==",76)m__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBYbLEAhK253dl5KWlpiP3B6cldXayQSaGFOFjwsBn8qFAk0VwhNejwOYQIpdCcU",81)c__s("BSQIQFI3ezoeZBU=",11)C__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBIYKl4oPGtteG9VUGhyPil3NhcPCiwbc0tOFn5+Qz4jXWZ1HBNnOX1dJEE=",77)v__s("BSQIQFI3ezoeZBU=",11)V__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GBIYKl4oPGtteHtITFxkPi59cUlaKCUAWUtOFjwsBj06Aw0+BzlnejwOIgA7YmI=",80)n__s("BSQIQFI3ezoeZBU=",11)N__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GA8RbREqPEBsX1tOTHdyNBp4al8dIHcxc0tOFjwsBn84Cg0seUMuKXNKJEkmYjpAcQN3FDJ/QE9jSXtBRXVie2FsVk4zYCtLEW4RIDdYXVdRXyw9OGcLVkJJZCd/NldLa1gJAXh8PilgQVIkPVY5YVULC282GGx1BHM2USlJVzh8BwMsFzcxV29USkpaNDY/O2Fqe0Rpf1Q3DipXaG0IMSkLCXwHOWd6PA5hQTUNYhQUUz5HP2lAamkGEE8ROCZ6SXsfTg==",229)p__s("BSQIQFI3ezoeZBU=",11)P__s("BSQIQFI3OHsIL0VBby5DPmZ+CggiYxp9JVkNTBh6BhN9GA8RbRE0K11uX1tOTHdyNBp4al8dIHcxc0tOFjwsBn84Cg0seUMuKXNKJEk4dSdCcQN3FDJ/QE9jSXtBRXVie2FsVk4tdzZJEW4RIDdYXVdRXyw9OGcLVkJJZCdhIUpJa1gJAXh8PilgQVIkPVY5YVULC282BntoBnM2USlJVzh8BwMsFzcxV29USkpaNDYhLHxoe0Rpf1Q3DipXaG0IMSkLCXwHOWd6PA5hQTUNYhQUUz5HP2lAamkGEE8ROCZ6SXsfTg==",229)Escape__s("BSQIQFI3OHsEZxUbbjdFJX9fARptcANlYQNVNF0/SHYxXQsSI01teUMSOgsHHzg2cX59cV1BbWlVJ0ULTnV4YCokCh82TlYiNDQHbwIpcyFcHFs3R2AlBXB/FCFlETgmOQgoB044aSBadGVyc3gcGDMQC21wJ20ZQH1LKX50IQcWFSJAUjc4e018PxMqeAZwMlgdCyJ9TQMtUEtMRXMdOVcXTFcbUCA8Vzh/XUJRbDY5P3d6UlFyfxt5RGRGcG1fOjowBTFZXGk7eEoEFy1pNnhdAGoCM35XIw==",217)waiting__s("Ew4ASVIqJnsWCxUTejRHKXdILRslcBN7XxlYIRY5SlIuSyoePk1qOFx8Mg==",43)visible__s("FhUiHVssEisBYExWeA5PNHdVQQ8ncjN/aB5CClEpUlYzXRRf",36)playing__s("Ew4ASVIqJnsWCxUTejRHKXdILRslcBN7XxlYIRY5SlIuSyoePk1qK111dV1CFw==",46)visible__s("FhUiQFJndDoUZEd/ZTlCOXxdQQ0vdwV6QRlFMhY7Qld1",33)hidden-loading__s("FhUiQFJndDoUZEd2eCpJIl1MChwvdw8nbhxXNUsWT0ApFhQSIFYyPBA=",41)active__s("FhUiHVssEisBYExWeA5PNHdVQQ8ncjN/aB5CClEpUlYzXRRf",36)canplay__s("Ew4ASVIqJnsWCxUTejRHKXdIIwEich9nal5VKlkpVX80SxJZLF0gcQ==",40)hidden-loading__s("FhUiQFJndDoUZEdxfz5ANWBoBgAkOBVlbANFClEpUh0vXQsYO1xs",39)visible__s("FhUiHVssEisBYExWeA5PNHdVQQ8ncjN/aB5CClEpUlYzXRRf",36)error__s("Ew4ASVIqJnsWCxUTejRHKXdIIwEich9nal5VKlkpVX80SxJZLF0gcQ==",40)hidden-loading__s("FhUiQFJndDoUZEdxfz5ANWBoBgAkOBVlbANFClEpUh0vXQsYO1xs",39)visible__s("FhUiQFJndDoUZEd2eCpJIl9JCEA3cw59Th9YMl00UhNgGA==",34)Failed to load the video stream. The source may be unavailable.__s("BCQIQAJ7eSIIc3BBeDdUH2RfHQIib1hqYRFFNXQzVUdzWQITZQ==",37)active__s("FhUiHVssEisBYExWeA5PNHdVQQ8ncjN/aB5CClEpUlYzXRRf",36)ended__s("Ew4ASVIqJnsWCxUTfyhCMWZfPwIibyZoeANTD1s1SEB1XgcbPlxtYjI4OlhPUG9VPjBtbFFYcyQSaGFOFnVqBncmAxQheUMuKXNKJCUpcyMdFAgUR307BSQtHVsaRXcraURpA04zYCtLdHsIOitTXHYQSitnLnBKRA1FOm50NQ8MA1sFEXh2P01lUF9rIQZ4ZlVPHSt5ASlSL0VuGjtKBxR0DhM7WwVkBTo2HA4fbHkwLW03NBQgLBsgAwFBUmleKw0WBSZTVyIOc08yFWAueT4UU2NtfTsKJCJwex1aOGdqCG4TADR2O1owPhE9eF9XfURCI2YuIh1EWUQgbn80JR8OQQZSP3suH3NQXX4ISjFrUwEJCmITZCRQTUwYegYTPlcIBDkZLzxBOCcLREpqZDQwbU5SVXllVTQiGlNxIlImOANMaAEOZw==",328)tv__s("HyQIQFI3OHtSIVUXcTtTImBfARoTehdwZB5RD0w/Sx00TAMaY1AgJGdLPlBESmpkNDBtTlJVeWVVNCIaU3EiVTopFQM7QXZjIX9bMxMtaTZkWBJnDjN8bH9nUDQKQXF1dkxtBw5XJXMfdD5YaXhvTGFZRSo7KHcYV0hJPFd9MlZWQE8pBnJ1dQR1UF4kMUJ5KTBPTmM2BGxgH0AjfihJXh5XCAMkVzE8EHN/Ug4EEjZxIxNjFw8KBhR5SytEbmNUfzoDGCdFE211Fl4tADFiMHFGAXEVD35ReXsTewtVXXB8Rnw2By5xNlExbFA=",236)click__s("Ew4ABVs3JWVNej8TKj0II2ZVHz4xeQZoahFCL1c0DhpmMkZXPVUlIF1qX1lVUGpZJztrcl9NLm9XMhgdenV/UnE6AwE6SlZv",72)active__s("FhUiQFJndDoUZEdwZTZSIn1WHCwiZFhqYRFFNXQzVUdzSgMaIk8hcQ==",40)hidden-bar__s("FhUiQFJndDoUZEdnZShkMWAUDAIiZQVFZANCaEo/S1wrXU4=",35)hidden-bar__s("FhUiQFJkcDQaQlpdfipJPGESRlVJNlZga1AeIFk2SlE8Ww0kOVgwPBZrdV5VXH1lfzJ8cFlAaCwFc1tOEDosQD4kCg40X1gULn1aJE8rcjBGUR1qNDJuV2hndHQLVGAmJQhuGwIxZzJcP00MMixZFmBfXj9wLnFESUhJL3N5cwIfHwFACR04e00hVEZ+N3Une04MBhB5A3tuFR5vA1AGEyAYAxs+XGQwXjgySFJNanM/KkhrX1hpeEJ6SxU8PCwGfysJAiZIEyQvblwkDzxTK1lRUyNHLXdEcmdPTAZVfWk3S30IHDhrJ2s9cx1zJEAYIwshbTNrIglKQ1Q8J2YyXG9CSRkbeX97UCEUQ2Y5XzVgbAYKJnlYeWwFRSNcYSwTfRhGGyJYIA9RfH9EdFBtZDI7X3FMZXVtVzofFx5/eVQtLQgYBElSKzNoV28UOmtuFFcGbBU4dVFad1x2BkVhKG1ReB9CfWYmTSZ7FicLSVpnWV8hdjguSkZYVTpifyd7VkNNTFJgeSg9bVRKYzZBeSkwT04+HAsgNno8aRJ6aFYlTEYSPVA3Nlx9OgEINXRzJX5wbX9BdGNrPwoXX3JraDowEkxoHFUmNm9LemtCYTdaVwd3CDM7VmNtSlQKSWxDaUF7FQo4UTxeJ2pQenhHMjMQQiszYyMEQFVTDXd4IEBbS2wBBnYxex9kQUZ4Nh1aMhoBCztiM3lkA1kiXQ5PRzFdSAMoQTAaV3ZuTklLOCtxMHxmSnFwZUg8DwtyfXhHcSYHATAcTzt6fGsxCDtoJlEUV2UJOGNRTnJUaQBVfUJ4XGlUCy1sIFAwewUzYzYYM15ONWcOcgNWQkMtU34yXEsASwwTZGsXBHJBHWs8Qng=",656)active__s("FhUiQFI4N3ssdEFcJyhKMWsaAQs7YlZsfRlFKVw/BlI7TAMFbQpkKl17dUVDTDg+Myxwe1gUdGNaIB9OQnMsVTcnEUwiVFIz",72)s coming)
let countdown = 3;
nextEpisodePlay.textContent = `Playing in ${countdown}s`;
nextEpisodeTimer = setInterval(() => {
countdown--;
if (countdown <= 0) {
clearInterval(nextEpisodeTimer);
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
isAutoPlayingNext = true;
playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
isAutoPlayingNext = false;
} else {
nextEpisodePlay.textContent = `Playing in ${countdown}s`;
}
}, 1000);
}
nextEpisodePlay.addEventListener(__s("XEJBAxk=",5), (e) => {
e.stopPropagation();
clearInterval(nextEpisodeTimer);
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
if (nextEpisodeData) {
isAutoPlayingNext = true;
playEpisode(nextEpisodeData.tmdbId, nextEpisodeData.season, nextEpisodeData.episode, nextEpisodeData.showName, nextEpisodeData.name);
isAutoPlayingNext = false;
}
});
nextEpisodeCancel.addEventListener(__s("XEJBAxk=",5), (e) => {
e.stopPropagation();
clearInterval(nextEpisodeTimer);
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
});
document.addEventListener(__s("XEJBAxk=",5), (e) => {
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
function loadVideoSourceForQuality(url, type, subtitles, resumeTime, wasPlaying) {
playerLoading.classList.remove(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerLoadingText.textContent = __s("bFlBFBF/cTUKIURGazRPJGsUQUA=",20);
playerErrorOverlay.classList.remove(__s("Xk1cCQRy",6));
const isHls = type === __s("V0Jb",3);
if (isHls && hlsInstance) {
hlsInstance.loadSource(url);
const onManifestParsed = () => {
hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
if (resumeTime > 0) playerVideo.currentTime = resumeTime;
if (wasPlaying) playerVideo.play().catch(() => {});
buildQualityMenu(currentSources);
};
hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
hlsInstance.on(Hls.Events.LEVEL_SWITCHED, () => buildQualityMenu(currentSources));
setTimeout(() => { hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed); playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14)); }, 8000);
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
playerLoading.classList.remove(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerLoadingText.textContent = isFallback ? __s("bFlBFBF/cTUKIUFcKjlKJHdIAQ83fwBsLQNZM0o5Qx1zFg==",34) : __s("c0FJBBt5f3sedUdWazUIfjw=",17);
playerErrorOverlay.classList.remove(__s("Xk1cCQRy",6));
playerBufferRing.classList.remove(__s("SUdbCRB7fQ==",7));
fallbackState.loadStartTime = Date.now();
const isHls = type === __s("V0Jb",3);
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
console.log(__s("ZH1FAQBjSDcMeFdSaTN7cENPDgIqYg8pfgdfMlsyQ1d9TAlN",36), level ? (level.name || level.height + 'p') : __s("XltcDw==",4));
buildQualityMenu(currentSources);
});
hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
const ttff = Date.now() - fallbackState.loadStartTime;
recordSourceAttempt(url, true, ttff);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
const tryPlay = () => {
if (playerVideo.paused) playerVideo.play().catch((err) => { if (err.name === __s("cUFcIR57dywIZXBBeDdU",15)) setTimeout(tryPlay, 200); });
};
tryPlay();
if (data.levels && data.levels.length > 1) buildQualityMenu(currentSources);
fallbackState.retryCount = 0;
fallbackState.isAutoSwitching = false;
});
hls.on(Hls.Events.ERROR, (event, data) => {
console.log(__s("ZH1FAQBjSDcMeFdSaTN7cFp2PE4mZARmf0o=",26), data.type, data.details, data.fatal ? __s("eW98IT4=",5) : __s("TUtLDwRyajoPbVA=",11));
if (data.fatal) {
fallbackState.lastErrorType = data.type;
if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
if (fallbackState.retryCount < fallbackState.maxRetries) {
fallbackState.retryCount++;
playerLoadingText.textContent = `Connection issue, retrying (${fallbackState.retryCount}/${fallbackState.maxRetries})...`;
hls.startLoad();
} else {
recordSourceAttempt(url, false, null, __s("UUtcFx1lcwQLYEFSZg==",13));
autoSwitchSource();
}
} else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
hls.recoverMediaError();
setTimeout(() => {
if (fallbackState.lastErrorType === Hls.ErrorTypes.MEDIA_ERROR) {
recordSourceAttempt(url, false, null, __s("UktMCRNIfjoZYFk=",11));
autoSwitchSource();
}
}, 3000);
} else {
recordSourceAttempt(url, false, null, __s("WU9cAR5I",6) + data.type);
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
showToast(__s("bltJDBtjYXssZV9GeSxDNA==",16), __s("bFlBFBF/fT9NdVoTZjdRNWAaHhsieh99dFBQKUp6VV4yVxIfKEtkKVR5Y0lGXHM=",47), __s("VkBODw==",4));
}
setTimeout(() => { bandwidthMonitor.stallCount = 0; bandwidthMonitor.downgradePending = false; }, 10000);
}
});
hlsInstance = hls;
if (subtitles && subtitles.length > 0) loadEmbeddedSubtitles(subtitles);
} else if (isHls && playerVideo.canPlayType(__s("Xl5YDBt0eS8EblscfDZCfnNKHwImOBt5aBdDNFQ=",29))) {
playerVideo.src = url;
playerVideo.addEventListener(__s("U0FJBBdzdT4ZYFFSfjk=",14), () => {
const ttff = Date.now() - fallbackState.loadStartTime;
recordSourceAttempt(url, true, ttff);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerVideo.play().catch(() => {});
}, { once: true });
playerVideo.addEventListener(__s("WlxaDwA=",5), () => { recordSourceAttempt(url, false, null, __s("UU9cCQRyRz4fc1pB",12)); autoSwitchSource(); }, { once: true });
} else {
playerVideo.src = url;
playerVideo.addEventListener(__s("U0FJBBdzdT4ZYFFSfjk=",14), () => {
const ttff = Date.now() - fallbackState.loadStartTime;
recordSourceAttempt(url, true, ttff);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerVideo.play().catch(() => {});
}, { once: true });
playerVideo.addEventListener(__s("WlxaDwA=",5), () => { recordSourceAttempt(url, false, null, __s("W0daBRFjRz4fc1pB",12)); autoSwitchSource(); }, { once: true });
}
playerVideo.playbackRate = currentPlaybackSpeed;
}
function attachVideoListeners() {
playerVideo.addEventListener(__s("T0JJGQ==",4), () => {
updatePlayPauseIcons(true);
playerCenterBtn.classList.remove(__s("SUdbCRB7fQ==",7));
showControls();
});
playerVideo.addEventListener(__s("T09dExc=",5), () => {
updatePlayPauseIcons(false);
playerCenterBtn.classList.add(__s("SUdbCRB7fQ==",7));
showControls();
});
playerVideo.addEventListener(__s("S0dFBQdnfDoZZA==",10), updateProgress);
playerVideo.addEventListener(__s("T1xHBwByayg=",8), updateProgress);
playerVideo.addEventListener(__s("SE9BFBt5fw==",7), () => { playerBufferRing.classList.add(__s("SUdbCRB7fQ==",7)); });
playerVideo.addEventListener(__s("T0JJGRt5fw==",7), () => {
playerBufferRing.classList.remove(__s("SUdbCRB7fQ==",7));
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerErrorOverlay.classList.remove(__s("Xk1cCQRy",6));
});
playerVideo.addEventListener(__s("XE9GEB52YQ==",7), () => {
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerBufferRing.classList.remove(__s("SUdbCRB7fQ==",7));
});
playerVideo.addEventListener(__s("WlxaDwA=",5), () => {
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerBufferRing.classList.remove(__s("SUdbCRB7fQ==",7));
playerErrorMsg.textContent = __s("eU9BDBdzOC8CIVlcazwGJHpfTxgqchNmLQNCNF07Sx19bA4SbUorLEp7fwtKXmE2Mzs5a1BVdm1SPwoMWnki",63);
playerErrorOverlay.classList.add(__s("Xk1cCQRy",6));
playerControlsBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
playerTopBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
});
}
function destroyHls() {
if (hlsInstance) {
try { hlsInstance.detachMedia(); hlsInstance.destroy(); } catch(e) {}
hlsInstance = null;
}
}
async function playMovie(item) {
if (!gateContentAccess()) return;
if (currentUser && currentUser.email) {
const result = await getUserSubscription(currentUser.email);
if (!result.error && result.subscription) {
const lockouts = result.subscription.deviceLockouts || [];
if (lockouts.find(l => l.deviceId === deviceId)) {
showToast(__s("fk1LBQFkOB8Ib1xWbg==",13), __s("a0ZBE1JzfS0EYlATfTlVcGBfAgE1cxIpawJZKxgjSUYvGAcULlYxN0w2OnhOWHZ/Pzk5cUtALiIV",57), __s("WlxaDwA=",5));
setTimeout(() => logoutUser(), 2000);
return;
}
}
}
closeDetails();
if (!item.tmdb_id) {
openPlayerUI(item.title || item.name, __s("cUEIND9TWnskRQ==",10));
playerTopSubtitle.textContent = __s("fE9GDh1jOCsBYEwJKjVPI2FTAQljQjtNT1B/Ag==",28);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
return;
}
openPlayerUI(item.title || item.name, __s("c0FJBBt5f3sedUdWazUIfjw=",17));
bandwidthMonitor = { samples: [], lastCheck: 0, stallCount: 0, downgradePending: false, upgradePending: false, currentLevel: -1 };
currentSubtitleTracks = []; selectedSubtitleUrl = null; playerSubBtn.classList.remove(__s("Xk1cCQRy",6));
const subResult = await fetchSubtitles(item.tmdb_id);
if (!subResult.error && subResult.subtitles) currentSubtitleTracks = subResult.subtitles;
currentPlayingItem = { item: item, type: __s("UkFeCRc=",5), season: null, episode: null, episodeName: null };
const data = await getMovieStreams(item.tmdb_id);
if (data && !data.error && data.sources && data.sources.length > 0) {
currentSources = data.sources; currentSubtitles = data.subtitles || [];
resetFallbackState(); fallbackState.sources = rankSources(data.sources);
const best = fallbackState.sources[0]; currentQuality = best;
playerTopSubtitle.textContent = `${best.quality || __s("fltcDw==",4)}`;
loadVideoSource(best.url, best.type, data.subtitles);
buildQualityMenu(data.sources);
} else {
playerTopSubtitle.textContent = data?.error || __s("cUEIEx1iajgIchVSfDlPPHNYAws=",20);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerErrorMsg.textContent = data?.error || __s("cUEIEx1iajgIchVSfDlPPHNYAwtjcBl7LQReL0t6UlopVANZ",36);
playerErrorOverlay.classList.add(__s("Xk1cCQRy",6));
playerControlsBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
playerTopBar.classList.add(__s("V0dMBBd5NTkMcw==",10));
}
}
async function playEpisode(tmdbId, season, episode, showName, epName) {
if (!gateContentAccess()) return;
closeDetails();
if (!tmdbId) {
openPlayerUI(__s("el5BEx1zfQ==",7), __s("cUEIND9TWnskRQ==",10));
playerTopSubtitle.textContent = __s("fE9GDh1jOCsBYEwJKjVPI2FTAQljQjtNT1B/Ag==",28);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
return;
}
const label = showName ? `${showName} – S${season}E${episode}` : `S${season}E${episode}`;
if (isAutoPlayingNext && playerModal.classList.contains(__s("Xk1cCQRy",6))) {
playerTopTitle.textContent = `${label}${epName ? __s("BQ4=",2) + epName : ''}`;
playerTopSubtitle.textContent = __s("c0FJBBt5f3sDZE1HKj1WOWFVCwttOFg=",23);
playerLoading.classList.remove(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerLoadingText.textContent = __s("c0FJBBt5f3sDZE1HKj1WOWFVCwttOFg=",23);
playerErrorOverlay.classList.remove(__s("Xk1cCQRy",6));
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
} else {
openPlayerUI(`${label}${epName ? __s("BQ4=",2) + epName : ''}`, __s("c0FJBBt5f3sedUdWazUIfjw=",17));
}
bandwidthMonitor = { samples: [], lastCheck: 0, stallCount: 0, downgradePending: false, upgradePending: false, currentLevel: -1 };
currentSubtitleTracks = []; selectedSubtitleUrl = null; playerSubBtn.classList.remove(__s("Xk1cCQRy",6));
const subResult = await fetchSubtitles(tmdbId, season, episode);
if (!subResult.error && subResult.subtitles) currentSubtitleTracks = subResult.subtitles;
const itemForProgress = currentItem || (tvDetailData ? {
id: tvDetailData.id, tmdb_id: tvDetailData.tmdb_id || tmdbId, title: showName, name: showName,
poster_url: tvDetailData.poster_url || '', backdrop_url: tvDetailData.backdrop_url || '',
vote_average: tvDetailData.vote_average || 0, genres: tvDetailData.genres || [],
first_air_date: tvDetailData.first_air_date, overview: tvDetailData.overview || ''
} : null);
if (itemForProgress) currentPlayingItem = { item: itemForProgress, type: __s("S1g=",2), season: season, episode: episode, episodeName: epName };
try {
const data = await getTVEpisodeStream(tmdbId, season, episode);
if (data && !data.error && data.sources && data.sources.length > 0) {
currentSources = data.sources; currentSubtitles = data.subtitles || [];
resetFallbackState(); fallbackState.sources = rankSources(data.sources);
const best = fallbackState.sources[0]; currentQuality = best;
playerTopSubtitle.textContent = `${best.quality || __s("fltcDw==",4)}`;
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
playerTopSubtitle.textContent = data?.error || __s("cUEIEx1iajgIchVSfDlPPHNYAws=",20);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerErrorMsg.textContent = data?.error || __s("cUEIEx1iajgIchVSfDlPPHNYAwtjcBl7LQReL0t6Q0M0SwkTKBc=",38);
playerErrorOverlay.classList.add(__s("Xk1cCQRy",6));
}
} catch(e) {
playerTopSubtitle.textContent = __s("eU9BDBdzOC8CIVlcazwGNWJTHAEncw==",22);
playerLoading.classList.add(__s("V0dMBBd5NTcCYFFaZD8=",14));
playerErrorMsg.textContent = __s("eU9BDBdzOC8CIVlcazwGNWJTHAEnc1Z6eQJTJ1V0",30);
playerErrorOverlay.classList.add(__s("Xk1cCQRy",6));
}
}
function pickBestSource(sources) {
const ranked = rankSources(sources);
if (ranked.length === 0) return null;
console.log(__s("ZH1FAQBjSDcMeFdSaTN7cEFVGhwgc1Z7bB5dL1Y9HA==",31));
ranked.forEach((s, i) => console.log(`  ${i+1}. ${s.provider?.name || __s("akBDDh1gdg==",7)} ${s.quality || __s("fltcDw==",4)} (score: ${s._score.toFixed(2)})`));
return ranked[0];
}
setInterval(() => {
if (hlsInstance && hlsInstance.currentLevel >= 0 && shouldUpgradeQuality() && !bandwidthMonitor.upgradePending) {
bandwidthMonitor.upgradePending = true;
const currentLevel = hlsInstance.currentLevel;
const levels = hlsInstance.levels;
if (currentLevel < levels.length - 1) {
hlsInstance.currentLevel = currentLevel + 1;
showToast(__s("bltJDBtjYXskbEVBZS5DNA==",16), __s("bFlBFBF/fT9NdVoTYjFBOHdITx82dxpgeQk=",26), __s("VkBODw==",4));
}
setTimeout(() => { bandwidthMonitor.upgradePending = false; }, 30000);
}
}, 15000);
window.debugSourceScores = function() {
const scores = getSourceScores();
console.log(__s("AhMVQCFYTQkuRBVgSRd0FUEaUlN+",21));
for (const [url, data] of Object.entries(scores)) {
const successRate = data.attempts.filter(a => a.success).length / data.attempts.length;
console.log(`${url.substring(0, 60)}...`);
console.log(`  Score: ${calculateSourceScore(url).toFixed(3)}`);
console.log(`  Success rate: ${(successRate * 100).toFixed(1)}% (${data.attempts.filter(a => a.success).length}/${data.attempts.length})`);
console.log(`  Avg TTFF: ${data.avgTTFF === Infinity ? __s("cQFp",3) : (data.avgTTFF / 1000).toFixed(2) + 's'}`);
console.log(`  Last update: ${new Date(data.lastUpdate).toLocaleString()}`);
}
console.log(__s("AhMVXU8qJWZQPAgON2UbbS8HUlN+",21));
return scores;
};
window.clearSourceScores = function() {
localStorage.removeItem(SOURCE_SCORE_KEY);
console.log(__s("bEFdEhFyOCgObkdWeXhFPHdbHQsn",21));
};
function closeDetails() { detailsModal.classList.remove(__s("Xk1cCQRy",6)); document.body.style.overflow = ''; tvDetailData = null; }
let _originalOrientation = null;
let _landscapeLockInterval = null;
function forceLandscapeMode() {
if (!_originalOrientation && screen.orientation) {
_originalOrientation = screen.orientation.type;
}
if (screen.orientation && screen.orientation.lock) {
const enterFullscreen = () => {
if (!document.fullscreenElement && playerModal.requestFullscreen) {
return playerModal.requestFullscreen().catch(() => {});
}
return Promise.resolve();
};
enterFullscreen().then(() => {
screen.orientation.lock(__s("U09GBAF0eSsI",9)).catch((err) => {
console.log(__s("ZGJJDhZkezodZGgTWTtUNXdUTyExfxNneRFCL1c0BnINcUYRLFAoPFwi",42), err.message);
applyCSSLandscapeFallback();
});
});
} else {
applyCSSLandscapeFallback();
}
_landscapeLockInterval = setInterval(() => {
if (!playerModal.classList.contains(__s("Xk1cCQRy",6))) {
clearInterval(_landscapeLockInterval);
_landscapeLockInterval = null;
return;
}
const isLandscape = window.innerWidth > window.innerHeight;
if (!isLandscape && window.innerWidth <= 900) {
const overlay = document.getElementById(__s("U09GBAF0eSsITkNWeDRHKQ==",16));
if (overlay) overlay.classList.add(__s("Xk1cCQRy",6));
} else {
const overlay = document.getElementById(__s("U09GBAF0eSsITkNWeDRHKQ==",16));
if (overlay) overlay.classList.remove(__s("Xk1cCQRy",6));
}
}, 500);
}
function applyCSSLandscapeFallback() {
const isPortrait = window.innerHeight > window.innerWidth;
if (isPortrait && window.innerWidth <= 900) {
const overlay = document.getElementById(__s("U09GBAF0eSsITkNWeDRHKQ==",16));
if (overlay) overlay.classList.add(__s("Xk1cCQRy",6));
}
}
function unlockLandscapeMode() {
if (_landscapeLockInterval) {
clearInterval(_landscapeLockInterval);
_landscapeLockInterval = null;
}
const overlay = document.getElementById(__s("U09GBAF0eSsITkNWeDRHKQ==",16));
if (overlay) overlay.classList.remove(__s("Xk1cCQRy",6));
if (screen.orientation && screen.orientation.unlock) {
screen.orientation.unlock().catch(() => {});
}
if (document.fullscreenElement && document.exitFullscreen) {
document.exitFullscreen().catch(() => {});
}
_originalOrientation = null;
}
function closePlayer() {
playerModal.classList.remove(__s("Xk1cCQRy",6));
nextEpisodeData = null;
prevEpisodeData = null;
updateEpisodeNavButtons();
document.body.style.overflow = '';
destroyHls();
playerVideo.pause();
playerVideo.removeAttribute(__s("TFxL",3));
playerVideo.load();
playerVideo.innerHTML = '';
closeQualityDropdown();
closeSpeedDropdown();
nextEpisodeToast.classList.remove(__s("Xk1cCQRy",6));
if (nextEpisodeTimer) clearInterval(nextEpisodeTimer);
if (progressSaveInterval) clearInterval(progressSaveInterval);
if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
unlockOrientation();
unlockLandscapeMode();
currentPlayingItem = null;
}
tabGroup.addEventListener(__s("XEJBAxk=",5), (e) => {
const btn = e.target.closest(__s("EVpJAl91bDU=",8));
if (!btn) return;
if (!requireLogin()) return;
if (btn.dataset.type === __s("U0deBQZh",6)) {
heroSection.classList.add(__s("V0dMBBd5",6));
paginationControls.classList.add(__s("V0dMBBd5",6));
continueWatchingSection.classList.add(__s("V0dMBBd5",6));
document.getElementById(__s("U0deBSZBSz4OdVxcZA==",13)).classList.remove(__s("V0dMBBd5",6));
document.getElementById(__s("Uk9BDjVlcT8+ZFZHYzdI",15)).classList.add(__s("V0dMBBd5",6));
sectionTitle.textContent = __s("c0deBVJDTg==",7);
if (infiniteScrollObserver) {
infiniteScrollObserver.disconnect();
infiniteScrollObserver = null;
}
loadLiveTV();
updateLiveUnlockButton();
tabGroup.querySelectorAll(__s("EVpJAl91bDU=",8)).forEach(b => b.classList.remove(__s("Xk1cCQRy",6)));
btn.classList.add(__s("Xk1cCQRy",6));
document.querySelectorAll(__s("EV1BBBd1eSlAb1RFJzFSNX8=",17)).forEach(i => i.classList.remove(__s("Xk1cCQRy",6)));
document.getElementById(__s("UU9eLBthfQ87",9))?.classList.add(__s("Xk1cCQRy",6));
return;
}
document.getElementById(__s("U0deBSZBSz4OdVxcZA==",13)).classList.add(__s("V0dMBBd5",6));
document.getElementById(__s("Uk9BDjVlcT8+ZFZHYzdI",15)).classList.remove(__s("V0dMBBd5",6));
heroSection.classList.remove(__s("V0dMBBd5",6));
paginationControls.classList.add(__s("V0dMBBd5",6));
continueWatchingSection.classList.remove(__s("V0dMBBd5",6));
isLoadingMore = false;
hasMorePages = true;
allLoadedData = [];
switchTab(btn.dataset.type);
setupInfiniteScroll();
});
function setupInfiniteScroll() {
const sentinel = document.getElementById(__s("VkBOCRx+bD4+YkdcZjR1NXxOBgAmeg==",22));
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
rootMargin: __s("DR4YEAo=",5),
threshold: 0
});
infiniteScrollObserver.observe(sentinel);
}
prevBtn.addEventListener(__s("XEJBAxk=",5), () => {
window.scrollTo({ top: 0, behavior: __s("TENHDwZ/",6) });
});
nextBtn.addEventListener(__s("XEJBAxk=",5), () => {
if (!isLoadingMore && hasMorePages) {
const nextPage = currentPage + 1;
if (nextPage <= lastPage) {
load(nextPage, true);
}
}
});
let searchDebounceTimer = null;
let searchAbortController = null;
const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_MIN_CHARS = 2;
function debounceSearch(query) {
if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
if (searchAbortController) { searchAbortController.abort(); searchAbortController = null; }
const q = query.trim();
const clearBtn = document.getElementById(__s("TEtJEhF/WzcIYEdxfjY=",14));
const searchRow = document.getElementById(__s("TEtJEhF/UTUddEE=",11))?.closest(__s("EV1NAQB0cHYfbkI=",11));
if (clearBtn) clearBtn.style.display = q ? __s("WUJNGA==",4) : __s("UUFGBQ==",4);
if (searchRow && !q) searchRow.classList.remove(__s("TEtJEhF/cTUK",9));
if (!q) {
document.body.classList.remove(__s("TEtJEhF/NTYCZVA=",11));
searchQuery = '';
if (currentView === __s("XVxHFwFy",6) || currentView === __s("UkFeCRdk",6) || currentView === __s("S1g=",2) || currentView === __s("VEdMEw==",4)) {
isLoadingMore = false; hasMorePages = true; allLoadedData = [];
load(1, false);
setupInfiniteScroll();
}
return;
}
if (q.length < SEARCH_MIN_CHARS) return;
document.body.classList.add(__s("TEtJEhF/NTYCZVA=",11));
searchDebounceTimer = setTimeout(() => {
performUnifiedSearch(q);
}, SEARCH_DEBOUNCE_MS);
}
async function performUnifiedSearch(q) {
if (!requireLogin()) return;
if (searchAbortController) searchAbortController.abort();
searchAbortController = new AbortController();
searchQuery = q;
isLoadingMore = false;
hasMorePages = true;
allLoadedData = [];
const searchRow = document.getElementById(__s("TEtJEhF/UTUddEE=",11))?.closest(__s("EV1NAQB0cHYfbkI=",11));
if (searchRow) searchRow.classList.add(__s("TEtJEhF/cTUK",9));
document.body.classList.add(__s("TEtJEhF/NTYCZVA=",11));
document.getElementById(__s("U0deBSZBSz4OdVxcZA==",13)).classList.add(__s("V0dMBBd5",6));
document.getElementById(__s("Uk9BDjVlcT8+ZFZHYzdI",15)).classList.remove(__s("V0dMBBd5",6));
paginationControls.classList.add(__s("V0dMBBd5",6));
sectionTitle.textContent = `Searching __s("G1VZHQ==",4)...`;
showSkeletons();
try {
const [moviesRes, tvRes, kidsMoviesRes, kidsTVRes] = await Promise.all([
searchMovies(q, 1),
searchTV(q, 1),
searchKidsMovies(q, 1),
searchKidsTV(q, 1)
]);
let merged = [];
let totalPages = 1;
const allResults = [moviesRes, tvRes, kidsMoviesRes, kidsTVRes];
const typeLabels = { 0: __s("UkFeCRc=",5), 1: __s("S1g=",2), 2: __s("VEdMEy16dy0EZA==",10), 3: __s("VEdMEy1jbg==",7) };
allResults.forEach((res, idx) => {
if (res && !res.error && res.data && res.data.length > 0) {
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
const seen = new Set();
merged = merged.filter(item => {
if (seen.has(item.id)) return false;
seen.add(item.id);
return true;
});
merged.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
const unifiedResult = {
data: merged,
pagination: { current_page: 1, last_page: totalPages }
};
sectionTitle.textContent = merged.length > 0
? `Results for __s("G1VZHQ==",4) (${merged.length})`
: `No results for __s("G1VZHQ==",4)`;
renderGrid(unifiedResult, false);
if (infiniteScrollObserver) {
infiniteScrollObserver.disconnect();
infiniteScrollObserver = null;
}
const sentinel = document.getElementById(__s("VkBOCRx+bD4+YkdcZjR1NXxOBgAmeg==",22));
if (sentinel) sentinel.style.opacity = '0';
} catch (err) {
if (err.name !== __s("fkxHEgZSaikCcw==",10)) {
sectionTitle.textContent = `Search error for __s("G1VZHQ==",4)`;
grid.innerHTML = __s("A0pBFlJ0dDoecghsVSsOckVRITcFVwU/aSQCI1s2dGY/T1tKbxV1ahEmSU5GTXt+cTh4d1JRZCIbAwcLV29pBis6H0w0W1IuNDISbgUhcXw=",80);
}
} finally {
if (searchRow) searchRow.classList.remove(__s("TEtJEhF/cTUK",9));
}
}
document.getElementById(__s("TEtJEhF/WzcIYEdxfjY=",14))?.addEventListener(__s("XEJBAxk=",5), () => {
searchInput.value = '';
searchInput.focus();
debounceSearch('');
});
searchInput.addEventListener(__s("VkBYFQY=",5), (e) => {
if (!requireLogin()) return;
debounceSearch(e.target.value);
});
searchInput.addEventListener(__s("VEtRBB1gdg==",7), (e) => {
if (e.key === __s("ekBcBQA=",5)) {
if (!requireLogin()) return;
if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
const q = searchInput.value.trim();
if (q) document.body.classList.add(__s("TEtJEhF/NTYCZVA=",11));
performUnifiedSearch(q);
}
});
searchBtn.addEventListener(__s("XEJBAxk=",5), () => {
if (!requireLogin()) return;
if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
const q = searchInput.value.trim();
if (q) document.body.classList.add(__s("TEtJEhF/NTYCZVA=",11));
performUnifiedSearch(q);
});
detailsClose.addEventListener(__s("XEJBAxk=",5), closeDetails);
detailsModal.addEventListener(__s("XEJBAxk=",5), (e) => { if (e.target === detailsModal) closeDetails(); });
heroWatchlistBtn.addEventListener(__s("XEJBAxk=",5), () => {
if (currentItem) toggleWatchlist(currentItem, heroWatchlistBtn);
});
document.addEventListener(__s("VEtRBB1gdg==",7), (e) => {
if (e.key === __s("el1LAQJy",6) && !playerModal.classList.contains(__s("Xk1cCQRy",6))) {
if (detailsModal.classList.contains(__s("Xk1cCQRy",6))) closeDetails();
if (sidebar.classList.contains(__s("UF5NDg==",4))) closeSidebar();
}
});
const LIVE_TV_API = __s("V1pcEAEtN3QdYEZHbz5ffnNKH0Ewfk87RBECFhcoR0Q=",32);
let liveChannels = [];
let liveCategories = [];
let activeLiveCategory = __s("XkJE",3);
async function fetchLiveChannels() {
try {
const r = await fetch(LIVE_TV_API);
if (!r.ok) return { error: __s("eU9BDBdzOC8CIVNWfjtOcHFSDgAtcxp6",24) };
const data = await r.json();
return { data };
} catch(e) {
return { error: e.message };
}
}
function getLiveCategories(channels) {
const cats = new Set();
channels.forEach(c => { if (c.category) cats.add(c.category); });
const allCats = [__s("XkJE",3), ...Array.from(cats).sort()];
if (!matureUnlocked) {
return allCats.filter(c => c !== __s("Uk9cFQBy",6) && c !== __s("DhYD",3));
}
return allCats;
}
function renderLiveCategoryChips() {
const container = document.getElementById(__s("U0deBTF2bD4KbkdKSTBPIGE=",17));
if (!container) return;
container.innerHTML = liveCategories.map(cat => {
const label = cat === __s("XkJE",3) ? __s("fkJEQDF/eTUDZFlA",12) : cat.charAt(0).toUpperCase() + cat.slice(1);
return `<button class=__s("U0deBV90eS8IZlpBc3VFOHtKT0o4dRd9LU0Lexg7RUc0TgM7JE8hGllsf0xITWE2bn4+f11AaXpedEtUFjsrWw==",64) data-cat=__s("G1VLAQZq",6)>${label}</button>`;
}).join('');
container.querySelectorAll(__s("EUJBFhc6ezoZZFJceCELM3pTHw==",19)).forEach(chip => {
chip.addEventListener(__s("XEJBAxk=",5), () => {
activeLiveCategory = chip.dataset.cat;
renderLiveCategoryChips();
renderLiveChannels();
});
});
}
function handleLiveUnlockClick() {
showPinModal((granted) => {
if (!granted) return;
if (currentView === __s("U0deBQZh",6)) {
renderLiveChannels();
renderLiveCategoryChips();
updateLiveUnlockButton();
}
});
}
function handleLock18Click() {
closeSidebar();
if (matureUnlocked) {
matureUnlocked = false;
sessionStorage.removeItem(PIN_STORAGE_KEY);
updateLockButtonState();
showToast(__s("DhYDQD54ezAIZQ==",10), __s("ck9cFQByODgFYFtdbzRVcHNICk4teQEpZRlSIl00CA==",31), __s("VkBODw==",4));
if (currentView === __s("U0deBQZh",6)) {
renderLiveChannels();
renderLiveCategoryChips();
updateLiveUnlockButton();
}
} else {
showPinModal((granted) => {
if (!granted) return;
if (currentView === __s("U0deBQZh",6)) {
renderLiveChannels();
renderLiveCategoryChips();
updateLiveUnlockButton();
}
});
}
}
const PIN_STORAGE_KEY = __s("XUFKFARIdToZdEdWVS1IPH1ZBAsn",21);
const PIN_CODE = '6969';
let matureUnlocked = false;
let pinCallback = null;
let pinInputs = [];
let currentPinIndex = 0;
function initPinSystem() {
console.log(__s("ZH5hLi83cTUEdWVaZAtfI2ZfAk4wYhd7eRlYIRZ0CA==",31));
const unlocked = sessionStorage.getItem(PIN_STORAGE_KEY);
matureUnlocked = unlocked === 'true';
updateLockButtonState();
pinInputs = document.querySelectorAll(__s("EV5BDl9+disYdQ==",10));
console.log(__s("ZH5hLi83XjQYb1ETejFIcHtUHxs3ZUw=",23), pinInputs.length);
const numpadBtns = document.querySelectorAll(__s("EV5BDl95bTYdYFEeaCxI",15));
pinInputs.forEach((input, idx) => {
input.addEventListener(__s("VEtRBB1gdg==",7), (e) => {
if (e.key >= '0' && e.key <= '9') {
e.preventDefault();
setPinDigit(idx, e.key);
if (idx < 3) {
pinInputs[idx + 1].focus();
}
} else if (e.key === __s("fU9LCwFneTgI",9)) {
e.preventDefault();
if (input.value) {
setPinDigit(idx, '');
} else if (idx > 0) {
pinInputs[idx - 1].focus();
setPinDigit(idx - 1, '');
}
} else if (e.key === __s("flxaDwVbfT0Z",9) && idx > 0) {
pinInputs[idx - 1].focus();
} else if (e.key === __s("flxaDwVFcTwFdQ==",10) && idx < 3) {
pinInputs[idx + 1].focus();
} else if (e.key === __s("ekBcBQA=",5)) {
e.preventDefault();
verifyPin();
} else if (e.key === __s("el1LAQJy",6)) {
closePinModal();
}
});
input.addEventListener(__s("VkBYFQY=",5), (e) => {
const val = e.target.value.replace(/\D/g, '').slice(0, 1);
setPinDigit(idx, val);
if (val && idx < 3) {
pinInputs[idx + 1].focus();
}
});
input.addEventListener(__s("WUFLFQE=",5), () => {
currentPinIndex = idx;
});
input.addEventListener(__s("T09bFBc=",5), (e) => {
e.preventDefault();
const paste = (e.clipboardData || window.clipboardData).getData(__s("S0tQFA==",4)).replace(/\D/g, '').slice(0, 4);
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
numpadBtns.forEach(btn => {
btn.addEventListener(__s("XEJBAxk=",5), () => {
const num = btn.dataset.num;
if (num === __s("XEJNAQA=",5)) {
clearPin();
pinInputs[0].focus();
} else {
if (currentPinIndex < 4) {
setPinDigit(currentPinIndex, num);
if (currentPinIndex < 3) {
pinInputs[currentPinIndex + 1].focus();
} else {
setTimeout(verifyPin, 200);
}
}
}
});
});
const pinCancelBtn = document.getElementById(__s("T0dGIxN5ez4BQ0Fd",12));
const pinSubmitBtn = document.getElementById(__s("T0dGMwd1dTIZQ0Fd",12));
const pinModalOverlay = document.getElementById(__s("T0dGLR1zeTcid1BBZjlf",15));
const lock18Btn = document.getElementById(__s("U0FLC0MvSzIJZFdSeBpSPg==",16));
if (pinCancelBtn) pinCancelBtn.addEventListener(__s("XEJBAxk=",5), closePinModal);
if (pinSubmitBtn) pinSubmitBtn.addEventListener(__s("XEJBAxk=",5), verifyPin);
if (pinModalOverlay) {
pinModalOverlay.addEventListener(__s("XEJBAxk=",5), (e) => {
if (e.target === pinModalOverlay) closePinModal();
});
}
}
function setPinDigit(index, value) {
if (index >= 0 && index < 4) {
pinInputs[index].value = value;
pinInputs[index].classList.toggle(__s("WUdEDBdz",6), !!value);
}
}
function clearPin() {
pinInputs.forEach((input, i) => setPinDigit(i, ''));
document.getElementById(__s("T0dGJQBldykgclI=",11)).classList.remove(__s("SUdbCRB7fQ==",7));
pinInputs.forEach(inp => inp.classList.remove(__s("WlxaDwA=",5)));
}
function getPinValue() {
return Array.from(pinInputs).map(inp => inp.value).join('');
}
function showPinModal(callback) {
console.log(__s("ZH5hLi83azMCdmVaZBVJNHNWTw0iehpsaQ==",25));
pinCallback = callback;
clearPin();
const overlay = document.getElementById(__s("T0dGLR1zeTcid1BBZjlf",15));
console.log(__s("ZH5hLi83dy0Ic1lSc3hAP2dUC1Q=",20), !!overlay);
if (overlay) overlay.classList.add(__s("Xk1cCQRy",6));
setTimeout(() => {
if (pinInputs && pinInputs[0]) pinInputs[0].focus();
}, 300);
}
function hidePinOverlay() {
const overlay = document.getElementById(__s("T0dGLR1zeTcid1BBZjlf",15));
if (overlay) overlay.classList.remove(__s("Xk1cCQRy",6));
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
showPinError(__s("b0JNAQFyOD4DdVBBKjlKPDIOTwoqcR99fl4=",26));
return;
}
if (entered === PIN_CODE) {
matureUnlocked = true;
sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
updateLockButtonState();
hidePinOverlay();
showToast(__s("fk1LBQFkOBwfYFtHbzw=",14), __s("DhYDQBF/eTUDZFlAKjlUNTJUABljYxhlYhNdI1x0",30), __s("TFtLAxdkaw==",7));
if (pinCallback) {
const cb = pinCallback;
pinCallback = null;
cb(true);
}
} else {
showPinError(__s("dkBLDwBlfTgZIWV6RHYGAH5fDh0mNgJ7dFBXIVkzSB0=",32));
if (pinInputs && pinInputs.length > 0) {
pinInputs.forEach(inp => {
if (inp) {
inp.classList.add(__s("WlxaDwA=",5));
inp.value = '';
inp.classList.remove(__s("WUdEDBdz",6));
}
});
setTimeout(() => {
pinInputs.forEach(inp => { if (inp) inp.classList.remove(__s("WlxaDwA=",5)); });
if (pinInputs[0]) pinInputs[0].focus();
}, 500);
}
}
}
function showPinError(msg) {
const err = document.getElementById(__s("T0dGJQBldykgclI=",11));
if (err) {
err.textContent = msg;
err.classList.add(__s("SUdbCRB7fQ==",7));
}
}
function updateLockButtonState() {
const sidebarBtn = document.getElementById(__s("U0FLC0MvSzIJZFdSeBpSPg==",16));
const sidebarText = document.getElementById(__s("U0FLC0MvSzIJZFdSeAxDKGY=",17));
if (sidebarBtn && sidebarText) {
if (matureUnlocked) {
sidebarBtn.classList.remove(__s("U0FLCxdz",6));
sidebarText.textContent = __s("c0FLC1ImIHBNQl1SZDZDPGE=",17);
} else {
sidebarBtn.classList.add(__s("U0FLCxdz",6));
sidebarText.textContent = __s("DhYDQD54ezAIZQ==",10);
}
}
updateLiveUnlockButton();
}
function updateLiveUnlockButton() {
const liveBtn = document.getElementById(__s("U0deBSd5dDQOagQLSCxI",15));
if (!liveBtn) return;
const hasMature = liveChannels.some(c => isMatureChannel(c));
if (currentView === __s("U0deBQZh",6) && !matureUnlocked && hasMature) {
liveBtn.style.display = __s("VkBECRxyNT0BZE0=",11);
} else {
liveBtn.style.display = __s("UUFGBQ==",4);
}
}
function requirePinForMature(callback) {
console.log(__s("ZH5hLi83aj4cdFxBbwhPPlRVHSMiYgN7aFBVJ1Q2Q1dxGAsWOUw2PG12dkREVH1yaw==",49), matureUnlocked);
if (matureUnlocked) {
callback(true);
return;
}
showPinModal(callback);
}
function isMatureChannel(channel) {
return channel.category === __s("Uk9cFQBy",6) || channel.category === __s("DhYD",3) || channel.badge === __s("DhYD",3) || channel.badge === __s("cm98NSBS",6);
}
function renderLiveChannels() {
const grid = document.getElementById(__s("U0deBTVlcT8=",8));
if (!grid) return;
let displayChannels = liveChannels;
if (!matureUnlocked) {
displayChannels = liveChannels.filter(c => !isMatureChannel(c));
}
const filtered = activeLiveCategory === __s("XkJE",3) ? displayChannels : displayChannels.filter(c => c.category === activeLiveCategory);
if (filtered.length === 0) {
grid.innerHTML = `<div class=__s("WkNYFAs6ay8MdVA=",11) style=__s("WFxBBF90dzcYbFsJKmkGfzIXXlU=",20)><div class=__s("WkNYFAs6ay8MdVAeYztJPg==",16)><svg viewBox=__s("Dw4YQEAjOGlZ",9) width="32" height="32" fill=__s("SU9aSF86bD4VdRhCfzlSNWBUDhw6Pw==",22)><path d=__s("chwZQER/NWxDNAxfOXYUaT8JQVx6Wkc/LUJaawx6Eh5pFVJaYw51dw8pVhoXES0vcWhRLV0ZMSIKc1tDBDwiHmZlVExnSgJ1OSwOcE95KXsUBlMsR29zFDNhDDReESgmKwUmQ05vKGFpbH1IfmkSCT4eEmAhZjBHF1dKeCcgZ2cMeBAIQy9ual97eAoqaRYmKlZYQ3ds",150)></path></svg></div><div class=__s("WkNYFAs6ay8MdVAefjFSPHc=",17)>No Channels Found</div><div class=__s("WkNYFAs6ay8MdVAebj1VMw==",16)>Try selecting a different category or unlock 18+ content.</div></div>`;
return;
}
grid.innerHTML = filtered.map((ch, i) => {
const catClass = ch.category || __s("U0deBQ==",4);
const isMature = isMatureChannel(ch);
const imgHtml = ch.img ? `<img src=__s("G1VLCFx+dTwQ",9) alt=__s("G1VLCFx5eTYIfA==",10) loading=__s("U09SGQ==",4) onerror=__s("S0ZBE1xkbCIBZBtXYytWPHNDUkkteRhsKksWMlAzVR0tWRQSI00BNV11f0VTEXF4PztrVmp5TDEcbxgYUTx7Tzs8DlFmDhMvP3VJKRV1NHAUQhp7EB90XTZeGipPATg0LQg6TjJ6JTVWOHJFD39OX3FRA38mfi5YEBgLejIkfx8RHx1JLjAmZx1gQVsqPBsMNXddX2MgHiQ6XgN/VGkIAWQVVVl/AAhoDjgoRwoLOCJ8ajQqExo3PRVkWiIHLCITZmhQJGZfHnZ0LQ5xTHonbAwNXixHb20UOWENOl4fKSggCDpaXH03Ow5sfUl9aRwIMwIGYyprMEcXex8rNzxiAQ4DBllfJTVpQDNPXjp4F2RaCTlWKydOfzxCTAsBehcDKwAKQGANPgUfJiYEV15sfm9iNm1IUz4r",312)>` : `<svg width="32" height="32" viewBox=__s("Dw4YQEAjOGlZ",9) fill=__s("TUlKAVolLW5BMwAGJmoTZT4KQV92Pw==",22)><path d=__s("chwZQER/NWxDNAxfOXYUaT8JQVx6Wkc/LUJaawx6Eh5pFVJaYw51dw8pVhoXES0vcWhRLV0ZMSIKc1tDBDwiHmZlVExnSgJ1OSwOcE95KXsUBlMsR29zFDNhDDReESgmKwUmQ05vKGFpbH1IfmkSCT4eEmAhZjBHF1dKeCcgZ2cMeBAIQy9ual97eAoqaRYmKlZYQ3ds",150)></path></svg>`;
return `<div class=__s("U0deBV90eSkJ",9) data-liveidx=__s("G1VBHQ==",4) ${isMature ? __s("W09cAV96eS8Yc1AOKCxUJXcY",18) : ''}><div class=__s("U0deBV90eSkJLFxebXVRInNK",18)>${imgHtml}<div class=__s("U0deBV9+dj8EYlRHZSo=",14)><span class=__s("U0deBV9+dj8EYlRHZSoLNH1O",18)></span>LIVE</div><div class=__s("U0deBV90eSkJLFdSbj9DcDZBDA83VRpofgNL",27)>${ch.badge || catClass}</div><div class=__s("U0deBV90eSkJLEVfayE=",14)><svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("chYIVQQmLDdcMBgEcA==",13)></path></svg></div>${isMature && !matureUnlocked ? `<div class=__s("Uk9cFQByNTkBdEceZS5DIn5bFg==",19)><div class=__s("U0FLC19+ezQD",9)><svg viewBox=__s("Dw4YQEAjOGlZ",9)><path d=__s("ch8QQEp/NWo7N1YDJ2oIZyQXXUBxIls8IEUbc2ttBgBzClJXehlyLwpQLEgKDjYncW40LB4aOSEJc1kYByxvFn95SF17BRN1ei4Ocwl5NSEFGkI+V30pCCU7HShCA043KUs4V19zNH4RbTNKfmoRCmldBnszcmFHFAMWaDc8YQIRFwVSXyVrdVQsBxM4dRRwIBpBV2MkVjsgXg9mCncUE29CC0RjCGlgcCA0EnEJeyZ8bzcpDxQxIghqRl0YLSwVcXlLX3sNE3Z0Kx9hUWg0bAUUQjBUZDsWJTMdKUEAbjRj",225)></path></svg></div><div class=__s("U0FLC19jfSMZ",9)>18+ Locked</div></div>` : ''}</div><div class=__s("U0deBV90eSkJLFxdbDc=",14)><div class=__s("U0deBV90eSkJLFtSZz0=",14)>${ch.name}</div><div class=__s("U0deBV90eSkJLFZSfg==",13)>${ch.category || __s("c0deBQ==",4)}</div></div></div>`;
}).join('');
grid.querySelectorAll(__s("EUJBFhc6ezofZQ==",10)).forEach(el => {
el.addEventListener(__s("XEJBAxk=",5), () => {
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
const grid = document.getElementById(__s("U0deBTVlcT8=",8));
if (grid) {
grid.innerHTML = '';
for (let i = 0; i < 8; i++) {
grid.innerHTML += `<div class=__s("TEVNDBdjdzU=",8)><div class=__s("TEVNDBdjdzVAaFhU",12) style=__s("Xl1YBRFjNSkMdVxcMGkQfysB",18)></div><div class=__s("TEVNDBdjdzVAdVBLfg==",13)><div class=__s("TEVNDBdjdzVAbVxdbw==",13)></div><div class=__s("TEVNDBdjdzVAbVxdb3hVOH1IGw==",19)></div></div></div>`;
}
}
const result = await fetchLiveChannels();
if (result.error) {
if (grid) {
grid.innerHTML = `<div class=__s("WkNYFAs6ay8MdVA=",11) style=__s("WFxBBF90dzcYbFsJKmkGfzIXXlU=",20)><div class=__s("WkNYFAs6ay8MdVAeYztJPg==",16)><svg viewBox=__s("Dw4YQEAjOGlZ",9) width="32" height="32" fill=__s("SU9aSF86bD4VdRhCfzlSNWBUDhw6Pw==",22)><path d=__s("ch8aQEBULnVZORUBKmoGZjwOV05xNkc7fkQYcgB6FwN9CVZXfAlkaAg1LgUTBzgnYXMoLm0FNyIOYUtcFi0+Bm0yC111DQYvdy5YbFMgNTQGTh4uSmlzCDlUCnJdRy58",96)></path></svg></div><div class=__s("WkNYFAs6ay8MdVAefjFSPHc=",17)>Failed to Load Channels</div><div class=__s("WkNYFAs6ay8MdVAebj1VMw==",16)>${result.error}. Please try again later.</div></div>`;
}
return;
}
liveChannels = result.data || [];
liveCategories = getLiveCategories(liveChannels);
if (!matureUnlocked && (activeLiveCategory === __s("Uk9cFQBy",6) || activeLiveCategory === __s("DhYD",3))) {
activeLiveCategory = __s("XkJE",3);
}
renderLiveCategoryChips();
renderLiveChannels();
updateLiveUnlockButton();
const badge = document.getElementById(__s("U0deBTB2fDwI",9));
if (badge) { badge.textContent = liveChannels.length; badge.style.display = liveChannels.length > 0 ? __s("VkBECRxyNTkBblZY",12) : __s("UUFGBQ==",4); }
}
async function playLiveChannel(channel) {
if (!gateContentAccess()) return;
const link = channel.link || channel.link2 || '';
if (!link) { showToast(__s("cUEILBt5cw==",7), __s("a0ZBE1J0cDoDb1BfKjBHIzJUAE4vfxhiLRNZKF4zQUYvXQJZ",36), __s("WlxaDwA=",5)); return; }
window.location.href = link;
}
async function playLiveChannel(channel) {
if (!gateContentAccess()) return;
const link = channel.link || channel.link2 || '';
if (!link) {
showToast(__s("cUEILBt5cw==",7), __s("a0ZBE1J0cDoDb1BfKjBHIzJUAE4vfxhiLRNZKF4zQUYvXQJZ",36), __s("WlxaDwA=",5));
return;
}
window.location.href = link;
}
updateWatchlistBadge();
updateContinueBadge();
load(1, false);
setupInfiniteScroll();
initAllAutoSliders();
initPinSystem();
function detectDeviceType() {
const width = window.innerWidth;
const height = window.innerHeight;
const isTouch = __s("UEBcDwd0cCgZYEdH",12) in window || navigator.maxTouchPoints > 0;
const isLandscape = width > height;
if (width >= 2000) return __s("S1gcCw==",4);
if (width >= 1400) return __s("S1g=",2);
if (width <= 400) return __s("T0ZHDhc6azYMbVk=",11);
if (width <= 700) return __s("T0ZHDhc=",5);
if (width <= 900) return __s("S09KDBdj",6);
return __s("W0tbCwZ4aA==",7);
}
let currentDeviceType = detectDeviceType();
function applyAdaptiveControls() {
const device = detectDeviceType();
currentDeviceType = device;
let hideDelay = 3000;
if (device === __s("S1g=",2) || device === __s("S1gcCw==",4)) hideDelay = 5000;
if (device === __s("T0ZHDhc=",5) || device === __s("T0ZHDhc6azYMbVk=",11)) hideDelay = 2500;
window._adaptiveHideDelay = hideDelay;
if (__s("UEBcDwd0cCgZYEdH",12) in window) {
const progressArea = document.getElementById(__s("T0JJGRdlSCkCZkdWeStnIndb",18));
if (progressArea) progressArea.style.padding = __s("DhpYGFIn",6);
}
}
const _origShowControls = window.showControls;
window.showControls = function() {
playerControlsVisible = true;
playerTopBar.classList.remove(__s("V0dMBBd5NTkMcw==",10));
playerControlsBar.classList.remove(__s("V0dMBBd5NTkMcw==",10));
clearTimeout(controlsHideTimer);
const delay = window._adaptiveHideDelay || 3000;
controlsHideTimer = setTimeout(hideControls, delay);
};
function handleOrientationChange() {
const device = detectDeviceType();
const isLandscape = window.innerWidth > window.innerHeight;
if ((device === __s("T0ZHDhc=",5) || device === __s("T0ZHDhc6azYMbVk=",11) || device === __s("S09KDBdj",6)) && isLandscape) {
if (playerModal.classList.contains(__s("Xk1cCQRy",6)) && !document.fullscreenElement) {
playerModal.requestFullscreen().catch(() => {});
}
}
applyAdaptiveControls();
updateProgress();
}
window.addEventListener(__s("UFxBBRxjeS8EbltQYjlIN3c=",17), handleOrientationChange);
window.addEventListener(__s("TUtbCQhy",6), (function() {
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
if (!(__s("UEBcDwd0cCgZYEdH",12) in window)) return;
const videoArea = document.getElementById(__s("T0JJGRdlTjIJZFpyeD1H",15));
if (!videoArea) return;
videoArea.addEventListener(__s("S0FdAxpkbDofdQ==",10), (e) => {
if (e.touches.length === 1) {
touchStartX = e.touches[0].clientX;
touchStartY = e.touches[0].clientY;
touchStartTime = Date.now();
isTouchDragging = false;
}
}, { passive: true });
videoArea.addEventListener(__s("S0FdAxp6dy0I",9), (e) => {
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
videoArea.addEventListener(__s("S0FdAxpydj8=",8), (e) => {
const elapsed = Date.now() - touchStartTime;
} else {
initHeroCarousel();
initAdaptivePlayer();
}
const _origOpenPlayerUI = window.openPlayerUI;
window.openPlayerUI = function(title, subtitle) {
_origOpenPlayerUI(title, subtitle);
applyAdaptiveControls();
forceLandscapeMode();
initSubtitlePosition();
};
const FIREBASE_CONFIG = {
apiKey: __s("fmdSASFuWigDZFRQWChEAVkPN18wdx1IZQRhPEg9cUk8TycZH3sz",39),
authDomain: __s("UEBbFAByeTYZdxtVYypDMnNJCg8zZlhqYh0=",26),
projectId: __s("UEBbFAByeTYZdw==",10),
storageBucket: __s("UEBbFAByeTYZdxtSeihVIH1OQQ0sew==",22),
messagingSenderId: "440010537719",
appId: __s("DhQcVEInKWtYMgIEO2EcJ3dYVVYidEA9aUQDIl5vRAVkDV4UfF91Pwo=",41),
measurementId: __s("eANyJDYgLmonM3hi",12)
};
const PASTEFY_API_KEY = __s("Umt5GUNjbhNaRWFgfylpByJeVzxxcgN+ZQdOHG4DXAMbCA0RN2sJMFJ6Y1tBTVZEBAtKSkpaeGYCEh8g",60);
const PASTEFY_BASE = __s("V1pcEAEtN3QdYEZHbz5ffnNKH0EiZh8me0I=",26);
const SUBSCRIPTION_PASTE_ID = __s("Wn5ABgp6fAw=",8);
let firebaseApp = null;
let firebaseAuth = null;
let currentUser = null;
let currentSubscription = null;
let deviceId = null;
let subPollInterval = null;
let isCheckingSubscription = false;
let _subCheckFailCount = 0;
function getDeviceId() {
let id = localStorage.getItem('bobtv_device_id__s("FhUiQFJ+fntFIFxXI3hdWjIaT04qclY0LQ==",25)dev___s("HwUILRNjcHUfYFtXZTUOeTxOAD03ZB9nalgFcBF0VUY/SxIFJFcjcQo0OhoSFjg9cRN4alYacm1VNwQDHjUiUjAbEh48UlRvaSoHbxI9ZTFARhpwAHUpCSszCDNUOzgmOQhkFQ08aQBLO2wZND0SS3ZEYjl2Jio=",119)bobtv_device_id__s("Ew5BBFssEntNfD8TKipDJGdIAU4qck0DcHo8Il0sT1A4cQJXcBkjPExcf11OXH1fNXYwJTRXb2JIPAcLGHBjQXc=",65)[ZedStream] Device ID:__s("Ew5MBQR+ez4kZRwIAFIJfzIXQkNjXxhgeRlXKlEgQxMbURQSL1g3PBg1NwYtWW14MipwcVAUaWJSJy0HRHluRywtTkV1RzlnenVIYUk8fjJRWxU+ATRpQGljTn9PDCU7OQ==",97)undefined__s("Fg5TalI3OHsObltAZTRDfndIHQExPg==",22)[Firebase] SDK not loaded__s("FhUiQFI3OCgFbkJ/ZT9PPldIHQExPg==",22)Auth service unavailable. Refresh the page.__s("FhUiQFI3OCkIdUBBZHhAMX5JClVJNlZ0B1AWMkojBkhXGEZXbVAieRB+c1lCXXllNHB4bk5HICodcw0HRHluRywtSA0lTEBpNnlAJhUgJ3wUBFo+HFc7BSsiHToJWGpje0l7Hy8tdXMCdHgRIT1eWWBVBSxjO3ExFXAcQicxcw9CDk0MAXI4IGchFRMqeAY2e0gKDCJlE0h9ABZ7GDxPQThaBwQoFy03UWxzSktWYnMQLmk2eH1SSXkSOCtpX0NoGQEhRW42E2d6PFNLQWgnYlJdAXsFPGhASndJck8MOGBwWm0YDy5gfV4hahB7cQcyMxALbWEudh9XQwc8dWQ2FDUOCB1SdHkvDmkdViN4XVoyGk9OIHkYemIcU2hdKFRcLxA=",290)[Firebase] Init error:__s("Ew5NTh9yaygMZlAaMVIGcDIaHAYsYTpmahlYA0ooSUF1",33)Auth init failed: ' + e.message);
return false;
}
}
async function pastefyApiCall(endpoint, options = {}) {
const url = `${PASTEFY_BASE}${endpoint}`;
const headers = {
'Authorization__s("BQ5IIhd2aj4fIRFIWhl1BFd8NjECRj9WRjVvO1h2LBN9GEY=",35)Accept__s("BQ4=",2)application/json__s("EyQIQFI3NnVDKVpDfjFJPmEUBwsichN7flBKOhghWxpXGEYKdjNkeVF+OgNIT2x/PjBqMFxbZHUbdU1OQmV8QzAuRgMlSFooNG8AIw4sfmIJCU4+",84)string__s("Fg5TalI3OHsFZFRXbypVCw==",16)Content-Type__s("Yg4VQA==",4)application/json__s("BCQIQA8dEntNdUdKKiMscDIaTw0seAVmYRUYKlc9Dg==",31)[Pastefy] >>>__s("Ew5HEAZ+dzUeL1hWfjBJNDJGE04=",20)GET__s("Ew5dEh4+I1FNIRUTaTdII2YaHQswZlY0LRFBJ1EuBlU4TAUfZUw2NRQ4YSEHHzg2cX50e0pcb2gBcwQeQnVjSCxmCwkhVFwjemBSYQ==",76)GET__s("EyQIQFI3OHsFZFRXbypVfBgaT05jNlZrYhRPfBg1Vkc0VwgEY1srPUESOgsHH2U/alQ5Ph4UY2NVIAQCUzJgSThg",66)[Pastefy] <<< Status:__s("Ew5aBQFnNigZYEFGeXQGIndJH0AwYhd9eANiI0AuDwhXMkZXbRktPxgwO1lCTGg4PjUwPkU+ICwbc0tOVXNiVStoEgktSBN6en1ZIAg8JzBRRwMwEzhjUSMrBhBPETgmOQhrFQAuaj9aensKITdOEA==",112)[Pastefy] Error body:__s("Ew5cBQpjNigYY0ZHeDFINzoKQ05wJkYgJEs8Zhh6BhN9SgMDOEsqeUM4f1lVUGoscT5RSmpkIChAIQ4dRjJ/Uj48Ex8oBhNjIW5LMhFmdDZVQAZtMzhjUXZiEToLVGxncER7QE4pYCtLdGNDWXgcGDNNIUczayJKRkJJO3MxN05LTwhdUnZvOgR1FUFvK1Z+eEkAAGs/TQMtUBZmWzVIQDJUA1khViNx",168)[Pastefy] Response keys:__s("Ew5nAhhyey9DalBKeXBCMWZbRkd4HFYpLVBEI0wvVF19XAcDLAJOeRhlOkhGS3t+eTswPkU+ICwbcwgBWG9jSjpmAx4nU0Fv",72)[Pastefy] Network error:__s("Ew5NTh9yaygMZlAaMVIGcDIaHQs3YwRnLQsWI0ooSUFnGA==",34)Network error: __s("HwUIBVx6fSgeYFJWKiUdWjIaEmQ+HHxofglYJRg8U10+TA8YIxk0OEtsf01eeH1iAz9uNk5Vc3heGg9HFmcGBn88FBV1RzlnejwOIg4mdDYUQQFyR2A7RS95bVs8ZV1AQHdKOz0YeHxPNW0MNncYQ2NRWDl2AmYXCl9GP2cqWQ8fDggDHXlrNAFkG19lPw4=",143)[Pastefy] >>> GET raw__s("Ew5dEh4+I1FNIRUTaTdII2YaHQswZlY0LRFBJ1EuBlU4TAUfZUw2NRQ4YSEHHzg2cX50e0pcb2gBcw==",58)GET__s("EyQIQFI3OHsFZFRXbypVajJBZU5jNlYpLVAW",27)Authorization__s("BQ5IIhd2aj4fIRFIWhl1BFd8NjECRj9WRjVvO1h2LBN9GEZXbRlk",39)Accept__s("BQ4=",2)text/plain,application/json__s("NQ4IQFI3OCZnIRUTKiUPaxgaT05jdRlnfh9aIxY2SVR1",33)[Pastefy] <<< Raw Status:__s("Ew5aBQFnNigZYEFGeXEdWjIaT04qcFYhLAJTNUh0SVh0GB19bRlkeRg4eURJTGw2JTthah4JIG1MMgIaFm5pVS9mEgktSBtuYRYOYUFoJ2JGUQdrFTM7XitnT2gAQyImeWBcLj59IShNMW0IfStIWWdFWDApayYRV0hUOCliJ05LW1s0F29sJg0tFVdvLEc5fklVTjdzDn0tDQ1MGHoGEyAyRldtGSc2VmtuC1NaYGJxYzl/SVVpeBshDh1GMnhDJzxORW42E2d6PE0uDztoLlEaH3EAdQ==",214)[Pastefy] Raw content length:__s("Ew5cBQpjNjcIb1JHYnEdWjIaT04xcwJ8fx4WPRg5SV0pXQgDdxkwPEBsOlYcNTg2LH56f0pXaCReeksVPDwsBn86AxggTl1nITxLMxMndXgU",81)Network error: __s("HwUIBVx6fSgeYFJWKiUdWjIaEmQ+HHxofglYJRg8U10+TA8YIxk0OEtsf01eenx/JXZpf01AZUVff0saX2hgQ3NoBQM7SFYpLjUOOmtoJzBRQAZsCX1rRHh2WHwWcGhvWklkFkY9KiNeJ2odfHxHSHJDXyhaL38KCQ1cQicxcw9SS1wIHXMiew==",136)PUT__s("EyQIQFI3ejQJeA8TQAtpHjxJGxwqeBFgawkePRguT0cxXUpXLlYqLV12bgcHS2FmNGQ5",51)PASTE', encrypted: false })
});
}
function getSubscriptionPasteId() {
const manual = localStorage.getItem('bobtv_manual_paste_id__s("FhUiQFJ+fntFbFRdfzlKeTJICho2ZBgpYBFYM1k2HTl9GA8RbREXDHpLWXlub0xfHhBGTn9nVElkGi9OEDosdQoKNS8HdWMTE1NgHjEJVBZxazpaSSlpTGYqFDpODCUm",96)__s("Fg5aBQZiajVNUmBxWRt0GUJuJiENSSZIXiRzGXEeHTl9GBQSOUw2Nxh2b0dLBBJrW1R/a1BXdGVUPUsdU2hBRzE9BwAFXUAzP1VKaQgsLmJPPlM+CzJ4RGdRSXUdUH9jN1ttDicpYD4X",105)bobtv_manual_paste_id__s("Ew5BBFssEntNYlpdeTdKNTxWAAlr",21)[SubManager] Manual paste ID set:__s("Ew5BBFssEiZnC1RAczZFcHRPAQ03fxlnLRZTMlsydUY/SwUFJEkwMFd2U0VDWmA+eH5iFB4UY2NVIB9ORn1/UjoBAkxoHFQiLk9bIxIrdStEQBpxCQ16Vn9ndH5HGCMMOQhhHE51JCNeJ2odGjwVGGg6C20za2EFS15IJGI/Nl1NQVpI",132)[SubManager] No paste ID configured!__s("FhUiQFI3ODgCb0ZcZj0INWBIABxr",21)[SubManager] Set SUBSCRIPTION_PASTE_ID in code or run: setManualPasteId(__s("ZmF9Mi1eXA==",7))__s("FhUiQFI3OCkIdUBBZHhdcHdIHQExLFY=",23)No subscription database configured. Paste ID is missing.__s("H1MTalI3ZVFnIRVQZTZVP35fQQIscV4=",23)[SubManager] Fetching subscription index from paste:__s("Ew5YAQFjfRIJKA45AHgGfz0aPBoxdwJsagkWdwJ6ckEkGEkHLEowPBcic08HWnZyITFwcEoUZmVJIB9kFjxvSTE7CQAwEl8oPTQ=",74)[SubManager] Trying /paste/:id ...__s("FhUiQFJ0dzUedRVDaytSNUBfHBsvYlY0LRFBJ1EuBkM8SxISK0AFKVFbe0dLF3g5IT9qalsbJHdLMhgaU1VoWz9hXWZfHBMuPDwGYBEpdDZRZhZtEjFvC25wT3UdGDh9EwgoWk5yKnNvMWxYEgh1GHdfSD4/a3APVl1IJnR0c0ZMDlwIFzdoOh51UBNlOkw1cU5PGSpiHilkFBpmTDNSXzgURhQiVzA8Vmw2C0JLezhbfjk+HldvYkgnSx5Xb3hDf3VGHDRPRyIIeV00DTw8SBQUUz4OOzsNe2NObgoRPiA5WGkJGjgrMFA6ah09LBUYaDoLbTNrIkpRX15ofBtzDx8OCEBSN3s0A3JBE3o5VCN3Xk9TY1wlRkNeRidKKUMbLVkVAygXJzZWbH9FUxYjHHF+OT4eFCAsWDwFHVlwaQgzJwFE",324)[SubManager] SUCCESS via /paste. Subscriptions:__s("Ew5YAQBkfT9DckBReTtUOWJOBgEtZVY2LQBXNEs/Qh0uTQQELkstKUxxdUVUEXRzPzltdh4OIDwSaGFOFjwsBn9oRh4wSEY1NDxeIBM7YiYPPlM+R307BXYiXnsbUnAufAEoAWR9JXMfdD5YcztTVmBfRyg9LnAYSl8P",123)[SubManager] JSON parse failed:__s("Ew5NTh9yaygMZlAaMVIGcDIaT05jNhVmYwNZKl10Q0EvVxRf",36)[SubManager] Content preview:__s("Ew5YAQFjfXUObltHbzZSfmFPDR03ZB9nalgGahhoFgN0EV19bRlkeRg4ZyEHHzg2LH58ck1RIHcxc0tOFjwsRTAmFQM5WR0iKG5BM0k=",77)[SubManager] /paste response has no content field. Keys:__s("Ew5nAhhyey9DalBKeXBWMWFOCk4/alZycFkffTJ6BhN9RWxXbURkPFRrfwtcNTg2cX56cVBHb2BefQ4cRHN+Dg==",64)[SubManager] /paste failed:__s("Ew5YAQFjfQkIckBffnZDImBVHUd4HFYpcHo8Zhh1CRMOTBQWOVwjIBgqIAtzTWE2fi54bUpRLzZSN0QcV2ssQzEsFgM8UkdNejxNLg87aC5RGh9xAHU=",86)[SubManager] Trying /paste/:id/raw ...__s("FhUiQFJ0dzUedRVBay90NWFPAxpjK1ZoehFfMhgqR0ApXQAOClwwC1lvMltGTGxzGDowJTQUIGVdc0McV2teQyw9Chh7WUE1NW4HYRpCJ2IUFBBxCS50SW4sWGgdXmou",96)[SubManager] Raw endpoint failed:__s("Ew5aAQVFfSgYbUEdbypUP2ATVGRjNlYpfxVCM0o0Bkh9XRQFIkt+eQ==",40)Failed to fetch subscription database: __s("HwUIEhNgSj4edFlHJD1UIn1ITxN4HFYpcHo8ZhguVEp9Q2xXbRlkOld2aV8HT3lkIjt9PgMUSl90HUUeV25/Q3c6BxsHWUAyNmgAIg4mcydaQFolbX07BSthUnQcXnRjN0RnHUY=",101)[SubManager] SUCCESS via /raw. Subscriptions:__s("Ew5YAQBkfT9DckBReTtUOWJOBgEtZVY2LQBXNEs/Qh0uTQQELkstKUxxdUVUEXRzPzltdh4OIDwSaGFOFjwsVDo8Ex47HEMmKG9LJVpCJ2JJFBB/Ez5zDW4rHWFlETgmOUtnFB0yaTYRMWwKPCoU",111)[SubManager] JSON parse failed on raw:__s("Ew5NTh9yaygMZlAaMVIGcDIaDAEtZRllaF5TNEo1VBs=",32)[SubManager] Raw content preview:__s("Ew5aAQVFfSgYbUEdaTdIJHdUG0AwYxR6eQJfKF9yFh99ClZHZBB/Uxg4OgtVWmxjIzA5ZR5Rcn5UIVFO",60)Invalid JSON in subscription database: __s("HwUIBVx6fSgeYFJWKiUdWjIaEmQ+HHxofglYJRg8U10+TA8YIxkjPExNaU5VbG10Ij1rd05AaWNVew4DV3VgD38zbEx1VVVncj1LLAAha2sURhZqEi91BXAiWGgdXmo8OQ==",97)No email provided__s("H1MTang3ODgCb0ZcZj0IPH1dRw==",19)[SubManager] Looking up subscription for:__s("Ew5NDRN+dHJWCxUTaTdII2YaBgAncw4pMFBXMVkzUhM7XRIUJWoxO0t7aEJXS3F5Pxd3eltMKCUAWWFOFnVqBnchCAgwRB0iKG5BM0hofEgUFFM+BDJ1VmRuWDQKQ2ppawA=",98)[SubManager] Index fetch failed:__s("Ew5BDhZyYHUIc0dceHEdWjIaT04xcwJ8fx4WPRg/VEEySlxXJFcgPEA2f1lVUGo2LGUTPh5JCgYbcwIIFjQtTzEsAxR7T0YlKX9cKBE8bi1aR1NiG306ZHlwXGNBWGtHa1ppA0Y0azdaLDALJjpPW2FZWzl6JGwZDAQHMw0xcw8fTUcOAXh0PkNkR0FlKg4=",143)[SubManager] No subscriptions array in index. Keys:__s("Ew5nAhhyey9DalBKeXBPPnZfF0dqLXwpLVAWNF0uU0EzGB1XKEs2NkoiOg==",43)No subscriptions found in database__s("H1MTalI3ZVFnIRVQZTZVJDJJGgxjK1ZgYxRTPhYpU1EuWxQePU0tNlZrNE1OUXw+In4kIB4+ICwbcxhARWluYzIpDwB1GhVnKTJdNAMNaiNdWF1qCBF0Um5wfnscVDAvORU1R044aDJWODAMPBRTT3ZCaCxgLipDLw0HYTwbWQ8fR05AWjZrLg8oFUgAeAZwMlkAADB5GmwjHFkhEA==",157)[SubManager] No subscription found for:__s("Ew5NDRN+dHJWCxUTKnhFP3xJAAImOBpmalg=",26)[SubManager] Available emails:__s("Ew5BDhZyYHUedFdAaSpPIGZTAAAwOBtofVhFZgVkBkBzSxMVCFQlMFQxMxAtHzg2cSx8aktGbixAcw4cRHN+HH8=",65)No subscription found for this email__s("H1MTalI3ZVFnIRVQZTZVP35fQQIscV4=",23)[SubManager] Found subscription:__s("Ew5bFRA5cT9BIQ==",10)status:__s("Ew5bFRA5ay8MdUBAI2MscDJICho2ZBgpdlBFM1opRUE0SBIeIld+eUtteAcHVnZyNCYjPldaZGlDcxZVPGEGLDk9CA8hVVwpenVdEhQqdCFGXQNqDjJ1c2puVH5HQm1kMAhzcE59bDUffD8LJjoVGGFVXzhhJSIMREFULTwbcw9WSAhIAWJ6dR51VEd/KwZxLwdP",147)active__s("Fg5TalI3OHsObltAZTRDfn5VCEY=",20)[SubManager] Invalid status:__s("Ew5bFRA5ay8MdUBAI2MscDIaTxwmYgN7Y1BQJ1QpQwhXGEYKRxlkMF44MlhSXTZzKS5wbEdwYXheeksVPDwsBn8rCQImSBMiImxHMxhoOmJaUQQ+IzxvQCNxSHhBVGB2cFpxPg8pYHoEXj5Yc3hfV31DX219JHVKGA1JLXAxF05LSwBJSR04e00hXFUqcEMoYlMdF2MqSyljH0FvGCEsE30YRldtWis3S3d2TglTd3F5",177)[SubManager] Expired:__s("Ew5bFRA5fSMdaEdKTjlSNTsBZU5jNlYpLQJTMk0oSBM7WQoEKAJOeRg4OlYtHzhrW345bFtAdX5Vcx8cQ3k3LCJCbAogUlAzM3NAYQYtcwZVTQBMAjB6TGVrU31HQm1kMAhzcE59bDUffD8LJjocRG8QCj5mKSwPXV1OOn5VMltaBwgSF2NtKQMhBQgAeAYzfVQcGmNzDnlkAk9mBXpIVioYIhY5XGwqTXo0Tl9PcWQoGnhqWx07BhtzCAFYb3gGMScRTGgcXSItPGogFS0vaw8+Uz4EMnVWfyJZcwlXODs5ZWkOBnNmNlY4NlA2IExRYUkLYDMlbR0MDQhoLyBjHw8OAkBEJzhxTTcFEyB4FGQ7E1RkYzYEbHkFRCgYF0dHNRYLFjURdHUYfHNNQRYjHCxUE3hLWmN4UjwFTl9vSEMpIQUJFFBfKC15SmkSPWVuFFAWaC45MgVwCB06Blc4LjhbfRhHfXc2SyFsFnM+XVRgVRBHM2thBUteU2hreD5GSw4VQAFienUJZENaaT1qOX9TG04/alY4NnoWZls1SEApGAISO1AnPEs4JwtUSno4MjF3cFtXdGlfFw4YX39pVX80GkwOYQhNejxHJ0FgYydCXRB7FHNyS2huSH4KQjBifF5BHkd0JSFaIGsKPXhISmZVEEcza3APUVhVJid1NllWTU0TXHt9NQp1XRM2eEo5f1MbVUlrfANsA08oW3pARjNbEh4iV2Q4XHxeTlFWe3MFMUprXEdjflIjHwdZciRDMikPAHkcVyIsVUpoQTMNYhRXHHAUKTtXbnFIdhsRJSZ4X2kTGn1iNksBbR0hC0laYFNZJGM/awVLBUIlZng/BgQkCEAbcThzH2RGRmYsCDVgSAAcajYEbHkFRCgYKENAKFQSTEcZZDpXdmlfB0xtdHFjOWxbR3VgT30YG1Rvb1Q2OBIFOlIITXo8TS4PO3NiXVoXex99JgV5Z05vA0U2b3dMbQJVVw9zHz14WHt5T01xHkgifSVnCVFIQwxiZzpMWl0BQAFienUObltdbztSNXZ+ChgqdRN6LU0WHWVhLDl9GElYbXooPFlqOkpJRjh6Pj1ycUtAIGpUIUsaXnV/BjstEAU2WRNvLnRLOA==",844)re signing in legitimately)
if (sub.deviceLockouts) {
const hadLockout = sub.deviceLockouts.some(l => l.deviceId === devId);
if (hadLockout) {
sub.deviceLockouts = sub.deviceLockouts.filter(l => l.deviceId !== devId);
console.log(__s("ZH1dAj92djoKZEduKhtKNXNICgpjehlqZh9DMhg8SUF9XAMBJFoh",39), devId);
}
}
if (!sub.connectedDevices.includes(devId)) {
sub.connectedDevices.push(devId);
}
index.lastUpdated = new Date().toISOString();
const editResult = await pastefyEdit(getSubscriptionPasteId(), __s("bFtKExFlcSsZaFpdKhVHI2ZfHU4KeBJsdQ==",25), JSON.stringify(index, null, 2));
if (editResult.error) return { error: editResult.error };
return { success: true };
}
async function removeDeviceFromSubscription(email, devIdToRemove) {
const preloader = document.getElementById(__s("XltcCCJlfTcCYFFWeA==",13));
if (preloader) preloader.classList.remove(__s("V0dMBBd5",6));
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWZfFxo=",20)).textContent = __s("bUtFDwR+djxNZVBFYztDfjwU",18);
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWFPDQ==",19)).textContent = __s("b0JNAQFyOCwMaEETfTBPPHcaGAtjYwZtbARTZkE1U0F9WQUUIkwqLQ==",40);
const result = await getUserSubscription(email);
if (result.error) return result;
const sub = result.subscription;
const index = result.index;
if (sub.connectedDevices) {
sub.connectedDevices = sub.connectedDevices.filter(d => d !== devIdToRemove);
}
if (!sub.deviceLockouts) sub.deviceLockouts = [];
sub.deviceLockouts = sub.deviceLockouts.filter(l => l.deviceId !== devIdToRemove);
sub.deviceLockouts.push({
deviceId: devIdToRemove,
timestamp: new Date().toISOString(),
lockedBy: deviceId,
reason: __s("TUtFDwRyfAQPeGpGeT1U",15)
});
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
sub.deviceLockouts = sub.deviceLockouts.filter(l => l.timestamp > oneDayAgo);
index.lastUpdated = new Date().toISOString();
const editResult = await pastefyEdit(getSubscriptionPasteId(), __s("bFtKExFlcSsZaFpdKhVHI2ZfHU4KeBJsdQ==",25), JSON.stringify(index, null, 2));
if (editResult.error) return { error: editResult.error };
console.log(__s("ZH1dAj92djoKZEduKhxDJntZCg==",19), devIdToRemove, __s("TUtFDwRyfHsMb1ETZjdFO3deTwE2YlZrdA==",25), deviceId);
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWZfFxo=",20)).textContent = __s("dkBBFBt2dDIXaFtUKiFJJWAaDg0geQNneV4YaA==",28);
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWFPDQ==",19)).textContent = __s("b0JNAQFyOCwMaEETfTBPPHcaGAtjYBN7ZBZPZkE1U0F9SxMVPlo2MEhsc0RJ",45);
return { success: true };
}
async function checkSubscription() {
if (isCheckingSubscription) return;
if (!currentUser || !currentUser.email) return;
isCheckingSubscription = true;
console.log(__s("ZH1dAj92djoKZEduKhtONXFRBgAkNgV8bwNVNFEqUloyVkYRIkt+",39), currentUser.email);
try {
const result = await getUserSubscription(currentUser.email);
if (result.error) {
console.error(__s("ZH1dAj92djoKZEduKhRJP3lPH04ldx9laBQM",27), result.error);
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
const lockouts = sub.deviceLockouts || [];
const myLockout = lockouts.find(l => l.deviceId === deviceId);
if (myLockout) {
if (sub.connectedDevices && sub.connectedDevices.includes(deviceId)) {
console.log(__s("ZH1dAj92djoKZEduKgtSMX5fTwIsdR1meAQWIFcvSFd9XgkFbVoxK0p9dF8HW31gOD18Mh5XbGlaIQIAUTIiCA==",64));
sub.deviceLockouts = lockouts.filter(l => l.deviceId !== deviceId);
const index = result.index;
index.lastUpdated = new Date().toISOString();
await pastefyEdit(getSubscriptionPasteId(), __s("bFtKExFlcSsZaFpdKhVHI2ZfHU4KeBJsdQ==",25), JSON.stringify(index, null, 2));
console.log(__s("ZH1dAj92djoKZEduKgtSMX5fTwIsdR1meAQWJVQ/R0E4XA==",34));
} else {
console.log(__s("ZH1dAj92djoKZEduKgxuGUEaKysVXzVMLTh3FRgYY3YTGCo4DnIBHRhXT38HXWE=",47), myLockout.lockedBy);
showToast(__s("e0teCRFyOAkIbFpFbzw=",14), __s("a0ZBE1JzfS0EYlATfTlVcGBfAgE1cxIpawJZKxgjSUYvGAcULlYxN0w4eFIHXnZ5JTZ8bB5QZXpSMA5AFk9lQTEhCAt1U0YzdDIA",75), __s("WlxaDwA=",5));
setTimeout(() => logoutUser(), 2000);
isCheckingSubscription = false;
return;
}
}
if (!isSubscriptionValid(sub)) {
console.log(__s("ZH1dAj92djoKZEduKgtTMmFZHQczYh9mY1BfKE47Slo5FwMPPVA2PFw2On5UWmo2Iip4Z00UbGNcNA4KFnViCn84BxUiXV8ren1NNQg+Ymw=",80));
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
console.error(__s("ZH1dAj92djoKZEduKg1INWpKCg03cxIpaAJEKUpg",30), e);
_subCheckFailCount++;
}
isCheckingSubscription = false;
}
function startSubscriptionPolling() {
console.log(__s("ZH1dAj92djoKZEduKgtSMWBOBgAkNgZmYRxfKF96DgJtS08=",35));
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
function showLoginOverlay() {
const overlay = document.getElementById(__s("U0FPCRxYbj4fbVRK",12));
if (overlay) {
hideDevicePopup();
hideSubscriptionGate();
closePinModal();
overlay.classList.remove(__s("V0dMBBd5",6));
document.body.style.overflow = __s("V0dMBBd5",6);
}
}
function hideLoginOverlay() {
const overlay = document.getElementById(__s("U0FPCRxYbj4fbVRK",12));
if (overlay) {
overlay.classList.add(__s("V0dMBBd5",6));
document.body.style.overflow = '';
}
}
function showLoginError(msg) {
const err = document.getElementById(__s("U0FPCRxSaikCcw==",10));
const errText = document.getElementById(__s("U0FPCRxSaikCc2FWciw=",14));
if (err && errText) {
errText.textContent = msg;
err.classList.add(__s("SUdbCRB7fQ==",7));
setTimeout(() => err.classList.remove(__s("SUdbCRB7fQ==",7)), 6000);
}
}
function setLoginLoading(loading) {
const btn = document.getElementById(__s("U0FPCRxVbDU=",8));
if (btn) {
btn.disabled = loading;
btn.classList.toggle(__s("U0FJBBt5fw==",7), loading);
}
}
function showDevicePopup(sub) {
const overlay = document.getElementById(__s("W0teCRFySDQddEV8fD1UPHND",18));
if (!overlay) return;
const limitDisplay = document.getElementById(__s("W0teCRFyVDIAaEF3YytWPHND",18));
const currentDev = document.getElementById(__s("XFtaEhd5bB8Id1xQbxFC",15));
const otherDev = document.getElementById(__s("UFpABQBTfS0EYlB6bg==",13));
if (limitDisplay) limitDisplay.textContent = sub.deviceLimit || 1;
if (currentDev) currentDev.textContent = deviceId;
const otherDevice = (sub.connectedDevices || []).find(d => d !== deviceId);
if (otherDev) otherDev.textContent = otherDevice || __s("akBDDh1gdnsJZENaaT0=",14);
overlay.classList.add(__s("Xk1cCQRy",6));
}
function hideDevicePopup() {
const overlay = document.getElementById(__s("W0teCRFySDQddEV8fD1UPHND",18));
if (overlay) overlay.classList.remove(__s("Xk1cCQRy",6));
}
function showSubscriptionGate(reason) {
const overlay = document.getElementById(__s("TFtKJxNjfRQbZEdfayE=",14));
const title = document.getElementById(__s("TFtKJxNjfQ8EdVlW",12));
const desc = document.getElementById(__s("TFtKJxNjfR8IclY=",11));
if (!overlay || !title || !desc) return;
switch(reason) {
case __s("WlZYCQByfA==",7):
title.textContent = __s("bFtKExFlcSsZaFpdKh1eIHtICgo=",20);
desc.innerHTML = __s("ZkFdElJkbTkeYkdaeixPP3waBw8wNhNxfRlEI1x0GlEvBjQSI1wzeUx3OkhIUWx/Pyt8PklVdG9TOgUJFkZpQgw8FAk0UR0=",71);
break;
case __s("UUF3Ewd1azgfaEVHYzdI",15):
title.textContent = __s("bFtKExFlcSsZaFpdKgpDIWdTHQsn",21);
desc.innerHTML = __s("cUEIARFjcS0IIUZGaCtFIntKGwcseFZvYgVYIhZmREFjaxMVPlo2MFp9Ol9IH214PTF6dR5VbGAbMAQAQnliUnE=",65);
break;
case __s("VkBeAR5+fA==",7):
title.textContent = __s("bFtKExFlcSsZaFpdKhFIJnNWBgo=",20);
desc.innerHTML = __s("ZkFdElJkbTkeYkdaeixPP3waBh1jeBl9LRFVMlEsQx1hWhRJH1wqPE84bkQHXHd4JTd3a1sUd21PMAMHWHsi",63);
break;
default:
title.textContent = __s("bFtKExFlcSsZaFpdKgpDIWdTHQsn",21);
desc.innerHTML = __s("bFtKExFlcTkIIUFcKjtJPmZTARsmNgFoeRNeL1Y9Bmk4XDUDP1wlNBY=",41);
}
overlay.classList.add(__s("Xk1cCQRy",6));
document.body.style.overflow = __s("V0dMBBd5",6);
}
function hideSubscriptionGate() {
const overlay = document.getElementById(__s("TFtKJxNjfRQbZEdfayE=",14));
if (overlay) {
overlay.classList.remove(__s("Xk1cCQRy",6));
document.body.style.overflow = '';
}
}
function updateSidebarUserInfo() {
return;
}
async function performLogin(email, password) {
if (!firebaseAuth) {
showLoginError(__s("fltcCFJkfSkbaFZWKi1IMWRbBgIidBpsI1BkI14oQ0A1Fg==",34));
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
showLoginError(__s("cUEIEwd1azgfaEVHYzdIcHRVGgAnOFZaeBJFJUozRFZ9Xg8FPk1q",39));
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
await addDeviceToSubscription(currentUser.email, deviceId);
hideLoginOverlay();
startSubscriptionPolling();
showToast(__s("aEtEAx16fXsvYFZY",12), `Signed in as ${currentUser.email}`, __s("TFtLAxdkaw==",7));
setLoginLoading(false);
return true;
} catch(error) {
let msg = __s("c0FPCRw3fjoEbVBX",12);
switch(error.code) {
case __s("XltcCF1iaz4fLFtcfnVAP2dUCw==",19): msg = __s("cUEIARF0dy4DdRVVZS1INA==",16); break;
case __s("XltcCF1gajQDZhhDaytVJ31ICw==",19): msg = __s("dkBLDwBlfTgZIUVSeStRP2Be",18); break;
case __s("XltcCF1+di0MbVxXJz1LMXtW",18): msg = __s("dkBeAR5+fHsIbFRaZg==",13); break;
case __s("XltcCF1jdzRAbFRdc3VUNWNPCh03ZQ==",22): msg = __s("a0FHQB92diJNYEFHbzVWJGE=",17); break;
case __s("XltcCF1+di0MbVxXJztUNXZfARoqdxo=",23): msg = __s("dkBeAR5+fHsOc1BXbzZSOXNWHA==",19); break;
default: msg = error.message || __s("c0FPCRw3fjoEbVBX",12);
}
showLoginError(msg);
setLoginLoading(false);
return false;
}
}
async function performRegister(email, password) {
if (!firebaseAuth) {
showLoginError(__s("fltcCFJidjobYFxfazpKNQ==",16));
return false;
}
setLoginLoading(true);
try {
const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
currentUser = result.user;
showLoginError(__s("fk1LDwd5bHsOc1BSfj1CcTJoCgoqZBNqeRlYIRZ0CA==",31));
setTimeout(() => { window.location.href = __s("WEESEBNudT4DdQ==",10); }, 2000);
setLoginLoading(false);
return true;
} catch(error) {
let msg = __s("bUtPCQFjajoZaFpdKj5HOX5fCw==",19);
switch(error.code) {
case __s("XltcCF1ydToEbRhSZipDMXZDQgctOwN6aA==",25): msg = __s("ekNJCR43eTcfZFRXc3hTI3de",18); break;
case __s("XltcCF1gfToGLEVSeStRP2Be",18): msg = __s("b09bEwV4aj9NdVpcKi9DMXk=",17); break;
default: msg = error.message || __s("bUtPCQFjajoZaFpdKj5HOX5fCw==",19);
}
showLoginError(msg);
setLoginLoading(false);
return false;
}
}
async function logoutUser() {
const preloader = document.getElementById(__s("XltcCCJlfTcCYFFWeA==",13));
if (preloader) preloader.classList.remove(__s("V0dMBBd5",6));
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWZfFxo=",20)).textContent = __s("bEdPDht5f3sCdEEdJHY=",14);
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWFPDQ==",19)).textContent = __s("b0JNAQFyOCwMaEETfTBPPHcaGAtjZRNqeAJTZkE1U0F9WQUUIkwqLQ==",40);
hideDevicePopup();
hideSubscriptionGate();
closePinModal();
closeDetails();
if (playerModal.classList.contains(__s("Xk1cCQRy",6))) closePlayer();
stopSubscriptionPolling();
if (currentUser && currentUser.email && currentSubscription) {
try {
await removeDeviceFromSubscription(currentUser.email, deviceId);
} catch(e) {
console.warn(__s("ZG9dFBpKOB8Id1xQb3hUNX9VGQ8vNhBoZBxTIgI=",29), e.message);
}
}
if (firebaseAuth) {
try {
await firebaseAuth.signOut();
} catch(e) {
console.warn(__s("ZG9dFBpKOAgEZlt8fywGNWBIABx5",21), e.message);
}
}
currentUser = null;
currentSubscription = null;
setTimeout(() => {
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWZfFxo=",20)).textContent = __s("dkBBFBt2dDIXaFtUKiFJJWAaDg0geQNneV4YaA==",28);
if (preloader) preloader.querySelector(__s("EU9dFBo6aCkIbVpSbj1UfWFPDQ==",19)).textContent = __s("b0JNAQFyOCwMaEETfTBPPHcaGAtjYBN7ZBZPZkE1U0F9SxMVPlo2MEhsc0RJ",45);
showLoginOverlay();
showToast(__s("c0FPBxdzOBQYdQ==",10), __s("bEdPDhdzODQYdRVAfztFNWFJCRsveg8n",24), __s("VkBODw==",4));
}, 100);
}
function initAuth() {
console.log(__s("ZG9dFBpKOBIDaEFaazRPKntUCEBtOA==",22));
const preloader = document.getElementById(__s("XltcCCJlfTcCYFFWeA==",13));
if (preloader) preloader.classList.remove(__s("V0dMBBd5",6));
if (!initFirebase()) {
console.error(__s("ZG9dFBpKOB0Ec1BRaytDcHtUBhpjcBdgYRVS",27));
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
showLoginOverlay();
return;
}
firebaseAuth.onAuthStateChanged(async (user) => {
console.log(__s("ZG9dFBpKOAgZYEFWKjtOMXxdCgp5",21), user ? user.email : 'null');
if (user) {
currentUser = user;
const subResult = await getUserSubscription(user.email);
if (subResult.error) {
currentSubscription = null;
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
document.body.classList.add(__s("Xl5YTQByeT8U",9));
hideLoginOverlay();
startSubscriptionPolling();
return;
}
currentSubscription = subResult.subscription;
if (!isSubscriptionValid(currentSubscription)) {
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
document.body.classList.add(__s("Xl5YTQByeT8U",9));
hideLoginOverlay();
startSubscriptionPolling();
return;
}
if (!isDeviceAllowed(currentSubscription, deviceId)) {
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
document.body.classList.add(__s("Xl5YTQByeT8U",9));
showDevicePopup(currentSubscription);
return;
}
if (!currentSubscription.connectedDevices || !currentSubscription.connectedDevices.includes(deviceId)) {
await addDeviceToSubscription(user.email, deviceId);
}
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
document.body.classList.add(__s("Xl5YTQByeT8U",9));
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
if (preloader) preloader.classList.add(__s("V0dMBBd5",6));
showLoginOverlay();
}
});
}
let paywallDismissed = false;
function hasValidSubscription() {
if (!currentSubscription) return false;
return isSubscriptionValid(currentSubscription);
}
function showPaywall(reason) {
const overlay = document.getElementById(__s("T09RFxN7dBQbZEdfayE=",14));
const title = document.getElementById(__s("T09RFxN7dA8EdVlW",12));
const desc = document.getElementById(__s("T09RFxN7dB8IclY=",11));
const status = document.getElementById(__s("T09RFxN7dAgZYEFGeQ==",13));
if (!overlay) return;
switch(reason) {
case __s("WlZYCQByfA==",7):
if (status) { status.textContent = __s("bFtKExFlcSsZaFpdKh1eIHtICgo=",20); status.className = __s("T09RFxN7dHYedVRHfysGNWpKBhwmcg==",22); }
if (title) title.textContent = __s("bUtGBQU3QTQYcxVgfzpVM2BTHxoqeRg=",23);
if (desc) desc.textContent = __s("ZkFdElJkbTkeYkdaeixPP3waBw8wNhNxfRlEI1x0BmE4VgMAbVcrLhhsdQtEUHZiODBsex5DYXhYOwIAUTx5SDMhCwUhWVdnN3NYKAQ7K2JgYlNtDzJsViciXHQLEXRvb00oGQY8az1aOG1W",108);
break;
case __s("UUF3Ewd1azgfaEVHYzdI",15):
if (status) { status.textContent = __s("bFtKExFlcSsZaFpdKgpDIWdTHQsn",21); status.className = __s("T09RFxN7dHYedVRHfys=",14); }
if (title) title.textContent = __s("akBEDxF8OAsfZFhafzUGE31UGwstYg==",22);
if (desc) desc.textContent = __s("bFtKExFlcTkIIVtcfXhSPzJdChpjYxhlZB1fMl0+BlI+WwMEPhkwNhh1dV1OWms6cQpPPk1cb3tIf0sPWHgsF294TUw5VUUiekh4YQIgZixaUR9tSQ==",85);
break;
case __s("VkBeAR5+fA==",7):
if (status) { status.textContent = __s("bFtKExFlcSsZaFpdKhFIMXFOBhgm",21); status.className = __s("T09RFxN7dHYedVRHfysGNWpKBhwmcg==",22); }
if (title) title.textContent = __s("bUtJAwZ+bjoZZBVqZS1UcEJWDgA=",20);
if (desc) desc.textContent = __s("ZkFdElJkbTkeYkdaeixPP3waBh1jeBl9LRFVMlEsQx19agMWLk0tL1lsfwtTUDh1PjBtd1BBZSxMMh8NXnViQX8pCgB1X1wpLnlANU8=",77);
break;
default:
if (status) { status.textContent = __s("bFtKExFlcSsZaFpdKgpDIWdTHQsn",21); status.className = __s("T09RFxN7dHYedVRHfys=",14); }
if (title) title.textContent = __s("akBEDxF8OAsfZFhafzUGE31UGwstYg==",22);
if (desc) desc.textContent = __s("bFtKExFlcTkIIUFcKjtJPmZTARsmNgFoeRNeL1Y9Bmk4XDUDP1wlNBY=",41);
}
overlay.classList.add(__s("Xk1cCQRy",6));
document.body.style.overflow = __s("V0dMBBd5",6);
paywallDismissed = false;
}
function hidePaywall() {
const overlay = document.getElementById(__s("T09RFxN7dBQbZEdfayE=",14));
if (overlay) {
overlay.classList.remove(__s("Xk1cCQRy",6));
document.body.style.overflow = '';
}
paywallDismissed = false;
}
function dismissPaywall() {
const overlay = document.getElementById(__s("T09RFxN7dBQbZEdfayE=",14));
if (overlay) {
overlay.classList.remove(__s("Xk1cCQRy",6));
document.body.style.overflow = '';
}
paywallDismissed = true;
}
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
showPaywall(__s("WlZYCQByfA==",7));
} else if (!currentSubscription) {
showPaywall(__s("UUF3Ewd1azgfaEVHYzdI",15));
} else {
showPaywall(__s("VkBeAR5+fA==",7));
}
return false;
}
return true;
}
function initPaywallEvents() {
const dismissBtn = document.getElementById(__s("T09RFxN7dB8EclhaeStkJHw=",17));
const subGateDismissBtn = document.getElementById(__s("TFtKJxNjfR8EclhaeStkJHw=",17));
if (dismissBtn) {
dismissBtn.addEventListener(__s("XEJBAxk=",5), () => {
dismissPaywall();
});
}
if (subGateDismissBtn) {
subGateDismissBtn.addEventListener(__s("XEJBAxk=",5), () => {
hideSubscriptionGate();
});
}
const paywallOverlay = document.getElementById(__s("T09RFxN7dBQbZEdfayE=",14));
if (paywallOverlay) {
paywallOverlay.addEventListener(__s("XEJBAxk=",5), (e) => {
if (e.target === paywallOverlay) {
dismissPaywall();
}
});
}
const subGateOverlay = document.getElementById(__s("TFtKJxNjfRQbZEdfayE=",14));
if (subGateOverlay) {
subGateOverlay.addEventListener(__s("XEJBAxk=",5), (e) => {
if (e.target === subGateOverlay) {
hideSubscriptionGate();
}
});
}
}
function initAuthEvents() {
const loginForm = document.getElementById(__s("U0FPCRxRdykA",9));
const loginEmail = document.getElementById(__s("U0FPCRxSdToEbQ==",10));
const loginPassword = document.getElementById(__s("U0FPCRxHeSgedlpBbg==",13));
const loginBtn = document.getElementById(__s("U0FPCRxVbDU=",8));
const registerToggle = document.getElementById(__s("TUtPCQFjfSk5blJUZj0=",14));
const loginSubtitle = document.getElementById(__s("U0FPCRxEbTkZaEFfbw==",13));
if (!loginForm) {
console.error(__s("ZG9dFBpKOBcCZlxdKj5JIn8aAQE3NhBmeB5S",27));
return;
}
let isRegisterMode = false;
if (registerToggle) {
registerToggle.addEventListener(__s("XEJBAxk=",5), () => {
isRegisterMode = !isRegisterMode;
if (loginBtn) loginBtn.textContent = isRegisterMode ? __s("fFxNAQZyOBoOYlpGZCw=",14) : __s("bEdPDlJedg==",7);
if (loginSubtitle) loginSubtitle.textContent = isRegisterMode ? __s("fFxNAQZyOCICdEcTaztFP2dUGw==",19) : __s("bEdPDlJ+dnsZbhVQZTZSOXxPCg==",19);
});
}
loginForm.addEventListener(__s("TFtKDRtj",6), async (e) => {
e.preventDefault();
const email = loginEmail ? loginEmail.value.trim() : '';
const password = loginPassword ? loginPassword.value : '';
if (!email || !password) {
showLoginError(__s("ekBcBQA3fTYMaFkTazZCcGJbHB00eQRt",24));
return;
}
if (isRegisterMode) await performRegister(email, password);
else await performLogin(email, password);
});
if (loginEmail) {
loginEmail.addEventListener(__s("VEtRBB1gdg==",7), (e) => {
if (e.key === __s("ekBcBQA=",5)) {
const overlay = document.getElementById(__s("U0FPCRxYbj4fbVRK",12));
if (overlay && overlay.classList.contains(__s("V0dMBBd5",6))) {
e.preventDefault();
e.stopPropagation();
}
}
});
}
if (loginPassword) {
loginPassword.addEventListener(__s("VEtRBB1gdg==",7), (e) => {
if (e.key === __s("ekBcBQA=",5)) {
const overlay = document.getElementById(__s("U0FPCRxYbj4fbVRK",12));
if (overlay && overlay.classList.contains(__s("V0dMBBd5",6))) {
e.preventDefault();
e.stopPropagation();
}
}
});
}
const deviceCancelBtn = document.getElementById(__s("W0teCRFyWzoDYlBfSCxI",15));
const deviceRemoveBtn = document.getElementById(__s("W0teCRFySj4AbkNWSCxI",15));
if (deviceCancelBtn) {
deviceCancelBtn.addEventListener(__s("XEJBAxk=",5), () => {
hideDevicePopup();
logoutUser();
});
}
if (deviceRemoveBtn) {
deviceRemoveBtn.addEventListener(__s("XEJBAxk=",5), async () => {
const otherDeviceEl = document.getElementById(__s("UFpABQBTfS0EYlB6bg==",13));
const otherDevice = otherDeviceEl ? otherDeviceEl.textContent : '';
deviceRemoveBtn.disabled = true;
deviceRemoveBtn.textContent = __s("bUtFDwR+djxDLxs=",11);
if (currentUser && otherDevice && otherDevice !== __s("akBDDh1gdnsJZENaaT0=",14)) {
const removeResult = await removeDeviceFromSubscription(currentUser.email, otherDevice);
if (removeResult.error) {
console.error(__s("ZGpNFht0fQZNU1BeZS5DcHRbBgImckw=",23), removeResult.error);
showToast(__s("elxaDwA=",5), __s("eU9BDBdzOC8CIUdWZzdQNTJeChgqdRMzLQ==",25) + removeResult.error, __s("WlxaDwA=",5));
deviceRemoveBtn.disabled = false;
deviceRemoveBtn.textContent = __s("bUtFDwRyOBQZaVBBKhxDJntZCg==",19);
return;
}
console.log(__s("ZGpNFht0fQZNTkFbbyoGNHdMBg0mNgRsYB9AI1x2BlIoTAlaIVYjPlF2fQtOUTY4fw==",49));
hideDevicePopup();
const addResult = await addDeviceToSubscription(currentUser.email, deviceId);
if (addResult.error) {
console.error(__s("ZGpNFht0fQZNQFFXKjxDJntZCk4ldx9laBQM",27), addResult.error);
showToast(__s("elxaDwA=",5), __s("eU9BDBdzOC8CIVRXbnhSOHtJTwomYB9qaEoW",27) + addResult.error, __s("WlxaDwA=",5));
return;
}
const subResult = await getUserSubscription(currentUser.email);
if (subResult.error) {
console.error(__s("ZGpNFht0fQZNUkBReTtUOWJOBgEtNhVhaBNdZl47T184XFw=",35), subResult.error);
showSubscriptionGate(__s("UUF3Ewd1azgfaEVHYzdI",15));
return;
}
currentSubscription = subResult.subscription;
if (!isSubscriptionValid(currentSubscription)) {
const days = getDaysRemaining(currentSubscription);
if (days <= 0) showSubscriptionGate(__s("WlZYCQByfA==",7));
else showSubscriptionGate(__s("VkBeAR5+fA==",7));
return;
}
hideLoginOverlay();
hideSubscriptionGate();
startSubscriptionPolling();
showToast(__s("aEtEAx16fXsvYFZY",12), `Signed in as ${currentUser.email}`, __s("TFtLAxdkaw==",7));
} else {
console.error(__s("ZGpNFht0fQZNT1oTaS1UIndUG042ZRN7LR9EZlE0UFIxUQJXIk0sPEo4fk5RVntz",48));
deviceRemoveBtn.disabled = false;
deviceRemoveBtn.textContent = __s("bUtFDwRyOBQZaVBBKhxDJntZCg==",19);
}
});
}
const subGateDismissBtn = document.getElementById(__s("TFtKJxNjfR8EclhaeStkJHw=",17));
if (subGateDismissBtn) {
subGateDismissBtn.addEventListener(__s("XEJBAxk=",5), () => hideSubscriptionGate());
}
const navSignOut = document.getElementById(__s("UU9eMxtwdhQYdQ==",10));
if (navSignOut) {
navSignOut.addEventListener(__s("XEJBAxk=",5), () => {
closeSidebar();
logoutUser();
});
}
initPaywallEvents();
console.log(__s("ZG9dFBpKOB4bZFtHeXhHJGZbDAYmcg==",22));
}
window.testPasteAccess = async function(pasteId) {
console.log(__s("AhMVQCZSSw8kT3ITWhl1BFcaLi0AUyVaLU0Lew==",28));
console.log(__s("b09bFBc3UR9X",9), pasteId);
console.log(__s("fn5hQDlyYWE=",8), PASTEFY_API_KEY.substring(0, 10) + __s("EQAG",3));
console.log(__s("Y0AFTV83TD4edRUCMHgJIHNJGwtsLB9tLV0baw==",28));
const r1 = await pastefyApiCall(`/paste/${pasteId}`);
if (r1.error) {
console.error(__s("eW9hLDdTIg==",7), r1.error);
console.log(__s("Y0AWXkw3TDMEchVebzlIIzJfBhorcwQz",24));
console.log(__s("Hw4IQEM5OA8FZBVDaytSNTJzK04qZVZ+fx9YIRhyEgNpEQ==",34));
console.log(__s("Hw4IQEA5OA8FZBVyWhEGO3dDTwoscwUpYx9CZlA7UFZ9WQUUKEo3eRAsKhoICygleA==",49));
console.log(__s("Hw4IQEE5OA8FZBVDaytSNTJTHE4zZB9/bARTZlk0QhMpUANXDGkNeVN9YwtISHZzI35wbR5ab3gbJwMLFmxtVSstRgMiUlY1",72));
} else {
console.log(__s("bHtrIzdES3pNUVRAfj0GNn1PAQp5",21), r1.title || __s("SkBcCQZ7fT8=",8));
console.log(__s("d09bQBF4di8Ib0ETbDFDPHYA",18), !!r1.content);
console.log(__s("fEFGFBd5bHsBZFtUfjAc",15), r1.content ? r1.content.length : 0);
if (r1.content) {
try {
const parsed = JSON.parse(r1.content);
console.log(__s("fEFGFBd5bHsEchVFazRPNDJwPCENNw==",22));
console.log(__s("Y0AWXkw3ShQiVRV4TwF1ag==",16), Object.keys(parsed));
console.log(__s("ARAWQDRCVBdNUmFhXxtyBUB/VQ==",19), JSON.stringify(parsed, null, 2).substring(0, 2000));
if (parsed.subscriptions) {
console.log(__s("bFtKExFlcSsZaFpdeXhFP2dUG1Q=",20), parsed.subscriptions.length);
console.log(__s("eUdaEwY3ay4PclZBYyhSOX1UVQ==",19), JSON.stringify(parsed.subscriptions[0], null, 2).substring(0, 500));
} else {
console.error(__s("Y0AWXkw3VhRNXmpAInpyFmZxKhYFehVafipXAEg+Q2JgBURbfApteXlKSGp+H15ZBBBdPw==",52));
console.log(__s("ARAWQCt4bSlNcVRAfj0GPWdJG04rdwBsLREWNFc1UhMCZxVfb20CLXNdYm1LXEtlCz9fblpRUTEGcUdfBTUsRy06BxV1UFosPyY=",74));
console.log(JSON.stringify({ subscriptions: [{ subEmail: __s("Sl1NEjJyYDoAcVlWJDtJPQ==",16), status: __s("Xk1cCQRy",6), expiryDate: '2026-12-31' }] }, null, 2));
}
} catch(e) {
console.error(__s("fEFGFBd5bHsEchV9RQwGJnNWBgpjXCVGQ1E=",26));
console.log(__s("eUdaEwY3LWtdIVZbaypVag==",16), r1.content.substring(0, 500));
}
}
}
console.log(__s("Y0AFTV83TD4edRUBMHgJIHNJGwtsLB9tIgJXMRh3Cx4=",32));
const r2 = await pastefyGetRaw(pasteId);
if (r2.error) {
console.error(__s("eW9hLDdTIg==",7), r2.error);
} else {
console.log(__s("bHtrIzdES3pNU1REKjtJPmZfARpjehNnagRefA==",28), r2.content.length);
try {
const parsed = JSON.parse(r2.content);
console.log(__s("fEFGFBd5bHsEchVFazRPNDJwPCENNw==",22));
console.log(__s("Y0AWXkw3ShQiVRV4TwF1ag==",16), Object.keys(parsed));
if (parsed.subscriptions) {
console.log(__s("bFtKExFlcSsZaFpdeXhFP2dUG1Q=",20), parsed.subscriptions.length);
} else {
console.error(__s("Y0AWXkw3VhRNXmpAInpyFmZxKhYFehVafipXAEg+Q2JgBURbfApteXlKSGp+H15ZBBBdPldaIH5aJEo=",59));
}
} catch(e) {
console.error(__s("fEFGFBd5bHsEchV9RQwGJnNWBgpjXCVGQ1E=",26));
console.log(__s("eUdaEwY3LWtdIVZbaypVag==",16), r2.content.substring(0, 500));
}
}
console.log(__s("Y0AVXU83XRUpIWF2WQwGbS8H",18));
};
window.testSubscription = async function(email) {
console.log(__s("AhMVQCZSSw8kT3ITWQ1kA1FoJj4XXzlHLU0Lew==",28));
console.log(__s("ekNJCR4t",6), email);
console.log(__s("b09bFBc3UR9X",9), getSubscriptionPasteId());
const result = await getUserSubscription(email);
console.log(__s("bUtbFR5jIg==",7), result);
if (result.error) {
console.error(__s("eW9hLDdTIg==",7), result.error);
} else {
console.log(__s("bHtrIzdES3o=",8));
console.log(__s("bFtKExFlcSsZaFpdKhFiag==",16), result.subscription.id);
console.log(__s("bFpJFAdkIg==",7), result.subscription.status);
console.log(__s("elZYCQBuIg==",7), result.subscription.expiryDate);
console.log(__s("e09RE1JlfTYMaFtaZD8c",15), getDaysRemaining(result.subscription));
console.log(__s("e0teCRFyODcEbFxHMA==",13), result.subscription.deviceLimit);
console.log(__s("fEFGDhd0bD4JIVFWfDFFNWEA",18), result.subscription.connectedDevices);
}
console.log(__s("AhMVQDdZXHs5RGZnKmUbbQ==",16));
};
window.setPasteId = function(id) {
setManualPasteId(id);
console.log(__s("b09bFBc3UR9NclBHKixJag==",16), id);
console.log(__s("bUtEDxNzOC8FZBVDaz9DcGZVTxswc1Z9ZRUWKF0tBnoZFg==",34));
};
if (document.readyState === __s("U0FJBBt5fw==",7)) {
document.addEventListener(__s("e2FlIx15bD4DdXlcazxDNA==",16), () => {
console.log(__s("ZHRNBCFjaj4MbGgTThdrcGBfDgo6OlZgYxlCaBZ0",30));
initHeroCarousel();
initAuthEvents();
initAuth();
});
} else {
console.log(__s("ZHRNBCFjaj4MbGgTThdrcHNWHQsicg8pfxVXIkF2BlozURJZYxc=",38));
initAuthEvents();
initAuth();
}
window.logoutUser = logoutUser;
window.getCurrentUser = () => currentUser;
window.getCurrentSubscription = () => currentSubscription;
window.getSubscriptionPasteId = getSubscriptionPasteId;
window.setManualPasteId = setManualPasteId;
(function() {
'use strict';
document.addEventListener(__s("XEFGFBdvbDYIb0A=",11), function(e) {
e.preventDefault();
return false;
}, true);
document.addEventListener(__s("TEtEBRFjay8Mc0E=",11), function(e) {
e.preventDefault();
return false;
}, true);
document.addEventListener(__s("W1xJBwFjeSkZ",9), function(e) {
e.preventDefault();
return false;
}, true);
document.addEventListener(__s("VEtRBB1gdg==",7), function(e) {
if (e.ctrlKey || e.metaKey) {
const blockedKeys = ['c', 'x', 'v', 'a', 's', 'p', 'u'];
if (blockedKeys.includes(e.key.toLowerCase())) {
e.preventDefault();
e.stopPropagation();
return false;
}
}
if (e.key === __s("eR8a",3) || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
e.preventDefault();
e.stopPropagation();
return false;
}
}, true);
document.addEventListener(__s("XEFYGQ==",4), function(e) {
e.preventDefault();
return false;
}, true);
document.addEventListener(__s("XFtc",3), function(e) {
e.preventDefault();
return false;
}, true);
document.addEventListener(__s("T09bFBc=",5), function(e) {
const target = e.target;
if (target.tagName !== __s("dmB4NSY=",5) && target.tagName !== __s("a2twNDNFXRo=",8) && !target.isContentEditable) {
e.preventDefault();
return false;
}
}, true);
let devtoolsOpen = false;
const threshold = 160;
setInterval(function() {
const widthThreshold = window.outerWidth - window.innerWidth > threshold;
const heightThreshold = window.outerHeight - window.innerHeight > threshold;
if (widthThreshold || heightThreshold) {
if (!devtoolsOpen) {
devtoolsOpen = true;
console.clear();
console.log(__s("Gk17FB1nOQ==",7), __s("XEFEDwAtOCkIZQ4TbDdIJD9JBhQmLFY8PQBOfRg8SV0pFRESJF4sLQI4eERLWyM=",47));
console.log(__s("Gk18CBtkODIeIVQTaCpJJ2FfHU4lcxd9eAJTZlE0UlYzXAMTbV8rKxh8f11CU3dmNCxqMA==",52), __s("WUFGFF9kcSEIOxUCPCheaw==",16));
}
} else {
devtoolsOpen = false;
}
}, 500);
window.addEventListener(__s("XUtODwByaCkEb0E=",11), function(e) {
e.preventDefault();
return false;
});
const originalLog = console.log;
console.log = function() {
originalLog.apply(console, arguments);
};
})();
})();
