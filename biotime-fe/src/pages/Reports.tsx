// pages/Reports.tsx
import React, { useState, useEffect } from "react";
import { useReportingStore } from "../stores/reporting.store";
import TodayReport from "../components/reports/TodayReport";
import WeeklyReport from "../components/reports/WeeklyReport";
import MonthlyReport from "../components/reports/MonthlyReport";
import DepartmentReport from "../components/reports/DepartmentReport";
import EmployeePerformanceReport from "../components/reports/EmployeePerformanceReport";
import AttendanceTrendReport from "../components/reports/AttendanceTrendReport";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "monthly" | "department" | "performance" | "trend">("today");
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const {
    todayReport,
    weeklyReport,
    monthlyReport,
    departmentWiseReport,
    employeePerformance,
    attendanceTrend,
    loading,
    error,
    getTodayReport,
    getWeeklyReport,
    getMonthlyReport,
    getDepartmentWiseReport,
    getEmployeePerformance,
    getAttendanceTrend,
    clearError,
  } = useReportingStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const loadInitialData = async () => {
    try {
      await getTodayReport();
    } catch (err) {
      console.error("Error loading initial report data:", err);
    }
  };

  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab);
    try {
      switch (tab) {
        case "today":
          await getTodayReport();
          break;
        case "weekly":
          await getWeeklyReport();
          break;
        case "monthly":
          await getMonthlyReport();
          break;
        case "department":
          await getDepartmentWiseReport();
          break;
        case "performance":
          await getEmployeePerformance();
          break;
        case "trend":
          await getAttendanceTrend(daysFilter);
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab} report:`, err);
    }
  };

  const handleRefresh = async () => {
    try {
      switch (activeTab) {
        case "today":
          await getTodayReport();
          break;
        case "weekly":
          await getWeeklyReport();
          break;
        case "monthly":
          await getMonthlyReport();
          break;
        case "department":
          await getDepartmentWiseReport();
          break;
        case "performance":
          await getEmployeePerformance();
          break;
        case "trend":
          await getAttendanceTrend(daysFilter);
          break;
      }
      toast.success("Report refreshed successfully");
    } catch (err) {
      console.error("Error refreshing report:", err);
    }
  };

  const handleTrendDaysChange = async (days: number) => {
    setDaysFilter(days);
    try {
      await getAttendanceTrend(days);
    } catch (err) {
      console.error("Error loading attendance trend:", err);
    }
  };

  if (loading && !todayReport) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: "today", label: "Today", icon: "calendar-day" },
              { id: "weekly", label: "Weekly", icon: "calendar-week" },
              { id: "monthly", label: "Monthly", icon: "calendar-alt" },
              { id: "department", label: "Department", icon: "building" },
              { id: "performance", label: "Performance", icon: "chart-line" },
              { id: "trend", label: "Trend", icon: "chart-bar" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors flex items-center ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className={`fas fa-${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {/* Filter Controls */}
          {activeTab === "trend" && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Trend for Last:
              </label>
              <div className="flex gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleTrendDaysChange(days)}
                    className={`px-3 py-1 rounded text-sm ${
                      daysFilter === days
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Report Components */}
          {activeTab === "today" && todayReport && (
            <TodayReport report={todayReport} />
          )}

          {activeTab === "weekly" && weeklyReport.length > 0 && (
            <WeeklyReport reports={weeklyReport} />
          )}

          {activeTab === "monthly" && monthlyReport && (
            <MonthlyReport report={monthlyReport} />
          )}

          {activeTab === "department" && departmentWiseReport.length > 0 && (
            <DepartmentReport reports={departmentWiseReport} />
          )}

          {activeTab === "performance" && employeePerformance.length > 0 && (
            <EmployeePerformanceReport reports={employeePerformance} />
          )}

          {activeTab === "trend" && attendanceTrend.length > 0 && (
            <AttendanceTrendReport reports={attendanceTrend} days={daysFilter} />
          )}

          {/* Empty State */}
          {((activeTab === "today" && !todayReport) ||
            (activeTab === "weekly" && weeklyReport.length === 0) ||
            (activeTab === "monthly" && !monthlyReport) ||
            (activeTab === "department" && departmentWiseReport.length === 0) ||
            (activeTab === "performance" && employeePerformance.length === 0) ||
            (activeTab === "trend" && attendanceTrend.length === 0)) && (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
              <p>No report data available</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;