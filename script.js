var BASE = "https://functions.yandexcloud.net/d4e59mril3tsi9p47r09";

var moodGenres = {
  happy: ["Comedy"], sad: ["Drama"], action: ["Action"],
  cozy: ["Family", "Animation"], scary: ["Horror"], romance: ["Romance"],
  nostalgia: ["Adventure"], inspire: ["Drama", "History"],
  mystery: ["Mystery", "Thriller"], scifi: ["Sci-Fi"], music: ["Music"],
  think: ["Drama", "Mystery"], anime: ["Animation"], fantasy: ["Fantasy"],
  crime: ["Crime"], thriller: ["Thriller"], documentary: ["Documentary"],
  sport: ["Sport"], war: ["War"], western: ["Western"], biography: ["Biography"],
  kids: ["Family", "Animation"], adventure: ["Adventure"],
  comedy_dark: ["Comedy", "Crime"], mystic: ["Mystery", "Horror"],
  musical: ["Music"], family: ["Family"], heist: ["Crime", "Action"],
  survival: ["Adventure", "Thriller"], space: ["Sci-Fi", "Adventure"],
  detective: ["Mystery", "Crime"], psychological: ["Drama", "Thriller"],
  historical: ["History", "Drama"], superhero: ["Action", "Adventure"],
  road: ["Adventure", "Comedy"], coming_of_age: ["Drama", "Family"],
  satire: ["Comedy", "Drama"], epic: ["Adventure", "History"],
  noir: ["Crime", "Mystery"], dystopia: ["Sci-Fi", "Thriller"],
  time_travel: ["Sci-Fi", "Adventure"], mockumentary: ["Comedy", "Documentary"],
  disaster: ["Action", "Thriller"], spy: ["Action", "Thriller"],
  martial_arts: ["Action"], standup: ["Comedy"], concert: ["Music"],
  nature: ["Documentary"], cooking: ["Documentary"], travel: ["Documentary", "Adventure"]
};

var genreTranslations = {
  "Action": "боевик", "Adventure": "приключения", "Animation": "анимация",
  "Biography": "биография", "Comedy": "комедия", "Crime": "криминал",
  "Documentary": "документальный", "Drama": "драма", "Family": "семейный",
  "Fantasy": "фэнтези", "History": "история", "Horror": "ужасы",
  "Music": "музыка", "Mystery": "детектив", "Romance": "мелодрама",
  "Sci-Fi": "фантастика", "Sport": "спорт", "Thriller": "триллер",
  "War": "военный", "Western": "вестерн"
};

var allMovies = [];
var currentMood = null, currentType = "movie", lastSearchQuery = null, currentMovies = [], currentUser = null;
var currentProfile = { name: "", avatar: "", color: "#e8eaed" };
var firebaseReady = false, fbAuth = null, fbDb = null, fbProvider = null;

var posterCache = JSON.parse(localStorage.getItem("poster_cache") || "{}");
function savePosterCache() { try { localStorage.setItem("poster_cache", JSON.stringify(posterCache)); } catch (e) {} }

function $(id) { return document.getElementById(id); }

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

