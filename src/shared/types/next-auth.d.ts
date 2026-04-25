import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// Custom role data structure
interface CustomRoleData {
  id: string;
  name: string;
  displayName: string;
  baseRoles: string[];
  departments: string[];
  permissions: Record<string, boolean> | null;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      empId: string;
      firstName: string;
      lastName?: string;
      role: string;
      department: string;
      ndaSigned: boolean;
      profileCompletionStatus: string;
      profilePicture?: string | null;
      // Custom roles
      customRoles?: CustomRoleData[];
      // Impersonation fields
      isImpersonating?: boolean;
      originalAdminId?: string;
      originalRole?: string;
      impersonationSessionId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    empId: string;
    firstName: string;
    lastName?: string;
    phone: string;
    role: string;
    department: string;
    ndaSigned: boolean;
    profileCompletionStatus: string;
    profilePicture?: string | null;
    customRoles?: CustomRoleData[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    empId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    department?: string;
    ndaSigned?: boolean;
    profileCompletionStatus?: string;
    profilePicture?: string | null;
    // Custom roles
    customRoles?: CustomRoleData[];
    // Impersonation fields
    originalId?: string;
    impersonating?: boolean;
    impersonatedUser?: {
      id: string;
      empId: string;
      firstName: string;
      lastName: string | null;
      role: string;
      department: string;
    };
  }
}
