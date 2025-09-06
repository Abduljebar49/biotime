import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import type {
  Department,
  DepartmentTrend,
  DepartmentPerformance,
} from "../../stores/department.store";

Chart.register(...registerables);

interface DepartmentAnalyticsProps {
  department: Department;
  trend: DepartmentTrend[];
  performance: DepartmentPerformance[];
  onBack: () => void;
}

const DepartmentAnalytics: React.FC<DepartmentAnalyticsProps> = ({
  department,
  trend,
  performance,
  onBack,
}) => {
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trendChartRef.current && trend.length > 0) {
      const ctx = trendChartRef.current.getContext("2d");

      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: trend.map((item) => item.month),
            datasets: [
              {
                label: "Present Employees",
                data: trend.map((item) => parseInt(item.present_count)),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
                tension: 0.4,
              },
              {
                label: "Absent Employees",
                data: trend.map((item) => parseInt(item.absent_count)),
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Employees",
                },
              },
            },
          },
        });
      }
    }
  }, [trend]);

  useEffect(() => {
    if (performanceChartRef.current && performance.length > 0) {
      const ctx = performanceChartRef.current.getContext("2d");

      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: performance.map((item) => item.dept_name),
            datasets: [
              {
                label: "Attendance Rate (%)",
                data: performance.map((item) =>
                  item.attendance_percentage
                    ? parseFloat(item.attendance_percentage)
                    : 0
                ),
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "Attendance Rate (%)",
                },
              },
            },
          },
        });
      }
    }
  }, [performance]);

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
            Analytics - {department.dept_name}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Attendance Trend (Last 6 Months)
          </h3>
          <div className="h-64">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* Department Performance Comparison */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Department Performance Comparison
          </h3>
          <div className="h-64">
            <canvas ref={performanceChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>

        {trend.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  trend.reduce(
                    (sum, item) => sum + parseFloat(item.attendance_percentage),
                    0
                  ) / trend.length
                )}
                %
              </div>
              <div className="text-sm text-blue-800">Avg Attendance Rate</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {trend.reduce(
                  (sum, item) => sum + parseInt(item.present_count),
                  0
                )}
              </div>
              <div className="text-sm text-green-800">Total Present</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {trend.reduce(
                  (sum, item) => sum + parseInt(item.absent_count),
                  0
                )}
              </div>
              <div className="text-sm text-red-800">Total Absent</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {trend.reduce(
                  (sum, item) => sum + parseInt(item.total_employees),
                  0
                ) / trend.length}
              </div>
              <div className="text-sm text-purple-800">Avg Employees</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-chart-pie text-3xl mb-2"></i>
            <p>No analytics data available</p>
          </div>
        )}
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>

        {trend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-center">Total Employees</th>
                  <th className="px-4 py-2 text-center">Present</th>
                  <th className="px-4 py-2 text-center">Absent</th>
                  <th className="px-4 py-2 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-2">{item.month}</td>
                    <td className="px-4 py-2 text-center">
                      {item.total_employees}
                    </td>
                    <td className="px-4 py-2 text-center text-green-600">
                      {item.present_count}
                    </td>
                    <td className="px-4 py-2 text-center text-red-600">
                      {item.absent_count}
                    </td>
                    <td className="px-4 py-2 text-center font-medium">
                      {item.attendance_percentage}%
                    </td>
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

export default DepartmentAnalytics;
