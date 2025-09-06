// src/types/attendance.ts
export interface AttendanceFilters {
  employeeId?: number;
  departmentId?: number;
  startDate: Date;
  endDate: Date;
  periodType?: 'day' | 'week' | 'month' | 'custom';
}

export interface AttendanceRecord {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string;
  department_id: number;
  dept_name: string;
  att_date: Date;
  check_in: Date | null;
  check_out: Date | null;
  duration: number | null;
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

export interface AttendanceSummary {
  date: Date;
  present: number;
  absent: number;
  late: number;
  early_leave: number;
}