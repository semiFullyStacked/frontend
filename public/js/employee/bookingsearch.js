import {html, nothing} from 'lit';
import {api} from '../helpers/api.js';
import {formatDateTime} from '../helpers/date-format.js';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioBookingSearch extends SmartBioView {
    static properties = {
        searching: {state: true},
        message: {state: true},
        booking: {state: true},
    };

    constructor() {
        super();
        this.searching = false;
        this.message = null;
        this.booking = null;
        this.searchRequestId = 0;
    }

    async handleSubmit(event) {
        event.preventDefault();

        const bookingId = Number(new FormData(event.currentTarget).get('query'));

        if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
            this.booking = null;
            this.message = {type: 'warning', text: 'Enter a valid positive booking ID.'};
            this.querySelector('#query').focus();
            return;
        }

        const requestId = ++this.searchRequestId;
        this.searching = true;
        this.booking = null;
        this.message = {type: 'info', text: 'Searching for booking…'};

        try {
            const response = await api(`/api/bookings/${bookingId}/ticket`);

            if (!response.ok) {
                if (response.status === 404) {
                    this.message = {type: 'warning', text: `No booking found with ID #${bookingId}.`};
                    return;
                }

                const details = await response.text();
                throw new Error(`Server returned ${response.status}: ${details || response.statusText}`);
            }

            const booking = await response.json();
            if (requestId === this.searchRequestId) {
                this.booking = booking;
                this.message = null;
            }
        } catch (error) {
            console.error('Booking search failed:', error);
            if (requestId === this.searchRequestId) {
                this.message = {type: 'danger', text: `Booking search failed: ${error.message}`};
            }
        } finally {
            if (requestId === this.searchRequestId) {
                this.searching = false;
            }
        }
    }

    formatPrice(value) {
        if (value == null || !Number.isFinite(Number(value))) {
            return 'N/A';
        }

        return new Intl.NumberFormat('da-DK', {style: 'currency', currency: 'DKK'}).format(Number(value));
    }

    renderBooking(booking) {
        const seats = Array.isArray(booking.seats) && booking.seats.length
            ? booking.seats.map(seat => {
                const name = [seat.seatCode, seat.ticketTypeName].filter(Boolean).join(' — ');
                return `${name || 'Seat'} (${this.formatPrice(seat.price)})`;
            }).join(', ')
            : 'N/A';

        return html`
            <div class="card bg-light border-0 p-3">
                <h2 class="h6 text-primary fw-bold mb-2">
                    Booking Details (#${booking.bookingId ?? 'N/A'})
                </h2>
                <ul class="list-unstyled small mb-0">
                    <li><strong>Movie:</strong> ${booking.movieTitle || 'N/A'}</li>
                    <li><strong>Showing:</strong> ${formatDateTime(booking.showingStart)}</li>
                    <li><strong>Auditorium:</strong> ${booking.auditoriumName || 'N/A'}</li>
                    <li><strong>Seats:</strong> ${seats}</li>
                    <li><strong>Customer:</strong> ${booking.customerName || 'N/A'}</li>
                    <li><strong>Email:</strong> ${booking.customerEmail || 'N/A'}</li>
                    <li><strong>Total Price:</strong> ${this.formatPrice(booking.totalPrice)}</li>
                    <li><strong>Ticket QR token:</strong> ${booking.qrCode || 'N/A'}</li>
                </ul>
            </div>
        `;
    }

    renderView() {
        return html`
            <div class="container py-4">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-6">
                        <div class="card shadow-sm border-0">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h2 class="h4 card-title mb-0">Lookup Booking</h2>
                                    <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back</a>
                                </div>
                                <p class="text-muted small">Enter a booking ID to view reservation details.</p>

                                <form id="search-form" @submit=${this.handleSubmit}>
                                    <div class="mb-3">
                                        <label for="query" class="form-label">Booking ID</label>
                                        <input type="number" class="form-control" id="query" name="query" placeholder="e.g. 1042" min="1" step="1" required />
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100" ?disabled=${this.searching}>Search Booking</button>
                                </form>

                                <div id="booking-result" class="mt-4" aria-live="polite" aria-atomic="true" aria-busy=${this.searching}>
                                    ${this.message
                                        ? html`<div class="alert alert-${this.message.type} py-2 small mb-0" role="status">${this.message.text}</div>`
                                        : nothing}
                                    ${this.booking ? this.renderBooking(this.booking) : nothing}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-booking-search', SmartBioBookingSearch);
