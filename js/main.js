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
window.addEventListener('click', (e) => {
    const modalBtn = document.querySelector('.modal__button-close')
    if (e.target === modalBtn) closeModal()
    if (e.target === modal) closeModal()
    if (e.key === 'Escape') closeModal()
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
                        <li class=" page-item"><a class="page-link page-previous" data-value="${currentValue - 1}" href="#">Previous</a></li>
                        <li class="page-item page-item-cd  ${currentValue === lastPage ? 'page-item__points' : 'hidden'}"><a class="page-link" data-value="1" href="#">${currentValue === lastPage ? '1' : ''}</a></li>
                        <li class="page-item ${currentValue === 1 ? 'hidden' : ''}"><a class="page-link" data-value="${currentValue - 1}" href="#">${currentValue - 1}</a></li>
                        <li class="page-item"><a class="page-link page__link--active" data-value="${currentValue}" href="#">${currentValue}</a></li>
                        <li class="page-item ${currentValue === beforeLastPage ? '' : 'page-item__points'} ${currentValue !== lastPage ? currentValue + 1 : 'hidden'}"><a class="page-link" data-value="${currentValue + 1}" href="#">${currentValue + 1}</a></li>
                        <li class="page-item page-item-cd"><a class="page-link" data-value="13" href="#">${currentValue >= beforeLastPage ? '' : lastPage}</a></li>
                        <li class="page-item"><a class="page-link page-next" data-value="${currentValue + 1}" href="#">Next</a></li>
        `
    paginationList.innerHTML = paginatonHtml
    document.querySelector(`[data-value="${currentValue}"]`).classList.add('page__link--active')
    paginationNode = document.querySelectorAll('.page-link')
    paginationNode.forEach((item) => item.addEventListener('click', e => renderPagination(e)))
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
            <img class="movie__img" src="${element.posterUrl}" alt="banner">
            <div class="main__movie-bottom">
                <button class="main__movie-trailer" data-id='${element.filmId}'>Трейлер</button>
                <div class="main__movie-title title">
                    ${element.nameRu}
                </div>
                <p class="main__movie-type">${element.genres.map((genre) => ` ${genre.genre}`)}</p>
            </div>
        `
        movie.addEventListener('click', (e) => {
            if (e.target.classList.contains('movie__img') || e.target.classList.contains('main__movie-title')) {
                document.body.classList.add('stop-scrolling')
                openModal(element.filmId)
            }
            if (e.target.classList.contains('main__movie-trailer')) {
                document.body.classList.add('stop-scrolling')
                getTrailer(e.target.dataset.id)
            }
        })
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
    console.log(id);
    const resp = await fetch(SEARCH__FILM + id, {
        method: 'GET',
        headers: {
            'X-API-KEY': 'b38e3f31-4f77-470e-89af-8847c7ca24ca',
            'Content-Type': 'application/json',
        },
    }).then((resp) => resp.json()).then((movie) => renderModal(movie)).catch(() => renderError())
}
function renderModal(movie) {
    const modalHtml = `
                    <div class="modal__card ">
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
function openTrailer(list) {
    const links = list.items.filter((item) => item.site === 'YOUTUBE' ? item.url : '')
    //https://www.youtube.com/watch?v=mccs8Ql8m8o
    let url = ''
    let urlWatch = ''
    if (links.length > 0) {
        url = links[0].url
        if (url.indexOf('/v/') !== -1) {
            urlWatch = url.replace('v/', 'embed/')
        }
        if (url.indexOf('youtu.be') !== -1) {
            urlWatch = url.replace('youtu.be/', 'youtube.com/embed/')
        }
        if (url.indexOf('/watch?v=') !== -1) {
            urlWatch = url.replace('/watch?v=', '/embed/')
        }
    }
    console.log(urlWatch);
    const modalHtml = `
                     <div class="modal__card ">
                        ${urlWatch ? `<iframe width="100%" height="500px" src="${urlWatch}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` : '<iframe width="100%" height="500px" src="https://youtube.com/embed/YCHaVv72CN4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'} 
                        <button type="button" class="modal__button-close">Закрыть</button>
                     </div>
                     `
    modal.innerHTML = modalHtml
    modal.classList.add('modal--show')

}
function getTrailer(id) {
    fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}/videos`, {
        method: 'GET',
        headers: {
            'X-API-KEY': 'a92ef8d8-1062-46bd-b32e-49f7b179258b',
            'Content-Type': 'application/json',
        },
    })
        .then(res => res.json())
        .then(json => openTrailer(json))
        .catch(err => console.log(err))
}
renderPagination()
renderPreloader()