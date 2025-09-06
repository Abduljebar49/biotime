// src/services/attendanceService.ts
import { query } from '../config/utils/database';
import { AttendanceFilters, AttendanceRecord, AttendanceSummary } from '../types/attendance';

export class AttendanceService {
  // Get detailed attendance records with comprehensive information
  static async getAttendanceRecords(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    const { employeeId, departmentId, startDate, endDate } = filters;

    let whereClause = `WHERE att.att_date BETWEEN $1 AND $2`;
    const params: any[] = [startDate, endDate];

    if (employeeId) {
      params.push(employeeId);
      whereClause += ` AND emp.id = $${params.length}`;
    }

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        emp.department_id,
        dept.dept_name,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        att.clock_in,
        att.clock_out,
        -- Extract hours_worked from payload JSON with proper casting
        CASE 
          WHEN (att.payload::jsonb)->'worked_hrs'->>'duration' IS NOT NULL 
            THEN ((att.payload::jsonb)->'worked_hrs'->>'duration')::numeric / 3600
          WHEN (att.payload::jsonb)->'duration'->>'duration' IS NOT NULL 
            THEN ((att.payload::jsonb)->'duration'->>'duration')::numeric / 3600
          WHEN att.clock_out IS NOT NULL AND att.clock_in IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 
          ELSE 0
        END as hours_worked,
        att.check_in,
        att.check_out,
        att.work_day,
        pay.pay_code_alias,
        CASE 
          WHEN att.clock_in IS NULL THEN 'absent'
          WHEN att.clock_in::time > '09:00:00' THEN 'late'
          WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 'early_leave'
          -- Use the same logic for overtime calculation
          WHEN (
            CASE 
              WHEN (att.payload::jsonb)->'worked_hrs'->>'duration' IS NOT NULL 
                THEN ((att.payload::jsonb)->'worked_hrs'->>'duration')::numeric / 3600
              WHEN (att.payload::jsonb)->'duration'->>'duration' IS NOT NULL 
                THEN ((att.payload::jsonb)->'duration'->>'duration')::numeric / 3600
              WHEN att.clock_out IS NOT NULL AND att.clock_in IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 
              ELSE 0
            END
          ) > 8 THEN 'overtime'
          ELSE 'present'
        END as status,
        CASE 
          WHEN pay.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
          WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
          WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
          WHEN pay.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
          WHEN pay.pay_code_alias ILIKE '%business%' THEN 'business_trip'
          WHEN att.clock_in IS NULL THEN 'unauthorized_absence'
          ELSE NULL
        END as absence_reason
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      ${whereClause}
      ORDER BY att.att_date DESC, emp.first_name, emp.last_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get attendance summary (counts by status with detailed breakdown)
  static async getAttendanceSummary(filters: AttendanceFilters): Promise<AttendanceSummary[]> {
    const { departmentId, startDate, endDate } = filters;

    let whereClause = `WHERE att.att_date BETWEEN $1 AND $2`;
    const params: any[] = [startDate, endDate];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        att.att_date as date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        COUNT(*) as total_employees,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%sick%' THEN 1 END) as sick_leave,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 1 END) as vacation_leave,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 1 END) as maternal_leave,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%annual%' THEN 1 END) as annual_leave,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%business%' THEN 1 END) as business_trip
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      ${whereClause}
      GROUP BY att.att_date
      ORDER BY att.att_date DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get employees who were absent with detailed reasons
  static async getAbsentEmployees(date: Date, departmentId?: number): Promise<any[]> {
    let whereClause = `WHERE att.att_date = $1 AND att.clock_in IS NULL`;
    const params: any[] = [date];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        pay.pay_code_alias,
        CASE 
          WHEN pay.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
          WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
          WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
          WHEN pay.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
          WHEN pay.pay_code_alias ILIKE '%business%' THEN 'business_trip'
          ELSE 'unauthorized_absence'
        END as absence_reason
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      ${whereClause}
      ORDER BY dept.dept_name, emp.first_name, emp.last_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get late employees with detailed timing information
  static async getLateEmployees(date: Date, departmentId?: number): Promise<any[]> {
    let whereClause = `WHERE att.att_date = $1 AND att.clock_in::time > '09:00:00'`;
    const params: any[] = [date];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        att.clock_in::time as check_in_time,
        EXTRACT(EPOCH FROM (att.clock_in::time - '09:00:00'::time))/60 as minutes_late
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      ${whereClause}
      ORDER BY minutes_late DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get early leave employees
  static async getEarlyLeaveEmployees(date: Date, departmentId?: number): Promise<any[]> {
    let whereClause = `WHERE att.att_date = $1 AND att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00'`;
    const params: any[] = [date];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        att.clock_out::time as check_out_time,
        EXTRACT(EPOCH FROM ('17:00:00'::time - att.clock_out::time))/60 as minutes_early
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      ${whereClause}
      ORDER BY minutes_early DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get overtime employees
  static async getOvertimeEmployees(date: Date, departmentId?: number): Promise<any[]> {
    let whereClause = `WHERE att.att_date = $1 AND EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8`;
    const params: any[] = [date];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        att.clock_in,
        att.clock_out,
        EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 as hours_worked,
        (EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 - 8) as overtime_hours
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      ${whereClause}
      ORDER BY overtime_hours DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get employees with repeated absences/late arrivals (3+ times in a month)
  static async getRepeatedViolations(month: number, year: number, violationType: 'absent' | 'late'): Promise<any[]> {
    const condition = violationType === 'absent'
      ? 'att.clock_in IS NULL'
      : 'att.clock_in::time > \'09:00:00\'';

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        COUNT(*) as violation_count,
        ARRAY_AGG(att.att_date ORDER BY att.att_date) as violation_dates
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      WHERE EXTRACT(MONTH FROM att.att_date) = $1 
        AND EXTRACT(YEAR FROM att.att_date) = $2
        AND ${condition}
      GROUP BY emp.id, emp.emp_code, emp.first_name, emp.last_name, dept.dept_name
      HAVING COUNT(*) >= 3
      ORDER BY violation_count DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, [month, year]);
    return result.rows;
  }

  // Get attendance by custom period with detailed analysis
  static async getAttendanceByPeriod(periodType: 'day' | 'week' | 'month' | 'custom', startDate: Date, endDate?: Date): Promise<any[]> {
    let dateCondition = '';
    const params: any[] = [];

    switch (periodType) {
      case 'day':
        dateCondition = `att.att_date = $1`;
        params.push(startDate);
        break;
      case 'week':
        dateCondition = `att.att_date BETWEEN $1 AND $1 + INTERVAL '6 days'`;
        params.push(startDate);
        break;
      case 'month':
        dateCondition = `EXTRACT(MONTH FROM att.att_date) = EXTRACT(MONTH FROM $1) 
                        AND EXTRACT(YEAR FROM att.att_date) = EXTRACT(YEAR FROM $1)`;
        params.push(startDate);
        break;
      case 'custom':
        if (!endDate) throw new Error('End date required for custom period');
        dateCondition = `att.att_date BETWEEN $1 AND $2`;
        params.push(startDate, endDate);
        break;
    }

    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        COUNT(att.att_date) as total_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_days,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_days,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%sick%' THEN 1 END) as sick_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 1 END) as vacation_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 1 END) as maternal_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%annual%' THEN 1 END) as annual_leave_days
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id AND ${dateCondition}
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      GROUP BY emp.id, emp.emp_code, emp.first_name, emp.last_name, dept.dept_name
      ORDER BY dept.dept_name, emp.first_name, emp.last_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get department-wise attendance summary with detailed metrics
  static async getDepartmentAttendanceSummary(filters: AttendanceFilters): Promise<any[]> {
    const { startDate, endDate } = filters;

    const sql = `
      SELECT 
        dept.id as department_id,
        dept.dept_name,
        COUNT(DISTINCT emp.id) as total_employees,
        COUNT(att.att_date) as total_attendance_records,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_count,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_count,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_count,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM personnel_department dept
      LEFT JOIN personnel_employee emp ON dept.id = emp.department_id
      LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id AND att.att_date BETWEEN $1 AND $2
      GROUP BY dept.id, dept.dept_name
      ORDER BY attendance_percentage DESC, dept.dept_name
    `;

    const result = await query(sql, [startDate, endDate]);
    return result.rows;
  }

  // Get comprehensive employee monthly summary
  static async getEmployeeMonthlySummary(employeeId: number, year: number, month: number): Promise<any> {
    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        COUNT(att.att_date) as total_working_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_days,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_days,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%sick%' THEN 1 END) as sick_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 1 END) as vacation_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 1 END) as maternal_leave_days,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%annual%' THEN 1 END) as annual_leave_days,
        SUM(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600) as total_hours_worked,
        AVG(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600) as avg_daily_hours
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id 
        AND EXTRACT(MONTH FROM att.att_date) = $2 
        AND EXTRACT(YEAR FROM att.att_date) = $3
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      WHERE emp.id = $1
      GROUP BY emp.id, emp.emp_code, emp.first_name, emp.last_name, dept.dept_name
    `;

    const result = await query(sql, [employeeId, month, year]);
    return result.rows[0] || null;
  }

  // Get real-time attendance data (recent check-ins)
  static async getRecentCheckIns(limit: number = 50): Promise<any[]> {
    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        p.clock_in as check_in_time,
        TO_CHAR(p.clock_in, 'HH24:MI:SS') as check_in_time_formatted,
        TO_CHAR(p.clock_in, 'Day') as week_day,
        CASE 
          WHEN p.clock_in::time > '09:00:00' THEN 'late'
          ELSE 'on_time'
        END as status
      FROM att_payloadparing p
      INNER JOIN personnel_employee emp ON p.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      WHERE p.clock_in IS NOT NULL
      ORDER BY p.clock_in DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}