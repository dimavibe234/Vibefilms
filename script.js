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
  save