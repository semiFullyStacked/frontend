let currentSeatMap = null;
let currentShowingId = null;
let selectedSeats = [];
let seatCount = 0;

export async function getSeatPicker(params) {
    const showingId = params.get('showingId');

    if (!showingId) {
        return `<div class="container py-4"><div class="alert alert-warning">No showing selected.</div></div>`;
    }

    try {
        const response = await (`/api/showings/${showingId}/seatmap`);

        if (!response.ok) {
            if (response.status === 404) {
                return `<div class="container py-4"><div class="alert alert-warning">That showing doesn't exist.</div></div>`;
            }
            throw new Error(`Server error: ${response.status}`);
        }

        const seatMap = await response.json();

        // Reset selection state for this fresh render
        currentSeatMap = seatMap;
        currentShowingId = showingId;
        selectedSeats = [];
        seatCount = 0;

        const seatButtons = seatMap.seats.map(seat => `
            <button
                type="button"
                class="seat-button ${seat.reserved ? 'seat-reserved' : 'seat-available'}"
                data-seat-code="${seat.seatCode}"
                ${seat.reserved ? 'disabled' : ''}
            >
                ${seat.seatCode}
            </button>
        `).join('');

        return `
            <div class="container py-4">
                <div class="d-flex gap-4">
                    <div class="poster-placeholder flex-shrink-0">
                        <span>Place Holder For A Movie Poster</span>
                    </div>
                    <div class="flex-grow-1">
                        <h1 class="h3 mb-1">${seatMap.movieTitle}</h1>
                        <p class="text-muted mb-3">${seatMap.auditoriumName} · ${formatShowingDateTime(seatMap.startTime)}</p>

                        <div class="seat-grid mb-4">
                            ${seatButtons}
                        </div>

                        <div class="d-flex align-items-center gap-3 mb-4">
                            <span class="fw-semibold">Seats:</span>
                            <button type="button" id="seat-decrement" class="btn btn-outline-secondary btn-sm">−</button>
                            <span id="seat-count-display">0</span>
                            <button type="button" id="seat-increment" class="btn btn-outline-secondary btn-sm">+</button>
                        </div>

                        <button type="button" id="checkout-button" class="btn btn-primary" disabled>Checkout</button>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load seat map:', error);
        return `
            <div class="container py-4">
                <div class="alert alert-danger shadow-sm" role="alert">
                    <h4 class="alert-heading">Unable to load data</h4>
                    <p class="mb-0">Could not connect to the backend server. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

export function handleSeatPickerClick(event) {
    if (event.target.closest('#seat-increment')) {
        changeSeatCount(1);
    } else if (event.target.closest('#seat-decrement')) {
        changeSeatCount(-1);
    } else if (event.target.closest('.seat-button')) {
        toggleSeat(event.target.closest('.seat-button'));
    } else if (event.target.closest('#checkout-button')) {
        goToCheckout();
    }
}

function changeSeatCount(delta) {
    if (!currentSeatMap) return;

    const availableCount = currentSeatMap.seats.filter(seat => !seat.reserved).length;
    const newCount = seatCount + delta;

    if (newCount < 0) return;
    if (newCount > availableCount) return;
    if (newCount < selectedSeats.length) return; // deselect a seat first

    seatCount = newCount;
    document.getElementById('seat-count-display').textContent = seatCount;
    updateCheckoutButtonState();
}

function toggleSeat(button) {
    const seatCode = button.dataset.seatCode;

    if (selectedSeats.includes(seatCode)) {
        selectedSeats = selectedSeats.filter(code => code !== seatCode);
        button.classList.remove('seat-selected');
    } else {
        if (selectedSeats.length >= seatCount) {
            return; // already selected the chosen number of seats
        }
        selectedSeats.push(seatCode);
        button.classList.add('seat-selected');
    }

    updateCheckoutButtonState();
}

function updateCheckoutButtonState() {
    const checkoutButton = document.getElementById('checkout-button');
    if (!checkoutButton) return;
    checkoutButton.disabled = seatCount === 0 || selectedSeats.length !== seatCount;
}

function goToCheckout() {
    const seatsParam = selectedSeats.join(',');
    window.location.hash = `#/checkout?showingId=${currentShowingId}&seats=${seatsParam}`;
}

function formatShowingDateTime(isoString) {
    return new Date(isoString).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}