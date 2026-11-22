// ============================================================
// SuperHeroFilms — script.js  
// AI_FN — YandexGPT (нейросеть)
// BASE  — прокси Кинопоиска  
// Трейлер открывается в отдельной вкладке: trailer.html  
// ============================================================

var AI_FN = "https://functions.yandexcloud.net/d4edhc3vf41qqntfflsp";
var BASE  = "https://functions.yandexcloud.net/d4e3i0pd816463uq33eu";

// ---------- 10 категорий (через ?catalog= API) ----------
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

var currentMood = null, currentType = "movie", lastSearchQuery = null, currentMovies = [], currentUser = null;
var currentAlternatives = [];
var currentProfile = { name: "", avatar: "", color: "#e8eaed" };
var firebaseReady = false, fbAuth = null, fbDb = null, fbProvider = null;

var kinopoiskCache = JSON.parse(localStorage.getItem("kinopoisk_cache") || "{}");
function saveKinopoiskCache() { try { localStorage.setItem("kinopoisk_cache", JSON.stringify(kinopoiskCache)); } catch (e) {} }

function $(id) { return document.getElementById(id); }

// ---------- Утилиты ----------
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function normalize(s) {
  return (s || "").toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\wа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  var prev = Array(b.length + 1).fill(0).map(function (_, i) { return i; });
  for (var i = 1; i <= a.length; i++) {
    var cur = [i];
    for (var j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
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
  var maxLen = Math.max(q.length, t.length);
  return Math.max(0, 1 - levenshtein(q, t) / maxLen);
}

// «Расплывчатость» запроса:
// true  → показать до 5 вариантов + добор по ключевым словам.
// false → показать 1 фильм по точному сюжету.
function isVagueQuery(text) {
  var t = (text || "").trim();
  if (!t) return true;
  var words = t.split(/\s+/).filter(Boolean);
  var score = 0;
  if (words.length >= 6) score += 2;
  else if (words.length >= 4) score += 1;
  if (/[А-ЯЁA-Z]/.test(t.slice(1))) score += 1;
  if (/[«»"']/.test(t)) score += 1;
  if (/\d/.test(t)) score += 1;
  return score < 2;
}

// ---------- Ключевые слова для добора из Кинопоиска ----------  
var STOPWORDS = [
  "хочу", "хотел", "хотела", "хотелось", "хочется",
  "фильм", "фильмы", "фильма", "кино", "киношка",
  "про", "о", "об", "обо", "мне", "меня", "нам", "тебе", "вам",
  "покажи", "покажите", "найди", "найдите", "подбери", "подберите",
  "посмотреть", "смотреть", "глянуть", "включить",
  "где", "что", "как", "когда", "кто", "почему", "зачем", "куда",
  "и", "с", "со", "на", "в", "во", "по", "для", "или", "но", "да",
  "не", "ни", "без", "очень", "самый", "самая", "самое", "самые",
  "такой", "такая", "такое", "такие", "типа", "вроде",
  "похожий", "похожее", "похожая", "похожие",
  "чем", "то", "это", "этот", "эта", "эти",
  "один", "одна", "одно", "два", "две", "три", "четыре", "пять",
  "хороший", "хорошая", "хорошее", "хорошие",
  "плохой", "плохая", "плохое", "плохие",
  "новый", "новая", "новое", "новые", "новинка", "новинки",
  "старый", "старая", "старое", "старые",
  "настроение", "настроения", "настроению",
  "посоветуй", "посоветуйте", "порекомендуй", "порекомендуйте",
  "сегодня", "вечером", "вечер", "утром", "выходные",
  "хорошо", "плохо", "класс", "супер", "вау",
  "да", "нет", "ну", "вот", "так", "там", "тут", "здесь"
];

function keywordStem(w) {
  w = String(w || "").toLowerCase().replace(/ё/g, "е");
  if (w.length <= 5) return w;
  return w.slice(0, 5);
}

function extractKeywords(text) {
  var t = (text || "").toLowerCase().replace(/ё/g, "е");
  var words = t.split(/[^\wа-я0-9]+/i).filter(Boolean);
  var out = [];
  var seen = {};
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
  var text = [
    movie.title || "",
    movie.originalTitle || "",
    movie.description || "",
    (movie.genres || []).join(" ")
  ].join(" ").toLowerCase().replace(/ё/g, "е");
  for (var i = 0; i < stems.length; i++) {
    if (text.indexOf(stems[i]) !== -1) return true;
  }
  return false;
}

function fillFromKeywords(keywordPairs, limit) {
  if (!keywordPairs || !keywordPairs.length) return Promise.resolve([]);
  var words = keywordPairs.map(function (x) { return x.word; }).slice(0, 4);
  var stems = keywordPairs.map(function (x) { return x.stem; });
  var jobs = words.map(function (w) { return fetchKinopoiskRaw(w, 20); });

  return Promise.all(jobs).then(function (arrays) {
    var seen = {};
    var all = [];
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
  toast._timer = setTimeout(function () { toast.className = "toast"; }, 2500);
}

function fetchWithTimeout(url, ms) {
  return Promise.race([fetch(url), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms || 20000); })]);
}

function extractYear(title) {
  var m = (title || '').match(/\((\d{4})\)\s*$/);
  return m ? m[1] : '';
}
function cleanTitle(title) {
  return (title || '').replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

// ---------- Кинопоиск ----------
function mapDoc(d) {
  return {
    kp_id: d.id || null,
    title: d.name || d.alternativeName || "",
    originalTitle: d.alternativeName || d.nameOriginal || "",
    year: d.year || "",
    poster: d.poster ? (d.poster.previewUrl || d.poster.url) : null,
    rating: d.rating && d.rating.kp ? d.rating.kp  
      : (d.rating && d.rating.imdb ? d.rating.imdb : null),
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
      if (!data || !data.docs) {
        console.log("[BASE] «" + query + "» → нет docs.");
        return [];
      }
      var docs = data.docs.map(mapDoc).filter(function (m) { return m.poster; });
      console.log("[BASE] «" + query + "» → " + docs.length);
      return docs;
    })
    .catch(function (e) {
      console.log("[BASE] ошибка:", e && e.message ? e.message : e);
      return [];
    });
}

function fetchCategoryDocs(params) {
  var p = Object.assign({ catalog: "1", page: "1", limit: "30" }, params || {});
  var url = BASE + "?" + Object.keys(p).map(function (k) {
    return k + "=" + encodeURIComponent(p[k]);
  }).join("&");
  return fetchWithTimeout(url, 15000)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d._err) console.log("[category] server:", d._err);
      return (d && d.docs ? d.docs : []).map(mapDoc).filter(function (m) {
        return m.poster && passUserFilters(m);
      });
    })
    .catch(function (e) {
      console.error("[fetchCategoryDocs]", e);
      return [];
    });
}

