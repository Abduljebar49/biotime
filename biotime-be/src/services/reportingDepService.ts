// src/services/reportingService.ts
import { query } from '../config/utils/database';
import { 
  DepartmentFilters, 
  EmployeeFilters, 
  DepartmentReport, 
  EmployeeReport,
  AttendanceStats 
} from '../types/reporting';

export class ReportingService {
  // Get all departments with basic information
  static async getAllDepartments(filters?: DepartmentFilters): Promise<any[]> {
    let whereClause = '';
    const params: any[] = [];

    
    const sql = `
      SELECT 
        id,
        dept_code,
        dept_name,
        is_default,
        company_id,
        dept_manager_id,
        parent_dept_id
      FROM personnel_department
      ORDER BY dept_name
    `;
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get department by ID with detailed information
  static async getDepartmentById(id: number): Promise<any> {
    const sql = `
      SELECT 
        d.id,
        d.dept_code,
        d.dept_name,
        d.is_default,
        d.company_id,
        d.dept_manager_id,
        d.parent_dept_id,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name,
        m.emp_code as manager_emp_code,
        COUNT(e.id) as employee_count
      FROM personnel_department d
      LEFT JOIN personnel_employee m ON d.dept_manager_id = m.id
      LEFT JOIN personnel_employee e ON d.id = e.department_id
      WHERE d.id = $1
      GROUP BY d.id, m.first_name, m.last_name, m.emp_code
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get department attendance statistics
  static async getDepartmentAttendanceStats(departmentId: number, startDate: Date, endDate: Date): Promise<AttendanceStats> {
    const sql = `
      SELECT 
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(att.att_date) as total_attendance_records,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_count,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_count,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_count,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime_count,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%sick%' THEN 1 END) as sick_leave_count,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%vacation%' THEN 1 END) as vacation_leave_count,
        COUNT(CASE WHEN pay.pay_code_alias ILIKE '%maternal%' THEN 1 END) as maternal_leave_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM personnel_department d
      LEFT JOIN personnel_employee e ON d.id = e.department_id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id AND att.att_date BETWEEN $2 AND $3
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      WHERE d.id = $1
    `;
    
    const result = await query(sql, [departmentId, startDate, endDate]);
    return result.rows[0] || {};
  }

  // Get all employees with basic information
  static async getAllEmployees(filters?: EmployeeFilters): Promise<any[]> {
    let whereClause = '';
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.departmentId) {
      paramCount++;
      params.push(filters.departmentId);
      whereClause += ` WHERE e.department_id = $${paramCount}`;
    }

    if (filters?.isActive !== undefined) {
      paramCount++;
      params.push(filters.isActive);
      whereClause += whereClause ? ` AND e.is_active = $${paramCount}` : ` WHERE e.is_active = $${paramCount}`;
    }

    const sql = `
      SELECT 
        e.id,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.email,
        e.mobile as phone,
        e.position_id as position,
        e.department_id,
        e.is_active,
        e.hire_date,
        e.create_time as created_at,
        e.update_time as updated_at,
        d.dept_name,
        d.dept_code
      FROM personnel_employee e
      LEFT JOIN personnel_department d ON e.department_id = d.id
      ${whereClause}
      ORDER BY e.first_name, e.last_name
    `;
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get employee by ID with detailed information
  static async getEmployeeById(id: number): Promise<any> {
    const sql = `
      SELECT 
        e.id,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.email,
        e.mobile as phone,
        e.contact_tel as office_phone,
        e.position_id as position,
        e.department_id,
        e.is_active,
        e.hire_date,
        e.create_time as created_at,
        e.update_time as updated_at,
        e.gender,
        e.birthday,
        e.address,
        e.title,
        e.national,
        e.religion,
        e.ssn,
        d.dept_name,
        d.dept_code,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name,
        m.emp_code as manager_emp_code
      FROM personnel_employee e
      LEFT JOIN personnel_department d ON e.department_id = d.id
      LEFT JOIN personnel_employee m ON d.dept_manager_id = m.id
      WHERE e.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get employee attendance summary
  static async getEmployeeAttendanceSummary(employeeId: number, startDate: Date, endDate: Date): Promise<any> {
    const sql = `
      SELECT 
        COUNT(att.att_date) as total_days,
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
        AVG(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600) as avg_daily_hours,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM personnel_employee e
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id AND att.att_date BETWEEN $2 AND $3
      LEFT JOIN att_payloadpaycode pay ON att.id = pay.time_card_id
      WHERE e.id = $1
    `;
    
    const result = await query(sql, [employeeId, startDate, endDate]);
    return result.rows[0] || {};
  }

  // Get employees by department with attendance stats
  static async getEmployeesByDepartment(departmentId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
    const params: any[] = [departmentId];
    let dateCondition = '';
    
    if (startDate && endDate) {
      params.push(startDate, endDate);
      dateCondition = `AND att.att_date BETWEEN $2 AND $3`;
    }
    
    const sql = `
      SELECT 
        e.id,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.position_id as position,
        e.is_active,
        d.dept_name,
        COUNT(att.att_date) as total_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_days,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM personnel_employee e
      LEFT JOIN personnel_department d ON e.department_id = d.id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id ${dateCondition}
      WHERE e.department_id = $1
      GROUP BY e.id, e.emp_code, e.first_name, e.last_name, e.position_id, e.is_active, d.dept_name
      ORDER BY e.first_name, e.last_name
    `;
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get department performance report
  static async getDepartmentPerformanceReport(startDate: Date, endDate: Date): Promise<DepartmentReport[]> {
    const sql = `
      SELECT 
        d.id,
        d.dept_code,
        d.dept_name,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(att.att_date) as total_attendance_records,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_count,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_count,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage,
        ROUND(AVG(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600), 2) as avg_hours_worked
      FROM personnel_department d
      LEFT JOIN personnel_employee e ON d.id = e.department_id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id AND att.att_date BETWEEN $1 AND $2
      GROUP BY d.id, d.dept_code, d.dept_name
      ORDER BY attendance_percentage DESC, d.dept_name
    `;
    
    const result = await query(sql, [startDate, endDate]);
    return result.rows;
  }

  // Get employee performance report
  static async getEmployeePerformanceReport(departmentId?: number, startDate?: Date, endDate?: Date): Promise<EmployeeReport[]> {
    let whereClause = '';
    const params: any[] = [];
    
    if (departmentId) {
      params.push(departmentId);
      whereClause += ` WHERE e.department_id = $${params.length}`;
    }
    
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += whereClause ? 
        ` AND att.att_date BETWEEN $${params.length - 1} AND $${params.length}` : 
        ` WHERE att.att_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }
    
    const sql = `
      SELECT 
        e.id,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.position_id as position,
        d.dept_name,
        COUNT(att.att_date) as total_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_days,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_days,
        COUNT(CASE WHEN att.clock_out IS NOT NULL AND att.clock_out::time < '17:00:00' THEN 1 END) as early_leave_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600 > 8 THEN 1 END) as overtime_days,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage,
        ROUND(SUM(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600), 2) as total_hours_worked,
        ROUND(AVG(EXTRACT(EPOCH FROM (att.clock_out - att.clock_in))/3600), 2) as avg_daily_hours
      FROM personnel_employee e
      LEFT JOIN personnel_department d ON e.department_id = d.id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id
      ${whereClause}
      GROUP BY e.id, e.emp_code, e.first_name, e.last_name, e.position_id, d.dept_name
      ORDER BY attendance_percentage DESC, e.first_name, e.last_name
    `;
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get employee attendance trends
  static async getEmployeeAttendanceTrend(employeeId: number, months: number = 6): Promise<any[]> {
    const sql = `
      SELECT 
        DATE_TRUNC('month', att.att_date) as month,
        COUNT(att.att_date) as total_days,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_days,
        COUNT(CASE WHEN att.clock_in::time > '09:00:00' THEN 1 END) as late_days,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM att_payloadtimecard att
      WHERE att.emp_id = $1 
        AND att.att_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', att.att_date)
      ORDER BY month DESC
    `;
    
    const result = await query(sql, [employeeId]);
    return result.rows;
  }

  // Get department attendance trends
  static async getDepartmentAttendanceTrend(departmentId: number, months: number = 6): Promise<any[]> {
    const sql = `
      SELECT 
        DATE_TRUNC('month', att.att_date) as month,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(att.att_date) as total_attendance_records,
        COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) as present_count,
        COUNT(CASE WHEN att.clock_in IS NULL THEN 1 END) as absent_count,
        ROUND(
          COUNT(CASE WHEN att.clock_in IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(att.att_date), 0), 
          2
        ) as attendance_percentage
      FROM personnel_department d
      LEFT JOIN personnel_employee e ON d.id = e.department_id
      LEFT JOIN att_payloadtimecard att ON e.id = att.emp_id
      WHERE d.id = $1 
        AND att.att_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', att.att_date)
      ORDER BY month DESC
    `;
    
    const result = await query(sql, [departmentId]);
    return result.rows;
  }
}