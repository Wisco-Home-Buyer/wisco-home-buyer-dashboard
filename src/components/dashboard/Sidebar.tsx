"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartPie,
  FaUsers,
  FaBuilding,
  FaLayerGroup,
  FaChartLine,
} from "react-icons/fa";
import { Settings, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNewLeadsCount } from "../../hooks/useLeadsQuery";

const LogOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: newLeadsCount = 0 } = useNewLeadsCount();

  const navItems = [
    {
      name: "Dashboard",
      icon: FaChartPie,
      href: "/",
      badge: null as string | null,
    },
    {
      name: "Leads",
      icon: FaUsers,
      href: "/leads",
      badge:
        newLeadsCount > 0
          ? newLeadsCount > 99
            ? "99+"
            : String(newLeadsCount)
          : null,
    },
    {
      name: "Properties",
      icon: FaBuilding,
      href: "/properties",
      badge: null,
    },
    {
      name: "Public Records",
      icon: FaLayerGroup,
      href: "/ascent-data",
      badge: null,
    },
    {
      name: "Analytics",
      icon: FaChartLine,
      href: "/analytics",
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 shadow-2xl opacity-100 visible"
            : "-translate-x-full opacity-0 lg:opacity-100 invisible lg:visible"
        }`}
      >
        {/* Top Logo Section */}
        <div className="flex items-center justify-between pt-6 pb-2 px-6">
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-44 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Wisco Home Buyer Logo"
                fill
                priority
                className="object-contain object-left dark:brightness-0 dark:invert"
              />
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onMobileClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
          <div>
            <p className="px-3 mb-3 text-[12px] font-bold tracking-wider text-[#5A6A85] dark:text-slate-400 uppercase">
              MENU
            </p>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onMobileClose?.()}
                    className={`flex items-center justify-between px-4 py-3 rounded-md font-semibold text-[15px] transition-all duration-200 group border-l-[4px] ${
                      isActive
                        ? "bg-[#eaeff5] border-[#0f2347] text-[#0f2347] dark:bg-slate-800 dark:border-blue-500 dark:text-blue-400"
                        : "border-transparent text-[#0f2347] dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-[#0f2347] dark:text-blue-400"
                            : "text-[#0f2347] dark:text-slate-300 group-hover:text-slate-900"
                        }`}
                      />
                      <span className="text-[15px] font-semibold tracking-tight">
                        {item.name}
                      </span>
                    </div>

                    {item.badge && (
                      <span className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full bg-[#ea3838] text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Settings & Profile Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          <Link
            href="/settings"
            onClick={() => onMobileClose?.()}
            className={`flex items-center justify-between px-4 py-3 rounded-lg font-semibold text-[15px] transition-all duration-200 group border-l-[4px] ${
              pathname === "/settings"
                ? "bg-[#eaeff5] border-[#0f2347] text-[#0f2347] dark:bg-slate-800 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-[#0f2347] dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Settings className="w-5 h-5 text-[#0f2347] dark:text-slate-300 group-hover:text-slate-900" />
              <span className="text-[15px] font-semibold tracking-tight">Settings</span>
            </div>
          </Link>

          {/* User Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
            <div className="relative w-9 h-9">
              <div className="w-9 h-9 rounded-full bg-[#0f2347] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || user.email || "Admin User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  (user?.name?.[0] || user?.email?.[0] || "A").toUpperCase()
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || user?.firstName || user?.email?.split("@")[0] || "Admin User"}
              </h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {typeof user?.role === "string"
                  ? user.role.replace("_", " ")
                  : typeof user?.role === "object" && user?.role && "name" in user.role
                  ? String((user.role as { name?: string }).name).replace("_", " ")
                  : user?.role
                  ? String(user.role)
                  : "Administrator"}
              </p>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
