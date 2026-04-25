import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import prisma from "@/server/db/prisma";
import { redirect } from "next/navigation";
import DayZeroForm from "./DayZeroForm";

export default async function DayZeroPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    // Fetch true profile values directly from DB
    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
    });

    return (
        <div className="min-h-screen bg-gray-900/40 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full space-y-8 glass-card p-10 shadow-none border border-white/10 rounded-lg">
                <div>
                    <h2 className="text-center text-3xl font-serif font-bold text-white">
                        Day 0: The Pioneer Foundation
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Welcome to the PioneerOS System. Before accessing the Hub, you must clear the legal gate.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-4 border-b pb-2">Perpetual NDA & Policy Charter</h3>
                        <DayZeroForm userId={session.user.id} />
                    </div>

                    <div className="md:col-span-1 bg-gray-900/40 p-6 rounded-md border border-white/10 h-fit">
                        <h3 className="text-lg font-semibold text-white mb-4">MASH System Readiness</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <span className="text-sm font-medium text-gray-200">Biometric Sync</span>
                                {profile?.biometricPunch ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-800">Verified</span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-800">Pending</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between pb-3">
                                <span className="text-sm font-medium text-gray-200">Razorpay Link</span>
                                {profile?.razorpayLinked ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-800">Verified</span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-800">Pending</span>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 text-xs text-gray-400 italic p-3 bg-blue-500/10 rounded text-blue-800">
                            *If pending, please see the HR department before end-of-day. MASH gatekeeper approval is required for full payout sync.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
