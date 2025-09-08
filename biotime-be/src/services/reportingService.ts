// src/services/reportingService.ts
import { query } from '../config/utils/database';

export class ReportingService {
  static async getTodayReport(): Promise<any> {
    // Check if today is weekend first
    const isWeekendSql = `SELECT EXTRACT(DOW FROM CURRENT_DATE) IN (0, 6) as is_weekend`;
    const weekendResult = await query(isWeekendSql);
    const isWeekend = weekendResult.rows[0]?.is_weekend;

    if (isWeekend) {
      return {
        total_employees: 0,
        present_today: 0,
        present_employees: [],
        absent_today: 0,
        absent_employees: [],
        late_count: 0,
        early_leave_count: 0,
        overtime_count: 0,
        attendance_percentage: 0,
        is_weekend: true
      };
    }

    const sql = `
    WITH total AS (
      SELECT COUNT(*)::int AS total_employees 
      FROM personnel_employee 
      WHERE is_active = true
    ),
    present AS (
      SELECT 
        e.id, 
        e.emp_code,
        e.first_name,
        e.last_name,
        d.dept_name,
        d.dept_code,
        a.clock_in,
        a.clock_out,
        EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600 as hours_worked,
        CASE 
          WHEN a.clock_in::time > '09:00:00' THEN 'late'
          WHEN a.clock_out IS NOT NULL AND a.clock_out::time < '17:00:00' THEN 'early_leave'
          WHEN EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600 > 8 THEN 'overtime'
          ELSE 'on_time'
        END as attendance_status
      FROM personnel_employee e
      JOIN att_payloadtimecard a ON e.id = a.emp_id
      LEFT JOIN personnel_department d ON e.department_id = d.id
      WHERE a.att_date = CURRENT_DATE
        AND a.clock_in IS NOT NULL
        AND EXTRACT(DOW FROM a.att_date) NOT IN (0, 6) -- Exclude weekends
    ),
    absent AS (
      SELECT 
        e.id, 
        e.emp_code,
        e.first_name,
        e.last_name,
        d.dept_name,
        d.dept_code,
        pay.pay_code_alias,
        CASE 
          WHEN pay.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
          WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
          WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
          WHEN pay.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
          WHEN pay.pay_code_alias ILIKE '%business%' THEN 'business_trip'
          ELSE 'unauthorized_absence'
        END as absence_reason
      FROM personnel_employee e
      LEFT JOIN personnel_department d ON e.department_id = d.id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id AND att.att_date = CURRENT_DATE
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      WHERE e.id NOT IN (
        SELECT emp_id
        FROM att_payloadtimecard
        WHERE att_date = CURRENT_DATE
          AND clock_in IS NOT NULL
      )
      AND e.is_active = true
      AND EXTRACT(DOW FROM CURRENT_DATE) NOT IN (0, 6) -- Exclude weekends
    ),
    late_employees AS (
      SELECT COUNT(*) as late_count
      FROM att_payloadtimecard
      WHERE att_date = CURRENT_DATE
        AND clock_in::time > '09:00:00'
        AND EXTRACT(DOW FROM att_date) NOT IN (0, 6) -- Exclude weekends
    ),
    early_leave_employees AS (
      SELECT COUNT(*) as early_leave_count
      FROM att_payloadtimecard
      WHERE att_date = CURRENT_DATE
        AND clock_out IS NOT NULL 
        AND clock_out::time < '17:00:00'
        AND EXTRACT(DOW FROM att_date) NOT IN (0, 6) -- Exclude weekends
    ),
    overtime_employees AS (
      SELECT COUNT(*) as overtime_count
      FROM att_payloadtimecard
      WHERE att_date = CURRENT_DATE
        AND EXTRACT(EPOCH FROM (clock_out - clock_in))/3600 > 8
        AND EXTRACT(DOW FROM att_date) NOT IN (0, 6) -- Exclude weekends
    )
    SELECT
      t.total_employees,
      (SELECT COUNT(*) FROM present) AS present_today,
      (SELECT json_agg(p) FROM present p) AS present_employees,
      (SELECT COUNT(*) FROM absent) AS absent_today,
      (SELECT json_agg(a) FROM absent a) AS absent_employees,
      (SELECT late_count FROM late_employees) AS late_count,
      (SELECT early_leave_count FROM early_leave_employees) AS early_leave_count,
      (SELECT overtime_count FROM overtime_employees) AS overtime_count,
      ROUND(
        (SELECT COUNT(*) FROM present) * 100.0 / 
        NULLIF(t.total_employees, 0), 
        2
      ) as attendance_percentage,
      false as is_weekend
    FROM total t;
  `;

    const result = await query(sql);
    return result.rows[0];
  }

