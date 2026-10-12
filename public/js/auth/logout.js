export function getLogout() {
    return `
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow-sm border-0">
                <div class="card-body p-4 text-center">
                    <h1 class="h3 mb-4 fw-bold">Logout</h1>
                    <p class="text-muted mb-4">Are you sure you want to sign out?</p>
                    <p id="logout-error" class="text-danger" hidden>Logout failed. Please try again.</p>
                    <div class="d-grid">
                        <button type="button" id="logout-submit" class="btn btn-primary">Sign out</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}