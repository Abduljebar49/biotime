import React from "react";
import type { TodayReport, DepartmentWiseReport } from "../../stores/reporting.store";

interface StatsCardsProps {
  todayReport: TodayReport | null;
  departmentWiseReport: DepartmentWiseReport[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ todayReport, departmentWiseReport }) => {
  // Calculate late count from department-wise report
  const totalLateCount = departmentWiseReport.reduce((sum, dept) => sum + dept.late_count, 0);

  return (
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
            <i className="fas fa-users text-primary text-xl"></i>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Present Today</p>
            <h2 className="text-3xl font-bold text-success">
              {todayReport?.present_today || 0}
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
              {todayReport?.absent_today || 0}
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
              {totalLateCount}
            </h2>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="fas fa-clock text-warning text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;