import {html, nothing} from 'lit';
import {api, HttpError} from '../helpers/api.js';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioSeatPicker extends SmartBioView {
    static properties = {
        seatMap: {state: true},
        selectedSeats: {state: true},
        seatCount: {state: true},
        notice: {state: true},
        loadFailed: {state: true},
    };

    constructor() {
        super();
        this.params = new URLSearchParams();
        this.showingId = null;
        this.seatMap = null;
        this.selectedSeats = [];
        this.seatCount = 0;
        this.notice = '';
        this.loadFailed = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadSeatMap();
    }

    async loadSeatMap() {
        const showingId = this.params.get('showingId');

        if (!showingId) {
            this.notice = 'No showing selected.';
            return;
        }

        try {
            const response = await api(`/api/showings/${showingId}/seatmap`);

            if (!response.ok) {
                if (response.status === 404) {
                    this.notice = "That showing doesn't exist.";
                    return;
                }
                throw new HttpError(response.status);
            }

            this.showingId = showingId;
            this.seatMap = await response.json();
        } catch (error) {
            if (this.handleLoadError(error)) return;
            console.error('Failed to load seat map:', error);
            this.loadFailed = true;
        }
    }

    get availableCount() {
        return this.seatMap.seats.filter(seat => !seat.reserved).length;
    }

    changeSeatCount(delta) {
        if (!this.seatMap) return;

        const newCount = this.seatCount + delta;

        if (newCount < 0) return;
        if (newCount > this.availableCount) return;
        if (newCount < this.selectedSeats.length) return; // deselect a seat first

        this.seatCount = newCount;
    }

    toggleSeat(seatCode) {
        if (this.selectedSeats.includes(seatCode)) {
            this.selectedSeats = this.selectedSeats.filter(code => code !== seatCode);
        } else {
            if (this.selectedSeats.length >= this.seatCount) {
                return; // already selected the chosen number of seats
            }
            this.selectedSeats = [...this.selectedSeats, seatCode];
        }
    }

    goToCheckout() {
        window.location.hash = `#/checkout?showingId=${this.showingId}&seats=${this.selectedSeats.join(',')}`;
    }

    formatShowingDateTime(isoString) {
        return new Date(isoString).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    }

    renderView() {
        if (this.loadFailed) {
            return html`
                <div class="container py-4">
                    <div class="alert alert-danger shadow-sm" role="alert">
                        <h4 class="alert-heading">Unable to load data</h4>
                        <p class="mb-0">Could not connect to the backend server. Please try again later.</p>
                    </div>
                </div>
            `;
        }

        if (this.notice) {
            return html`<div class="container py-4"><div class="alert alert-warning">${this.notice}</div></div>`;
        }

        if (!this.seatMap) {
            return html`<div class="container py-4"><p>Loading seats...</p></div>`;
        }

        return html`
            <div class="container py-4">
                <div class="d-flex gap-4">
                    <div class="poster-placeholder flex-shrink-0">
                        <span>Place Holder For A Movie Poster</span>
                    </div>
                    <div class="flex-grow-1">
                        <h1 class="h3 mb-1">${this.seatMap.movieTitle}</h1>
                        <p class="text-muted mb-3">${this.seatMap.auditoriumName} · ${this.formatShowingDateTime(this.seatMap.startTime)}</p>

                        <div class="seat-grid mb-4">
                            ${this.seatMap.seats.map(seat => html`
                                <button
                                    type="button"
                                    class="seat-button ${seat.reserved ? 'seat-reserved' : 'seat-available'} ${this.selectedSeats.includes(seat.seatCode) ? 'seat-selected' : ''}"
                                    ?disabled=${seat.reserved}
                                    @click=${() => this.toggleSeat(seat.seatCode)}
                                >
                                    ${seat.seatCode}
                                </button>
                            `)}
                        </div>

                        <div class="d-flex align-items-center gap-3 mb-4">
                            <span class="fw-semibold">Seats:</span>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click=${() => this.changeSeatCount(-1)}>−</button>
                            <span>${this.seatCount}</span>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click=${() => this.changeSeatCount(1)}>+</button>
                        </div>

                        <button type="button" class="btn btn-primary"
                                ?disabled=${this.seatCount === 0 || this.selectedSeats.length !== this.seatCount}
                                @click=${this.goToCheckout}>Checkout</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-seat-picker', SmartBioSeatPicker);
