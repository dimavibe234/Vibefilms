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
    var description = m.shortDescription || m.description || "";
    if (description.length > 120) {
      description = description.substring(0, 120) + "…";
    }

    html += '<div class="card" style="animation-delay:' + (i * 0.03) + 's">';
    if (poster) {
      html += '<img src="' + poster + '" alt="' + title + '" loading="lazy">';
    }
    html += '<div class="info">';
    html += '<div class="title">' + title + '</div>';
    html += '<div class="meta">' + year + (rating ? ' · ★ ' + rating : "") + '</div>';
    if (description) {
      html += '<div class="desc">' + description + '</div>';
    }
    html += '</div></div>';
  }
  results.innerHTML = html;
}

function loadMovies(mood, type) {
  var results = document.getElementById("results");
  var label = type === "series" ? "сериалы" : (type === "cartoon" ? "мультики" : "фильмы");
  results.innerHTML = '<p class="placeholder">Загружаем ' + label + '...</p>';

  var genres = moodGenres[mood] || [];
  var params = [];
  for (var i = 0; i < genres.length; i++) {
    params.push("genres.name=" + encodeURIComponent(genres[i]));
  }

  if (type === "series") {
    params.push("typeNumber=2");
  } else if (type === "cartoon") {
    params.push("typeNumber=3");
  } else {
    params.push("typeNumber=1");
  }

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
    .then(function (data) {
      render(data.docs || []);
    })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка загрузки: ' + err.message + '</p>';
    });
}

function searchMovies(query, type) {
  var results = document.getElementById("results");
  results.innerHTML = '<p class="placeholder">Ищем «' + query + '»...</p>';

  var params = [];
  params.push("query=" + encodeURIComponent(query));

  if (type === "series") {
    params.push("typeNumber=2");
  } else if (type === "cartoon") {
    params.push("typeNumber=3");
  } else {
    params.push("typeNumber=1");
  }

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
    .then(function (data) {
      render(data.docs || []);
    })
    .catch(function (err) {
      results.innerHTML = '<p class="placeholder">Ошибка поиска: ' + err.message + '</p>';
    });
}

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
        description: "Ищет фильмы, сериалы или мультики. Если пользователь описывает сюжет или идею, сначала определи наиболее вероятное НАЗВАНИЕ фильма и передай его в query.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "НАЗВАНИЕ фильма, который нужно найти. Если пользователь описал сюжет (например, 'мужик застрял на Марсе'), угадай название ('Марсианин') и передай его сюда." },
            mood: { type: "string", description: "Настроение: happy, sad, action, cozy, scary, romance, nostalgia, inspire, mystery, scifi, music, think, anime" },
            type: { type: "string", description: "Тип: movie (фильм), series (сериал), cartoon (мультик)" }
          },
          required: []
        }
      }
    }];

    var prompt = 'Пользователь хочет посмотреть что-то и описал это так: "' + text + '". ' +
      'Твоя задача — подобрать фильмы. ' +
      'ВАЖНО: если пользователь описывает СЮЖЕТ или ИДЕЮ (например, "фильм про мужика, который застрял на Марсе" или "где герой повторяет день сурка"), ты должен сначала ПОНЯТЬ, о каком известном фильме идёт речь, и передать его НАЗВАНИЕ в поле query. ' +
      'Если пользователь называет фильм напрямую (например, "Интерстеллар"), тоже используй query. ' +
      'Если он описывает только НАСТРОЕНИЕ (например, "хочу посмеяться" или "грустно"), определи жанр и используй поле mood. ' +
      'Значения mood: happy (весело), sad (грустно), action (боевик), cozy (уютно), scary (страшно), romance (романтика), nostalgia (ностальгия), inspire (вдохновение), mystery (детектив), scifi (фантастика), music (музыка), think (подумать), anime (аниме). ' +
      'Также определи тип: movie (фильм), series (сериал) или cartoon (мультик), если это очевидно. ' +
      'Вызови функцию get_movies с нужными параметрами.';

    puter.ai.chat(prompt, { tools: tools }).then(function (response) {
      var message = response.message || response;

      if (message.tool_calls && message.tool_calls.length > 0) {
        var toolCall = message.tool_calls[0];
        var args = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch (e) {
          args = {};
        }

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
          var clean = text.toLowerCase();
          var fallbackMood = null;
          for (var key in moodMap) {
            if (clean.indexOf(key) !== -1) { fallbackMood = moodMap[key]; break; }
          }
          if (fallbackMood) {
            currentMood = fallbackMood;
            document.getElementById("type-switch").style.display = "flex";
            loadMovies(fallbackMood, type);
            aiStatus.textContent = "Подбираем фильмы: " + fallbackMood;
          } else {
            searchMovies(text, type);
            aiStatus.textContent = "Ищем: " + text;
          }
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