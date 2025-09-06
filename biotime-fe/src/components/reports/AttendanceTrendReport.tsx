// components/reports/AttendanceTrendReport.tsx
import React from 'react';
import type { AttendanceTrend as AttendanceTrendType } from '../../stores/reporting.store';

interface AttendanceTrendReportProps {
  reports: AttendanceTrendType[];
  days: number;
}

const AttendanceTrendReport: React.FC<AttendanceTrendReportProps> = ({ reports, days }) => {
  const maxAttendance = Math.max(...reports.map(r => r.attendance_percentage));
  const minAttendance = Math.min(...reports.map(r => r.attendance_percentage));
  const avgAttendance = reports.reduce((sum, r) => sum + r.attendance_percentage, 0) / reports.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{days}</div>
          <div className="text-sm text-blue-800">Days Analyzed</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{maxAttendance.toFixed(1)}%</div>
          <div className="text-sm text-green-800">Highest Attendance</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{minAttendance.toFixed(1)}%</div>
          <div className="text-sm text-red-800">Lowest Attendance</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{avgAttendance.toFixed(1)}%</div>
          <div className="text-sm text-purple-800">Average Attendance</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Trend ({days} Days)</h3>
        <div className="h-64">
          <div className="flex items-end justify-between h-48 mt-4">
            {reports.slice(-days).map((report, index) => {
              const height = (report.attendance_percentage / 100) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                    style={{ height: `${height}%` }}
                    title={`${report.attendance_percentage}% on ${new Date(report.date).toLocaleDateString()}`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 rotate-45 origin-top-left whitespace-nowrap">
                    {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trend Data Table */}
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
                  Total Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.slice(-days).map((report, index) => {
                const previous = reports[index - 1];
                const trend = previous ? report.attendance_percentage - previous.attendance_percentage : 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.week_day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.total_employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {report.present_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {report.absent_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.attendance_percentage >= 95
                          ? 'bg-green-100 text-green-800'
                          : report.attendance_percentage >= 85
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {report.attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trend !== 0 && (
                        <span className={`text-sm ${
                          trend > 0 
                            ? 'text-green-600 flex items-center' 
                            : 'text-red-600 flex items-center'
                        }`}>
                          <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'} mr-1`}></i>
                          {Math.abs(trend).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Trend Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Best Performing Day</h4>
            <p className="text-sm text-blue-600">
              {reports.reduce((best, current) => 
                current.attendance_percentage > best.attendance_percentage ? current : best
              ).week_day} -{' '}
              {Math.max(...reports.map(r => r.attendance_percentage))}%
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Worst Performing Day</h4>
            <p className="text-sm text-red-600">
              {reports.reduce((worst, current) => 
                current.attendance_percentage < worst.attendance_percentage ? current : worst
              ).week_day} -{' '}
              {Math.min(...reports.map(r => r.attendance_percentage))}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Consistency Score</h4>
            <p className="text-sm text-green-600">
              {((1 - (maxAttendance - minAttendance) / 100) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Overall Trend</h4>
            <p className="text-sm text-purple-600">
              {reports[reports.length - 1].attendance_percentage > reports[0].attendance_percentage 
                ? 'Improving' 
                : reports[reports.length - 1].attendance_percentage < reports[0].attendance_percentage
                ? 'Declining'
                : 'Stable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrendReport;