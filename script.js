var BASE = "https://functions.yandexcloud.net/d4e59mril3tsi9p47r09";

var moodGenres = {
  happy:       ["комедия"],
  sad:         ["драма"],
  action:      ["боевик"],
  cozy:        ["семейный", "анимация"],
  scary:       ["ужасы"],
  romance:     ["мелодрама"],
  nostalgia:   ["приключения"],
  inspire:     ["драма", "история"],
  mystery:     ["детектив", "триллер"],
  scifi:       ["фантастика"],
  music:       ["музыка"],
  think:       ["драма", "детектив"],
  anime:       ["аниме"],
  fantasy:     ["фэнтези"],
  crime:       ["криминал"],
  thriller:    ["триллер"],
  documentary: ["документальное"],
  sport:       ["спорт"],
  war:         ["военный"],
  western:     ["вестерн"],
  biography:   ["биография"],
  kids:        ["детский"],
  adventure:   ["приключения"],
  comedy_dark: ["комедия", "криминал"],
  mystic:      ["мистика", "триллер"],
  musical:     ["мюзикл"],
  family:      ["семейный"],
  heist:       ["криминал"],
  survival:    ["приключения", "триллер"],
  space:       ["фантастика", "приключения"]
};

var currentMood = null;
var currentType = "movie";
var currentPage = 1;
var lastSearchQuery = null;

/* ===== Toast ===== */
function showToast(text, isError) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { toast.className = "toast"; }, 2500);
}

/* ===== Скрытые фильмы ===== */
function getHidden() {
  try { return JSON.parse(localStorage.getItem("mood_hidden") || "[]"); } catch (e) { return []; }
}
function saveHidden(list) { localStorage.setItem("mood_hidden", JSON.stringify(list)); }
function hideMovie(title) {
  var list = getHidden();
  if (list.indexOf(title) === -1) { list.push(title); saveHidden(list); }
}
function isHidden(title) { return getHidden().indexOf(title) !== -1; }

/* ===== Плейлисты ===== */
function getPlaylists() {
  try {
    var raw = localStorage.getItem("mood_movies_playlists");
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function savePlaylists(p) { localStorage.setItem("mood_movies_playlists", JSON.stringify(p)); }

function createPlaylist(name) {
  var p = getPlaylists();
  var key = name.trim();
  if (!key) return false;
  if (!p[key]) { p[key] = []; savePlaylists(p); return true; }
  return false;
}

function addToPlaylist(name, movie) {
  var p = getPlaylists();
  if (!p[name]) p[name] = [];
  var exists = p[name].some(function (x) { return x.title === movie.title && x.year === movie.year; });
  if (!exists) { p[name].push(movie); savePlaylists(p); return true; }
  return false;
}

function removeFromPlaylist(name, title, year) {
  var p = getPlaylists();
  if (!p[name]) return;
  p[name] = p[name].filter(function (x) { return !(x.title === title && x.year === year); });
  savePlaylists(p);
}

function deletePlaylist(name) {
  var p = getPlaylists();
  delete p[name];
  savePlaylists(p);
}

function renderPlaylists() {
  var listEl = document.getElementById("playlists-list");
  if (!listEl) return;
  var playlists = getPlaylists();
  var names = Object.keys(playlists);

  if (names.length === 0) {
    listEl.innerHTML = '<p class="playlist-empty">Пока нет плейлистов. Создай первый!</p>';
    return;
  }

  var html = "";
  names.forEach(function (name) {
    html += '<div class="playlist">';
    html += '<div class="playlist-title"><span>' + name + '</span>';
    html += '<button class="playlist-delete" data-name="' + name + '">Удалить</button></div>';
    html += '<div class="playlist-items">';

    if (playlists[name].length === 0) {
      html += '<p class="playlist-empty">Пусто</p>';
    } else {
      playlists[name].forEach(function (m) {
        html += '<div class="playlist-item">';
        if (m.poster) html += '<img src="' + m.poster + '" alt="">';
        html += '<div class="info">';
        html += '<div class="title">' + m.title + '</div>';
        html += '<div class="meta">' + (m.year || "") + (m.rating ? ' · ★ ' + m.rating : "") + '</div>';
        html += '</div>';
        html += '<button class="remove" data-name="' + name + '" data-title="' + m.title + '" data-year="' + (m.year || "") + '">✕</button>';
        html += '</div>';
      });
    }
    html += '</div></div>';
  });
  listEl.innerHTML = html;

  listEl.querySelectorAll(".playlist-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = this.getAttribute("data-name");
      if (confirm('Удалить плейлист "' + name + '"?')) { deletePlaylist(name); renderPlaylists(); }
    });
  });

  listEl.querySelectorAll(".remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      removeFromPlaylist(this.getAttribute("data-name"), this.getAttribute("data-title"), this.getAttribute("data-year"));
      renderPlaylists();
    });
  });
}

