import {api, initCsrf} from "./api.js";

export async function login(username, password) {
    const res = await api('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
    });
    if (res.status === 200) {
        await initCsrf(); // pick up the rotated token after login
        return true;
    }

    if (res.status === 401) return false; // wrong credentials
    throw new Error(`Unexpected login response: ${res.status}`);
}

export async function logout() {
    await api('/logout', { method: 'POST' });
    await initCsrf();
}

export function renderLogin(container) {
    container.querySelector('#login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const { username, password } = Object.fromEntries(new FormData(e.target));
        try {
            if (await login(username, password)) {
                location.hash = '#/';
            } else {
                container.querySelector('#login-error').hidden = false;
            }
        } catch (err) {
            console.error(err);
        }
    });
}