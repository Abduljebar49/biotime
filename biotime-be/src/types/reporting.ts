// src/types/reporting.ts
export interface DepartmentFilters {
  isActive?: boolean;
}

export interface EmployeeFilters {
  departmentId?: number;
  isActive?: boolean;
}

export interface DepartmentReport {
  id: number;
  dept_code: string;
  dept_name: string;
  total_employees: number;
  total_attendance_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  early_leave_count: number;
  attendance_percentage: number;
  avg_hours_worked: number;
}

export interface EmployeeReport {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string;
  position: string;
  dept_name: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  early_leave_days: number;
  overtime_days: number;
  attendance_percentage: number;
  total_hours_worked: number;
  avg_daily_hours: number;
}

export interface AttendanceStats {
  total_employees?: number;
  total_attendance_records?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  early_leave_count?: number;
  overtime_count?: number;
  sick_leave_count?: number;
  vacation_leave_count?: number;
  maternal_leave_count?: number;
  attendance_percentage?: number;
}