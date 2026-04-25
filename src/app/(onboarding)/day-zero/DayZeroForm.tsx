"use client";

import { useState, UIEvent } from "react";
import { useRouter } from "next/navigation";
import { signNdaAction } from "./actions";

export default function DayZeroForm({ userId }: { userId: string }) {
    const [canAccept, setCanAccept] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 20;
        if (bottom) {
            setCanAccept(true);
        }
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        await signNdaAction(userId);
        window.location.href = "/hub";
    };

    return (
        <div className="space-y-6">
            <div
                className="h-96 overflow-y-auto p-6 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-inner prose prose-sm max-w-none font-serif text-slate-300"
                onScroll={handleScroll}
            >
                <h4 className="font-bold text-lg mb-2 text-white">CHAPTER 1: THE RADICAL TRANSPARENCY</h4>
                <p className="mb-4 text-slate-300">1.1 OVERVIEW: As an operative of the BP Hub-and-Spoke model, you agree to Absolute Truth reporting. You understand that the system monitors your Strategic, Tactical, and Operations (STOP) output.</p>
                <p className="mb-8 text-slate-300">1.2 THE PERFORMANCE MIRROR: You acknowledge that your performance is public to the Leadership team. If a linked Client relationship terminates (status="LOST"), your linked Performance Bonus is automatically forfeited.</p>

                <h4 className="font-bold text-lg mb-2 text-white">CHAPTER 16: PERPETUAL NDA</h4>
                <p className="mb-4 text-slate-300">16.1 PATIENT PSYCHOLOGY: Access to the Healthcare client data (Fears, Pain Points, Desires, Problems) is heavily restricted. Any unauthorized extraction, modification, or side-hustling of this IP will invoke the "Zero-Dues" termination clause.</p>
                <p className="mb-4 text-slate-300">16.2 POST-EMPLOYMENT RESTRICTION: This Non-Disclosure Agreement sustains in perpetuity. You may not solicit Healthcare clients within the 40+ patient psychology data matrix.</p>

                {/* Fill with empty space to force scroll */}
                <div className="h-40"></div>
                <div className="h-40"></div>
                <div className="h-40"></div>
                <div className="h-40"></div>
                <p className="text-center font-bold mt-8 text-white">-- END OF CONTRACT --</p>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 italic max-w-xs">
                    *You must scroll to the bottom of the document to activate the digital signature pad.
                </p>
                <button
                    onClick={onSubmit}
                    disabled={!canAccept || isSubmitting}
                    className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                        canAccept && !isSubmitting
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing...
                        </span>
                    ) : (
                        "Sign & Accept"
                    )}
                </button>
            </div>
        </div>
    );
}
