import * as express from "express";
import { SavedUserRole } from "./user";
import { UserRole } from "../entities/user.entity";

declare global {
  namespace Express {
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
      },
      // file?: Express.Multer.File;
      fileUrl?: string;
      fileUrls?: string[];
      fileNames?: string[];
      fileNameUrls?: { [fieldName: string]: string };
    }
  }
}
