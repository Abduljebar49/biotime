import { FastifyInstance } from 'fastify';
import { attendanceRoutes } from './attendance';
import { reportingRoutes } from './reportingDep';

export async function mainRoutes(fastify: FastifyInstance) {
  await fastify.register(attendanceRoutes);
  await fastify.register(reportingRoutes);
}