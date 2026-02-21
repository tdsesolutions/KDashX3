/**
 * Routing Brain LLM Interface
 * 
 * Stub implementation with strict JSON schema validation
 * All outputs conform to SPEC_LOCK.md schema
 */

import { store } from '../lib/store.js';

// JSON Schema for RoutingBrainOutput
const RoutingBrainSchema = {
  type: 'object',
  required: [
    'selected_node_id',
    'required_capabilities',
    'provider_preference',
    'fallback_order',
    'output_location',
    'risk_level',
    'approval_required',
    'estimated_tokens',
    'estimated_cost'
  ],
  properties: {
    selected_node_id: { type: 'string' },
    required_capabilities: {
      type: 'array',
      items: { type: 'string' }
    },
    provider_preference: {
      type: 'string',
      enum: ['openai', 'anthropic', 'google', 'local', 'auto']
    },
    fallback_order: {
      type: 'array',
      items: { type: 'string' }
    },
    output_location: {
      type: 'object',
      required: ['type', 'path'],
      properties: {
        type: { type: 'string', enum: ['node_local', 'dashboard_temp'] },
        path: { type: 'string' }
      }
    },
    risk_level: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical']
    },
    approval_required: { type: 'boolean' },
    estimated_tokens: { type: 'number', minimum: 0 },
    estimated_cost: { type: 'number', minimum: 0 }
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
    } else if (schema.type === 'number' && typeof obj !== 'number') {
      errors.push(`Expected number, got ${typeof obj}`);
    } else if (schema.type === 'boolean' && typeof obj !== 'boolean') {
      errors.push(`Expected boolean, got ${typeof obj}`);
    } else if (schema.type === 'object' && (typeof obj !== 'object' || Array.isArray(obj))) {
      errors.push(`Expected object, got ${Array.isArray(obj) ? 'array' : typeof obj}`);
    } else if (!['array', 'number', 'boolean', 'object'].includes(schema.type)) {
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
  
  // Check minimum for numbers
  if (schema.type === 'number' && typeof obj === 'number') {
    if (schema.minimum !== undefined && obj < schema.minimum) {
      errors.push(`Value must be >= ${schema.minimum}`);
    }
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
 * Route a task to the optimal node and provider
 * @param {Object} input
 * @param {string} input.intent - User task description
 * @param {Object} input.context - Available resources
 * @param {Object} [input.constraints] - Optional constraints
 * @returns {Promise<Object>}
 */
export async function routeTask(input) {
  console.log('[RoutingBrain] Routing task:', input.intent);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const { intent, context, constraints } = input;
  const availableNodes = context?.available_nodes || [];
  const configuredProviders = context?.configured_providers || [];
  
  // Validate inputs
  if (!intent || typeof intent !== 'string') {
    throw new Error('Invalid input: intent is required and must be a string');
  }
  
  if (!Array.isArray(availableNodes)) {
    throw new Error('Invalid input: available_nodes must be an array');
  }
  
  if (availableNodes.length === 0) {
    throw new Error('No available nodes for routing');
  }
  
  // Detect required capabilities from intent
  const requiredCapabilities = detectCapabilities(intent);
  
  // Filter nodes by capabilities
  const suitableNodes = availableNodes.filter(node => 
    nodeHasCapabilities(node, requiredCapabilities)
  );
  
  if (suitableNodes.length === 0) {
    throw new Error(`No nodes found with required capabilities: ${requiredCapabilities.join(', ')}`);
  }
  
  // Select best node (prioritize by connection status, then by capabilities match)
  const selectedNode = suitableNodes[0];
  
  // Determine provider preference from intent
  const providerPreference = detectProviderPreference(intent);
  
  // Build fallback order from configured providers
  const fallbackOrder = getFallbackOrder(configuredProviders, providerPreference);
  
  // Determine risk level
  const riskLevel = assessRisk(intent, constraints);
  
  // Build output location
  const outputLocation = {
    type: 'node_local',
    path: `${selectedNode.workspace_path || './outputs'}/task-${Date.now()}`
  };
  
  // Estimate tokens and cost
  const estimatedTokens = estimateTokens(intent);
  const estimatedCost = estimateCost(estimatedTokens, providerPreference);
  
  // Build response
  const response = {
    selected_node_id: selectedNode.id,
    required_capabilities: requiredCapabilities,
    provider_preference: providerPreference,
    fallback_order: fallbackOrder.length > 0 ? fallbackOrder : ['default'],
    output_location: outputLocation,
    risk_level: riskLevel,
    approval_required: riskLevel === 'critical' || riskLevel === 'high',
    estimated_tokens: estimatedTokens,
    estimated_cost: estimatedCost
  };
  
  // Validate response against schema
  const validation = validateSchema(response, RoutingBrainSchema);
  
  if (!validation.valid) {
    console.error('[RoutingBrain] Invalid response schema:', validation.errors);
    throw new Error(`Routing Brain returned invalid data: ${validation.errors.join(', ')}`);
  }
  
  return response;
}

/**
 * Detect required capabilities from intent
 * @param {string} intent
 * @returns {string[]}
 */
function detectCapabilities(intent) {
  const capabilities = [];
  const intentLower = intent.toLowerCase();
  
  // Docker/container detection
  if (/\b(docker|container|containerize|dockerize|kubernetes|k8s)\b/.test(intentLower)) {
    capabilities.push('docker');
  }
  
  // GPU detection
  if (/\b(gpu|cuda|nvidia|amd|rocm|ml|machine learning|deep learning|ai model|training)\b/.test(intentLower)) {
    capabilities.push('gpu');
  }
  
  // Python detection
  if (/\b(python|pip|requirements\.txt|setup\.py|pyproject\.toml|django|flask|fastapi)\b/.test(intentLower)) {
    capabilities.push('python');
  }
  
  // Node.js detection
  if (/\b(node|nodejs|npm|yarn|package\.json|express|react|vue|angular)\b/.test(intentLower)) {
    capabilities.push('nodejs');
  }
  
  // Go detection
  if (/\b(golang|go\.mod|go module)\b/.test(intentLower)) {
    capabilities.push('go');
  }
  
  // Rust detection
  if (/\b(rust|cargo|\.rs)\b/.test(intentLower)) {
    capabilities.push('rust');
  }
  
  // Database detection
  if (/\b(database|postgres|mysql|mongodb|redis|sqlite|sql)\b/.test(intentLower)) {
    capabilities.push('database');
  }
  
  // Web server detection
  if (/\b(server|web server|nginx|apache|http|api|rest|graphql)\b/.test(intentLower)) {
    capabilities.push('web-server');
  }
  
  // Deployment detection
  if (/\b(deploy|deployment|production|release|publish|ci\/cd|pipeline)\b/.test(intentLower)) {
    capabilities.push('deployment');
  }
  
  return capabilities.length > 0 ? capabilities : ['general'];
}

/**
 * Detect provider preference from intent
 * @param {string} intent
 * @returns {string}
 */
function detectProviderPreference(intent) {
  const intentLower = intent.toLowerCase();
  
  if (/\b(openai|gpt-?4|gpt-?3|chatgpt)\b/.test(intentLower)) {
    return 'openai';
  }
  
  if (/\b(anthropic|claude)\b/.test(intentLower)) {
    return 'anthropic';
  }
  
  if (/\b(google|gemini|bard|palm)\b/.test(intentLower)) {
    return 'google';
  }
  
  if (/\b(local|ollama|llama|self-hosted|on-premise)\b/.test(intentLower)) {
    return 'local';
  }
  
  return 'auto';
}

/**
 * Assess risk level from intent and constraints
 * @param {string} intent
 * @param {Object} constraints
 * @returns {string}
 */
function assessRisk(intent, constraints) {
  const intentLower = intent.toLowerCase();
  
  // Critical risk keywords
  const criticalKeywords = ['delete', 'remove', 'drop', 'destroy', 'purge', 'production', 'live', 'main'];
  if (criticalKeywords.some(kw => intentLower.includes(kw))) {
    return 'critical';
  }
  
  // High risk keywords
  const highKeywords = ['deploy', 'push', 'commit', 'merge', 'modify', 'change', 'update', 'migrate'];
  if (highKeywords.some(kw => intentLower.includes(kw))) {
    return 'high';
  }
  
  // Medium risk keywords
  const mediumKeywords = ['create', 'add', 'install', 'build', 'generate', 'setup'];
  if (mediumKeywords.some(kw => intentLower.includes(kw))) {
    return 'medium';
  }
  
  // Check priority from constraints
  if (constraints?.priority === 'critical') {
    return 'critical';
  }
  if (constraints?.priority === 'high') {
    return 'high';
  }
  
  return 'low';
}

/**
 * Estimate token usage for intent
 * @param {string} intent
 * @returns {number}
 */
function estimateTokens(intent) {
  // Rough estimate: 1 token ~ 4 characters for English text
  const baseTokens = Math.ceil(intent.length / 4);
  
  // Add overhead for system prompt, context, response
  const overhead = 1000;
  
  // Minimum estimate
  const minTokens = 500;
  
  return Math.max(minTokens, baseTokens + overhead);
}

/**
 * Estimate cost based on tokens and provider
 * @param {number} tokens
 * @param {string} provider
 * @returns {number}
 */
function estimateCost(tokens, provider) {
  // Rough cost per 1K tokens (input + output)
  const costsPer1K = {
    openai: 0.03,
    anthropic: 0.008,
    google: 0.005,
    local: 0,
    auto: 0.02 // Average
  };
  
  const costPer1K = costsPer1K[provider] || costsPer1K.auto;
  return (tokens / 1000) * costPer1K;
}

/**
 * Check if node has required capabilities
 * @param {Object} node
 * @param {string[]} requiredCapabilities
 * @returns {boolean}
 */
export function nodeHasCapabilities(node, requiredCapabilities) {
  if (!requiredCapabilities || requiredCapabilities.length === 0) {
    return true;
  }
  
  if (!node.capabilities || !Array.isArray(node.capabilities)) {
    return false;
  }
  
  // For 'general' capability, any node matches
  if (requiredCapabilities.includes('general')) {
    return true;
  }
  
  return requiredCapabilities.every(cap => 
    node.capabilities.includes(cap)
  );
}

/**
 * Get fallback provider order
 * @param {Object[]} providers
 * @param {string} preference
 * @returns {string[]}
 */
export function getFallbackOrder(providers, preference) {
  if (!providers || providers.length === 0) {
    return [];
  }
  
  // Filter only configured providers
  const configured = providers.filter(p => p.status === 'configured');
  
  if (configured.length === 0) {
    return [];
  }
  
  // Sort by priority (lower number = higher priority)
  const sorted = [...configured].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  
  // If preference is specified and not 'auto', prioritize matching providers
  if (preference && preference !== 'auto') {
    const preferred = sorted.filter(p => p.type === preference);
    const others = sorted.filter(p => p.type !== preference);
    return [...preferred, ...others].map(p => p.id);
  }
  
  return sorted.map(p => p.id);
}
