const AI_CONFIG_DEFAULT = {
  provider: 'local',
  openaiApiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  openaiUrl: 'https://api.openai.com/v1/chat/completions',
  geminiApiKey: '',
  geminiUrl: '',
};

const AI_CONFIG = window.AI_CONFIG ? { ...AI_CONFIG_DEFAULT, ...window.AI_CONFIG } : AI_CONFIG_DEFAULT;

function buildProfileSummary(profile) {
  if (!profile) return 'No profile available.';
  return `Species: ${profile.name} (${profile.type})\nFocus: ${profile.productFocus || 'Unknown'}\nSize / Height-Weight: ${profile.sizeInfo || 'Not specified'}\nGenetic changes required: ${profile.geneticChanges || 'Not specified'}\nClimate condition: ${profile.climateCondition || 'Not specified'}\nEnvironment: temperature ${profile.temperature || 'unspecified'}, soil/water ${profile.soilQuality || 'unspecified'}, humidity ${profile.humidity || 'unspecified'}\nMutation notes: ${profile.mutationNotes || 'None'}\nDisease risks: ${profile.diseaseNotes || 'None'}`;
}

function buildAiPrompt(question, profile) {
  const profileSummary = buildProfileSummary(profile);
  const systemMessage = {
    role: 'system',
    content: 'You are a genomic digital twin assistant. Use the provided organism profile and environment data to answer questions about product outcomes, mutation impact, disease risk, and simulation scenarios. Keep answers practical and concise.',
  };
  const userMessage = {
    role: 'user',
    content: `Profile:\n${profileSummary}\n\nQuestion:\n${question}`,
  };
  return [systemMessage, userMessage];
}

async function callOpenAI(question, profile) {
  if (!AI_CONFIG.openaiApiKey) {
    throw new Error('OpenAI API key is not configured in ai-config.js');
  }

  const response = await fetch(AI_CONFIG.openaiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.openaiModel,
      messages: buildAiPrompt(question, profile),
      temperature: 0.7,
      max_tokens: 350,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response.';
}

async function callGemini(question, profile) {
  if (!AI_CONFIG.geminiApiKey || !AI_CONFIG.geminiUrl) {
    throw new Error('Gemini API key or URL is not configured in ai-config.js');
  }

  const response = await fetch(AI_CONFIG.geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.geminiApiKey}`,
    },
    body: JSON.stringify({
      prompt: `${buildProfileSummary(profile)}\n\nQuestion: ${question}`,
      max_output_tokens: 350,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.trim() || 'I could not generate a response.';
}

function localAiResponse(question, profile) {
  const q = question.toLowerCase();
  const lines = [];
  lines.push(`Analyzing ${profile?.name || 'this species'} using local AI fallback.`);

  if (q.includes('yield') || q.includes('product') || q.includes('output')) {
    lines.push(`This assistant estimates product performance based on ${profile?.soilQuality || 'soil/water quality'}, ${profile?.humidity || 'humidity'}, and mutation notes.`);
    if (profile?.type === 'Plant') {
      lines.push('Plants need stable temperature and good nutrition to improve yield.');
    } else {
      lines.push('Animals and aquatic species need balanced nutrition and low disease load to perform well.');
    }
  } else if (q.includes('disease') || q.includes('virus') || q.includes('bacteria')) {
    lines.push(`I see disease risk notes: ${profile?.diseaseNotes || 'none'}. Manage pathogens and improve environment hygiene to lower risk.`);
  } else if (q.includes('mutation') || q.includes('variant') || q.includes('gene editing')) {
    lines.push(`Mutation data: ${profile?.mutationNotes || 'no details provided'}. If mutations are benign, tolerance may improve; if stress-related, outcomes can shift unpredictably.`);
    if (profile?.geneticChanges) {
      lines.push(`Genetic changes required: ${profile.geneticChanges}.`);
    }
  } else if (q.includes('environment') || q.includes('temperature') || q.includes('soil') || q.includes('humidity') || q.includes('climate')) {
    lines.push('Environment and climate are key factors for this digital twin. Use the simulation to test temperature, humidity, and climate conditions.');
    if (profile?.climateCondition) {
      lines.push(`The climate condition specified is ${profile.climateCondition}.`);
    }
  } else {
    lines.push('I can help predict outcomes based on the organism profile and environment. Ask about yield, disease risk, mutation impact, or environment suitability.');
  }

  return lines.join(' ');
}

async function getAiResponse(question, profile, provider = AI_CONFIG.provider) {
  if (!profile) {
    return 'Please select a profile first so the AI assistant has data to work from.';
  }

  if (provider === 'openai') {
    return await callOpenAI(question, profile);
  }

  if (provider === 'gemini') {
    return await callGemini(question, profile);
  }

  return localAiResponse(question, profile);
}

function getAvailableAiProviders() {
  return [
    { value: 'local', label: 'Local AI (free)' },
    { value: 'openai', label: 'OpenAI GPT' },
    { value: 'gemini', label: 'Gemini' },
  ];
}
