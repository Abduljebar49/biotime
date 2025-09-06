// Helper function to convert API data to chart format
import { getWeek } from 'date-fns';

function getWeekNumber(date: Date): number {
    // Copy date so we don’t mutate the original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    // Set to nearest Thursday: current date + 4 - current day number (Sunday is 0, ISO week starts on Monday)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

    // Get first day of the year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);

    return weekNo;
}

export const convertToChartData = (apiData: any[], chartType: string) => {
    if (!apiData || apiData.length === 0) {
        return getEmptyChartData(chartType);
    }

    // Handle different data structures based on chart type
    switch (chartType) {
        case 'weekly':
            return {
                labels: apiData.map(item => {
                    const date = new Date(item.att_date);
                    return `Week ${getWeek(date)}`;
                }),
                datasets: [
                    {
                        label: 'Present',
                        data: apiData.map(item => item.present),
                        backgroundColor: '#4F46E5',
                        borderColor: '#4F46E5',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Absent',
                        data: apiData.map(item => item.absent),
                        backgroundColor: '#EF4444',
                        borderColor: '#EF4444',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            };

        case 'monthly':
            return {
                labels: apiData.map(item => item.month_name),
                datasets: [
                    {
                        label: 'Present',
                        data: apiData.map(item => parseInt(item.total_present)),
                        backgroundColor: '#4F46E5',
                    },
                    {
                        label: 'Absent',
                        data: apiData.map(item => parseInt(item.total_absent)),
                        backgroundColor: '#EF4444',
                    }
                ]
            };

        case 'daily':
        default:
            return {
                labels: apiData.map(item => {
                    const date = new Date(item.att_date);
                    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                }),
                datasets: [
                    {
                        label: 'Present',
                        data: apiData.map(item => parseInt(item.present)),
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        borderColor: '#4F46E5',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Absent',
                        data: apiData.map(item => parseInt(item.absent)),
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderColor: '#EF4444',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }
                ]
            };
    }
};

// Helper function to generate absence reason chart data from API data
export const generateAbsenceChartDataFromAPI = (absenceData: any[]) => {
    if (!absenceData || absenceData.length === 0) {
        return {
            labels: ['No Data Available'],
            datasets: [{
                data: [1],
                backgroundColor: ['#9CA3AF'],
            }]
        };
    }

    // Count absence reasons
    const reasonCounts: { [key: string]: number } = {};
    absenceData.forEach(item => {
        const reason = item.absence_reason || 'Unknown';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const labels = Object.keys(reasonCounts);
    const data = Object.values(reasonCounts);

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }
        ]
    };
};

const getEmptyChartData = (chartType: string) => {
    return {
        labels: [],
        datasets: [
            {
                label: 'Present',
                data: [],
                backgroundColor: '#4F46E5',
                borderColor: '#4F46E5',
            },
            {
                label: 'Absent',
                data: [],
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
            }
        ]
    };
};

// Add this function to get week number
// Date.prototype.getWeek = function () {
//     const date = new Date(this.getTime());
//     date.setHours(0, 0, 0, 0);
//     date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
//     const week1 = new Date(date.getFullYear(), 0, 4);
//     return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
// };