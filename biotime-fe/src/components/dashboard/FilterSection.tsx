import React from "react";
import type { Employee } from "../../stores/employee.store";
import type { Department } from "../../stores/department.store";

interface FilterSectionProps {
  filters: {
    startDate: string;
    endDate: string;
    departmentId: string;
    status: string;
    employeeId: string;
  };
  departments: Department[];
  employees: Employee[];
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  departments,
  employees,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="self-center text-gray-500">to</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            name="departmentId"
            value={filters.departmentId}
            onChange={onFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
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
          <select
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-32"
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="early_leave">Early Leave</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            name="employeeId"
            value={filters.employeeId}
            onChange={onFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onApplyFilters}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <i className="fas fa-filter mr-2"></i>Apply Filters
        </button>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterSection;