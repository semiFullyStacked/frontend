import {html} from 'lit';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioEmployeePage extends SmartBioView {
    renderView() {
        return html`
            <div class="container py-4">
                <div class="mb-4">
                    <h1 class="h2 mb-1">Employee Hub</h1>
                    <p class="text-muted mb-0">Choose what you'd like to do.</p>
                </div>

                <div class="row g-3">
                    <div class="col-md-4">
                        <a href="#/auditoriumStatus" class="card h-100 shadow-sm border-0 text-decoration-none">
                            <div class="card-body">
                                <h2 class="h5 card-title">View auditoriums</h2>
                                <p class="card-text text-muted mb-0">See live hall status and mark halls as cleaned.</p>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="#/bookingSearch" class="card h-100 shadow-sm border-0 text-decoration-none">
                            <div class="card-body">
                                <h2 class="h5 card-title">Look up bookings</h2>
                                <p class="card-text text-muted mb-0">Find a booking by its ID.</p>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="#/employeeManagement" class="card h-100 shadow-sm border-0 text-decoration-none">
                            <div class="card-body">
                                <h2 class="h5 card-title">Manage employees</h2>
                                <p class="card-text text-muted mb-0">Add, edit and remove staff accounts.</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('smartbio-employee-page', SmartBioEmployeePage);
