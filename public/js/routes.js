export function getHomePage() {
    return '<h1> Welcome to SmartBios homepage.</h1> <p>This is the Smartbio home page</p>'
}
export function getProfile() {
    return '<h1> Welcome to Smartbio profile page.</h1> <p>This is for the profile page</p>'
}

export function getEmployeePage() {
    return` <h1> Welcome to the employee page</h1>
    <p>On this page you can do the following actions: 
    <ol>
    <li><a href="#/auditoriumStatus">View auditoriums</a></li>
    <li><a href="#/bookingSearch">Lookup booking ids</a></li>
    <li>Close down auditoriums</li>
    </ol></p>`
}




export async function getAuditoriumStatus() {
    try {
        const response = await fetch('/api/auditoriums');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const auditoriums = await response.json();

        const tableRows = auditoriums.map(aud => `
      <tr>
        <th scope="row">${aud.auditoriumId}</th>
        <td>${aud.auditoriumName}</td>
        <td>${aud.seatCount} seats</td>
        <td>${aud.currentMovieTitle}</td>
        <td>${aud.currentShowingEndsAt}</td>
        <td>
          <span class="badge ${aud.status === 'true' ? 'bg-success' : 'bg-danger'}">
            ${aud.needsCleaning}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-secondary">Details</button>
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
                  ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" class="text-center py-4">No auditoriums found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    } catch (error) {
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

export function getBookingSearch() {
    return `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h4 card-title mb-0">Lookup Booking</h2>
                <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back</a>
              </div>
              <p class="text-muted small">Enter a booking ID to view reservation details.</p>
              
              <form id="search-form">
                <div class="mb-3">
                  <label for="query" class="form-label">Booking ID</label>
                  <input type="number" class="form-control" id="query" name="query" placeholder="e.g. 1042" required />
                </div>
                <button type="submit" class="btn btn-primary w-100">Search Booking</button>
              </form>

              <div id="booking-result" class="mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function getLogin() {
    return `
    <div class="container">
      <h1>Login to SmartBio</h1>
      <p>Please enter your credentials to access your account.</p>
      
      <form id="login-form">
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" placeholder="name@example.com" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn-login">Log In</button>
      </form>
    </div>
  `;
}




