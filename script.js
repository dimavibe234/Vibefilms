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
  var exists = playlists[name].some(function (x) { return x.title === movie.title && x.year === movie.year; });
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

  // Удаление плейлиста
  listEl.querySelectorAll(".playlist-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = this.getAttribute("data-name");
      if (confirm('Удалить плейлист "' + name + '"?')) {
        deletePlaylist(name);
        renderPlaylists();
      }
    });
  });

  // Удаление фильма из плейлиста
  listEl.querySelectorAll(".remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = this.getAttribute("data-name");
      var title = this.getAttribute("data-title");
      var year = this.getAttribute("data-year");
      removeFromPlaylist(name, title, year);
      renderPlaylists();
    });
  });
}

// ===== Модальное окно выбора плейлиста =====
function openPlaylistModal(movie) {
  pendingMovie = movie;
  document.getElementById("modal-movie-title").textContent = movie.title + (movie.year ? " (" + movie.year + ")" : "");
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

  // Обработчик добавления
  results.querySelectorAll(".card-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var movie = {
        title: this.getAttribute("data-title"),
        year: this.getAttribute("data-year"),
        rating: this.getAttribute("data-rating"),
        poster: this.getAttribute("data-poster")
      };
      openPlaylistModal(movie);
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
    .then(function (r