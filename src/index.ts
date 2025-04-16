import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});

// Configuration
const config = {
  port: parseInt(process.env.PORT || '3031', 10),
  tenantId: process.env.TENANT_ID || 'default',
  baseDomain: process.env.BASE_DOMAIN || 'neurallog.app',
  authUrl: process.env.AUTH_URL,
  serverUrl: process.env.SERVER_URL,
  apiVersion: process.env.API_VERSION || 'v1'
};

// Validate required configuration
if (!config.tenantId) {
  logger.error('TENANT_ID environment variable is required');
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI spec
const openApiPath = path.join(__dirname, 'openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec as any));

// Serve OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(openApiPath);
});

// Setup OpenAPI validation
app.use(
  OpenApiValidator.middleware({
    apiSpec: openApiPath,
    validateRequests: true,
    validateResponses: true,
    operationHandlers: false,
  })
);

// Endpoint types
interface EndpointResponse {
  tenantId: string;
  authUrl: string;
  serverUrl: string;
  webUrl: string;
  apiVersion: string;
}

// Construct standard URLs if not provided
function getAuthUrl(): string {
  if (config.authUrl) {
    return config.authUrl;
  }
  return `https://auth.${config.tenantId}.${config.baseDomain}`;
}

function getServerUrl(): string {
  if (config.serverUrl) {
    return config.serverUrl;
  }
  return `https://api.${config.tenantId}.${config.baseDomain}`;
}

function getWebUrl(): string {
  return `https://${config.tenantId}.${config.baseDomain}`;
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tenantId: config.tenantId });
});

app.get('/endpoints', (req, res) => {
  try {
    // Get tenant ID from query parameter or use configured tenant ID
    const tenantId = req.query.tenant as string || config.tenantId;

    // Validate tenant ID
    if (!tenantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Tenant ID is required'
      });
    }

    // Construct response
    const response: EndpointResponse = {
      tenantId: tenantId,
      authUrl: getAuthUrl(),
      serverUrl: getServerUrl(),
      webUrl: getWebUrl(),
      apiVersion: config.apiVersion
    };

    logger.debug('Returning endpoints', { endpoints: response });
    res.json(response);
  } catch (error) {
    logger.error('Error getting endpoints', { error });
    res.status(500).json({
      status: 'error',
      message: 'Failed to get endpoints'
    });
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error', { error: err });
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Start the server if not being imported for testing
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`Endpoint registry for tenant ${config.tenantId} started on port ${config.port}`);
    logger.info(`Auth URL: ${getAuthUrl()}`);
    logger.info(`Server URL: ${getServerUrl()}`);
    logger.info(`Web URL: ${getWebUrl()}`);
    logger.info(`OpenAPI docs available at http://localhost:${config.port}/api-docs`);
  });
}

// Export the app for testing
export default app;
