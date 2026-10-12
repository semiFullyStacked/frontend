import * as Views from './routes.js'
import * as Searchbar from './employee/bookingsearch.js'
import * as SeatPicker from "./payment/seatpicker.js";
import * as Checkout from './payment/checkout.js'
import * as EmployeeManagement from './employee/employeeManagement.js'
import * as AuditoriumManagement from './employee/auditoriumManagement.js'
import * as csrfHelper from './helpers/api.js';
import {HttpError} from './helpers/api.js';
import {login, logout} from "./auth/login.js";

// Constants
const appDiv = document.getElementById('content');
let routeRequestId = 0;
let isLoggedIn = false;

async function handleRoute() {
    const fullHash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    const requestId = ++routeRequestId;
    const [path, queryString] = fullHash.split('?');
    const params = new URLSearchParams(queryString || '');
    const renderView = routes[path];

    if (!renderView) {
        appDiv.innerHTML = '<h1>404 - Page not found</h1>'
        return;
    }
    appDiv.innerHTML = '<p>Loading page...</p>'
    let content;
    try {
        content = await renderView(params);
    } catch (err) {
        if (err instanceof HttpError && err.status === 403) {
            content = Views.getForbiddenPage();
        } else {
            console.error('Route failed', fullHash, err);
            content = '<p>Something went wrong loading this page.</p>';
        }
    }

    const currentHash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    if (requestId !== routeRequestId || fullHash !== currentHash) {
        return;
    }

    appDiv.innerHTML = content;

    if (fullHash === '#/bookingSearch') {
        Searchbar.setupBookingSearch();
    }
    if (fullHash === '#/employeeManagement') {
        EmployeeManagement.setupEmployeeManagement(handleRoute);
    }
    if (fullHash === '#/auditoriumStatus') {
        AuditoriumManagement.setupAuditoriumManagement(handleRoute);
    }
    if (fullHash === '#/login') {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const {username, password} = Object.fromEntries(new FormData(event.target));
            try {
                if (await login(username, password)) {
                    isLoggedIn = true;
                    updateUI();
                    location.hash = '#/';
                    await loginChecker();
                } else {
                    appDiv.querySelector('#login-error').hidden = false;
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
    if (fullHash === '#/logout') {
        const logoutSubmit = document.getElementById("logout-submit");
        logoutSubmit.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                await logout();
                isLoggedIn = false;
                await loginChecker();
                updateUI();
                location.hash = '#/';
            } catch (err) {
                console.error(err);
                appDiv.querySelector('#logout-error').hidden = false;
            }

        })
    }

    if (fullHash === '#/bookingSearch') {
        const searchForm = document.getElementById('search-booking-form');
        if (searchForm) {
            searchForm.addEventListener('submit', Searchbar.handleBookingSearchSubmit);
        }
        ;
    }
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
    '#/employeeManagement': Views.getEmployeeManagement,
    '#/logout': Views.getLogout
}

function setupHashRouting() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    appDiv.addEventListener('click', function (event) {
        if (window.location.hash.startsWith('#/seats')) {
            SeatPicker.handleSeatPickerClick(event);
        }
    })
    appDiv.addEventListener('submit', function (event) {
        if (event.target.id === 'checkout-form') {
            Checkout.handleCheckoutSubmit(event);
        }
    })
}

export async function loginChecker() {
    document.body.id = '';
    [...document.body.classList]
        .filter(c => c.startsWith('has-'))
        .forEach(c => document.body.classList.remove(c));

    try {
        const response = await fetch('/api/auth/me', {credentials: 'same-origin'});
        if (!response.ok) return;
        const user = await response.json();
        document.body.id = 'logged-in';
        for (const role of user.roles) {
            document.body.classList.add('has-' + role.replace('ROLE_', '').toLowerCase() + '-role');
        }
    } catch (error) {
        console.error('Session check failed', error);
    }
 //   appDiv.innerHTML = routes[window.location.hash || '#/']();
}

function updateUI() {
    document.body.classList.toggle('logged-in', isLoggedIn);
}

async function startUp() {
    await loginChecker();
    try {
        await csrfHelper.initCsrf();
    } catch (err) {
        console.error('CSRF init failed', err);
    }
    setupHashRouting();
    await handleRoute();

}

await startUp();