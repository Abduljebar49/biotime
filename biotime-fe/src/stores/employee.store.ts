import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api";

// Types based on the API responses
export interface Employee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  office_phone?: string;
  position: string | null;
  department_id: number;
  is_active: boolean;
  hire_date: string;
  created_at: string;
  updated_at: string;
  gender?: string;
  birthday?: string | null;
  address?: string;
  title?: string | null;
  national?: string;
  religion?: string;
  ssn?: string | null;
  dept_name: string;
  dept_code: string;
  manager_first_name?: string | null;
  manager_last_name?: string | null;
  manager_emp_code?: string | null;
}

export interface EmployeeAttendanceSummary {
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
  total_hours_worked: string | null;
  avg_daily_hours: string | null;
  attendance_percentage: string;
}

export interface EmployeePerformance {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string | null;
  position: string | null;
  dept_name: string;
  total_days: string;
  present_days: string;
  absent_days: string;
  late_days: string;
  early_leave_days: string;
  overtime_days: string;
  attendance_percentage: string;
  total_hours_worked: string | null;
  avg_daily_hours: string | null;
}

export interface EmployeeAttendanceTrend {
  month: string;
  total_days: string;
  present_days: string;
  absent_days: string;
  late_days: string;
  attendance_percentage: string;
}

export interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  employeeAttendanceSummary: EmployeeAttendanceSummary | null;
  employeePerformance: EmployeePerformance[];
  employeeAttendanceTrend: EmployeeAttendanceTrend[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface EmployeeActions {
  // Employee actions
  getAllEmployees: () => Promise<Employee[]>;
  getEmployeeById: (id: number) => Promise<Employee>;
  getEmployeeAttendanceSummary: (id: number, startDate: string, endDate: string) => Promise<EmployeeAttendanceSummary>;
  getEmployeePerformance: (startDate: string, endDate: string) => Promise<EmployeePerformance[]>;
  getEmployeeAttendanceTrend: (id: number) => Promise<EmployeeAttendanceTrend[]>;
  
  // Search and filter
  searchEmployees: (query: string) => Employee[];
  getEmployeesByDepartment: (departmentId: number) => Employee[];
  
  // Utility methods
  clearError: () => void;
  clearMessage: () => void;
  clearCurrentEmployee: () => void;
}

type EmployeeStore = EmployeeState & EmployeeActions;

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      employees: [],
      currentEmployee: null,
      employeeAttendanceSummary: null,
      employeePerformance: [],
      employeeAttendanceTrend: [],
      loading: false,
      error: null,
      message: null,

      // Actions
      getAllEmployees: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/employees');
          const employees = response.data;
          
          set({ 
            employees,
            loading: false 
          });
          
          return employees;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch employees";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getEmployeeById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/employees/${id}`);
          const employee = response.data;
          
          set({ 
            currentEmployee: employee,
            loading: false 
          });
          
          return employee;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch employee";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getEmployeeAttendanceSummary: async (id: number, startDate: string, endDate: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/employees/${id}/attendance-summary`, {
            params: { startDate, endDate }
          });
          const summary = response.data;
          
          set({ 
            employeeAttendanceSummary: summary,
            loading: false 
          });
          
          return summary;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch employee attendance summary";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getEmployeePerformance: async (startDate: string, endDate: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/reports/employee-performance', {
            params: { startDate, endDate }
          });
          const performance = response.data;
          
          set({ 
            employeePerformance: performance,
            loading: false 
          });
          
          return performance;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch employee performance";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      getEmployeeAttendanceTrend: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/employees/${id}/attendance-trend`);
          const trend = response.data;
          
          set({ 
            employeeAttendanceTrend: trend,
            loading: false 
          });
          
          return trend;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Failed to fetch employee attendance trend";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Search employees by name, code, or department
      searchEmployees: (query: string) => {
        const { employees } = get();
        if (!query.trim()) return employees;
        
        const lowerQuery = query.toLowerCase();
        return employees.filter(employee => 
          employee.first_name?.toLowerCase().includes(lowerQuery) ||
          employee.last_name?.toLowerCase().includes(lowerQuery) ||
          employee.emp_code?.toLowerCase().includes(lowerQuery) ||
          employee.dept_name?.toLowerCase().includes(lowerQuery)
        );
      },

      // Get employees by department
      getEmployeesByDepartment: (departmentId: number) => {
        const { employees } = get();
        return employees.filter(employee => employee.department_id === departmentId);
      },

      clearError: () => {
        set({ error: null });
      },

      clearMessage: () => {
        set({ message: null });
      },

      clearCurrentEmployee: () => {
        set({ 
          currentEmployee: null,
          employeeAttendanceSummary: null,
          employeeAttendanceTrend: [] 
        });
      },
    }),
    {
      name: "employee-storage",
      partialize: (state) => ({
        employees: state.employees,
      }),
    }
  )
);