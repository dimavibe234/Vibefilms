var BASE = "https://functions.yandexcloud.net/d4e59mril3tsi9p47r09";
var moodGenres = { happy: ["комедия"], sad: ["драма"], action: ["боевик"], cozy: ["семейный", "анимация"], scary: ["ужасы"], romance: ["мелодрама"], nostalgia: ["приключения"], inspire: ["драма", "история"], mystery: ["детектив", "триллер"], scifi: ["фантастика"], music: ["музыка"], think: ["драма", "детектив"], anime: ["аниме"], fantasy: ["фэнтези"], crime: ["криминал"], thriller: ["триллер"], documentary: ["документальное"], sport: ["спорт"], war: ["военный"], western: ["вестерн"], biography: ["биография"], kids: ["детский"], adventure: ["приключения"], comedy_dark: ["комедия", "криминал"], mystic: ["мистика", "триллер"], musical: ["мюзикл"], family: ["семейный"], heist: ["криминал"], survival: ["приключения", "триллер"], space: ["фантастика", "приключения"] };

var currentMood = null, currentType = "movie", currentPage = 1, lastSearchQuery = null, currentMovies = [], currentUser = null;
var currentProfile = { name: "", avatar: "", color: "#e8eaed" };
var firebaseReady = false, fbAuth = null, fbDb = null, fbProvider = null;

function showToast(text, isError) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { toast.className = "toast"; }, 2500);
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
  var el = document.getElementById("user-info"), btn = document.getElementById("google-login-btn");
  if (!el) return;
  if (currentUser) {
    el.style.display = "inline-flex"; if (btn) btn.style.display = "none";
    el.innerHTML = (currentProfile.avatar || currentUser.picture ? '<img src="' + (currentProfile.avatar || currentUser.picture) + '">' : '') +
      '<span style="color:' + (currentProfile.color || "#e8eaed") + '">' + (currentProfile.name || currentUser.name) + '</span>' +
      '<button id="edit-prof-btn">✎</button><button id="logout-btn">Выйти</button>';
    document.getElementById("edit-prof-btn").onclick = openProfile;
    document.getElementById("logout-btn").onclick = function () { window.firebaseSignOut(fbAuth).then(function () { currentUser = null; localStorage.removeItem("mood_user"); renderUserInfo(); }); };
  } else { el.style.display = "none"; if (btn) btn.style.display = "inline-flex"; }
}

function initGoogleLogin() {
  var btn = document.getElementById("google-login-btn");
  if (btn) btn.onclick = function () { 
    if (firebaseReady) {
      window.firebaseSignIn(fbAuth, fbProvider).catch(function(err) {
        if (err.code === 'auth/popup-blocked') { showToast("Разрешите всплывающие окна!", true); } 
        else { showToast("Ошибка: " + err.message, true); }
      });
    } else { showToast("Подождите...", true); }
  };
}

function openProfile() {
  var m = document.getElementById("profile-modal");
  document.getElementById("profile-name-input").value = currentProfile.name || (currentUser ? currentUser.name : "");
  document.getElementById("profile-avatar-input").value = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  document.getElementById("profile-avatar-img").src = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  document.querySelectorAll(".profile-color-dot").forEach(function (d) { d.classList.toggle("active", d.dataset.color === currentProfile.color); });
  var pl = getPlaylists(), count = 0;
  for (var k in pl) count += pl[k].length;
  document.getElementById("profile-stats").innerHTML = "Фильмов в плейлистах: <b>" + count + "</b><br>Просмотрено: <b>" + getWatched().length + "</b>";
  m.classList.add("open");
}

