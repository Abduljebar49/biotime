import React, { useEffect, useState } from "react";
import { useAttendanceStore } from "../stores/attendance.store";
import { useDepartmentStore } from "../stores/department.store";
import { useEmployeeStore } from "../stores/employee.store";
import ChartsSection from "../components/ChartsSection";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    departmentId: "",
    status: "",
    employeeId: "",
  });
  const [chartType, setChartType] = useState("daily");

  // Zustand stores
  const {
    dashboardOverview,
    dailyStats,
    attendanceRecords,
    attendanceSummary,
    loading,
    getDashboardOverview,
    getAttendanceRecords,
    getAttendanceSummary,
  } = useAttendanceStore();

  const {
    departments,
    getAllDepartments,
    departmentPerformance,
    getDepartmentPerformance,
  } = useDepartmentStore();
  const { employees, getAllEmployees } = useEmployeeStore();

  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    try {
      await Promise.all([
        getDashboardOverview(),
        getAllDepartments(),
        getAllEmployees(),
        getDepartmentPerformance(filters.startDate, filters.endDate)
      ]);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      await Promise.all([
        getAttendanceRecords(filters.startDate, filters.endDate),
        getAttendanceSummary(filters.startDate, filters.endDate),
        getDepartmentPerformance(filters.startDate, filters.endDate)
      ]);
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      departmentId: "",
      status: "",
      employeeId: "",
    });
  };

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  // Prepare chart data
  const attendanceChartData = {
    labels: attendanceSummary?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Present",
        data: attendanceSummary?.map((item) => parseInt(item.present)) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
      },
      {
        label: "Absent",
        data: attendanceSummary?.map((item) => parseInt(item.absent)) || [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
      },
    ],
  };

  const absenceChartData = {
    labels: [
      "Sick Leave",
      "Vacation",
      "Maternal Leave",
      "Annual Leave",
      "Business Trip",
    ],
    datasets: [
      {
        data: [
          dashboardOverview?.today?.absent_today
            ? parseInt(dashboardOverview.today.absent_today)
            : 0,
          0,
          0,
          0,
          0,
        ],
        backgroundColor: [
          "#EF4444",
          "#3B82F6",
          "#8B5CF6",
          "#F59E0B",
          "#10B981",
        ],
      },
    ],
  };
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Employees</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardOverview?.today?.total_employees || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Present Today</p>
                <h2 className="text-3xl font-bold text-success">
                  {dashboardOverview?.today?.present_today || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-success text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Absent Today</p>
                <h2 className="text-3xl font-bold text-danger">
                  {dashboardOverview?.today?.absent_today || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-times-circle text-danger text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Late Today</p>
                <h2 className="text-3xl font-bold text-warning">
                  {dailyStats?.lateCount || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-warning text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="departmentId"
                value={filters.departmentId}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-32"
              >
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="early_leave">Early Leave</option>
                <option value="overtime">Overtime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-48"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-filter mr-2"></i>Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600"
              } font-medium`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-chart-pie mr-2"></i>Overview
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "records"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("records")}
            >
              <i className="fas fa-list mr-2"></i>Attendance Records
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "analytics"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <i className="fas fa-chart-line mr-2"></i>Analytics
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "reports"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("reports")}
            >
              <i className="fas fa-file-alt mr-2"></i>Reports
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <ChartsSection
                attendanceChartData={attendanceChartData}
                absenceChartData={absenceChartData}
                onChartTypeChange={handleChartTypeChange}
                currentChartType={chartType}
                loading={loading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Department Overview
                  </h3>
                  <div className="space-y-3">
                    {departmentPerformance.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex justify-between items-center p-3 border-b"
                      >
                        <span className="font-medium">{dept.dept_name}</span>
                        <div className="text-right">
                          <span className="text-success font-medium">
                            {dept.present_count}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-600">
                            {dept.total_employees}
                          </span>
                          <div className="text-xs text-gray-500">
                            {dept.attendance_percentage !== null
                              ? `${dept.attendance_percentage}%`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Check-ins
                  </h3>
                  <div className="space-y-3">
                    {dashboardOverview?.recentCheckIns?.map((checkin) => (
                      <div
                        key={checkin.employee_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">
                              {checkin.first_name} {checkin.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {checkin.dept_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              checkin.status === "late"
                                ? "text-warning"
                                : "text-success"
                            }`}
                          >
                            {checkin.check_in_time_formatted}
                          </p>
                          <p className="text-sm text-gray-600">
                            {checkin.week_day.trim()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === "records" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Attendance Records</h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-success text-white rounded-lg text-sm">
                      <i className="fas fa-download mr-2"></i>Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={`${record.employee_id}-${record.att_date}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <i className="fas fa-user text-gray-600 text-sm"></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {record.first_name} {record.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.dept_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(record.att_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.week_day}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.clock_in
                              ? new Date(record.clock_in).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "--:--"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.clock_out
                              ? new Date(record.clock_out).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "--:--"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.hours_worked || "--"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                                record.status
                              )}`}
                            >
                              {record.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.absence_reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {attendanceRecords.length} records
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Attendance Distribution
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Distribution chart will be implemented here
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Monthly trends chart will be implemented here
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Repeated Violations
                </h3>
                <div className="space-y-3 text-gray-500">
                  Violations data will be loaded here
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-day text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Daily Report</h3>
                  <p className="text-gray-600 mb-4">
                    Generate detailed daily attendance report
                  </p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
                    Generate Report
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-week text-success text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Weekly Report</h3>
                  <p className="text-gray-600 mb-4">
                    Weekly summary and analytics
                  </p>
                  <button className="px-4 py-2 bg-success text-white rounded-lg text-sm">
                    Generate Report
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-alt text-info text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Monthly Report</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive monthly analysis
                  </p>
                  <button className="px-4 py-2 bg-info text-white rounded-lg text-sm">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for status styling
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    early_leave: "bg-yellow-100 text-yellow-800",
    overtime: "bg-purple-100 text-purple-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

export default Dashboard;
