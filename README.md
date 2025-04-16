# NeuralLog Endpoint Registry

The Endpoint Registry is a tenant-isolated service that provides standardized endpoint URLs for NeuralLog services. Each tenant has its own registry instance that serves the endpoints specific to that tenant.

## Overview

The registry provides a simple API for discovering service endpoints:

- Auth Service URL
- Server URL
- Web URL
- API Version

These endpoints follow standardized patterns based on the tenant ID, but can be overridden with environment variables if needed.

## Standard URL Patterns

- Auth Service: `https://auth.{tenantId}.neurallog.app`
- Server: `https://api.{tenantId}.neurallog.app`
- Web: `https://{tenantId}.neurallog.app`

## API

### GET /endpoints

Returns the endpoints for the tenant.

**Response:**

```json
{
  "tenantId": "tenant-name",
  "authUrl": "https://auth.tenant-name.neurallog.app",
  "serverUrl": "https://api.tenant-name.neurallog.app",
  "webUrl": "https://tenant-name.neurallog.app",
  "apiVersion": "v1"
}
```

### GET /health

Returns the health status of the registry.

**Response:**

```json
{
  "status": "ok",
  "tenantId": "tenant-name"
}
```

## Configuration

The registry is configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| TENANT_ID | The tenant ID (required) | - |
| PORT | The port to listen on | 3031 |
| BASE_DOMAIN | The base domain for URLs | neurallog.app |
| API_VERSION | The API version | v1 |
| AUTH_URL | Override the auth service URL | - |
| SERVER_URL | Override the server URL | - |
| LOG_LEVEL | Logging level | info |

## Development

### Prerequisites

- Node.js 22 or later
- npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`

### Running Locally

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Docker

Build the Docker image:

```bash
# Build TypeScript first
npm run build

# Build Docker image
docker build -t neurallog/registry:latest .
```

Run the Docker container:

```bash
docker run -p 3031:3031 -e TENANT_ID=tenant-name neurallog/registry:latest
```

### Local Testing with Docker Compose

For local testing, you can use the provided Docker Compose configuration:

```bash
# Start the registry service
./start-registry.ps1

# Stop the registry service
./stop-registry.ps1
```

This will start a registry service at http://localhost:3031 with the following configuration:

- Tenant ID: test-tenant
- Auth URL: http://localhost:3000
- Server URL: http://localhost:3030
- Base Domain: localhost

You can test the registry by visiting http://localhost:3031/endpoints

## Integration with NeuralLogClient

The NeuralLogClient can use the registry to discover endpoints:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create client with tenant ID
const client = new NeuralLogClient({
  tenantId: 'tenant-name'
});

// Initialize client (this will fetch endpoints from the registry)
await client.initialize();

// Now the client has the correct endpoints for this tenant
await client.authenticateWithApiKey('your-api-key');
```

### Testing with Local Registry

For local testing, you can specify the registry URL:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create client with tenant ID and local registry URL
const client = new NeuralLogClient({
  tenantId: 'test-tenant',
  registryUrl: 'http://localhost:3031'
});

// Initialize client (this will fetch endpoints from the local registry)
await client.initialize();

// Now the client has the correct endpoints for local testing
// (http://localhost:3000 for auth and http://localhost:3030 for server)
await client.authenticateWithApiKey('your-api-key');
```

You can run the provided test script to verify the registry integration:

```bash
# In the typescript-client-sdk directory
./test-registry.ps1
```

## Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [API Reference](./docs/api.md)
- [Configuration](./docs/configuration.md)
- [Architecture](./docs/architecture.md)
- [Examples](./docs/examples)

For integration guides and tutorials, visit the [NeuralLog Documentation Site](https://neurallog.github.io/docs/).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Related NeuralLog Components

- [NeuralLog Auth](https://github.com/NeuralLog/auth) - Authentication and authorization
- [NeuralLog Server](https://github.com/NeuralLog/server) - Core server functionality
- [NeuralLog Web](https://github.com/NeuralLog/web) - Web interface components
- [NeuralLog TypeScript Client SDK](https://github.com/NeuralLog/typescript-client-sdk) - TypeScript client SDK

## License

MIT
