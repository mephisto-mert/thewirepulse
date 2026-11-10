"use client";

import React, { useEffect, useState, memo } from "react";

export const OperationalClocks = memo(function OperationalClocks() {
  const [times, setTimes] = useState({
    utc: "--:--:-- UTC",
    nyc: "--:-- EST",
    ldn: "--:-- GMT",
    tyo: "--:-- JST"
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimes({
        utc: now.toLocaleTimeString("en-US", { timeZone: "UTC", hour12: false }) + " UTC",
        nyc: now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false, hour: "2-digit", minute: "2-digit" }) + " EST",
        ldn: now.toLocaleTimeString("en-US", { timeZone: "Europe/London", hour12: false, hour: "2-digit", minute: "2-digit" }) + " GMT",
        tyo: now.toLocaleTimeString("en-US", { timeZone: "Asia/Tokyo", hour12: false, hour: "2-digit", minute: "2-digit" }) + " JST"
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-3 sm:space-x-4 font-mono text-[11px] text-gray-300 bg-[#0d121c] border border-gray-800 px-3 py-1 rounded">
      <span className="text-red-400 font-bold">{times.utc}</span>
      <span className="text-gray-600">•</span>
      <span className="hidden sm:inline text-gray-400">{times.nyc}</span>
      <span className="hidden md:inline text-gray-600">•</span>
      <span className="hidden md:inline text-gray-400">{times.ldn}</span>
      <span className="hidden lg:inline text-gray-600">•</span>
      <span className="hidden lg:inline text-gray-400">{times.tyo}</span>
    </div>
  );
});
