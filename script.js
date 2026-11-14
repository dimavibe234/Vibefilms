var API_KEY = "YEBSKKN-5FNM15Q-M6N5E27-BF9VZ5J_poiskkino";
var BASE = "workers-playground-weathered-moon-2ad3.dimarybin0603.workers.dev;

// Настроение -> жанры (русские названия, как в базе Кинопоиска)
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
  think:     ["драма", "детектив"]
};

function render(movies) {
  var results = document.getElementById("results");
  if (!movies || movies.length === 0) {
    results.innerHTML = '<p class="placeholder">Ничего не найдено</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < movies.length; i++) {
    var m = movies[i];
    // У poiskkino постер может быть в разных полях, пробуем самое вероятное
    var poster = "";
    if (m.poster && m.poster.url) {
      poster = m.poster.url;
    } else if (m.poster && m.poster.previewUrl) {
      poster = m.poster.previewUrl;
    }
    var year = (m.year || (m.releaseYears && m.releaseYears[0]) || "");
    var rating = (m.rating && (m.rating.kp || m.rating.imdb)) ? (m.rating.kp || m.rating.imdb).toFixed(1) : "";

    html += '<div class="card">';
    if (poster) {
      html += '<img src="' + poster + '" alt="' + (m.name || m.alternativeName || "") + '">';
    }
    html += '<div class="info">';
    html += '<div class="title">' + (m.name || m.alternativeName || "Без названия") + '</div>';
    html += '<div class="meta">' + year + (rating ? ' · ★ ' + rating : "") + '</div>';
    html += '</div></div>';
  }
  results.innerHTML = html;
}

function loadMovies(mood) {
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Загружаем фильмы...</p>';

  var genres = moodGenres[mood] || [];
  // Собираем query string: жанры через запятую, сортировка по рейтингу, лимит 20
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }
  params.push("sortField=rating.kp");
  params.push("sortType=-1");
  params.push("limit=20");
  params.push("selectFields=name&selectFields=alternativeName&selectFields=year&selectFields=poster&selectFields=rating");

  var url = BASE + "/v1.4/movie?" + params.join("&");

  fetch(url, {
    headers: {
      "X-API-KEY": API_KEY,
      "accept": "application/json"
    }
  })
    .then(function (r) {
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      return r.json();
    })
    .then(function (data) {
      // poiskkino возвращает объект с полем docs
      render(data.docs || data.results || []);
    })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка загрузки: ' + err.message + '</p>';
    });
}

function init() {
  var buttons = document.querySelectorAll("#moods button");
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Выбери настроение выше</p>';
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var all = document.querySelectorAll("#moods button");
      for (var j = 0; j < all.length; j++) {
        all[j].classList.remove("active");
      }
      this.classList.add("active");
      loadMovies(this.getAttribute("data-mood"));
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}