// src/controllers/attendanceController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { AttendanceService } from '../services/attendanceService';
import { attendanceQuerySchema } from '../config/schemas/attendance';

export class AttendanceController {
  static async getAttendanceRecords(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedParams = attendanceQuerySchema.parse(request.query);
      const { employeeId, departmentId, startDate, endDate } = validatedParams;
      
      const filters = {
        employeeId,
        departmentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
      
      const records = await AttendanceService.getAttendanceRecords(filters);
      return reply.send({ success: true, data: records });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getAttendanceSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedParams = attendanceQuerySchema.parse(request.query);
      const { departmentId, startDate, endDate } = validatedParams;
      
      const filters = {
        departmentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
      
      const summary = await AttendanceService.getAttendanceSummary(filters);
      return reply.send({ success: true, data: summary });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getAbsentEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as { 
        date: string; 
        departmentId?: number 
      };
      
      if (!date) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Date parameter is required' 
        });
      }
      
      const absentEmployees = await AttendanceService.getAbsentEmployees(
        new Date(date),
        departmentId
      );
      
      return reply.send({ success: true, data: absentEmployees });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getLateEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as { 
        date: string; 
        departmentId?: number 
      };
      
      if (!date) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Date parameter is required' 
        });
      }
      
      const lateEmployees = await AttendanceService.getLateEmployees(
        new Date(date),
        departmentId
      );
      
      return reply.send({ success: true, data: lateEmployees });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getEarlyLeaveEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as { 
        date: string; 
        departmentId?: number 
      };
      
      if (!date) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Date parameter is required' 
        });
      }
      
      const earlyLeaveEmployees = await AttendanceService.getEarlyLeaveEmployees(
        new Date(date),
        departmentId
      );
      
      return reply.send({ success: true, data: earlyLeaveEmployees });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getOvertimeEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as { 
        date: string; 
        departmentId?: number 
      };
      
      if (!date) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Date parameter is required' 
        });
      }
      
      const overtimeEmployees = await AttendanceService.getOvertimeEmployees(
        new Date(date),
        departmentId
      );
      
      return reply.send({ success: true, data: overtimeEmployees });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getRepeatedViolations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { month, year, violationType } = request.query as { 
        month: string; 
        year: string;
        violationType: 'absent' | 'late';
      };
      
      if (!month || !year || !violationType) {
        return reply.status(400).send({ 
          success: false, 
          error: 'month, year, and violationType parameters are required' 
        });
      }
      
      const violations = await AttendanceService.getRepeatedViolations(
        parseInt(month),
        parseInt(year),
        violationType
      );
      
      return reply.send({ success: true, data: violations });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getAttendanceByPeriod(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { periodType, startDate, endDate } = request.query as {
        periodType: 'day' | 'week' | 'month' | 'custom';
        startDate: string;
        endDate?: string;
      };

      if (!periodType || !startDate) {
        return reply.status(400).send({
          success: false,
          error: 'periodType and startDate parameters are required'
        });
      }

      if (periodType === 'custom' && !endDate) {
        return reply.status(400).send({
          success: false,
          error: 'endDate parameter is required for custom period'
        });
      }

      const periodData = await AttendanceService.getAttendanceByPeriod(
        periodType,
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );

      return reply.send({ success: true, data: periodData });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDepartmentAttendanceSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = request.query as {
        startDate: string;
        endDate: string;
      };

      if (!startDate || !endDate) {
        return reply.status(400).send({
          success: false,
          error: 'startDate and endDate parameters are required'
        });
      }

      const filters = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };

      const summary = await AttendanceService.getDepartmentAttendanceSummary(filters);
      return reply.send({ success: true, data: summary });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getEmployeeMonthlySummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const { year, month } = request.query as {
        year: string;
        month: string;
      };

      if (!employeeId || !year || !month) {
        return reply.status(400).send({
          success: false,
          error: 'employeeId, year, and month parameters are required'
        });
      }

      const summary = await AttendanceService.getEmployeeMonthlySummary(
        parseInt(employeeId),
        parseInt(year),
        parseInt(month)
      );

      return reply.send({ success: true, data: summary });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRecentCheckIns(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = request.query as { limit?: string };
      
      const checkIns = await AttendanceService.getRecentCheckIns(
        limit ? parseInt(limit) : undefined
      );
      
      return reply.send({ success: true, data: checkIns });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}