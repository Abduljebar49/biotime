// src/routes/reporting.ts
import { FastifyInstance } from 'fastify';
import { ReportingController } from './reportingDepController';

export async function reportingRoutes(fastify: FastifyInstance) {
  // Department routes
  fastify.get('/departments', ReportingController.getAllDepartments);
  fastify.get('/departments/:id', ReportingController.getDepartmentById);
  fastify.get('/departments/:id/attendance-stats', ReportingController.getDepartmentAttendanceStats);
  fastify.get('/departments/:id/employees', ReportingController.getEmployeesByDepartment);
  
  // Employee routes
  fastify.get('/employees', ReportingController.getAllEmployees);
  fastify.get('/employees/:id', ReportingController.getEmployeeById);
  fastify.get('/employees/:id/attendance-summary', ReportingController.getEmployeeAttendanceSummary);
  
  // Report routes
  fastify.get('/reports/department-performance', ReportingController.getDepartmentPerformanceReport);
  fastify.get('/reports/employee-performance', ReportingController.getEmployeePerformanceReport);
  
  // Trend analysis routes
  fastify.get('/employees/:id/attendance-trend', ReportingController.getEmployeeAttendanceTrend);
  fastify.get('/departments/:id/attendance-trend', ReportingController.getDepartmentAttendanceTrend);
  
  // Dashboard route
  fastify.get('/dashboard/reporting', ReportingController.getReportingDashboard);
}