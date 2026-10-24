import {html, nothing} from 'lit';
import {api} from '../helpers/api.js';
import {formatDateTime} from '../helpers/date-format.js';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioAuditoriumStatus extends SmartBioView {
    static properties = {
        auditoriums: {state: true},
        loadFailed: {state: true},
        actionMessage: {state: true},
        cleaningId: {state: true},
    };

    constructor() {
        super();
        this.auditoriums = null;
        this.loadFailed = false;
        this.actionMessage = '';
        this.cleaningId = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadAuditoriums();
    }

    async loadAuditoriums() {
        try {
            const response = await api('/api/auditoriums');
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            this.auditoriums = await response.json();
            this.loadFailed = false;
        } catch (error) {
            if (this.handleLoadError(error)) return;
            console.error('Failed to load auditorium status:', error);
            this.loadFailed = true;
        }
    }

    async markCleaned(auditoriumId) {
        this.cleaningId = auditoriumId;
        this.actionMessage = '';

        try {
            const response = await fetch(`/api/auditoriums/${auditoriumId}/clean`, {method: 'POST'});

            if (!response.ok) {
                const details = await response.text();
                this.actionMessage = `Failed to mark auditorium ${auditoriumId} as cleaned (${response.status}): ${details || response.statusText}`;
                return;
            }

            await this.loadAuditoriums();
        } catch (error) {
            console.error('Failed to mark auditorium as cleaned:', error);
            this.actionMessage = `Could not mark auditorium ${auditoriumId} as cleaned: ${error.message}`;
        } finally {
            this.cleaningId = null;
        }
    }

    renderView() {
        if (this.loadFailed) {
            return html`
                <div class="container py-4">
                    <div class="alert alert-danger shadow-sm" role="alert">
                        <h4 class="alert-heading">Unable to load data</h4>
                        <p class="mb-0">Could not connect to the backend server. Please try again later.</p>
                    </div>
                    <a href="#/employee" class="btn btn-secondary mt-2">← Back to Employee Hub</a>
                </div>
            `;
        }

        if (!this.auditoriums) {
            return html`<div class="container py-4"><p>Loading auditoriums...</p></div>`;
        }

        return html`
            <div class="container py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="h2 mb-1">Auditorium Status</h1>
                        <p class="text-muted mb-0">Current real-time status of cinema halls.</p>
                    </div>
                    <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back to Employee Hub</a>
                </div>

                ${this.actionMessage
                    ? html`<div class="alert alert-danger" role="alert" aria-live="polite">${this.actionMessage}</div>`
                    : nothing}

                <div class="card shadow-sm border-0">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Auditorium</th>
                                        <th>Capacity</th>
                                        <th>Currently playing:</th>
                                        <th>Ends at:</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.auditoriums.length > 0
                                        ? this.auditoriums.map(aud => html`
                                            <tr>
                                                <th scope="row">${aud.auditoriumId}</th>
                                                <td>${aud.auditoriumName}</td>
                                                <td>${aud.seatCount} seats</td>
                                                <td>${aud.currentMovieTitle || '—'}</td>
                                                <td>${formatDateTime(aud.currentShowingEndsAt)}</td>
                                                <td>
                                                    <span class="badge ${aud.needsCleaning ? 'bg-danger' : 'bg-success'}">
                                                        ${aud.needsCleaning ? 'Needs cleaning' : 'Clean'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary"
                                                            ?disabled=${!aud.needsCleaning || this.cleaningId === aud.auditoriumId}
                                                            @click=${() => this.markCleaned(aud.auditoriumId)}>
                                                        Mark cleaned
                                                    </button>
                                                </td>
                                            </tr>
                                        `)
                                        : html`<tr><td colspan="7" class="text-center py-4">No auditoriums found.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-auditorium-status', SmartBioAuditoriumStatus);
