const API_KEY = 'cdadf37e';

const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');

let moviesList = [];

searchBtn.addEventListener('click', () => {
  if (searchInput.value) {
    fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchInput.value}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.Search) {
          const searchedMovies = data.Search;
          getMovieInfo(searchedMovies).then(() => {
            displaySearchResult(moviesList);
          });
        } else {
          moviesList = null;
          displaySearchResult(moviesList);
        }
      });
  }
});

function getMovieInfo(arr) {
  moviesList = [];

  const promises = arr.map((item) =>
    fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`)
      .then((res) => res.json())
      .then((data) => {
        moviesList.push(data);
      })
  );

  return Promise.all(promises);
}

function displaySearchResult(arr) {
  const placeholderEl = document.querySelector('#empty-placeholder');
  const messageSearch = document.querySelector('#message-search');

  if (arr === null) {
    console.log('working');
    placeholderEl.style.display = 'none';
    messageSearch.style.display = 'block';
  } else if (arr.length === 0) {
    placeholderEl.style.display = 'flex';
    messageSearch.style.display = 'none';
  } else {
    placeholderEl.style.display = 'none';
    messageSearch.style.display = 'none';
  }

  render(arr);
}

function getHtmlStr(arr) {
  const htmlStr = arr
    .map((item) => {
      const moviePlot = item.Plot.slice(0, 132).trim();
      const movieRating = item.Ratings[0].Value.slice(0, 3);

      return `
      <section class="movie-item">
          <div class="movie-poster">
            <img src="${item.Poster}" alt="Movie poster">
          </div>
          <div class="movie-info">
            <div class="movie-info-header">
              <h2 class="movie-title">${item.Title}</h2>
              <div class="movie-rating">
                  <img src="./img/star-icon.png" alt="Star icon">
                  ${movieRating}
              </div>
            </div>
            <div class="movie-info-additional">
              <p class="movie-duration">${item.Runtime}</p>
              <p class="movie-genre">${item.Genre}</p>
              <button class="movie-action">
                <img src="./img/plus-icon.png" alt="Plus icon">
                Watchlist
              </button>
            </div>
            <p class="movie-descr">${
              moviePlot < item.Plot
                ? `${moviePlot}...<button class="read-more">Read more</button>`
                : moviePlot
            }</p>
          </div>
        </section>
    `;
    })
    .join('');

  return htmlStr;
}

function render(arr) {
  const movieListContainer = document.querySelector('#movie-list-container');
  movieListContainer.innerHTML = '';
  if (arr) {
    movieListContainer.innerHTML = getHtmlStr(arr);
  }
}

displaySearchResult(moviesList);