function addMovieToPlaylist(movie) {
  var playlists = getPlaylists();
  var names = Object.keys(playlists);

  if (names.length === 0) {
    var newName = prompt("Нет плейлистов. Введите название нового плейлиста:", "Мой плейлист");
    if (!newName || !newName.trim()) return;
    createPlaylist(newName);
    addToPlaylist(newName.trim(), movie);
    showToast("Добавлено в «" + newName.trim() + "»");
    return;
  }

  var listText = names.map(function (n, i) { return (i + 1) + ". " + n; }).join("\n");
  var choice = prompt("В какой плейлист добавить?\n\n" + listText + "\n\nВведите номер или название нового:", "1");
  if (!choice) return;

  var idx = parseInt(choice, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= names.length) {
    addToPlaylist(names[idx - 1], movie);
    showToast("Добавлено в «" + names[idx - 1] + "»");
  } else {
    var newName2 = choice.trim();
    if (!newName2) return;
    createPlaylist(newName2);
    addToPlaylist(newName2, movie);
    showToast("Добавлено в «" + newName2 + "»");
  }
}

/* ===== Вспомогательные ===== */
function buildStars(rating) {
  var stars = "";
  for (var i = 1; i <= 5; i++) {
    var filled = (rating >= i * 2 - 0.5) ? " filled" : "";
    stars += '<span class="star' + filled + '">★</span>';
  }
  return '<span class="stars">' + stars + '</span><span class="rating-num">' + rating.toFixed(1) + '</span>';
}

function buildGenres(genres) {
  if (!genres || genres.length === 0) return "";
  var html = '<div class="genres">';
  genres.slice(0, 4).forEach(function (g) { html += '<span class="genre-tag">' + g.name + '</span>'; });
  html += '</div>';
  return html;
}

function renderSkeleton() {
  var results = document.getElementById("results");
  if (!results) return;
  var html = "";
  for (var i = 0; i < 8; i++) {
    html += '<div class="card"><div style="width:100%;aspect-ratio:2/3;background:linear-gradient(90deg,#1a2129 25%,#2c3640 50%,#1a2129 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div><div class="info"><div class="title">Загрузка...</div></div></div>';
  }
  results.innerHTML = html;
}

