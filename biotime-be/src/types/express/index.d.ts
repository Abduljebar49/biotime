// src/types/express/index.d.ts
import { Request } from "express";
import { UserRole } from "../../entities/user.entity";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      email?: string;
      phone: string;
      fullName: string;
      roles: UserRole;
      isVerified: boolean;
      accountStatus: string;
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
