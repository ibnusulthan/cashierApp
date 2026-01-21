"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { getGreeting } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [time, setTime] = useState(""); // Mulai dengan string kosong
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set waktu awal segera setelah mounted
    setTime(dayjs().format("HH:mm:ss"));

    const interval = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Jika belum mounted, tampilkan shell kosong agar tidak ada mismatch server-client
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div
      onClick={() => router.push("/login")}
      className="min-h-screen flex items-center justify-center bg-white text-black cursor-pointer select-none"
    >
      <div className="text-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-8xl font-semibold tracking-tighter tabular-nums">
          {time}
        </h1>

        <p className="mt-4 text-2xl font-medium text-gray-700">
          {getGreeting()}
        </p>

        <p className="mt-20 text-sm text-gray-400 animate-pulse tracking-widest uppercase">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}