function fetchKinopoisk(title) {
  var key = "v2:" + normalize(title);
  if (kinopoiskCache[key]) return Promise.resolve(kinopoiskCache[key]);

  return fetchKinopoiskRaw(title, 10).then(function (candidates) {
    if (!candidates.length) return null;

    var scored = candidates.map(function (m) {
      var s = Math.max(
        relevanceScore(title, m.title),
        relevanceScore(title, m.originalTitle)
      );
      return { m: m, s: s };
    }).filter(function (x) { return x.s >= 0.55; });

    if (!scored.length) return null;

    scored.sort(function (a, b) {
      if (Math.abs(b.s - a.s) > 0.05) return b.s - a.s;
      return (b.m.votes || 0) - (a.m.votes || 0);
    });

    kinopoiskCache[key] = scored[0].m;
    saveKinopoiskCache();
    return scored[0].m;
  });
}

function matchType(m, type) {
  if (type === "movie") return m.type === "movie" || m.type === "";
  if (type === "series") return m.type === "tv-series" || m.type === "mini-series";
  if (type === "cartoon") return m.genres.indexOf("анимация") !== -1 || m.type === "cartoon";
  if (type === "documentary")
    return m.genres.indexOf("документальный") !== -1 || m.type === "documentary";
  return true;
}

function fetchCandidatesFromKinopoisk(query, limit, typeFilter) {
  return fetchKinopoiskRaw(query, limit || 30).then(function (movies) {
    if (typeFilter) {
      movies = movies.filter(function (m) { return matchType(m, typeFilter); });
    }
    return movies;
  });
}

// ---------- Жанры и фильтры ----------
function genreMatches(movieGenres, targetGenres) {
  if (!movieGenres || !targetGenres || !targetGenres.length) return false;
  var normTargets = targetGenres.map(normalize);
  for (var i = 0; i < movieGenres.length; i++) {
    var g = normalize(movieGenres[i]);
    var tr = normalize(genreTranslations[movieGenres[i]] || movieGenres[i]);
    if (normTargets.indexOf(g) !== -1 || normTargets.indexOf(tr) !== -1) return true;
  }
  return false;
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
  var nowYear = new Date().getFullYear();
  var r = m.rating || 0;
  var y = parseInt(m.year, 10) || 0;

  if (r > 0 && r < f.minRating) return false;
  if (y && y < f.minYear) return false;
  if (f.unwatchedOnly && isWatched(cleanTitle(m.title))) return false;
  if (f.newOnly && y < nowYear - 1) return false;
  if (isHidden(cleanTitle(m.title))) return false;
  return true;
}

function popularitySort(a, b) {
  var sa = Math.log10((a.votes || 0) + 1) * 3 + (a.rating || 0);
  var sb = Math.log10((b.votes || 0) + 1) * 3 + (b.rating || 0);
  return sb - sa;
}

// ---------- Firebase ----------
function initFirebase() {
  if (window.firebaseAuth) {
    fbAuth = window.firebaseAuth; fbDb = window.firebaseDb; fbProvider = window.googleProvider; firebaseReady = true;
    window.firebaseOnAuth(fbAuth, function (user) {
      if (user) {
        currentUser = { id: user.uid, name: user.displayName || user.email, picture: user.photoURL };
        localStorage.setItem("mood_user", JSON.stringify(currentUser));
        renderUserInfo(); loadUserData(user.uid);
      } else { currentUser = null; localStorage.removeItem("mood_user"); renderUserInfo(); }
    });
  }
}
function renderUserInfo() {
  var el = $("user-info"), btn = $("google-login-btn");
  if (!el) return;
  if (currentUser) {
    el.style.display = "inline-flex"; if (btn) btn.style.display = "none";
    el.innerHTML = (currentProfile.avatar || currentUser.picture ? '<img src="' + (currentProfile.avatar || currentUser.picture) + '">' : '') +
      '<span style="color:' + (currentProfile.color || "#e8eaed") + '">' + (currentProfile.name || currentUser.name) + '</span>' +
      '<button id="edit-prof-btn">✎</button><button id="logout-btn">Выйти</button>';
    $("edit-prof-btn").onclick = openProfile;
    $("logout-btn").onclick = function () { window.firebaseSignOut(fbAuth).then(function () { currentUser = null; localStorage.removeItem("mood_user"); renderUserInfo(); }); };
  } else { el.style.display = "none"; if (btn) btn.style.display = "inline-flex"; }
}
function initGoogleLogin() {
  var btn = $("google-login-btn");
  if (btn) btn.onclick = function () {
    if (firebaseReady) {
      window.firebaseSignIn(fbAuth, fbProvider).catch(function (err) {
        if (err.code === 'auth/popup-blocked') showToast("Разрешите всплывающие окна!", true);
        else showToast("Ошибка: " + err.message, true);
      });
    } else showToast("Подождите...", true);
  };
}
function openProfile() {
  var m = $("profile-modal");
  $("profile-name-input").value = currentProfile.name || (currentUser ? currentUser.name : "");
  $("profile-avatar-input").value = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  $("profile-avatar-img").src = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  document.querySelectorAll(".profile-color-dot").forEach(function (d) { d.classList.toggle("active", d.dataset.color === currentProfile.color); });
  var pl = getPlaylists(), count = 0;
  for (var k in pl) count += pl[k].length;
  $("profile-stats").innerHTML = "Фильмов в плейлистах: <b>" + count + "</b><br>Просмотрено: <b>" + getWatched().length + "</b>";
  m.classList.add("open");
}
function initProfile() {
  var m = $("profile-modal");
  $("profile-modal-close").onclick = function () { m.classList.remove("open"); };
  $("profile-save-btn").onclick = function () {
    currentProfile.name = $("profile-name-input").value;
    currentProfile.avatar = $("profile-avatar-input").value;
    localStorage.setItem("mood_profile", JSON.stringify(currentProfile));
    renderUserInfo(); saveUserData(); m.classList.remove("open");
  };
  document.querySelectorAll(".profile-color-dot").forEach(function (dot) {
    dot.onclick = function () {
      document.querySelectorAll(".profile-color-dot").forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active"); currentProfile.color = this.dataset.color;
    };
  });
  var saved = localStorage.getItem("mood_profile");
  if (saved) { try { currentProfile = JSON.parse(saved); } catch (e) {} }
}
function saveUserData() {
  if (!currentUser || !firebaseReady || !fbDb) return;
  window.firebaseSetDoc(window.firebaseDoc(fbDb, "users", currentUser.id), {
    playlists: getPlaylists(), watched: getWatched(), hidden: getHidden(), profile: currentProfile,
    accent: localStorage.getItem("mood_accent") || "", theme: localStorage.getItem("mood_theme") || "dark"
  }, { merge: true }).catch(console.error);
}
function loadUserData(userId) {
  if (!firebaseReady || !fbDb) return;
  window.firebaseGetDoc(window.firebaseDoc(fbDb, "users", userId)).then(function (snap) {
    if (snap.exists()) {
      var d = snap.data();
      if (d.playlists) localStorage.setItem("mood_movies_playlists", JSON.stringify(d.playlists));
      if (d.watched) localStorage.setItem("mood_watched", JSON.stringify(d.watched));
      if (d.hidden) localStorage.setItem("mood_hidden", JSON.stringify(d.hidden));
      if (d.profile) { currentProfile = d.profile; localStorage.setItem("mood_profile", JSON.stringify(currentProfile)); renderUserInfo(); }
      if (d.accent) { localStorage.setItem("mood_accent", d.accent); document.body.setAttribute("data-accent", d.accent); }
      if (d.theme) { localStorage.setItem("mood_theme", d.theme); document.body.classList.toggle("light", d.theme === "light"); }
      renderPlaylists(); showToast("Данные загружены");
    }
  }).catch(console.error);
}