  static async getWeeklyReport(): Promise<any[]> {
    const sql = `
    SELECT 
      week_dates.att_date,
      TO_CHAR(week_dates.att_date, 'Day') as week_day,
      EXTRACT(DOW FROM week_dates.att_date) as day_of_week,
      COUNT(DISTINCT emp.id) as total_employees,
      COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present,
      COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent,
      COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late,
      COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave,
      COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime,
      ROUND(
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
        NULLIF(COUNT(DISTINCT emp.id), 0), 
        2
      ) as attendance_percentage,
      CASE WHEN EXTRACT(DOW FROM week_dates.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
    FROM (
      -- Generate all dates for the current week
      SELECT generate_series(
        date_trunc('week', CURRENT_DATE)::date,
        LEAST(date_trunc('week', CURRENT_DATE)::date + INTERVAL '6 days', CURRENT_DATE)::date,
        '1 day'::interval
      )::date as att_date
    ) week_dates
    CROSS JOIN personnel_employee emp
    LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id 
      AND att.att_date = week_dates.att_date
    WHERE emp.is_active = true
      AND week_dates.att_date <= CURRENT_DATE
    GROUP BY week_dates.att_date
    ORDER BY week_dates.att_date
  `;

    const result = await query(sql);
    return result.rows;
  }

