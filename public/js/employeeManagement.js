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


export async function assignRoles(id, roleNames, refreshRoute, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const message = document.getElementById('edit-roles-message');
    const dialog = document.getElementById('edit-roles-dialog');
    message.textContent = '';
    submitButton.disabled = true;

    try {
        const response = await fetch(`/api/employees/${id}/roles`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roleNames })
        });

        if (!response.ok) {
            const details = await response.text();
            message.textContent = `Role update failed (${response.status}): ${details || response.statusText}`;
            return;
        }

        dialog.close();
        await refreshRoute();
    } catch (error) {
        console.error('Employee role update failed:', error);
        message.textContent = `Could not update employee roles: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
}

export function setupEmployeeManagement(refreshRoute) {

    const createForm = document.getElementById('create-employee-form');

    if (createForm) {
        createForm.addEventListener(
            'submit',
            event => createEmployee(event, refreshRoute)
        );
    }

    const rolesDialog = document.getElementById('edit-roles-dialog');
    const rolesForm = document.getElementById('edit-roles-form');
    const roleCheckboxes = rolesForm.querySelectorAll('input[name="roleNames"]');

    document.getElementById('cancel-role-edit')
        .addEventListener('click', () => rolesDialog.close());

    rolesForm.addEventListener('submit', async event => {
        event.preventDefault();
        const roleNames = Array.from(roleCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        await assignRoles(rolesForm.dataset.employeeId, roleNames, refreshRoute, rolesForm);
    });

    document.querySelectorAll('.delete-employee-btn')
        .forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;

                await deleteEmployee(id, refreshRoute);
            });
        });

    document.querySelectorAll('.edit-roles-btn')
        .forEach(button => {
            button.addEventListener('click', () => {
                const currentRoles = button.dataset.roles.split(',');
                rolesForm.dataset.employeeId = button.dataset.id;
                rolesForm.querySelectorAll('input[name="roleNames"]')
                    .forEach(checkbox => {
                        checkbox.checked = currentRoles.includes(checkbox.value);
                    });
                document.getElementById('edit-roles-message').textContent = '';
                rolesDialog.showModal();
            });
        });
}
