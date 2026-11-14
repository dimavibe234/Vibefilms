// Пока — тестовые данные. Позже заменим на запросы к TMDB API.
const testMovies = [
  // 😄 happy
  { title: "Superbad", year: 2007, genre: "happy" },
  { title: "The Grand Budapest Hotel", year: 2014, genre: "happy" },
  { title: "Amélie", year: 2001, genre: "happy" },
  { title: "Paddington 2", year: 2017, genre: "happy" },

  // 😢 sad
  { title: "Titanic", year: 1997, genre: "sad" },
  { title: "Manchester by the Sea", year: 2016, genre: "sad" },
  { title: "Grave of the Fireflies", year: 1988, genre: "sad" },
  { title: "Blue Valentine", year: 2010, genre: "sad" },

  // 🔥 action
  { title: "Mad Max: Fury Road", year: 2015, genre: "action" },
  { title: "John Wick", year: 2014, genre: "action" },
  { title: "Die Hard", year: 1988, genre: "action" },
  { title: "Mission: Impossible – Fallout", year: 2018, genre: "action" },

  // 🛋️ cozy
  { title: "The Lord of the Rings", year: 2001, genre: "cozy" },
  { title: "Paddington", year: 2014, genre: "cozy" },
  { title: "Julie & Julia", year: 2009, genre: "cozy" },
  { title: "Kiki's Delivery Service", year: 1989, genre: "cozy" },

  // 👻 scary
  { title: "The Conjuring", year: 2013, genre: "scary" },
  { title: "Hereditary", year: 2018, genre: "scary" },
  { title: "Get Out", year: 2017, genre: "scary" },
  { title: "A Quiet Place", year: 2018, genre: "scary" },

  // 💕 romance
  { title: "Pride & Prejudice", year: 2005, genre: "romance" },
  { title: "Before Sunrise", year: 1995, genre: "romance" },
  { title: "La La Land", year: 2016, genre: "romance" },
  { title: "Notting Hill", year: 1999, genre: "romance" },

  // 📼 nostalgia
  { title: "Back to the Future", year: 1985, genre: "nostalgia" },
  { title: "E.T. the Extra-Terrestrial", year: 1982, genre: "nostalgia" },
  { title: "Home Alone", year: 1990, genre: "nostalgia" },
  { title: "The Sandlot", year: 1993, genre: "nostalgia" },

  // 🚀 inspire
  { title: "The Pursuit of Happyness", year: 2006, genre: "inspire" },
  { title: "Dead Poets Society", year: 1989, genre: "inspire" },
  { title: "Rocky", year: 1976, genre: "inspire" },
  { title: "Hidden Figures", year: 2016, genre: "inspire" },

  // 🕵️ mystery
  { title: "Knives Out", year: 2019, genre: "mystery" },
  { title: "Se7en", year: 1995, genre: "mystery" },
  { title: "Gone Girl", year: 2014, genre: "mystery" },
  { title: "The Silence of the Lambs", year: 1991, genre: "mystery" },

  // 🛸 scifi
  { title: "Interstellar", year: 2014, genre: "scifi" },
  { title: "Blade Runner 2049", year: 2017, genre: "scifi" },
  { title: "Arrival", year: 2016, genre: "scifi" },
  { title: "The Matrix", year: 1999, genre: "scifi" },

  // 🎵 music
  { title: "Whiplash", year: 2014, genre: "music" },
  { title: "Bohemian Rhapsody", year: 2018, genre: "music" },
  { title: "The Greatest Showman", year: 2017, genre: "music" },
  { title: "Begin Again", year: 2013, genre: "music" },

  // 🤔 think
  { title: "Inception", year: 2010, genre: "think" },
  { title: "The Shawshank Redemption", year: 1994, genre: "think" },
  { title: "Fight Club", year: 1999, genre: "think" },
  { title: "Eternal Sunshine of the Spotless Mind", year: 2004, genre: "think" },
];

const buttons = document.querySelectorAll('#moods button');
const results = document.getElementById('results');

function render(movies) {
  if (!movies.length) {
    results.innerHTML = '<p class="placeholder">Ничего не найдено 😔</p>';
    return;
  }
  results.innerHTML = movies.map(m => `
    <div class="card">
      <div class="info">
        <div class="title">${m.title}</div>
        <div class="meta">${m.year}</div>
      </div>
    </div>
  `).join('');
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mood = btn.dataset.mood;
    const filtered = testMovies.filter(m => m.genre === mood);
    render(filtered);
  });
});

results.innerHTML = '<p class="placeholder">Выбери настроение выше ☝️</p>';