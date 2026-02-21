// API Configuration
// In production, this should be environment-specific
export const API_BASE_URL = 'http://104.197.56.55:3001';
//export const API_BASE_URL = 'http://localhost:3001';

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
