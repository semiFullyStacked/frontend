import {HttpError, api} from "../helpers/api.js";

export async function getEmployeeManagement() {
    try {
        const response = await api('/api/employees');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const employees = await response.json();

        const rows = employees.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.email}</td>
                <td>${emp.roleNames.join(', ')}</td>
                <td>
                    <button
                        class="btn btn-sm btn-outline-primary edit-roles-btn"
                        data-id="${emp.id}"
                        data-roles="${emp.roleNames.join(',')}">
                        Roles
                    </button>

                    <button
                        class="btn btn-sm btn-outline-danger delete-employee-btn"
                        data-id="${emp.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');

        return `
        <div class="container py-4">

            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>Employee Management</h1>
                <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back</a>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    Create Employee
                </div>

                <div class="card-body">

                    <form id="create-employee-form">

                        <div class="mb-3">
                            <label>Name</label>
                            <input
                                class="form-control"
                                id="employee-name"
                                required>
                        </div>

                        <div class="mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                class="form-control"
                                id="employee-email"
                                required>
                        </div>

                        <div class="mb-3">
                            <label>Password</label>
                            <input
                                type="password"
                                class="form-control"
                                id="employee-password"
                                required>
                        </div>

                        <div class="mb-3">
                            <label>Role</label>
                            <select
                                class="form-select"
                                id="employee-role">

                                <option value="Manager">Manager</option>
                                <option value="Cleaner">Cleaner</option>
                                <option value="Admin">Admin</option>
                                <option value="ServiceDesk">Service Desk</option>
                            

                            </select>
                        </div>

                        <button
                            type="submit"
                            class="btn btn-success">
                            Create Employee
                        </button>

                        <p id="employee-form-message" class="text-danger mt-2 mb-0" role="alert" aria-live="polite"></p>

                    </form>

                </div>
            </div>

            <div class="card">

                <div class="card-header">
                    Current Employees
                </div>

                <div class="card-body">

                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${rows}
                        </tbody>

                    </table>

                </div>

            </div>

            <dialog id="edit-roles-dialog" class="p-0 border-0 rounded shadow">
                <form id="edit-roles-form" class="p-4">
                    <h2 class="h5">Edit employee roles</h2>
                    <p>Select the complete set of roles for this employee.</p>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="roleNames" value="ServiceDesk" id="role-service-desk">
                        <label class="form-check-label" for="role-service-desk">Service Desk</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="roleNames" value="Cleaner" id="role-cleaner">
                        <label class="form-check-label" for="role-cleaner">Cleaner</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="roleNames" value="Manager" id="role-manager">
                        <label class="form-check-label" for="role-manager">Manager</label>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" name="roleNames" value="Admin" id="role-admin">
                        <label class="form-check-label" for="role-admin">Admin</label>
                    </div>

                    <p class="small text-muted">Roles replace the employee's current roles. Selecting none removes all roles and removes the employee from this staff list.</p>
                    <p id="edit-roles-message" class="text-danger mb-3" role="alert" aria-live="polite"></p>

                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" id="cancel-role-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save roles</button>
                    </div>
                </form>
            </dialog>

        </div>
        `;

    } catch (err) {

        if (err instanceof HttpError) throw err;
        console.error(err);
        {
            return `
            <div class="alert alert-danger">
                Failed to load employees.
            </div>
        `;
        }
    }
}


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
            body: JSON.stringify({roleNames})
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
