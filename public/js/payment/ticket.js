export async function getTicketPage(params) {
    const bookingId = params.get('bookingId');

    if (!bookingId) {
        return `<div class="container py-4"><div class="alert alert-warning">No booking specified.</div></div>`;
    }

    try {
        const response = await fetch(`/api/bookings/${bookingId}/ticket`);

        if (!response.ok) {
            if (response.status === 404) {
                return `<div class="container py-4"><div class="alert alert-warning">No ticket found for that booking.</div></div>`;
            }
            throw new Error(`Server error: ${response.status}`);
        }

        const ticket = await response.json();

        const seatRows = ticket.seats.map(seat => `
            <li>${seat.seatCode} — ${seat.ticketTypeName} (${seat.price} kr)</li>
        `).join('');

        setTimeout(() => renderQrCode(ticket.qrCode), 0);

        return `
            <div class="container py-4 text-center">
                <h1 class="h3 mb-1">${ticket.seats.length} Ticket(s) for ${ticket.movieTitle} at ${formatDate(ticket.showingStart)} for ${ticket.customerName}</h1>
                <p class="text-muted mb-4">${ticket.auditoriumName}</p>

                <div id="qr-container" class="mx-auto mb-4" style="width: 160px; height: 160px;"></div>

                <ul class="list-unstyled d-inline-block text-start mb-3">
                    ${seatRows}
                </ul>
                <p class="fw-bold">Total: ${ticket.totalPrice} kr</p>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load ticket:', error);
        return `<div class="container py-4"><div class="alert alert-danger">Could not load your ticket.</div></div>`;
    }
}

function renderQrCode(text) {
    const container = document.getElementById('qr-container');
    if (!container) return;
    new QRCode(container, { text, width: 160, height: 160 });
}

function formatDate(isoString) {
    const d = new Date(isoString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}