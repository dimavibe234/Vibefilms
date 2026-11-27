// ============================================================  
// PlayFrame — script.js (ЧАСТЬ 1 из 3)                          
// Фиксы: applyRemoteData не затирает анкету из облака            
// ============================================================  

var AI_FN       = "https://functions.yandexcloud.net/d4edhc3vf41qqntfflsp";
var BASE        = "https://functions.yandexcloud.net/d4e3i0pd816463uq33eu";
var GAMES_AI_FN = "https://functions.yandexcloud.net/d4ep609aq1goe7o3c13k";

// ===== Профиль =====  
var DEFAULT_PROFILE = {
  name: "", avatar: "", color: "#e8eaed", bio: "",
  avatarFrame: "none", banner: "none", nameStyle: "normal", badge: "",
  anketa_games: null, anketa_movies: null  
};
var AVATAR_FRAMES   = ["none","purple","pink","gold","neon","rainbow","glow","leaf"];
var PROFILE_BANNERS = ["none","sunset","ocean","forest","neon","galaxy","mono","candy"];
var NAME_STYLES     = ["normal","gradient","neon","glow","mono"];
var PROFILE_BADGES  = ["", "","","","","","","","",""];
var PROFILE_COLORS  = ["#e8eaed","#ff6b6b","#ffd76e","#10b981","#3b82f6","#a855f7","#ec4899"];

function sanitizeProfile(p) {
  p = Object.assign({}, DEFAULT_PROFILE, p || {});
  return {
    name: typeof p.name === "string" ? p.name.slice(0, 40) : "",
    avatar: typeof p.avatar === "string" ? p.avatar.slice(0, 500) : "",
    color: PROFILE_COLORS.indexOf(p.color) !== -1 ? p.color : "#e8eaed",
    bio: typeof p.bio === "string" ? p.bio.slice(0, 120) : "",
    avatarFrame: AVATAR_FRAMES.indexOf(p.avatarFrame) !== -1 ? p.avatarFrame : "none",
    banner: PROFILE_BANNERS.indexOf(p.banner) !== -1 ? p.banner : "none",
    nameStyle: NAME_STYLES.indexOf(p.nameStyle) !== -1 ? p.nameStyle : "normal",
    badge: PROFILE_BADGES.indexOf(p.badge) !== -1 ? p.badge : "",
    anketa_games: p.anketa_games || null,
    anketa_movies: p.anketa_movies || null  
  };
}

// ===== Таблицы производительности =====  
var GPU_SCORES = {
  "rtx 4090": 100, "rtx 4080 super": 96, "rtx 4080": 92,
  "rtx 4070 ti super": 89, "rtx 4070 ti": 85, "rtx 4070 super": 82,
  "rtx 4070": 78, "rtx 4060 ti": 62, "rtx 4060": 55,
  "rtx 3090 ti": 84, "rtx 3090": 80, "rtx 3080 ti": 76, "rtx 3080": 73,
  "rtx 3070 ti": 68, "rtx 3070": 65, "rtx 3060 ti": 58,
  "rtx 3060": 52, "rtx 3050": 40,
  "rtx 2080 ti": 66, "rtx 2080 super": 60, "rtx 2080": 58,
  "rtx 2070 super": 55, "rtx 2070": 50,
  "rtx 2060 super": 47, "rtx 2060": 43,
  "gtx 1660 ti": 42, "gtx 1660 super": 41, "gtx 1660": 38,
  "gtx 1650 super": 34, "gtx 1650": 28,
  "gtx 1080 ti": 55, "gtx 1080": 45, "gtx 1070 ti": 43, "gtx 1070": 40,
  "gtx 1060 6gb": 33, "gtx 1060 3gb": 30, "gtx 1060": 32,
  "gtx 1050 ti": 22, "gtx 1050": 18,
  "gtx 980 ti": 38, "gtx 980": 32, "gtx 970": 28, "gtx 960": 20,
  "gtx 780 ti": 22, "gtx 780": 18, "gtx 770": 14, "gtx 750 ti": 12, "gtx 750": 10,
  "rx 7900 xtx": 94, "rx 7900 xt": 88, "rx 7800 xt": 80, "rx 7700 xt": 73,
  "rx 7600": 55, "rx 7600 xt": 60,
  "rx 6950 xt": 78, "rx 6900 xt": 76, "rx 6800 xt": 74, "rx 6800": 70,
  "rx 6750 xt": 62, "rx 6700 xt": 58, "rx 6700": 54, "rx 6650 xt": 50,
  "rx 6600 xt": 52, "rx 6600": 48, "rx 6500 xt": 30,
  "rx 5700 xt": 50, "rx 5700": 45, "rx 5600 xt": 42, "rx 5500 xt": 32,
  "rx 590": 30, "rx 580": 28, "rx 570": 25, "rx 480": 22, "rx 470": 20,
  "arc a770": 52, "arc a750": 48, "arc a580": 42, "arc a380": 22,
  "intel iris xe": 12, "intel uhd 770": 8, "intel uhd 750": 6,
  "intel uhd 630": 5, "amd vega 8": 8, "amd vega 7": 7, "amd vega 6": 6,
  "radeon graphics": 6  
};

var CPU_SCORES = {
  "i9-13900k": 100, "i9-13900ks": 100, "i9-13900f": 98, "i9-13900": 98,
  "i7-13700k": 92, "i7-13700": 88,
  "i5-13600k": 82, "i5-13600": 76, "i3-13100": 56,
  "i9-12900k": 90, "i9-12900": 86,
  "i7-12700k": 84, "i7-12700": 78,
  "i5-12600k": 74, "i5-12600": 68,
  "i5-12400f": 66, "i5-12400": 66,
  "i3-12100f": 52, "i3-12100": 52,
  "i9-11900k": 80, "i9-11900": 76,
  "i7-11700k": 72, "i7-11700": 68,
  "i5-11600k": 64, "i5-11500": 60, "i5-11400": 56,
  "i9-10900k": 72, "i9-10900": 68,
  "i7-10700k": 66, "i7-10700": 62,
  "i5-10600k": 58, "i5-10400": 52, "i3-10100": 42,
  "i9-9900k": 62, "i9-9900": 58,
  "i7-9700k": 56, "i7-9700": 52,
  "i5-9600k": 48, "i5-9400": 44,
  "i7-8700k": 52, "i7-8700": 48,
  "i5-8600k": 42, "i5-8400": 38,
  "i3-8300": 26, "i3-8100": 24,
  "i7-7700k": 42, "i7-7700": 38,
  "i5-7600k": 30, "i5-7500": 26, "i3-7100": 18,
  "i7-6700k": 38, "i7-6700": 34,
  "i5-6600k": 24, "i5-6500": 22,
  "i7-4790k": 26, "i7-4790": 24,
  "i5-4690k": 20, "i5-4590": 18, "i5-4570": 18,
  "i5-3470": 14, "i5-2500k": 14, "i3-2130": 8,
  "pentium g4560": 12, "pentium g3220": 8, "pentium": 6,
  "ryzen 9 7950x": 98, "ryzen 9 7950x3d": 100,
  "ryzen 9 7900x": 88, "ryzen 9 7900": 84,
  "ryzen 7 7800x3d": 88, "ryzen 7 7700x": 82, "ryzen 7 7700": 78,
  "ryzen 5 7600x": 76, "ryzen 5 7600": 72,
  "ryzen 9 5950x": 88, "ryzen 9 5900x": 82, "ryzen 9 5900": 78,
  "ryzen 7 5800x3d": 80, "ryzen 7 5800x": 74, "ryzen 7 5700x": 68,
  "ryzen 7 5800": 68, "ryzen 7 3700x": 58,
  "ryzen 5 5600x": 66, "ryzen 5 5600": 62,
  "ryzen 5 5500": 52, "ryzen 5 3600": 52,
  "ryzen 5 2600": 42, "ryzen 5 1600": 36,
  "ryzen 3 3200g": 28, "ryzen 3 2200g": 24,
  "fx-8350": 14, "fx-6300": 10  
};

function normalizePcName(s) {
  return String(s || "").toLowerCase()
    .replace(/nvidia|geforce|amd|radeon|intel|core|ryzen|®|™|\(r\)|\(tm\)/g, " ")
    .replace(/-\s*/g, "-").replace(/\s+/g, " ").trim();
}
function lookupGpuScore(name) {
  if (!name) return null;
  var n = normalizePcName(name);
  if (!n) return null;
  if (GPU_SCORES[n]) return GPU_SCORES[n];
  var best = null, bestLen = 0;
  for (var key in GPU_SCORES) {
    if (n.indexOf(key) !== -1 || key.indexOf(n) !== -1) {
      if (key.length > bestLen) { bestLen = key.length; best = GPU_SCORES[key]; }
    }
  }
  return best;
}
function lookupCpuScore(name) {
  if (!name) return null;
  var n = normalizePcName(name);
  if (!n) return null;
  if (CPU_SCORES[n]) return CPU_SCORES[n];
  var best = null, bestLen = 0;
  for (var key in CPU_SCORES) {
    if (n.indexOf(key) !== -1 || key.indexOf(n) !== -1) {
      if (key.length > bestLen) { bestLen = key.length; best = CPU_SCORES[key]; }
    }
  }
  return best;
}
function getPcTier(score) {
  if (score == null) return null;
  if (score >= 90) return { label: "Топ", color: "#10b981" };
  if (score >= 70) return { label: "Высокий", color: "#34d399" };
  if (score >= 50) return { label: "Средний", color: "#f59e0b" };
  if (score >= 30) return { label: "Начальный", color: "#f97316" };
  return { label: "Слабый", color: "#ef4444" };
}
function getUserPC() {
  try { return JSON.parse(localStorage.getItem("mood_pc") || '{"cpu":"","gpu":"","ram":16}'); }
  catch (e) { return { cpu: "", gpu: "", ram: 16 }; }
}
function saveUserPC(pc) {
  try { localStorage.setItem("mood_pc", JSON.stringify(pc)); } catch (e) {}
  if (typeof saveUserData === "function") saveUserData();
}
function estimateGameDemand(game) {
  var yearMatch = String(game.release_date || "").match(/(\d{4})/);
  var year = yearMatch ? parseInt(yearMatch[1], 10) : 2015;
  var meta = parseFloat(game.metacritic_score) || 65;
  var votes = parseFloat(game.recommendations_total) || 0;
  var genres = String(game.genres || "").toLowerCase();
  var demand = 30;
  demand += Math.max(0, (year - 2010) * 1.5);
  demand += Math.max(0, (meta - 70) * 0.6);
  if (votes > 200000) demand += 12;
  else if (votes > 50000) demand += 7;
  else if (votes > 10000) demand += 3;
  if (/action|shooter|adventure|rpg/.test(genres)) demand += 6;
  if (/indie|casual|puzzle|visual novel|simulation/.test(genres)) demand -= 15;
  demand = Math.max(15, Math.min(95, demand));
  var minGpu = Math.max(8, Math.min(85, demand - 25));
  var recGpu = Math.max(20, Math.min(100, demand + 5));
  var minCpu = Math.max(10, Math.min(85, demand - 20));
  var recCpu = Math.max(25, Math.min(100, demand + 5));
  var minRam = demand < 30 ? 4 : demand < 55 ? 8 : demand < 75 ? 12 : 16;
  var recRam = demand < 30 ? 6 : demand < 55 ? 12 : demand < 75 ? 16 : 24;
  return {
    demand: Math.round(demand), minGpu: Math.round(minGpu), recGpu: Math.round(recGpu),
    minCpu: Math.round(minCpu), recCpu: Math.round(recCpu),
    minRam: minRam, recRam: Math.round(recRam), year: year  
  };
}
function estimateFps(game, pc) {
  var req = estimateGameDemand(game);
  var gpuScore = lookupGpuScore(pc.gpu);
  var cpuScore = lookupCpuScore(pc.cpu);
  var ram = Number(pc.ram) || 8;
  if (gpuScore == null) return { error: "Не удалось распознать видеокарту. Проверьте название в панели ПК." };
  if (cpuScore == null) cpuScore = 50;
  var fpsLow    = (gpuScore / req.minGpu) * 60;
  var fpsMedium = (gpuScore / ((req.minGpu + req.recGpu) / 2)) * 60;
  var fpsHigh   = (gpuScore / req.recGpu) * 60;
  var fpsUltra  = fpsHigh * 0.65;
  var cpuFactor = cpuScore / req.recCpu;
  if (cpuFactor < 1) {
    var cap = 60 + cpuFactor * 100;
    fpsLow    = Math.min(fpsLow,    cap * 1.5);
    fpsMedium = Math.min(fpsMedium, cap * 1.2);
    fpsHigh   = Math.min(fpsHigh,   cap);
    fpsUltra  = Math.min(fpsUltra,  cap * 0.85);
  }
  var ramPenalty = ram < req.minRam ? 0.5 : ram < req.recRam ? 0.75 : 1;
  fpsLow *= ramPenalty; fpsMedium *= ramPenalty;
  fpsHigh *= ramPenalty; fpsUltra *= ramPenalty;
  function clampFps(x) { return Math.round(Math.max(5, Math.min(350, x))); }
  var notes = [];
  if (cpuFactor < 0.75) notes.push("CPU ограничивает производительность");
  if (ram < req.recRam) notes.push("Рекомендуется больше RAM");
  return {
    low: clampFps(fpsLow), medium: clampFps(fpsMedium),
    high: clampFps(fpsHigh), ultra: clampFps(fpsUltra),
    notes: notes, req: req, gpuScore: gpuScore, cpuScore: cpuScore, ram: ram  
  };
}
function fpsColor(fps) {
  if (fps >= 60) return "#10b981";
  if (fps >= 40) return "#34d399";
  if (fps >= 30) return "#f59e0b";
  if (fps >= 20) return "#f97316";
  return "#ef4444";
}
function fpsBarWidth(fps) { return Math.min(100, Math.round((fps / 120) * 100)); }

function buildMiniFpsHtml(game) {
  var pc = getUserPC();
  if (!pc.gpu || !pc.cpu) return "";
  var res = estimateFps(game, pc);
  if (res.error) return "";
  function cell(lbl, v) {
    return '<div class="cfm-item">' +
      '<div class="cfm-lbl">' + lbl + '</div>' +
      '<div class="cfm-val" style="color:' + fpsColor(v) + '">' + v + '</div>' +
      '</div>';
  }
  return '<div class="card-fps-mini">' +
    cell("Низ", res.low) + cell("Ср", res.medium) +
    cell("Выс", res.high) + cell("Ультра", res.ultra) +
    '</div>';
}

function renderFpsBlock(game) {
  var pc = getUserPC();
  if (!pc.gpu || !pc.cpu) {
    return '<div class="fps-block fps-block-empty">' +
      '<div class="fps-block-title">Узнайте свой FPS в этой игре</div>' +
      '<p class="fps-block-sub">Укажите процессор и видеокарту один раз — и мы покажем FPS на всех настройках графики.</p>' +
      '<button type="button" class="btn-primary fps-setup-btn" onclick="openPcPanel()">Настроить мой ПК</button>' +
      '</div>';
  }
  var result = estimateFps(game, pc);
  if (result.error) {
    return '<div class="fps-block fps-block-empty">' +
      '<div class="fps-block-title">FPS на вашем ПК</div>' +
      '<p class="fps-block-sub" style="color:#f87171;">' + esc(result.error) + '</p>' +
      '<button type="button" class="btn-primary fps-setup-btn" onclick="openPcPanel()">Исправить ПК</button>' +
      '</div>';
  }
  var cpuLabel = (pc.cpu || "CPU").split(" ").slice(0, 3).join(" ");
  var gpuLabel = (pc.gpu || "GPU").split(" ").slice(0, 3).join(" ");
  var presets = [
    { label: "Низкие",  fps: result.low },
    { label: "Средние", fps: result.medium },
    { label: "Высокие", fps: result.high },
    { label: "Ультра",  fps: result.ultra }
  ];
  var html = '<div class="fps-block">';
  html += '<div class="fps-block-title">FPS на вашем ПК</div>';
  html += '<div class="fps-config">';
  html += '<span>' + esc(gpuLabel) + '</span>';
  html += '<span>' + esc(cpuLabel) + '</span>';
  html += '<span>' + esc(String(result.ram)) + ' GB</span>';
  html += '<button type="button" class="fps-edit-btn" onclick="openPcPanel()">✎ Изменить</button>';
  html += '</div>';
  html += '<div class="fps-grid">';
  presets.forEach(function (p) {
    var color = fpsColor(p.fps), width = fpsBarWidth(p.fps);
    html += '<div class="fps-item">';
    html += '<div class="fps-label">' + p.label + '</div>';
    html += '<div class="fps-value" style="color:' + color + '">' + p.fps + '</div>';
    html += '<div class="fps-unit">FPS</div>';
    html += '<div class="fps-bar"><div class="fps-bar-fill" style="width:' + width + '%;background:' + color + ';"></div></div>';
    html += '</div>';
  });
  html += '</div>';
  if (result.notes && result.notes.length) {
    html += '<div class="fps-note">' + result.notes.join(" · ") + '</div>';
  } else {
    html += '<div class="fps-note">Оценка приблизительная. Реальный FPS зависит от драйверов, ОС и настроек.</div>';
  }
  html += '</div>';
  return html;
}

// ===== Категории, жанры, состояние =====  
var categoryParams = {
  action:    { genre: "боевик",      minRating: "6.5", minVotes: "20000" },
  comedy:    { genre: "комедия",     minRating: "6.5", minVotes: "20000" },
  scifi:     { genre: "фантастика",  minRating: "6.5", minVotes: "20000" },
  fantasy:   { genre: "фэнтези",     minRating: "6.5", minVotes: "20000" },
  thriller:  { genre: "триллер",     minRating: "7",   minVotes: "20000" },
  crime:     { genre: "криминал",    minRating: "7",   minVotes: "30000" },
  romance:   { genre: "мелодрама",   minRating: "6.5", minVotes: "20000" },
  cartoon:   { type:  "cartoon",     minRating: "6.5", minVotes: "10000" },
  horror:    { genre: "ужасы",       minRating: "6",   minVotes: "10000" },
  adventure: { genre: "приключения", minRating: "7",   minVotes: "20000" }
};

var genreTranslations = {
  "Action": "боевик", "Adventure": "приключения", "Animation": "анимация",
  "Biography": "биография", "Comedy": "комедия", "Crime": "криминал",
  "Documentary": "документальный", "Drama": "драма", "Family": "семейный",
  "Fantasy": "фэнтези", "History": "история", "Horror": "ужасы",
  "Music": "музыка", "Mystery": "детектив", "Romance": "мелодрама",
  "Sci-Fi": "фантастика", "Sport": "спорт", "Thriller": "триллер",
  "War": "военный", "Western": "вестерн", "Children": "детский"
};

var gameGenreRu = {
  "Action": "экшен", "Adventure": "приключения", "Animation": "мультфильм",
  "Casual": "казуальная", "Comedy": "комедия", "Indie": "инди",
  "Massively Multiplayer": "MMO", "RPG": "RPG", "Racing": "гонки",
  "Simulation": "симулятор", "Sports": "спорт", "Strategy": "стратегия",
  "Horror": "хоррор", "Survival": "выживание", "Stealth": "стелс",
  "Puzzle": "головоломка", "Platformer": "платформер",
  "Roguelike": "рогалик", "Shooter": "шутер", "Fighting": "файтинг",
  "Card": "карточная", "Visual Novel": "визуальная новелла",
  "Souls-like": "souls-like"
};

var currentMood = null, currentType = "movie", lastSearchQuery = null;
var currentMovies = [], currentUser = null, currentAlternatives = [];
var currentProfile = Object.assign({}, DEFAULT_PROFILE);
var firebaseReady = false, fbAuth = null, fbDb = null, fbProvider = null;
var fbUnsubscribe = null;
var aiLastQuery = "", aiLastVague = true, aiRetryUsed = false, aiBusy = false;
var allGames = [], filteredGames = [], gamesLoaded = false, gamesStarted = false;
var gamesDisplayCount = 100;
var gameFilters = { query: "", mood: "all", price: "all", year: "all", sort: "popular" };
var waveType = "games";
var favoritesType = "games";
var perfMode = false;
try { perfMode = localStorage.getItem("mood_perf_mode") === "1"; } catch (e) {}
var currentOpenGame = null;
var _saveTimer = null;
var _profileDraft = Object.assign({}, DEFAULT_PROFILE);

var MOOD_RULES = {
  relax: {
    include: /relax|casual|chill|cozy|calm|peaceful|wholesome|friendly|heartwarm|comfort|mindful|meditative|puzzle|jigsaw|hidden.?object|point.?and.?click|visual.?novel|walking.?sim|city.?builder|farm|farming|garden|nature|kawaii|painting|music|rhythm|cooking|gardening|aquarium|pet|cat|dog|pixel.?art|short|atmospheric|exploration|cute|family/i,
    exclude: /horror|zombie|undead|vampire|scary|terror|creepy|nightmare|monster|ghost|demon|paranormal|slender|fnaf|blood|bloody|gore|brutal|violen|kill|murder|combat|shooter|fight|war|battle|weapon|gun|rifle|apocalyp|dystop|grim|dark.?souls|darkest|doom|dead space|dark.?fantasy|survival.?horror|dark|sad|tragic|death|dying|suicid|psycho|cult|exorcis|satan|hell/i,
    minMeta: 60, minVotes: 100  
  },
  action: {
    include: /action|shooter|fight|combat|fast.?paced|intense|war|battle|arena|beat.?em.?up|hack.?and.?slash|twin.?stick|shoot.?em.?up|run.?and.?gun|sidescroll|fps|tps/i,
    exclude: /horror|zombie|scary|terror|creepy|nightmare|casual|relax|chill|cozy|puzzle|wholesome|jigsaw|hidden.?object|match.?3|cooking|visual.?novel|point.?and.?click|diary|dating.?sim/i,
    minMeta: 65, minVotes: 200  
  },
  story: {
    include: /story|narrative|adventure|rpg|dialogue|choice|plot|character|cinematic|walking.?sim|quest|saga|lore|companion|decision|tell.?tale|life.?is.?strange|heavy.?rain/i,
    exclude: /horror|zombie|scary|terror|creepy|casual|relax|arcade|rogue.?like|bullet.?hell|survival.?horror/i,
    minMeta: 65, minVotes: 150  
  },
  hardcore: {
    include: /souls.?like|hardcore|difficult|challenge|rogue.?like|rogue.?lite|permadeath|punishing|brutal|boss.?rush|competitive|esport|leaderboard|dead cells|nuclear throne|hades|dark souls|hollow knight|celeste|sekiro|bloodborne|cuphead|sifu|nioh|darkest dungeon|slay the spire|risk of rain|noita|binding of isaac|enter the gungeon/i,
    exclude: /casual|relax|chill|cozy|walking.?sim|visual.?novel|point.?and.?click|hidden.?object|match.?3|farm|cooking|dating.?sim/i,
    minMeta: 68, minVotes: 200  
  },
  horror: {
    include: /horror|zombie|undead|vampire|scary|terror|creepy|nightmare|monster|ghost|demon|paranormal|survival.?horror|fnaf|amnesia|outlast|silent hill|resident evil|dead space|phasmophobia|layers of fear|until dawn|the evil within|visage|blair witch|penumbra|soma|cult|exorcist|haunted/i,
    exclude: null,
    minMeta: 55, minVotes: 100  
  }
};

var kinopoiskCache = {};
try { kinopoiskCache = JSON.parse(localStorage.getItem("kinopoisk_cache") || "{}"); } catch (e) {}
function saveKinopoiskCache() {
  try { localStorage.setItem("kinopoisk_cache", JSON.stringify(kinopoiskCache)); } catch (e) {}
}
function $(id) { return document.getElementById(id); }

// ===== Утилиты =====  
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function jsStr(s) {
  return JSON.stringify(String(s || ""))
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function normalize(s) {
  return (s || "").toLowerCase().replace(/ё/g, "е")
    .replace(/[^\wа-я0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  var prev = Array(b.length + 1).fill(0).map(function (_, i) { return i; });
  for (var i = 1; i <= a.length; i++) {
    var cur = [i];
    for (var j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}
function relevanceScore(query, candidateTitle) {
  var q = normalize(query), t = normalize(candidateTitle);
  if (!q || !t) return 0;
  if (t === q) return 1;
  if (t.indexOf(q) === 0) return 0.95;
  if (t.indexOf(q) !== -1) return 0.85;
  return Math.max(0, 1 - levenshtein(q, t) / Math.max(q.length, t.length));
}
function isVagueQuery(text) {
  var t = (text || "").trim();
  if (!t) return true;
  var w = t.split(/\s+/).filter(Boolean);
  var s = 0;
  if (w.length >= 6) s += 2;
  else if (w.length >= 4) s += 1;
  if (/[А-ЯЁA-Z]/.test(t.slice(1))) s += 1;
  if (/[«»"']/.test(t)) s += 1;
  if (/\d/.test(t)) s += 1;
  return s < 2;
}

var STOPWORDS = ["хочу","хотел","хотела","хотелось","хочется","фильм","фильмы","фильма","кино","про","о","об","обо","мне","меня","нам","тебе","вам","покажи","покажите","найди","найдите","подбери","подберите","посмотреть","смотреть","глянуть","включить","где","что","как","когда","кто","почему","зачем","куда","и","с","со","на","в","во","по","для","или","но","да","не","ни","без","очень","самый","самая","самое","самые","такой","такая","такое","такие","типа","вроде","похожий","похожее","похожая","похожие","чем","то","это","этот","эта","эти","один","одна","одно","два","две","три","четыре","пять","хороший","хорошая","хорошее","хорошие","плохой","плохая","плохое","плохие","новый","новая","новое","новые","новинка","новинки","старый","старая","старое","старые","настроение","настроения","настроению","посоветуй","посоветуйте","порекомендуй","порекомендуйте","сегодня","вечером","вечер","утром","выходные","хорошо","плохо","класс","супер","вау","ну","вот","так","там","тут","здесь","игра","игру","игры","поиграть","играть","что-нибудь","нибудь","любой","любая","любое"];
function keywordStem(w) {
  w = String(w || "").toLowerCase().replace(/ё/g, "е");
  return w.length <= 5 ? w : w.slice(0, 5);
}
function extractKeywords(text) {
  var t = (text || "").toLowerCase().replace(/ё/g, "е");
  var words = t.split(/[^\wа-я0-9]+/i).filter(Boolean);
  var out = [], seen = {};
  words.forEach(function (w) {
    if (w.length < 3) return;
    if (STOPWORDS.indexOf(w) !== -1) return;
    var stem = keywordStem(w);
    if (!stem || stem.length < 3) return;
    if (seen[stem]) return;
    seen[stem] = 1;
    out.push({ word: w, stem: stem });
  });
  return out;
}
function keywordMatch(movie, stems) {
  var text = [movie.title || "", movie.originalTitle || "", movie.description || "", (movie.genres || []).join(" ")]
    .join(" ").toLowerCase().replace(/ё/g, "е");
  for (var i = 0; i < stems.length; i++) if (text.indexOf(stems[i]) !== -1) return true;
  return false;
}
function fillFromKeywords(keywordPairs, limit) {
  if (!keywordPairs || !keywordPairs.length) return Promise.resolve([]);
  var words = keywordPairs.map(function (x) { return x.word; }).slice(0, 4);
  var stems = keywordPairs.map(function (x) { return x.stem; });
  return Promise.all(words.map(function (w) { return fetchKinopoiskRaw(w, 20); }))
    .then(function (arrays) {
      var seen = {}, all = [];
      arrays.forEach(function (arr) {
        arr.forEach(function (m) {
          var key = normalize(m.title);
          if (seen[key]) return;
          if (!keywordMatch(m, stems)) return;
          seen[key] = 1;
          all.push(m);
        });
      });
      all.sort(popularitySort);
      return all.slice(0, limit || 40);
    });
}
function showToast(text, isError) {
  var toast = $("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.className = "toast";
    toast.textContent = "";
  }, 2500);
}
function setSyncStatus(state, title) {
  var el = $("sync-status");
  if (!el) return;
  el.className = "sync-status";
  if (!state) { el.textContent = ""; el.removeAttribute("data-state"); return; }
  if (state === "ok") { el.classList.add("sync-ok"); el.setAttribute("data-state", "ok"); el.textContent = "✓"; }
  else if (state === "busy") { el.classList.add("sync-busy"); el.setAttribute("data-state", "sync"); el.textContent = ""; }
  else if (state === "error") { el.classList.add("sync-error"); el.setAttribute("data-state", "err"); el.textContent = ""; }
  if (title) el.title = title;
}
function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms || 20000); })
  ]);
}
function extractYear(title) {
  var m = (title || "").match(/\((\d{4})\)\s*$/);
  return m ? m[1] : "";
}
function cleanTitle(title) { return (title || "").replace(/\s*\(\d{4}\)\s*$/, "").trim(); }

// ===== Избранное игр / статистика / дизлайки =====  
function getGameFavorites() {
  try { return JSON.parse(localStorage.getItem("mood_game_favorites") || "[]"); }
  catch (e) { return []; }
}
function saveGameFavorites(l) {
  try { localStorage.setItem("mood_game_favorites", JSON.stringify(l)); } catch (e) {}
  saveUserData();
}
function isGameFavorite(appid) {
  return getGameFavorites().some(function (g) { return String(g.appid) === String(appid); });
}
function toggleGameFavorite(game) {
  var l = getGameFavorites(), idx = -1;
  for (var i = 0; i < l.length; i++) {
    if (String(l[i].appid) === String(game.appid)) { idx = i; break; }
  }
  if (idx === -1) {
    l.push({
      appid: game.appid, name: game.name, header_image: game.header_image,
      short_description: game.short_description, genres: game.genres,
      release_date: game.release_date, is_free: game.is_free,
      mat_final_price: game.mat_final_price, metacritic_score: game.metacritic_score,
      recommendations_total: game.recommendations_total, developers: game.developers  
    });
    saveGameFavorites(l);
    return true;
  }
  l.splice(idx, 1);
  saveGameFavorites(l);
  return false;
}
function getCategoryStats() {
  try { return JSON.parse(localStorage.getItem("mood_category_stats") || '{"movies":{},"games":{}}'); }
  catch (e) { return { movies: {}, games: {} }; }
}
function saveCategoryStats(s) {
  try { localStorage.setItem("mood_category_stats", JSON.stringify(s)); } catch (e) {}
  saveUserData();
}
function trackCategoryVisit(cat, type) {
  if (!cat || cat === "all") return;
  var s = getCategoryStats();
  if (!s[type]) s[type] = {};
  s[type][cat] = (s[type][cat] || 0) + 1;
  saveCategoryStats(s);
}
function getTopKeys(obj, n) {
  var arr = Object.keys(obj || {}).map(function (k) { return { k: k, v: obj[k] }; });
  arr.sort(function (a, b) { return b.v - a.v; });
  return arr.slice(0, n || 5).map(function (x) { return x.k; });
}
function getGameSearches() {
  try { return JSON.parse(localStorage.getItem("mood_game_searches") || "[]"); }
  catch (e) { return []; }
}
function trackGameSearch(q) {
  q = (q || "").trim();
  if (q.length < 3) return;
  var l = getGameSearches(), found = null;
  for (var i = 0; i < l.length; i++) if (l[i].q === q) { found = l[i]; break; }
  if (found) found.count++;
  else l.push({ q: q, count: 1 });
  l.sort(function (a, b) { return b.count - a.count; });
  if (l.length > 30) l = l.slice(0, 30);
  try { localStorage.setItem("mood_game_searches", JSON.stringify(l)); } catch (e) {}
  saveUserData();
}
function getDislikedMovies() {
  try { return JSON.parse(localStorage.getItem("mood_disliked_movies") || "[]"); }
  catch (e) { return []; }
}
function getDislikedGames() {
  try { return JSON.parse(localStorage.getItem("mood_disliked_games") || "[]"); }
  catch (e) { return []; }
}
function isMovieDisliked(title) { return getDislikedMovies().indexOf(title) !== -1; }
function isGameDisliked(appid) { return getDislikedGames().indexOf(String(appid)) !== -1; }
function dislikeMovieByTitle(title) {
  var l = getDislikedMovies();
  if (l.indexOf(title) === -1) l.push(title);
  try { localStorage.setItem("mood_disliked_movies", JSON.stringify(l)); } catch (e) {}
  saveUserData();
  showToast("Скрыто. Похожее больше не покажем", false);
}
function dislikeGameById(appid) {
  var l = getDislikedGames();
  if (l.indexOf(String(appid)) === -1) l.push(String(appid));
  try { localStorage.setItem("mood_disliked_games", JSON.stringify(l)); } catch (e) {}
  saveUserData();
  showToast("Скрыто. Похожее больше не покажем", false);
}

// ===== Кинопоиск =====  
function mapDoc(d) {
  return {
    kp_id: d.id || null,
    title: d.name || d.alternativeName || "",
    originalTitle: d.alternativeName || d.nameOriginal || "",
    year: d.year || "",
    poster: d.poster ? (d.poster.previewUrl || d.poster.url) : null,
    rating: d.rating && d.rating.kp ? d.rating.kp : (d.rating && d.rating.imdb ? d.rating.imdb : null),
    description: d.shortDescription || d.description || "",
    genres: (d.genres || []).map(function (g) { return g.name; }),
    votes: d.votes && d.votes.kp ? d.votes.kp : 0,
    type: d.type || ""
  };
}
function fetchKinopoiskRaw(query, limit) {
  var url = BASE + "?query=" + encodeURIComponent(query) + "&limit=" + (limit || 10);
  return fetchWithTimeout(url, 15000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      return (!data || !data.docs) ? [] : data.docs.map(mapDoc).filter(function (m) { return m.poster; });
    })
    .catch(function (e) { console.log("[BASE]", e && e.message); return []; });
}
function fetchKinopoisk(title) {
  var key = "v2:" + normalize(title);
  if (kinopoiskCache[key]) return Promise.resolve(kinopoiskCache[key]);
  return fetchKinopoiskRaw(title, 10).then(function (cand) {
    if (!cand.length) return null;
    var sc = cand.map(function (m) {
      return { m: m, s: Math.max(relevanceScore(title, m.title), relevanceScore(title, m.originalTitle)) };
    }).filter(function (x) { return x.s >= 0.55; });
    if (!sc.length) return null;
    sc.sort(function (a, b) {
      return Math.abs(b.s - a.s) > 0.05 ? b.s - a.s : (b.m.votes || 0) - (a.m.votes || 0);
    });
    kinopoiskCache[key] = sc[0].m;
    saveKinopoiskCache();
    return sc[0].m;
  });
}
function matchType(m, type) {
  if (type === "movie") return m.type === "movie" || m.type === "";
  if (type === "series") return m.type === "tv-series" || m.type === "mini-series";
  if (type === "cartoon") return (m.genres || []).indexOf("анимация") !== -1 || m.type === "cartoon";
  if (type === "documentary") return (m.genres || []).indexOf("документальный") !== -1 || m.type === "documentary";
  return true;
}
function fetchCandidatesFromKinopoisk(query, limit, typeFilter) {
  return fetchKinopoiskRaw(query, limit || 30).then(function (movies) {
    return typeFilter ? movies.filter(function (m) { return matchType(m, typeFilter); }) : movies;
  });
}
function readFilters() {
  var rf = $("rating-filter"), yf = $("year-filter");
  return {
    minRating: parseFloat((rf && rf.value) || 0),
    minYear: Math.max(1900, parseInt((yf && yf.value) || 1900, 10) || 1900),
    unwatchedOnly: $("filter-unwatched") ? $("filter-unwatched").checked : false,
    newOnly: $("filter-new") ? $("filter-new").checked : false  
  };
}
function passUserFilters(m) {
  var f = readFilters();
  var now = new Date().getFullYear();
  var r = m.rating || 0, y = parseInt(m.year, 10) || 0;
  if (r > 0 && r < f.minRating) return false;
  if (y && y < f.minYear) return false;
  if (f.unwatchedOnly && isWatched(cleanTitle(m.title))) return false;
  if (f.newOnly && y < now - 1) return false;
  if (isHidden(cleanTitle(m.title))) return false;
  if (isMovieDisliked(cleanTitle(m.title))) return false;
  return true;
}
function popularitySort(a, b) {
  return (Math.log10((b.votes || 0) + 1) * 3 + (b.rating || 0)) -
         (Math.log10((a.votes || 0) + 1) * 3 + (a.rating || 0));
}

// ===== Firebase =====  
function initFirebase() {
  if (!window.firebaseAuth) return;
  fbAuth = window.firebaseAuth;
  fbDb = window.firebaseDb;
  fbProvider = window.googleProvider;
  firebaseReady = true;
  setSyncStatus("ok", "Firebase готов");
  window.firebaseOnAuth(fbAuth, function (user) {
    if (user) {
      currentUser = { id: user.uid, name: user.displayName || user.email, picture: user.photoURL };
      try { localStorage.setItem("mood_user", JSON.stringify(currentUser)); } catch (e) {}
      renderUserInfo();
      startRealtimeSync(user.uid);
    } else {
      currentUser = null;
      currentProfile = Object.assign({}, DEFAULT_PROFILE);
      try { localStorage.removeItem("mood_user"); } catch (e) {}
      if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
      setSyncStatus(null);
      renderUserInfo();
    }
  });
}
function startRealtimeSync(uid) {
  if (!firebaseReady || !fbDb || !window.firebaseOnSnapshot) return;
  if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
  try {
    fbUnsubscribe = window.firebaseOnSnapshot(window.firebaseDoc(fbDb, "users", uid),
      function (snap) {
        if (!snap.exists()) return;
        applyRemoteData(snap.data());
      },
      function (err) {
        console.error("[Firebase] onSnapshot:", err);
        if (err.code === "unavailable" || /blocked/i.test(err.message || "")) {
          setSyncStatus("error", "Синхронизация заблокирована браузером/адблоком");
        } else if (err.code === "permission-denied") {
          setSyncStatus("error", "Firestore правила запрещают доступ");
        }
      }
    );
  } catch (e) {
    console.error("[Firebase] onSnapshot init failed:", e);
  }
}
function applyRemoteData(d) {
  if (!d) return;
  var changed = false;
  function setIf(key, remoteVal) {
    if (!remoteVal) return;
    try {
      var cur = localStorage.getItem(key);
      var neu = JSON.stringify(remoteVal);
      if (cur !== neu) { localStorage.setItem(key, neu); changed = true; }
    } catch (e) {}
  }
  setIf("mood_movies_playlists", d.playlists);
  setIf("mood_watched", d.watched);
  setIf("mood_hidden", d.hidden);
  setIf("mood_game_favorites", d.gameFavorites);
  setIf("mood_category_stats", d.categoryStats);
  setIf("mood_game_searches", d.gameSearches);
  setIf("mood_disliked_movies", d.dislikedMovies);
  setIf("mood_disliked_games", d.dislikedGames);
  setIf("mood_pc", d.userPC);

  // ФИКС: не терять локальную анкету, если из облака пришло пусто  
  if (d.profile) {
    var merged = sanitizeProfile(Object.assign({}, DEFAULT_PROFILE, d.profile));
    if (!merged.anketa_games && currentProfile.anketa_games) {
      merged.anketa_games = currentProfile.anketa_games;
    }
    if (!merged.anketa_movies && currentProfile.anketa_movies) {
      merged.anketa_movies = currentProfile.anketa_movies;
    }
    if (JSON.stringify(merged) !== JSON.stringify(currentProfile)) {
      currentProfile = merged;
      try { localStorage.setItem("mood_profile", JSON.stringify(currentProfile)); } catch (e) {}
      renderUserInfo();
      changed = true;
    }
  }
  if (d.accent && localStorage.getItem("mood_accent") !== d.accent) {
    try { localStorage.setItem("mood_accent", d.accent); } catch (e) {}
    document.body.setAttribute("data-accent", d.accent);
    changed = true;
  }
  if (d.theme && localStorage.getItem("mood_theme") !== d.theme) {
    try { localStorage.setItem("mood_theme", d.theme); } catch (e) {}
    document.body.classList.toggle("light", d.theme === "light");
    changed = true;
  }
  if (changed) {
    setSyncStatus("ok", "Данные обновлены из облака");
    renderPlaylists();
    refreshUIAfterLoad();
    showToast("Обновлено из облака");
  } else {
    setSyncStatus("ok", "Синхронизировано");
  }
}

// ===== Render user info / профиль =====  
function renderUserInfo() {
  var el = $("user-info"), btn = $("google-login-btn");
  if (!el) return;
  if (currentUser) {
    el.style.display = "inline-flex";
    if (btn) btn.style.display = "none";
    var avatar = currentProfile.avatar || currentUser.picture || "";
    var name = currentProfile.name || currentUser.name || "";
    var color = currentProfile.color || "#e8eaed";
    var safeAvatar = /^https?:\/\//i.test(avatar) ? avatar : "";
    var frame = AVATAR_FRAMES.indexOf(currentProfile.avatarFrame) !== -1 ? currentProfile.avatarFrame : "none";
    var style = NAME_STYLES.indexOf(currentProfile.nameStyle) !== -1 ? currentProfile.nameStyle : "normal";
    var badge = PROFILE_BADGES.indexOf(currentProfile.badge) !== -1 ? currentProfile.badge : "";
    el.innerHTML =
      '<span class="user-avatar-wrap af-' + frame + '">' +
        (safeAvatar ? '<img src="' + esc(safeAvatar) + '" alt="">' : '') +
      '</span>' +
      '<span class="user-name ns-' + style + '" style="color:' + esc(color) + '">' +
        (badge ? '<span class="user-badge">' + badge + '</span>' : '') +
        esc(name) +
      '</span>' +
      '<button type="button" id="edit-prof-btn" aria-label="Редактировать профиль">✎</button>' +
      '<button type="button" id="logout-btn">Выйти</button>';
    if ($("edit-prof-btn")) $("edit-prof-btn").onclick = openProfile;
    if ($("logout-btn")) $("logout-btn").onclick = function () {
      window.firebaseSignOut(fbAuth).then(function () {
        currentUser = null;
        currentProfile = Object.assign({}, DEFAULT_PROFILE);
        try { localStorage.removeItem("mood_user"); } catch (e) {}
        if (fbUnsubscribe) { fbUnsubscribe(); fbUnsubscribe = null; }
        setSyncStatus(null);
        renderUserInfo();
      });
    };
  } else {
    el.style.display = "none";
    if (btn) btn.style.display = "inline-flex";
  }
}
function initGoogleLogin() {
  var btn = $("google-login-btn");
  if (!btn) return;
  btn.onclick = function () {
    if (!firebaseReady) { showToast("Подождите...", true); return; }
    window.firebaseSignIn(fbAuth, fbProvider).catch(function (err) {
      showToast(err.code === "auth/popup-blocked" ? "Разрешите всплывающие окна!" : "Ошибка: " + err.message, true);
    });
  };
}
function _profilePreviewApply() {
  var d = sanitizeProfile(_profileDraft);
  var banner = $("profile-preview-banner");
  var wrap   = $("profile-preview-avatar-wrap");
  var av     = $("profile-preview-avatar");
  var nm     = $("profile-preview-name");
  var bio    = $("profile-preview-bio");
  if (banner) banner.className = "pp-banner pb-" + d.banner;
  if (wrap)   wrap.className = "pp-avatar-wrap af-" + d.avatarFrame;
  if (av) {
    var src = /^https?:\/\//i.test(d.avatar) ? d.avatar : "https://via.placeholder.com/120x120/1a1d28/8f9bab?text=%3F";
    av.src = src;
  }
  if (nm) {
    nm.className = "pp-name ns-" + d.nameStyle;
    nm.style.color = d.color;
    nm.innerHTML = (d.badge ? '<span class="user-badge">' + d.badge + '</span>' : '') + esc(d.name || "Ваш ник");
  }
  if (bio) bio.textContent = d.bio || "Коротко о себе";
}
function _syncPickRows() {
  document.querySelectorAll(".pick-row").forEach(function (row) {
    var group = row.dataset.group;
    var value = _profileDraft[group];
    row.querySelectorAll(".pick-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.value === (value == null ? "" : value));
    });
  });
  document.querySelectorAll(".profile-color-dot").forEach(function (d) {
    d.classList.toggle("active", d.dataset.color === _profileDraft.color);
  });
}
function openProfile() {
  var m = $("profile-modal");
  _profileDraft = sanitizeProfile(currentProfile);
  if ($("profile-name-input")) $("profile-name-input").value = _profileDraft.name || (currentUser ? currentUser.name || "" : "");
  if ($("profile-avatar-input")) $("profile-avatar-input").value = _profileDraft.avatar || (currentUser ? currentUser.picture || "" : "");
  if ($("profile-bio-input")) $("profile-bio-input").value = _profileDraft.bio || "";
  _syncPickRows();
  _profilePreviewApply();
  var pl = getPlaylists(), c = 0;
  for (var k in pl) c += pl[k].length;
  if ($("profile-stats")) $("profile-stats").innerHTML =
    "Фильмов в плейлистах: <b>" + c + "</b><br>" +
    "Просмотрено: <b>" + getWatched().length + "</b><br>" +
    "Избранных игр: <b>" + getGameFavorites().length + "</b>";
  if (m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); }
}
function initProfile() {
  var m = $("profile-modal");
  if ($("profile-modal-close")) $("profile-modal-close").onclick = function () {
    if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  };
  if ($("profile-name-input")) $("profile-name-input").oninput = function () {
    _profileDraft.name = this.value.slice(0, 40); _profilePreviewApply();
  };
  if ($("profile-avatar-input")) $("profile-avatar-input").oninput = function () {
    _profileDraft.avatar = this.value.slice(0, 500); _profilePreviewApply();
  };
  if ($("profile-bio-input")) $("profile-bio-input").oninput = function () {
    _profileDraft.bio = this.value.slice(0, 120); _profilePreviewApply();
  };
  document.querySelectorAll(".pick-row").forEach(function (row) {
    row.querySelectorAll(".pick-btn").forEach(function (btn) {
      btn.onclick = function () {
        var group = row.dataset.group;
        _profileDraft[group] = this.dataset.value || "";
        _syncPickRows();
        _profilePreviewApply();
      };
    });
  });
  document.querySelectorAll(".profile-color-dot").forEach(function (dot) {
    dot.onclick = function () {
      _profileDraft.color = this.dataset.color;
      _syncPickRows();
      _profilePreviewApply();
    };
  });
  if ($("profile-save-btn")) $("profile-save-btn").onclick = function () {
    currentProfile = sanitizeProfile(_profileDraft);
    try { localStorage.setItem("mood_profile", JSON.stringify(currentProfile)); } catch (e) {}
    renderUserInfo();
    saveUserData();
    if (typeof pushPublicProfile === "function") pushPublicProfile();
    showToast("Профиль сохранён");
    if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  };
  var saved = localStorage.getItem("mood_profile");
  if (saved) { try { currentProfile = sanitizeProfile(JSON.parse(saved)); } catch (e) {} }
}
function buildProfileCardHtml(profile) {
  var d = sanitizeProfile(profile);
  var src = /^https?:\/\//i.test(d.avatar) ? d.avatar : "https://via.placeholder.com/120x120/1a1d28/8f9bab?text=%3F";
  return '<div class="profile-preview">' +
    '<div class="pp-banner pb-' + d.banner + '"></div>' +
    '<div class="pp-body">' +
      '<div class="pp-avatar-wrap af-' + d.avatarFrame + '"><img src="' + esc(src) + '" alt=""></div>' +
      '<div class="pp-name ns-' + d.nameStyle + '" style="color:' + esc(d.color) + '">' +
        (d.badge ? '<span class="user-badge">' + d.badge + '</span>' : '') +
        esc(d.name || "Без имени") +
      '</div>' +
      '<div class="pp-bio">' + esc(d.bio || "") + '</div>' +
    '</div>' +
  '</div>';
}

// ===== Синхронизация =====  
function saveUserData() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  setSyncStatus("busy", "Сохранение...");
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_flushSave, 600);
}
function _flushSave() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  var payload = {
    playlists: getPlaylists(),
    watched: getWatched(),
    hidden: getHidden(),
    profile: currentProfile,
    accent: localStorage.getItem("mood_accent") || "",
    theme: localStorage.getItem("mood_theme") || "dark",
    gameFavorites: getGameFavorites(),
    categoryStats: getCategoryStats(),
    gameSearches: getGameSearches(),
    dislikedMovies: getDislikedMovies(),
    dislikedGames: getDislikedGames(),
    userPC: getUserPC()
  };
  window.firebaseSetDoc(window.firebaseDoc(fbDb, "users", currentUser.id), payload, { merge: true })
    .then(function () { setSyncStatus("ok", "Сохранено в облако"); })
    .catch(function (err) {
      console.error("[Firebase] Ошибка:", err);
      if (err.code === "permission-denied") {
        setSyncStatus("error", "Firestore правила запрещают запись");
        showToast("Правила Firestore запрещают запись.", true);
      } else if (err.code === "unavailable" || /blocked/i.test(err.message || "")) {
        setSyncStatus("error", "Заблокировано браузером");
      } else {
        setSyncStatus("error", "Ошибка сохранения");
      }
    });
}
function loadUserData(uid) {
  if (!firebaseReady || !fbDb) return;
  setSyncStatus("busy", "Загрузка из облака...");
  window.firebaseGetDoc(window.firebaseDoc(fbDb, "users", uid)).then(function (snap) {
    var remote = snap.exists() ? snap.data() : null;
    if (!remote || Object.keys(remote).length === 0) {
      var hasLocal = localStorage.getItem("mood_game_favorites") ||
                     localStorage.getItem("mood_category_stats") ||
                     localStorage.getItem("mood_movies_playlists") ||
                     localStorage.getItem("mood_pc");
      if (hasLocal) saveUserData();
      setSyncStatus("ok", "Облако готово");
      return;
    }
    applyRemoteData(remote);
    showToast("✓ Данные загружены из облака");
  }).catch(function (err) {
    console.error("[Firebase] Ошибка загрузки:", err);
    if (err.code === "permission-denied") setSyncStatus("error", "Нет доступа к Firestore");
    else setSyncStatus("error", "Ошибка загрузки");
  });
}
function forceSyncNow() {
  if (!currentUser) { showToast("Войдите через Google", true); return; }
  setSyncStatus("busy", "Синхронизация...");
  saveUserData();
  loadUserData(currentUser.id);
  var info = $("force-sync-info");
  if (info) { info.textContent = "Синхронизация запущена..."; setTimeout(function () { info.textContent = ""; }, 3000); }
}
function refreshUIAfterLoad() {
  var active = document.querySelector(".main-section.active");
  if (!active) return;
  var id = active.id;
  if (id === "section-games" && gamesLoaded) applyGameFilters();
  else if (id === "section-wave") renderWave();
  else if (id === "section-favorites") renderFavorites();
  else if (id === "section-movies") renderPlaylists && renderPlaylists();
}

// ===== Пользовательские данные / плейлисты =====  
function getHidden() {
  try { return JSON.parse(localStorage.getItem("mood_hidden") || "[]"); }
  catch (e) { return []; }
}
function hideMovie(title) {
  var l = getHidden();
  if (l.indexOf(title) === -1) l.push(title);
  try { localStorage.setItem("mood_hidden", JSON.stringify(l)); } catch (e) {}
  saveUserData();
}
function isHidden(title) { return getHidden().indexOf(title) !== -1; }
function getWatched() {
  try { return JSON.parse(localStorage.getItem("mood_watched") || "[]"); }
  catch (e) { return []; }
}
function isWatched(title) {
  var l = getWatched();
  for (var i = 0; i < l.length; i++) if (l[i].title === title) return true;
  return false;
}
function toggleWatched(title, year) {
  var l = getWatched(), f = -1;
  for (var i = 0; i < l.length; i++) if (l[i].title === title) { f = i; break; }
  if (f === -1) l.push({ title: title, year: year });
  else l.splice(f, 1);
  try { localStorage.setItem("mood_watched", JSON.stringify(l)); } catch (e) {}
  saveUserData();
  return f === -1;
}
function getPlaylists() {
  try { return JSON.parse(localStorage.getItem("mood_movies_playlists") || "{}"); }
  catch (e) { return {}; }
}
function savePlaylists(p) {
  try { localStorage.setItem("mood_movies_playlists", JSON.stringify(p)); } catch (e) {}
  saveUserData();
}
function createPlaylist(name) {
  var p = getPlaylists(), k = name.trim();
  if (!k) return false;
  if (!p[k]) { p[k] = []; savePlaylists(p); return true; }
  return false;
}
function addToPlaylist(name, movie) {
  var p = getPlaylists();
  if (!p[name]) p[name] = [];
  var ex = p[name].some(function (x) { return x.title === movie.title; });
  if (ex) return false;
  movie.watched = false;
  p[name].push(movie);
  savePlaylists(p);
  return true;
}
function removeFromPlaylist(name, title) {
  var p = getPlaylists();
  if (!p[name]) return;
  p[name] = p[name].filter(function (x) { return x.title !== title; });
  savePlaylists(p);
}
function removeMovieFromAllPlaylists(title) {
  var p = getPlaylists(), changed = false;
  Object.keys(p).forEach(function (n) {
    var before = p[n].length;
    p[n] = p[n].filter(function (x) { return x.title !== title; });
    if (p[n].length !== before) changed = true;
  });
  if (changed) savePlaylists(p);
}
function addMovieToPlaylist(movie) {
  var p = getPlaylists(), names = Object.keys(p);
  if (!names.length) {
    var n = prompt("Название нового плейлиста:", "Мой плейлист");
    if (n && n.trim()) {
      createPlaylist(n);
      addToPlaylist(n.trim(), movie);
      showToast("Добавлено в «" + n.trim() + "»");
    }
    return;
  }
  var txt = names.map(function (x, i) { return (i + 1) + ". " + x; }).join("\n");
  var c = prompt("В какой плейлист?\n\n" + txt + "\n\nИли введите название нового:", "1");
  if (!c) return;
  var idx = parseInt(c, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= names.length) {
    addToPlaylist(names[idx - 1], movie);
    showToast("Добавлено в «" + names[idx - 1] + "»");
  } else {
    createPlaylist(c);
    addToPlaylist(c.trim(), movie);
    showToast("Добавлено в «" + c.trim() + "»");
  }
}
function renderPlaylists() {
  var el = $("playlists-list");
  if (!el) return;
  var p = getPlaylists(), names = Object.keys(p);
  if (!names.length) { el.innerHTML = '<p class="hint">Пусто. Создай первый!</p>'; return; }
  var h = "";
  names.forEach(function (n) {
    var items = p[n] || [];
    var nw = items.filter(function (m) { return !m.watched; });
    var w  = items.filter(function (m) { return m.watched; });
    h += '<div class="playlist"><div class="playlist-title"><span>' + esc(n) + ' (' + items.length + ')</span>';
    h += '<button type="button" class="playlist-del" onclick="if(confirm(\'Удалить?\')){deletePlaylist(' + jsStr(n) + ');}" aria-label="Удалить плейлист">✕</button></div>';
    if (!items.length) h += '<p class="hint">Пусто</p>';
    else {
      if (nw.length) {
        h += '<div class="playlist-sub">Не просмотрено:</div>';
        nw.forEach(function (m) { h += buildPlaylistItem(n, m); });
      }
      if (w.length) {
        h += '<div class="playlist-sub">Просмотрено:</div>';
        w.forEach(function (m) { h += buildPlaylistItem(n, m); });
      }
    }
    h += '</div>';
  });
  el.innerHTML = h;
}
function buildPlaylistItem(n, m) {
  var poster = m.poster && /^https?:\/\//i.test(m.poster) ? m.poster : "";
  return '<div class="playlist-item">' +
    (poster ? '<img src="' + esc(poster) + '" alt="">' : '') +
    '<div class="pl-title">' + esc(m.title) + '</div>' +
    '<button type="button" class="pl-check" onclick="togglePlaylistWatched(' + jsStr(n) + ',' + jsStr(m.title) + ')" style="color:' + (m.watched ? '#34d399' : '#8f9bab') + '" aria-label="Отметить просмотренным">✓</button>' +
    '<button type="button" class="pl-del" onclick="removeFromPlaylist(' + jsStr(n) + ',' + jsStr(m.title) + ');renderPlaylists();" aria-label="Удалить">✕</button></div>';
}
function deletePlaylist(name) {
  var p = getPlaylists();
  delete p[name];
  savePlaylists(p);
  renderPlaylists();
}
function togglePlaylistWatched(n, t) {
  var p = getPlaylists();
  if (!p[n]) return;
  p[n].forEach(function (x) { if (x.title === t) x.watched = !x.watched; });
  savePlaylists(p);
  renderPlaylists();
}

// ===== Рендер фильмов =====  
function buildStars(r) {
  var s = "";
  for (var i = 1; i <= 5; i++) {
    s += '<span style="color:' + (r >= i * 2 - 0.5 ? "#fbbf24" : "#3a4552") + '">★</span>';
  }
  return '<span class="stars">' + s + '</span> <span class="rating-num">' + r.toFixed(1) + '</span>';
}
function buildGenres(g) {
  if (!g || !g.length) return "";
  var h = '<div class="genre-tags">';
  g.slice(0, 3).forEach(function (x) {
    h += '<span class="genre-tag">' + esc(genreTranslations[x] || x) + '</span>';
  });
  return h + '</div>';
}
function trailerLinks(title, year, kpId) {
  var q = encodeURIComponent(title + " " + (year || "") + " трейлер");
  return {
    kp: kpId ? "https://www.kinopoisk.ru/film/" + kpId + "/video/" : "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(title),
    kpPage: kpId ? "https://www.kinopoisk.ru/film/" + kpId + "/" : "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(title),
    rutube: "https://rutube.ru/search/?query=" + q,
    vk: "https://vk.com/video?q=" + q  
  };
}
function trailerPageUrl(title, year, kpId, poster, rating, genres) {
  var p = new URLSearchParams();
  p.set("title", title || "");
  p.set("year", year || "");
  if (kpId) p.set("kp", String(kpId));
  if (poster) p.set("poster", poster);
  if (rating) p.set("rating", String(rating));
  if (genres && genres.length) p.set("genres", genres.slice(0, 3).join(","));
  return "trailer.html?" + p.toString();
}
function buildTrailerBlock(kpId, links, trailerUrl) {
  return '<div class="trailer-block">' +
    '<div class="trailer-title">Трейлер</div>' +
    '<a class="btn-trailer-main" href="' + esc(trailerUrl) + '" target="_blank" rel="noopener">▶ Открыть трейлер</a>' +
    '<div class="trailer-links">' +
    '<a class="trailer-link kp" href="' + esc(links.kp) + '" target="_blank" rel="noopener">Кинопоиск</a>' +
    '<a class="trailer-link rt" href="' + esc(links.rutube) + '" target="_blank" rel="noopener">Rutube</a>' +
    '<a class="trailer-link vk" href="' + esc(links.vk) + '" target="_blank" rel="noopener">VK Видео</a>' +
    '</div></div>';
}
function buildMovieCardHtml(m) {
  var title = cleanTitle(m.title || "");
  var year = m.year || extractYear(m.title || "");
  var poster = m.poster && /^https?:\/\//i.test(m.poster) ? m.poster : null;
  var rating = m.rating || 0;
  var w = isWatched(title);
  var kpId = m.kp_id || null;
  var links = trailerLinks(title, year, kpId);
  var trailerUrl = trailerPageUrl(title, year, kpId, poster, rating, m.genres);
  var h = '<div class="card">';
  h += '<div class="card-poster-wrap" onclick="openMovieModal(' + jsStr(title) + ')">';
  if (poster) h += '<img src="' + esc(poster) + '" alt="" loading="lazy">';
  else h += '<div class="no-poster">' + esc(title) + '</div>';
  if (rating > 0) h += '<span class="card-rating">' + rating.toFixed(1) + '</span>';
  h += '<div class="card-overlay"><div class="card-overlay-actions">';
  h += '<a class="card-action" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Кинопоиск">КП</a>';
  h += '<a class="card-action" href="' + esc(trailerUrl) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Трейлер">▶</a>';
  h += '<button type="button" class="card-action card-dislike" onclick="event.stopPropagation();dislikeMovieAndRefresh(' + jsStr(title) + ')" title="Не нравится" aria-label="Не нравится">✕</button>';
  h += '</div><span class="card-overlay-hint">Подробнее</span></div></div>';
  h += '<div class="info"><div class="title" onclick="openMovieModal(' + jsStr(title) + ')">' + esc(title) + (w ? ' ✓' : '') + '</div>';
  h += '<div class="meta">' + esc(year) + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>';
  h += buildGenres(m.genres);
  h += '<button type="button" class="card-add" onclick="event.stopPropagation();addMovieToPlaylist({title:' + jsStr(title) + ',year:' + jsStr(year) + ',poster:' + jsStr(poster || '') + ',kp_id:' + (kpId ? jsStr(String(kpId)) : 'null') + '})">＋ В плейлист</button>';
  h += '</div></div>';
  return h;
}
var RENDER_LIMIT = 20;
function render(movies, append, firstLimit) {
  var el = $("results");
  if (!el) return;
  if (!append) el.innerHTML = '<p class="empty">Загрузка...</p>';
  if (!movies || !movies.length) {
    if (!append) el.innerHTML = '<p class="empty">Ничего не найдено.</p>';
    var lm0 = $("load-more");
    if (lm0) lm0.style.display = "none";
    return;
  }
  var toRender;
  if (append) {
    var already = document.querySelectorAll("#results .card").length;
    toRender = currentMovies.slice(already, already + RENDER_LIMIT);
  } else {
    var lim = (typeof firstLimit === "number" && firstLimit > 0) ? firstLimit : RENDER_LIMIT;
    toRender = movies.slice(0, lim);
    currentMovies = movies;
  }
  var h = "";
  toRender.forEach(function (m) { h += buildMovieCardHtml(m); });
  if (append) el.insertAdjacentHTML("beforeend", h);
  else el.innerHTML = h;
  var lm = $("load-more");
  if (lm) {
    var shown = document.querySelectorAll("#results .card").length;
    lm.style.display = (currentMovies.length > shown) ? "block" : "none";
  }
  var ts = $("type-switch");
  if (ts) ts.style.display = (currentMood || lastSearchQuery) ? "flex" : "none";
}
function openMovieModal(title) {
  var m = null;
  for (var i = 0; i < currentMovies.length; i++) {
    if (cleanTitle(currentMovies[i].title) === title) { m = currentMovies[i]; break; }
  }
  if (!m) return;
  var year = m.year || extractYear(m.title || "");
  var rating = m.rating || 0;
  var desc = m.description || "Описание отсутствует.";
  var w = isWatched(title);
  var poster = m.poster && /^https?:\/\//i.test(m.poster) ? m.poster : "";
  var kpId = m.kp_id || null;
  var links = trailerLinks(title, year, kpId);
  var trailerUrl = trailerPageUrl(title, year, kpId, poster, rating, m.genres);
  var h = '<div class="movie-header">';
  if (poster) h += '<img src="' + esc(poster) + '" alt="">';
  h += '<div class="movie-headline"><h2>' + esc(title) + '</h2>' +
       '<p>' + esc(year) + (rating ? ' · ★ ' + rating.toFixed(1) : '') + '</p>' +
       buildGenres(m.genres) + '</div></div>';
  h += buildTrailerBlock(kpId, links, trailerUrl);
  h += '<p class="movie-desc">' + esc(desc) + '</p>';
  h += '<button type="button" class="btn-primary" style="width:100%;margin-bottom:10px;background:' +
       (w ? '#34d399' : 'var(--accent)') + '" ' +
       'onclick="toggleWatched(' + jsStr(title) + ',' + jsStr(year) + ');openMovieModal(' + jsStr(title) + ')">' +
       (w ? '✓ Просмотрено' : '○ Отметить просмотренным') + '</button>';
  h += '<button type="button" class="btn-primary" style="width:100%;margin-bottom:10px;background:#f87171;" ' +
       'onclick="dislikeMovieAndClose(' + jsStr(title) + ')">Не нравится</button>';
  h += '<div class="social-links">' +
       '<a class="social-btn kp" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener">Кинопоиск</a>' +
       '<a class="social-btn rutube" href="' + esc(links.rutube) + '" target="_blank" rel="noopener">Rutube</a>' +
       '</div>';
  $("movie-modal-body").innerHTML = h;
  var modal = $("movie-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function dislikeMovieAndRefresh(title) {
  dislikeMovieByTitle(title);
  removeMovieFromAllPlaylists(title);
  currentMovies = currentMovies.filter(function (m) { return cleanTitle(m.title) !== title; });
  var active = document.querySelector(".main-section.active");
  if (!active) return;
  if (active.id === "section-favorites") renderFavorites();
  else if (active.id === "section-wave") renderWave();
  else render(currentMovies, false);
}
function dislikeMovieAndClose(title) {
  dislikeMovieByTitle(title);
  removeMovieFromAllPlaylists(title);
  var modal = $("movie-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  currentMovies = currentMovies.filter(function (m) { return cleanTitle(m.title) !== title; });
  var active = document.querySelector(".main-section.active");
  if (!active) return;
  if (active.id === "section-favorites") renderFavorites();
  else if (active.id === "section-wave") renderWave();
  else render(currentMovies, false);
}

// ===== AI фильмы / поиск / mood =====  
function askAI(text) {
  return fetch(AI_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: text, text: text })
  }).then(function (r) {
    return r.text().then(function (t) {
      var d;
      try { d = JSON.parse(t); }
      catch (e) { throw new Error("Ответ не JSON (HTTP " + r.status + "): " + t.slice(0, 120)); }
      if (!r.ok) throw new Error(d.error || ("HTTP " + r.status));
      if (!d.ok) throw new Error(d.error || "Ошибка подбора");
      return d;
    });
  });
}
function fromAiMovie(m) {
  return {
    kp_id: m.kp_id || null, title: m.title || "",
    originalTitle: m.title_original || "", year: m.year || "",
    poster: m.poster || null, rating: m.rating_kp || null,
    description: m.description || "", genres: m.genres || [],
    votes: 0, type: "movie"
  };
}
function isPickExplainable(p, m) { return !!(m && (p.reason || p.mood || p.note)); }
function buildExplainNode(p, m) {
  var b = document.createElement("div");
  b.className = "ai-explain";
  b.innerHTML =
    '<div class="ai-explain-label">Почему этот фильм</div>' +
    '<p>' + esc(p.reason || "") + '</p>' +
    (p.mood ? '<p class="ai-explain-meta">Настроение: <b>' + esc(p.mood) + '</b></p>' : "") +
    (p.note ? '<p class="ai-explain-meta">Деталь: ' + esc(p.note) + '</p>' : "") +
    (m.url ? '<a class="ai-explain-link" href="' + esc(m.url) + '" target="_blank" rel="noopener">Открыть на Кинопоиске →</a>' : "");
  return b;
}
function renderSimpleAiFallback(el, p) {
  el.innerHTML = '<div class="ai-explain">' +
    '<div class="ai-explain-label">Подбор нейросети</div>' +
    '<h3>' + esc(p.title || "Фильм") + (p.year ? " (" + esc(p.year) + ")" : "") + '</h3>' +
    '<p>' + esc(p.reason || "") + '</p>' +
    '<p class="ai-explain-meta">Карточка не нашлась.</p></div>';
}
function buildAiHeader(text, withRetry) {
  var h = document.createElement("div");
  h.className = "ai-header";
  var s = document.createElement("span");
  s.textContent = text;
  h.appendChild(s);
  if (withRetry) {
    var b = document.createElement("button");
    b.type = "button"; b.id = "ai-retry-btn"; b.className = "ai-retry-btn";
    if (aiRetryUsed) { b.disabled = true; b.textContent = "Переделать (использовано)"; }
    else { b.textContent = "Переделать"; b.onclick = retryAi; }
    h.appendChild(b);
  }
  return h;
}
function retryAi() {
  if (aiRetryUsed || aiBusy || !aiLastQuery) return;
  aiRetryUsed = true; aiBusy = true;
  var b = $("ai-retry-btn");
  if (b) { b.disabled = true; b.textContent = "Переделать (использовано)"; b.onclick = null; }
  $("results").innerHTML = '<p class="empty">Переделываем подбор…</p>';
  askAI(aiLastQuery)
    .then(function (d) { aiBusy = false; renderAiPick(d, aiLastVague); })
    .catch(function (err) {
      aiBusy = false;
      $("results").innerHTML = '<p class="empty">Ошибка: ' + esc(err.message || "") + '</p>';
    });
}
function renderAiPick(data, vague) {
  var el = $("results");
  if (!el) return;
  var p = (data && data.pick) || {};
  var m = data && data.movie;
  var alts = (data && data.alternatives) || [];
  var primary = [];
  if (m) primary.push(fromAiMovie(m));
  if (vague) {
    var seen = {};
    if (m && m.title) seen[normalize(m.title)] = 1;
    alts.forEach(function (a) {
      if (primary.length >= 5) return;
      var k = normalize(a.title || "");
      if (k && !seen[k]) { seen[k] = 1; primary.push(fromAiMovie(a)); }
    });
  }
  currentAlternatives = alts.slice();
  if (!primary.length) {
    currentMovies = []; currentMood = null; lastSearchQuery = null;
    renderSimpleAiFallback(el, p);
    return;
  }
  if (!vague) {
    currentMovies = primary; currentMood = null; lastSearchQuery = null;
    render(primary, false);
    var h = buildAiHeader("Точный сюжет — нашли 1 фильм", true);
    el.insertBefore(h, el.firstChild);
    if (isPickExplainable(p, m)) el.insertBefore(buildExplainNode(p, m), h.nextSibling);
    return;
  }
  var userQuery = aiLastQuery || "";
  var kp = extractKeywords(userQuery);
  function finish(list, txt) {
    currentMovies = list; currentMood = null; lastSearchQuery = null;
    render(list, false, 5);
    var hh = buildAiHeader(txt, true);
    el.insertBefore(hh, el.firstChild);
    if (isPickExplainable(p, m)) el.insertBefore(buildExplainNode(p, m), hh.nextSibling);
  }
  var AI_SHOW = 5;
  if (!kp.length) { finish(primary, "Рекомендаций: " + Math.min(primary.length, AI_SHOW)); return; }
  el.innerHTML = '<p class="empty">Доготавливаем…</p>';
  fillFromKeywords(kp, 60).then(function (extra) {
    var seen = {};
    primary.forEach(function (x) { seen[normalize(x.title)] = 1; });
    var add = [];
    extra.forEach(function (mv) {
      var k = normalize(mv.title);
      if (seen[k]) return;
      if (mv.rating && mv.rating < 6) return;
      seen[k] = 1;
      add.push(mv);
    });
    var list = primary.slice();
    for (var i = 0; i < add.length && list.length < AI_SHOW; i++) list.push(add[i]);
    for (var j = 0; j < add.length && list.length < 40; j++) {
      if (list.indexOf(add[j]) === -1) list.push(add[j]);
    }
    var sh = Math.min(AI_SHOW, list.length);
    var rest = Math.max(0, list.length - sh);
    finish(list, "Подобрали " + sh + " вариантов" + (rest > 0 ? " · ещё " + rest + " ↓" : ""));
  }).catch(function () {
    finish(primary, "Рекомендаций: " + Math.min(primary.length, AI_SHOW));
  });
}
function initAI() {
  var inp = $("ai-input"), btn = $("ai-button"), status = $("ai-status");
  if (!btn) return;
  btn.onclick = function () {
    var text = inp.value.trim();
    if (!text) { showToast("Введите описание", true); return; }
    if (btn.disabled || aiBusy) return;
    aiLastQuery = text;
    aiLastVague = isVagueQuery(text);
    aiRetryUsed = false; aiBusy = true;
    btn.disabled = true;
    if (status) status.textContent = "Нейросеть думает… 5–10 секунд";
    $("results").innerHTML = '<p class="empty">Подбираем…</p>';
    var vague = aiLastVague;
    askAI(text)
      .then(function (d) {
        aiBusy = false;
        if (status) status.textContent = "Готово";
        renderAiPick(d, vague);
      })
      .catch(function (err) {
        aiBusy = false;
        if (status) status.textContent = "Ошибка: " + (err.message || err);
        $("results").innerHTML = '<p class="empty">Не получилось. ' + esc(err.message || "") + '</p>';
      })
      .then(function () { btn.disabled = false; });
  };
}
function searchByFilmList(query) {
  return fetchKinopoiskRaw(query, 40).then(function (movies) {
    if (!movies || !movies.length) { currentMovies = []; render([], false); return; }
    var sc = movies.map(function (m) {
      return { m: m, s: Math.max(relevanceScore(query, m.title), relevanceScore(query, m.originalTitle || "")) };
    }).filter(function (x) { return x.s >= 0.3; });
    sc.sort(function (a, b) {
      return Math.abs(b.s - a.s) > 0.1 ? b.s - a.s : (b.m.votes || 0) - (a.m.votes || 0);
    });
    var list = sc.map(function (x) { return x.m; });
    if (!list.length) { currentMovies = []; render([], false); return; }
    currentMood = null;
    lastSearchQuery = query;
    currentMovies = list;
    render(list, false);
  });
}
function searchByFilm(query) {
  return fetchKinopoisk(query).then(function (found) {
    if (!found) return searchByTopic(query, query);
    currentMovies = [found]; currentMood = null; lastSearchQuery = query;
    render([found], false);
    if ($("ai-status")) $("ai-status").textContent = "Найдено: " + found.title + " (" + found.year + ")";
  });
}
function searchByGenre(query) {
  return fetchCandidatesFromKinopoisk(query, 40, currentType).then(function (cand) {
    if (!cand.length) throw new Error("По жанру «" + query + "» ничего не нашлось");
    var byG = cand.filter(function (m) {
      return m.genres.some(function (g) {
        var tr = genreTranslations[g] || g;
        return normalize(tr) === normalize(query) || normalize(g) === normalize(query);
      });
    });
    if (byG.length) cand = byG;
    cand = cand.filter(passUserFilters);
    cand.sort(popularitySort);
    if (!cand.length) throw new Error("По фильтрам пусто");
    var movies = cand.slice(0, 5);
    currentMood = null; lastSearchQuery = query; currentMovies = movies;
    render(movies, false);
    if ($("ai-status")) $("ai-status").textContent = "Найдено: " + movies.length + " по жанру «" + query + "»";
  });
}
function searchByTopic(topic, userText) {
  var cleaned = (userText || "").replace(/(хочу|фильм|про|где|о|об|как|мне|найди|покажи|посмотреть)/gi, " ")
    .replace(/\s+/g, " ").trim();
  var queries = [topic];
  if (cleaned && normalize(cleaned) !== normalize(topic)) queries.push(cleaned);
  if (userText && normalize(userText) !== normalize(topic) && normalize(userText) !== normalize(cleaned)) {
    queries.push(userText);
  }
  if (!/кино|фильм|movie/i.test(topic)) queries.push(topic + " фильм");
  return Promise.all(queries.map(function (q) {
    return fetchCandidatesFromKinopoisk(q, 40, currentType);
  })).then(function (arrays) {
    var seen = {}, all = [];
    arrays.forEach(function (arr) {
      arr.forEach(function (m) {
        var key = normalize(m.title) + "|" + (m.year || "");
        if (!seen[key]) { seen[key] = 1; all.push(m); }
      });
    });
    if (!all.length) throw new Error("По теме «" + topic + "» пусто");
    all = all.filter(passUserFilters);
    if (!all.length) throw new Error("По фильтрам пусто");
    all.sort(popularitySort);
    var movies = all.slice(0, 5);
    currentMood = null; lastSearchQuery = topic; currentMovies = movies;
    render(movies, false);
    if ($("ai-status")) $("ai-status").textContent = "Найдено: " + movies.length + " по теме «" + topic + "»";
  });
}
function loadMoviesByMood(mood) {
  var el = $("results");
  if (!el) return;
  var params = (mood === "best") ? { best: "1" } : categoryParams[mood];
  if (!params) return;
  currentMood = mood;
  lastSearchQuery = null;
  if (mood !== "best") trackCategoryVisit(mood, "movies");
  el.innerHTML = '<p class="empty">Подбираем...</p>';
  var p = Object.assign({ catalog: "1", page: "1", limit: "30" }, params);
  var url = BASE + "?" + Object.keys(p).map(function (k) {
    return k + "=" + encodeURIComponent(p[k]);
  }).join("&");
  fetchWithTimeout(url, 15000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var docs = (data && data.docs ? data.docs : []).map(mapDoc).filter(function (m) {
        return m.poster && passUserFilters(m);
      });
      if (!docs.length) { el.innerHTML = '<p class="empty">Ничего не найдено.</p>'; return; }
      currentMovies = docs;
      render(docs, false);
    })
    .catch(function (e) {
      console.error(e);
      el.innerHTML = '<p class="empty">Ошибка загрузки.</p>';
    });
}

// ============================================================  
// КОНЕЦ ЧАСТИ 1                                                  
// Часть 2: игры, волна, избранное, ПК, init()                     
// Часть 3: люди, анкеты, матчинг, заявки, друзья, чат             
// ============================================================  
// ============================================================  
// PlayFrame — script.js (ЧАСТЬ 2 из 3)                          
// Игры, волна, избранное, панель ПК, init()                      
// ============================================================  

