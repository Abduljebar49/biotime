import React, { useState, useEffect } from "react";
import { useEmployeeStore } from "../stores/employee.store";
import EmployeeList from "../components/employee/EmployeeList";
import EmployeeDetail from "../components/employee/EmployeeDetail";
import EmployeeAnalytics from "../components/employee/EmployeeAnalytics";

import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { useDepartmentStore } from "../stores/department.store";

const EmployeeManagement: React.FC = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [view, setView] = useState<"list" | "detail" | "analytics">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const {
    employees,
    currentEmployee,
    employeeAttendanceSummary,
    employeeAttendanceTrend,
    loading,
    error,
    getAllEmployees,
    getEmployeeById,
    getEmployeeAttendanceSummary,
    getEmployeeAttendanceTrend,
    searchEmployees,
    getEmployeesByDepartment,
    clearError,
    clearCurrentEmployee,
  } = useEmployeeStore();

  const { departments, getAllDepartments } = useDepartmentStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const loadInitialData = async () => {
    try {
      await Promise.all([getAllEmployees(), getAllDepartments()]);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const handleEmployeeSelect = async (employeeId: number) => {
    try {
      setSelectedEmployeeId(employeeId);
      await Promise.all([
        getEmployeeById(employeeId),
        getEmployeeAttendanceSummary(
          employeeId,
          new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
          new Date().toISOString().split("T")[0]
        ),
        getEmployeeAttendanceTrend(employeeId),
      ]);
      setView("detail");
    } catch (err) {
      console.error("Error loading employee details:", err);
    }
  };

  const handleViewAnalytics = () => {
    setView("analytics");
  };

  const handleBackToList = () => {
    setSelectedEmployeeId(null);
    setView("list");
    clearCurrentEmployee();
  };

  const filteredEmployees = () => {
    let filtered = employees;

    if (searchQuery) {
      filtered = searchEmployees(searchQuery);
    }

    if (departmentFilter) {
      filtered = getEmployeesByDepartment(parseInt(departmentFilter));
    }

    return filtered;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Employee Management
        </h1>
      </div>

      {/* Filters and Search (only show in list view) */}
      {view === "list" && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Employees
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {view !== "list" && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={handleBackToList}
            className="hover:text-primary transition-colors"
          >
            Employees
          </button>
          <span>/</span>
          <span className="text-gray-800 capitalize">
            {view === "detail" && "Employee Details"}
            {view === "analytics" && "Analytics"}
          </span>
        </nav>
      )}

      <div className="bg-white rounded-xl shadow">
        {view === "list" && (
          <EmployeeList
            employees={filteredEmployees()}
            onSelectEmployee={handleEmployeeSelect}
          />
        )}

        {view === "detail" && currentEmployee && (
          <EmployeeDetail
            employee={currentEmployee}
            attendanceSummary={employeeAttendanceSummary}
            onViewAnalytics={handleViewAnalytics}
            onBack={handleBackToList}
          />
        )}

        {view === "analytics" && currentEmployee && (
          <EmployeeAnalytics
            employee={currentEmployee}
            attendanceTrend={employeeAttendanceTrend}
            onBack={() => setView("detail")}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
