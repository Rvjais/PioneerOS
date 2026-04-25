"use server";

import prisma from "@/server/db/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";

export async function signNdaAction(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) {
        throw new Error("Unauthorized: You can only sign your own NDA");
    }

    await prisma.profile.update({
        where: { userId },
        data: {
            ndaSigned: true,
            ndaSignedAt: new Date()
        }
    });
}
