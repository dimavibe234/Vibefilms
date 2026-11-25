// ============================================================  
// PlayFrame — script.js (часть 1 из 2)                        
// v10: FPS на ПК + realtime-синхронизация + избранное          
// ============================================================  

var AI_FN       = "https://functions.yandexcloud.net/d4edhc3vf41qqntfflsp";
var BASE        = "https://functions.yandexcloud.net/d4e3i0pd816463uq33eu";
var GAMES_AI_FN = "https://functions.yandexcloud.net/d4ep609aq1goe7o3c13k";

// ============================================================  
// PC / FPS — ТАБЛИЦЫ ПРОИЗВОДИТЕЛЬНОСТИ                        
// ============================================================  
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
  return String(s || "")
    .toLowerCase()
    .replace(/nvidia|geforce|amd|radeon|intel|core|ryzen|®|™|\(r\)|\(tm\)/g, " ")
    .replace(/-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
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
  localStorage.setItem("mood_pc", JSON.stringify(pc));
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
  if (ram < req.recRam) {
    fpsMedium *= 0.75; fpsHigh *= 0.75; fpsUltra *= 0.675;
  }
  if (ram < req.minRam) {
    fpsLow *= 0.7; fpsMedium *= 0.6; fpsHigh *= 0.5; fpsUltra *= 0.4;
  }
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
function renderFpsBlock(game) {
  var pc = getUserPC();
  if (!pc.gpu || !pc.cpu) {
    return '<div class="fps-block fps-block-empty">' +
      '<div class="fps-block-title"> Узнайте свой FPS в этой игре</div>' +
      '<p class="fps-block-sub">Укажите процессор и видеокарту один раз — и мы покажем FPS на всех настройках графики.</p>' +
      '<button class="btn-primary fps-setup-btn" onclick="openPcPanel()"> Настроить мой ПК</button>' +
      '</div>';
  }
  var result = estimateFps(game, pc);
  if (result.error) {
    return '<div class="fps-block fps-block-empty">' +
      '<div class="fps-block-title"> FPS на вашем ПК</div>' +
      '<p class="fps-block-sub" style="color:#f87171;">' + esc(result.error) + '</p>' +
      '<button class="btn-primary fps-setup-btn" onclick="openPcPanel()"> Исправить ПК</button>' +
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
  html += '<div class="fps-block-title"> FPS на вашем ПК</div>';
  html += '<div class="fps-config">';
  html += '<span> ' + esc(gpuLabel) + '</span>';
  html += '<span> ' + esc(cpuLabel) + '</span>';
  html += '<span> ' + esc(String(result.ram)) + ' GB</span>';
  html += '<button class="fps-edit-btn" onclick="openPcPanel()">✎ Изменить</button>';
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
    html += '<div class="fps-note"> ' + result.notes.join(" · ") + '</div>';
  } else {
    html += '<div class="fps-note">Оценка приблизительная. Реальный FPS зависит от драйверов, ОС и настроек.</div>';
  }
  html += '</div>';
  return html;
}

// ============================================================  
// КАТЕГОРИИ И ЖАНРЫ                                            
// ============================================================  
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

// ============================================================  
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ                                         
// ============================================================  
var currentMood = null, currentType = "movie", lastSearchQuery = null;
var currentMovies = [], currentUser = null, currentAlternatives = [];
var currentProfile = { name: "", avatar: "", color: "#e8eaed" };
var firebaseReady = false, fbAuth = null, fbDb = null, fbProvider = null;
var fbUnsubscribe = null;
var aiLastQuery = "", aiLastVague = true, aiRetryUsed = false, aiBusy = false;
var allGames = [], filteredGames = [], gamesLoaded = false, gamesStarted = false, gamesDisplayCount = 100;
var gameFilters = { query: "", mood: "all", price: "all", year: "all", sort: "popular" };
var waveType = "games";

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

var kinopoiskCache = JSON.parse(localStorage.getItem("kinopoisk_cache") || "{}");
function saveKinopoiskCache() {
  try { localStorage.setItem("kinopoisk_cache", JSON.stringify(kinopoiskCache)); } catch (e) {}
}
function $(id) { return document.getElementById(id); }

// ============================================================  
// УТИЛИТЫ                                                      
// ============================================================  
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
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
  if (!state) { el.textContent = ""; return; }
  if (state === "ok") { el.classList.add("sync-ok"); el.textContent = "✓"; }
  else if (state === "busy") { el.classList.add("sync-busy"); el.textContent = ""; }
  else if (state === "error") { el.classList.add("sync-error"); el.textContent = ""; }
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

// ============================================================  
// ИЗБРАННОЕ ИГР                                                
// ============================================================  
function getGameFavorites() {
  try { return JSON.parse(localStorage.getItem("mood_game_favorites") || "[]"); }
  catch (e) { return []; }
}
function saveGameFavorites(l) {
  localStorage.setItem("mood_game_favorites", JSON.stringify(l));
  saveUserData();
}
function isGameFavorite(appid) {
  return getGameFavorites().some(function (g) { return String(g.appid) === String(appid); });
}
function toggleGameFavorite(game) {
  var l = getGameFavorites();
  var idx = -1;
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

// ============================================================  
// СТАТИСТИКА ИНТЕРЕСОВ                                         
// ============================================================  
function getCategoryStats() {
  try { return JSON.parse(localStorage.getItem("mood_category_stats") || '{"movies":{},"games":{}}'); }
  catch (e) { return { movies: {}, games: {} }; }
}
function saveCategoryStats(s) {
  localStorage.setItem("mood_category_stats", JSON.stringify(s));
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
  localStorage.setItem("mood_game_searches", JSON.stringify(l));
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
  localStorage.setItem("mood_disliked_movies", JSON.stringify(l));
  saveUserData();
  showToast(" Скрыто. Похожее больше не покажем", false);
}
function dislikeGameById(appid) {
  var l = getDislikedGames();
  if (l.indexOf(String(appid)) === -1) l.push(String(appid));
  localStorage.setItem("mood_disliked_games", JSON.stringify(l));
  saveUserData();
  showToast(" Скрыто. Похожее больше не покажем", false);
}

// ============================================================  
// КИНОПОИСК                                                    
// ============================================================  
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
  if (type === "cartoon") return m.genres.indexOf("анимация") !== -1 || m.type === "cartoon";
  if (type === "documentary") return m.genres.indexOf("документальный") !== -1 || m.type === "documentary";
  return true;
}
function fetchCandidatesFromKinopoisk(query, limit, typeFilter) {
  return fetchKinopoiskRaw(query, limit || 30).then(function (movies) {
    return typeFilter ? movies.filter(function (m) { return matchType(m, typeFilter); }) : movies;
  });
}
function readFilters() {
  return {
    minRating: parseFloat(($("rating-filter") && $("rating-filter").value) || 0),
    minYear: parseInt(($("year-filter") && $("year-filter").value) || 1900, 10),
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

// ============================================================  
// FIREBASE — с realtime-синхронизацией                          
// ============================================================  
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
      localStorage.setItem("mood_user", JSON.stringify(currentUser));
      renderUserInfo();
      loadUserData(user.uid);
      startRealtimeSync(user.uid);
    } else {
      currentUser = null;
      localStorage.removeItem("mood_user");
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
        var d = snap.data();
        applyRemoteData(d);
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
    var cur = localStorage.getItem(key);
    var neu = JSON.stringify(remoteVal);
    if (cur !== neu) { localStorage.setItem(key, neu); changed = true; }
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
  if (d.profile && JSON.stringify(d.profile) !== JSON.stringify(currentProfile)) {
    currentProfile = d.profile;
    localStorage.setItem("mood_profile", JSON.stringify(currentProfile));
    renderUserInfo();
    changed = true;
  }
  if (d.accent && localStorage.getItem("mood_accent") !== d.accent) {
    localStorage.setItem("mood_accent", d.accent);
    document.body.setAttribute("data-accent", d.accent);
    changed = true;
  }
  if (d.theme && localStorage.getItem("mood_theme") !== d.theme) {
    localStorage.setItem("mood_theme", d.theme);
    document.body.classList.toggle("light", d.theme === "light");
    changed = true;
  }
  if (changed) {
    setSyncStatus("ok", "Данные обновлены из облака");
    renderPlaylists();
    refreshUIAfterLoad();
    showToast(" Обновлено из облака");
  } else {
    setSyncStatus("ok", "Синхронизировано");
  }
}
function renderUserInfo() {
  var el = $("user-info"), btn = $("google-login-btn");
  if (!el) return;
  if (currentUser) {
    el.style.display = "inline-flex";
    if (btn) btn.style.display = "none";
    var avatar = currentProfile.avatar || currentUser.picture;
    var name = currentProfile.name || currentUser.name;
    var color = currentProfile.color || "#e8eaed";
    el.innerHTML =
      (avatar ? '<img src="' + avatar + '">' : '') +
      '<span style="color:' + color + '">' + name + '</span>' +
      '<button id="edit-prof-btn">✎</button>' +
      '<button id="logout-btn">Выйти</button>';
    $("edit-prof-btn").onclick = openProfile;
    $("logout-btn").onclick = function () {
      window.firebaseSignOut(fbAuth).then(function () {
        currentUser = null;
        localStorage.removeItem("mood_user");
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
      showToast(err.code === 'auth/popup-blocked' ? "Разрешите всплывающие окна!" : "Ошибка: " + err.message, true);
    });
  };
}
function openProfile() {
  var m = $("profile-modal");
  $("profile-name-input").value = currentProfile.name || (currentUser ? currentUser.name : "");
  $("profile-avatar-input").value = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  $("profile-avatar-img").src = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  document.querySelectorAll(".profile-color-dot").forEach(function (d) {
    d.classList.toggle("active", d.dataset.color === currentProfile.color);
  });
  var pl = getPlaylists(), c = 0;
  for (var k in pl) c += pl[k].length;
  $("profile-stats").innerHTML =
    "Фильмов в плейлистах: <b>" + c + "</b><br>" +
    "Просмотрено: <b>" + getWatched().length + "</b><br>" +
    "Избранных игр: <b>" + getGameFavorites().length + "</b>";
  m.classList.add("open");
}
function initProfile() {
  var m = $("profile-modal");
  if ($("profile-modal-close")) $("profile-modal-close").onclick = function () { m.classList.remove("open"); };
  if ($("profile-save-btn")) $("profile-save-btn").onclick = function () {
    currentProfile.name = $("profile-name-input").value;
    currentProfile.avatar = $("profile-avatar-input").value;
    localStorage.setItem("mood_profile", JSON.stringify(currentProfile));
    renderUserInfo();
    saveUserData();
    m.classList.remove("open");
  };
  document.querySelectorAll(".profile-color-dot").forEach(function (dot) {
    dot.onclick = function () {
      document.querySelectorAll(".profile-color-dot").forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active");
      currentProfile.color = this.dataset.color;
    };
  });
  var saved = localStorage.getItem("mood_profile");
  if (saved) { try { currentProfile = JSON.parse(saved); } catch (e) {} }
}
function saveUserData() {
  if (!currentUser || !firebaseReady || !fbDb) {
    console.log("[Firebase] Нет пользователя — сохранение только локально");
    return;
  }
  setSyncStatus("busy", "Сохранение...");
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
    .then(function () {
      setSyncStatus("ok", "Сохранено в облако");
      console.log("[Firebase] ✓ Сохранено");
    })
    .catch(function (err) {
      console.error("[Firebase] ✗ Ошибка:", err);
      if (err.code === "permission-denied") {
        setSyncStatus("error", "Firestore правила запрещают запись");
        showToast("Правила Firestore запрещают запись. Настройте правила в консоли.", true);
      } else if (err.code === "unavailable" || /blocked/i.test(err.message || "")) {
        setSyncStatus("error", "Заблокировано браузером (адблок/VPN)");
        showToast("Синхронизация заблокирована расширением браузера", true);
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
      if (hasLocal) {
        console.log("[Firebase] Облако пусто, заливаем локальное");
        saveUserData();
      }
      setSyncStatus("ok", "Облако готово");
      return;
    }
    applyRemoteData(remote);
    showToast("✓ Данные загружены из облака");
  }).catch(function (err) {
    console.error("[Firebase] Ошибка загрузки:", err);
    if (err.code === "permission-denied") {
      setSyncStatus("error", "Нет доступа к Firestore");
    } else {
      setSyncStatus("error", "Ошибка загрузки");
    }
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

// ============================================================  
// ПОЛЬЗОВАТЕЛЬСКИЕ ДАННЫЕ                                      
// ============================================================  
function getHidden() {
  try { return JSON.parse(localStorage.getItem("mood_hidden") || "[]"); }
  catch (e) { return []; }
}
function hideMovie(title) {
  var l = getHidden();
  if (l.indexOf(title) === -1) l.push(title);
  localStorage.setItem("mood_hidden", JSON.stringify(l));
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
  localStorage.setItem("mood_watched", JSON.stringify(l));
  saveUserData();
  return f === -1;
}

// ============================================================  
// ПЛЕЙЛИСТЫ                                                    
// ============================================================  
function getPlaylists() {
  try { return JSON.parse(localStorage.getItem("mood_movies_playlists") || "{}"); }
  catch (e) { return {}; }
}
function savePlaylists(p) {
  localStorage.setItem("mood_movies_playlists", JSON.stringify(p));
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
    var w = items.filter(function (m) { return m.watched; });
    h += '<div class="playlist"><div class="playlist-title"><span>' + esc(n) + ' (' + items.length + ')</span>';
    h += '<button class="playlist-del" onclick="if(confirm(\'Удалить?\')){deletePlaylist(\'' + esc(n).replace(/'/g, "\\'") + '\');}">✕</button></div>';
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
  var sN = esc(n).replace(/'/g, "\\'"), sT = esc(m.title).replace(/'/g, "\\'");
  return '<div class="playlist-item">' +
    (m.poster ? '<img src="' + esc(m.poster) + '">' : '') +
    '<div class="pl-title">' + esc(m.title) + '</div>' +
    '<button class="pl-check" onclick="togglePlaylistWatched(\'' + sN + '\',\'' + sT + '\')" style="color:' + (m.watched ? '#34d399' : '#8f9bab') + '">✓</button>' +
    '<button class="pl-del" onclick="removeFromPlaylist(\'' + sN + '\',\'' + sT + '\');renderPlaylists();">✕</button></div>';
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

// ============================================================  
// ВСПОМОГАТЕЛЬНЫЕ ДЛЯ РЕНДЕРА                                  
// ============================================================  
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

// ============================================================  
// КАРТОЧКА ФИЛЬМА                                              
// ============================================================  
function buildMovieCardHtml(m) {
  var title = cleanTitle(m.title || "");
  var year = m.year || extractYear(m.title || "");
  var poster = m.poster || null;
  var rating = m.rating || 0;
  var w = isWatched(title);
  var kpId = m.kp_id || null;
  var safeT = esc(title).replace(/'/g, "\\'");
  var links = trailerLinks(title, year, kpId);
  var trailerUrl = trailerPageUrl(title, year, kpId, poster, rating, m.genres);
  var h = '<div class="card">';
  h += '<div class="card-poster-wrap" onclick="openMovieModal(\'' + safeT + '\')">';
  if (poster) h += '<img src="' + esc(poster) + '" alt="" loading="lazy">';
  else h += '<div class="no-poster">' + esc(title) + '</div>';
  if (rating > 0) h += '<span class="card-rating">' + rating.toFixed(1) + '</span>';
  h += '<div class="card-overlay"><div class="card-overlay-actions">';
  h += '<a class="card-action" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Кинопоиск">КП</a>';
  h += '<a class="card-action" href="' + esc(trailerUrl) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Трейлер">▶</a>';
  h += '<button class="card-action card-dislike" onclick="event.stopPropagation();dislikeMovieAndRefresh(\'' + safeT + '\')" title="Не нравится"></button>';
  h += '</div><span class="card-overlay-hint">Подробнее</span></div></div>';
  h += '<div class="info"><div class="title" onclick="openMovieModal(\'' + safeT + '\')">' + esc(title) + (w ? ' ✓' : '') + '</div>';
  h += '<div class="meta">' + esc(year) + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>';
  h += buildGenres(m.genres);
  h += '<button class="card-add" onclick="event.stopPropagation();addMovieToPlaylist({title:\'' + safeT + '\',year:\'' + esc(year) + '\',poster:\'' + esc(poster || '') + '\',kp_id:' + (kpId ? "'" + esc(String(kpId)) + "'" : "null") + '})">＋ В плейлист</button>';
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
  if (append) el.innerHTML += h;
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
  var poster = m.poster || "";
  var kpId = m.kp_id || null;
  var safeT = esc(title).replace(/'/g, "\\'");
  var links = trailerLinks(title, year, kpId);
  var trailerUrl = trailerPageUrl(title, year, kpId, poster, rating, m.genres);
  var h = '<div class="movie-header">';
  if (poster) h += '<img src="' + esc(poster) + '" alt="">';
  h += '<div class="movie-headline"><h2>' + esc(title) + '</h2>' +
       '<p>' + esc(year) + (rating ? ' · ★ ' + rating.toFixed(1) : '') + '</p>' +
       buildGenres(m.genres) + '</div></div>';
  h += buildTrailerBlock(kpId, links, trailerUrl);
  h += '<p class="movie-desc">' + esc(desc) + '</p>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:' +
       (w ? '#34d399' : 'var(--accent)') + '" ' +
       'onclick="toggleWatched(\'' + safeT + '\',\'' + esc(year) + '\');openMovieModal(\'' + safeT + '\')">' +
       (w ? '✓ Просмотрено' : '○ Отметить просмотренным') + '</button>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:#f87171;" ' +
       'onclick="dislikeMovieAndClose(\'' + safeT + '\')"> Не нравится</button>';
  h += '<div class="social-links">' +
       '<a class="social-btn kp" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener">Кинопоиск</a>' +
       '<a class="social-btn rutube" href="' + esc(links.rutube) + '" target="_blank" rel="noopener">Rutube</a>' +
       '</div>';
  $("movie-modal-body").innerHTML = h;
  $("movie-modal").classList.add("open");
}
function dislikeMovieAndRefresh(title) {
  dislikeMovieByTitle(title);
  currentMovies = currentMovies.filter(function (m) { return cleanTitle(m.title) !== title; });
  render(currentMovies, false);
  var active = document.querySelector(".main-section.active");
  if (active && active.id === "section-favorites") renderFavorites();
}
function dislikeMovieAndClose(title) {
  dislikeMovieByTitle(title);
  $("movie-modal").classList.remove("open");
  currentMovies = currentMovies.filter(function (m) { return cleanTitle(m.title) !== title; });
  render(currentMovies, false);
  var active = document.querySelector(".main-section.active");
  if (active && active.id === "section-favorites") renderFavorites();
}

// ============================================================  
// ПОИСК ФИЛЬМОВ                                                
// ============================================================  
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
    currentMovies = [found];
    currentMood = null;
    lastSearchQuery = query;
    render([found], false);
    $("ai-status").textContent = "Найдено: " + found.title + " (" + found.year + ")";
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
    currentMood = null;
    lastSearchQuery = query;
    currentMovies = movies;
    render(movies, false);
    $("ai-status").textContent = "Найдено: " + movies.length + " по жанру «" + query + "»";
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
    currentMood = null;
    lastSearchQuery = topic;
    currentMovies = movies;
    render(movies, false);
    $("ai-status").textContent = "Найдено: " + movies.length + " по теме «" + topic + "»";
  });
}

// ============================================================  
// AI ФИЛЬМЫ                                                    
// ============================================================  
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
    b.id = "ai-retry-btn";
    b.className = "ai-retry-btn";
    if (aiRetryUsed) {
      b.disabled = true;
      b.textContent = " Переделать (использовано)";
    } else {
      b.textContent = " Переделать";
      b.onclick = retryAi;
    }
    h.appendChild(b);
  }
  return h;
}
function retryAi() {
  if (aiRetryUsed || aiBusy || !aiLastQuery) return;
  aiRetryUsed = true;
  aiBusy = true;
  var b = $("ai-retry-btn");
  if (b) { b.disabled = true; b.textContent = " Переделать (использовано)"; b.onclick = null; }
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
    currentMovies = primary;
    currentMood = null;
    lastSearchQuery = null;
    render(primary, false);
    var h = buildAiHeader(" Точный сюжет — нашли 1 фильм", true);
    el.insertBefore(h, el.firstChild);
    if (isPickExplainable(p, m)) el.insertBefore(buildExplainNode(p, m), h.nextSibling);
    return;
  }
  var userQuery = aiLastQuery || "";
  var kp = extractKeywords(userQuery);
  function finish(list, txt) {
    currentMovies = list;
    currentMood = null;
    lastSearchQuery = null;
    render(list, false, 5);
    var hh = buildAiHeader(txt, true);
    el.insertBefore(hh, el.firstChild);
    if (isPickExplainable(p, m)) el.insertBefore(buildExplainNode(p, m), hh.nextSibling);
  }
  var AI_SHOW = 5;
  if (!kp.length) {
    finish(primary, " Рекомендаций: " + Math.min(primary.length, AI_SHOW));
    return;
  }
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
    finish(list, " Подобрали " + sh + " вариантов" + (rest > 0 ? " · ещё " + rest + " ↓" : ""));
  }).catch(function () {
    finish(primary, " Рекомендаций: " + Math.min(primary.length, AI_SHOW));
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
    aiRetryUsed = false;
    aiBusy = true;
    btn.disabled = true;
    status.textContent = "Нейросеть думает… 5–10 секунд";
    $("results").innerHTML = '<p class="empty">Подбираем…</p>';
    var vague = aiLastVague;
    askAI(text)
      .then(function (d) {
        aiBusy = false;
        status.textContent = "Готово";
        renderAiPick(d, vague);
      })
      .catch(function (err) {
        aiBusy = false;
        status.textContent = "Ошибка: " + (err.message || err);
        $("results").innerHTML = '<p class="empty">Не получилось. ' + esc(err.message || "") + '</p>';
      })
      .then(function () { btn.disabled = false; });
  };
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
  if (status) status.textContent = " Нейросеть думает…";
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
          seen[g.appid] = 1;
          found.push(g);
        }
      });
    });
    if (!found.length) {
      if (status) status.textContent = " Не нашлось в базе";
      container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Не нашлось. Уточни запрос.</p>';
      return;
    }
    if (status) status.textContent = " Нашли: " + found.length + " игр";
    filteredGames = found;
    renderGames(found.slice(0, 30));
    if (countEl) countEl.textContent = " AI подобрал: " + found.length + " игр";
    var mb = $("games-load-more");
    if (mb) mb.style.display = found.length > 30 ? "block" : "none";
  } catch (e) {
    if (status) status.textContent = "Ошибка: " + (e.message || "?");
    if (container) container.innerHTML = '<p class="empty" style="grid-column:1/-1;">Ошибка AI: ' + esc(e.message || "") + '</p>';
    showToast("Ошибка AI", true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function loadGames() {
  if (gamesStarted) return;
  gamesStarted = true;
  var loader = $("game-loader");
  if (loader) { loader.style.display = "block"; loader.textContent = "Загрузка базы игр..."; }
  Papa.parse("games.csv", {
    download: true, header: true, skipEmptyLines: true,
    chunk: function (results) {
      var valid = results.data.filter(function (g) {
        if (g.type !== 'game' || !g.name || !g.short_description) return false;
        var hasMeta = parseInt(g.metacritic_score) > 50;
        var hasReviews = parseInt(g.recommendations_total) > 100;
        var text = (g.short_description + " " + g.name).toLowerCase();
        var bad = ['hentai', 'erotic', 'nsfw', 'adult', 'bdsm'];
        if (bad.some(function (w) { return text.includes(w); })) return false;
        return hasMeta || hasReviews;
      });
      allGames = allGames.concat(valid);
      if (loader && !gamesLoaded) loader.textContent = "Загрузка… (" + allGames.length + ")";
    },
    complete: function () {
      gamesLoaded = true;
      if (loader) loader.style.display = "none";
      allGames.sort(function (a, b) {
        return (parseFloat(b.recommendations_total) || 0) - (parseFloat(a.recommendations_total) || 0);
      });
      applyGameFilters();
    },
    error: function () {
      if (loader) loader.innerHTML = '<span style="color:#ef4444;">Ошибка games.csv</span>';
    }
  });
}

function applyGameFilters() {
  var result = allGames.slice();
  var disliked = getDislikedGames();
  if (disliked.length) result = result.filter(function (g) { return disliked.indexOf(String(g.appid)) === -1; });
  if (gameFilters.query && gameFilters.query.length >= 2) {
    var q = gameFilters.query;
    result = result.filter(function (g) {
      return (g.name && g.name.toLowerCase().indexOf(q) !== -1) ||
             (g.short_description && g.short_description.toLowerCase().indexOf(q) !== -1);
    });
  }
  if (gameFilters.mood !== 'all') {
    var rule = MOOD_RULES[gameFilters.mood];
    if (rule) {
      result = result.map(function (g) { return { game: g, score: computeMoodScore(g, rule) }; })
        .filter(function (x) { return x.score > 0; })
        .sort(function (a, b) {
          return Math.abs(b.score - a.score) > 0.5  
            ? b.score - a.score  
            : (parseFloat(b.game.recommendations_total) || 0) - (parseFloat(a.game.recommendations_total) || 0);
        })
        .map(function (x) { return x.game; });
    }
  }
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
  return '<div class="card" data-appid="' + esc(String(game.appid || '')) + '">' +
    '<div class="card-poster-wrap" style="aspect-ratio:460/215;">' +
      '<img src="' + esc(imgSrc) + '" alt="" loading="lazy" style="object-fit:cover;">' +
      '<span class="card-price-badge ' + (isFree ? 'badge-free' : 'badge-paid') + '">' + price + '</span>' +
      '<button class="card-fav-btn' + (fav ? ' active' : '') + '" onclick="event.stopPropagation();toggleGameFavCard(\'' + esc(String(game.appid || '')) + '\')" title="Избранное">' + (fav ? '♥' : '♡') + '</button>' +
      '<div class="card-overlay"><div class="card-overlay-actions">' +
        '<button class="card-action card-dislike" onclick="event.stopPropagation();dislikeGameAndRefresh(\'' + esc(String(game.appid || '')) + '\')" title="Не нравится"></button>' +
      '</div><span class="card-overlay-hint">Подробнее</span></div>' +
    '</div>' +
    '<div class="info">' +
      '<div class="title">' + esc(game.name) + '</div>' +
      '<div class="meta">' + (yearMatch ? esc(yearMatch[0]) : '') +
        (game.developers ? ' · ' + esc(game.developers.split(',')[0]) : '') + '</div>' +
      gHtml +
      '<div class="game-desc-short">' + esc(descShort) + '</div>' +
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
  renderGames(filteredGames.slice(0, gamesDisplayCount));
  var active = document.querySelector(".main-section.active");
  if (active && active.id === "section-favorites") renderFavorites();
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
    h += '<p style="color:#fbbf24;font-weight:700;margin-top:8px;"> Metacritic: ' + meta +
      (votes ? ' · ' + Math.round(votes).toLocaleString('ru-RU') + ' рекомендаций' : '') + '</p>';
  }
  h += '</div></div>';

  // FPS BLOCK — вставляем сюда, сразу после шапки  
  h += renderFpsBlock(game);

  var safeAppid = esc(String(appid || '')).replace(/'/g, "\\'");
  h += '<button class="btn-primary" id="game-modal-fav-btn" style="width:100%;margin-top:15px;margin-bottom:10px;background:' +
       (fav ? '#ec4899' : 'var(--accent)') + '" data-appid="' + safeAppid + '">' +
       (fav ? '♥ В избранном' : '♡ В избранное') + '</button>';
  h += '<button class="btn-primary" id="game-modal-dislike-btn" style="width:100%;margin-bottom:15px;background:#f87171;" data-appid="' + safeAppid + '"> Не нравится</button>';
  h += '<div class="trailer-block"><div class="trailer-title">Трейлер</div>' +
       '<a class="btn-trailer-main" href="' + esc(trailerPage) + '" target="_blank" rel="noopener">▶ Открыть трейлер</a>' +
       '<div class="trailer-links">' +
       '<a class="trailer-link rt" href="' + rutubeSearch + '" target="_blank" rel="noopener">Rutube</a>' +
       '<a class="trailer-link" href="' + ytSearch + '" target="_blank" rel="noopener" style="background:rgba(255,0,51,0.18);border-color:rgba(255,0,51,0.35);">YouTube</a>' +
       (steamUrl ? '<a class="trailer-link" href="' + steamUrl + '" target="_blank" rel="noopener" style="background:rgba(102,192,244,0.18);border-color:rgba(102,192,244,0.35);">Steam</a>' : '') +
       '</div></div>';
  if (descFull) h += '<p class="movie-desc">' + esc(descFull) + '</p>';
  if (translateUrl) h += '<a class="ai-explain-link" href="' + translateUrl + '" target="_blank" rel="noopener"> Перевести описание →</a>';
  h += '<div class="social-links" style="margin-top:20px;">' +
       (steamUrl ? '<a class="social-btn steam" href="' + steamUrl + '" target="_blank" rel="noopener"> Открыть в Steam</a>' : '') +
       '<a class="social-btn rutube" href="' + rutubeSearch + '" target="_blank" rel="noopener">▶ Rutube</a></div>';
  $("game-modal-body").innerHTML = h;
  $("game-modal").classList.add("open");
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
    $("game-modal").classList.remove("open");
    dislikeGameAndRefresh(appid);
    showToast(" Скрыто", false);
  };
}
function closeGameModal() { $("game-modal").classList.remove("open"); }

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
    chips += '<div class="wave-stat-label" style="margin-top:14px;"> Часто ищете</div><div class="wave-stat-chips">';
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
  el.innerHTML = '<p class="empty">Собираем рекомендации по жанрам: ' + topCats.join(', ') + '…</p>';
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
    if (info) info.textContent = " Рекомендации игр";
    renderWaveGames(el);
  } else {
    if (info) info.textContent = " Рекомендации фильмов";
    renderWaveMovies(el);
  }
}

// ============================================================  
// ИЗБРАННОЕ                                                    
// ============================================================  
function switchFavoritesType(type) {
  waveType = type;
  document.querySelectorAll("#favorites-switch button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.fav === type);
  });
  renderFavorites();
}

function renderFavoritesGames(el) {
  var favs = getGameFavorites();
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
  if (waveType === "games") {
    if (info) info.textContent = " Избранные игры (" + getGameFavorites().length + ")";
    renderFavoritesGames(el);
  } else {
    var pl = getPlaylists();
    var count = 0;
    Object.keys(pl).forEach(function (n) { count += (pl[n] || []).length; });
    count += getWatched().length;
    if (info) info.textContent = " Из плейлистов и просмотренных (~" + count + ")";
    renderFavoritesMovies(el);
  }
}

// ============================================================  
// ПАНЕЛЬ «МОЙ ПК»                                              
// ============================================================  
function updatePcTierLabel(fieldId, score) {
  var el = $(fieldId);
  if (!el) return;
  if (score == null) { el.textContent = " Не распознано"; el.style.color = "#8e96a8"; return; }
  var tier = getPcTier(score);
  el.textContent = "● " + tier.label + " · " + score + "/100";
  el.style.color = tier.color;
}

function populateDatalists() {
  var cpuList = $("cpu-list");
  var gpuList = $("gpu-list");
  if (cpuList) {
    cpuList.innerHTML = "";
    Object.keys(CPU_SCORES).sort().forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k;
      cpuList.appendChild(opt);
    });
  }
  if (gpuList) {
    gpuList.innerHTML = "";
    Object.keys(GPU_SCORES).sort().forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k;
      gpuList.appendChild(opt);
    });
  }
}

function openPcPanel() {
  var pc = getUserPC();
  var cpuInput = $("pc-cpu-input");
  var gpuInput = $("pc-gpu-input");
  if (cpuInput) cpuInput.value = pc.cpu || "";
  if (gpuInput) gpuInput.value = pc.gpu || "";
  updatePcTierLabel("pc-cpu-tier", lookupCpuScore(pc.cpu));
  updatePcTierLabel("pc-gpu-tier", lookupGpuScore(pc.gpu));
  document.querySelectorAll("#pc-ram-row button").forEach(function (b) {
    b.classList.toggle("active", Number(b.dataset.ram) === Number(pc.ram));
  });
  var panel = $("pc-panel");
  if (panel) panel.classList.add("open");
}

function savePcFromPanel() {
  var cpuInput = $("pc-cpu-input");
  var gpuInput = $("pc-gpu-input");
  var ram = 16;
  var activeRam = document.querySelector("#pc-ram-row button.active");
  if (activeRam) ram = Number(activeRam.dataset.ram);
  var pc = {
    cpu: cpuInput ? cpuInput.value.trim() : "",
    gpu: gpuInput ? gpuInput.value.trim() : "",
    ram: ram  
  };
  if (!pc.cpu || !pc.gpu) {
    showToast("Укажите CPU и GPU", true);
    return;
  }
  if (lookupGpuScore(pc.gpu) == null) {
    showToast("Не распознали видеокарту. Проверьте название.", true);
    return;
  }
  saveUserPC(pc);
  showToast("✓ ПК сохранён — FPS обновлён");
  var panel = $("pc-panel");
  if (panel) panel.classList.remove("open");
  // Обновляем открытую модалку игры, если она есть  
  var gameModal = $("game-modal");
  if (gameModal && gameModal.classList.contains("open")) {
    var cards = document.querySelectorAll(".card[data-appid]");
    // Просто перерисовываем модалку — но у нас нет game объекта под рукой,
    // поэтому перерисовываем блок FPS в модалке напрямую  
    var fpsBlock = document.querySelector("#game-modal-body .fps-block");
    if (fpsBlock) {
      var modalBody = $("game-modal-body");
      // Найдём игру по названию из h2  
      var titleEl = modalBody.querySelector("h2");
      if (titleEl) {
        var gameTitle = titleEl.textContent;
        var game = null;
        for (var i = 0; i < allGames.length; i++) {
          if (allGames[i].name === gameTitle) { game = allGames[i]; break; }
        }
        if (game) {
          var newBlock = renderFpsBlock(game);
          var wrapper = document.createElement("div");
          wrapper.innerHTML = newBlock;
          fpsBlock.parentNode.replaceChild(wrapper.firstChild, fpsBlock);
        }
      }
    }
  }
}

function initPcPanel() {
  var toggle = $("pc-toggle");
  var close = $("pc-close");
  var save = $("pc-save");
  var cpuInput = $("pc-cpu-input");
  var gpuInput = $("pc-gpu-input");
  var ramRow = $("pc-ram-row");

  if (toggle) toggle.onclick = openPcPanel;
  if (close) close.onclick = function () { $("pc-panel").classList.remove("open"); };
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

  if (tab === "games") {
    $("section-games").classList.add("active");
    $("nav-games").classList.add("active");
    if (!gamesStarted) loadGames();
  } else if (tab === "wave") {
    $("section-wave").classList.add("active");
    $("nav-wave").classList.add("active");
    if (!gamesStarted) loadGames();
    setTimeout(renderWave, 100);
  } else if (tab === "favorites") {
    $("section-favorites").classList.add("active");
    $("nav-favorites").classList.add("active");
    if (!gamesStarted) loadGames();
    setTimeout(renderFavorites, 100);
  } else {
    $("section-movies").classList.add("active");
    $("nav-movies").classList.add("active");
  }
}

// ============================================================  
// ПАРТИКЛЫ                                                     
// ============================================================  
function initParticles() {
  var canvas = $("bg-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var particles = [], conn = 150, cnt = 80;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
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
    requestAnimationFrame(anim);
  }
  anim();
}

