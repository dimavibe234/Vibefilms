var BASE = "https://dawn-dust-4b25.dimarybin0603.workers.dev";

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
  documentary: ["документальный"],
  sport:       ["спорт"],
  war:         ["военный"],
  western:     ["вестерн"],
  biography:   ["биография"],
  kids:        ["детский"],
  adventure:   ["приключения"],
  comedy_dark: ["чёрная комедия"],
  mystic:      ["мистика"],
  musical:     ["мюзикл"],
  family:      ["семейный"],
  heist:       ["криминал"],
  survival:    ["выживание"],
  space:       ["космос"]
};

var currentMood = null;
var currentType = "movie";
var pendingMovie = null;

/* ===== Плейлисты ===== */
function getPlaylists() {
  try {
    var raw = localStorage.getItem("mood_movies_playlists");
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function savePlaylists(p) {
  localStorage.setItem("mood_movies_playlists", JSON.stringify(p));
}

function createPlaylist(name) {
  var p = getPlaylists();
  var key = name.trim();
  if (!key) return false;
  if (!p[key]) {
    p[key] = [];
    savePlaylists(p);
    return true;
  }
  return false;
}

function addToPlaylist(name, movie) {
  var p = getPlaylists();
  if (!p[name]) p[name] = [];
  var exists = p[name].some(function (x) {
    return x.title === movie.title && x.year === movie.year;
  });
  if (!exists) {
    p[name].push(movie);
    savePlaylists(p);
    return true;
  }
  return false;
}

function removeFromPlaylist(name, title, year) {
  var p = getPlaylists();
  if (!p[name]) return;
  p[name] = p[name].filter(function (x) {
    return !(x.title === title && x.year === year);
  });
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
      if (confirm('Удалить плейлист "' + name + '"?')) {
        deletePlaylist(name);
        renderPlaylists();
      }
    });
  });

  listEl.querySelectorAll(".remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      removeFromPlaylist(
        this.getAttribute("data-name"),
        this.getAttribute("data-title"),
        this.getAttribute("data-year")
      );
      renderPlaylists();
    });
  });
}

/* ===== Модальное окно плейлиста ===== */
function openPlaylistModal(movie) {
  pendingMovie = movie;
  var titleEl = document.getElementById("modal-movie-title");
  if (titleEl) {
    titleEl.textContent = movie.title + (movie.year ? " (" + movie.year + ")" : "");
  }

  var container = document.getElementById("modal-playlists");
  var playlists = getPlaylists();
  var names = Object.keys(playlists);

  if (!container) return;

  if (names.length === 0) {
    container.innerHTML = '<p class="playlist-empty">Нет плейлистов. Создай новый ниже.</p>';
  } else {
    var html = "";
    names.forEach(function (name) {
      html += '<button class="modal-playlist-btn" data-name="' + name + '">' + name + '</button>';
    });
    container.innerHTML = html;

    container.querySelectorAll(".modal-playlist-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = this.getAttribute("data-name");
        if (addToPlaylist(name, pendingMovie)) {
          closePlaylistModal();
        } else {
          alert("Этот фильм уже есть в плейлисте.");
        }
      });
    });
  }

  var modal = document.getElementById("playlist-modal");
  if (modal) modal.classList.add("open");
}

function closePlaylistModal() {
  var modal = document.getElementById("playlist-modal");
  if (modal) modal.classList.remove("open");
  pendingMovie = null;
  var inp = document.getElementById("modal-new-playlist");
  if (inp) inp.value = "";
}

/* ===== Рендер карточек ===== */
function render(movies) {
  var results = document.getElementById("results");
  if (!results) return;
  if (!movies || movies.length === 0) {
    results.innerHTML = '<p class="placeholder">Ничего не найдено</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < movies.length; i++) {
    var m = movies[i];
    var poster = "";
    if (m.poster) {
      poster = m.poster.previewUrl || m.poster.url || "";
    }
    var title = m.name || m.alternativeName || "Без названия";
    var year = m.year || (m.releaseYears && m.releaseYears[0]) || "";
    var rating = "";
    if (m.rating) {
      if (m.rating.kp) rating = m.rating.kp.toFixed(1);
      else if (m.rating.imdb) rating = m.rating.imdb.toFixed(1);
    }
    var description = m.shortDescription || m.description || "";
    if (description.length > 120) description = description.substring(0, 120) + "…";

    html += '<div class="card" style="animation-delay:' + (i * 0.03) + 's">';
    if (poster) {
      html += '<img src="' + poster + '" alt="' + title + '" loading="lazy">';
    }
    html += '<div class="info">';
    html += '<div class="title">' + title + '</div>';
    html += '<div class="meta">' + year + (rating ? ' · ★ ' + rating : "") + '</div>';
    if (description) html += '<div class="desc">' + description + '</div>';
    html += '<button class="card-add" data-title="' + title + '" data-year="' + year + '" data-rating="' + rating + '" data-poster="' + poster + '">＋ В плейлист</button>';
    html += '</div></div>';
  }
  results.innerHTML = html;

  results.querySelectorAll(".card-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openPlaylistModal({
        title: this.getAttribute("data-title"),
        year: this.getAttribute("data-year"),
        rating: this.getAttribute("data-rating"),
        poster: this.getAttribute("data-poster")
      });
    });
  });
}

/* ===== Загрузка по настроению ===== */
function loadMovies(mood, type) {
  var results = document.getElementById("results");
  if (!results) return;
  var label = type === "series" ? "сериалы" : (type === "cartoon" ? "мультики" : "фильмы");
  results.innerHTML = '<p class="placeholder">Загружаем ' + label + '...</p>';

  var genres = moodGenres[mood] || [];
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }

  if (type === "series") params.push("typeNumber=2");
  else if (type === "cartoon") params.push("typeNumber=3");
  else params.push("typeNumber=1");

  params.push("sortField=rating.kp");
  params.push("sortType=-1");
  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "/v1.4/movie?" + params.join("&");

  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) { render(data.docs || []); })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка загрузки: ' + err.message + '</p>';
    });
}

/* ===== Поиск по названию ===== */
function searchMovies(query, type) {
  var results = document.getElementById("results");
  if (!results) return;
  results.innerHTML = '<p class="placeholder">Ищем «' + query + '»...</p>';

  var params = [];
  params.push("query=" + encodeURIComponent(query));

  if (type === "series") params.push("typeNumber=2");
  else if (type === "cartoon") params.push("typeNumber=3");
  else params.push("typeNumber=1");

  params.push("limit=24");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");
  params.push("selectFields=shortDescription");
  params.push("selectFields=description");

  var url = BASE + "/v1.4/movie/search?" + params.join("&");

  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) { render(data.docs || []); })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка поиска: ' + err.message + '</p>';
    });
}

/* ===== Нейросеть ===== */
function initAI() {
  var aiInput = document.getElementById("ai-input");
  var aiButton = document.getElementById("ai-button");
  var aiStatus = document.getElementById("ai-status");
  if (!aiButton) return;

  aiButton.addEventListener("click", function () {
    var text = aiInput.value.trim();
    if (!text) {
      aiStatus.textContent = "Напиши хоть что-нибудь 🙂";
      return;
    }
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
    }).finally(function () {
      aiButton.disabled = false;
    });
  });
}

/* ===== Переключатель типов ===== */
function initTypeSwitch() {
  var typeSwitch = document.getElementById("type-switch");
  if (!typeSwitch) return;
  var typeButtons = typeSwitch.querySelectorAll("button");

  for (var i = 0; i < typeButtons.length; i++) {
    typeButtons[i].addEventListener("click", function () {
      for (var j = 0; j < typeButtons.length; j++) {
        typeButtons[j].classList.remove("active");
      }
      this.classList.add("active");
      currentType = this.getAttribute("data-type");
      if (currentMood) loadMovies(currentMood, currentType);
    });
  }
}

/* ===== Настройки внешнего вида ===== */
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

  // Акцентный цвет
  document.querySelectorAll(".color-dot").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var accent = this.getAttribute("data-accent");
      document.body.setAttribute("data-accent", accent);
      localStorage.setItem("mood_accent", accent);
      document.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // Тема
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = this.getAttribute("data-theme");
      if (theme === "light") {
        document.body.classList.add("light");
      } else {
        document.body.classList.remove("light");
      }
      localStorage.setItem("mood_theme", theme);
      document.querySelectorAll(".theme-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // Размер карточек
  document.querySelectorAll(".size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var size = this.getAttribute("data-size");
      document.body.setAttribute("data-size", size);
      localStorage.setItem("mood_size", size);
      document.querySelectorAll(".size-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // Скругление
  document.querySelectorAll(".radius-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var r = this.getAttribute("data-radius");
      document.body.setAttribute("data-radius", r);
      localStorage.setItem("mood_radius", r);
      document.querySelectorAll(".radius-btn").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // Сброс
  var resetBtn = document.getElementById("settings-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      localStorage.removeItem("mood_accent");
      localStorage.removeItem("mood_theme");
      localStorage.removeItem("mood_size");
      localStorage.removeItem("mood_radius");
      document.body.removeAttribute("data-accent");
      document.body.removeAttribute("data-size");
      document.body.removeAttribute("data-radius");
      document.body.classList.remove("light");
      document.querySelectorAll(".color-dot, .theme-btn, .size-btn, .radius-btn").forEach(function (b) { b.classList.remove("active"); });
    });
  }

  // Применяем сохранённые настройки
  var savedAccent = localStorage.getItem("mood_accent");
  if (savedAccent) document.body.setAttribute("data-accent", savedAccent);

  var savedTheme = localStorage.getItem("mood_theme");
  if (savedTheme === "light") document.body.classList.add("light");

  var savedSize = localStorage.getItem("mood_size");
  if (savedSize) document.body.setAttribute("data-size", savedSize);

  var savedRadius = localStorage.getItem("mood_radius");
  if (savedRadius) document.body.setAttribute("data-radius", savedRadius);
}

/* ===== Основной запуск ===== */
function init() {
  var buttons = document.querySelectorAll("#moods button");
  var results = document.getElementById("results");
  var typeSwitch = document.getElementById("type-switch");

  if (results) {
    results.innerHTML = '<p class="placeholder">Выбери настроение выше</p>';
  }

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

  initTypeSwitch();
  initAI();
  initSettings();

  // Панель плейлистов
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

  var createBtn = document.getElementById("playlist-create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      var name = document.getElementById("playlist-name-input").value;
      if (createPlaylist(name)) {
        document.getElementById("playlist-name-input").value = "";
        renderPlaylists();
      } else if (name.trim()) {
        alert("Такой плейлист уже есть или имя пустое.");
      }
    });
  }

  var modalCreate = document.getElementById("modal-create-btn");
  if (modalCreate) {
    modalCreate.addEventListener("click", function () {
      var name = document.getElementById("modal-new-playlist").value;
      if (!name.trim()) return;
      createPlaylist(name);
      if (pendingMovie && addToPlaylist(name, pendingMovie)) {
        closePlaylistModal();
        renderPlaylists();
      }
    });
  }

  var modalClose = document.getElementById("modal-close");
  if (modalClose) modalClose.addEventListener("click", closePlaylistModal);

  var modal = document.getElementById("playlist-modal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closePlaylistModal();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}