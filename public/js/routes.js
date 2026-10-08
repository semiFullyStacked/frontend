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
    <li>Check status</li>
    <li>Lookup booking ids</li>
    <li>Close down auditoriums</li>
    </ol></p>`
}

export async function getAuditoriumStatus() {
    try {
        // Fetches single RoomStatusDTO object for auditorium ID 1
        const response = await fetch('/api/auditoriums/1/status');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const aud = await response.json(); // Single object, NOT an array

        return `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h2 mb-0">Status for Auditorium #${aud.id}</h1>
          <a href="#/employee" class="btn btn-outline-secondary btn-sm">← Back</a>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="card-title">${aud.auditoriumName}</h3>
            <p class="card-text">
              <strong>Last Cleaned:</strong> 
              ${aud.lastCleanedAt ? new Date(aud.lastCleanedAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>
    `;
    } catch (error) {
        return `<div class="container py-4"><div class="alert alert-danger">Error fetching auditorium status</div></div>`;
    }
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




