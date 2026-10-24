import {html, nothing} from 'lit';
import {api} from '../helpers/api.js';
import {SmartBioView} from '../helpers/view.js';

const CREATE_ROLE_OPTIONS = [
    {value: 'Manager', label: 'Manager'},
    {value: 'Cleaner', label: 'Cleaner'},
    {value: 'Admin', label: 'Admin'},
    {value: 'ServiceDesk', label: 'Service Desk'},
];

const EDIT_ROLE_OPTIONS = [
    {value: 'ServiceDesk', label: 'Service Desk'},
    {value: 'Cleaner', label: 'Cleaner'},
    {value: 'Manager', label: 'Manager'},
    {value: 'Admin', label: 'Admin'},
];

export class SmartBioEmployeeManagement extends SmartBioView {
    static properties = {
        employees: {state: true},
        loadFailed: {state: true},
        creating: {state: true},
        createMessage: {state: true},
        editingId: {state: true},
        selectedRoles: {state: true},
        savingRoles: {state: true},
        rolesMessage: {state: true},
    };

    constructor() {
        super();
        this.employees = null;
        this.loadFailed = false;
        this.creating = false;
        this.createMessage = '';
        this.editingId = null;
        this.selectedRoles = [];
        this.savingRoles = false;
        this.rolesMessage = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadEmployees();
    }

    async loadEmployees() {
        try {
            const response = await api('/api/employees');

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            this.employees = await response.json();
            this.loadFailed = false;
        } catch (err) {
            if (this.handleLoadError(err)) return;
            console.error(err);
            this.loadFailed = true;
        }
    }

    async handleCreate(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        this.creating = true;
        this.createMessage = '';

        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: data.get('name'),
                    email: data.get('email'),
                    password: data.get('password'),
                    roleName: data.get('roleName')
                })
            });

            if (!response.ok) {
                const details = await response.text();
                this.createMessage = `Failed creating employee (${response.status}): ${details || response.statusText}`;
                return;
            }

            form.reset();
            await this.loadEmployees();
        } catch (error) {
            console.error('Employee creation failed:', error);
            this.createMessage = `Could not create employee: ${error.message}`;
        } finally {
            this.creating = false;
        }
    }

    async handleDelete(id) {
        if (!confirm(`Delete employee ${id}?`)) {
            return;
        }

        const response = await fetch(`/api/employees/${id}`, {method: 'DELETE'});

        if (!response.ok) {
            alert('Failed to delete employee');
            return;
        }

        await this.loadEmployees();
    }

    openRolesDialog(employee) {
        this.editingId = employee.id;
        this.selectedRoles = [...employee.roleNames];
        this.rolesMessage = '';
        this.querySelector('#edit-roles-dialog').showModal();
    }

    toggleRole(role, checked) {
        this.selectedRoles = checked
            ? [...this.selectedRoles, role]
            : this.selectedRoles.filter(name => name !== role);
    }

    async handleSaveRoles(event) {
        event.preventDefault();
        this.savingRoles = true;
        this.rolesMessage = '';

        try {
            const response = await fetch(`/api/employees/${this.editingId}/roles`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({roleNames: this.selectedRoles})
            });

            if (!response.ok) {
                const details = await response.text();
                this.rolesMessage = `Role update failed (${response.status}): ${details || response.statusText}`;
                return;
            }

            this.querySelector('#edit-roles-dialog').close();
            await this.loadEmployees();
        } catch (error) {
            console.error('Employee role update failed:', error);
            this.rolesMessage = `Could not update employee roles: ${error.message}`;
        } finally {
            this.savingRoles = false;
        }
    }

    renderView() {
        if (this.loadFailed) {
            return html`<div class="alert alert-danger">Failed to load employees.</div>`;
        }

        if (!this.employees) {
            return html`<div class="container py-4"><p>Loading employees...</p></div>`;
        }

        return html`
            <div class="container py-4">

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Employee Management</h1>
                    <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back</a>
                </div>

                <div class="card mb-4">
                    <div class="card-header">Create Employee</div>
                    <div class="card-body">
                        <form id="create-employee-form" @submit=${this.handleCreate}>
                            <div class="mb-3">
                                <label for="employee-name">Name</label>
                                <input class="form-control" id="employee-name" name="name" required>
                            </div>

                            <div class="mb-3">
                                <label for="employee-email">Email</label>
                                <input type="email" class="form-control" id="employee-email" name="email" required>
                            </div>

                            <div class="mb-3">
                                <label for="employee-password">Password</label>
                                <input type="password" class="form-control" id="employee-password" name="password" required>
                            </div>

                            <div class="mb-3">
                                <label for="employee-role">Role</label>
                                <select class="form-select" id="employee-role" name="roleName">
                                    ${CREATE_ROLE_OPTIONS.map(role => html`<option value=${role.value}>${role.label}</option>`)}
                                </select>
                            </div>

                            <button type="submit" class="btn btn-success" ?disabled=${this.creating}>Create Employee</button>

                            <p class="text-danger mt-2 mb-0" role="alert" aria-live="polite">${this.createMessage}</p>
                        </form>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Current Employees</div>
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
                                ${this.employees.map(emp => html`
                                    <tr>
                                        <td>${emp.id}</td>
                                        <td>${emp.name}</td>
                                        <td>${emp.email}</td>
                                        <td>${emp.roleNames.join(', ')}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" @click=${() => this.openRolesDialog(emp)}>Roles</button>
                                            <button class="btn btn-sm btn-outline-danger" @click=${() => this.handleDelete(emp.id)}>Delete</button>
                                        </td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <dialog id="edit-roles-dialog" class="p-0 border-0 rounded shadow">
                    <form id="edit-roles-form" class="p-4" @submit=${this.handleSaveRoles}>
                        <h2 class="h5">Edit employee roles</h2>
                        <p>Select the complete set of roles for this employee.</p>

                        ${EDIT_ROLE_OPTIONS.map(role => html`
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="role-${role.value}" value=${role.value}
                                       .checked=${this.selectedRoles.includes(role.value)}
                                       @change=${event => this.toggleRole(role.value, event.target.checked)}>
                                <label class="form-check-label" for="role-${role.value}">${role.label}</label>
                            </div>
                        `)}

                        <p class="small text-muted mt-3">Roles replace the employee's current roles. Selecting none removes all roles and removes the employee from this staff list.</p>
                        <p class="text-danger mb-3" role="alert" aria-live="polite">${this.rolesMessage}</p>

                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-outline-secondary" @click=${() => this.querySelector('#edit-roles-dialog').close()}>Cancel</button>
                            <button type="submit" class="btn btn-primary" ?disabled=${this.savingRoles}>Save roles</button>
                        </div>
                    </form>
                </dialog>

            </div>
        `;
    }
}

customElements.define('smartbio-employee-management', SmartBioEmployeeManagement);
