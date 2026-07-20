import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for large files + Groq latency
});

export const checkHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const uploadFile = async (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);

  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return res.data;
};

export const analyzeConversation = async (sessionId) => {
  const res = await api.post('/analyze', { session_id: sessionId });
  return res.data;
};
