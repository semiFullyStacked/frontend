import {html} from 'lit';
import {csrfHeaders} from '../helpers/csrf.js';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioCheckout extends SmartBioView {
    static properties = {
        seatMap: {state: true},
        ticketTypes: {state: true},
        selectedTypes: {state: true},
        submitting: {state: true},
        loadFailed: {state: true},
    };

    constructor() {
        super();
        this.params = new URLSearchParams();
        this.showingId = null;
        this.seatCodes = [];
        this.seatMap = null;
        this.ticketTypes = [];
        this.selectedTypes = {};
        this.submitting = false;
        this.loadFailed = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadPage();
    }

    async loadPage() {
        this.showingId = this.params.get('showingId');
        this.seatCodes = (this.params.get('seats') || '').split(',').filter(Boolean);

        try {
            const [seatMapRes, ticketTypesRes] = await Promise.all([
                fetch(`/api/showings/${this.showingId}/seatmap`),
                fetch('/api/tickettypes')
            ]);

            this.seatMap = await seatMapRes.json();
            this.ticketTypes = await ticketTypesRes.json();
            this.selectedTypes = Object.fromEntries(
                this.seatCodes.map(code => [code, this.ticketTypes[0]?.id])
            );
        } catch (error) {
            console.error('Failed to load checkout:', error);
            this.loadFailed = true;
        }
    }

    selectTicketType(seatCode, ticketTypeId) {
        this.selectedTypes = {...this.selectedTypes, [seatCode]: ticketTypeId};
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);

        const seats = this.seatCodes.map(seatCode => ({
            seatCode,
            ticketTypeId: this.selectedTypes[seatCode]
        }));

        const bookingRequest = {
            seats,
            userId: null,
            guestName: data.get('name'),
            guestMail: data.get('email'),
            showingId: parseInt(this.showingId)
        };

        this.submitting = true;
        try {
            const bookingRes = await fetch('/api/reservation/reserve', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', ...csrfHeaders()},
                body: JSON.stringify(bookingRequest)
            });
            if (!bookingRes.ok) throw new Error(`Booking failed: ${bookingRes.status}`);
            const booking = await bookingRes.json();

            const amount = seats.reduce((sum, seat) => {
                const type = this.ticketTypes.find(t => t.id === seat.ticketTypeId);
                return sum + (type ? type.price : 0);
            }, 0);

            const paymentRes = await fetch('/api/payments/tickets/purchase', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', ...csrfHeaders()},
                body: JSON.stringify({amount, bookingId: booking.bookingId})
            });
            if (!paymentRes.ok) throw new Error(`Payment failed: ${paymentRes.status}`);

            window.location.hash = `#/ticket?bookingId=${booking.bookingId}`;
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Something went wrong during checkout. Please try again.');
        } finally {
            this.submitting = false;
        }
    }

    renderView() {
        if (this.loadFailed) {
            return html`<div class="container py-4"><div class="alert alert-danger">Could not load checkout.</div></div>`;
        }

        if (!this.seatMap) {
            return html`<div class="container py-4"><p>Loading checkout...</p></div>`;
        }

        const startTime = new Date(this.seatMap.startTime)
            .toLocaleString('en-GB', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

        return html`
            <div class="container py-4">
                <h1 class="h3 mb-1">${this.seatMap.movieTitle}</h1>
                <p class="text-muted mb-4">${this.seatMap.auditoriumName} · ${startTime}</p>

                <form id="checkout-form" @submit=${this.handleSubmit}>
                    <h2 class="h5 mb-3">Your seats</h2>
                    ${this.seatCodes.map(code => html`
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-semibold">${code}</span>
                            <select class="form-select w-auto seat-ticket-type"
                                    @change=${event => this.selectTicketType(code, parseInt(event.target.value))}>
                                ${this.ticketTypes.map(type => html`
                                    <option value=${type.id} ?selected=${this.selectedTypes[code] === type.id}>
                                        ${type.ticketName} (${type.price} kr)
                                    </option>
                                `)}
                            </select>
                        </div>
                    `)}

                    <div class="mb-3 mt-4">
                        <label class="form-label" for="checkout-name">Name</label>
                        <input type="text" class="form-control" id="checkout-name" name="name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="checkout-email">Email</label>
                        <input type="email" class="form-control" id="checkout-email" name="email" required>
                    </div>

                    <button type="submit" class="btn btn-primary" ?disabled=${this.submitting}>Pay</button>
                </form>
            </div>
        `;
    }
}

customElements.define('smartbio-checkout', SmartBioCheckout);
