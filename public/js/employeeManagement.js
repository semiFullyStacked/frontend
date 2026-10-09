export async function createEmployee(event, refreshRoute) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const message = document.getElementById('employee-form-message');
    message.textContent = '';
    submitButton.disabled = true;

    const body = {
        name: document.getElementById('employee-name').value,
        email: document.getElementById('employee-email').value,
        password: document.getElementById('employee-password').value,
        roleName: document.getElementById('employee-role').value
    };

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const details = await response.text();
            message.textContent = `Failed creating employee (${response.status}): ${details || response.statusText}`;
            return;
        }

        form.reset();
        await refreshRoute();
    } catch (error) {
        console.error('Employee creation failed:', error);
        message.textContent = `Could not create employee: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
}

export async function deleteEmployee(id, refreshRoute) {

    if (!confirm(`Delete employee ${id}?`)) {
        return;
    }

    const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        alert('Failed to delete employee');
        return;
    }

    await refreshRoute();
}


export async function assignRoles(id, refreshRoute) {

    const roles = prompt(
        'Enter roles separated by comma'
    );

    if (!roles) {
        return;
    }

    const response = await fetch(
        `/api/employees/${id}/roles`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roleNames: roles
                    .split(',')
                    .map(r => r.trim())
            })
        }
    );

    if (!response.ok) {
        alert('Role update failed');
        return;
    }

    await refreshRoute();
}

export function setupEmployeeManagement(refreshRoute) {

    const createForm = document.getElementById('create-employee-form');

    if (createForm) {
        createForm.addEventListener(
            'submit',
            event => createEmployee(event, refreshRoute)
        );
    }

    document.querySelectorAll('.delete-employee-btn')
        .forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;

                await deleteEmployee(id, refreshRoute);
            });
        });

    document.querySelectorAll('.edit-roles-btn')
        .forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;

                await assignRoles(id, refreshRoute);
            });
        });
}
