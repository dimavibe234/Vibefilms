var BASE = "https://dawn-dust-4b25.dimarybin0603.workers.dev";

var moodGenres = {
  happy:     ["комедия"],
  sad:       ["драма"],
  action:    ["боевик"],
  cozy:      ["семейный", "анимация"],
  scary:     ["ужасы"],
  romance:   ["мелодрама"],
  nostalgia: ["приключения"],
  inspire:   ["драма", "история"],
  mystery:   ["детектив", "триллер"],
  scifi:     ["фантастика"],
  music:     ["музыка"],
  think:     ["драма", "детектив"],
  anime:     ["аниме"]
};

var currentMood = null;
var currentType = "movie";
var pendingMovie = null;

// ===== Плейлисты (localStorage) =====
function getPlaylists() {
  try {
    var raw = localStorage.getItem("mood_movies_playlists");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function savePlaylists(playlists) {
  localStorage.setItem("mood_movies_playlists", JSON.stringify(playlists));
}

function createPlaylist(name) {
  var playlists = getPlaylists();
  var key = name.trim();
  if (!key) { return false; }
  if (!playlists[key]) {
    playlists[key] = [];
    savePlaylists(playlists);
    return true;
  }
  return false;
}

function addToPlaylist(name, movie) {
  var playlists = getPlaylists();
  if (!playlists[name]) { playlists[name] = []; }
  var exists = playlists[name].some(function (x) {
    return x.title === movie.title && x.year === movie.year;
  });
  if (!exists) {
    playlists[name].push(movie);
    savePlaylists(playlists);
    return true;
  }
  return false;
}

function removeFromPlaylist(name, title, year) {
  var playlists = getPlaylists();
  if (!playlists[name]) { return; }
  playlists[name] = playlists[name].filter(function (x) {
    return !(x.title === title && x.year === year);
  });
  savePlaylists(playlists);
}

function deletePlaylist(name) {
  var playlists = getPlaylists();
  delete playlists[name];
  savePlaylists(playlists);
}

function renderPlaylists() {
  var listEl = document.getElementById("playlists-list");
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
        if (m.poster) { html += '<img src="' + m.poster + '" alt="">'; }
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

// ===== Модальное окно выбора плейлиста =====
function openPlaylistModal(movie) {
  pendingMovie = movie;
  document.getElementById("modal-movie-title").textContent =
    movie.title + (movie.year ? " (" + movie.year + ")" : "");

  var container = document.getElementById("modal-playlists");
  var playlists = getPlaylists();
  var names = Object.keys(playlists);

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

  document.getElementById("playlist-modal").classList.add("open");
}

function closePlaylistModal() {
  document.getElementById("playlist-modal").classList.remove("open");
  pendingMovie = null;
  document.getElementById("modal-new-playlist").value = "";
}

// ===== Рендер карточек =====
function render(movies) {
  var results = document.getElementById("results");
  if (!movies || movies.length === 0) {
    results.innerHTML = '<p class="placeholder">Ничего не найдено</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < movies.length; i++) {
    var m = movies[i];
    var poster = "";
    if (m.poster) { poster = m.poster.previewUrl || m.poster.url || ""; }
    var title = m.name || m.alternativeName || "Без названия";
    var year = m.year || (m.releaseYears && m.releaseYears[0]) || "";
    var rating = "";
    if (m.rating) {
      if (m.rating.kp) { rating = m.rating.kp.toFixed(1); }
      else if (m.rating.imdb) { rating = m.rating.imdb.toFixed(1); }
    }
    var description = m.shortDescription || m.description || "";
    if (description.length > 120) { description = description.substring(0, 120) + "…"; }

    html += '<div class="card" style="animation-delay:' + (i * 0.03) + 's">';
    if (poster) {
      html += '<img src="' + poster + '" alt="' + title + '" loading="lazy">';
    }
    html += '<div class="info">';
    html += '<div class="title">' + title + '</div>';
    html += '<div class="meta">' + year + (rating ? ' · ★ ' + rating : "") + '</div>';
    if (description) { html += '<div class="desc">' + description + '</div>'; }
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

// ===== Загрузка по настроению =====
function loadMovies(mood, type) {
  var results = document.getElementById("results");
  var label = type === "series" ? "сериалы" : (type === "cartoon" ? "мультики" : "фильмы");
  results.innerHTML = '<p class="placeholder">Загружаем ' + label + '...</p>';

  var genres = moodGenres[mood] || [];
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }

  if (type === "series") { params.push("typeNumber=2"); }
  else if (type === "cartoon") { params.push("typeNumber=3"); }
  else { params.push("typeNumber=1"); }

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
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      return r.json();
    })
    .then(function (data) { render(data.docs || []); })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка загрузки: ' + err.message + '</p>';
    });
}

// ===== Поиск по названию =====
function searchMovies(query, type) {
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Ищем «' + query + '»...</p>';

  var params = [];
  params.push("query=" + encodeURIComponent(query));

  if (type === "series") { params.push("typeNumber=2"); }
  else if (type === "cartoon") { params.push("typeNumber=3"); }
  else { params.push("typeNumber=1"); }

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
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      return r.json();
    })
    .then(function (data) { render(data.docs || []); })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка поиска: ' + err.message + '</p>';
    });
}

// ===== Нейросеть =====
var moodMap = {
  "комедия": "happy", "смешное": "happy", "веселое": "happy",
  "драма": "sad", "грустное": "sad",
  "боевик": "action", "экшен": "action", "адреналин": "action",
  "семейное": "cozy", "уютное": "cozy", "анимация": "cozy",
  "ужасы": "scary", "страшное": "scary",
  "мелодрама": "romance", "романтика": "romance", "любовь": "romance",
  "приключения": "nostalgia",
  "фантастика": "scifi", "фантастическое": "scifi",
  "музыка": "music",
  "детектив": "mystery", "загадка": "mystery",
  "аниме": "anime", "анимационное": "anime"
};

function initAI() {
  var aiInput = document.getElementById("ai-input");
  var aiButton = document.getElementById("ai-button");
  var aiStatus = document.getElementById("ai-status");
  if (!aiButton) { return; }

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
        description: "Ищет фильмы, сериалы или мультики. Если пользователь описывает сюжет, сначала определи наиболее вероятное НАЗВАНИЕ фильма и передай его в query.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "НАЗВАНИЕ фильма, который нужно найти. Если описан сюжет — угадай название." },
            mood: { type: "string", description: "Настроение: happy, sad, action, cozy, scary, romance, nostalgia, inspire, mystery, scifi, music, think, anime" },
            type: { type: "string", description: "Тип: movie, series, cartoon" }
          },
          required: []
        }
      }
    }];

    var prompt = 'Пользователь хочет посмотреть что-то и описал это так: "' + text + '". ' +
      'Если пользователь описывает сюжет или идею — угадай НАЗВАНИЕ известного фильма и передай его в query. ' +
      'Если называет фильм напрямую — тоже query. ' +
      'Если описывает только настроение — используй mood. ' +
      'Значения mood: happy, sad, action, cozy, scary, romance, nostalgia, inspire, mystery, scifi, music, think, anime. ' +
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
          document.getElementById("type-switch").style.display = "flex";
          loadMovies(mood, type);
          aiStatus.textContent = "Подбираем фильмы по настроению: " + mood;
        } else {
          searchMovies(text, type);
          aiStatus.textContent = "Ищем: " + text;
        }
      } else {
        searchMovies(text, currentType);
        aiStatus.textContent = "Ищем: " + text;
      }
    }).catch(function (err) {
      aiStatus.textContent = "Ошибка нейросети: " + (err.message || err);
    }).finally(function () {
      aiButton.disabled = false;
    });
  });
}

function initTypeSwitch() {
  var typeSwitch = document.getElementById("type-switch");
  var typeButtons = typeSwitch.querySelectorAll("button");

  for (var i = 0; i < typeButtons.length; i++) {
    typeButtons[i].addEventListener("click", function () {
      for (var j = 0; j < typeButtons.length; j++) {
        typeButtons[j].classList.remove("active");
      }
      this.classList.add("active");
      currentType = this.getAttribute("data-type");
      if (currentMood) { loadMovies(currentMood, currentType); }
    });
  }
}

function init() {
  var buttons = document.querySelectorAll("#moods button");
  var results = document.getElementById("results");
  var typeSwitch = document.getElementById("type-switch");

  results.innerHTML = '<p class="placeholder">Выбери настроение выше</p>';

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var all = document.querySelectorAll("#moods button");
      for (var j = 0; j < all.length; j++) {
        all[j].classList.remove("active");
      }
      this.classList.add("active");
      currentMood = this.getAttribute("data-mood");
      typeSwitch.style.display = "flex";
      loadMovies(currentMood, currentType);
    });
  }

  initTypeSwitch();
  initAI();

  // Панель плейлистов
  var panel = document.getElementById("playlists-panel");
  document.getElementById("playlists-toggle").addEventListener("click", function () {
    renderPlaylists();
    panel.classList.add("open");
  });
  document.getElementById("playlists-close").addEventListener("click", function () {
    panel.classList.remove("open");
  });

  // Создание плейлиста
  document.getElementById("playlist-create-btn").addEventListener("click", function () {
    var name = document.getElementById("playlist-name-input").value;
    if (createPlaylist(name)) {
      document.getElementById("playlist-name-input").value = "";
      renderPlaylists();
    } else if (name.trim()) {
      alert("Такой плейлист уже есть или имя пустое.");
    }
  });

  // Модальное окно — создать и добавить
  document.getElementById("modal-create-btn").addEventListener("click", function () {
    var name = document.getElementById("modal-new-playlist").value;
    if (!name.trim()) { return; }
    createPlaylist(name);
    if (pendingMovie && addToPlaylist(name, pendingMovie)) {
      closePlaylistModal();
      renderPlaylists();
    }
  });

  document.getElementById("modal-close").addEventListener("click", closePlaylistModal);

  document.getElementById("playlist-modal").addEventListener("click", function (e) {
    if (e.target === this) { closePlaylistModal(); }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}