function render(movies, append, containerId) {
  var results = document.getElementById(containerId || "results");
  if (!results) return;
  if (!append) results.innerHTML = "";

  var filtered = (movies || []).filter(function (m) {
    var t = m.name || m.alternativeName || "";
    return !isHidden(t);
  });

  if (!filtered || filtered.length === 0) {
    if (!append) results.innerHTML = '<p class="placeholder">Ничего не найдено</p>';
    return;
  }

  var html = "";
  filtered.forEach(function (m) {
    var poster = "";
    if (m.poster) poster = m.poster.previewUrl || m.poster.url || "";
    var title = m.name || m.alternativeName || "Без названия";
    var year = m.year || (m.releaseYears && m.releaseYears[0]) || "";
    var rating = 0;
    if (m.rating) {
      if (m.rating.kp) rating = m.rating.kp;
      else if (m.rating.imdb) rating = m.rating.imdb;
    }
    var description = m.shortDescription || m.description || "";
    if (description.length > 120) description = description.substring(0, 120) + "…";
    var kpLink = "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(title);
    var rutubeLink = "https://rutube.ru/search/?query=" + encodeURIComponent(title);

    html += '<div class="card">';
    html += '<button class="card-hide" data-title="' + title + '" title="Скрыть">✕</button>';
    if (poster) html += '<img src="' + poster + '" alt="' + title + '" loading="lazy" data-title="' + title + '" data-year="' + year + '">';
    html += '<div class="info">';
    html += '<div class="title" data-title="' + title + '" data-year="' + year + '">' + title + '</div>';
    html += '<div class="meta">' + year + (rating > 0 ? ' · ' + buildStars(rating) : "") + '</div>';
    html += buildGenres(m.genres);
    if (description) html += '<div class="desc">' + description + '</div>';
    html += '<div class="card-actions">';
    html += '<button class="card-add" data-title="' + title + '" data-year="' + year + '" data-rating="' + (rating > 0 ? rating.toFixed(1) : "") + '" data-poster="' + poster + '">＋ В плейлист</button>';
    html += '<a class="card-link" href="' + rutubeLink + '" target="_blank" rel="noopener">Rutube</a>';
    html += '<a class="card-link" href="' + kpLink + '" target="_blank" rel="noopener">КП</a>';
    html += '</div></div></div>';
  });

  if (append) results.innerHTML += html;
  else results.innerHTML = html;

  results.querySelectorAll(".card-add").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var card = this.closest(".card");
      addMovieToPlaylist({
        title: this.getAttribute("data-title"),
        year: this.getAttribute("data-year"),
        rating: this.getAttribute("data-rating"),
        poster: this.getAttribute("data-poster")
      });
      this.classList.add("added");
      this.textContent = "✓ Добавлено";
      if (card) { card.classList.add("card-added"); setTimeout(function () { card.classList.remove("card-added"); }, 800); }
    });
  });

  results.querySelectorAll(".card-hide").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var title = this.getAttribute("data-title");
      hideMovie(title);
      var card = this.closest(".card");
      if (card) {
        card.style.transition = "opacity 0.3s, transform 0.3s";
        card.style.opacity = "0";
        card.style.transform = "scale(0.9)";
        setTimeout(function () { card.remove(); }, 300);
      }
      showToast("Скрыто: " + title);
    });
  });

  results.querySelectorAll("img[data-title], .title[data-title]").forEach(function (el) {
    el.addEventListener("click", function () {
      var title = this.getAttribute("data-title");
      openSimilar(title);
    });
  });
}

function updateLoadMore(show) {
  var more = document.getElementById("load-more");
  if (more) more.style.display = show ? "block" : "none";
}

/* ===== Fetch с тайм-аутом ===== */
function fetchWithTimeout(url, ms) {
  ms = ms || 10000;
  var fetchPromise = fetch(url);
  var timeoutPromise = new Promise(function (resolve, reject) {
    setTimeout(function () { reject(new Error("timeout")); }, ms);
  });
  return Promise.race([fetchPromise, timeoutPromise]);
}

function handleFetchError(err, results) {
  if (err.message === "timeout") {
    results.innerHTML = '<p class="placeholder">Сервер не отвечает. Попробуйте позже.</p>';
  } else if (String(err.message).indexOf("403") !== -1) {
    results.innerHTML = '<p class="placeholder">Лимит запросов на сегодня исчерпан. Попробуйте завтра 🌙</p>';
  } else {
    results.innerHTML = '<p class="placeholder">Ошибка загрузки: ' + err.message + '</p>';
  }
  updateLoadMore(false);
}

/* ===== Загрузка ===== */
function loadMovies(mood, type, page, append) {
  var results = document.getElementById("results");
  if (!results) return;
  if (!append) renderSkeleton();

  currentMood = mood;
  currentType = type;
  currentPage = page || 1;
  lastSearchQuery = null;

  var genres = moodGenres[mood] || [];
  var params = [];
  genres.forEach(function (g) { params.push("genres.name=" + encodeURIComponent(g)); });

  if (type === "series") params.push("typeNumber=2");
  else if (type === "cartoon") params.push("typeNumber=3");
  else params.push("typeNumber=1");

  params.push("sortField=rating.kp");
  params.push("sortType=-1");
  params.push("page=" + currentPage);
  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=genres");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "?" + params.join("&");

  fetchWithTimeout(url, 15000)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      render(data.docs || [], append);
      updateLoadMore(data.docs && data.docs.length === 24);
    })
    .catch(function (err) { handleFetchError(err, results); });
}

