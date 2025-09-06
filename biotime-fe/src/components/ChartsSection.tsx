import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

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
  console.log("absense chart data : ",absenceChartData)
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Absence Reasons</h3>
            <button className="text-primary text-sm">
              <i className="fas fa-download mr-1"></i> Export
            </button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'daily' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => onChartTypeChange('daily')}
            >
              Daily
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => onChartTypeChange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-xs ${currentChartType === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
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
          <button className="text-primary text-sm">
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

export default ChartsSection;