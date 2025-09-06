import { useState, useEffect } from 'react';
import { useAttendanceStore } from '../stores/attendance.store';
import { convertToChartData, generateAbsenceChartDataFromAPI } from '../config/helper';

export const useDashboardData = () => {
  const { 
    getDashboardOverview, 
    getTodayReport, 
    getWeeklyReport,
    getAttendanceSummary,
    getAbsenceReasons,
    dashboardOverview,
    todayReport,
    weeklyReport,
    attendanceSummary,
    absenceReasons,
    loading,
    error 
  } = useAttendanceStore();
  
  const [chartType, setChartType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getDashboardOverview(),
          getTodayReport(),
          getWeeklyReport(),
          getAttendanceSummary(dateRange.startDate, dateRange.endDate),
          getAbsenceReasons(new Date().toISOString().split('T')[0])
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [dateRange]);

  const updateDateRange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Prepare stats data for the StatsCards component
  const stats = {
    totalEmployees: todayReport?.total_employees || "0",
    presentToday: todayReport?.present_today || "0",
    absentToday: todayReport?.absent_today || "0"
  };

  // Prepare chart data
  const attendanceChartData = convertToChartData(
    chartType === 'daily' ? attendanceSummary : 
    chartType === 'weekly' ? weeklyReport : 
    [], // Monthly data would need to be fetched separately
    chartType
  );
  
  const absenceChartData = generateAbsenceChartDataFromAPI(absenceReasons);

  return {
    stats,
    attendanceRecords: dashboardOverview?.recentCheckIns || [],
    attendanceChartData,
    absenceChartData,
    updateDateRange,
    setChartType,
    chartType,
    loading,
    error
  };
};