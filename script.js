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

var currentMood = null;
var currentType = "movie";

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

function loadMovies(mood, type) {
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Загружаем ' + (type === "series" ? "сериалы" : "фильмы") + '...</p>';

  var genres = moodGenres[mood] || [];
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }
  params.push("type=" + type);
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

// === Нейросеть через Puter.js ===
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
  "детектив": "mystery", "загадка": "mystery"
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

    var prompt = 'Пользователь не знает, что посмотреть. Он описал настроение: "' + text + '". ' +
      'Определи, к какому из жанров это ближе всего. Ответь ОДНИМ словом из списка: ' +
      'комедия, драма, боевик, семейное, ужасы, мелодрама, приключения, фантастика, музыка, детектив. ' +
      'Только одно слово, без пояснений.';

    puter.ai.chat(prompt).then(function (response) {
      var answer = "";
      if (typeof response === "string") { answer = response; }
      else if (response && response.message && response.message.content) { answer = response.message.content; }
      else if (response && response.text) { answer = response.text; }

      var clean = answer.toLowerCase().trim();
      var moodKey = null;
      for (var key in moodMap) {
        if (clean.indexOf(key) !== -1) { moodKey = moodMap[key]; break; }
      }

      if (moodKey) {
        aiStatus.textContent = "Похоже, тебе подойдёт: " + moodKey;
        var targetBtn = document.querySelector('#moods button[data-mood="' + moodKey + '"]');
        if (targetBtn) { targetBtn.click(); }
        else { currentMood = moodKey; loadMovies(moodKey, currentType); }
      } else {
        aiStatus.textContent = "Не смогли определить жанр. Попробуй описать иначе.";
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
      if (currentMood) {
        loadMovies(currentMood, currentType);
      }
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}