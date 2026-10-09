import * as Views from './routes.js'
import * as Searchbar from './bookingsearch.js'
import * as EmployeeManagement from './employeeManagement.js'

const appDiv = document.getElementById('content');
let routeRequestId = 0;

async function handleRoute() {
    const hash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    const requestId = ++routeRequestId;
    const renderView = routes[hash];
    const appContainer = document.getElementById('content')

    if (!renderView) {
        appContainer.innerHTML = '<h1>404 - Page not found</h1>'
        return;
    }
    appContainer.innerHTML = '<p>Loading page...</p>'
    const content = await renderView();

    const currentHash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    if (requestId !== routeRequestId || hash !== currentHash) {
        return;
    }

    appContainer.innerHTML = content;

    if (hash === '#/bookingSearch') {
        Searchbar.setupBookingSearch();
    }
    if (hash === '#/employeeManagement') {
        EmployeeManagement.setupEmployeeManagement(handleRoute);
    }
}

const routes = {
    '#/': Views.getHomePage,
    '#/profile': Views.getProfile,
    '#/login': Views.getLogin,
    '#/employee': Views.getEmployeePage,
    '#/auditoriumStatus': Views.getAuditoriumStatus,
    '#/bookingSearch': Views.getBookingSearch,
    '#/employeeManagement': Views.getEmployeeManagement
}

function setupEventListeners() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);

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
