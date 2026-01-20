"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { formatDuration } from "@/lib/time";

type Props = {
  cashierName: string;
  openedAt: string;
};

export default function ShiftHeader({ cashierName, openedAt }: Props) {
  const [duration, setDuration] = useState(() => formatDuration(openedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(openedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [openedAt]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Active Shift</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cashier: <span className="font-medium text-gray-900">{cashierName}</span>
          </p>
          <p className="text-sm text-gray-500">
            Started: {dayjs(openedAt).format("DD MMM YYYY • HH:mm")}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase text-gray-500 tracking-wide">Duration</p>
          <p className="text-xl font-mono font-semibold">{duration}</p>
        </div>
      </div>
    </div>
  );
}