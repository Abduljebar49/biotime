import 'fastify';
import { SavedUserRole } from './user';
import { UserRole } from '../entities/user.entity';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      phone: string;
      fullName: string;
      role: UserRole;
      isVerified: boolean;
      accountStatus: string;
      hospitalId?: string;
      patient?: {
        id?: string;
        insuranceProvider?: string;
        insurancePolicyNumber?: string;
        isVerified: boolean;
      };
      physician?: {
        id?: string;
        specialty: string;
      };
    };
    fileUrl?: string;
    fileUrls?: string[];
    fileNames?: string[];
    fileNameUrls?: { [fieldName: string]: string };
  }
}
