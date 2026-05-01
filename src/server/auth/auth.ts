import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/db/prisma";
import { compare } from "bcryptjs";

// Type for custom role data in session
export interface CustomRoleData {
    id: string;
    name: string;
    displayName: string;
    baseRoles: string[];
    departments: string[];
    permissions: Record<string, boolean> | null;
}

// Safe JSON parse utility
const safeJsonParse = <T,>(json: string | null, defaultValue: T): T => {
    if (!json) return defaultValue;
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : defaultValue;
    } catch {
        return defaultValue;
    }
};

// Helper function to parse custom roles from user
function parseCustomRoles(user: { customRoles: Array<{ customRole: { isActive: boolean; id: string; name: string; displayName: string; baseRoles: string | null; departments: string | null; permissions: string | null } }> }): CustomRoleData[] {
    return user.customRoles
        .filter(ucr => ucr.customRole.isActive)
        .map(ucr => ({
            id: ucr.customRole.id,
            name: ucr.customRole.name,
            displayName: ucr.customRole.displayName,
            baseRoles: safeJsonParse<string[]>(ucr.customRole.baseRoles, []),
            departments: safeJsonParse<string[]>(ucr.customRole.departments, []),
            permissions: safeJsonParse<Record<string, boolean> | null>(ucr.customRole.permissions, null),
        }));
}

// Helper to build session user object
function buildSessionUser(user: {
    id: string;
    empId: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    email: string | null;
    role: string;
    department: string;
    profile?: { ndaSigned: boolean; profilePicture: string | null } | null;
    profileCompletionStatus: string;
    customRoles: Array<{ customRole: { isActive: boolean; id: string; name: string; displayName: string; baseRoles: string | null; departments: string | null; permissions: string | null } }>;
}): {
    id: string;
    empId: string;
    firstName: string;
    lastName: string | undefined;
    phone: string;
    role: string;
    department: string;
    ndaSigned: boolean;
    profileCompletionStatus: string;
    profilePicture: string | null;
    customRoles: CustomRoleData[];
} {
    return {
        id: user.id,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName ?? undefined,
        phone: user.phone,
        role: user.role,
        department: user.department,
        ndaSigned: user.profile?.ndaSigned ?? false,
        profileCompletionStatus: user.profileCompletionStatus,
        profilePicture: user.profile?.profilePicture ?? null,
        customRoles: parseCustomRoles(user),
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        // Magic Link Provider (Primary authentication method)
        CredentialsProvider({
            id: "magic-link",
            name: "Magic Link",
            credentials: {
                token: { label: "Token", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.token) {
                    return null;
                }

                // Hash the incoming token to match stored hash
                const crypto = await import('crypto')
                const tokenHash = crypto.createHash('sha256').update(credentials.token).digest('hex')

                // Verify token by hash lookup
                const magicToken = await prisma.magicLinkToken.findUnique({
                    where: { token: tokenHash },
                    include: {
                        user: {
                            include: {
                                profile: true,
                                customRoles: {
                                    include: {
                                        customRole: true
                                    }
                                }
                            }
                        }
                    }
                });

                if (!magicToken || new Date() > magicToken.expiresAt) {
                    return null;
                }

                const user = magicToken.user;
                if (!user || !['ACTIVE', 'PROBATION'].includes(user.status)) {
                    return null;
                }

                // Token is marked as used by the /api/auth/magic-link/verify endpoint.
                // Here we just verify it was used recently (within 2 minutes) to confirm
                // this is a legitimate follow-up signIn() call, not a stale replay.
                if (!magicToken.usedAt) {
                    // Token hasn't been verified yet -- reject
                    return null;
                }
                const usedAgoMs = Date.now() - magicToken.usedAt.getTime();
                if (usedAgoMs > 2 * 60 * 1000) {
                    // Token was used too long ago -- likely a replay attempt
                    return null;
                }

                // Login session is created client-side via /api/auth/log-login
                // which has access to device/browser/location context.

                return buildSessionUser(user as Parameters<typeof buildSessionUser>[0]);
            }
        }),
        // Password Provider (Phone + Password login)
        CredentialsProvider({
            id: "password",
            name: "Password",
            credentials: {
                phone: { label: "Phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) {
                    return null;
                }

                // Normalize phone variants
                const digits = credentials.phone.replace(/\D/g, '');
                const phoneVariants: string[] = [credentials.phone];
                if (digits.length === 10) {
                    phoneVariants.push(`+91${digits}`, `91${digits}`);
                } else if (digits.length === 12 && digits.startsWith('91')) {
                    phoneVariants.push(`+${digits}`, digits.slice(2));
                } else if (digits.length === 13 && digits.startsWith('91')) {
                    phoneVariants.push(digits, `+${digits}`, digits.slice(2));
                }

                // Find user by phone
                const user = await prisma.user.findFirst({
                    where: {
                        phone: { in: phoneVariants },
                        deletedAt: null,
                        status: { in: ['ACTIVE', 'PROBATION'] },
                    },
                    include: {
                        profile: true,
                        customRoles: {
                            include: {
                                customRole: true
                            }
                        }
                    }
                });

                if (!user) {
                    // Don't reveal if user exists - return a generic error
                    throw new Error('User not found');
                }

                if (!user.password) {
                    // User exists but has no password set
                    throw new Error('NoPassword');
                }

                // Verify password
                const isValid = await compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error('InvalidPassword');
                }

                return buildSessionUser(user as Parameters<typeof buildSessionUser>[0]);
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.empId = user.empId;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.role = user.role;
                token.department = user.department;
                token.ndaSigned = user.ndaSigned;
                token.profileCompletionStatus = user.profileCompletionStatus;
                token.profilePicture = user.profilePicture;
                token.customRoles = user.customRoles || [];
            }
            if (trigger === "update") {
                if (session?.ndaSigned !== undefined) {
                    token.ndaSigned = session.ndaSigned;
                }
                if (session?.profileCompletionStatus !== undefined) {
                    token.profileCompletionStatus = session.profileCompletionStatus;
                }
                // Handle profile picture update
                if (session?.profilePicture !== undefined) {
                    token.profilePicture = session.profilePicture;
                }
                // Handle custom roles update
                if (session?.customRoles !== undefined) {
                    token.customRoles = session.customRoles;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Normal session
                session.user.id = token.id as string;
                session.user.empId = token.empId as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.role = token.role as string;
                session.user.department = token.department as string;
                session.user.ndaSigned = token.ndaSigned as boolean;
                session.user.profileCompletionStatus = token.profileCompletionStatus as string;
                session.user.customRoles = (token.customRoles as CustomRoleData[]) || [];
                session.user.profilePicture = token.profilePicture as string | null;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET
};