function initProfile() {
  var m = document.getElementById("profile-modal");
  document.getElementById("profile-modal-close").onclick = function () { m.classList.remove("open"); };
  document.getElementById("profile-save-btn").onclick = function () {
    currentProfile.name = document.getElementById("profile-name-input").value;
    currentProfile.avatar = document.getElementById("profile-avatar-input").value;
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
  var el = document.getElementById("playlists-list"); if (!el) return;
  var p = getPlaylists(), names = Object.keys(p);
  if (!names.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">Пусто. Создай первый!</p>'; return; }
  var h = "";
  names.forEach(function (n) {
    var items = p[n] || [], nw = items.filter(function (m) { return !m.watched; }), w = items.filter(function (m) { return m.watched; });
    h += '<div class="playlist"><div class="playlist-title"><span>' + n + ' (' + items.length + ')</span>';
    h += '<button style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.75rem;" onclick="if(confirm(\'Удалить?\')){deletePlaylist(\''+n+'\');}">✕</button></div>';
    if (!items.length) h += '<p style="font-size:0.75rem;color:var(--text-muted);">Пусто</p>';
    else {
      if (nw.length) { h += '<div style="font-size:0.7rem;color:var(--text-muted);margin:5px 0;">Не просмотрено:</div>'; nw.forEach(function (m) { h += buildPlaylistItem(n, m); }); }
      if (w.length) { h += '<div style="font-size:0.7rem;color:var(--text-muted);margin:5px 0;">Просмотрено:</div>'; w.forEach(function (m) { h += buildPlaylistItem(n, m); }); }
    }
    h += '</div>';
  });
  el.innerHTML = h;
}

function buildPlaylistItem(n, m) {
  return '<div class="playlist-item">' + (m.poster ? '<img src="'+m.poster+'">' : '') + '<div style="flex:1;">' + m.title + '</div>' +
    '<button onclick="togglePlaylistWatched(\''+n+'\',\''+m.title.replace(/'/g,"\\'")+'\')" style="color:'+(m.watched?'#10b981':'#8b96a5')+';margin-right:5px;">✓</button>' +
    '<button onclick="removeFromPlaylist(\''+n+'\',\''+m.title.replace(/'/g,"\\'")+'\');renderPlaylists();">✕</button></div>';
}

function deletePlaylist(name) { var p = getPlaylists(); delete p[name]; savePlaylists(p); renderPlaylists(); }
function togglePlaylistWatched(n, t) { var p = getPlaylists(); if (!p[n]) return; p[n].forEach(function (x) { if (x.title === t) x.watched = !x.watched; }); savePlaylists(p); renderPlaylists(); }

function buildStars(r) { var s = ""; for (var i = 1; i <= 5; i++) { s += '<span style="color:' + (r >= i * 2 - 0.5 ? "#ffd76e" : "#3a4552") + '">★</span>'; } return '<span style="font-size:0.8rem;">' + s + '</span> <span style="font-size:0.75rem;color:var(--text-muted);">' + r.toFixed(1) + '</span>'; }
function buildGenres(g) { if (!g || !g.length) return ""; var h = '<div style="margin-top:4px;">'; g.slice(0, 3).forEach(function (x) { h += '<span style="font-size:0.65rem;padding:2px 6px;border-radius:6px;background:rgba(58,123,213,0.2);color:var(--accent);margin-right:4px;">' + x.name + '</span>'; }); return h + '</div>'; }

function render(movies, append) {
  var el = document.getElementById("results"); if (!el) return;
  if (!append) el.innerHTML = "";
  if (!movies || !movies.length) { if (!append) el.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:20px;">Ничего не найдено</p>'; return; }
  currentMovies = append ? currentMovies.concat(movies) : movies;
  var h = "";
  movies.forEach(function (m) {
    var poster = m.poster ? (m.poster.previewUrl || m.poster.url) : "";
    var title = m.name || m.alternativeName || "Без названия";
    var year = m.year || (m.releaseYears && m.releaseYears[0]) || "";
    var rating = m.rating ? (m.rating.kp || m.rating.imdb || 0) : 0;
    var w = isWatched(title);
    h += '<div class="card">';
    if (poster) h += '<img src="' + poster + '" onclick="openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">';
    h += '<div class="info"><div class="title" onclick="openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">' + title + (w ? ' ✓' : '') + '</div>';
    h += '<div class="meta">' + year + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>' + buildGenres(m.genres);
    h += '<button class="card-add" onclick="addMovieToPlaylist({title:\'' + title.replace(/'/g, "\\'") + '\',year:\'' + year + '\',poster:\'' + poster + '\'})">＋ В плейлист</button></div></div>';
  });
  if (append) el.innerHTML += h; else el.innerHTML = h;
}

function fetchWithTimeout(url, ms) { return Promise.race([fetch(url), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms || 20000); })]); }

function loadMovies(mood, type, page, append) {
  var el = document.getElementById("results"); if (!el) return;
  if (!append) el.innerHTML = '<p style="text-align:center;padding:20px;">Загрузка...</p>';
  currentMood = mood; currentType = type; currentPage = page || 1; lastSearchQuery = null;
  var p = []; (moodGenres[mood] || []).forEach(function (g) { p.push("genres.name=" + encodeURIComponent(g)); });
  if (type === "series") p.push("typeNumber=2"); else if (type === "cartoon") p.push("typeNumber=3"); else p.push("typeNumber=1");
  p.push("sortField=votes.kp", "sortType=-1", "votes.kp=10000-10000000", "page=" + currentPage, "limit=24");
  fetchWithTimeout(BASE + "?" + p.join("&")).then(function (r) { return r.json(); }).then(function (d) { render(d.docs || [], append); }).catch(function (e) { el.innerHTML = '<p style="text-align:center;">Ошибка: ' + e.message + '</p>'; });
}

function searchMovies(q, type, page, append) {
  var el = document.getElementById("results"); if (!el) return;
  if (!append) el.innerHTML = '<p style="text-align:center;padding:20px;">Поиск...</p>';
  lastSearchQuery = q; currentPage = page || 1; currentType = type;
  var p = ["query=" + encodeURIComponent(q)]; if (type === "series") p.push("typeNumber=2"); else if (type === "cartoon") p.push("typeNumber=3"); else p.push("typeNumber=1");
  p.push("page=" + currentPage, "limit=24");
  fetchWithTimeout(BASE + "?" + p.join("&")).then(function (r) { return r.json(); }).then(function (d) { render(d.docs || [], append); }).catch(function (e) { el.innerHTML = '<p style="text-align:center;">Ошибка: ' + e.message + '</p>'; });
}

function openMovieModal(title) {
  var m = null; for (var i = 0; i < currentMovies.length; i++) { if ((currentMovies[i].name || currentMovies[i].alternativeName) === title) { m = currentMovies[i]; break; } }
  if (!m) return;
  var poster = m.poster ? (m.poster.previewUrl || m.poster.url) : "";
  var year = m.year || "";
  var rating = m.rating ? (m.rating.kp || m.rating.imdb || 0) : 0;
  var desc = m.description || m.shortDescription || "Описание отсутствует.";
  var w = isWatched(title);
  var h = '<div class="movie-header">' + (poster ? '<img src="' + poster + '">' : '') + '<div><h2>' + title + '</h2><p>' + year + (rating ? ' · ★ ' + rating.toFixed(1) : '') + '</p></div></div>';
  h += '<p style="font-size:0.9rem;line-height:1.5;margin-bottom:20px;">' + desc + '</p>';
  h += '<button class="btn-primary" style="width:100%;margin-bottom:10px;background:' + (w ? '#10b981' : 'var(--accent)') + '" onclick="toggleWatched(\'' + title.replace(/'/g, "\\'") + '\',\'' + year + '\');openMovieModal(\'' + title.replace(/'/g, "\\'") + '\')">' + (w ? '✓ Просмотрено' : '○ Отметить просмотренным') + '</button>';
  h += '<div class="social-links">';
  h += '<a class="social-btn kp" href="https://www.kinopoisk.ru/index.php?kp_query=' + encodeURIComponent(title) + '" target="_blank">🍿 Кинопоиск</a>';
  h += '<a class="social-btn rutube" href="https://rutube.ru/search/?query=' + encodeURIComponent(title) + '" target="_blank">📺 Rutube</a>';
  h += '</div>';
  document.getElementById("movie-modal-body").innerHTML = h;
  document.getElementById("movie-modal").classList.add("open");
}

function initAI() {
  var aiInput = document.getElementById("ai-input");
  var aiButton = document.getElementById("ai-button");
  var aiStatus = document.getElementById("ai-status");
  if (!aiButton) return;

  aiButton.onclick = function () {
    var text = aiInput.value.trim();
    if (!text) return;

    aiButton.disabled = true;
    aiStatus.textContent = "Анализируем запрос...";

    // Просим нейросеть определить ЖАНР из фиксированного списка
    var prompt = 'Пользователь хочет найти фильм. Его запрос: "' + text + '". ' +
      'Твоя задача — определить, к какому ЖАНРУ относится этот запрос. ' +
      'Выбери ОДИН жанр из этого списка: комедия, драма, боевик, семейный, ужасы, мелодрама, приключения, фантастика, музыка, детектив. ' +
      'Ответь ТОЛЬКО ОДНИМ СЛОВОМ (названием жанра), без пояснений.';

    puter.ai.chat(prompt).then(function (response) {
      var answer = "";
      if (typeof response === "string") answer = response;
      else if (response && response.message && response.message.content) answer = response.message.content;
      else if (response && response.text) answer = response.text;

      var genre = answer.trim().toLowerCase();
      
      // Сопоставляем ответ нейросети с нашими категориями
      var mood = "happy"; // По умолчанию комедия
      if (genre.indexOf("комедия") !== -1) mood = "happy";
      else if (genre.indexOf("драма") !== -1) mood = "sad";
      else if (genre.indexOf("боевик") !== -1) mood = "action";
      else if (genre.indexOf("семейный") !== -1) mood = "family";
      else if (genre.indexOf("ужасы") !== -1) mood = "scary";
      else if (genre.indexOf("мелодрама") !== -1) mood = "romance";
      else if (genre.indexOf("приключения") !== -1) mood = "adventure";
      else if (genre.indexOf("фантастика") !== -1) mood = "scifi";
      else if (genre.indexOf("музыка") !== -1) mood = "music";
      else if (genre.indexOf("детектив") !== -1) mood = "mystery";

      aiStatus.textContent = "Жанр: " + genre + ". Загружаем фильмы...";
      
      // Загружаем фильмы по этому жанру (и по типу: фильм/сериал/мультик)
      loadMovies(mood, currentType);

    }).catch(function (err) {
      aiStatus.textContent = "Ошибка ИИ: " + (err.message || err);
    }).finally(function () {
      aiButton.disabled = false;
    });
  };
}

function init() {
  document.getElementById("movie-modal-close").onclick = function () { document.getElementById("movie-modal").classList.remove("open"); };
  document.getElementById("settings-toggle").onclick = function () { document.getElementById("settings-panel").classList.add("open"); };
  document.getElementById("settings-close").onclick = function () { document.getElementById("settings-panel").classList.remove("open"); };
  document.getElementById("playlists-toggle").onclick = function () { renderPlaylists(); document.getElementById("playlists-panel").classList.add("open"); };
  document.getElementById("playlists-close").onclick = function () { document.getElementById("playlists-panel").classList.remove("open"); };
  
  document.querySelectorAll(".tab-btn").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".tab-btn").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll(".tab-content").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active"); document.getElementById(this.dataset.target).classList.add("active");
    };
  });

  document.querySelectorAll("#moods button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#moods button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active"); document.getElementById("type-switch").style.display = "flex"; loadMovies(this.dataset.mood, currentType);
    };
  });

  document.querySelectorAll("#type-switch button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("#type-switch button").forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active"); currentType = this.dataset.type; if (currentMood) loadMovies(currentMood, currentType);
    };
  });

  document.getElementById("search-btn").onclick = function () { var q = document.getElementById("search-input").value.trim(); if (q) searchMovies(q, currentType); };
  document.getElementById("search-input").onkeydown = function (e) { if (e.key === "Enter") document.getElementById("search-btn").click(); };
  document.getElementById("random-btn").onclick = function () { var keys = Object.keys(moodGenres); loadMovies(keys[Math.floor(Math.random() * keys.length)], currentType); };
  document.getElementById("masterpiece-btn").onclick = function () { searchMovies("шедевр", "movie"); };
  document.getElementById("load-more").onclick = function () { if (currentMood) loadMovies(currentMood, currentType, currentPage + 1, true); else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType, currentPage + 1, true); };

  document.querySelectorAll(".color-dot").forEach(function (d) { d.onclick = function () { localStorage.setItem("mood_accent", this.dataset.accent); document.body.setAttribute("data-accent", this.dataset.accent); saveUserData(); }; });
  document.querySelectorAll(".theme-btn").forEach(function (b) { b.onclick = function () { document.body.classList.toggle("light", this.dataset.theme === "light"); localStorage.setItem("mood_theme", this.dataset.theme); saveUserData(); }; });
  document.getElementById("playlist-create-btn").onclick = function () { var n = document.getElementById("playlist-name-input").value; if (createPlaylist(n)) { document.getElementById("playlist-name-input").value = ""; renderPlaylists(); } };

  if (window.firebaseAuth) initFirebase(); else window.addEventListener("firebase-ready", initFirebase);
  initGoogleLogin(); initProfile(); initAI();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

// ==========================================
// ОБНОВЛЕНИЕ v2.1: Переработана логика ИИ
// Теперь нейросеть работает как переводчик жанров
// Дата изменения: 2026 год
// ==========================================