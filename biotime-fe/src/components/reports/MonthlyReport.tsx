// components/reports/MonthlyReport.tsx
import React from 'react';
import type { MonthlyReport as MonthlyReportType } from '../../stores/reporting.store';

interface MonthlyReportProps {
  report: MonthlyReportType;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ report }) => {
  const stats = [
    {
      label: 'Total Working Days',
      value: report.total_days,
      icon: 'fas fa-calendar-alt',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Present',
      value: report.total_present,
      icon: 'fas fa-check-circle',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Absent',
      value: report.total_absent,
      icon: 'fas fa-times-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Total Late',
      value: report.total_late,
      icon: 'fas fa-clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Total Early Leave',
      value: report.total_early_leave,
      icon: 'fas fa-sign-out-alt',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Total Overtime',
      value: report.total_overtime,
      icon: 'fas fa-business-time',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const leaveStats = [
    {
      label: 'Sick Leave',
      value: report.sick_leave_count,
      icon: 'fas fa-heartbeat',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      label: 'Vacation Leave',
      value: report.vacation_leave_count,
      icon: 'fas fa-umbrella-beach',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      label: 'Maternal Leave',
      value: report.maternal_leave_count,
      icon: 'fas fa-baby',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  // Helper functions to handle null values
  const getAttendancePercentage = () => {
    return report.attendance_percentage !== null ? report.attendance_percentage : 0;
  };

  const getAvgDailyHours = () => {
    return report.avg_daily_hours !== null ? report.avg_daily_hours : 0;
  };

  const calculateAbsenteeismRate = () => {
    const totalDays = report.total_present + report.total_absent;
    return totalDays > 0 ? (report.total_absent / totalDays) * 100 : 0;
  };

  const calculatePunctualityRate = () => {
    return report.total_present > 0 ? ((report.total_present - report.total_late) / report.total_present) * 100 : 0;
  };

  const calculateOvertimeRate = () => {
    return report.total_present > 0 ? (report.total_overtime / report.total_present) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaveStats.map((stat, index) => (
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Performance</h3>
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
                  strokeDasharray={`${getAttendancePercentage()}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {report.attendance_percentage !== null ? `${report.attendance_percentage}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Monthly Attendance Rate</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {report.avg_daily_hours !== null ? getAvgDailyHours().toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm text-gray-600">Average Daily Hours</p>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Hours Worked</span>
              <span className="font-medium">
                {report.avg_daily_hours !== null && report.total_days > 0 
                  ? (getAvgDailyHours() * report.total_days).toFixed(1) + ' hrs'
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productive Days</span>
              <span className="font-medium">{report.total_present} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="font-medium">{report.total_employees}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Absenteeism Rate</p>
            <p className="font-medium text-red-600">
              {calculateAbsenteeismRate().toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Punctuality Rate</p>
            <p className="font-medium text-green-600">
              {calculatePunctualityRate().toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overtime Rate</p>
            <p className="font-medium text-purple-600">
              {calculateOvertimeRate().toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;