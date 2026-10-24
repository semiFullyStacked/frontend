import './routes.js';
import {initCsrf} from './helpers/api.js';
import {loginChecker} from './helpers/session.js';

const appDiv = document.getElementById('content');

const routes = {
    '#/': 'smartbio-home',
    '#/profile': 'smartbio-profile',
    '#/login': 'smartbio-login',
    '#/employee': 'smartbio-employee-page',
    '#/auditoriumStatus': 'smartbio-auditorium-status',
    '#/bookingSearch': 'smartbio-booking-search',
    '#/seats': 'smartbio-seat-picker',
    '#/checkout': 'smartbio-checkout',
    '#/ticket': 'smartbio-ticket',
    '#/employeeManagement': 'smartbio-employee-management',
    '#/logout': 'smartbio-logout'
};

function handleRoute() {
    const fullHash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    const [path, queryString] = fullHash.split('?');
    const tagName = routes[path];

    if (!tagName) {
        appDiv.innerHTML = '<h1>404 - Page not found</h1>';
        return;
    }

    const view = document.createElement(tagName);
    view.params = new URLSearchParams(queryString || '');
    appDiv.replaceChildren(view);
}

async function startUp() {
    await loginChecker();
    try {
        await initCsrf();
    } catch (err) {
        console.error('CSRF init failed', err);
    }
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

await startUp();
