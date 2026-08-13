// app-params.js — Legacy stub. All configuration now via .env.local
// VITE_API_BASE_URL replaces VITE_BASE44_APP_ID / VITE_BASE44_APP_BASE_URL
export const appParams = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
};
