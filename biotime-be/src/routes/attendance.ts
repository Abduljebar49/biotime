// src/routes/attendance.ts
import { FastifyInstance } from 'fastify';
import { AttendanceController } from './attendanceController';

export async function attendanceRoutes(fastify: FastifyInstance) {
  // Basic attendance routes
  fastify.get('/attendance/records', AttendanceController.getAttendanceRecords);
  fastify.get('/attendance/summary', AttendanceController.getAttendanceSummary);
  fastify.get('/attendance/period', AttendanceController.getAttendanceByPeriod);
  fastify.get('/attendance/department-summary', AttendanceController.getDepartmentAttendanceSummary);
  fastify.get('/attendance/employee-monthly/:employeeId', AttendanceController.getEmployeeMonthlySummary);
  
  // Specialized employee status routes
  fastify.get('/attendance/absent', AttendanceController.getAbsentEmployees);
  fastify.get('/attendance/late', AttendanceController.getLateEmployees);
  fastify.get('/attendance/early-leave', AttendanceController.getEarlyLeaveEmployees);
  fastify.get('/attendance/overtime', AttendanceController.getOvertimeEmployees);
  
  // Absence reason analysis
  fastify.get('/attendance/absence-reasons', AttendanceController.getAbsenceReasons);
  
  // Repeated violations monitoring
  fastify.get('/attendance/repeated-violations', AttendanceController.getRepeatedViolations);
  
  // Real-time attendance data
  fastify.get('/attendance/recent-checkins', AttendanceController.getRecentCheckIns);
  
  // Daily, weekly, monthly reports
  fastify.get('/attendance/report/today', AttendanceController.getTodayReport);
  fastify.get('/attendance/report/weekly', AttendanceController.getWeeklyReport);
  fastify.get('/attendance/report/monthly', AttendanceController.getMonthlyReport);
  
  // Comprehensive dashboard endpoints
  fastify.get('/attendance/dashboard/overview', AttendanceController.getDashboardOverview);
  fastify.get('/attendance/dashboard/daily-stats', AttendanceController.getDailyStats);
} 