function searchMovies(query, type, page, append) {
  var results = document.getElementById("results");
  if (!results) return;
  if (!append) renderSkeleton();

  currentType = type;
  currentPage = page || 1;
  lastSearchQuery = query;

  var params = ["query=" + encodeURIComponent(query)];
  if (type === "series") params.push("typeNumber=2");
  else if (type === "cartoon") params.push("typeNumber=3");
  else params.push("typeNumber=1");
  params.push("page=" + currentPage);
  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=genres");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "?" + params.join("&");

  fetchWithTimeout(url, 15000)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      render(data.docs || [], append);
      updateLoadMore(data.docs && data.docs.length === 24);
    })
    .catch(function (err) { handleFetchError(err, results); });
}

function loadRandomMovies(type) {
  var results = document.getElementById("results");
  if (!results) return;
  renderSkeleton();

  currentMood = null;
  lastSearchQuery = null;
  currentType = type;

  var randomPage = Math.floor(Math.random() * 5) + 1;
  var params = [];
  if (type === "series") params.push("typeNumber=2");
  else if (type === "cartoon") params.push("typeNumber=3");
  else params.push("typeNumber=1");

  params.push("sortField=votes.kp");
  params.push("sortType=-1");
  params.push("page=" + randomPage);
  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=genres");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "?" + params.join("&") + "&_=" + Date.now();

  fetchWithTimeout(url, 15000)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var docs = data.docs || [];
      for (var i = docs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = docs[i]; docs[i] = docs[j]; docs[j] = tmp;
      }
      render(docs, false);
      updateLoadMore(false);
      var ts = document.getElementById("type-switch");
      if (ts) ts.style.display = "flex";
      var all = document.querySelectorAll("#moods button");
      for (var k = 0; k < all.length; k++) all[k].classList.remove("active");
    })
    .catch(function (err) { handleFetchError(err, results); });
}

function loadMasterpiece() {
  var results = document.getElementById("results");
  if (!results) return;
  renderSkeleton();
  currentMood = null;
  lastSearchQuery = null;

  var randomPage = Math.floor(Math.random() * 3) + 1;
  var params = [];
  params.push("typeNumber=1");
  params.push("rating.kp=8-10");
  params.push("votes.kp=50000-10000000");
  params.push("sortField=rating.kp");
  params.push("sortType=-1");
  params.push("page=" + randomPage);
  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=genres");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "?" + params.join("&") + "&_=" + Date.now();

  fetchWithTimeout(url, 15000)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var docs = data.docs || [];
      for (var i = docs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = docs[i]; docs[i] = docs[j]; docs[j] = tmp;
      }
      render(docs, false);
      updateLoadMore(false);
      showToast("💎 Только шедевры с рейтингом 8.0+");
    })
    .catch(function (err) { handleFetchError(err, results); });
}

function openSimilar(title) {
  var panel = document.getElementById("similar-panel");
  var list = document.getElementById("similar-list");
  var titleEl = document.getElementById("similar-title");
  if (!panel || !list) return;

  if (titleEl) titleEl.textContent = "Похожие на «" + title + "»";
  list.innerHTML = '<p class="placeholder">Загружаем...</p>';
  panel.classList.add("open");

  var params = ["query=" + encodeURIComponent(title), "limit=1"];
  params.push("selectFields=name");
  params.push("selectFields=genres");

  fetchWithTimeout(BASE + "?" + params.join("&"), 15000)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var docs = data.docs || [];
      if (!docs.length || !docs[0].genres || !docs[0].genres.length) {
        list.innerHTML = '<p class="placeholder">Не удалось найти похожие</p>';
        return;
      }
      var genreName = docs[0].genres[0].name;
      var p2 = ["genres.name=" + encodeURIComponent(genreName), "typeNumber=1"];
      p2.push("sortField=rating.kp");
      p2.push("sortType=-1");
      p2.push("limit=20");
      p2.push("selectFields=name");
      p2.push("selectFields=alternativeName");
      p2.push("selectFields=year");
      p2.push("selectFields=poster");
      p2.push("selectFields=rating");
      p2.push("selectFields=genres");
      p2.push("selectFields=shortDescription");

      return fetchWithTimeout(BASE + "?" + p2.join("&"), 15000);
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var docs = (data.docs || []).filter(function (m) {
        return (m.name || m.alternativeName) !== title;
      });
      if (docs.length === 0) {
        list.innerHTML = '<p class="placeholder">Похожих не нашлось</p>';
        return;
      }
      render(docs, false, "similar-list");
    })
    .catch(function (err) {
      list.innerHTML = '<p class="placeholder">Ошибка: ' + err.message + '</p>';
    });
}

