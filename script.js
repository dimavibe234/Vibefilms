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

/* Firebase */
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
    window.firebaseGetRedirectResult(fbAuth).then(function (result) {
      if (result && result.user) {
        currentUser = { id: result.user.uid, name: result.user.displayName || result.user.email, picture: result.user.photoURL };
        localStorage.setItem("mood_user", JSON.stringify(currentUser));
        renderUserInfo(); loadUserData(result.user.uid);
      }
    }).catch(console.error);
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
  if (btn) btn.onclick = function () { if (firebaseReady) window.firebaseSignIn(fbAuth, fbProvider); else showToast("Подождите...", true); };
}

/* Профиль */
function openProfile() {
  var m = document.getElementById("profile-modal");
  document.getElementById("profile-name-input").value = currentProfile.name || (currentUser ? currentUser.name : "");
  document.getElementById("profile-avatar-input").value = currentProfile.avatar || (currentUser ? currentUser.picture : "");
  document.getElementById("profile-avatar-img").src = current