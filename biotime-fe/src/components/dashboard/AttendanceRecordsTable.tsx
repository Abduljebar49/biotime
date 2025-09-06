import React from "react";

interface AttendanceRecordsTableProps {
  attendanceRecords: any[];
  filters: any;
}

const AttendanceRecordsTable: React.FC<AttendanceRecordsTableProps> = ({
  attendanceRecords,
  filters,
}) => {
    console.log("attendancceRecords : ",attendanceRecords)
    
  return (
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
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-table text-4xl mb-2"></i>
          <p>Attendance records would be displayed here based on filters</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecordsTable;