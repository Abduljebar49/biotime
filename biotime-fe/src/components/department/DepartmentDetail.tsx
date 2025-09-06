import React from 'react';
import type { Department, DepartmentEmployee, DepartmentStats } from '../../stores/department.store';

interface DepartmentDetailProps {
  department: Department;
  stats: DepartmentStats | null;
  employees: DepartmentEmployee[];
  onViewAnalytics: () => void;
//   onEdit: () => void;
  onBack: () => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  department,
  stats,
  employees,
  onViewAnalytics,
//   onEdit,
  onBack,
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 mb-4 sm:mb-0"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to list
          </button>
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            {department.dept_name}
          </h2>
          <p className="text-gray-600">{department.dept_code}</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onViewAnalytics}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-chart-line mr-2"></i>Analytics
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateRangeChange(e.target.value, dateRange.endDate)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="self-center text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateRangeChange(dateRange.startDate, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Information */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-building text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold">{department.dept_name}</h3>
              <p className="text-gray-600">{department.dept_code}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Manager</label>
                <p className="text-gray-900">
                  {department.manager_first_name && department.manager_last_name 
                    ? `${department.manager_first_name} ${department.manager_last_name}`
                    : 'Not assigned'
                  }
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Manager Code</label>
                <p className="text-gray-900">{department.manager_emp_code || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Total Employees</label>
                <p className="text-gray-900">{department.employee_count || '0'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  department.is_default 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {department.is_default ? 'Default Department' : 'Active Department'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
            
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.present_count}
                  </div>
                  <div className="text-sm text-green-800">Present</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.absent_count}
                  </div>
                  <div className="text-sm text-red-800">Absent</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.late_count}
                  </div>
                  <div className="text-sm text-yellow-800">Late</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.attendance_percentage}%
                  </div>
                  <div className="text-sm text-blue-800">Attendance Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-bar text-3xl mb-2"></i>
                <p>No attendance data available</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Leave Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">{stats?.sick_leave_count || 0}</div>
                  <div className="text-xs text-purple-800">Sick Leave</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded">
                  <div className="font-bold text-indigo-600">{stats?.vacation_leave_count || 0}</div>
                  <div className="text-xs text-indigo-800">Vacation</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded">
                  <div className="font-bold text-pink-600">{stats?.maternal_leave_count || 0}</div>
                  <div className="text-xs text-pink-800">Maternal</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{stats?.early_leave_count || 0}</div>
                  <div className="text-xs text-orange-800">Early Leave</div>
                </div>
              </div>
            </div>
          </div>

          {/* Employees List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Department Employees</h3>
              <span className="text-sm text-gray-600">{employees.length} employees</span>
            </div>
            
            {employees.length > 0 ? (
              <div className="space-y-3">
                {employees.slice(0, 5).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-user text-gray-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {employee.attendance_percentage}% attendance
                      </p>
                    </div>
                  </div>
                ))}
                {employees.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-primary hover:text-blue-600 text-sm">
                      View all {employees.length} employees
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-3xl mb-2"></i>
                <p>No employees in this department</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;