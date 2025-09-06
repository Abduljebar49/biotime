import { create } from "zustand";
import api from "../api";

export interface TodayReport {
  total_employees: number;
  present_today: number;
  absent_today: number;
  late_count: number;
  early_leave_count: number;
  overtime_count: number;
  attendance_percentage: number;
  present_employees?: any[];
  absent_employees?: any[];
}

export interface WeeklyReport {
  att_date: string;
  week_day: string;
  total_employees: number;
  present: number;
  absent: number;
  late: number;
  early_leave: number;
  overtime: number;
  attendance_percentage: number;
}

export interface MonthlyReport {
  total_employees: number;
  total_days: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_early_leave: number;
  total_overtime: number;
  sick_leave_count: number;
  vacation_leave_count: number;
  maternal_leave_count: number;
  attendance_percentage: number;
  avg_daily_hours: number;
}

export interface AbsenceReason {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  department_id: number;
  dept_name: string;
  dept_code: string;
  att_date: string;
  week_day: string;
  pay_code_alias: string | null;
  absence_reason: string;
  attendance_status: string;
}

export interface RecentAttendance {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  department_id: number;
  dept_name: string;
  dept_code: string;
  check_in_time: string;
  check_in_time_formatted: string;
  week_day: string;
  status: string;
  minutes_late: number;
}

export interface DepartmentWiseReport {
  department_id: number;
  dept_name: string;
  dept_code: string;
  total_employees: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

export interface EmployeePerformance {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  department_id: number;
  dept_name: string;
  dept_code: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  early_leave_days: number;
  attendance_percentage: number;
  total_hours_worked: number;
}

export interface AttendanceTrend {
  date: string;
  week_day: string;
  total_employees: number;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
}

export interface ReportingState {
  // Reports
  todayReport: TodayReport | null;
  weeklyReport: WeeklyReport[];
  monthlyReport: MonthlyReport | null;
  absenceReasons: AbsenceReason[];
  recentAttendance: RecentAttendance[];
  departmentWiseReport: DepartmentWiseReport[];
  employeePerformance: EmployeePerformance[];
  attendanceTrend: AttendanceTrend[];
  
  // UI state
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface ReportingActions {
  // Reports
  getTodayReport: () => Promise<TodayReport>;
  getWeeklyReport: () => Promise<WeeklyReport[]>;
  getMonthlyReport: () => Promise<MonthlyReport>;
  getAbsenceReasons: (date: string) => Promise<AbsenceReason[]>;
  getRecentAttendance: (limit?: number) => Promise<RecentAttendance[]>;
  getDepartmentWiseReport: () => Promise<DepartmentWiseReport[]>;
  getEmployeePerformance: () => Promise<EmployeePerformance[]>;
  getAttendanceTrend: (days?: number) => Promise<AttendanceTrend[]>;
  
  // Utility methods
  clearError: () => void;
  clearMessage: () => void;
  clearData: () => void;
}

type ReportingStore = ReportingState & ReportingActions;

export const useReportingStore = create<ReportingStore>()(
  (set, _) => ({
    // Initial state
    todayReport: null,
    weeklyReport: [],
    monthlyReport: null,
    absenceReasons: [],
    recentAttendance: [],
    departmentWiseReport: [],
    employeePerformance: [],
    attendanceTrend: [],
    loading: false,
    error: null,
    message: null,

    // Actions
    getTodayReport: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/today');
        const todayReport = response.data.data;
        
        set({ 
          todayReport,
          loading: false 
        });
        
        return todayReport;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch today's report";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getWeeklyReport: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/weekly');
        const weeklyReport = response.data.data;
        
        set({ 
          weeklyReport,
          loading: false 
        });
        
        return weeklyReport;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch weekly report";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getMonthlyReport: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/monthly');
        const monthlyReport = response.data.data;
        
        set({ 
          monthlyReport,
          loading: false 
        });
        
        return monthlyReport;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch monthly report";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getAbsenceReasons: async (date: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/absence-reasons', {
          params: { date }
        });
        const absenceReasons = response.data.data;
        
        set({ 
          absenceReasons,
          loading: false 
        });
        
        return absenceReasons;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch absence reasons";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getRecentAttendance: async (limit: number = 20) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/recent-attendance', {
          params: { limit }
        });
        const recentAttendance = response.data.data;
        
        set({ 
          recentAttendance,
          loading: false 
        });
        
        return recentAttendance;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch recent attendance";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getDepartmentWiseReport: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/department-wise');
        const departmentWiseReport = response.data.data;
        
        set({ 
          departmentWiseReport,
          loading: false 
        });
        
        return departmentWiseReport;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch department-wise report";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getEmployeePerformance: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/employee-performance');
        const employeePerformance = response.data.data;
        
        set({ 
          employeePerformance,
          loading: false 
        });
        
        return employeePerformance;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch employee performance report";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getAttendanceTrend: async (days: number = 30) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/reports/attendance-trend', {
          params: { days }
        });
        const attendanceTrend = response.data.data;
        
        set({ 
          attendanceTrend,
          loading: false 
        });
        
        return attendanceTrend;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch attendance trend";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    clearError: () => {
      set({ error: null });
    },

    clearMessage: () => {
      set({ message: null });
    },

    clearData: () => {
      set({
        todayReport: null,
        weeklyReport: [],
        monthlyReport: null,
        absenceReasons: [],
        recentAttendance: [],
        departmentWiseReport: [],
        employeePerformance: [],
        attendanceTrend: [],
      });
    },
  })
);