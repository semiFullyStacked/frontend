import {html, nothing} from 'lit';
import {SmartBioView} from './helpers/view.js';

export class SmartBioHome extends SmartBioView {
    static properties = {
        movies: {state: true},
        loading: {state: true},
        errorMessage: {state: true},
    };

    constructor() {
        super();
        this.movies = [];
        this.loading = true;
        this.errorMessage = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchMovies();
    }

    async fetchMovies() {
        try {
            const response = await fetch('/api/movies');
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            this.movies = await response.json();
        } catch (error) {
            console.error('Failed to load movies:', error);
            this.errorMessage = 'Could not connect to the backend server. Please try again later.';
        } finally {
            this.loading = false;
        }
    }

    groupShowingsByDate(showings) {
        const grouped = {};
        for (const showing of showings) {
            const dateKey = showing.startTime.split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(showing);
        }
        return Object.keys(grouped)
            .sort()
            .map(dateKey => ({
                dateKey,
                showings: grouped[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime)),
            }));
    }

    formatDateLabel(dateKey) {
        const [, month, day] = dateKey.split('-');
        return `${parseInt(day)}/${parseInt(month)}`;
    }

    formatTimeOnly(isoString) {
        return new Date(isoString).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
    }

    renderMovieRow(movie) {
        const dateGroups = this.groupShowingsByDate(movie.showings);

        return html`
            <div class="movie-list-item d-flex gap-4 py-4 border-bottom">
                <div class="poster-placeholder flex-shrink-0">
                    <span>Place Holder Image For Movie Poster</span>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <h2 class="h4 mb-0">Movie Title: <span class="fw-normal">${movie.title}</span></h2>
                        <span class="badge bg-secondary">${movie.ageRestriction}+</span>
                    </div>
                    <p class="text-muted small fw-semibold mb-2">Available on</p>
                    <div class="d-flex flex-wrap gap-4">
                        ${dateGroups.length > 0
                            ? dateGroups.map(group => html`
                                <div class="date-column">
                                    <div class="date-column-header">${this.formatDateLabel(group.dateKey)}</div>
                                    ${group.showings.map(showing => html`
                                        <a href="#/seats?showingId=${showing.showingId}" class="showtime-entry d-block text-decoration-none">
                                            ${this.formatTimeOnly(showing.startTime)}
                                            <span class="text-muted small d-block">${showing.auditoriumName}</span>
                                        </a>
                                    `)}
                                </div>
                            `)
                            : html`<span class="text-muted small">No upcoming showtimes.</span>`}
                    </div>
                </div>
            </div>
        `;
    }

    renderView() {
        if (this.loading) {
            return html`<div class="container py-4"><p>Loading movies...</p></div>`;
        }

        if (this.errorMessage) {
            return html`
                <div class="container py-4">
                    <div class="alert alert-danger shadow-sm" role="alert">
                        <h4 class="alert-heading">Unable to load data</h4>
                        <p class="mb-0">${this.errorMessage}</p>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="container py-4">
                <div class="mb-4">
                    <h1 class="h2 mb-1">Now Showing</h1>
                    <p class="text-muted mb-0">Everything currently playing, with upcoming showtimes.</p>
                </div>
                <div class="movie-list">
                    ${this.movies.length > 0
                        ? this.movies.map(movie => this.renderMovieRow(movie))
                        : html`<div class="text-center text-muted py-5">Nothing playing right now — check back soon.</div>`}
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-home', SmartBioHome);
