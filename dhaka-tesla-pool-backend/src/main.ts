import { createApplication } from './bootstrap.js';
import { loadEnvironment } from './config/environment.js';
import { configuredDatabase } from './database/database.config.js';

loadEnvironment();
if (!configuredDatabase()) throw new Error('Database configuration required; configure backend .env or the existing root .env');
const port = Number(process.env.API_PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid API_PORT');
const app = await createApplication(process.env.DATABASE_URL);
await app.listen(port, process.env.API_HOST ?? '127.0.0.1');
console.info(`api_listening port=${port}`);