function loadMovieLens() {
  return fetch('movies.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { allMovies = data; console.log('MovieLens загружен:', allMovies.length); })
    .catch(function(e) { console.error('Ошибка загрузки movies.json:', e); });
}

function extractYear(title) {
  var m = (title || '').match(/\((\d{4})\)\s*$/);
  return m ? m[1] : '';
}
function cleanTitle(title) {
  return (title || '').replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

function normalizeTitle(t) {
  return (t || "").toLowerCase().replace(/[^a-zа-я0-9]/gi, "").trim();
}
function fetchPoster(title, year) {
  var key = title + "_" + year;
  if (posterCache[key]) return Promise.resolve(posterCache[key]);
  var url = BASE + "?query=" + encodeURIComponent(title) + "&year=" + (year || "");
  return fetchWithTimeout(url, 10000)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.docs || !data.docs.length) return null;
      var normTitle = normalizeTitle(title), best = null;
      for (var i = 0; i < data.docs.length; i++) {
        var d = data.docs[i];
        var names = [d.name, d.alternativeName].concat((d.names || []).map(function(n) { return n.name; }));
        var match = names.some(function(n) { return normalizeTitle(n) === normTitle; });
        var yearMatch = !year || String(d.year) === String(year);
        if (match && yearMatch) { best = d; break; }
        if (match && !best) best = d;
      }
      if (!best) best = data.docs[0];
      var posterUrl = best.poster ? (best.poster.previewUrl || best.poster.url) : null;
      if (posterUrl) { posterCache[key] = posterUrl; savePosterCache(); }
      return posterUrl;
    })
    .catch(function() { return null; });
}
function handlePosterError(img) {
  var title = img.getAttribute("data-title");
  var year = img.getAttribute("data-year");
  if (!title || img.dataset.retried) return;
  img.dataset.retried = "true";
  fetchPoster(title, year).then(function(url) {
    if (url) img.src = url; else img.style.display = "none";
  });
}

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
    h += '<div class="playlist"><div class="playlist-title"><span>' + n + ' (' + items.length + ')</span>';
    h += '<button class="playlist-del" onclick="if(confirm(\'Удалить?\')){deletePlaylist(\''+n+'\');}">✕</button></div>';
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
  return '<div class="playlist-item">' + (m.poster ? '<img src="'+m.poster+'">' : '') + '<div class="pl-title">' + m.title + '</div>' +
    '<button class="pl-check" onclick="togglePlaylistWatched(\''+n+'\',\''+m.title.replace(/'/g,"\\'")+'\')" style="color:'+(m.watched?'#34d399':'#8f9bab')+'">✓</button>' +
    '<button class="pl-del" onclick="removeFromPlaylist(\''+n+'\',\''+m.title.replace(/'/g,"\\'")+'\');renderPlaylists();">✕</button></div>';
}
function deletePlaylist(name) { var p = getPlaylists(); delete p[name]; savePlaylists(p); renderPlaylists(); }
function togglePlaylistWatched(n, t) { var p = getPlaylists(); if (!p[n]) return; p[n].forEach(function (x) { if (x.title === t) x.watched = !x.watched; }); savePlaylists(p); renderPlaylists(); }
function buildStars(r) {
  var s = "";
  for (var i = 1; i <= 5; i++) s += '<span style="color:' + (r >= i * 2 - 0.5 ? "#fbbf24" : "#3a4552") + '">★</span>';
  return '<span class="stars">' + s + '</span> <span class="rating-num">' + r.toFixed(1) + '</span>';
}
function buildGenres(g) {
  if (!g || !g.length) return "";
  var h = '<div class="genre-tags">';
  g.slice(0, 3).forEach(function (x) { h += '<span class="genre-tag">' + (genreTranslations[x] || x) + '</span>'; });
  return h + '</div>';
}

var RENDER_LIMIT = 20;

function render(movies, append) {
  var el = $("results"); if (!el) return;
  if (!append) el.innerHTML = "";
  if (!movies || !movies.length) {
    if (!append) el.innerHTML = '<p class="empty">Ничего не найдено. Попробуй другое настроение или ослабь фильтры.</p>';
    return;
  }

  var toRender;
  if (append) {
    // при "Показать ещё" берём следующие 20 из уже отфильтрованного списка
    var already = document.querySelectorAll("#results .card").length;
    toRender = currentMovies.slice(already, already + RENDER_LIMIT);
  } else {
    toRender = movies.slice(0, RENDER_LIMIT);
    currentMovies = movies;
  }

  var h = "";
  toRender.forEach(function (m) {
    var rawTitle = m.title || "Без названия";
    var title = cleanTitle(rawTitle);
    var year = extractYear(rawTitle);
    var rating = m.imdbRating ? parseFloat(m.imdbRating) : 0;
    var w = isWatched(title);
    var cachedPoster = posterCache[title + "_" + year] || "";
    h += '<div class="card">';
    if (cachedPoster) {
      h += '<img src="' + cachedPoster + '" onclick="openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">';
    } else {
      h += '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'450\'%3E%3Crect fill=\'%232a3340\' width=\'300\' height=\'450\'/%3E%3Ctext x=\'150\' y=\'225\' fill=\'%238f9bab\' text-anchor=\'middle\' font-size=\'14\'%3EЗагрузка...%3C/text%3E%3C/svg%3E" data-title="' + title.replace(/"/g, '&quot;') + '" data-year="' + year + '" onerror="handlePosterError(this)" onclick="openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">';
    }
    h += '<div class="info"><div class="title" onclick="openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">' + title + (w ? ' ✓' : '') + '</div>';
    h += '<div class="meta">' + year + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>' + buildGenres(m.genres);
    h += '<button class="card-add" onclick="addMovieToPlaylist({title:\'' + title.replace(/'/g, "\\'") + '\',year:\'' + year + '\',poster:\'' + (cachedPoster || '') + '\'})">＋ В плейлист</button></div></div>';
  });

  if (append) el.innerHTML += h; else el.innerHTML = h;
  var lm = $("load-more");
  if (lm) lm.style.display = (currentMood || lastSearchQuery) ? "block" : "none";
}

function applyClientFilters(movies) {
  var rEl = $("rating-filter"), yEl = $("year-filter"), uEl = $("filter-unwatched"), nEl = $("filter-new");
  var minRating = rEl ? parseFloat(rEl.value) || 0 : 0;
  var minYear = yEl ? parseInt(yEl.value, 10) || 1900 : 1900;
  var onlyUnwatched = uEl ? uEl.checked : false;
  var onlyNew = nEl ? nEl.checked : false;
  var currentYear = new Date().getFullYear();
  return movies.filter(function (m) {
    var rawTitle = m.title || "";
    var title = cleanTitle(rawTitle);
    if (isHidden(title)) return false;
    var rating = m.imdbRating ? parseFloat(m.imdbRating) : 0;
    if (rating < minRating) return false;
    var ym = (rawTitle || "").match(/\((\d{4})\)\s*$/);
    var year = ym ? parseInt(ym[1], 10) : 0;
    if (year && year < minYear) return false;
    if (onlyNew && year && year < currentYear - 1) return false;
    if (onlyUnwatched && isWatched(title)) return false;
    return true;
  });
}
function filterByMood(movies, mood) {
  var wanted = moodGenres[mood] || [];
  if (!wanted.length) return movies;
  return movies.filter(function (m) {
    var genres = Array.isArray(m.genres) ? m.genres : [];
    return genres.some(function (g) { return wanted.indexOf(g) !== -1; });
  });
}

function loadMovies(mood, type, append) {
  var el = $("results"); if (!el) return;
  if (!append) {
    el.innerHTML = '<p class="empty">Загрузка...</p>';
    currentMood = mood; currentType = type; lastSearchQuery = null;
    updateActiveMoodBar(mood);
  }
  if (!allMovies.length) {
    el.innerHTML = '<p class="empty">Данные ещё загружаются, подожди...</p>';
    return;
  }
  var res = filterByMood(allMovies, mood);
  res = applyClientFilters(res);
  if (!append) currentMovies = res;
  render(res, append);
}

function updateActiveMoodBar(mood) {
  var bar = $("active-mood-bar"), label = $("active-mood-label");
  if (!bar || !label) return;
  if (!mood) { bar.style.display = "none"; return; }
  var btn = document.querySelector('#moods-list button[data-mood="' + mood + '"]');
  label.textContent = btn ? "Настроение: " + btn.textContent.trim() : "Настроение: " + mood;
  bar.style.display = "flex";
}

function searchMovies(q, type, append) {
  var el = $("results"); if (!el) return;
  if (!append) {
    el.innerHTML = '<p class="empty">Поиск...</p>';
    lastSearchQuery = q; currentType = type; currentMood = null;
    updateActiveMoodBar(null);
  }
  if (!allMovies.length) {
    el.innerHTML = '<p class="empty">Данные ещё загружаются, подожди...</p>';
    return;
  }
  var query = q.toLowerCase();
  var res = allMovies.filter(function(m) {
    return (m.title || '').toLowerCase().indexOf(query) !== -1;
  });
  res = applyClientFilters(res);
  if (!append) currentMovies = res;
  render(res, append);
}

function openMovieModal(title) {
  var m = null;
  for (var i = 0; i < currentMovies.length; i++) {
    if (cleanTitle(currentMovies[i].title) === title) { m = currentMovies[i]; break; }
  }
  if (!m) return;
  var rawTitle = m.title || "";
  var year = extractYear(rawTitle);
  var rating = m.imdbRating ? parseFloat(m.imdbRating) : 0;
  var desc = m.plot_summary || "Описание отсутствует.";
  var w = isWatched(title);
  var cachedPoster = posterCache[title + "_" + year] || "";
  var h = '<div class="movie-header">';
  if (cachedPoster) {
    h += '<img src="' + cachedPoster + '">';
  } else {
    h += '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'225\'%3E%3Crect fill=\'%232a3340\' width=\'150\' height=\'225\'/%3E%3C/svg%3E" data-title="' + title.replace(/"/g, '&quot;') + '" data-year="' + year + '" onerror="handlePosterError(this)">';
  }
  h += '<div><h2>' + title + '</h2><p>' + year + (rating ? ' · ★ ' + rating.toFixed(1) : '') + '</p></div></div>';
  h += '<p style="font-size:0.9rem;line-height:1.5;margin-bottom:20px;">' + desc + '</p>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:' + (w ? '#34d399' : 'var(--accent)') + '" onclick="toggleWatched(\'' + title.replace(/'/g, "\\'") + '\',\'' + year + '\');openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">' + (w ? '✓ Просмотрено' : '○ Отметить просмотренным') + '</button>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:#f87171;" onclick="hideMovie(\'' + title.replace(/'/g, "\\'") + '\');document.getElementById(\'movie-modal\').classList.remove(\'open\');showToast(\'Скрыто\')">🚫 Скрыть из выдачи</button>';
  h += '<div class="social-links">';
  h += '<a class="social-btn kp" href="https://www.kinopoisk.ru/index.php?kp_query=' + encodeURIComponent(title) + '" target="_blank">🍿 Кинопоиск</a>';
  h += '<a class="social-btn rutube" href="https://rutube.ru/search/?query=' + encodeURIComponent(title) + '" target="_blank">📺 Rutube</a>';
  h += '</div>';
  $("movie-modal-body").innerHTML = h;
  $("movie-modal").classList.add("open");
}

function initAI() {
  var aiInput = $("ai-input"), aiButton = $("ai-button"), aiStatus = $("ai-status");
  if (!aiButton) return;
  aiButton.onclick = function () {
    var text = aiInput.value.trim();
    if (!text) return;
    aiButton.disabled = true;
    aiStatus.textContent = "Ищем: " + text;
    $("ai-modal").classList.remove("open");
    searchMovies(text, currentType);
    aiButton.disabled = false;
  };
}

function initMoodSearch() {
  var input = $("mood-search");
  var clearBtn = $("mood-search-clear");
  var noResults = $("mood-no-results");
  if (!input) return;
  function applyFilter() {
    var q = input.value.toLowerCase().trim();
    var totalVisible = 0;
    document.querySelectorAll("#moods-list .mood-group").forEach(function (grp) {
      var groupName = (grp.dataset.group || "").toLowerCase();
      var groupVisible = 0;
      grp.querySelectorAll("button").forEach(function (btn) {
        var text = btn.textContent.toLowerCase();
        var moodKey = (btn.dataset.mood || "").toLowerCase();
        var match = !q || text.indexOf(q) !== -1 || moodKey.indexOf(q) !== -1 || groupName.indexOf(q) !== -1;
        btn.style.display = match ? "" : "none";
        if (match) groupVisible++;
      });
      grp.style.display = groupVisible ? "" : "none";
      totalVisible += groupVisible;
    });
    if (noResults) noResults.style.display = (q && totalVisible === 0) ? "block" : "none";
    if (clearBtn) clearBtn.classList.toggle("visible", !!q);
  }
  input.addEventListener("input", applyFilter);
  input.addEventListener("keydown", function (e) { if (e.key === "Escape") { input.value = ""; applyFilter(); } });
  if (clearBtn) clearBtn.onclick = function () { input.value = ""; applyFilter(); input.focus(); };
}

function init() {
  loadMovieLens();
  var openers = [
    ["moods-toggle", "moods-panel", "moods-close"],
    ["filters-toggle", "filters-panel", "filters-close"],
    ["playlists-toggle", "playlists-panel", "playlists-close"]
  ];
  openers.forEach(function (o) {
    var open = $(o[0]), panel = $(o[1]), close = $(o[2]);
    if (open && panel) open.onclick = function () { panel.classList.add("open"); };
    if (close && panel) close.onclick = function () { panel.classList.remove("open"); };
  });
  initMoodSearch();
  document.querySelectorAll("#moods-list button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#moods-list button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
      loadMovies(this.dataset.mood, currentType);
      $("moods-panel").classList.remove("open");
    };
  });
  document.querySelectorAll("#type-switch button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#type-switch button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active"); currentType = this.dataset.type;
      if (currentMood) loadMovies(currentMood, currentType);
      else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType);
    };
  });
  if ($("search-btn")) $("search-btn").onclick = function () {
    var q = $("search-input").value.trim(); if (q) searchMovies(q, currentType);
  };
  if ($("search-input")) $("search-input").onkeydown = function (e) {
    if (e.key === "Enter") $("search-btn").click();
  };
  if ($("random-btn")) $("random-btn").onclick = function () {
    var keys = Object.keys(moodGenres); loadMovies(keys[Math.floor(Math.random() * keys.length)], currentType);
  };
  if ($("masterpiece-btn")) $("masterpiece-btn").onclick = function () { searchMovies("шедевр", "movie"); };
  if ($("ai-open-btn")) $("ai-open-btn").onclick = function () { $("ai-modal").classList.add("open"); };
  if ($("ai-close")) $("ai-close").onclick = function () { $("ai-modal").classList.remove("open"); };

  // Показать ещё — берём следующие 20 из currentMovies
  if ($("load-more")) $("load-more").onclick = function () {
    if (!currentMood && !lastSearchQuery) return;
    var already = document.querySelectorAll("#results .card").length;
    var next = currentMovies.slice(already, already + RENDER_LIMIT);
    if (!next.length) { showToast("Больше нет"); return; }
    render(next, true);
  };

  if ($("clear-mood-btn")) $("clear-mood-btn").onclick = function () {
    currentMood = null; updateActiveMoodBar(null);
    document.querySelectorAll("#moods-list button").forEach(function (x) { x.classList.remove("active"); });
    $("results").innerHTML = "";
    $("load-more").style.display = "none";
  };
  ["rating-filter", "year-filter", "filter-unwatched", "filter-new"].forEach(function (id) {
    var el = $(id); if (!el) return;
    el.addEventListener("change", function () {
      if (currentMood) loadMovies(currentMood, currentType);
      else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType);
    });
  });
  if ($("rating-filter")) $("rating-filter").addEventListener("input", function () { $("rating-value").textContent = this.value; });
  if ($("filters-reset")) $("filters-reset").onclick = function () {
    $("rating-filter").value = 0; $("rating-value").textContent = "0";
    $("year-filter").value = 1900;
    $("filter-unwatched").checked = false;
    $("filter-new").checked = false;
    if (currentMood) loadMovies(currentMood, currentType);
    else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType);
  };
  if ($("playlist-create-btn")) $("playlist-create-btn").onclick = function () {
    var n = $("playlist-name-input").value;
    if (createPlaylist(n)) { $("playlist-name-input").value = ""; renderPlaylists(); }
  };
  if ($("theme-toggle")) $("theme-toggle").onclick = function () {
    document.body.classList.toggle("light");
    localStorage.setItem("mood_theme", document.body.classList.contains("light") ? "light" : "dark");
    saveUserData();
  };
  if (window.firebaseAuth) initFirebase(); else window.addEventListener("firebase-ready", initFirebase);
  initGoogleLogin(); initProfile(); initAI();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();