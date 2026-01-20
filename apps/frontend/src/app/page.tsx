"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { getGreeting } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [time, setTime] = useState(dayjs().format("HH:mm:ss"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={() => router.push("/login")}
      className="min-h-screen flex items-center justify-center bg-white text-black cursor-pointer"
    >
      <div className="text-center">
        <h1 className="text-8xl font-semibold tracking-tight">
          {time}
        </h1>

        <p className="mt-4 text-2xl font-medium">
          {getGreeting()}
        </p>

        <p className="mt-12 text-sm text-gray-500 animate-pulse">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}