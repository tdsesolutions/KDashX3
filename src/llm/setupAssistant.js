/**
 * Setup Assistant LLM Interface
 * 
 * Stub implementation with strict JSON schema validation
 * All outputs conform to SPEC_LOCK.md schema
 */

import { store } from '../lib/store.js';

// JSON Schema for SetupAssistantOutput
const SetupAssistantSchema = {
  type: 'object',
  required: ['next_step', 'missing_requirements', 'node_actions', 'provider_actions', 'user_questions'],
  properties: {
    next_step: {
      type: 'string',
      enum: ['workspace', 'nodes', 'storage', 'providers', 'routing', 'healthChecks', 'complete']
    },
    missing_requirements: {
      type: 'array',
      items: { type: 'string' }
    },
    node_actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['action', 'description'],
        properties: {
          action: { type: 'string' },
          description: { type: 'string' },
          command: { type: 'string' }
        }
      }
    },
    provider_actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['action', 'description'],
        properties: {
          action: { type: 'string' },
          description: { type: 'string' }
        }
      }
    },
    user_questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['question', 'context'],
        properties: {
          question: { type: 'string' },
          context: { type: 'string' },
          required_answer: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Validate object against schema
 * @param {*} obj - Object to validate
 * @param {*} schema - JSON schema
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateSchema(obj, schema) {
  const errors = [];
  
  // Check type
  if (schema.type && typeof obj !== schema.type) {
    if (schema.type === 'array' && !Array.isArray(obj)) {
      errors.push(`Expected array, got ${typeof obj}`);
    } else if (schema.type !== 'array' && typeof obj !== schema.type) {
      errors.push(`Expected ${schema.type}, got ${typeof obj}`);
    }
  }
  
  // Check required fields
  if (schema.required && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const field of schema.required) {
      if (!(field in obj)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check enum
  if (schema.enum && !schema.enum.includes(obj)) {
    errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
  }
  
  // Check array items
  if (schema.type === 'array' && Array.isArray(obj) && schema.items) {
    obj.forEach((item, idx) => {
      const itemValidation = validateSchema(item, schema.items);
      if (!itemValidation.valid) {
        errors.push(`Item ${idx}: ${itemValidation.errors.join(', ')}`);
      }
    });
  }
  
  // Check object properties
  if (schema.properties && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        const propValidation = validateSchema(obj[key], propSchema);
        if (!propValidation.valid) {
          errors.push(`${key}: ${propValidation.errors.join(', ')}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get setup guidance from the assistant
 * @param {Object} input
 * @param {string} input.current_step
 * @param {string[]} input.completed_modules
 * @param {Object} input.user_context
 * @param {string} [input.question]
 * @returns {Promise<Object>}
 */
export async function getSetupGuidance(input) {
  console.log('[SetupAssistant] Processing:', input);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Determine next step based on current state
  const completed = new Set(input.completed_modules || []);
  const modules = ['workspace', 'nodes', 'storage', 'providers', 'routing', 'healthChecks'];
  
  let nextStep = 'complete';
  for (const module of modules) {
    if (!completed.has(module)) {
      nextStep = module;
      break;
    }
  }
  
  // Build response based on current step
  let response;
  
  switch (input.current_step) {
    case 'workspace':
      response = {
        next_step: completed.has('workspace') ? nextStep : 'workspace',
        missing_requirements: completed.has('workspace') ? [] : ['Organization name'],
        node_actions: [],
        provider_actions: [],
        user_questions: completed.has('workspace') ? [] : [{
          question: 'What is your organization name?',
          context: 'This will be displayed in the dashboard',
          required_answer: null
        }]
      };
      break;
      
    case 'nodes':
      response = {
        next_step: completed.has('nodes') ? nextStep : 'nodes',
        missing_requirements: completed.has('nodes') ? [] : ['At least one connected node'],
        node_actions: completed.has('nodes') ? [] : [
          {
            action: 'install_cli',
            description: 'Install the KDashX3 agent on your node',
            command: 'curl -sSL https://kdashx2.ai/install.sh | bash'
          },
          {
            action: 'generate_pairing_token',
            description: 'Click "Add Node" to generate a pairing token'
          }
        ],
        provider_actions: [],
        user_questions: completed.has('nodes') ? [] : [{
          question: 'What type of node are you setting up?',
          context: 'Local machine, cloud VM, or server',
          required_answer: null
        }]
      };
      break;
      
    case 'storage':
      response = {
        next_step: completed.has('storage') ? nextStep : 'storage',
        missing_requirements: completed.has('storage') ? [] : ['Configure allowed folders'],
        node_actions: completed.has('storage') ? [] : [
          {
            action: 'configure_folders',
            description: 'Set allowed output folders on each node'
          }
        ],
        provider_actions: [],
        user_questions: []
      };
      break;
      
    case 'providers':
      response = {
        next_step: completed.has('providers') ? nextStep : 'providers',
        missing_requirements: completed.has('providers') ? [] : ['At least one configured provider'],
        node_actions: [],
        provider_actions: completed.has('providers') ? [] : [
          {
            action: 'configure_provider',
            description: 'Add an LLM provider configuration (API keys stay on node)'
          },
          {
            action: 'test_provider',
            description: 'Test the provider connection'
          }
        ],
        user_questions: []
      };
      break;
      
    case 'routing':
      response = {
        next_step: completed.has('routing') ? nextStep : 'routing',
        missing_requirements: completed.has('routing') ? [] : ['Configure routing defaults'],
        node_actions: [],
        provider_actions: [],
        user_questions: []
      };
      break;
      
    case 'healthChecks':
      response = {
        next_step: 'complete',
        missing_requirements: completed.has('healthChecks') ? [] : ['Run health checks'],
        node_actions: completed.has('healthChecks') ? [] : [
          {
            action: 'run_health_checks',
            description: 'Verify all systems are operational'
          }
        ],
        provider_actions: [],
        user_questions: []
      };
      break;
      
    default:
      response = {
        next_step: 'complete',
        missing_requirements: [],
        node_actions: [],
        provider_actions: [],
        user_questions: []
      };
  }
  
  // Validate response against schema
  const validation = validateSchema(response, SetupAssistantSchema);
  
  if (!validation.valid) {
    console.error('[SetupAssistant] Invalid response schema:', validation.errors);
    throw new Error(`Setup Assistant returned invalid data: ${validation.errors.join(', ')}`);
  }
  
  return response;
}

/**
 * Validate if a setup step can be completed
 * @param {string} module
 * @param {Object} context
 * @returns {Promise<{can_complete: boolean, blockers: string[]}>}
 */
export async function validateStepCompletion(module, context) {
  const blockers = [];
  
  switch (module) {
    case 'nodes':
      if (!context.connected_nodes || context.connected_nodes === 0) {
        blockers.push('At least one node must be connected');
      }
      break;
      
    case 'providers':
      if (!context.has_provider) {
        blockers.push('At least one provider must be configured and tested');
      }
      break;
      
    case 'storage':
      if (!context.allowed_folders || context.allowed_folders.length === 0) {
        blockers.push('At least one allowed folder must be configured');
      }
      break;
      
    case 'healthChecks':
      if (!context.health_checks_passed) {
        blockers.push('All health checks must pass');
      }
      break;
  }
  
  return {
    can_complete: blockers.length === 0,
    blockers
  };
}
