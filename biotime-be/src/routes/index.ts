import { FastifyInstance } from 'fastify';
import { attendanceRoutes } from './attendance';
import { reportingRoutes as employeeDepRoutes } from './reportingDep';
import { reportingRoutes } from './reporting';

export async function mainRoutes(fastify: FastifyInstance) {
  await fastify.register(attendanceRoutes);
  await fastify.register(reportingRoutes);
  await fastify.register(employeeDepRoutes);
}