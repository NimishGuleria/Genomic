// Authentication system for login and OTP verification
const AUTH_USERS_KEY = 'genomicAuthUsers';
const AUTH_SESSION_KEY = 'genomicAuthSession';
const OTP_STORAGE_KEY = 'genomicOTP';

let currentUser = null;
let otpData = null;

// Initialize
function initAuth() {
  const session = getSession();
  if (session && session.user) {
    currentUser = session.user;
    redirectToApp();
  }
}

function calculateAgeRange(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) return null;
  
  if (age >= 18 && age <= 24) return '18-24';
  if (age >= 25 && age <= 34) return '25-34';
  if (age >= 35 && age <= 44) return '35-44';
  if (age >= 45 && age <= 54) return '45-54';
  if (age >= 55 && age <= 64) return '55-64';
  return '65+';
}

function isAgeVerified(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateShareToken() {
  return btoa(Date.now() + Math.random()).substring(0, 32);
}

function saveUsers(users) {
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users', error);
  }
}

function getUsers() {
  try {
    const json = localStorage.getItem(AUTH_USERS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load users', error);
    return [];
  }
}

function saveSession(user) {
  const session = {
    user: user,
    loginTime: new Date().toISOString(),
  };
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session', error);
  }
}

function getSession() {
  try {
    const json = localStorage.getItem(AUTH_SESSION_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Failed to load session', error);
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session', error);
  }
}

function recordLogin(user) {
  const users = getUsers();
  let existingUser = users.find(u => u.email === user.email);

  if (!existingUser) {
    existingUser = {
      ...user,
      role: user.role || 'user',
      createdAt: new Date().toISOString(),
      loginCount: 0,
      history: [],
    };
    users.push(existingUser);
  } else {
    existingUser.role = existingUser.role || 'user';
  }

  existingUser.loginCount = (existingUser.loginCount || 0) + 1;
  existingUser.lastLogin = new Date().toISOString();

  if (!existingUser.history) {
    existingUser.history = [];
  }

  existingUser.history.push({
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });

  saveUsers(users);
  return existingUser;
}

function redirectToApp() {
  window.location.href = 'index.html';
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

function redirectToAdmin() {
  window.location.href = 'admin.html';
}

// Login page logic
const entryStep = document.getElementById('entry-step');
const signupStep = document.getElementById('signup-step');
const loginStep = document.getElementById('existing-login-step');
const otpStep = document.getElementById('otp-step');
const signupForm = document.getElementById('signup-form');
const loginEmailForm = document.getElementById('login-email-form');
const otpForm = document.getElementById('otp-form');
const accountRoleSelect = document.getElementById('account-role');
const adminCodeField = document.getElementById('admin-code-field');
const backToEntryFromSignup = document.getElementById('back-to-entry-from-signup');
const backToEntryFromLogin = document.getElementById('back-to-entry-from-login');
const backToInfoBtn = document.getElementById('back-to-info');
const resendOtpBtn = document.getElementById('resend-otp');
const otpDestination = document.getElementById('otp-destination');
const btnExistingAccount = document.getElementById('btn-existing-account');
const btnNewAccount = document.getElementById('btn-new-account');
const ADMIN_ACCESS_CODE = 'ADMIN123';

function showStep(stepId) {
  [entryStep, signupStep, loginStep, otpStep].forEach(step => {
    if (!step) return;
    step.classList.toggle('active', step.id === stepId);
  });
}

function findUserByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

if (btnExistingAccount) {
  btnExistingAccount.addEventListener('click', () => showStep('existing-login-step'));
}

if (btnNewAccount) {
  btnNewAccount.addEventListener('click', () => showStep('signup-step'));
}

if (accountRoleSelect) {
  accountRoleSelect.addEventListener('change', () => {
    if (!adminCodeField) return;
    adminCodeField.style.display = accountRoleSelect.value === 'admin' ? 'block' : 'none';
  });
}

if (backToEntryFromSignup) {
  backToEntryFromSignup.addEventListener('click', () => showStep('entry-step'));
}

if (backToEntryFromLogin) {
  backToEntryFromLogin.addEventListener('click', () => showStep('entry-step'));
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('login-name').value.trim();
    const email = document.getElementById('login-email').value.trim();
    const phone = document.getElementById('login-phone').value.trim();
    const dob = document.getElementById('login-dob').value;
    const profession = document.getElementById('login-profession').value.trim();
    const gender = document.getElementById('login-gender').value;
    const country = document.getElementById('login-country').value.trim();
    const verifyMethod = document.querySelector('input[name="verify-method"]:checked').value;
    const role = accountRoleSelect?.value || 'user';
    const adminCode = document.getElementById('admin-code')?.value.trim();

    if (!name || !email || !phone || !dob) {
      alert('Please fill in all required fields');
      return;
    }

    if (role === 'admin' && adminCode !== ADMIN_ACCESS_CODE) {
      alert('Invalid admin access code. Please contact the system administrator.');
      return;
    }

    if (!isAgeVerified(dob)) {
      alert('⚠️ AGE RESTRICTION\n\nYou must be 18 years or older to access this platform.');
      return;
    }

    const otp = generateOTP();
    const ageRange = calculateAgeRange(dob);

    otpData = {
      mode: 'signup',
      origin: 'signup',
      otp: otp,
      name: name,
      email: email,
      phone: phone,
      dob: dob,
      ageRange: ageRange,
      profession: profession,
      gender: gender,
      country: country,
      verifyMethod: verifyMethod,
      role: role,
      timestamp: Date.now(),
    };

    console.log(`OTP sent to ${verifyMethod}: ${otp}`);
    alert(`Demo: OTP is ${otp} (sent to ${verifyMethod === 'email' ? email : phone})`);
    otpDestination.textContent = verifyMethod === 'email' ? email : phone;
    showStep('otp-step');
  });
}

