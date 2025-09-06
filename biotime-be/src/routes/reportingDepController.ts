// src/controllers/reportingController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportingService } from '../services/reportingDepService';

export class ReportingController {
  // Department endpoints
  static async getAllDepartments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const departments = await ReportingService.getAllDepartments(filters);
      return reply.send(departments);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDepartmentById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const department = await ReportingService.getDepartmentById(parseInt(id));
      
      if (!department) {
        return reply.status(404).send({ error: 'Department not found' });
      }
      
      return reply.send(department);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDepartmentAttendanceStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { startDate, endDate } = request.query as any;
      
      if (!startDate || !endDate) {
        return reply.status(400).send({ error: 'startDate and endDate are required' });
      }
      
      const stats = await ReportingService.getDepartmentAttendanceStats(
        parseInt(id), 
        new Date(startDate), 
        new Date(endDate)
      );
      
      return reply.send(stats);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  // Employee endpoints
  static async getAllEmployees(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const employees = await ReportingService.getAllEmployees(filters);
      return reply.send(employees);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEmployeeById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const employee = await ReportingService.getEmployeeById(parseInt(id));
      
      if (!employee) {
        return reply.status(404).send({ error: 'Employee not found' });
      }
      
      return reply.send(employee);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEmployeeAttendanceSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { startDate, endDate } = request.query as any;
      
      if (!startDate || !endDate) {
        return reply.status(400).send({ error: 'startDate and endDate are required' });
      }
      
      const summary = await ReportingService.getEmployeeAttendanceSummary(
        parseInt(id), 
        new Date(startDate), 
        new Date(endDate)
      );
      
      return reply.send(summary);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEmployeesByDepartment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { startDate, endDate } = request.query as any;
      
      let employees;
      if (startDate && endDate) {
        employees = await ReportingService.getEmployeesByDepartment(
          parseInt(id), 
          new Date(startDate), 
          new Date(endDate)
        );
      } else {
        employees = await ReportingService.getEmployeesByDepartment(parseInt(id));
      }
      
      return reply.send(employees);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  // Report endpoints
  static async getDepartmentPerformanceReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = request.query as any;
      
      if (!startDate || !endDate) {
        return reply.status(400).send({ error: 'startDate and endDate are required' });
      }
      
      const report = await ReportingService.getDepartmentPerformanceReport(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return reply.send(report);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getEmployeePerformanceReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { departmentId, startDate, endDate } = request.query as any;
      
      let report;
      if (startDate && endDate) {
        report = await ReportingService.getEmployeePerformanceReport(
          departmentId ? parseInt(departmentId) : undefined,
          new Date(startDate), 
          new Date(endDate)
        );
      } else {
        report = await ReportingService.getEmployeePerformanceReport(
          departmentId ? parseInt(departmentId) : undefined
        );
      }
      
      return reply.send(report);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  // Trend endpoints
  static async getEmployeeAttendanceTrend(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { months } = request.query as any;
      
      const trend = await ReportingService.getEmployeeAttendanceTrend(
        parseInt(id), 
        months ? parseInt(months) : 6
      );
      
      return reply.send(trend);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  static async getDepartmentAttendanceTrend(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { months } = request.query as any;
      
      const trend = await ReportingService.getDepartmentAttendanceTrend(
        parseInt(id), 
        months ? parseInt(months) : 6
      );
      
      return reply.send(trend);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  // Dashboard endpoints
  static async getReportingDashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get current date and calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const today = new Date();
      
      // Get various data points for dashboard
      const [departments, departmentPerformance, recentEmployees] = await Promise.all([
        ReportingService.getAllDepartments(),
        ReportingService.getDepartmentPerformanceReport(thirtyDaysAgo, today),
        ReportingService.getAllEmployees({ isActive: true })
      ]);
      
      return reply.send({
        summary: {
          totalDepartments: departments.length,
          totalEmployees: recentEmployees.length,
          activeDepartments: departments.filter((d: any) => d.is_active).length,
          activeEmployees: recentEmployees.filter((e: any) => e.is_active).length
        },
        departmentPerformance: departmentPerformance.slice(0, 5), // Top 5 departments
        recentDepartments: departments.slice(0, 5) // Recent 5 departments
      });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }
}