// ---------- Скрытые / просмотренные ----------
function getHidden() { try { return JSON.parse(localStorage.getItem("mood_hidden") || "[]"); } catch (e) { return []; } }
function hideMovie(title) { var l = getHidden(); if (l.indexOf(title) === -1) { l.push(title); localStorage.setItem("mood_hidden", JSON.stringify(l)); saveUserData(); } }
function isHidden(title) { return getHidden().indexOf(title) !== -1; }
function getWatched() { try { return JSON.parse(localStorage.getItem("mood_watched") || "[]"); } catch (e) { return []; } }
function isWatched(title) { var l = getWatched(); for (var i = 0; i < l.length; i++) if (l[i].title === title) return true; return false; }
function toggleWatched(title, year) {
  var l = getWatched(), f = -1; for (var i = 0; i < l.length; i++) if (l[i].title === title) { f = i; break; }
  if (f === -1) l.push({ title: title, year: year }); else l.splice(f, 1);
  localStorage.setItem("mood_watched", JSON.stringify(l)); saveUserData(); return f === -1;
}

// ---------- Плейлисты ----------
function getPlaylists() { try { return JSON.parse(localStorage.getItem("mood_movies_playlists") || "{}"); } catch (e) { return {}; } }
function savePlaylists(p) { localStorage.setItem("mood_movies_playlists", JSON.stringify(p)); saveUserData(); }
function createPlaylist(name) { var p = getPlaylists(); var k = name.trim(); if (!k) return false; if (!p[k]) { p[k] = []; savePlaylists(p); return true; } return false; }
function addToPlaylist(name, movie) {
  var p = getPlaylists(); if (!p[name]) p[name] = [];
  var ex = p[name].some(function (x) { return x.title === movie.title; });
  if (!ex) { movie.watched = false; p[name].push(movie); savePlaylists(p); return true; } return false;
}
function removeFromPlaylist(name, title) {
  var p = getPlaylists(); if (!p[name]) return;
  p[name] = p[name].filter(function (x) { return x.title !== title; }); savePlaylists(p);
}
function addMovieToPlaylist(movie) {
  var p = getPlaylists(), names = Object.keys(p);
  if (!names.length) {
    var n = prompt("Название нового плейлиста:", "Мой плейлист");
    if (n && n.trim()) { createPlaylist(n); addToPlaylist(n.trim(), movie); showToast("Добавлено в «" + n.trim() + "»"); }
    return;
  }
  var txt = names.map(function (x, i) { return (i + 1) + ". " + x; }).join("\n");
  var c = prompt("В какой плейлист?\n\n" + txt + "\n\nИли введите название нового:", "1");
  if (!c) return;
  var idx = parseInt(c, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= names.length) { addToPlaylist(names[idx - 1], movie); showToast("Добавлено в «" + names[idx - 1] + "»"); }
  else { createPlaylist(c); addToPlaylist(c.trim(), movie); showToast("Добавлено в «" + c.trim() + "»"); }
}
function renderPlaylists() {
  var el = $("playlists-list"); if (!el) return;
  var p = getPlaylists(), names = Object.keys(p);
  if (!names.length) { el.innerHTML = '<p class="hint">Пусто. Создай первый!</p>'; return; }
  var h = "";
  names.forEach(function (n) {
    var items = p[n] || [], nw = items.filter(function (m) { return !m.watched; }), w = items.filter(function (m) { return m.watched; });
    h += '<div class="playlist"><div class="playlist-title"><span>' + esc(n) + ' (' + items.length + ')</span>';
    h += '<button class="playlist-del" onclick="if(confirm(\'Удалить?\')){deletePlaylist(\'' + esc(n).replace(/'/g, "\\'") + '\');}">✕</button></div>';
    if (!items.length) h += '<p class="hint">Пусто</p>';
    else {
      if (nw.length) { h += '<div class="playlist-sub">Не просмотрено:</div>'; nw.forEach(function (m) { h += buildPlaylistItem(n, m); }); }
      if (w.length) { h += '<div class="playlist-sub">Просмотрено:</div>'; w.forEach(function (m) { h += buildPlaylistItem(n, m); }); }
    }
    h += '</div>';
  });
  el.innerHTML = h;
}
function buildPlaylistItem(n, m) {
  var safeN = esc(n).replace(/'/g, "\\'");
  var safeT = esc(m.title).replace(/'/g, "\\'");
  return '<div class="playlist-item">' + (m.poster ? '<img src="' + esc(m.poster) + '">' : '') + '<div class="pl-title">' + esc(m.title) + '</div>' +
    '<button class="pl-check" onclick="togglePlaylistWatched(\'' + safeN + '\',\'' + safeT + '\')" style="color:' + (m.watched ? '#34d399' : '#8f9bab') + '">✓</button>' +
    '<button class="pl-del" onclick="removeFromPlaylist(\'' + safeN + '\',\'' + safeT + '\');renderPlaylists();">✕</button></div>';
}
function deletePlaylist(name) { var p = getPlaylists(); delete p[name]; savePlaylists(p); renderPlaylists(); }
function togglePlaylistWatched(n, t) { var p = getPlaylists(); if (!p[n]) return; p[n].forEach(function (x) { if (x.title === t) x.watched = !x.watched; }); savePlaylists(p); renderPlaylists(); }

// ---------- Рендер ----------
function buildStars(r) {
  var s = "";
  for (var i = 1; i <= 5; i++) s += '<span style="color:' + (r >= i * 2 - 0.5 ? "#fbbf24" : "#3a4552") + '">★</span>';
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

// ---------- Ссылки на трейлеры ----------
function trailerLinks(title, year, kpId) {
  var q = encodeURIComponent(title + " " + (year || "") + " трейлер");
  return {
    kp:      kpId ? "https://www.kinopoisk.ru/film/" + kpId + "/video/" :
                    "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(title),
    kpPage:  kpId ? "https://www.kinopoisk.ru/film/" + kpId + "/" :
                    "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(title),
    rutube:  "https://rutube.ru/search/?query=" + q,
    vk:      "https://vk.com/video?q=" + q,
    youtube: "https://www.youtube.com/results?search_query=" + q  
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
  var h = '<div class="trailer-block">';
  h += '<div class="trailer-title">Трейлер</div>';
  h += '<a class="btn-trailer-main" href="' + esc(trailerUrl) + '" target="_blank" rel="noopener">▶ Открыть трейлер</a>';
  h += '<div class="trailer-links">';
  h += '<a class="trailer-link kp" href="' + esc(links.kp) + '" target="_blank" rel="noopener">Кинопоиск</a>';
  h += '<a class="trailer-link rt" href="' + esc(links.rutube) + '" target="_blank" rel="noopener">Rutube</a>';
  h += '<a class="trailer-link vk" href="' + esc(links.vk) + '" target="_blank" rel="noopener">VK Видео</a>';
  h += '</div>';
  h += '</div>';
  return h;
}

var RENDER_LIMIT = 20;

function render(movies, append) {
  var el = $("results"); if (!el) return;
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
    toRender = movies.slice(0, RENDER_LIMIT);
    currentMovies = movies;
  }

  var h = "";
  toRender.forEach(function (m) {
    var title = cleanTitle(m.title || "");
    var year = m.year || extractYear(m.title || "");
    var poster = m.poster || null;
    var rating = m.rating || 0;
    var w = isWatched(title);
    var kpId = m.kp_id || null;
    var safeT = esc(title).replace(/'/g, "\\'");
    var links = trailerLinks(title, year, kpId);
    var trailerUrl = trailerPageUrl(title, year, kpId, poster, rating, m.genres);

    h += '<div class="card">';
    h += '<div class="card-poster-wrap" onclick="openMovieModal(\'' + safeT + '\')">';
    if (poster) h += '<img src="' + esc(poster) + '" alt="" loading="lazy">';
    else h += '<div class="no-poster">' + esc(title) + '</div>';
    if (rating > 0) h += '<span class="card-rating">' + rating.toFixed(1) + '</span>';
    h += '<div class="card-overlay">';
    h += '<div class="card-overlay-actions">';
    h += '<a class="card-action" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Кинопоиск">КП</a>';
    h += '<a class="card-action" href="' + esc(trailerUrl) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Трейлер">▶</a>';
    h += '<a class="card-action" href="' + esc(links.rutube) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Rutube">R</a>';
    h += '</div>';
    h += '<span class="card-overlay-hint">Подробнее</span>';
    h += '</div></div>';
    h += '<div class="info">';
    h += '<div class="title" onclick="openMovieModal(\'' + safeT + '\')">' + esc(title) + (w ? ' ✓' : '') + '</div>';
    h += '<div class="meta">' + esc(year) + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>';
    h += buildGenres(m.genres);
    h += '<button class="card-add" onclick="addMovieToPlaylist({title:\'' + safeT + '\',year:\'' + esc(year) + '\',poster:\'' + esc(poster || '') + '\',kp_id:' + (kpId ? "'" + esc(String(kpId)) + "'" : "null") + '})">＋ В плейлист</button>';
    h += '</div></div>';
  });

  if (append) el.innerHTML += h; else el.innerHTML = h;

  var lm = $("load-more");
  if (lm) {
    var shownCount = document.querySelectorAll("#results .card").length;
    lm.style.display = (currentMovies.length > shownCount) ? "block" : "none";
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
  h += '<div class="movie-headline">' +
       '<h2>' + esc(title) + '</h2>' +
       '<p>' + esc(year) + (rating ? ' · ★ ' + rating.toFixed(1) : '') + '</p>' +
       buildGenres(m.genres) +
       '</div></div>';

  h += buildTrailerBlock(kpId, links, trailerUrl);
  h += '<p class="movie-desc">' + esc(desc) + '</p>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:' +
       (w ? '#34d399' : 'var(--accent)') + '" ' +
       'onclick="toggleWatched(\'' + safeT + '\',\'' + esc(year) + '\');openMovieModal(\'' + safeT + '\')">' +
       (w ? '✓ Просмотрено' : '○ Отметить просмотренным') + '</button>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:#f87171;" ' +
       'onclick="hideMovie(\'' + safeT + '\');document.getElementById(\'movie-modal\').classList.remove(\'open\');showToast(\'Скрыто\')">Скрыть из выдачи</button>';
  h += '<div class="social-links">';
  h += '<a class="social-btn kp" href="' + esc(links.kpPage) + '" target="_blank" rel="noopener">Кинопоиск</a>';
  h += '<a class="social-btn rutube" href="' + esc(links.rutube) + '" target="_blank" rel="noopener">Rutube</a>';
  h += '</div>';

  $("movie-modal-body").innerHTML = h;
  $("movie-modal").classList.add("open");
}

// ---------- Поиск ----------
function searchByFilmList(query) {
  return fetchKinopoiskRaw(query, 40).then(function (movies) {
    if (!movies || !movies.length) {
      currentMovies = [];
      render([], false);
      return;
    }

    var scored = movies.map(function (m) {
      var rel = Math.max(
        relevanceScore(query, m.title),
        relevanceScore(query, m.originalTitle || "")
      );
      return { m: m, s: rel };
    }).filter(function (x) { return x.s >= 0.3; });

    scored.sort(function (a, b) {
      if (Math.abs(b.s - a.s) > 0.1) return b.s - a.s;
      return (b.m.votes || 0) - (a.m.votes || 0);
    });

    var list = scored.map(function (x) { return x.m; });
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
    currentMood = null; lastSearchQuery = query;
    render([found], false);
    $("ai-status").textContent = "Найдено: " + found.title + " (" + found.year + ")";
  });
}

function searchByGenre(query) {
  return fetchCandidatesFromKinopoisk(query, 40, currentType).then(function (candidates) {
    if (!candidates.length) throw new Error("По жанру «" + query + "» ничего не нашлось");
    var byGenre = candidates.filter(function (m) {
      return m.genres.some(function (g) {
        var tr = genreTranslations[g] || g;
        return normalize(tr) === normalize(query) || normalize(g) === normalize(query);
      });
    });
    if (byGenre.length) candidates = byGenre;
    candidates = candidates.filter(passUserFilters);
    candidates.sort(popularitySort);
    if (!candidates.length) throw new Error("По фильтрам ничего не осталось");
    var movies = candidates.slice(0, 5);
    currentMood = null; lastSearchQuery = query;
    currentMovies = movies;
    render(movies, false);
    $("ai-status").textContent = "Найдено: " + movies.length + " популярных по жанру «" + query + "»";
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
    var seen = {};
    var all = [];
    arrays.forEach(function (arr) {
      arr.forEach(function (m) {
        var key = normalize(m.title) + "|" + (m.year || "");
        if (!seen[key]) { seen[key] = 1; all.push(m); }
      });
    });
    if (!all.length) throw new Error("По теме «" + topic + "» ничего не нашлось");
    all = all.filter(passUserFilters);
    if (!all.length) throw new Error("По фильтрам ничего не осталось");
    all.sort(popularitySort);
    var movies = all.slice(0, 5);
    currentMood = null; lastSearchQuery = topic;
    currentMovies = movies;
    render(movies, false);
    $("ai-status").textContent = "Найдено: " + movies.length + " популярных по теме «" + topic + "»";
  });
}

// ---------- Нейросеть ----------
function askAI(text) {
  return fetch(AI_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: text, text: text })
  }).then(function (r) {
    return r.text().then(function (t) {
      var d = null;
      try {
        d = JSON.parse(t);
      } catch (e) {
        throw new Error("Ответ не JSON (HTTP " + r.status + "): " + t.slice(0, 120));
      }
      if (!r.ok) throw new Error(d.error || ("HTTP " + r.status));
      if (!d.ok) throw new Error(d.error || "Ошибка подбора");
      return d;
    });
  });
}

function fromAiMovie(m) {
  return {
    kp_id: m.kp_id || null,
    title: m.title || "",
    originalTitle: m.title_original || "",
    year: m.year || "",
    poster: m.poster || null,
    rating: m.rating_kp || null,
    description: m.description || "",
    genres: m.genres || [],
    votes: 0,
    type: "movie"
  };
}

function isPickExplainable(p, m) {
  return !!(m && (p.reason || p.mood || p.note));
}
function buildExplainNode(p, m) {
  var block = document.createElement("div");
  block.className = "ai-explain";
  block.innerHTML =
    '<div class="ai-explain-label">Почему этот фильм</div>' +
    "<p>" + esc(p.reason || "") + "</p>" +
    (p.mood ? '<p class="ai-explain-meta">Настроение: <b>' + esc(p.mood) + "</b></p>" : "") +
    (p.note ? '<p class="ai-explain-meta">Деталь: ' + esc(p.note) + "</p>" : "") +
    (m.url ? '<a class="ai-explain-link" href="' + esc(m.url) + '" target="_blank" rel="noopener">Открыть на Кинопоиске →</a>' : "");
  return block;
}
function renderSimpleAiFallback(el, p) {
  el.innerHTML =
    '<div class="ai-explain">' +
    '<div class="ai-explain-label">Подбор нейросети</div>' +
    "<h3>" + esc(p.title || "Фильм") + (p.year ? " (" + esc(p.year) + ")" : "") + "</h3>" +
    "<p>" + esc(p.reason || "") + "</p>" +
    '<p class="ai-explain-meta">Карточка в базе не нашлась — проверьте название вручную.</p>' +
    "</div>";
  var lm = $("load-more");
  if (lm) lm.style.display = "none";
}

// Новый renderAiPick:
// vague=false → ровно 1 фильм (без кнопки).
// vague=true  → всё, что вернул AI (movie + alternatives), +
//               добор ТОЛЬКО по ключевым словам запроса (не по жанру!).
//               Кнопка «Показать ещё» появляется, если релевантных набралось > 20.
function renderAiPick(data, vague) {
  var el = $("results");
  if (!el) return;

  var p = (data && data.pick) || {};
  var m = data && data.movie;
  var alts = (data && data.alternatives) || [];

  var primary = [];
  if (m) primary.push(fromAiMovie(m));

  if (vague) {
    var seen0 = {};
    if (m && m.title) seen0[normalize(m.title)] = 1;
    alts.forEach(function (a) {
      if (primary.length >= 5) return;
      var key = normalize(a.title || "");
      if (key && !seen0[key]) { seen0[key] = 1; primary.push(fromAiMovie(a)); }
    });
  }

  currentAlternatives = alts.slice();

  if (!primary.length) {
    currentMovies = [];
    currentMood = null;
    lastSearchQuery = null;
    renderSimpleAiFallback(el, p);
    return;
  }

  // Точный сюжет → 1 фильм  
  if (!vague) {
    currentMovies = primary;
    currentMood = null;
    lastSearchQuery = null;
    render(primary, false);
    var headExact = document.createElement("div");
    headExact.className = "ai-header";
    headExact.textContent = "Точный сюжет — нашли 1 фильм";
    el.insertBefore(headExact, el.firstChild);
    if (isPickExplainable(p, m)) {
      el.insertBefore(buildExplainNode(p, m), headExact.nextSibling);
    }
    return;
  }

  // Расплывчатый запрос — добираем ТОЛЬКО по ключевым словам запроса  
  var userQuery = ($("ai-input") && $("ai-input").value) || "";
  var keywordPairs = extractKeywords(userQuery);

  function finishWithHeader(list, headerText) {
    currentMovies = list;
    currentMood = null;
    lastSearchQuery = null;
    render(list, false);
    var head = document.createElement("div");
    head.className = "ai-header";
    head.textContent = headerText;
    el.insertBefore(head, el.firstChild);
    if (isPickExplainable(p, m)) {
      el.insertBefore(buildExplainNode(p, m), head.nextSibling);
    }
  }

  if (primary.length >= 5 || !keywordPairs.length) {
    finishWithHeader(
      primary,
      "Рекомендаций от нейросети: " + primary.length +
      (primary.length < 5 ? " (по запросу больше ничего релевантного не нашли — попробуйте уточнить)" : "")
    );
    return;
  }

  // Показываем AI-часть сразу, потом параллельно ищем добор  
  el.innerHTML = '<p class="empty">Ищем ещё по вашему запросу…</p>';

  fillFromKeywords(keywordPairs, 60).then(function (extra) {
    var seen = {};
    primary.forEach(function (x) { seen[normalize(x.title)] = 1; });

    var add = [];
    extra.forEach(function (mv) {
      var key = normalize(mv.title);
      if (seen[key]) return;
      if (mv.rating && mv.rating < 6) return;
      seen[key] = 1;
      add.push(mv);
    });

    var need = Math.max(0, 5 - primary.length);
    var list = primary.slice();
    for (var i = 0; i < need && i < add.length; i++) list.push(add[i]);
    // добиваем ещё, чтобы была кнопка «Показать ещё», если релевантных много  
    var room = 40 - list.length;
    if (room > 0) {
      for (var j = need; j < add.length && list.length < 40; j++) list.push(add[j]);
    }

    var extraCount = list.length - primary.length;
    var headText = "От нейросети: " + primary.length;
    if (extraCount > 0) headText += " · по ключевым словам вашего запроса: " + extraCount;
    if (list.length < 5) headText += " · больше релевантного найти не удалось";

    finishWithHeader(list, headText);
  }).catch(function (e) {
    console.error("[renderAiPick fill]", e);
    finishWithHeader(primary, "Рекомендаций от нейросети: " + primary.length);
  });
}

function showAiAlternative(i) {
  var m = currentAlternatives[i];
  if (!m) return;
  var movie = fromAiMovie(m);
  currentMovies = [movie];
  currentMood = null;
  lastSearchQuery = null;
  render([movie], false);
  showToast("Вариант: " + movie.title);
}

function initAI() {
  var aiInput = $("ai-input");
  var aiButton = $("ai-button");
  var aiStatus = $("ai-status");
  if (!aiButton) return;

  aiButton.onclick = function () {
    var text = aiInput.value.trim();
    if (!text) { showToast("Введите описание фильма", true); return; }
    if (aiButton.disabled) return;

    var vague = isVagueQuery(text);

    aiButton.disabled = true;
    aiStatus.textContent = "Нейросеть думает… 5–10 секунд";
    $("results").innerHTML = '<p class="empty">Подбираем фильм…</p>';

    askAI(text)
      .then(function (data) {
        aiStatus.textContent = "Готово";
        renderAiPick(data, vague);
      })
      .catch(function (err) {
        aiStatus.textContent = "Ошибка: " + (err.message || err);
        $("results").innerHTML = '<p class="empty">Не получилось подобрать. ' + esc(err.message || "") + '</p>';
      })
      .then(function () {
        aiButton.disabled = false;
      });
  };
}

// ---------- Категории ----------
function loadMoviesByMood(mood) {
  var el = $("results"); if (!el) return;

  var params;
  if (mood === "best") params = { best: "1" };
  else params = categoryParams[mood];
  if (!params) return;

  currentMood = mood;
  lastSearchQuery = null;
  el.innerHTML = '<p class="empty">Подбираем фильмы...</p>';

  var p = Object.assign({ catalog: "1", page: "1", limit: "30" }, params);
  var url = BASE + "?" + Object.keys(p).map(function (k) {
    return k + "=" + encodeURIComponent(p[k]);
  }).join("&");

  fetchWithTimeout(url, 15000)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && data._err) console.log("[category] server:", data._err);
      var docs = (data && data.docs ? data.docs : []).map(mapDoc).filter(function (m) {
        return m.poster && passUserFilters(m);
      });
      if (!docs.length) { el.innerHTML = '<p class="empty">Ничего не найдено.</p>'; return; }
      currentMovies = docs;
      render(docs, false);
    })
    .catch(function (e) {
      console.error("[category]", e);
      el.innerHTML = '<p class="empty">Ошибка загрузки.</p>';
    });
}

