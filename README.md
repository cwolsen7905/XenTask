# XenTask

A self-hosted task management platform built on a PHP microservice architecture with a React frontend. Features workspaces, spaces, Kanban boards, task management, comments, attachments, custom fields, and real-time updates via WebSocket.

## Architecture

XenTask is composed of ten services, each deployable as a Docker container:

```
                        ┌─────────────────┐
                        │  xentask-lander │  Marketing site
                        └─────────────────┘

┌──────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  xentask-fe  │◄──────►│  xentask-api    │◄──────►│ xentask-core    │ (submodule)
│  React SPA   │        │  Main REST API  │        └─────────────────┘
└──────────────┘        └─────────────────┘
       │                        │                  ┌─────────────────┐
       │                        └─────────────────►│     ubcore      │ (submodule)
       ▼                                           └─────────────────┘
┌──────────────┐        ┌─────────────────┐
│xentask-login │        │xentask-admin    │  Admin panel
│  Auth/SSO    │        └─────────────────┘
└──────────────┘        ┌─────────────────┐
                        │xentask-admin-api│  Admin REST API
┌──────────────┐        └─────────────────┘
│xentask-forms │◄──────►┌─────────────────┐
│  Forms UI    │        │xentask-forms-api│  Forms REST API
└──────────────┘        └─────────────────┘

┌──────────────────────┐        ┌─────────────────┐
│xentask-websocket-    │        │ xentask-manage  │  Background tasks
│server  (C / OpenSSL) │        └─────────────────┘
└──────────────────────┘
```

## Services

| Service | Stack | Purpose |
|---|---|---|
| **xentask-fe** | React (CRA), Nginx | Main user-facing SPA — Kanban boards, task views, modals, billing |
| **xentask-api** | PHP, Nginx, Memcache | Primary REST API consumed by the frontend |
| **xentask-login** | PHP, Nginx | Centralized authentication and session management |
| **xentask-admin** | PHP, Nginx | Internal admin panel UI |
| **xentask-admin-api** | PHP, Nginx | REST API backing the admin panel |
| **xentask-forms** | React, Nginx | Standalone embeddable forms UI |
| **xentask-forms-api** | PHP, Nginx | REST API backing the forms service |
| **xentask-lander** | PHP, Nginx | Marketing landing page, pricing, and demo signup |
| **xentask-manage** | PHP | Background jobs and management scripts |
| **xentask-websocket-server** | C, OpenSSL | Real-time WebSocket server for live task updates |

## Submodule Dependencies

All PHP services share two submodules:

| Submodule | Repo | Path |
|---|---|---|
| **ubcore** | [cwolsen7905/ubcore](https://github.com/cwolsen7905/ubcore) | `inc/ubcore` |
| **xentask-core** | [cwolsen7905/xentask-core](https://github.com/cwolsen7905/xentask-core) | `inc/xentask-core` |

`xentask-api` also uses [stripe/stripe-php](https://github.com/stripe/stripe-php) via `inc/stripe-php`.

## Getting Started

### Clone with submodules

```bash
git clone --recurse-submodules https://github.com/cwolsen7905/XenTask.git
```

Or if already cloned:

```bash
git submodule update --init --recursive
```

### Environment Variables

Each service is configured entirely via environment variables injected at runtime (Docker/Kubernetes). The key variables shared across PHP services:

| Variable | Description |
|---|---|
| `DEPLOY_ENV` | Active environment: `DEV`, `STAGING`, or `PROD` |
| `API_HOST` | Hostname of the main API service |
| `LOGIN_HOST` | Hostname of the login service |
| `STRIPE_API_KEY` | Stripe API key (xentask-api only) |
| `SENDGRID_API_KEY` | SendGrid API key for transactional email |

Database and cache connection details are configured in `inc/ubcore/Database.php` and `inc/ubcore/Memcache.php`.

### Build a service

Each service has a `Dockerfile`. Build and run locally:

```bash
cd xentask-api
docker build -t xentask-api .
docker run -e DEPLOY_ENV=DEV -e API_HOST=localhost -p 8080:8080 xentask-api
```

### Kubernetes deployment

Example deployment manifests are included in each service directory (`dev-deploy.yml`, `staging-deploy.yml`, `prod-deploy.yml`) along with matching ingress configs. Update hostnames, image references, and secrets for your cluster before applying.

```bash
kubectl apply -f xentask-api/prod-deploy.yml -f xentask-api/prod-ingress.yml
```

### WebSocket server

The WebSocket server is written in C and requires OpenSSL:

```bash
cd xentask-websocket-server
make
./bin/wss
```

## CI/CD

Each service includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that builds a multi-arch Docker image, pushes to GHCR, and deploys to Kubernetes via `kubectl`. Configure the following secrets in your GitHub repository:

- `KUBECONFIG` — Base64-encoded kubeconfig for your cluster

## Requirements

- PHP 7.4+ (all PHP services)
- MySQL 8+
- Memcached
- Node.js 16+ (xentask-fe, xentask-forms)
- Docker
- GCC + OpenSSL dev headers (xentask-websocket-server)

## License

MIT
