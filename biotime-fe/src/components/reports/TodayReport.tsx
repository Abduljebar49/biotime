// components/reports/TodayReport.tsx
import React from 'react';
import type { TodayReport as TodayReportType } from '../../stores/reporting.store';

interface TodayReportProps {
  report: TodayReportType;
}

const TodayReport: React.FC<TodayReportProps> = ({ report }) => {
  const stats = [
    {
      label: 'Total Employees',
      value: report.total_employees,
      icon: 'fas fa-users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Present Today',
      value: report.present_today,
      icon: 'fas fa-check-circle',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Absent Today',
      value: report.absent_today,
      icon: 'fas fa-times-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Late Count',
      value: report.late_count,
      icon: 'fas fa-clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Early Leave',
      value: report.early_leave_count,
      icon: 'fas fa-sign-out-alt',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Overtime',
      value: report.overtime_count,
      icon: 'fas fa-business-time',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
            <div className="flex items-center">
              <div className={`text-2xl ${stat.color} mr-3`}>
                <i className={stat.icon}></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Percentage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Rate</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${report.attendance_percentage}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {report.attendance_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Present/Absent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {report.present_employees && report.present_employees.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              Present Employees ({report.present_employees.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {report.present_employees.map((employee: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">
                    {employee.first_name} {employee.last_name}
                  </span>
                  <span className="text-xs text-gray-500">{employee.department}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.absent_employees && report.absent_employees.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-times-circle text-red-500 mr-2"></i>
              Absent Employees ({report.absent_employees.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {report.absent_employees.map((employee: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">
                    {employee.first_name} {employee.last_name}
                  </span>
                  <span className="text-xs text-gray-500">{employee.department}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayReport;