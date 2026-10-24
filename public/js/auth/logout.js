import {html} from 'lit';
import {SmartBioView} from '../helpers/view.js';
import {loginChecker, setLoggedIn} from '../helpers/session.js';
import {logout} from './login.js';

export class SmartBioLogout extends SmartBioView {
    static properties = {
        logoutFailed: {state: true},
    };

    constructor() {
        super();
        this.logoutFailed = false;
    }

    async handleLogout(event) {
        event.preventDefault();
        this.logoutFailed = false;
        try {
            await logout();
            setLoggedIn(false);
            await loginChecker();
            location.hash = '#/';
        } catch (err) {
            console.error(err);
            this.logoutFailed = true;
        }
    }

    renderView() {
        return html`
            <div class="row justify-content-center">
                <div class="col-md-5 col-lg-4">
                    <div class="card shadow-sm border-0">
                        <div class="card-body p-4 text-center">
                            <h1 class="h3 mb-4 fw-bold">Logout</h1>
                            <p class="text-muted mb-4">Are you sure you want to sign out?</p>
                            <p id="logout-error" class="text-danger" ?hidden=${!this.logoutFailed}>Logout failed. Please try again.</p>
                            <div class="d-grid">
                                <button type="button" id="logout-submit" class="btn btn-primary" @click=${this.handleLogout}>Sign out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-logout', SmartBioLogout);
