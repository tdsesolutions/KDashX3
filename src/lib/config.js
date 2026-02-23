/**
 * KDashX3 Configuration
 */

// Backend API configuration
// HTTPS on port 4443 for production
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:4010' : 'https://104.197.56.55:4443';
export const WS_BASE_URL = isLocal ? 'ws://localhost:4010' : 'wss://104.197.56.55:4443';
