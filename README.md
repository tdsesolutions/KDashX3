# KDashX3 - Mission Control

BYO runtime + BYO API keys dashboard for managing AI agents across distributed nodes.

## Overview

KDashX3 is the next generation of the KDashX command center, redesigned as Mission Control for distributed AI agent orchestration.

## Key Principles

- **BYO Runtime**: Users provide their own compute (VMs, laptops, servers)
- **BYO API Keys**: LLM provider keys stored on user nodes, NOT in the dashboard
- **Distributed**: Nodes connect to dashboard, not the other way around
- **Resumable Setup**: Configuration can be completed incrementally

## Architecture

```
User Browser → KDashX3 Dashboard ← WebSocket → User Nodes (BYO Compute)
                                           ↓
                                    LLM Providers (keys on node)
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

## License

Private - TDS E Solutions