// ============================================================  
// ИНИЦИАЛИЗАЦИЯ                                                
// ============================================================  
function init() {
  initParticles();

  // Настройки / плейлисты  
  var sT = $("settings-toggle"), sP = $("settings-panel"), sC = $("settings-close");
  if (sT && sP) sT.onclick = function () { sP.classList.add("open"); };
  if (sC && sP) sC.onclick = function () { sP.classList.remove("open"); };
  var pT = $("playlists-toggle"), pP = $("playlists-panel"), pC = $("playlists-close");
  if (pT && pP) pT.onclick = function () { pP.classList.add("open"); renderPlaylists(); };
  if (pC && pP) pC.onclick = function () { pP.classList.remove("open"); };

  // Панель ПК  
  initPcPanel();

  // Force sync  
  var fsb = $("force-sync-btn");
  if (fsb) fsb.onclick = forceSyncNow;

  // Табы фильмов  
  document.querySelectorAll(".tab-btn:not(.game-tab-btn)").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tab-btn:not(.game-tab-btn)").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".tab-content:not(.game-tab-content)").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      var t = $(this.dataset.target);
      if (t) t.classList.add("active");
    };
  });
  // Табы игр  
  document.querySelectorAll(".game-tab-btn").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".game-tab-btn").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".game-tab-content").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      var t = $(this.dataset.target);
      if (t) t.classList.add("active");
    };
  });

  // Поиск фильмов  
  if ($("search-btn")) $("search-btn").onclick = function () {
    var q = $("search-input").value.trim();
    if (!q) return;
    $("results").innerHTML = '<p class="empty">Поиск...</p>';
    currentMood = null;
    lastSearchQuery = q;
    searchByFilmList(q);
  };
  if ($("search-input")) $("search-input").onkeydown = function (e) {
    if (e.key === "Enter") $("search-btn").click();
  };
  if ($("ai-input")) $("ai-input").onkeydown = function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("ai-button").click(); }
  };

  // Быстрые кнопки фильмов  
  if ($("random-btn")) $("random-btn").onclick = function () {
    var k = Object.keys(categoryParams);
    loadMoviesByMood(k[Math.floor(Math.random() * k.length)]);
  };
  if ($("masterpiece-btn")) $("masterpiece-btn").onclick = function () {
    loadMoviesByMood("best");
  };

  // Жанры фильмов  
  document.querySelectorAll("#moods button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#moods button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      loadMoviesByMood(this.dataset.mood);
    };
  });

  // Тип фильма  
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
    render(n, true);
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
    var upd = function () { if (rv) rv.textContent = rF.value; };
    rF.oninput = upd;
    upd();
  }

  // Акцент  
  document.querySelectorAll(".color-dot").forEach(function (d) {
    d.onclick = function () {
      document.querySelectorAll(".color-dot").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      document.body.setAttribute("data-accent", this.dataset.accent);
      localStorage.setItem("mood_accent", this.dataset.accent);
      saveUserData();
    };
  });
  // Тема  
  document.querySelectorAll(".theme-btn").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".theme-btn").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      document.body.classList.toggle("light", this.dataset.theme === "light");
      localStorage.setItem("mood_theme", this.dataset.theme);
      saveUserData();
    };
  });
  if ($("settings-reset")) $("settings-reset").onclick = function () {
    document.body.removeAttribute("data-accent");
    document.body.classList.remove("light");
    localStorage.removeItem("mood_accent");
    localStorage.removeItem("mood_theme");
    document.querySelectorAll(".color-dot, .theme-btn").forEach(function (el) { el.classList.remove("active"); });
  };
  if ($("clear-wave-stats")) $("clear-wave-stats").onclick = function () {
    if (!confirm("Сбросить историю интересов и поисков?")) return;
    localStorage.removeItem("mood_category_stats");
    localStorage.removeItem("mood_game_searches");
    saveUserData();
    showToast("История сброшена");
    var active = document.querySelector(".main-section.active");
    if (active && active.id === "section-wave") renderWave();
  };

  // Закрытие модалок  
  if ($("movie-modal-close")) $("movie-modal-close").onclick = function () { $("movie-modal").classList.remove("open"); };
  if ($("game-modal-close")) $("game-modal-close").onclick = closeGameModal;
  if ($("profile-modal-close")) $("profile-modal-close").onclick = function () { $("profile-modal").classList.remove("open"); };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      ["movie-modal", "game-modal", "profile-modal"].forEach(function (id) {
        var m = $(id); if (m) m.classList.remove("open");
      });
      ["settings-panel", "playlists-panel", "pc-panel"].forEach(function (id) {
        var p = $(id); if (p) p.classList.remove("open");
      });
    }
  });
  ["movie-modal", "game-modal"].forEach(function (id) {
    var m = $(id);
    if (!m) return;
    m.addEventListener("click", function (e) { if (e.target === m) m.classList.remove("open"); });
  });

  // Применение сохранённых настроек  
  var sa = localStorage.getItem("mood_accent");
  if (sa) document.body.setAttribute("data-accent", sa);
  var st = localStorage.getItem("mood_theme");
  if (st === "light") document.body.classList.add("light");

  // Firebase  
  if (window.firebaseAuth) initFirebase();
  else window.addEventListener("firebase-ready", initFirebase);
  initGoogleLogin();
  initProfile();
  initAI();

  // Настроения игр  
  document.querySelectorAll("#game-moods .mood-chip").forEach(function (chip) {
    chip.onclick = function () {
      document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      gameFilters.mood = this.dataset.mood || "all";
      if (gameFilters.mood !== "all") trackCategoryVisit(gameFilters.mood, "games");
      applyGameFilters();
    };
  });

  // Поиск игр  
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

  // AI игры  
  var gAI = $("game-ai-input"), gAIB = $("game-ai-btn");
  if (gAIB) gAIB.onclick = gameAiSearch;
  if (gAI) gAI.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); gameAiSearch(); }
  });

  // Быстрые кнопки игр  
  if ($("game-random-btn")) $("game-random-btn").onclick = function () {
    var moods = ["relax", "action", "story", "hardcore", "horror"];
    var m = moods[Math.floor(Math.random() * moods.length)];
    document.querySelectorAll("#game-moods .mood-chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.mood === m);
    });
    gameFilters.mood = m;
    trackCategoryVisit(m, "games");
    applyGameFilters();
    showToast(" Случайное настроение");
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

  // Фильтры игр  
  if ($("game-price-filter")) $("game-price-filter").onchange = function (e) { gameFilters.price = e.target.value; applyGameFilters(); };
  if ($("game-year-filter")) $("game-year-filter").onchange = function (e) { gameFilters.year = e.target.value; applyGameFilters(); };
  if ($("game-sort-filter")) $("game-sort-filter").onchange = function (e) { gameFilters.sort = e.target.value; applyGameFilters(); };

  // AI-подсказки игр  
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

  // Показать ещё игр  
  if ($("games-load-more")) $("games-load-more").onclick = function () {
    gamesDisplayCount += 100;
    renderGames(filteredGames.slice(0, gamesDisplayCount));
    if (filteredGames.length <= gamesDisplayCount) this.style.display = "none";
  };

  // Предзагрузка игр в фоне  
  setTimeout(function () { if (!gamesStarted) loadGames(); }, 2000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
