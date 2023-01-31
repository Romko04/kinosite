// Пошук фільмів по сторінці
const TOP_URL1 = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page='
//пошук фільмів по назві
const SEARCH__FILM = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/'
//Форма пошуку
const searchForm = document.querySelector('.header__search')
//Каталог фільмів
let movieList = document.querySelector('.main__movies')
//Масив пагінацій
const paginationList = document.querySelector('.pagination')
let currentValue
let paginationNode

const preloader = document.querySelector('.preloader')

const modal = document.querySelector('.modal')

const error = document.querySelector('#error')
searchForm.addEventListener('submit', (e) => searchFilm(e))
//Події Закривання модалки
window.addEventListener('click', (e) => {
    const modalBtn = document.querySelector('.modal__button-close')
    switch (e.target) {
        case modalBtn:
            closeModal()
            break;
        case modal:
            closeModal()
            break
        default:
            break;
    }
    if (e.target.classList.contains('modal__movie-close-icon')) {
        closeModal()
    }
    if (e.key === 'Escape') closeModal()
    if (e.target.classList.contains('movie__img') || e.target.classList.contains('main__movie-title')) {
        openModal(e.target.dataset.value)
        document.body.classList.add('stop-scrolling')
    }
    if (e.target.classList.contains('page-link')) renderPagination(e)
})
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) closeModal()
})


function renderPagination(e) {
    const beforeLastPage = 12
    const lastPage = 13
    if (e) {
        e.preventDefault()
        currentValue = parseFloat(e.target.dataset.value)

        if (currentValue > lastPage || currentValue < 1) return
    }
    else {
        currentValue = 1
    }
    const paginatonHtml = `
                        <li class=" page-item"><a href="#" data-value="${currentValue - 1}" class="page-link page-previous fa-solid fa-angle-left"></a></li>
                        <li class="page-item page-item-cd  ${currentValue === lastPage ? 'page-item__points' : 'hidden'}"><a class="page-link" data-value="1" href="#">${currentValue === lastPage ? '1' : ''}</a></li>
                        <li class="page-item ${currentValue === 1 ? 'hidden' : ''}"><a class="page-link" data-value="${currentValue - 1}" href="#">${currentValue - 1}</a></li>
                        <li class="page-item"><a class="page-link page__link--active" data-value="${currentValue}" href="#">${currentValue}</a></li>
                        <li class="page-item ${currentValue === beforeLastPage ? '' : 'page-item__points'} ${currentValue !== lastPage ? currentValue + 1 : 'hidden'}"><a class="page-link" data-value="${currentValue + 1}" href="#">${currentValue + 1}</a></li>
                        <li class="page-item page-item-cd"><a class="page-link" data-value="13" href="#">${currentValue >= beforeLastPage ? '' : lastPage}</a></li>
                        <li class="page-item"><a href="" data-value="${currentValue + 1}" class="page-link page-previous fa-solid fa-angle-right"></a></li>
        `
    paginationList.innerHTML = paginatonHtml
    document.querySelector(`[data-value="${currentValue}"]`).classList.add('page__link--active')
    clearMovie()
    renderPreloader()
    !e ? getMovies(TOP_URL1 + 1) : getMovies(TOP_URL1 + currentValue)
}

async function getMovies(url) {
    const resp = await fetch(url, {
        method: 'GET',
        headers: {
            'X-API-KEY': 'b38e3f31-4f77-470e-89af-8847c7ca24ca',
            'Content-Type': 'application/json',
            'OriginAccess-Control-Allow-OriginVary': 'Origin'
        },
    }).then((resp) => resp.json()).then((json) => {
        clearPreloader()
        renderMovies(json)
    }).catch(() => renderError())
}
function searchFilm(e) {
    e.preventDefault()
    const searchInput = document.querySelector('.header__input')
    clearPagination()
    clearMovie()
    renderPreloader()
    getMovies(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${searchInput.value}`)


}
function renderMovies(movies) {
    movies.films.forEach(element => {
        const movie = document.createElement('div')
        movie.classList.add('main__movie')
        movie.innerHTML = `
            <img data-value='${element.filmId}' class="movie__img" src="${element.posterUrl}" alt="banner">
            <div class="main__movie-bottom">
                <div data-value='${element.filmId}' class="main__movie-title title">
                    ${element.nameRu}
                </div>
                <p class="main__movie-type">${element.genres.map((genre) => ` ${genre.genre}`)}</p>
            </div>
        `
        movieList.append(movie)
    });
}
function renderPreloader() {
    let preloaderHtml = `
    <div class="preloader__container">
        <img class="preloader__gif" src="img/preloader.gif" alt="">  
     </div>
    `
    preloader.innerHTML = preloaderHtml
}
function clearPreloader() {
    preloader.innerHTML = ``
}
function clearMovie() {
    movieList.innerHTML = ''
}
async function openModal(id) {
    const resp = await fetch(SEARCH__FILM + id, {
        method: 'GET',
        headers: {
            'X-API-KEY': 'b38e3f31-4f77-470e-89af-8847c7ca24ca',
            'Content-Type': 'application/json',
        },
    }).then((resp) => resp.json()).then((movie) => renderModal(movie)).catch(()=> renderError())
}
function renderModal(movie) {
    console.log(movie);
    const modalHtml = `
                    <div class="modal__card ">
                        <button class="fa-solid fa-xmark modal__movie-close-icon"></button>
                        <img class="modal__movie-backdrop" src="${movie.posterUrl}" alt="">
                        <h2>
                            <span class="modal__movie-title">${movie.nameRu}</span>
                            <span class="modal__movie-release-year"> - ${movie.year} год</span>
                        </h2>
                        <ul class="modal__movie-info">
                            <div class="loader"></div>

                            ${movie.filmLength ? `<li class="modal__movie-runtime">Время - ${movie.filmLength}
                                минут</li>` : ''}
                            <li class="modal__movie-overview">Жанр: ${movie.genres.map((genre) => `<span> ${genre.genre}<span/>`)}</li>
                            <li class="modal__movie-overview">Країна: ${movie.countries.map((country) => `<span>${country.country}<span/>`)}</li>
                            <li class="modal__movie-overview">${movie.description}</li>
                        </ul>
                        <button type="button" class="modal__button-close">Закрыть</button>
                    </div>
    `
    modal.innerHTML = modalHtml
    modal.classList.add('modal--show')
}
function closeModal() {
    modal.innerHTML = ''
    document.body.classList.remove('stop-scrolling')
    modal.classList.remove('modal--show')
}
function clearPagination() {
    paginationList.innerHTML = ''
}
function renderError() {
    error.innerHTML = `
    <img class="error__gif" src="img/error.gif" alt="">
    `
    error.classList.add('error')
}
renderPagination()
renderPreloader()