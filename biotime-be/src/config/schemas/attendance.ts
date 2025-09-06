// src/schemas/attendance.ts
import { z } from 'zod';

export const attendanceQuerySchema = z.object({
  employeeId: z.number().optional(),
  departmentId: z.number().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  periodType: z.enum(['day', 'week', 'month', 'custom']).optional().default('custom'),
});

export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;