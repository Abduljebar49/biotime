import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { Employee, EmployeeAttendanceTrend } from '../../stores/employee.store';


Chart.register(...registerables);

interface EmployeeAnalyticsProps {
  employee: Employee;
  attendanceTrend: EmployeeAttendanceTrend[];
  onBack: () => void;
}

const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({
  employee,
  attendanceTrend,
  onBack
}) => {
  const trendChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trendChartRef.current && attendanceTrend.length > 0) {
      const ctx = trendChartRef.current.getContext('2d');
      
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: attendanceTrend.map(item => item.month),
            datasets: [
              {
                label: 'Present Days',
                data: attendanceTrend.map(item => parseInt(item.present_days)),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Absent Days',
                data: attendanceTrend.map(item => parseInt(item.absent_days)),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Days'
                }
              }
            }
          }
        });
      }
    }
  }, [attendanceTrend]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 mb-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to details
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Analytics - {employee.first_name} {employee.last_name}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 6 Months)</h3>
          <div className="h-64">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          
          {attendanceTrend.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Average Attendance Rate</span>
                <span className="font-bold text-primary">
                  {Math.round(
                    attendanceTrend.reduce((sum, item) => sum + parseFloat(item.attendance_percentage), 0) / 
                    attendanceTrend.length
                  )}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Total Present Days</span>
                <span className="font-bold text-green-600">
                  {attendanceTrend.reduce((sum, item) => sum + parseInt(item.present_days), 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Total Absent Days</span>
                <span className="font-bold text-red-600">
                  {attendanceTrend.reduce((sum, item) => sum + parseInt(item.absent_days), 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Average Late Days per Month</span>
                <span className="font-bold text-yellow-600">
                  {Math.round(
                    attendanceTrend.reduce((sum, item) => sum + parseInt(item.late_days), 0) / 
                    attendanceTrend.length
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-pie text-3xl mb-2"></i>
              <p>No analytics data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
        
        {attendanceTrend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-center">Present</th>
                  <th className="px-4 py-2 text-center">Absent</th>
                  <th className="px-4 py-2 text-center">Late</th>
                  <th className="px-4 py-2 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceTrend.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{item.month}</td>
                    <td className="px-4 py-2 text-center text-green-600">{item.present_days}</td>
                    <td className="px-4 py-2 text-center text-red-600">{item.absent_days}</td>
                    <td className="px-4 py-2 text-center text-yellow-600">{item.late_days}</td>
                    <td className="px-4 py-2 text-center font-medium">{item.attendance_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-table text-3xl mb-2"></i>
            <p>No monthly data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAnalytics;