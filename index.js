const API_KEY = 'cdadf37e';

const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');
const movieListContainer = document.querySelector('#movie-list-container');

let searchMovieList = [];
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    if (searchInput.value) {
      fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchInput.value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.Search) {
            const searchedMovies = data.Search;
            getMovieInfo(searchedMovies).then(() => {
              displaySearchResult(searchMovieList);
            });
          } else {
            searchMovieList = null;
            displaySearchResult(searchMovieList);
          }
        });
    }
  });
}

movieListContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('movie-action')) {
    e.target.disabled = 'true';
    const movieId = e.target.dataset.movieId;

    if (e.target.classList.contains('add-watchlist')) {
      const movie = searchMovieList.find((item) => item.imdbID === movieId);
      watchlist.push(movie);
    } else if (e.target.classList.contains('remove-watchlist')) {
      const movieIndex = watchlist.findIndex((item) => item.imdbID === movieId);
      watchlist.splice(movieIndex, 1);
      displayWatchlist(watchlist);
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
});

function getMovieInfo(arr) {
  searchMovieList = [];

  const promises = arr.map((item) =>
    fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`)
      .then((res) => res.json())
      .then((data) => {
        searchMovieList.push(data);
      })
  );

  return Promise.all(promises);
}

function displaySearchResult(arr) {
  const placeholderEl = document.querySelector('#empty-placeholder');
  const messageSearch = document.querySelector('#message-search');

  if (placeholderEl && messageSearch) {
    if (arr === null) {
      placeholderEl.style.display = 'none';
      messageSearch.style.display = 'block';
    } else if (arr.length === 0) {
      placeholderEl.style.display = 'flex';
      messageSearch.style.display = 'none';
    } else {
      placeholderEl.style.display = 'none';
      messageSearch.style.display = 'none';
    }
  }

  render(arr, 'search');
}

function displayWatchlist(arr) {
  const watchlistEmpty = document.querySelector('#watchlist-empty');

  if (arr.length) {
    watchlistEmpty.style.display = 'none';
  } else {
    watchlistEmpty.style.display = 'flex';
  }

  render(arr, 'watchlist');
}

function getHtmlStr(arr, page) {
  const htmlStr = arr
    .map((item) => {
      const moviePlot = item.Plot.slice(0, 132).trim();
      const movieRating = item.Ratings[0].Value.slice(0, 3);
      const btnClass = page === 'search' ? 'add-watchlist' : 'remove-watchlist';
      const btnContent =
        page === 'search'
          ? `<img src="./img/plus-icon.png" alt="Plus icon">
        Watchlist`
          : `<img src="./img/minus-icon.png" alt="Minus icon">
        Remove`;

      const isMovieInWatchlist = Boolean(
        watchlist.find((movie) => movie.imdbID === item.imdbID)
      );
      const isBtnDisabled = isMovieInWatchlist && page === 'search';

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
              <button class="movie-action ${btnClass}" data-movie-id="${
        item.imdbID
      }" ${isBtnDisabled ? 'disabled' : ''}>
                ${btnContent}
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

function render(arr, page) {
  const movieListContainer = document.querySelector('#movie-list-container');
  movieListContainer.innerHTML = '';
  if (arr) {
    movieListContainer.innerHTML = getHtmlStr(arr, page);
  }
}

displaySearchResult(searchMovieList);

if (document.querySelector('#watchlist')) {
  displayWatchlist(watchlist);
}
