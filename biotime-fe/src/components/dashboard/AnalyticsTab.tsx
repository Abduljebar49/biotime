import React from "react";

interface AnalyticsTabProps {
  employeePerformance: any[];
  departmentPerformance: any[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  employeePerformance,
  departmentPerformance,
}) => {
    console.log("employeePerfomance  : ",employeePerformance)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Employee Performance
          </h3>
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-user-chart text-4xl mb-2"></i>
            <p>Employee performance analytics would be displayed here</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Department Performance
          </h3>
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-chart-bar text-4xl mb-2"></i>
            <p>Department performance analytics would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;