  static async getMonthlyReport(): Promise<any> {
    const sql = `
    SELECT 
      COUNT(DISTINCT emp.id) as total_employees,
      COUNT(att.att_date) as total_days,
      COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_present,
      COUNT(CASE WHEN att.clock_in IS NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_absent,
      COUNT(CASE WHEN att.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_late,
      COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_early_leave,
      COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_overtime,
      COUNT(CASE WHEN pay.pay_code_alias ILIKE '%sick%' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as sick_leave_count,
      COUNT(CASE WHEN pay.pay_code_alias ILIKE '%vacation%' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as vacation_leave_count,
      COUNT(CASE WHEN pay.pay_code_alias ILIKE '%maternal%' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as maternal_leave_count,
      ROUND(
        COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END), 0), 
        2
      ) as attendance_percentage,
      ROUND(AVG(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 END), 2) as avg_daily_hours
    FROM att_payloadtimecard att
    INNER JOIN personnel_employee emp ON att.emp_id = emp.id
    LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
    WHERE EXTRACT(MONTH FROM att.att_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM att.att_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND emp.is_active = true
  `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Enhanced absence reasons with department information
  static async getAbsenceReasons(date: Date): Promise<any[]> {
    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        d.id as department_id,
        d.dept_name,
        d.dept_code,
        att.att_date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM att.att_date) as day_of_week,
        pay.pay_code_alias,
        CASE 
          WHEN pay.pay_code_alias ILIKE '%sick%' THEN 'sick_leave'
          WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 'vacation_leave'
          WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 'maternal_leave'
          WHEN pay.pay_code_alias ILIKE '%annual%' THEN 'annual_leave'
          WHEN pay.pay_code_alias ILIKE '%business%' THEN 'business_trip'
          WHEN att.clock_in IS NULL THEN 'unauthorized_absence'
          ELSE 'present'
        END as absence_reason,
        CASE 
          WHEN att.clock_in IS NOT NULL THEN 'present'
          WHEN pay.pay_code_alias IS NOT NULL THEN 'authorized_absence'
          ELSE 'unauthorized_absence'
        END as attendance_status,
        CASE WHEN EXTRACT(DOW FROM att.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard att 
        ON emp.id = att.emp_id AND att.att_date = $1
      LEFT JOIN att_payloadpaycode pay 
        ON att.id = pay.time_card_id
      LEFT JOIN personnel_department d ON emp.department_id = d.id
      WHERE emp.is_active = true
        AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) -- Exclude weekends
      ORDER BY d.dept_name, emp.first_name, emp.last_name
    `;
    const result = await query(sql, [date]);
    return result.rows;
  }

  // Enhanced recent attendance with more details
  static async getRecentAttendance(limit: number = 20): Promise<any[]> {
    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        d.id as department_id,
        d.dept_name,
        d.dept_code,
        p.clock_in as check_in_time,
        TO_CHAR(p.clock_in, 'HH24:MI:SS') as check_in_time_formatted,
        TO_CHAR(p.clock_in, 'Day') as week_day,
        EXTRACT(DOW FROM p.clock_in) as day_of_week,
        CASE 
          WHEN p.clock_in::time > '09:00:00' THEN 'late'
          ELSE 'on_time'
        END as status,
        EXTRACT(EPOCH FROM (p.clock_in::time - '09:00:00'::time))/60 as minutes_late,
        CASE WHEN EXTRACT(DOW FROM p.clock_in) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadparing p
      INNER JOIN personnel_employee emp ON p.emp_id = emp.id
      LEFT JOIN personnel_department d ON emp.department_id = d.id
      WHERE p.clock_in IS NOT NULL
        AND emp.is_active = true
        AND EXTRACT(DOW FROM p.clock_in) NOT IN (0, 6) -- Exclude weekends
      ORDER BY p.clock_in DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  // Department-wise attendance summary for today
  static async getDepartmentWiseTodayReport(): Promise<any[]> {
    const sql = `
      SELECT 
        d.id as department_id,
        d.dept_name,
        d.dept_code,
        COUNT(DISTINCT emp.id) as total_employees,
        COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM CURRENT_DATE) NOT IN (0, 6) THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL AND EXTRACT(DOW FROM CURRENT_DATE) NOT IN (0, 6) THEN 1 END) as absent_count,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM CURRENT_DATE) NOT IN (0, 6) THEN 1 END) as late_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM CURRENT_DATE) NOT IN (0, 6) THEN 1 END) * 100.0 / 
          NULLIF(COUNT(DISTINCT emp.id), 0), 
          2
        ) as attendance_percentage,
        CASE WHEN EXTRACT(DOW FROM CURRENT_DATE) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM personnel_department d
      LEFT JOIN personnel_employee emp ON d.id = emp.department_id AND emp.is_active = true
      LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id AND att.att_date = CURRENT_DATE
      GROUP BY d.id, d.dept_name, d.dept_code
      ORDER BY attendance_percentage DESC, d.dept_name
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Employee performance summary for the current month
  static async getEmployeePerformanceSummary(): Promise<any[]> {
    const sql = `
      SELECT 
        emp.id as employee_id,
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        d.id as department_id,
        d.dept_name,
        d.dept_code,
        COUNT(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as total_working_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as absent_days,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as late_days,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as early_leave_days,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END), 0), 
          2
        ) as attendance_percentage,
        ROUND(SUM(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 ELSE 0 END), 2) as total_hours_worked
      FROM personnel_employee emp
      LEFT JOIN att_payloadtimecard att ON emp.id = att.emp_id 
        AND EXTRACT(MONTH FROM att.att_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM att.att_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      LEFT JOIN personnel_department d ON emp.department_id = d.id
      WHERE emp.is_active = true
      GROUP BY emp.id, emp.emp_code, emp.first_name, emp.last_name, d.id, d.dept_name, d.dept_code
      ORDER BY attendance_percentage DESC, d.dept_name, emp.first_name
      LIMIT 50
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Get attendance trends for the last 30 days
  static async getAttendanceTrend(days: number = 30): Promise<any[]> {
    const sql = `
      SELECT 
        att.att_date as date,
        TO_CHAR(att.att_date, 'Day') as week_day,
        EXTRACT(DOW FROM att.att_date) as day_of_week,
        COUNT(DISTINCT emp.id) as total_employees,
        COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL AND EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN EXTRACT(DOW FROM att.att_date) NOT IN (0, 6) THEN 1 END), 0), 
          2
        ) as attendance_percentage,
        CASE WHEN EXTRACT(DOW FROM att.att_date) IN (0, 6) THEN true ELSE false END as is_weekend
      FROM att_payloadtimecard att
      INNER JOIN personnel_employee emp ON att.emp_id = emp.id
      WHERE att.att_date >= CURRENT_DATE - INTERVAL '${days} days'
        AND emp.is_active = true
      GROUP BY att.att_date
      ORDER BY att.att_date DESC
    `;
    const result = await query(sql);
    return result.rows;
  }
}