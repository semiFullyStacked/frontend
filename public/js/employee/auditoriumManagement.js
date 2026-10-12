import {formatDateTime} from '../helpers/date-format.js';
import {HttpError, api} from '../helpers/api.js'
export async function getAuditoriumStatus() {
    try {
        const response = await api('/api/auditoriums');
        if (!response.ok) {
            throw new HttpError(response.status);
        }

        const auditoriums = await response.json();

        const tableRows = auditoriums.map(aud => `
      <tr>
        <th scope="row">${aud.auditoriumId}</th>
        <td>${aud.auditoriumName}</td>
        <td>${aud.seatCount} seats</td>
        <td>${aud.currentMovieTitle || '—'}</td>
        <td>${formatDateTime(aud.currentShowingEndsAt)}</td>
        <td>
          <span class="badge ${aud.needsCleaning ? 'bg-danger' : 'bg-success'}">
            ${aud.needsCleaning ? 'Needs cleaning' : 'Clean'}
          </span>
        </td>
        <td>
          <button
            class="btn btn-sm btn-outline-primary mark-cleaned-btn"
            data-auditorium-id="${aud.auditoriumId}"
            ${aud.needsCleaning ? '' : 'disabled'}>
            Mark cleaned
          </button>
        </td>
      </tr>
    `).join('');

        return `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h2 mb-1">Auditorium Status</h1>
            <p class="text-muted mb-0">Current real-time status of cinema halls.</p>
          </div>
          <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back to Employee Hub</a>
        </div>

        <div id="auditorium-action-message" class="alert alert-danger" role="alert" aria-live="polite" hidden></div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Auditorium</th>
                    <th>Capacity</th>
                    <th>Currently playing:</th>
                    <th>Ends at:</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.length > 0 ? tableRows : '<tr><td colspan="7" class="text-center py-4">No auditoriums found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    } catch (error) {
        if (error instanceof HttpError) throw error;
        console.error('Failed to load auditorium status:', error);
        return `
      <div class="container py-4">
        <div class="alert alert-danger shadow-sm" role="alert">
          <h4 class="alert-heading">Unable to load data</h4>
          <p class="mb-0">Could not connect to the backend server. Please try again later.</p>
        </div>
        <a href="#/employee" class="btn btn-secondary mt-2">← Back to Employee Hub</a>
      </div>
    `;
    }
}

export function setupAuditoriumManagement(refreshRoute) {
    document.querySelectorAll('.mark-cleaned-btn')
        .forEach(button => {
            button.addEventListener('click', async () => {
                const auditoriumId = button.dataset.auditoriumId;
                const message = document.getElementById('auditorium-action-message');

                button.disabled = true;
                message.textContent = '';

                try {
                    const response = await fetch(`/api/auditoriums/${auditoriumId}/clean`, {
                        method: 'POST'
                    });

                    if (!response.ok) {
                        const details = await response.text();
                        message.textContent = `Failed to mark auditorium ${auditoriumId} as cleaned (${response.status}): ${details || response.statusText}`;
                        message.hidden = false;
                        return;
                    }

                    await refreshRoute();
                } catch (error) {
                    console.error('Failed to mark auditorium as cleaned:', error);
                    message.textContent = `Could not mark auditorium ${auditoriumId} as cleaned: ${error.message}`;
                    message.hidden = false;
                } finally {
                    button.disabled = false;
                }
            });
        });
}
