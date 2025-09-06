// src/controllers/attendanceController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
// import { AttendanceService } from '../services/attendanceService';
import { ReportingService } from '../services/reportingService';
import { AttendanceService } from '../services/attendanceService';

export class AttendanceController {
  static async getAttendanceRecords(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const records = await AttendanceService.getAttendanceRecords(filters);
      return reply.send(records);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getAttendanceSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const summary = await AttendanceService.getAttendanceSummary(filters);
      return reply.send(summary);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getAbsentEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as any;
      const absentEmployees = await AttendanceService.getAbsentEmployees(new Date(date), departmentId);
      return reply.send(absentEmployees);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getLateEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as any;
      const lateEmployees = await AttendanceService.getLateEmployees(new Date(date), departmentId);
      return reply.send(lateEmployees);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEarlyLeaveEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as any;
      const earlyLeaveEmployees = await AttendanceService.getEarlyLeaveEmployees(new Date(date), departmentId);
      return reply.send(earlyLeaveEmployees);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getOvertimeEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, departmentId } = request.query as any;
      const overtimeEmployees = await AttendanceService.getOvertimeEmployees(new Date(date), departmentId);
      return reply.send(overtimeEmployees);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getAttendanceByPeriod(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { periodType, startDate, endDate } = request.query as any;
      const attendance = await AttendanceService.getAttendanceByPeriod(periodType, new Date(startDate), endDate ? new Date(endDate) : undefined);
      return reply.send(attendance);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDepartmentAttendanceSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const summary = await AttendanceService.getDepartmentAttendanceSummary(filters);
      return reply.send(summary);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEmployeeMonthlySummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as any;
      const { year, month } = request.query as any;
      const summary = await AttendanceService.getEmployeeMonthlySummary(parseInt(employeeId), parseInt(year), parseInt(month));
      return reply.send(summary);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getAbsenceReasons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date } = request.query as any;
      const reasons = await ReportingService.getAbsenceReasons(new Date(date));
      return reply.send(reasons);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getRepeatedViolations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { month, year, type } = request.query as any;
      const violations = await AttendanceService.getRepeatedViolations(parseInt(month), parseInt(year), type as 'absent' | 'late');
      return reply.send(violations);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getRecentCheckIns(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = request.query as any;
      const checkIns = await AttendanceService.getRecentCheckIns(limit ? parseInt(limit) : 50);
      return reply.send(checkIns);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getTodayReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getTodayReport();
      return reply.send(report);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getWeeklyReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getWeeklyReport();
      return reply.send(report);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getMonthlyReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const report = await ReportingService.getMonthlyReport();
      return reply.send(report);
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDashboardOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Combine multiple data sources for dashboard
      const [todayReport, weeklyReport, recentCheckIns] = await Promise.all([
        ReportingService.getTodayReport(),
        ReportingService.getWeeklyReport(),
        AttendanceService.getRecentCheckIns(10)
      ]);
      
      return reply.send({
        today: todayReport,
        weekly: weeklyReport,
        recentCheckIns
      });
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDailyStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { date } = request.query as any;
      const targetDate = date ? new Date(date) : new Date();
      
      const [absent, late, earlyLeave, overtime] = await Promise.all([
        AttendanceService.getAbsentEmployees(targetDate),
        AttendanceService.getLateEmployees(targetDate),
        AttendanceService.getEarlyLeaveEmployees(targetDate),
        AttendanceService.getOvertimeEmployees(targetDate)
      ]);

      return reply.send({
        date: targetDate,
        absentCount: absent.length,
        lateCount: late.length,
        earlyLeaveCount: earlyLeave.length,
        overtimeCount: overtime.length,
        details: {
          absent,
          late,
          earlyLeave,
          overtime
        }
      });
    } catch (error:any) {
      return reply.status(500).send({ error: error.message });
    }
  }
}