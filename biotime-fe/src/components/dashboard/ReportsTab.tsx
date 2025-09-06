import React from "react";
import type {
  TodayReport,
  WeeklyReport,
  MonthlyReport,
} from "../../stores/reporting.store";

interface ReportsTabProps {
  todayReport: TodayReport | null;
  weeklyReport: WeeklyReport[];
  monthlyReport: MonthlyReport | null;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  todayReport,
  weeklyReport,
  monthlyReport,
}) => {
  console.log("todayReport : ", todayReport);
  return (
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
          <p className="text-gray-600 mb-4">Weekly summary and analytics</p>
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
          <p className="text-gray-600 mb-4">Comprehensive monthly analysis</p>
          <button className="px-4 py-2 bg-info text-white rounded-lg text-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
