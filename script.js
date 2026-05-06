const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const adminLink = document.getElementById('admin-link');
const speciesForm = document.getElementById('species-form');
const speciesSelect = document.getElementById('species-select');
const deleteProfileButton = document.getElementById('delete-profile');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');
const aiProviderSelect = document.getElementById('ai-provider-selector');
const organismType = document.getElementById('organism-type');
const typeSpecificFields = document.getElementById('type-specific-fields');
const productFocus = document.getElementById('product-focus');
const profileDetailsTable = document.getElementById('profile-details-table');
const reportSummary = document.getElementById('report-summary');
const storedDataView = document.getElementById('stored-data-view');
const refreshDataButton = document.getElementById('refresh-data');
const STORAGE_KEY = 'genomicDigitalTwinProfiles';

let profiles = [];

const typeFieldMap = {
  Plant: {
    label: 'Crop / Product Focus',
    placeholder: 'Grain yield, growth habit, pest resistance',
  },
  Human: {
    label: 'Health / Trait Focus',
    placeholder: 'Disease risk, wellness score, personalized trait target',
  },
  Animal: {
    label: 'Animal / Genetic Focus',
    placeholder: 'Growth rate, mutation effect, breeding traits',
  },
  Mammal: {
    label: 'Livestock / Reproductive Focus',
    placeholder: 'Milk/meat yield, fertility, growth rate',
  },
  Bird: {
    label: 'Aviation / Habitat Focus',
    placeholder: 'Flight adaptation, egg production, migration tolerance',
  },
  Reptile: {
    label: 'Reptile / Habitat Focus',
    placeholder: 'Temperature tolerance, growth, genetic mutation effects',
  },
  Amphibian: {
    label: 'Amphibian / Water-Land Focus',
    placeholder: 'Moisture adaptation, lifecycle traits, disease response',
  },
  'Aquatic Animal': {
    label: 'Aquaculture / Water Adaptation',
    placeholder: 'Growth in water quality, fish product output, tolerance',
  },
  Insect: {
    label: 'Behavior / Ecosystem Role',
    placeholder: 'Pollination, pest control, colony productivity',
  },
  Microbe: {
    label: 'Microbe / Mutation Focus',
    placeholder: 'Resistance genes, growth conditions, pathogen behavior',
  },
};

