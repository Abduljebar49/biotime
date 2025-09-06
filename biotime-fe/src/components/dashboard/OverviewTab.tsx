import React, { useState } from "react";
import type { RecentAttendance } from "../../stores/reporting.store";
import ChartsSection from "../ChartsSection";

interface OverviewTabProps {
  departmentPerformance: any[];
  recentAttendance: RecentAttendance[];
  attendanceChartData: any;
  absenceChartData: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  departmentPerformance,
  recentAttendance,
  attendanceChartData,
  absenceChartData,
}) => {
  const [chartType, setChartType] = useState("daily");

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  return (
    <div className="space-y-6">
      <ChartsSection
        attendanceChartData={attendanceChartData}
        absenceChartData={absenceChartData}
        onChartTypeChange={handleChartTypeChange}
        currentChartType={chartType}
        loading={false}
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
  );
};

export default OverviewTab;