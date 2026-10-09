export async function handleBookingSearchSubmit(event) {
    // 1. Prevent default full page refresh
    event.preventDefault();

    const bookingId = document.getElementById('query').value;
    console.log(bookingId);
    const resultContainer = document.getElementById('booking-result');

    // Show loading indicator
    resultContainer.innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span class="ms-2 text-muted">Searching database...</span>
    </div>
  `;

    try {
        const response = await fetch(`/api/bookings/${bookingId}/ticket`);

        if (!response.ok) {
            if (response.status === 404) {
                resultContainer.innerHTML = `
          <div class="alert alert-warning py-2 small mb-0">
            No booking found with ID <strong>#${bookingId}</strong>.
          </div>
        `;
                return;
            }
            throw new Error(`Server error: ${response.status}`);
        }

        const booking = await response.json();

  resultContainer.innerHTML = `
  <div class="card bg-light border-0 p-3">
    <h5 class="h6 text-primary fw-bold mb-2">
      Booking Details (#${booking.bookingId})
    </h5>

    <ul class="list-unstyled small mb-0">
      <li><strong>Movie:</strong> ${booking.movieTitle ?? 'N/A'}</li>
      <li><strong>Auditorium:</strong> ${booking.auditoriumName ?? 'N/A'}</li>
      <li><strong>Seats:</strong> ${
          booking.seats?.map(seat => seat.seatCode).join(', ') || 'N/A'
      }</li>
      <li><strong>Customer:</strong> ${booking.customerName ?? 'N/A'}</li>
      <li><strong>Email:</strong> ${booking.customerEmail ?? 'N/A'}</li>
      <li><strong>Total Price:</strong> ${booking.totalPrice ?? 0}</li>
    </ul>
  </div>
`;

    } catch (error) {
        console.error('Search error:', error);
        resultContainer.innerHTML = `
      <div class="alert alert-danger py-2 small mb-0">
        Failed to communicate with the backend server.
      </div>
    `;
    }
}

export function setupBookingSearch() {
    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', handleBookingSearchSubmit);
    }
}