// ============================================================  
// ИГРЫ                                                         
// ============================================================  
function parseGenres(raw) {
  if (!raw) return [];
  return String(raw)
    .replace(/[\[\]{}"']/g, '')
    .split(/[,;:]+/)
    .map(function (x) { return x.trim(); })
    .filter(function (x) { return x && !/^\d+$/.test(x); });
}
function translateGenre(g) { return gameGenreRu[g] || g; }

function computeMoodScore(game, rule) {
  if (!rule) return 0;
  var text = [game.name || '', game.short_description || '', game.genres || '', game.categories || '']
    .join(' ').toLowerCase();
  if (rule.exclude && rule.exclude.test(text)) return 0;
  var meta = parseFloat(game.metacritic_score) || 0;
  var votes = parseFloat(game.recommendations_total) || 0;
  if (meta < rule.minMeta && votes < rule.minVotes) return 0;
  var matches = text.match(rule.include) || [];
  if (!matches.length) return 0;
  return matches.length * 10 + meta * 0.5 + Math.log10(votes + 1);
}

async function gameAiSearch() {
  var input = $("game-ai-input"), btn = $("game-ai-btn"), status = $("game-ai-status");
  var container = $("games-results"), countEl = $("games-count");
  if (!input || !btn || !container) return;
  var text = input.value.trim();
  if (text.length < 3) { showToast("Опиши чуть больше", true); return; }
  if (!gamesLoaded || !allGames.length) { showToast("База ещё загружается", true); return; }
  btn.disabled = true;
  if (status) status.textContent = "Нейросеть думает…";
  if (countEl) countEl.textContent = "";
  container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Подбираем игры…</p>';
  trackGameSearch(text);
  try {
    var resp = await fetch(GAMES_AI_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text })
    });
    var raw = await resp.text();
    var data;
    try { data = JSON.parse(raw); }
    catch (e) { throw new Error("Ответ не JSON: " + raw.slice(0, 80)); }
    if (!resp.ok || !data.ok) throw new Error(data.error || ("HTTP " + resp.status));
    var titles = data.titles || [];
    if (!titles.length) throw new Error("Пустой список");
    var found = [], seen = {};
    titles.forEach(function (t) {
      var key = normalize(t);
      if (key.length < 3) return;
      allGames.forEach(function (g) {
        if (seen[g.appid]) return;
        var gn = normalize(g.name);
        if (!gn) return;
        if (gn === key || gn.indexOf(key) !== -1 || key.indexOf(gn) !== -1) {
          seen[g.appid] = 1; found.push(g);
        }
      });
    });
    var bad = getDislikedGames();
    found = found.filter(function (g) { return bad.indexOf(String(g.appid)) === -1; });
    if (!found.length) {
      if (status) status.textContent = "Не нашлось в базе";
      container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Не нашлось. Уточни запрос.</p>';
      return;
    }
    if (status) status.textContent = "Нашли: " + found.length + " игр";
    filteredGames = found;
    gamesDisplayCount = 30;
    renderGames(found.slice(0, gamesDisplayCount));
    if (countEl) countEl.textContent = "AI подобрал: " + found.length + " игр";
    var mb = $("games-load-more");
    if (mb) mb.style.display = found.length > gamesDisplayCount ? "block" : "none";
  } catch (e) {
    if (status) status.textContent = "Ошибка: " + (e.message || "?");
    if (container) container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Ошибка AI: ' + esc(e.message || "") + '</p>';
    showToast("Ошибка AI", true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ============================================================
// ИГРЫ — ЗАГРУЗКА ИЗ YANDEX CLOUD BUCKET  
// ============================================================
var GAMES_BUCKET = "https://storage.yandexcloud.net/playframe-data";

function fetchJson(url) {
  return fetch(url, { cache: "no-store" }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status + " — " + url);
    return r.json();
  });
}

// Адаптер: имена полей бакета → имена, которые ждёт остальной код  
function normalizeGameFromBucket(g) {
  var genresArr = Array.isArray(g.genres) ? g.genres : [];
  var techArr   = Array.isArray(g.categories) ? g.categories : [];
  var devArr    = Array.isArray(g.developers) ? g.developers : [];
  var pubArr    = Array.isArray(g.publishers) ? g.publishers : [];
  var poster    = g.poster_url ? (GAMES_BUCKET + "/" + g.poster_url) : (g.header_image || "");
  var priceUsd  = Number(g.price_usd) || 0;
  return {
    appid: String(g.appid || ""),
    name: g.name || "",
    short_description: g.short_description || "",
    detailed_description: g.detailed_description || g.short_description || "",
    header_image: poster,
    genres: genresArr.join(", "),
    categories: techArr.join(", "),
    release_date: g.release_date || (g.release_year ? String(g.release_year) : ""),
    is_free: g.is_free ? "True" : "False",
    mat_final_price: g.is_free ? 0 : Math.round(priceUsd * 100),
    metacritic_score: Number(g.metacritic) || 0,
    recommendations_total: Number(g.recommendations) || 0,
    developers: devArr.join(", "),
    publishers: pubArr.join(", "),
    type: "game"
  };
}

function loadGames() {
  if (gamesStarted) return;
  gamesStarted = true;

  var loader = document.getElementById("game-loader");
  if (loader) { loader.style.display = "block"; loader.textContent = "Загрузка базы игр…"; }

  var shardUrls = [];

  fetchJson(GAMES_BUCKET + "/games-index.json")
    .then(function (idx) {
      var list = (idx && idx.shards) || [];
      shardUrls = list.map(function (sh) { return GAMES_BUCKET + "/" + sh.file; });
      if (!shardUrls.length) throw new Error("нет shards");
    })
    .catch(function () {
      // Фолбэк: если games-index.json не залит — берём имена шардов из catalog.json  
      return fetchJson(GAMES_BUCKET + "/catalog.json").then(function (cat) {
        var nums = {};
        Object.keys(cat.shard || {}).forEach(function (id) { nums[cat.shard[id]] = 1; });
        shardUrls = Object.keys(nums).map(function (n) {
          return GAMES_BUCKET + "/games/games-part-" + String(n).padStart(3, "0") + ".json";
        });
      });
    })
    .then(function () {
      if (!shardUrls.length) throw new Error("не найдено ни одного шарда");
      if (loader) loader.textContent = "Загрузка " + shardUrls.length + " файл(ов)…";
      return Promise.all(shardUrls.map(fetchJson));
    })
    .then(function (arrays) {
      var flat = [];
      arrays.forEach(function (arr) {
        (arr || []).forEach(function (g) { flat.push(normalizeGameFromBucket(g)); });
      });

      allGames = flat.filter(function (g) {
        if (!g.name || !g.short_description) return false;
        var hasMeta    = parseInt(g.metacritic_score, 10) > 50;
        var hasReviews = parseInt(g.recommendations_total, 10) > 100;
        var text = (g.short_description + " " + g.name).toLowerCase();
        var bad = ["hentai", "erotic", "nsfw", "adult", "bdsm"];
        if (bad.some(function (w) { return text.indexOf(w) !== -1; })) return false;
        return hasMeta || hasReviews;
      });

      allGames.sort(function (a, b) {
        return (parseFloat(b.recommendations_total) || 0) - (parseFloat(a.recommendations_total) || 0);
      });

      gamesLoaded = true;
      if (loader) loader.style.display = "none";

      applyGameFilters();
      if (typeof updatePerfBtnState === "function") updatePerfBtnState();

      console.log("[games] загружено:", allGames.length);
      console.log("[games] пример:", allGames[0]);
    })
    .catch(function (err) {
      console.error("[games] ошибка:", err);
      if (loader) {
        loader.style.display = "block";
        loader.innerHTML = '<span style="color:#ef4444;">Ошибка: ' + esc(err.message || "") + "</span>";
      }
    });


  if (gameFilters.price !== 'all') {
    result = result.filter(function (g) {
      var isFree = g.is_free === 'True' || (parseFloat(g.mat_final_price) || 0) === 0;
      var raw = parseFloat(g.mat_final_price) || 0;
      var price = raw > 0 ? raw / 100 : 0;
      if (gameFilters.price === 'free') return isFree;
      if (gameFilters.price === 'under10') return !isFree && price > 0 && price < 10;
      if (gameFilters.price === '10to20') return !isFree && price >= 10 && price < 20;
      if (gameFilters.price === 'over20') return !isFree && price >= 20;
      return true;
    });
  }
  if (gameFilters.year !== 'all') {
    result = result.filter(function (g) {
      var m = String(g.release_date || '').match(/(\d{4})/);
      var y = m ? parseInt(m[1], 10) : 0;
      if (!y) return false;
      var r = gameFilters.year;
      if (r === '2020+') return y >= 2020;
      if (r === '2015_2019') return y >= 2015 && y <= 2019;
      if (r === '2010_2014') return y >= 2010 && y <= 2014;
      if (r === '2000_2009') return y >= 2000 && y <= 2009;
      if (r === 'before2000') return y > 0 && y < 2000;
      return true;
    });
  }
  if (gameFilters.mood === 'all') {
    if (gameFilters.sort === 'popular') {
      result.sort(function (a, b) {
        return (parseFloat(b.recommendations_total) || 0) - (parseFloat(a.recommendations_total) || 0);
      });
    } else if (gameFilters.sort === 'metacritic') {
      result.sort(function (a, b) {
        return (parseFloat(b.metacritic_score) || 0) - (parseFloat(a.metacritic_score) || 0);
      });
    } else if (gameFilters.sort === 'price_asc') {
      result.sort(function (a, b) {
        return (parseFloat(a.mat_final_price) || 0) - (parseFloat(b.mat_final_price) || 0);
      });
    } else if (gameFilters.sort === 'year_desc') {
      result.sort(function (a, b) {
        var ya = parseInt((String(a.release_date || '').match(/(\d{4})/) || [])[1] || 0);
        var yb = parseInt((String(b.release_date || '').match(/(\d{4})/) || [])[1] || 0);
        return yb - ya;
      });
    }
  }
  filteredGames = result;
  gamesDisplayCount = 100;
  renderGames(filteredGames.slice(0, gamesDisplayCount));
  var countEl = $("games-count");
  if (countEl) countEl.textContent = "Найдено: " + filteredGames.length + " игр";
  var btn = $("games-load-more");
  if (btn) btn.style.display = filteredGames.length > gamesDisplayCount ? "block" : "none";
}

function buildGameCardHtml(game) {
  var imgSrc = game.header_image || "https://via.placeholder.com/460x215/121216/444?text=No+Image";
  var isFree = game.is_free === 'True' || (parseFloat(game.mat_final_price) || 0) === 0;
  var price = isFree ? 'Бесплатно' : (parseFloat(game.mat_final_price) / 100).toFixed(2) + ' $';
  var desc = (game.short_description || '').replace(/<[^>]*>?/gm, '');
  var descShort = desc.length > 130 ? desc.substring(0, 130) + '...' : desc;
  var yearMatch = String(game.release_date || '').match(/\d{4}/);
  var genres = parseGenres(game.genres).slice(0, 2).map(translateGenre);
  var fav = isGameFavorite(game.appid);
  var gHtml = '';
  if (genres.length) {
    gHtml = '<div class="genre-tags">';
    genres.forEach(function (g) { gHtml += '<span class="genre-tag">' + esc(g) + '</span>'; });
    gHtml += '</div>';
  }
  var fpsHtml = perfMode ? buildMiniFpsHtml(game) : "";
  return '<div class="card" data-appid="' + esc(String(game.appid || '')) + '">' +
    '<div class="card-poster-wrap" style="aspect-ratio:460/215;">' +
      '<img src="' + esc(imgSrc) + '" alt="" loading="lazy" style="object-fit:cover;">' +
      '<span class="card-price-badge ' + (isFree ? 'badge-free' : 'badge-paid') + '">' + price + '</span>' +
      '<button type="button" class="card-fav-btn' + (fav ? ' active' : '') + '" onclick="event.stopPropagation();toggleGameFavCard(' + jsStr(String(game.appid || '')) + ')" title="Избранное" aria-label="В избранное">' + (fav ? '♥' : '♡') + '</button>' +
      '<div class="card-overlay"><div class="card-overlay-actions">' +
        '<button type="button" class="card-action card-dislike" onclick="event.stopPropagation();dislikeGameAndRefresh(' + jsStr(String(game.appid || '')) + ')" title="Не нравится" aria-label="Не нравится">✕</button>' +
      '</div><span class="card-overlay-hint">Подробнее</span></div>' +
    '</div>' +
    '<div class="info">' +
      '<div class="title">' + esc(game.name) + '</div>' +
      '<div class="meta">' + (yearMatch ? esc(yearMatch[0]) : '') +
        (game.developers ? ' · ' + esc(game.developers.split(',')[0]) : '') + '</div>' +
      gHtml +
      '<div class="game-desc-short">' + esc(descShort) + '</div>' +
      fpsHtml +
    '</div></div>';
}

function renderGames(list, containerId) {
  var container = $(containerId || "games-results");
  if (!container) return;
  container.innerHTML = "";
  if (!list || !list.length) {
    container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Ничего не найдено.</p>';
    return;
  }
  var h = "";
  list.forEach(function (g) { h += buildGameCardHtml(g); });
  container.innerHTML = h;
  var cards = container.querySelectorAll(".card");
  for (var i = 0; i < cards.length; i++) {
    (function (card, idx) {
      card.onclick = function (e) {
        if (e.target.closest("button,a")) return;
        openGameModal(list[idx]);
      };
    })(cards[i], i);
  }
}

function toggleGameFavCard(appid) {
  var game = null;
  for (var i = 0; i < allGames.length; i++) {
    if (String(allGames[i].appid) === String(appid)) { game = allGames[i]; break; }
  }
  if (!game) {
    var favs = getGameFavorites();
    for (var j = 0; j < favs.length; j++) {
      if (String(favs[j].appid) === String(appid)) { game = favs[j]; break; }
    }
  }
  if (!game) return;
  var added = toggleGameFavorite(game);
  showToast(added ? "♥ В избранном" : "Убрано из избранного", !added);
  var cards = document.querySelectorAll('.card[data-appid="' + appid + '"] .card-fav-btn');
  cards.forEach(function (b) {
    b.classList.toggle("active", added);
    b.textContent = added ? "♥" : "♡";
  });
  var active = document.querySelector(".main-section.active");
  if (active && active.id === "section-favorites" && !added) renderFavorites();
}

function dislikeGameAndRefresh(appid) {
  dislikeGameById(appid);
  filteredGames = filteredGames.filter(function (g) { return String(g.appid) !== String(appid); });
  var active = document.querySelector(".main-section.active");
  if (!active) return;
  if (active.id === "section-favorites") renderFavorites();
  else if (active.id === "section-wave") renderWave();
  else renderGames(filteredGames.slice(0, gamesDisplayCount));
}

function gameTrailerPageUrl(title, year, poster, genres, meta) {
  var p = new URLSearchParams();
  p.set("title", title || "");
  p.set("year", year || "");
  if (poster) p.set("poster", poster);
  if (genres && genres.length) p.set("genres", genres.slice(0, 3).join(","));
  p.set("rating", meta ? String(meta) : "");
  return "trailer.html?" + p.toString();
}

function openGameModal(game) {
  currentOpenGame = game;
  var title = game.name || 'Игра';
  var yearMatch = String(game.release_date || '').match(/\d{4}/);
  var year = yearMatch ? yearMatch[0] : '';
  var devs = game.developers || '';
  var descShort = (game.short_description || '').replace(/<[^>]*>?/gm, '').trim();
  var descFull = (game.detailed_description || descShort).replace(/<[^>]*>?/gm, '').trim();
  if (descFull.length > 500) descFull = descFull.slice(0, 500) + '...';
  var img = game.header_image || '';
  var appid = game.appid;
  var isFree = game.is_free === 'True' || (parseFloat(game.mat_final_price) || 0) === 0;
  var price = isFree ? 'Бесплатно' : (parseFloat(game.mat_final_price) / 100).toFixed(2) + ' $';
  var genres = parseGenres(game.genres).map(translateGenre);
  var meta = parseFloat(game.metacritic_score) || 0;
  var votes = parseFloat(game.recommendations_total) || 0;
  var fav = isGameFavorite(appid);
  var steamUrl = appid ? 'https://store.steampowered.com/app/' + appid : '';
  var trailerPage = gameTrailerPageUrl(title, year, img, genres, meta);
  var rutubeSearch = 'https://rutube.ru/search/?query=' + encodeURIComponent(title + ' ' + year + ' трейлер');
  var ytSearch = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(title + ' ' + year + ' trailer');
  var translateUrl = descShort  
    ? 'https://translate.google.com/?sl=en&tl=ru&text=' + encodeURIComponent(descShort.slice(0, 400)) + '&op=translate'
    : '';
  var h = '<div class="movie-header">';
  if (img) h += '<img src="' + esc(img) + '" alt="" style="width:220px; aspect-ratio:460/215; object-fit:cover; border-radius:12px;">';
  h += '<div class="movie-headline"><h2>' + esc(title) + '</h2>';
  h += '<p>' + esc(year) + (devs ? ' · ' + esc(devs.split(',')[0]) : '') + ' · ' + esc(price) + '</p>';
  if (genres.length) {
    h += '<div class="genre-tags">';
    genres.slice(0, 6).forEach(function (g) { h += '<span class="genre-tag">' + esc(g) + '</span>'; });
    h += '</div>';
  }
  if (meta > 0) {
    h += '<p style="color:#fbbf24;font-weight:700;margin-top:8px;">Metacritic: ' + meta +
      (votes ? ' · ' + Math.round(votes).toLocaleString('ru-RU') + ' рекомендаций' : '') + '</p>';
  }
  h += '</div></div>';
  h += renderFpsBlock(game);
  h += '<button type="button" class="btn-primary" id="game-modal-fav-btn" style="width:100%;margin-top:15px;margin-bottom:10px;background:' +
       (fav ? '#ec4899' : 'var(--accent)') + '" data-appid="' + esc(String(appid || '')) + '">' +
       (fav ? '♥ В избранном' : '♡ В избранное') + '</button>';
  h += '<button type="button" class="btn-primary" id="game-modal-dislike-btn" style="width:100%;margin-bottom:15px;background:#f87171;" data-appid="' + esc(String(appid || '')) + '">Не нравится</button>';
  h += '<div class="trailer-block"><div class="trailer-title">Трейлер</div>' +
       '<a class="btn-trailer-main" href="' + esc(trailerPage) + '" target="_blank" rel="noopener">▶ Открыть трейлер</a>' +
       '<div class="trailer-links">' +
       '<a class="trailer-link rt" href="' + rutubeSearch + '" target="_blank" rel="noopener">Rutube</a>' +
       '<a class="trailer-link" href="' + ytSearch + '" target="_blank" rel="noopener" style="background:rgba(255,0,51,0.18);border-color:rgba(255,0,51,0.35);">YouTube</a>' +
       (steamUrl ? '<a class="trailer-link" href="' + steamUrl + '" target="_blank" rel="noopener" style="background:rgba(102,192,244,0.18);border-color:rgba(102,192,244,0.35);">Steam</a>' : '') +
       '</div></div>';
  if (descFull) h += '<p class="movie-desc">' + esc(descFull) + '</p>';
  if (translateUrl) h += '<a class="ai-explain-link" href="' + translateUrl + '" target="_blank" rel="noopener">Перевести описание →</a>';
  h += '<div class="social-links" style="margin-top:20px;">' +
       (steamUrl ? '<a class="social-btn steam" href="' + steamUrl + '" target="_blank" rel="noopener">Открыть в Steam</a>' : '') +
       '<a class="social-btn rutube" href="' + rutubeSearch + '" target="_blank" rel="noopener">▶ Rutube</a></div>';
  $("game-modal-body").innerHTML = h;
  var modal = $("game-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  $("game-modal-fav-btn").onclick = function () {
    var added = toggleGameFavorite(game);
    this.textContent = added ? '♥ В избранном' : '♡ В избранное';
    this.style.background = added ? '#ec4899' : 'var(--accent)';
    showToast(added ? "♥ В избранном" : "Убрано", !added);
    var cards = document.querySelectorAll('.card[data-appid="' + appid + '"] .card-fav-btn');
    cards.forEach(function (b) {
      b.classList.toggle("active", added);
      b.textContent = added ? "♥" : "♡";
    });
    var active = document.querySelector(".main-section.active");
    if (active && active.id === "section-favorites" && !added) renderFavorites();
  };
  $("game-modal-dislike-btn").onclick = function () {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    currentOpenGame = null;
    dislikeGameAndRefresh(appid);
    showToast("Скрыто", false);
  };
}
function closeGameModal() {
  var m = $("game-modal");
  if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  currentOpenGame = null;
}

