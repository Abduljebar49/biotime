// src/routes/reporting.ts
import { FastifyInstance } from 'fastify';
import { ReportingController } from '../controllers/reportingController';

// src/routes/reportingRoutes.ts
export async function reportingRoutes(fastify: FastifyInstance) {
  fastify.get('/reports/today', ReportingController.getTodayReport);
  fastify.get('/reports/weekly', ReportingController.getWeeklyReport);
  fastify.get('/reports/monthly', ReportingController.getMonthlyReport);
  fastify.get('/reports/absence-reasons', ReportingController.getAbsenceReasons);
  fastify.get('/reports/recent-attendance', ReportingController.getRecentAttendance);
  fastify.get('/reports/department-wise', ReportingController.getDepartmentWiseReport);
  fastify.get('/reports/employee-performance', ReportingController.getEmployeePerformance);
  fastify.get('/reports/attendance-trend', ReportingController.getAttendanceTrend);
}
