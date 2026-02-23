/**
 * KDashX3 Configuration
 */

// Backend API configuration
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:4010' : 'http://104.197.56.55:4010';
export const WS_BASE_URL = isLocal ? 'ws://localhost:4010' : 'ws://104.197.56.55:4010';