// ============================================================  
// МОЯ ВОЛНА                                                    
// ============================================================  
function switchWaveType(type) {
  waveType = type;
  document.querySelectorAll("#wave-switch button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.wave === type);
  });
  renderWave();
}
function renderWaveStats(type) {
  var el = $("wave-stats");
  if (!el) return;
  var s = getCategoryStats();
  var topCats = getTopKeys(s[type] || {}, 4);
  var favs = getGameFavorites();
  var searches = getGameSearches().filter(function (x) { return x.count >= 2; }).slice(0, 4);
  var chips = "";
  if (topCats.length) {
    chips += '<div class="wave-stat-label">Ваши интересы</div><div class="wave-stat-chips">';
    topCats.forEach(function (c) {
      var cnt = (s[type] || {})[c] || 0;
      chips += '<span class="wave-stat-chip">' + esc(c) + ' · ' + cnt + '</span>';
    });
    chips += '</div>';
  }
  if (type === "games" && favs.length) {
    chips += '<div class="wave-stat-label" style="margin-top:14px;">♥ Избранное</div><div class="wave-stat-chips">';
    favs.slice(0, 6).forEach(function (g) { chips += '<span class="wave-stat-chip wave-fav-chip">' + esc(g.name) + '</span>'; });
    if (favs.length > 6) chips += '<span class="wave-stat-chip wave-fav-chip">+' + (favs.length - 6) + '</span>';
    chips += '</div>';
  }
  if (type === "games" && searches.length) {
    chips += '<div class="wave-stat-label" style="margin-top:14px;">Часто ищете</div><div class="wave-stat-chips">';
    searches.forEach(function (s2) { chips += '<span class="wave-stat-chip wave-search-chip">' + esc(s2.q) + '</span>'; });
    chips += '</div>';
  }
  if (!chips) {
    chips = '<p style="color:var(--text-muted);font-size:0.85rem;">Пока нет данных — исследуйте категории, и рекомендации появятся.</p>';
  }
  el.innerHTML = chips;
}
function renderWaveGames(el) {
  if (!gamesLoaded || !allGames.length) {
    el.innerHTML = '<p class="empty">База игр грузится... подождите пару секунд и обновите волну</p>';
    return;
  }
  var s = getCategoryStats();
  var topMoods = getTopKeys(s.games || {}, 3);
  var disliked = getDislikedGames();
  var favs = getGameFavorites().map(function (g) { return String(g.appid); });
  var pool = allGames.filter(function (g) { return disliked.indexOf(String(g.appid)) === -1; });
  var scored = [];
  pool.forEach(function (g) {
    var score = Math.log10((parseFloat(g.recommendations_total) || 0) + 1) * 4;
    score += (parseFloat(g.metacritic_score) || 0) * 0.4;
    if (favs.indexOf(String(g.appid)) !== -1) score += 15;
    topMoods.forEach(function (m) {
      var r = MOOD_RULES[m];
      if (!r) return;
      var text = (g.name + " " + g.short_description + " " + g.genres).toLowerCase();
      if (r.exclude && r.exclude.test(text)) return;
      var matches = text.match(r.include) || [];
      score += matches.length * 8;
    });
    scored.push({ g: g, s: score });
  });
  scored.sort(function (a, b) { return b.s - a.s; });
  var top = scored.slice(0, 30).map(function (x) { return x.g; });
  if (!top.length) {
    el.innerHTML = '<p class="empty">Не удалось подобрать — выберите пару настроений в играх</p>';
    return;
  }
  renderGames(top, "wave-results");
}
function renderWaveMovies(el) {
  var s = getCategoryStats();
  var topCats = getTopKeys(s.movies || {}, 2);
  if (!topCats.length) {
    el.innerHTML = '<p class="empty">Выберите несколько жанров в разделе «Фильмы», и здесь появятся персональные рекомендации</p>';
    return;
  }
  el.innerHTML = '<p class="empty">Собираем рекомендации по жанрам: ' + esc(topCats.join(', ')) + '…</p>';
  var params = categoryParams[topCats[0]];
  if (!params) { el.innerHTML = '<p class="empty">Не удалось подобрать</p>'; return; }
  var p = Object.assign({ catalog: "1", page: "1", limit: "30" }, params);
  var url = BASE + "?" + Object.keys(p).map(function (k) {
    return k + "=" + encodeURIComponent(p[k]);
  }).join("&");
  fetchWithTimeout(url, 15000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var docs = (data && data.docs ? data.docs : []).map(mapDoc).filter(function (m) {
        return m.poster && passUserFilters(m);
      });
      if (!docs.length) { el.innerHTML = '<p class="empty">Ничего не нашлось</p>'; return; }
      currentMovies = docs;
      var h = "";
      docs.slice(0, 30).forEach(function (m) { h += buildMovieCardHtml(m); });
      el.innerHTML = h;
      el.querySelectorAll(".card").forEach(function (c, i) {
        c.onclick = function (e) {
          if (e.target.closest("button,a")) return;
          openMovieModal(cleanTitle(docs[i].title));
        };
      });
    })
    .catch(function () { el.innerHTML = '<p class="empty">Ошибка загрузки</p>'; });
}
function renderWave() {
  var el = $("wave-results"), info = $("wave-info");
  if (!el) return;
  renderWaveStats(waveType);
  el.innerHTML = "";
  if (waveType === "games") {
    if (info) info.textContent = "Рекомендации игр";
    renderWaveGames(el);
  } else {
    if (info) info.textContent = "Рекомендации фильмов";
    renderWaveMovies(el);
  }
}

// ============================================================  
// ИЗБРАННОЕ                                                    
// ============================================================  
function switchFavoritesType(type) {
  favoritesType = type;
  document.querySelectorAll("#favorites-switch button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.fav === type);
  });
  renderFavorites();
}
function renderFavoritesGames(el) {
  var bad = getDislikedGames();
  var favs = getGameFavorites().filter(function (g) {
    return bad.indexOf(String(g.appid)) === -1;
  });
  if (!favs.length) {
    el.innerHTML = '<p class="empty">Пока нет избранных игр. Нажмите ♡ на карточке игры, чтобы добавить.</p>';
    return;
  }
  var h = "";
  favs.forEach(function (g) { h += buildGameCardHtml(g); });
  el.innerHTML = h;
  var cards = el.querySelectorAll(".card");
  for (var i = 0; i < cards.length; i++) {
    (function (card, idx) {
      card.onclick = function (e) {
        if (e.target.closest("button,a")) return;
        openGameModal(favs[idx]);
      };
    })(cards[i], i);
  }
}
function renderFavoritesMovies(el) {
  var pl = getPlaylists();
  var all = [];
  Object.keys(pl).forEach(function (n) {
    (pl[n] || []).forEach(function (m) {
      if (!all.some(function (x) { return x.title === m.title; })) all.push(m);
    });
  });
  var watched = getWatched();
  watched.forEach(function (w) {
    if (!all.some(function (x) { return x.title === w.title; })) {
      all.push({ title: w.title, year: w.year });
    }
  });
  var bad = getDislikedMovies();
  all = all.filter(function (m) { return bad.indexOf(m.title) === -1; });
  if (!all.length) {
    el.innerHTML = '<p class="empty">Пока нет избранных фильмов. Добавьте фильм в плейлист через «＋ В плейлист».</p>';
    return;
  }
  var movies = all.map(function (m) {
    return {
      title: m.title, year: m.year, poster: m.poster || null,
      kp_id: m.kp_id || null, rating: m.rating || 0,
      genres: m.genres || [], description: m.description || ""
    };
  });
  currentMovies = movies;
  var h = "";
  movies.forEach(function (m) { h += buildMovieCardHtml(m); });
  el.innerHTML = h;
  var cards = el.querySelectorAll(".card");
  for (var i = 0; i < cards.length; i++) {
    (function (card, idx) {
      card.onclick = function (e) {
        if (e.target.closest("button,a")) return;
        openMovieModal(cleanTitle(movies[idx].title));
      };
    })(cards[i], i);
  }
}
function renderFavorites() {
  var el = $("favorites-results"), info = $("favorites-info");
  if (!el) return;
  el.innerHTML = "";
  if (favoritesType === "games") {
    if (info) info.textContent = "Избранные игры (" + getGameFavorites().length + ")";
    renderFavoritesGames(el);
  } else {
    var pl = getPlaylists();
    var count = 0;
    Object.keys(pl).forEach(function (n) { count += (pl[n] || []).length; });
    count += getWatched().length;
    if (info) info.textContent = "Из плейлистов и просмотренных (~" + count + ")";
    renderFavoritesMovies(el);
  }
}

// ============================================================  
// ПАНЕЛЬ «МОЙ ПК» И FPS-РЕЖИМ                                  
// ============================================================  
function updatePcTierLabel(fieldId, score) {
  var el = $(fieldId);
  if (!el) return;
  if (score == null) { el.textContent = "Не распознано"; el.style.color = "#8e96a8"; return; }
  var tier = getPcTier(score);
  el.textContent = "● " + tier.label + " · " + score + "/100";
  el.style.color = tier.color;
}
function populateDatalists() {
  var cpuList = $("cpu-list"), gpuList = $("gpu-list");
  if (cpuList) {
    cpuList.innerHTML = "";
    Object.keys(CPU_SCORES).sort().forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k; cpuList.appendChild(opt);
    });
  }
  if (gpuList) {
    gpuList.innerHTML = "";
    Object.keys(GPU_SCORES).sort().forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k; gpuList.appendChild(opt);
    });
  }
}
function openPcPanel() {
  var pc = getUserPC();
  var cpuInput = $("pc-cpu-input"), gpuInput = $("pc-gpu-input");
  if (cpuInput) cpuInput.value = pc.cpu || "";
  if (gpuInput) gpuInput.value = pc.gpu || "";
  updatePcTierLabel("pc-cpu-tier", lookupCpuScore(pc.cpu));
  updatePcTierLabel("pc-gpu-tier", lookupGpuScore(pc.gpu));
  document.querySelectorAll("#pc-ram-row button").forEach(function (b) {
    b.classList.toggle("active", Number(b.dataset.ram) === Number(pc.ram));
  });
  var panel = $("pc-panel");
  if (panel) { panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); }
}
function updatePerfBtnState() {
  var btn = $("perf-toggle-btn");
  if (!btn) return;
  var pc = getUserPC();
  var hasPc = !!(pc.cpu && pc.gpu);
  var lbl = btn.querySelector(".bp-lbl");
  btn.classList.toggle("active", perfMode && hasPc);
  if (!hasPc) {
    if (lbl) lbl.textContent = "Указать мой ПК";
    btn.title = "Сначала укажите характеристики компьютера";
  } else if (perfMode) {
    if (lbl) lbl.textContent = "Скрыть производительность";
    btn.title = "Скрыть FPS на карточках";
  } else {
    if (lbl) lbl.textContent = "Показать производительность";
    btn.title = "Показать FPS на вашем ПК";
  }
}
function recomputeGameRendering() {
  if (!gamesLoaded) return;
  if (filteredGames && filteredGames.length) {
    renderGames(filteredGames.slice(0, gamesDisplayCount));
  } else if (typeof applyGameFilters === "function") {
    applyGameFilters();
  }
}
function initPerfToggle() {
  var btn = $("perf-toggle-btn");
  if (!btn) return;
  btn.onclick = function () {
    var pc = getUserPC();
    var hasPc = !!(pc.cpu && pc.gpu);
    if (!hasPc) {
      showToast("Сначала укажите характеристики компьютера", true);
      openPcPanel();
      return;
    }
    perfMode = !perfMode;
    try { localStorage.setItem("mood_perf_mode", perfMode ? "1" : "0"); } catch (e) {}
    updatePerfBtnState();
    recomputeGameRendering();
    showToast(perfMode ? " FPS показан на карточках" : "FPS скрыт");
  };
  updatePerfBtnState();
}
function savePcFromPanel() {
  var cpuInput = $("pc-cpu-input"), gpuInput = $("pc-gpu-input");
  var ram = 16;
  var activeRam = document.querySelector("#pc-ram-row button.active");
  if (activeRam) ram = Number(activeRam.dataset.ram);
  var pc = {
    cpu: cpuInput ? cpuInput.value.trim() : "",
    gpu: gpuInput ? gpuInput.value.trim() : "",
    ram: ram  
  };
  if (!pc.cpu || !pc.gpu) { showToast("Укажите CPU и GPU", true); return; }
  if (lookupGpuScore(pc.gpu) == null) {
    showToast("Не распознали видеокарту. Проверьте название.", true);
    return;
  }
  saveUserPC(pc);
  if (!perfMode) {
    perfMode = true;
    try { localStorage.setItem("mood_perf_mode", "1"); } catch (e) {}
  }
  updatePerfBtnState();
  recomputeGameRendering();
  var panel = $("pc-panel");
  if (panel) { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); }
  var gameModal = $("game-modal");
  if (gameModal && gameModal.classList.contains("open") && currentOpenGame) {
    var fpsBlock = document.querySelector("#game-modal-body .fps-block");
    if (fpsBlock) {
      var holder = document.createElement("div");
      holder.innerHTML = renderFpsBlock(currentOpenGame);
      if (holder.firstElementChild) fpsBlock.parentNode.replaceChild(holder.firstElementChild, fpsBlock);
    }
  }
  showToast("✓ ПК сохранён — FPS показан на карточках");
}
function initPcPanel() {
  var toggle = $("pc-toggle"), close = $("pc-close"), save = $("pc-save");
  var cpuInput = $("pc-cpu-input"), gpuInput = $("pc-gpu-input"), ramRow = $("pc-ram-row");
  if (toggle) toggle.onclick = openPcPanel;
  if (close) close.onclick = function () {
    var p = $("pc-panel");
    if (p) { p.classList.remove("open"); p.setAttribute("aria-hidden", "true"); }
  };
  if (save) save.onclick = savePcFromPanel;
  if (cpuInput) {
    cpuInput.addEventListener("input", function () {
      updatePcTierLabel("pc-cpu-tier", lookupCpuScore(this.value));
    });
  }
  if (gpuInput) {
    gpuInput.addEventListener("input", function () {
      updatePcTierLabel("pc-gpu-tier", lookupGpuScore(this.value));
    });
  }
  if (ramRow) {
    ramRow.querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        ramRow.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
        this.classList.add("active");
      };
    });
  }
  populateDatalists();
}

// ============================================================  
// ПЕРЕКЛЮЧАТЕЛЬ РАЗДЕЛОВ                                         
// ============================================================  
function switchMainTab(tab) {
  document.querySelectorAll(".main-section").forEach(function (s) { s.classList.remove("active"); });
  document.querySelectorAll(".main-nav .nav-link").forEach(function (b) { b.classList.remove("active"); });

  var secId, navId;
  if (tab === "games")          { secId = "section-games";      navId = "nav-games"; }
  else if (tab === "wave")      { secId = "section-wave";       navId = "nav-wave"; }
  else if (tab === "favorites") { secId = "section-favorites";  navId = "nav-favorites"; }
  else if (tab === "people")    { secId = "section-people";     navId = "nav-people"; }
  else if (tab === "friends")   { secId = "section-friends";    navId = "nav-friends"; }
  else                          { secId = "section-movies";     navId = "nav-movies"; }

  var secEl = $(secId), navEl = $(navId);
  if (secEl) secEl.classList.add("active");
  if (navEl) navEl.classList.add("active");

  if (tab === "games") {
    if (!gamesStarted) loadGames();
    updatePerfBtnState();
  } else if (tab === "wave") {
    if (!gamesStarted) loadGames();
    setTimeout(renderWave, 100);
  } else if (tab === "favorites") {
    if (!gamesStarted) loadGames();
    setTimeout(renderFavorites, 100);
  } else if (tab === "people") {
    if (typeof preparePeopleSection === "function") preparePeopleSection();
  } else if (tab === "friends") {
    if (typeof prepareFriendsSection === "function") prepareFriendsSection();
  }
}

// ============================================================  
// ПАРТИКЛЫ                                                     
// ============================================================  
function initParticles() {
  var canvas = $("bg-canvas");
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = canvas.getContext("2d");
  var particles = [], conn = 150, cnt = 80;
  var paused = false;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });
  resize();
  function P() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r = Math.random() * 2 + 1;
  }
  P.prototype.u = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  };
  P.prototype.d = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167,139,250,0.8)';
    ctx.fill();
  };
  for (var i = 0; i < cnt; i++) particles.push(new P());
  function anim() {
    if (!paused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < conn) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.15 * (1 - d / conn)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      particles.forEach(function (p) { p.u(); p.d(); });
    }
    requestAnimationFrame(anim);
  }
  anim();
}

