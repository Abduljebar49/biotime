import { create } from "zustand";
import api from "../api";

// Types based on the API responses
export interface AttendanceRecord {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  department_id: number;
  dept_name: string;
  att_date: string;
  week_day: string;
  clock_in: string | null;
  clock_out: string | null;
  hours_worked: string | null;
  check_in: string | null;
  check_out: string | null;
  work_day: string;
  pay_code_alias: string | null;
  status: string;
  absence_reason: string;
}

export interface AttendanceSummary {
  date: string;
  week_day: string;
  total_employees: string;
  present: string;
  absent: string;
  late: string;
  early_leave: string;
  overtime: string;
  sick_leave: string;
  vacation_leave: string;
  maternal_leave: string;
  annual_leave: string;
  business_trip: string;
}

export interface DepartmentAttendanceSummary {
  department_id: number;
  dept_name: string;
  total_employees: string;
  total_attendance_records: string;
  present_count: string;
  absent_count: string;
  late_count: string;
  early_leave_count: string;
  overtime_count: string;
  attendance_percentage: string | null;
}

export interface PeriodAttendance {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  total_days: string;
  present_days: string;
  absent_days: string;
  late_days: string;
  early_leave_days: string;
  overtime_days: string;
  sick_leave_days: string;
  vacation_leave_days: string;
  maternal_leave_days: string;
  annual_leave_days: string;
}

export interface EmployeeMonthlyAttendance {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  total_working_days: string;
  present_days: string;
  absent_days: string;
  late_days: string;
  early_leave_days: string;
  overtime_days: string;
  sick_leave_days: string;
  vacation_leave_days: string;
  maternal_leave_days: string;
  annual_leave_days: string;
  total_hours_worked: string | null;
  avg_daily_hours: string | null;
}

export interface LateEmployee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  att_date: string;
  week_day: string;
  check_in_time: string;
  minutes_late: number;
}

export interface RepeatedViolation {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  violation_count: number;
  violation_dates: string[];
}

export interface AbsenceReason {
  employee_id: number;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  att_date: string;
  absence_reason: string;
}

export interface EarlyLeaveEmployee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  att_date: string;
  week_day: string;
  check_out_time: string;
  minutes_early: number;
}

export interface AbsentEmployee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  att_date: string;
  week_day: string;
  pay_code_alias: string | null;
  absence_reason: string;
}

export interface TodayReport {
  total_employees: string;
  present_today: string;
  absent_today: string;
}

export interface WeeklyReport {
  att_date: string;
  present: number;
  absent: number;
}

export interface MonthlyReport {
  total_days: string;
  total_present: string;
  total_absent: string;
}

export interface RecentCheckIn {
  employee_id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  dept_name: string;
  check_in_time: string;
  check_in_time_formatted: string;
  week_day: string;
  status: string;
}

export interface DashboardOverview {
  today: TodayReport;
  weekly: WeeklyReport[];
  recentCheckIns: RecentCheckIn[];
}

export interface DailyStatsDetails {
  absent: AbsentEmployee[];
  late: LateEmployee[];
  earlyLeave: EarlyLeaveEmployee[];
  overtime: any[]; // Adjust type based on actual data structure
}

export interface DailyStats {
  date: string;
  absentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  overtimeCount: number;
  details: DailyStatsDetails;
}

export interface AttendanceState {
  // Records and summaries
  attendanceRecords: AttendanceRecord[];
  attendanceSummary: AttendanceSummary[];
  departmentAttendanceSummary: DepartmentAttendanceSummary[];
  periodAttendance: PeriodAttendance[];
  
  // Employee-specific data
  employeeMonthlyAttendance: EmployeeMonthlyAttendance | null;
  
  // Violations and exceptions
  lateEmployees: LateEmployee[];
  repeatedViolations: RepeatedViolation[];
  absenceReasons: AbsenceReason[];
  earlyLeaveEmployees: EarlyLeaveEmployee[];
  absentEmployees: AbsentEmployee[];
  
  // Reports
  todayReport: TodayReport | null;
  weeklyReport: WeeklyReport[];
  monthlyReport: MonthlyReport | null;
  
  // Dashboard data
  dashboardOverview: DashboardOverview | null;
  dailyStats: DailyStats | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface AttendanceActions {
  // Records and summaries
  getAttendanceRecords: (startDate: string, endDate: string) => Promise<AttendanceRecord[]>;
  getAttendanceSummary: (startDate: string, endDate: string) => Promise<AttendanceSummary[]>;
  getDepartmentAttendanceSummary: () => Promise<DepartmentAttendanceSummary[]>;
  getPeriodAttendance: (startDate: string, endDate: string, periodType: string) => Promise<PeriodAttendance[]>;
  
  // Employee-specific data
  getEmployeeMonthlyAttendance: (id: number) => Promise<EmployeeMonthlyAttendance>;
  
  // Violations and exceptions
  getLateEmployees: (date: string, departmentId?: number) => Promise<LateEmployee[]>;
  getRepeatedViolations: (date: string, violationType: 'absent' | 'late') => Promise<RepeatedViolation[]>;
  getAbsenceReasons: (date: string) => Promise<AbsenceReason[]>;
  getEarlyLeaveEmployees: (date: string, departmentId?: number) => Promise<EarlyLeaveEmployee[]>;
  getAbsentEmployees: (date: string, departmentId?: number) => Promise<AbsentEmployee[]>;
  
  // Reports
  getTodayReport: () => Promise<TodayReport>;
  getWeeklyReport: () => Promise<WeeklyReport[]>;
  getMonthlyReport: () => Promise<MonthlyReport>;
  
  // Dashboard data
  getDashboardOverview: () => Promise<DashboardOverview>;
  getDailyStats: (date: string) => Promise<DailyStats>;
  
  // Utility methods
  clearError: () => void;
  clearMessage: () => void;
  clearData: () => void;
}

type AttendanceStore = AttendanceState & AttendanceActions;

export const useAttendanceStore = create<AttendanceStore>()(
  (set, _) => ({
    attendanceRecords: [],
    attendanceSummary: [],
    departmentAttendanceSummary: [],
    periodAttendance: [],
    employeeMonthlyAttendance: null,
    lateEmployees: [],
    repeatedViolations: [],
    absenceReasons: [],
    earlyLeaveEmployees: [],
    absentEmployees: [],
    todayReport: null,
    weeklyReport: [],
    monthlyReport: null,
    dashboardOverview: null,
    dailyStats: null,
    loading: false,
    error: null,
    message: null,

    // Actions
    getAttendanceRecords: async (startDate: string, endDate: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/records', {
          params: { startDate, endDate }
        });
        const records = response.data;
        
        set({ 
          attendanceRecords: records,
          loading: false 
        });
        
        return records;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch attendance records";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getAttendanceSummary: async (startDate: string, endDate: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/summary', {
          params: { startDate, endDate }
        });
        const summary = response.data;
        
