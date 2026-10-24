import {html} from 'lit';
import {api, initCsrf} from '../helpers/api.js';
import {SmartBioView} from '../helpers/view.js';
import {loginChecker, setLoggedIn} from '../helpers/session.js';

export class SmartBioLogin extends SmartBioView {
    static properties = {
        loginFailed: {state: true},
    };

    constructor() {
        super();
        this.loginFailed = false;
    }

    async handleSubmit(event) {
        event.preventDefault();
        const {username, password} = Object.fromEntries(new FormData(event.currentTarget));
        this.loginFailed = false;
        try {
            if (await login(username, password)) {
                setLoggedIn(true);
                location.hash = '#/';
                await loginChecker();
            } else {
                this.loginFailed = true;
            }
        } catch (err) {
            console.error(err);
        }
    }

    renderView() {
        return html`
            <main class="container my-auto py-5">
                <div class="row justify-content-center">
                    <div class="col-md-5 col-lg-4">
                        <div class="card shadow-sm border-0">
                            <div class="card-body p-4">
                                <h1 class="h3 mb-4 fw-bold text-center">Sign In</h1>

                                <form id="login-form" method="post" action="/login" @submit=${this.handleSubmit}>
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Username</label>
                                        <input type="email" class="form-control" id="username" name="username" required autofocus>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="password" name="password" required>
                                    </div>
                                    <p id="login-error" class="text-danger mb-0" role="alert" ?hidden=${!this.loginFailed}>Wrong username or password.</p>
                                    <div class="d-grid mt-4">
                                        <button type="submit" class="btn btn-primary">Login</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
}

export async function login(username, password) {
    const res = await api('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({username, password})
    });
    if (res.status === 200) {
        await initCsrf(); // pick up the rotated token after login
        return true;
    }

    if (res.status === 401) return false; // wrong credentials
    throw new Error(`Unexpected login response: ${res.status}`);
}

export async function logout() {
    await api('/logout', {method: 'POST'});
    await initCsrf();
}

customElements.define('smartbio-login', SmartBioLogin);