// ---------- Init ----------
function init() {
  var settingsToggle = $("settings-toggle");
  var settingsPanel = $("settings-panel");
  var settingsClose = $("settings-close");
  if (settingsToggle && settingsPanel) settingsToggle.onclick = function () { settingsPanel.classList.add("open"); };
  if (settingsClose && settingsPanel) settingsClose.onclick = function () { settingsPanel.classList.remove("open"); };

  var playlistsToggle = $("playlists-toggle");
  var playlistsPanel = $("playlists-panel");
  var playlistsClose = $("playlists-close");
  if (playlistsToggle && playlistsPanel) playlistsToggle.onclick = function () { playlistsPanel.classList.add("open"); };
  if (playlistsClose && playlistsPanel) playlistsClose.onclick = function () { playlistsPanel.classList.remove("open"); };

  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".tab-content").forEach(function (c) { c.classList.remove("active"); });
      this.classList.add("active");
      var target = $(this.dataset.target);
      if (target) target.classList.add("active");
    };
  });

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

  if ($("random-btn")) $("random-btn").onclick = function () {
    var keys = Object.keys(categoryParams);
    loadMoviesByMood(keys[Math.floor(Math.random() * keys.length)]);
  };
  if ($("masterpiece-btn")) $("masterpiece-btn").onclick = function () {
    loadMoviesByMood("best");
  };

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
    var already = document.querySelectorAll("#results .card").length;
    var next = currentMovies.slice(already, already + RENDER_LIMIT);
    if (!next.length) { showToast("Больше нет"); return; }
    render(next, true);
  };

  if ($("playlist-create-btn")) $("playlist-create-btn").onclick = function () {
    var n = $("playlist-name-input").value;
    if (createPlaylist(n)) { $("playlist-name-input").value = ""; renderPlaylists(); }
  };

  var ratingFilter = $("rating-filter");
  if (ratingFilter) {
    var rv = $("rating-value");
    var upd = function () { if (rv) rv.textContent = ratingFilter.value; };
    ratingFilter.oninput = upd;
    upd();
  }

  document.querySelectorAll(".color-dot").forEach(function (dot) {
    dot.onclick = function () {
      document.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active");
      document.body.setAttribute("data-accent", this.dataset.accent);
      localStorage.setItem("mood_accent", this.dataset.accent);
    };
  });
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".theme-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
      document.body.classList.toggle("light", this.dataset.theme === "light");
      localStorage.setItem("mood_theme", this.dataset.theme);
    };
  });
  if ($("settings-reset")) $("settings-reset").onclick = function () {
    document.body.removeAttribute("data-accent");
    document.body.classList.remove("light");
    localStorage.removeItem("mood_accent");
    localStorage.removeItem("mood_theme");
    document.querySelectorAll(".color-dot, .theme-btn").forEach(function (el) { el.classList.remove("active"); });
  };

  if ($("movie-modal-close")) $("movie-modal-close").onclick = function () { $("movie-modal").classList.remove("open"); };
  if ($("profile-modal-close")) $("profile-modal-close").onclick = function () { $("profile-modal").classList.remove("open"); };

  var savedAccent = localStorage.getItem("mood_accent");
  if (savedAccent) document.body.setAttribute("data-accent", savedAccent);
  var savedTheme = localStorage.getItem("mood_theme");
  if (savedTheme === "light") document.body.classList.add("light");

  if (window.firebaseAuth) initFirebase(); else window.addEventListener("firebase-ready", initFirebase);
  initGoogleLogin(); initProfile(); initAI();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
