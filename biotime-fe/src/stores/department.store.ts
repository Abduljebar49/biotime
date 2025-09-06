import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api";

export interface Department {
  id: number;
  dept_code: string;
  dept_name: string;
  is_default: boolean;
  company_id: number;
  dept_manager_id: number | null;
  parent_dept_id: number | null;
  manager_first_name?: string | null;
  manager_last_name?: string | null;
  manager_emp_code?: string | null;
  employee_count?: string;
}

export interface DepartmentStats {
  total_employees: string;
  total_attendance_records: string;
  present_count: string;
  absent_count: string;
  late_count: string;
  early_leave_count: string;
  overtime_count: string;
  sick_leave_count: string;
  vacation_leave_count: string;
  maternal_leave_count: string;
  attendance_percentage: string;
}

export interface DepartmentEmployee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  position: string | null;
  is_active: boolean;
  dept_name: string;
  total_days: string;
  present_days: string;
  absent_days: string;
  attendance_percentage: string;
}

export interface DepartmentTrend {
  month: string;
  total_employees: string;
  total_attendance_records: string;
  present_count: string;
  absent_count: string;
  attendance_percentage: string;
}

export interface DepartmentPerformance {
  id: number;
  dept_code: string;
  dept_name: string;
  total_employees: string;
  total_attendance_records: string;
  present_count: string;
  absent_count: string;
  late_count: string;
  early_leave_count: string;
  attendance_percentage: string | null;
  avg_hours_worked: string | null;
}

// New interfaces for dashboard reporting
export interface DashboardSummary {
  totalDepartments: number;
  totalEmployees: number;
  activeDepartments: number;
  activeEmployees: number;
}

export interface DashboardReporting {
  summary: DashboardSummary;
  departmentPerformance: DepartmentPerformance[];
  recentDepartments: Department[];
}

export interface DepartmentState {
  departments: Department[];
  currentDepartment: Department | null;
  departmentStats: DepartmentStats | null;
  departmentEmployees: DepartmentEmployee[];
  departmentTrend: DepartmentTrend[];
  departmentPerformance: DepartmentPerformance[];
  dashboardReporting: DashboardReporting | null; // New state for dashboard reporting
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface DepartmentActions {
  // Department actions
  getAllDepartments: () => Promise<Department[]>;
  getDepartmentById: (id: number) => Promise<Department>;
  getDepartmentStats: (id: number, startDate: string, endDate: string) => Promise<DepartmentStats>;
  getEmployeesByDepartment: (id: number) => Promise<DepartmentEmployee[]>;
  getDepartmentTrend: (id: number) => Promise<DepartmentTrend[]>;
  getDepartmentPerformance: (startDate: string, endDate: string) => Promise<DepartmentPerformance[]>;
  
  // New dashboard reporting action
  getDashboardReporting: () => Promise<DashboardReporting>;
  
  // Utility methods
  clearError: () => void;
  clearMessage: () => void;
}

type DepartmentStore = DepartmentState & DepartmentActions;

export const useDepartmentStore = create<DepartmentStore>()(
  persist(
    (set, _) => ({
      departments: [],
      currentDepartment: null,
      departmentStats: null,
      departmentEmployees: [],
      departmentTrend: [],
      departmentPerformance: [],
      dashboardReporting: null, // Initialize dashboard reporting
      loading: false,
      error: null,
      message: null,

      getAllDepartments: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/departments');
          const departments = response.data;
          
          set({ 
            departments,
            loading: false 
          });
          
          return departments;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch departments";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getDepartmentById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/departments/${id}`);
          const department = response.data;
          
          set({ 
            currentDepartment: department,
            loading: false 
          });
          
          return department;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch department";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getDepartmentStats: async (id: number, startDate: string, endDate: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/departments/${id}/attendance-stats`, {
            params: { startDate, endDate }
          });
          const stats = response.data;
          
          set({ 
            departmentStats: stats,
            loading: false 
          });
          
          return stats;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch department stats";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getEmployeesByDepartment: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/departments/${id}/employees`);
          const employees = response.data;
          
          set({ 
            departmentEmployees: employees,
            loading: false 
          });
          
          return employees;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch department employees";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getDepartmentTrend: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/departments/${id}/attendance-trend`);
          const trend = response.data;
          
          set({ 
            departmentTrend: trend,
            loading: false 
          });
          
          return trend;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch department trend";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getDepartmentPerformance: async (startDate: string, endDate: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/reports/department-performance', {
            params: { startDate, endDate }
          });
          const performance = response.data;
          set({ 
            departmentPerformance: performance,
            loading: false 
          });
          
          return performance;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch department performance";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // New method for dashboard reporting
      getDashboardReporting: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/dashboard/reporting');
          const dashboardData = response.data;
          
          set({ 
            dashboardReporting: dashboardData,
            loading: false 
          });
          
          return dashboardData;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch dashboard reporting data";
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
    }),
    {
      name: "department-storage",
      partialize: (state) => ({
        departments: state.departments,
        currentDepartment: state.currentDepartment,
        dashboardReporting: state.dashboardReporting, // Include dashboard reporting in persistence
      }),
    }
  )
);