import {html, nothing} from 'lit';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioTicket extends SmartBioView {
    static properties = {
        ticket: {state: true},
        notice: {state: true},
        loadFailed: {state: true},
    };

    constructor() {
        super();
        this.params = new URLSearchParams();
        this.ticket = null;
        this.notice = '';
        this.loadFailed = false;
        this.qrRendered = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadTicket();
    }

    async loadTicket() {
        const bookingId = this.params.get('bookingId');

        if (!bookingId) {
            this.notice = 'No booking specified.';
            return;
        }

        try {
            const response = await fetch(`/api/bookings/${bookingId}/ticket`);

            if (!response.ok) {
                if (response.status === 404) {
                    this.notice = 'No ticket found for that booking.';
                    return;
                }
                throw new Error(`Server error: ${response.status}`);
            }

            this.ticket = await response.json();
        } catch (error) {
            console.error('Failed to load ticket:', error);
            this.loadFailed = true;
        }
    }

    updated() {
        if (this.ticket && !this.qrRendered) {
            new QRCode(this.querySelector('#qr-container'), {text: this.ticket.qrCode, width: 160, height: 160});
            this.qrRendered = true;
        }
    }

    formatDate(isoString) {
        const d = new Date(isoString);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    renderView() {
        if (this.loadFailed) {
            return html`<div class="container py-4"><div class="alert alert-danger">Could not load your ticket.</div></div>`;
        }

        if (this.notice) {
            return html`<div class="container py-4"><div class="alert alert-warning">${this.notice}</div></div>`;
        }

        if (!this.ticket) {
            return html`<div class="container py-4"><p>Loading ticket...</p></div>`;
        }

        return html`
            <div class="container py-4 text-center">
                <h1 class="h3 mb-1">${this.ticket.seats.length} Ticket(s) for ${this.ticket.movieTitle} at ${this.formatDate(this.ticket.showingStart)} for ${this.ticket.customerName}</h1>
                <p class="text-muted mb-4">${this.ticket.auditoriumName}</p>

                <div id="qr-container" class="mx-auto mb-4" style="width: 160px; height: 160px;"></div>

                <ul class="list-unstyled d-inline-block text-start mb-3">
                    ${this.ticket.seats.map(seat => html`
                        <li>${seat.seatCode} — ${seat.ticketTypeName} (${seat.price} kr)</li>
                    `)}
                </ul>
                <p class="fw-bold">Total: ${this.ticket.totalPrice} kr</p>
            </div>
        `;
    }
}

customElements.define('smartbio-ticket', SmartBioTicket);
