import {csrfHeaders} from '../helpers/csrf.js'
let currentTicketTypes = [];

export async function getCheckoutPage(params) {
    const showingId = params.get('showingId');
    const seatCodes = (params.get('seats') || '').split(',').filter(Boolean);

    const [seatMapRes, ticketTypesRes] = await Promise.all([
        fetch(`/api/showings/${showingId}/seatmap`),
        fetch('/api/tickettypes')
    ]);

    const seatMap = await seatMapRes.json();
    currentTicketTypes = await ticketTypesRes.json();

    const typeOptions = currentTicketTypes.map(t =>
        `<option value="${t.id}">${t.ticketName} (${t.price} kr)</option>`
    ).join('');

    const seatRows = seatCodes.map(code => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold">${code}</span>
            <select class="form-select w-auto seat-ticket-type" data-seat-code="${code}">
                ${typeOptions}
            </select>
        </div>
    `).join('');

    return `
        <div class="container py-4">
            <h1 class="h3 mb-1">${seatMap.movieTitle}</h1>
            <p class="text-muted mb-4">${seatMap.auditoriumName} · ${new Date(seatMap.startTime)
            .toLocaleString('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>

            <form id="checkout-form" data-showing-id="${showingId}" method="post">
                <h2 class="h5 mb-3">Your seats</h2>
                ${seatRows}

                <div class="mb-3 mt-4">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-control" id="checkout-name" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="checkout-email" required>
                </div>

                <button type="submit" class="btn btn-primary">Pay</button>
            </form>
        </div>
    `;
}

export async function handleCheckoutSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const showingId = parseInt(form.dataset.showingId);

    const seats = Array.from(form.querySelectorAll('.seat-ticket-type')).map(select => ({
        seatCode: select.dataset.seatCode,
        ticketTypeId: parseInt(select.value)
    }));

    const bookingRequest = {
        seats,
        userId: null,
        guestName: document.getElementById('checkout-name').value,
        guestMail: document.getElementById('checkout-email').value,
        showingId
    };

    try {
        const bookingRes = await fetch('/api/reservation/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders()},
            body: JSON.stringify(bookingRequest)
        });
        if (!bookingRes.ok) throw new Error(`Booking failed: ${bookingRes.status}`);
        const booking = await bookingRes.json();

        const amount = seats.reduce((sum, seat) => {
            const type = currentTicketTypes.find(t => t.id === seat.ticketTypeId);
            return sum + (type ? type.price : 0);
        }, 0);

        const paymentRes = await fetch('/api/payments/tickets/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
            body: JSON.stringify({ amount, bookingId: booking.bookingId })
        });
        if (!paymentRes.ok) throw new Error(`Payment failed: ${paymentRes.status}`);

        window.location.hash = `#/ticket?bookingId=${booking.bookingId}`;

    } catch (error) {
        console.error('Checkout failed:', error);
        alert('Something went wrong during checkout. Please try again.');
    }
}