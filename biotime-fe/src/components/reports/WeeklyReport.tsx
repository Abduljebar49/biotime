// components/reports/WeeklyReport.tsx
import React from 'react';
import type { WeeklyReport as WeeklyReportType } from '../../stores/reporting.store';

interface WeeklyReportProps {
  reports: WeeklyReportType[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ reports }) => {
  const totalStats = reports.reduce(
    (acc, report) => ({
      totalEmployees: acc.totalEmployees + report.total_employees,
      totalPresent: acc.totalPresent + report.present,
      totalAbsent: acc.totalAbsent + report.absent,
      totalLate: acc.totalLate + report.late,
      totalEarlyLeave: acc.totalEarlyLeave + report.early_leave,
      totalOvertime: acc.totalOvertime + report.overtime,
    }),
    {
      totalEmployees: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalEarlyLeave: 0,
      totalOvertime: 0,
    }
  );

  const avgAttendancePercentage =
    reports.reduce((sum, report) => sum + report.attendance_percentage, 0) / reports.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalStats.totalPresent}</div>
          <div className="text-sm text-blue-800">Total Present</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{totalStats.totalAbsent}</div>
          <div className="text-sm text-red-800">Total Absent</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{totalStats.totalLate}</div>
          <div className="text-sm text-yellow-800">Total Late</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{totalStats.totalEarlyLeave}</div>
          <div className="text-sm text-orange-800">Total Early Leave</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{totalStats.totalOvertime}</div>
          <div className="text-sm text-purple-800">Total Overtime</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{avgAttendancePercentage.toFixed(1)}%</div>
          <div className="text-sm text-green-800">Avg Attendance</div>
        </div>
      </div>

      {/* Weekly Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Early Leave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.att_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.week_day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {report.present}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {report.absent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                    {report.late}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                    {report.early_leave}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                    {report.overtime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.attendance_percentage >= 90
                        ? 'bg-green-100 text-green-800'
                        : report.attendance_percentage >= 80
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.attendance_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;