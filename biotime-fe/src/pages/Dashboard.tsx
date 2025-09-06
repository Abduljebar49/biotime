import React, { useEffect, useState, useRef, useCallback } from "react";
import { useReportingStore } from "../stores/reporting.store";
import { useDepartmentStore } from "../stores/department.store";
import { useEmployeeStore } from "../stores/employee.store";
import { useAttendanceStore } from "../stores/attendance.store";
import { Chart, registerables } from 'chart.js';
import LoadingSpinner from "../components/LoadingSpinner";

// Register Chart.js components
Chart.register(...registerables);

interface ChartsSectionProps {
  attendanceChartData: any;
  absenceChartData: any;
  onChartTypeChange: (type: string) => void;
  currentChartType: string;
  loading: boolean;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  attendanceChartData, 
  absenceChartData, 
  onChartTypeChange,
  currentChartType,
  loading 
}) => {
  const attendanceChartRef = useRef<HTMLCanvasElement>(null);
  const absenceChartRef = useRef<HTMLCanvasElement>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const absenceChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Cleanup charts on unmount
    return () => {
      attendanceChartInstance.current?.destroy();
      absenceChartInstance.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (attendanceChartRef.current && attendanceChartData) {
      attendanceChartInstance.current?.destroy();

      const attendanceCtx = attendanceChartRef.current.getContext('2d');
      
      if (attendanceCtx) {
        attendanceChartInstance.current = new Chart(attendanceCtx, {
          type: currentChartType === 'daily' ? 'line' : 'bar',
          data: attendanceChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Employees'
                }
              },
              x: {
                title: {
                  display: true,
                  text: currentChartType === 'daily' ? 'Days' : currentChartType === 'weekly' ? 'Weeks' : 'Months'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: `Attendance Overview - ${currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} View`
              }
            }
          }
        });
      }
    }
  }, [attendanceChartData, currentChartType]);

  useEffect(() => {
    if (absenceChartRef.current && absenceChartData) {
      absenceChartInstance.current?.destroy();

      const absenceCtx = absenceChartRef.current.getContext('2d');

      if (absenceCtx) {
        absenceChartInstance.current = new Chart(absenceCtx, {
          type: 'doughnut',
          data: absenceChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [absenceChartData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Attendance Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">Daily</button>
              <button className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">Weekly</button>
              <button className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">Monthly</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Absence Reasons</h3>
            <button className="text-blue-600 text-sm">
              <i className="fas fa-download mr-1"></i> Export
            </button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
      <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Attendance Overview</h3>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => onChartTypeChange('daily')}
            >
              Daily
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => onChartTypeChange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => onChartTypeChange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          <canvas ref={attendanceChartRef} id="attendanceChart"></canvas>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Absence Reasons</h3>
          <button className="text-blue-600 text-sm">
            <i className="fas fa-download mr-1"></i> Export
          </button>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          <canvas ref={absenceChartRef} id="absenceChart"></canvas>
        </div>
      </div>
    </div>
  );
};

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

  // Use the reporting store for dashboard data
  const {
    todayReport,
    weeklyReport,
    monthlyReport,
    absenceReasons,
    recentAttendance,
    departmentWiseReport,
    employeePerformance,
    attendanceTrend,
    loading: reportingLoading,
    getTodayReport,
    getWeeklyReport,
    getMonthlyReport,
    getAbsenceReasons,
    getRecentAttendance,
    getDepartmentWiseReport,
    getEmployeePerformance,
    getAttendanceTrend,
  } = useReportingStore();

  const {
    departments,
    getAllDepartments,
    getDepartmentPerformance,
  } = useDepartmentStore();

  const { employees, getAllEmployees } = useEmployeeStore();

  // Use attendance store for detailed records
  const {
    attendanceRecords,
    loading: attendanceLoading,
    getAttendanceRecords,
    getAttendanceSummary,
    getLateEmployees,
    getAbsentEmployees,
    getEarlyLeaveEmployees,
  } = useAttendanceStore();

  const loading = reportingLoading || attendanceLoading;
  
  useEffect(() => {
    loadInitialData();
    
  }, []);

  const loadInitialData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      await Promise.all([
        getTodayReport(),
        getWeeklyReport(),
        getMonthlyReport(),
        getAbsenceReasons(today),
        getRecentAttendance(10),
        getDepartmentWiseReport(),
        getAllDepartments(),
        getAllEmployees(),
        getDepartmentPerformance(filters.startDate, filters.endDate),
        getAttendanceTrend(30),
        getLateEmployees(today),
        getAbsentEmployees(today),
        getEarlyLeaveEmployees(today),
        getEmployeePerformance()
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
        getDepartmentPerformance(filters.startDate, filters.endDate),
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

  // Prepare chart data for attendance overview
  const attendanceChartData = {
    labels: attendanceTrend?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Present",
        data: attendanceTrend?.map((item) => item.present_count) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
      },
      {
        label: "Absent",
        data: attendanceTrend?.map((item) => item.absent_count) || [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
      },
    ],
  };

  // Prepare absence reasons chart data
  const absenceChartData = {
    labels: absenceReasons?.map((item) => item.absence_reason) || [],
    datasets: [
      {
        data: absenceReasons?.map((_, index) => index + 1) || [], // Placeholder data
        backgroundColor: [
          "#EF4444",
          "#3B82F6",
          "#8B5CF6",
          "#F59E0B",
          "#10B981",
          "#EC4899",
          "#6366F1"
        ],
      },
    ],
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

  // Function to export data as CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !todayReport) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Employees</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {todayReport?.total_employees || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Present Today</p>
                <h2 className="text-3xl font-bold text-green-600">
                  {todayReport?.present_today || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Absent Today</p>
                <h2 className="text-3xl font-bold text-red-600">
                  {todayReport?.absent_today || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Late Today</p>
                <h2 className="text-3xl font-bold text-yellow-600">
                  {todayReport?.late_count || 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              } font-medium`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-chart-pie mr-2"></i>Overview
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "records"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("records")}
            >
              <i className="fas fa-list mr-2"></i>Attendance Records
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "analytics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <i className="fas fa-chart-line mr-2"></i>Analytics
            </button>
            <button
              className={`tab-btn px-6 py-3 ${
                activeTab === "reports"
                  ? "border-b-2 border-blue-500 text-blue-600"
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
                    {departmentWiseReport.map((dept) => (
                      <div
                        key={dept.department_id}
                        className="flex justify-between items-center p-3 border-b"
                      >
                        <span className="font-medium">{dept.dept_name}</span>
                        <div className="text-right">
                          <span className="text-green-600 font-medium">
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
                    {recentAttendance.map((checkin) => (
                      <div
                        key={`${checkin.employee_id}-${checkin.check_in_time}`}
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
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {checkin.check_in_time_formatted}
                          </p>
                          <p className="text-sm text-gray-600">
                            {checkin.week_day}
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
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                      onClick={() => exportToCSV(attendanceRecords, 'attendance-records')}
                    >
                      <i className="fas fa-download mr-2"></i>Export CSV
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
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record) => (
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
                              {record.check_in
                                ? new Date(record.check_in).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )
                                : "--:--"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.check_out
                                ? new Date(record.check_out).toLocaleTimeString(
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No attendance records found for the selected filters
                          </td>
                        </tr>
                      )}
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
                    Weekly Attendance Trends
                  </h3>
                  <div className="h-64 flex flex-col justify-center">
                    {weeklyReport.length > 0 ? (
                      <div className="space-y-2">
                        {weeklyReport.map((week) => (
                          <div key={week.att_date} className="flex justify-between items-center">
                            <span className="text-sm">
                              {new Date(week.att_date).toLocaleDateString()} ({week.week_day})
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 font-medium">{week.present}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">{week.total_employees}</span>
                              <span className="text-xs text-gray-500">
                                ({week.attendance_percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        No weekly data available
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
                  <div className="h-64 flex flex-col justify-center">
                    {monthlyReport ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Present:</span>
                          <span className="font-medium">{monthlyReport.total_present}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Absent:</span>
                          <span className="font-medium">{monthlyReport.total_absent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attendance Percentage:</span>
                          <span className="font-medium">{monthlyReport.attendance_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Daily Hours:</span>
                          <span className="font-medium">{monthlyReport.avg_daily_hours.toFixed(2)}h</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        No monthly data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Employee Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employeePerformance.slice(0, 5).map((employee) => (
                        <tr key={employee.employee_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <i className="fas fa-user text-gray-600 text-sm"></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {employee.emp_code}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.dept_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.present_days}/{employee.total_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              employee.attendance_percentage >= 90 
                                ? "bg-green-100 text-green-800" 
                                : employee.attendance_percentage >= 80 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {employee.attendance_percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.total_hours_worked || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <i className="fas fa-calendar-day text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Daily Report</h3>
                  <p className="text-gray-600 mb-4">
                    Generate detailed daily attendance report
                  </p>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    onClick={() => exportToCSV(attendanceRecords, 'daily-attendance-report')}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-week text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Weekly Report</h3>
                  <p className="text-gray-600 mb-4">
                    Weekly summary and analytics
                  </p>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    onClick={() => exportToCSV(weeklyReport, 'weekly-attendance-report')}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-alt text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Monthly Report</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive monthly analysis
                  </p>
                  <button 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                    onClick={() => {
                      if (monthlyReport) {
                        exportToCSV([monthlyReport], 'monthly-attendance-report');
                      }
                    }}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-times text-red-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Absence Report</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed absence reasons and patterns
                  </p>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    onClick={() => exportToCSV(absenceReasons, 'absence-report')}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-tachometer-alt text-yellow-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Performance Report</h3>
                  <p className="text-gray-600 mb-4">
                    Employee performance metrics
                  </p>
                  <button 
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                    onClick={() => exportToCSV(employeePerformance, 'performance-report')}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-line text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Trend Report</h3>
                  <p className="text-gray-600 mb-4">
                    Attendance trends and analytics
                  </p>
                  <button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                    onClick={() => exportToCSV(attendanceTrend, 'trend-report')}
                  >
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

export default Dashboard;