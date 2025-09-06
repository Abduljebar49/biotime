// components/reports/EmployeePerformanceReport.tsx
import React from 'react';
import type { EmployeePerformance as EmployeePerformanceType } from '../../stores/reporting.store';

interface EmployeePerformanceReportProps {
  reports: EmployeePerformanceType[];
}

const EmployeePerformanceReport: React.FC<EmployeePerformanceReportProps> = ({ reports }) => {
  const sortedReports = [...reports].sort((a, b) => b.attendance_percentage - a.attendance_percentage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-sm text-blue-800">Total Employees</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {reports.filter(emp => emp.attendance_percentage >= 90).length}
          </div>
          <div className="text-sm text-green-800">Excellent Performance</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {reports.filter(emp => emp.attendance_percentage >= 70 && emp.attendance_percentage < 90).length}
          </div>
          <div className="text-sm text-yellow-800">Good Performance</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {reports.filter(emp => emp.attendance_percentage < 70).length}
          </div>
          <div className="text-sm text-red-800">Needs Improvement</div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
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
                  Attendance %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedReports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-user text-gray-600 text-xs"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.first_name} {report.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.emp_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.dept_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.total_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {report.present_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {report.absent_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                    {report.late_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                    {report.early_leave_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.attendance_percentage >= 95
                        ? 'bg-green-100 text-green-800'
                        : report.attendance_percentage >= 85
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.attendance_percentage >= 70
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.attendance_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          report.attendance_percentage >= 95
                            ? 'bg-green-500'
                            : report.attendance_percentage >= 85
                            ? 'bg-yellow-500'
                            : report.attendance_percentage >= 70
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${report.attendance_percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
          <div className="space-y-3">
            {[
              { range: '95-100%', count: reports.filter(emp => emp.attendance_percentage >= 95).length, color: 'bg-green-500' },
              { range: '85-94%', count: reports.filter(emp => emp.attendance_percentage >= 85 && emp.attendance_percentage < 95).length, color: 'bg-yellow-500' },
              { range: '70-84%', count: reports.filter(emp => emp.attendance_percentage >= 70 && emp.attendance_percentage < 85).length, color: 'bg-orange-500' },
              { range: 'Below 70%', count: reports.filter(emp => emp.attendance_percentage < 70).length, color: 'bg-red-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.range}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{item.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / reports.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {sortedReports.slice(0, 5).map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {report.first_name} {report.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{report.dept_name}</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {report.attendance_percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceReport;