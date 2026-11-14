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
    var poster = "";
    if (m.poster) {
      poster = m.poster.previewUrl || m.poster.url || "";
    }
    var title = m.name || m.alternativeName || "Без названия";
    var year = m.year || (m.releaseYears && m.releaseYears[0]) || "";
    var rating = "";
    if (m.rating) {
      if (m.rating.kp) { rating = m.rating.kp.toFixed(1); }
      else if (m.rating.imdb) { rating = m.rating.imdb.toFixed(1); }
    }

    html += '<div class="card">';
    if (poster) {
      html += '<img src="' + poster + '" alt="' + title + '">';
    }
    html += '<div class="info">';
    html += '<div class="title">' + title + '</div>';
    html += '<div class="meta">' + year + (rating ? ' · ★ ' + rating : "") + '</div>';
    html += '</div></div>';
  }
  results.innerHTML = html;
}

function loadMovies(mood) {
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Загружаем фильмы...</p>';

  var genres = moodGenres[mood] || [];
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }
  params.push("sortField=rating.kp");
  params.push("sortType=-1");
  params.push("limit=20");
  params.push("selectFields=name");
  params.push("selectFields=alternativeName");
  params.push("selectFields=year");
  params.push("selectFields=poster");
  params.push("selectFields=rating");

  var url = BASE + "/v1.4/movie?" + params.join("&");

  fetch(url)
    .then(function (r) {
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      return r.json();
    })
    .then(function (data) {
      render(data.docs || []);
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