// Admin dashboard logic
const AUTH_USERS_KEY = 'genomicAuthUsers';
const AUTH_SESSION_KEY = 'genomicAuthSession';
const SHARES_KEY = 'genomicUserShares';

let adminUser = null;
let allUsers = [];
let activeShares = [];

// Check admin access
function initAdmin() {
  const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
  if (!session || !session.user || session.user.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  adminUser = session.user;
  document.getElementById('admin-user-name').textContent = adminUser.name;

  // Load data
  loadAllUsers();
  loadShares();
  setupEventListeners();
  renderUsersTable();
}

function loadAllUsers() {
  try {
    const json = localStorage.getItem(AUTH_USERS_KEY);
    allUsers = json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load users', error);
    allUsers = [];
  }
}

function loadShares() {
  try {
    const json = localStorage.getItem(SHARES_KEY);
    activeShares = json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load shares', error);
    activeShares = [];
  }
}

function saveShares() {
  try {
    localStorage.setItem(SHARES_KEY, JSON.stringify(activeShares));
  } catch (error) {
    console.error('Failed to save shares', error);
  }
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // User search
  const userSearch = document.getElementById('user-search');
  if (userSearch) {
    userSearch.addEventListener('input', filterUsersTable);
  }

  // History selection
  const historySelect = document.getElementById('history-user-select');
  if (historySelect) {
    historySelect.addEventListener('change', showUserHistory);
    populateHistorySelect();
  }

  // Share functionality
  const shareUserSelect = document.getElementById('share-user-select');
  if (shareUserSelect) {
    populateShareSelect();
  }

  const generateShareBtn = document.getElementById('generate-share');
  if (generateShareBtn) {
    generateShareBtn.addEventListener('click', generateShareLink);
  }

  const copyLinkBtn = document.getElementById('copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', copyShareLink);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(AUTH_SESSION_KEY);
      window.location.href = 'login.html';
    });
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function renderUsersTable(usersToRender = allUsers) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (usersToRender.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No user data available</td></tr>';
    return;
  }

  tbody.innerHTML = usersToRender.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.ageRange || 'N/A'}</td>
      <td>${user.profession || 'N/A'}</td>
      <td>${user.country || 'N/A'}</td>
      <td>${new Date(user.lastLogin || user.createdAt).toLocaleString()}</td>
      <td>
        <button class="button secondary small" onclick="viewUserDetails('${user.email}')">Details</button>
      </td>
    </tr>
  `).join('');
}

function filterUsersTable() {
  const query = document.getElementById('user-search').value.toLowerCase();
  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    (user.phone && user.phone.includes(query)) ||
    (user.profession && user.profession.toLowerCase().includes(query)) ||
    (user.country && user.country.toLowerCase().includes(query))
  );
  renderUsersTable(filtered);
}

function populateHistorySelect() {
  const select = document.getElementById('history-user-select');
  select.innerHTML = '<option value="">Select a user to view history</option>';
  allUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user.email;
    option.textContent = `${user.name} (${user.email})`;
    select.appendChild(option);
  });
}

function showUserHistory() {
  const email = document.getElementById('history-user-select').value;
  const container = document.getElementById('history-container');

  if (!email) {
    container.innerHTML = '<p>Select a user to view their login history</p>';
    return;
  }

  const user = allUsers.find(u => u.email === email);
  if (!user || !user.history || user.history.length === 0) {
    container.innerHTML = '<p>No login history available for this user.</p>';
    return;
  }

  container.innerHTML = `
    <div class="history-header">
      <h3>${user.name}</h3>
      <p>Total Logins: ${user.loginCount || user.history.length}</p>
    </div>
    <div class="history-items">
      ${user.history.map((entry, idx) => `
        <div class="history-item">
          <span class="history-index">#${user.history.length - idx}</span>
          <span class="history-time">${new Date(entry.timestamp).toLocaleString()}</span>
          <span class="history-device">${entry.userAgent.substring(0, 50)}...</span>
        </div>
      `).join('')}
    </div>
  `;
}

function populateShareSelect() {
  const select = document.getElementById('share-user-select');
  select.innerHTML = '<option value="">Choose a user</option>';
  allUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user.email;
    option.textContent = `${user.name} (${user.email})`;
    select.appendChild(option);
  });
}

function generateShareToken() {
  return btoa(Date.now() + Math.random()).substring(0, 32);
}

function generateShareLink() {
  const userEmail = document.getElementById('share-user-select').value;
  const shareEmail = document.getElementById('share-email').value.trim();

  if (!userEmail || !shareEmail) {
    alert('Please select a user and enter a recipient email');
    return;
  }

  const user = allUsers.find(u => u.email === userEmail);
  if (!user) {
    alert('User not found');
    return;
  }

  const token = generateShareToken();
  const share = {
    token: token,
    userEmail: userEmail,
    recipientEmail: shareEmail,
    sharedBy: adminUser.email,
    sharedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  activeShares.push(share);
  saveShares();

  const shareUrl = `${window.location.origin}/share.html?token=${token}`;
  document.getElementById('share-link-input').value = shareUrl;
  document.getElementById('share-link-box').style.display = 'block';

  renderActiveShares();
  alert(`Share link created and will be accessible for 7 days`);
}

function copyShareLink() {
  const input = document.getElementById('share-link-input');
  input.select();
  document.execCommand('copy');
  alert('Share link copied to clipboard!');
}

function renderActiveShares() {
  const sharesList = document.getElementById('shares-list');
  if (activeShares.length === 0) {
    sharesList.innerHTML = 'No active shares';
    return;
  }

  sharesList.innerHTML = activeShares.map((share, idx) => `
    <div class="share-item">
      <div class="share-info">
        <strong>${allUsers.find(u => u.email === share.userEmail)?.name || 'Unknown'}</strong>
        → ${share.recipientEmail}
        <br/>
        <small>Shared on ${new Date(share.sharedAt).toLocaleString()}</small>
        <small>Expires: ${new Date(share.expiresAt).toLocaleDateString()}</small>
      </div>
      <button class="button secondary small" onclick="revokeShare(${idx})">Revoke</button>
    </div>
  `).join('');
}

function revokeShare(idx) {
  if (confirm('Revoke this share?')) {
    activeShares.splice(idx, 1);
    saveShares();
    renderActiveShares();
  }
}

function viewUserDetails(email) {
  const user = allUsers.find(u => u.email === email);
  if (user) {
    const details = `${user.name}
Email: ${user.email}
Phone: ${user.phone}
Age Range: ${user.ageRange || 'N/A'}
Profession: ${user.profession || 'N/A'}
Gender: ${user.gender || 'Not specified'}
Location: ${user.country || 'N/A'}
Logins: ${user.loginCount || 1}
Member Since: ${new Date(user.createdAt).toLocaleDateString()}`;
    alert(details);
  }
}

// Initialize on page load
initAdmin();
renderActiveShares();
