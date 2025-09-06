// src/app.ts
import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyPostgres from '@fastify/postgres';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { AppDataSource } from './config/data-source';
import { mainRoutes } from './routes';
import cors from "@fastify/cors";

const app = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();


app.register(cors, {
  origin: "*", // Allow all origins (for development)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
});

// Register plugins
app.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

// Register Swagger for API documentation
app.register(fastifySwagger, {
  prefix: '/documentation',
  // exposeRoute: true,
  mode: 'dynamic',
  openapi: {
    info: {
      title: 'Healthcare API',
      description: 'API for healthcare management system',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.yourhealthcare.com', description: 'Production' },
    ],
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});


app.register(mainRoutes, { prefix: '/api/v1' });
// app.register(laboratoryRoutes, { prefix: '/api/laboratory' });

app.get('/api/v1/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server listening on port 3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();