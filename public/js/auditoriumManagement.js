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
