// Export real store for production
// To use local store instead, change this import
export { realStore as store } from './store-real.js';

// Re-export API functions
export { 
  register, 
  login, 
  getMe,
  getWorkspaces,
  createWorkspace,
  createPairingToken,
  getNodes,
  pairNode,
  getTasks,
  createTask,
  getTaskEvents,
  dispatchTask
} from './api-real.js';
