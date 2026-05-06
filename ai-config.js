// AI configuration for the genomic lab.
// Set provider to 'local' for free local AI fallback.
// Use 'openai' or 'gemini' if you want a real external model and supply a valid API key.

window.AI_CONFIG = {
  provider: 'local',
  openaiApiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  openaiUrl: 'https://api.openai.com/v1/chat/completions',
  geminiApiKey: '',
  geminiUrl: '',
};
