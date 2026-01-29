"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { getGreeting } from "@/lib/utils";
import { ArrowRightCircle } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Setup bahasa Indonesia untuk dayjs (opsional, pastikan sudah import 'dayjs/locale/id')
    setTime(dayjs().format("HH:mm:ss"));
    setDate(dayjs().format("dddd, DD MMMM YYYY"));

    const interval = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div
      onClick={() => router.push("/login")}
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 cursor-pointer select-none overflow-hidden relative"
    >
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />

      <div className="text-center z-10 space-y-0">
        {/* Greeting & Date (DIPERBESAR) */}
        <div className="space-y-2 mb-2 animate-in fade-in slide-in-from-top duration-1000">
           <p className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-blue-600 italic">
            {getGreeting()}
          </p>
          <p className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-slate-400">
            {date}
          </p>
        </div>

        {/* Big Digital Clock */}
        <div className="relative inline-block animate-in fade-in zoom-in duration-700">
          <h1 className="text-[10rem] md:text-[14rem] font-black tracking-tighter tabular-nums leading-none text-slate-900 italic drop-shadow-sm">
            {time.split(':').map((part, i) => (
              <span key={i}>
                {part}{i < 2 && <span className="animate-pulse opacity-20 not-italic">:</span>}
              </span>
            ))}
          </h1>
        </div>

        {/* Branding */}
        <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-slate-200" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Male POS <span className="text-blue-600">System</span>
            </h2>
            <div className="h-[2px] w-12 bg-slate-200" />
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">
            <ArrowRightCircle size={16} className="text-blue-500" />
            Tap anywhere to start
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
        Management Edition v1.0
      </div>
    </div>
  );
}