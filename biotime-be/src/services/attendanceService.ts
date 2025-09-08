// src/services/attendanceService.ts
import { query } from '../config/utils/database';
import { AttendanceFilters, AttendanceRecord, AttendanceSummary } from '../types/attendance';

export class AttendanceService {
  // Get detailed attendance records with comprehensive information
  static async getAttendanceRecords(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    const { employeeId, departmentId, startDate, endDate } = filters;

    let whereClause = `WHERE tc.att_date BETWEEN $1 AND $2 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
      tc.att_date,
      TO_CHAR(tc.att_date, 'Day') as week_day,
      EXTRACT(DOW FROM tc.att_date) as day_of_week,
      tc.clock_in,
      tc.clock_out,
      -- Fixed hours_worked calculation using payload data with proper JSON casting
      CASE 
        WHEN (tc.payload::json->'duration'->>'duration') IS NOT NULL 
          THEN (tc.payload::json->'duration'->>'duration')::numeric / 3600
        WHEN tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL
          THEN EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600
        ELSE 0
      END as hours_worked,
      tc.check_in,
      tc.check_out,
      tc.work_day,
      pc.pay_code_alias,
      CASE 
        WHEN tc.clock_in IS NULL AND (tc.payload::json->'duration'->>'duration')::numeric = 0 THEN 'absent'
        WHEN tc.clock_in IS NOT NULL AND tc.clock_in::time > '09:00:00' THEN 'late'
        WHEN tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' THEN 'early_leave'
        WHEN (
          CASE 
            WHEN (tc.payload::json->'duration'->>'duration') IS NOT NULL 
              THEN (tc.payload::json->'duration'->>'duration')::numeric / 3600
            WHEN tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL
              THEN EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600
            ELSE 0
          END
        ) > 8 THEN 'overtime'
        ELSE 'present'
      END as status,
      CASE 
        WHEN pc.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
        WHEN pc.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
        WHEN pc.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
        WHEN pc.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
        WHEN pc.pay_code_alias ILIKE '%business%' THEN 'business_trip'
        WHEN tc.clock_in IS NULL AND (tc.payload::json->'duration'->>'duration')::numeric = 0 THEN 'unauthorized_absence'
        ELSE NULL
      END as absence_reason,
      CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend,
      -- Additional useful fields from payload with proper casting
      tc.payload::json->'duration'->>'hours' as payload_hours,
      tc.payload::json->'duration'->>'minutes' as payload_minutes,
      tc.payload::json->'worked_hrs'->>'hours' as worked_hours,
      tc.payload::json->'worked_hrs'->>'minutes' as worked_minutes
    FROM att_payloadtimecard tc
    INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
    LEFT JOIN personnel_department dept ON emp.department_id = dept.id
    LEFT JOIN att_payloadpaycode pc ON tc.id = pc.time_card_id
    ${whereClause}
    ORDER BY tc.att_date DESC, emp.first_name, emp.last_name
  `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get attendance summary (counts by status with detailed breakdown)
  static async getAttendanceSummary(filters: AttendanceFilters): Promise<AttendanceSummary[]> {
    const { departmentId, startDate, endDate } = filters;

    let whereClause = `WHERE tc.att_date BETWEEN $1 AND $2 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
    const params: any[] = [startDate, endDate];

    if (departmentId) {
      params.push(departmentId);
      whereClause += ` AND emp.department_id = $${params.length}`;
    }

    const sql = `
      SELECT 
        tc.att_date as date,
        TO_CHAR(tc.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM tc.att_date) as day_of_week,
        COUNT(*) as total_employees,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL THEN 1 END) as present,
        COUNT(CASE WHEN tc.clock_in IS NULL THEN 1 END) as absent,
        COUNT(CASE WHEN tc.clock_in::time > '09:00:00' THEN 1 END) as late,
        COUNT(CASE WHEN tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' THEN 1 END) as early_leave,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 > 8 THEN 1 END) as overtime,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%sick%' THEN 1 END) as sick_leave,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%vacation%' THEN 1 END) as vacation_leave,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%maternal%' THEN 1 END) as maternal_leave,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%annual%' THEN 1 END) as annual_leave,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%business%' THEN 1 END) as business_trip,
        CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
      LEFT JOIN att_payloadpaycode pc ON tc.id = pc.time_card_id
      ${whereClause}
      GROUP BY tc.att_date
      ORDER BY tc.att_date DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get employees who were absent with detailed reasons
  static async getAbsentEmployees(date: Date, departmentId?: number): Promise<any[]> {
    const isWeekendSql = `SELECT EXTRACT(DOW FROM $1::date) IN (0, 6) as is_weekend`;
    const weekendResult = await query(isWeekendSql, [date]);
    const isWeekend = weekendResult.rows[0]?.is_weekend;

    if (isWeekend) {
      return [];
    }

    let whereClause = `WHERE tc.att_date = $1 AND tc.clock_in IS NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
        tc.att_date,
        TO_CHAR(tc.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM tc.att_date) as day_of_week,
        pc.pay_code_alias,
        CASE 
          WHEN pc.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
          WHEN pc.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
          WHEN pc.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
          WHEN pc.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
          WHEN pc.pay_code_alias ILIKE '%business%' THEN 'business_trip'
          ELSE 'unauthorized_absence'
        END as absence_reason,
        CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      LEFT JOIN att_payloadpaycode pc ON tc.id = pc.time_card_id
      ${whereClause}
      ORDER BY dept.dept_name, emp.first_name, emp.last_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get late employees with detailed timing information
  static async getLateEmployees(date: Date, departmentId?: number): Promise<any[]> {
    const isWeekendSql = `SELECT EXTRACT(DOW FROM $1::date) IN (0, 6) as is_weekend`;
    const weekendResult = await query(isWeekendSql, [date]);
    const isWeekend = weekendResult.rows[0]?.is_weekend;

    if (isWeekend) {
      return [];
    }

    let whereClause = `WHERE tc.att_date = $1 AND tc.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
        tc.att_date,
        TO_CHAR(tc.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM tc.att_date) as day_of_week,
        tc.clock_in::time as check_in_time,
        EXTRACT(EPOCH FROM (tc.clock_in::time - '09:00:00'::time))/60 as minutes_late,
        CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      ${whereClause}
      ORDER BY minutes_late DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get early leave employees
  static async getEarlyLeaveEmployees(date: Date, departmentId?: number): Promise<any[]> {
    const isWeekendSql = `SELECT EXTRACT(DOW FROM $1::date) IN (0, 6) as is_weekend`;
    const weekendResult = await query(isWeekendSql, [date]);
    const isWeekend = weekendResult.rows[0]?.is_weekend;

    if (isWeekend) {
      return [];
    }

    let whereClause = `WHERE tc.att_date = $1 AND tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
        tc.att_date,
        TO_CHAR(tc.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM tc.att_date) as day_of_week,
        tc.clock_out::time as check_out_time,
        EXTRACT(EPOCH FROM ('17:00:00'::time - tc.clock_out::time))/60 as minutes_early,
        CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      ${whereClause}
      ORDER BY minutes_early DESC, dept.dept_name, emp.first_name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get overtime employees
  static async getOvertimeEmployees(date: Date, departmentId?: number): Promise<any[]> {
    const isWeekendSql = `SELECT EXTRACT(DOW FROM $1::date) IN (0, 6) as is_weekend`;
    const weekendResult = await query(isWeekendSql, [date]);
    const isWeekend = weekendResult.rows[0]?.is_weekend;

    if (isWeekend) {
      return [];
    }

    let whereClause = `WHERE tc.att_date = $1 AND tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL AND EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 > 8 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
        tc.att_date,
        TO_CHAR(tc.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM tc.att_date) as day_of_week,
        tc.clock_in,
        tc.clock_out,
        EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 as hours_worked,
        (EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 - 8) as overtime_hours,
        CASE WHEN EXTRACT(DOW FROM tc.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
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
      ? 'tc.clock_in IS NULL'
      : 'tc.clock_in::time > \'09:00:00\'';

    const sql = `
      SELECT 
        emp.id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        dept.dept_name,
        COUNT(*) as violation_count,
        ARRAY_AGG(tc.att_date ORDER BY tc.att_date) as violation_dates
      FROM att_payloadtimecard tc
      INNER JOIN personnel_employee emp ON tc.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      WHERE EXTRACT(MONTH FROM tc.att_date) = $1 
        AND EXTRACT(YEAR FROM tc.att_date) = $2
        AND ${condition}
        AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)
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
        dateCondition = `tc.att_date = $1 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
        params.push(startDate);
        break;
      case 'week':
        dateCondition = `tc.att_date BETWEEN $1 AND $1 + INTERVAL '6 days' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
        params.push(startDate);
        break;
      case 'month':
        dateCondition = `EXTRACT(MONTH FROM tc.att_date) = EXTRACT(MONTH FROM $1) 
                        AND EXTRACT(YEAR FROM tc.att_date) = EXTRACT(YEAR FROM $1)
                        AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
        params.push(startDate);
        break;
      case 'custom':
        if (!endDate) throw new Error('End date required for custom period');
        dateCondition = `tc.att_date BETWEEN $1 AND $2 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6)`;
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
        COUNT(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as total_working_days,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as present_days,
        COUNT(CASE WHEN tc.clock_in IS NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as absent_days,
        COUNT(CASE WHEN tc.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as late_days,
        COUNT(CASE WHEN tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as early_leave_days,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL AND EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 > 8 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as overtime_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%sick%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as sick_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%vacation%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as vacation_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%maternal%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as maternal_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%annual%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as annual_leave_days
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard tc ON emp.id = tc.emp_id AND ${dateCondition}
      LEFT JOIN att_payloadpaycode pc ON tc.id = pc.time_card_id
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
        COUNT(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as total_working_days,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as present_count,
        COUNT(CASE WHEN tc.clock_in IS NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as absent_count,
        COUNT(CASE WHEN tc.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as late_count,
        COUNT(CASE WHEN tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as early_leave_count,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL AND EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 > 8 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as overtime_count,
        ROUND(
          COUNT(CASE WHEN tc.clock_in IS NOT NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END), 0), 
          2
        ) as attendance_percentage
      FROM personnel_department dept
      LEFT JOIN personnel_employee emp ON dept.id = emp.department_id
      LEFT JOIN att_payloadtimecard tc ON emp.id = tc.emp_id AND tc.att_date BETWEEN $1 AND $2
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
        COUNT(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as total_working_days,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as present_days,
        COUNT(CASE WHEN tc.clock_in IS NULL AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as absent_days,
        COUNT(CASE WHEN tc.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as late_days,
        COUNT(CASE WHEN tc.clock_out IS NOT NULL AND tc.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as early_leave_days,
        COUNT(CASE WHEN tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL AND EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 > 8 AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as overtime_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%sick%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as sick_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%vacation%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as vacation_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%maternal%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as maternal_leave_days,
        COUNT(CASE WHEN pc.pay_code_alias ILIKE '%annual%' AND EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) THEN 1 END) as annual_leave_days,
        SUM(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) AND tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL THEN EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 ELSE 0 END) as total_hours_worked,
        AVG(CASE WHEN EXTRACT(DOW FROM tc.att_date) NOT IN (0, 6) AND tc.clock_in IS NOT NULL AND tc.clock_out IS NOT NULL THEN EXTRACT(EPOCH FROM (tc.clock_out - tc.clock_in))/3600 END) as avg_daily_hours
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard tc ON emp.id = tc.emp_id 
        AND EXTRACT(MONTH FROM tc.att_date) = $2 
        AND EXTRACT(YEAR FROM tc.att_date) = $3
      LEFT JOIN att_payloadpaycode pc ON tc.id = pc.time_card_id
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
        ep.punch_datetime as check_in_time,
        TO_CHAR(ep.punch_datetime, 'HH24:MI:SS') as check_in_time_formatted,
        TO_CHAR(ep.punch_datetime, 'Day') as week_day,
        EXTRACT(DOW FROM ep.punch_datetime) as day_of_week,
        CASE 
          WHEN ep.punch_time > '09:00:00' THEN 'late'
          ELSE 'on_time'
        END as status,
        CASE WHEN EXTRACT(DOW FROM ep.punch_datetime) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadeffectpunch ep
      INNER JOIN personnel_employee emp ON ep.emp_id = emp.id
      LEFT JOIN personnel_department dept ON emp.department_id = dept.id
      WHERE ep.punch_state = 'IN'
        AND EXTRACT(DOW FROM ep.punch_datetime) NOT IN (0, 6)
      ORDER BY ep.punch_datetime DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}