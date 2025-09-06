import React from 'react';
import type { Employee, EmployeeAttendanceSummary } from '../../stores/employee.store';

interface EmployeeDetailProps {
  employee: Employee;
  attendanceSummary: EmployeeAttendanceSummary | null;
  onViewAnalytics: () => void;
//   onEdit: () => void;
  onBack: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  attendanceSummary,
  onViewAnalytics,
//   onEdit,
  onBack
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
            {employee.first_name} {employee.last_name}
          </h2>
          <p className="text-gray-600">{employee.emp_code}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user text-3xl text-gray-600"></i>
              </div>
              <h3 className="text-lg font-semibold">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-gray-600">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.dept_name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Employee Code</label>
                <p className="text-gray-900">{employee.emp_code}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{employee.email || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{employee.phone || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Hire Date</label>
                <p className="text-gray-900">{new Date(employee.hire_date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  employee.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance Summary (This Month)</h3>
            
            {attendanceSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceSummary.present_days}
                  </div>
                  <div className="text-sm text-green-800">Present</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceSummary.absent_days}
                  </div>
                  <div className="text-sm text-red-800">Absent</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attendanceSummary.late_days}
                  </div>
                  <div className="text-sm text-yellow-800">Late</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceSummary.total_hours_worked || '0'}
                  </div>
                  <div className="text-sm text-blue-800">Total Hours</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-bar text-3xl mb-2"></i>
                <p>No attendance data available</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Leave Balance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sick Leave</span>
                  <span className="font-medium">{attendanceSummary?.sick_leave_days || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vacation Leave</span>
                  <span className="font-medium">{attendanceSummary?.vacation_leave_days || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Annual Leave</span>
                  <span className="font-medium">{attendanceSummary?.annual_leave_days || 0} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  <span>Checked in today at 08:45 AM</span>
                </div>
                <span className="text-sm text-gray-500">Today</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-times-circle text-red-500 mr-3"></i>
                  <span>Absent due to sick leave</span>
                </div>
                <span className="text-sm text-gray-500">Yesterday</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-clock text-yellow-500 mr-3"></i>
                  <span>Late arrival at 09:30 AM</span>
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;