// ============================================================  
// ИНИЦИАЛИЗАЦИЯ                                                
// ============================================================  
function init() {
  initParticles();

  var sT = $("settings-toggle"), sP = $("settings-panel"), sC = $("settings-close");
  if (sT && sP) sT.onclick = function () { sP.classList.add("open"); sP.setAttribute("aria-hidden", "false"); };
  if (sC && sP) sC.onclick = function () { sP.classList.remove("open"); sP.setAttribute("aria-hidden", "true"); };
  var pT = $("playlists-toggle"), pP = $("playlists-panel"), pC = $("playlists-close");
  if (pT && pP) pT.onclick = function () { pP.classList.add("open"); pP.setAttribute("aria-hidden", "false"); renderPlaylists(); };
  if (pC && pP) pC.onclick = function () { pP.classList.remove("open"); pP.setAttribute("aria-hidden", "true"); };

  initPcPanel();
  initPerfToggle();

  var fsb = $("force-sync-btn");
  if (fsb) fsb.onclick = forceSyncNow;

  document.querySelectorAll(".tab-btn:not(.game-tab-btn)").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tab-btn:not(.game-tab-btn)").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".tab-content:not(.game-tab-content)").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      var t = $(this.dataset.target);
      if (t) t.classList.add("active");
    };
  });
  document.querySelectorAll(".game-tab-btn").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".game-tab-btn").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".game-tab-content").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      var t = $(this.dataset.target);
      if (t) t.classList.add("active");
    };
  });

  if ($("search-btn")) $("search-btn").onclick = function () {
    var q = $("search-input").value.trim();
    if (!q) return;
    $("results").innerHTML = '<p class="empty">Поиск...</p>';
    currentMood = null; lastSearchQuery = q;
    searchByFilmList(q);
  };
  if ($("search-input")) $("search-input").onkeydown = function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("search-btn").click(); }
  };
  if ($("ai-input")) $("ai-input").onkeydown = function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("ai-button").click(); }
  };

  if ($("random-btn")) $("random-btn").onclick = function () {
    var k = Object.keys(categoryParams);
    loadMoviesByMood(k[Math.floor(Math.random() * k.length)]);
  };
  if ($("masterpiece-btn")) $("masterpiece-btn").onclick = function () { loadMoviesByMood("best"); };

  document.querySelectorAll("#moods button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#moods button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      loadMoviesByMood(this.dataset.mood);
    };
  });

  document.querySelectorAll("#type-switch button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#type-switch button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      currentType = this.dataset.type;
      if (currentMood) loadMoviesByMood(currentMood);
      else if (lastSearchQuery) $("search-btn").click();
    };
  });

  if ($("load-more")) $("load-more").onclick = function () {
    var a = document.querySelectorAll("#results .card").length;
    var n = currentMovies.slice(a, a + RENDER_LIMIT);
    if (!n.length) { showToast("Больше нет"); return; }
    render(null, true);
  };

  if ($("playlist-create-btn")) $("playlist-create-btn").onclick = function () {
    var n = $("playlist-name-input").value;
    if (createPlaylist(n)) {
      $("playlist-name-input").value = "";
      renderPlaylists();
    }
  };

  var rF = $("rating-filter");
  if (rF) {
    var rv = $("rating-value");
    var upd = function () {
      if (rv) rv.textContent = rF.value;
      rF.style.backgroundSize = (rF.value / rF.max * 100) + "% 100%";
    };
    rF.oninput = upd; upd();
  }

  document.querySelectorAll(".color-dot").forEach(function (d) {
    d.onclick = function () {
      document.querySelectorAll(".color-dot").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      if (this.dataset.accent === "purple") document.body.removeAttribute("data-accent");
      else document.body.setAttribute("data-accent", this.dataset.accent);
      try { localStorage.setItem("mood_accent", this.dataset.accent); } catch (e) {}
      saveUserData();
    };
  });
  document.querySelectorAll(".theme-btn").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".theme-btn").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      document.body.classList.toggle("light", this.dataset.theme === "light");
      try { localStorage.setItem("mood_theme", this.dataset.theme); } catch (e) {}
      saveUserData();
    };
  });
  if ($("settings-reset")) $("settings-reset").onclick = function () {
    document.body.removeAttribute("data-accent");
    document.body.classList.remove("light");
    try { localStorage.removeItem("mood_accent"); localStorage.removeItem("mood_theme"); } catch (e) {}
    document.querySelectorAll(".color-dot, .theme-btn").forEach(function (el) { el.classList.remove("active"); });
  };
  if ($("clear-wave-stats")) $("clear-wave-stats").onclick = function () {
    if (!confirm("Сбросить историю интересов и поисков?")) return;
    try {
      localStorage.removeItem("mood_category_stats");
      localStorage.removeItem("mood_game_searches");
    } catch (e) {}
    saveUserData();
    showToast("История сброшена");
    var active = document.querySelector(".main-section.active");
    if (active && active.id === "section-wave") renderWave();
  };

  if ($("movie-modal-close")) $("movie-modal-close").onclick = function () {
    var m = $("movie-modal");
    if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  };
  if ($("game-modal-close")) $("game-modal-close").onclick = closeGameModal;
  if ($("profile-modal-close")) $("profile-modal-close").onclick = function () {
    var m = $("profile-modal");
    if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (e.target && e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
    if (!$(".modal.open") && !$(".side-panel.open")) return;
    document.querySelectorAll(".modal.open").forEach(function (m) {
      m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll(".side-panel.open").forEach(function (p) {
      p.classList.remove("open"); p.setAttribute("aria-hidden", "true");
    });
    currentOpenGame = null;
  });
  ["movie-modal", "game-modal", "profile-modal", "anketa-modal", "chat-modal"].forEach(function (id) {
    var m = $(id);
    if (!m) return;
    m.addEventListener("click", function (e) {
      if (e.target === m) {
        m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
        if (id === "chat-modal" && typeof closeChat === "function") closeChat();
      }
    });
  });

  var sa = localStorage.getItem("mood_accent");
  if (sa && sa !== "purple") document.body.setAttribute("data-accent", sa);
  var st = localStorage.getItem("mood_theme");
  if (st === "light") document.body.classList.add("light");

  if (window.firebaseAuth) initFirebase();
  else window.addEventListener("firebase-ready", initFirebase, { once: true });
  initGoogleLogin();
  initProfile();
  initAI();

  document.querySelectorAll("#game-moods .mood-chip").forEach(function (chip) {
    chip.onclick = function () {
      document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      gameFilters.mood = this.dataset.mood || "all";
      if (gameFilters.mood !== "all") trackCategoryVisit(gameFilters.mood, "games");
      applyGameFilters();
    };
  });

  var gS = $("game-search-input"), gSB = $("game-search-btn");
  if (gS) gS.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); if (gSB) gSB.click(); }
  });
  if (gSB) gSB.onclick = function () {
    gameFilters.query = gS.value.toLowerCase().trim();
    gameFilters.mood = "all";
    document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.mood === "all");
    });
    applyGameFilters();
  };

  var gAI = $("game-ai-input"), gAIB = $("game-ai-btn");
  if (gAIB) gAIB.onclick = gameAiSearch;
  if (gAI) gAI.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); gameAiSearch(); }
  });

  if ($("game-random-btn")) $("game-random-btn").onclick = function () {
    var moods = ["relax", "action", "story", "hardcore", "horror"];
    var m = moods[Math.floor(Math.random() * moods.length)];
    document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.mood === m);
    });
    gameFilters.mood = m;
    trackCategoryVisit(m, "games");
    applyGameFilters();
    showToast("Случайное настроение");
  };
  if ($("game-popular-btn")) $("game-popular-btn").onclick = function () {
    document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.mood === "all");
    });
    gameFilters = { query: "", mood: "all", price: "all", year: "all", sort: "popular" };
    if ($("game-price-filter")) $("game-price-filter").value = "all";
    if ($("game-year-filter")) $("game-year-filter").value = "all";
    if ($("game-sort-filter")) $("game-sort-filter").value = "popular";
    if ($("game-search-input")) $("game-search-input").value = "";
    applyGameFilters();
  };

  if ($("game-price-filter")) $("game-price-filter").onchange = function (e) { gameFilters.price = e.target.value; applyGameFilters(); };
  if ($("game-year-filter")) $("game-year-filter").onchange = function (e) { gameFilters.year = e.target.value; applyGameFilters(); };
  if ($("game-sort-filter")) $("game-sort-filter").onchange = function (e) { gameFilters.sort = e.target.value; applyGameFilters(); };

  document.querySelectorAll(".ai-hint-chip").forEach(function (chip) {
    chip.onclick = function () {
      var a = $("game-ai-input");
      if (!a) return;
      a.value = this.dataset.query || this.textContent.trim();
      var t = document.querySelector('.game-tab-btn[data-target="game-tab-ai"]');
      if (t && !t.classList.contains("active")) t.click();
      setTimeout(function () { gameAiSearch(); }, 50);
    };
  });

  if ($("games-load-more")) $("games-load-more").onclick = function () {
    gamesDisplayCount += 100;
    renderGames(filteredGames.slice(0, gamesDisplayCount));
    if (filteredGames.length <= gamesDisplayCount) this.style.display = "none";
  };

  if (typeof initPeopleModule === "function") initPeopleModule();

  setTimeout(function () { if (!gamesStarted) loadGames(); }, 2000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ============================================================  
// КОНЕЦ ЧАСТИ 2                                                  
// Часть 3: люди, анкеты, матчинг, заявки, друзья, чат             
// ============================================================  
// ============================================================  
// PlayFrame — script.js (ЧАСТЬ 3 из 3)                          
// Люди, анкеты, матчинг, заявки в друзья, чаты                  
// ============================================================  

// ============================================================  
// СОСТОЯНИЕ                                                    
// ============================================================  
var peopleType = "games";
var allPublicProfiles = [];
var allPeopleCandidates = [];
var inboundRequests = [];
var outboundRequests = [];
var myFriendships = [];
var activeChatUid = null;
var activeChatId = null;
var chatUnsub = null;
var peopleDataLoading = false;

// ============================================================  
// ВОССТАНОВЛЕНИЕ АНКЕТЫ ИЗ profiles/{uid}                      
// Источник истины — Firestore profiles, а не users              
// ============================================================  
async function refreshMyAnketaFromCloud() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  try {
    var snap = await window.firebaseGetDoc(window.firebaseDoc(fbDb, "profiles", currentUser.id));
    if (!snap.exists()) return;
    var d = snap.data();
    var changed = false;
    if (d.anketa_games)  { currentProfile.anketa_games  = d.anketa_games;  changed = true; }
    if (d.anketa_movies) { currentProfile.anketa_movies = d.anketa_movies; changed = true; }
    if (changed) {
      try { localStorage.setItem("mood_profile", JSON.stringify(currentProfile)); } catch (e) {}
      updateAnketaButtonState();
    }
  } catch (e) { console.warn("[anketa/refresh]", e); }
}

// ============================================================  
// SKIPS                                                         
// ============================================================  
function getSkips() {
  try { return JSON.parse(localStorage.getItem("mood_skips") || "[]"); }
  catch (e) { return []; }
}
function addSkip(uid) {
  var s = getSkips();
  if (s.indexOf(uid) === -1) s.push(uid);
  try { localStorage.setItem("mood_skips", JSON.stringify(s)); } catch (e) {}
}
function resetSkips() {
  try { localStorage.removeItem("mood_skips"); } catch (e) {}
}

// ============================================================  
// МЕТКИ                                                         
// ============================================================  
function peopleLabel(url) {
  return /^https?:\/\//i.test(url || "") ? url  
    : "https://via.placeholder.com/80x80/1a1d28/8f9bab?text=%3F";
}
function goalLabel(v) {
  return { ranked: "Ранкед", casual: "Казуал", coop: "Кооп", tournament: "Турниры" }[v] || v || "";
}
function voiceLabel(v) { return v === "yes" ? "Голос: да" : "Без голоса"; }
function formatLabel(v) {
  return {
    "watch-together": "Смотрим вместе",
    "separate": "Смотрим отдельно",
    "chat": "Болтаем о кино"
  }[v] || v || "";
}
function dubbingLabel(v) { return v === "subs" ? "Субтитры" : "Дубляж"; }

// ============================================================  
// ПУБЛИЧНЫЙ ПРОФИЛЬ → Firestore                                  
// Защита: не перезаписывать анкету null'ом                      
// ============================================================  
async function pushPublicProfile(uid) {
  uid = uid || (currentUser && currentUser.id);
  if (!uid || !firebaseReady || !fbDb) return;
  var d = sanitizeProfile(currentProfile);
  var payload = {
    name: d.name || (currentUser ? currentUser.name : ""),
    avatar: d.avatar || (currentUser ? currentUser.picture : ""),
    bio: d.bio || "",
    color: d.color || "#e8eaed",
    avatarFrame: d.avatarFrame || "none",
    banner: d.banner || "none",
    nameStyle: d.nameStyle || "normal",
    badge: d.badge || "",
    updatedAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
  };
  // Записываем анкету только если она есть — иначе не трогаем  
  if (currentProfile.anketa_games)  payload.anketa_games  = currentProfile.anketa_games;
  if (currentProfile.anketa_movies) payload.anketa_movies = currentProfile.anketa_movies;
  try {
    await window.firebaseSetDoc(window.firebaseDoc(fbDb, "profiles", uid), payload, { merge: true });
  } catch (e) {
    console.error("[profiles/save]", e);
  }
}

// ============================================================  
// АНКЕТА                                                         
// ============================================================  
async function openAnketaModal() {
  await refreshMyAnketaFromCloud();
  var m = $("anketa-modal");
  var g = currentProfile.anketa_games || {};
  var mv = currentProfile.anketa_movies || {};

  if ($("ak-games-taste"))     $("ak-games-taste").value = (g.taste || []).join(", ");
  if ($("ak-games-top"))       $("ak-games-top").value = (g.topGames || []).join(", ");
  if ($("ak-games-platform"))  $("ak-games-platform").value = g.platform || "pc";
  if ($("ak-games-goal"))      $("ak-games-goal").value = g.goal || "casual";
  if ($("ak-games-voice"))     $("ak-games-voice").value = g.voice || "no";
  if ($("ak-games-schedule"))  $("ak-games-schedule").value = (g.schedule || []).join(", ");
  if ($("ak-games-about"))     $("ak-games-about").value = g.about || "";

  if ($("ak-movies-taste"))    $("ak-movies-taste").value = (mv.taste || []).join(", ");
  if ($("ak-movies-top"))      $("ak-movies-top").value = (mv.topMovies || []).join(", ");
  if ($("ak-movies-format"))   $("ak-movies-format").value = mv.format || "watch-together";
  if ($("ak-movies-spoiler"))  $("ak-movies-spoiler").value = mv.spoiler || "no";
  if ($("ak-movies-dubbing"))  $("ak-movies-dubbing").value = mv.dubbing || "dub";
  if ($("ak-movies-schedule")) $("ak-movies-schedule").value = (mv.schedule || []).join(", ");
  if ($("ak-movies-about"))    $("ak-movies-about").value = mv.about || "";

  // Открыть вкладку, где уже есть данные  
  var hasG = !!((g.taste && g.taste.length) || (g.topGames && g.topGames.length));
  var hasM = !!((mv.taste && mv.taste.length) || (mv.topMovies && mv.topMovies.length));
  if (hasM && !hasG) {
    document.querySelectorAll(".anketa-tab").forEach(function (b) {
      b.classList.toggle("active", b.dataset.anketa === "movies");
    });
    document.querySelectorAll(".anketa-section").forEach(function (s) {
      s.classList.toggle("active", s.id === "anketa-movies");
    });
  }

  if (m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); }
}

async function saveAnketa() {
  function readList(v) {
    return String(v || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 10);
  }

  currentProfile.anketa_games = {
    taste: readList($("ak-games-taste").value),
    topGames: readList($("ak-games-top").value),
    platform: $("ak-games-platform").value,
    goal: $("ak-games-goal").value,
    voice: $("ak-games-voice").value,
    schedule: readList($("ak-games-schedule").value),
    about: ($("ak-games-about").value || "").slice(0, 200)
  };
  currentProfile.anketa_movies = {
    taste: readList($("ak-movies-taste").value),
    topMovies: readList($("ak-movies-top").value),
    format: $("ak-movies-format").value,
    spoiler: $("ak-movies-spoiler").value,
    dubbing: $("ak-movies-dubbing").value,
    schedule: readList($("ak-movies-schedule").value),
    about: ($("ak-movies-about").value || "").slice(0, 200)
  };

  try { localStorage.setItem("mood_profile", JSON.stringify(currentProfile)); } catch (e) {}
  await pushPublicProfile();
  saveUserData();

  // Верификация записи в profiles/{uid}  
  if (currentUser && firebaseReady && fbDb) {
    try {
      var ver = await window.firebaseGetDoc(window.firebaseDoc(fbDb, "profiles", currentUser.id));
      var vd = ver.exists() ? ver.data() : {};
      var okG = !!(vd.anketa_games && vd.anketa_games.taste && vd.anketa_games.taste.length);
      var okM = !!(vd.anketa_movies && vd.anketa_movies.taste && vd.anketa_movies.taste.length);
      console.log("[anketa verify]", { exists: ver.exists(), okG: okG, okM: okM, data: vd });
      if (ver.exists() && !okG && !okM) {
        showToast("Анкета не записалась. Проверьте Firestore Rules", true);
      } else {
        showToast("Анкета сохранена");
      }
    } catch (e) {
      console.warn("[anketa verify]", e);
      showToast("Анкета сохранена (проверьте консоль)", true);
    }
  } else {
    showToast("Анкета сохранена");
  }

  var m = $("anketa-modal");
  if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  updateAnketaButtonState();
  setTimeout(loadPeopleCandidates, 300);
}

function updateAnketaButtonState() {
  var btn = $("anketa-btn");
  if (!btn) return;
  var hasAny = !!currentProfile.anketa_movies || !!currentProfile.anketa_games;
  var lbl = btn.querySelector(".bp-lbl");
  if (lbl) lbl.textContent = hasAny ? "Изменить анкету" : "Заполнить анкету";
}

// ============================================================  
// МАТЧИНГ                                                      
// ============================================================  
function jaccard(a, b) {
  a = (a || []).map(function (x) { return String(x).toLowerCase().trim(); }).filter(Boolean);
  b = (b || []).map(function (x) { return String(x).toLowerCase().trim(); }).filter(Boolean);
  if (!a.length && !b.length) return 0;
  var setA = {}, setB = {}, uni = {}, inter = 0;
  a.forEach(function (x) { setA[x] = 1; uni[x] = 1; });
  b.forEach(function (x) { setB[x] = 1; uni[x] = 1; });
  for (var k in setA) if (setB[k]) inter++;
  var tot = Object.keys(uni).length;
  return tot ? inter / tot : 0;
}

function computeMatchScore(profile) {
  if (!currentUser) return 0;
  var mine = currentProfile["anketa_" + peopleType];
  var theirs = profile["anketa_" + peopleType];
  if (!mine || !theirs) return 0;

  if (peopleType === "games") {
    if (mine.platform && theirs.platform && mine.platform !== theirs.platform) return 0;
    if (mine.goal && theirs.goal && mine.goal !== theirs.goal) return 0;
    if (mine.voice === "yes" && theirs.voice !== "yes") return 0;
    if (theirs.voice === "yes" && mine.voice !== "yes") return 0;
  } else {
    if (mine.format && theirs.format && mine.format !== theirs.format) return 0;
    if (mine.spoiler && theirs.spoiler && mine.spoiler !== theirs.spoiler) return 0;
  }

  var score = 0;
  if (peopleType === "games") {
    score += 0.35 * jaccard(mine.taste, theirs.taste);
    score += 0.25 * jaccard(mine.topGames, theirs.topGames);
    score += 0.15 * jaccard(mine.schedule, theirs.schedule);
    score += 0.10 * (mine.voice === theirs.voice ? 1 : 0);
    score += 0.10 * (mine.goal === theirs.goal ? 1 : 0);
  } else {
    score += 0.35 * jaccard(mine.taste, theirs.taste);
    score += 0.30 * jaccard(mine.topMovies, theirs.topMovies);
    score += 0.15 * jaccard(mine.schedule, theirs.schedule);
    score += 0.10 * (mine.dubbing === theirs.dubbing ? 1 : 0);
    score += 0.10 * (mine.format === theirs.format ? 1 : 0);
  }
  return score;
}

// ============================================================  
// КАНДИДАТЫ                                                    
// ============================================================  
async function loadPeopleCandidates() {
  var el = $("people-results");
  if (!el) return;
  if (!currentUser) {
    el.innerHTML = '<p class="empty">Войдите через Google, чтобы видеть анкеты.</p>';
    if ($("people-info")) $("people-info").textContent = "Требуется вход";
    return;
  }
  if (!firebaseReady || !fbDb) {
    el.innerHTML = '<p class="empty">Подключаемся к Firebase...</p>';
    return;
  }
  if (peopleDataLoading) return;
  peopleDataLoading = true;
  el.innerHTML = '<p class="empty">Загружаем анкеты...</p>';

  try {
    await refreshMyAnketaFromCloud();
    await pushPublicProfile();

    var q = window.firebaseQuery(
      window.firebaseCollection(fbDb, "profiles"),
      window.firebaseLimit(100)
    );
    var snap = await window.firebaseGetDocs(q);
    allPublicProfiles = [];
    snap.forEach(function (d) {
      allPublicProfiles.push(Object.assign({ uid: d.id }, d.data()));
    });

    // Диагностика — смотреть в консоль F12  
    console.log("[people] profiles=" + allPublicProfiles.length,
      allPublicProfiles.map(function (p) {
        return {
          uid: p.uid.slice(0, 8) + "…",
          name: p.name,
          ankG: !!(p.anketa_games && (p.anketa_games.taste || []).length),
          ankM: !!(p.anketa_movies && (p.anketa_movies.taste || []).length)
        };
      })
    );

    renderPeopleCandidates();
  } catch (e) {
    console.error("[people/load]", e);
    el.innerHTML = '<p class="empty">Ошибка загрузки: ' + esc(e.message || "") + '</p>';
  } finally {
    peopleDataLoading = false;
  }
}

function renderPeopleCandidates() {
  var el = $("people-results");
  if (!el || !currentUser) return;

  var myUid = currentUser.id;
  var friendUids = myFriendships.map(function (f) {
    return (f.members || []).find(function (m) { return m !== myUid; });
  }).filter(Boolean);
  var outUids = outboundRequests.map(function (r) { return r.to; });
  var inUids  = inboundRequests.map(function (r) { return r.from; });
  var skips   = getSkips();

  var filtered = allPublicProfiles.filter(function (p) {
    if (p.uid === myUid) return false;
    if (friendUids.indexOf(p.uid) !== -1) return false;
    if (outUids.indexOf(p.uid) !== -1) return false;
    if (inUids.indexOf(p.uid) !== -1) return false;
    if (skips.indexOf(p.uid) !== -1) return false;
    if (!p["anketa_" + peopleType]) return false;
    return true;
  }).map(function (p) {
    return { p: p, s: computeMatchScore(p) };
  }).filter(function (x) { return x.s >= 0.15; })
    .sort(function (a, b) { return b.s - a.s; });

  allPeopleCandidates = filtered;

  if (!filtered.length) {
    var myA = currentProfile["anketa_" + peopleType] || {};
    var hasMine = !!(
      (myA.taste && myA.taste.length) ||
      (myA.topGames && myA.topGames.length) ||
      (myA.topMovies && myA.topMovies.length)
    );
    var tabName = peopleType === "games" ? "Игры" : "Кино";
    var otherTab = peopleType === "games" ? "Кино" : "Игры";
    var msg;
    if (!hasMine) {
      msg = 'Вы ещё не заполнили анкету раздела «' + tabName + '». Нажмите «Заполнить анкету» выше и заполните вкладку «' + tabName + '».';
    } else {
      msg = 'Пока нет подходящих анкет. Проверьте: у друга должна быть заполнена вкладка «' +
            tabName + '», а не «' + otherTab + '». Также убедитесь, что вы не нажали «Пропустить» этого человека.';
    }
    el.innerHTML = '<p class="empty">' + msg + '</p>';
    if ($("people-info")) $("people-info").textContent = "Кандидатов: 0";
    return;
  }
  if ($("people-info")) $("people-info").textContent = "Найдено: " + filtered.length;

  var h = "";
  filtered.forEach(function (x) { h += buildPersonCard(x.p, x.s); });
  el.innerHTML = h;

  el.querySelectorAll(".person-card .pc-action").forEach(function (btn) {
    btn.onclick = function (e) {
      e.stopPropagation();
      var uid = this.dataset.uid;
      if (this.dataset.action === "skip") {
        addSkip(uid);
        renderPeopleCandidates();
      } else if (this.dataset.action === "request") {
        sendFriendRequest(uid);
      }
    };
  });
}

function buildPersonCard(p, score) {
  var ank = p["anketa_" + peopleType] || {};
  var avatar = peopleLabel(p.avatar);
  var pct = Math.round(score * 100);
  var tags = [];

  if (peopleType === "games") {
    (ank.topGames || []).slice(0, 2).forEach(function (g) { tags.push(g); });
    if (ank.goal) tags.push(goalLabel(ank.goal));
    if (ank.voice) tags.push(voiceLabel(ank.voice));
  } else {
    (ank.topMovies || []).slice(0, 2).forEach(function (m) { tags.push(m); });
    if (ank.format) tags.push(formatLabel(ank.format));
    if (ank.dubbing) tags.push(dubbingLabel(ank.dubbing));
  }

  return '<div class="person-card">' +
    '<div class="pc-head">' +
      '<div class="pc-avatar af-' + esc(p.avatarFrame || "none") + '">' +
        '<img src="' + esc(avatar) + '" alt="">' +
      '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="pc-name ' + (p.nameStyle ? "ns-" + esc(p.nameStyle) : "") + '" style="color:' + esc(p.color || "#e8eaed") + '">' +
          (p.badge ? '<span class="user-badge">' + esc(p.badge) + '</span>' : '') +
          esc(p.name || "Без имени") +
        '</div>' +
        '<div class="pc-bio">' + esc((p.bio || "").slice(0, 80)) + '</div>' +
      '</div>' +
      '<span class="pc-score">' + pct + '%</span>' +
    '</div>' +
    '<div class="anketa-preview">' +
      tags.map(function (t) { return '<span class="anketa-tag">' + esc(t) + '</span>'; }).join("") +
      (ank.about ? '<p style="margin-top:8px;">' + esc(ank.about.slice(0, 140)) + '</p>' : '') +
    '</div>' +
    '<div class="pc-actions">' +
      '<button type="button" class="pc-action pc-btn-skip" data-action="skip" data-uid="' + esc(p.uid) + '">Пропустить</button>' +
      '<button type="button" class="pc-action pc-btn-request" data-action="request" data-uid="' + esc(p.uid) + '">В друзья</button>' +
    '</div>' +
  '</div>';
}

// ============================================================  
// ЗАЯВКИ В ДРУЗЬЯ                                              
// ============================================================  
async function sendFriendRequest(toUid) {
  if (!currentUser || !firebaseReady || !fbDb) {
    showToast("Войдите через Google", true);
    return;
  }
  try {
    await window.firebaseAddDoc(window.firebaseCollection(fbDb, "friendRequests"), {
      from: currentUser.id,
      to: toUid,
      type: peopleType,
      status: "pending",
      fromProfile: {
        name: currentProfile.name || currentUser.name,
        avatar: currentProfile.avatar || currentUser.picture,
        avatarFrame: currentProfile.avatarFrame,
        nameStyle: currentProfile.nameStyle,
        badge: currentProfile.badge,
        color: currentProfile.color  
      },
      createdAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
    });
    showToast("Заявка отправлена");
    await loadMyRequests();
    renderPeopleCandidates();
  } catch (e) {
    console.error("[people/req]", e);
    showToast("Не удалось отправить: " + (e.message || ""), true);
  }
}

async function loadMyRequests() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  try {
    var qin = window.firebaseQuery(
      window.firebaseCollection(fbDb, "friendRequests"),
      window.firebaseWhere("to", "==", currentUser.id),
      window.firebaseWhere("status", "==", "pending")
    );
    var snapIn = await window.firebaseGetDocs(qin);
    inboundRequests = [];
    snapIn.forEach(function (d) { inboundRequests.push(Object.assign({ id: d.id }, d.data())); });

    var qout = window.firebaseQuery(
      window.firebaseCollection(fbDb, "friendRequests"),
      window.firebaseWhere("from", "==", currentUser.id),
      window.firebaseWhere("status", "==", "pending")
    );
    var snapOut = await window.firebaseGetDocs(qout);
    outboundRequests = [];
    snapOut.forEach(function (d) { outboundRequests.push(Object.assign({ id: d.id }, d.data())); });

    renderRequests();
    updateFriendsBadge();
  } catch (e) {
    console.error("[people/requests]", e);
  }
}

async function acceptRequest(reqId) {
  var req = inboundRequests.find(function (r) { return r.id === reqId; });
  if (!req || !currentUser) return;
  try {
    await window.firebaseUpdateDoc(
      window.firebaseDoc(fbDb, "friendRequests", reqId),
      { status: "accepted", acceptedAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date() }
    );
    var fid = [currentUser.id, req.from].sort().join("_");
    await window.firebaseSetDoc(
      window.firebaseDoc(fbDb, "friendships", fid),
      {
        members: [currentUser.id, req.from],
        createdAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
      },
      { merge: true }
    );
    showToast("Заявка принята");
    await loadMyRequests();
    await loadMyFriendships();
  } catch (e) {
    console.error("[people/accept]", e);
    showToast("Ошибка: " + (e.message || ""), true);
  }
}

async function declineRequest(reqId) {
  try {
    await window.firebaseUpdateDoc(
      window.firebaseDoc(fbDb, "friendRequests", reqId),
      { status: "declined" }
    );
    showToast("Отклонено");
    await loadMyRequests();
  } catch (e) { console.error(e); }
}

function renderRequests() {
  var inEl = $("inbound-list");
  var outEl = $("outbound-list");

  if (inEl) {
    if (!inboundRequests.length) inEl.innerHTML = '<p class="hint">Нет входящих заявок</p>';
    else {
      var h = "";
      inboundRequests.forEach(function (r) {
        var p = r.fromProfile || {};
        var av = peopleLabel(p.avatar);
        h += '<div class="request-item">' +
          '<img src="' + esc(av) + '" alt="">' +
          '<div class="req-name">' + esc(p.name || "Пользователь") + '</div>' +
          '<div class="req-actions">' +
            '<button type="button" class="req-btn req-accept" data-uid="' + esc(r.id) + '" data-act="accept" aria-label="Принять">✓</button>' +
            '<button type="button" class="req-btn req-decline" data-uid="' + esc(r.id) + '" data-act="decline" aria-label="Отклонить">✕</button>' +
          '</div></div>';
      });
      inEl.innerHTML = h;
      inEl.querySelectorAll(".req-btn").forEach(function (b) {
        b.onclick = function () {
          if (this.dataset.act === "accept") acceptRequest(this.dataset.uid);
          else declineRequest(this.dataset.uid);
        };
      });
    }
  }

  if (outEl) {
    if (!outboundRequests.length) outEl.innerHTML = '<p class="hint">Пока нет отправленных заявок</p>';
    else {
      var hh = "";
      outboundRequests.forEach(function () {
        hh += '<div class="request-item">' +
          '<img src="https://via.placeholder.com/44x44/1a1d28/8f9bab?text=%3F" alt="">' +
          '<div class="req-name">Ожидает ответа</div></div>';
      });
      outEl.innerHTML = hh;
    }
  }
}

// ============================================================  
// ДРУЗЬЯ                                                         
// ============================================================  
async function loadMyFriendships() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(fbDb, "friendships"),
      window.firebaseWhere("members", "array-contains", currentUser.id)
    );
    var snap = await window.firebaseGetDocs(q);
    myFriendships = [];
    snap.forEach(function (d) { myFriendships.push(Object.assign({ id: d.id }, d.data())); });
    await renderFriends();
    updateFriendsBadge();
    renderPeopleCandidates();
  } catch (e) { console.error("[people/friendships]", e); }
}

async function renderFriends() {
  var el = $("friends-list");
  if (!el) return;
  if (!myFriendships.length) {
    el.innerHTML = '<p class="hint">Пока нет друзей — отправляйте заявки в разделе «Люди»</p>';
    return;
  }
  var profileCache = {};
  allPublicProfiles.forEach(function (p) { profileCache[p.uid] = p; });

  var h = "";
  for (var i = 0; i < myFriendships.length; i++) {
    var f = myFriendships[i];
    var otherUid = (f.members || []).find(function (m) { return m !== currentUser.id; });
    if (!otherUid) continue;
    var p = profileCache[otherUid];
    if (!p) {
      try {
        var snap = await window.firebaseGetDoc(window.firebaseDoc(fbDb, "profiles", otherUid));
        if (snap.exists()) {
          p = Object.assign({ uid: otherUid }, snap.data());
          profileCache[otherUid] = p;
        }
      } catch (e) {}
    }
    var name = (p && p.name) || "Друг";
    var av = (p && p.avatar) ? peopleLabel(p.avatar) : peopleLabel("");
    h += '<div class="friend-item">' +
      '<img src="' + esc(av) + '" alt="">' +
      '<div class="req-name">' + esc(name) + '</div>' +
      '<button type="button" class="req-btn req-chat" data-uid="' + esc(otherUid) + '" data-act="chat">Написать</button>' +
      '</div>';
  }
  el.innerHTML = h;
  el.querySelectorAll("[data-act='chat']").forEach(function (b) {
    b.onclick = function () { openChat(this.dataset.uid); };
  });
}

function updateFriendsBadge() {
  var b = $("friends-badge");
  if (!b) return;
  var n = inboundRequests.length;
  b.textContent = n;
  b.style.display = n > 0 ? "inline-flex" : "none";
}

// ============================================================  
// ЧАТ                                                          
// ============================================================  
async function openChat(otherUid) {
  if (!currentUser || !otherUid) return;
  activeChatUid = otherUid;
  activeChatId = [currentUser.id, otherUid].sort().join("_");

  var p = allPublicProfiles.find(function (x) { return x.uid === otherUid; });
  if (!p) {
    try {
      var snap = await window.firebaseGetDoc(window.firebaseDoc(fbDb, "profiles", otherUid));
      if (snap.exists()) p = Object.assign({ uid: otherUid }, snap.data());
    } catch (e) {}
  }

  var m = $("chat-modal");
  if ($("chat-avatar")) $("chat-avatar").src = p && p.avatar ? peopleLabel(p.avatar) : peopleLabel("");
  if ($("chat-name")) $("chat-name").textContent = (p && p.name) || "Друг";
  if ($("chat-messages")) $("chat-messages").innerHTML = '<p class="hint" style="text-align:center;">Загрузка...</p>';

  if (m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); }
  subscribeChat();
  setTimeout(function () { if ($("chat-input")) $("chat-input").focus(); }, 200);
}

function subscribeChat() {
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  if (!activeChatId || !fbDb || !window.firebaseOnSnapshot) return;

  try {
    var q = window.firebaseQuery(
      window.firebaseCollection(fbDb, "chats", activeChatId, "messages"),
      window.firebaseOrderBy("createdAt", "asc"),
      window.firebaseLimit(200)
    );
    chatUnsub = window.firebaseOnSnapshot(q,
      function (snap) {
        var el = $("chat-messages");
        if (!el) return;
        var msgs = [];
        snap.forEach(function (d) { msgs.push(d.data()); });
        if (!msgs.length) {
          el.innerHTML = '<p class="hint" style="text-align:center;">Нет сообщений. Напишите первым!</p>';
          return;
        }
        var h = "";
        msgs.forEach(function (msg) {
          var mine = msg.from === currentUser.id;
          var time = msg.createdAt && msg.createdAt.seconds  
            ? new Date(msg.createdAt.seconds * 1000)
            : new Date();
          var hm = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0");
          h += '<div class="chat-msg ' + (mine ? "from-me" : "from-them") + '">' +
            esc(msg.text || "") +
            '<div class="chat-msg-time">' + hm + '</div>' +
          '</div>';
        });
        el.innerHTML = h;
        el.scrollTop = el.scrollHeight;
      },
      function (err) { console.error("[chat]", err); }
    );
  } catch (e) { console.error(e); }
}

async function sendMessage() {
  if (!activeChatId || !activeChatUid || !currentUser || !fbDb) return;
  var inp = $("chat-input");
  if (!inp) return;
  var text = inp.value.trim();
  if (!text) return;
  inp.value = "";
  try {
    await window.firebaseSetDoc(
      window.firebaseDoc(fbDb, "chats", activeChatId),
      {
        members: [currentUser.id, activeChatUid].sort(),
        updatedAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
      },
      { merge: true }
    );
    await window.firebaseAddDoc(
      window.firebaseCollection(fbDb, "chats", activeChatId, "messages"),
      {
        from: currentUser.id,
        text: text.slice(0, 2000),
        createdAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
      }
    );
  } catch (e) {
    console.error("[chat/send]", e);
    showToast("Не удалось отправить: " + (e.message || ""), true);
  }
}

function closeChat() {
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  activeChatUid = null;
  activeChatId = null;
  var m = $("chat-modal");
  if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
}

// ============================================================  
// ПЕРЕКЛЮЧАТЕЛЬ «ИГРЫ / ФИЛЬМЫ»                                  
// ============================================================  
function switchPeopleType(type) {
  peopleType = type;
  document.querySelectorAll("#people-switch button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.people === type);
  });
  renderPeopleCandidates();
}

// ============================================================  
// ПОДГОТОВКА РАЗДЕЛОВ (вызываются из switchMainTab части 2)     
// ============================================================  
async function preparePeopleSection() {
  await refreshMyAnketaFromCloud();
  updateAnketaButtonState();
  if (!currentUser) {
    var el0 = $("people-results");
    if (el0) el0.innerHTML = '<p class="empty">Войдите через Google, чтобы видеть анкеты.</p>';
    if ($("people-info")) $("people-info").textContent = "Требуется вход";
    return;
  }
  // Авто-переключение на заполненную вкладку, если другая пустая  
  var g = currentProfile.anketa_games  || {};
  var m = currentProfile.anketa_movies || {};
  var hasG = !!((g.taste && g.taste.length) || (g.topGames && g.topGames.length));
  var hasM = !!((m.taste && m.taste.length) || (m.topMovies && m.topMovies.length));
  if (hasM && !hasG && peopleType !== "movies") {
    peopleType = "movies";
    document.querySelectorAll("#people-switch button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.people === "movies");
    });
  } else if (hasG && !hasM && peopleType !== "games") {
    peopleType = "games";
    document.querySelectorAll("#people-switch button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.people === "games");
    });
  }
  loadPeopleCandidates();
}

function prepareFriendsSection() {
  if (!currentUser) {
    if ($("inbound-list")) $("inbound-list").innerHTML = '<p class="hint">Войдите через Google</p>';
    if ($("outbound-list")) $("outbound-list").innerHTML = "";
    if ($("friends-list")) $("friends-list").innerHTML = "";
    return;
  }
  loadMyRequests();
  loadMyFriendships();
}

// ============================================================  
// ИНИЦИАЛИЗАЦИЯ МОДУЛЯ                                         
// ============================================================  
function initPeopleModule() {
  if ($("anketa-btn")) $("anketa-btn").onclick = openAnketaModal;
  if ($("anketa-save-btn")) $("anketa-save-btn").onclick = saveAnketa;
  if ($("anketa-modal-close")) $("anketa-modal-close").onclick = function () {
    var m = $("anketa-modal");
    if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  };

  if ($("chat-modal-close")) $("chat-modal-close").onclick = closeChat;
  if ($("chat-send")) $("chat-send").onclick = sendMessage;
  if ($("chat-input")) {
    $("chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
    });
  }

  document.querySelectorAll(".anketa-tab").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".anketa-tab").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll(".anketa-section").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      var sec = $("anketa-" + this.dataset.anketa);
      if (sec) sec.classList.add("active");
    };
  });

  document.querySelectorAll("#people-switch button").forEach(function (b) {
    b.onclick = function () { switchPeopleType(this.dataset.people); };
  });

  // После логина — подтягиваем запросы и друзей  
  function attach() {
    if (!window.firebaseAuth) { setTimeout(attach, 250); return; }
    window.firebaseOnAuth(window.firebaseAuth, function (user) {
      if (user) {
        setTimeout(async function () {
          if (!currentUser || !currentUser.id) {
            currentUser = { id: user.uid, name: user.displayName || user.email, picture: user.photoURL };
          }
          await refreshMyAnketaFromCloud();
          await pushPublicProfile(user.uid);
          await loadMyRequests();
          await loadMyFriendships();
        }, 600);
      } else {
        inboundRequests = [];
        outboundRequests = [];
        myFriendships = [];
        if ($("inbound-list")) $("inbound-list").innerHTML = "";
        if ($("outbound-list")) $("outbound-list").innerHTML = "";
        if ($("friends-list")) $("friends-list").innerHTML = "";
        if ($("people-results")) $("people-results").innerHTML = '<p class="empty">Войдите через Google, чтобы видеть анкеты.</p>';
        updateFriendsBadge();
      }
    });
  }
  attach();

  updateAnketaButtonState();
}

// ============================================================  
// КОНЕЦ ЧАСТИ 3 — файл завершён                                  
// ============================================================  
