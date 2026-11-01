import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000
});

// Interceptor to attach custom Gemini API key if stored in localStorage
api.interceptors.request.use((config) => {
  try {
    const savedKey = localStorage.getItem('mystery_gemini_api_key');
    if (savedKey && savedKey.trim() !== '') {
      config.headers['x-gemini-api-key'] = savedKey.trim();
    }
  } catch (e) {
    // ignore localStorage errors in strict sandboxes
  }
  return config;
});

export const mysteryApi = {
  checkHealth: async () => {
    const res = await api.get('/api/health');
    return res.data;
  },

  listRecentCases: async () => {
    const res = await api.get('/api/cases');
    return res.data.cases;
  },

  createCase: async (payload) => {
    const res = await api.post('/api/cases', payload);
    return res.data;
  },

  getCaseById: async (id) => {
    const res = await api.get(`/api/cases/${id}`);
    return res.data.case;
  },

  discoverClue: async (caseId, clueId) => {
    const res = await api.post(`/api/cases/${caseId}/clues/${clueId}/discover`);
    return res.data;
  },

  useHint: async (caseId) => {
    const res = await api.post(`/api/cases/${caseId}/hints`);
    return res.data;
  },

  accuse: async (caseId, suspectId) => {
    const res = await api.post(`/api/cases/${caseId}/accuse`, { suspectId });
    return res.data;
  },

  getCaseResult: async (caseId) => {
    const res = await api.get(`/api/cases/${caseId}/result`);
    return res.data.result;
  }
};
