import * as Views from './routes.js'
import * as Searchbar from './bookingsearch.js'
import * as SeatPicker from "./seatpicker.js";
import * as Checkout from './checkout.js'

const appDiv = document.getElementById('content');

async function handleRoute() {
    const fullHash = window.location.hash || '#/';
    const [path, queryString] = fullHash.split('?');
    const params = new URLSearchParams(queryString || '');

    const renderView = routes[path];
    const appContainer = document.getElementById('content')

    if (!renderView) {
        appContainer.innerHTML = '<h1>404 - Page not found</h1>'
        return;
    }
    appContainer.innerHTML = '<p>Loading page...</p>'
    const content = await renderView(params);
    appContainer.innerHTML = content;
}
const routes = {
    '#/': Views.getHomePage,
    '#/profile': Views.getProfile,
    '#/login': Views.getLogin,
    '#/employee': Views.getEmployeePage,
    '#/auditoriumStatus': Views.getAuditoriumStatus,
    '#/bookingSearch': Views.getBookingSearch,
    '#/seats': Views.getSeatPicker,
    '#/checkout': Views.getCheckoutPage,
    '#/ticket': Views.getTicketPage,
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
        if (window.location.hash.startsWith('#/seats')) {
            SeatPicker.handleSeatPickerClick(event);
        }

    })
    if (hash === '#/bookingSearch') {
        const searchForm = document.getElementById('search-booking-form');
        if (searchForm) {
            searchForm.addEventListener('submit', Searchbar.handleBookingSearchSubmit);
        };
    }

    appDiv.addEventListener('submit', function (event) {
        if (event.target.id === 'checkout-form') {
            Checkout.handleCheckoutSubmit(event);
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