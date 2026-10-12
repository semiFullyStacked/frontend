import * as Views from './routes.js'
import * as Searchbar from './bookingsearch.js'
import * as EmployeeManagement from './employeeManagement.js'
import * as AuditoriumManagement from './auditoriumManagement.js'
import * as csrfHelper from './api.js';
import {HttpError} from './api.js';
import {login, logout} from "./login.js";

// Constants
const appDiv = document.getElementById('content');
let routeRequestId = 0;
let isLoggedIn = false;

async function handleRoute() {
    const hash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    const requestId = ++routeRequestId;
    const renderView = routes[hash];

    if (!renderView) {
        appDiv.innerHTML = '<h1>404 - Page not found</h1>'
        return;
    }
    appDiv.innerHTML = '<p>Loading page...</p>'
    let content;
    try {
        content = await renderView();
    } catch (err) {
        if (err instanceof HttpError && err.status === 403) {
            content = Views.getForbiddenPage();
        } else {
            console.error('Route failed', hash, err);
            content = '<p>Something went wrong loading this page.</p>';
        }
    }

    const currentHash = window.location.hash === '#' ? '#/' : window.location.hash || '#/';
    if (requestId !== routeRequestId || hash !== currentHash) {
        return;
    }

    appDiv.innerHTML = content;

    if (hash === '#/bookingSearch') {
        Searchbar.setupBookingSearch();
    }
    if (hash === '#/employeeManagement') {
        EmployeeManagement.setupEmployeeManagement(handleRoute);
    }
    if (hash === '#/auditoriumStatus') {
        AuditoriumManagement.setupAuditoriumManagement(handleRoute);
    }
    if (hash === '#/login') {
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
    if (hash === '#/logout') {
        const logoutSubmit = document.getElementById("logout-submit");
        logoutSubmit.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                await logout();
                await loginChecker();
                isLoggedIn = false;
                updateUI();
                location.hash = '#/';
            } catch (err) {
                console.error(err);
                appDiv.querySelector('#logout-error'.hidden = false);
            }

        })
    }
}


const routes = {
    '#/': Views.getHomePage,
    '#/profile': Views.getProfile,
    '#/login': Views.getLogin,
    '#/employee': Views.getEmployeePage,
    '#/auditoriumStatus': Views.getAuditoriumStatus,
    '#/bookingSearch': Views.getBookingSearch,
    '#/employeeManagement': Views.getEmployeeManagement,
    '#/logout': Views.getLogout
}

function setupHashRouting() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}

export async function loginChecker() {
    document.body.id = '';
    [...document.body.classList]
        .filter(c => c.startsWith('has-'))
        .forEach(c => document.body.classList.remove(c));

    try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!response.ok) return;
        const user = await response.json();
        document.body.id = 'logged-in';
        for (const role of user.roles) {
            document.body.classList.add('has-' + role.replace('ROLE_', '').toLowerCase() + '-role');
        }
    } catch (error) {
        console.error('Session check failed', error);
    }
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