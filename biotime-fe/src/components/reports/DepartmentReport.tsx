// components/reports/DepartmentReport.tsx
import React from 'react';
import type { DepartmentWiseReport as DepartmentWiseReportType } from '../../stores/reporting.store';

interface DepartmentReportProps {
  reports: DepartmentWiseReportType[];
}

const DepartmentReport: React.FC<DepartmentReportProps> = ({ reports }) => {
  const sortedReports = [...reports].sort((a, b) => b.attendance_percentage - a.attendance_percentage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-sm text-blue-800">Total Departments</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {reports.reduce((sum, report) => sum + report.total_employees, 0)}
          </div>
          <div className="text-sm text-green-800">Total Employees</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {reports.reduce((sum, report) => sum + report.present_count, 0)}
          </div>
          <div className="text-sm text-purple-800">Total Present</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {(reports.reduce((sum, report) => sum + report.attendance_percentage, 0) / reports.length).toFixed(1)}%
          </div>
          <div className="text-sm text-orange-800">Avg Attendance</div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.dept_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.dept_code}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                    {report.late_count}
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
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
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

      {/* Top Performing Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-trophy text-yellow-500 mr-2"></i>
            Top 3 Departments
          </h3>
          <div className="space-y-3">
            {sortedReports.slice(0, 3).map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{report.dept_name}</div>
                    <div className="text-sm text-gray-500">{report.dept_code}</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {report.attendance_percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            Needs Improvement
          </h3>
          <div className="space-y-3">
            {sortedReports.slice(-3).reverse().map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-red-600">{sortedReports.length - index}</span>
                  </div>
                  <div>
                    <div className="font-medium">{report.dept_name}</div>
                    <div className="text-sm text-gray-500">{report.dept_code}</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-red-600">
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

export default DepartmentReport;