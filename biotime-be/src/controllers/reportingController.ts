
// src/controllers/reportingController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportingService } from '../services/reportingService';

export class ReportingController {
  static async getTodayReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getTodayReport();
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch today\'s report' 
      });
    }
  }

  static async getWeeklyReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getWeeklyReport();
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch weekly report' 
      });
    }
  }

  static async getMonthlyReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getMonthlyReport();
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch monthly report' 
      });
    }
  }

  static async getAbsenceReasons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date } = request.query as { date?: string };
      
      if (!date) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Date parameter is required (format: YYYY-MM-DD)' 
        });
      }

      const report = await ReportingService.getAbsenceReasons(new Date(date));
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch absence reasons report' 
      });
    }
  }

  static async getRecentAttendance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = request.query as { limit?: string };
      
      const attendanceLimit = limit ? parseInt(limit) : 20;
      
      if (isNaN(attendanceLimit) || attendanceLimit <= 0) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Limit parameter must be a positive number' 
        });
      }

      const report = await ReportingService.getRecentAttendance(attendanceLimit);
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch recent attendance' 
      });
    }
  }

  static async getDepartmentWiseReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getDepartmentWiseTodayReport();
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch department-wise report' 
      });
    }
  }

  static async getEmployeePerformance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getEmployeePerformanceSummary();
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch employee performance report' 
      });
    }
  }
 
  static async getAttendanceTrend(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { days } = request.query as { days?: string };
      
      const trendDays = days ? parseInt(days) : 30;
      
      if (isNaN(trendDays) || trendDays <= 0) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Days parameter must be a positive number' 
        });
      }

      const report = await ReportingService.getAttendanceTrend(trendDays);
      return reply.send({ success: true, data: report });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch attendance trend' 
      });
    }
  }
}