if (loginEmailForm) {
  loginEmailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email-only').value.trim();
    if (!email) {
      alert('Enter your email to receive an OTP.');
      return;
    }

    const existingUser = findUserByEmail(email);
    if (!existingUser) {
      alert('No account found with that email. Please sign up first.');
      return;
    }

    const otp = generateOTP();
    otpData = {
      mode: 'login',
      origin: 'login',
      otp: otp,
      email: email,
      verifyMethod: 'email',
      role: existingUser.role || 'user',
      timestamp: Date.now(),
    };

    console.log(`OTP sent to email: ${otp}`);
    alert(`Demo: OTP is ${otp} (sent to ${email})`);
    otpDestination.textContent = email;
    showStep('otp-step');
  });
}

if (otpForm) {
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputOtp = document.getElementById('otp-input').value.trim();

    if (!otpData) {
      alert('Session expired. Please start again.');
      window.location.reload();
      return;
    }

    if (inputOtp !== otpData.otp) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    if (otpData.mode === 'login') {
      const existingUser = findUserByEmail(otpData.email);
      if (!existingUser) {
        alert('No account found for that email. Please sign up.');
        return;
      }

      const loggedUser = recordLogin(existingUser);
      saveSession(loggedUser);
      if (loggedUser.role === 'admin') {
        redirectToAdmin();
      } else {
        redirectToApp();
      }
      return;
    }

    const user = {
      name: otpData.name,
      email: otpData.email,
      phone: otpData.phone,
      ageRange: otpData.ageRange,
      profession: otpData.profession,
      gender: otpData.gender,
      country: otpData.country,
      role: otpData.role || 'user',
    };

    const savedUser = recordLogin(user);
    saveSession(savedUser);
    if (savedUser.role === 'admin') {
      redirectToAdmin();
    } else {
      redirectToApp();
    }
  });
}

if (backToInfoBtn) {
  backToInfoBtn.addEventListener('click', () => {
    const returnStep = otpData?.origin === 'login' ? 'existing-login-step' : 'signup-step';
    showStep(returnStep);
    otpData = null;
  });
}

if (resendOtpBtn) {
  resendOtpBtn.addEventListener('click', () => {
    if (otpData) {
      const otp = generateOTP();
      otpData.otp = otp;
      console.log(`OTP resent: ${otp}`);
      alert(`Demo: New OTP is ${otp}`);
    }
  });
}

// Initialize on page load
initAuth();
