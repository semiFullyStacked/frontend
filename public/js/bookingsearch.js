let searchRequestId = 0;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function formatPrice(value) {
    if (value == null || !Number.isFinite(Number(value))) {
        return 'N/A';
    }

    return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK'
    }).format(Number(value));
}

function renderBooking(booking) {
    const seats = Array.isArray(booking.seats) && booking.seats.length
        ? booking.seats.map(seat => {
            const name = [seat.seatCode, seat.ticketTypeName]
                .filter(Boolean)
                .map(escapeHtml)
                .join(' — ');
            return `${name || 'Seat'} (${escapeHtml(formatPrice(seat.price))})`;
        }).join(', ')
        : 'N/A';

    return `
      <div class="card bg-light border-0 p-3">
        <h2 class="h6 text-primary fw-bold mb-2">
          Booking Details (#${escapeHtml(booking.bookingId ?? 'N/A')})
        </h2>
        <ul class="list-unstyled small mb-0">
          <li><strong>Movie:</strong> ${escapeHtml(booking.movieTitle || 'N/A')}</li>
          <li><strong>Showing:</strong> ${escapeHtml(formatDateTime(booking.showingStart))}</li>
          <li><strong>Auditorium:</strong> ${escapeHtml(booking.auditoriumName || 'N/A')}</li>
          <li><strong>Seats:</strong> ${seats}</li>
          <li><strong>Customer:</strong> ${escapeHtml(booking.customerName || 'N/A')}</li>
          <li><strong>Email:</strong> ${escapeHtml(booking.customerEmail || 'N/A')}</li>
          <li><strong>Total Price:</strong> ${escapeHtml(formatPrice(booking.totalPrice))}</li>
          <li><strong>Ticket QR token:</strong> ${escapeHtml(booking.qrCode || 'N/A')}</li>
        </ul>
      </div>
    `;
}

function showMessage(container, message, type = 'danger') {
    container.innerHTML = `<div class="alert alert-${type} py-2 small mb-0" role="status">${escapeHtml(message)}</div>`;
}

export async function handleBookingSearchSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const bookingIdInput = form.elements.namedItem('query');
    const resultContainer = document.getElementById('booking-result');
    const submitButton = form.querySelector('button[type="submit"]');
    const bookingId = Number(bookingIdInput.value);

    if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
        showMessage(resultContainer, 'Enter a valid positive booking ID.', 'warning');
        bookingIdInput.focus();
        return;
    }

    const requestId = ++searchRequestId;
    submitButton.disabled = true;
    resultContainer.setAttribute('aria-busy', 'true');
    showMessage(resultContainer, 'Searching for booking…', 'info');

    try {
        const response = await fetch(`/api/bookings/${bookingId}/ticket`);

        if (!response.ok) {
            if (response.status === 404) {
                showMessage(resultContainer, `No booking found with ID #${bookingId}.`, 'warning');
                return;
            }

            const details = await response.text();
            throw new Error(`Server returned ${response.status}: ${details || response.statusText}`);
        }

        const booking = await response.json();
        if (requestId === searchRequestId) {
            resultContainer.innerHTML = renderBooking(booking);
        }
    } catch (error) {
        console.error('Booking search failed:', error);
        if (requestId === searchRequestId) {
            showMessage(resultContainer, `Booking search failed: ${error.message}`);
        }
    } finally {
        if (requestId === searchRequestId) {
            submitButton.disabled = false;
            resultContainer.setAttribute('aria-busy', 'false');
        }
    }
}

export function setupBookingSearch() {
    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', handleBookingSearchSubmit);
    }
}
