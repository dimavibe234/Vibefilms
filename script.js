// Пока — тестовые данные. Позже заменим на запросы к TMDB API.
const testMovies = [
  { id: 1, title: "Superbad", genre: "happy", year: 2007 },
  { id: 2, title: "The Grand Budapest Hotel", genre: "happy", year: 2014 },
  { id: 3, title: "Amélie", genre: "happy", year: 2001 },
  { id: 4, title: "Titanic", genre: "sad", year: 1997 },
  { id: 5, title: "Manchester by the Sea", genre: "sad", year: 2016 },
  { id: 6, title: "Mad Max: Fury Road", genre: "action", year: 2015 },
  { id: 7, title: "John Wick", genre: "action", year: 2014 },
  { id: 8, title: "The Lord of the Rings", genre: "cozy", year: 2001 },
  { id: 9, title: "Paddington", genre: "cozy", year: 2014 },
  { id: 10, title: "The Conjuring", genre: "scary", year: 2013 },
  { id: 11, title: "Hereditary", genre: "scary", year: 2018 },
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

// По умолчанию ничего не показываем
results.innerHTML = '<p class="placeholder">Выбери настроение выше ☝️</p>';