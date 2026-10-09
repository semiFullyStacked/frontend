import * as Views from './routes.js'
import * as Searchbar from './bookingsearch.js'

const appDiv = document.getElementById('content');

async function handleRoute() {
    const hash = window.location.hash || '#/'
    console.log(hash);
    const renderView = routes[hash];
    const appContainer = document.getElementById('content')

    if (!renderView) {
        appContainer.innerHTML = '<h1>404 - Page not found</h1>'
        return;
    }
    appContainer.innerHTML = '<p>Loading page...</p>'
    const content = await renderView();
    appContainer.innerHTML = content;
    if (hash === '#/bookingSearch') {
const form = document.getElementById('search-form');
if (form) {
form.addEventListener('submit',Searchbar.handleBookingSearchSubmit);
}}}

const routes = {
    '#/': Views.getHomePage,
    '#/profile': Views.getProfile,
    '#/login': Views.getLogin,
    '#/employee': Views.getEmployeePage,
    '#/auditoriumStatus': Views.getAuditoriumStatus,
    '#/bookingSearch': Views.getBookingSearch,
}

function setupEventListeners() {
    let hash = window.location.hash || '#/'
    if (hash === '#') hash = '#/';

    // Routing
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);

    // Dynamic content
    appDiv.addEventListener('click', function (event){
        if (event.target.matches('.button-submit')) {
            handleSubmit(event);
        }

    })
}

function updateState(newState) {
    Object.assign(state, newState);
    renderContent();
}


const state = {
    users: [],
    currentPage: 'home',
    isLoading: false
};

function renderContent() {
    const appDiv = document.getElementById("content");

    if (state.isLoading) {
        appDiv.innerHTML = '<div>Loading...</div>';
        return;
    }
    appDiv.innerHTML = routes[window.location.hash || '#/']();
}

function handleSubmit(event) {
    event.preventDefault();
    updateState({isLoading: true});
}



setupEventListeners();

