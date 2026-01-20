"use client";

import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <span className="text-sm text-gray-500">
        Dashboard
      </span>

      <button
        onClick={handleLogout}
        className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
      >
        Logout
      </button>
    </header>
  );
}