        set({ 
          attendanceSummary: summary,
          loading: false 
        });
        
        return summary;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch attendance summary";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getDepartmentAttendanceSummary: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/department-summary');
        const summary = response.data;
        
        set({ 
          departmentAttendanceSummary: summary,
          loading: false 
        });
        
        return summary;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch department attendance summary";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getPeriodAttendance: async (startDate: string, endDate: string, periodType: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/period', {
          params: { startDate, endDate, periodType }
        });
        const periodData = response.data;
        
        set({ 
          periodAttendance: periodData,
          loading: false 
        });
        
        return periodData;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch period attendance";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getEmployeeMonthlyAttendance: async (id: number) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get(`/attendance/employee-monthly/${id}`);
        const monthlyData = response.data;
        
        set({ 
          employeeMonthlyAttendance: monthlyData,
          loading: false 
        });
        
        return monthlyData;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch employee monthly attendance";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getLateEmployees: async (date: string, departmentId?: number) => {
      set({ loading: true, error: null });
      try {
        const params: any = { date };
        if (departmentId) params.departmentId = departmentId;
        
        const response = await api.get('/attendance/late', { params });
        const lateEmployees = response.data;
        
        set({ 
          lateEmployees,
          loading: false 
        });
        
        return lateEmployees;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch late employees";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getRepeatedViolations: async (date: string, violationType: 'absent' | 'late') => {
      set({ loading: true, error: null });
      try {
        // Extract month and year from date
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1; // getMonth() returns 0-11
        const year = dateObj.getFullYear();
        
        const response = await api.get('/attendance/repeated-violations', {
          params: { month, year, violationType }
        });
        const violations = response.data;
        
        set({ 
          repeatedViolations: violations,
          loading: false 
        });
        
        return violations;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch repeated violations";
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
        const response = await api.get('/attendance/absence-reasons', {
          params: { date }
        });
        const absenceReasons = response.data;
        
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

    getEarlyLeaveEmployees: async (date: string, departmentId?: number) => {
      set({ loading: true, error: null });
      try {
        const params: any = { date };
        if (departmentId) params.departmentId = departmentId;
        
        const response = await api.get('/attendance/early-leave', { params });
        const earlyLeaveEmployees = response.data;
        
        set({ 
          earlyLeaveEmployees,
          loading: false 
        });
        
        return earlyLeaveEmployees;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch early leave employees";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getAbsentEmployees: async (date: string, departmentId?: number) => {
      set({ loading: true, error: null });
      try {
        const params: any = { date };
        if (departmentId) params.departmentId = departmentId;
        
        const response = await api.get('/attendance/absent', { params });
        const absentEmployees = response.data;
        
        set({ 
          absentEmployees,
          loading: false 
        });
        
        return absentEmployees;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch absent employees";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getTodayReport: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/report/today');
        const todayReport = response.data;
        
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
        const response = await api.get('/attendance/report/weekly');
        const weeklyReport = response.data;
        
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
        const response = await api.get('/attendance/report/monthly');
        const monthlyReport = response.data;
        
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

    getDashboardOverview: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/dashboard/overview');
        const dashboardOverview = response.data;
        
        set({ 
          dashboardOverview,
          loading: false 
        });
        
        return dashboardOverview;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch dashboard overview";
        set({
          error: errorMessage,
          loading: false,
        });
        throw new Error(errorMessage);
      }
    },

    getDailyStats: async (date: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.get('/attendance/dashboard/daily-stats', {
          params: { date }
        });
        const dailyStats = response.data;
        
        set({ 
          dailyStats,
          loading: false 
        });
        
        return dailyStats;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch daily stats";
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
        attendanceRecords: [],
        attendanceSummary: [],
        departmentAttendanceSummary: [],
        periodAttendance: [],
        employeeMonthlyAttendance: null,
        lateEmployees: [],
        repeatedViolations: [],
        absenceReasons: [],
        earlyLeaveEmployees: [],
        absentEmployees: [],
        todayReport: null,
        weeklyReport: [],
        monthlyReport: null,
        dashboardOverview: null,
        dailyStats: null,
      });
    },
  })
);