function initAI() {
  var aiInput = document.getElementById("ai-input");
  var aiButton = document.getElementById("ai-button");
  var aiStatus = document.getElementById("ai-status");
  if (!aiButton) return;

  aiButton.addEventListener("click", function () {
    var text = aiInput.value.trim();
    if (!text) { aiStatus.textContent = "Напиши хоть что-нибудь 🙂"; return; }
    aiButton.disabled = true;
    aiStatus.textContent = "Думаем...";

    var tools = [{
      type: "function",
      function: {
        name: "get_movies",
        description: "Ищет фильмы, сериалы или мультики по названию или настроению",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Название фильма или ключевые слова" },
            mood: { type: "string", description: "Настроение: happy, sad, action, cozy, scary, romance, nostalgia, inspire, mystery, scifi, music, think, anime, fantasy, crime, thriller, documentary, sport, war, western, biography, kids, adventure, mystic, musical, family, space" },
            type: { type: "string", description: "Тип: movie, series, cartoon" }
          },
          required: []
        }
      }
    }];

    var prompt = 'Пользователь описал, что хочет посмотреть: "' + text + '". ' +
      'Если описан сюжет — угадай НАЗВАНИЕ известного фильма и передай в query. ' +
      'Если названо прямо — тоже query. ' +
      'Если только настроение — используй mood. ' +
      'Определи type: movie, series или cartoon. Вызови get_movies.';

    puter.ai.chat(prompt, { tools: tools }).then(function (response) {
      var message = response.message || response;

      if (message.tool_calls && message.tool_calls.length > 0) {
        var toolCall = message.tool_calls[0];
        var args = {};
        try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch (e) { args = {}; }

        var query = args.query || "";
        var mood = args.mood || "";
        var type = args.type || currentType;

        if (query) {
          searchMovies(query, type);
          aiStatus.textContent = "Ищем: " + query;
        } else if (mood && moodGenres[mood]) {
          currentMood = mood;
          var ts = document.getElementById("type-switch");
          if (ts) ts.style.display = "flex";
          loadMovies(mood, type);
          aiStatus.textContent = "Подбираем по настроению: " + mood;
        } else {
          searchMovies(text, type);
          aiStatus.textContent = "Ищем: " + text;
        }
      } else {
        searchMovies(text, currentType);
        aiStatus.textContent = "Ищем: " + text;
      }
    }).catch(function (err) {
      aiStatus.textContent = "Ошибка: " + (err.message || err);
    }).finally(function () { aiButton.disabled = false; });
  });
}

function initTypeSwitch() {
  var typeSwitch = document.getElementById("type-switch");
  if (!typeSwitch) return;
  var typeButtons = typeSwitch.querySelectorAll("button");

  for (var i = 0; i < typeButtons.length; i++) {
    typeButtons[i].addEventListener("click", function () {
      for (var j = 0; j < typeButtons.length; j++) typeButtons[j].classList.remove("active");
      this.classList.add("active");
      currentType = this.getAttribute("data-type");
      if (currentMood) loadMovies(currentMood, currentType);
      else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType);
    });
  }
}

function initSettings() {
  var settingsPanel = document.getElementById("settings-panel");
  var settingsToggle = document.getElementById("settings-toggle");
  var settingsClose = document.getElementById("settings-close");

  if (settingsToggle) {
    settingsToggle.addEventListener("click", function () {
      if (settingsPanel) settingsPanel.classList.add("open");
    });
  }
  if (settingsClose) {
    settingsClose.addEventListener("click", function () {
      if (settingsPanel) settingsPanel.classList.remove("open");
    });
  }

  document.querySelectorAll(".color-dot").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var accent = this.getAttribute("data-accent");
      document.body.setAttribute("data-accent", accent);
      localStorage.setItem("mood_accent", accent);
      document.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = this.getAttribute("data-theme");
      if (theme === "light") document.body.classList.add("light");
      else document.body.classList.remove("light");
      localStorage.setItem("mood_theme", theme);
      document.querySelectorAll(".theme-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  document.querySelectorAll(".size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var size = this.getAttribute("data-size");
      document.body.setAttribute("data-size", size);
      localStorage.setItem("mood_size", size);
      document.querySelectorAll(".size-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  var resetBtn = document.getElementById("settings-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      localStorage.removeItem("mood_accent");
      localStorage.removeItem("mood_theme");
      localStorage.removeItem("mood_size");
      localStorage.removeItem("mood_hidden");
      document.body.removeAttribute("data-accent");
      document.body.removeAttribute("data-size");
      document.body.classList.remove("light");
      showToast("Настройки и скрытые фильмы сброшены");
    });
  }

  var savedAccent = localStorage.getItem("mood_accent");
  if (savedAccent) document.body.setAttribute("data-accent", savedAccent);
  var savedTheme = localStorage.getItem("mood_theme");
  if (savedTheme === "light") document.body.classList.add("light");
  var savedSize = localStorage.getItem("mood_size");
  if (savedSize) document.body.setAttribute("data-size", savedSize);
}

function init() {
  var buttons = document.querySelectorAll("#moods button");
  var results = document.getElementById("results");
  var typeSwitch = document.getElementById("type-switch");

  if (results) results.innerHTML = '<p class="placeholder">Выбери настроение выше</p>';

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var all = document.querySelectorAll("#moods button");
      for (var j = 0; j < all.length; j++) all[j].classList.remove("active");
      this.classList.add("active");
      currentMood = this.getAttribute("data-mood");
      if (typeSwitch) typeSwitch.style.display = "flex";
      loadMovies(currentMood, currentType);
    });
  }

  var searchBtn = document.getElementById("search-btn");
  var searchInput = document.getElementById("search-input");
  if (searchBtn && searchInput) {
    var doSearch = function () {
      var q = searchInput.value.trim();
      if (q) { currentMood = null; searchMovies(q, currentType); }
    };
    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doSearch();
    });
  }

  var randomBtn = document.getElementById("random-btn");
  if (randomBtn) randomBtn.addEventListener("click", function () { loadRandomMovies(currentType); });

  var masterpieceBtn = document.getElementById("masterpiece-btn");
  if (masterpieceBtn) masterpieceBtn.addEventListener("click", loadMasterpiece);

  var loadMore = document.getElementById("load-more");
  if (loadMore) {
    loadMore.addEventListener("click", function () {
      if (currentMood) loadMovies(currentMood, currentType, currentPage + 1, true);
      else if (lastSearchQuery) searchMovies(lastSearchQuery, currentType, currentPage + 1, true);
    });
  }

  initTypeSwitch();
  initAI();
  initSettings();

  var panel = document.getElementById("playlists-panel");
  var pToggle = document.getElementById("playlists-toggle");
  var pClose = document.getElementById("playlists-close");

  if (pToggle) {
    pToggle.addEventListener("click", function () {
      renderPlaylists();
      if (panel) panel.classList.add("open");
    });
  }
  if (pClose) {
    pClose.addEventListener("click", function () {
      if (panel) panel.classList.remove("open");
    });
  }

  var similarClose = document.getElementById("similar-close");
  if (similarClose) {
    similarClose.addEventListener("click", function () {
      var sp = document.getElementById("similar-panel");
      if (sp) sp.classList.remove("open");
    });
  }

  var createBtn = document.getElementById("playlist-create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      var name = document.getElementById("playlist-name-input").value;
      if (createPlaylist(name)) {
        document.getElementById("playlist-name-input").value = "";
        renderPlaylists();
        showToast("Плейлист «" + name.trim() + "» создан");
      } else if (name.trim()) {
        showToast("Такой плейлист уже есть", true);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}