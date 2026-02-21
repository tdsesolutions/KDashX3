/**
 * Type Schemas
 * 
 * JSDoc type definitions for KDashX3
 * Can be converted to TypeScript .d.ts later
 */

/**
 * @typedef {Object} Node
 * @property {string} id
 * @property {string} name
 * @property {string} pairing_code
 * @property {'pending'|'connected'|'disconnected'|'error'} status
 * @property {string} last_heartbeat - ISO8601
 * @property {string[]} capabilities
 * @property {string} [ip_address]
 * @property {string} version
 * @property {string} workspace_path
 * @property {ProviderConfig[]} providers
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {string} id
 * @property {'openai'|'anthropic'|'google'|'local'|'custom'} type
 * @property {string} endpoint_url
 * @property {'healthy'|'degraded'|'unhealthy'} health_status
 * @property {string} last_health_check - ISO8601
 * @property {number} priority
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} intent
 * @property {'pending'|'routing'|'assigned'|'executing'|'completed'|'failed'} status
 * @property {string|null} assigned_node_id
 * @property {RoutingBrainOutput} routing_decision
 * @property {string} created_at - ISO8601
 * @property {string|null} started_at - ISO8601
 * @property {string|null} completed_at - ISO8601
 * @property {{output: string, artifacts: string[], token_usage: number, cost: number}|null} result
 * @property {string|null} error
 */

/**
 * @typedef {Object} RoutingBrainOutput
 * @property {string} selected_node_id
 * @property {string[]} required_capabilities
 * @property {string} provider_preference
 * @property {string[]} fallback_order
 * @property {{type: string, path: string}} output_location
 * @property {'low'|'medium'|'high'|'critical'} risk_level
 * @property {boolean} approval_required
 * @property {number} estimated_tokens
 * @property {number} estimated_cost
 */

/**
 * @typedef {Object} SetupProgress
 * @property {SetupModuleStatus} workspace
 * @property {SetupModuleStatus} nodes
 * @property {SetupModuleStatus} storage
 * @property {SetupModuleStatus} providers
 * @property {SetupModuleStatus} routing
 * @property {SetupModuleStatus} health_checks
 */

/**
 * @typedef {Object} SetupModuleStatus
 * @property {boolean} completed
 * @property {string} [completed_at] - ISO8601
 * @property {string[]} [pending_actions]
 */

/**
 * @typedef {Object} SetupAssistantOutput
 * @property {string} next_step
 * @property {string[]} missing_requirements
 * @property {NodeAction[]} node_actions
 * @property {ProviderAction[]} provider_actions
 * @property {UserQuestion[]} user_questions
 */

/**
 * @typedef {Object} NodeAction
 * @property {string} action
 * @property {string} description
 * @property {string} [command]
 */

/**
 * @typedef {Object} ProviderAction
 * @property {string} action
 * @property {string} description
 */

/**
 * @typedef {Object} UserQuestion
 * @property {string} question
 * @property {string} context
 * @property {string} [required_answer]
 */

/**
 * @typedef {Object} GateStatus
 * @property {boolean} can_execute_tasks
 * @property {boolean} has_provider_configured
 * @property {string[]} blocks
 */

export {}; // Make this a module
