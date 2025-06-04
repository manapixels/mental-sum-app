"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Album, ChartColumnIncreasing, Settings } from "lucide-react";
import { useState } from "react";
import { GlobalSettingsDialog } from "@/components/settings/global-settings-dialog";

const navItems = [
  { href: "/", label: "Home", icon: ChartColumnIncreasing },
  { href: "/review", label: "Review", icon: Album },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);

  return (
    <div>
      <nav className="container fixed bottom-0 left-0 right-0 z-40 shadow-t md:hidden px-4 py-4">
        <div className="grid h-full max-w-lg w-fit grid-cols-3 gap-4 mx-auto px-4 py-3 bg-gray-800 text-white rounded-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`inline-flex flex-col items-center justify-center px-2 hover:bg-gray-600 group ${isActive ? "text-primary-foreground bg-gray-800" : "text-gray-300"}`}
              >
                <item.icon
                  className={`w-6 h-6 mb-1 ${isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-white"}`}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs tracking-wider ${isActive ? "font-semibold text-primary-foreground" : "text-gray-400 group-hover:text-white"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Settings Button */}
          <button
            onClick={() => setGlobalSettingsOpen(true)}
            className="inline-flex flex-col items-center justify-center px-2 hover:bg-gray-600 group text-gray-300"
          >
            <Settings
              className="w-6 h-6 mb-1 text-gray-400 group-hover:text-white"
              aria-hidden="true"
            />
            <span className="text-xs tracking-wider text-gray-400 group-hover:text-white">
              Settings
            </span>
          </button>
        </div>
      </nav>

      <GlobalSettingsDialog
        open={globalSettingsOpen}
        onOpenChange={setGlobalSettingsOpen}
      />
    </div>
  );
}
