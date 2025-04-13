import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

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
  const response: EndpointResponse = {
    tenantId: config.tenantId,
    authUrl: getAuthUrl(),
    serverUrl: getServerUrl(),
    webUrl: getWebUrl(),
    apiVersion: config.apiVersion
  };

  logger.debug('Returning endpoints', { endpoints: response });
  res.json(response);
});

// Start server
app.listen(config.port, () => {
  logger.info(`Endpoint registry for tenant ${config.tenantId} started on port ${config.port}`);
  logger.info(`Auth URL: ${getAuthUrl()}`);
  logger.info(`Server URL: ${getServerUrl()}`);
  logger.info(`Web URL: ${getWebUrl()}`);
});
