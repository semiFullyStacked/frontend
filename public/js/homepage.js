export async function getHomePage() {
    try {
        const response = await fetch('/api/movies');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const movies = await response.json();
        const movieRows = movies.map(movie => renderMovieRow(movie)).join('');

        return `
            <div class="container py-4">
                <div class="mb-4">
                    <h1 class="h2 mb-1">Now Showing</h1>
                    <p class="text-muted mb-0">Everything currently playing, with upcoming showtimes.</p>
                </div>
                <div class="movie-list">
                    ${movieRows.length > 0 ? movieRows : '<div class="text-center text-muted py-5">Nothing playing right now — check back soon.</div>'}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load movies:', error);
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

function renderMovieRow(movie) {
    const dateGroups = groupShowingsByDate(movie.showings);

    const dateColumns = dateGroups.map(group => `
        <div class="date-column">
            <div class="date-column-header">${formatDateLabel(group.dateKey)}</div>
            ${group.showings.map(showing => `
                <a href="#/seats?showingId=${showing.showingId}" class="showtime-entry d-block text-decoration-none">
                    ${formatTimeOnly(showing.startTime)}
                    <span class="text-muted small d-block">${showing.auditoriumName}</span>
                </a>
            `).join('')}
        </div>
    `).join('');

    return `
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
                    ${dateColumns.length > 0 ? dateColumns : '<span class="text-muted small">No upcoming showtimes.</span>'}
                </div>
            </div>
        </div>
    `;
}

function groupShowingsByDate(showings) {
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
            showings: grouped[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime))
        }));
}

function formatDateLabel(dateKey) {
    const [year, month, day] = dateKey.split('-');
    return `${parseInt(day)}/${parseInt(month)}`;
}

function formatTimeOnly(isoString) {
    return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}