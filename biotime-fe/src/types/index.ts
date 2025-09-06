export interface AttendanceRecord {
  id: string;
  name: string;
  initials: string;
  status: 'present' | 'late' | 'absent';
  time: string;
  reason?: string;
}

export interface StatsData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}