const organismFieldConfig = {
  Plant: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Height', placeholder: 'Height, canopy spread, plant size' },
    { id: 'disease-notes', label: 'Disease / Pest Risks', placeholder: 'Rust, blight, fungal or insect pressure' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Gene edits or bred traits needed' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Temperature zones, rainfall, seasonality' },
    { id: 'temperature', label: 'Temperature Range', placeholder: '20-30°C' },
    { id: 'soil-quality', label: 'Soil Quality', placeholder: 'Loamy, acidic, clay, nutrient rich' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'High, medium, low' },
  ],
  Human: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Height-Weight', placeholder: 'Adult height, weight, body composition' },
    { id: 'disease-notes', label: 'Disease / Health Risks', placeholder: 'Chronic disease, infection, genetic risk' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Gene therapy, mutation correction, editing needs' },
    { id: 'climate-condition', label: 'Climate Sensitivity', placeholder: 'Tolerance to heat, cold, humidity and stress' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Comfort range, seasonality' },
    { id: 'humidity', label: 'Humidity Preferences', placeholder: 'Dry, moderate, humid' },
  ],
  Animal: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Height-Weight', placeholder: 'Body size, weight, growth stage' },
    { id: 'disease-notes', label: 'Disease / Pathogen Risks', placeholder: 'Infections, parasites, herd health' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Breeding traits, gene selection or edits' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Habitat temperature and moisture needs' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Ambient range for species' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Preferred humidity level' },
  ],
  Mammal: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Body Size / Weight', placeholder: 'Weight range, height, body mass' },
    { id: 'disease-notes', label: 'Disease / Health Risks', placeholder: 'Mastitis, respiratory, metabolic disease' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Production or resilience trait edits' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Thermal comfort, shelter, humidity' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Optimal habitat range' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Barn or pasture humidity' },
  ],
  Bird: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Wingspan / Weight', placeholder: 'Wing span, body weight, flight size' },
    { id: 'disease-notes', label: 'Disease / Avian Risks', placeholder: 'Respiratory, avian flu, parasite risk' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Flight adaptation, egg productivity traits' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Roost temperature, humidity, migration climate' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Aviary or habitat range' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Moisture needs for feathers and eggs' },
  ],
  Reptile: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Length', placeholder: 'Body length, mass, scale size' },
    { id: 'disease-notes', label: 'Disease / Reptile Risks', placeholder: 'Skin, metabolic, bacterial infections' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Temperature tolerance, growth traits' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Thermal gradient, humidity, basking needs' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Preferred temperature zones' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Humidity for skin and shedding' },
  ],
  Amphibian: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Growth Stage', placeholder: 'Adult size, larval stage, mass' },
    { id: 'disease-notes', label: 'Disease / Amphibian Risks', placeholder: 'Fungal, bacterial, waterborne pathogens' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Moisture resilience, lifecycle adaptation' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Wet-dry cycles, moisture balance' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Aquatic/terrestrial range' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Moisture for skin and habitat' },
  ],
  'Aquatic Animal': [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Weight', placeholder: 'Length, mass, growth stage' },
    { id: 'disease-notes', label: 'Disease / Aquatic Risks', placeholder: 'Waterborne pathogens, parasites' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Oxygen tolerance, growth efficiency' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Water temperature, salinity, oxygen' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Optimal water temperature' },
    { id: 'humidity', label: 'Water Quality', placeholder: 'Oxygen, pH, clarity' },
  ],
  Insect: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Size / Morphology', placeholder: 'Body size, wing length, caste' },
    { id: 'disease-notes', label: 'Disease / Insect Risks', placeholder: 'Colony collapse, fungal, viral threats' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Behavior, pheromone, resistance traits' },
    { id: 'climate-condition', label: 'Climate Condition', placeholder: 'Temperature and humidity for development' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Developmental range' },
    { id: 'humidity', label: 'Humidity Conditions', placeholder: 'Moisture needs for lifecycle' },
  ],
  Microbe: [
    { id: 'product-focus' },
    { id: 'size-info', label: 'Growth Form / Size', placeholder: 'Colony size, culture density' },
    { id: 'disease-notes', label: 'Risk / Pathogen Notes', placeholder: 'Resistance, virulence, contamination' },
    { id: 'genetic-changes', label: 'Genetic Changes Required', placeholder: 'Resistance genes, metabolic edits' },
    { id: 'climate-condition', label: 'Culture Condition', placeholder: 'Temperature, media, humidity for growth' },
    { id: 'temperature', label: 'Temperature Range', placeholder: 'Incubation range' },
    { id: 'humidity', label: 'Media / Moisture', placeholder: 'Growth medium conditions' },
  ],
};

function buildFieldMarkup(field) {
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  label.setAttribute('for', field.id);
  label.textContent = field.label || field.id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  wrapper.appendChild(label);
  const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  input.id = field.id;
  input.placeholder = field.placeholder || '';
  if (field.type !== 'textarea') input.type = field.type || 'text';
  if (field.type === 'textarea') input.rows = field.rows || 2;
  wrapper.appendChild(input);
  return wrapper;
}

function updateTypeSpecificField() {
  if (!organismType || !typeSpecificFields) return;
  const type = organismType.value;
  const typeConfig = organismFieldConfig[type] || organismFieldConfig.Plant;
  typeSpecificFields.innerHTML = '';
  typeConfig.forEach(field => {
    const fieldElement = buildFieldMarkup(field);
    typeSpecificFields.appendChild(fieldElement);
  });
  const focusConfig = typeFieldMap[type] || typeFieldMap.Plant;
  const focusLabel = typeSpecificFields.querySelector('label[for="product-focus"]');
  const focusInput = document.getElementById('product-focus');
  if (focusLabel) focusLabel.textContent = focusConfig.label;
  if (focusInput) focusInput.placeholder = focusConfig.placeholder;
}

function updateProfileOptions() {
  if (!speciesSelect) return;
  speciesSelect.innerHTML = '<option value="">Select a saved profile</option>';
  profiles.forEach((profile, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${profile.name} (${profile.type})`;
    speciesSelect.appendChild(option);
  });
}

function saveProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.warn('Unable to save profiles in localStorage.', error);
  }
}

function loadProfiles() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return;
    const loaded = JSON.parse(json);
    if (Array.isArray(loaded)) {
      profiles = loaded;
    }
  } catch (error) {
    console.warn('Unable to load profiles from localStorage.', error);
  }
}

function renderStoredData() {
  if (!storedDataView) return;
  if (!profiles.length) {
    storedDataView.textContent = 'No saved data yet. Save a profile to view stored JSON.';
    return;
  }
  storedDataView.textContent = JSON.stringify(profiles, null, 2);
}

function updateProfileDetails(profile) {
  if (!profileDetailsTable) return;
  if (!profile) {
    profileDetailsTable.innerHTML = '<tbody><tr><td>No profile loaded.</td></tr></tbody>';
    return;
  }
  const fields = [
    { label: 'Species', value: profile.name },
    { label: 'Category', value: profile.type },
    { label: 'Trait Focus', value: profile.productFocus },
    { label: 'Size / Height-Weight', value: profile.sizeInfo },
    { label: 'Disease / Risk Notes', value: profile.diseaseNotes },
    { label: 'Genetic Changes Required', value: profile.geneticChanges },
    { label: 'Climate Condition', value: profile.climateCondition },
    { label: 'Temperature', value: profile.temperature },
    { label: 'Soil / Water Quality', value: profile.soilQuality },
    { label: 'Humidity', value: profile.humidity },
    { label: 'Mutation / Variant Notes', value: profile.mutationNotes },
  ];

  const rows = fields
    .filter(field => field.value && field.value.trim())
    .map(field => `<tr><td><strong>${field.label}</strong></td><td>${field.value}</td></tr>`)
    .join('');

  profileDetailsTable.innerHTML = `<tbody>${rows || '<tr><td>No profile details available.</td></tr>'}</tbody>`;
}

function appendMessage(role, text) {
  if (!chatWindow) return;
  const message = document.createElement('div');
  message.className = `chat-message ${role}`;
  const content = document.createElement('span');
  content.textContent = text;
  message.appendChild(content);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getActiveProfile() {
  if (!speciesSelect) return null;
  const index = speciesSelect.value;
  return profiles[Number(index)] || null;
}

function updateReport(profile, extraNote = '') {
  if (!reportSummary) return;
  if (!profile) {
    reportSummary.innerHTML = '<p>No profile selected yet. Save a species profile to view the compiled report.</p>';
    return;
  }

  const report = [
    `<li><strong>Species:</strong> ${profile.name} (${profile.type})</li>`,
    `<li><strong>Focus:</strong> ${profile.productFocus || 'Unknown focus'}</li>`,
    `<li><strong>Size / Height-Weight:</strong> ${profile.sizeInfo || 'Not specified'}</li>`,
    `<li><strong>Genetic Changes Required:</strong> ${profile.geneticChanges || 'None specified'}</li>`,
    `<li><strong>Climate Condition:</strong> ${profile.climateCondition || 'Not specified'}</li>`,
    `<li><strong>Environment:</strong> temperature ${profile.temperature || 'unspecified'}, soil/water ${profile.soilQuality || 'unspecified'}, humidity ${profile.humidity || 'unspecified'}</li>`,
    `<li><strong>Mutation / Variant Notes:</strong> ${profile.mutationNotes || 'None'}</li>`,
    `<li><strong>Disease / Pathogen Risks:</strong> ${profile.diseaseNotes || 'None'}</li>`,
  ];

  let prediction = 'The digital twin compiles this species and environment data to estimate likely success and product outcome.';
  if (profile.type === 'Plant') {
    prediction = 'Plant outcomes depend on stable climate, nutrient-rich soil, and disease management. Good conditions support higher yield and resistance.';
  } else if (profile.type === 'Human') {
    prediction = 'Human outcome reports are focused on genetic risk, health score, and adaptive response to the environment and disease factors.';
  } else if (profile.type === 'Animal') {
    prediction = 'Animal reports emphasize genetics, mutation effects, reproduction, and product performance in the chosen environment.';
  } else if (profile.type === 'Mammal') {
    prediction = 'Mammal success estimates depend on nutrition, pathogen control, and reproductive health when generating animal products.';
  } else if (profile.type === 'Bird') {
    prediction = 'Bird outcomes are influenced by habitat, temperature shifts, and genetic adaptation for breeding or flight traits.';
  } else if (profile.type === 'Reptile') {
    prediction = 'Reptile performance is sensitive to temperature, humidity, and genetic mutations that affect growth and survival.';
  } else if (profile.type === 'Amphibian') {
    prediction = 'Amphibian outcomes require balanced water-land habitat conditions and resilience against pathogens.';
  } else if (profile.type === 'Aquatic Animal') {
    prediction = 'Aquatic species require proper water quality, oxygen levels, and pathogen monitoring for strong production performance.';
  } else if (profile.type === 'Insect') {
    prediction = 'Insect outcomes track ecosystem fit, habitat moisture, and disease pressure for population and product productivity.';
  } else if (profile.type === 'Microbe') {
    prediction = 'Microbe reports focus on resistance traits, mutation behavior, and environment-specific growth conditions.';
  }

  if (extraNote) {
    prediction += ` ${extraNote}`;
  }

  reportSummary.innerHTML = `
    <p><strong>Compiled Report</strong></p>
    <ul>${report.join('')}</ul>
    <p>${prediction}</p>
  `;
}

function generateResponse(question, profile) {
  const q = question.toLowerCase();
  const lines = [];

  lines.push(`Analyzing ${profile.name} as a ${profile.type} in ${profile.temperature || 'the defined environment'}.`);

  if (q.includes('yield') || q.includes('product')) {
    lines.push(`This digital twin estimates product success based on ${profile.soilQuality || 'soil quality'}, ${profile.humidity || 'humidity'}, and genetic traits.`);
    if (profile.type === 'Plant') {
      lines.push('For plant species, a healthy environment with stable temperature and rich quality is likely to improve yield.');
    } else {
      lines.push('For an animal species, nutrient-rich conditions and low disease risk support healthier growth and product output.');
    }
  } else if (q.includes('disease') || q.includes('virus') || q.includes('bacteria')) {
    lines.push(`The twin flags ${profile.diseaseNotes || 'potential pathogen risks'} and recommends close monitoring of infection vectors.`);
    lines.push('A controlled environment with proper hygiene will reduce disease impact and improve outcome reliability.');
  } else if (q.includes('mutation') || q.includes('variant') || q.includes('gene editing')) {
    lines.push(`Mutation notes show: ${profile.mutationNotes || 'no specific variant information provided'}.`);
    lines.push('The digital twin predicts that gene changes may alter adaptation, stress tolerance, and product characteristics.');
  } else if (q.includes('environment') || q.includes('temperature') || q.includes('soil') || q.includes('humidity')) {
    lines.push('The model suggests environment is a key driver for the species.');
    lines.push(`Current conditions: temperature ${profile.temperature || 'unknown'}, soil ${profile.soilQuality || 'unknown'}, humidity ${profile.humidity || 'unknown'}.`);
    lines.push('Adjusting these variables in simulation will show how much each factor changes outcome risk.');
  } else {
    lines.push('The digital twin interprets the scenario and assesses the probable result based on species traits and environment.');
    lines.push('Try asking about yield, disease risk, mutation impact, or environment suitability for a more focused prediction.');
  }

  return lines.join(' ');
}

function clearForm() {
  if (!speciesForm) return;
  speciesForm.reset();
}

function saveProfile(event) {
  event.preventDefault();
  if (!speciesForm) return;

  const profile = {
    name: document.getElementById('species-name').value.trim(),
    type: document.getElementById('organism-type').value,
    description: document.getElementById('species-description').value.trim(),
    productFocus: document.getElementById('product-focus').value.trim(),
    sizeInfo: document.getElementById('size-info')?.value.trim() || '',
    geneticChanges: document.getElementById('genetic-changes')?.value.trim() || '',
    climateCondition: document.getElementById('climate-condition')?.value.trim() || '',
    temperature: document.getElementById('temperature').value.trim(),
    soilQuality: document.getElementById('soil-quality').value.trim(),
    humidity: document.getElementById('humidity').value.trim(),
    mutationNotes: document.getElementById('mutation-notes').value.trim(),
    diseaseNotes: document.getElementById('disease-notes').value.trim(),
  };

  if (!profile.name) {
    appendMessage('bot', 'Please provide a species name before saving the profile.');
    return;
  }

  profiles.push(profile);
  updateProfileOptions();
  saveProfiles();
  renderStoredData();
  if (speciesSelect) {
    speciesSelect.value = String(profiles.length - 1);
  }
  updateReport(profile, 'This profile is now active and ready for experiment prediction.');
  updateProfileDetails(profile);
  clearForm();
  appendMessage('bot', `Species profile for ${profile.name} has been saved and activated. Ask the digital twin about possible outcomes.`);
}

async function handleChat(event) {
  event.preventDefault();
  if (!chatInput) return;

  const question = chatInput.value.trim();
  if (!question) return;

  appendMessage('user', question);

  const profile = getActiveProfile();
  if (!profile) {
    appendMessage('bot', 'Select a saved species profile first so the digital twin can answer based on that data.');
    chatInput.value = '';
    return;
  }

  appendMessage('bot', 'AI assistant is processing your question...');
  try {
    const provider = aiProviderSelect?.value || 'local';
    const answer = await getAiResponse(question, profile, provider);
    appendMessage('bot', answer);
  } catch (error) {
    appendMessage('bot', `AI error: ${error.message}`);
  }

  chatInput.value = '';
}

function removeProfile() {
  const active = getActiveProfile();
  if (!active) {
    appendMessage('bot', 'Choose a saved profile to remove it.');
    return;
  }

  const index = Number(speciesSelect.value);
  profiles.splice(index, 1);
  updateProfileOptions();
  saveProfiles();
  renderStoredData();
  updateReport(null);
  updateProfileDetails(null);
  appendMessage('bot', `Removed profile for ${active.name}. Create another profile to continue experimenting.`);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
  });
}

// Check authentication
function checkAuth() {
  const session = JSON.parse(localStorage.getItem('genomicAuthSession') || 'null');
  if (!session || !session.user) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

function initializeAuthUI() {
  const session = JSON.parse(localStorage.getItem('genomicAuthSession') || 'null');
  if (session && session.user) {
    if (userDisplay) userDisplay.textContent = `Welcome, ${session.user.name} (${session.user.role === 'admin' ? 'Admin' : 'User'})`;
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('genomicAuthSession');
        window.location.href = 'login.html';
      });
    }
    if (adminLink) {
      adminLink.style.display = session.user.role === 'admin' ? 'block' : 'none';
    }
  } else {
    if (userDisplay) userDisplay.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

checkAuth();
initializeAuthUI();

if (speciesForm) {
  speciesForm.addEventListener('submit', saveProfile);
}

if (organismType) {
  organismType.addEventListener('change', updateTypeSpecificField);
}

if (aiProviderSelect) {
  aiProviderSelect.addEventListener('change', () => {
    localStorage.setItem('genomicAiProvider', aiProviderSelect.value);
  });
  const savedProvider = localStorage.getItem('genomicAiProvider');
  if (savedProvider) {
    aiProviderSelect.value = savedProvider;
  }
}

if (speciesSelect) {
  speciesSelect.addEventListener('change', () => {
    const profile = getActiveProfile();
    updateReport(profile);
    updateProfileDetails(profile);
  });
}

if (chatForm) {
  chatForm.addEventListener('submit', handleChat);
}

if (deleteProfileButton) {
  deleteProfileButton.addEventListener('click', removeProfile);
}

if (refreshDataButton) {
  refreshDataButton.addEventListener('click', renderStoredData);
}

loadProfiles();
updateProfileOptions();
renderStoredData();
updateTypeSpecificField();
updateReport(null);
appendMessage('bot', 'Welcome to the Digital Twin Lab. Save a species profile and ask the chatbot about possible outcomes for your experiment.');
